# Design — F6b (Server Actions Migration of 5 Admin Managers)

Companion to `specs/requirements.md`. Implementation-level shape for every REQ
in the batch. Names, props, and file paths are concrete; pasteable code shown
where the existing pattern leaves ambiguity.

## D1. Action file structure (applies to all 4 new files)

One file per dashboard route, sibling to the existing `_components/` folder:

```
src/app/admin/dashboard/divisions/_actions.ts    # new
src/app/admin/dashboard/splits/_actions.ts       # new
src/app/admin/dashboard/normativa/_actions.ts    # new
src/app/admin/dashboard/participants/_actions.ts # new
src/app/admin/dashboard/matches/_actions.ts      # new
src/app/admin/dashboard/seasons/_actions.ts      # already exists (pilot)
```

Each file starts with the pilot's preamble
(`src/app/admin/dashboard/seasons/_actions.ts:1-18`):

```ts
'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
// + the relevant Input schemas from '@/lib/types/schemas'

type ActionResult = { ok: true } | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/<domain>';
const IdSchema = z.string().uuid('ID inválido');

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}
```

Some actions extend the return shape to carry server-assigned values back to
optimistic state. Use a narrower union per action (do NOT bloat the shared
`ActionResult` alias):

```ts
type CreateResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
```

## D2. Return-shape contract

| Pattern | Use case | Example |
|---|---|---|
| `{ ok: true } \| { ok: false; error: string }` | mutations whose only success signal is "completed" | delete, activate, deactivate, save-result, clear-result |
| `{ ok: true; id: string } \| { ok: false; error: string }` | inserts where the optimistic reducer needs to reconcile a temp id with the real one | createLeague, createSplit, createTrainer, assignParticipant, createMatch |
| `{ ok: true; createdCount: number } \| { ok: false; error: string }` | bulk inserts where the consumer needs to display a "Generaste N partidos" affirmation | generateJ15, generateJ16 |
| `{ ok: true; url: string } \| { ok: false; error: string }` | RegulationsManager upload returns the new public URL | uploadRegulationsAction |
| `{ ok: true } \| { ok: false; error: string; failedCount: number }` | bulk write where the UX shows "Error al guardar N cambio(s)" | updateParticipantLivesAction |

**No throws.** Every Supabase error is caught, logged
`console.error('[actionName] Error:', error)`, and returned as
`{ ok: false, error: error.message }`. Pilot reference:
`seasons/_actions.ts:33-36`.

## D3. Tag invalidation matrix

Compact form. `S` = `splitId`, `L` = `leagueId`. Each action ALSO calls
`revalidatePath(<dashboard route>)` first.

| Action | File | Tags `updateTag(...)` |
|---|---|---|
| `createLeagueAction` | divisions/_actions.ts | `seasons`, `splits:${S}` |
| `deleteLeagueAction` | divisions/_actions.ts | `seasons`, `splits:${S}`, `participants:${S}` |
| `createSplitAction` | splits/_actions.ts | `seasons`, `archive` |
| `deleteSplitAction` | splits/_actions.ts | `seasons`, `splits:${id}`, `archive`, `matches:${id}`, `bracket:${id}`, `participants:${id}` |
| `activateSplitAction` | splits/_actions.ts | `seasons`, `archive` |
| `deactivateSplitAction` | splits/_actions.ts | `seasons`, `archive` |
| `uploadRegulationsAction` | normativa/_actions.ts | (none — storage is not behind `'use cache'`; uses `revalidatePath('/normativa')` instead) |
| `createTrainerAction` | participants/_actions.ts | `trainers` |
| `updateTrainerAction` | participants/_actions.ts | `trainers`, `seasons` |
| `deleteTrainerAction` | participants/_actions.ts | `trainers`, `seasons` |
| `assignParticipantAction` | participants/_actions.ts | `participants:${S}`, `rankings:${L}` |
| `removeParticipantAction` | participants/_actions.ts | `participants:${S}`, `rankings:${L}` |
| `updateParticipantLivesAction` | participants/_actions.ts | `participants:${S}`, `rankings:${L}` |
| `saveMatchResultAction` | matches/_actions.ts | `matches:${S}`, `rankings:${L}`, `bracket:${S}` |
| `clearMatchResultAction` | matches/_actions.ts | `matches:${S}`, `rankings:${L}`, `bracket:${S}` |
| `createMatchAction` | matches/_actions.ts | `matches:${S}`, `bracket:${S}` |
| `updateMatchAction` | matches/_actions.ts | `matches:${S}`, `bracket:${S}` |
| `deleteMatchAction` | matches/_actions.ts | `matches:${S}`, `rankings:${L}`, `bracket:${S}` |
| `generateJ15MatchesAction` | matches/_actions.ts | `matches:${S}`, `bracket:${S}` |
| `generateJ16MatchesAction` | matches/_actions.ts | `matches:${S}`, `bracket:${S}` |

**Sources for the matrix:** `docs/conventions.md:82-119` "Per-query profile +
tag assignment" table. Every reader that surfaces a row each action touches
is covered.

### Why `seasons` on trainer update/delete (REQ-70, REQ-71)?

Trainer rows are joined into reader queries that are tagged per-split
(`participants:${splitId}` includes `trainers.nickname` /
`trainers.avatar_url` via the participant join in
`leagues.queries.ts`). A trainer can be in many splits across many seasons —
enumerating every affected `splits:*` / `participants:*` / `rankings:*` tag
would require an extra Supabase round-trip (find all participations) per
trainer mutation. We accept the conservative broad-bust on `seasons`
(reader bundle for the season/split/league family per
`conventions.md:104-115`) plus the granular `trainers`. Cost: one extra
revalidation pass on rare trainer edits.

> **Open question for Reviewer.** Confirm whether `getRankingsByLeague`
> (tagged `rankings:${leagueId}` only — `conventions.md:112`) joins the
> `trainers` table live or denormalizes nickname/avatar on the
> `league_rankings` view. If denormalized, trainer edits won't be reflected
> until either the view materializes or `rankings:*` is busted. If it's a
> live join, the chosen tag set is sufficient.
> Implementer should `psql \d+ league_rankings` (or read
> `docs/DATABASE_ARCHITECTURE.md`) at the start of Wave 4 and adjust the tag
> set in `updateTrainerAction` / `deleteTrainerAction` accordingly.

## D4. useOptimistic reducer pattern (per Manager)

The pilot uses a tagged-union reducer
(`SeasonsManager.tsx:25-49`). Adapt per Manager:

### DivisionsManager

State is the visible `leagues: League[]` slice exposed by `useLeagueSelector`.
Because that hook owns the leagues array (the Manager does not `setLeagues`
directly), the cleanest migration is:

1. Snapshot `leagues` into a local `useOptimistic` state once per
   `selectedSplitId` change (or wrap the hook's `leagues` in a memoized
   `useOptimistic` derived state).
2. Apply optimistic transitions locally.
3. After the action resolves, call `refresh()` from the hook (already used in
   the current handler — see `DivisionsManager.tsx:90`) to reconcile with
   server truth.
4. Drop `router.refresh()` — the action's `revalidatePath` + `updateTag` cover
   the public side.

```ts
type LeagueOptimistic =
  | { type: 'create'; league: League }
  | { type: 'delete'; id: string };
```

### SplitsManager

Same shape as the pilot — owns `splits` via `useLeagueSelector`. Mirror
DivisionsManager's snapshot+refresh approach. Reducer:

```ts
type SplitOptimistic =
  | { type: 'create'; split: Split }
  | { type: 'delete'; id: string }
  | { type: 'activate'; id: string; seasonId: string }
  | { type: 'deactivate'; id: string };
```

The `activate` case must mark the target active AND every other split in the
same season inactive (mirror `seasons/_actions.ts:74-100` + the optimistic
counterpart `SeasonsManager.tsx:41-44`).

### RegulationsManager

No collection to reduce — only a single `currentUrl: string | null`. Use
`useOptimistic` with a string-or-null state:

```ts
const [optimisticUrl, applyOptimistic] = useOptimistic(
  currentPdfUrl,
  (_, nextUrl: string | null) => nextUrl,
);
```

Optimistically set `optimisticUrl` to a `URL.createObjectURL(file)` while the
upload runs, then commit to `result.url` on success. (Optional — if the
implementer judges the optimistic flicker is not worth the extra code, ship a
plain `setSaving` loading state and reconcile on `result.url`.)

### ParticipantsManager

Two collections: `trainers` and `participants`. Two reducers:

```ts
type TrainerOptimistic =
  | { type: 'create'; trainer: Trainer }
  | { type: 'update'; trainer: Trainer }
  | { type: 'delete'; id: string };

type ParticipantOptimistic =
  | { type: 'assign'; participant: ParticipantWithTrainer }
  | { type: 'remove'; id: string }
  | { type: 'lives'; changes: Array<{ id: string; lives: number }> };
```

Drop the `refreshTrainers` and `refreshParticipants` helpers — the action's
`updateTag` calls + a single retained `router.refresh()` (kept for the
admin-side re-fetch of non-cached `admin.queries.ts`) handle reconciliation.
Keep the `pendingLivesChanges` local state as-is; only the SAVE path changes.

### MatchesManager

One collection: `matches: MatchWithTrainers[]`. Reducer covers all 8 actions:

```ts
type MatchOptimistic =
  | { type: 'result'; id: string; homeSets: number; awaySets: number }
  | { type: 'clear'; id: string }
  | { type: 'create'; match: MatchWithTrainers }
  | { type: 'update'; match: MatchWithTrainers }
  | { type: 'delete'; id: string }
  | { type: 'bulk-insert'; matches: MatchWithTrainers[] };  // J15/J16
```

The `bulk-insert` case appends 4 rows with temporary ids; reconciliation
happens via `refreshMatches` (kept) which re-queries via the browser client.

## D5. Consumer call pattern (mirror the pilot)

For every action invocation, wrap in `startTransition` and apply optimistic
first (`SeasonsManager.tsx:93-103`):

```ts
startTransition(async () => {
  applyOptimistic({ type: 'create', league: tempLeague });
  const result = await createLeagueAction(selectedSplitId, parsed.data);
  if (!result.ok) {
    setError(result.error);
  } else {
    // form cleanup
  }
  setSaving(false);
});
```

For `AdminConfirmModal` callbacks (preserve F6a wiring — do NOT change
`requestX` / `cancelX` / the modal props):

```ts
const confirmDeleteParticipant = () => {
  const id = pendingConfirm.id;
  setPendingConfirm(null);
  startTransition(async () => {
    applyOptimistic({ type: 'remove', id });
    const result = await removeParticipantAction(id, selectedSplitId!);
    if (!result.ok) setError(result.error);
  });
};
```

## D6. RegulationsManager — storage decision (justified)

**Decision: storage upload moves INTO the Server Action (Option A).** Single
round-trip from the browser, single auth boundary, matches the pilot pattern
of "all writes server-side."

### Options considered

| Option | Pro | Con |
|---|---|---|
| **A. All-in-action** (chosen) | One auth surface; deletes the only `createClient()` import from this Manager; matches pilot uniformly | Server Action body handles a 50MB binary; Next 16 supports this but adds backpressure |
| B. Client-side upload + server action for DB row | Avoids streaming binary through the server | Currently no DB row exists — there is literally nothing for a "DB-row" server action to do; would be a no-op action and the client would still hold the Supabase Storage credentials |
| C. Status quo (keep client) | Zero migration cost | Defeats F6b's goal of zero `@/lib/supabase/client` writes in admin Managers |

Option B's "no DB row to update" is the key disqualifier: the only state on
disk is the storage object itself. Splitting upload (client) from a no-op
action would add ceremony without value.

Implementation notes for the Implementer:

- Use `formData.get('file')` and assert it is a `File` (Zod
  `instanceof(File)`). Pilot already validates this client-side via
  `RegulationsUploadSchema` — re-run the same schema at the action boundary
  for the trust-no-input contract.
- The cookie-aware `createClient()` from `@/lib/supabase/server` propagates
  the admin's identity. RLS / storage policies that currently allow the
  browser-side upload will continue to allow this.
- The action does NOT need to call `getPublicUrl(...)` again if the file path
  is deterministic — return the same `public/normativa_pokemon_calmind_series.pdf`
  URL the page derives on its read path
  (`normativa/page.tsx:7-9`).
- Add `revalidatePath('/normativa')` so the public route's HEAD probe
  re-runs immediately.

## D7. Files touched / created

### New files

- `src/app/admin/dashboard/divisions/_actions.ts`
- `src/app/admin/dashboard/splits/_actions.ts`
- `src/app/admin/dashboard/normativa/_actions.ts`
- `src/app/admin/dashboard/participants/_actions.ts`
- `src/app/admin/dashboard/matches/_actions.ts`

### Edited files

- `src/app/admin/dashboard/divisions/_components/DivisionsManager.tsx`
- `src/app/admin/dashboard/splits/_components/SplitsManager.tsx`
- `src/app/admin/dashboard/normativa/_components/RegulationsManager.tsx`
- `src/app/admin/dashboard/participants/_components/ParticipantsManager.tsx`
- `src/app/admin/dashboard/matches/_components/MatchesManager.tsx`
- `docs/conventions.md` (Wave 6)

### NOT touched

- `src/app/admin/dashboard/seasons/_actions.ts` (pilot, already correct)
- `src/app/admin/dashboard/seasons/_components/SeasonsManager.tsx` (pilot)
- `src/components/admin/ui/AdminConfirmModal.tsx` (F6a artifact — preserve)
- `src/lib/queries/*.queries.ts` (no reader changes; tag taxonomy already
  matches `conventions.md:82-119`)
- `src/lib/types/schemas.ts` (all required Input schemas already exist:
  `LeagueCreateInputSchema`, `SplitCreateInputSchema`, `TrainerInputSchema`,
  `MatchPlanningInputSchema`, `MatchResultInputSchema`,
  `RegulationsUploadSchema`)

## D8. Framework gotchas

- **`updateTag` is Server-Action-only.** It MUST be inside a `'use server'`
  function; calling it from an RSC throws. Confirmed by the F4 implementation
  pattern. Verify against `vercel:next-cache-components` if the Implementer
  hits a runtime error.
- **`revalidatePath` does NOT bust `'use cache'`** (Next 16 Cache Components
  mode). `updateTag` is the load-bearing call. Keep `revalidatePath` only for
  the admin route's per-request React tree.
- **`router.refresh()` keep policy.** Drop from all 5 Managers' write paths.
  Keep ONLY if it is wiring an admin-side `admin.queries.ts` re-fetch where
  the action's `revalidatePath(<dashboard route>)` would not already cover
  it; document each remaining call with a comment.
- **FormData transport (RegulationsManager).** Next 16 Server Actions accept
  `FormData` as the sole argument — the type signature in the action must
  be `(formData: FormData) => Promise<...>`. Verify against
  `vercel:nextjs` if the Implementer hits a serialization error.
- **`refresh()` from `useLeagueSelector`.** Re-fetches splits/leagues from
  the browser Supabase client. Still safe to call after mutations because
  the hook owns its own `createClient()` instance; this is a READ via
  `@/lib/supabase/client` — not a write. Goal of the migration is "no
  Manager writes via the browser client"; reads via the hook are unchanged.
- **`Promise.all` batch in `updateParticipantLivesAction` (REQ-73).** Wrap
  in `try/catch` around the `await Promise.all(...)`; count failures by
  filtering `result.error` like the current browser code
  (`ParticipantsManager.tsx:366-369`). Do NOT throw.
- **J15 / J16 generators (REQ-78).** Port the existing two-phase logic
  verbatim into the action — read rankings (J15) or read J15 (J16), build
  the 4 rows in memory, single `insert(matchesToCreate)`. Do NOT introduce
  the dual-cascade auto-generation here (F6c).
