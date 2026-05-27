# Design — Pixel Redesign · Batch FR0

Maps each FR0 requirement to concrete files and the pattern to use.
Read alongside `docs/conventions.md` and the handoff `README.md`.

## Stack translation (handoff → this repo)

The handoff README assumes **Vite + React Router + client hooks**. This repo is
**Next.js 16 App Router + RSC + server queries (`react.cache`) + Tailwind v4 (`@theme`)
+ Biome**. FR0 only touches CSS/fonts/presentational components, so the translation is:

| Handoff | Here |
|---|---|
| `styles.css :root` CSS vars | `theme.css` `@theme { --color-px-* }` (Tailwind v4 tokens) |
| inline-style components | presentational `.tsx` + pixel.css classes, RSC by default |
| global `body` dark theme | **scoped** `.pixel-root` wrapper (legacy pages untouched) |
| `window`-exposed globals | named exports + barrel `index.ts` |

## REQ-FR0-1 — Biome exclusion

**File:** `biome.json` → `files.includes`.
- Append `"!**/docs/design_handoff_calmind_pixel/**"` to the negated-glob list.
- Keep the rest of the array as-is. Do **not** broaden to `!docs/**` (future docs may
  contain lintable snippets we *do* want checked); scope to the prototype bundle only.

## REQ-FR0-2 — Tokens

**File:** `src/app/styles/theme.css` (existing `@theme` block).
- Add, inside the existing `@theme {}`, the namespaced palette + fonts:
  - Backgrounds: `--color-px-void/deep/base/elev/elev2`
  - Ink: `--color-px-ink/ink-soft/ink-dim/ink-faint`
  - Accents: `--color-px-magenta(-2)/cyan(-2)/gold(-2)/danger/success/lime`
  - Borders: `--color-px-border` (was `--pixel`), `--color-px-border-hi` (was `--pixel-hi`)
  - Fonts: `--font-pixel: var(--font-pokemon)`, `--font-retro: var(--font-vt323)`,
    `--font-num: var(--font-jetbrains)`
- **Naming rule:** `px-` prefix avoids collisions (`--color-base` would generate the
  reserved `text-base` utility). Hex values are copied verbatim from the handoff.

## REQ-FR0-3 — Fonts

**File:** `src/app/layout.tsx`.
- Add `VT323` (weight 400) and `JetBrains_Mono` from `next/font/google`, with
  `variable: '--font-vt323'` and `'--font-jetbrains'`.
- Append both `.variable` classes to the `<body className>` (next to `pressStart2P.variable`).
- `display: 'swap'` is the next/font default; keep it.

## REQ-FR0-4 — pixel.css

**Files:** new `src/app/styles/pixel.css`; import in `src/app/globals.css` (after theme).
- `.pixel-root` — sets `background` (void + radial magenta/cyan glows), `color: var(--color-px-ink)`,
  `font-family: var(--font-retro)`, `min-height: 100%`, `image-rendering: pixelated`.
  This is the opt-in theme container; **nothing here targets bare `html`/`body`**.
- Port from `styles.css`, rewriting every `var(--magenta)` → `var(--color-px-magenta)` etc.:
  `.scanlines::before/::after`, `.starfield`, `.crt`, `.blink`, `.glitch`, `.marquee-track`,
  `.pixel-frame` (clip-path), `.pixel-border(-thin/-hi)`, `.hpbar(.mid/.low)`, `.eyebrow`,
  `.title-stack/.title-chunk`.
- All animations use `steps(2)` (stepped, no smooth easing) — brand requirement.

## REQ-FR0-5 — Primitives

**Dir:** `src/components/shared/ui/pixel/`.
- `PixelIcons.tsx` — one component per glyph (`PixelArrow`, `PixelCrown`, `PixelSkull`,
  `PixelSword`, `PixelLightning`, `PixelGem`, `PixelOrb`, `PixelLogo`). Pure SVG from
  `ui.jsx` grid maps. Props: `{ size?: number; color?: string }` (+ `direction` for Arrow).
  Stable keys `${x}-${y}` (no array-index keys). RSC (no hooks).
- `MonsterSprite.tsx` — 4 `variant` maps, `{ size?, variant?, color? }`. Placeholder
  (README §Fidelity). RSC.
- `TrainerAvatar.tsx` — procedural cap, `{ color: string; size?; ring? }`. Caller passes
  the hashed color (FR1 provides the hash util; FR0 just accepts a `color` prop). RSC.
- `PixelCard.tsx` — wrapper `{ children; accent?; interactive?; className? }`. Hover lift
  is **CSS** (`.pixel-card:hover`), so it stays a Server Component (no `useState` like the
  prototype).
- `PixelBadge.tsx` — `{ children; tone?: 'default'|'magenta'|'cyan'|'gold'|'success'|'danger' }`
  → maps to a `.pixel-badge--<tone>` class.
- `PixelButton.tsx` — `{ children; variant?: 'default'|'primary'|'ghost'; size?: 'sm'|'md';
  href?; onClick? }`. If `href`, render `next/link`; else `<button type="button">`
  (satisfies `a11y/useButtonType`).
- `index.ts` — barrel re-exporting all of the above.
- Styling: prefer Tailwind utilities using the `px-` tokens (`bg-px-elev`, `border-px-border`)
  plus the shared `pixel.css` classes for the chunky shadow/frame patterns.

## REQ-FR0-6 — No regression

- FR0 adds files + tokens + one scoped stylesheet; it edits `layout.tsx` only to add
  font variables (additive). No existing component, query, or route logic changes.
- The new primitives are exported but unimported by any page in FR0 — Biome flags unused
  *locals*, not unused *exports*, so this stays lint-clean.

## Verification (FR0)

- `./init.sh` (full) must be green: typecheck → lint (0 errors) → production build.
- Manual: `/` and `/<season>/<split>` visually unchanged; a temporary `.pixel-root`
  sandbox renders the void theme + a few primitives correctly.

---

# Design — Pixel Redesign · Batch FR1

## REQ-FR1-1/2 — `src/lib/utils/phase.ts`

Pure module, no React, importable from both Server and Client.

```ts
export const TOTAL_ROUNDS = 16;
export const FINALS_START_ROUND = 15;
export type PhaseId = 'OFFSEASON' | 'REGULAR' | 'FINALS_J15' | 'FINALS_J16' | 'OLYMPUS';
export interface Phase { id: PhaseId; label: string; color: string; icon: string; }
export function getPhase(round: number): Phase;       // table from REQ-FR1-1
export function isFinalsUnlocked(round: number): boolean; // round >= FINALS_START_ROUND
export function progressPct(round: number): number;  // clamp(round / TOTAL_ROUNDS * 100, 0, 100)
```
- `color` returns the CSS var string (`'var(--color-px-cyan)'` etc.) so it drops into
  inline styles and arbitrary-value utilities. Labels are Spanish UI copy.
- `icon` is the prototype glyph (`○ ► ⚔ ★ ♛`); components may later swap for a
  `PixelIcons` glyph, but the util stays JSX-free.

## REQ-FR1-3 — `getCurrentRound(splitId)`

New file `src/lib/queries/tournament.queries.ts`; export from `queries/index.ts`.
Pattern copied from `leagues.queries.ts` (`cache`, `createClient`, safe default + log).

```ts
export const getCurrentRound = cache(async (splitId: string): Promise<number> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('matches')
    .select('round')
    .eq('split_id', splitId)
    .eq('played', true)
    .order('round', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error('[getCurrentRound] Error:', error.message); return 0; }
  return data?.round ?? 0;
});
```

## REQ-FR1-4 — `src/lib/utils/trainerColor.ts`

```ts
// The 8 signature colors the prototype data.jsx rotated through.
const TRAINER_COLORS = ['#ff3df8','#3df8ff','#ffd83d','#b6ff3d','#ff7b3d','#a774ff','#ff3d6e','#3dff8a'] as const;
function hashString(s: string): number { /* FNV-ish, deterministic */ }
export function trainerColor(id: string): string; // TRAINER_COLORS[hash % len]
```
- Returns raw hex (not a px token) because the palette includes orange/purple not in
  the token set, and hex works directly in SVG `fill` + inline styles (`TrainerAvatar`).

## REQ-FR1-5 — `src/components/providers/PhaseProvider.tsx`

`'use client'`. Context + `usePhase()` hook.

```tsx
interface PhaseContextValue {
  currentRound: number;
  setCurrentRound: (round: number) => void; // FR10 realtime hook
  phase: Phase;
  isFinalsUnlocked: boolean;
  progressPct: number;
}
export function PhaseProvider({ initialRound, children }: { initialRound: number; children: ReactNode });
export function usePhase(): PhaseContextValue; // throws if used outside provider
```
- `useState(initialRound)` + `useEffect` to resync when `initialRound` changes (split
  switch without remount). Derived values via `useMemo`.
- Lives in a new `components/providers/` dir; **not** added to the `shared` barrel
  (keeps the client boundary explicit). Consumed by FR3's `/hub` layout.

## Verification (FR1)

- `./init.sh` full green. No route/component/query behavior changes; only additive files
  + one new export line in `queries/index.ts`.

---

# Design — Pixel Redesign · Batch FR2

## Routing & data

- New segment `src/app/hub/` with `layout.tsx` (the shell) + `page.tsx` (placeholder).
- `layout.tsx` (RSC) resolves in parallel: `getActiveSeasonWithSplit`,
  `getCurrentRound(splitId)`, `getAllSeasonsWithSplits`, `getDivisionPreview(splitId)`.
  Seeds `PhaseProvider initialRound`. Builds marquee items from phase + leaders.
- `getAllSeasonsWithSplits()` added to `seasons.queries.ts` (seasons `*, splits(*)`,
  newest first, splits by `split_order`); exported from `queries/index.ts`.
- Hub routes added to `ROUTES` (`hub`, `hubStandings`, `hubCalendar`, `hubRoster`,
  `hubTrainer(id)`, `hubBracket`, `hubOlimpo`, `archive`, `archiveDetail(s,sp)`).
- `HUB_NAV` constant in `src/lib/constants/hubNav.ts` (README §1 order; `gated` flags).

## Components — `src/components/shared/layout/hub/`

| File | Boundary | Notes |
|---|---|---|
| `TopBar.tsx` | `'use client'` | scroll→backdrop state; composes the others; logo via `/CalmindSeriesLogo.png` |
| `SeasonSplitChip.tsx` | `'use client'` | dropdown (`useState`), click-away overlay button, active→/hub vs past→/archivo |
| `PhaseChip.tsx` | `'use client'` | `usePhase()`; phase color via inline style (CSS var), `J{round}/16` |
| `HubNav.tsx` | `'use client'` | `usePathname()` active + `usePhase().isFinalsUnlocked` gating |
| `MarqueeStrip.tsx` | RSC | presentational; sequence duplicated for the CSS `-50%` loop |
| `PhaseProvider` | `'use client'` (FR1) | wraps the layout; **not** in the `shared` barrel |

## Styling

- Pixel palette + fonts via Tailwind v4 token utilities generated from FR0 tokens:
  `bg-px-*`, `text-px-*`, `border-px-*`, `font-pixel/retro/num`. Composite patterns
  (`pixel-btn*`, `.marquee-track`) come from `pixel.css`.
- `.pixel-root` gained `width: 100%` (FR0 edit) so it spans the flex-centered `body`.

## Verification (FR2)

- `./init.sh` full green; `/hub` present in the route manifest (`ƒ /hub`).
- Manual: legacy `/` and split pages unchanged.

---

# Design — Pixel Redesign · Batch FR3

## Utilities

- `src/lib/utils/standings.ts`: `zoneForPosition` (1–4/5–6/7–8 → gold/neutral/red),
  `ZONES`, `recentStreak(trainerId, matches, limit)` (W/L from played matches).
- `src/lib/utils/editorial.ts`: `buildStoryBeat(preview, round)`,
  `buildNews(preview, round)` → `NewsItem[]`. Pure, derive from standings.

## Sections — `src/components/hub/` (all RSC)

| File | Inputs | Notes |
|---|---|---|
| `PhaseBanner` | phase, currentRound, season, split | 16-cell progress strip, finals widened |
| `StoryBeat` | text, currentRound | lightning icon + ghost CTA → calendar |
| `StandingsLive` | preview, matches | internal `DivisionPanel`/`StandingRow`/`StreakPip`; zones + lives + streak; rows → `hubTrainer(id)` |
| `ProjectedBracketTeaser` | preview, currentRound | dashed gold; #1v#2 slots + projected Olimpo line |
| `HubRightColumn` | matchesByRound, preview, currentRound | live feed / last results (crown winner) / Olympus card (starfield + MonsterSprites) |
| `NewsRail` | NewsItem[] | tone-coded `PixelBadge` tags |

## Page

`app/hub/page.tsx` (RSC): guards offseason (no active split → empty state); else
parallel `getCurrentRound` + `getDivisionPreview` + `getMatchesByRound`, derives
phase + story + news, composes the sections in a `1fr / 340px` grid.

## Verification (FR3)

- `./init.sh` full green; 14 pages built. Legacy routes unchanged.
- Signature colors via `trainerColor(id)`; primitives from `ui/pixel`.
</content>
