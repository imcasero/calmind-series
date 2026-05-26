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

> ⚠️ The dual-cache layer in `src/lib/data/fetchData.ts` (`unstable_cache` +
> `react.cache`, tag `['matches']` that is never revalidated) is **legacy** and slated
> for removal in F4. Do not copy it. New caching should use `'use cache'` + `cacheTag`
> + `revalidateTag` (see `vercel:next-cache-components`).

## Types — single source of truth

- **`src/lib/types/schemas.ts` is canonical.** Define a Zod schema, derive the type with
  `z.infer`, import the type everywhere:
  ```ts
  export const LeagueInfoSchema = LeagueSchema.pick({ id: true, tier_name: true, tier_priority: true });
  export type LeagueInfo = z.infer<typeof LeagueInfoSchema>;
  ```
- **Do not redefine a query's return shape locally.** `src/lib/types/queries.types.ts`
  is a divergent duplicate (`tierName` vs `tier_name`) and is slated for deletion (F2).
  Import shared types from `@/lib/types/schemas`; for query-specific rows, import the
  query's own exported return type.

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
  `divisions/`, `cross/`, `home/`, `shared/`, `admin/` (admin managers live next to their
  route under `app/admin/dashboard/*/_components/`).
- Pure transformation helpers belong in `src/lib/utils/` (note: `lib/services/` currently
  holds pure functions — that is a misnomer being corrected in F4).

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
