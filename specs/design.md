# Design — F4 (Fase 4 — Cacheo coherente) — RESPEC #3

Companion to `specs/requirements.md` (REQ-30..REQ-44). F4 is a cache-layer
migration: REQ-30/31/33 (already in `main`) cleared the legacy
`fetchData.ts`/`matchService.ts` modules and switched 9 hub-query call sites
to the cookie-free Supabase client. The remaining work layers Next 16's
Cache Components API (`'use cache'` + `cacheTag` + `cacheLife` +
`updateTag`) onto every public reader, in **three waves** that respect the
hard ordering exposed by the second implementer drift report.

```
WAVE A (pre-flights, ./init.sh green per REQ, ONE commit at wave end):
  REQ-32 (verify dynamicParams gone, already in WT)
  REQ-43 (extract Footer year → client component)
  REQ-44 (wrap every page-level await get*() in <Suspense>)

WAVE B (cache migration, ATOMIC — ONE commit at wave end):
  REQ-40 (cacheComponents: true)
   → REQ-34 (archive queries 'use cache')
   → REQ-35 (seasons queries 'use cache')
   → REQ-36 (leagues leaves → leagues composers, then tournament/trainers/bracket)

WAVE C (hardening, one commit per REQ):
  REQ-38 (updateTag in seasons/_actions.ts)
  REQ-37 (build-matrix regression — inspection)
  REQ-39 (admin-untouched regression — inspection)
  REQ-41 (cache tag taxonomy doc)
  REQ-42 (final ./init.sh + history.md entry)
```

This design assumes Next.js **16.1.1** (verified against
`node_modules/next/cache.d.ts:1-154`,
`node_modules/next/dist/server/use-cache/cache-life.js:70-75`,
`node_modules/next/dist/server/web/spec-extension/revalidate.js:39-62`).
Verify against `vercel:nextjs` / `vercel:next-cache-components` if framework
surprises surface during Wave B.

---

## 0. Why three waves (drift recap, second round)

The previous respec already moved REQ-40 ahead of REQ-34/35/36 (resolving
drift #1 — SWC rejects `'use cache'` without `cacheComponents`). Attempting
to ship REQ-40 alone produced a NEW class of failure:

1. **Root-layout `new Date()` poisons every page.** `Footer.tsx:5` runs
   `new Date().getFullYear()` synchronously in the root `<body>`. Once
   `cacheComponents: true` lands, Next 16 treats this as non-deterministic
   and refuses to prerender any page. Fix: REQ-43.
2. **Every page-level `await` not behind Suspense aborts the build.**
   `hub/layout.tsx`, `archivo/layout.tsx`, `archivo/page.tsx`,
   `archivo/[season]/[split]/page.tsx`, `page.tsx`, and the 3 legacy
   `[season]/[split]/**` redirect leaves all `await get*()` at the top
   level. F5 added Suspense INSIDE the hub pages but did NOT wrap the
   layouts/landing/archive/legacy. Fix: REQ-44.

Both fixes are PRE-FLIGHTS (Wave A) — they ship and `./init.sh` stays green
under the BASELINE flag (`cacheComponents` still false). Then Wave B can
flip the flag and the build keeps passing.

---

## 1. Files touched (concrete list — IMPLEMENTER WORK ONLY)

### Already in main (DO NOT re-edit)

- `src/lib/data/fetchData.ts` — DELETED (REQ-30).
- `src/lib/data/` — DIR REMOVED (REQ-30).
- `src/lib/services/matchService.ts` — DELETED (REQ-31, content moved).
- `src/lib/utils/matches.ts` — CREATED (REQ-31).
- `src/lib/services/bracketService.ts:5` — import updated (REQ-31).
- `src/lib/queries/{leagues,seasons,tournament,trainers,bracket}.queries.ts`
  — 9 `createClient` sites flipped to `{ session: false }` (REQ-33).

### Applied in working tree (verify only, commit in Wave-A commit)

- `src/app/archivo/[season]/[split]/page.tsx` — `dynamicParams = true`
  line already deleted (REQ-32). Verified at respec time.

### Wave A — to edit (one commit at wave end)

| REQ | File | Action |
|---|---|---|
| REQ-32 | `src/app/archivo/[season]/[split]/page.tsx` | (already done — verify only) |
| REQ-43 | `src/components/shared/layout/FooterYear.tsx` | CREATE (client component) |
| REQ-43 | `src/components/shared/layout/Footer.tsx` | EDIT — remove `new Date()`, mount `<FooterYear />` |
| REQ-44 | `src/app/hub/layout.tsx` | EDIT — extract async block into Suspense-wrapped child |
| REQ-44 | `src/app/archivo/layout.tsx` | EDIT — same shape as hub layout |
| REQ-44 | `src/app/archivo/page.tsx` | EDIT — extract `Promise.all` into Suspense-wrapped child |
| REQ-44 | `src/app/archivo/[season]/[split]/page.tsx` | EDIT — extract `await getSplitByNames` + `Promise.all` into Suspense-wrapped child |
| REQ-44 | `src/app/page.tsx` | EDIT — extract landing fetch block into Suspense-wrapped child |
| REQ-44 | `src/app/[season]/[split]/page.tsx` | EDIT — wrap redirect leaf in `<Suspense fallback={null}>` |
| REQ-44 | `src/app/[season]/[split]/cruces/page.tsx` | EDIT — same |
| REQ-44 | `src/app/[season]/[split]/final/page.tsx` | EDIT — same |
| REQ-44 | `src/app/hub/page.tsx` | EDIT — move top-level `await getActiveSeasonWithSplit()` into a streamed child (existing F5 Suspense boundaries stay) |
| REQ-44 | `src/app/hub/bracket/page.tsx` | EDIT — same shape |
| REQ-44 | `src/app/hub/calendario/page.tsx` | EDIT — same shape |
| REQ-44 | `src/app/hub/clasificacion/page.tsx` | EDIT — same shape |
| REQ-44 | `src/app/hub/olimpo/page.tsx` | EDIT — same shape |
| REQ-44 | `src/app/hub/entrenadores/page.tsx` | EDIT — same shape |
| REQ-44 | `src/app/hub/entrenador/[id]/page.tsx` | EDIT — wrap `getTrainerById` await in Suspense child |
| REQ-44 (optional) | `src/components/shared/ui/ShellSkeleton.tsx` | CREATE — new variant for shell-level boundaries (hub/archivo layout) |
| REQ-44 | `src/components/shared/index.ts` | EDIT — export new skeleton if created |

### Wave B — to edit (ATOMIC commit at wave end)

| Order | REQ | File | Action |
|---|---|---|---|
| 1 | REQ-40 | `next.config.ts` | ADD `cacheComponents: true,` |
| 2 | REQ-34 | `src/lib/queries/archive.queries.ts` | 5 readers → triad; swap React `cache()` import for `cacheLife`+`cacheTag` from `next/cache` |
| 3 | REQ-35 | `src/lib/queries/seasons.queries.ts` | 7 readers → triad |
| 4 | REQ-36 | `src/lib/queries/leagues.queries.ts` | 5 leaf readers → triad; THEN `getDivisionPreview` |
| 5 | REQ-36 | `src/lib/queries/tournament.queries.ts` | 1 reader → triad |
| 6 | REQ-36 | `src/lib/queries/trainers.queries.ts` | 1 reader → triad |
| 7 | REQ-36 | `src/lib/queries/bracket.queries.ts` | 1 reader → triad |

### Wave C — to edit (one commit per REQ)

| REQ | File | Action |
|---|---|---|
| REQ-38 | `src/app/admin/dashboard/seasons/_actions.ts` | ADD `updateTag` import + 7 calls |
| REQ-37 | (inspection only — paste build matrix into history) | NO EDIT |
| REQ-39 | (inspection only — confirm admin untouched) | NO EDIT |
| REQ-41 | `docs/conventions.md` OR `docs/ARCHITECTURE.md` | APPEND cache tag taxonomy section |
| REQ-42 | `progress/history.md` | APPEND F4 close-out entry |

### Explicitly NOT touched (regression guards)

- `src/lib/queries/admin.queries.ts` (REQ-39).
- `src/app/admin/dashboard/{splits,divisions,normativa,participants,matches}/_components/*Manager.tsx`
  (REQ-39 — 20 `router.refresh()` sites stay; F6 owns the migration).
- F5's existing 11 `<Suspense>` boundaries under `src/app/hub/**`.
- `proxy.ts` (auth middleware untouched).
- `src/components/shared/layout/hub/PixelShell.tsx` (pure renderer).

---

## §A — Wave A patterns

### A.1 — REQ-43: Footer year extraction (client leaf)

`src/components/shared/layout/FooterYear.tsx` (NEW):

```tsx
'use client';

import { useEffect, useState } from 'react';

/**
 * Renders the current year on the client. Extracted out of `Footer.tsx`
 * because `cacheComponents: true` (F4 REQ-40) cannot tolerate a
 * non-deterministic `new Date()` call inside the root-layout server tree.
 * The initial server HTML renders nothing; the year hydrates immediately.
 */
export function FooterYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year ?? ''}</>;
}
```

`src/components/shared/layout/Footer.tsx` (EDIT):
- DROP `const currentYear = new Date().getFullYear();`.
- ADD `import { FooterYear } from './FooterYear';`.
- REPLACE `{currentYear}` (currently on line 45 inside the © string) with
  `<FooterYear />`.

The visual output is unchanged once hydrated. The Spanish copy and
Tailwind classes stay byte-identical.

### A.2 — REQ-44: Suspense extraction pattern for layouts/pages

**Hub layout shape (representative — applies to `archivo/layout.tsx` mirror
and to all the page-level extractions).**

`src/app/hub/layout.tsx` (BEFORE — current, post-REQ-33):

```tsx
export default async function HubLayout({ children }: { children: ReactNode }) {
  const seasonInfo = await getActiveSeasonWithSplit();
  const activeSplitId = seasonInfo?.activeSplit?.id ?? null;

  const [currentRound, seasons, preview] = await Promise.all([...]);

  return (
    <PixelShell activeSeasonName={...} ...>
      {children}
    </PixelShell>
  );
}
```

`src/app/hub/layout.tsx` (AFTER — Wave A REQ-44):

```tsx
import { Suspense } from 'react';

async function HubShell({ children }: { children: ReactNode }) {
  const seasonInfo = await getActiveSeasonWithSplit();
  const activeSplitId = seasonInfo?.activeSplit?.id ?? null;

  const [currentRound, seasons, preview] = await Promise.all([
    activeSplitId ? getCurrentRound(activeSplitId) : Promise.resolve(0),
    getAllSeasonsWithSplits(),
    activeSplitId
      ? getDivisionPreview(activeSplitId)
      : Promise.resolve<DivisionPreview>({ primera: [], segunda: [] }),
  ]);

  return (
    <PixelShell
      activeSeasonName={seasonInfo?.name ?? null}
      activeSplitName={seasonInfo?.activeSplit?.name ?? null}
      seasons={seasons}
      currentRound={currentRound}
      preview={preview}
    >
      {children}
    </PixelShell>
  );
}

export default function HubLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <HubShell>{children}</HubShell>
    </Suspense>
  );
}
```

Key invariants:
- Default export becomes a NON-async function returning `<Suspense>`.
- The async body becomes a NEW server function declared in the SAME file.
- `children` is forwarded by the wrapper so layouts still nest the way Next
  expects.
- Fallback is either an existing `SectionSkeleton` variant or a new
  `ShellSkeleton` (see §A.3).

**Hub PAGE shape (representative — all 7 hub pages).**

Existing hub pages already wrap most of their data fetches in F5
`<Suspense>` boundaries, but they STILL await one cheap leaf at the top
(`getActiveSeasonWithSplit`, sometimes `getCurrentRound`) BEFORE the
boundaries. Under `cacheComponents`, that top-level await must move into a
streamed child. Shape:

```tsx
// BEFORE
export default async function BracketPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;
  if (!split) return <EmptyState .../>;
  const currentRound = await getCurrentRound(split.id);
  const phase = getPhase(currentRound);
  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={phase.label} title="Bracket" />
      <Suspense fallback={<SectionSkeleton variant="bracket" />}>
        <BracketSection splitId={split.id} />
      </Suspense>
    </div>
  );
}

// AFTER (REQ-44)
async function BracketPageInner() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;
  if (!split) return <EmptyState .../>;
  const currentRound = await getCurrentRound(split.id);
  const phase = getPhase(currentRound);
  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={phase.label} title="Bracket" />
      <Suspense fallback={<SectionSkeleton variant="bracket" />}>
        <BracketSection splitId={split.id} />
      </Suspense>
    </div>
  );
}

export default function BracketPage() {
  return (
    <Suspense fallback={<SectionSkeleton variant="bracket" />}>
      <BracketPageInner />
    </Suspense>
  );
}
```

The OUTER Suspense holds the page until the cheap leaves resolve; the
INNER Suspense (F5) streams the heavy section.

**Archive detail SSG shape.** `src/app/archivo/[season]/[split]/page.tsx`
runs under `generateStaticParams`. The outer Suspense's fallback is rendered
only if the body suspends at build (it won't, once REQ-34/35 cache the
underlying queries). The boundary is still REQUIRED under `cacheComponents`.
Same extraction pattern; fallback = `<SectionSkeleton variant="standings" />`
(visually similar to the podium panels).

**Landing shape (`src/app/page.tsx`).** Wrap the entire fetch block + VM
build + final `<PixelLanding vm={vm} />` inside a Suspense-wrapped child
function. Fallback can be the pixel-themed `<BackgroundDecoration />`
(already in `src/components/shared/ui/BackgroundDecoration.tsx`,
re-exported from `src/components/shared`).

**Legacy redirect leaves.** The three files
(`src/app/[season]/[split]/page.tsx`, `cruces/page.tsx`, `final/page.tsx`)
end in `redirect(...)`. Shape:

```tsx
async function LegacyRedirectInner({ params }: { params: Promise<...> }) {
  const { season, split } = await params;
  const info = await getSplitByNames(season, split);
  if (!info) notFound();
  const active = await getActiveSeasonWithSplit();
  if (active?.activeSplit?.id === info.split.id) redirect(ROUTES.hub);
  redirect(ROUTES.archiveDetail(season, split));
}

export default function LegacyXPage(props: { params: Promise<...> }) {
  return (
    <Suspense fallback={null}>
      <LegacyRedirectInner {...props} />
    </Suspense>
  );
}
```

`fallback={null}` because the leaf never renders UI — it always redirects
or 404s.

### A.3 — REQ-44: `ShellSkeleton` (optional new fallback)

For shell-level boundaries (hub layout, archivo layout) where no existing
`SectionSkeleton` variant fits, create
`src/components/shared/ui/ShellSkeleton.tsx`:

```tsx
/**
 * Full-shell skeleton used while `<PixelShell>`'s server fetch resolves.
 * Mirrors the dark px-bg backdrop so the page does not flash content.
 * Server Component, no client JS.
 */
export function ShellSkeleton() {
  return (
    <div
      className="min-h-screen bg-px-bg animate-pulse"
      aria-hidden="true"
    />
  );
}
```

Export from `src/components/shared/index.ts`. Alternative if the
implementer prefers no new component: inline the same JSX as the fallback
literal in both layouts.

---

## §B — Wave B patterns

### B.1 — REQ-40: flag flip (single change)

`next.config.ts` (AFTER):

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  poweredByHeader: false,
  images: { ... },
};
```

One key added. Do NOT touch `images`, `reactCompiler`, or
`poweredByHeader`. After this flip, `./init.sh` must stay green BEFORE
moving to REQ-34. If RED, Wave A missed a boundary — STOP and report.

### B.2 — REQ-34/35/36: `'use cache'` triad

Every cacheable reader in `lib/queries/` ends up shaped like this.
`getDivisionPreview` shown — the same shape applies to all 21 readers.

```ts
// BEFORE (current main, post-REQ-33):
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getDivisionPreview = cache(
  async (splitId: string): Promise<DivisionPreview> => {
    const leagues = await getLeaguesBySplit(splitId);
    // ...
    if (error) {
      console.error('[getDivisionPreview] Error:', error.message);
      return { primera: [], segunda: [] };
    }
    return { primera, segunda };
  },
);

// AFTER (F4 Wave B — REQ-36):
import { cacheLife, cacheTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function getDivisionPreview(
  splitId: string,
): Promise<DivisionPreview> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`splits:${splitId}`, `matches:${splitId}`);

  const leagues = await getLeaguesBySplit(splitId);
  // ...
  if (error) {
    console.error('[getDivisionPreview] Error:', error.message);
    return { primera: [], segunda: [] };
  }
  return { primera, segunda };
}
```

**Why drop the React `cache()` wrapper.** `'use cache'` covers both
per-request dedup AND cross-request persistence. Double-wrapping is
wasteful; SWC transforms the directive more cleanly on a top-level function
declaration than on a `const x = cache(async () => …)` arrow.

**`cacheTag` argument expansion.** Template literals for parameterized
tags (`splits:${splitId}`). Bare string literals for static tags
(`'seasons'`, `'archive'`, `'trainers'`).

**`cacheLife` profile.** Single string from Next built-ins
(`'minutes' | 'hours' | 'days'`). No custom profiles in F4.

**Error-handling contract preserved.** Queries continue to return
`[]` / `null` / empty `Map` on error and log `[fnName] Error:`. The
`'use cache'` directive caches whatever the function returns, including
empty fallbacks — that's intentional: a transient Supabase error caches
the fallback for `cacheLife`'s revalidate interval; the next revalidation
re-fetches; `updateTag` from any subsequent mutation busts the cache
anyway.

**Nested cached calls.** `getDivisionPreview` calls `getLeaguesBySplit`,
`getRankingsByLeague`, and `getMatchesByRound`. All four become
`'use cache'` in REQ-36. Next 16 composes cache keys correctly across
nested cached calls — no special handling, BUT order matters during
iteration: leaves first
(`getLeaguesBySplit` → `getRankingsByLeague` → `getMatchesByRound` →
`getLeagueByTier` → `getParticipantsBySplit`), then `getDivisionPreview`,
then jump to other files (`getCurrentRound`, `getTrainerById`,
`getBracketData`).

---

## §C — Tag taxonomy + per-query assignment (LOCKED — user-confirmed)

Lift this section literally into `docs/conventions.md` /
`docs/ARCHITECTURE.md` per REQ-41.

| Tag | Owner table(s) | Mutated by (F4) | Mutated by (F6 deferred) | Read by |
|---|---|---|---|---|
| `seasons` | `seasons`, `splits`, `leagues` | `seasons/_actions.ts` (REQ-38) | F6 SplitsManager + DivisionsManager Server Actions | All season/split/league readers |
| `splits:${id}` | per-split slice of multiple tables | — | F6 SplitsManager Server Actions | `getLeaguesBySplit`, `getDivisionPreview`, `getLeagueByTier`, `getArchiveDivisionPreview` |
| `matches:${splitId}` | `matches` | — | F6 MatchesManager Server Actions | `getMatchesByRound`, `getDivisionPreview`, `getBracketData`, `getCurrentRound`, `getPublicCurrentRound` |
| `rankings:${leagueId}` | `league_rankings` view | — | F6 MatchesManager Server Actions (rankings derive from match writes) | `getRankingsByLeague` |
| `participants:${splitId}` | `league_participants`, `trainers` (via join) | — | F6 ParticipantsManager Server Actions | `getParticipantsBySplit` |
| `bracket:${splitId}` | `matches` rounds 15/16 | — | F6 MatchesManager Server Actions | `getBracketData` |
| `trainers` | `trainers` | — | F6 ParticipantsManager Server Actions | `getTrainerById` |
| `archive` | union of seasons/splits/matches for closed splits | `seasons/_actions.ts` delete/activate/deactivate (REQ-38) | F6 retroactive admin edits | `getArchiveChampions`, `getArchiveDivisionPreview`, `getPublicActiveSeasonWithSplit`, `getPublicAllSeasonsWithSplits`, `getPublicCurrentRound` |

The "F4 ↔ F6" split in the "Mutated by" column IS the REQ-39 staleness
contract. F4 wires only what F3 already exposes; F6 closes the loop.

### Per-query profile + tag assignment

| Query | File | Tags | `cacheLife` |
|---|---|---|---|
| `getArchiveChampions` | `archive.queries.ts` | `archive` | `days` |
| `getArchiveDivisionPreview(splitId)` | `archive.queries.ts` | `archive`, `splits:${splitId}` | `days` |
| `getPublicActiveSeasonWithSplit` | `archive.queries.ts` | `seasons`, `archive` | `hours` |
| `getPublicAllSeasonsWithSplits` | `archive.queries.ts` | `seasons`, `archive` | `hours` |
| `getPublicCurrentRound(splitId)` | `archive.queries.ts` | `archive`, `matches:${splitId}` | `hours` |
| `getActiveSeasonWithSplit` | `seasons.queries.ts` | `seasons` | `hours` |
| `getAllSeasons` | `seasons.queries.ts` | `seasons` | `hours` |
| `getAllSeasonsWithSplits` | `seasons.queries.ts` | `seasons` | `hours` |
| `getSeasonWithSplits(id)` | `seasons.queries.ts` | `seasons` | `hours` |
| `getSeasonByName(name)` | `seasons.queries.ts` | `seasons` | `hours` |
| `getArchiveSplitParams` | `seasons.queries.ts` | `seasons` | `days` |
| `getSplitByNames(s, sp)` | `seasons.queries.ts` | `seasons` | `hours` |
| `getLeaguesBySplit(splitId)` | `leagues.queries.ts` | `seasons`, `splits:${splitId}` | `hours` |
| `getRankingsByLeague(leagueId)` | `leagues.queries.ts` | `rankings:${leagueId}` | `minutes` |
| `getDivisionPreview(splitId)` | `leagues.queries.ts` | `splits:${splitId}`, `matches:${splitId}` | `minutes` |
| `getLeagueByTier(splitId, _)` | `leagues.queries.ts` | `seasons`, `splits:${splitId}` | `hours` |
| `getParticipantsBySplit(splitId)` | `leagues.queries.ts` | `participants:${splitId}` | `hours` |
| `getMatchesByRound(splitId)` | `leagues.queries.ts` | `matches:${splitId}` | `minutes` |
| `getCurrentRound(splitId)` | `tournament.queries.ts` | `matches:${splitId}` | `minutes` |
| `getTrainerById(id)` | `trainers.queries.ts` | `trainers` | `hours` |
| `getBracketData(splitId)` | `bracket.queries.ts` | `bracket:${splitId}`, `matches:${splitId}` | `minutes` |

### `cacheLife` bands (Next 16 built-ins)

`node_modules/next/cache.d.ts:17-153`.

| Profile | `stale` | `revalidate` | `expire` | Used by |
|---|---|---|---|---|
| `minutes` | 300s | 60s | 3600s | Hot path: matches, rankings, division preview, bracket, current round |
| `hours` | 300s | 3600s | 86400s | Warm: seasons metadata, leagues, participants, trainers, public-active-season |
| `days` | 300s | 86400s | 604800s | Archive: champions, archive-division-preview, archive-params |

No custom profiles in `next.config.ts` for F4. F6 may add a sub-minute
`rt` profile if FR10 realtime needs it.

---

## §D — Framework gotchas (verify against `vercel:nextjs` /
`vercel:next-cache-components` if any surprise surfaces)

1. **`'use cache'` cannot read request data.** `cookies()`, `headers()`,
   `searchParams`, `formData()`. REQ-33 addressed cookies for the queries.
   Verified `grep -rn "cookies\|headers\|searchParams\|formData" src/lib/queries/`
   returns nothing across cacheable readers.

2. **`updateTag` is Server-Action-only.** `node_modules/next/dist/server/web/spec-extension/revalidate.js:47-62`.
   Calling it from a Route Handler or page render throws. We call it ONLY
   from `seasons/_actions.ts` (`'use server'` at line 1) — safe.

3. **`cacheLife` requires `cacheComponents`.** Verified at
   `node_modules/next/dist/server/use-cache/cache-life.js:70-75`. This is
   the SWC-level rejection that drove the Wave-B ordering (REQ-40 first).

4. **`'use cache'` with `generateStaticParams`.** Compatible per Next 16
   docs. The cached body runs at build time; returned params drive SSG.
   Build manifest is the truth — if `/archivo/[season]/[split]` regresses
   below 3 prerendered URLs after REQ-35, STOP. Verify against
   `vercel:next-cache-components` if surprises surface.

5. **Nested cached calls** compose transparently. Order matters during
   iteration (leaves first), but post-completion there is no special
   wiring.

6. **`cacheComponents: true` PROHIBITS top-level `await` in RSC pages
   outside `<Suspense>` or `'use cache'`.** This is the binding constraint
   that drives Wave A REQ-44. The error is build-time, message is along
   the lines of "this page cannot prerender because it awaits dynamic data
   without a Suspense boundary". The fix is the extraction pattern in §A.2.

7. **`cacheComponents: true` PROHIBITS non-deterministic calls
   (`new Date()`, `Math.random()`, `Date.now()`, `crypto.randomUUID()`) in
   non-cached server tree.** Drives Wave A REQ-43 (Footer year). Audit:
   `grep -rn "new Date\|Math.random\|Date.now\|crypto.randomUUID" src/components src/app --include="*.tsx"`.
   Hits today: `Footer.tsx:5` (fixed by REQ-43),
   `SeasonsManager.tsx:61/85/94` (admin tree stays `ƒ Dynamic` per REQ-39,
   not affected). If a NEW hit appears in a `/hub/*` or `/archivo/*` leaf
   during Wave B, treat as residual risk R2 — STOP and report.

8. **`useRouter().refresh()` does NOT bust `'use cache'`.** Root reason
   for REQ-39's Option A. Server Action + `updateTag` is the only
   invalidation path.

9. **`cacheComponents: true` does NOT auto-cache everything.** Without
   `'use cache'`, a function still runs per-request. The flag enables the
   directive + Suspense/streaming contract. Between REQ-40 and
   REQ-34/35/36, hub routes will still be dynamic; they flip at REQ-36.

10. **`<Suspense fallback={null}>` on a redirect leaf** is unusual but
    legal — Next 16 unwinds the suspense once the leaf throws/redirects.
    If the build complains (residual risk R5), fall back to making those
    three legacy files `'use cache'` after Wave B — but document the
    deferral.

11. **`revalidateTag(tag)` (1-arg) is deprecated in 16.x.** If you ever
    need `revalidateTag` outside a Server Action context, pass a profile
    (`'minutes'|'hours'|'days'|'max'` or `{expire:number}`). F4 prefers
    `updateTag` everywhere.

---

## §E — REQ-38 exact patch shape for `seasons/_actions.ts`

Current import (line 3 — verified):
```ts
import { revalidatePath } from 'next/cache';
```

After:
```ts
import { revalidatePath, updateTag } from 'next/cache';
```

For each action, ADD the `updateTag` call(s) AFTER the existing
`revalidatePath(SEASONS_PATH)` (lines 38, 59, 95, 118 — verified) and
BEFORE `return { ok: true }`. Pattern:

```ts
// createSeasonAction (line 20-40)
  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  return { ok: true };

// deleteSeasonAction (line 42-61)
  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };

// activateSeasonAction (line 63-97)
  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };

// deactivateSeasonAction (line 99-120)
  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };
```

Total `updateTag` calls in the file after REQ-38: **7** (1 + 2 + 2 + 2).

---

## §F — Verification stack (what implementer/reviewer run)

After every Wave-A REQ:
```bash
./init.sh
```

After Wave A is complete (one commit):
```bash
grep -rn "dynamicParams" src/app/                 # Expected: empty (REQ-32)
grep -n "new Date" src/components/shared/layout/Footer.tsx  # Expected: empty (REQ-43)
grep -l "'use client'" src/components/shared/layout/FooterYear.tsx  # Expected: path
grep -rnE "^\s*await get" src/app/**/*.tsx        # Expected: only inside *Inner / *Shell helper functions, never at top of default export
./init.sh                                          # Expected: GREEN (cacheComponents STILL OFF)
```

After REQ-40 (Wave B step 1, intermediate):
```bash
grep "cacheComponents" next.config.ts             # Expected: cacheComponents: true,
./init.sh                                          # Expected: GREEN. If RED, STOP (Wave A missed a boundary).
```

After each Wave-B REQ (intermediate, no commit):
```bash
grep -c "'use cache'" src/lib/queries/<file>.ts   # Expected: per-file counts in requirements.md
grep -c "cacheTag(" src/lib/queries/<file>.ts
grep -c "cacheLife(" src/lib/queries/<file>.ts
grep "from 'react'" src/lib/queries/<file>.ts     # Expected: empty (React cache import dropped)
./init.sh                                          # Expected: GREEN per REQ
```

After Wave B is complete (one atomic commit):
```bash
pnpm build 2>&1 | sed -n '/Route (app)/,/Middleware/p'
# Inspect for REQ-37 matrix:
#   /hub, /hub/clasificacion, /hub/calendario, /hub/bracket, /hub/olimpo,
#   /hub/entrenadores, /hub/entrenador/[id]  → ○ or ⚡ (NOT ƒ Dynamic)
#   /archivo/[season]/[split]                → ● with ≥3 prerendered URLs
#   /admin/dashboard/**                      → ƒ Dynamic (regression guard)
```

After REQ-38:
```bash
grep -c "updateTag(" src/app/admin/dashboard/seasons/_actions.ts   # Expected: 7
grep -c "revalidatePath(" src/app/admin/dashboard/seasons/_actions.ts  # Expected: 4
```

Manual smoke (after REQ-38): admin activates a different season →
navigates to `/hub` → `TopBar` active-season chip updates without hard
reload. Capture in `progress/history.md`.

---

## §G — Decisions log (handoff source-of-truth)

- **D1** — `updateTag` over `revalidateTag` in `seasons/_actions.ts`.
  Reason: read-your-own-writes semantics, no second `profile` arg, only
  legal context (Server Action).
- **D2** — Stay on Next 16 built-in `cacheLife` profiles
  (`minutes`/`hours`/`days`). F4 should not introduce custom
  `next.config.ts` profiles unless required.
- **D3** — Option A on the mutation-coherence gap (REQ-39). F6 owns
  closing the 5 non-pilot Managers.
- **D4** — Hub queries cookie-free (REQ-33 — already shipped).
- **D5** — `cacheComponents: true` ships in WAVE B (REQ-40), after
  Wave A pre-flights, before Wave B caches.
- **D6** — Drop React `cache()` from migrated readers. `'use cache'`
  supersedes; double-wrap is wasteful.
- **D7** — Lowercase tag values, `${type}:${id}` shape. Next 16 caps tags
  at 256 chars; UUID-suffixed tags are well under.
- **D8** — Accept `/hub/*` as static after REQ-36. Realtime per FR10
  lives in CLIENT components hydrated inside the static shell; the static
  server shell is safe provided `updateTag` is called from Server Actions
  on mutation.
- **D9** — Drop `dynamicParams = true` from `/archivo/[season]/[split]`
  (REQ-32; already applied in WT).
- **D10** — REQ-40 ships BEFORE REQ-34/35/36 inside Wave B (SWC rejects
  `'use cache'` without the flag).
- **D11 (NEW, third respec)** — REQ-43 + REQ-44 are PRE-FLIGHTS (Wave A).
  Resolves second-round drift: `cacheComponents` cannot land on a tree
  with `new Date()` in Footer or top-level page-awaits without Suspense.
- **D12 (NEW)** — Wave B is **atomic**: one commit. REQ-40 + REQ-34 +
  REQ-35 + REQ-36 ship together because the intermediate states are
  either red (REQ-40 alone if Wave A missed something) or partially red
  (REQ-40 + half the queries). The IMPLEMENTER iterates internally; the
  COMMIT is one.
- **D13 (NEW)** — Wave A is committed BEFORE Wave B. This separates "make
  the tree safe for the flag" (auditable, revertable) from "actually
  apply the cache" (irreversible mass migration).
