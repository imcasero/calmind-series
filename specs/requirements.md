# Requirements — F4 (Fase 4 — Cacheo coherente) — RESPEC #3

Source: `features.json` F4 + `ARCHITECTURE_REVIEW.html` §F4 + leader respec
2026-05-31 after **second** implementer drift report.

## What the drift exposed (binding constraints for this respec)

Empirically verified in Next.js 16.1.1 (SWC-built):

1. **`'use cache'` requires `cacheComponents: true`.** SWC rejects the
   directive at build time when the flag is off
   (`node_modules/next/dist/server/use-cache/cache-life.js:70-75`).
2. **`cacheComponents: true` poisons EVERY un-cached server `await` and every
   non-deterministic call** (`new Date()`, `Math.random()`, `Date.now()`) in
   any RSC reachable from `RootLayout`. The page render must put every such
   `await` either behind `'use cache'` (the read is cached) OR behind
   `<Suspense fallback={…}>` (the page can stream while the read resolves).
3. **The root layout itself cannot leak `new Date()`.** Currently
   `src/components/shared/layout/Footer.tsx:5` computes
   `const currentYear = new Date().getFullYear();` and `Footer` is mounted in
   `src/app/layout.tsx:82`, so the moment `cacheComponents` flips, **every**
   page becomes uncacheable / errors at build.

Concrete uncovered awaits found by `grep -nE "await get"`:
- `src/app/hub/layout.tsx:18` (`await getActiveSeasonWithSplit()`) +
  `:21` (the `Promise.all`).
- `src/app/archivo/layout.tsx:22` + `:25` (mirror of hub).
- `src/app/archivo/page.tsx:21` (the `Promise.all`).
- `src/app/archivo/[season]/[split]/page.tsx:46, :52` (`getSplitByNames` +
  `Promise.all` of champions/preview).
- `src/app/page.tsx:42, :53` (landing).
- `src/app/[season]/[split]/page.tsx`, `cruces/page.tsx`, `final/page.tsx`
  (legacy redirect leaves) at lines 15–22 each.

The 7 hub pages under `src/app/hub/*.tsx` already each await ONE cheap leaf
(`getActiveSeasonWithSplit` and sometimes `getCurrentRound`) before their F5
Suspense boundaries — those leaves are part of what REQ-44 must handle.

## Decision

Bundle atomic with explicit pre-flights. Three waves:

- **Wave A — Pre-flights.** Each REQ green on its own under `./init.sh`.
  Fixes the two `cacheComponents` blockers (Footer `new Date()`,
  page-level awaits) BEFORE the flag flip.
- **Wave B — Cache migration (ATOMIC).** Flag flip + all `'use cache'`
  triads in queries. `./init.sh` may go red between files but the COMMIT is
  one. Iteration ends only when `./init.sh` is green with the entire wave
  applied. One single commit at the end of wave B.
- **Wave C — Post-cache hardening.** `updateTag` from Server Actions,
  build-matrix regression guard, admin-untouched inspection, doc, final
  gate.

EARS notation: *When/While/If [condition], the system shall [action].* IDs
continue from F3 (last F3 REQ = REQ-29). Each requirement names an explicit
verification gate.

> **Status of REQ-30, REQ-31, REQ-33 (DONE — already in main).** Shipped
> 2026-05-31 (commit `4194493…` chain). Kept in this file as F4 narrative,
> marked DONE; the implementer MUST NOT re-execute them.
>
> **Status of REQ-32 (APPLIED in working tree, not yet committed).** The line
> `export const dynamicParams = true;` is already absent from
> `src/app/archivo/[season]/[split]/page.tsx` (verified — see Wave A REQ-32
> below). The implementer ONLY verifies this in Wave A and commits it
> together with REQ-43 + REQ-44 as the wave-A commit.

---

## REQ-30 — Delete dead `fetchData.ts` module — DONE (in main)

Already shipped. Verification proof:
- `ls src/lib/data` → `No such file or directory`.
- `grep -rn "fetchData" src` → empty.

Do not re-execute.

---

## REQ-31 — Move `matchService.ts` → `lib/utils/matches.ts` — DONE (in main)

Already shipped. Verification proof:
- `find src/lib/services -name "matchService*"` → empty.
- `find src/lib/utils -name "matches.ts"` → 1 file.
- `grep -rn "from '@/lib/utils/matches'" src` → exactly
  `bracketService.ts:5`.

Do not re-execute.

---

## REQ-33 — Hub queries flipped to cookie-free Supabase client — DONE (in main)

Already shipped. Verification proof:
- `grep -rn "supabase.auth\|cookies(" src/lib/queries/` → empty.
- `grep -c "await createClient()" src/lib/queries/admin.queries.ts` → `8`
  (admin queries deliberately stay cookie-aware).

Do not re-execute.

---

# Wave A — Pre-flights (one commit at the end of the wave)

Each Wave-A REQ must pass `./init.sh` on its own BEFORE the flag flip in
Wave B. Wave A finishes with **one commit** that bundles REQ-32 (already in
working tree) + REQ-43 + REQ-44.

## REQ-32 — Remove `dynamicParams = true` from archive detail route — APPLIED, verify only

**When** F4 prepares to enable `cacheComponents`, **the system shall** keep
the archive detail route free of `export const dynamicParams = true;` so
the route is compatible with Next 16's strict prerender contract.

**Current state.** The line is already absent from
`src/app/archivo/[season]/[split]/page.tsx` (working tree). Verified at the
time of this respec — file lines 27–32 show `generateStaticParams` then
immediately `generateMetadata`, no `dynamicParams` between them. There is
NO code change for this REQ in Wave A; the implementer only verifies it and
commits it in the Wave-A commit alongside REQ-43 + REQ-44.

**Verification gate.**
- `grep -rn "dynamicParams" src/app/` returns nothing.
- The Wave-A commit (after REQ-43 + REQ-44) includes the deletion of that
  line in its diff against `main`.

---

## REQ-43 — NEW pre-flight: extract `new Date()` out of `Footer` (root-layout safe)

**When** `cacheComponents: true` is about to ship, **the system shall** ensure
that `src/components/shared/layout/Footer.tsx` does NOT call
`new Date().getFullYear()` (or any other non-deterministic / I/O call) at
server render time, because the Footer is mounted under
`src/app/layout.tsx:82` and would otherwise force EVERY page into the
non-cacheable bucket once the flag is on.

**Rationale (resolves second drift, item #1).** Implementer round-2 verified
that flipping `cacheComponents` while `Footer` still computes
`new Date().getFullYear()` synchronously in the server tree of the root
layout makes the build error on every page (Next 16 treats `new Date()` in
a non-cached RSC as a non-deterministic read and refuses to prerender).
Decoupling the year from server render is the smallest fix that makes the
root layout safe.

**Scope — allowed shapes (author's pick, gated by `./init.sh`).**
1. **Preferred — Client Component leaf.** Create
   `src/components/shared/layout/FooterYear.tsx` with `'use client'` at the
   top, exporting a small component that renders just the `{year}` span,
   computing `new Date().getFullYear()` on the client. Mount it inside
   `Footer.tsx` in place of the existing `{currentYear}` interpolation.
   `Footer.tsx` stays a Server Component and loses the
   `const currentYear = new Date().getFullYear();` line.
2. **Alternative — `'use cache'` Server Component with `cacheLife('days')`.**
   Allowed if the implementer wants a server-rendered year, BUT only after
   REQ-40 has shipped (so the directive is legal). Since this REQ is a Wave-A
   pre-flight (BEFORE REQ-40), option 1 is the only one that works under
   Wave A.

The implementer MUST pick option 1 for Wave A.

**Constraints.**
- Visual output unchanged (same Spanish copy, same Tailwind classes).
- Footer remains exported from `src/components/shared/index.ts:6` with the
  same name (`Footer`) — no consumer change.
- `FooterYear.tsx` is a tiny client leaf; do NOT pull other Footer markup
  into it.

**Verification gate.**
- `grep -n "new Date" src/components/shared/layout/Footer.tsx` returns
  nothing.
- `grep -l "'use client'" src/components/shared/layout/FooterYear.tsx`
  returns the new file path.
- `grep -n "<FooterYear" src/components/shared/layout/Footer.tsx` returns
  at least one match (FooterYear is mounted inside Footer).
- `./init.sh` GREEN (baseline — `cacheComponents` is NOT yet on).
- Manual dev visit of `/` and `/hub` shows the year still rendered in the
  Footer (hydrates client-side).

---

## REQ-44 — NEW pre-flight: wrap every page-level `await get*()` in `<Suspense>`

**When** `cacheComponents: true` is about to ship, **the system shall** ensure
that EVERY server `await` of a `get*()` query in an App-Router
`page.tsx` / `layout.tsx` / `template.tsx` is reachable only through a
`<Suspense fallback={…}>` boundary, so the page can stream while the query
resolves under `cacheComponents` semantics.

**Rationale (resolves second drift, item #2).** Implementer round-2 verified
that `cacheComponents: true` rejects any server `await` of dynamic data that
is NOT either (a) wrapped in `'use cache'` (the query is cached) or
(b) wrapped in `<Suspense>` (the page can stream). Wave-A applies (b) so
the build keeps working AT the flag flip in Wave B. The cache wrapping (a)
happens in Wave B and converts the same `await` sites into cached reads —
the Suspense boundaries STAY (they're cheap and they're the contract under
`cacheComponents`).

**Concrete sites to fix (from grep audit).**

| File | Lines requiring Suspense | Notes |
|---|---|---|
| `src/app/hub/layout.tsx` | 18, 21 | `getActiveSeasonWithSplit` + `Promise.all` block. Wrap the shell-feeding async block in a child server component under `<Suspense>` — see design.md §A for the pattern. |
| `src/app/archivo/layout.tsx` | 22, 25 | Mirror of hub layout. Same pattern. |
| `src/app/archivo/page.tsx` | 21 | `Promise.all` of seasons/seasonInfo/champions for archive grid. |
| `src/app/archivo/[season]/[split]/page.tsx` | 46, 52 | `getSplitByNames` + `Promise.all`. SSG path: Suspense fallback is rendered at build only if the leaf throws/streams, but the boundary is REQUIRED under `cacheComponents`. |
| `src/app/page.tsx` | 42, 53 | Landing — `getActiveSeasonWithSplit` + `getAllSeasonsWithSplits` + the inner `getCurrentRound`/`getDivisionPreview`/`getMatchesByRound` Promise.all. |
| `src/app/[season]/[split]/page.tsx`, `cruces/page.tsx`, `final/page.tsx` | 15, 16, 22 each | Legacy redirect leaves. See "Legacy redirect routes exception" below. |
| `src/app/hub/page.tsx` | 24 | `await getActiveSeasonWithSplit()`. The page already wraps section children in Suspense (F5), but the top-level await itself is not yet under Suspense — must be moved into a streamed child. |
| `src/app/hub/bracket/page.tsx`, `calendario/page.tsx`, `clasificacion/page.tsx`, `olimpo/page.tsx`, `entrenadores/page.tsx` | 21 + each `getCurrentRound` (when present) | Same shape: top-level cheap awaits need to move into a streamed shell. |
| `src/app/hub/entrenador/[id]/page.tsx` | 32, 33 | `await params` + `await getTrainerById`. The `getTrainerById` call needs Suspense; the `await params` is a Next 16 dynamic API and is always allowed. |

The implementer MUST grep `await get` across `src/app/**/*.tsx` and confirm
the table is exhaustive — if a NEW page is found that the table missed,
add it under the same pattern; do NOT silently skip.

**Legacy redirect routes exception.** The three files under
`src/app/[season]/[split]/` (`page.tsx`, `cruces/page.tsx`, `final/page.tsx`)
each end in `redirect(...)` (verified — `redirect` import + tail call). A
redirect leaf has no rendered output, so a Suspense boundary does not gain
anything in terms of streaming. HOWEVER, under `cacheComponents` the build
still needs to validate the awaits. Two acceptable shapes:
1. Wrap the `await`s in a `<Suspense fallback={null}>` inside a tiny child
   `async function`. The child throws/redirects; Suspense unwinds; output
   is the redirect.
2. Migrate these files to leverage `'use cache'` (after Wave B). Since
   Wave A predates the flag flip, option 1 is the pre-flight shape.

The implementer picks option 1 for these three files in Wave A.

**Fallback shape (Spanish UI copy preserved).** Use the existing
`<SectionSkeleton variant=…/>` from
`src/components/shared/ui/SectionSkeleton.tsx` (F5 shipped 9 variants —
`phaseBanner`, `standings`, `bracket`, `rightColumn`, `newsRail`,
`calendar`, `roster`, `olimpo`, `trainerProfile`). For shell-level
boundaries that wrap the entire PixelShell (hub layout / archivo layout),
no existing variant fits — render a minimal `<div className="min-h-screen bg-px-bg" aria-hidden="true" />`
or, preferred, extract a new `ShellSkeleton` server component into
`src/components/shared/ui/` reusing the pixel CSS tokens (see design.md
§A). For redirect leaves use `fallback={null}` — there is no UI to hold.

**Constraints.**
- DO NOT add `'use cache'` in this REQ. That's Wave B.
- DO NOT migrate query callers to React Compiler / `cache()` patterns —
  those are F4-owned changes elsewhere.
- Wrap only. The shape is: extract the awaits into a child server component
  function declared in the SAME file (or a sibling file under the same
  folder when natural), wrap that child in `<Suspense fallback={…}>`. Do
  NOT move the queries into the leaves — Wave B keeps them in
  `lib/queries/`.
- Keep the existing F5 Suspense boundaries unchanged. New boundaries from
  this REQ are ADDITIVE; they sit ABOVE the F5 boundaries.

**Verification gate.**
- `./init.sh` GREEN (still on baseline — flag NOT yet on).
- `grep -nE "^\s*await get" src/app/**/page.tsx src/app/**/layout.tsx` (zsh
  recursive glob — `setopt extendedglob` if needed) shows ONLY awaits that
  live inside a Suspense-wrapped child function, not at the top level of the
  page/layout default export. (The implementer documents which child holds
  each await in the commit message body.)
- For each touched file, a `<Suspense fallback={…}>` JSX literal exists
  wrapping the child that owns the await.
- `pnpm build` baseline still shows ≥23 pages, ≥3 prerendered URLs under
  `/archivo/[season]/[split]`.
- Manual dev visit `/` + `/hub` + `/archivo` shows the same final UI as
  before; nothing regresses visually.

---

# Wave B — Cache migration (ATOMIC, single commit)

Wave B is one atomic commit. `./init.sh` may go RED between files during
iteration; the COMMIT happens only when `./init.sh` is GREEN with REQ-40 +
REQ-34 + REQ-35 + REQ-36 ALL applied. The IMPLEMENTER may iterate freely
between files in the order LOCKED below; the REVIEWER sees one diff.

**Mandatory file order inside Wave B** (design.md §B locks this):
1. `next.config.ts` (REQ-40 flag flip).
2. `src/lib/queries/archive.queries.ts` (REQ-34).
3. `src/lib/queries/seasons.queries.ts` (REQ-35).
4. `src/lib/queries/leagues.queries.ts` — leaf readers FIRST
   (`getLeaguesBySplit`, `getRankingsByLeague`, `getMatchesByRound`,
   `getLeagueByTier`, `getParticipantsBySplit`), then `getDivisionPreview`
   LAST (REQ-36 leaf-first sub-order).
5. `src/lib/queries/tournament.queries.ts`, `trainers.queries.ts`,
   `bracket.queries.ts` (REQ-36 tail).

## REQ-40 — Enable `cacheComponents` in `next.config.ts`

**When** Wave A has shipped (REQ-32 + REQ-43 + REQ-44 committed) and
`./init.sh` is GREEN on that commit, **the system shall** enable Next 16's
Cache Components mode by adding `cacheComponents: true` to `next.config.ts`
as the FIRST step of Wave B.

**Why this is now safe.** Wave A removed the two `cacheComponents`
blockers: `Footer`'s `new Date()` is gone (REQ-43), every page-level
`await get*()` is wrapped in `<Suspense>` (REQ-44). The build is expected
to pass IMMEDIATELY after this flip even before REQ-34/35/36 land, because
the queries still use legacy React `cache()` which under `cacheComponents`
is treated as dynamic-but-Suspense-OK.

**Edit shape (locked).**

```ts
// next.config.ts (after REQ-40)
const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  poweredByHeader: false,
  images: { ... },
};
```

**Verification gate (intermediate — no commit yet).**
- `grep -n "cacheComponents" next.config.ts` returns one line:
  `cacheComponents: true,`.
- `./init.sh` GREEN. If RED, STOP and report: a Wave-A boundary was missed.
  Do NOT proceed to REQ-34 until this is green.
- `/hub/*` may still appear `ƒ Dynamic` in `pnpm build` output — expected.

## REQ-34 — Migrate archive queries to `'use cache'`

**When** REQ-40 is GREEN (intermediate), **the system shall** migrate the 5
readers in `src/lib/queries/archive.queries.ts` to the `'use cache'` triad
(directive + `cacheLife` + `cacheTag`).

Readers migrated (5):
`getArchiveChampions` (line 33), `getArchiveDivisionPreview` (line 98),
`getPublicActiveSeasonWithSplit` (line 183),
`getPublicAllSeasonsWithSplits` (line 228),
`getPublicCurrentRound` (line 273).

**Pattern (locked — design.md §B).**
1. `export const x = cache(async (...) => {...})` → `export async function x(...) { ... }`.
2. First line in body: `'use cache';`.
3. Second line: `cacheLife(<profile>)` per the taxonomy table in design.md §C.
4. Third line: `cacheTag(<tag>, [<tag>...])`, template literals for
   parameterized tags.
5. Preserve return-shape AND the `[fnName] Error:` log + `[]/null/Map()`
   fallback contract from CLAUDE.md.

**File-level cleanup.**
- Drop `import { cache } from 'react';`.
- Add `import { cacheLife, cacheTag } from 'next/cache';`.

**Verification gate (intermediate).**
- `grep -c "'use cache'" src/lib/queries/archive.queries.ts` returns `5`.
- `grep -c "cacheTag(" src/lib/queries/archive.queries.ts` returns `5`.
- `grep -c "cacheLife(" src/lib/queries/archive.queries.ts` returns `5`.
- `grep "from 'react'" src/lib/queries/archive.queries.ts` returns nothing.
- `./init.sh` GREEN. If RED, fix in place — Wave B is still in iteration.

## REQ-35 — Migrate seasons queries to `'use cache'`

**When** REQ-34 is GREEN, **the system shall** migrate the 7 readers in
`src/lib/queries/seasons.queries.ts`: `getActiveSeasonWithSplit` (17),
`getAllSeasons` (63), `getAllSeasonsWithSplits` (83), `getSeasonWithSplits`
(128), `getSeasonByName` (172), `getArchiveSplitParams` (217),
`getSplitByNames` (250). Pattern as REQ-34.

**Build-time constraint.** `getArchiveSplitParams` feeds
`generateStaticParams()` in `src/app/archivo/[season]/[split]/page.tsx:28`.
Build manifest must still prerender ≥3 archive URLs. If it drops below,
STOP — the `'use cache'` directive is breaking SSG and needs design review
before continuing.

**Verification gate (intermediate).**
- `grep -c "'use cache'" src/lib/queries/seasons.queries.ts` returns `7`.
- `grep -c "cacheTag(" src/lib/queries/seasons.queries.ts` returns `7`.
- `grep "from 'react'" src/lib/queries/seasons.queries.ts` returns nothing.
- `./init.sh` GREEN.
- `pnpm build 2>&1 | grep "/archivo/"` shows ≥3 prerendered URLs.

## REQ-36 — Migrate hot-path queries to `'use cache'` (leaf-first)

**When** REQ-35 is GREEN, **the system shall** migrate the 9 hot-path
readers across 4 files. Pattern as REQ-34.

Files + readers:
- `src/lib/queries/leagues.queries.ts` × 6 — `getLeaguesBySplit` (30),
  `getRankingsByLeague` (52), `getDivisionPreview` (129), `getLeagueByTier`
  (180), `getParticipantsBySplit` (203), `getMatchesByRound` (267).
  **Sub-order: leaves first** (`getLeaguesBySplit`, `getRankingsByLeague`,
  `getMatchesByRound`, `getLeagueByTier`, `getParticipantsBySplit`), THEN
  `getDivisionPreview` (which composes them).
- `src/lib/queries/tournament.queries.ts` × 1 — `getCurrentRound` (11).
- `src/lib/queries/trainers.queries.ts` × 1 — `getTrainerById` (15).
- `src/lib/queries/bracket.queries.ts` × 1 — `getBracketData` (34) (calls
  `getLeaguesBySplit` internally; nested cached calls compose transparently
  per design.md §D gotcha #5).

**Verification gate (intermediate).**
- `grep -c "'use cache'" src/lib/queries/leagues.queries.ts` returns `6`.
- `grep -c "'use cache'" src/lib/queries/tournament.queries.ts` returns `1`.
- `grep -c "'use cache'" src/lib/queries/trainers.queries.ts` returns `1`.
- `grep -c "'use cache'" src/lib/queries/bracket.queries.ts` returns `1`.
- `grep "from 'react'" src/lib/queries/leagues.queries.ts src/lib/queries/tournament.queries.ts src/lib/queries/trainers.queries.ts src/lib/queries/bracket.queries.ts`
  returns nothing.
- `./init.sh` GREEN.

## Wave-B commit gate (MANDATORY)

**When** REQ-40 + REQ-34 + REQ-35 + REQ-36 are ALL applied and `./init.sh`
is GREEN with the full set in place, **the system shall** commit Wave B as
**one atomic commit** with message prefix `refactor(f4-wave-b):`. Do NOT
commit any subset. Do NOT split the commit. Iteration was allowed inside
the wave; the public history shows one commit only.

If `./init.sh` cannot reach GREEN at the end of the wave, STOP and report —
do not commit a half-wave.

---

# Wave C — Post-cache hardening (one commit per REQ, `./init.sh` between)

## REQ-38 — `updateTag(...)` in `seasons/_actions.ts`

**When** Wave B has committed, **the system shall** add `updateTag(...)`
calls to the 4 Server Actions in
`src/app/admin/dashboard/seasons/_actions.ts` so cached `/hub/*` and
`/archivo/*` views reflect mutations on next render.

**Mechanism.** `updateTag` from `next/cache`. The file is a Server Action
module (`'use server';` at line 1 — verified) so `updateTag` is legal.

**Per-action invalidation set (LOCKED — preserved from previous spec).**

| Action (file: `src/app/admin/dashboard/seasons/_actions.ts`) | `updateTag` calls |
|---|---|
| `createSeasonAction` (line 20) | `updateTag('seasons')` |
| `deleteSeasonAction` (line 42) | `updateTag('seasons')` + `updateTag('archive')` |
| `activateSeasonAction` (line 63) | `updateTag('seasons')` + `updateTag('archive')` |
| `deactivateSeasonAction` (line 99) | `updateTag('seasons')` + `updateTag('archive')` |

Total `updateTag` calls in the file after REQ-38: **7** (1 + 2 + 2 + 2).
Each `updateTag` is placed AFTER the existing `revalidatePath(SEASONS_PATH)`
and BEFORE `return { ok: true }`. The existing `revalidatePath` calls
(lines 38, 59, 95, 118) STAY — they bust the admin React tree which remains
`ƒ Dynamic` per REQ-39.

**Verification gate.**
- `grep -c "updateTag(" src/app/admin/dashboard/seasons/_actions.ts` returns
  `7`.
- `grep -c "revalidatePath(" src/app/admin/dashboard/seasons/_actions.ts`
  returns `4` (unchanged).
- `grep -n "from 'next/cache'" src/app/admin/dashboard/seasons/_actions.ts`
  shows `revalidatePath, updateTag` imported together.
- `./init.sh` GREEN.
- Manual smoke (required): admin activates a different season → `/hub` →
  active-season chip in `TopBar` reflects the new state without a hard
  reload. Capture result in `progress/history.md`.

## REQ-37 — Build-matrix regression guard

**When** REQ-38 is GREEN, **the system shall** capture `pnpm build` output
and verify the F4 acceptance matrix below.

| Route | Expected | Acceptable also |
|---|---|---|
| `/` | `○` (static) | `⚡` |
| `/hub`, `/hub/clasificacion`, `/hub/calendario`, `/hub/bracket`, `/hub/olimpo`, `/hub/entrenadores` | `○` | `⚡` |
| `/hub/entrenador/[id]` | `○` | `⚡` |
| `/archivo` | `○` | — |
| `/archivo/[season]/[split]` | `●` (SSG ≥3) | — |
| `/admin/dashboard/**` | `ƒ Dynamic` | — |
| `/login`, `/admin` | `ƒ Dynamic` | — |
| `/[season]/...` legacy redirects | `ƒ Dynamic` | — (redirects stay dynamic) |

**Acceptance criteria.**
- ZERO `ƒ Dynamic` routes under `/hub/*` or `/archivo/*`.
- `/admin/**` stays `ƒ Dynamic` (regression guard — REQ-39).
- Total page count ≥23.
- Prerendered archive URLs ≥3.

**If a `/hub/*` route still shows `ƒ Dynamic`**, cause is (a) a query
reader was skipped in Wave B, (b) a `/hub/*` leaf still calls
`cookies()`/`headers()`/`searchParams` directly. Grep:
`grep -rn "cookies\|headers\|searchParams" src/app/hub/` — empty.

**Verification gate.**
- Implementer pastes the `pnpm build` "Route (app)" section into
  `progress/history.md` for the F4 entry.
- Reviewer re-runs `pnpm build` and confirms.
- This REQ is INSPECTION ONLY — no code change, no commit.

## REQ-39 — Admin queries stay dynamic (regression inspection — no code change)

**While** F4 is shipping, **the system shall** leave
`src/lib/queries/admin.queries.ts` (8 readers — verified via
`grep -c "export const get" admin.queries.ts`) entirely untouched, AND
acknowledge that the 20 `router.refresh()` call sites in the 5 non-pilot
Managers (Splits×4, Divisions×2, Regulations×1, Participants×6, Matches×7)
continue to mutate Supabase directly and do NOT bust `'use cache'` entries.

Decision (Option A — user-locked 2026-05-31). F4 ships `updateTag` ONLY in
the 4 already-existing Server Actions (REQ-38). The 20 browser-side writes
keep their `router.refresh()` and produce a staleness window bounded by
each query's `cacheLife` revalidate interval (≤60s for match/standings
data; ≤1h for season/participant metadata; ≤24h for archive). Acceptable
because admin and viewer are the same person today; F6 owns the closure
(per `features.json` F6).

**Verification gate (inspection only).**
- `git diff src/lib/queries/admin.queries.ts` empty.
- `grep -c "'use cache'" src/lib/queries/admin.queries.ts` returns `0`.
- `grep -c "await createClient()" src/lib/queries/admin.queries.ts` returns
  `8`.
- `grep -rn "router.refresh" src/app/admin/ | wc -l` returns `20`.
- Documented in `progress/history.md` F4 entry. No commit.

## REQ-41 — Document the cache tag taxonomy

**When** REQ-37 + REQ-39 are GREEN, **the system shall** add a "Cache tag
taxonomy" section to either `docs/conventions.md` or `docs/ARCHITECTURE.md`
(author's pick — pick whichever has the closer adjacency to caching). The
section must contain:

1. The 8 tag families (literal): `seasons`, `splits:${id}`,
   `matches:${splitId}`, `rankings:${leagueId}`,
   `participants:${splitId}`, `bracket:${splitId}`, `trainers`, `archive`.
2. For each tag: which queries READ it; which Server Actions WRITE it
   TODAY (post-REQ-38) and which are F6-deferred.
3. A "How to add a new mutation" 3-step recipe pointing at REQ-38 as the
   reference shape.
4. A boxed callout for the **REQ-39 staleness window** (Option A) — name
   the 5 non-pilot Managers, name the `cacheLife` worst-case bounds, link
   to `features.json` F6.
5. The "admin queries never cache" rule (REQ-39 rationale).

**Verification gate.**
- `grep -l "cache tag\|tag taxonomy" docs/conventions.md docs/ARCHITECTURE.md`
  returns at least one path.
- Each tag family appears literally in the doc (grep `seasons`,
  `splits:`, `matches:`, `rankings:`, `participants:`, `bracket:`,
  `trainers`, `archive`).
- `./init.sh` GREEN (docs change shouldn't move any gate; run anyway).
- Commit.

## REQ-42 — Final `./init.sh` + handoff note

**When** REQ-41 has committed, **the system shall** run `./init.sh` one
final time, capture the tail, capture the `pnpm build` "Route (app)"
section, and add a new entry to `progress/history.md` titled
"2026-XX-XX — F4 implemented (implementer → reviewer)" containing:
- typecheck/lint/build counts;
- REQ-37 build matrix proof (paste table);
- REQ-38 manual smoke result;
- Wave-A / Wave-B / Wave-C file deltas;
- explicit citation that REQ-39 is deferred to F6 per Option A;
- tag-taxonomy spot-check (3 random readers carrying the right triad).

`features.json` F4 stays `in_progress` — reviewer flips to `done`.

**Verification gate.**
- `progress/history.md` has the new entry.
- Reviewer can independently re-run `./init.sh` GREEN.

---

# Out of scope (deferred / pointers)

- **5 non-pilot Managers' Server Actions migration.** `features.json` F6.
  See REQ-39 staleness window.
- **`window.confirm()` replacement.** `features.json` F6.
- **Atomic activate-season RPC.** `features.json` F0 REQ-3.
- **Per-action `auth.getUser()` re-checks.** F6 hardening.
- **Custom `cacheLife` profiles in `next.config.ts`.** Stay on Next 16
  built-ins for F4. If FR10 realtime needs sub-minute, F6 owns it.
- **`SplitDataProvider` render-prop refactor.** `features.json` F6.
- **Dead cluster sweep** (`home/Hero.tsx`, `CurrentSeason.tsx`,
  `Navbar.tsx`, `LinkButton.tsx`). Future micro-batch.
- **`/cruces`, `/final` legacy routes** under `src/app/[season]/[split]/`.
  Out of scope BEYOND the Wave-A Suspense wrap (REQ-44). Likely deleted by
  F6 / FR11 redirect work.
- **`/admin/dashboard/seasons/_actions.ts` swap of `revalidatePath` →
  `revalidateTag` for admin React tree.** Out of scope — admin tree stays
  `ƒ Dynamic`.

# Residual risk register (NEW — third respec)

- **R1 — Wave-A REQ-44 discovers MORE awaits than the table lists.**
  The implementer MUST re-grep `await get` across `src/app/**/*.tsx` and
  wrap any newcomers under the same pattern. If a newcomer is in a hot
  path that the spec didn't classify (e.g. an admin RSC), STOP and report
  — do NOT silently add `'use cache'` (Wave A is pre-flag).
- **R2 — Wave-B Step 1 (REQ-40 flag flip) fails the build despite Wave A.**
  Cause is almost certainly a leaf RSC calling a non-deterministic API
  (`new Date()`, `Math.random()`, `Date.now()`, `crypto.randomUUID()` on
  the server) outside Footer. Grep across `src/components/**/*.tsx` and
  `src/app/**/*.tsx`; report findings before patching. Do not silently
  introduce `'use cache'` to mask the issue.
- **R3 — Wave-B SSG regression (archive URL count drops below 3 after
  REQ-35).** Means `'use cache'` on `getArchiveSplitParams` returns an
  empty list at build time (cached client may not be hydrated at build).
  STOP and report — design review needed; do not commit Wave B.
- **R4 — REQ-43 client component breaks visual parity.** The year used to
  be server-rendered; now it hydrates. Until hydration completes, the
  span is empty. If acceptable to the user (it is — single digit, footer
  position), continue; otherwise pass the year as a server-prop from a
  cached parent post-Wave-B.
- **R5 — REQ-44 Suspense extraction tangles the legacy redirect leaves.**
  The `<Suspense fallback={null}>` wrap of a `redirect()`-only async leaf
  is unusual; if Next 16 complains about a no-op render, fall back to
  Wave-B `'use cache'` migration for those three files (deferred to a
  follow-up commit after Wave B). Document the deferral.
