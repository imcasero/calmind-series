'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  type SplitCreateInput,
  SplitCreateInputSchema,
} from '@/lib/types/schemas';

type ActionResult = { ok: true } | { ok: false; error: string };

type CreateSplitResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/splits';
const IdSchema = z.string().uuid('ID inválido');

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}

export async function createSplitAction(
  seasonId: string,
  input: SplitCreateInput,
): Promise<CreateSplitResult> {
  const parsedSeasonId = IdSchema.safeParse(seasonId);
  if (!parsedSeasonId.success) {
    return { ok: false, error: formatZodIssues(parsedSeasonId.error) };
  }

  const parsed = SplitCreateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('splits')
    .insert({
      season_id: parsedSeasonId.data,
      ...parsed.data,
      is_active: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createSplitAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true, id: data.id };
}

export async function deleteSplitAction(
  id: string,
  seasonId: string,
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedSeasonId = IdSchema.safeParse(seasonId);
  if (!parsedSeasonId.success) {
    return { ok: false, error: formatZodIssues(parsedSeasonId.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('splits')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deleteSplitAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('seasons');
  updateTag(`splits:${parsedId.data}`);
  updateTag('archive');
  updateTag(`matches:${parsedId.data}`);
  updateTag(`bracket:${parsedId.data}`);
  updateTag(`participants:${parsedId.data}`);
  return { ok: true };
}

export async function activateSplitAction(
  id: string,
  seasonId: string,
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedSeasonId = IdSchema.safeParse(seasonId);
  if (!parsedSeasonId.success) {
    return { ok: false, error: formatZodIssues(parsedSeasonId.error) };
  }

  const supabase = await createClient();

  // Step 1: deactivate every split inside the season.
  // NOTE: non-atomic by design — atomic RPC is REQ-3 (mirrored from
  // seasons/_actions.ts:74-76), deferred to a future Supabase migration batch
  // (needs migration access).
  const { error: deactivateError } = await supabase
    .from('splits')
    .update({ is_active: false })
    .eq('season_id', parsedSeasonId.data);

  if (deactivateError) {
    console.error('[activateSplitAction] Error:', deactivateError);
    return { ok: false, error: deactivateError.message };
  }

  // Step 2: activate the target.
  const { error: activateError } = await supabase
    .from('splits')
    .update({ is_active: true })
    .eq('id', parsedId.data);

  if (activateError) {
    console.error('[activateSplitAction] Error:', activateError);
    return { ok: false, error: activateError.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };
}

export async function deactivateSplitAction(id: string): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('splits')
    .update({ is_active: false })
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deactivateSplitAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };
}
