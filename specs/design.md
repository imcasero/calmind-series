# Design — Batch F2: Type cleanup & dead-code removal

> Companion to `specs/requirements.md` (REQ-11..REQ-17). This is a refactor batch
> — **no observable behavior changes**, no new components, no new dependencies.
> Touch type annotations + runtime validation only. Logic is preserved verbatim.

## Sequencing (critical — REQ-17 must be last; deletions before casts)

The order below is enforced by two facts:
1. Flipping `noExplicitAny` to `error` before the `any` debt is gone turns lint
   red and stalls every subsequent step.
2. **Deletions run before cast cleanup** (revised 2026-05-28): the orphan
   divisions cluster (REQ-15) contains files that import from
   `queries.types.ts` and from query modules whose return types might silently
   shift when their casts are removed. Deleting the orphans first removes
   stale consumers that could otherwise mask a real type mismatch in
   REQ-13/14/14b — and shrinks the surface those casts are inferred against.

1. **REQ-15 + REQ-15b** — Delete the orphan divisions cluster (5 folders +
   `ClassificationTable/`, 6 folders total inside `src/components/divisions/`),
   then clean `divisions/index.ts` (and delete it if it becomes empty). This
   removes the 18 `any`-line matches in `SplitDataProvider.tsx` and the 5
   importers of `queries.types.ts` in one go.
2. **REQ-12** — Delete dead client utilities (`useOptimizedFetch.ts`,
   `PerformanceMonitor.tsx`). Removes the 1 remaining `any` annotation
   (`PerformanceMonitor.tsx:186 gtag?: (...args: any[]) => void`).
3. **REQ-11** — Delete `src/lib/types/queries.types.ts`. After REQ-15 there are
   zero importers, so this collapses to a single `rm` + grep verification.
4. **REQ-13** — Strip 9 casts in `admin.queries.ts`. Use Zod where types come
   from a join; rely on Supabase v2's inferred row type for plain selects.
5. **REQ-14** — Strip 18 casts in `seasons.queries.ts`. Lean on the existing
   Zod `safeParse` boundaries already in three of the functions.
6. **REQ-14b** — Strip 5 casts in `leagues.queries.ts`. Same playbook as
   REQ-13/14.
7. **REQ-16** — Snapshot check: `pnpm lint` shows **0 warnings, 0 errors**. If
   non-zero, fix or escalate before step 8.
8. **REQ-17** — Edit `biome.json`: flip `noExplicitAny: "warn"` → `"error"`. Run
   `./init.sh` (full). Green = done.

> Property of this order: `./init.sh` (typecheck + lint) should pass green at
> each numbered checkpoint if executed in isolation. The lint warning count is
> monotonically non-increasing through steps 1–6; REQ-17 only flips severity
> after the count is at zero.

## File-by-file plan

### Step 1 — REQ-15 + REQ-15b: orphan divisions cluster — DELETE

The following directories are removed in their entirety:

| Path                                                              | Files                                                 | Why deletable                                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/components/divisions/SplitDataProvider/`                     | `SplitDataProvider.tsx`                               | Not imported by `src/app/` or anything else; contains 18 `any` line-matches.                        |
| `src/components/divisions/SplitContent/`                          | `SplitContent.tsx`                                    | Only imported by `SplitDataProvider` (also being deleted).                                          |
| `src/components/divisions/ClassificationSection/`                 | `ClassificationSection.tsx`                           | Only imported by `SplitContent` (deleted).                                                          |
| `src/components/divisions/MatchesSection/`                        | `MatchesSection.tsx`                                  | Only imported by `SplitContent` (deleted).                                                          |
| `src/components/divisions/ParticipantsList/`                      | `ParticipantsList.tsx`                                | Only imported by `SplitContent` (deleted).                                                          |
| `src/components/divisions/ClassificationTable/` (REQ-15b)         | `ClassificationTable.tsx`, `PlayerAvatar.tsx`, `PlayerBadge.tsx`, `StatsLegend.tsx`, `TableHeader.tsx`, `TableRow.tsx` | Only consumer is `ClassificationSection.tsx` (deleted in REQ-15) and the barrel (cleaned below).    |

Plus the barrel:

| Path                                       | Action                                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/divisions/index.ts`        | Remove the two `ClassificationTable` exports (currently lines 6–7). If the file is empty after editing (only a leading comment block remains), `rm` it. Verify with `cat src/components/divisions/index.ts` post-edit. |

**Pre-deletion verification commands** (the implementer MUST run all four and
confirm the expected output before any `rm -r`):

```sh
rg "SplitDataProvider|SplitContent|ClassificationSection|MatchesSection|ParticipantsList" src/app/
rg -l "from '@/components/divisions/(SplitDataProvider|SplitContent|ClassificationSection|MatchesSection|ParticipantsList)" src/
rg -l "from '@/components/divisions'" src/  # barrel consumers, if any new
rg "ClassificationTable" src/                # REQ-15b pre-flight
```

The first three must return empty. The fourth must return **only** matches
inside `divisions/ClassificationTable/` itself, `divisions/index.ts`, and
`divisions/ClassificationSection/ClassificationSection.tsx` (all being deleted
or cleaned in this step). If any other consumer surfaces — particularly
anything under `src/app/` or `src/components/shared/` — **stop** and surface
to leader. Do not delete with consumers present.

**Items NOT deleted (kept intentionally per user brief):**
- `src/components/shared/DivisionSection/DivisionSection.tsx` — user listed
  `DivisionSection.tsx` but it lives under `shared/`, not under `divisions/`.
  Out of scope for F2; flagged as ambiguity in the closeout.

**Post-step-1 expected state of `src/components/divisions/`:** the directory
either no longer exists (if `index.ts` was empty and got deleted, and no
sibling folders remain) or contains nothing relevant to F2. Verify with
`ls src/components/divisions/ 2>/dev/null || echo "directory removed"`.

### Step 2 — REQ-12: `src/components/performance/PerformanceMonitor.tsx` + `src/hooks/useOptimizedFetch.ts` — DELETE

- No importers (`rg 'PerformanceMonitor|useOptimizedFetch' src/` returns only
  self after step 1).
- Parent dirs have no siblings — delete the directories with `rmdir`.
- Affects: removes the `gtag` `any` annotation in `PerformanceMonitor.tsx:186`
  and any `noExplicitAny` warnings inside the hooks generic fallback
  (`useFetch<T = unknown>` style — verified no explicit `any` annotations
  remain, but the file is still dead).

### Step 3 — REQ-11: `src/lib/types/queries.types.ts` — DELETE

After step 1, **zero importers remain** for this module. Verified 2026-05-28:

```
$ rg "from '@/lib/types/queries.types'" src/
src/components/divisions/ParticipantsList/ParticipantsList.tsx:6
src/components/divisions/MatchesSection/MatchesSection.tsx:6
src/components/divisions/SplitContent/SplitContent.tsx:11
src/components/divisions/SplitDataProvider/SplitDataProvider.tsx:18
src/components/divisions/ClassificationSection/ClassificationSection.tsx:2
```

All five paths are inside the orphan cluster (step 1). After step 1, this grep
must return empty. Then `rm src/lib/types/queries.types.ts`.

The previous design's shape-parity table comparing `queries.types.ts` against
`schemas.ts` is no longer needed for migration (there is nothing to migrate);
it is preserved here only as historical context that justifies why deletion is
safe:

| Type                     | Identical to `schemas.ts`? |
| ------------------------ | -------------------------- |
| `RankingEntry`           | yes                        |
| `DivisionPreview`        | yes                        |
| `ParticipantEntry`       | yes                        |
| `ParticipantsByDivision` | yes                        |
| `MatchTrainer`           | yes                        |
| `MatchEntry`             | yes                        |
| `MatchesByRound`         | yes                        |
| `LeagueInfo`             | **NO** (camelCase divergence — but only the snake_case `schemas.ts` version is consumed in the surviving codebase, confirmed via grep) |

### Step 4 — REQ-13: `src/lib/queries/admin.queries.ts`

9 casts. The Supabase v2 client typed by `@/lib/types/database.types` already
returns correctly-typed rows for plain selects. Strategy per cluster:

**Plain selects (`:84, :106, :129, :150, :240, :254, :266`)** — drop the cast.
Example (`:71-85`, `getAdminSeasons`):

```ts
// before
return (data ?? []) as Season[];
// after
return data ?? [];                 // data is already Season[] | null
```

If TS infers a wider type (e.g. `{ [key: string]: any }`) on these calls, it
means `@/lib/types/database.types` is not threaded through the
`createClient<Database>()` helper. The implementer should NOT add a
generic-parameter cast; instead, inspect `src/lib/supabase/server.ts` once
(should already be `createClient<Database>()` per the FR0+ work). If it's not,
escalate — that's an out-of-scope structural change.

**Joined selects (`:176` `ParticipantWithTrainer[]`, `:211`
`MatchWithTrainers[]`)** — verify against `vercel:nextjs` /
Supabase v2 client docs for `!fkey_name` syntax inference. Options:

- The select strings are `'*, trainer:trainers(*)'` (`:167`) and `'*,
  home_trainer:trainers!matches_home_trainer_id_fkey(*), away_trainer:...(*)'`
  (`:196-200`). If Supabase v2 inference yields the right shape, drop the cast.
- If inference produces an array where the code expects a single object
  (Supabase often returns `Trainer[]` for unique-relationship joins because the
  type system can't know cardinality), add a Zod schema in `schemas.ts`:

  ```ts
  export const ParticipantWithTrainerSchema = LeagueParticipantSchema.extend({
    trainer: TrainerSchema,
  });
  export type ParticipantWithTrainer = z.infer<typeof ParticipantWithTrainerSchema>;
  ```

  (`LeagueParticipantSchema` and `TrainerSchema` do not exist yet in
  `schemas.ts` — they only exist as TS types in `database.types.ts`. The
  implementer may add minimal Zod schemas mirroring the snake_case row shape, or
  use `z.object({...}).passthrough()` if that's simpler. Document the choice in
  `progress/history.md`.)

  Then `safeParse` per row, drop invalid rows with
  `console.error('[getAdminParticipantsByLeague] Skipping invalid row:', err)`,
  matching `leagues.queries.ts:99-117`.

**Behavior preservation:** `getAdminSeasons` etc. still `throw new Error(...)`
on the Supabase-error path (admin-side convention — see REQ-13 *Error contract*).
Do not change this in F2.

### Step 5 — REQ-14: `src/lib/queries/seasons.queries.ts`

18 casts. Three patterns:

**A. `(data ?? []) as Season[]` (`:80`)** — drop cast (plain table select).

**B. Joined-select shape laundering (`:40-44, :109-114, :157-163, :202-208`)** —
the current code launders the Supabase response through `Record<string, unknown>`
to bypass strict typing into the Zod parsers. Cleaner:

```ts
// before (excerpt)
const rawData = data as Record<string, unknown>;
const rawSplits = (rawData.splits as unknown[]) ?? [];
const splits = [...rawSplits].sort(
  (a, b) =>
    (a as { split_order: number }).split_order -
    (b as { split_order: number }).split_order,
);
const result = SeasonWithSplitsSchema.safeParse({ ...rawData, splits });

// after
const splits = [...(data.splits ?? [])].sort(
  (a, b) => a.split_order - b.split_order,
);
const result = SeasonWithSplitsSchema.safeParse({ ...data, splits });
```

The Supabase v2 typed client gives the joined return as
`Season & { splits: Split[] }` for `seasons.select('*, splits(*)')`. If the
join is parsed as `Split[] | null`, narrow with `?? []` (already present). The
Zod schemas (`SeasonWithSplitsSchema`, `SeasonWithActiveSplitSchema`) remain the
runtime truth — they're not changed.

**C. `seasonData as Season` / `splitData as Split` (`:248, :265`)** — drop the
cast on these plain `.single()` selects.

### Step 6 — REQ-14b: `src/lib/queries/leagues.queries.ts`

5 casts (new scope, 2026-05-28). Spec-author's reading of each:

| Line | Cast                                                        | Select shape                                                                                | Strategy                                                                                                                                |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `:46`  | `(data ?? []) as LeagueInfo[]`                            | `.from('leagues').select('id, tier_name, tier_priority')`                                  | Drop cast — Supabase v2 infers the Pick shape, structurally equal to `LeagueInfo` from `schemas.ts:80-84`.                              |
| `:96`  | `(rankingsData ?? []) as LeagueRanking[]`                 | `.from('league_rankings').select('*')`                                                     | Drop cast — Supabase v2 infers `LeagueRanking[]` from `database.types.ts`. The for-of loop still feeds `RankingEntrySchema.safeParse`. |
| `:197` | `data as LeagueInfo`                                      | `.from('leagues').select('id, tier_name, tier_priority').single()`                         | Drop cast — same as `:46` but `.single()` returns the object directly.                                                                  |
| `:253` | `((data ?? []) as ParticipantRow[]).map(...)`              | `.from('league_participants').select('trainer_id, lives, trainers!inner(id, nickname, avatar_url)')` | Try inference first. `!inner` enforces single trainer. If inference yields `trainers: { ... }[]` (array), add `ParticipantWithTrainerJoinSchema` in `schemas.ts` and `safeParse` per row. Document choice in history. |
| `:358` | `for (const row of data as MatchRow[])`                    | joined matches with `home_trainer:trainers!fkey(*)` + `away_trainer:trainers!fkey(*)` (nullable) | Same playbook. `!fkey_name` produces nullable single. Prefer inference; fall back to Zod with `home_trainer: TrainerLikeSchema.nullable()` etc.  |

**Local type aliases (`ParticipantRow` at `:243-251`, `MatchRow` at `:334-353`)**
are co-located inside the function bodies. After removing the casts:
- If inference succeeds, the local aliases become redundant and can be deleted
  (cleaner).
- If Zod is required, replace each local alias with a Zod-derived type
  (`type ParticipantRow = z.infer<typeof ParticipantWithTrainerJoinSchema>;`)
  to stay aligned with the conventions.

**Error contract:** all functions `console.error('[fnName] Error:', ...)` and
return `[]` / `null`. Preserve verbatim.

**Behavior preservation note:** `getRankingsByLeague` already validates each
row through `RankingEntrySchema.safeParse` (`:99-117`); the `as LeagueRanking[]`
cast on `:96` is a no-op for runtime safety. Dropping it changes only the
compile-time type, not behavior.

### Step 7 — REQ-16: snapshot lint check

No file edit. Just `pnpm lint`. If non-zero, escalate or fix root cause; do not
proceed.

### Step 8 — REQ-17: `biome.json` (LAST)

```jsonc
"suspicious": {
  "noExplicitAny": "error",   // was "warn"
  "useIterableCallbackReturn": "off"
}
```

Single-line change. Do **not** stage this edit until `pnpm lint` reports
**0 warnings** (REQ-16). If `pnpm lint` still has warnings after steps 1–6,
the implementer reports back to leader; do not flip-then-fix.

## Framework gotchas

- **Supabase v2 inferred types.** The whole REQ-13/14/14b strategy presupposes
  that `createClient<Database>()` is in place at `src/lib/supabase/server.ts`
  and that `database.types.ts` is up to date. The 2026-05-26 history entry
  already describes the LS / virtual-store path issue — restarting the language
  server may be needed mid-batch. The implementer should *not* add type
  generics manually as a workaround; verify the existing client first.
- **Zod `z.any()` is itself a `noExplicitAny` violation source.** Note that
  `schemas.ts:50` already has `metadata: z.any().nullable()` on `MatchSchema`.
  This is **not** in scope for F2 (it's a Zod runtime value, and Biome flags TS
  `any` annotations, not `z.any()` calls). Verified by inspection: the rule
  targets explicit `any` type annotations. If lint flags `z.any()` after the
  flip, escalate — that's a Biome behavior change we'd need to address.
- **Biome 2.3 rule behavior.** The `noExplicitAny` rule defaults to `warn` in
  `recommended: true`; setting it to `"error"` is a supported override (verified
  in `biome.json` schema URL pinned at `biomejs.dev/schemas/2.3.11/schema.json`).
  No CLI flag change needed.
- **Next 16 + React 19 compiler.** No interaction with REQ-11..17 — this is a
  types/runtime cleanup, not a render-time change. The compiler doesn't see
  type annotations. Verify against `vercel:nextjs` /
  `vercel:next-cache-components` if any unexpected build behavior surfaces.

## Risks & mitigations

| Risk                                                                                                                      | Mitigation                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase typed client not threaded through `createClient<Database>()`                                                     | Verify `src/lib/supabase/server.ts` before starting REQ-13. If absent, scope expands — escalate to leader rather than patching with new casts.                                                                                   |
| Joined-select inference yields a slightly different shape than current casts                                              | Use Zod (`safeParse`) on the join to make the boundary explicit, matching `leagues.queries.ts:99-117`. Document the schema additions in `progress/history.md`.                                                                   |
| Orphan-cluster deletion (REQ-15) reveals a consumer not caught by the pre-flight grep                                     | Pre-flight grep runs against `src/`, `src/app/`, and `src/components/divisions/index.ts` (the barrel). If the grep returns any hit, **stop** and surface to leader. Do not delete with consumers present.                        |
| `ClassificationTable` deletion (REQ-15b) reveals an unexpected external consumer (e.g. under `src/app/` or `shared/`)     | The 4th pre-flight grep (`rg "ClassificationTable" src/`) gates this step. If any hit lives outside the cluster being deleted, **stop** and surface to leader. Do not delete with consumers present.                              |
| Lint flip lands before warnings are zero                                                                                  | REQ-17's verification gates on REQ-16 (0 warnings). Implementer must run `pnpm lint` between step 7 and 8 and **stop** if any warning remains.                                                                                   |
| Existing `bracket.queries.ts` has an `unknown` cast (per `progress/history.md` FR7 entry) — could surface as TS-2 problem | Out of scope for F2 (not `any`). Leave it; F4 cache rewrite will revisit `bracket.queries.ts`. If TS suddenly complains during this batch, escalate.                                                                             |
| Editor formatter overrides Biome on save (the 2026-05-26 Zed drift)                                                       | `.zed/settings.json` already pins Biome. Implementer runs `pnpm check` before the final `./init.sh`; if formatting drifted, that auto-fixes it.                                                                                  |

## Conventions adhered to (`docs/conventions.md`)

- **Single source of truth for types** (`schemas.ts`) — explicitly enforced by
  REQ-11.
- **snake_case DB columns, camelCase UI mapping** — preserved. The `LeagueInfo`
  type in `schemas.ts` stays snake_case (it's a thin pick of the DB row); the UI
  types (`RankingEntry`, `MatchEntry`, etc.) stay camelCase, mapped in queries.
- **Queries log `[fnName] Error:` and return `[]`/`null`** — preserved verbatim
  for public reads (`leagues.queries.ts`, `seasons.queries.ts`). Admin queries
  that `throw` stay as `throw` (admin-side convention; not in scope to change
  here).
- **Server Components by default** — REQ-15 deletes Server Components; no
  `'use client'` is added or removed elsewhere.

## What this batch does NOT touch

- No `'use cache'` migration (F4).
- No new `<Suspense>` boundaries (F5).
- No new managers, no Server Actions (F3).
- No bracket / matches business logic changes.
- No database migrations (no Postgres RPC, no view changes).
- No new dependencies (no Zod plugins, no extra Biome rules).
- No `shared/DivisionSection/` deletion (different path; not in user's list — flagged).
- No admin `throw` → log-and-return-null normalization (explicitly preserved).
