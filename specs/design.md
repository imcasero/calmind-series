# F5 — Performance / modernización · Design

> Companion to `specs/requirements.md` (REQ-21..REQ-25). F5 is **mostly a refactor + structural batch**: no new domain logic, no new queries (one new Supabase client helper), no new dependencies.

## Scope decisions (locked 2026-05-28)

Recorded here so the Implementer doesn't re-relitigate them.

1. **F5 retargets to `/hub/*` and `/archivo/*`.** The legacy `[season]/[split]/page.tsx` (and `cruces`/`final`) are redirect stubs (verified `src/app/[season]/[split]/page.tsx:14-27`). Do not modify them.
2. **`generateStaticParams` only on `/archivo/[season]/[split]`** — past data, fully SSG-able. No `generateStaticParams` on `/hub` (it's a fixed path with no `[param]`) or any hub subroute (live data; F4 will handle with `'use cache'` + `cacheTag`).
3. **Granular Suspense on `/hub/*`** — one boundary per panel, each panel does its own `Promise.all` inside an async leaf. Top-level page only awaits the cheap `getActiveSeasonWithSplit()` to decide the empty state vs render.
4. **Pragmatic `'use client'` push** — only files where the bulk is presentational and the state is a single small slice (tabs/filters/timeline). The three live targets are `ClasificacionView`, `RosterView`, `CalendarView`. `PlayoffBracket` + `MatchupCard` (named in the original brief) are dead code — F5 deletes them rather than refactor unreachable code.
5. **Pre-existing 2 noUnusedImports warnings (`fetchData.ts:5`, `matchService.ts:5`) stay** — F4 owns them. F5 does not patch them.

---

## REQ-21 — Static generation of archive split pages

### Files to touch

| Path | Change |
|---|---|
| `src/app/archivo/[season]/[split]/page.tsx` | Add `generateStaticParams`, `export const dynamicParams = true`. Adopt `formatSeasonSplit` (REQ-24). |
| `src/lib/supabase/server.ts` | **No change in default export.** Add a new helper alongside it (next row). |
| `src/lib/supabase/public.ts` | **NEW.** Export `createPublicClient()` — anon Supabase client that **does not call `cookies()`**. Read-only, suitable for static rendering. |
| `src/lib/queries/archive.queries.ts` | Swap `createClient` → `createPublicClient` (no auth needed for archive reads — RLS policies must allow anon SELECT on `matches`/`trainers`, which they already do since the data is read by anon RSCs today). |
| `src/lib/queries/seasons.queries.ts` | Add `getArchiveSplitParams(): Promise<Array<{ season: string; split: string }>>` next to `getAllSeasonsWithSplits`. This is the cookie-free helper specifically for `generateStaticParams`. **Uses `createPublicClient`** to keep the call eligible for build-time static generation. Returns lowercased URL-shaped pairs (`{ season: season.name.toLowerCase(), split: split.name.toLowerCase() }`) for every split, including the active one (the active split's archive URL is still navigable — `getSplitByNames` matches case-insensitively). |
| `src/lib/queries/index.ts` | Export `getArchiveSplitParams`. |

### Cookie blocker — the real reason this is non-trivial

`src/lib/supabase/server.ts:6-7` calls `await cookies()` from `next/headers`. In Next 16 / React Server Components, **reading `cookies()` opts a route out of static rendering** (even with `generateStaticParams`). Without addressing this, `generateStaticParams` would emit the URLs but `pnpm build` would still mark the route "λ (Dynamic)".

**Solution:** introduce `createPublicClient()` — a thin client built with `createBrowserClient`-equivalent server-side: `createServerClient(url, anonKey, { cookies: { getAll: () => [], setAll: () => {} } })`. This satisfies `@supabase/ssr`'s contract without ever calling `cookies()`. Archive queries (`getArchiveChampions`, `getDivisionPreview` when called from archive, `getSplitByNames`, the new `getArchiveSplitParams`) use it; all admin / auth-aware paths continue to use the cookie-aware default.

**Risk:** `getDivisionPreview` is also used by `/hub` and `PixelShell`, where session-aware reads are fine. To keep blast radius minimal:
- Option A (preferred): keep `getDivisionPreview` on the cookie-aware client; for the archive page only, accept the route stays dynamic on the data fetch step but `generateStaticParams` is still useful because Next will still treat the URL as known. **Reject** — the brief is explicit ("El build debe mostrar páginas SSG nuevas para `/archivo/[season]/[split]`"), and an SSG promise broken by `cookies()` is no promise.
- Option B: split `getDivisionPreview` into `getDivisionPreviewPublic` (cookie-free) and a session-aware re-export. **Accept** — but the diff bloats. **Reject for simplicity.**
- Option C (chosen): make `createClient()` in `lib/supabase/server.ts` accept an optional `{ session?: false }` flag that returns the cookie-free variant. Archive queries call `createClient({ session: false })`. Keeps a single helper, minimal diff. **Verify against `vercel:nextjs` for the Next 16 `cookies()`-vs-SSG interaction** before writing code — if Next 16 introduced a different escape (e.g. `'use cache'` + `cacheLife('max')` on the query itself), prefer that.

The Implementer **must** verify Option C's framework behavior live (Next 16 + React 19.2 + Supabase SSR) before settling. If the verification surfaces a cleaner path, document the deviation in `progress/history.md` and proceed; don't block.

### Diff sketch

```ts
// src/app/archivo/[season]/[split]/page.tsx
import { getArchiveSplitParams } from '@/lib/queries';

export async function generateStaticParams() {
  return getArchiveSplitParams();
}
export const dynamicParams = true;
```

```ts
// src/lib/queries/seasons.queries.ts (new export)
export const getArchiveSplitParams = cache(async (): Promise<Array<{ season: string; split: string }>> => {
  const supabase = await createClient({ session: false }); // or createPublicClient()
  const { data, error } = await supabase
    .from('seasons')
    .select('name, splits(name)')
    .order('year', { ascending: false });
  if (error || !data) return [];
  return data.flatMap((season) =>
    (season.splits ?? []).map((split) => ({
      season: season.name.toLowerCase(),
      split: split.name.toLowerCase(),
    })),
  );
});
```

### Risks
- **R1.** `getSplitByNames` uses `.ilike()` — already case-insensitive. Emitting lowercase params from `generateStaticParams` keeps URLs canonical. **No change to `getSplitByNames`.**
- **R2.** If the DB has a season/split name with a space or special URL char, `generateStaticParams` will emit it as-is and Next will URL-encode at build time. Current DB names (`p2024`, `s2025`, `verano`, etc. — verify) appear safe; if not, encode explicitly via `encodeURIComponent` in the mapper.
- **R3.** Supabase RLS — confirm anon SELECT is permitted on `seasons`, `splits`, `matches`, `trainers` (already true today since RSCs read them anonymously).

---

## REQ-22 — Granular Suspense per hub section

### Files to touch

- All hub pages — restructure so the top-level component only awaits `getActiveSeasonWithSplit()`, then renders a tree of `<Suspense fallback={<SectionSkeleton variant=… />}>` wrappers, each containing a new async leaf component.
- Each new leaf is named `<…Section>` and lives next to the existing view: `src/components/hub/sections/StandingsLiveSection.tsx`, `…/ProjectedBracketTeaserSection.tsx`, `…/HubRightColumnSection.tsx`, `…/NewsRailSection.tsx`, `…/PhaseHeaderSection.tsx`, `…/ClasificacionSection.tsx`, `…/CalendarSection.tsx`, `…/RosterSection.tsx`, `…/BracketSection.tsx`, `…/OlimpoSection.tsx`, `…/TrainerProfileSection.tsx`.

### File-by-file plan

**`src/app/hub/page.tsx`** — current shape awaits everything at once (lines 31, 45–49). New shape:

```tsx
export default async function HubPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;
  if (!seasonInfo || !split) {
    return <EmptyState title="PRETEMPORADA" body="No hay un split activo…" />;
  }
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<SectionSkeleton variant="phaseBanner" />}>
        <PhaseHeaderSection splitId={split.id} seasonName={seasonInfo.name} splitName={split.name} />
      </Suspense>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <Suspense fallback={<SectionSkeleton variant="standings" />}>
            <StandingsLiveSection splitId={split.id} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton variant="bracket" />}>
            <ProjectedBracketTeaserSection splitId={split.id} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton variant="rightColumn" />}>
          <HubRightColumnSection splitId={split.id} />
        </Suspense>
      </div>
      <Suspense fallback={<SectionSkeleton variant="newsRail" />}>
        <NewsRailSection splitId={split.id} />
      </Suspense>
    </div>
  );
}
```

Each `*Section` async leaf does its own focused `await` (or `Promise.all` of its dependencies). Example:

```tsx
// src/components/hub/sections/StandingsLiveSection.tsx
export async function StandingsLiveSection({ splitId }: { splitId: string }) {
  const [preview, matchesByRound] = await Promise.all([
    getDivisionPreview(splitId),
    getMatchesByRound(splitId),
  ]);
  const allMatches = matchesByRound.flatMap((r) => r.matches);
  return <StandingsLive preview={preview} matches={allMatches} />;
}
```

**Same pattern for the other hub routes** (`/hub/clasificacion`, `/hub/calendario`, `/hub/entrenadores`, `/hub/bracket`, `/hub/olimpo`, `/hub/entrenador/[id]`). Each currently does one big `Promise.all` at the top and renders one main view component; refactor each into one `<Suspense>` boundary around an async section leaf.

### Why this is a measurable win

`react.cache()` (used throughout `lib/queries/*.queries.ts`) **deduplicates** repeated calls within a single request. So even though, say, both `StandingsLiveSection` and `ProjectedBracketTeaserSection` call `getDivisionPreview(splitId)`, the second call returns the memoized value — no DB round-trip duplication. Each Suspense boundary still gets to send its HTML as soon as its (deduped) data lands, independently of the others.

### Risks
- **R1.** React 19.2 has stricter "async component child of Suspense" semantics. Verify against `vercel:nextjs` and `vercel:next-cache-components` documentation that the leaf component being declared `async function` works inside `<Suspense>` without `'use cache'` — it should, because Server Components support this natively, but the Implementer must confirm via the build output.
- **R2.** When `seasonInfo` is null (pretemporada), the whole page returns `<EmptyState>` early. That's fine; the Suspense tree never mounts.
- **R3.** Per-section skeletons must approximate real footprint to avoid CLS. `<SectionSkeleton>` variants (REQ-24) are sized to match.
- **R4.** Streaming requires the layout to use `app/` (it does) and not opt into `force-dynamic` at the page level (it doesn't). Verify no `export const dynamic = 'force-dynamic'` appears anywhere on the hub tree.

---

## REQ-23 — `'use client'` push to leaves (pragmatic)

### File-by-file plan

**1. `src/components/hub/ClasificacionView.tsx`**

Split into:
- `src/components/hub/clients/DivisionTabsShell.tsx` (`'use client'`):
  ```tsx
  'use client';
  import { useState, type ReactNode } from 'react';
  type Division = 'primera' | 'segunda';
  export function DivisionTabsShell({ primeraSlot, segundaSlot }: { primeraSlot: ReactNode; segundaSlot: ReactNode }) {
    const [active, setActive] = useState<Division>('primera');
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <TabButton label="División 1 · Élite" accent="magenta" active={active === 'primera'} onClick={() => setActive('primera')} />
          <TabButton label="División 2 · Aspirantes" accent="cyan" active={active === 'segunda'} onClick={() => setActive('segunda')} />
        </div>
        {active === 'primera' ? primeraSlot : segundaSlot}
      </div>
    );
  }
  function TabButton(/* lifted verbatim from existing file */) { /* … */ }
  ```
- `src/components/hub/ClasificacionView.tsx` (no `'use client'`, Server) — keeps `StandingsTable`, `TableRow`, `Pip` as pure server JSX. The export becomes:
  ```tsx
  export function ClasificacionView({ primera, segunda }: ClasificacionViewProps) {
    return (
      <DivisionTabsShell
        primeraSlot={<StandingsTable rows={primera} />}
        segundaSlot={<StandingsTable rows={segunda} />}
      />
    );
  }
  ```
  Both slots are rendered server-side; the client shell merely picks which one is visible.

**2. `src/components/hub/RosterView.tsx`**

Decision (named slot vs filter-on-client): pass **three** pre-rendered grids as named slots (`allSlot`, `d1Slot`, `d2Slot`) so the client shell only flips visibility. The filtered grids are computed server-side in the page:

```tsx
// src/app/hub/entrenadores/page.tsx (inside the section leaf)
const all = cards;
const d1 = cards.filter((c) => c.division === 1);
const d2 = cards.filter((c) => c.division === 2);
return (
  <RosterFilterShell
    allCount={all.length}
    d1Count={d1.length}
    d2Count={d2.length}
    allSlot={<RosterGrid cards={all} />}
    d1Slot={<RosterGrid cards={d1} />}
    d2Slot={<RosterGrid cards={d2} />}
  />
);
```

- `src/components/hub/clients/RosterFilterShell.tsx` (`'use client'`) — owns `useState<'all' | 1 | 2>`, renders the three pill buttons, and picks the matching slot.
- `src/components/hub/RosterView.tsx` becomes the Server `RosterGrid` (pure JSX rendering `RosterCardVM[]`). Rename to `RosterGrid` and update the barrel.

**3. `src/components/hub/CalendarView.tsx`**

The round selector is harder because there are 16 rounds, each with potentially heavy match listings. The "pre-render all 16 server-side and let client pick one" strategy ships 16× the HTML, which is acceptable (~1KB per round body × 16 = ~16KB gzipped; verify during impl).

- `src/components/hub/clients/RoundSelectorShell.tsx` (`'use client'`) — owns `useState<number>` for the selected round, renders the timeline strip, and conditionally reveals one of 16 pre-rendered slots via CSS (`hidden` toggling) rather than mount/unmount, to avoid losing Suspense boundaries.
- `src/components/hub/CalendarView.tsx` becomes the Server orchestrator that pre-renders all 16 round details and hands them to `<RoundSelectorShell>` as a `roundSlots: { round: number; node: ReactNode }[]` prop.

**Alternative considered, rejected:** keeping the round body client-rendered. That keeps current bundle weight. Reject — the brief asks for bundle decrease where possible.

**4. `src/components/cross/PlayoffBracket.tsx` + `MatchupCard.tsx`** — orphan deletion.

Steps:
- Verify zero callers in `src/app`: `rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/app` returns nothing.
- Delete `src/components/cross/PlayoffBracket.tsx`, `src/components/cross/MatchupCard.tsx`, and the empty `src/components/cross/` directory.
- Delete `src/components/shared/DivisionSection/DivisionSection.tsx` and the empty `src/components/shared/DivisionSection/` directory.
- Edit `src/components/shared/index.ts` — remove the `DivisionBracket`/`DivisionSection` re-export (lines 6-9).
- Check `src/lib/types/matches.ts` — `Matchup` is still referenced by `lib/services/bracketService.ts` and `lib/services/matchService.ts`, so **do not delete the type**.

**Risk:** if a future spec wants to revive a "cruces" overlay, this code is gone. Acceptable — git history preserves it; F2 already established that orphan clusters get deleted.

### Server/client split decisions, summarized

| Component | Today | After F5 | Why |
|---|---|---|---|
| `ClasificacionView` (180 LOC) | All client (1 useState) | Server orchestrator + 30 LOC `DivisionTabsShell` client | `StandingsTable`/`TableRow`/`Pip` (~100 LOC) leave the client bundle |
| `RosterView` (133 LOC) | All client (1 useState) | Server `RosterGrid` + small `RosterFilterShell` client | Card grid markup leaves the client bundle |
| `CalendarView` (221 LOC) | All client (1 useState) | Server orchestrator + small `RoundSelectorShell` client | Match listings leave the client bundle (× 16 pre-rendered) |
| `StandingsLive` | Server | Server | No change (already correct) |
| `BracketView` | Server | Server (gains a `<Suspense>` parent in REQ-22) | No state in view itself |
| `OlimpoView`, `TrainerProfile`, `PhaseBanner`, `StoryBeat`, `NewsRail`, `ProjectedBracketTeaser`, `HubRightColumn` | Server | Server (gain `<Suspense>` parents) | No state in view |
| `PhaseChip`, `HubNav`, `TopBar`, `ShellClientEffects`, `SeasonSplitChip` | Client | Client (no change) | Genuinely need browser APIs (scroll, navigation) |

---

## REQ-24 — Shared primitives

### Files to touch

| Path | Status | Purpose |
|---|---|---|
| `src/components/shared/ui/EmptyState.tsx` | **NEW** | Replaces 6 inline `<div className="py-20 text-center">…</div>` blocks in hub pages |
| `src/components/shared/ui/BackgroundDecoration.tsx` | **NEW** | Wraps `<div className="starfield" />` (used 5×). Today renders only `variant="starfield"`; structured to extend |
| `src/components/shared/ui/SectionSkeleton.tsx` | **NEW** | Variants: `phaseBanner`, `standings`, `bracket`, `rightColumn`, `newsRail`, `calendar`, `roster`, `olimpo`, `trainerProfile`. Each is a sized placeholder approximating the panel's footprint |
| `src/lib/utils/formatters.ts` | **NEW** | `formatSeasonSplit(season, split)` returning `"${SEASON} · ${SPLIT}"`. No other formatters added now (one util per real duplication) |
| `src/components/shared/index.ts` | Update | Re-export the new UI primitives. Keep barrel stable |

### Shape sketches

```tsx
// EmptyState.tsx — Server Component
export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-20 text-center">
      <h1 className="font-pixel text-2xl text-px-ink">{title}</h1>
      <p className="mt-4 font-retro text-lg text-px-ink-soft">{body}</p>
    </div>
  );
}
```

```tsx
// BackgroundDecoration.tsx — Server Component
type Variant = 'starfield';
export function BackgroundDecoration({ variant = 'starfield' }: { variant?: Variant }) {
  return <div className={variant} />;
}
```

```tsx
// SectionSkeleton.tsx — Server Component
type Variant = 'phaseBanner' | 'standings' | 'bracket' | 'rightColumn' | 'newsRail' | 'calendar' | 'roster' | 'olimpo' | 'trainerProfile';
const SIZES: Record<Variant, string> = {
  phaseBanner: 'h-32',
  standings: 'h-[420px]',
  bracket: 'h-64',
  rightColumn: 'h-[480px]',
  newsRail: 'h-36',
  calendar: 'h-[600px]',
  roster: 'h-[560px]',
  olimpo: 'h-96',
  trainerProfile: 'h-[640px]',
};
export function SectionSkeleton({ variant }: { variant: Variant }) {
  return <div className={`${SIZES[variant]} animate-pulse border-[3px] border-px-border bg-px-elev`} aria-hidden="true" />;
}
```

```ts
// formatters.ts
export function formatSeasonSplit(season: string, split: string): string {
  return `${season.toUpperCase()} · ${split.toUpperCase()}`;
}
```

### Call-site migrations (REQ-24 part of the same atomic step that introduces each primitive)

- `<EmptyState>` replaces inline empty blocks in: `src/app/hub/page.tsx:36`, `clasificacion/page.tsx:28`, `calendario/page.tsx:26`, `entrenadores/page.tsx:22`, `bracket/page.tsx:25`, `olimpo/page.tsx:55`.
- `<BackgroundDecoration variant="starfield" />` replaces inline starfield divs in: `src/components/hub/HubRightColumn.tsx:118`, `BracketView.tsx:220`, `OlimpoView.tsx:44`, `landing/PixelLanding.tsx:58, 408`.
- `formatSeasonSplit` replaces inline string-builds in: `src/app/archivo/[season]/[split]/page.tsx:22, 47`, `src/components/shared/layout/hub/SeasonSplitChip.tsx:28`, `src/components/hub/PhaseBanner.tsx:34`, `src/components/hub/OlimpoView.tsx:47`.
- `<SectionSkeleton>` is consumed exclusively by the new REQ-22 Suspense boundaries.

### Risks
- **R1.** `SectionSkeleton` heights are guesses; tweak after manual review against the actual panels. CLS will visualize miscalibrations.
- **R2.** `BackgroundDecoration` is intentionally minimal (single-variant today). Don't add variants speculatively.

---

## REQ-25 — Image + animation audit (verify-only)

No code changes if the audit returns clean. Verification commands listed in `requirements.md` §REQ-25.

If the audit finds a regression (e.g. someone added a `fill` `<Image>` without `sizes` between spec time and implementation time), correct it in place and document. Otherwise add a `progress/history.md` entry confirming the live tree is clean and listing the dead `home/Hero` + sibling cluster as future cleanup debt.

---

## Implementation order (matches `tasks.md`)

1. **REQ-24 (primitives).** Land `<EmptyState>`, `<BackgroundDecoration>`, `<SectionSkeleton>`, `formatSeasonSplit` and migrate their call sites. Self-contained refactor; `./init.sh` green at this point.
2. **REQ-23 (client→server push).**
   - 2a. `ClasificacionView` split (`DivisionTabsShell` extracted; bulk to Server).
   - 2b. `RosterView` split (`RosterFilterShell` extracted; `RosterView` → `RosterGrid` Server).
   - 2c. `CalendarView` split (`RoundSelectorShell` extracted; orchestrator pre-renders 16 round slots Server-side).
   - 2d. `PlayoffBracket`/`MatchupCard`/`DivisionSection` orphan deletion.
   - Re-run `./init.sh` after each sub-step; capture client bundle delta vs baseline.
3. **REQ-22 (granular Suspense).** Add the `*Section` async leaves and wrap them in `<Suspense fallback={<SectionSkeleton …/>}>` across all hub routes.
4. **REQ-21 (SSG archive).** Add `createClient({ session: false })` (or equivalent), `getArchiveSplitParams`, the page exports. Verify build output shows static archive routes.
5. **REQ-25 (audit).** Run the verification greps, log results.

After each step: `./init.sh` (full, not `--quick`) and capture the `pnpm build` route table. The Reviewer expects to see the build output deltas pinned in `progress/history.md`.

## Framework-specific verifications

The Implementer **must verify against `vercel:nextjs` and `vercel:next-cache-components`** before writing code for:

- REQ-21's `cookies()`-vs-SSG interaction. The cookie-free-client approach is the design's best guess; the framework docs may surface a cleaner one (e.g. an `unstable_noStore` exemption, an Edge-runtime escape, or a Next 16-specific config).
- REQ-22's "async component child of `<Suspense>`" behavior in React 19.2 without `cacheComponents` enabled. Should work natively for Server Components; confirm.

If any of these verifications shows the design is wrong, **stop and report** to the leader before implementing — don't paper over.
