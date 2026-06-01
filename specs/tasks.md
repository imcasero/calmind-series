# Tasks — Batch F6a (Confirmation Modal + Docs + Dead Code Sweep)

Atomic checklist for the Implementer. Sections map 1:1 to REQs in
`requirements.md`. Run `./init.sh` at the END of each Wave (not between every
micro-step inside a Wave) so dependent files land together. Final `./init.sh`
must be green; reviewer rejects otherwise.

Wave sequence (locked):
- **Wave A** — Dead code sweep (REQ-45 → REQ-49). Land FIRST so any silent
  callers surface before the new primitive is dropped in.
- **Wave B** — `AdminConfirmModal` primitive + barrel export (REQ-50 + REQ-51).
- **Wave C** — Adopt the modal at 7 sites (REQ-52 → REQ-58).
- **Wave D** — `docs/conventions.md` cleanup (REQ-59). Doc-only; can land
  anywhere but locked last for clean commit history.

---

## Wave A — Dead code sweep

### Pre-flight (run once before any deletion)

- [ ] Confirm baseline `./init.sh` is GREEN on entry.
- [ ] Run the 3 pre-flight greps from `design.md` §3.1; verify the expected
      counts:
  - Navbar (minus source + barrel) → 2 hits (loading.tsx × 2).
  - components/home (minus self) → 0 hits.
  - LinkButton (minus source + barrel) → 4 hits (Hero × 2 + CurrentSeason × 1
    in JSX + Navbar.tsx × 1).

### REQ-45 — delete legacy loading.tsx files

- [ ] `rm src/app/[season]/[split]/cruces/loading.tsx`
- [ ] `rm src/app/[season]/[split]/final/loading.tsx`

### REQ-47 — delete `src/components/home/` subtree

- [ ] `rm -rf src/components/home`
  - (Or, if narrowing: `rm -rf src/components/home/CurrentSeason src/components/home/Hero` — see `design.md` §3.3. Recommended is full delete.)

### REQ-49 — strip barrel entries from `src/components/shared/index.ts`

- [ ] Remove line 8: `export { default as Navbar } from './layout/Navbar';`
- [ ] Remove line 11: `export type { LinkButtonProps } from './ui/Button/LinkButton';`
- [ ] Remove line 13: `export { default as LinkButton } from './ui/Button/LinkButton';`
- [ ] Verify the remaining barrel exports are intact (Footer, PageHeader,
      BackgroundDecoration, EmptyState, SectionSkeleton, ShellSkeleton).

### REQ-46 + REQ-48 — delete source files

- [ ] `rm src/components/shared/layout/Navbar.tsx`
- [ ] `rm src/components/shared/ui/Button/LinkButton.tsx`
- [ ] `rmdir src/components/shared/ui/Button` (should be empty; if not,
      something was missed — investigate)

### Wave A — done criteria

- [ ] `test ! -e src/app/[season]/[split]/cruces/loading.tsx`
- [ ] `test ! -e src/app/[season]/[split]/final/loading.tsx`
- [ ] `test ! -e src/components/home`
- [ ] `test ! -e src/components/shared/layout/Navbar.tsx`
- [ ] `test ! -e src/components/shared/ui/Button`
- [ ] `grep -c "Navbar\|LinkButton" src/components/shared/index.ts` → 0
- [ ] `grep -rn "components/home\|shared/ui/Button\|shared/layout/Navbar" src/ --include="*.tsx" --include="*.ts"` → 0 hits
- [ ] **`./init.sh` GREEN** (typecheck + lint + build pass; page count
      should equal current baseline minus zero — no live pages affected).

---

## Wave B — `AdminConfirmModal` primitive

### REQ-50 — create the primitive

- [ ] Create `src/components/admin/ui/AdminConfirmModal.tsx` with the exact
      shape in `design.md` §1 (compose `AdminModal` + `AdminButton`).
- [ ] Confirm props interface matches `AdminConfirmModalProps` in `design.md`
      §1 (open / title / message / confirmLabel? / cancelLabel? / variant? /
      onConfirm / onCancel).
- [ ] Default `confirmLabel='Confirmar'`, `cancelLabel='Cancelar'`,
      `variant='danger'`.
- [ ] Return `null` when `open === false`.

### REQ-51 — export from the admin UI barrel

- [ ] Add `export { AdminConfirmModal } from './AdminConfirmModal';` to
      `src/components/admin/ui/index.ts` (alphabetised — insert between
      `AdminCard` and `AdminErrorBanner`).

### Wave B — done criteria

- [ ] `test -f src/components/admin/ui/AdminConfirmModal.tsx`
- [ ] `grep -c "AdminConfirmModal" src/components/admin/ui/index.ts` → 1
- [ ] `grep -c "from './AdminModal'\|from './AdminButton'" src/components/admin/ui/AdminConfirmModal.tsx` → 2
- [ ] **`./init.sh` GREEN.** No consumers yet — primitive only.

---

## Wave C — Adopt at 7 sites

Order REQs by Manager simplicity (single-modal first, dual-modal last) so the
shared pattern lands once before the tagged-union variant.

### REQ-52 — SeasonsManager

- [ ] Add `AdminConfirmModal` to the barrel import at line 4-10.
- [ ] Add `confirmDelete` state (`useState<{ open: boolean; id: string | null }>({ open: false, id: null })`).
- [ ] Split the current `handleDelete` (lines 101-111) into `requestDelete`
      (opens modal) + `confirmDeleteAction` (preserves the
      `startTransition` + `applyOptimistic` + `deleteSeasonAction` body
      verbatim) + `cancelDelete` (closes modal).
- [ ] Update the row delete button onClick from `handleDelete(season.id)`
      to `requestDelete(season.id)`.
- [ ] Render `<AdminConfirmModal open={confirmDelete.open} title="Eliminar temporada" message="¿Estás seguro de eliminar esta temporada?" variant="danger" onConfirm={confirmDeleteAction} onCancel={cancelDelete} />` next to the existing create-form modal block.
- [ ] Verify: `grep -c "confirm(" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` → 0.

### REQ-53 — SplitsManager

- [ ] Add `AdminConfirmModal` to the existing admin/ui barrel import.
- [ ] Add `confirmDelete` state (same shape as REQ-52).
- [ ] Split `handleDelete` (lines 84-100) into `requestDelete` +
      `confirmDeleteAction` (preserve the Supabase delete + `refresh()` +
      `router.refresh()` chain verbatim) + `cancelDelete`.
- [ ] Update the row delete button onClick.
- [ ] Render `<AdminConfirmModal open={confirmDelete.open} title="Eliminar split" message="¿Estas seguro de eliminar este split? Se eliminaran tambien sus divisiones." variant="danger" onConfirm={confirmDeleteAction} onCancel={cancelDelete} />`.
- [ ] Verify: `grep -c "confirm(" src/app/admin/dashboard/splits/_components/SplitsManager.tsx` → 0.

### REQ-54 — DivisionsManager

- [ ] Add `AdminConfirmModal` import.
- [ ] Add `confirmDelete` state.
- [ ] Split `handleDelete` (lines 91-102) into request/confirm/cancel trio
      (preserve Supabase delete + `refresh()` + `router.refresh()`).
- [ ] Update row button onClick.
- [ ] Render `<AdminConfirmModal open={confirmDelete.open} title="Eliminar división" message="¿Estas seguro de eliminar esta division?" variant="danger" onConfirm={confirmDeleteAction} onCancel={cancelDelete} />`.
- [ ] Verify: `grep -c "confirm(" src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx` → 0.

### REQ-55 + REQ-56 — ParticipantsManager (tagged-union)

- [ ] Add `AdminConfirmModal` import.
- [ ] Add `PendingConfirm` discriminated-union type + `pendingConfirm` state
      per `design.md` §2.3.
- [ ] Convert `handleDeleteTrainer` (lines 228-244) into `requestDeleteTrainer`
      (sets `{ kind: 'delete-trainer', trainerId }`) + body extracted into
      the `confirmPending` branch.
- [ ] Convert `handleRemoveFromLeague` (lines 288-303+) into
      `requestRemoveFromLeague` (sets `{ kind: 'remove-from-league', participantId }`) + body extracted into the other `confirmPending`
      branch.
- [ ] Update both row buttons' onClick to call the new request* functions.
- [ ] Add the `confirmProps` derivation + single `<AdminConfirmModal>`
      render per `design.md` §2.3.
- [ ] Verify: `grep -c "confirm(" src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` → 0.
- [ ] Verify: `grep -c "AdminConfirmModal" src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` → at least 2 (1 import + 1 JSX).

### REQ-57 + REQ-58 — MatchesManager (tagged-union)

- [ ] Add `AdminConfirmModal` import.
- [ ] Add `PendingMatchConfirm` discriminated-union + state per
      `design.md` §2.4.
- [ ] Convert `handleClearResult` (line 369+) into `requestClearResult` +
      body in the `confirmPending` 'clear-result' branch (preserve
      `saving` state, Supabase update, `refreshMatches()`, `router.refresh()`).
- [ ] Convert `handleDeleteMatch` (line 480+) into `requestDeleteMatch` +
      body in the 'delete-match' branch (preserve Supabase delete,
      `refreshMatches()`, `router.refresh()`).
- [ ] Update both row button onClicks.
- [ ] Render single `<AdminConfirmModal>` with `confirmProps` derivation.
- [ ] Verify: `grep -c "confirm(" src/app/admin/dashboard/matches/_components/MatchesManager.tsx` → 0.
- [ ] Verify: `grep -c "AdminConfirmModal" src/app/admin/dashboard/matches/_components/MatchesManager.tsx` → at least 2.

### Wave C — done criteria

- [ ] Combined grep: `grep -rn "confirm(" src/app/admin/dashboard/ --include="*.tsx"` → 0 hits across all 5 Managers (and SeasonsManager).
- [ ] Combined grep: `grep -rn "AdminConfirmModal" src/app/admin/dashboard/ --include="*.tsx"` → at least 10 hits (5 Managers × ≥ 2: import + JSX).
- [ ] **`./init.sh` GREEN.**
- [ ] **Manual smoke (7 sites):** start dev server, log in as admin, exercise
      each destructive flow:
  - Seasons → delete a season → modal → cancel → row stays → delete again → confirm → row removed.
  - Splits → delete a split → modal with cascade warning → confirm → row removed.
  - Divisions → delete a league → modal → confirm → row removed.
  - Participants → trainer delete → modal → confirm → row removed.
  - Participants → remove from league → modal → confirm → row removed.
  - Matches → clear result on a played match → modal → confirm → result cleared.
  - Matches → delete a match → modal → confirm → match removed.
  - All 7 modals should show the exact Spanish message strings from
    `requirements.md` REQ-52..REQ-58.
  - Cancel paths (✕ in modal header AND "Cancelar" button) should both
    close the modal without mutating data.

---

## Wave D — `docs/conventions.md` cleanup

### REQ-59 — strip stale forecasts and dead-file references

- [ ] Delete lines 24-27 of `docs/conventions.md` (the `> ⚠️ The dual-cache layer in src/lib/data/fetchData.ts ...` blockquote).
- [ ] Optionally rewrite lines 37-40 to drop the `queries.types.ts` reference
      while keeping the "do not redefine query return shapes locally"
      principle (see `design.md` §4.2 for suggested text).
- [ ] Optionally update lines 57-58 to drop the "being corrected in F4"
      forecast on `lib/services/` (see `design.md` §4.3).
- [ ] Visually scan the resulting file: no double blank lines, no broken
      blockquotes, no orphan punctuation.

### Wave D — done criteria

- [ ] `grep -c "fetchData" docs/conventions.md` → 0
- [ ] `grep -c "queries.types" docs/conventions.md` → 0
- [ ] `grep -c "being corrected in F4\|slated for" docs/conventions.md` → 0
- [ ] **`./init.sh` GREEN** (doc-only edits cannot fail typecheck/lint/build
      but rerun to confirm baseline).

---

## Final batch close

- [ ] **`./init.sh` GREEN** with all four waves applied.
- [ ] Confirm: page count unchanged vs baseline (no live pages should have
      been affected by Wave A — the deleted loading.tsx files were dead
      UX; the page.tsx redirects still resolve).
- [ ] Confirm: lint count is 0 errors / 0 warnings (no new warnings
      introduced by the new primitive or the adoption sites).
- [ ] Annotate `features.json` F6a items with `[DONE 2026-05-31]` (or
      whatever date). **Leader does this, not implementer.**
- [ ] Append a F6a entry to `progress/history.md`. **Leader does this.**
- [ ] Hand to reviewer.

---

## Failure protocol (per implementer rule 4)

If any verification gate fails:
1. STOP. Do not continue to the next Wave.
2. Report the failure with exact grep / build output in the hand-back to
   leader.
3. Do NOT attempt creative fixes outside the spec — drift goes back to
   spec-author for a respec (per the F4 precedent in `progress/history.md`).

If `./init.sh` is RED on entry:
1. Investigate the baseline failure FIRST.
2. Do not start F6a work on a red baseline (rule from `CLAUDE.md`).
