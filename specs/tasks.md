# Tasks — Batch F4: Cacheo coherente (RESPEC #3)

Atomic checklist for the Implementer. Sections map 1:1 to REQs in
`requirements.md`. Run `./init.sh` BETWEEN every Wave-A REQ and BETWEEN
every Wave-C REQ. Wave B is **atomic** — `./init.sh` may go red during
internal iteration, but the COMMIT is one at the end of the wave.

> **Sections 1–3 are DONE in `main`** (REQ-30/31/33). DO NOT execute them.
> Pending work starts at Section 4 (Wave A — REQ-32 verify + REQ-43 +
> REQ-44).

---

## 0. Pre-flight (no commits)

- [ ] `cd /Users/diego/Developer/calmind-series` and confirm
      `git status` shows the spec-author changes ONLY (no Manager/admin
      drift since REQ-33 shipped).
- [ ] Run `./init.sh` once to confirm BASELINE GREEN (post-REQ-33, before
      Wave A). Expect: typecheck 0 errors, lint 0 errors / 0 warnings,
      build 23 pages, `/hub/*` `ƒ Dynamic`, `/archivo/[season]/[split]`
      `●` with ≥3 prerendered URLs, `cacheComponents` NOT in `next.config.ts`.
- [ ] Skim `design.md` §A (Wave-A patterns), §B (Wave-B patterns), §D
      (gotchas) before touching the first file.
- [ ] Verify `src/app/archivo/[season]/[split]/page.tsx` does NOT contain
      `dynamicParams` (REQ-32 already applied in working tree):
      `grep -n dynamicParams src/app/archivo/[season]/[split]/page.tsx` →
      empty.

---

## 1. REQ-30 — DONE in main (do not re-execute)

Verification (reviewer-only):
- `ls src/lib/data` → "No such file or directory".
- `grep -rn "fetchData" src` → empty.

---

## 2. REQ-31 — DONE in main (do not re-execute)

Verification (reviewer-only):
- `find src/lib/services -name "matchService*"` → empty.
- `find src/lib/utils -name "matches.ts"` → 1 file.
- `grep -rn "from '@/lib/utils/matches'" src` → exactly `bracketService.ts:5`.

---

## 3. REQ-33 — DONE in main (do not re-execute)

Verification (reviewer-only):
- `grep -rn "supabase.auth\|cookies(" src/lib/queries/` → empty.
- `grep -c "await createClient()" src/lib/queries/admin.queries.ts` → `8`.

---

# WAVE A — Pre-flights (ONE commit at the end of the wave)

Order inside Wave A: REQ-32 (verify) → REQ-43 → REQ-44. `./init.sh` GREEN
between each. ONE commit at the end bundles all three.

## 4. REQ-32 — Verify `dynamicParams` is gone (no edit; included in Wave-A commit)

- [ ] `grep -rn "dynamicParams" src/app/` MUST return nothing. If it
      returns ANYTHING, the working-tree state has drifted — STOP and
      report.
- [ ] No code change here. The deletion is already in the working tree
      and will be bundled into the Wave-A commit.

**Done criteria.** Grep is empty across the whole `src/app/` tree.

---

## 5. REQ-43 — Extract `new Date()` out of Footer (Wave A pre-flight #1)

- [ ] Create `src/components/shared/layout/FooterYear.tsx` per
      `design.md` §A.1. EXACT shape:
      ```tsx
      'use client';
      import { useEffect, useState } from 'react';

      export function FooterYear() {
        const [year, setYear] = useState<number | null>(null);
        useEffect(() => {
          setYear(new Date().getFullYear());
        }, []);
        return <>{year ?? ''}</>;
      }
      ```
- [ ] Edit `src/components/shared/layout/Footer.tsx`:
      - DELETE line 5 (`const currentYear = new Date().getFullYear();`).
      - ADD `import { FooterYear } from './FooterYear';` near the top.
      - REPLACE `{currentYear}` on line 45 inside the © string with
        `<FooterYear />`.
      - Do NOT touch any other markup or Tailwind classes.
- [ ] Sanity greps:
      - `grep -n "new Date" src/components/shared/layout/Footer.tsx` → empty.
      - `grep -l "'use client'" src/components/shared/layout/FooterYear.tsx`
        → file path.
      - `grep -n "<FooterYear" src/components/shared/layout/Footer.tsx`
        → at least one match.
- [ ] Run `./init.sh`. Expected: GREEN (baseline, `cacheComponents` OFF).
- [ ] Manual: `pnpm dev`, visit `/`, confirm the © year still renders in
      the footer.

**Done criteria.** Footer.tsx has zero `new Date()` calls. FooterYear is
mounted inside Footer. `./init.sh` GREEN.

**DO NOT COMMIT YET.** Wave-A commit is one combined commit at the end.

---

## 6. REQ-44 — Wrap every page-level `await get*()` in `<Suspense>` (Wave A pre-flight #2)

For EACH file in the table below, extract the top-level async body into a
helper server function (suffix it `Shell` for layouts, `Inner` for pages)
and wrap that helper in `<Suspense fallback={…}>`. The default export
becomes a non-async wrapper. See `design.md` §A.2 for representative
patterns.

**Files (audit + edit):**

- [ ] `src/app/hub/layout.tsx` — extract async body into `HubShell`,
      wrap in `<Suspense fallback={<ShellSkeleton />}>`. Forward
      `children` through the helper.
- [ ] `src/app/archivo/layout.tsx` — mirror of hub layout. Extract async
      body into `ArchivoShell`, wrap in
      `<Suspense fallback={<ShellSkeleton />}>`.
- [ ] `src/app/archivo/page.tsx` — extract the `Promise.all` block + VM
      build + final JSX into `ArchivoPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="standings" />}>`.
- [ ] `src/app/archivo/[season]/[split]/page.tsx` — extract `await
      getSplitByNames` + `Promise.all` + JSX into
      `ArchiveDetailPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="standings" />}>`.
      `notFound()` stays inside the helper.
- [ ] `src/app/page.tsx` — extract `Promise.all` + conditional fetch +
      VM build into `HomePageInner`, wrap in `<Suspense fallback={<BackgroundDecoration />}>`.
- [ ] `src/app/[season]/[split]/page.tsx` — extract body into
      `LegacySplitInner`, wrap in `<Suspense fallback={null}>`. Redirects
      stay inside the helper.
- [ ] `src/app/[season]/[split]/cruces/page.tsx` — same shape.
- [ ] `src/app/[season]/[split]/final/page.tsx` — same shape.
- [ ] `src/app/hub/page.tsx` — extract the top-level `await getActiveSeasonWithSplit()`
      + the existing JSX (which already contains F5 Suspense boundaries)
      into `HubPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="phaseBanner" />}>`.
      DO NOT touch the existing F5 inner Suspense boundaries — they stay
      as additive children.
- [ ] `src/app/hub/bracket/page.tsx` — extract into `BracketPageInner`,
      wrap in `<Suspense fallback={<SectionSkeleton variant="bracket" />}>`.
      F5 inner Suspense stays.
- [ ] `src/app/hub/calendario/page.tsx` — extract into
      `CalendarioPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="calendar" />}>`.
- [ ] `src/app/hub/clasificacion/page.tsx` — extract into
      `ClasificacionPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="standings" />}>`.
- [ ] `src/app/hub/olimpo/page.tsx` — extract into `OlimpoPageInner`,
      wrap in `<Suspense fallback={<SectionSkeleton variant="olimpo" />}>`.
- [ ] `src/app/hub/entrenadores/page.tsx` — extract into
      `EntrenadoresPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="roster" />}>`.
- [ ] `src/app/hub/entrenador/[id]/page.tsx` — extract into
      `TrainerPageInner`, wrap in
      `<Suspense fallback={<SectionSkeleton variant="trainerProfile" />}>`.
      `notFound()` stays inside the helper.

**Optional `ShellSkeleton`.** If you choose to add the new shell-level
skeleton (recommended for hub/archive layouts):
- [ ] Create `src/components/shared/ui/ShellSkeleton.tsx` per
      `design.md` §A.3 (minimal `<div className="min-h-screen bg-px-bg animate-pulse" aria-hidden="true" />`).
- [ ] Export from `src/components/shared/index.ts`.
- [ ] Import in `hub/layout.tsx` and `archivo/layout.tsx`.

If you skip `ShellSkeleton`, inline the JSX literal in both layouts —
either is acceptable.

**Discovery step (residual risk R1).**
- [ ] Re-grep for any awaits the table might have missed:
      `grep -rnE "^\s*await get" src/app/ --include="*.tsx"` (zsh
      `setopt NO_NOMATCH` if needed). EVERY hit MUST live inside a
      helper server function under a `<Suspense>` ancestor, NOT in the
      top-level default export. Document any newcomer in the commit
      message body.
- [ ] If a newcomer is in an ADMIN RSC, STOP and report — admin tree
      stays `ƒ Dynamic` per REQ-39 and may need a different treatment
      (do NOT silently add `'use cache'`; Wave A is pre-flag).

**Sanity / verification.**
- [ ] `./init.sh` GREEN. Expected: 23 pages, ≥3 prerendered archive URLs,
      `/hub/*` still `ƒ Dynamic` (flag not yet flipped).
- [ ] Manual dev visit: `/`, `/hub`, `/hub/clasificacion`, `/archivo`,
      `/archivo/<existing-season>/<existing-split>`, a legacy URL like
      `/<legacy-season>/<legacy-split>` (should redirect). Confirm no
      visual regression vs baseline.

**Done criteria.** Every page/layout listed has its top-level await(s)
moved into a Suspense-wrapped helper. ShellSkeleton (or inline fallback)
present where used. `./init.sh` GREEN. No newcomer awaits left at top
level.

**DO NOT COMMIT YET.** Wave-A commit is next.

---

## 7. WAVE A COMMIT (single commit)

- [ ] `git status` should show, at minimum:
      - `M src/app/archivo/[season]/[split]/page.tsx` (REQ-32 +
        REQ-44 changes).
      - `M src/components/shared/layout/Footer.tsx` (REQ-43).
      - `A src/components/shared/layout/FooterYear.tsx` (REQ-43).
      - Possibly `A src/components/shared/ui/ShellSkeleton.tsx` (REQ-44
        optional).
      - `M src/components/shared/index.ts` (if ShellSkeleton added).
      - `M` on every page/layout edited by REQ-44 (≥13 files).
- [ ] Commit message shape:
      ```
      refactor(f4-wave-a): pre-flights for cacheComponents flag

      - REQ-32: confirm dynamicParams = true removed from archivo detail.
      - REQ-43: extract Footer year into client FooterYear leaf so the root
        layout no longer calls new Date() at server render.
      - REQ-44: wrap every page/layout-level await get*() in <Suspense> so
        the cacheComponents flag (Wave B) can land without aborting the
        build. <N> files touched.

      Verification:
      - ./init.sh GREEN (typecheck 0 / lint 0 / build 23 pages, ≥3
        prerendered archive URLs)
      - grep -rn dynamicParams src/app/ → empty
      - grep -n "new Date" src/components/shared/layout/Footer.tsx → empty
      - grep -rnE "^\s*await get" src/app/ shows all awaits live inside
        *Shell / *Inner helpers, never at top of default exports.

      Refs: REQ-32, REQ-43, REQ-44 in specs/requirements.md
      ```

**Done criteria.** Wave A is one commit. `./init.sh` GREEN on that
commit. Working tree clean.

---

# WAVE B — Cache migration (ATOMIC — ONE commit at wave end)

`./init.sh` may go RED during iteration inside the wave. The COMMIT is one
single commit at the end when `./init.sh` is GREEN with the entire wave
applied. File order is LOCKED (`design.md` §B).

## 8. REQ-40 — Enable `cacheComponents: true` (Wave B step 1)

- [ ] Edit `next.config.ts`. ADD `cacheComponents: true,` as a sibling of
      `reactCompiler: true`. Resulting object:
      ```ts
      const nextConfig: NextConfig = {
        reactCompiler: true,
        cacheComponents: true,
        poweredByHeader: false,
        images: { ... },
      };
      ```
- [ ] Run `./init.sh`.
- [ ] **Expected: GREEN.** Wave A removed the two blockers (Footer
      `new Date()`, top-level page awaits). If RED, STOP and report:
      Wave A missed a boundary. Do NOT proceed to REQ-34. Common cause:
      a new `await get` discovered post-Wave-A grep that wasn't wrapped.
      Fix Wave A first, then re-attempt REQ-40.
- [ ] DO NOT COMMIT YET. Wave B is one atomic commit.

**Done criteria (intermediate).** `cacheComponents: true` in
`next.config.ts`. `./init.sh` GREEN.

## 9. REQ-34 — `'use cache'` on `archive.queries.ts` (Wave B step 2)

For EACH of the 5 readers (`getArchiveChampions` line 33,
`getArchiveDivisionPreview` line 98, `getPublicActiveSeasonWithSplit`
line 183, `getPublicAllSeasonsWithSplits` line 228,
`getPublicCurrentRound` line 273):

- [ ] Convert `export const x = cache(async (...) => {...})` to
      `export async function x(...) { ... }`.
- [ ] Add `'use cache';` as the FIRST line inside the function body.
- [ ] Add `cacheLife(...)` per `design.md` §C (all 5 tagged with
      `'archive'`; `getPublicActiveSeasonWithSplit` /
      `getPublicAllSeasonsWithSplits` also include `'seasons'`;
      `getPublicCurrentRound` also includes `matches:${splitId}`;
      `getArchiveDivisionPreview` also includes `splits:${splitId}`).
      `cacheLife('days')` for archive-only readers,
      `cacheLife('hours')` for the public-active-season /
      public-all-seasons pair, `cacheLife('hours')` for
      `getPublicCurrentRound`.
- [ ] Add `cacheTag(...)` per the table — template literals for
      parameterized tags.
- [ ] Preserve return-shape AND the `[fnName] Error:` log +
      `[]/null/Map()` fallback contract from CLAUDE.md exactly.

File-level cleanup at top of `archive.queries.ts`:
- [ ] Remove `import { cache } from 'react';`.
- [ ] Add `import { cacheLife, cacheTag } from 'next/cache';`.

Sanity greps (intermediate):
- [ ] `grep -c "'use cache'" src/lib/queries/archive.queries.ts` → `5`.
- [ ] `grep -c "cacheTag(" src/lib/queries/archive.queries.ts` → `5`.
- [ ] `grep -c "cacheLife(" src/lib/queries/archive.queries.ts` → `5`.
- [ ] `grep "from 'react'" src/lib/queries/archive.queries.ts` → empty.
- [ ] `./init.sh` GREEN. If RED, fix in place (Wave B still iterating).

## 10. REQ-35 — `'use cache'` on `seasons.queries.ts` (Wave B step 3)

Apply the REQ-34 pattern to all 7 readers
(`getActiveSeasonWithSplit` 17, `getAllSeasons` 63,
`getAllSeasonsWithSplits` 83, `getSeasonWithSplits` 128,
`getSeasonByName` 172, `getArchiveSplitParams` 217,
`getSplitByNames` 250). All tagged `'seasons'`. `cacheLife('days')` for
`getArchiveSplitParams`, `cacheLife('hours')` for the other six.

- [ ] All 7 converted.
- [ ] `import { cache } from 'react'` removed.
- [ ] `import { cacheLife, cacheTag } from 'next/cache'` added.
- [ ] **CRITICAL SSG CHECK.** `getArchiveSplitParams` feeds
      `generateStaticParams()` at `src/app/archivo/[season]/[split]/page.tsx:28`.
      Run `pnpm build` after this step and confirm ≥3 prerendered
      `/archivo/[season]/[split]` URLs. If 0 or 1 or 2, STOP — residual
      risk R3 (design review needed; do not commit).
- [ ] Sanity greps: `grep -c "'use cache'" src/lib/queries/seasons.queries.ts` → `7`;
      `grep -c "cacheTag(" …` → `7`; `grep "from 'react'" …` → empty.
- [ ] `./init.sh` GREEN.

## 11. REQ-36 — `'use cache'` on hot-path queries (Wave B step 4)

**Sub-order inside REQ-36 (LEAF-FIRST):**

`leagues.queries.ts` first, leaves before composers:
- [ ] `getLeaguesBySplit` (line 30) — tags `seasons`, `splits:${splitId}`,
      `cacheLife('hours')`.
- [ ] `getRankingsByLeague` (line 52) — tag `rankings:${leagueId}`,
      `cacheLife('minutes')`.
- [ ] `getMatchesByRound` (line 267) — tag `matches:${splitId}`,
      `cacheLife('minutes')`.
- [ ] `getLeagueByTier` (line 180) — tags `seasons`, `splits:${splitId}`,
      `cacheLife('hours')`.
- [ ] `getParticipantsBySplit` (line 203) — tag
      `participants:${splitId}`, `cacheLife('hours')`.
- [ ] LAST in this file: `getDivisionPreview` (line 129) — tags
      `splits:${splitId}`, `matches:${splitId}`, `cacheLife('minutes')`.
- [ ] `import { cache } from 'react'` removed; `import { cacheLife, cacheTag } from 'next/cache'` added.

Then other files:
- [ ] `src/lib/queries/tournament.queries.ts` — `getCurrentRound` (line 11)
      — tag `matches:${splitId}`, `cacheLife('minutes')`. Import swap.
- [ ] `src/lib/queries/trainers.queries.ts` — `getTrainerById` (line 15) —
      tag `trainers`, `cacheLife('hours')`. Import swap.
- [ ] `src/lib/queries/bracket.queries.ts` — `getBracketData` (line 34) —
      tags `bracket:${splitId}`, `matches:${splitId}`,
      `cacheLife('minutes')`. Import swap. NOTE: this query internally
      calls `getLeaguesBySplit` (also `'use cache'` by now) — Next 16
      composes nested cache keys transparently.

Sanity greps (intermediate, after all of REQ-36):
- [ ] `grep -c "'use cache'" src/lib/queries/leagues.queries.ts` → `6`.
- [ ] `grep -c "'use cache'" src/lib/queries/tournament.queries.ts` → `1`.
- [ ] `grep -c "'use cache'" src/lib/queries/trainers.queries.ts` → `1`.
- [ ] `grep -c "'use cache'" src/lib/queries/bracket.queries.ts` → `1`.
- [ ] `grep "from 'react'" src/lib/queries/leagues.queries.ts src/lib/queries/tournament.queries.ts src/lib/queries/trainers.queries.ts src/lib/queries/bracket.queries.ts`
      → empty.
- [ ] `./init.sh` GREEN.

## 12. WAVE B COMMIT (single atomic commit)

- [ ] Run `./init.sh` one final time. MUST be GREEN with the entire
      wave applied (REQ-40 + REQ-34 + REQ-35 + REQ-36).
- [ ] Run `pnpm build` and INSPECT the "Route (app)" section. Confirm
      `/hub/*` routes are now `○` (or `⚡`), `/archivo/[season]/[split]`
      is `●` with ≥3 prerendered URLs, `/admin/**` is `ƒ Dynamic`. This
      is the REQ-37 acceptance matrix — Wave B's commit gate uses it as
      sanity (REQ-37 itself is a separate Wave-C inspection step that
      captures the matrix into history).
- [ ] If a `/hub/*` route is still `ƒ Dynamic`, residual risk R2 — STOP
      and report (Wave A missed a leaf or a query reader was skipped).
- [ ] Commit. Message shape:
      ```
      refactor(f4-wave-b): atomic cache migration (cacheComponents + 'use cache')

      Wave B: flag flip + 'use cache' triad across 21 cacheable readers.
      Atomic per spec — internal iteration only; one commit at the end.

      - REQ-40: cacheComponents: true in next.config.ts.
      - REQ-34: 5 archive readers (archive.queries.ts) → triad.
      - REQ-35: 7 seasons readers (seasons.queries.ts) → triad.
      - REQ-36: 9 hot-path readers (leagues 6 leaf-first + composer;
        tournament 1; trainers 1; bracket 1) → triad.

      Verification:
      - ./init.sh GREEN (typecheck 0 / lint 0 / build N pages, ≥3
        prerendered archive URLs)
      - grep counts per file match REQ-34/35/36 (5/7/6/1/1/1)
      - 'Route (app)' matrix: /hub/* shows ○ or ⚡, /archivo/[season]/[split]
        ● with ≥3, /admin/** ƒ Dynamic.

      Refs: REQ-40, REQ-34, REQ-35, REQ-36 in specs/requirements.md
      ```

**Done criteria.** Wave B is one commit. `./init.sh` GREEN. Build matrix
confirms hub routes flipped off `ƒ Dynamic`.

---

# WAVE C — Hardening (one commit per REQ, `./init.sh` between)

## 13. REQ-38 — Wire `updateTag` into `seasons/_actions.ts`

- [ ] Edit `src/app/admin/dashboard/seasons/_actions.ts`.
- [ ] Change line 3 from
      `import { revalidatePath } from 'next/cache';` to
      `import { revalidatePath, updateTag } from 'next/cache';`.
- [ ] `createSeasonAction` (line 20-40): add `updateTag('seasons');` on
      the line AFTER `revalidatePath(SEASONS_PATH);` (line 38) and BEFORE
      `return { ok: true };`.
- [ ] `deleteSeasonAction` (line 42-61): add `updateTag('seasons');` then
      `updateTag('archive');` after `revalidatePath(SEASONS_PATH);` (line 59).
- [ ] `activateSeasonAction` (line 63-97): same pair after
      `revalidatePath(SEASONS_PATH);` (line 95).
- [ ] `deactivateSeasonAction` (line 99-120): same pair after
      `revalidatePath(SEASONS_PATH);` (line 118).
- [ ] DO NOT remove any `revalidatePath` call — they stay (admin tree
      remains `ƒ Dynamic` per REQ-39).

Sanity greps:
- [ ] `grep -c "updateTag(" src/app/admin/dashboard/seasons/_actions.ts` → `7`.
- [ ] `grep -c "revalidatePath(" src/app/admin/dashboard/seasons/_actions.ts` → `4`.
- [ ] `grep "from 'next/cache'" src/app/admin/dashboard/seasons/_actions.ts`
      shows `revalidatePath, updateTag` imported together.

- [ ] Run `./init.sh`. Expected: GREEN.
- [ ] **Manual smoke (REQUIRED).** Log into admin, click "activate
      season" on a different season, navigate to `/hub`, confirm
      `TopBar` active-season chip updates WITHOUT a hard reload.
      Capture result in `progress/history.md` later (REQ-42).
- [ ] Commit. Message: `refactor(f4): wire updateTag('seasons'/'archive') into seasons/_actions.ts (REQ-38)`.

**Done criteria.** 7 `updateTag` calls + 4 `revalidatePath` calls in the
file. Manual smoke passes.

---

## 14. REQ-37 — Build-matrix regression check (inspection, NO commit)

- [ ] Run `pnpm build` and capture the "Route (app)" table from stdout.
- [ ] Confirm the F4 acceptance matrix:
      | Route | Expected | Acceptable also |
      |---|---|---|
      | `/`, `/hub`, `/hub/clasificacion`, `/hub/calendario`, `/hub/bracket`, `/hub/olimpo`, `/hub/entrenadores`, `/hub/entrenador/[id]` | `○` | `⚡` |
      | `/archivo` | `○` | — |
      | `/archivo/[season]/[split]` | `●` (SSG ≥3) | — |
      | `/admin/dashboard/**`, `/login`, `/admin` | `ƒ Dynamic` | — |
      | legacy `/[season]/...` redirects | `ƒ Dynamic` | — |
- [ ] **HARD FAIL: any `/hub/*` still `ƒ Dynamic`.** Diagnose with
      `grep -rn "cookies\|headers\|searchParams" src/app/hub/` (expect
      empty). If empty, residual risk R2 — a query reader was likely
      skipped in Wave B; revisit Wave B.
- [ ] Stash the "Route (app)" section verbatim for the REQ-42 history.md
      entry.
- [ ] No code change, no commit.

**Done criteria.** Matrix holds. Total page count ≥23. Prerendered
archive URLs ≥3.

---

## 15. REQ-39 — Admin-untouched regression inspection (no edit)

- [ ] `git diff src/lib/queries/admin.queries.ts` → empty.
- [ ] `grep -c "'use cache'" src/lib/queries/admin.queries.ts` → `0`.
- [ ] `grep -c "await createClient()" src/lib/queries/admin.queries.ts` → `8`.
- [ ] `grep -rn "router.refresh" src/app/admin/ | wc -l` → `20`.
- [ ] Capture in `progress/history.md` later (REQ-42).
- [ ] No code change, no commit.

**Done criteria.** All 4 regression greps unchanged vs F3 baseline.

---

## 16. REQ-41 — Document the cache tag taxonomy

- [ ] Pick `docs/conventions.md` OR `docs/ARCHITECTURE.md` (author's
      choice — whichever has the closer adjacency to caching/queries).
- [ ] Append a new section titled "Cache tag taxonomy" (or similar) with:
      1. The 8 tag families table from `design.md` §C (copy verbatim).
      2. The per-query profile + tag assignment table from `design.md`
         §C (copy verbatim).
      3. "How to add a new mutation" recipe (3 sentences max, pointing
         to REQ-38 in `_actions.ts` as the reference shape).
      4. Boxed callout for the REQ-39 staleness window (Option A) — name
         the 5 non-pilot Managers (Splits, Divisions, Regulations,
         Participants, Matches), name the worst-case `cacheLife` bounds
         (≤60s match data / ≤1h season metadata / ≤24h archive), link to
         `features.json` F6 as owner of the closure.
      5. "Admin queries never cache" rule (REQ-39 rationale).
- [ ] Sanity grep:
      `grep -l "cache tag\|tag taxonomy" docs/conventions.md docs/ARCHITECTURE.md`
      → at least one path.
- [ ] Each tag family appears literally (grep `seasons`, `splits:`,
      `matches:`, `rankings:`, `participants:`, `bracket:`, `trainers`,
      `archive`).
- [ ] Run `./init.sh`. Expected: GREEN.
- [ ] Commit. Message: `docs(f4): add cache tag taxonomy + staleness-window callout (REQ-41)`.

**Done criteria.** Chosen doc file has the new section enumerating the 8
tag families, per-query assignment, mutation recipe, staleness callout,
and admin-never-cache rule.

---

## 17. REQ-42 — Final close-out (implementer → reviewer)

- [ ] Run `./init.sh` one more time, capture the tail.
- [ ] Run `pnpm build` and capture the "Route (app)" section.
- [ ] Add a new entry to `progress/history.md` titled
      "2026-XX-XX — F4 implemented (implementer → reviewer)" containing:
      - Typecheck: 0 errors.
      - Lint: 0 errors / 0 warnings.
      - Build: ≥23 pages, ≥3 prerendered archive URLs.
      - REQ-37 build matrix proof (paste table).
      - REQ-38 manual smoke result.
      - Wave-A / Wave-B / Wave-C commit shas.
      - Tag taxonomy spot-check: 3 random readers (e.g.
        `getDivisionPreview`, `getBracketData`, `getCurrentRound`)
        confirmed to carry the triad with the right tags from §C.
      - Explicit citation that **REQ-39 is deferred to F6 per Option A**
        — leader will mirror this into `features.json` F4 `deferred[]`
        at close-out.
- [ ] `features.json` F4 stays `in_progress`. Reviewer flips to `done`
      after independent `./init.sh` GREEN. Implementer does NOT bump
      the status field.
- [ ] Hand off to reviewer.

---

## Commit map (summary)

| Wave | Commits | Files |
|---|---|---|
| A | 1 (`refactor(f4-wave-a):`) | ≥13 page/layout files + Footer.tsx + FooterYear.tsx + optional ShellSkeleton + barrel |
| B | 1 (`refactor(f4-wave-b):`) | next.config.ts + 6 query files |
| C | 3 (one per REQ-38, REQ-41, REQ-42 history entry) | _actions.ts; docs file; progress/history.md |

REQ-37 + REQ-39 are inspection-only (no commit); their findings live in
the REQ-42 history entry.

Total commits for F4 pending work: **5**. Tag taxonomy doc + history
entry can be combined into REQ-41's commit if the implementer prefers,
but the spec recommends keeping REQ-42's history note as the last commit
so the handoff is the visible HEAD.

---

## Quick-reference: file ↔ REQ map

| REQ | File(s) | Wave | Action |
|---|---|---|---|
| REQ-30 | `src/lib/data/fetchData.ts` | (in main) | DELETED |
| REQ-31 | `src/lib/services/matchService.ts`, `src/lib/utils/matches.ts`, `src/lib/services/bracketService.ts:5` | (in main) | MOVED |
| REQ-33 | `src/lib/queries/{leagues,seasons,tournament,trainers,bracket}.queries.ts` | (in main) | FLIPPED |
| REQ-32 | `src/app/archivo/[season]/[split]/page.tsx` | A | VERIFY (already in WT) |
| REQ-43 | `src/components/shared/layout/Footer.tsx`, `…/FooterYear.tsx` (new) | A | EXTRACT |
| REQ-44 | 13 pages/layouts under `src/app/{,hub,archivo,[season]}` + optional ShellSkeleton | A | SUSPENSE WRAP |
| REQ-40 | `next.config.ts` | B | FLAG FLIP |
| REQ-34 | `src/lib/queries/archive.queries.ts` | B | 5 readers → triad |
| REQ-35 | `src/lib/queries/seasons.queries.ts` | B | 7 readers → triad |
| REQ-36 | `src/lib/queries/{leagues,tournament,trainers,bracket}.queries.ts` | B | 9 readers → triad |
| REQ-38 | `src/app/admin/dashboard/seasons/_actions.ts` | C | + `updateTag` × 7 |
| REQ-37 | (inspection — paste build matrix into history) | C | NO EDIT |
| REQ-39 | (inspection — confirm admin untouched) | C | NO EDIT |
| REQ-41 | `docs/conventions.md` OR `docs/ARCHITECTURE.md` | C | APPEND taxonomy |
| REQ-42 | `progress/history.md` | C | APPEND F4 entry |
