# Design — F6a (Confirmation Modal + Docs + Dead Code Sweep)

Companion to `specs/requirements.md`. Implementation-level shape for every REQ
in the batch. Names, props, and file paths are concrete; pasteable code shown
where the existing pattern leaves ambiguity.

## 0. Files touched (summary)

**Created (1):**
- `src/components/admin/ui/AdminConfirmModal.tsx`

**Edited (10):**
- `src/components/admin/ui/index.ts` (1 line added — REQ-51)
- `src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` (REQ-52)
- `src/app/admin/dashboard/splits/_components/SplitsManager.tsx` (REQ-53)
- `src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx` (REQ-54)
- `src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` (REQ-55 + REQ-56)
- `src/app/admin/dashboard/matches/_components/MatchesManager.tsx` (REQ-57 + REQ-58)
- `src/components/shared/index.ts` (REQ-49 — strip 3 lines)
- `docs/conventions.md` (REQ-59 — strip lines 24-27, plus optional adjacent
  cleanups)

**Deleted (8 files + 4 dirs):**
- `src/app/[season]/[split]/cruces/loading.tsx` (REQ-45)
- `src/app/[season]/[split]/final/loading.tsx` (REQ-45)
- `src/components/shared/layout/Navbar.tsx` (REQ-46)
- `src/components/shared/ui/Button/LinkButton.tsx` (REQ-48)
- `src/components/shared/ui/Button/` directory (REQ-48 — empty after delete)
- `src/components/home/CurrentSeason/CurrentSeason.tsx` (REQ-47)
- `src/components/home/CurrentSeason/` directory (REQ-47 — empty after delete)
- `src/components/home/Hero/Hero.tsx` (REQ-47)
- `src/components/home/Hero/` directory (REQ-47 — empty after delete)
- `src/components/home/AboutCalmind/AboutCalmind.tsx` (REQ-47 — same dead chain)
- `src/components/home/AboutCalmind/` directory (REQ-47)
- `src/components/home/TournamentFormat/TournamentFormat.tsx` (REQ-47 — same dead chain)
- `src/components/home/TournamentFormat/` directory (REQ-47)
- `src/components/home/` directory (REQ-47 — empty after delete)

---

## 1. `AdminConfirmModal` — primitive design (REQ-50)

**File:** `src/components/admin/ui/AdminConfirmModal.tsx`

### Source code shape

The primitive composes `AdminModal` (which already renders the dim overlay +
pixel-framed card + close button) and adds a message body + two action
buttons. Match the existing layout idiom from `SeasonsManager.tsx:181-197`
("ghost + primary/danger" button row with `flex gap-3 pt-2`).

```tsx
import { AdminButton } from './AdminButton';
import { AdminModal } from './AdminModal';

interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Pixel admin confirmation modal. Replaces `window.confirm()` at destructive
 * action sites (delete a season, clear a match result, remove a trainer, etc.).
 * Composes AdminModal (overlay + frame) + AdminButton (ghost cancel + danger
 * confirm). Controlled visibility: parent owns `open`, `onConfirm`, `onCancel`.
 */
export function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  if (!open) return null;

  return (
    <AdminModal title={title} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <p className="font-retro text-base text-px-ink">{message}</p>
        <div className="flex gap-3 pt-2">
          <AdminButton
            tone="ghost"
            onClick={onCancel}
            className="flex-1 justify-center"
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            tone={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1 justify-center"
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}
```

### Why no `'use client'` directive

`AdminModal.tsx` itself has no `'use client'` directive — it's a pure
presentational component, and the `'use client'` boundary is supplied by the
parent Manager (which is already `'use client'` for `useState`/`useOptimistic`).
`AdminConfirmModal` is the same shape: pure JSX + handler pass-through.
Adding the directive is harmless but unnecessary; matching `AdminModal`'s
convention keeps the primitive consistent. If a runtime error surfaces during
build, add the directive — but the expectation is none will.

### Why compose, not inline

The body of `AdminModal` (overlay z-50, frame, title row with close button)
is identical for any modal in the admin surface. Duplicating that JSX in
`AdminConfirmModal` doubles the maintenance cost (e.g. when FR15 retones the
overlay colour). Composition keeps `AdminModal` as the single visual root for
admin modals. The trade-off is one extra component on the render tree (≈
zero perf cost).

### Why `tone` mapping inside the primitive (not exposed)

The 7 sites in F6a are ALL destructive (`delete`, `clear`, `remove`). Exposing
a raw `tone` prop on the confirm button would let future callers pick any
of the 6 tones from `AdminButton.tsx:4` (`primary | cyan | success | danger | ghost | default`), which is overkill for a confirm primitive. The
`variant: 'danger' | 'neutral'` API encodes intent ("is this a destructive
confirmation?") rather than presentation. Future neutral confirms (e.g.
"Apply all pending lives changes?" in `ParticipantsManager`) get
`variant: 'neutral'` and the primitive maps to `tone="primary"`.

### Verification

- `grep -nc "AdminModal\|AdminButton" src/components/admin/ui/AdminConfirmModal.tsx` >= 2.
- Primitive renders correctly in the 7 adoption sites (manual smoke per
  REQ-52..REQ-58).

---

## 2. Adoption pattern (REQ-52 → REQ-58)

### 2.1 Single-modal sites (SeasonsManager, SplitsManager, DivisionsManager)

One confirm site per Manager. Use the simplest controlled-state shape:

```tsx
// Inside the Manager component:
const [confirmDelete, setConfirmDelete] = useState<{
  open: boolean;
  id: string | null;
}>({ open: false, id: null });

// New handlers replacing the existing handleDelete body:
const requestDelete = (id: string) => {
  setConfirmDelete({ open: true, id });
};

const confirmDeleteAction = () => {
  if (!confirmDelete.id) return;
  const id = confirmDelete.id;
  setConfirmDelete({ open: false, id: null });
  // ... existing destructive body verbatim (Supabase call / Server Action) ...
};

const cancelDelete = () => setConfirmDelete({ open: false, id: null });

// Hook up the row button:
<AdminButton tone="danger" onClick={() => requestDelete(season.id)}>
  Eliminar
</AdminButton>

// Render the modal alongside the existing create-form modal:
<AdminConfirmModal
  open={confirmDelete.open}
  title="Eliminar temporada"
  message="¿Estás seguro de eliminar esta temporada?"
  variant="danger"
  onConfirm={confirmDeleteAction}
  onCancel={cancelDelete}
/>
```

**Critical: preserve the existing optimistic/`startTransition` wrapper.**
`SeasonsManager.handleDelete` currently wraps `deleteSeasonAction(id)` in
`startTransition(async () => { applyOptimistic({...}); const result = await deleteSeasonAction(id); ... })`. The `confirmDeleteAction` body MUST keep
that wrapper byte-for-byte — moving the confirm gate outside `startTransition`
is fine (the modal interaction is synchronous user input), but the
destructive call itself stays inside `startTransition`.

### 2.2 Splits / Divisions adoption — handler body details

Both Managers currently use the pre-Server-Actions pattern: direct
`supabase.from(...).delete()` + `await refresh()` + `router.refresh()`.
F6a does NOT change that (F6b owns the Server Actions migration). The
extracted `confirmDeleteAction` body simply contains the existing async
function body minus the `if (!confirm(...)) return;` line.

Verified current shapes:
- `SplitsManager.tsx:84-100` — `handleDelete = async (id) => { if (!confirm(...)) return; const {error} = await supabase.from('splits').delete().eq('id', id); if (error) setError(...); else { await refresh(); router.refresh(); } }`
- `DivisionsManager.tsx:91-102` — same shape, different table (`leagues`).

The new `confirmDeleteAction` is `async` and captures `confirmDelete.id`
into a local before clearing state (to avoid a race if the user double-clicks).

### 2.3 ParticipantsManager — tagged-union state for two modals

This Manager has TWO destructive sites (`handleDeleteTrainer` at line 228,
`handleRemoveFromLeague` at line 288). Two separate `useState` slots would
work but the cleaner pattern (consistent with the tagged-union reducer in
`SeasonsManager.tsx:24-48`) is one piece of state covering both:

```tsx
type PendingConfirm =
  | { kind: 'delete-trainer'; trainerId: string }
  | { kind: 'remove-from-league'; participantId: string }
  | null;

const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

const requestDeleteTrainer = (trainerId: string) =>
  setPendingConfirm({ kind: 'delete-trainer', trainerId });

const requestRemoveFromLeague = (participantId: string) =>
  setPendingConfirm({ kind: 'remove-from-league', participantId });

const cancelConfirm = () => setPendingConfirm(null);

const confirmPending = async () => {
  if (!pendingConfirm) return;
  const current = pendingConfirm;
  setPendingConfirm(null);

  if (current.kind === 'delete-trainer') {
    // existing handleDeleteTrainer body (lines 236-243) verbatim, using
    // current.trainerId in place of `id`.
  } else {
    // existing handleRemoveFromLeague body (lines 291-303) verbatim, using
    // current.participantId in place of `participantId`.
  }
};

// Single modal instance whose props are derived from the current kind:
const confirmProps = pendingConfirm
  ? pendingConfirm.kind === 'delete-trainer'
    ? {
        title: 'Eliminar entrenador',
        message:
          '¿Estas seguro de eliminar este entrenador? Se eliminara de todas las divisiones.',
      }
    : {
        title: 'Quitar de la división',
        message: '¿Quitar este entrenador de la division?',
      }
  : { title: '', message: '' };

<AdminConfirmModal
  open={pendingConfirm !== null}
  title={confirmProps.title}
  message={confirmProps.message}
  variant="danger"
  onConfirm={confirmPending}
  onCancel={cancelConfirm}
/>
```

This keeps the JSX tree with **one** `<AdminConfirmModal>` regardless of
which destructive flow is in flight, and the `pendingConfirm` discriminant
guarantees you can never accidentally fire the wrong handler.

### 2.4 MatchesManager — same tagged-union, two kinds

`handleClearResult` (line 369) and `handleDeleteMatch` (line 480) both take
a `matchId: string`. Tagged-union shape:

```ts
type PendingMatchConfirm =
  | { kind: 'clear-result'; matchId: string }
  | { kind: 'delete-match'; matchId: string }
  | null;
```

`confirmProps` derivation mirrors §2.3 with the two MatchesManager messages
("¿Limpiar el resultado de este partido?" and "¿Eliminar este partido?").
Handler bodies (Supabase update vs delete) extracted verbatim — `saving`
state, `refreshMatches()`, `router.refresh()` all preserved.

### 2.5 Pattern guarantees (cross-cutting)

- **No double-trigger.** Cancelling clears state to `null` (or
  `{ open: false, id: null }`). The destructive handler always reads from
  state at the moment of invocation and clears state before awaiting the
  network call.
- **Existing buttons rename their onClick.** The row's "Eliminar" button
  changes from `onClick={() => handleDelete(season.id)}` to
  `onClick={() => requestDelete(season.id)}`. The text/styling of the row
  button does not change.
- **No `revalidateTag` / `revalidatePath` changes.** F4 wired
  `updateTag(...)` into `seasons/_actions.ts`; F6a does not touch any
  action. The other 4 Managers still call `router.refresh()` — that's the
  documented F4 staleness window (60s cap on minutes-tier cache) that F6b
  will close by migrating those Managers to Server Actions + `updateTag`.

---

## 3. Dead code sweep — execution detail (REQ-45 → REQ-49)

### 3.1 Pre-flight grep (run before deleting anything)

```bash
# REQ-45 prerequisite — Navbar callers minus the source + barrel:
grep -rn "Navbar" src/ --include="*.tsx" --include="*.ts" \
  | grep -v "components/shared/layout/Navbar.tsx" \
  | grep -v "components/shared/index.ts"
# Expected: 2 hits (cruces/loading.tsx, final/loading.tsx). Confirms REQ-45 unlocks REQ-46.

# REQ-47 prerequisite — components/home/ external callers:
grep -rn "components/home" src/ --include="*.tsx" --include="*.ts" \
  | grep -v "components/home/"
# Expected: 0 hits. Confirms the whole subtree is orphan.

# REQ-48 prerequisite — LinkButton callers minus the source + barrel:
grep -rn "LinkButton" src/ --include="*.tsx" --include="*.ts" \
  | grep -v "components/shared/ui/Button/LinkButton.tsx" \
  | grep -v "components/shared/index.ts"
# Expected: 4 hits — all inside components/home/ (CurrentSeason + Hero) AND
# components/shared/layout/Navbar.tsx. After REQ-46 + REQ-47 land, this drops to 0.
```

### 3.2 Delete order

The deletes are interdependent because of the barrel. The safe sequence:

1. **REQ-45** — delete the 2 loading.tsx files. They are leaves; nothing
   imports them. `./init.sh` would still pass after this step alone.
2. **REQ-47** — delete the entire `src/components/home/` subtree. Nothing
   imports it externally; the internal imports go away with the directory.
   `./init.sh` still green.
3. **REQ-49** — strip the 3 dead barrel entries from
   `src/components/shared/index.ts`. After steps 1+2, no live file imports
   `Navbar` or `LinkButton` via the barrel.
4. **REQ-46 + REQ-48** — delete `Navbar.tsx` and `LinkButton.tsx` source
   files. Their `Button/` parent dir is also empty → delete it. Their
   barrel entries are already gone from step 3, so no import resolution
   breaks.
5. **Final `./init.sh` of Wave A** — must be green. Typecheck verifies no
   dangling import; build verifies no dynamic import grabs a now-missing
   file.

### 3.3 If you want fewer rms

The user named only `CurrentSeason` and `Hero`. If the implementer judges
that `AboutCalmind` and `TournamentFormat` should stay (e.g. for a future
re-use under `/about` or similar), narrow REQ-47 to just those two files
+ their dirs. The grep gate still passes because those two have zero
external callers regardless. **Recommended:** delete all four (single
`rm -rf src/components/home`) — keeping orphan code under a domain
directory is the exact anti-pattern this sweep exists to fix.

---

## 4. `docs/conventions.md` — exact diff target (REQ-59)

### 4.1 Lines 24-27 (the primary stale callout)

**Remove entirely.** The preceding line 22 ends the "Two Supabase clients"
bullet; line 28 is "## Types — single source of truth". Removing 24-27
leaves a single blank line between bullets and the next H2 (Markdown-clean).

Verified current content at lines 24-27:

```
> ⚠️ The dual-cache layer in `src/lib/data/fetchData.ts` (`unstable_cache` +
> `react.cache`, tag `['matches']` that is never revalidated) is **legacy** and slated
> for removal in F4. Do not copy it. New caching should use `'use cache'` + `cacheTag`
> + `revalidateTag` (see `vercel:next-cache-components`).
```

**Why delete vs rewrite?** F4 added a "Cache tag taxonomy" section to the
same document (REQ-41 in F4) that covers the modern pattern (`'use cache'`
+ `cacheTag` + `updateTag`) authoritatively. Keeping a residual warning
pointing to a deleted file is pure noise.

### 4.2 Lines 37-40 (queries.types.ts cleanup)

Verified current content:

```
- **Do not redefine a query's return shape locally.** `src/lib/types/queries.types.ts`
  is a divergent duplicate (`tierName` vs `tier_name`) and is slated for deletion (F2).
  Import shared types from `@/lib/types/schemas`; for query-specific rows, import the
  query's own exported return type.
```

The file no longer exists (F2 deleted it 2026-05-28). Rewrite to drop the
forecast and the divergent-duplicate example, keeping the principle:

```
- **Do not redefine a query's return shape locally.** Import shared types from
  `@/lib/types/schemas`; for query-specific rows, import the query's own
  exported return type. (F2 removed the legacy `queries.types.ts` divergent
  duplicate that originally motivated this rule.)
```

### 4.3 Lines 57-58 (lib/services misnomer)

Verified current content:

```
- Pure transformation helpers belong in `src/lib/utils/` (note: `lib/services/` currently
  holds pure functions — that is a misnomer being corrected in F4).
```

F4 moved `matchService.ts` to `lib/utils/matches.ts`; `lib/services/bracketService.ts` remains. Rewrite the parenthetical:

```
- Pure transformation helpers belong in `src/lib/utils/`. `lib/services/`
  retains `bracketService.ts` (pure functions historically grouped under the
  service label — kept for migration cost, not because the name is right).
```

Or, if the implementer prefers to land `bracketService.ts` → `lib/utils/`
in a follow-up micro-batch, just drop the "being corrected in F4" forecast
and keep the misnomer note as-is. **Either is acceptable** — the audit
purpose is "no stale forecast references".

### 4.4 Verification

- `grep -n "fetchData" docs/conventions.md` → 0 matches.
- `grep -n "queries.types" docs/conventions.md` → 0 matches.
- `grep -n "being corrected in F4\|slated for" docs/conventions.md` → 0 matches.
- Markdown renders cleanly (no orphan blockquote / double blank lines —
  visual sanity check).

---

## 5. Framework gotchas worth flagging

1. **Next 16.1.1 + cacheComponents mode is LIVE (F4).** The Managers are
   `'use client'` already, so the new modal does not interact with the
   `cacheComponents` constraint on server `await`s. Verified by reading
   `SeasonsManager.tsx:1` (`'use client'`). Modal additions are pure
   client-side state — no Suspense gymnastics required.
2. **`AdminModal` close affordance.** The existing `AdminModal` renders a
   "✕" button bound to `onClose`. When composing inside `AdminConfirmModal`,
   pass `onCancel` to `AdminModal`'s `onClose` so the ✕ click cancels the
   confirmation. This matches user expectation (✕ == "abort").
3. **No keyboard handling required for F6a.** The existing `AdminModal`
   has no `Escape` handler or focus trap. Adding either is out of scope —
   `window.confirm()` also had no `Escape`-like dismissal once the user
   started interacting (browser-driven). Future accessibility batch can
   layer focus management on `AdminModal` once (benefits all admin
   modals — Create Season form, etc.).
4. **`useTransition` interaction.** SeasonsManager uses `startTransition`
   today. Confirm modal click handlers are NOT inside `startTransition` —
   the synchronous user click flips state, the destructive action (already
   inside `startTransition` for SeasonsManager) fires after the user
   confirms. No interleaving issues. Verified the React 19.2.3 behavior
   for nested `startTransition` calls is "the inner transition runs
   normally" — but we don't nest; the modal toggles state outside any
   transition.
5. **Verify against `vercel:nextjs`** for any unexpected runtime
   behavior with deleted `loading.tsx` files. The expectation is "no
   loading fallback rendered during the redirect", which matches the
   current `redirect()` path — but if the implementer hits a regression
   where the legacy URL renders blank-and-stutters before the redirect,
   the fix is to add `<Suspense fallback={null}>` to the page.tsx (the
   page already wraps its async inner in `<Suspense fallback={null}>`
   per `cruces/page.tsx:35-41` and `final/page.tsx:33-39`, so the
   loading.tsx removal should be transparent).
