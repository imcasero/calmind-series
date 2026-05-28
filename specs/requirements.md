# Requirements — Batch F2: Type cleanup & dead-code removal

> Source: `ARCHITECTURE_REVIEW.html` §1.2 (type drift), §2 (dead code), §3 (unsafe casts).
> Backlog: `features.json` F2. Active batch. Inherits REQ-9 from F1.
> Notation: **EARS** — *When/While/If [condition], the system shall [action].*
> No test runner exists yet, so each requirement names its **verification gate**
> (a check in `./init.sh` or a concrete manual step).

## Scope decisions (locked with user)

1. **Single batch.** One spec → approve → implement → review cycle covers all F2 work
   below. No partial landings. (2026-05-28)
2. **Strict cast removal.** Every `as Type[]` / `as Type` in `admin.queries.ts`,
   `seasons.queries.ts`, **and `leagues.queries.ts`** is removed and replaced with
   type-safe code (Zod validation for ambiguous joins; preserve snake_case →
   camelCase mapping convention). Total cast cleanup in F2 = **32** (9 admin + 18
   seasons + 5 leagues). The `leagues.queries.ts` inclusion is new: user approved
   2026-05-28 after the spec-author surfaced 5 extra casts outside the original
   brief.
3. **Lint flip is the last step.** `biome.json` `linter.rules.suspicious.noExplicitAny`
   flips `warn → error` **only after** every `any` in scope is gone, so the gate goes
   from green (warnings) to green (no warnings, no errors).
4. **Delete the orphan divisions cluster.** (2026-05-28) The 6 files listed under
   REQ-15 below (`SplitDataProvider/`, `SplitContent.tsx`, `ClassificationSection.tsx`,
   `MatchesSection.tsx`, `ParticipantsList.tsx`, `DivisionSection.tsx`) are unused
   post-FR11 — verified by grep against `src/app/`. The original brief asked to
   "fix `any[]` in SplitDataProvider"; the user upgraded that to a full cluster
   deletion. Deleting the cluster makes REQ-15 a no-op for the lint flip (REQ-17)
   because the 10 `any` annotations live inside SplitDataProvider, which goes
   with the file. **Addendum (2026-05-28):** user approved absorbing one
   additional orphan — `src/components/divisions/ClassificationTable/` — whose
   only consumer (`ClassificationSection.tsx`) is being deleted in REQ-15. The
   `divisions/index.ts` barrel only re-exports `ClassificationTable`, so it is
   removed too once empty. See REQ-15b.
5. **Preserved decisions:** (a) admin queries keep their `throw new Error(...)`
   error contract verbatim — not normalized in F2; (b) no Zod schemas are added
   beyond what's strictly necessary for REQ-13 joined-select safety; (c) the
   redesign/Lava queries and components are out of scope.

## REQ-11 — Delete duplicate type module

**When** the F2 implementer deletes the orphan divisions cluster (REQ-15) and
removes `queries.types.ts`'s only remaining importers, **the system shall**
delete `src/lib/types/queries.types.ts` and confirm no in-tree import path
references it.

- *Why:* `queries.types.ts` is a divergent duplicate of `schemas.ts`. Concretely,
  `queries.types.ts:83` defines `LeagueInfo` as `{ id, tierName, tierPriority }`
  (camelCase) while `schemas.ts:80-84` derives `LeagueInfoSchema` from
  `LeagueSchema.pick({ id, tier_name, tier_priority })` (snake_case). Two
  sources of truth violates the canonical types convention
  (`docs/conventions.md` §Types).
- *Importers before this batch (5, all inside the orphan cluster — confirmed
  2026-05-28 via `rg "from '@/lib/types/queries.types'" src/`):*
  - `src/components/divisions/ClassificationSection/ClassificationSection.tsx:2`
  - `src/components/divisions/ParticipantsList/ParticipantsList.tsx:6`
  - `src/components/divisions/SplitContent/SplitContent.tsx:11`
  - `src/components/divisions/MatchesSection/MatchesSection.tsx:6`
  - `src/components/divisions/SplitDataProvider/SplitDataProvider.tsx:18`
- *Importers after REQ-15:* zero. The orphan-cluster deletion removes every
  consumer, so REQ-11 reduces to a single `rm` plus a grep verification — no
  import-path rewrites required.
- *Verify:*
  - `rg "from '@/lib/types/queries.types'" src/` returns nothing.
  - `test ! -f src/lib/types/queries.types.ts` true.
  - `./init.sh` passes (typecheck + lint + build).

## REQ-12 — Delete dead client utilities

**When** F2 lands, **the system shall** delete
`src/hooks/useOptimizedFetch.ts` and
`src/components/performance/PerformanceMonitor.tsx`, and **shall** remove the empty
directories `src/hooks/` and `src/components/performance/` if no siblings remain.

- *Why:* both files are unreferenced outside of their own definitions
  (`rg 'useOptimizedFetch|PerformanceMonitor' src/` returns only self).
  They are Vite/SPA-era patterns (client-side fetch cache, `web-vitals` global
  beacon) that contradict the RSC-first architecture in `docs/conventions.md`
  §Components.
- *Sibling check (confirmed via `ls`):*
  - `src/hooks/` contains only `useOptimizedFetch.ts`.
  - `src/components/performance/` contains only `PerformanceMonitor.tsx`.
- *`any` contribution:* `PerformanceMonitor.tsx:186` declares
  `gtag?: (...args: any[]) => void;` — one of the residual `any` sources;
  removed with the file. `useOptimizedFetch.ts` has no `any` annotations
  (verified 2026-05-28; the original lint-warning attribution to this file was
  incorrect, but the file is still dead code and must go).
- *Verify:*
  - `test ! -e src/hooks/useOptimizedFetch.ts && test ! -e src/components/performance/PerformanceMonitor.tsx`.
  - `test ! -d src/hooks && test ! -d src/components/performance`.
  - `./init.sh` passes.

## REQ-13 — Remove unsafe casts in `admin.queries.ts`

**When** any function in `src/lib/queries/admin.queries.ts` returns Supabase data,
**the system shall** either rely on the Supabase typed client's inferred return
shape (preferred for plain selects against tables in `database.types.ts`) or
validate the row through a Zod schema (required for joined selects whose shape is
not in the generated types) — and **shall not** use any `as Type[]` / `as Type`
suppression cast.

- *In-scope casts (9, confirmed by `grep -n " as " admin.queries.ts`):*
  - `:84` `(data ?? []) as Season[]` (plain `seasons.select('*')`)
  - `:106` `(data ?? []) as Split[]` (plain `splits.select('*')`)
  - `:129` `(data ?? []) as League[]` (plain `leagues.select('*')`)
  - `:150` `(data ?? []) as Trainer[]` (plain `trainers.select('*')`)
  - `:176` `(data ?? []) as ParticipantWithTrainer[]` (joined select — needs validation)
  - `:211` `(data ?? []) as MatchWithTrainers[]` (joined select — needs validation)
  - `:240` `seasonData as Season`
  - `:254` `splitData as Split`
  - `:266` `(leaguesData ?? []) as League[]`
- *Rule per cast type:*
  - **Plain table selects against `database.types.ts`:** the Supabase v2 client
    already infers `Row` correctly. Removing the cast keeps the inferred type;
    only fall back to Zod if TS complains, which it should not for `'*'` selects.
  - **Joined selects (`ParticipantWithTrainer`, `MatchWithTrainers`):** introduce
    Zod schemas under `src/lib/types/schemas.ts` (or co-located adjacent), run
    `safeParse` per row, drop invalid rows with `console.error('[fnName] Skipping invalid row:', err)`,
    matching the established pattern in `leagues.queries.ts:99-117`.
- *Error contract preserved:* the existing `throw new Error(error.message)` after
  the Supabase error log (e.g. `admin.queries.ts:81-82`) is **kept verbatim** —
  these are admin-side queries; the convention "return `[]` / `null`" applies to
  public reads. Do not change the throw/return policy in this batch.
- *Verify:*
  - `grep -nE "\\bas (Season|Split|League|Trainer|ParticipantWithTrainer|MatchWithTrainers)" src/lib/queries/admin.queries.ts` returns nothing.
  - `pnpm exec tsc --noEmit` is clean.
  - Manual smoke test: `/admin/dashboard` loads its widgets (Dashboard stats,
    Seasons list, Splits list, Divisions list, Participants per league, Matches
    per league) with the same data as before. `./init.sh` passes.

## REQ-14 — Remove unsafe casts in `seasons.queries.ts`

**When** any function in `src/lib/queries/seasons.queries.ts` returns Supabase
data, **the system shall** use Zod validation (preferred — three functions already
use `SeasonWithSplitsSchema.safeParse` / `SeasonWithActiveSplitSchema.safeParse`)
or rely on the Supabase typed client's inferred shape, and **shall not** use any
`as Season` / `as Split` / `as Record<string, unknown>` / `as unknown[]` /
`as { split_order: number }` cast.

- *In-scope casts (18, confirmed by `grep -n " as " seasons.queries.ts`):*
  - `:40, :157, :202` `data as Record<string, unknown>` — Zod input shaping.
  - `:41, :110, :159, :204` `(rawData.splits as unknown[]) ?? []` — splits array.
  - `:44` `(s as { is_active: boolean; created_at: string }).is_active` — find predicate.
  - `:80` `(data ?? []) as Season[]` — `getAllSeasons` return.
  - `:109` `data as Record<string, unknown>[]` — loop header.
  - `:113-114, :162-163, :207-208` `(a as { split_order: number }).split_order` — sort comparator.
  - `:248` `seasonData as Season` and `:265` `splitData as Split` — `getSplitByNames`.
- *Rule per cast type:*
  - **`as Season[]` / `as Season` / `as Split`:** Supabase v2 typed client returns
    correctly-typed rows for plain `.select('*')`. Drop the cast; TS should accept.
  - **Joined `seasons.select('*, splits(*)')`:** the Supabase v2 typed client
    already infers `Season & { splits: Split[] }`. The current `as Record<string, unknown>`
    + `(rawSplits as unknown[]).sort((a, b) => (a as { split_order }).split_order …)`
    chain is suppressing that inferred type. Refactor so the joined query is
    consumed with its inferred type, then passed into the existing
    `SeasonWithSplitsSchema.safeParse` / `SeasonWithActiveSplitSchema.safeParse`
    untouched (those schemas are the runtime guarantee).
  - **`split_order` sort comparator:** with the joined type inferred, the
    comparator becomes `(a, b) => a.split_order - b.split_order` — no cast needed.
- *Error contract preserved:* the convention here is "log + return `[]` / `null`"
  (e.g. `seasons.queries.ts:32-36`); keep it verbatim. Zod failures already log
  with the `[fnName] Validation error:` prefix; preserve that.
- *Verify:*
  - `grep -nE "\\bas (Season|Split|Record<string, unknown>|unknown\\[\\]|\\{ split_order|\\{ is_active)" src/lib/queries/seasons.queries.ts` returns nothing.
  - `pnpm exec tsc --noEmit` is clean.
  - Manual smoke test: `/hub` loads (uses `getActiveSeasonWithSplit` +
    `getAllSeasonsWithSplits`), TopBar Season/Split chip dropdown lists all
    seasons. `/archivo` lists every season. `/[season]/[split]` (legacy redirect)
    still resolves via `getSplitByNames`. `./init.sh` passes.

## REQ-14b — Remove unsafe casts in `leagues.queries.ts`

**When** any function in `src/lib/queries/leagues.queries.ts` returns Supabase
data, **the system shall** rely on the Supabase typed client's inferred shape or
validate joined rows with Zod, and **shall not** use any
`as LeagueInfo[]` / `as LeagueInfo` / `as LeagueRanking[]` / `as ParticipantRow[]`
/ `as MatchRow[]` cast.

- *Why this is new scope:* the spec-author detected 5 casts outside the original
  F2 brief during pre-flight (2026-05-28). The user approved including them in
  F2 to land the cast cleanup atomically and avoid a future micro-batch. Same
  approach as REQ-13/14.
- *In-scope casts (5, confirmed by `grep -n " as " leagues.queries.ts`):*
  - `:46` `(data ?? []) as LeagueInfo[]` — plain `.select('id, tier_name, tier_priority')`
  - `:96` `(rankingsData ?? []) as LeagueRanking[]` — plain `.select('*')` against
    `league_rankings`; the loop already maps snake_case → camelCase via
    `RankingEntrySchema.safeParse`. The cast only exists to satisfy the for-of
    type; with Supabase v2 inference it can go.
  - `:197` `data as LeagueInfo` — plain `.select(...).single()`
  - `:253` `((data ?? []) as ParticipantRow[]).map(...)` — joined
    `.select(\`trainer_id, lives, trainers!inner(id, nickname, avatar_url)\`)`.
    Local `ParticipantRow` type alias defined `:243-251`. Inference vs Zod
    decision per REQ-13 §Rule.
  - `:358` `for (const row of data as MatchRow[])` — joined select with
    `home_trainer:trainers!matches_home_trainer_id_fkey(...)` +
    `away_trainer:...(*)`. Local `MatchRow` type alias `:334-353`. Inference vs
    Zod decision per REQ-13 §Rule.
- *Rule per cast type:*
  - **Plain selects with explicit column lists (`:46, :197`):** Supabase v2
    infers `Pick<LeaguesRow, 'id' | 'tier_name' | 'tier_priority'>[]`, which is
    structurally `LeagueInfo[]`. Drop the cast.
  - **Plain `.select('*')` (`:96`):** drop the cast; inferred type is
    `LeagueRanking[]` from `database.types.ts`.
  - **Joined selects (`:253, :358`):** prefer inference if Supabase v2 produces
    the right cardinality (`!inner` produces single, `!fkey_name` produces
    single nullable). If inference returns an array where the code expects a
    single object, add a minimal Zod schema in `schemas.ts` and `safeParse` per
    row — match `leagues.queries.ts:99-117` (same file's existing pattern).
- *Error contract preserved:* the convention here is "log + return `[]` / `null`"
  (e.g. `leagues.queries.ts:41-44`); keep verbatim.
- *Verify:*
  - `grep -c " as " src/lib/queries/leagues.queries.ts` returns `0`.
  - `pnpm exec tsc --noEmit` is clean.
  - Manual smoke test: `/hub/clasificacion` renders rankings for both Primera
    and Segunda; `/hub/calendario` renders match rounds; `/hub` participants
    section renders both leagues. `./init.sh` passes.

## REQ-15 (revised) — Delete the orphan divisions cluster

**When** F2 starts, **the system shall** delete the orphan cluster in
`src/components/divisions/` and verify zero remaining imports anywhere in `src/`:

- `src/components/divisions/SplitDataProvider/` (folder, includes `SplitDataProvider.tsx`)
- `src/components/divisions/SplitContent/SplitContent.tsx` (and its folder if empty)
- `src/components/divisions/ClassificationSection/ClassificationSection.tsx` (and folder)
- `src/components/divisions/MatchesSection/MatchesSection.tsx` (and folder)
- `src/components/divisions/ParticipantsList/ParticipantsList.tsx` (and folder)

- *Why (revised 2026-05-28):* the original brief said "fix the `any[]` in
  SplitDataProvider"; the spec-author detected that the file and 5 sibling
  files are entirely orphan post-FR11 — nothing in `src/app/` imports them.
  The user approved deleting the whole cluster instead of patching dead code.
  The 18 `any`-line matches in `SplitDataProvider.tsx` disappear with the file,
  so REQ-15 trivially satisfies REQ-16 (zero residual `any`) and unblocks
  REQ-17 (lint flip) automatically. No in-place type-fix work needed.
- *DivisionSection.tsx clarification:* the user's brief listed
  `DivisionSection.tsx` as part of the cluster. **It does not exist in
  `src/components/divisions/`.** The file at
  `src/components/shared/DivisionSection/DivisionSection.tsx` is a different
  presentation component, exported from `src/components/shared/index.ts`.
  Although `rg` shows no current consumer for it either, it is *not* in the
  user-listed `divisions/` folder. Spec-author decision: **leave
  `shared/DivisionSection/` untouched in F2** (rule: "no tocar nada que no
  esté pedido"). Flagged as ambiguity below.
- *ClassificationTable absorbed (revised 2026-05-28):* the only consumer of
  `src/components/divisions/ClassificationTable/` is
  `ClassificationSection.tsx`, which is being deleted as part of REQ-15. The
  user approved expanding scope to delete `ClassificationTable/` and clean up
  the barrel in the same batch — tracked as **REQ-15b** below. (Previous
  version of this requirement marked it as "preserved / future sweep"; that
  decision is superseded.)
- *Pre-deletion verification (must pass before any `rm`):*
  - `rg "SplitDataProvider|SplitContent|ClassificationSection|MatchesSection|ParticipantsList" src/app/`
    → returns **empty**.
  - `rg "SplitDataProvider|SplitContent|ClassificationSection|MatchesSection|ParticipantsList" src/` excluding the cluster itself → returns **empty**.
- *Post-deletion verification:*
  - `test ! -d src/components/divisions/SplitDataProvider`
  - `test ! -d src/components/divisions/SplitContent`
  - `test ! -d src/components/divisions/ClassificationSection`
  - `test ! -d src/components/divisions/MatchesSection`
  - `test ! -d src/components/divisions/ParticipantsList`
  - `rg ": any\b|any\[\]" src/components/divisions/` returns empty.
  - `pnpm exec tsc --noEmit` is clean.
  - `./init.sh` passes.

## REQ-15b — Absorb the now-orphan `ClassificationTable/` and clean the barrel

**When** the REQ-15 deletions land, **the system shall** also delete
`src/components/divisions/ClassificationTable/` (folder, 5 files) and remove
its export from `src/components/divisions/index.ts`. **If** the `index.ts` is
empty after that edit (no remaining exports), **the system shall** also delete
the `index.ts` file.

- *Why:* the only consumer of `ClassificationTable` is
  `divisions/ClassificationSection/ClassificationSection.tsx` (verified
  2026-05-28: `rg "ClassificationTable" src/` returns matches only inside the
  cluster file being deleted, the barrel, and `ClassificationTable.tsx` itself).
  Once REQ-15 removes `ClassificationSection.tsx`, `ClassificationTable` becomes
  unreachable. Same atomic-cleanup rationale as REQ-15.
- *Index.ts state today (verified 2026-05-28):* the only two non-comment lines
  are the `export type` and `export default` for `ClassificationTable`. After
  removing them, the file is empty (just a comment block) — delete it.
- *Pre-deletion verification (must pass before any `rm -r`):*
  - `rg "ClassificationTable" src/` returns matches only inside:
    - `src/components/divisions/ClassificationTable/` itself,
    - `src/components/divisions/index.ts` (barrel — to be cleaned), and
    - `src/components/divisions/ClassificationSection/ClassificationSection.tsx`
      (already marked for deletion in REQ-15).
  - **If** any other consumer appears (e.g. an `app/` route, a `shared/`
    sibling, or any unexpected file), **stop** and surface to leader. Do not
    delete with consumers present.
- *Ordering:* this runs as part of the REQ-15 step (same atomic deletion
  phase). The pre-flight grep above is the gate. REQ-11 (`queries.types.ts`
  deletion) remains downstream — `ClassificationTable` does not import
  `queries.types.ts`, so it does not affect REQ-11's importer count.
- *Post-deletion verification:*
  - `test ! -d src/components/divisions/ClassificationTable`
  - `rg "ClassificationTable" src/` returns empty.
  - **Index.ts handling:** run `cat src/components/divisions/index.ts` after
    the export-removal edit. If output is empty or contains only the
    leading comment block, run `rm src/components/divisions/index.ts` and
    verify `test ! -f src/components/divisions/index.ts`. If any other
    export remains (none expected today, but the gate is explicit), leave
    the file in place.
  - `rg "from '@/components/divisions'" src/` returns empty (the barrel had
    no consumers anyway; this is a sanity check).
  - `pnpm exec tsc --noEmit` is clean.
  - `./init.sh` passes.

## REQ-16 — No residual `any` in scope

**While** F2 is open, **the system shall** ensure that after REQ-11..REQ-15, no
`any` / `any[]` annotation remains in any file modified or newly authored in this
batch, **and** the codebase as a whole has zero `noExplicitAny` warnings.

- *Why:* this is the gate that lets REQ-17 flip the rule to `error` without
  immediately turning the lint red.
- *Inventory of `any` annotations (2026-05-28 baseline, `rg ': any\b' src/`):*
  - 18 line-matches in `SplitDataProvider.tsx` → removed by REQ-15 (file delete).
  - 1 line-match in `PerformanceMonitor.tsx:186` → removed by REQ-12 (file delete).
  - Total: **0 residual** after REQ-12 + REQ-15. REQ-13/14/14b do not introduce
    new `any` (they remove `as` casts, not type annotations).
- *Verify:*
  - `pnpm lint` reports **0 warnings, 0 errors** before the REQ-17 config flip.
  - `rg ": any\b|any\[\]" src/` returns empty.
  - If any out-of-scope `any` is discovered (e.g. in `bracket.queries.ts` per the
    FR7 note about "typed via `unknown` cast, no `any`"), the implementer reports
    it back to the leader rather than silently expanding scope.

## REQ-17 — Flip `noExplicitAny` to `error`

**When** REQ-11..REQ-16 have all been satisfied, **the system shall** update
`biome.json` `linter.rules.suspicious.noExplicitAny` from `"warn"` to `"error"`.

- *Why:* deferred from F1 (`progress/history.md` 2026-05-26 entry, "REQ-9
  deferred to F2"); the rule prevents regression once the existing `any` debt is
  gone.
- *Ordering:* **this is the last step of F2.** If REQ-16's verification is not
  green (0 warnings), the flip stays unstaged until it is. Flipping before the
  cleanup turns `./init.sh` red and blocks the reviewer.
- *Verify:*
  - `grep -n '"noExplicitAny"' biome.json` shows `"error"`.
  - `pnpm lint` is **0 errors / 0 warnings** (warnings count is informative;
    errors count is the gate).
  - `./init.sh` (full, with build) passes.

## Out of scope (push back to the backlog)

- **`shared/DivisionSection/`** — different path
  (`src/components/shared/DivisionSection/`, not `src/components/divisions/`);
  not in the user's listed deletion set even though it appears to be orphan
  (no consumer found 2026-05-28). Track as a follow-up review item; do not
  delete in F2.
- **`src/lib/data/fetchData.ts`** + `src/lib/services/matchService.ts` cleanup —
  owned by F4 (`features.json` F4 items) and F6. Note: with the orphan cluster
  gone, these may also be orphan; surface in the closeout if so.
- **PPR / `cacheComponents`** (REQ-5) — owned by F4.
- **Atomic season RPC** (REQ-3) — still deferred (needs Supabase migration access).
- **Admin `throw` normalization** — explicitly preserved (see Scope decision 5).
- **New Zod schemas beyond REQ-13/14b strict needs** — explicitly preserved.

## Cross-cutting verification (the reviewer's gate)

The single, non-negotiable acceptance check is **`./init.sh` (full, with build) is
green** after the implementer finishes, with these specific properties:

1. `pnpm exec tsc --noEmit` exit 0.
2. `pnpm lint` exit 0 with **0 warnings and 0 errors** (note: warning count
   matters here because REQ-17 flipped `noExplicitAny` to error — any leftover
   `any` becomes an error, not a warning).
3. `pnpm build` exit 0; route count unchanged from the FR11 baseline (20 pages).
4. Manual smoke (one-pass): `/`, `/hub`, `/hub/clasificacion`, `/hub/calendario`,
   `/archivo`, `/admin/dashboard` all render the same data as before — REQ-13/14/14b
   should not change observable behavior, only types; REQ-15 removes only dead
   files that no route imports.
