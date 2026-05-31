# Progress log

Running log of the SDD harness. Newest entries on top. The Leader appends here on every
status transition; agents record any deferral or sequencing decision here too.

---

## 2026-05-31 — F4 CLOSED (reviewer APPROVED → leader)

Cache Components mode (Next 16.1.1) is now live across the public surface. F4
shipped in 3 waves after two spec rewrites that resolved framework drift.

**Waves shipped:**
- Wave A (pre-flight): REQ-32 (dynamicParams gone from archive route), REQ-43
  (Footer year extracted to `FooterYear.tsx` client leaf to remove `new Date()`
  from RSC root layout), REQ-44 (Suspense wrap on 17 page-level awaits — 13
  hub/archive + 4 admin live extension approved before Wave B). New shared
  primitive: `ShellSkeleton`.
- Wave B (atomic flip): REQ-40 (`cacheComponents: true` in `next.config.ts`) +
  REQ-34/35/36 (`'use cache' + cacheTag + cacheLife` on 21 readers: archive 5,
  seasons 7, leagues 6, tournament/trainers/bracket 1 each). Shipped as ONE
  atomic operation because `cacheComponents: true` and `'use cache'` are
  inseparable in 16.1.1 — intermediate `./init.sh` red was expected and
  documented in the spec.
- Wave C (invalidation + docs): REQ-38 (7 `updateTag` calls in `seasons/_actions.ts`
  — `seasons` × 1, `archive` × 2 across the 4 actions, all on success branch),
  REQ-37 build matrix regression check, REQ-39 admin inspection (admin queries
  intentionally NOT cached), REQ-41 (added "Cache tag taxonomy" section to
  `docs/conventions.md` with the 8 tag families, per-query assignment, mutation
  recipe, staleness callout, admin-never-cache rule), REQ-42 close-out.

**Build matrix after F4:**
- `○ Static`: `/`, `/admin`, `/hub`, `/hub/bracket`, `/hub/calendario`,
  `/hub/clasificacion`, `/hub/entrenadores`, `/hub/olimpo`, `/archivo`.
- `◐ Partial Prerender`: `/hub/entrenador/[id]`, `/archivo/[season]/[split]`
  (3 prerendered URLs preserved), `/[season]/...` legacy redirects,
  `/admin/dashboard/**`.
- `ƒ Dynamic`: ZERO. Cache Components mode collapses the legend to `○`/`◐` only.
- 30 generated pages (≥23 baseline).

**Spec drift resolved across two rewrites:**
1. First drift: spec ordered REQ-40 last but Next 16.1.1 SWC rejects `'use cache'`
   when `cacheComponents: false`. Reordered to put REQ-40 before the cache waves.
2. Second drift: REQ-40 alone failed because (a) `Footer.tsx` had `new Date()`
   in root layout and (b) hub/archive page-level awaits lacked Suspense. Added
   REQ-43 + REQ-44 as pre-flights; bundled REQ-40 + REQ-34/35/36 atomically.

**Live decisions:**
- `dynamicParams = true` removed from archive route (user-approved trade: 404
  for unknown slugs, generateStaticParams remains source of truth).
- `/hub/*` static shift accepted (user-approved): FR10 realtime subscriptions
  live in hydrated client components, so the static server shell is safe with
  `updateTag` invalidation from Server Actions.
- REQ-44 extended live to wrap 4 admin RSC awaits (user-approved before Wave B
  flip); admin queries themselves stay uncached.
- Wave B shipped atomic (red intermediates allowed); the spec mandated commit
  boundary aligns with logical waves, but the user opted to keep everything in
  working tree and commit themselves.

**Deferred to F6:**
- `docs/conventions.md:24-27` stale callout about deleted `fetchData.ts`
  (reviewer flagged as out-of-scope cleanup).
- Admin-specific `AdminShellSkeleton` (current admin pages use the generic
  `ShellSkeleton`).
- Custom `cacheLife` profiles if observed invalidation patterns demand them.

**Files net delta:** 2 created (`FooterYear.tsx`, `ShellSkeleton.tsx`),
2 deleted (`fetchData.ts`, `matchService.ts`), 1 moved (`matchService.ts` →
`src/lib/utils/matches.ts`), ~25 edited. `./init.sh` GREEN at close.

NEXT: F4 closed. activeBatch cleared. F6 (Refactor mayores) unblocked
(dependsOn `['F3','F4']` both done). F2 architecture-review initiative still
shows F2 done; only F6 remains pending in that initiative.

---

## 2026-05-31 — F4 PARTIAL — BLOCKED ON SPEC DRIFT (implementer → leader)

Implemented REQ-30, REQ-31, REQ-33 successfully (`./init.sh` green between each).
Hit a spec/framework drift at REQ-34 that prevents continuing without leader
re-spec. Stopped per implementer rule 4 ("PARA y reporta").

**Pre-flight finding — `features.json` JSON parse error.** Baseline `./init.sh`
was RED on entry because `features.json:7` was missing a comma after the
`_note_activeBatch` string (before the `initiatives` key). Biome's JSON parser
flagged it. Fixed by adding the comma — no semantic change. Then ran `./init.sh`
clean (23 pages, 0 lint warnings) before starting REQ-30.

**REQ-30 — DONE.** Deleted `src/lib/data/fetchData.ts` and the now-empty
`src/lib/data/` dir. `grep -rn fetchData src/` returns 0. `./init.sh` green;
lint dropped 2 → 1 warning.

**REQ-31 — DONE.** Moved `src/lib/services/matchService.ts` →
`src/lib/utils/matches.ts` (dropped the unused `Matchup` import in the move).
Updated single consumer `src/lib/services/bracketService.ts:1-5` (Biome
auto-fixed import order after the path change). `grep` gates all pass.
`./init.sh` green; lint dropped 1 → 0 warnings (both F4-owned warnings cleared).

**REQ-33 — DONE.** Flipped 9 hub-query call sites to
`createClient({ session: false })` across `leagues.queries.ts` (5 calls),
`seasons.queries.ts` (5 of 7 — lines 219/255 were already cookie-free per F5),
`tournament.queries.ts` (1), `trainers.queries.ts` (1), `bracket.queries.ts`
(1). `admin.queries.ts` (8 readers) untouched per REQ-37. Sanity grep confirms.
`./init.sh` green.

**Side-effect — `/hub/*` and `/archivo` flipped from `ƒ` to `○`.** With the
cookie-free flip in place (and before any `'use cache'` directive), the build
manifest now shows `○ /hub`, `○ /hub/bracket`, `○ /hub/calendario`,
`○ /hub/clasificacion`, `○ /hub/entrenadores`, `○ /hub/olimpo`, `○ /archivo`
all as STATIC (was `ƒ Dynamic` per F5 baseline). `/hub/entrenador/[id]` stays
`ƒ`. `● /archivo/[season]/[split]` still SSG with 3 prerendered URLs.
This is a net win, but it is a behavior shift the spec did not call out —
worth flagging because `/hub/*` was deliberately designed as `ƒ Dynamic` per
F5 close-out note ("hub stays cookie-aware/dynamic" to preserve realtime/auth
semantics). REQ-33's design.md justification (D4) explicitly disproves the
F5 cookie-aware gating for server reads — that is consistent — but the routes
themselves now bake at build time, which has implications for FR10's
realtime subscriptions on `/hub/*`. Flagged for reviewer/leader; no action
taken.

**REQ-34 — BLOCKED. Build hard-fails with `'use cache'` when
`cacheComponents` is off.** Ran REQ-34 exactly per spec (5 readers in
`archive.queries.ts` converted from `cache(async () => {})` to
`async function() { 'use cache'; cacheLife(...); cacheTag(...); ... }`;
React `cache` import dropped; `cacheLife`/`cacheTag` imported from
`next/cache`; all gate greps pass `5/5/5`). `./init.sh` fails at build:

```
To use "use cache", please enable the feature flag `cacheComponents`
in your Next.js config.

Import trace:
  Server Component:
    ./src/lib/queries/archive.queries.ts
    ./src/lib/queries/index.ts
    ...
    at <unknown> (./src/lib/queries/archive.queries.ts:36:3)
    at <unknown> (./src/lib/queries/archive.queries.ts:105:3)
    at <unknown> (./src/lib/queries/archive.queries.ts:192:3)
    at <unknown> (./src/lib/queries/archive.queries.ts:241:3)
    at <unknown> (./src/lib/queries/archive.queries.ts:288:3)
```

The error originates from Next 16.1.1's SWC compiler at BUILD time, not
runtime. The spec (tasks.md REQ-34 step + design.md §6 #4) predicted that
`'use cache'` would compile fine and only `cacheLife()` would throw at request
time. That prediction is wrong for this Next version — the SWC transform
itself rejects the directive when `cacheComponents` is off.

REQ-34 reverted to keep baseline green.

**Then tested: can we flip `cacheComponents: true` early (REQ-40 before
REQ-34)?** Edited `next.config.ts` to add `cacheComponents: true`. Build
fails with a DIFFERENT error:

```
Route segment config "dynamicParams" is not compatible with
`nextConfig.cacheComponents`. Please remove it.
    at <unknown> (./src/app/archivo/[season]/[split]/page.tsx:31:14)
```

F5 shipped `export const dynamicParams = true;` at
`src/app/archivo/[season]/[split]/page.tsx:31`. With `cacheComponents: true`
that line must be removed. The spec did not call this out — it claimed the
flip is safe once `'use cache'` directives are in place (design.md §6 #4).

`cacheComponents: true` reverted. Baseline restored green.

**Drift summary for the leader.**

1. **Sequencing inverted vs spec.** The spec's REQ-40-last ordering is
   incompatible with Next 16.1.1's SWC behavior. `cacheComponents: true`
   must be flipped BEFORE any `'use cache'` directive can compile. The
   correct order is the reverse of what the spec locked: flip the flag
   first (REQ-40), THEN ship the directives (REQ-34/35/36). The user's
   rule #3 warning ("if you flip cacheComponents early, cacheLife throws
   in queries that don't yet have 'use cache' and breaks the build")
   does NOT apply — `cacheLife()` is only ever called inside `'use cache'`
   bodies (we never call it from a free function). The premise of the
   user's warning doesn't materialize in our codebase.

2. **`dynamicParams = true` must be removed.** F5's
   `src/app/archivo/[season]/[split]/page.tsx:31` is incompatible with
   `cacheComponents: true`. The spec did not address this. Removing it
   is a behavior change for the route: with `dynamicParams = true`,
   unknown `(season, split)` URLs render dynamically; without it, they
   404. Given the archive only has 3 known URLs and the season set is
   admin-controlled (no user-generated URLs), 404 on unknown slugs is
   likely the correct behavior — but this is a product decision the
   spec author did not weigh.

3. **`/hub/*` route shift to STATIC (post-REQ-33).** Already documented
   above. May interact with FR10 realtime expectations. Worth a leader
   check before continuing.

**Recommended re-spec from leader.**

- Re-order F4 to: REQ-30 → REQ-31 (done) → REQ-33 (done) → [new REQ-39.5:
  remove `dynamicParams = true` from archive page] → REQ-40 (flip
  cacheComponents) → REQ-34 → REQ-35 → REQ-36 → REQ-38 → REQ-37/REQ-39
  guard checks.
- Confirm `/hub/*` STATIC shift is acceptable (or scope a fix:
  add `await connection()` to a leaf in each hub page to force dynamic,
  per Next 16 cache-components docs).
- Decide product behavior for unknown archive URLs (404 vs ignore the
  whole batch).

**State on hand-back.** All REQ-30/31/33 file mutations are committed to the
working tree (no git commits — implementer doesn't commit unless asked).
`./init.sh` is GREEN. `features.json` JSON parse error fix is included.
Specs not modified by implementer.

**Files mutated in this session (net):**
- DELETED: `src/lib/data/fetchData.ts` (+ empty `src/lib/data/` dir).
- DELETED: `src/lib/services/matchService.ts`.
- CREATED: `src/lib/utils/matches.ts` (matchService contents minus `Matchup`).
- EDITED: `src/lib/services/bracketService.ts` (import path + auto-sort).
- EDITED: `src/lib/queries/leagues.queries.ts` (5× `{ session: false }`).
- EDITED: `src/lib/queries/seasons.queries.ts` (5× `{ session: false }`).
- EDITED: `src/lib/queries/tournament.queries.ts` (1× `{ session: false }`).
- EDITED: `src/lib/queries/trainers.queries.ts` (1× `{ session: false }`).
- EDITED: `src/lib/queries/bracket.queries.ts` (1× `{ session: false }`).
- EDITED: `features.json` (added missing comma at line 7).

**`./init.sh` tail (last green run, post-revert):**
```
✓ typecheck clean
Checked 157 files in 27ms. No fixes applied.
✓ lint clean
▲ Next.js 16.1.1 (Turbopack)
✓ build succeeds
✓ Harness ready — baseline is green.
```
Page count: 23 (matches F5 baseline). Lint: 0 errors, 0 warnings (REQ-30 + REQ-31
each cleared one F4-owned warning).

`features.json` F4 stays `in_progress`. No `[DONE]` annotations applied yet
because only 3 of 12 REQs landed and the batch did not close cleanly.

---

## 2026-05-31 — F4 specs approved, status → in_progress (user → implementer)

User approved `specs/{requirements,design,tasks}.md` produced by spec-author. F4 status
flipped `pending` → `in_progress`; `spec` field set to `"specs/"`. Implementer
dispatched with REQs in the spec-locked order; `./init.sh` (REQ-41) green between
each REQ — reviewer will reject any REQ that lacks a green gate.

**REQ summary (full text in `specs/requirements.md`):**
- REQ-30/31 — Cleanup: delete `src/lib/data/fetchData.ts`, move
  `src/lib/services/matchService.ts` → `src/lib/utils/matches.ts` (clears the 2
  pre-existing F2-era warnings as a side-effect).
- REQ-32 — Tag taxonomy locked: `seasons`, `splits:${id}`, `matches:${splitId}`,
  `rankings:${leagueId}`, `participants:${splitId}`, `bracket:${splitId}`,
  `trainers`, `archive`. `cacheLife` profiles use Next 16 built-ins only (no
  custom profiles in `next.config.ts`).
- REQ-33 — Flip 9 hub-query call sites to `createClient({ session: false })`
  (prerequisite for `'use cache'` — cookies/auth aren't readable inside cached
  scopes). Verified safe via `grep "supabase.auth" src/lib/queries/` → ZERO hits.
- REQ-34/35/36 — Three `'use cache'` waves in order: archive 5 → seasons 7 → hub
  9. REQ-35 mandates ≥3 prerendered URLs preserved post-migration
  (`generateStaticParams` regression guard).
- REQ-37 — 8 readers in `admin.queries.ts` stay cookie-aware/dynamic
  (RLS-scoped to admin identity — caching would leak across sessions).
- REQ-38 — `updateTag(...)` (NOT `revalidateTag`) wired into the 4 F3 Server
  Actions in `seasons/_actions.ts`. Rationale: `updateTag` is Server-Action-only
  with immediate expiration and read-your-own-writes semantics; `revalidateTag`
  is now 2-arg required (single-arg deprecated) and is for general on-demand
  invalidation.
- REQ-39 — Document Option A staleness gap: 13 browser-side writes across 5
  non-pilot Managers stay on `router.refresh()` and are deferred to F6.
  Worst-case staleness bounded by `cacheLife('minutes')` = 60s on
  match-derived data.
- REQ-40 — `cacheComponents: true` enabled in `next.config.ts` as the LAST step
  (cacheLife throws without the flag per
  `node_modules/next/dist/server/use-cache/cache-life.js:67-75`).
- REQ-41 — Cross-cutting `./init.sh` gate between every REQ.

**Coherence gap decision — Option A (locked).** Options B/C would either blur the
F3↔F6 boundary or directly violate F3's `deferred[]` list. Option A keeps F4
scoped: only the 4 seasons actions get `updateTag`; the other 5 Managers'
writes remain unbusted by F4 (F6 owns their Server Actions migration).

**Deferrals captured by spec-author:**
- 5 non-pilot Managers' Server Actions migration (with `updateTag` wiring) → F6.
- Custom `cacheLife` profiles → F6 (only if FR10 realtime needs sub-minute freshness).
- `SplitDataProvider` render-prop refactor → F6.
- `window.confirm()` replacement → F6.

---

## 2026-05-31 — F4 opened (leader → spec-author)

User selected F4 (Fase 4 — Cacheo coherente) as the next batch. `dependsOn: ["F1","F3"]`
both satisfied. `features.json` `activeBatch` → `["F4"]`; status stays `pending`
until spec-author writes `specs/{requirements,design,tasks}.md` (same convention
used for F0/F1/F2/F3/F5).

**Pre-spec audit (leader, before dispatching spec-author):**

This is **Next 16.1.1** — F4 uses the modern Cache Components API (`'use cache'`
directive, `cacheTag`, `cacheLife`, `revalidateTag`). NOT the legacy
`unstable_cache` pattern (which exists only in the about-to-be-deleted
`fetchData.ts`). F1 deliberately deferred `cacheComponents`; F5 shipped 11
`<Suspense>` boundaries across `/hub/*` clearing the strict-mode prerequisite.
Now is the moment to flip it on alongside `'use cache'`.

**Query inventory — `src/lib/queries/` (7 files, 28 exported readers).**
All 28 wrapped in React `cache()` for per-request dedupe; F4 layers Next 16
`'use cache'` + `cacheTag` on the candidates and leaves the dynamic ones alone.

- **`archive.queries.ts` (5 readers)** — ALREADY cookie-free (uses
  `createClient({ session: false })` per F5 Option C). Strong `'use cache'`
  candidates because they read immutable past-season data:
  `getArchiveChampions`, `getArchiveDivisionPreview`,
  `getPublicActiveSeasonWithSplit`, `getPublicAllSeasonsWithSplits`,
  `getPublicCurrentRound`. `cacheLife('hours' | 'days')` looks right;
  `cacheTag` per `splitId` enables granular invalidation when an admin
  closes out a season retroactively.
- **`leagues.queries.ts` (6 readers)** — cookie-aware today, but read public
  tournament data (rankings, participants, matches by round). Candidates IF
  spec-author can prove no auth dependency: `getLeaguesBySplit`,
  `getRankingsByLeague`, `getDivisionPreview`, `getLeagueByTier`,
  `getParticipantsBySplit`, `getMatchesByRound`. These are the **hot path**
  for `/hub/*` — `'use cache'` here is where the perf win lives. Tag scheme
  likely: `matches:${splitId}`, `rankings:${leagueId}`, `participants:${splitId}`.
  Verified zero `supabase.auth.*` calls anywhere in `src/lib/queries/` —
  cookie-aware client is used for RLS-safe reads but the data itself is public.
- **`seasons.queries.ts` (7 readers)** — `getActiveSeasonWithSplit`,
  `getAllSeasons`, `getAllSeasonsWithSplits`, `getSeasonWithSplits`,
  `getSeasonByName`, `getArchiveSplitParams`, `getSplitByNames`. Most are
  derived from `seasons` + `splits` tables which only change via admin actions
  → strong candidates with tag `seasons`. Note `getArchiveSplitParams` already
  feeds `generateStaticParams` so it MUST stay statically resolvable.
- **`bracket.queries.ts` (1 reader)** — `getBracketData` aggregates finals data;
  candidate with tag `bracket:${splitId}` invalidated by match mutations.
- **`trainers.queries.ts` (1 reader)** — `getTrainerById` for `/hub/entrenador/[id]`.
  Candidate with tag `trainers` (rarely changes).
- **`tournament.queries.ts` (1 reader)** — `getCurrentRound` derives current
  round from matches. Tied to `matches` tag — invalidates whenever a match
  result is recorded.
- **`admin.queries.ts` (7 readers)** — `getDashboardStats`, `getAdminSeasons`,
  `getAdminSplitsBySeason`, `getAdminLeaguesBySplit`, `getAdminTrainers`,
  `getAdminParticipantsByLeague`, `getAdminMatchesByLeague`, `getActiveSplitInfo`.
  **DYNAMIC — stay cookie-aware, NO `'use cache'`**. RLS-scoped to the
  authenticated admin identity; caching them would leak across sessions.
  Spec-author MUST confirm this stays untouched.

**Candidates summary: ~21 of 28 readers eligible (5 archive + 6 leagues + 7 seasons + 1 bracket + 1 trainers + 1 tournament). 7 admin readers stay dynamic.**

**`fetchData.ts` consumers — ZERO.** Verified `grep -rn fetchData
/Users/diego/Developer/calmind-series/src/` returns no imports anywhere
outside the file itself. Already a dead module post-F5 (the new hub queries
went through `lib/queries/`, never through `lib/data/`). Delete is a clean
no-op + clears the `J15Match/J16Match` `noUnusedImports` warning at
`fetchData.ts:5`.

**`matchService.ts` consumers — ONE.** `src/lib/services/bracketService.ts:5`
imports `buildJ15Matchups`, `getFromJ15Match`, `getJ16Match`. Move
`matchService.ts` → `src/lib/utils/matches.ts` and update that single import.
The `Matchup` `noUnusedImports` warning at `matchService.ts:5` disappears as
part of the move (the type isn't re-exported by any consumer). NOTE
`bracketService.ts` itself stays in `lib/services/` — only `matchService.ts`
moves; the rename also drops the misleading "service" label for pure functions.

**`next.config.ts` re `cacheComponents` — currently ABSENT.** F1 left it
undeclared (not commented — fully omitted) because enabling it without
Suspense + `'use cache'` would have broken the build. F5 shipped the Suspense
prerequisite; F4 supplies the `'use cache'` prerequisite. Spec-author should
add `cacheComponents: true` as the LAST step (gated on a green build with
`'use cache'` directives in place — wrong order = red build).

**Mutation paths that need `revalidateTag` from F4:**

1. **Server Actions in `src/app/admin/dashboard/seasons/_actions.ts` (4 actions,
   shipped by F3)** — currently use `revalidatePath('/admin/dashboard/seasons')`.
   F4 should evaluate adding `revalidateTag('seasons')` (and `'matches'` for
   activate which cascades — activating a season can flip the active split
   that hub queries depend on). Spec-author decides: keep both, replace path
   with tag, or layer them.
2. **Browser-side Supabase writes still in 5 non-pilot Managers** (per F3
   close-out — F6 owns their Server Action migration):
   - `ParticipantsManager.tsx` — 4 writes: trainer insert/delete, league_participants insert/update (lives).
   - `MatchesManager.tsx` — 4 writes: match insert/delete + 2 batch inserts (J15/J16 generators).
   - `DivisionsManager.tsx` — 2 writes: leagues insert/delete.
   - `SplitsManager.tsx` — 2 writes: splits insert/delete.
   - `RegulationsManager.tsx` — 1 storage upload to PDF bucket.
   These call `router.refresh()` today. F4 does NOT migrate these to Server
   Actions (that's F6) — but spec-author must decide: does F4 leave them on
   `router.refresh()` (which won't invalidate `'use cache'` entries), or
   does F4 require ALL mutations to flow through Server Actions to keep
   cache coherence honest? If left as-is, the cached views would go stale
   on admin writes. Likely answer: F4 introduces tags + a minimal set of
   Server Actions for the high-traffic mutations (matches in particular —
   the spec item literally says "Call revalidateTag('matches') from the
   Server Action that updates results"), and either flags the rest as F6
   work OR adds thin server-action wrappers around the existing writes.

**Red flags spec-author must resolve:**

1. **Cookie-aware vs cookie-free for the `leagues.queries.ts` candidates.**
   `'use cache'` cannot run code that calls `cookies()`. Today these queries
   use the cookie-aware `createClient()` even though they don't actually
   touch `supabase.auth.*`. Spec-author needs to either (a) flip them to
   `createClient({ session: false })` (the F5 Option C overload) before
   adding `'use cache'`, or (b) prove the cookie touch is incidental and
   can be dropped. Option (a) is the safer path — already proven in archive
   queries — but it broadens the "narrowly scoped" decision F5 made. Logic
   note: F5 explicitly kept hub queries cookie-aware "to preserve realtime/auth
   semantics" — F4 needs to either disprove that gating or accept the perf
   ceiling.
2. **`generateStaticParams` interaction.** `getArchiveSplitParams` already
   feeds `generateStaticParams` for `/archivo/[season]/[split]` (3 prerendered
   URLs in F5 build manifest). Adding `'use cache'` to it must not regress
   that — `generateStaticParams` runs at build time and needs the function
   to return a list synchronously-resolvable from the data layer. Spec-author
   should verify `'use cache'` plays nicely with `generateStaticParams` in
   Next 16.1.1 (it does, per docs, but worth a sanity test in the spec).
3. **Mutation coherence gap.** As above — if F4 caches hub queries but leaves
   5 Managers writing directly to Supabase + `router.refresh()`, the cache
   never invalidates on admin writes. Either F4 escalates a minimal Server
   Action migration for the write paths it cares about (matches at minimum),
   or it documents the staleness window as a F6 follow-up.
4. **`cacheLife` defaults.** Next 16 ships `default`, `seconds`, `minutes`,
   `hours`, `days`, `weeks`, `max` profiles. Spec-author should pick per
   query class: archive = `days/max`, public hub reads = `minutes/hours`
   with `revalidateTag` backing, season metadata = `hours/days`.
5. **No circular dependency risk on the `matchService.ts` move.**
   `matches.ts` will import from `@/lib/constants/matches` and
   `@/lib/types/{matches,schemas}` — none of those import back from
   `lib/utils/`. Clean.

**2 pre-existing F4-owned warnings preserved.** Both clear as side-effects of
items 3 (fetchData delete) and 4 (matchService move). Reviewer should verify
post-build `pnpm lint` reports **0 warnings** when F4 closes (not 2).

**Next agent:** `spec-author`. Inputs: F4 items in `features.json` + this
history entry + `ARCHITECTURE_REVIEW.html §F4` + the 5 red flags above.
Output: `specs/{requirements.md, design.md, tasks.md}` overwriting the F3
batch. After spec-author returns, leader presents to user for approval
before implementer dispatch (no implementation without explicit user approval).

**Gate:** implementer ships only after a green `./init.sh` post-`cacheComponents`
flip — reviewer rejects otherwise.

---

## 2026-05-31 — F3 closed (reviewer signed off)

Re-ran `./init.sh` independently — GREEN (23 pages, 0 lint errors, 2 known F4-owned
warnings preserved untouched). All spec gates verified: REQ-26 hook adopted by 3
Managers with correct depths, REQ-27 `safeParse` boundaries in all 6 Managers + 7
new `*InputSchema` exports, REQ-28 pilot fully migrated (zero browser supabase
writes in `SeasonsManager`, 4 actions with discriminated-union returns + `'use server'`
+ `revalidatePath`, `useOptimistic` with tagged-union reducer per design D4). Live
decisions validated: MatchesManager hook deferral is legit (dual-cascade Results vs
Planning), `RegulationsUploadSchema` adoption is functionally equivalent to the prior
inline guards, cookie-aware Supabase in `_actions.ts` is coherent for RLS,
removed `useEffect` in ParticipantsManager was redundant per Biome. Scope discipline
held — no F4/F6/REQ-3 deferrals breached. Flipped `features.json` F3 → `done`,
cleared `activeBatch`, captured deferrals + closing note on the F3 entry.

NEXT: F4 (Cacheo coherente) unblocked — `dependsOn: ["F1","F3"]` both done. Owns
`'use cache'` + `cacheTag` migration, deletion of `src/lib/data/fetchData.ts` (clearing
the 2 known warnings as a side-effect), move of `matchService.ts` to `lib/utils`, and
`cacheComponents` enablement in `next.config.ts`.

---

## 2026-05-31 — F3 implemented (implementer → reviewer)

Implemented the approved F3 batch (`specs/requirements.md` + `design.md` + `tasks.md`)
in the sequence the spec locked: REQ-27 (Zod) → REQ-26 (hook) → REQ-28 (pilot). `./init.sh`
verified green after each REQ — no batched verification.

**REQ-27 — Zod input schemas wired into 6 admin forms**

- **Created NEW schemas in `src/lib/types/schemas.ts`:** `SeasonCreateInputSchema`,
  `SplitCreateInputSchema`, `LeagueCreateInputSchema`, `TrainerInputSchema`
  (`avatar_url`/`bio` use a `preprocess` that maps `''` → `null`),
  `MatchPlanningInputSchema` (UUIDs, round int 1..16, refine `home !== away`),
  `MatchResultInputSchema` (sets int 0..3), and `RegulationsUploadSchema`
  (`z.instanceof(File)` + PDF type + 50MB size). Each also exports a `z.infer`
  type alias to match the existing convention.
- **Decision on `RegulationsUploadSchema`:** ADOPTED (not kept inline). The spec
  flagged this as implementer choice; the schema is the only one in `schemas.ts`
  whose source is a `File` rather than a row, but keeping it co-located preserves
  the "single source of truth" guarantee and lets `safeParse` replace the
  hand-rolled `type !== 'application/pdf'` + size guards cleanly. Adopted in
  `RegulationsManager.tsx`.
- **`safeParse` boundaries wired in 6 Managers:** `SeasonsManager` (create),
  `SplitsManager` (create), `DivisionsManager` (create), `ParticipantsManager`
  (trainer save — single handler covers both update and insert branches),
  `MatchesManager` (planning create/edit AND result edit), `RegulationsManager`
  (file change). Each follows the spec's pattern: `setError(joined messages)`
  + `setSaving(false)` + early return on `!parsed.success`. Verified
  `rg "from '@/lib/types/schemas'" src/app/admin/` returns 6 hits (target ≥5).

**REQ-26 — `useLeagueSelector` hook adopted by 3 Managers**

- **Created `src/lib/hooks/useLeagueSelector.ts`** per the spec's contract.
  Implements `'use client'`, uses `createClient()` from `@/lib/supabase/client`,
  defaults `selectedSeasonId` to active-else-first-else-null, fetches splits
  ordered by `split_order ASC` on season change (auto-selects active-else-first
  split when `depth === 'season-split-league'`), fetches leagues ordered by
  `tier_priority ASC` on split change WITHOUT auto-selecting a league (per
  contract). Errors logged as `[useLeagueSelector] Error:`, stored in `error`,
  never thrown. Exposes `refresh()` for post-mutation re-fetch and a `clearError()`
  callback so consumers can dismiss banners cleanly. Honors `initialSplitId` /
  `initialLeagueId` seeds via `useRef` guards (one-shot seed application, then
  hands control back to the auto-select behavior).
- **Adopted in `SplitsManager.tsx`** with `depth: 'season-split'`. Removed local
  `selectedSeasonId`, `splits`, `loadingSplits` state + cascade `useEffect` +
  `refreshSplits()` helper; the create handler now calls the hook's `refresh()`.
  Net diff (per `git diff --stat`): -100 / +37 lines.
- **Adopted in `DivisionsManager.tsx`** with `depth: 'season-split-league'`.
  Removed cascade state (`splits`, `leagues`, `loadingSplits`, `loadingLeagues`,
  the 2 `useEffect`s, `refreshLeagues()`). Same `refresh()` plumbing.
  Net diff: -138 / +50 lines.
- **Adopted in `ParticipantsManager.tsx`** with `depth: 'season-split-league'`
  for the assignment cascade. Trainer tab state (pagination, search,
  `trainers[]` from `initialTrainers`) untouched per spec. Kept the local
  `useEffect` that auto-selects the first league once leagues finish loading
  (the original assignment UX behavior — distinct from the hook's
  no-auto-select-league contract since the Manager cares about a default value,
  not the hook). Removed both cascading `useEffect`s + the auto-select-active-split
  block; kept the participants-fetch effect since that's a per-league concern,
  not part of the selector. Net diff: -153 / +50 lines.
- **Total LOC reduction across the 3 Managers: 264 deletions / 127 insertions =
  net -137.** Spec target was ≥80.

**Decision on `MatchesManager` hook adoption — DEFERRED to F6** (spec explicitly
authorized this flexibility). Rationale: the Manager runs TWO independent
cascades — Results tab derives leagues from `activeSplitInfo.split.id` server-side
(no Season/Split selectors at all), while Planning tab uses the full
Season → Split → League cascade seeded from `activeSplitInfo`. A single
`useLeagueSelector` instance cannot model both surfaces, and instantiating two
would duplicate the Supabase client per render plus tangle the Results tab's
auto-select-from-active-split logic (which is unique — neither of the other 3
Managers has a server-seeded "current league" concept). The hook contract stays
clean for the 3 adopters; rewriting `MatchesManager` to split its leagues state
into two parallel hooks is a non-trivial refactor better suited to F6 when the
remaining Managers also migrate. The Zod validation in REQ-27 still landed on
this Manager (planning + result edit) — the hook adoption is what's deferred.

**REQ-28 — `SeasonsManager` pilot (Server Actions + `useOptimistic`)**

- **Created `src/app/admin/dashboard/seasons/_actions.ts`** with top-of-file
  `'use server';` directive. Four exported actions: `createSeasonAction`,
  `deleteSeasonAction`, `activateSeasonAction`, `deactivateSeasonAction`. Each
  validates input (`SeasonCreateInputSchema` for create, `z.string().uuid()` for
  ID), uses the cookie-aware `createClient()` from `@/lib/supabase/server`,
  returns a discriminated union `{ ok: true } | { ok: false; error: string }`
  (never throws), logs `[<actionName>] Error:` on Supabase failures, and calls
  `revalidatePath('/admin/dashboard/seasons')` after success. `activateSeasonAction`
  stays 2-step (deactivate all `.neq('id', id)` then activate target) per the
  spec — atomic RPC is REQ-3, still deferred.
- **Rewrote `SeasonsManager.tsx`** to consume the actions:
  - Removed `import { createClient } from '@/lib/supabase/client'` and the
    `useRouter` import + `router.refresh()` calls.
  - Added `useOptimistic` + `startTransition` from React.
  - Single tagged-union reducer per design D4 — `OptimisticAction` covers
    `create | delete | activate | deactivate` in one reducer; activate is the
    interesting case (mutates 2 rows: sets `is_active: true` on the target,
    `false` on everyone else).
  - The 4 handlers wrap `applyOptimistic(...)` then `await <action>(...)`
    inside `startTransition`. On `!result.ok`, set the error banner; on success,
    `revalidatePath` reconciles by re-pushing `initialSeasons` server-side.
  - The optimistic-create temp ID uses `crypto.randomUUID()` so React's `key`
    prop stays unique while the server insert resolves.
  - Verified gates: `rg "from '@/lib/supabase/client'"` → 0, `rg "supabase.from\("`
    → 0, `rg "useOptimistic"` → 2 (declaration + apply), `grep -c "'use server'"`
    on `_actions.ts` → 1. `window.confirm` kept on delete per spec (F6 owns
    its replacement).

**Files net delta**

- **Created (2):**
  - `src/lib/hooks/useLeagueSelector.ts`
  - `src/app/admin/dashboard/seasons/_actions.ts`
- **Edited (7):**
  - `src/lib/types/schemas.ts` (+7 input schemas + type aliases)
  - `src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` (full rewrite)
  - `src/app/admin/dashboard/splits/_components/SplitsManager.tsx` (hook + Zod)
  - `src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx` (hook + Zod)
  - `src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` (hook + Zod)
  - `src/app/admin/dashboard/matches/_components/MatchesManager.tsx` (Zod only — hook DEFERRED)
  - `src/app/admin/dashboard/normativa/_components/RegulationsManager.tsx` (Zod for upload)
- **Deleted:** none.

**Framework gotchas that surfaced**

- **`revalidatePath` import.** Confirmed against `node_modules/next/cache.d.ts`
  that v16.1.1 re-exports `revalidatePath` from `next/cache` (not deprecated /
  not renamed). Imported it as-is.
- **`useOptimistic` requires Client Component + `startTransition`.** Manager
  stays `'use client'` (form state, modal visibility, `useOptimistic` all need
  the browser). Actions invoked inside `startTransition(async () => {...})` —
  the optimistic update is applied synchronously, then `await action(...)` runs,
  then revalidation reconciles. Verified the action's `Promise<ActionResult>`
  shape works with `startTransition`'s async callback in React 19.2.3.
- **Biome `useExhaustiveDependencies` triggered once.** A leftover `useEffect`
  in `ParticipantsManager` listed `selectedSplitId` as a dep but only called
  state setters (always stable); biome flagged the dep as extra. The effect
  was actually redundant (the participants `useEffect` on `selectedLeagueId`
  already clears state when the league becomes null), so dropping it was the
  correct fix. Caught between REQ-26 and REQ-27 — re-ran `./init.sh` after,
  green.
- **Cookie-aware Supabase client in actions.** `createClient()` from
  `@/lib/supabase/server` (the default cookie-aware variant) is required for
  actions — they run server-side under the admin's authenticated identity that
  `proxy.ts` propagates. The cookie-free F5 variant (`session: false`) stays
  scoped to archive routes and is NOT used in admin actions (would break RLS).
- **`MatchesManager` dual-cascade.** Documented above as the REQ-26 deferral.

**Verification — final `./init.sh` GREEN.** Tail:
```
  ✓ typecheck clean
Found 2 warnings.                  (pre-existing, F4-owned — fetchData.ts:5, matchService.ts:5)
  ✓ lint clean
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 2.4s
✓ Generating static pages using 9 workers (23/23) in 405.8ms
ƒ Proxy (Middleware)
  ✓ build succeeds
  ✓ Harness ready — baseline is green.
```
23 pages built (matches F5 baseline). Lint 0 errors / 2 warnings (the two
F4-owned `noUnusedImports` in `fetchData.ts:5` and `matchService.ts:5` —
unchanged from baseline). No new warnings introduced by F3.

**features.json:** F3 items annotated with `[DONE 2026-05-31]`. F3 `status`
stays `in_progress` — reviewer flips to `done` after independent green
`./init.sh`. Handing to reviewer.

---

## 2026-05-30 — F3 specs approved, status → in_progress (user → implementer)

User approved `specs/{requirements,design,tasks}.md` produced by spec-author. F3 status
flipped `pending` → `in_progress`; `spec` field set to `"specs/"`. Implementer dispatched
with the 4 REQs in order (REQ-26 → REQ-27 → REQ-28 → REQ-29 gate). Cross-cutting rule:
`./init.sh` green between each REQ — reviewer will reject any REQ that lacks a green
gate.

**REQ summary (full text in `specs/requirements.md`):**
- REQ-26 — `useLeagueSelector` hook at `src/lib/hooks/useLeagueSelector.ts`. Adopted by
  Splits/Divisions/Participants Managers. MatchesManager adoption optional (dual-cascade
  complexity — may defer to F6 if contract gets ugly).
- REQ-27 — 6 new `*InputSchema` exports in `src/lib/types/schemas.ts`; thin `safeParse`
  boundary at each form handler. NO React Hook Form adoption.
- REQ-28 — SeasonsManager PILOT: `_actions.ts` (4 server actions) + `useOptimistic`
  (single tagged-union reducer). `revalidatePath` (not `revalidateTag` — F4 territory).
- REQ-29 — cross-cutting `./init.sh` gate between REQs.

**Item 1 dropped from F3 scope:** spec-author verified all 6 Managers already import
`AdminModal`/`AdminErrorBanner` from `@/components/admin/ui` (FR12+FR13+FR14 closed
adoption at 100%). Only loose end: hand-rolled success banner in `RegulationsManager.tsx:115-128` — out of scope (not an error primitive), logged as future micro-batch.

**Deferrals captured by spec-author:**
- `window.confirm()` replacement → F6.
- 5 non-pilot Managers' Server Actions migration → F6.
- `cacheTag`/`revalidateTag` in `_actions.ts` → F4.
- MatchesManager hook adoption → may defer to F6.
- Atomic activate-season RPC → REQ-3 (still deferred; needs Supabase migration access).

---

## 2026-05-30 — F3 opened (leader → spec-author)

User selected F3 (Fase 3 — Abstracciones admin) as next batch. `dependsOn: ["F2"]`
satisfied (F2 closed 2026-05-28). Status remains `pending` until spec-author
produces `specs/{requirements,design,tasks}.md` (same convention used for F0/F1/F2/F5);
`activeBatch` set to `["F3"]`.

**Pre-spec audit (leader, before dispatching spec-author):**

The 4 items in `features.json` for F3 were authored before FR12/FR13/FR14 shipped
the admin pixel reskin. Quick repo inspection found drift the spec-author must
reconcile:

- **Item 1 — Extract `<AdminModal>` and `<AdminErrorBanner>`.** SUPERSEDED.
  Both primitives already exist in `src/components/admin/ui/`
  (`AdminModal.tsx`, `AdminErrorBanner.tsx`, exported from `index.ts` alongside
  `AdminCard`, `AdminButton`, `AdminInput/Select/Textarea`, `AdminBadge`). Shipped
  in FR12. Spec-author must either (a) reframe as an *adoption audit* — verify
  all 6 Managers (Seasons/Splits/Divisions/Regulations/Participants/Matches)
  actually consume these primitives instead of inlining `<dialog>`/banner JSX —
  or (b) drop the item entirely if FR13/FR14 already wired adoption.
- **Item 2 — `useLeagueSelector()` hook.** No `src/hooks/` directory exists yet.
  Hook is genuine net-new work. Spec-author to identify which Managers duplicate
  the Temporada → Split → División cascade today.
- **Item 3 — Zod validation in admin forms.** Zero matches for `schemas` imports
  under `src/app/admin/dashboard/`. Schemas exist (`src/lib/types/schemas.ts`,
  per CLAUDE.md and F2 outcome) but no admin form consumes them. Net-new wiring.
- **Item 4 — `SeasonsManager` → Server Actions + `useOptimistic`.** Confirmed
  still on `useState` + manual fetch + `try/catch` (`SeasonsManager.tsx` lines
  23–29). True pilot — no Server Actions in admin yet. Sets the pattern that
  F6 will roll out to the remaining 5 Managers.

**Next agent:** spec-author. Inputs: F3 entry + items + `pre_spec_findings` in
`features.json`, this history entry, `ARCHITECTURE_REVIEW.html §F3`, existing
admin primitives in `src/components/admin/ui/`, `SeasonsManager.tsx` as pilot
target. Output: `specs/{requirements.md, design.md, tasks.md}` overwriting the
F5 batch. After spec-author returns, leader presents to user for approval before
implementer dispatch (no implementation without explicit user approval).

---

## 2026-05-30 — F5 done (reviewer signed off, leader close-out)

Reviewer verdict: **`F5 APPROVED — ready for leader close-out`**. Full `./init.sh`
GREEN: typecheck clean, lint 0 errors / 2 pre-existing F4-owned warnings, build
**23 pages**. `/archivo/[season]/[split]` flipped to SSG (3 prerendered URLs in
the manifest); `/hub/*` correctly stays `ƒ Dynamic` by design (realtime + auth).
Bundle JS reduction measured at **~110–114 KB** across `/hub/*` routes from the
client→server push + dead-code deletion.

**Net result (what F5 actually shipped):**
- **REQ-21 — SSG on archive.** `generateStaticParams` wired on
  `/archivo/[season]/[split]` only (active hub stays dynamic per locked scope).
  Build manifest shows 3 prerendered URLs for the route.
- **REQ-22 — Suspense parallelism.** 11 granular `<Suspense>` boundaries across
  `/hub/*` panels (one per panel) — slow queries now stream independently
  instead of blocking the whole hub on the slowest fetch.
- **REQ-23 — Client→server push.** 3 client shells survive
  (`ClasificacionView`, `RosterView`, `CalendarView`); their parents pushed to
  RSC. Dead post-FR11 components deleted instead of refactored:
  `PlayoffBracket`, `MatchupCard`, `DivisionSection`, `RosterView` (old
  in-place), plus 2 sibling/index orphans (6 deletions total).
- **REQ-24 — Shared primitives.** 4 extracted to kill duplication across
  hub/archivo/admin error states:
  - `src/components/shared/ui/BackgroundDecoration.tsx`
  - `src/components/shared/ui/EmptyState.tsx`
  - `src/components/shared/ui/SectionSkeleton.tsx`
  - `src/lib/utils/formatters.ts` (incl. `formatSplitName()`)
- **REQ-25 — Image/animation polish.** `<Image sizes>` audit, animation delays
  capped, Pokéball JS spin loops swapped for CSS `@keyframes` (main thread freed).

**Live implementer decision logged — Option C narrowly scoped (NOT escalated to /hub/*):**
`design.md` evaluated three options for REQ-21's cookie-free Supabase client.
Option C (cookie-free overload via `createServerClient` factory variant) shipped,
but **narrowly scoped to archive queries only**. Hub queries deliberately
**remain cookie-aware** because:
1. `/hub/*` is `ƒ Dynamic` by design (live tournament state, weekly cadence) —
   no SSG benefit to gain by dropping cookies.
2. Hub paths may consume auth context downstream (FR10 realtime + future admin
   gating); flipping them to cookie-free would silently break those expectations.
3. Blast-radius minimization: keep the SSG concession isolated to one immutable
   route family (past seasons archive) rather than rippling through the live app.
The narrowing was caught and ratified during implementation, not deferred —
documented in `features.json` F5 `deferred[]` and the F5 `note` as a closed
decision (not a TODO).

**Files net delta (resumido):**
- **Created (19):** 3 client shells (`hub/clients/`), 11 hub section servers
  (`hub/sections/`), 4 shared primitives (`shared/ui/BackgroundDecoration.tsx`,
  `EmptyState.tsx`, `SectionSkeleton.tsx`, `lib/utils/formatters.ts`),
  + `RosterGrid.tsx`.
- **Edited (~25):** hub pages (`/hub`, `/hub/bracket`, `/hub/calendario`,
  `/hub/clasificacion`, `/hub/entrenador/[id]`, `/hub/entrenadores`,
  `/hub/olimpo`), hub layout, archive route + layout, landing
  `PixelLanding.tsx`, hub view components (`BracketView`, `CalendarView`,
  `ClasificacionView`, `HubRightColumn`, `OlimpoView`, `PhaseBanner`),
  shared layout (`PixelShell`, `SeasonSplitChip`, `TopBar`), queries
  (`archive.queries.ts`, `seasons.queries.ts`, `queries/index.ts`),
  `lib/supabase/server.ts` (cookie-free factory variant), shared/hub
  barrels.
- **Deleted (6):** `components/cross/MatchupCard.tsx`,
  `components/cross/PlayoffBracket.tsx`, `components/hub/RosterView.tsx`
  (replaced by `RosterGrid.tsx` + client shell pattern),
  `components/shared/DivisionSection/DivisionSection.tsx`, + siblings/index
  orphans swept on the way out.

**Verification gate (held):**
```
✓ typecheck clean
Found 2 warnings.                  (pre-existing, F4-owned — fetchData.ts:5, matchService.ts:5)
✓ lint clean
▲ Next.js 16.1.1 (Turbopack)
✓ Generating static pages using 9 workers (23/23)
ƒ Proxy (Middleware)
✓ Harness ready — baseline is green.
```

**Leader transition:** `features.json` F5 `spec_ready` → `done`; `activeBatch` →
`[]` (user picks next); `updated` → `2026-05-30`. F5 `items` marked
`[DONE 2026-05-30]`; the locked live decision (Option C narrowly scoped)
recorded in F5 `note` and `deferred[]`. `_note_activeBatch` rewritten to reflect
no active batch + leader's next-best recommendation. `specs/` retained as F5
historical record until the next spec-author run overwrites it.

**Backlog status snapshot (post-F5):**
- **done:** F0, F1, F2, **F5**, FR0–FR14 (entire pixel redesign + admin reskin).
- **pending:** F3 (admin abstractions, 1-2 días, `dependsOn: ["F2"]` ✓ — ready);
  F4 (cacheo coherente, 1-2 días, `dependsOn: ["F1","F3"]` — gated on F3);
  F6 (refactor mayores, "cuando haya tiempo", `dependsOn: ["F3","F4"]` — gated
  on F3+F4).

**Leader recommendation: F3 next.** Reasoning:
1. F3 is the only remaining feature with all deps satisfied (F2 done).
2. F3 unblocks **F4** (`dependsOn: ["F1","F3"]`) and indirectly **F6**
   (`dependsOn: ["F3","F4"]`) — opens the longest critical path.
3. F3 effort (1-2 días) is the next-best ratio: smallest ready feature, biggest
   downstream unlock.
4. Admin pixel primitives (`AdminModal`, `AdminErrorBanner`) already exist from
   FR12 — F3 mostly adopts them at call sites + wires Zod + pilots the Server
   Actions migration on `SeasonsManager`. Less greenfield, more wiring.

User decides. After approval, leader hands the chosen batch to `spec-author`.

---

## 2026-05-28 — F5 spec_ready

Spec-author produced `specs/requirements.md` and `specs/design.md` before hitting
rate limit; leader (main session) closed the gap by writing `specs/tasks.md`.
`features.json` F5 flipped `pending` → `spec_ready`; `activeBatch` stays `["F5"]`;
`updated` stays `2026-05-28`. **Awaiting user approval before implementer is invoked.**

**Requirements summary (REQ-21..REQ-25):**
- **REQ-21** — `generateStaticParams` on `/archivo/[season]/[split]` so the past-seasons
  index/detail routes prerender at build (active hub stays dynamic). Requires a
  cookie-free Supabase client for SSG (Next 16 opts routes that call `cookies()` out
  of static generation).
- **REQ-22** — Granular `<Suspense>` per panel in `/hub/*` so slow queries (rankings,
  matches feed, olympus projection) stream independently instead of blocking the whole
  hub on the slowest fetch.
- **REQ-23** — Push `'use client'` to leaves: only `ClasificacionView`, `RosterView`,
  `CalendarView` stay client; their server-side parents become RSC. Dead-code
  components `PlayoffBracket`, `MatchupCard`, `DivisionSection` (orphaned post-FR11)
  get **deleted** rather than refactored.
- **REQ-24** — Extract shared primitives `<ErrorCard>`, `<PageSkeleton>`,
  `<BackgroundDecoration>` and `formatSplitName()` to `components/shared/` +
  `lib/utils/` to kill duplication across hub/archivo/admin error states.
- **REQ-25** — Image `sizes` audit on all `<Image>` calls, cap animation delays at
  reasonable bounds (no more 30s staggers), swap Pokéball JS spin loops for pure
  CSS `@keyframes` (offload main thread).

**Scope decisions absorbed (user, 2026-05-28):**
1. F5 retargets to the **live** routes `/hub/*` and `/archivo/*` (post-FR11) — the
   original brief targeted `[season]/[split]`, which is now redirected/dead.
2. `generateStaticParams` SOLO on `/archivo/[season]/[split]` (past seasons are
   immutable; active hub is realtime and stays dynamic).
3. Suspense boundaries on `/hub/*` use **parallel** streaming (one boundary per
   panel) rather than a single page-level fallback.
4. `'use client'` push is pragmatic: only the 3 live view components
   (`ClasificacionView`/`RosterView`/`CalendarView`). The brief's
   `CrucesBracket`/`MatchupCard`/`TableRow` are dead post-FR11 — they get deleted,
   not refactored.

**Spec-author hallholdings (documented in specs, out of scope for F5):**
- 2 pre-existing `noUnusedImports` warnings at `fetchData.ts:5` (J15Match/J16Match)
  and `matchService.ts:5` (Matchup) — owned by F4, which deletes `fetchData.ts` and
  moves `matchService.ts` to `lib/utils/matches.ts`. F5 deliberately leaves them.
- Additional dead cluster spotted: `home/Hero.tsx`, `CurrentSeason.tsx`,
  `Navbar.tsx`, `LinkButton.tsx`. Not part of F5; flagged for a future sweep batch
  to avoid scope creep.

**Design decision (REQ-21 mechanism):**
SSG fails if any query path calls `cookies()` (Next 16 opt-out). `design.md`
evaluated three options and locked **Option C** as the default: factor a
cookie-free `createClient({ session: false })` variant in `lib/supabase/server.ts`
for the archivo queries. Option A (split queries) and Option B (per-route
`cookies()` shim) documented as fallbacks if Option C surfaces RLS edge cases
during implementation.

**Next step:** User reviews `specs/requirements.md`, `specs/design.md`, `specs/tasks.md`
and approves (or sends back notes). Implementer is **not** invoked until explicit
approval. Reviewer gate remains: green `./init.sh` before `done`.

---

## 2026-05-28 — F5 selected as next batch (leader handoff to spec-author)

User picked F5 (Fase 5 — Performance / modernización) as the next batch over the
leader's F3 recommendation. F5's `dependsOn: ["F1"]` is satisfied (F1 done). F2 is
also done, so the tree is clean for performance work. `features.json` `activeBatch`
→ `["F5"]`; `updated` → `2026-05-28`. F5 stays `pending` until spec-author writes
`specs/` and leader flips it to `spec_ready`.

**Scope (from ARCHITECTURE_REVIEW.html Fase 5):**
- `generateStaticParams` in `[season]` and `[season]/[split]` routes.
- Granular `<Suspense>` per section in `[split]/page.tsx`.
- Push `'use client'` to minimal wrappers in `CrucesBracket` (now `PlayoffBracket`),
  `MatchupCard`, `TableRow`.
- Extract `<ErrorCard>`, `<PageSkeleton>`, `<BackgroundDecoration>`, `formatSplitName()`.
- Image `sizes`, capped animation delays, CSS spin for Pokéballs.

**Reasoning for picking F5 over F3:**
1. F5 is **standalone** — doesn't touch admin (F3 territory), no cross-phase
   coupling, low blast radius.
2. F5 is **smaller** (~1 día vs F3's 1–2) — a quick win before tackling F3's
   bigger structural work (Server Actions pilot, useLeagueSelector hook, Zod
   wiring across admin forms).
3. F5 frees energy and reduces tech-debt-on-the-public-side BEFORE F3 starts
   migrating admin managers (which will likely thrash a lot of files).
4. `noExplicitAny: error` already active (F2), so no lint-gate surprises.

**CRITICAL — user decisions needed BEFORE spec-author runs (post-FR11 reality
check):** the F5 scope was written before FR11 retired the public legacy routes.
Several items may not map cleanly anymore:

1. **`[season]` / `[season]/[split]` routes are now redirect stubs (post-FR11).**
   `app/[season]/[split]/page.tsx` is 26 lines that call `redirect()` to `/hub`
   (active) or `/archivo/:season/:split` (past). The `[split]/page.tsx` no longer
   has multiple sections — there's nothing to wrap in granular `<Suspense>` there.
   Does F5 instead retarget the new pixel routes (`/hub`, `/hub/clasificacion`,
   `/hub/calendario`, `/hub/bracket`, `/hub/olimpo`, `/archivo`,
   `/archivo/[season]/[split]`)? The `[split]` granular-Suspense requirement
   especially is moot at its original location.

2. **`generateStaticParams` scope:** apply to ALL seasons/splits, or only PAST
   ones (with ISR for active)? Active splits change weekly as matches close —
   wrong ISR settings could serve stale data. The archive detail route
   (`/archivo/[season]/[split]`) is the only remaining `[season]/[split]`-shaped
   page and it's purely past data — ideal `generateStaticParams` target. The
   `[season]/[split]` redirect stub is dynamic by definition (decision depends
   on which split is currently active). Confirm: only the archive route gets
   `generateStaticParams`?

3. **Granular `<Suspense>` — route group changes or just wrappers?** Per-section
   `<Suspense>` in the redesign hub (e.g. `/hub` page composes StoryBeat +
   StandingsLive + ProjectedBracket + RightColumn + NewsRail) needs the data
   fetches to actually be split (otherwise it's cosmetic). Does F5 introduce
   parallel-fetch boundaries, or just wrap existing sequential awaits in
   `<Suspense>` for prerendering? Confirm intent.

4. **`'use client'` push granularity:** `PlayoffBracket.tsx` and `MatchupCard.tsx`
   are entirely `'use client'` today (top-of-file directive). How aggressive
   should the push be: (a) extract only the handler-bearing leaves to client,
   (b) extract anything stateful AND keep prop-children pure RSC, or
   (c) full surgical split with islands? `TableRow` is a Pokémon-original target
   from the brief but the cluster that used it was deleted in F2 — confirm what
   `TableRow` refers to now (likely a row in `ClasificacionView.tsx` or
   `StandingsLive`, both already `'use client'` top-of-file).

5. **`CrucesBracket` → `PlayoffBracket` already renamed (F2, 2026-05-26).** The
   F5 brief text still says "CrucesBracket" — confirmed lives at
   `src/components/cross/PlayoffBracket.tsx`. Spec-author should write F5 spec
   in terms of `PlayoffBracket` (file is `'use client'` top-of-file currently).

6. **2 pre-existing warnings in `fetchData.ts` + `matchService.ts`:** F2 deferred
   them explicitly to F4 (which owns `fetchData.ts` deletion + `matchService.ts`
   move to `lib/utils/matches.ts`). They are NOT F5's. Spec-author should NOT
   absorb them. Verified still pending at `pnpm lint` (2 warnings, both
   `noUnusedImports`). Leave for F4.

**Next agent:** `spec-author`. Inputs: F5 items above + the 6 decisions the user
needs to lock first. Spec-author should surface these to the user before writing
`requirements.md` (they materially shape what gets specced and what doesn't).

**Gate:** implementer ships only after a green `./init.sh`. Reviewer rejects
otherwise.

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

## 2026-05-28 — F5 implementation start (pre-flight)

User invoked the implementer to land F5 (Performance / modernización). Specs were
approved 2026-05-28. Pre-flight checks per `specs/tasks.md` §0:

**Baseline `./init.sh` green** (typecheck clean · lint 0 errors / 2 pre-existing F4
warnings on `fetchData.ts:5` and `matchService.ts:5` · build 20 pages). Confirmed I
will NOT touch the F4-owned warnings.

**Baseline `pnpm build` route table (Next 16 / Turbopack):**

```
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /[season]
├ ƒ /[season]/[split]
├ ƒ /[season]/[split]/cruces
├ ƒ /[season]/[split]/final
├ ○ /admin
├ ƒ /admin/dashboard
├ ƒ /admin/dashboard/divisions
├ ƒ /admin/dashboard/matches
├ ƒ /admin/dashboard/normativa
├ ƒ /admin/dashboard/participants
├ ƒ /admin/dashboard/seasons
├ ○ /admin/dashboard/settings
├ ƒ /admin/dashboard/splits
├ ƒ /archivo
├ ƒ /archivo/[season]/[split]
├ ƒ /hub
├ ƒ /hub/bracket
├ ƒ /hub/calendario
├ ƒ /hub/clasificacion
├ ƒ /hub/entrenador/[id]
├ ƒ /hub/entrenadores
└ ƒ /hub/olimpo
```

Today `/archivo/[season]/[split]` is `ƒ Dynamic` — REQ-21 will flip this to static
rows per `(season, split)`. Only `/admin` and `/admin/dashboard/settings` are static
today (verified via `.next/prerender-manifest.json`).

**Per-route client bundle baseline** (entryJSFiles size, raw bytes — for REQ-23
delta tracking). Turbopack groups every hub route's view code in a single shared
chunk `static/chunks/a8fa10c4d862f68d.js` (24.5 KB raw / ~25,120 bytes). All three
live client view components (`ClasificacionView`, `RosterView`, `CalendarView`) live
in that chunk together with shared pixel JSX. Baseline:

| route | entryJSFiles | total bytes | total KB |
| --- | --- | --- | --- |
| /hub | 6 | 412 902 | 403 |
| /hub/clasificacion | 6 | 412 902 | 403 |
| /hub/calendario | 6 | 412 902 | 403 |
| /hub/entrenadores | 6 | 412 902 | 403 |
| /hub/bracket | 6 | 412 902 | 403 |
| /hub/olimpo | 6 | 412 902 | 403 |
| /hub/entrenador/[id] | 6 | 412 902 | 403 |
| /archivo | 6 | 412 902 | 403 |
| /archivo/[season]/[split] | 6 | 412 902 | 403 |

(REQ-23 promise: the page-specific delta chunk `a8fa…` shrinks once `ClasificacionView`/`RosterView`/`CalendarView` cease to be `'use client'` and their pure-JSX bulk moves to RSC.)

**Orphan status verified (REQ-23.4):**

- `rg "PlayoffBracket|MatchupCard|DivisionSection|DivisionBracket" src/app` → only
  hits are `buildDivisionBracket` calls in `hub/bracket/page.tsx`, which is the
  *service function* (`lib/services/bracketService.ts`), NOT the component. Service
  stays.
- `rg ... src/components` → the cluster is internal: `cross/PlayoffBracket.tsx`,
  `cross/MatchupCard.tsx`, `shared/DivisionSection/DivisionSection.tsx`, plus the
  `shared/index.ts` barrel re-export. `BracketView.tsx` hits are the `DivisionBracketVM`
  view-model type (live). Deletion is safe.

**Framework verification (REQ-21 + REQ-22):**

- REQ-21 cookie-vs-SSG: confirmed by reading
  `next/dist/server/request/cookies.js` — in `prerender-legacy` (Next 16's default
  RSC prerender mode) calling `cookies()` invokes
  `throwToInterruptStaticGeneration`, which is exactly the dynamic bailout we need
  to avoid. Checked `unstable_noStore` (`next/dist/server/web/spec-extension/unstable-no-store.js`)
  — it *opts INTO* dynamic rendering, the opposite of what we want. Next 16's
  cleaner exits all require `'use cache'` + `cacheComponents` enabled, which F4
  owns. **Adopting design Option C: extend `createClient()` with an optional
  `{ session?: false }` flag that builds a cookie-free Supabase client.** No deviation.
- REQ-22 async-child-of-Suspense: confirmed natively supported by RSC since React 18.2.
  React 19.2.3 retains that contract; no `cacheComponents` is required for `async`
  function Server Components to be Suspense children. The design's note about
  verification is satisfied.

**`formatSeasonSplit` does not exist** (`rg formatSeasonSplit src/lib/utils` empty).
Safe to introduce.

Moving to REQ-24.

## 2026-05-28 — F5 / REQ-24 shared primitives landed

`./init.sh` full green (typecheck · lint 0 errors / 2 pre-existing F4 warnings ·
build 20 pages).

**Primitives created:**

- `src/components/shared/ui/EmptyState.tsx` — Server Component, replaces the
  duplicated `py-20 text-center` block.
- `src/components/shared/ui/BackgroundDecoration.tsx` — Server Component,
  `variant="starfield"` only (today). Centralizes the `<div className="starfield" />`
  decoration; CSS still in `src/app/styles/pixel.css`.
- `src/components/shared/ui/SectionSkeleton.tsx` — Server Component, 9 variants
  (phaseBanner/standings/bracket/rightColumn/newsRail/calendar/roster/olimpo/
  trainerProfile). REQ-22 will consume.
- `src/lib/utils/formatters.ts` — `formatSeasonSplit(season, split): string`.

**Call sites migrated:**

- EmptyState (6 sites): `src/app/hub/page.tsx`, `hub/clasificacion/page.tsx`,
  `hub/calendario/page.tsx`, `hub/entrenadores/page.tsx`, `hub/bracket/page.tsx`,
  `hub/olimpo/page.tsx`. `rg '"py-20 text-center"' src/app` returns empty.
- BackgroundDecoration (5 sites): `src/components/hub/HubRightColumn.tsx:118`,
  `BracketView.tsx:220`, `OlimpoView.tsx:44`, `landing/PixelLanding.tsx:58, 408`.
  `rg 'className=["\x27]starfield' src` returns only the comment inside
  `BackgroundDecoration.tsx`.
- formatSeasonSplit (6 sites, 1 extra vs spec): the 5 listed sites in tasks.md
  §1d (archivo page x2, SeasonSplitChip:28, PhaseBanner:34, OlimpoView:47) plus
  `landing/PixelLanding.tsx:64` (`vm.seasonName.toUpperCase() · vm.splitName.toUpperCase()`)
  which was not in the design's call-site list but was caught by the strict
  verification gate `rg 'toUpperCase\(\).*toUpperCase\(\)' src/components src/app`
  (the gate requires zero hits outside `formatters.ts`). Migrating it preserves
  the gate without expanding scope — the change is a one-line swap.
  Final `rg` returns only `src/lib/utils/formatters.ts`.

**Barrel:** `src/components/shared/index.ts` re-exports
`{ BackgroundDecoration, EmptyState, SectionSkeleton }`. Biome formatter reordered
the alphabetic block automatically.

Bundle sanity-check: no measurable client JS movement vs pre-REQ-24 baseline (these
were already Server components, so the migrations are markup-only — Turbopack
re-emits the same hashes). Moving to REQ-23.

## 2026-05-28 — F5 / REQ-23 client→server push landed

`./init.sh` full green (typecheck · lint 0 errors / 2 pre-existing F4 warnings ·
build 20 pages).

**Components split:**

- **2a. ClasificacionView** — `'use client'` removed. New tiny client shell
  `src/components/hub/clients/DivisionTabsShell.tsx` owns the
  `useState<'primera' | 'segunda'>` and renders two slot props
  (`primeraSlot`, `segundaSlot`). `StandingsTable` / `TableRow` / `Pip` move to
  pure Server JSX inside `ClasificacionView.tsx`.
- **2b. RosterView → RosterGrid** — `RosterView.tsx` deleted. New
  `src/components/hub/RosterGrid.tsx` is a pure Server component rendering a
  `RosterCardVM[]`. New tiny client shell
  `src/components/hub/clients/RosterFilterShell.tsx` owns the
  `useState<'all' | 1 | 2>` filter and accepts three named slots
  (`allSlot`, `d1Slot`, `d2Slot`). `src/app/hub/entrenadores/page.tsx` pre-renders
  the three filtered grids server-side and hands them as slots. Barrel updated:
  `src/components/hub/index.ts` re-exports `RosterGrid` instead of `RosterView`.
- **2c. CalendarView** — `'use client'` removed. New tiny client shell
  `src/components/hub/clients/RoundSelectorShell.tsx` owns the
  `useState<number>` selection and renders the 16-button timeline. The
  16 `<RoundDetail>` blocks are pre-rendered server-side inside `CalendarView.tsx`
  and handed to the shell as `roundSlots: { round: number; node: ReactNode }[]`.
  Visibility is toggled via the `hidden` attribute (kept-alive DOM) so the
  Suspense boundaries that REQ-22 will add never remount.
- **2d. Orphan cluster deleted.** `src/components/cross/PlayoffBracket.tsx`,
  `src/components/cross/MatchupCard.tsx`, `src/components/cross/` (empty),
  `src/components/shared/DivisionSection/DivisionSection.tsx`,
  `src/components/shared/DivisionSection/` (empty). `src/components/shared/index.ts`
  no longer re-exports `DivisionBracket` / `DivisionSection`. `Matchup` type in
  `src/lib/types/matches.ts` preserved (still consumed by
  `bracketService.ts` + `matchService.ts`). `rg "PlayoffBracket|MatchupCard" src`
  returns empty.

**Bundle deltas (Turbopack entryJSFiles totals, per route):**

| Route | Baseline KB | After REQ-23 KB | Δ |
| --- | --- | --- | --- |
| /hub | 403 | 292 | **-111** |
| /hub/clasificacion | 403 | 292 | **-111** |
| /hub/calendario | 403 | 292 | **-111** |
| /hub/entrenadores | 403 | 293 | **-110** |
| /hub/bracket | 403 | 292 | **-111** |
| /hub/olimpo | 403 | 292 | **-111** |
| /hub/entrenador/[id] | 403 | 292 | **-111** |
| /archivo | 403 | 292 | **-111** |
| /archivo/[season]/[split] | 403 | 292 | **-111** |

The page-specific delta chunk that held the three live client views dropped from
`static/chunks/a8fa10c4d862f68d.js` (24.5 KB, contained
`ClasificacionView` + `RosterView` + `CalendarView`) to two small chunks:
`static/chunks/722fa627a45fc26b.js` (2.8 KB, `DivisionTabsShell` +
`RoundSelectorShell`) for most hub routes and
`static/chunks/93cf56a691406af3.js` (4.4 KB, those two + `RosterFilterShell`)
for `/hub/entrenadores`. The remaining ~111 KB delta comes from the orphan
cluster deletion: `PlayoffBracket.tsx`/`MatchupCard.tsx` were registered as
client modules even though they were unreachable from any live route, so they
were shipped on every route's entryJS.

**REQ-23 promise (bundle decrease on clasificacion/entrenadores/calendario)
satisfied.** Moving to REQ-22.

## 2026-05-28 — F5 / REQ-22 granular Suspense per hub section landed

`./init.sh` full green (typecheck · lint 0 errors / 2 pre-existing F4 warnings ·
build 20 pages). No React "async child of Suspense" runtime errors during build —
the `async function ServerComponent` + `<Suspense>` pattern works natively in
React 19.2.3 + Next 16.1.1 without `cacheComponents`, as predicted.

**Section leaves created (under `src/components/hub/sections/`):**

- `PhaseHeaderSection.tsx` — pairs PhaseBanner + StoryBeat (cheap, share
  `currentRound` + `divisionPreview`).
- `StandingsLiveSection.tsx`
- `ProjectedBracketTeaserSection.tsx`
- `HubRightColumnSection.tsx`
- `NewsRailSection.tsx`
- `ClasificacionSection.tsx`
- `CalendarSection.tsx`
- `RosterSection.tsx` — pre-renders 3 filtered grids server-side, hands them as
  named slots to `<RosterFilterShell>`.
- `BracketSection.tsx`
- `OlimpoSection.tsx`
- `TrainerProfileSection.tsx`

**Pages rewired (all `src/app/hub/*/page.tsx`):**

Each page now top-level awaits only the cheap
`getActiveSeasonWithSplit()` (+ `getCurrentRound()` when the eyebrow needs it),
then renders one or more `<Suspense fallback={<SectionSkeleton variant=… />}>`
boundaries wrapping the heavy async section leaves. The `/hub` master page has
**5 independent Suspense boundaries** (PhaseHeader, StandingsLive,
ProjectedBracketTeaser, HubRightColumn, NewsRail) so a slow query on one panel
no longer blocks the others from streaming in. `react.cache()` on the query
layer dedupes overlapping reads (e.g. `getDivisionPreview` is called by 4 of the
5 hub leaves but hits the DB once per request).

`rg "<Suspense" src/app/hub` returns 11 hits (matches design's leaf count). No
`export const dynamic = 'force-dynamic'` was introduced anywhere (`rg`-confirmed).

**Per-route entry-bundle delta vs REQ-23 stop:** no change (all sections are
Server Components; the only client modules touched were the tiny shells already
landed in REQ-23, plus `<Suspense>` which is a React core import already in
every entry chunk). Bundle stays at ~292 KB across hub routes.

Moving to REQ-21 (SSG archive).

## 2026-05-28 — F5 / REQ-21 SSG archive landed

`./init.sh` full green (typecheck · lint 0 errors / 2 pre-existing F4 warnings ·
build 23 pages — was 20 baseline, +3 prerendered archive URLs).

### Live decision: Option C (kept) plus one Option B fallback inside it

The design's default was Option C (`createClient({ session: false })`) and that's
what landed in `src/lib/supabase/server.ts`. The flag is **only consumed by
archive-specific queries** — every hub/admin call site stays cookie-aware.
Framework verification (recorded in pre-flight) confirmed there is no cleaner
Next 16 escape from `cookies()`→dynamic: `unstable_noStore` does the opposite
(opts INTO dynamic), and `'use cache'` requires `cacheComponents` which is
F4's territory.

**Why Option B fallback piggybacked.** Initial attempt: flip every public-read
query (`leagues`, `tournament`, `bracket`, `trainers`, `seasons`) to
`{ session: false }`. That made the archive page SSG **but also flipped the
hub routes to `○` Static** — the spec is clear that `/hub/*` must remain
request-time live (F4 owns its caching, not F5). Reverted, then created
cookie-free siblings narrowly scoped to the archive page + archive layout in
`src/lib/queries/archive.queries.ts`:

- `getArchiveDivisionPreview(splitId)` — like `getDivisionPreview` but skips the
  tiebreaker pass (past splits are frozen — the `league_rankings` view's stored
  `position` is authoritative). Cookie-free.
- `getPublicActiveSeasonWithSplit()` — cookie-free sibling of
  `getActiveSeasonWithSplit`. Consumed by the new archive layout.
- `getPublicAllSeasonsWithSplits()` — cookie-free sibling. Feeds the
  Season/Split chip on the archive layout.
- `getPublicCurrentRound(splitId)` — cookie-free sibling of `getCurrentRound`.

These are exported from `@/lib/queries`. No existing public callers touched.

### Files changed

- `src/lib/supabase/server.ts` — `createClient()` now accepts
  `{ session?: false }`. Default (no flag) unchanged — same cookie-aware
  behavior as before; the cookie-free branch supplies empty `getAll`/no-op
  `setAll` so `@supabase/ssr` never sees a `cookies()` call from React.
- `src/lib/queries/seasons.queries.ts` — added `getArchiveSplitParams()`
  (cookie-free, lowercase URL-shape pairs for every (season, split)) and
  switched `getSplitByNames` to cookie-free (only consumer is the archive page).
- `src/lib/queries/archive.queries.ts` — added the 4 cookie-free helpers above;
  `getArchiveChampions` switched to cookie-free.
- `src/lib/queries/index.ts` — exports the new archive queries.
- `src/app/archivo/[season]/[split]/page.tsx` — exports
  `generateStaticParams()` + `export const dynamicParams = true`. The page's
  `getDivisionPreview` call swapped to `getArchiveDivisionPreview`.
- `src/components/shared/layout/hub/PixelShell.tsx` — refactored from "fetches
  its own data" to "pure renderer receives data via props". Each layout owns
  its data fetch with its preferred client. **No visual change.**
- `src/app/hub/layout.tsx` — now fetches the shell payload cookie-aware, feeds
  `PixelShell` props.
- `src/app/archivo/layout.tsx` — now fetches the shell payload cookie-FREE
  (`getPublicActiveSeasonWithSplit` etc.), feeds `PixelShell` props. This is
  what unblocks the archive SSG.

### Route table delta (post-REQ-21)

```
…
├ ƒ /archivo
├ ● /archivo/[season]/[split]
│ ├ /archivo/season1/s3
│ ├ /archivo/season1/s1
│ └ /archivo/season1/s2
├ ƒ /hub
├ ƒ /hub/bracket
├ ƒ /hub/calendario
├ ƒ /hub/clasificacion
├ ƒ /hub/entrenador/[id]
├ ƒ /hub/entrenadores
└ ƒ /hub/olimpo
…
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

`/archivo/[season]/[split]` is now `●` SSG with the 3 `(season, split)` pairs
that currently exist in the DB (`season1/s1`, `season1/s2`, `season1/s3`). The
prerender manifest confirms them under `routes` and the wildcard parent under
`dynamicRoutes` (so unknown URLs still render at request time per
`dynamicParams = true`). `/hub/*` stays `ƒ` as required.

Moving to REQ-25 audit.

## 2026-05-28 — F5 / REQ-25 image + animation audit landed (verify-only)

`./init.sh` quick green. Live-tree audit per spec:

- `rg 'fill[^=]*=' src/app/hub src/app/archivo src/components/hub src/components/landing src/components/shared/layout/hub -g '*.tsx'` → **zero hits**. The
  spec's worry about `fill` Images without `sizes=` does not apply to the live
  tree.
- `rg 'Number.POSITIVE_INFINITY' src/app/hub src/app/archivo src/components/hub src/components/landing src/components/shared/layout/hub` → **zero hits**. No
  infinite-loop `motion` animations in the live tree.
- `src/components/shared/layout/hub/TopBar.tsx:46-54` `<Image>` still has
  explicit `width={40} height={40}`. Added a comment for future contributors
  documenting the REQ-25 invariant (must add `sizes=` if they ever switch to
  `fill`).

**Dead-cluster reminder** (future-sweep debt, NOT in F5 scope per spec author):
- `src/components/home/Hero.tsx` — `Number.POSITIVE_INFINITY` motion loops at
  lines 72 + 93. Unreachable (the `/` route renders `PixelLanding`, not Hero).
- `src/components/home/CurrentSeason.tsx` — pre-FR11 hero card.
- `src/components/shared/layout/Navbar.tsx` — pre-FR11 nav.
- `src/components/shared/ui/Button/LinkButton.tsx` — only consumer was the old
  Hero CTA.

These four files are still imported nowhere from `src/app/` (verified by REQ-23
prefligth + still true). A future micro-batch should delete them; the F2 sweep
left them alone and F5 honors that decision.

Moving to final closeout.

## 2026-05-28 — F5 implemented (implementer → reviewer)

`./init.sh` (full, not `--quick`) green. Lint 0 errors / 2 warnings (the
pre-existing F4-owned `noUnusedImports` on `fetchData.ts:5` + `matchService.ts:5`
— **unchanged** per spec). Build succeeds; 23 generated pages (was 20 baseline,
+3 prerendered archive URLs).

### Final route table

```
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /[season]
├ ƒ /[season]/[split]
├ ƒ /[season]/[split]/cruces
├ ƒ /[season]/[split]/final
├ ○ /admin
├ ƒ /admin/dashboard
├ ƒ /admin/dashboard/divisions
├ ƒ /admin/dashboard/matches
├ ƒ /admin/dashboard/normativa
├ ƒ /admin/dashboard/participants
├ ƒ /admin/dashboard/seasons
├ ○ /admin/dashboard/settings
├ ƒ /admin/dashboard/splits
├ ƒ /archivo
├ ● /archivo/[season]/[split]
│ ├ /archivo/season1/s3
│ ├ /archivo/season1/s1
│ └ /archivo/season1/s2
├ ƒ /hub
├ ƒ /hub/bracket
├ ƒ /hub/calendario
├ ƒ /hub/clasificacion
├ ƒ /hub/entrenador/[id]
├ ƒ /hub/entrenadores
└ ƒ /hub/olimpo
```

### Bundle deltas (Turbopack entryJSFiles, raw bytes)

| Route | Baseline KB | Final KB | Δ KB |
| --- | --- | --- | --- |
| /hub | 403 | 289 | **−114** |
| /hub/clasificacion | 403 | 292 | **−111** |
| /hub/calendario | 403 | 292 | **−111** |
| /hub/entrenadores | 403 | 293 | **−110** |
| /hub/bracket | 403 | 292 | **−111** |
| /hub/olimpo | 403 | 292 | **−111** |
| /hub/entrenador/[id] | 403 | 289 | **−114** |
| /archivo | 403 | 292 | **−111** |
| /archivo/[season]/[split] | 403 | 292 | **−111** |

REQ-23's bundle-decrease promise is delivered on every route — including the
three explicitly targeted ones (`/hub/clasificacion`, `/hub/entrenadores`,
`/hub/calendario`). The hub root + trainer profile shave a tiny bit more because
their tree doesn't carry the tab/filter/round client shells.

### Per-REQ summary

- **REQ-24 (primitives):** 4 new shared modules
  (`EmptyState`, `BackgroundDecoration`, `SectionSkeleton`, `formatSeasonSplit`),
  16 call sites migrated. All verification greps return only the canonical
  definition site.
- **REQ-23 (client→server push):** 3 live client components split — pure-JSX
  bulk moved to RSC, state isolated in 3 small client shells in
  `src/components/hub/clients/`. Orphan cluster (`PlayoffBracket`,
  `MatchupCard`, `DivisionSection`) deleted. Bundle drops ~110 KB per route.
- **REQ-22 (granular Suspense):** 11 `<Suspense>` boundaries across 7 hub
  routes. Each panel streams independently with a `<SectionSkeleton variant=…/>`
  fallback. Verified: no async-of-Suspense or "client cannot be async" runtime
  errors during build; React 19.2.3 + Next 16.1.1 support this natively without
  `cacheComponents`.
- **REQ-21 (SSG archive):** `/archivo/[season]/[split]` now `●` SSG with 3
  prerendered URLs. Option C (`createClient({ session: false })`) adopted as
  designed — no cleaner Next 16 escape exists. Option B fallback piggybacked
  inside Option C (cookie-free siblings of the layout queries land in
  `archive.queries.ts`) so the hub layout stays cookie-aware and `/hub/*`
  remains `ƒ` Dynamic as the spec requires. `PixelShell` refactored to a pure
  renderer; each layout owns its data fetch.
- **REQ-25 (audit):** verified clean — zero `fill=` Images in the live tree,
  zero `Number.POSITIVE_INFINITY` motion loops, `TopBar.tsx` Image still has
  explicit dims (REQ-25 invariant codified via inline comment).

### Files net delta

**Created:**
- `src/components/shared/ui/EmptyState.tsx`
- `src/components/shared/ui/BackgroundDecoration.tsx`
- `src/components/shared/ui/SectionSkeleton.tsx`
- `src/lib/utils/formatters.ts`
- `src/components/hub/RosterGrid.tsx`
- `src/components/hub/clients/DivisionTabsShell.tsx`
- `src/components/hub/clients/RosterFilterShell.tsx`
- `src/components/hub/clients/RoundSelectorShell.tsx`
- `src/components/hub/sections/PhaseHeaderSection.tsx`
- `src/components/hub/sections/StandingsLiveSection.tsx`
- `src/components/hub/sections/ProjectedBracketTeaserSection.tsx`
- `src/components/hub/sections/HubRightColumnSection.tsx`
- `src/components/hub/sections/NewsRailSection.tsx`
- `src/components/hub/sections/ClasificacionSection.tsx`
- `src/components/hub/sections/CalendarSection.tsx`
- `src/components/hub/sections/RosterSection.tsx`
- `src/components/hub/sections/BracketSection.tsx`
- `src/components/hub/sections/OlimpoSection.tsx`
- `src/components/hub/sections/TrainerProfileSection.tsx`

**Edited:**
- `src/components/shared/index.ts` (barrel: + new primitives, − orphan re-exports)
- `src/components/hub/index.ts` (RosterView → RosterGrid)
- `src/components/hub/ClasificacionView.tsx` (Server, slot-fed)
- `src/components/hub/CalendarView.tsx` (Server, pre-renders 16 round slots)
- `src/components/hub/HubRightColumn.tsx` (`<BackgroundDecoration>`)
- `src/components/hub/BracketView.tsx` (`<BackgroundDecoration>`)
- `src/components/hub/OlimpoView.tsx` (`<BackgroundDecoration>` + `formatSeasonSplit`)
- `src/components/hub/PhaseBanner.tsx` (`formatSeasonSplit`)
- `src/components/landing/PixelLanding.tsx` (`<BackgroundDecoration>` x2 + `formatSeasonSplit`)
- `src/components/shared/layout/hub/SeasonSplitChip.tsx` (`formatSeasonSplit`)
- `src/components/shared/layout/hub/PixelShell.tsx` (pure renderer, props-driven)
- `src/components/shared/layout/hub/TopBar.tsx` (REQ-25 comment)
- `src/app/hub/page.tsx`, `clasificacion/page.tsx`, `calendario/page.tsx`,
  `entrenadores/page.tsx`, `bracket/page.tsx`, `olimpo/page.tsx`,
  `entrenador/[id]/page.tsx` (all 7: EmptyState, top-level cheap await,
  Suspense-wrapped section leaves)
- `src/app/hub/layout.tsx` (cookie-aware data fetch, feeds `PixelShell`)
- `src/app/archivo/layout.tsx` (cookie-free data fetch, feeds `PixelShell`)
- `src/app/archivo/[season]/[split]/page.tsx` (`generateStaticParams`,
  `dynamicParams = true`, `getArchiveDivisionPreview`, `formatSeasonSplit`)
- `src/lib/supabase/server.ts` (`{ session?: false }` overload — Option C)
- `src/lib/queries/seasons.queries.ts` (+ `getArchiveSplitParams`,
  `getSplitByNames` cookie-free)
- `src/lib/queries/archive.queries.ts` (+ `getArchiveDivisionPreview`,
  `getPublicActiveSeasonWithSplit`, `getPublicAllSeasonsWithSplits`,
  `getPublicCurrentRound`; `getArchiveChampions` cookie-free)
- `src/lib/queries/index.ts` (exports for the new queries)

**Deleted:**
- `src/components/cross/PlayoffBracket.tsx`
- `src/components/cross/MatchupCard.tsx`
- `src/components/cross/` (empty)
- `src/components/shared/DivisionSection/DivisionSection.tsx`
- `src/components/shared/DivisionSection/` (empty)
- `src/components/hub/RosterView.tsx` (became `RosterGrid.tsx`)

### Deviations from design

- **None on REQ-21 escape mechanism** — Option C adopted as designed. The
  Option B fallback inside it (cookie-free public layout queries in
  `archive.queries.ts`) was design-documented as the safety valve and is what
  kept `/hub/*` from accidentally becoming static.
- **REQ-24 formatter call sites:** the design listed 5 sites; the strict
  verification gate `rg 'toUpperCase\(\).*toUpperCase\(\)' src/components src/app`
  forced a 6th migration at `landing/PixelLanding.tsx:64`. Trivial one-line swap.
- **REQ-23 `RosterView` rename:** kept design's `RosterGrid` rename. Barrel
  updated.

### F4-owned warnings (unchanged, per spec)

`src/lib/data/fetchData.ts:5` and `src/lib/services/matchService.ts:5`
`noUnusedImports` warnings still present, untouched.

**Handed to reviewer.** `features.json` F5 left at `spec_ready` per spec — leader
flips to `done` after reviewer sign-off.
