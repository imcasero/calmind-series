# Design — F3 (Fase 3 — Abstracciones admin)

> Companion to `specs/requirements.md` (REQ-26..REQ-29). F3 is mostly structural:
> one new shared hook, several new Zod input schemas, one pilot Server Actions
> file + one Manager refactor. No new dependencies.

## Scope reconciliation summary

- **Item 1 (modal/error primitives) DROPPED** — 100% adopted post-FR12. See
  `specs/requirements.md` "Scope reconciliation" for evidence.
- **Item 2 (`useLeagueSelector` hook)** — NEW `src/lib/hooks/useLeagueSelector.ts`.
- **Item 3 (Zod in admin forms)** — NEW `*InputSchema` exports in
  `src/lib/types/schemas.ts`; thin `safeParse` boundary at each form handler.
- **Item 4 (`SeasonsManager` pilot)** — NEW `_actions.ts` colocated with route;
  Manager rewritten to consume Server Actions + `useOptimistic`.

## Files to touch

### Create

| Path | Purpose |
|---|---|
| `src/lib/hooks/useLeagueSelector.ts` | REQ-26 — shared cascade hook. New `src/lib/hooks/` directory (no precedent — `src/hooks/useOptimizedFetch.ts` was deleted in F2; `lib/hooks/` matches the existing `lib/utils/`, `lib/queries/`, `lib/services/` layout and the import alias `@/lib/*`). |
| `src/app/admin/dashboard/seasons/_actions.ts` | REQ-28 — colocated Server Actions for the Seasons pilot. Underscore prefix follows the existing `_components/` convention so Next does not treat it as a route. |

### Edit

| Path | Why | Notes |
|---|---|---|
| `src/lib/types/schemas.ts` | REQ-27 — add `*InputSchema` exports (Season/Split/League/Trainer/MatchPlanning/MatchResult) | Existing file already exports the row schemas these derive from (`SeasonSchema`, `SplitSchema`, `LeagueSchema`, `TrainerSchema`, `MatchSchema` at lines 5–52). Use `.pick({...})` then `.extend` to add bounds. |
| `src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` | REQ-27 + REQ-28 | Remove `createClient` from `@/lib/supabase/client`; remove all `supabase.from(...)` calls; wrap `initialSeasons` in `useOptimistic`; route handlers through Server Actions inside `startTransition`; validate inputs with `SeasonCreateInputSchema`. |
| `src/app/admin/dashboard/splits/_components/SplitsManager.tsx` | REQ-26 + REQ-27 | Adopt `useLeagueSelector({depth:'season-split'})`; remove local `splits` cascade state (lines 27, 37–66, 68–81); validate create form with `SplitCreateInputSchema`. Browser `supabase.from(...)` mutations remain (not part of the F3 pilot). |
| `src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx` | REQ-26 + REQ-27 | Adopt `useLeagueSelector({depth:'season-split-league'})`; remove cascade state (lines 28–32, 44–108, 110–123); validate with `LeagueCreateInputSchema`. |
| `src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx` | REQ-26 + REQ-27 | Adopt `useLeagueSelector({depth:'season-split-league'})` for the assignment cascade; validate trainer create/edit with `TrainerInputSchema`. The Manager has additional pagination/search state — leave untouched. |
| `src/app/admin/dashboard/matches/_components/MatchesManager.tsx` | REQ-27 (Zod), REQ-26 OPTIONAL | Validate match create/edit with `MatchPlanningInputSchema`; validate result edit with `MatchResultInputSchema`. Hook adoption is OPTIONAL (see REQ-26 scope note); if the dual-cascade (planning vs results) complicates the contract, document the deferral in `progress/history.md` and leave inline state. |
| `src/app/admin/dashboard/normativa/_components/RegulationsManager.tsx` | REQ-27 (file validation) | Replace inline `selectedFile.type !== 'application/pdf'` + size check at lines 32–48 with `RegulationsUploadSchema.safeParse(selectedFile)` OR keep inline as a `z.instanceof(File).refine(...)` per implementer call. |

### Do NOT touch

- `src/components/admin/ui/*` — primitives are stable post-FR12.
- `src/lib/queries/admin.queries.ts` — F3 does not add new server-side queries.
  The new Server Actions in `seasons/_actions.ts` issue Supabase calls directly
  (write surface, not read).
- `src/lib/supabase/{server,client}.ts` — no client changes (the `session: false`
  variant added in F5 stays untouched; admin actions use the default cookie-aware
  variant for RLS/auth).
- The 5 non-pilot Managers' write paths (Splits/Divisions/Regulations/
  Participants/Matches `handleCreate`/`handleDelete`/etc.). Those migrate in F6.

## Design decisions (locked)

### D1 — Hook lives at `src/lib/hooks/useLeagueSelector.ts`

**Decision:** new directory `src/lib/hooks/`, not `src/hooks/`.

**Rationale:**
- `src/hooks/` was deleted in F2 (the orphan `useOptimizedFetch.ts` cleanup).
  Reintroducing it as the canonical hooks location would resurrect a half-empty
  top-level directory.
- `@/lib/*` is the established alias for shared library code (`@/lib/queries`,
  `@/lib/utils`, `@/lib/services`, `@/lib/types`, `@/lib/config`,
  `@/lib/supabase`, `@/lib/constants`). A hook lives in `lib`.
- Future hooks (the F6 confirmation modal hook, for example) slot into the same
  directory.

### D2 — Server Actions colocated under the route, not centralized

**Decision:** `src/app/admin/dashboard/seasons/_actions.ts`, not
`src/lib/actions/seasons.actions.ts`.

**Rationale:**
- Colocation matches the existing `_components/` convention (each route folder
  owns its UI files).
- The actions are write-surface for one route; sharing across routes is not a
  current need (and would re-introduce the kind of god-module the F2 cleanup
  removed).
- F6 will follow the same pattern (`splits/_actions.ts`, `divisions/_actions.ts`,
  etc.), keeping the rollout mechanically uniform.

### D3 — `revalidatePath` now, not `revalidateTag`

**Decision:** Server Actions call `revalidatePath('/admin/dashboard/seasons')`,
not `revalidateTag('seasons')`.

**Rationale:**
- `cacheTag` is introduced in F4 (`features.json` F4 items 1–2). Adopting it in
  F3 would either (a) require speccing the tag taxonomy now (F4's job), or
  (b) wire a tag the queries do not yet emit.
- `revalidatePath` is the path-based v16 idiom that works without tags and
  survives the F4 migration unchanged — F4 can switch the call to
  `revalidateTag` without altering the action's shape.
- Verify against `vercel:nextjs` / `vercel:next-cache-components` that
  `revalidatePath` from `next/cache` is the correct v16.1.1 entrypoint (not the
  deprecated `unstable_revalidatePath`). The implementer should confirm at
  import time; if the import has been renamed in 16.1.1 patch releases, follow
  the live docs and update this design note in `progress/history.md`.

### D4 — `useOptimistic` reducer shape (single reducer, tagged variants)

**Decision:** the Manager declares one `useOptimistic` reducer with a tagged-union
action argument, not 4 separate `useOptimistic` instances.

```ts
type OptimisticAction =
  | { type: 'create'; season: Season }   // tempId until server replies
  | { type: 'delete'; id: string }
  | { type: 'activate'; id: string }     // sets is_active:true, others:false
  | { type: 'deactivate'; id: string };

const [optimisticSeasons, applyOptimistic] = useOptimistic(
  initialSeasons,
  (state: Season[], action: OptimisticAction): Season[] => { /* switch on type */ }
);
```

**Rationale:**
- Single source of optimistic truth → no cross-state desync (the activate flow
  mutates 2 rows).
- The reducer is pure → trivially testable when a test runner lands.
- Matches the React 19 canonical pattern for multi-mutation lists
  (see `vercel:nextjs` Server Actions + `useOptimistic` guide).

### D5 — Action return shape: discriminated union, not throw

**Decision:** every action returns
`Promise<{ ok: true } | { ok: false; error: string }>`, never throws.

**Rationale:**
- Mirrors the queries convention (`docs/conventions.md` "Error handling: queries
  never throw to the UI"). A different contract on the write side would force
  the Manager to mix `try/catch` (writes) and result-checking (reads).
- The Manager checks `result.ok` after `await action(...)`; on failure it sets
  the error banner. No `try/catch` needed in the client.
- `useOptimistic` reconciliation happens regardless of `result.ok` via
  `revalidatePath` on success (which re-pushes server-rendered
  `initialSeasons`) or by leaving the optimistic state stale until the next
  manual refresh on failure. The Manager surfaces the error via
  `AdminErrorBanner`.

### D6 — Zod input schemas live in `src/lib/types/schemas.ts`

**Decision:** add `*InputSchema` exports next to the existing row schemas, not in
a new file.

**Rationale:**
- `schemas.ts` is the documented "single source of truth" per `CLAUDE.md`.
  Splitting input vs row schemas across files would break that guarantee.
- The input schemas reuse `.pick({...})` from the row schemas → physical
  proximity prevents drift.
- Naming convention: `<Entity>CreateInputSchema` (or `<Entity>InputSchema` when
  it covers both create and edit). Mirrors the existing `<Entity>Schema` and
  `<Entity>WithXSchema` naming.

### D7 — Hook owns its own Supabase client; queries-style centralization deferred

**Decision:** `useLeagueSelector` calls `createClient()` from
`@/lib/supabase/client` inside the hook, not through a centralized
`adminClientQueries.ts` module.

**Rationale:**
- Client-side reads in admin Managers are currently inline (see the 3 cascade
  Managers). Introducing a `lib/client-queries/` layer is a separate refactor
  that would touch the 5 non-pilot Managers — out of F3 scope.
- The hook encapsulates the 2 cascade queries it owns; F6 can centralize
  later if a clear duplication emerges.

## Framework gotchas

- **Next 16.1.1 — `revalidatePath`.** Import from `next/cache`, NOT
  `next/navigation` or the old `unstable_*` path. Verify against
  `vercel:nextjs` if the import path has shifted in the patch release stream.
- **Next 16.1.1 — Server Actions.** Top-of-file `'use server';` is the v16
  idiom for marking a whole module as actions. Inline `'use server';` directives
  inside individual functions are also valid; the spec uses module-level for
  clarity.
- **React 19.2.3 — `useOptimistic`.** Requires the calling component to be a
  Client Component (`'use client'`). The action invocation MUST be wrapped in
  `startTransition` (from React) or use the form-action prop on a `<form>`. The
  spec assumes the Manager stays a Client Component (see REQ-28 §5).
- **Supabase v2 — server client + RLS.** Server Actions use
  `createClient()` from `@/lib/supabase/server` (cookie-aware). RLS policies
  applied to the `seasons` table (if any) will execute under the admin's
  authenticated identity propagated by `proxy.ts`. If a write fails due to RLS,
  the action surfaces `{ ok: false; error: <postgrest message> }` and the
  Manager shows it — no silent swallowing.
- **`useOptimistic` + `revalidatePath` ordering.** The implementer must call
  `applyOptimistic` SYNCHRONOUSLY inside the `startTransition`, then `await
  action(...)`. React reconciles the optimistic state with the new
  `initialSeasons` prop pushed down by the revalidation. If the action throws
  (it should not, per D5), the optimistic state is discarded automatically.

## Sequencing

1. **REQ-27 first** (additive: schemas + safeParse calls; lowest blast radius).
2. **REQ-26 second** (hook lands, then 3 Managers migrate one at a time; each
   migration is independently green-able).
3. **REQ-28 last** (pilot consumes REQ-27 schemas; if REQ-27 slipped, the pilot
   uses inline validation and F6 retrofits).
4. **REQ-29 throughout** — `./init.sh` MUST be green after each REQ lands; no
   batching all 3 then verifying. Reviewer rejects if the implementer batched
   and the intermediate states cannot be reproduced.

## Verification (cross-cutting, gates REQ-29)

The implementer ships only after a full green `./init.sh` (not `--quick`).
Reviewer re-runs independently. See REQ-29 for the exact gate; see `tasks.md`
§final for the implementer's pre-handoff checklist.
