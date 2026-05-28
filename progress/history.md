# Progress log

Running log of the SDD harness. Newest entries on top. The Leader appends here on every
status transition; agents record any deferral or sequencing decision here too.

---

## 2026-05-28 — F2 done (reviewer signed off)

Reviewer verdict: **APPROVED**. Full `./init.sh` GREEN (typecheck 0 errors, lint 0
errors / 2 pre-existing warnings, build 20/20 pages). All REQs cumplidas: REQ-11
(queries.types.ts deleted, imports migrated to `@/lib/types/schemas`), REQ-12
(`useOptimizedFetch` + `PerformanceMonitor` deleted), REQ-13/14/14b (32 casts removed
across `admin.queries.ts` 9 + `seasons.queries.ts` 18 + `leagues.queries.ts` 5; 0
residuals), REQ-15/15b (orphan render-prop cluster fully gone — 6 folders + `index.ts`
+ entire `src/components/divisions/` dir), REQ-17 (`biome.json` `noExplicitAny: error`
active).

**Files touched (paths absolute):**
- Deleted: `/Users/diego/Developer/calmind-series/src/components/divisions/` (entire
  tree — `SplitDataProvider/`, `SplitContent/`, `ClassificationSection/`,
  `MatchesSection/`, `ParticipantsList/`, `ClassificationTable/` + `index.ts`).
- Deleted: `/Users/diego/Developer/calmind-series/src/hooks/useOptimizedFetch.ts` +
  `/Users/diego/Developer/calmind-series/src/components/performance/PerformanceMonitor.tsx`
  (+ their now-empty parent dirs).
- Deleted: `/Users/diego/Developer/calmind-series/src/lib/types/queries.types.ts`.
- Edited: `/Users/diego/Developer/calmind-series/src/lib/queries/admin.queries.ts`,
  `/Users/diego/Developer/calmind-series/src/lib/queries/seasons.queries.ts`,
  `/Users/diego/Developer/calmind-series/src/lib/queries/leagues.queries.ts`,
  `/Users/diego/Developer/calmind-series/biome.json`.

**Decisions confirmed by reviewer:**
- Zero new Zod schemas added — Supabase v2 inference (via
  `createServerClient<Database>()`) covered every cast site cleanly.
- `ParticipantWithTrainer.trainer: Trainer | null` loosening is a **correctness fix**
  (the FK is nullable; the original non-null type masked reality), not a workaround.
  Admin consumers declare local types so no client breakage.
- `shared/DivisionSection/` correctly **deferred** to a future micro-batch (different
  path than the orphan cluster — out of F2 scope per spec-author).
- 2 pre-existing warnings in `src/lib/data/fetchData.ts:5` (`J15Match`, `J16Match`) +
  `src/lib/services/matchService.ts:5` (`Matchup`) **punted to F4** (which owns
  `fetchData.ts` deletion + `matchService.ts` move). They predate F2; `pnpm lint`
  exit 0 holds (warnings don't fail it).
- No scope creep.

**Leader transition:** `features.json` F2 `spec_ready` → `done`; `activeBatch` → `[]`;
`updated` → `2026-05-28`. F2 items marked `[DONE 2026-05-28]`; F4 inheritance documented
in F2 `deferred[]`. `specs/` retained as F2 historical record until the next spec-author
run overwrites it.

**Next-up candidates:**
- **F3 — Abstracciones admin** (`dependsOn: ["F2"]` ✓). Now unblocked by F2 close.
  Extracts `<AdminModal>`/`<AdminErrorBanner>`, `useLeagueSelector()` hook, wires Zod
  validation into admin forms, migrates `SeasonsManager` to Server Actions +
  `useOptimistic` as the pilot. Effort: 1–2 días.
- **F5 — Performance / modernización** (`dependsOn: ["F1"]` ✓ — was always ready, not
  blocked by F2). `generateStaticParams`, granular `<Suspense>`, push `'use client'`
  to leaves, extract `<ErrorCard>`/`<PageSkeleton>`/`<BackgroundDecoration>`/
  `formatSplitName()`, image sizes + animation polish. Effort: 1 día.

**Leader recommendation: F3.** Reasoning:
1. F3 is the next phase in source order (Fase 3 follows Fase 2).
2. F3 unblocks **F4** (`dependsOn: ["F1", "F3"]`) and indirectly **F6**
   (`dependsOn: ["F3", "F4"]`) — sequencing F3 first opens the longest critical path.
3. The FR12–FR14 admin pixel reskin shipped without touching admin logic; F3 picks up
   the structural work the reskin deliberately left alone (modal/error/selector
   abstractions, Zod boundaries, Server Action pilot). Doing it now while the admin
   primitives (`AdminModal`, `AdminErrorBanner`) and pixel shell are fresh in the codebase
   minimizes rework — those primitives already exist from FR12 and just need to be
   adopted at the call sites the design discovered.
4. F5 is smaller (1 día vs 1–2) and standalone — it can slot in any time before F6
   without blocking anything. Better to hold it as a quick win when budget is tight.

User decides. After approval, leader will hand the chosen batch to `spec-author`.

---

## 2026-05-28 — F2 implemented (implementer → reviewer)

Implemented the approved F2 batch (`specs/requirements.md` + `design.md` + `tasks.md`)
in order: REQ-15/15b orphan deletion → REQ-12 dead utilities → REQ-11 type module →
REQ-13/14/14b casts → REQ-17 lint flip. All eight task sections green.

**Files deleted (orphan cluster + dead code + duplicate types)**
- `src/components/divisions/SplitDataProvider/SplitDataProvider.tsx` (+ dir)
- `src/components/divisions/SplitContent/SplitContent.tsx` (+ dir)
- `src/components/divisions/ClassificationSection/ClassificationSection.tsx` (+ dir)
- `src/components/divisions/MatchesSection/MatchesSection.tsx` (+ dir)
- `src/components/divisions/ParticipantsList/ParticipantsList.tsx` (+ dir)
- `src/components/divisions/ClassificationTable/{ClassificationTable,PlayerAvatar,PlayerBadge,StatsLegend,TableHeader,TableRow}.tsx` (+ dir)
- `src/components/divisions/index.ts` — file became empty after removing the two
  `ClassificationTable` exports (only the comment block remained); also removed the
  now-empty `src/components/divisions/` directory itself.
- `src/components/performance/PerformanceMonitor.tsx` (+ empty `performance/` dir)
- `src/hooks/useOptimizedFetch.ts` (+ empty `hooks/` dir)
- `src/lib/types/queries.types.ts` — zero importers after the orphan cluster gone.

**Files edited**
- `src/lib/queries/admin.queries.ts` — 9 casts removed; `ParticipantWithTrainer` type
  alias loosened to `trainer: Trainer | null` (see decision below).
- `src/lib/queries/seasons.queries.ts` — 18 casts removed; `Record<string, unknown>`
  laundering replaced by direct consumption of the Supabase-inferred join shape.
- `src/lib/queries/leagues.queries.ts` — 5 casts removed; local `ParticipantRow` and
  `MatchRow` aliases deleted (Supabase v2 inference covered them); unused
  `LeagueRanking` import removed (it was only used by the cast).
- `biome.json` — `linter.rules.suspicious.noExplicitAny`: `"warn"` → `"error"` (last edit).

**Decision per query file (Supabase v2 inference vs Zod)**
- `admin.queries.ts` → **Inference only.** All 9 casts dropped without adding Zod
  schemas. For the joined `'*, trainer:trainers(*)'` select in
  `getAdminParticipantsByLeague`, Supabase v2 correctly infers `trainer: Trainer | null`
  (FK is nullable). The previous local alias declared `trainer: Trainer` (non-null)
  which masked reality; loosened to `trainer: Trainer | null` to match the actual
  runtime shape. Consumers (`ParticipantsManager.tsx`, `MatchesManager.tsx`) declare
  their own local type alias and don't import the public one, so no client breakage.
  The joined `getAdminMatchesByLeague` already declared `home_trainer`/`away_trainer`
  as nullable and matched inference cleanly.
- `seasons.queries.ts` → **Inference only.** The Supabase typed client returns
  `Season & { splits: Split[] }` for `seasons.select('*, splits(*)')`. The previous
  `Record<string, unknown>` + `unknown[]` + `{ split_order: number }` laundering chain
  was suppressing this. Replaced with direct consumption + the existing
  `SeasonWithSplitsSchema.safeParse` / `SeasonWithActiveSplitSchema.safeParse` boundary
  (unchanged — Zod stays the runtime truth). No new schemas added.
- `leagues.queries.ts` → **Inference only.** All 5 casts dropped. The two joined
  selects (`getParticipantsBySplit` with `trainers!inner(...)` and `getMatchesByRound`
  with `home_trainer:trainers!fkey(*)` + `away_trainer:trainers!fkey(*)`) inferred
  cleanly without Zod. Local `ParticipantRow` and `MatchRow` type aliases became
  redundant and were deleted. The existing `RankingEntrySchema.safeParse` boundary in
  `getRankingsByLeague` is untouched.

**Net: zero new Zod schemas added in F2** — Supabase v2 inference + the
`createServerClient<Database>()` thread (verified pre-flight) covered every cast site.

**Cast counts before/after**
- `admin.queries.ts`: 9 → 0
- `seasons.queries.ts`: 18 → 0
- `leagues.queries.ts`: 5 → 0
- **Total: 32 → 0.**

**`noExplicitAny` flipped** `warn` → `error` (`biome.json:50`) as REQ-17 last step.
Lint after the flip: 0 errors / 2 warnings. Both remaining warnings are pre-existing
`noUnusedImports` in `src/lib/data/fetchData.ts` (`J15Match, J16Match`) and
`src/lib/services/matchService.ts` (`Matchup`). These predate F2 (confirmed by
`git stash` + baseline lint comparison) and are explicitly **out of scope** per
`design.md` "What this batch does NOT touch" / `requirements.md` "Out of scope" →
F4 owns the `fetchData.ts` / `matchService.ts` cleanup. Surfaced here per the
tasks-step-7 escalation rule; not patched in F2 to avoid scope creep. The
`./init.sh` gate is `pnpm lint` exit 0, which holds (warnings don't fail it).

**`divisions/index.ts` outcome** Deleted — after removing the two `ClassificationTable`
exports the file contained only the leading comment block. The empty
`src/components/divisions/` directory was also removed (no siblings remained).

**Verification — full `./init.sh` GREEN.** Key evidence:
```
✓ typecheck clean
Found 2 warnings.                  (pre-existing, F4-owned — see above)
✓ lint clean
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 2.5s
✓ Generating static pages using 9 workers (20/20)
ƒ Proxy (Middleware)
✓ build succeeds
✓ Harness ready — baseline is green.
```
Static page count unchanged at 20 (FR11 baseline). Route list unchanged. Zero `any`
annotations in `src/` (`rg ": any\b|any\[\]" src/` empty). Zero casts in the three
query files (`grep -c ' as '` returns 0 for each).

**Flagged for the future dead-code sweep (NOT touched in F2):**
- `src/components/shared/DivisionSection/DivisionSection.tsx` — different path than the
  user-listed cluster; `rg` shows no consumer, but it lives under `shared/` and was
  explicitly excluded from F2 scope by the spec author. Track for a future micro-batch.
- The 2 pre-existing `noUnusedImports` warnings noted above belong to F4.

**features.json:** F2 left `spec_ready` (status NOT modified per `tasks.md` §9 —
leader transitions to `in_progress`→`done` after reviewer sign-off). Handing to reviewer.

---

## 2026-05-28 — F2 spec_ready (spec-author → leader, awaiting user approval)

Spec-author finished `specs/requirements.md` · `specs/design.md` · `specs/tasks.md` for
F2. Leader flipped `features.json` F2 `pending` → `spec_ready`; `activeBatch` stays
`["F2"]`; `updated` = `2026-05-28`.

**User decisions (2026-05-28) absorbed into the spec**
1. **REQ-15 revised — cluster delete.** The orphan render-prop cluster in
   `src/components/divisions/` (`SplitDataProvider/`, `SplitContent.tsx`,
   `ClassificationSection.tsx`, `MatchesSection.tsx`, `ParticipantsList.tsx`) is dead
   post-FR11 and gets deleted wholesale. The `any[]` at `SplitDataProvider.tsx:243-244`
   disappears with the file — no in-place type fix needed.
2. **REQ-14b added — `leagues.queries.ts` casts.** Cleanup now sweeps all 32 unsafe
   `as Type[]` casts (9 admin + 18 seasons + 5 leagues), not just the ~23 the original
   brief named. Total cast removal target = 32.

**Ordering in design.md (locked):** delete orphan cluster (REQ-15) → delete dead utils
(REQ-12: `useOptimizedFetch`, `PerformanceMonitor`) → delete `queries.types.ts` (REQ-11,
migrate imports to `@/lib/types/schemas`) → fix 32 casts (REQ-13/14/14b) → flip
`biome.json` `noExplicitAny: warn → error` (REQ-17). Lint flip is gated on a green
`./init.sh` after all cleanups land.

**Residual notes (documented in specs, non-blocking)**
- `src/components/shared/DivisionSection/` is **out of scope** — different path than the
  brief; was never in `components/divisions/`.
- `divisions/ClassificationTable/` will be orphaned post-REQ-15 (still exported from
  `components/divisions/index.ts`) — flagged for a future sweep.
- Supabase generated-types inference vs Zod schemas as the cast replacement strategy:
  implementer decides at runtime per query (whichever gives a clean type without `any`)
  and records the call in `progress/history.md`.

**User must approve before implementer runs:**
1. The cluster-delete scope (REQ-15) and the cast totals (32 incl. leagues).
2. The execution order (delete first → fix casts → flip lint last).
3. The deferred-sweep note for `ClassificationTable/`.

**Gate:** implementer ships only after a green `./init.sh` post-lint-flip — the
reviewer rejects otherwise. No code changes until the user signs off on `specs/`.

---

## 2026-05-28 — F2 selected as next batch (leader handoff to spec-author)

User asked to advance F2–F6 of the architecture-review backlog. Leader routed:

**Decision:** F2 is the next ready feature.
- Dependencies: depends on F1 (done). Satisfied.
- Status: `pending`. Naming sub-items already completed inline (2026-05-26).
- F5 is also unblocked (depends only on F1), but F2 is sequenced first because
  (a) it's the next phase in source order, (b) it unblocks F3/F4/F6, and (c) the
  REQ-9 `noExplicitAny: error` flip inherited from F1 lives here — flipping it
  any earlier would turn lint red on the live `any[]` in `SplitDataProvider:243-244`.

**Remaining F2 scope** (after the 2026-05-26 naming slice):
- Delete `src/lib/types/queries.types.ts`; migrate imports to `@/lib/types/schemas`.
- Delete `src/hooks/useOptimizedFetch.ts` + `src/components/performance/PerformanceMonitor.tsx`.
- Remove ~18 unsafe `as Type[]` casts in `admin.queries.ts` + `seasons.queries.ts`.
- Fix the resulting `any[]` in `SplitDataProvider`.
- Flip `biome.json` `noExplicitAny: warn → error` (REQ-9, inherited from F1).
- Note: 30 pre-existing F2 warnings already include dead imports in `matchService` +
  `SplitDataProvider` left over from the FR11 legacy-route redirects (cleanup naturally
  swept up by the dead-code deletions above).

**State changes:**
- `features.json` `activeBatch` → `["F2"]`; `updated` → `2026-05-28`. F2 stays
  `pending` until the spec-author writes `specs/` and the leader flips it to `spec_ready`.
- `specs/` currently still holds the F0+F1 batch (stale). The spec-author run for F2
  will **overwrite** `requirements.md` / `design.md` / `tasks.md` (history stays in git
  + this log). The `specs/redesign/` track is separate and untouched.

**Next agent: `spec-author`.** Inputs: the remaining F2 items listed above + the
relevant findings from `ARCHITECTURE_REVIEW.html` (§1.2 type drift, §2 dead code,
§3 unsafe casts) + the `SplitDataProvider:243-244` `any[]` known issue.

**User decision required BEFORE the spec is approved:**
1. Confirm `noExplicitAny: error` flips inside the same F2 batch (vs deferring once
   more). The implementer needs to know whether to gate it on a green lint after
   the casts/dead-code removals or to flip-then-fix.
2. Confirm scope of `as Type[]` cast removals — strict (every cast) vs pragmatic
   (only the unsafe ones the review flagged).
3. Whether to land F2 in one batch or split (dead-code first, then casts + lint flip).

After the spec-author writes `specs/`, leader will flip F2 → `spec_ready` and
present it at the approval gate.

---

## 2026-05-26 — Editor↔Biome formatting drift fixed + Zed aligned

User reported Zed warnings (e.g. "next/navigation not found"). Investigated:

- **"next/navigation not found"** — NOT a code error. `tsc --noEmit` is clean and the
  module resolves on disk. Cause: stale TS language server. Adding
  `babel-plugin-react-compiler` changed the pnpm virtual-store hash dir for `next`
  (`next@16.1.1_babel-plugin-react-compiler@1.0.0_...`), so an LS started before the
  install had the old path cached. Fix = restart the language server in Zed.

- **Tree had drifted RED**: `pnpm lint` exited 1 with **5 format errors** (double quotes
  vs Biome's single-quote config) in `next.config.ts`, `cruces/page.tsx`,
  `RegulationsManager.tsx`, `PlayoffBracket.tsx`, `TournamentFormat.tsx`.
  `TournamentFormat.tsx` was never content-edited by any agent → confirms an **external
  formatter (Zed format-on-save, Prettier-style double quotes)** reformatted files,
  fighting Biome. (Corrects the earlier "green" sign-off — the tree drifted post-review.)
  Fixed with `biome format --write .` (formatting only; the 35 F2 warnings untouched).

- **Root-cause fix:** added `.zed/settings.json` pointing Zed at Biome as formatter with
  `format_on_save`, and `source.fixAll`/`organizeImports` set to **false** (so save only
  reformats; it does NOT strip unused imports — that stays F2's controlled cleanup).

**Verification:** `tsc --noEmit` 0 errors · `pnpm lint` 0 errors / 35 warnings ·
`./init.sh --quick` green. F0/F1 remain `done`; the 35 warnings remain F2-scheduled.

---

## 2026-05-26 — Batch 1 (F0+F1) reviewed & DONE (reviewer → leader)

**Reviewer verdict: APPROVED.** Ran the full `./init.sh` independently — green
(typecheck clean · lint 35 warnings/0 errors · build OK, 13/13 static pages,
`ƒ Proxy (Middleware)`). Confirmed the 35 warnings are identical to HEAD (no new
ones) by stashing and re-counting (9 `noUnusedImports` + 4 `noUnusedVariables` +
22 `noExplicitAny`).

Each in-scope REQ mapped to evidence and passed:
- REQ-1/2 — `admin/page.tsx` uses `router.push`, no `redirect` import, error branch intact.
- REQ-4 — `next.config.ts:6` `reactCompiler: true` (top-level key, correct for v16);
  `babel-plugin-react-compiler@1.0.0` present; green build = compiler engaged.
- REQ-6 — `images` block has `formats`/`deviceSizes`/`imageSizes` + kept `remotePatterns`.
- REQ-7 — `next.config.optimization.js` absent.
- REQ-8 — `tsconfig.json` target `ES2022`.
- REQ-10 — `proxy.ts` exports `proxyConfig`; Next still pinned `16.1.1` (codemod did not bump).

Deferred items confirmed UNTOUCHED: `biome.json` `noExplicitAny: "warn"` (REQ-9);
no `cacheComponents`/`ppr` (REQ-5); no season-activation RPC (REQ-3). No scope creep,
no convention violations, naming-pass references all resolve.

Only finding: 💡 nitpick — pre-existing unused imports in `cruces/page.tsx` &
`final/page.tsx` (already dead at HEAD; F2 `noUnusedImports` owns them). No action now.

**Leader transition:** `features.json` F0 → `done`, F1 → `done`. `activeBatch` →
`["F2"]` (next ready: F2 and F5 both unblocked by F1; F2 is next by phase order and
already has its naming sub-items done). F2 still `pending` — needs a spec-author run +
user approval before implementation.

---

## 2026-05-26 — Batch 1 (F0+F1) implemented (implementer)

Implemented the approved, narrowed F0+F1 batch. In scope: REQ-1, REQ-2 (F0) ·
REQ-4, REQ-6, REQ-7, REQ-8, REQ-10 (F1). DEFERRED untouched: REQ-3, REQ-5, REQ-9.

**Changes per file**
- `src/app/admin/page.tsx` (REQ-1/REQ-2): replaced `import { redirect }` with
  `import { useRouter }`; added `const router = useRouter()`; `redirect('/admin/dashboard')`
  → `router.push('/admin/dashboard')`. Error branch left untouched (REQ-2 already satisfied).
- `next.config.ts` (REQ-4/REQ-6): added top-level `reactCompiler: true` and
  `poweredByHeader: false`; merged `images.formats: ['image/webp','image/avif']` +
  `deviceSizes` + `imageSizes` into the existing `images` block (kept `remotePatterns`).
  Did NOT add `cacheComponents`/`ppr` (REQ-5 deferred). Did NOT port `swcMinify`,
  `webpack.splitChunks`, the `/api`+`/_next/static` `headers()`, or the Turbopack SVG rule.
- `next.config.optimization.js` (REQ-7): deleted. Confirmed absent.
- `tsconfig.json` (REQ-8): `compilerOptions.target` `"ES2017"` → `"ES2022"`.
  `lib`/`module`/`moduleResolution` unchanged.
- `src/proxy.ts` (REQ-10): manual rename `export const config` → `export const proxyConfig`.
- `package.json` + `pnpm-lock.yaml`: added devDependency `babel-plugin-react-compiler@1.0.0`.

**React Compiler config decision (REQ-4).** Verified against the installed Next 16.1.1
config schema (`node_modules/next/dist/server/config-schema.js`): `reactCompiler` is a
**top-level** key in v16 (stabilized out of `experimental` — the old `optimization.js`
had `experimental.reactCompiler`, the Next 15-era location). Next 16.1.1 hard-throws
`"Failed to load the babel-plugin-react-compiler ... It is required to use the React
Compiler. Please install it."` (`get-babel-loader-config.js`) when `reactCompiler: true`
and the plugin is absent — so the dep is required. Installed `babel-plugin-react-compiler@1.0.0`
(stable `latest`; depends only on `@babel/types ^7.26`; no peer constraints). The clean
build with `reactCompiler: true` is therefore positive proof the compiler is engaged.

**REQ-10 codemod decision.** Used a manual rename rather than `npx @next/codemod@latest
upgrade`: that codemod is interactive AND would bump Next past the pinned 16.1.1. The only
expected effect here is the proxy export rename, which the manual edit achieves. Build
output shows `ƒ Proxy (Middleware)`, confirming the proxy is still picked up.

**SVG rule.** Re-confirmed no `@svgr`/`*.svg`-as-component usage → Turbopack SVG rule not ported.

**Verification — full `./init.sh` (with build) GREEN.** Key lines:
```
✓ typecheck clean
Found 35 warnings.
✓ lint clean              (35 unchanged noUnusedImports/noExplicitAny warns — F2 targets)
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 2.4s
✓ Generating static pages using 9 workers (13/13)
ƒ Proxy (Middleware)
✓ build succeeds
✓ Harness ready — baseline is green.
```
`test ! -f next.config.optimization.js` → confirmed absent. `src/proxy.ts` exports `proxyConfig`.

**features.json:** F0/F1 left `in_progress` (NOT set to `done`) — leader transitions to
`done` only after reviewer sign-off. Handing to reviewer.

---

## 2026-05-26 — Naming standardization (F2 slice, pulled forward)

User-driven, done by leader directly (not via the F0+F1 implementer, since it is
outside the approved F0+F1 spec). User first renamed `NormattivaManager` →
`NormativaManager` manually (introduced double-quote formatting that briefly reddened
lint; fixed with `biome format`). User then asked to standardize all component names
to English.

**Decision (user, 2026-05-26):** English for code identifiers; **keep Spanish for
UI copy and route URLs**. Applied now, before the F0+F1 implementer runs.

**Renames (identifiers only — bare Spanish UI text + `/cruces`, `/normativa` URLs untouched)**
- `Cruces*` → `Playoff*`: `CrucesBracket`→`PlayoffBracket` (file `cross/CrucesBracket.tsx`
  → `PlayoffBracket.tsx`), `CrucesDataProvider`→`PlayoffDataProvider`,
  `CrucesPage`→`PlayoffPage`, `CrucesError`→`PlayoffError` (+ `*Props`). Log tag
  `[Cruces Error]`→`[Playoff Error]`.
- `Normativa*` → `Regulations*`: `NormativaManager`→`RegulationsManager` (file renamed),
  `NormativaPage`→`RegulationsPage` (+ `*Props`).
- Typo: dir `components/home/TorunamentFormat/` → `TournamentFormat/` (import in
  `app/page.tsx` fixed). File inside was already `TournamentFormat.tsx`.

**Glossary established:** Cruces ↔ Playoff, Normativa ↔ Regulations. Future code uses
the English identifier; UI strings + URLs stay Spanish.

**Verification:** `./init.sh --quick` green (typecheck clean — all refs resolve; lint
0 errors / 35 warnings, unchanged). `features.json` F2 naming sub-items marked DONE;
rest of F2 still pending (depends on F1).

---

## 2026-05-26 — Batch 1 (F0+F1) approved → in_progress

Leader transition. User approved the F0+F1 spec at the gate, with three scope
decisions captured below. F0 and F1 set `spec_ready` → `in_progress`.

**Approved scope decisions (user, 2026-05-26)**
- **REQ-3 (atomic season RPC) — DEFERRED.** Optional/low-risk; needs Supabase
  migration access. F0 ships only the client-redirect fix. Re-spec later.
- **REQ-5 (PPR / `cacheComponents`) — DEFERRED to F4/F5.** Next 16.1.1 ships PPR as
  Cache Components (`cacheComponents: true`), which is strict — dynamic reads must be
  inside `<Suspense>` (F5) and use the `'use cache'` model (F4). Enabling it in F1
  would break the build. Threaded into F4's items.
- **REQ-9 (`noExplicitAny: error`) — DEFERRED to F2.** Confirmed live `any[]` in
  `SplitDataProvider.tsx:243-244`. Flipping now turns lint red. Threaded into F2's items.
- **Execution mode:** user chose the SDD agent workflow (implementer → reviewer),
  orchestrated by the leader (main thread).

**F1 in-scope after deferrals:** REQ-4 (React Compiler), REQ-6 (WebP/AVIF + image
sizes), REQ-7 (delete `next.config.optimization.js`), REQ-8 (ES2022), REQ-10
(`proxyConfig` rename). REQ-5/REQ-9 removed from this batch.

**Pre-flight findings (leader)**
- `babel-plugin-react-compiler` is **not** installed (not in `package.json` /
  `node_modules`) — implementer installs it if the build requires it for REQ-4.
- No `@svgr` / `*.svg`-as-component usage → the Turbopack SVG rule from
  `optimization.js` is **not** ported.
- `next.config.optimization.js` carries Next 12/13 cruft (`swcMinify`,
  `webpack.splitChunks`, `/api`+`/_next/static` headers) — not ported per `design.md`.

**Baseline greened**
- Was red: `pnpm lint` reported 2 formatting errors (+35 warnings). Ran
  `biome format --write .` → fixed 2 files (`NormattivaManager.tsx`,
  `routes.ts`), cosmetic only. The 35 warnings are non-failing
  (`noUnusedImports`/`noExplicitAny`), all in F2 targets — left for F2.
- `./init.sh --quick` now **green** (typecheck clean · lint 0 errors / 35 warnings ·
  build skipped). Known-good baseline established for the implementer.

**Spec amended** to record the deferrals: `requirements.md` (DEFERRED banners on
REQ-3/5/9), `tasks.md` (scope block + narrowed checklist), `features.json`
(`deferred[]` on F0/F1; inherited items on F2/F4).

**Next action:** invoke `implementer` against the approved, narrowed `specs/`.

---

## 2026-05-26 — Harness bootstrapped

Generated the engineering harness (skill: `harness-builder`) for the Architecture
Review initiative.

**Created**
- `init.sh` — guardian (tooling · deps · env · typecheck · lint · build; tests skipped, none yet).
- `features.json` — backlog of Fase 0–6 from `ARCHITECTURE_REVIEW.html`. Active batch: F0, F1 (`spec_ready`).
- `specs/requirements.md` (EARS) · `specs/design.md` · `specs/tasks.md` — F0 + F1.
- `.claude/agents/` — `leader`, `spec-author`, `implementer`, `reviewer`.
- `docs/conventions.md` — patterns extracted from the codebase.
- Rewrote `CLAUDE.md` (155 → ~70 lines): corrected stale "static template / `app/`" description to the real `src/` + Supabase + Next 16 architecture.

**Verified against source (not just the review)**
- `LeagueInfo` divergence is real: `schemas.ts:80` infers `tier_name`/`tier_priority`; `queries.types.ts:83` uses `tierName`/`tierPriority`.
- `src/app/admin/page.tsx:31` calls `redirect()` in a client handler — confirmed bug.
- `src/lib/data/fetchData.ts` mixes `unstable_cache` + `react.cache`, tag `['matches']` never revalidated — confirmed.
- Stack confirmed: Next.js **16.1.1**, React **19.2.3**.

**Baseline check (`./init.sh --quick`)**
- Typecheck: ✅ clean (`tsc --noEmit`).
- Lint: ❌ `pnpm lint` (`biome check .`) reports **2 errors + 35 warnings**. The 2 errors
  are **formatting-only** (auto-fixable); the 35 warnings are `noUnusedImports` /
  `noUnusedVariables`, mostly in F2 dead-code targets (`PerformanceMonitor.tsx`,
  `useOptimizedFetch.ts`, `fetchData.ts`, `matchService.ts`).
- Build: not run yet (`--quick`).
- **Implication:** baseline is not green. Quickest path: `pnpm check` (auto-fix format +
  safe lint). Most warnings dissolve naturally when F2 deletes the dead files. Decision
  on whether to green it now vs. during F2 left to the user.

**Open decisions / notes**
- REQ-9 (`noExplicitAny: error`) may need F2 first if existing `any` breaks lint — decide at implementation time.
- REQ-5: confirm whether Next 16.1.1 PPR is `experimental.ppr` or Cache Components (`cacheComponents`) before editing `next.config.ts`.

**Next action:** present `specs/` (F0+F1) to the user for approval, then hand to `implementer`.

---

## 2026-05-27 — Pixel redesign initiative + FR0 shipped

New initiative `pixel-redesign` from `docs/design_handoff_calmind_pixel/` (Claude
Design handoff). Analysed the bundle against the real codebase + Supabase schema.

**Key findings (analysis)**
- The handoff README assumes **Vite + React Router + client hooks + Tailwind v3**;
  the repo is **Next 16 App Router + RSC + Tailwind v4**. All stack guidance translated.
- Data gaps vs Supabase: trainers have **no** real name / region / ELO / color;
  no `current_round`/`tournament_state`; News, Story Beat, Olimpo countdown are
  fictional in the prototype. `matches.metadata` (jsonb) shape unknown.
- Three conflicting `match_tag` vocabularies (constants/matches.ts vs
  TOURNAMENT_FLOW.md vs handoff) — flagged for reconciliation in FR7.
- Tension: existing `lives` survival mechanic vs design's position-based zones.

**Decisions locked with user (2026-05-27)**
1. Routing → full new IA (`/hub`, `/hub/*`, `/archivo/:season/:split`); legacy
   `[season]/[split]` becomes archive detail (FR9, with 301s).
2. Trainer data → nickname + avatar + bio only; **color hashed from id**. No ELO/region/name.
3. `current_round` → derived from matches (max played round). No DB change.
4. Editorial → auto-generated from data; countdown hidden when no date. No new tables.

**Persisted**
- `features.json`: added `initiatives` map + FR0–FR10 track. activeBatch → `FR1`
  (FR0 done). Architecture-review F2–F6 untouched.
- `specs/redesign/{requirements,design,tasks}.md` — FR0 batch (kept separate from
  the root F0/F1 specs to avoid coupling initiative lifecycles).

**FR0 — Visual foundation (DONE, `./init.sh` full green)**
- **Root cause fixed:** the handoff prototype JSX/CSS made `biome check .` report 54
  errors (src alone = 0). Excluded `docs/design_handoff_calmind_pixel` in `biome.json`
  (folder pattern, no `/**` — `useBiomeIgnoreFolder`).
- `theme.css`: namespaced `--color-px-*` palette + `--font-pixel/retro/num` tokens.
- `layout.tsx`: load VT323 + JetBrains Mono via next/font; vars on `<body>`.
- `src/app/styles/pixel.css`: scanlines/vignette/starfield/crt/blink/glitch/marquee/
  pixel-frame/borders/card/badge/btn/hpbar/title-stack — **all scoped under `.pixel-root`
  or via opt-in class names**, so legacy purple pages are unchanged. Imported in globals.css.
- `components/shared/ui/pixel/`: `PixelGrid` (shared ASCII→SVG renderer), icons
  (`PixelIcons`), `MonsterSprite`, `TrainerAvatar`, `PixelCard`, `PixelBadge`,
  `PixelButton`, barrel `index.ts`. All RSC (hover is CSS), typed, lint-clean.
- Verification: `./init.sh` full = typecheck clean · lint 0 errors (35 pre-existing F2
  warnings remain) · production build succeeds · all existing routes build unchanged.

**Open / deferred to later FRs**
- FR1: `phase.ts` (`getPhase`), `getCurrentRound(splitId)`, `trainerColor(id)` hash, PhaseProvider.
- FR3/FR4: decide how `lives` coexists with position zones in standings.
- FR5: per-round date source.
- FR7: reconcile the 3 `match_tag` vocabularies against real DB data.

**Next action:** spec + implement FR1 (phase machine + active context) when the user
gives the go.

---

## 2026-05-27 — FR1 shipped (phase machine + active context)

Spec appended to `specs/redesign/` (FR1 batch). `./init.sh` full green.

**Correction logged:** `current_round` derives from the max `played` round across
**all** match groups, not just `regular` (FR0 spec text said "regular" — that would
cap at 14 and the phase could never reach J15/J16/Olympus). User's locked decision
("derive from matches, max played round") honored.

**Shipped**
- `src/lib/utils/phase.ts`: `getPhase` (OFFSEASON/REGULAR/FINALS_J15/FINALS_J16/OLYMPUS,
  Spanish labels, `--color-px-*` accents, glyph icons), `isFinalsUnlocked`,
  `progressPct`, `TOTAL_ROUNDS=16`, `FINALS_START_ROUND=15`. Pure, JSX-free.
- `src/lib/queries/tournament.queries.ts`: `getCurrentRound(splitId)` — `react.cache`,
  max played round (all groups), returns 0 + logs `[getCurrentRound] Error:` on failure.
  Exported from `queries/index.ts`.
- `src/lib/utils/trainerColor.ts`: deterministic id → 8-color palette hash (raw hex,
  since the palette has orange/purple outside the px token set; feeds `TrainerAvatar`).
- `src/components/providers/PhaseProvider.tsx` (`'use client'`): context + `usePhase()`
  (throws outside provider). Holds round in state seeded from `initialRound`, exposes
  setter for FR10 realtime, `useMemo` derivations, `useEffect` resync on split switch.
  NOT in the `shared` barrel — keeps the client boundary explicit.

**Known limitation (note, not a bug):** finals nav will unlock only once a J15 result
is recorded, not when the admin generates J15 fixtures. Refine to "J15 matches exist"
in FR7 when the bracket consumes match rows.

**Verification:** `./init.sh` full = typecheck clean · lint 0 errors (35 pre-existing
F2 warnings) · production build succeeds · all existing routes build unchanged.

**Next action:** FR2 (TopBar shell + Season/Split chip + phase chip + marquee + nav
gating) when the user gives the go. FR2 is the first FR that renders visible UI and
consumes `PhaseProvider` + `getCurrentRound`.

---

## 2026-05-27 — FR2 shipped (redesign shell on /hub)

First visible UI. New `/hub` segment with a shell layout; FR3 fills the dashboard.
`./init.sh` full green; `/hub` in the route manifest.

**Shipped**
- `src/app/hub/layout.tsx` (RSC): parallel `getActiveSeasonWithSplit` +
  `getCurrentRound` + `getAllSeasonsWithSplits` + `getDivisionPreview`; wraps content
  in `PhaseProvider` → `.pixel-root .scanlines` → `TopBar` + `MarqueeStrip` + `<main>`.
  Auto-generates marquee items (phase, round, D1/D2 leaders, finals-lock).
- `src/app/hub/page.tsx`: FR3 placeholder.
- `getAllSeasonsWithSplits()` (seasons.queries.ts, one query) + export.
- `ROUTES` extended with hub + archive routes; `HUB_NAV` constant.
- `components/shared/layout/hub/`: `TopBar` (sticky, scroll→backdrop), `SeasonSplitChip`
  (dropdown, active→/hub vs past→/archivo), `PhaseChip` (`usePhase`, progress), `HubNav`
  (`usePathname` active + `usePhase` gating, 🔒 + tooltip), `MarqueeStrip` (RSC).
- `.pixel-root` gained `width: 100%` so it spans the flex-centered `body`.

**Design notes**
- Tailwind v4 generates utilities from FR0 tokens (`bg-px-*`, `text-px-*`,
  `border-px-*`, `font-pixel/retro/num`) — used directly; `pixel.css` keeps the
  composite patterns (`pixel-btn*`, `.marquee-track`).
- `clouds.css:111` forces `body > *` above the clouds; `.pixel-root` is opaque, so it
  covers them with no root-layout change. The legacy `Footer` still shows below `/hub`
  (interim) — pixel footer + clouds suppression deferred to the legacy→/archivo migration.

**Interim (not bugs)**
- Only `/hub` resolves; other nav targets (clasificacion/calendario/bracket/olimpo/
  archivo) 404 until FR4/FR5/FR7/FR8/FR9. Redesign isn't linked from the live site yet.

**Verification:** `./init.sh` full = typecheck clean · lint 0 errors (35 pre-existing
F2 warnings) · build succeeds · `ƒ /hub` in manifest · legacy routes unchanged.

**Next action:** FR3 — the Hub master dashboard (phase banner, story beat, dual live
standings with zones + streak pips, projected bracket teaser, right column feed,
news rail). Consumes `getDivisionPreview` + `getMatchesByRound` + `usePhase` and the
FR0 primitives. It's the biggest screen and the first DECIDE point (lives vs zones).

---

## 2026-05-27 — FR3 shipped (Hub master dashboard)

`./init.sh` full green; 14 pages built. Replaced the FR2 placeholder.

**DECIDE resolved (user, 2026-05-27):** standings show position-based zones for the
row accent **and** lives as a secondary `♥` indicator (not zones-only, not lives-first).

**Architecture note:** FR3 sections are all Server Components fed by server-resolved
data; phase-dependent visuals read the server `currentRound`/`phase` rather than
`usePhase`. Live (no-reload) repaint is deferred to FR10 holistically — keeps FR3
RSC-first and faster.

**Shipped**
- `src/lib/utils/standings.ts`: `zoneForPosition` (1–4/5–6/7–8 → gold/neutral/red),
  `ZONES`, `recentStreak` (W/L from played matches). Zone thresholds assume 8-player
  divisions (the league format).
- `src/lib/utils/editorial.ts`: `buildStoryBeat`, `buildNews` — derive headlines from
  standings (locked editorial decision; no tables/constants).
- `src/components/hub/`: `PhaseBanner` (16-cell progress strip), `StoryBeat`,
  `StandingsLive` (dual panels, zones + streak + `♥` lives, rows → trainer profile),
  `ProjectedBracketTeaser` (#1v#2 + projected Olimpo line), `HubRightColumn` (live feed
  / last results with crown / Olympus projection card w/ starfield + MonsterSprites),
  `NewsRail`, barrel.
- `app/hub/page.tsx`: composes sections in a 1fr/340px grid; graceful offseason empty
  state when no active split.

**Interim (not bugs)**
- Standing rows + teaser link to `/hub/entrenador/:id` and `/hub/bracket` (FR6/FR7) —
  404 until those FRs.
- Olimpo projection uses primera pos-7 vs segunda #1 (rough, explicitly "proyectado").

**Verification:** `./init.sh` full = typecheck clean · lint 0 errors (35 pre-existing
F2 warnings) · build succeeds (14 pages) · legacy routes unchanged.

**Next action:** FR4 — full standings page `/hub/clasificacion` (both divisions,
PG/PP derived from `player_match_performance`, streak, zone cards; ELO/region omitted).

---

## 2026-05-27 — FR4 shipped (Clasificación /hub/clasificacion)

`./init.sh` full green; `/hub/clasificacion` in manifest (15 pages).

**Decision:** PG/PP derived from match set-scores (`winLossRecord`) rather than a new
`player_match_performance` query — the match rows are already fetched and give the
same win/loss result, avoiding an extra round-trip. ELO/region/real-name columns
dropped (no DB backing, per locked decision).

**Shipped**
- `standings.ts`: `winLossRecord`, `StandingRowVM`, `buildStandingRows`.
- `components/hub/`: `HubPageHeader` (reusable eyebrow+title), `ZoneCards`,
  `ClasificacionView` (`'use client'` tabs + full table; ★ #1, avatar+nickname,
  PG/PP/PT, 5 streak pips, zone chip; rows → `/hub/entrenador/:id`).
- `app/hub/clasificacion/page.tsx` (server: builds both divisions' rows).

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (15 pages) ·
legacy routes unchanged.

**Next action:** FR5 — calendar `/hub/calendario` (round timeline + per-round match
listings from `getMatchesByRound`). DECIDE point: per-round date source (derive vs omit).

---

## 2026-05-27 — FR5 shipped (Calendario /hub/calendario)

`./init.sh` full green; `/hub/calendario` in manifest (16 pages).

**DECIDE resolved (default, flagged to user):** the `matches` table has no scheduled
date per round (only `created_at`). Rather than fabricate dates, the calendar shows
the known weekly cadence ("Domingo · 18:00 CEST") + jornada + phase. Real dates would
need a `scheduled_at` column — offered to the user as a future enhancement.

**Shipped**
- `components/hub/CalendarView.tsx` (`'use client'`): horizontal 16-round timeline
  (phase-colored, current blinks, future dimmed), focus-a-round state, detail panel
  with D1/D2 match columns (color dot + handle, score or "vs", crown on winner),
  phase legend. Finals rounds (no regular matches) link to the bracket.
- `app/hub/calendario/page.tsx` (server: `getMatchesByRound` + `getCurrentRound`).

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (16 pages) ·
legacy routes unchanged.

**Next action:** FR6 — roster `/hub/entrenadores` + profile `/hub/entrenador/[id]`
(from `getParticipantsBySplit` + per-trainer matches; team-reveal slots stay locked).

---

## 2026-05-27 — FR6 shipped (Roster + Profile)

`./init.sh` full green; `/hub/entrenadores` + `/hub/entrenador/[id]` in manifest (17 pages).

**Shipped**
- `queries/trainers.queries.ts`: `getTrainerById` (nickname/avatar/bio) + export.
- `standings.ts`: `spriteVariant`, `buildRosterCards`/`RosterCardVM`,
  `trainerRecentMatches`/`RecentMatchVM`.
- `components/hub/RosterView.tsx` (`'use client'`): TODOS/D1/D2 filter pills + card grid
  (division badge, tinted MonsterSprite, nickname, PG/PP/PT/J footer; card border in the
  trainer's signature color, hover lift).
- `components/hub/TrainerProfile.tsx` (RSC): tinted hero + MonsterSprite, division/
  position/leader badges, 5 stat tiles (PG/PP/PT/Winrate/Vidas), locked team slots
  ("?", revealed J16), recent history with W/L stripe, real `trainers.bio`.
- `app/hub/entrenadores/page.tsx` + `app/hub/entrenador/[id]/page.tsx` (dynamic;
  `generateMetadata`; `notFound()` when the trainer id is unknown).

**Adjustments:** ELO/region/real-name omitted (no DB). Team-reveal slots locked — no
`matches.metadata` shape defined. Profile gracefully degrades if the trainer isn't in
the active split (no division/stats, still shows bio).

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (17 pages) ·
legacy routes unchanged.

**Next action:** FR7 — Bracket `/hub/bracket` (the most complex screen). First task is
the `match_tag` reconciliation DECIDE: the working code in `matchService.ts` uses
`semi_1/2`, `survival_1/2`, `grand_final`, `3rd_place`, `relegation_battle`… while the
handoff/TOURNAMENT_FLOW use other names. Need to confirm the real DB tags before wiring
official matches.

---

## 2026-05-27 — FR7 shipped (Bracket /hub/bracket)

`./init.sh` full green; `/hub/bracket` in manifest (18 pages).

**DECIDE resolved (match_tag vocabulary):** the live DB tags are what the existing
`matchService` + `SplitDataProvider` finals page consume — confirmed by reading that
working code, not the handoff/TOURNAMENT_FLOW docs. Canonical set:
- J15 (both divisions): `semi_1`, `semi_2`, `survival_1`, `survival_2`.
- J16 D1: `grand_final`, `3rd_place`, `relegation_battle`, `honor_battle`.
- J16 D2: `segunda_final`, `opportunity`, `last_chance`, `honor_segunda`.
The handoff names (`third_place`, `fifth_place`, `relegation_final`, `olympus`,
`promotion_playoff`) are NOT in the DB. FR7 reuses the proven matchService helpers.

**Shipped**
- `queries/bracket.queries.ts`: `getBracketData(splitId)` — leagues + rounds 15/16
  matches with trainer joins (typed via `unknown` cast, no `any`); + export.
- `services/bracketService.ts`: `buildDivisionBracket(ranks, j15, j16, leagueId, div)`
  — division-parameterized tag map; reuses `buildJ15Matchups`/`getFromJ15Match`/
  `getJ16Match`; degrades to projected (rankings) when no matches.
- `components/hub/BracketView.tsx` (RSC): per-division TOP-4 (gold) + BOTTOM-4 (red)
  lanes, J15→J16 columns with `PixelArrow` connectors, projected/official badges,
  winner highlight + crown, and the Olympus junction (starfield, → /hub/olimpo).
- `app/hub/bracket/page.tsx`.

**Interim:** Olympus junction is a teaser → /hub/olimpo; exact competitor derivation
(D1 survivor vs D2 champion — the handoff's corrected narrative vs the live app's
"perdedor relegation vs ganador opportunity") is deferred to FR8. Finals (J16) winner
rows have no trainerId from matchService, so no color swatch/link on those (semis do).

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (18 pages) ·
legacy routes unchanged.

**Next action:** FR8 — Olimpo `/hub/olimpo` (hero + countdown hidden w/o date,
face-off, el camino, stakes, past-Olimpos archive). DECIDE: exact Olympus competitor
derivation from finals winners.

---

## 2026-05-27 — FR8 shipped (El Olimpo /hub/olimpo)

`./init.sh` full green; `/hub/olimpo` in manifest (19 pages).

**Decisions/adjustments:** countdown hidden (no event date in DB); ELO/motto/títulos
omitted (no data). Competitors are PROJECTED from standings (D1 survivor ≈ pos-7, D2
champion ≈ #1) — consistent with the hub/teaser projection. Exact official-winner
derivation is DEFERRED: the Olympus narrative is contested (handoff = D1 relegation-final
winner vs D2 grand-final winner; live app = relegation loser vs opportunity winner) and
no confirmed `olympus` match tag exists in the live DB tag set. Past-Olimpos archive grid
omitted for the same reason.

**Shipped**
- `components/hub/OlimpoView.tsx` (RSC): starfield hero + OLIMPO wordmark + projection
  badge; face-off ChampionCards (role, MonsterSprite, Pos/PT/WR/Vidas) flanking a
  lightning VS; El Camino RoadCards (J1–14/J15/J16/POST); Stakes cards (Ascenso/Defensa).
- `app/hub/olimpo/page.tsx` (builds projected champion VMs).

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (19 pages) ·
legacy routes unchanged.

**Next action:** FR9 — Archive `/archivo` + `/archivo/[season]/[split]` (derived from
seasons/splits + finals; 301 redirects from legacy `[season]/[split]`,`/cruces`,`/final`).
Open question raised by user: landing `/` reskin is not in FR0–FR10 — propose FR11.

---

## 2026-05-27 — FR11 added to backlog (Landing + go-live)

User asked when the landing `/` gets reworked — it was missing from FR0–FR10. Added
**FR11 — Landing + go-live**: reskin `/`, point primary nav to /hub, 301-redirect legacy
routes to /archivo, pixel footer. Scheduled LAST (depends on FR9) so redirects have a
destination. User chose order: finish FR9 → FR10 → then FR11.

## 2026-05-27 — FR9 shipped (Archivo)

`./init.sh` full green; `/archivo` + `/archivo/[season]/[split]` in manifest (20 pages).

**Refactor:** extracted the shell into `components/shared/layout/hub/PixelShell.tsx`
(data + PhaseProvider + TopBar + marquee + main). Both `app/hub/layout.tsx` and the new
`app/archivo/layout.tsx` delegate to it, so /archivo carries the same TopBar nav.

**Shipped**
- `queries/archive.queries.ts`: `getArchiveChampions()` — one query, all `grand_final`
  (D1) + `segunda_final` (D2) winners → `Map<splitId, {d1,d2}>`. + export.
- `components/hub/ArchiveView.tsx` (RSC): seasons newest-first; active split card
  (● EN CURSO → ENTRAR AL HUB) vs past split card (champions + VER SPLIT → detail).
- `app/archivo/page.tsx` (builds season/split VMs with champions + active flag).
- `app/archivo/[season]/[split]/page.tsx`: champion panels (D1/D2) + final podium
  (top-3 each, via `getDivisionPreview` of the past split). `notFound()` if unresolved.

**Decisions/adjustments:** no `olympus` match in DB → no cross-league winner in the
archive (champions only). Season signature color omitted (no DB) — neutral border.
**301 redirects DEFERRED to FR11** (the go-live), so the legacy `[season]/[split]`,
`/cruces`, `/final` keep working while the redesign is built in isolation.

**Build cache note:** a stale `.next/dev/types/validator.ts` (from an earlier `pnpm dev`)
broke `tsc` with a typed-routes mismatch on `/archivo`. Fixed by `rm -rf .next` before
the guardian; the route itself is valid.

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (20 pages) ·
legacy routes unchanged.

**Next action:** FR10 — Realtime + polish (Supabase subscriptions on matches/rankings →
update PhaseProvider round without reload; scrollTo(0,0) on route change; polish pass).

---

## 2026-05-27 — FR10 shipped (Realtime + polish)

`./init.sh` full green; 20 pages.

**Shipped**
- `components/shared/layout/hub/ShellClientEffects.tsx` (`'use client'`, renders null):
  scroll-to-top on `usePathname` change; Supabase Realtime channel on `matches` +
  `league_participants` → `router.refresh()`, which re-runs the RSC tree and re-seeds
  `PhaseProvider.initialRound`, so the phase + standings + feed mutate live without a
  reload (README §Realtime). Mounted in `PixelShell`.
- `prefers-reduced-motion` already neutralizes the stepped animations (FR0 pixel.css).

**Lint note:** `useExhaustiveDependencies` flagged `pathname` as the scroll-trigger dep;
kept it with an explicit `biome-ignore` (removing it would break the behavior).

**Verification:** typecheck clean · lint 0 errors (35 pre-existing) · build (20 pages).

**Status: FR0–FR10 DONE.** The full pixel redesign exists in isolation under /hub +
/archivo; the live site (`/`, `[season]/[split]`, `/cruces`, `/final`) is untouched and
nothing links to the redesign yet.

**Next action:** FR11 — Landing + go-live. Reskin `/`, point nav to /hub, 301-redirect
legacy routes. The redirect/retirement strategy needs a user decision (hard-to-reverse,
outward-facing) before executing.

---

## 2026-05-27 — FR11 shipped (Landing + go-live) — PIXEL REDESIGN COMPLETE

User chose "corte completo" (full cutover) and to proceed without a prior visual review.
`./init.sh` full green; 20 pages.

**Shipped**
- `components/landing/BattleScreen.tsx` (`'use client'`): animated Game Boy battle text
  (brand moment, README §Fidelity), data-driven names.
- `components/landing/PixelLanding.tsx` (RSC): hero (badges, CALMIND SERIES wordmark,
  CTAs, live stats, Game Boy device) · snapshot (D1/D2 leaders + D1 exile → trainer) ·
  format brief (4 phase cards + scoring) · Olimpo teaser · Join CTA.
- `app/page.tsx`: replaced the legacy home with the pixel landing (own `.pixel-root`,
  no TopBar — slim brand entry; degrades gracefully with no active split).
- Footer: link now → /hub (dropped the unused active-season fetch).

**Go-live cutover (legacy routes retired → redirects):**
- `app/[season]/[split]/page.tsx` → active split → /hub, past → /archivo/:season/:split.
- `app/[season]/[split]/cruces` + `final` → active → /hub/bracket, past → archivo.
- `app/[season]/page.tsx` → /archivo.
- **Used temporary `redirect()` (307), not permanent (308/301):** a given
  `[season]/[split]` URL's correct target flips from /hub to /archivo when the split
  stops being active, so a permanent (cacheable) redirect would be wrong. Noted for the
  user (they asked for "301"; temporary is the correct semantics here).

**Deferred polish (not blocking):** pixel-styled global Footer (still the legacy purple
footer at the bottom of pixel pages; replacing it touches admin). Legacy components
(Hero/TournamentFormat/AboutCalmind/CurrentSeason/Navbar + divisions/cross bracket
components) are now dead code — cleanup belongs to architecture-review F2/F6, not here.

**Verification:** typecheck clean · lint 0 errors (30 pre-existing F2 warnings) ·
build (20 pages) · admin untouched.

---

## 2026-05-27 — Pixel redesign initiative DONE (FR0–FR11)

The full redesign from `docs/design_handoff_calmind_pixel/` shipped across FR0–FR11,
each batch verified green by `./init.sh`. The site now boots into the pixel landing at
`/`, runs the phase-aware Hub at `/hub/*`, the time-machine at `/archivo/*`, and redirects
all legacy public routes. `activeBatch` cleared. Remaining non-redesign work is the
architecture-review backlog (F2–F6), a separate initiative, still pending.

Working tree is uncommitted (user requested no commits during the build).

---

## 2026-05-27 — Admin pixel reskin started (FR12 marco + primitives)

User asked to adapt `src/app/admin/` to the pixel aesthetic, chose FULL scope (marco +
all 7 management screens) + pixel nav icons. The admin was on the OLD palette
(`jacksons-purple`/`retro-gold`/`snuff`, `#1a1a1a` borders, `shadow-[4px..]` 3D, sans
font) — the only non-pixel public area left. Batched: FR12 marco+primitives, FR13 small
screens, FR14 big screens. **Logic untouched** (Supabase/forms/router.refresh).

**FR12 shipped (marco + primitives, `./init.sh` full green):**
- `pixel.css`: `.pixel-btn--cyan/--success/--danger` + `.pixel-input` + `.pixel-table`.
- `PixelIcons`: new `PixelUsers`, `PixelDoc`, `PixelGear` glyphs (10×10) for the nav.
- `components/admin/ui/`: `AdminCard`, `AdminButton` (tone variants), `AdminInput`/
  `AdminSelect`/`AdminTextarea`, `AdminModal`, `AdminBadge`, `AdminErrorBanner` + barrel.
  Presentational (handlers passed by the client Managers).
- Shell reskinned to pixel + wrapped in `.pixel-root`: `admin/page.tsx` (login),
  `admin/dashboard/layout.tsx` (sidebar with pixel icons + topbar), `dashboard/page.tsx`
  (home), `settings/page.tsx`, and all four `loading.tsx`/`error.tsx`.
- Lint note: a `biome-ignore` on AdminButton's `type` was an *unused* suppression
  (`type={type}` with a typed union passes `useButtonType`) — removed.

**Verification:** typecheck clean · lint 0 errors (30 pre-existing F2 warnings, now incl.
dead imports in matchService/SplitDataProvider from the FR11 legacy-route redirects) ·
build (20 pages).

**Pending:** FR13 — reskin SeasonsManager/SplitsManager/DivisionsManager/
RegulationsManager. FR14 — ParticipantsManager (1021) + MatchesManager (1624).

## 2026-05-27 — FR13 shipped (admin small screens)

`./init.sh` full green. Reskinned to pixel primitives, **logic untouched** (hooks,
Supabase calls, router.refresh preserved verbatim):
- `SeasonsManager`, `SplitsManager`, `DivisionsManager` — header + selectors,
  `AdminModal` create forms, `pixel-table` data tables, `AdminBadge` status,
  `AdminButton` actions. Header season/split selectors use a `pixel-input` `<select>`.
- `RegulationsManager` — `AdminCard` upload form, styled file input, success banner,
  current-PDF card with a `pixel-btn--cyan` link.

**Verification:** typecheck clean · lint 0 errors (30 pre-existing) · build (20 pages).

**Pending:** FR14 — the two big screens: `ParticipantsManager` (1021 lines) and
`MatchesManager` (1624 lines). Largest/most complex CRUD UIs; reskin to the admin
pixel primitives, logic untouched.

## 2026-05-27 — FR14 partial (ParticipantsManager done; MatchesManager pending)

Split across sessions for credit budget (user had ~25% left, enough for one big screen).

**ParticipantsManager (DONE, `./init.sh` full green):** reskinned to admin pixel
primitives, **logic verbatim** (tabs trainers/assignments, search + pagination,
season/split/league selectors, trainer CRUD modal, assignment modal, lives +/- with
pending-change batching + save/discard, remove). Internal helpers `TabButton`,
`SelectorField`, `TrainerAvatar` (keeps `<img>` — `noImgElement` is off), `EmptyPanel`.
Verification: typecheck clean · lint 0 errors (30 pre-existing) · build (20 pages).

**MatchesManager (1624) — PENDING:** deferred to a fresh session. It's the last
non-pixel admin screen; reskin to the admin pixel primitives, logic untouched.

## 2026-05-28 — FR14 complete (MatchesManager) — ADMIN PIXEL RESKIN DONE

`./init.sh` full green. The last non-pixel admin screen is reskinned. Logic verbatim:
results tab, planning tab, result editing inline, match form modal, J15/J16
generators (rankings → semis/survival; J15 winners/losers → J16 with division-specific
tags `grand_final/3rd_place/relegation_battle/honor_battle` for Primera and
`segunda_final/opportunity/last_chance/honor_segunda` for Segunda), El Olimpo notice.

**Internal helpers** to keep the file readable: `TabButton`, `SelectorField`,
`TrainerAvatar`, `EmptyPanel`, `ResultRow` (custom flex layout for the Results tab
match rows with inline score editing), `MatchesTable` + `PlanningMatchesTable`
(reused for J15/J16 grouped tables and regular-round tables).

**Verification:** typecheck clean · lint 0 errors (30 pre-existing F2 warnings) ·
build (20 pages) · admin routes unchanged in count, all reskinned.

**Status: admin pixel reskin DONE.** Marco (FR12) + small screens (FR13: Seasons,
Splits, Divisions, Regulations) + big screens (FR14: Participants, Matches). The
entire admin now uses the pixel design system. Working tree uncommitted as per the
user's standing instruction. `activeBatch` cleared.

Remaining non-redesign work: the architecture-review backlog (F2–F6), a separate
initiative, still pending.
