# Tasks — Batch F5: Performance / modernización

Atomic checklist for the Implementer. Do **not** start until `./init.sh` is green
and this spec is approved. Check items off as they land; log decisions in
`progress/history.md`.

> Follow the ordering in `design.md` §Implementation order. Steps 1→5 are
> dependent in the listed sequence — primitives first because Suspense fallbacks
> need `SectionSkeleton`; client→server push before Suspense to avoid re-wiring
> twice; SSG archive last so the cookie-free client change is isolated.

---

## 0. Pre-flight

- [ ] **Baseline green:** run `./init.sh` once. Expect typecheck clean, lint 0
      errors (2 pre-existing `noUnusedImports` warnings in `fetchData.ts:5` and
      `matchService.ts:5` are F4 debt — they don't fail lint). If anything else
      is red, stop and surface to leader.
- [ ] **Capture build baseline:** save `pnpm build` route table to
      `progress/history.md` (route, Size, First Load JS for `/hub*` and
      `/archivo*` rows). This is the comparison target for REQ-23's bundle
      decrease and REQ-21's new static rows.
- [ ] **Verify orphan status (REQ-23.4):**
  - `rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/app`
    must return **empty**.
  - `rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/components`
    will return the dead cluster + its re-exports in `src/components/shared/index.ts`.
    Sanity check: no other consumer.
  - If any consumer in `src/app/` shows up, stop and report — the orphan
    deletion sub-step in REQ-23 is invalid as designed.
- [ ] **Verify Next 16 + React 19.2 framework assumptions** with `vercel:nextjs`
      and `vercel:next-cache-components` skills BEFORE writing code:
  - REQ-21: confirm a cookie-free Supabase client (no `await cookies()`) is the
    right escape from `force-dynamic` for `generateStaticParams`. If the docs
    surface a cleaner Next 16-specific exemption, adopt it and log the
    deviation in `progress/history.md`.
  - REQ-22: confirm `async function` Server Components work as direct children
    of `<Suspense>` without `cacheComponents` enabled. (Should be native; just
    verify.)
- [ ] **Confirm `formatSeasonSplit` doesn't already exist:**
      `rg "formatSeasonSplit|formatSplitName" src/lib/utils` empty. (Original
      brief said `formatSplitName` — the new helper is `formatSeasonSplit`.)

---

## 1. REQ-24 — Shared primitives (lands first)

Each primitive is its own atomic commit. Land + migrate call sites + green
`./init.sh` before moving to the next.

### 1a. `<EmptyState>`

- [ ] Create `src/components/shared/ui/EmptyState.tsx` (Server Component, shape
      per `design.md` §REQ-24).
- [ ] Re-export from `src/components/shared/index.ts`.
- [ ] Migrate inline empty blocks (6 sites):
  - [ ] `src/app/hub/page.tsx:36`
  - [ ] `src/app/hub/clasificacion/page.tsx:28`
  - [ ] `src/app/hub/calendario/page.tsx:26`
  - [ ] `src/app/hub/entrenadores/page.tsx:22`
  - [ ] `src/app/hub/bracket/page.tsx:25`
  - [ ] `src/app/hub/olimpo/page.tsx:55`
- [ ] Verify: `rg '"py-20 text-center"' src/app` returns **empty**.
- [ ] `./init.sh` green.

### 1b. `<BackgroundDecoration>`

- [ ] Create `src/components/shared/ui/BackgroundDecoration.tsx` (Server,
      `variant="starfield"` only).
- [ ] Re-export from `src/components/shared/index.ts`.
- [ ] Migrate inline `<div className="starfield" />` (5 sites):
  - [ ] `src/components/hub/HubRightColumn.tsx:118`
  - [ ] `src/components/hub/BracketView.tsx:220`
  - [ ] `src/components/hub/OlimpoView.tsx:44`
  - [ ] `src/components/landing/PixelLanding.tsx:58`
  - [ ] `src/components/landing/PixelLanding.tsx:408`
- [ ] Verify: `rg 'className="starfield"' src` returns **only the new
      `BackgroundDecoration.tsx` definition**.
- [ ] `./init.sh` green.

### 1c. `<SectionSkeleton>`

- [ ] Create `src/components/shared/ui/SectionSkeleton.tsx` (Server, 9 variants
      per `design.md` §REQ-24 SIZES map).
- [ ] Re-export from `src/components/shared/index.ts`.
- [ ] No call-site migration yet (REQ-22 is the consumer).
- [ ] `./init.sh` green (lint must accept the unused-export — barrel re-export
      satisfies lint).

### 1d. `formatSeasonSplit`

- [ ] Create `src/lib/utils/formatters.ts` exporting
      `formatSeasonSplit(season: string, split: string): string`.
- [ ] Migrate inline `${…toUpperCase()} · ${…toUpperCase()}` builds:
  - [ ] `src/app/archivo/[season]/[split]/page.tsx:22`
  - [ ] `src/app/archivo/[season]/[split]/page.tsx:47`
  - [ ] `src/components/shared/layout/hub/SeasonSplitChip.tsx:28`
  - [ ] `src/components/hub/PhaseBanner.tsx:34`
  - [ ] `src/components/hub/OlimpoView.tsx:47`
- [ ] Verify: `rg 'toUpperCase\(\).*toUpperCase\(\)' src/components src/app`
      returns **only `src/lib/utils/formatters.ts`**.
- [ ] `./init.sh` green.

### 1e. Closeout REQ-24

- [ ] Append `progress/history.md` entry: primitive paths + sites migrated +
      `./init.sh` evidence.

---

## 2. REQ-23 — `'use client'` push to leaves (pragmatic)

Each component split is its own atomic step. After each: re-run `./init.sh` and
record the client-bundle delta for the affected route in `progress/history.md`
(the design promises decrease on `/hub/clasificacion`, `/hub/entrenadores`,
`/hub/calendario`).

### 2a. `ClasificacionView` split

- [ ] Create `src/components/hub/clients/DivisionTabsShell.tsx` (`'use client'`,
      shape per `design.md` §REQ-23.1). Lift `TabButton` from current
      `ClasificacionView.tsx` verbatim.
- [ ] Rewrite `src/components/hub/ClasificacionView.tsx` — remove `'use client'`
      directive, drop `useState`, accept `primera` + `segunda` rows, render
      `<DivisionTabsShell primeraSlot=… segundaSlot=… />`. Move
      `StandingsTable`/`TableRow`/`Pip` to pure Server JSX.
- [ ] Update the consumer page (`src/app/hub/clasificacion/page.tsx`) — no shape
      change should be needed; verify props match.
- [ ] Verify: `grep -L "'use client'" src/components/hub/ClasificacionView.tsx`
      lists the path (no client directive).
- [ ] `./init.sh` green. Capture bundle delta for `/hub/clasificacion`.

### 2b. `RosterView` split

- [ ] Create `src/components/hub/clients/RosterFilterShell.tsx` (`'use client'`,
      named-slot pattern per `design.md` §REQ-23.2: `allCount`, `d1Count`,
      `d2Count` + `allSlot`, `d1Slot`, `d2Slot`).
- [ ] Rewrite `src/components/hub/RosterView.tsx` — remove `'use client'`,
      rename to `RosterGrid` (pure Server JSX rendering `RosterCardVM[]`).
      Update the barrel/exports.
- [ ] Update `src/app/hub/entrenadores/page.tsx` — pre-render the three filtered
      grids server-side, hand them as named slots to `RosterFilterShell`.
- [ ] Verify: `grep -L "'use client'" src/components/hub/RosterView.tsx` (or
      the renamed `RosterGrid.tsx`) returns the path.
- [ ] `./init.sh` green. Capture bundle delta for `/hub/entrenadores`.

### 2c. `CalendarView` split

- [ ] Create `src/components/hub/clients/RoundSelectorShell.tsx` (`'use client'`,
      shape per `design.md` §REQ-23.3). Owns `useState<number>`, renders
      timeline strip, toggles visibility via CSS `hidden` on 16 pre-rendered
      slots (do **not** mount/unmount — preserve Suspense boundaries).
- [ ] Rewrite `src/components/hub/CalendarView.tsx` — remove `'use client'`,
      become a Server orchestrator that pre-renders all 16 round detail blocks
      and passes them as `roundSlots: { round: number; node: ReactNode }[]` to
      `<RoundSelectorShell>`.
- [ ] Update the page (`src/app/hub/calendario/page.tsx`) if its prop shape
      changes.
- [ ] Verify: `grep -L "'use client'" src/components/hub/CalendarView.tsx`
      returns the path.
- [ ] Bundle reality-check: confirm HTML weight increase from 16× pre-render is
      under the ~16KB-gzipped estimate. If it's materially larger (e.g. heavy
      images per match), stop and surface to leader — may need to fall back to
      the rejected alternative.
- [ ] `./init.sh` green. Capture bundle delta for `/hub/calendario`.

### 2d. `PlayoffBracket` + `MatchupCard` + `DivisionSection` orphan deletion

- [ ] Final orphan grep: `rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/app`
      must be empty. If something appeared since pre-flight, stop and report.
- [ ] Delete files:
  - [ ] `src/components/cross/PlayoffBracket.tsx`
  - [ ] `src/components/cross/MatchupCard.tsx`
  - [ ] `src/components/cross/` directory (should be empty after the two
        deletes — verify with `ls` and remove the dir).
  - [ ] `src/components/shared/DivisionSection/DivisionSection.tsx`
  - [ ] `src/components/shared/DivisionSection/` directory (verify empty,
        remove).
- [ ] Edit `src/components/shared/index.ts` — remove the `DivisionBracket` /
      `DivisionSection` re-exports (lines ~6-9 per design).
- [ ] **Do NOT delete `src/lib/types/matches.ts` `Matchup`** — still consumed by
      `lib/services/bracketService.ts` and `lib/services/matchService.ts`.
      Verify with `rg "Matchup" src/lib/services` (should still hit).
- [ ] Verify: `rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/`
      returns empty.
- [ ] `./init.sh` green.

### 2e. Closeout REQ-23

- [ ] Append `progress/history.md` entry: components split, files deleted,
      bundle deltas per route, `./init.sh` evidence.

---

## 3. REQ-22 — Granular Suspense per hub section

Land per hub route. Each route gets its own atomic step; `./init.sh` green
between them.

### 3a. `/hub` (main page)

- [ ] Create `src/components/hub/sections/PhaseHeaderSection.tsx` — async leaf
      doing `getCurrentRound(splitId)` (+ whatever the existing
      `PhaseBanner+StoryBeat` needs).
- [ ] Create `src/components/hub/sections/StandingsLiveSection.tsx` — async
      leaf doing `Promise.all([getDivisionPreview, getMatchesByRound])` then
      rendering `<StandingsLive …/>`.
- [ ] Create `src/components/hub/sections/ProjectedBracketTeaserSection.tsx`
      — async leaf doing `getDivisionPreview` then rendering the teaser.
- [ ] Create `src/components/hub/sections/HubRightColumnSection.tsx` — async
      leaf for the right column's data deps.
- [ ] Create `src/components/hub/sections/NewsRailSection.tsx` — async leaf for
      the news rail.
- [ ] Rewrite `src/app/hub/page.tsx`:
  - [ ] Top-level `await` only `getActiveSeasonWithSplit()`.
  - [ ] Render the section leaves wrapped in `<Suspense fallback={<SectionSkeleton variant=… />}>`
        per the diff in `design.md` §REQ-22.
  - [ ] Empty state stays at the top (returns `<EmptyState>` when no active
        split — already migrated in REQ-24).
- [ ] Verify no `export const dynamic = 'force-dynamic'` was added (would
      break streaming).
- [ ] Manual: `pnpm dev`, throttle to Slow 3G in DevTools, load `/hub`. Each
      section skeleton should resolve independently. Record observation in
      `progress/history.md` (one-line note is fine).
- [ ] `./init.sh` green.

### 3b. `/hub/clasificacion`

- [ ] Create `src/components/hub/sections/ClasificacionSection.tsx` — async
      leaf doing `Promise.all([getDivisionPreview, getMatchesByRound])`,
      returns `<ClasificacionView primera=… segunda=… />`.
- [ ] Rewrite `src/app/hub/clasificacion/page.tsx`: top-level awaits only
      `getActiveSeasonWithSplit()`, then `<Suspense fallback={<SectionSkeleton variant="standings"/>}>`
      wrapping `<ClasificacionSection splitId=… />`.
- [ ] `./init.sh` green.

### 3c. `/hub/calendario`

- [ ] Create `src/components/hub/sections/CalendarSection.tsx` — async leaf
      doing `Promise.all([getMatchesByRound, getCurrentRound])`, returns
      `<CalendarView …/>`.
- [ ] Rewrite `src/app/hub/calendario/page.tsx` with the same pattern.
- [ ] `./init.sh` green.

### 3d. `/hub/entrenadores`

- [ ] Create `src/components/hub/sections/RosterSection.tsx` — async leaf
      doing `Promise.all([getDivisionPreview, getMatchesByRound])`, computes
      the three filtered card sets, renders `<RosterFilterShell>` with the
      three named slots.
- [ ] Rewrite `src/app/hub/entrenadores/page.tsx` per pattern.
- [ ] `./init.sh` green.

### 3e. `/hub/bracket`

- [ ] Create `src/components/hub/sections/BracketSection.tsx` — async leaf
      doing `Promise.all([getDivisionPreview, bracket data fetch, getCurrentRound])`.
- [ ] Rewrite `src/app/hub/bracket/page.tsx` per pattern.
- [ ] `./init.sh` green.

### 3f. `/hub/olimpo`

- [ ] Create `src/components/hub/sections/OlimpoSection.tsx` — async leaf
      doing the existing Olimpo data fetches.
- [ ] Rewrite `src/app/hub/olimpo/page.tsx` per pattern.
- [ ] `./init.sh` green.

### 3g. `/hub/entrenador/[id]`

- [ ] Create `src/components/hub/sections/TrainerProfileSection.tsx` — async
      leaf doing `Promise.all([getTrainer, getDivisionPreview, getMatchesByRound])`.
- [ ] Rewrite `src/app/hub/entrenador/[id]/page.tsx` per pattern.
- [ ] `./init.sh` green.

### 3h. Closeout REQ-22

- [ ] Manual smoke: in `pnpm dev`, walk each hub route with DevTools network
      throttled. Confirm independent panel hydration. One-line note per route
      in `progress/history.md`.
- [ ] `view-source http://localhost:3000/hub` → confirm `<template>` islands
      per panel (Next.js streaming markers). Record evidence.
- [ ] Append `progress/history.md` entry summarizing REQ-22.

---

## 4. REQ-21 — Static generation of `/archivo/[season]/[split]`

### 4a. Cookie-free Supabase client

- [ ] Decide between Option C (overload `createClient({ session: false })`) and
      a separate `createPublicClient`. Default: Option C per design. If the
      framework verification surfaced a cleaner Next 16-specific path, pick
      that and log the deviation in `progress/history.md` before coding.
- [ ] Edit `src/lib/supabase/server.ts` — add the `{ session?: false }` overload
      that constructs the client with `{ cookies: { getAll: () => [], setAll: () => {} } }`
      and never calls `await cookies()`. Default behavior (no flag) is
      unchanged.
- [ ] `pnpm exec tsc --noEmit` clean.

### 4b. `getArchiveSplitParams`

- [ ] Add `getArchiveSplitParams(): Promise<Array<{ season: string; split: string }>>`
      to `src/lib/queries/seasons.queries.ts`. Uses `createClient({ session: false })`,
      reads `seasons.name, splits(name)`, flatMaps to lowercase URL-shaped
      pairs (per design §REQ-21 diff sketch).
- [ ] Wrap with `react.cache` per repo convention.
- [ ] Export from `src/lib/queries/index.ts`.
- [ ] Quick smoke: write a temporary throwaway script or just trust the build
      step — `pnpm build` will exercise it. Don't add a permanent test.

### 4c. Page exports

- [ ] Edit `src/app/archivo/[season]/[split]/page.tsx`:
  - [ ] `export async function generateStaticParams() { return getArchiveSplitParams(); }`
  - [ ] `export const dynamicParams = true;`
  - [ ] Verify the rest of the page (heading uses `formatSeasonSplit` already
        from REQ-24).
- [ ] Migrate archive queries (`getArchiveChampions`, `getSplitByNames`, the
      `getDivisionPreview` call **only when called from the archive page**) to
      use `createClient({ session: false })` so the route is truly static.
  - [ ] Cleanest path: keep `getDivisionPreview` on the cookie-aware client; if
        the archive page's call to it forces `force-dynamic`, add an archive-
        specific `getDivisionPreviewPublic` per-design Option B fallback.
        Decide live, document.
- [ ] **Verify** the `pnpm build` route table shows `/archivo/[season]/[split]`
      rendered statically with one row per `(season, split)` pair. Capture and
      paste into `progress/history.md`.

### 4d. Verification

- [ ] `./init.sh` green.
- [ ] `pnpm build` output: every `(season, split)` from DB shows as static
      under `/archivo/[season]/[split]`. Compare to baseline captured in
      pre-flight.
- [ ] `pnpm start` + curl an archive URL → response includes Next.js static
      cache marker (header `x-nextjs-cache` should not be `DYNAMIC` for the
      pre-rendered URLs).
- [ ] `/archivo/<bogus>/<bogus>` returns `404` (notFound path via
      `dynamicParams = true`).

### 4e. Closeout REQ-21

- [ ] Append `progress/history.md` entry: cookie-free helper shape, archive
      queries migrated, static row count.

---

## 5. REQ-25 — Image + animation audit (verify-only)

- [ ] `rg 'fill[^=]*=' src/app/hub src/app/archivo src/components/hub src/components/landing src/components/shared/layout/hub --type tsx`
      → expect zero hits OR every hit also has a `sizes=` attribute.
- [ ] `rg 'Number.POSITIVE_INFINITY' src/app/hub src/app/archivo src/components/hub src/components/landing src/components/shared/layout/hub`
      → expect zero hits.
- [ ] Confirm `src/components/shared/layout/hub/TopBar.tsx:46` `<Image>` still
      has explicit `width={40} height={40}`.
- [ ] If audit returns clean: append `progress/history.md` entry noting the
      live tree is clean AND listing the dead `home/Hero.tsx`,
      `home/CurrentSeason.tsx`, `shared/layout/Navbar.tsx`,
      `shared/ui/Button/LinkButton.tsx` cluster as future-sweep debt.
- [ ] If audit finds a regression: fix in place, document in the same entry.

---

## 6. Final closeout

- [ ] `./init.sh` (full, not `--quick`) green.
- [ ] `pnpm build` final route table captured in `progress/history.md`. Diff
      vs baseline:
  - [ ] New static rows for `/archivo/[season]/[split]` per (season, split).
  - [ ] Client JS for `/hub/clasificacion`, `/hub/entrenadores`,
        `/hub/calendario` **decreased** vs baseline (REQ-23 promise).
  - [ ] No regression on other routes.
- [ ] Append a final dated `progress/history.md` entry: `## 2026-05-28 — F5
      implemented (implementer → reviewer)` summarizing per-REQ work, bundle
      deltas, deviations from design (if any), and explicit confirmation that
      the 2 F4-owned warnings are unchanged.
- [ ] Leave `features.json` F5 at `spec_ready`. The leader flips to `done`
      after reviewer sign-off.

---

## Reviewer's evidence checklist (for traceability)

The Reviewer will independently re-run these. Surface command output verbatim
in `progress/history.md` for each to keep the audit trail thick.

| Check | Command |
|---|---|
| Empty-state migration | `rg '"py-20 text-center"' src/app` → empty |
| Starfield centralized | `rg 'className="starfield"' src` → only `BackgroundDecoration.tsx` |
| Format helper adoption | `rg 'toUpperCase\(\).*toUpperCase\(\)' src/components src/app` → only `formatters.ts` |
| ClasificacionView is Server | `grep -L "'use client'" src/components/hub/ClasificacionView.tsx` returns path |
| RosterView is Server | `grep -L "'use client'" src/components/hub/RosterView.tsx` (or renamed) returns path |
| CalendarView is Server | `grep -L "'use client'" src/components/hub/CalendarView.tsx` returns path |
| Orphan cluster gone | `rg "PlayoffBracket\|MatchupCard\|DivisionSection\|DivisionBracket" src` empty |
| Suspense boundaries present | `rg "<Suspense" src/app/hub` returns ≥ 1 hit per hub route |
| Archive SSG live | `pnpm build` output table shows static rows for every (season, split) under `/archivo/[season]/[split]` |
| Lint clean | `pnpm lint` → 0 errors / 2 warnings (pre-existing only) |
| `./init.sh` independent run | full green |
| Bundle decrease | `/hub/clasificacion`, `/hub/entrenadores`, `/hub/calendario` client JS < baseline |

---

## Decisions the Implementer may need to make live (and must log)

- **REQ-21 escape mechanism:** Option C (`{ session: false }` flag) vs a Next 16
  framework-specific exemption surfaced by `vercel:nextjs` docs. Default: C.
- **REQ-23.2 (Roster) slot strategy:** confirmed pre-rendered three slots
  (per design), not "render all + filter on client". Don't switch.
- **REQ-23.3 (Calendar) bundle reality:** if the 16× pre-render blows past ~32KB
  gzipped delta, escalate before merging.
- **REQ-22 leaf granularity:** if a section's data fetch is genuinely cheap
  (e.g. `PhaseHeaderSection` only needs `getCurrentRound`), keep it in its own
  Suspense anyway for consistency — the framework streams the cheap one first
  with zero penalty.
