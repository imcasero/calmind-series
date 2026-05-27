# Requirements — Pixel Redesign · Batch FR0 (Visual foundation)

> Source: `docs/design_handoff_calmind_pixel/` (README + DESIGN_PROTOTYPE).
> Backlog: `features.json` FR0. Initiative: `pixel-redesign`.
> Notation: **EARS** — *When/While/If [condition], the system shall [action].*
> No test runner exists; each requirement names its **verification gate**
> (a check in `./init.sh` or a concrete manual step).

## Locked decisions (2026-05-27, user-approved)

These constrain the whole FR track, not just FR0:

1. **Routing:** full new IA — `/hub`, `/hub/*`, `/archivo/:season/:split`. Legacy
   `[season]/[split]`, `/cruces`, `/final` become the archive detail (FR9, with 301s).
2. **Trainer data:** use only `nickname` / `avatar_url` / `bio`. Signature **color is
   hashed from `id`**. No ELO, region, or real name (those design fields are dropped).
3. **`current_round`:** derived from `matches` (max round with `played = true` in the
   active split). No DB change.
4. **Editorial (News / Story Beat / countdown):** auto-generated from data; countdown
   hidden when no date exists. No new tables, no hand-maintained constants.

## FR0 — Visual foundation

> FR0 ships **no routes and no data**. It establishes the pixel design system and
> primitives, **scoped so the existing purple/legacy pages are not altered**.

### REQ-FR0-1 — Guardian unblocked from prototype files
**Because** the design handoff added non-conforming `.jsx`/`.css` under
`docs/design_handoff_calmind_pixel/`, **the system shall** exclude that directory
from Biome so `./init.sh` lint gate evaluates only first-party source.
- *Why:* `biome check .` now reports 54 errors sourced entirely from the prototype
  bundle (verified: `src` alone = 0 errors). The prototype is a read-only reference,
  not shipped code.
- *Verify:* `./init.sh --quick` reaches a green lint step; `pnpm exec biome check src`
  shows 0 errors.

### REQ-FR0-2 — Pixel design tokens
**When** a component opts into the pixel theme, **the system shall** expose the full
16-bit palette and font tokens as namespaced CSS variables (`--color-px-*`,
`--font-*`) defined in `src/app/styles/theme.css`.
- *Why:* single source of truth for the brand; mirrors `styles.css :root` from the
  handoff. Namespaced (`px-`) to avoid clobbering Tailwind defaults (e.g. `text-base`).
- *Verify:* `./init.sh` build succeeds; tokens resolve (manual: a `.pixel-root` block
  renders the void background + magenta/cyan/gold accents).

### REQ-FR0-3 — Retro fonts loaded
**The system shall** load **VT323** and **JetBrains Mono** via `next/font/google`
(alongside the existing Press Start 2P) and map them to `--font-*` theme tokens.
- *Why:* the handoff uses three families (pixel headings / VT323 body / mono numerals).
- *Verify:* `./init.sh` build succeeds (next/font self-hosts at build time, no layout
  shift); fonts referenced by `--font-*`.

### REQ-FR0-4 — Pixel effects stylesheet, scoped
**While** content is wrapped in a `.pixel-root` container, **the system shall** apply
the pixel aesthetic (void background, scanlines, vignette, starfield, CRT flicker,
blink, glitch, marquee, `pixel-frame` clip-path, hard stepped shadows, `hpbar`).
**The system shall not** alter the global `body` background or any page outside a
`.pixel-root` container.
- *Why:* the redesign and the legacy purple site must coexist until each route is
  migrated (FR2+). The prototype mounts scanlines "on the root container".
- *Verify:* `./init.sh` build succeeds; manual — legacy pages (`/`, `[season]/[split]`)
  look unchanged; a `.pixel-root` sandbox shows the new theme.

### REQ-FR0-5 — Pixel primitives
**The system shall** provide reusable, presentational pixel primitives under
`src/components/shared/ui/pixel/` — pixel icons (Arrow, Crown, Skull, Sword,
Lightning, Gem, Orb, Logo), `MonsterSprite`, `TrainerAvatar`, `PixelCard`,
`PixelBadge`, `PixelButton` — typed from `schemas.ts`-style conventions, **Server
Components by default** (no `'use client'` unless interactivity demands it).
- *Why:* the handoff's `ui.jsx` kit; these are the building blocks every later FR uses.
  `MonsterSprite`/`TrainerAvatar` are explicit placeholders (README §Fidelity).
- *Verify:* `./init.sh --quick` green (typecheck + lint clean on new files); components
  exported from a barrel and importable.

### REQ-FR0-6 — No regression
**The system shall not** change behavior or appearance of any existing route, query,
or admin screen in FR0.
- *Verify:* `./init.sh` full run green (typecheck + lint + production build); manual
  smoke of `/` and a split page shows no visual diff.

---

## FR1 — Phase machine + active context

> FR1 adds **pure logic + one server query + one client context**. Still no routes,
> no visual screens. It is the heart the rest of the redesign mutates off.

> **Correction to the locked decision wording:** `current_round` is derived from the
> max round with `played = true` across **all** matches in the split (any
> `match_group`), **not** just regular-season matches. Restricting to `regular`
> would cap the value at 14 and the phase could never advance to J15/J16/Olympus.
> The user's choice ("derive from matches, max played round") is honored; only my
> FR0 spec phrasing ("regular matches") is corrected here.

### REQ-FR1-1 — Phase machine
**When** given a round number, **the system shall** return a `Phase` describing the
tournament stage: `OFFSEASON` (≤0), `REGULAR` (1–14), `FINALS_J15` (15),
`FINALS_J16` (16), `OLYMPUS` (≥17) — each with a Spanish `label`, an accent `color`
(a `--color-px-*` CSS variable), and an `icon` glyph.
- *Why:* mirrors `data.jsx getPhase`; the README §"Phase machine" drives all UI
  mutation off this single function.
- *Verify:* `./init.sh` typecheck + build green; logic exercised by FR2/FR3 consumers.

### REQ-FR1-2 — Finals gate + progress
**The system shall** expose `isFinalsUnlocked(round)` (true when `round ≥ 15`) and
`progressPct(round)` (0–100, clamped) derived from `TOTAL_ROUNDS = 16`.
- *Why:* the TopBar phase chip shows a `Jx/16` progress bar (FR2) and the
  Bracket/Olimpo nav items are gated on `isFinalsUnlocked` (FR2).
- *Verify:* typecheck/build green; values consumed in FR2.

### REQ-FR1-3 — Current round derivation
**When** resolving the active split's progress, **the system shall** provide
`getCurrentRound(splitId)` returning the highest `round` among that split's matches
with `played = true` (across all match groups), or `0` when none are played.
**The system shall** follow the repo query convention (`react.cache`, returns a safe
default and logs `[getCurrentRound] Error:` on failure — never throws to the UI).
- *Why:* the locked decision; no DB change. `0` ⇒ OFFSEASON before the split starts.
- *Known limitation (note, not a bug):* finals nav unlocks only once a J15 result is
  recorded, not at the moment the admin *generates* J15 fixtures. Refining the unlock
  to "J15 matches exist" is deferred to FR7 when the bracket consumes match rows.
- *Verify:* typecheck/build green; manual — a split with results up to round N returns N.

### REQ-FR1-4 — Deterministic trainer color
**The system shall** provide `trainerColor(id)` returning a stable signature color
for a trainer, hashed deterministically from the trainer `id` over a fixed 8-color
pixel palette.
- *Why:* trainers have no `color` column (locked decision); the same id must always
  map to the same color across sessions and components.
- *Verify:* typecheck/build green; manual — same id ⇒ same color on repeated calls.

### REQ-FR1-5 — Phase context provider
**While** a redesign screen is mounted under a `PhaseProvider`, **the system shall**
expose, via a `usePhase()` hook, the `currentRound`, derived `phase`,
`isFinalsUnlocked`, and `progressPct`, seeded from a server-resolved round.
**The provider shall** keep the round in client state with a setter, so FR10 realtime
can update the phase without a page reload.
- *Why:* README §"State Management" + §"Realtime"; the chip/nav/hub mutate off one
  shared context, not per-component recomputation.
- *Verify:* typecheck/build green; `usePhase` outside a provider throws a clear error.

### REQ-FR1-6 — No regression
**The system shall not** alter any existing route, query, component, or the legacy
theme in FR1 (new files + one query export are additive).
- *Verify:* `./init.sh` full green; `/` and a split page unchanged.

---

## FR2 — Shell (TopBar + marquee + nav gating)

> First FR that renders UI. Builds the redesign shell on `/hub` (segment layout)
> + a placeholder page; FR3 fills the dashboard. Interim: only `/hub` resolves —
> the other nav targets (`/hub/clasificacion`, `/calendario`, `/bracket`,
> `/olimpo`, `/archivo`) 404 until their FR lands. The redesign is not yet linked
> from the live site, so this is reachable only by typing the URL.

### REQ-FR2-1 — Redesign shell
**When** a route under `/hub` renders, **the system shall** wrap it in a
`PhaseProvider` (seeded by `getCurrentRound` of the active split) inside a
`.pixel-root .scanlines` container with a sticky `TopBar`, a `MarqueeStrip`, and a
1280px content `<main>`.
- *Verify:* `./init.sh` build green; `/hub` renders the shell.

### REQ-FR2-2 — TopBar
**The system shall** render a sticky top bar with logo + `CALMIND` wordmark, the
Season/Split chip, the phase chip, the nav, and a magenta `► INSCRÍBETE` CTA,
transitioning from transparent to a blurred backdrop once scrolled (> 8px).
- *Verify:* manual — bar sticks; backdrop appears on scroll.

### REQ-FR2-3 — Season/Split chip
**The system shall** show `S04 · SP2` + `LIVE` for the active split and, on click,
open a dropdown listing every season and its splits; selecting the active split
routes to `/hub`, any other to `/archivo/:season/:split`. The chip always reflects
the live split.
- *Data:* `getAllSeasonsWithSplits()` (one query). *Verify:* dropdown opens/closes,
  active split is filled magenta with `●`, past splits are ghost with `✓`.

### REQ-FR2-4 — Phase chip
**The system shall** show the current phase icon + label + a `J{round}/16` progress
bar, read from `usePhase()` (so FR10 realtime repaints it).
- *Verify:* chip color/label match `getPhase(currentRound)`.

### REQ-FR2-5 — Nav gating
**While** `current_round < 15`, **the system shall** render the Bracket and Olimpo
nav items locked (`🔒` prefix, faint color, `cursor: not-allowed`, tooltip
"Se desbloquea en J15") and non-clickable; the active item gets gold top/bottom
borders. Lock state reads from the centralized phase machine, not per-item hardcode.
- *Verify:* in REGULAR phase Bracket/Olimpo are locked; active route highlighted.

### REQ-FR2-6 — Marquee
**The system shall** scroll an auto-generated status strip (phase, round, division
leaders, finals lock state) below the bar, built server-side from existing data.
- *Verify:* strip loops seamlessly; leaders match standings.

### REQ-FR2-7 — No regression
**The system shall not** modify the root layout, legacy pages, or existing queries;
`.pixel-root` (opaque, `width:100%`) covers the legacy clouds without root changes.
- *Verify:* `/` and a split page unchanged; `./init.sh` full green.
- *Known interim:* the global legacy `Footer` still renders below `/hub` content;
  a pixel footer + clouds suppression for `/hub` is deferred (needs root-layout
  restructuring, done when legacy routes migrate to `/archivo`).

---

## FR3 — Hub master dashboard (`/hub`)

> Replaces the FR2 placeholder. All sections are Server Components fed by
> server-resolved data; phase-dependent visuals read the server-resolved
> `currentRound`/`phase` (live repaint is deferred to FR10 holistically).
> **Decision (2026-05-27):** standings use position zones for the row accent +
> lives as a secondary indicator.

### REQ-FR3-1 — Phase banner
**The system shall** render the phase icon tile, season/split badge, phase title,
and a 16-cell round progress strip (rounds 15–16 widened; current cell blinks,
past filled, future outlined).
- *Verify:* build green; cells reflect `currentRound`.

### REQ-FR3-2 — Story beat
**The system shall** render an auto-generated headline (from `buildStoryBeat`) with
a lightning icon and a `VER J{round} ►` link to the calendar.
- *Verify:* headline reflects the D1 leader / round.

### REQ-FR3-3 — Live standings (dual)
**The system shall** render two division panels (D1 magenta, D2 cyan); each row
shows position, signature-color swatch, nickname, last-3 streak pips, a `♥ lives`
indicator, and total points, with a left zone border (1–4 gold / 5–6 neutral /
7–8 red) and a zone legend footer. Rows link to `/hub/entrenador/:id`.
- *Data:* `getDivisionPreview` + streak derived from `getMatchesByRound`.
- *Verify:* zones/streak/points/lives match the data; rows are links.

### REQ-FR3-4 — Projected bracket teaser
**The system shall** render a dashed-gold teaser with D1/D2 Gran Final slots
(#1 vs #2) and a projected Olimpo line (D1 pos-7 survivor vs D2 champion), an
`EXPANDIR ►` link to `/hub/bracket`, and projected/official framing by phase.
- *Verify:* slots reflect standings; eyebrow flips at J15.

### REQ-FR3-5 — Right column
**The system shall** render a live-feed card (current round, ● LIVE), a last-results
card (previous round, crown on winner), and an Olympus projection card (two
MonsterSprites + VS, starfield).
- *Verify:* feed/results pull the right rounds from `getMatchesByRound`.

### REQ-FR3-6 — News rail
**The system shall** render up to four auto-generated announcement cards
(`buildNews`) with tone-coded tags.
- *Verify:* cards reflect leaders / exile / phase.

### REQ-FR3-7 — No regression
**The system shall not** alter existing routes/queries; the offseason case (no
active split) renders a graceful empty state.
- *Verify:* `./init.sh` full green; `/` and split pages unchanged.

---

## FR4 — Standings page (`/hub/clasificacion`)

### REQ-FR4-1 — Full standings
**The system shall** render both divisions' full standings via a tab toggle, with
columns `# · ENTRENADOR · PG · PP · PT · RACHA · ZONA` (★ for position 1, avatar +
nickname, 5 streak pips, zone chip), rows linking to the trainer profile.
- *Adjustment:* ELO/region/real-name columns are **omitted** (no DB backing).
- *Data:* `getDivisionPreview` + PG/PP from `winLossRecord` (set scores) + streak.
- *Verify:* build green; tab switches divisions; values match.

### REQ-FR4-2 — Zone explainers
**The system shall** render three zone cards (Título/Neutral/Exilio) below the table.

### REQ-FR4-3 — No regression
**The system shall** render an empty state in offseason; `./init.sh` full green.
</content>
</invoke>
