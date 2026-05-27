# Tasks — Pixel Redesign · Batch FR0

Atomic checklist. Spec approved 2026-05-27 (user selected "Persistir + arrancar FR0").
Check off as they land; log decisions in `progress/history.md`.

## Pre-flight
- [x] `./init.sh --quick` run — **RED**: 54 biome errors, all from
      `docs/design_handoff_calmind_pixel/` prototype JSX. `src` alone = 0 errors / 35
      pre-existing warnings (F2 dead-code). Root cause isolated.

## REQ-FR0-1 — Unblock guardian
- [x] `biome.json`: added `"!**/docs/design_handoff_calmind_pixel"` to `files.includes`
      (folder pattern, no `/**` — `useBiomeIgnoreFolder` rule).
- [x] Verified `pnpm exec biome check src` = 0 errors and `pnpm lint` passes.

## REQ-FR0-2 — Tokens
- [x] `theme.css`: added `--color-px-*` palette (bg/ink/accents/borders) inside `@theme`.
- [x] `theme.css`: added `--font-pixel`, `--font-retro`, `--font-num` mapping to next/font vars.

## REQ-FR0-3 — Fonts
- [x] `layout.tsx`: imported `VT323` + `JetBrains_Mono` from `next/font/google`
      (`--font-vt323`, `--font-jetbrains`); appended `.variable` to `<body>`.

## REQ-FR0-4 — pixel.css (scoped)
- [x] Created `src/app/styles/pixel.css` with `.pixel-root` + ported effect classes
      (scanlines, vignette, starfield, crt, blink, glitch, marquee, pixel-frame,
      pixel-border*, card/badge/btn, hpbar, eyebrow, title-stack) using `--color-px-*`.
- [x] `globals.css`: `@import "./styles/pixel.css";` after theme.
- [x] Confirmed NO rule targets bare `html`/`body` (only `.pixel-root` + opt-in classes).

## REQ-FR0-5 — Primitives
- [x] `components/shared/ui/pixel/PixelGrid.tsx` (shared ASCII→SVG renderer).
- [x] `.../pixel/PixelIcons.tsx` (Arrow/Crown/Skull/Sword/Lightning/Gem/Orb/Logo).
- [x] `.../pixel/MonsterSprite.tsx` (4 variants, placeholder).
- [x] `.../pixel/TrainerAvatar.tsx` (accepts `color` prop; hash comes in FR1).
- [x] `.../pixel/PixelCard.tsx` (CSS hover, RSC).
- [x] `.../pixel/PixelBadge.tsx` (tone variants).
- [x] `.../pixel/PixelButton.tsx` (link/button, `useButtonType`-safe).
- [x] `.../pixel/index.ts` barrel.

## REQ-FR0-6 — Verify green
- [x] `./init.sh` (full) green: typecheck + lint (0 errors / 35 pre-existing F2 warnings) + build.
- [ ] Manual smoke: `/` and a split page unchanged. *(code path additive only; awaiting user visual confirm)*

## Out of scope for FR0 (do NOT touch)
- Any route, query, phase machine, or data wiring → FR1+.
- `trainerColor()` hash util → FR1 (FR0 `TrainerAvatar` just takes a `color` prop).
- Realtime, providers, contexts → FR1/FR10.

---

# Tasks — Pixel Redesign · Batch FR1 (Phase machine + active context)

## Pre-flight
- [x] `./init.sh --quick` green before starting FR1.

## REQ-FR1-1/2 — phase.ts
- [x] `src/lib/utils/phase.ts`: `TOTAL_ROUNDS`, `FINALS_START_ROUND`, `PhaseId`,
      `Phase`, `getPhase`, `isFinalsUnlocked`, `progressPct`.

## REQ-FR1-3 — getCurrentRound
- [x] `src/lib/queries/tournament.queries.ts`: `getCurrentRound(splitId)` (cache, safe
      default 0, log on error; max played round across all match groups).
- [x] Exported from `src/lib/queries/index.ts`.

## REQ-FR1-4 — trainerColor
- [x] `src/lib/utils/trainerColor.ts`: deterministic id → 8-color palette hash.

## REQ-FR1-5 — PhaseProvider
- [x] `src/components/providers/PhaseProvider.tsx` (`'use client'`): context +
      `usePhase()` (throws outside provider); `initialRound` prop, state + setter +
      `useMemo` derivations, `useEffect` resync.

## REQ-FR1-6 — Verify green
- [x] `./init.sh` (full) green: typecheck + lint (0 errors / 35 pre-existing warnings) + build.
- [ ] No regression: `/` and a split page unchanged. *(additive only; awaiting user visual confirm)*

---

# Tasks — Pixel Redesign · Batch FR2 (Shell)

## Pre-flight
- [x] `./init.sh --quick` green before starting FR2.

## Data + routing
- [x] `getAllSeasonsWithSplits()` in `seasons.queries.ts`; exported from `queries/index.ts`.
- [x] Hub + archive routes added to `ROUTES` (`routes.ts`).
- [x] `HUB_NAV` constant (`src/lib/constants/hubNav.ts`).

## Components (`src/components/shared/layout/hub/`)
- [x] `MarqueeStrip.tsx` (RSC, duplicated loop, keyed by composed id).
- [x] `PhaseChip.tsx` (`usePhase`, progress bar).
- [x] `HubNav.tsx` (`usePathname` active + `usePhase` gating, lock + tooltip).
- [x] `SeasonSplitChip.tsx` (dropdown, active→/hub vs past→/archivo).
- [x] `TopBar.tsx` (sticky, scroll backdrop, composes the above + CTA).

## Shell route
- [x] `src/app/hub/layout.tsx` (RSC shell: parallel data, PhaseProvider, marquee builder).
- [x] `src/app/hub/page.tsx` (FR3 placeholder).
- [x] `.pixel-root` gained `width: 100%` (covers flex-centered body).

## Verify green
- [x] `./init.sh` full green; `/hub` in route manifest.
- [ ] Manual smoke: `/hub` shell renders; `/` + split pages unchanged. *(awaiting user visual confirm)*

## Interim notes (not bugs)
- Nav targets other than `/hub` 404 until their FR (FR4/FR5/FR7/FR8/FR9).
- Legacy `Footer` still renders below `/hub`; pixel footer deferred.

---

# Tasks — Pixel Redesign · Batch FR3 (Hub dashboard)

## Pre-flight
- [x] `./init.sh --quick` green; lives-vs-zones decision captured (zones + lives indicator).

## Utilities
- [x] `src/lib/utils/standings.ts` (`zoneForPosition`, `ZONES`, `recentStreak`).
- [x] `src/lib/utils/editorial.ts` (`buildStoryBeat`, `buildNews`).

## Sections (`src/components/hub/`)
- [x] `PhaseBanner.tsx` (round progress strip).
- [x] `StoryBeat.tsx`.
- [x] `StandingsLive.tsx` (dual panels, zones + streak + lives, rows → trainer).
- [x] `ProjectedBracketTeaser.tsx`.
- [x] `HubRightColumn.tsx` (live feed / last results / Olympus projection).
- [x] `NewsRail.tsx`.
- [x] `index.ts` barrel.

## Page
- [x] `app/hub/page.tsx` composes the sections; offseason empty state.

## Verify green
- [x] `./init.sh` full green; 14 pages built.
- [ ] Manual smoke: `/hub` dashboard renders with real data. *(awaiting user visual confirm)*

---

# Tasks — Pixel Redesign · Batch FR4 (Clasificación)

- [x] `standings.ts`: `winLossRecord` (PG/PP from set scores), `StandingRowVM`,
      `buildStandingRows` (color + pg/pp + 5-streak + zone).
- [x] `HubPageHeader.tsx` (reusable eyebrow + title).
- [x] `ZoneCards.tsx` (3 zone explainers).
- [x] `ClasificacionView.tsx` (`'use client'`): division tabs + full table
      (★ for #1, avatar + nickname, PG/PP/PT, 5 streak pips, zone chip; rows → trainer).
- [x] `app/hub/clasificacion/page.tsx` (server: builds rows for both divisions).
- [x] hub barrel updated.
- [x] `./init.sh` full green; `/hub/clasificacion` in manifest (15 pages).
- Adjustments: ELO/region/real-name columns omitted (no DB backing).

---

# Tasks — Pixel Redesign · Batch FR5 (Calendario)

- [x] `components/hub/CalendarView.tsx` (`'use client'`): 16-round timeline (phase
      colors, current blink, future dim), focus state, D1/D2 match columns, legend.
- [x] `app/hub/calendario/page.tsx` (server: `getMatchesByRound` + `getCurrentRound`).
- [x] hub barrel updated; `./init.sh` full green (16 pages).
- DECIDE (default): no per-round date in DB → show "Domingo · 18:00 CEST" cadence,
  not fabricated dates. Real dates would need a `scheduled_at` column.

---

# Tasks — Pixel Redesign · Batch FR6 (Roster + Profile)

- [x] `queries/trainers.queries.ts`: `getTrainerById` (+ export).
- [x] `standings.ts`: `spriteVariant`, `RosterCardVM`/`buildRosterCards`,
      `RecentMatchVM`/`trainerRecentMatches`.
- [x] `components/hub/RosterView.tsx` (`'use client'`): TODOS/D1/D2 filters + card grid.
- [x] `components/hub/TrainerProfile.tsx` (RSC): hero + 5 stat tiles + locked team +
      recent history + bio.
- [x] `app/hub/entrenadores/page.tsx` + `app/hub/entrenador/[id]/page.tsx` (dynamic).
- [x] hub barrel updated; `./init.sh` full green (17 pages).
- Adjustments: ELO/region/real-name omitted; team-reveal slots locked (`?`) — no
  `matches.metadata` shape defined yet. Bio uses the real `trainers.bio` column.
</content>
