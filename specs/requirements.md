# F5 — Performance / modernización · Requirements (EARS)

**Source:** `features.json` → F5, updated 2026-05-28 per user scope decisions (see
note at top of `design.md`). Supersedes the pre-FR11 brief in `ARCHITECTURE_REVIEW.html`
because the legacy `[season]/[split]` cluster is now redirect stubs only.

**Targets:** the live post-FR11 surfaces.
- `/hub` and subroutes (`/hub/clasificacion`, `/hub/calendario`, `/hub/entrenadores`, `/hub/bracket`, `/hub/olimpo`, `/hub/entrenador/[id]`) — live data, not statically generated.
- `/archivo/[season]/[split]` — past data, target for SSG via `generateStaticParams`.

**Out of scope** (explicit, do not touch):
- `src/app/[season]/[split]/page.tsx` and `cruces`/`final` siblings — already redirect stubs (verified `redirect()` to `/hub` or `/archivo`); leave alone.
- `src/components/home/Hero/Hero.tsx`, `src/components/home/CurrentSeason/CurrentSeason.tsx`, `src/components/shared/layout/Navbar.tsx`, `src/components/shared/ui/Button/LinkButton.tsx` — stale code from the pre-FR11 home; not rendered by any live route. F2 closed without sweeping these; punt to a future micro-batch (do **not** include in F5).
- `src/lib/data/fetchData.ts:5` and `src/lib/services/matchService.ts:5` noUnusedImports warnings — explicitly absorbed by F4.
- Migrating queries to `'use cache'` / enabling `cacheComponents` — F4 owns that. F5 only sets up the Suspense surfaces that F4 needs.

---

## Verification protocol (applies to every REQ unless noted)

All gates run through `./init.sh` (typecheck → lint → build). Lint must remain `0/0` (the existing 2 `noUnusedImports` warnings on `fetchData.ts` / `matchService.ts` are pre-existing F4 debt and don't fail `pnpm lint`). Build must succeed end-to-end.

Additional manual gates are called out per-REQ. **Bundle size comparison** is a global gate for the batch: capture `pnpm build` output for the `/hub*` and `/archivo*` routes before any change and after the batch; client JS for any route must not increase (target: decrease on `/hub/clasificacion`, `/hub/calendario`, `/hub/entrenadores` from the client→server splits in REQ-23).

---

## REQ-21 — Static generation of archive split pages

**When** the production build runs (`pnpm build`), the system **shall** statically pre-render every `(season, split)` pair persisted in Supabase under `/archivo/[season]/[split]`.

Concrete shape:
- `src/app/archivo/[season]/[split]/page.tsx` exports `generateStaticParams(): Promise<Array<{ season: string; split: string }>>` derived from `getAllSeasonsWithSplits()` (already exists in `seasons.queries.ts`). Mapping uses the **URL-shaped** lowercase names that `getSplitByNames` already accepts (verified: lines 222 and 238 use `.ilike(...)`, so the existing case-insensitive match keeps working — but `generateStaticParams` must emit canonical lowercase to avoid duplicate static pages).
- The page exports `export const dynamicParams = true` so visiting an unknown `(season, split)` still works at request time (DB rows added after build).
- `getDivisionPreview`, `getArchiveChampions`, and `getSplitByNames` must be callable from a static render — this requires a **cookie-free Supabase client** for archive queries (see design REQ-21 §"Cookie blocker"). The default `@/lib/supabase/server.ts` calls `await cookies()`, which opts the route out of static rendering in Next 16.

**Verification:**
- `./init.sh` green.
- `pnpm build` output lists every `(season, split)` from the DB under "○ (Static)" (or Next 16's equivalent indicator) for the `/archivo/[season]/[split]` route. For the current DB this should be at minimum every past split returned by `getAllSeasonsWithSplits()`.
- `curl -I` (or browser DevTools "Network" → "x-nextjs-cache") on a pre-rendered archive URL after `pnpm start` shows the static HIT marker, not "DYNAMIC".
- Visiting `/archivo/<bogus>/<bogus>` returns `404` (notFound path), confirming `dynamicParams = true` + `notFound()` still works.

**Out of scope:** `/hub` and any other route. `/hub` is a fixed path (no `[param]`) whose data is per-request-live; F4 will handle its caching strategy with `'use cache'`.

---

## REQ-22 — Granular Suspense per hub section

**While** a request to `/hub` (or its subroutes) is in flight, the system **shall** stream each independent data panel as its own Suspense boundary so a slow query for one panel does not block the others from hydrating.

Targets and boundaries — one async server child per `<Suspense fallback={…}>`:

| Route | Panels (each becomes a `<Suspense>` boundary) |
|---|---|
| `/hub` | `PhaseBanner+StoryBeat` (cheap, share a fetch of `seasonInfo`+`currentRound`); `StandingsLive` (uses `preview`+`matches`); `ProjectedBracketTeaser` (uses `preview`); `HubRightColumn` (uses `preview`+`matchesByRound`+`currentRound`); `NewsRail` (uses `preview`+`currentRound`) |
| `/hub/clasificacion` | `ClasificacionView` (uses `preview`+`matches`) |
| `/hub/calendario` | `CalendarView` (uses `matchesByRound`+`currentRound`) |
| `/hub/entrenadores` | `RosterView` (uses `preview`+`matches`) |
| `/hub/bracket` | `BracketView` (uses `preview`+`bracketData`+`currentRound`) |
| `/hub/olimpo` | `OlimpoView` (uses `preview`+`matchesByRound`+`currentRound`) |
| `/hub/entrenador/[id]` | `TrainerProfile` (uses `trainer`+`preview`+`matches`) |

Each Suspense boundary:
- Receives a section-appropriate skeleton via `<Suspense fallback={…}>` (see REQ-24 — extracted `<SectionSkeleton variant=…>`).
- Pushes its data fetch inside an async leaf component (e.g. `async function StandingsLiveSection({ splitId }: { splitId: string })`). The leaf does its own `Promise.all([...])` of the queries it needs; siblings do not share a top-level `await` that blocks the rest.

The top-level page (`HubPage`, `ClasificacionPage`, etc.) only awaits the cheap `getActiveSeasonWithSplit()` (used by every panel to decide the empty state). All heavier queries live inside the Suspense leaves so the shell ships as soon as `seasonInfo` resolves.

**Verification:**
- `./init.sh` green; no React "client component cannot be async" or "Suspense child not async" runtime errors during `pnpm build`.
- Manual: in `pnpm dev`, throttle the network in DevTools (e.g. Slow 3G), load `/hub`, and confirm individual section skeletons render and replace independently (NOT all panels swapping at once).
- React DevTools "Profiler" shows distinct render commits per panel rather than a single big tree render.
- `view-source` on the streamed HTML (e.g. `curl http://localhost:3000/hub`) shows `<template>` islands for each panel — confirming streaming, not a single blocking render.

---

## REQ-23 — `'use client'` push to leaves (pragmatic)

**If** a component is currently `'use client'` only because of small piece of UI state (tab/filter/timeline), **then** the system **shall** isolate that interactive piece into a tiny client leaf and render the bulk of the markup as Server Components passed via `children` (or named slot props).

Targets — confirmed by `'use client'` grep and the FR3/FR4/FR5/FR6 view files:

1. **`src/components/hub/ClasificacionView.tsx`** (currently 180 LOC, `'use client'` for `useState<Division>`).
   - Extract `<DivisionTabsShell>` (`'use client'`) — owns `useState<'primera' | 'segunda'>`, renders two tab buttons, and renders `{active === 'primera' ? primeraSlot : segundaSlot}` from props.
   - Move `StandingsTable` + `TableRow` + `Pip` to a Server Component file (drop `'use client'`).
   - Page composes: `<DivisionTabsShell primeraSlot={<StandingsTable rows={primera} />} segundaSlot={<StandingsTable rows={segunda} />} />`.

2. **`src/components/hub/RosterView.tsx`** (133 LOC, `'use client'` for `useState<Filter>`).
   - Extract `<RosterFilterShell>` (`'use client'`) owning the `all|1|2` filter pills + filtering logic.
   - The card grid (the bulk) becomes Server: `<RosterGrid cards={…} />`.
   - Filter shell receives `allCards` and renders the grid filtered. (Alternative: pass three pre-rendered grids as slots; pick the simpler form during impl — design.md picks one.)

3. **`src/components/hub/CalendarView.tsx`** (221 LOC, `'use client'` for `useState<number>` round selector).
   - Extract `<RoundSelectorShell>` (`'use client'`) owning the selected-round state.
   - Per-round match listings become Server: `<RoundDetails round={selected} matchesByRound={…} />` — but because `selected` lives in client state, **either** (a) pass pre-rendered listings for **every** round as named slots/array and the client picks one (heavier HTML, zero client JS for rendering matches), **or** (b) keep listings client-rendered (no win). Choose (a) — designed in design.md.

4. **`src/components/cross/PlayoffBracket.tsx` + `src/components/cross/MatchupCard.tsx`** — orphaned (only consumed by `src/components/shared/DivisionSection/DivisionSection.tsx`, which is itself orphan: zero callers in `app/`). **Decision:** the user's brief explicitly names them as client→server push candidates, but they are dead code in the live tree. Per F5 scope guidance ("not invent scope"), this REQ proposes:
   - **Verify orphan status** (`rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/app` → expect zero hits inside `src/app/`).
   - **Delete** `src/components/cross/PlayoffBracket.tsx`, `src/components/cross/MatchupCard.tsx`, `src/components/cross/` (becomes empty), `src/components/shared/DivisionSection/`, and the corresponding re-exports in `src/components/shared/index.ts`.
   - This is a dead-code cleanup, not a client→server push (the components are unreachable; pushing nothing into nothing is moot). If the user wants them kept as a future stub, downgrade this sub-REQ to "leave alone" and document in `progress/history.md`.

**Verification:**
- `./init.sh` green.
- After REQ-23.1/2/3: `grep -L "'use client'" src/components/hub/ClasificacionView.tsx src/components/hub/RosterView.tsx src/components/hub/CalendarView.tsx` returns each path that no longer has the directive (because the bulk moved server). The new tiny client shells (`DivisionTabsShell`, `RosterFilterShell`, `RoundSelectorShell`) carry `'use client'` and live in `src/components/hub/clients/`.
- Bundle: `pnpm build` shows a **decrease** in client JS for `/hub/clasificacion`, `/hub/entrenadores`, `/hub/calendario` versus the captured baseline (the row/card/match-detail JSX is no longer in the client bundle).
- After REQ-23.4 (if executed): the four files are deleted, no import errors, `./init.sh` still green.

---

## REQ-24 — Shared primitives extraction (deduplicate)

**When** a piece of UI is duplicated across two or more routes, the system **shall** expose a single canonical implementation under `src/components/shared/ui/` (or `src/lib/utils/` for pure functions).

Concrete duplications confirmed in the live tree:

1. **Empty-state card** — duplicated in `src/app/hub/page.tsx:36`, `calendario/page.tsx:26`, `clasificacion/page.tsx:28`, `bracket/page.tsx:25`, `olimpo/page.tsx:55`, `entrenadores/page.tsx:22`. Same markup (`<div className="py-20 text-center"><h1 className="font-pixel ...">…</h1><p className="font-retro ...">…</p></div>`).
   → Extract `<EmptyState title="…" body="…" />` to `src/components/shared/ui/EmptyState.tsx`. (Name chosen over `<ErrorCard>` from the original brief because these are "no active split" empty states, not errors.)

2. **Starfield decoration** — duplicated as `<div className="starfield" />` in `HubRightColumn.tsx:118`, `BracketView.tsx:220`, `OlimpoView.tsx:44`, `PixelLanding.tsx:58, 408`.
   → Extract `<BackgroundDecoration variant="starfield" />` to `src/components/shared/ui/BackgroundDecoration.tsx`. The component renders the same `<div className="starfield" />` today (CSS lives in `src/app/styles/pixel.css:364`); the wrapper centralizes future variants (e.g. scanline-only, fog).

3. **Section skeleton** for Suspense fallbacks — REQ-22 needs one. Today no `PageSkeleton` exists.
   → Add `<SectionSkeleton variant="standings" | "calendar" | "roster" | "bracket" | "olimpo" | "rightColumn" | "phaseBanner" | "newsRail" />` to `src/components/shared/ui/SectionSkeleton.tsx`. Each variant returns a sized placeholder that approximates the real panel's footprint to avoid CLS.

4. **`formatSplitName()` util** — `${season.toUpperCase()} · ${split.toUpperCase()}` is duplicated in `src/app/archivo/[season]/[split]/page.tsx:22, 47`, `src/components/shared/layout/hub/SeasonSplitChip.tsx:28`, `src/components/hub/PhaseBanner.tsx:34`, `src/components/hub/OlimpoView.tsx:47`, and similar.
   → Add `formatSeasonSplit(seasonName: string, splitName: string): string` to `src/lib/utils/formatters.ts` (new file or merge into an existing utils module — design.md picks). Returns `"${SEASON} · ${SPLIT}"`. The five call sites switch to the helper.

**Verification:**
- `./init.sh` green.
- `rg '"py-20 text-center"' src/app` returns zero hits.
- `rg 'className="starfield"' src` returns only the new `BackgroundDecoration.tsx` (one definition site).
- `rg 'toUpperCase\(\).*toUpperCase\(\)' src/components src/app` returns only `formatters.ts` (the rest call the helper).
- `<EmptyState>`, `<BackgroundDecoration>`, `<SectionSkeleton>`, and `formatSeasonSplit` are exported from `src/components/shared/index.ts` (or a dedicated barrel) and used by the call sites listed above.

---

## REQ-25 — Performance polish (image + animation audit)

**When** any `next/image` is rendered in the live `/hub` or `/archivo` tree, the system **shall** declare either explicit `width`/`height` **or** `fill` + `sizes`. **And when** any infinite-loop or JS-driven animation runs on a live page, the system **shall** prefer CSS keyframes over `motion`-driven `repeat: Infinity` to keep the React tree idle.

Live-tree audit (already performed; F5 only verifies and corrects):
- `<Image>` usages in live routes: exactly **one** — `src/components/shared/layout/hub/TopBar.tsx:46` with `width={40}` `height={40}`. **No `fill` images exist in `/hub` or `/archivo`.** The original brief item is largely a no-op here; this REQ becomes a guard ("verify and document, do not regress").
- Infinite `repeat: Number.POSITIVE_INFINITY` in live tree: **none**. The two occurrences (`Hero.tsx:72, 93`) are in `src/components/home/Hero/Hero.tsx`, which is dead code (not rendered by `src/app/page.tsx`, which renders `PixelLanding`). Out of scope; documented as cleanup debt.
- CSS `animation-delay` cap audit: `src/app/styles/animations.css` delays max at `0.4s` (line 147); `src/app/styles/clouds.css` uses long *negative* delays for phase-shifted continuous animations (intentional). Nothing to cap.
- Pokéball spin: `src/components/cross/PlayoffBracket.tsx:50-79` renders pure-CSS Pokéball decorations (no motion). Once that file is deleted (REQ-23.4), the brief's "CSS spin for Pokéballs" item is moot.

So REQ-25 narrows to two checks:

a. `next/image` audit — confirm `TopBar.tsx` keeps explicit dims; add an inline comment that future contributors must add `sizes` when using `fill`.
b. Animation audit — confirm no live route renders an `motion` infinite loop; document the dead `Hero.tsx` in `progress/history.md` so the next sweep cleans it up.

**Verification:**
- `./init.sh` green.
- `rg 'fill[^=]*=' src/app/hub src/app/archivo src/components/hub src/components/landing src/components/shared/layout/hub --type tsx` returns zero hits OR every hit also has a `sizes=` attribute on the same `<Image>`.
- `rg 'Number.POSITIVE_INFINITY' src/app/hub src/app/archivo src/components/hub src/components/landing src/components/shared/layout/hub` returns zero hits.
- `progress/history.md` gets an entry noting the dead `Hero.tsx`/`CurrentSeason.tsx`/`Navbar.tsx`/`LinkButton.tsx` cluster for a future sweep.

---

## Sequencing

- REQ-24 (primitives) lands **first** — REQ-22's Suspense fallbacks use `<SectionSkeleton>`, REQ-23's empty-state callers may want `<EmptyState>`, and REQ-21's archive metadata can adopt `formatSeasonSplit`.
- REQ-23 (client→server push) lands **before** REQ-22 (Suspense) to avoid re-doing the page wiring twice — once for Suspense, once for the client/server split.
- REQ-22 (Suspense) lands after REQ-23 so the streaming boundaries wrap the already-split components.
- REQ-21 (SSG archive) is independent of REQ-22/23/24 except for the cookie-free Supabase client work, which is internal to `src/lib/supabase/` and `src/lib/queries/archive.queries.ts` + `seasons.queries.ts`.
- REQ-25 (audit) is verification-only and runs last.

## Dependencies on other features

- **F4 (caching)** depends on REQ-22 — `'use cache'` directives need Suspense boundaries to be useful, and `cacheComponents` (deferred from F1/REQ-5) needs them too. F5 unblocks F4.
- F5 does **not** depend on F3.
