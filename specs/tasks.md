# Tasks — Batch F2: Type cleanup & dead-code removal

Atomic checklist for the Implementer. Do **not** start until `./init.sh` is green
and this spec is approved. Check items off as they land; log decisions in
`progress/history.md`.

> Follow the ordering in `design.md` §Sequencing. Steps 1→8 are dependent — do
> not parallelize. REQ-17 (lint flip) MUST be the last edit; any earlier and
> `./init.sh` turns red and the harness stalls.

## 0. Pre-flight

- [ ] **Baseline green:** run `./init.sh --quick` once. Expect typecheck clean,
      `pnpm lint` 0 errors + pre-existing warnings (`noExplicitAny` is still at
      `warn`). If lint shows new (non-`noExplicitAny`,
      non-`noUnusedImports/Variables`) errors, stop and surface to leader.
- [ ] **Verify Supabase typed client:** `grep -n 'createClient<Database>' src/lib/supabase/server.ts`.
      It MUST already type the client with `Database`. If it does not, stop —
      that's an out-of-scope structural change; report to leader.
- [ ] **Re-confirm cast counts (these drive REQ-13/14/14b done criteria):**
      `grep -c " as " src/lib/queries/admin.queries.ts` → expect `9`.
      `grep -c " as " src/lib/queries/seasons.queries.ts` → expect `18`.
      `grep -c " as " src/lib/queries/leagues.queries.ts` → expect `5`.
- [ ] **Re-confirm orphan cluster shape:**
      `ls src/components/divisions/` → expect 6 orphan folders
      (`SplitDataProvider`, `SplitContent`, `ClassificationSection`,
      `MatchesSection`, `ParticipantsList`, `ClassificationTable`) plus
      `index.ts` (all to be removed / cleaned in step 1).

## 1. Delete the orphan divisions cluster (REQ-15 + REQ-15b)

This is the **first** code-changing step. It removes the 5 importers of
`queries.types.ts`, the 10 `any` annotations in `SplitDataProvider.tsx`, and
the now-orphan `ClassificationTable/` + barrel in one shot — REQ-11, REQ-15,
REQ-15b, and most of REQ-16 collapse into a single deletion phase.

### 1a. Pre-deletion verification (gate)

- [ ] **Pre-deletion verification (MUST all match expectations before any
      `rm -r`).** Run these greps and capture their output for the closeout
      log:

      ```sh
      rg "SplitDataProvider|SplitContent|ClassificationSection|MatchesSection|ParticipantsList" src/app/
      rg -l "from '@/components/divisions/(SplitDataProvider|SplitContent|ClassificationSection|MatchesSection|ParticipantsList)'" src/
      rg "from '@/components/divisions'" src/
      rg "ClassificationTable" src/
      ```

      - Greps 1–3 must return **empty**.
      - Grep 4 (`ClassificationTable`) must return matches **only** inside:
        `src/components/divisions/ClassificationTable/` itself,
        `src/components/divisions/index.ts`, and
        `src/components/divisions/ClassificationSection/ClassificationSection.tsx`.
      - If any other consumer surfaces (especially under `src/app/` or
        `src/components/shared/`), **stop** and surface to leader.

### 1b. Delete the orphan cluster (REQ-15)

- [ ] `rm -r src/components/divisions/SplitDataProvider`
- [ ] `rm -r src/components/divisions/SplitContent`
- [ ] `rm -r src/components/divisions/ClassificationSection`
- [ ] `rm -r src/components/divisions/MatchesSection`
- [ ] `rm -r src/components/divisions/ParticipantsList`

### 1c. Delete `ClassificationTable/` and clean the barrel (REQ-15b)

- [ ] `rm -r src/components/divisions/ClassificationTable`
- [ ] Edit `src/components/divisions/index.ts` — remove the two
      `ClassificationTable` lines (currently 6–7):
      `export type { ClassificationTableProps } from './ClassificationTable/ClassificationTable';`
      `export { default as ClassificationTable } from './ClassificationTable/ClassificationTable';`
- [ ] Run `cat src/components/divisions/index.ts`. If the file has no
      remaining `export` statements (only the leading comment block and/or
      whitespace), `rm src/components/divisions/index.ts`. If any other
      export remains (none expected today), leave the file and report the
      surprise to leader before continuing.

### 1d. Post-deletion verification

- [ ] All must hold:
  - [ ] `test ! -d src/components/divisions/SplitDataProvider`
  - [ ] `test ! -d src/components/divisions/SplitContent`
  - [ ] `test ! -d src/components/divisions/ClassificationSection`
  - [ ] `test ! -d src/components/divisions/MatchesSection`
  - [ ] `test ! -d src/components/divisions/ParticipantsList`
  - [ ] `test ! -d src/components/divisions/ClassificationTable`
  - [ ] `rg ": any\b|any\[\]" src/components/divisions/ 2>/dev/null` returns
        empty (the directory may not exist at all — also acceptable).
  - [ ] `rg "ClassificationTable" src/` returns **empty**.
  - [ ] `index.ts` either no longer exists, or exists with zero exports
        (verified via `cat src/components/divisions/index.ts`).
- [ ] `pnpm exec tsc --noEmit` is clean.
- **Done criteria:** six directories gone, no residual `any` in `divisions/`,
  no residual `ClassificationTable` references anywhere in `src/`,
  `index.ts` correctly handled (deleted if empty), typecheck clean.

## 2. Delete dead client utilities (REQ-12)

- [ ] `rm src/components/performance/PerformanceMonitor.tsx`
- [ ] `rmdir src/components/performance` (must be empty; if not, list contents
      and stop).
- [ ] `rm src/hooks/useOptimizedFetch.ts`
- [ ] `rmdir src/hooks` (must be empty; if not, list contents and stop).
- [ ] Sanity grep — both names must return zero hits:
      `grep -rn 'useOptimizedFetch\|PerformanceMonitor' src/`
- [ ] `pnpm exec tsc --noEmit` is clean.
- **Done criteria:** four `rm`/`rmdir` succeed, sanity grep is empty, typecheck
  is clean. The last `any` annotation outside the orphan cluster
  (`PerformanceMonitor.tsx:186 gtag?: (...args: any[]) => void`) is gone with
  the file.

## 3. Delete `queries.types.ts` (REQ-11)

After step 1, zero importers remain (the 5 importers were all inside the
orphan cluster, now deleted).

- [ ] Sanity grep — must return zero hits:
      `rg "from '@/lib/types/queries.types'" src/`
      `rg 'from "@/lib/types/queries.types"' src/`
      If non-empty, stop — a consumer was missed in step 1's pre-flight grep.
- [ ] `rm src/lib/types/queries.types.ts`
- [ ] `pnpm exec tsc --noEmit` is clean.
- **Done criteria:** sanity greps empty, file deleted, typecheck clean.

## 4. Strip casts in `admin.queries.ts` (REQ-13)

Edit `src/lib/queries/admin.queries.ts`. Drop these 9 casts in order:

- [ ] **`getAdminSeasons` (line 84):** `return (data ?? []) as Season[];` →
      `return data ?? [];`
- [ ] **`getAdminSplitsBySeason` (line 106):** same pattern.
- [ ] **`getAdminLeaguesBySplit` (line 129):** same pattern.
- [ ] **`getAdminTrainers` (line 150):** same pattern.
- [ ] **`getActiveSplitInfo` (lines 240, 254, 266):**
      `const season = seasonData as Season;` → `const season = seasonData;`
      `const split = splitData as Split;` → `const split = splitData;`
      `leagues: (leaguesData ?? []) as League[],` → `leagues: leaguesData ?? [],`
- [ ] **`getAdminParticipantsByLeague` (line 176, joined select):**
      - Try removing the cast first; if Supabase v2 infers the join correctly
        from `'*, trainer:trainers(*)'`, that's the cleanest fix.
      - If inference fails (e.g. `trainer: Trainer[]` instead of `Trainer`), add
        Zod schemas in `src/lib/types/schemas.ts`:

        ```ts
        export const LeagueParticipantSchema = z.object({
          id: z.string().uuid(),
          initial_seed: z.number().nullable(),
          league_id: z.string().uuid().nullable(),
          lives: z.number(),
          status: z.string().nullable(),
          trainer_id: z.string().uuid().nullable(),
        });
        export const ParticipantWithTrainerSchema = LeagueParticipantSchema.extend({
          trainer: TrainerSchema,
        });
        export type ParticipantWithTrainer = z.infer<typeof ParticipantWithTrainerSchema>;
        ```

        Then in `admin.queries.ts`, replace the cast with a per-row safeParse
        loop modeled on `leagues.queries.ts:94-120`. Move the
        `ParticipantWithTrainer` type alias on line 157-159 to a re-export of
        the new Zod-derived type to avoid two definitions.
      - Document the chosen path (inference vs Zod) in `progress/history.md`.
- [ ] **`getAdminMatchesByLeague` (line 211, joined select):** same decision
      tree as above. If Zod is needed, add `MatchWithTrainersSchema` extending
      `MatchSchema` with `home_trainer: TrainerSchema.nullable()` +
      `away_trainer: TrainerSchema.nullable()`, and rewrite the existing
      `MatchWithTrainers` type alias (line 184-187) as the inferred type.
- [ ] Sanity — must return zero hits:
      `grep -nE "\\bas (Season|Split|League|Trainer|ParticipantWithTrainer|MatchWithTrainers)" src/lib/queries/admin.queries.ts`
- [ ] `pnpm exec tsc --noEmit` is clean.
- **Done criteria:** no `as Type[]` / `as Type` casts in the file, all functions
  still throw on Supabase error (admin convention preserved), typecheck clean,
  manual smoke at `/admin/dashboard` shows unchanged data.

## 5. Strip casts in `seasons.queries.ts` (REQ-14)

Edit `src/lib/queries/seasons.queries.ts`. There are 18 casts in 4 clusters.

- [ ] **`getActiveSeasonWithSplit` (lines 40-44):** remove the `Record<string, unknown>`
      laundering and the `find` predicate cast.

      ```ts
      // before
      const rawData = data as Record<string, unknown>;
      const rawSplits = (rawData.splits as unknown[]) ?? [];
      const activeSplit =
        rawSplits.find(
          (s) => (s as { is_active: boolean; created_at: string }).is_active,
        ) ?? null;
      const result = SeasonWithActiveSplitSchema.safeParse({ ...rawData, activeSplit });

      // after
      const splits = data.splits ?? [];
      const activeSplit = splits.find((s) => s.is_active) ?? null;
      const result = SeasonWithActiveSplitSchema.safeParse({ ...data, activeSplit });
      ```

- [ ] **`getAllSeasons` (line 80):** drop `as Season[]`. `return data ?? [];`.
- [ ] **`getAllSeasonsWithSplits` (lines 109-114):** same pattern as
      `getActiveSeasonWithSplit` — drop `Record<string, unknown>` cast on the
      loop header (`for (const raw of data) {`) and the sort comparator cast
      (`(a, b) => a.split_order - b.split_order`).
- [ ] **`getSeasonWithSplits` (lines 157-163):** same.
- [ ] **`getSeasonByName` (lines 202-208):** same.
- [ ] **`getSplitByNames` (lines 248, 265):** drop both `as Season` and
      `as Split` casts from the `.single()` returns.
- [ ] Sanity — must return zero hits:
      `grep -nE "\\bas (Season|Split|Record<string, unknown>|unknown\\[\\]|\\{ split_order|\\{ is_active)" src/lib/queries/seasons.queries.ts`
- [ ] `pnpm exec tsc --noEmit` is clean.
- **Done criteria:** all 18 casts gone, log-and-return-null behavior preserved
  on errors, Zod `safeParse` boundaries unchanged, typecheck clean.

## 6. Strip casts in `leagues.queries.ts` (REQ-14b)

Edit `src/lib/queries/leagues.queries.ts`. 5 casts (new scope, 2026-05-28).

- [ ] **`getAllLeagues` (line 46):** `return (data ?? []) as LeagueInfo[];` →
      `return data ?? [];` — Supabase v2 infers
      `Pick<Leagues, 'id' | 'tier_name' | 'tier_priority'>[]`, structurally
      equal to `LeagueInfo` from `schemas.ts:80-84`.
- [ ] **`getRankingsByLeague` (line 96):**
      `for (const ranking of (rankingsData ?? []) as LeagueRanking[]) {` →
      `for (const ranking of rankingsData ?? []) {`. The existing
      `RankingEntrySchema.safeParse` on each row (lines 99-117) remains the
      runtime guarantee.
- [ ] **`getLeagueByTier` (line 197):** `return data as LeagueInfo;` →
      `return data;` — `.single()` on the same column list as line 46.
- [ ] **`getParticipantsByLeague` (line 253, joined select):**
      - Select shape:
        `.from('league_participants').select('trainer_id, lives, trainers!inner(id, nickname, avatar_url)')`.
      - Try removing `((data ?? []) as ParticipantRow[])` first; `!inner`
        constrains to a single trainer object so inference should yield
        `{ trainer_id, lives, trainers: { id, nickname, avatar_url } }[]`.
      - If inference yields `trainers: { ... }[]` (array) instead of the single
        object the `.map` consumes, add `ParticipantWithTrainerJoinSchema` in
        `src/lib/types/schemas.ts` and `safeParse` per row, modeled on
        `leagues.queries.ts:99-117`.
      - Local `ParticipantRow` alias at lines 243-251: if inference works,
        delete the alias (redundant); if Zod is used, rewrite it as
        `type ParticipantRow = z.infer<typeof ParticipantWithTrainerJoinSchema>;`.
      - Document the chosen path in `progress/history.md`.
- [ ] **`getMatchesByLeague` (line 358, joined select):**
      - Select shape includes
        `home_trainer:trainers!matches_home_trainer_id_fkey(*)` +
        `away_trainer:trainers!matches_away_trainer_id_fkey(*)` (both nullable).
      - Try removing the `as MatchRow[]` first.
      - If inference fails (often happens with `!fkey_name` syntax — the
        cardinality may be misreported), add `MatchWithTrainerJoinSchema` in
        `schemas.ts` with
        `home_trainer: TrainerSchema.nullable()` +
        `away_trainer: TrainerSchema.nullable()`, then `safeParse` per row.
      - Local `MatchRow` alias at lines 334-353: same delete-or-rewrite
        decision as `ParticipantRow`.
      - Document the chosen path in `progress/history.md`.
- [ ] Sanity — must return zero hits:
      `grep -c " as " src/lib/queries/leagues.queries.ts`
- [ ] `pnpm exec tsc --noEmit` is clean.
- **Done criteria:** all 5 casts gone, log-and-return-null behavior preserved
  on errors, `RankingEntrySchema.safeParse` boundary untouched, manual smoke
  at `/hub`, `/hub/clasificacion`, `/hub/calendario` shows unchanged data,
  typecheck clean.

## 7. Snapshot lint check (REQ-16 — gate before flip)

- [ ] Run `pnpm check` to auto-fix any formatting drift introduced during edits.
- [ ] Run `pnpm lint`. Expected output: **0 errors, 0 warnings.**
- [ ] If warnings remain:
  - List them with `pnpm lint 2>&1 | grep -E 'warn|×'`.
  - If they are `noExplicitAny`: locate the offending file/line, type it, repeat.
  - If they are anything else (`noUnusedImports`, `noUnusedVariables`,
    `useExhaustiveDependencies`, etc.) that you introduced — fix them.
  - If they are pre-existing in a file you did NOT touch, stop and surface to
    leader. Do not silently expand scope.
- **Done criteria:** `pnpm lint` exits with **0 errors and 0 warnings**.

## 8. Flip `noExplicitAny` to `error` (REQ-17 — LAST STEP)

- [ ] Edit `biome.json`, line ~50:
      `"noExplicitAny": "warn"` → `"noExplicitAny": "error"`.
- [ ] Run `pnpm lint`. Expected: still **0 errors / 0 warnings** (the rule was
      green at warn, it's green at error too because step 7 zeroed the count).
- [ ] Run the **full** `./init.sh` (no `--quick`). Expected: green through
      typecheck, lint, build (20 pages — unchanged from FR11 baseline).
- [ ] Confirm `grep -n '"noExplicitAny"' biome.json` shows `"error"`.
- **Done criteria:** `./init.sh` (full) exits green; biome.json shows
  `noExplicitAny: "error"`.

## 9. Closeout

- [ ] Append a dated entry to `progress/history.md` summarizing: files/folders
      deleted (orphan cluster + `ClassificationTable/` + barrel handling +
      dead utilities + `queries.types.ts`), Zod schemas added (if any, per
      REQ-13 / REQ-14b joined-select decisions), cast counts before/after
      (9+18+5 → 0), the `noExplicitAny: error` flip, and the green
      `./init.sh` evidence (key lines). Record whether
      `src/components/divisions/index.ts` was deleted (empty post-cleanup) or
      retained (some other export survived — unexpected; flag).
- [ ] Note the orphaned status of `src/components/shared/DivisionSection/`
      for the future dead-code sweep (different path; not in F2's deletion
      list).
- [ ] Tag the batch handoff in the log as ready for reviewer.
- [ ] **Do not** modify `features.json` `status` — leader transitions F2 from
      `in_progress` → `done` after reviewer sign-off.

## Reviewer's evidence checklist (paste into review)

| Check                                                              | Command                                                                                                  | Expected                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Orphan cluster gone (6 dirs)                                       | `for d in SplitDataProvider SplitContent ClassificationSection MatchesSection ParticipantsList ClassificationTable; do test ! -d "src/components/divisions/$d"; done` | exit 0                            |
| No `ClassificationTable` references                                | `rg "ClassificationTable" src/`                                                                          | empty                             |
| `divisions/index.ts` correctly handled                             | `test ! -f src/components/divisions/index.ts \|\| ! grep -q '^export' src/components/divisions/index.ts` | exit 0 (file gone OR no exports)  |
| Dead client utilities gone                                         | `test ! -e src/hooks/useOptimizedFetch.ts && test ! -e src/components/performance/PerformanceMonitor.tsx` | exit 0                            |
| Dead dirs gone                                                     | `test ! -d src/hooks && test ! -d src/components/performance`                                            | exit 0                            |
| `queries.types.ts` gone                                            | `test ! -f src/lib/types/queries.types.ts`                                                               | exit 0                            |
| No legacy type-module imports                                      | `grep -Rn 'queries.types' src/`                                                                          | empty                             |
| Zero casts in `admin.queries.ts`                                   | `grep -c ' as ' src/lib/queries/admin.queries.ts`                                                        | `0`                               |
| Zero casts in `seasons.queries.ts`                                 | `grep -c ' as ' src/lib/queries/seasons.queries.ts`                                                      | `0`                               |
| Zero casts in `leagues.queries.ts`                                 | `grep -c ' as ' src/lib/queries/leagues.queries.ts`                                                      | `0`                               |
| Zero `any` annotations in `src/`                                   | `rg ': any\\b\|any\\[\\]' src/`                                                                          | empty                             |
| `noExplicitAny` flipped                                            | `grep -n '"noExplicitAny"' biome.json`                                                                   | `"error"`                         |
| Typecheck                                                          | `pnpm exec tsc --noEmit`                                                                                 | exit 0                            |
| Lint                                                               | `pnpm lint`                                                                                              | 0 errors, 0 warnings              |
| Build                                                              | `pnpm build`                                                                                             | 20 pages, exit 0                  |
| Full harness                                                       | `./init.sh`                                                                                              | "Harness ready — baseline green." |
