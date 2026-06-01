# Requirements — F6b (Server Actions Migration of 5 Admin Managers)

Source: `features.json` F6 sub-batch F6b per leader audit `progress/history.md`
2026-06-01. F6a closed (REQ-45..REQ-59, reviewer APPROVED 2026-06-01). F6c
(MatchesManager dual-cascade + AdminShellSkeleton + custom `cacheLife`) is
explicitly OUT OF SCOPE.

## Numbering

Last requirement used by F6a was **REQ-59**. F6b starts at **REQ-60** and ends
at **REQ-78** (19 requirements).

## Binding constraints (from CLAUDE.md + docs/conventions.md)

1. **Spanish for UI copy; English for code identifiers.** Server Action error
   messages bubble up to existing `AdminErrorBanner` (Spanish) — actions return
   raw Supabase / Zod messages unchanged so the existing UI logging path holds.
2. **Pilot fidelity.** Every action mirrors the F3 pilot shape in
   `src/app/admin/dashboard/seasons/_actions.ts:1-127`:
   - `'use server'` directive at top.
   - Discriminated-union return: `{ ok: true } | { ok: false; error: string }`
     (extend with `{ ok: true; id: string }` only where the consumer needs the
     server-assigned id for optimistic reconciliation — see REQ-65, REQ-71).
   - Zod parse at the action boundary using existing schemas in
     `src/lib/types/schemas.ts`.
   - Cookie-aware Supabase client via `await createClient()` from
     `@/lib/supabase/server`.
   - On success: `revalidatePath(<dashboard route>)` THEN one `updateTag(...)`
     call per affected tag family. On failure: log `[actionName] Error:` and
     return `{ ok: false, error }` — never throw.
3. **`'use client'` stays on the Manager components.** Consumers import the
   actions and call them inside `startTransition(...)` per the pilot
   (`SeasonsManager.tsx:93-103`). No new client/server boundary moves.
4. **Preserve `AdminConfirmModal` bindings from F6a.** ParticipantsManager and
   MatchesManager use `requestX / confirmX` callbacks (see
   `ParticipantsManager.tsx:235-325` and `MatchesManager.tsx:377-519`). The
   confirm callback's body is what changes (inline Supabase write → action
   call), not the wiring.
5. **`./init.sh` green between waves.** Each Manager migrates in its own wave.
   Run `./init.sh` after each wave; the build must never break mid-batch.
6. **Tag taxonomy fidelity (`docs/conventions.md:82-119`).** Every action MUST
   `updateTag(...)` the exact tag(s) listed for the reader queries that surface
   the mutated rows. Missing a tag = stale cache in `/hub/*` or `/archivo/*`.
7. **NO dual-cascade work in MatchesManager.** REQ-26 (auto-generate J16 on
   J15 completion, auto-update bracket on J15/16 results) is F6c. F6b ports
   the EIGHT existing writes 1:1 and stops.

## REQ-60 — Action file scaffolding (Wave 1 prerequisite, applies all waves)

**While** the Implementer is migrating Manager `M` to Server Actions, the
system **shall** create exactly one new file at
`src/app/admin/dashboard/<domain>/_actions.ts` per Manager (4 new files —
seasons already has one) using the pilot's structure:

```ts
'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
// import the relevant Input schema(s) from '@/lib/types/schemas'

type ActionResult = { ok: true } | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/<domain>';
const IdSchema = z.string().uuid('ID inválido');

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}
```

**Verification gate:** `./init.sh` is green after each wave; `pnpm lint` reports
no `noExplicitAny` violations in the new files; `rg "createClient\\(\\)" src/app/admin/dashboard/<domain>/_components` returns zero matches once the wave is complete.

## REQ-61..REQ-62 — DivisionsManager (Wave 1, 2 writes)

`src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx:80-92` and
`:104-117` are the two `supabase.from('leagues')` writes.

- **REQ-61.** **When** the admin submits the "Nueva División" form, the
  system **shall** call `createLeagueAction(splitId, input)` where `input` is
  parsed by `LeagueCreateInputSchema` (`schemas.ts:162-171`). On success the
  action **shall** `revalidatePath('/admin/dashboard/divisions')`,
  `updateTag('seasons')`, and `updateTag(`splits:${splitId}`)`.

  *Rationale (tag set):* `getLeaguesBySplit(splitId)` is tagged
  `['seasons', `splits:${splitId}`]` (`conventions.md:111`); `getLeagueByTier`
  is tagged the same (`:114`). Both surface league rows.

- **REQ-62.** **When** the admin confirms deletion of a league, the system
  **shall** call `deleteLeagueAction(id, splitId)` and on success **shall**
  `revalidatePath(...)`, `updateTag('seasons')`, `updateTag(`splits:${splitId}`)`,
  and `updateTag(`participants:${splitId}`)`.

  *Rationale:* deleting a league cascades to `league_participants` via FK in
  Supabase, and `getParticipantsBySplit` is tagged `participants:${splitId}`
  (`conventions.md:115`). Also `updateTag('archive')` if the split belongs to
  a closed season — out of scope for F6b (no closed-season UI yet); document
  as TODO inline.

**Verification gate:** Manually create + delete a division; confirm the splits
selector still shows seasons (tag-invalidation of `seasons`), the public hub's
division grid reflects the change within one navigation (no `cacheLife` wait),
and `./init.sh` is green.

## REQ-63..REQ-66 — SplitsManager (Wave 2, 4 actions / 2 logical writes + 2 lifecycle)

`src/app/admin/dashboard/splits/_components/SplitsManager.tsx`:
- `:72-86` insert (create)
- `:97-109` delete
- `:112-138` activate (2 SQL writes: deactivate others in season + activate target)
- `:140-152` deactivate

- **REQ-63 (create).** **When** the admin submits the "Nuevo Split" form, the
  system **shall** call `createSplitAction(seasonId, input)` parsed by
  `SplitCreateInputSchema`. Tags: `updateTag('seasons')`,
  `updateTag('archive')`.

- **REQ-64 (delete).** **When** the admin confirms deletion of a split, the
  system **shall** call `deleteSplitAction(id, seasonId)`. Tags:
  `updateTag('seasons')`, `updateTag(`splits:${id}`)`, `updateTag('archive')`,
  `updateTag(`matches:${id}`)`, `updateTag(`bracket:${id}`)`,
  `updateTag(`participants:${id}`)`.

  *Rationale:* a split delete cascades to leagues → participants → matches via
  FK. All per-split tags read for that split become stale. The reviewer should
  verify FK behavior in Supabase before sign-off.

- **REQ-65 (activate).** **When** the admin activates a split, the system
  **shall** call `activateSplitAction(id, seasonId)` which performs the
  existing two-step (deactivate-all-in-season then activate-target). Tags:
  `updateTag('seasons')`, `updateTag('archive')`. Atomicity (a single RPC) is
  explicitly deferred per the pilot's REQ-3 note
  (`seasons/_actions.ts:74-76`) — document the same NOTE comment.

- **REQ-66 (deactivate).** **When** the admin deactivates a split, the system
  **shall** call `deactivateSplitAction(id)`. Tags: `updateTag('seasons')`,
  `updateTag('archive')`.

**Verification gate:** Manually create / activate / deactivate / delete a
split; confirm `getPublicActiveSeasonWithSplit` (tagged
`['seasons', 'archive']` per `conventions.md:101`) returns the fresh state on
next navigation. `./init.sh` green.

## REQ-67..REQ-68 — RegulationsManager (Wave 3, 1 storage write)

`src/app/admin/dashboard/normativa/_components/RegulationsManager.tsx:62-83`
performs a Supabase Storage upload + public URL fetch. There is currently NO
DB row mutation (the public `/normativa` route just probes the storage URL via
HEAD — see `src/app/admin/dashboard/normativa/page.tsx:7-20`).

- **REQ-67 (upload).** **When** the admin submits a PDF file, the system
  **shall** call `uploadRegulationsAction(formData: FormData)` which:
  1. Reads the `File` from `formData.get('file')`.
  2. Validates against `RegulationsUploadSchema` (`schemas.ts:216-223`).
  3. Calls `supabase.storage.from('normativas').upload(...)` server-side via
     the cookie-aware server client (RLS sees the admin's session, the same
     identity that already authorizes the browser-side upload today).
  4. On success: `revalidatePath('/admin/dashboard/normativa')` and
     `revalidatePath('/normativa')` (no `updateTag` — no `'use cache'` reader
     touches storage; the public route uses a runtime HEAD fetch).
  5. Returns `{ ok: true; url: string } | { ok: false; error: string }` so
     the Manager can update `currentUrl` without a router roundtrip.

  *Design decision (storage in action, not split client+server) — see
  `design.md` §RegulationsManager for the trade-off justification.*

- **REQ-68 (form transport).** **While** the admin form is a multipart upload
  (binary File), the Manager **shall** construct a `FormData` instance and
  pass it to the action. The action signature **shall** be
  `(formData: FormData) => Promise<{ ok: true; url: string } | { ok: false; error: string }>`
  so Next 16 Server Action streaming handles the binary correctly.

**Verification gate:** Manually upload a small PDF; confirm
`https://<supabase>/storage/v1/object/public/normativas/public/normativa_pokemon_calmind_series.pdf`
returns 200 with the new contents within one navigation, the
`/admin/dashboard/normativa` page reflects the new URL, and the manager no
longer imports `@/lib/supabase/client`. `./init.sh` green.

## REQ-69..REQ-73 — ParticipantsManager (Wave 4, 5 writes)

`src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx`:
- `:179-223` save trainer (insert OR update via `editingTrainer` branch — 2 writes in one handler)
- `:239-248` delete trainer
- `:266-290` assign trainer to league (insert `league_participants`)
- `:296-311` remove participant from league (delete `league_participants`)
- `:355-375` save pending lives changes (N updates batched via `Promise.all`)

- **REQ-69 (create trainer).** **When** the admin submits the trainer form
  with no `editingTrainer`, the system **shall** call
  `createTrainerAction(input)` parsed by `TrainerInputSchema`
  (`schemas.ts:176-184`). Tags: `updateTag('trainers')`.

- **REQ-70 (update trainer).** **When** the admin submits with `editingTrainer`
  set, the system **shall** call `updateTrainerAction(id, input)`. Tags:
  `updateTag('trainers')` and, because trainer nickname/avatar are joined into
  `participants:` and `rankings:` reader rows, also
  `updateTag('seasons')` (broad bust — see design.md §ParticipantsManager
  rationale for why we accept the conservative invalidation here rather than
  enumerate every `splits:*` / `rankings:*` the trainer participates in).

- **REQ-71 (delete trainer).** **When** the admin confirms a trainer deletion,
  the system **shall** call `deleteTrainerAction(id)`. Tags:
  `updateTag('trainers')`, `updateTag('seasons')` (same broad-bust rationale).

- **REQ-72 (assign / remove participant).** **When** the admin assigns a
  trainer to a league (or removes one), the system **shall** call
  `assignParticipantAction({ leagueId, trainerId, initialSeed, lives })` or
  `removeParticipantAction(participantId, splitId)`. Tags:
  `updateTag(`participants:${splitId}`)`, plus
  `updateTag(`rankings:${leagueId}`)` because `league_rankings` derives from
  participant membership.

  *Note (splitId source):* the Manager has `selectedSplitId` from
  `useLeagueSelector`; pass it as the second argument so the action does NOT
  need a join to resolve it.

- **REQ-73 (lives changes).** **When** the admin saves pending lives changes,
  the system **shall** call `updateParticipantLivesAction(changes: Array<{ id: string; lives: number }>, splitId: string, leagueId: string)` which performs
  the same `Promise.all` batch server-side. Return shape:
  `{ ok: true } | { ok: false; error: string; failedCount: number }` to
  preserve the existing "Error al guardar N cambio(s)" UX
  (`ParticipantsManager.tsx:368-369`). Tags:
  `updateTag(`participants:${splitId}`)`,
  `updateTag(`rankings:${leagueId}`)`.

**Verification gate:** Create, edit, delete a trainer; assign + remove from a
league; bulk-update lives. Confirm the admin tabs show fresh data after each
mutation and `./init.sh` is green.

## REQ-74..REQ-78 — MatchesManager (Wave 5, 8 writes)

`src/app/admin/dashboard/matches/_components/MatchesManager.tsx`:
- `:345-375` save result (`matches.update` with `played: true`)
- `:381-399` clear result (`matches.update` setting nulls + `played: false`)
- `:437-488` save match — insert OR update branched on `editingMatch`
- `:494-505` delete match
- `:535-611` J15 generator (1 bulk insert of 4 rows after rankings read)
- `:614-739` J16 generator (1 bulk insert of 4 rows after J15 read)

- **REQ-74 (save result).** **When** the admin saves a result, the system
  **shall** call `saveMatchResultAction(matchId, input, { splitId, leagueId })`
  parsed by `MatchResultInputSchema` (`schemas.ts:203-214`). Tags:
  `updateTag(`matches:${splitId}`)`,
  `updateTag(`rankings:${leagueId}`)`,
  `updateTag(`bracket:${splitId}`)` (round 15/16 results flow into the bracket;
  for rounds 1–14 the bracket tag bust is a no-op but cheap — keep it for
  simplicity).

- **REQ-75 (clear result).** **When** the admin confirms clearing a result,
  the system **shall** call `clearMatchResultAction(matchId, { splitId, leagueId })`.
  Same tag set as REQ-74.

- **REQ-76 (create / update match).** **When** the admin saves the match form,
  the system **shall** call `createMatchAction({ leagueId, splitId, ...input })`
  or `updateMatchAction(id, input, { splitId, leagueId })` parsed by
  `MatchPlanningInputSchema` (`schemas.ts:186-201`). Tags:
  `updateTag(`matches:${splitId}`)`,
  `updateTag(`bracket:${splitId}`)` (planning a J15/J16 match changes the
  bracket; cheap no-op for J1..J14).

- **REQ-77 (delete match).** **When** the admin confirms deletion, the system
  **shall** call `deleteMatchAction(matchId, { splitId, leagueId })`. Tags:
  `updateTag(`matches:${splitId}`)`,
  `updateTag(`rankings:${leagueId}`)`,
  `updateTag(`bracket:${splitId}`)` (a played match's deletion changes
  rankings; cheap to always bust).

- **REQ-78 (J15 / J16 generators).** **When** the admin clicks "Generar Cruces
  J15" or "Generar Finales J16", the system **shall** call
  `generateJ15MatchesAction(leagueId, splitId)` or
  `generateJ16MatchesAction(leagueId, splitId)`. The action
  **shall** encapsulate the existing rankings/J15 reads + bulk insert and
  return `{ ok: true; createdCount: number } | { ok: false; error: string }`.
  Tags: `updateTag(`matches:${splitId}`)`,
  `updateTag(`bracket:${splitId}`)`.

  *Out of scope (F6c):* auto-generating J16 on J15 completion and auto-
  updating the bracket on result changes — those are REQ-26 / dual-cascade.
  F6b ports the EXISTING manual-button behavior 1:1.

**Verification gate:** Save a result, clear it, plan a match, delete it,
generate J15 and J16 for a Primera and Segunda league each. Confirm the public
`/[season]/[split]/cruces` and `/[season]/[split]` views reflect the changes
within one navigation. `./init.sh` green.

## REQ-79 — Documentation refresh (final wave)

**When** the F6b implementation is complete, the system **shall** update:

1. `docs/conventions.md:50` — the stale `home/` reference flagged as
   non-blocking by the F6a reviewer (verify the actual current grouping under
   `src/components/` and replace).
2. `docs/conventions.md:84-93` ("Mutated by (today)" column) — replace "F6
   deferred" entries with the actual `<Manager>/_actions.ts` reference for
   each tag family.
3. `docs/conventions.md:144-156` (the `REQ-39 staleness window` note) —
   remove the "20 `router.refresh()` call sites" wording; replace with a note
   stating F6b closed the gap and all admin Managers now use Server Actions
   + `updateTag`.

**Verification gate:** `rg "router.refresh\\(\\)" src/app/admin/dashboard`
returns zero matches (or only the matches retained for navigation-side
effects with an explanatory comment). `rg "createClient\\(\\)" src/app/admin/dashboard/{divisions,splits,normativa,participants,matches}/_components`
returns zero. `./init.sh` green.

## Out of scope (push to F6c per user 2026-05-31)

- MatchesManager dual-cascade (REQ-26): auto-generate J16 on J15 completion,
  auto-update bracket on J15/J16 result changes. F6b ports the EIGHT current
  writes only.
- AdminShellSkeleton extraction.
- Custom `cacheLife` profile in `next.config.ts`.
- Atomic activate-split RPC (mirrors the deferred REQ-3 for seasons).

## Dependency / sequencing

REQ-60 (scaffolding) applies once per wave. Waves run lowest-risk → highest:

1. **Wave 1 — DivisionsManager** (REQ-61, REQ-62): 2 writes, smallest blast
   radius (one tag family + the broad `seasons`).
2. **Wave 2 — SplitsManager** (REQ-63..REQ-66): 4 actions, but each is a
   single-table write or the well-understood 2-step activate.
3. **Wave 3 — RegulationsManager** (REQ-67, REQ-68): isolated (storage only,
   no tag taxonomy interaction); the FormData binary transport is the only
   novel piece — keeps it before the high-volume Managers.
4. **Wave 4 — ParticipantsManager** (REQ-69..REQ-73): 5 writes plus the
   bulk-lives batch. Preserves F6a `AdminConfirmModal` wiring.
5. **Wave 5 — MatchesManager** (REQ-74..REQ-78): 8 writes including the two
   bulk generators. Highest blast radius (3 tag families per action).
6. **Wave 6 — Docs** (REQ-79): no code, no risk; runs last so the description
   matches the shipped reality.

Each wave ends with `./init.sh` green and a manual smoke test of the changed
Manager.
