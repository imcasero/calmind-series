# Tasks — Batch F3: Abstracciones admin

Atomic checklist for the Implementer. Do **not** start until `./init.sh` is green
and this spec is approved. Check items off as they land; log decisions in
`progress/history.md`.

> Companions: `specs/requirements.md` (REQ-26..REQ-29) and `specs/design.md`.
> Sequencing locked: REQ-27 → REQ-26 → REQ-28. `./init.sh` MUST be green between
> each REQ — no batching the three then verifying once at the end.

---

## 0. Baseline (before touching anything)

- [ ] Run `./init.sh` (full, not `--quick`) on a clean working tree.
- [ ] Confirm baseline is GREEN: typecheck clean · lint 0 errors / 2 warnings
      (the two F4-owned `noUnusedImports` in `fetchData.ts:5` and
      `matchService.ts:5`) · build 23 pages.
- [ ] If baseline is RED for any other reason, STOP and report to leader. Do
      not begin F3 on a red baseline.

---

## 1. REQ-27 — Zod input schemas (lowest blast radius, lands first)

### 1a. Extend `src/lib/types/schemas.ts`

- [ ] Add `SeasonCreateInputSchema = SeasonSchema.pick({ name: true, year: true }).extend({ name: z.string().min(1), year: z.number().int().min(2000) })`.
- [ ] Add `SplitCreateInputSchema = SplitSchema.pick({ name: true, split_order: true }).extend({ name: z.string().min(1), split_order: z.number().int().min(1) })`.
- [ ] Add `LeagueCreateInputSchema = LeagueSchema.pick({ tier_name: true, tier_priority: true }).extend({ tier_name: z.string().min(1), tier_priority: z.number().int().min(1) })`.
- [ ] Add `TrainerInputSchema` from `TrainerSchema.pick({ nickname: true, avatar_url: true, bio: true })` with `nickname.min(1)` and `''` → `null` preprocess on `avatar_url` + `bio`.
- [ ] Add `MatchPlanningInputSchema` covering `home_trainer_id`, `away_trainer_id` (both `z.string().uuid()`), `round` (`z.number().int().min(1).max(16)`), `match_group` (`z.string().min(1)`), `match_tag` (`z.string().min(1)`). Add `.refine((d) => d.home_trainer_id !== d.away_trainer_id, 'Trainers must differ')`.
- [ ] Add `MatchResultInputSchema` with `home_sets` and `away_sets` (`z.number().int().min(0).max(3)`).
- [ ] (Optional) Add `RegulationsUploadSchema = z.instanceof(File).refine(f => f.type === 'application/pdf', 'PDF only').refine(f => f.size <= 50 * 1024 * 1024, 'Max 50MB')`. If skipped, keep inline in `RegulationsManager`.
- [ ] Export inferred types alongside (`export type SeasonCreateInput = z.infer<typeof SeasonCreateInputSchema>`, etc.) — matches existing convention at lines 138–150.

### 1b. Wire `safeParse` boundaries (one Manager at a time)

For each Manager, immediately after the user submits the form and BEFORE the
Supabase call:

- [ ] `SeasonsManager.tsx` `handleCreate` (line 33): `SeasonCreateInputSchema.safeParse({ name: newSeason.name, year: newSeason.year })`. On `!parsed.success` set `error` to a joined message, `setSaving(false)`, return.
- [ ] `SplitsManager.tsx` `handleCreate` (line 83): `SplitCreateInputSchema.safeParse({ name: newSplit.name, split_order: newSplit.split_order })`.
- [ ] `DivisionsManager.tsx` `handleCreate` (line 125): `LeagueCreateInputSchema.safeParse({ tier_name: newLeague.tier_name, tier_priority: newLeague.tier_priority })`.
- [ ] `ParticipantsManager.tsx` `handleSaveTrainer` (line 230 — single handler that branches on `editingTrainer`; validate before both the update branch at line 236 and the insert branch at line 255): validate `{ nickname, avatar_url, bio }` with `TrainerInputSchema`. Skip the assignment handler (no user-typed fields).
- [ ] `MatchesManager.tsx` `handleSaveMatch` (line 414 — single handler that branches on `editingMatch`; validate before both the update at line 422 and the insert at line 441): validate with `MatchPlanningInputSchema`. Result edit `handleSaveResult` (line 333): validate `{ home_sets, away_sets }` with `MatchResultInputSchema`.
- [ ] `RegulationsManager.tsx` `handleFileChange` (line 32): replace the inline `type !== 'application/pdf'` and size guards with `RegulationsUploadSchema.safeParse(selectedFile)` (or keep inline if D6 implementer choice).

### 1c. Verify REQ-27

- [ ] `rg "from '@/lib/types/schemas'" src/app/admin/` returns at least 5 matches.
- [ ] `rg "export const (Season|Split|League|TrainerInput|MatchPlanning|MatchResult).*Schema" src/lib/types/schemas.ts` returns all 6 (or 7 with `RegulationsUploadSchema`).
- [ ] Manual: open `/admin/dashboard/seasons`, click "Nueva Temporada", submit with empty `name` → error banner shows a Zod message; no `POST /rest/v1/seasons` in DevTools network panel.
- [ ] `./init.sh` GREEN.

---

## 2. REQ-26 — `useLeagueSelector` hook

### 2a. Create the hook

- [ ] Create `src/lib/hooks/useLeagueSelector.ts` per the contract in `specs/requirements.md` REQ-26.
- [ ] Implement `'use client'`, `createClient()` from `@/lib/supabase/client`.
- [ ] Default `selectedSeasonId`: active season else first else `null`.
- [ ] `useEffect` on `selectedSeasonId`: fetch splits ordered by `split_order ASC`; auto-select active else first when `depth === 'season-split-league'`; clear leagues.
- [ ] `useEffect` on `selectedSplitId` (only when `depth === 'season-split-league'`): fetch leagues ordered by `tier_priority ASC`; do NOT auto-select a league.
- [ ] `refresh()` method that re-runs the current-level fetch (used by consumers after a mutation).
- [ ] Error handling: console.error `[useLeagueSelector] Error:` + `setError(err.message)`; never throw.

### 2b. Adopt the hook in 3 Managers

- [ ] `SplitsManager.tsx`: import the hook with `depth: 'season-split'`. Remove local `selectedSeasonId`, `splits`, `loadingSplits` state (lines 21–32) and the cascading `useEffect` (lines 37–66) and the `refreshSplits` helper (lines 68–81). The Manager keeps its own write handlers (`handleCreate`/`handleDelete`/`handleActivate`/`handleDeactivate`) — they call `refresh()` from the hook after a successful mutation instead of `refreshSplits()`.
- [ ] `DivisionsManager.tsx`: import with `depth: 'season-split-league'`. Remove local cascade state (lines 22–32, 44–108) and `refreshLeagues` (lines 110–123). Write handlers call `refresh()` after success.
- [ ] `ParticipantsManager.tsx`: import with `depth: 'season-split-league'` for the assignment section only. Leave the trainers tab pagination/search state untouched (those are independent). Replace the assignment cascade `useEffect`s with the hook.
- [ ] (Optional) `MatchesManager.tsx`: per REQ-26 scope note, attempt adoption for the planning tab; if the dual-cascade complicates the contract, leave inline state and document the deferral in `progress/history.md`.

### 2c. Verify REQ-26

- [ ] `rg "from '@/lib/hooks/useLeagueSelector'" src/` returns at least 3 hits (Splits/Divisions/Participants; 4 if Matches adopted).
- [ ] Manual: `/admin/dashboard/splits` — selecting a different season repopulates splits as before; loading state shows briefly.
- [ ] Manual: `/admin/dashboard/divisions` — Season → Split → League cascade behaves identically to pre-migration; the active split auto-selects on season change.
- [ ] Manual: `/admin/dashboard/participants` — assignment cascade unchanged from user perspective.
- [ ] LOC diff metric: net reduction across the 3 Managers ≥ 80 lines.
- [ ] `./init.sh` GREEN.

---

## 3. REQ-28 — `SeasonsManager` pilot (Server Actions + useOptimistic)

### 3a. Create `src/app/admin/dashboard/seasons/_actions.ts`

- [ ] File starts with `'use server';` directive.
- [ ] Import `createClient` from `@/lib/supabase/server`, `revalidatePath` from `next/cache`, the input schemas from `@/lib/types/schemas`.
- [ ] Implement `createSeasonAction(input)`:
  - Validate with `SeasonCreateInputSchema`. On failure return `{ ok: false, error: <joined zod messages> }`.
  - `await supabase.from('seasons').insert({ ...parsed.data, is_active: false })`.
  - On Supabase error return `{ ok: false, error: <message> }` and log `[createSeasonAction] Error:`.
  - On success: `revalidatePath('/admin/dashboard/seasons')` then return `{ ok: true }`.
- [ ] Implement `deleteSeasonAction(id: string)`: validate `id` with `z.string().uuid()`; delete; revalidate.
- [ ] Implement `activateSeasonAction(id: string)`: 2-step (deactivate all `.neq('id', id)` then activate the target). Returns `{ ok: false }` on either failure. NOTE: non-atomic by design — atomic RPC is REQ-3 deferred to a Supabase migration batch.
- [ ] Implement `deactivateSeasonAction(id: string)`: single update.

### 3b. Rewrite `SeasonsManager.tsx`

- [ ] Remove the import of `createClient` from `@/lib/supabase/client`.
- [ ] Remove the `const supabase = createClient();` line (line 31).
- [ ] Add imports: `useOptimistic`, `useTransition` from `react`; action imports from `../_actions`.
- [ ] Wrap `initialSeasons` in `useOptimistic` with a single tagged-union reducer per D4 in `design.md` (`create | delete | activate | deactivate`).
- [ ] Rewrite `handleCreate` (line 33): inside `startTransition` → `applyOptimistic({type:'create', season: tempSeason})` → `await createSeasonAction(parsed.data)` → if `!result.ok` setError + (let revalidation reconcile).
- [ ] Rewrite `handleDelete` (line 52): inside `startTransition` → `applyOptimistic({type:'delete', id})` → `await deleteSeasonAction(id)` → on `!ok` setError.
- [ ] Rewrite `handleActivate` (line 64): inside `startTransition` → `applyOptimistic({type:'activate', id})` → `await activateSeasonAction(id)`.
- [ ] Rewrite `handleDeactivate` (line 91): inside `startTransition` → `applyOptimistic({type:'deactivate', id})` → `await deactivateSeasonAction(id)`.
- [ ] Replace `initialSeasons.map(...)` and `initialSeasons.length` references with the `optimisticSeasons` derived state.
- [ ] Drop the `useRouter` import + `router.refresh()` calls — revalidation now happens server-side via `revalidatePath`.
- [ ] Keep the `window.confirm('¿Estás seguro...')` on delete — `window.confirm` replacement is F6.

### 3c. Verify REQ-28

- [ ] `grep -c "'use server'" src/app/admin/dashboard/seasons/_actions.ts` returns 1.
- [ ] `rg "from '@/lib/supabase/client'" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` returns 0.
- [ ] `rg "supabase.from\(" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` returns 0.
- [ ] `rg "useOptimistic" src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` returns at least 1.
- [ ] Manual create: new row appears BEFORE the network round-trip resolves. Refresh page → row persists.
- [ ] Manual delete: row disappears immediately; refresh persists.
- [ ] Manual activate: badge flips immediately; previously-active season's badge also flips.
- [ ] Manual error: in DevTools, set network to offline, attempt create → `AdminErrorBanner` displays the action's error; once back online + page refresh, state reconciles.
- [ ] `./init.sh` GREEN.

---

## 4. REQ-29 — Final verification gate

- [ ] Full `./init.sh` (not `--quick`).
- [ ] Typecheck clean.
- [ ] Lint: 0 errors. Warnings: only the 2 known F4-owned (`fetchData.ts:5`, `matchService.ts:5`). If F3 introduced new warnings, fix them in place; do NOT defer.
- [ ] Build: 23 pages, same dynamic-route count as F5 baseline.
- [ ] Paste the tail of `./init.sh` output into `progress/history.md` under the F3 implementer entry.
- [ ] Update `features.json` F3 `items` with `[DONE 2026-05-3X]` markers per the same pattern F0/F1/F2/F5 used; do NOT set status to `done` (leader transitions after reviewer sign-off).

---

## Done criteria (handoff to reviewer)

All items above checked. Specifically:

1. `src/lib/hooks/useLeagueSelector.ts` exists and is consumed by at least 3 Managers.
2. `src/lib/types/schemas.ts` exports at least 6 new `*InputSchema` entries.
3. All 5–6 admin Managers with forms import from `@/lib/types/schemas`.
4. `src/app/admin/dashboard/seasons/_actions.ts` exists with `'use server';` and 4 exported actions.
5. `SeasonsManager.tsx` has zero `supabase.from(...)` calls and uses `useOptimistic`.
6. `./init.sh` is green with the documented expected warning count (2).
7. The F3 implementer entry in `progress/history.md` records:
   - Whether `MatchesManager` adopted `useLeagueSelector` or deferred (REQ-26 scope note).
   - Whether `RegulationsUploadSchema` was added or kept inline (D6 choice).
   - The exact `./init.sh` tail.
   - Any framework gotcha that materialized at implementation time (revalidatePath import, useOptimistic + startTransition wiring, etc.).
8. `features.json` F3 `items` annotated with `[DONE]` markers; F3 status STILL
   `spec_ready` (or `in_progress` if the leader flipped it) — reviewer flips to
   `done` after independent green `./init.sh`.

---

## Escalation rules

- If a REQ surfaces a blocker that requires speccing more work, STOP and hand
  back to the leader/spec-author. Do not silently expand scope.
- If `./init.sh` goes RED at any intermediate step, fix or revert — do NOT
  advance to the next REQ on a red baseline.
- If `MatchesManager` adoption of the hook turns out to be a multi-hour rewrite,
  defer to F6 with a one-line note in `progress/history.md` (REQ-26 explicitly
  allows this).
- If a Zod schema you need is already covered by an existing row schema
  (without the input bounds), still add the dedicated `*InputSchema` — the
  bounds (`min`, `max`, `refine`) are the whole point of REQ-27.
