'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { type TrainerInput, TrainerInputSchema } from '@/lib/types/schemas';

type ActionResult = { ok: true } | { ok: false; error: string };

type CreateResult = { ok: true; id: string } | { ok: false; error: string };

type LivesResult =
  | { ok: true }
  | { ok: false; error: string; failedCount: number };

const DASHBOARD_PATH = '/admin/dashboard/participants';
const IdSchema = z.string().uuid('ID inválido');

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}

export async function createTrainerAction(
  input: TrainerInput,
): Promise<CreateResult> {
  const parsed = TrainerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trainers')
    .insert(parsed.data)
    .select('id')
    .single();

  if (error) {
    console.error('[createTrainerAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('trainers');
  return { ok: true, id: data.id };
}

export async function updateTrainerAction(
  id: string,
  input: TrainerInput,
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsed = TrainerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('trainers')
    .update(parsed.data)
    .eq('id', parsedId.data);

  if (error) {
    console.error('[updateTrainerAction] Error:', error);
    return { ok: false, error: error.message };
  }

  // Trainer nickname/avatar are joined into per-split readers
  // (`participants:${splitId}`) AND snapshotted into `rankings:${leagueId}`
  // cached results. Enumerating every affected league/split would require an
  // extra round-trip (find every participation). We accept the conservative
  // `seasons` broad bust per design.md §"Why `seasons` on trainer update/delete"
  // — covers the season/split/league reader bundle. `rankings:*` caches will
  // refresh on their `cacheLife('minutes')` window (≤60s) — known staleness
  // window for trainer rename / avatar swap, deferred to a future enumeration
  // pass if it becomes user-visible.
  revalidatePath(DASHBOARD_PATH);
  updateTag('trainers');
  updateTag('seasons');
  return { ok: true };
}

export async function deleteTrainerAction(id: string): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('trainers')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deleteTrainerAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('trainers');
  updateTag('seasons');
  return { ok: true };
}

const AssignParticipantSchema = z.object({
  leagueId: IdSchema,
  trainerId: IdSchema,
  splitId: IdSchema,
  initialSeed: z.number().int().min(1, 'El seed debe ser >= 1'),
  lives: z.number().int().min(0, 'Las vidas deben ser >= 0'),
});

export async function assignParticipantAction(input: {
  leagueId: string;
  trainerId: string;
  splitId: string;
  initialSeed: number;
  lives: number;
}): Promise<CreateResult> {
  const parsed = AssignParticipantSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('league_participants')
    .insert({
      league_id: parsed.data.leagueId,
      trainer_id: parsed.data.trainerId,
      initial_seed: parsed.data.initialSeed,
      status: 'active',
      lives: parsed.data.lives,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[assignParticipantAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag(`participants:${parsed.data.splitId}`);
  updateTag(`rankings:${parsed.data.leagueId}`);
  return { ok: true, id: data.id };
}

export async function removeParticipantAction(
  participantId: string,
  ctx: { splitId: string; leagueId: string },
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(participantId);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedSplit = IdSchema.safeParse(ctx.splitId);
  if (!parsedSplit.success) {
    return { ok: false, error: formatZodIssues(parsedSplit.error) };
  }
  const parsedLeague = IdSchema.safeParse(ctx.leagueId);
  if (!parsedLeague.success) {
    return { ok: false, error: formatZodIssues(parsedLeague.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('league_participants')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    console.error('[removeParticipantAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag(`participants:${parsedSplit.data}`);
  updateTag(`rankings:${parsedLeague.data}`);
  return { ok: true };
}

const LivesChangeSchema = z.object({
  id: IdSchema,
  lives: z.number().int().min(0, 'Las vidas deben ser >= 0'),
});

export async function updateParticipantLivesAction(
  changes: Array<{ id: string; lives: number }>,
  ctx: { splitId: string; leagueId: string },
): Promise<LivesResult> {
  const parsedChanges = z.array(LivesChangeSchema).safeParse(changes);
  if (!parsedChanges.success) {
    return {
      ok: false,
      error: formatZodIssues(parsedChanges.error),
      failedCount: changes.length,
    };
  }
  const parsedSplit = IdSchema.safeParse(ctx.splitId);
  if (!parsedSplit.success) {
    return {
      ok: false,
      error: formatZodIssues(parsedSplit.error),
      failedCount: changes.length,
    };
  }
  const parsedLeague = IdSchema.safeParse(ctx.leagueId);
  if (!parsedLeague.success) {
    return {
      ok: false,
      error: formatZodIssues(parsedLeague.error),
      failedCount: changes.length,
    };
  }

  const supabase = await createClient();

  // Mirror the browser-side Promise.all semantics: each row is its own UPDATE
  // and we count the failed slots so the UX message ("Error al guardar N
  // cambio(s)") stays identical (ParticipantsManager.tsx:368-369).
  const updates = parsedChanges.data.map((change) =>
    supabase
      .from('league_participants')
      .update({ lives: change.lives })
      .eq('id', change.id),
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error(
      '[updateParticipantLivesAction] Error:',
      errors.map((e) => e.error?.message).join(' · '),
    );
    return {
      ok: false,
      error: `Error al guardar ${errors.length} cambio(s)`,
      failedCount: errors.length,
    };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag(`participants:${parsedSplit.data}`);
  updateTag(`rankings:${parsedLeague.data}`);
  return { ok: true };
}
