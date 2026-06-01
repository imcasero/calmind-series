# Requirements — F6a (Confirmation Modal + Docs + Dead Code Sweep)

Source: `features.json` F6 (sub-batch F6a per leader audit `progress/history.md`
2026-05-31 entry "F6 opened, leader audit"). User-confirmed scope 2026-05-31:
three concerns shipped as one atomic batch. F6b (Server Actions migration of
5 Managers) and F6c (MatchesManager dual-cascade, AdminShellSkeleton, custom
cacheLife) are explicitly out of scope.

## Numbering

Last requirement used by F4 was **REQ-44** (per `specs/requirements.md` history
+ `progress/history.md`). F6a starts at **REQ-45**.

## Binding constraints (from CLAUDE.md + docs/conventions.md)

1. **Spanish for UI copy; English for code identifiers.** All visible strings in
   the new modal default to Spanish ("Cancelar", "Confirmar").
2. **`'use client'` only on leaves.** The new `AdminConfirmModal` is a client
   leaf because it owns visual state. The 7 Managers that adopt it are already
   `'use client'`; no boundary changes.
3. **Pixel admin primitive convention.** New primitive lives under
   `src/components/admin/ui/`, exported from `src/components/admin/ui/index.ts`
   alongside `AdminModal`, `AdminButton`, etc. (FR12 surface).
4. **Compose, do not rewrite.** `AdminModal`
   (`src/components/admin/ui/AdminModal.tsx:10-31`) already renders the dim
   overlay + pixel-framed card with a close button. `AdminConfirmModal` MUST
   compose `AdminModal` + `AdminButton`, not duplicate their JSX.
5. **`./init.sh` green between waves.** Deletion wave first (surfaces orphans),
   primitive wave second, adoption wave third, doc fix last (or anywhere — it's
   doc-only). The build must never break between waves.
6. **Preserve current destructive semantics.** The 7 sites today behave as:
   "user clicks → blocking `window.confirm` → on `true` proceed, on `false`
   return early." The replacement must preserve that flow (await user input,
   only then run the destructive Supabase / Server Action call). No
   double-confirmation, no eager execution.

---

## Wave A — Dead code sweep (REQ-45 → REQ-49)

Run first so any silent dependency on a "dead" file surfaces in `./init.sh`
before the primitive lands. Verified leader audit shows zero external callers
for every candidate below — but the implementer MUST re-grep before each delete.

### REQ-45 — Delete legacy `cruces/loading.tsx` and `final/loading.tsx`

**When** the implementer runs Wave A, **the system shall** delete
`src/app/[season]/[split]/cruces/loading.tsx` and
`src/app/[season]/[split]/final/loading.tsx`. These are the only two external
importers of `Navbar` (verified by
`grep -rn "Navbar" src/ --include="*.tsx" | grep -v "components/shared/layout/Navbar.tsx"`
→ exactly 3 hits: these 2 files + the barrel `src/components/shared/index.ts:8`).

**Justification:** the sibling `page.tsx` in each route
(`src/app/[season]/[split]/cruces/page.tsx:18-33`,
`src/app/[season]/[split]/final/page.tsx:18-31`) is an async RSC that always
calls `redirect()` (FR11 retired these routes). Next.js will not stream the
loading fallback when the page resolves with `redirect()`; the loading.tsx
files are dead UX surface. The page.tsx redirects themselves stay (FR11
contract: legacy URLs still resolve to either `/hub/bracket` or
`/archivo/:season/:split`).

**Verification gate:**
- `test ! -f src/app/[season]/[split]/cruces/loading.tsx`
- `test ! -f src/app/[season]/[split]/final/loading.tsx`
- `./init.sh` exits 0.

### REQ-46 — Delete `src/components/shared/layout/Navbar.tsx`

**When** REQ-45 has removed the only two importers, **the system shall**
delete `src/components/shared/layout/Navbar.tsx`.

**Verification gate (pre-delete):**
- `grep -rn "from '@/components/shared/layout/Navbar'\|from '@/components/shared'" src/ --include="*.tsx" --include="*.ts" | grep -v "Navbar.tsx" | grep -E "Navbar"` returns ZERO hits (the barrel re-export at `index.ts:8` doesn't count because REQ-49 removes it in the same wave).

**Verification gate (post-delete):**
- `test ! -f src/components/shared/layout/Navbar.tsx`
- `./init.sh` exits 0 (only after REQ-49 strips the barrel entry — see
  sequencing note below).

### REQ-47 — Delete `src/components/home/` entire subtree

**When** the implementer runs Wave A, **the system shall** delete the entire
`src/components/home/` directory:
- `src/components/home/CurrentSeason/CurrentSeason.tsx`
- `src/components/home/Hero/Hero.tsx`
- `src/components/home/AboutCalmind/AboutCalmind.tsx`
- `src/components/home/TournamentFormat/TournamentFormat.tsx`

The user's scope explicitly named `CurrentSeason` and `Hero`. The other two
sit in the same `components/home/` cluster with ZERO external callers
(verified: `grep -rn "AboutCalmind\|TournamentFormat" src --include="*.tsx" --include="*.ts" | grep -v "components/home/"` returns nothing). They are
the same FR11-orphan chain (post-landing-reskin). Deleting the whole subtree
is a single rm vs four partial rms; if the user wants to keep
AboutCalmind/TournamentFormat the implementer can scope down to just
CurrentSeason and Hero — flagged as an implementer judgment call inside the
locked scope.

**Verification gate:**
- `test ! -d src/components/home`
- `grep -rn "components/home" src --include="*.tsx" --include="*.ts"` returns
  ZERO hits.
- `./init.sh` exits 0.

### REQ-48 — Delete `src/components/shared/ui/Button/` subtree

**When** REQ-47 has removed `CurrentSeason` + `Hero` (the only two callers of
`LinkButton` outside `Navbar`) AND REQ-46 has removed `Navbar`,
**the system shall** delete the `LinkButton` source tree:
- `src/components/shared/ui/Button/LinkButton.tsx`
- the parent `src/components/shared/ui/Button/` directory if empty after the
  delete.

**Verification gate (pre-delete):**
- `grep -rn "LinkButton" src --include="*.tsx" --include="*.ts" | grep -v "components/shared/ui/Button/LinkButton.tsx" | grep -v "components/shared/index.ts"`
  returns ZERO hits (the barrel entries are gone in REQ-49).

**Verification gate (post-delete):**
- `test ! -f src/components/shared/ui/Button/LinkButton.tsx`
- `./init.sh` exits 0 (only valid after REQ-49 strips the barrel entries).

### REQ-49 — Strip dead barrel entries from `src/components/shared/index.ts`

**When** REQ-46 and REQ-48 are in flight, **the system shall** remove the
three lines in `src/components/shared/index.ts` that re-export the deleted
modules:
- Line 8: `export { default as Navbar } from './layout/Navbar';`
- Line 11: `export type { LinkButtonProps } from './ui/Button/LinkButton';`
- Line 13: `export { default as LinkButton } from './ui/Button/LinkButton';`

The remaining exports (`Footer`, `PageHeader`, `BackgroundDecoration`,
`EmptyState`, `SectionSkeleton`, `ShellSkeleton`) stay — all have live
importers (verified by `grep -rn "from '@/components/shared'" src --include="*.tsx" --include="*.ts"` → 21 live hits).

**Sequencing note (atomic mini-wave):** REQ-46 / REQ-48 / REQ-49 must land in
the same working-tree state. If you delete the source file before stripping
the barrel entry, the barrel re-export breaks the build; if you strip the
barrel entry first while a consumer (REQ-45's loading.tsx) still imports
`Navbar` from the barrel, that breaks the build instead. Recommended order:
REQ-45 (drop legacy loaders) → REQ-49 (strip barrel) → REQ-46 + REQ-47 + REQ-48
(delete sources). `./init.sh` MUST be re-run at the end of Wave A, not
between every micro-step.

**Verification gate (Wave A close):**
- `grep -c "Navbar\|LinkButton" src/components/shared/index.ts` → 0
- `./init.sh` exits 0.

---

## Wave B — `AdminConfirmModal` primitive (REQ-50)

### REQ-50 — Create `AdminConfirmModal` primitive composing `AdminModal` + `AdminButton`

**When** the implementer runs Wave B, **the system shall** create a new file
`src/components/admin/ui/AdminConfirmModal.tsx` exporting a single React
component with the following contract (full details in `specs/design.md` §1):

- **Marked `'use client'`** at the top of the file (it manages presentational
  state and binds onClick handlers — same convention as `AdminModal`
  although `AdminModal` itself omits the directive because it has no state;
  `AdminConfirmModal` is safe either way but stays as a presentational leaf,
  so the `'use client'` directive is **optional**. Implementer should match
  the existing `AdminModal.tsx` pattern — no directive — unless adding one is
  required by a runtime error).
- **Composes `AdminModal`** for the framed card + close affordance. Does not
  re-render the overlay/border JSX.
- **Renders a body paragraph** with the supplied `message` prop using
  `font-retro text-base text-px-ink` (matches the typographic scale of
  `AdminErrorBanner.tsx:13`).
- **Renders two `AdminButton`s** in a horizontal action row mirroring
  `SeasonsManager.tsx:181-197`: ghost-tone "Cancelar" (or `cancelLabel`
  override) on the left, danger-tone or primary-tone (per `variant` prop)
  confirm on the right.
- **Returns `null`** when `open === false` (controlled visibility — parents
  flip a boolean).

**Props contract (exhaustive):**

```ts
interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;   // default 'Confirmar'
  cancelLabel?: string;    // default 'Cancelar'
  variant?: 'danger' | 'neutral';  // default 'danger' (all 7 sites are destructive)
  onConfirm: () => void;
  onCancel: () => void;
}
```

- `variant: 'danger'` → confirm button uses `tone="danger"` (red pixel CSS
  `pixel-btn--danger` at `src/app/styles/pixel.css:269-270`).
- `variant: 'neutral'` → confirm button uses `tone="primary"` (reserved for
  future non-destructive confirms; not used by any of the 7 sites in F6a).

**Verification gate:**
- `test -f src/components/admin/ui/AdminConfirmModal.tsx`
- `grep -c "from './AdminModal'\|from './AdminButton'" src/components/admin/ui/AdminConfirmModal.tsx` → at least 2 (proves composition).
- Exported from `src/components/admin/ui/index.ts` (REQ-51).
- `./init.sh` exits 0.

### REQ-51 — Wire `AdminConfirmModal` into the admin UI barrel

**When** REQ-50 lands, **the system shall** add the export
`export { AdminConfirmModal } from './AdminConfirmModal';` to
`src/components/admin/ui/index.ts` so consumers can keep their single-source
barrel import (current pattern in all 6 Managers, e.g.
`SeasonsManager.tsx:4-10`).

**Verification gate:**
- `grep -c "AdminConfirmModal" src/components/admin/ui/index.ts` → 1
- `./init.sh` exits 0.

---

## Wave C — Adopt `AdminConfirmModal` at 7 sites (REQ-52 → REQ-58)

Each adoption REQ replaces a single `confirm(...)` call with controlled modal
state. The pattern is identical at each site; per-REQ specifics call out the
message string (Spanish, character-for-character preserved) and the handler
identifier.

**Shared pattern (full code shape in `specs/design.md` §2):**
1. Add a per-site `useState` holding `{ open: boolean; pendingId: string | null }`
   (sites that pass extra context like `participantId` use the same shape;
   sites with no ID payload — none in F6a — would use `boolean` alone).
2. Convert the existing handler that called `confirm(...)` into TWO functions:
   a thin `requestX(id)` that flips state open, and the existing destructive
   body extracted into `confirmX()` that runs on modal confirm.
3. Render `<AdminConfirmModal ... />` at the same JSX depth as the existing
   `<AdminModal>` create-form (e.g. SeasonsManager renders both, side by side).

**No logic change.** The Supabase / Server Action call inside each handler
stays byte-for-byte identical; only the wrapper changes from
`if (!confirm(...)) return;` to "if user clicks Confirmar in the modal".

### REQ-52 — SeasonsManager: replace delete confirm

**When** an admin clicks the delete button on a season row, **the system
shall** open `<AdminConfirmModal title="Eliminar temporada" message="¿Estás seguro de eliminar esta temporada?" variant="danger" />` instead of calling
`confirm(...)`. On confirm, invoke the existing `deleteSeasonAction(id)`
path currently at `src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx:101-111` (the optimistic + `startTransition` flow is preserved verbatim — only the confirm gate moves to the modal).

**Verification gate:**
- `grep -c "confirm(" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` → 0
- `grep -c "AdminConfirmModal" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` → at least 2 (1 import + 1 JSX usage).
- Manual: open admin dashboard → seasons → click delete → modal appears with
  the exact Spanish message → "Cancelar" dismisses, "Confirmar" deletes.

### REQ-53 — SplitsManager: replace delete confirm

**When** an admin clicks delete on a split row, **the system shall** open
`<AdminConfirmModal title="Eliminar split" message="¿Estas seguro de eliminar este split? Se eliminaran tambien sus divisiones." variant="danger" />`
instead of calling `confirm(...)` at
`src/app/admin/dashboard/splits/_components/SplitsManager.tsx:84-100`.
Preserve the existing Supabase delete + `refresh()` + `router.refresh()`
chain. Preserve the existing string verbatim (no Spanish accent normalisation
— it ships without the tilde on "Estás" today and that's intentional consistency
with the rest of the file).

**Verification gate:**
- `grep -c "confirm(" src/app/admin/dashboard/splits/_components/SplitsManager.tsx` → 0
- `grep -c "AdminConfirmModal" src/app/admin/dashboard/splits/_components/SplitsManager.tsx` → at least 2.
- Manual smoke: delete a split → modal with cascade warning → confirm deletes.

### REQ-54 — DivisionsManager: replace delete confirm

**When** an admin clicks delete on a division (league) row, **the system
shall** open `<AdminConfirmModal title="Eliminar división" message="¿Estas seguro de eliminar esta division?" variant="danger" />` instead of calling
`confirm(...)` at
`src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx:91-102`.
Preserve the existing Supabase delete + `refresh()` + `router.refresh()`
chain.

**Verification gate:**
- `grep -c "confirm(" src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx` → 0
- `grep -c "AdminConfirmModal" src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx` → at least 2.

### REQ-55 — ParticipantsManager: replace trainer-delete confirm

**When** an admin clicks delete on a trainer row, **the system shall** open
`<AdminConfirmModal title="Eliminar entrenador" message="¿Estas seguro de eliminar este entrenador? Se eliminara de todas las divisiones." variant="danger" />`
instead of calling `confirm(...)` at
`src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx:228-244`.
Preserve the existing trainer delete + `refreshTrainers()` +
`router.refresh()` chain.

**Verification gate:**
- ParticipantsManager has TWO confirms — verify REQ-55 alone leaves exactly
  ONE remaining (for REQ-56 to clear): `grep -c "confirm(" src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` → 1 after REQ-55, → 0 after REQ-56.
- `grep -c "AdminConfirmModal" src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` → at least 2.

### REQ-56 — ParticipantsManager: replace remove-from-league confirm

**When** an admin clicks remove on a league participant, **the system shall**
open `<AdminConfirmModal title="Quitar de la división" message="¿Quitar este entrenador de la division?" variant="danger" />` instead of calling
`confirm(...)` at
`src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx:288-303`.

**Design note:** Two `AdminConfirmModal` instances in the same Manager require
two `useState` slots (or one tagged-union state). `specs/design.md` §2.5
prescribes the tagged-union pattern to keep the JSX clean — single modal
instance whose props are derived from the current `pendingAction` shape.

**Verification gate:**
- `grep -c "confirm(" src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` → 0 (combined with REQ-55).
- Manual: trainer delete AND remove-from-league each fire a modal with the
  correct message.

### REQ-57 — MatchesManager: replace clear-result confirm

**When** an admin clicks "Limpiar resultado" on a match row, **the system
shall** open `<AdminConfirmModal title="Limpiar resultado" message="¿Limpiar el resultado de este partido?" variant="danger" />` instead of calling
`confirm(...)` at
`src/app/admin/dashboard/matches/_components/MatchesManager.tsx:369-383+`.
Preserve the existing Supabase update + `refreshMatches()` +
`router.refresh()` chain.

### REQ-58 — MatchesManager: replace delete-match confirm

**When** an admin clicks delete on a match row, **the system shall** open
`<AdminConfirmModal title="Eliminar partido" message="¿Eliminar este partido?" variant="danger" />` instead of calling `confirm(...)` at
`src/app/admin/dashboard/matches/_components/MatchesManager.tsx:480-491+`.
Preserve the existing Supabase delete + `refreshMatches()` +
`router.refresh()` chain.

**Combined verification gate for REQ-57 + REQ-58:**
- `grep -c "confirm(" src/app/admin/dashboard/matches/_components/MatchesManager.tsx` → 0.
- `grep -c "AdminConfirmModal" src/app/admin/dashboard/matches/_components/MatchesManager.tsx` → at least 2.
- Same tagged-union pattern as REQ-55+REQ-56 (one modal instance, multiple
  pending-action types) — see `specs/design.md` §2.5.

---

## Wave D — Docs (REQ-59)

### REQ-59 — Remove stale `fetchData.ts` callout from `docs/conventions.md`

**When** the implementer runs Wave D, **the system shall** delete (or rewrite)
lines 24-27 of `docs/conventions.md`:

```
> ⚠️ The dual-cache layer in `src/lib/data/fetchData.ts` (`unstable_cache` +
> `react.cache`, tag `['matches']` that is never revalidated) is **legacy** and slated
> for removal in F4. Do not copy it. New caching should use `'use cache'` + `cacheTag`
> + `revalidateTag` (see `vercel:next-cache-components`).
```

**Rationale:** F4 deleted `src/lib/data/fetchData.ts` (2026-05-31, per
`progress/history.md` "F4 closed" entry + `features.json` F4
`[DONE 2026-05-31] Delete src/lib/data/fetchData.ts (REQ-30)`). The warning
points to a file that no longer exists. The replacement guidance ("use
`'use cache'` + `cacheTag` + `revalidateTag`") is correct but redundant — F4
added a full "Cache tag taxonomy" section to the same document
(REQ-41 in F4) that already documents the modern pattern with the 8-tag taxonomy.

**Recommended action:** **delete** lines 24-27 entirely (including the blank
line preceding them if it leaves a double blank). The "Cache tag taxonomy"
section added by F4 is the canonical reference now.

**Adjacent stale copy audit (also in scope):**
- Lines 37-40 of `docs/conventions.md` reference
  `src/lib/types/queries.types.ts` as "slated for deletion (F2)". F2 already
  deleted that file (verified: `test ! -f src/lib/types/queries.types.ts`).
  Update or remove these lines per implementer judgment — the surrounding
  paragraph still has educational value ("Do not redefine a query's return
  shape locally") so a partial rewrite that drops the F2-specific sentence
  while keeping the principle is preferred over full deletion.
- Lines 57-58 reference `lib/services/` as "a misnomer being corrected in F4".
  F4 moved `matchService.ts` → `lib/utils/matches.ts` but `lib/services/bracketService.ts` still exists. The misnomer is now half-corrected.
  Update the parenthetical to reflect current state — e.g. drop the "being
  corrected in F4" forecast (it's no longer in flight).

The audit items are part of REQ-59's scope but the priority is the lines
24-27 stale warning. Implementer may roll up all three doc edits into one
diff or split for clarity.

**Verification gate:**
- `grep -c "fetchData.ts" docs/conventions.md` → 0 (or only inside a code
  comment marker the implementer chose to leave; the warning paragraph MUST
  be gone).
- `grep -c "queries.types.ts" docs/conventions.md` → 0 (the deleted file
  name should not appear in current guidance).
- Manual scan: no doc copy references files that no longer exist.

---

## Out of scope (deferred — pointers, not work)

- **5 Managers' Server Actions migration** → F6b (`features.json` F6 item 2).
  REQ-52 / REQ-53 / REQ-54 / REQ-55 / REQ-56 / REQ-57 / REQ-58 explicitly
  preserve the existing `supabase.from().delete()` + `router.refresh()` calls.
  Only the confirm gate moves. Do NOT migrate any Manager to Server Actions
  in F6a.
- **MatchesManager dual-cascade hook adoption** → F6c (deferred in F3,
  re-deferred in F6 audit). Out of F6a.
- **`AdminShellSkeleton` variant** → F6c.
- **Custom `cacheLife` profiles** → F6c.
- **Optional `AboutCalmind` / `TournamentFormat` retention.** REQ-47 deletes
  them as part of the home/ subtree sweep; the user named only `CurrentSeason`
  and `Hero` explicitly. Implementer can scope down to only those two and
  leave the other two if user prefers a narrower delete — see REQ-47
  rationale.
