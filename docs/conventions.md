# Code Conventions — Calmind Series

Patterns extracted from the actual codebase. Follow these so generated code matches
the project instead of generic React/Next defaults. Companion to `CLAUDE.md`.

## Data access (server-side)

- **Reads live in `src/lib/queries/*.queries.ts`**, each function wrapped in
  `react.cache` for per-request deduplication:
  ```ts
  export const getLeaguesBySplit = cache(async (splitId: string): Promise<LeagueInfo[]> => {
    const supabase = await createClient();          // @/lib/supabase/server
    const { data, error } = await supabase.from('leagues').select('id, tier_name, tier_priority')...;
    if (error) { console.error('[getLeaguesBySplit] Error:', error.message); return []; }
    return (data ?? []) as LeagueInfo[];
  });
  ```
- **Error handling:** queries **never throw to the UI**. On error, log
  `[functionName] Error:` and return `[]` / `null` / a neutral empty shape.
- **Parallelize** independent reads with `Promise.all` (see `getRankingsByLeague`).
- Two Supabase clients: `@/lib/supabase/server` (RSC, Server Actions, `proxy.ts`) and
  `@/lib/supabase/client` (browser components only).

## Types — single source of truth

- **`src/lib/types/schemas.ts` is canonical.** Define a Zod schema, derive the type with
  `z.infer`, import the type everywhere:
  ```ts
  export const LeagueInfoSchema = LeagueSchema.pick({ id: true, tier_name: true, tier_priority: true });
  export type LeagueInfo = z.infer<typeof LeagueInfoSchema>;
  ```
- **Do not redefine a query's return shape locally.** Import shared types from
  `@/lib/types/schemas`; for query-specific rows, import the query's own
  exported return type.

## Naming / casing

- **Database columns: `snake_case`** (`tier_name`, `total_points`, `avatar_url`).
- **UI / formatted shapes: `camelCase`** (`totalPoints`, `avatarUrl`, `setBalance`).
- The **query is responsible for mapping** snake_case rows → camelCase UI entries
  (see the `RankingEntrySchema.safeParse({...})` mapping in `leagues.queries.ts`).
- Code identifiers and file names in **English**; user-facing copy in **Spanish**.

## Components

- **Server Components by default.** Add `'use client'` only where interactivity/animation
  truly needs it, and push it to the **leaves** (a thin `motion` wrapper), not parents.
- Components are grouped by domain under `src/components/`:
  `admin/`, `hub/`, `landing/`, `providers/`, `shared/` (admin managers live next
  to their route under `app/admin/dashboard/*/_components/`).
- Pure transformation helpers belong in `src/lib/utils/`. `lib/services/`
  retains `bracketService.ts` (pure functions historically grouped under the
  service label — kept for migration cost, not because the name is right).

## Routing / auth

- `src/proxy.ts` is the Next 16 middleware (renamed from `middleware.ts`). It gates
  `/admin/*` (except `/admin` login) using the Supabase server client. Canonical export
  name in v16 is `proxyConfig` (codemod handles the rename — F1/REQ-10).
- **Client navigation uses `router.push` / `router.replace`.** `redirect()` from
  `next/navigation` is **server-only** — never call it inside a client event handler.

## Tooling

- Package manager **pnpm**; lint/format **Biome** (`pnpm check` to auto-fix).
- Import alias `@/*` → `src/*`.
- Run `./init.sh` before starting and before declaring a task done.

## Architecture context
"Heavy DB / thin client": scoring, ranking, tie-breaks live in Postgres
views/functions inside Supabase — see `docs/DATABASE_ARCHITECTURE.md`. The frontend
reads `league_rankings` / `player_match_performance`; it does **not** recompute points.

## Cache tag taxonomy (F4 — Cacheo coherente)

F4 enabled Next 16 Cache Components (`cacheComponents: true` in `next.config.ts`)
and migrated every public reader in `src/lib/queries/` to the `'use cache'` triad
(`'use cache'` + `cacheLife(...)` + `cacheTag(...)`). Admin readers
(`admin.queries.ts`) deliberately stay un-cached — see the
"Admin queries never cache" rule below.

### The 8 tag families

| Tag | Owner table(s) | Mutated by | Read by |
|---|---|---|---|
| `seasons` | `seasons`, `splits`, `leagues` | `seasons/_actions.ts`, `splits/_actions.ts`, `divisions/_actions.ts`, `participants/_actions.ts` | All season/split/league readers |
| `splits:${id}` | per-split slice of multiple tables | `splits/_actions.ts`, `divisions/_actions.ts` | `getLeaguesBySplit`, `getDivisionPreview`, `getLeagueByTier`, `getArchiveDivisionPreview` |
| `matches:${splitId}` | `matches` | `matches/_actions.ts`, `splits/_actions.ts` (delete cascade) | `getMatchesByRound`, `getDivisionPreview`, `getBracketData`, `getCurrentRound`, `getPublicCurrentRound` |
| `rankings:${leagueId}` | `league_rankings` view | `matches/_actions.ts`, `participants/_actions.ts` | `getRankingsByLeague` |
| `participants:${splitId}` | `league_participants`, `trainers` (via join) | `participants/_actions.ts`, `divisions/_actions.ts` (delete cascade), `splits/_actions.ts` (delete cascade) | `getParticipantsBySplit` |
| `bracket:${splitId}` | `matches` rounds 15/16 | `matches/_actions.ts`, `splits/_actions.ts` (delete cascade) | `getBracketData` |
| `trainers` | `trainers` | `participants/_actions.ts` | `getTrainerById` |
| `archive` | union of seasons/splits/matches for closed splits | `seasons/_actions.ts`, `splits/_actions.ts` | `getArchiveChampions`, `getArchiveDivisionPreview`, `getPublicActiveSeasonWithSplit`, `getPublicAllSeasonsWithSplits`, `getPublicCurrentRound` |

### Per-query profile + tag assignment

| Query | File | Tags | `cacheLife` |
|---|---|---|---|
| `getArchiveChampions` | `archive.queries.ts` | `archive` | `days` |
| `getArchiveDivisionPreview(splitId)` | `archive.queries.ts` | `archive`, `splits:${splitId}` | `days` |
| `getPublicActiveSeasonWithSplit` | `archive.queries.ts` | `seasons`, `archive` | `hours` |
| `getPublicAllSeasonsWithSplits` | `archive.queries.ts` | `seasons`, `archive` | `hours` |
| `getPublicCurrentRound(splitId)` | `archive.queries.ts` | `archive`, `matches:${splitId}` | `hours` |
| `getActiveSeasonWithSplit` | `seasons.queries.ts` | `seasons` | `hours` |
| `getAllSeasons` | `seasons.queries.ts` | `seasons` | `hours` |
| `getAllSeasonsWithSplits` | `seasons.queries.ts` | `seasons` | `hours` |
| `getSeasonWithSplits(id)` | `seasons.queries.ts` | `seasons` | `hours` |
| `getSeasonByName(name)` | `seasons.queries.ts` | `seasons` | `hours` |
| `getArchiveSplitParams` | `seasons.queries.ts` | `seasons` | `days` |
| `getSplitByNames(s, sp)` | `seasons.queries.ts` | `seasons` | `hours` |
| `getLeaguesBySplit(splitId)` | `leagues.queries.ts` | `seasons`, `splits:${splitId}` | `hours` |
| `getRankingsByLeague(leagueId)` | `leagues.queries.ts` | `rankings:${leagueId}` | `minutes` |
| `getDivisionPreview(splitId)` | `leagues.queries.ts` | `splits:${splitId}`, `matches:${splitId}` | `minutes` |
| `getLeagueByTier(splitId, _)` | `leagues.queries.ts` | `seasons`, `splits:${splitId}` | `hours` |
| `getParticipantsBySplit(splitId)` | `leagues.queries.ts` | `participants:${splitId}` | `hours` |
| `getMatchesByRound(splitId)` | `leagues.queries.ts` | `matches:${splitId}` | `minutes` |
| `getCurrentRound(splitId)` | `tournament.queries.ts` | `matches:${splitId}` | `minutes` |
| `getTrainerById(id)` | `trainers.queries.ts` | `trainers` | `hours` |
| `getBracketData(splitId)` | `bracket.queries.ts` | `bracket:${splitId}`, `matches:${splitId}` | `minutes` |

`cacheLife` profiles are Next 16 built-ins (`'minutes' | 'hours' | 'days'`); no
custom profiles in `next.config.ts`. Bands:

| Profile | `stale` | `revalidate` | `expire` |
|---|---|---|---|
| `minutes` | 300s | 60s | 3600s |
| `hours` | 300s | 3600s | 86400s |
| `days` | 300s | 86400s | 604800s |

### How to add a new mutation

1. Identify the tag(s) the mutation invalidates (use the "Read by" column above —
   any reader that surfaces the mutated rows must have its tag in your set).
2. Inside the Server Action (`'use server'` module), after the Supabase write
   succeeds and after any existing `revalidatePath(...)`, call
   `updateTag('<tag>')` (one call per tag) — `updateTag` is Server-Action-only
   and gives read-your-own-writes semantics. Reference shape:
   `src/app/admin/dashboard/seasons/_actions.ts` (REQ-38 — 7 `updateTag` calls
   across 4 actions).
3. If the mutation creates a NEW kind of resource (no existing tag in the table
   above fits), extend the taxonomy in this section in the same PR — keep the
   doc and the code in sync.

> **REQ-39 staleness window — closed by F6b (2026-06-01).** Every admin
> Manager (SplitsManager, DivisionsManager, RegulationsManager,
> ParticipantsManager, MatchesManager) now routes writes through Server
> Actions in `app/admin/dashboard/<domain>/_actions.ts` that call
> `updateTag(...)` per the matrix above. Browser-side `router.refresh()`
> calls were removed from all five Managers; reconciliation of admin-only
> state happens through targeted re-reads (the hook's `refresh()` or the
> Manager's `refreshX` helpers), and public `/hub/*` / `/archivo/*` readers
> revalidate on the next navigation thanks to the granular tag busts.
>
> Known intentional staleness: `updateTrainerAction` / `deleteTrainerAction`
> bust `seasons` (broad) and `trainers` but do NOT enumerate every
> `rankings:${leagueId}` the trainer participates in. Snapshotted
> nickname/avatar inside `getRankingsByLeague` cache entries refresh on
> their `cacheLife('minutes')` revalidate window (≤60s). Tolerated trade-off
> per `specs/design.md` §"Why `seasons` on trainer update/delete".

### Admin queries never cache

`src/lib/queries/admin.queries.ts` is deliberately **not** migrated to the
`'use cache'` triad. Two reasons:

1. **Cookie dependency.** Admin queries call `await createClient()` (the
   cookie-aware Supabase client) so RLS sees the logged-in admin. `'use cache'`
   cannot read request data (cookies/headers/searchParams) — caching the
   reader would either fail at compile time or leak one admin's session into
   another's response.
2. **No PII in viewer cache.** Keeping admin reads dynamic means the admin
   React tree stays per-request (matrix `◐` Partial Prerender — the cached
   shell is shared, the data behind Suspense is per-request). The viewer
   `/hub/*` and `/archivo/*` trees are fully cacheable because they only read
   cookie-free readers (REQ-33).

When you add a new query that needs `auth.getUser()` / `cookies()`, it stays
in `admin.queries.ts` and stays un-cached. When you add a new public reader,
it goes in one of the cacheable query files with the triad.
