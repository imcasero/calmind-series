# Tasks — Batch F6b (Server Actions Migration of 5 Admin Managers)

Atomic checklist for the Implementer. Sections map 1:1 to REQs in
`requirements.md`. Run `./init.sh` at the END of each Wave (not between every
micro-step inside a Wave) so dependent files land together. Final `./init.sh`
**must be green** before handing back to the leader.

Order: lowest blast-radius Manager → highest. Each wave is independently
shippable.

---

## Wave 1 — DivisionsManager (REQ-61, REQ-62)

Goal: zero browser writes in `divisions/_components/`. Smallest blast radius
(2 writes, narrow tag set).

### W1.1 — Create `src/app/admin/dashboard/divisions/_actions.ts`

- [ ] Scaffold per D1 preamble (pilot `seasons/_actions.ts:1-18`).
- [ ] Implement `createLeagueAction(splitId: string, input: LeagueCreateInput)` —
      Zod-validate both args, insert `{ split_id: splitId, ...parsed.data }`,
      on success `revalidatePath('/admin/dashboard/divisions')`,
      `updateTag('seasons')`, `updateTag(`splits:${splitId}`)`. Return
      `{ ok: true; id: string }` (use the inserted row's id from
      `supabase.from('leagues').insert(...).select('id').single()`).
- [ ] Implement `deleteLeagueAction(id: string, splitId: string)` —
      Zod-validate both ids, delete, tags
      `seasons`, `splits:${splitId}`, `participants:${splitId}`.

### W1.2 — Migrate `DivisionsManager.tsx`

- [ ] Remove `createClient` import from `@/lib/supabase/client`; remove the
      `const supabase = createClient();` line.
- [ ] Remove `useRouter` + `router.refresh()` calls.
- [ ] Add `useOptimistic` over the `leagues` array (see D4); seed from the
      hook's `leagues` on every `selectedSplitId` change.
- [ ] Replace `handleCreate` body's `supabase.from('leagues').insert(...)`
      with `createLeagueAction(selectedSplitId, parsed.data)` inside
      `startTransition`; apply optimistic `{ type: 'create', league: tempLeague }`
      first; keep `refresh()` for hook reconciliation.
- [ ] Replace `confirmDeleteAction` body with
      `deleteLeagueAction(id, selectedSplitId!)` inside `startTransition`;
      apply optimistic `{ type: 'delete', id }`; keep `refresh()`.

### W1.3 — Wave 1 gate

- [ ] `./init.sh` green.
- [ ] Manual smoke: create + delete a division; confirm public hub reflects
      it within one navigation.
- [ ] `rg "from '@/lib/supabase/client'" src/app/admin/dashboard/divisions`
      returns zero matches.

---

## Wave 2 — SplitsManager (REQ-63..REQ-66)

Goal: 4 actions matching the pilot's create / delete / activate / deactivate
pattern.

### W2.1 — Create `src/app/admin/dashboard/splits/_actions.ts`

- [ ] Scaffold per D1.
- [ ] `createSplitAction(seasonId, input: SplitCreateInput)` — tags
      `seasons`, `archive`. Return `{ ok: true; id: string }`.
- [ ] `deleteSplitAction(id, seasonId)` — tags
      `seasons`, `splits:${id}`, `archive`, `matches:${id}`, `bracket:${id}`,
      `participants:${id}`.
- [ ] `activateSplitAction(id, seasonId)` — two-step (deactivate-all-in-
      season then activate-target), copy the `NOTE: non-atomic by design`
      comment from `seasons/_actions.ts:74-76`. Tags `seasons`, `archive`.
- [ ] `deactivateSplitAction(id)` — single update. Tags `seasons`, `archive`.

### W2.2 — Migrate `SplitsManager.tsx`

- [ ] Strip `createClient` (browser) and `useRouter` calls.
- [ ] Add `useOptimistic` reducer per D4 (`SplitOptimistic`).
- [ ] Replace each of the 4 handlers with an action call inside
      `startTransition`, applying the matching optimistic action first.
- [ ] Drop `router.refresh()`; keep `refresh()` from the hook.

### W2.3 — Wave 2 gate

- [ ] `./init.sh` green.
- [ ] Manual smoke: create, activate, deactivate, delete a split; confirm
      `/hub/*` updates and only one split per season ever shows active.

---

## Wave 3 — RegulationsManager (REQ-67, REQ-68)

Goal: storage write moves server-side; FormData transport.

### W3.1 — Create `src/app/admin/dashboard/normativa/_actions.ts`

- [ ] Scaffold per D1.
- [ ] Implement `uploadRegulationsAction(formData: FormData)`:
  - Read `file = formData.get('file')`; if `!(file instanceof File)` return
    `{ ok: false, error: 'Archivo inválido' }`.
  - Re-validate via `RegulationsUploadSchema` at the action boundary.
  - `supabase.storage.from('normativas').upload('public/normativa_pokemon_calmind_series.pdf', file, { cacheControl: '0', upsert: true })`.
  - On success: derive the public URL (deterministic path), call
    `revalidatePath('/admin/dashboard/normativa')` and
    `revalidatePath('/normativa')`, return `{ ok: true; url }`.
  - On error: log `[uploadRegulationsAction] Error:`, return
    `{ ok: false, error }`.

### W3.2 — Migrate `RegulationsManager.tsx`

- [ ] Remove `createClient` (browser) and `useRouter` imports / usage.
- [ ] `handleUpload`: build a `FormData`, append `'file'`, call
      `uploadRegulationsAction(formData)`.
- [ ] On `result.ok`: `setCurrentUrl(result.url)`, `setSuccess(true)`, clear
      the input.
- [ ] (Optional) Add `useOptimistic` for the URL per D4
      RegulationsManager note. Acceptable to skip if it complicates the
      diff — the action's roundtrip is short.

### W3.3 — Wave 3 gate

- [ ] `./init.sh` green.
- [ ] Manual smoke: upload a small PDF; confirm the public URL serves the
      new file (HEAD 200) and the admin card shows the updated URL.
- [ ] `rg "from '@/lib/supabase/client'" src/app/admin/dashboard/normativa`
      returns zero matches.

---

## Wave 4 — ParticipantsManager (REQ-69..REQ-73)

Goal: 5 writes including the bulk-lives batch. Preserve F6a `AdminConfirmModal`
wiring exactly.

### W4.1 — Pre-flight check (database)

- [ ] Inspect `league_rankings` (psql `\d+ league_rankings` or
      `docs/DATABASE_ARCHITECTURE.md`). If `nickname` / `avatar_url` are
      denormalized columns on the view, plan to add `rankings:*` busts to
      `updateTrainerAction` / `deleteTrainerAction`. Note the result in
      `progress/history.md` for the leader.

### W4.2 — Create `src/app/admin/dashboard/participants/_actions.ts`

- [ ] Scaffold per D1.
- [ ] `createTrainerAction(input: TrainerInput)` — tags `trainers`. Return
      `{ ok: true; id: string }`.
- [ ] `updateTrainerAction(id: string, input: TrainerInput)` — tags
      `trainers`, `seasons` (or extend per W4.1 outcome).
- [ ] `deleteTrainerAction(id: string)` — tags `trainers`, `seasons`.
- [ ] `assignParticipantAction({ leagueId, trainerId, initialSeed, lives, splitId })` —
      insert into `league_participants`; tags
      `participants:${splitId}`, `rankings:${leagueId}`.
      Return `{ ok: true; id: string }`.
- [ ] `removeParticipantAction(participantId, { splitId, leagueId })` — tags
      `participants:${splitId}`, `rankings:${leagueId}`.
- [ ] `updateParticipantLivesAction(changes, { splitId, leagueId })` — wrap
      the existing `Promise.all` in try/catch; count failures; return
      `{ ok: false, error, failedCount }` on partial failure. Tags
      `participants:${splitId}`, `rankings:${leagueId}`.

### W4.3 — Migrate `ParticipantsManager.tsx`

- [ ] Strip `createClient` (browser) and the `refreshTrainers` /
      `refreshParticipants` helpers (the action's `updateTag` + a single
      retained `router.refresh()` handle reconciliation).
- [ ] Add two `useOptimistic` reducers per D4 (`TrainerOptimistic`,
      `ParticipantOptimistic`).
- [ ] Rewrite `handleSaveTrainer` (both insert + update branches) using
      `createTrainerAction` / `updateTrainerAction` inside `startTransition`.
- [ ] Rewrite `runDeleteTrainer` to call `deleteTrainerAction` — keep the
      `requestDeleteTrainer` → `confirmPending` AdminConfirmModal wiring
      from F6a.
- [ ] Rewrite `handleAssignTrainer` and `runRemoveFromLeague` with the new
      actions; keep the `AdminConfirmModal` binding.
- [ ] Rewrite `handleSaveLivesChanges` to call
      `updateParticipantLivesAction` and surface `failedCount` via the
      existing Spanish error string.

### W4.4 — Wave 4 gate

- [ ] `./init.sh` green.
- [ ] Manual smoke: create, edit, delete a trainer; assign + remove from a
      league; bulk-update lives; confirm all four flows.

---

## Wave 5 — MatchesManager (REQ-74..REQ-78)

Goal: 8 writes including J15 / J16 generators. Highest blast radius.
**Explicitly do NOT add auto-cascade (F6c is out of scope).**

### W5.1 — Create `src/app/admin/dashboard/matches/_actions.ts`

- [ ] Scaffold per D1.
- [ ] `saveMatchResultAction(matchId, input: MatchResultInput, { splitId, leagueId })`
      — tags `matches:${splitId}`, `rankings:${leagueId}`,
      `bracket:${splitId}`.
- [ ] `clearMatchResultAction(matchId, { splitId, leagueId })` — same tags
      as save.
- [ ] `createMatchAction({ leagueId, splitId, ...input })` — tags
      `matches:${splitId}`, `bracket:${splitId}`. Return
      `{ ok: true; id: string }`.
- [ ] `updateMatchAction(id, input, { splitId, leagueId })` — tags
      `matches:${splitId}`, `bracket:${splitId}`.
- [ ] `deleteMatchAction(matchId, { splitId, leagueId })` — tags
      `matches:${splitId}`, `rankings:${leagueId}`, `bracket:${splitId}`.
- [ ] `generateJ15MatchesAction(leagueId, splitId)` — port
      `MatchesManager.tsx:535-611` rankings-read + bulk insert verbatim;
      tags `matches:${splitId}`, `bracket:${splitId}`. Return
      `{ ok: true; createdCount: 4 }` on success.
- [ ] `generateJ16MatchesAction(leagueId, splitId)` — port
      `MatchesManager.tsx:614-739` J15-read + tier-branched bulk insert
      verbatim; same tags as J15.

### W5.2 — Migrate `MatchesManager.tsx`

- [ ] Strip the seven inline `supabase.from('matches').*` writes (lines
      `:359`, `:383`, `:459`, `:472`, `:496`, `:601`, `:729`).
- [ ] Keep the four browser-side READS (splits, leagues, matches,
      participants useEffects) — those are reads, not writes; goal is "no
      writes via browser client."
- [ ] Add `useOptimistic` reducer per D4 (`MatchOptimistic`).
- [ ] Rewrite each handler to call the matching action inside
      `startTransition`, applying optimistic state first.
- [ ] Keep `refreshMatches` for reconciliation; drop `router.refresh()`.
- [ ] Preserve the F6a `AdminConfirmModal` wiring for `runClearResult` and
      `runDeleteMatch`.

### W5.3 — Wave 5 gate

- [ ] `./init.sh` green.
- [ ] Manual smoke: save / clear a result; plan / edit / delete a match;
      generate J15 for both Primera and Segunda leagues; generate J16 for
      both. Confirm `/[season]/[split]` and `/[season]/[split]/cruces`
      reflect changes within one navigation.

---

## Wave 6 — Documentation refresh (REQ-79)

Goal: docs match the shipped reality. No code.

### W6.1 — `docs/conventions.md`

- [ ] Line 50 — replace the stale `home/` reference with the actual current
      grouping under `src/components/` (verify via `ls src/components/`).
- [ ] Table at `:82-93` — replace "F6 deferred" entries in the "Mutated by
      (today)" column with the actual `<Manager>/_actions.ts` references:
  - `seasons` → `seasons/_actions.ts` (already), `splits/_actions.ts`,
    `divisions/_actions.ts`, `participants/_actions.ts`
  - `splits:${id}` → `splits/_actions.ts`, `divisions/_actions.ts`
  - `matches:${splitId}` → `matches/_actions.ts`
  - `rankings:${leagueId}` → `matches/_actions.ts`,
    `participants/_actions.ts`
  - `participants:${splitId}` → `participants/_actions.ts`,
    `divisions/_actions.ts`
  - `bracket:${splitId}` → `matches/_actions.ts`
  - `trainers` → `participants/_actions.ts`
  - `archive` → `seasons/_actions.ts`, `splits/_actions.ts`
- [ ] Remove the "F6 deferred" column entirely (no longer applicable).
- [ ] `:144-156` — rewrite the REQ-39 staleness window note to state the
      gap is closed: F6b migrated the remaining 5 Managers; all admin writes
      now flow through Server Actions with `updateTag`. Keep the
      "Admin queries never cache" subsection unchanged.

### W6.2 — Final gate

- [ ] `./init.sh` green.
- [ ] `rg "createClient\(\)" src/app/admin/dashboard/{divisions,splits,normativa,participants,matches}/_components`
      returns zero matches.
- [ ] `rg "router.refresh\(\)" src/app/admin/dashboard/{divisions,splits,normativa,participants,matches}/_components`
      returns zero — or only matches accompanied by an explanatory comment.
- [ ] Hand back to leader with status `implementation_ready_for_review`.

---

## Done criteria (whole batch)

1. All 5 Managers import zero `@/lib/supabase/client`.
2. All 5 Managers contain no inline Supabase mutation calls (`.insert`,
   `.update`, `.delete`, `.upsert`, `storage.upload`).
3. All actions follow the discriminated-union return shape — no throws to
   the UI.
4. All actions call the correct `updateTag(...)` set per D3.
5. F6a `AdminConfirmModal` bindings are preserved (no
   `request*` / `confirm*` rewiring).
6. MatchesManager dual-cascade is NOT introduced (F6c remains untouched).
7. `docs/conventions.md` accurately describes the shipped state.
8. `./init.sh` green; manual smoke complete for all 5 Managers.
