# Requirements — F3 (Fase 3 — Abstracciones admin)

> Source: `ARCHITECTURE_REVIEW.html §F3`, `features.json` F3 entry +
> `pre_spec_findings`, `progress/history.md` 2026-05-30 "F3 opened".
> Format: EARS (When/While/If [condition], the system shall [action]).
> Each REQ has an explicit **Verification Gate** because no test runner is wired.

## Scope reconciliation (spec-author audit, 2026-05-30)

The 4 items in `features.json` F3 were authored before FR12–FR14 shipped the admin
pixel reskin. After reading the live code, the spec-author reconciles:

- **F3 Item 1 — Extract `<AdminModal>` and `<AdminErrorBanner>`.** **DROPPED.**
  Adoption audit shows 100% coverage already:
  - `AdminModal.tsx` and `AdminErrorBanner.tsx` exist at
    `src/components/admin/ui/{AdminModal,AdminErrorBanner}.tsx`, exported from
    `src/components/admin/ui/index.ts`.
  - All 6 Managers import them from `@/components/admin/ui`:
    `SeasonsManager.tsx:5-11`, `SplitsManager.tsx:5-11`,
    `DivisionsManager.tsx:5-10`, `RegulationsManager.tsx:5-9` (modal not used —
    upload flow has no dialog), `ParticipantsManager.tsx:5-14`,
    `MatchesManager.tsx:5-13`.
  - Zero inline `<dialog>` elements or `role="dialog"` JSX in
    `src/app/admin/` (`grep -rn '<dialog\|role="dialog"' src/app/admin/` returns
    empty).
  - Zero ad-hoc error banner JSX duplication: every Manager that surfaces errors
    routes them through `<AdminErrorBanner message={error} onDismiss={...} />`.
  - `RegulationsManager.tsx:115-128` still hand-rolls a **success** banner (not an
    error). That is OUT OF SCOPE for F3 Item 1 (the brief targets modal + error
    primitives, not success). Logged as an opportunistic future micro-batch (see
    "Out of scope" below).
- **F3 Item 2 — `useLeagueSelector()` hook.** KEPT. Confirmed cascade duplication
  in 3 Managers: `SplitsManager` (Season→Split, no League), `DivisionsManager`
  (Season→Split→League), `ParticipantsManager` (Season→Split→League),
  `MatchesManager` (Season→Split→League, with planning vs results modes — special
  case). `SeasonsManager` and `RegulationsManager` do not need the hook.
- **F3 Item 3 — Wire Zod validation into admin forms.** KEPT. Verified zero
  matches for `from '@/lib/types/schemas'` under `src/app/admin/` today.
- **F3 Item 4 — `SeasonsManager` → Server Actions + `useOptimistic` (PILOT).**
  KEPT. Confirmed pilot target still on `useState` + browser `createClient()` +
  `try/catch` + `router.refresh()` (`SeasonsManager.tsx:31-102`). Sets the
  pattern that F6 will roll out to the remaining 5 Managers.

## Requirements

### REQ-26 — `useLeagueSelector` hook (Season → Split → League cascade)

**When** an admin page renders a Manager that selects a League by drilling through
Season → Split → League, **the system shall** expose the cascade state and data
loading via a single hook `useLeagueSelector`, so the consuming Managers
(`SplitsManager`, `DivisionsManager`, `ParticipantsManager`) consume identical
behavior instead of duplicating ~80 LOC of `useState` + `useEffect` + fetch each.

The hook's contract MUST be:

```ts
// src/lib/hooks/useLeagueSelector.ts
'use client';

import type { League, Season, Split } from '@/lib/types/database.types';

export interface UseLeagueSelectorOptions {
  /** Required: the full Season[] (loaded server-side by the parent page). */
  initialSeasons: Season[];
  /** When 'season-split': stops at split. When 'season-split-league': cascades to league. */
  depth?: 'season-split' | 'season-split-league';
  /** Optional initial selection (used by MatchesManager which seeds from `activeSplitInfo`). */
  initialSeasonId?: string | null;
  initialSplitId?: string | null;
  initialLeagueId?: string | null;
}

export interface UseLeagueSelectorResult {
  seasons: Season[];
  splits: Split[];
  leagues: League[];
  selectedSeasonId: string | null;
  selectedSplitId: string | null;
  selectedLeagueId: string | null;
  setSeasonId: (id: string | null) => void;
  setSplitId: (id: string | null) => void;
  setLeagueId: (id: string | null) => void;
  loadingSplits: boolean;
  loadingLeagues: boolean;
  error: string | null;
  clearError: () => void;
  /** Re-fetch splits/leagues at the current selection (used after mutations). */
  refresh: () => Promise<void>;
}
```

Semantics (extracted from the 3 Managers' shared behavior):
- Default `selectedSeasonId`: the active season, else the first season, else `null`
  (matches `SplitsManager.tsx:21-26`, `DivisionsManager.tsx:22-27`,
  `ParticipantsManager.tsx:66-71`).
- When `selectedSeasonId` changes, fetch splits for that season ordered by
  `split_order ASC`; auto-select active split (else first) when
  `depth === 'season-split-league'` (matches `DivisionsManager.tsx:51-77`).
- When `selectedSplitId` changes (and `depth === 'season-split-league'`), fetch
  leagues ordered by `tier_priority ASC`. Do not auto-select a league (matches
  `DivisionsManager.tsx:80-108` and `ParticipantsManager`).
- Errors are caught and stored in `error`; queries log `[useLeagueSelector] Error:`
  per convention but never throw to the consumer.
- The hook MUST use `@/lib/supabase/client` (it runs in the browser).

**Scope note on `MatchesManager`:** the Manager runs TWO independent cascades
(planning vs results) and seeds initial state from `activeSplitInfo`. For F3,
`MatchesManager` MAY adopt the hook for its **planning** tab only (the simpler
case), or remain on inline state. The implementer decides at runtime — if the
results tab's auto-select-from-active-split logic complicates the hook contract,
adoption is deferred to F6. Document the decision in `progress/history.md`.

**Verification Gate:**
1. `./init.sh` passes green (typecheck + lint + build).
2. `rg "from '@/lib/hooks/useLeagueSelector'" src/` returns at least 3 hits
   (`SplitsManager`, `DivisionsManager`, `ParticipantsManager`).
3. After the migration, each consuming Manager loses its local
   `useState<Split[]>([])`, `useState<League[]>([])`, and the matching
   `useEffect` cascade. Diff metric: net LOC reduction across the 3 Managers
   greater than or equal to 80 lines (rough estimate based on current cascades).

> Sequencing: REQ-26 may land before or after REQ-27 (Zod). It MUST land before
> REQ-28 (pilot) ONLY if the pilot also touches the selector — it does not, since
> `SeasonsManager` has no League cascade. They are independent.

---

### REQ-27 — Zod validation in admin forms

**When** an admin form submits user-provided fields (`name`, `year`,
`split_order`, `tier_name`, `tier_priority`, `nickname`, `avatar_url`, `bio`,
`home_sets`, `away_sets`, `home_trainer_id`, `away_trainer_id`, `round`,
`match_group`, `match_tag`), **the system shall** validate the payload with a
Zod schema derived from `src/lib/types/schemas.ts` BEFORE the mutation is issued
to Supabase, so invalid input surfaces as a user-visible error and never reaches
the database round-trip.

Mapping (Manager → form fields → schema source). Schemas marked NEW must be added
to `src/lib/types/schemas.ts` as `*InputSchema` (input schemas, not row schemas):

| Manager | Form | Source schema | Action |
|---|---|---|---|
| `SeasonsManager` create | `{name, year}` | `SeasonSchema.pick({name:true, year:true})` derived as `SeasonCreateInputSchema` | NEW (`name` `min(1)`; `year` `int().min(2000)`) |
| `SplitsManager` create | `{name, split_order}` | `SplitSchema.pick({name:true, split_order:true})` derived as `SplitCreateInputSchema` | NEW (`split_order` `int().min(1)`) |
| `DivisionsManager` create | `{tier_name, tier_priority}` | `LeagueSchema.pick({tier_name:true, tier_priority:true})` derived as `LeagueCreateInputSchema` | NEW (`tier_priority` `int().min(1)`) |
| `ParticipantsManager` create/edit trainer | `{nickname, avatar_url, bio}` | `TrainerSchema.pick({nickname:true, avatar_url:true, bio:true})` derived as `TrainerInputSchema` | NEW (`nickname` `min(1)`; `avatar_url` accepts `''` → `null` via preprocess; `bio` accepts `''` → `null`) |
| `MatchesManager` create/edit match | `{home_trainer_id, away_trainer_id, round, match_group, match_tag}` | Subset of `MatchSchema` derived as `MatchPlanningInputSchema` | NEW (`round` `int().min(1).max(16)`; trainer ids `uuid()`; refine `home !== away`) |
| `MatchesManager` result edit | `{home_sets, away_sets}` | Derived as `MatchResultInputSchema` | NEW (`int().min(0).max(3)`) |
| `RegulationsManager` upload | file (PDF, 50MB) | Inline `z.instanceof(File).refine(...)` (not a row schema) | LOCAL inline OR NEW `RegulationsUploadSchema` (implementer choice) |

Validation pattern at the call site (all Managers):

```ts
const parsed = SeasonCreateInputSchema.safeParse({ name: newSeason.name, year: newSeason.year });
if (!parsed.success) {
  setError(parsed.error.issues.map(i => i.message).join(' · '));
  setSaving(false);
  return;
}
// then use parsed.data instead of the raw state
```

This requirement DOES NOT migrate the Managers to React Hook Form / a form library
— it adds a thin validation boundary before each Supabase call. Wholesale form
library adoption is OUT OF SCOPE (push to F6 if desired).

**Verification Gate:**
1. `./init.sh` green.
2. `rg "from '@/lib/types/schemas'" src/app/admin/` returns at least 5 matches
   (one per Manager that has a form: Seasons, Splits, Divisions, Participants,
   Matches; Regulations counted if `RegulationsUploadSchema` is adopted).
3. Manual: submit `SeasonsManager` "New Season" with empty `name` → error banner
   shows a Zod message; database does not receive the insert (verifiable via
   network panel: no `POST /rest/v1/seasons`).
4. `src/lib/types/schemas.ts` exports the NEW schemas listed above
   (`rg "export const (Season|Split|League|TrainerInput|MatchPlanning|MatchResult).*Schema" src/lib/types/schemas.ts` returns the full set).

> Sequencing: REQ-27 is independent of REQ-26 and REQ-28. Can land first.

---

### REQ-28 — `SeasonsManager` migrated to Server Actions + `useOptimistic` (PILOT)

**When** an admin invokes a CRUD operation on a season (create, delete, activate,
deactivate) via `SeasonsManager`, **the system shall** route the mutation through
a Server Action (not a browser-side `supabase.from(...).insert/update/delete`),
and the UI shall reflect the change optimistically via `React.useOptimistic`
BEFORE the server round-trip resolves, so the admin sees instant feedback while
the database write happens server-side with auth enforced server-side.

Constraints (the PILOT pattern that F6 will replicate):

1. **Server Actions file:** Create `src/app/admin/dashboard/seasons/_actions.ts`
   (colocated with the route, leading underscore matches the `_components/`
   convention). File starts with `'use server';` directive at the top. Each
   action uses `createClient()` from `@/lib/supabase/server`. Decision rationale:
   colocation > a global `src/lib/actions/` because each Manager owns its own
   write surface; F6 will follow the same colocation pattern.
2. **Action surface:**
   ```ts
   // src/app/admin/dashboard/seasons/_actions.ts
   'use server';
   export async function createSeasonAction(input: { name: string; year: number }): Promise<{ ok: true } | { ok: false; error: string }>;
   export async function deleteSeasonAction(id: string): Promise<{ ok: true } | { ok: false; error: string }>;
   export async function activateSeasonAction(id: string): Promise<{ ok: true } | { ok: false; error: string }>;
   export async function deactivateSeasonAction(id: string): Promise<{ ok: true } | { ok: false; error: string }>;
   ```
   Each action returns a discriminated union — actions NEVER throw to the client
   (matches the queries convention in `docs/conventions.md`). Each action
   validates input with the REQ-27 schemas before hitting Supabase.
3. **Revalidation:** After a successful mutation, each action calls
   `revalidatePath('/admin/dashboard/seasons')` (from `next/cache`). NOTE: F4
   will introduce `'use cache'` + `cacheTag` + `revalidateTag` — F3 uses
   `revalidatePath` deliberately (no cache tags exist yet for the admin route;
   `revalidatePath` is the v16 idiom that works without them and survives the F4
   migration unchanged, since F4 owns adding cacheTag and is not retroactive to
   admin routes per `features.json` F4 scope).
4. **`useOptimistic` integration:** The Manager wraps `initialSeasons` in
   `useOptimistic` and exposes an `addOptimisticSeason` reducer that handles all
   4 mutation types (create / delete / activate / deactivate) as separate action
   variants. The reducer must apply the optimistic state synchronously; the
   `startTransition` async wrapper calls the Server Action; `revalidatePath`
   reconciles by pushing the new server-rendered `initialSeasons` down.
5. **`SeasonsManager` MUST remain a Client Component** (the form state, modal
   visibility, and `useOptimistic` all need the browser). Only the data
   mutations move server-side.
6. **Removed code:** After migration, `SeasonsManager.tsx` MUST NOT import
   `@/lib/supabase/client` and MUST NOT contain any `await supabase.from(...)`
   calls. The 4 handlers (`handleCreate`, `handleDelete`, `handleActivate`,
   `handleDeactivate` at lines 33–102) MUST be rewritten to call the actions
   inside `startTransition`.
7. **Auth:** `proxy.ts` already gates `/admin/*` (per `docs/conventions.md`). No
   per-action auth re-check is required for F3 — the proxy plus Supabase RLS on
   the server client are the existing guarantees. If a per-action `auth.getUser()`
   check is desired, it is a F6 hardening item, not F3.

**Verification Gate:**
1. `./init.sh` green.
2. `grep -c "'use server'" src/app/admin/dashboard/seasons/_actions.ts` returns 1.
3. `rg "from '@/lib/supabase/client'" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` returns 0.
4. `rg "useOptimistic" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` returns at least 1.
5. `rg "supabase.from\(" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` returns 0.
6. Manual: in `pnpm dev`, create a new season — the row appears in the table
   BEFORE the network response (optimistic). Refresh page → row persists.
7. Manual: cause an error (block the network in DevTools or violate a constraint)
   → `AdminErrorBanner` shows the action's `{ ok: false; error }` payload;
   optimistic state reconciles when `revalidatePath` re-pushes the canonical list.

> Sequencing: REQ-28 SHOULD land AFTER REQ-27 so the pilot demonstrates the
> Zod-validated action pattern from day one. If REQ-27 slips, REQ-28 can land
> first with inline validation, but the F6 rollout will then have to backport
> Zod.

---

### REQ-29 — Verification gate (cross-cutting)

**When** the implementer signals "ready for review", **the system shall** have
passed a full `./init.sh` invocation (not `--quick`) on the implementer's
machine with: typecheck clean, lint 0 errors (warnings allowed only for the 2
known F4-owned `noUnusedImports` in `fetchData.ts:5` and `matchService.ts:5`),
build succeeds with no new dynamic-route count regression vs F5 baseline (23
pages).

**Verification Gate:**
1. Implementer pastes the tail of `./init.sh` output into
   `progress/history.md` under the F3 implementer entry, showing the green
   checkmarks and the F4-owned warning count.
2. Reviewer re-runs `./init.sh` independently and confirms the same output before
   approving.
3. If `pnpm lint` surfaces new warnings introduced by F3, they MUST be fixed
   (not deferred) — F3 owns the new hook + new schemas + new actions file.

---

## Out of scope (deferred / pointers)

- **F3 Item 1 (AdminModal/AdminErrorBanner extraction).** DROPPED — already
  shipped in FR12 and 100% adopted (see "Scope reconciliation" above).
- **Success banner in `RegulationsManager.tsx:115-128`.** Hand-rolled JSX, not
  duplicated elsewhere. Future micro-batch can promote to `AdminSuccessBanner`
  alongside `AdminErrorBanner`. NOT F3.
- **`window.confirm()` replacement** (used in `SeasonsManager.tsx:53`,
  `SplitsManager.tsx:110`, `DivisionsManager.tsx:150`, plus delete handlers in
  the 2 big Managers). Owned by F6 (`features.json` F6: "Reusable confirmation
  modal to replace window.confirm()"). DO NOT touch in F3.
- **Server Actions migration for the 5 remaining Managers** (Splits, Divisions,
  Regulations, Participants, Matches). Owned by F6 ("Migrate remaining managers
  to Server Actions"). F3 is the PILOT only.
- **`cacheTag` / `revalidateTag` adoption** in the new `_actions.ts` file.
  Owned by F4 (`features.json` F4: "Migrate queries to 'use cache' + cacheTag;
  Call revalidateTag('matches') from the Server Action that updates results").
  F3 uses `revalidatePath` deliberately.
- **React Hook Form / Formik adoption.** Not in `features.json` anywhere. If
  desired, propose a new F-id.
- **Per-action `auth.getUser()` re-checks.** F6 hardening (see REQ-28 §7).
- **Atomic activate-season RPC** (REQ-3 deferred in F0). Out of scope: REQ-28
  keeps the 2-step deactivate-all-then-activate-one flow; moving to an RPC is a
  separate Supabase migration. Document in `progress/history.md` if the F3
  pilot makes the non-atomic flow more painful to live with.
