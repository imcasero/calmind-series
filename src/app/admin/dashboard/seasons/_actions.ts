'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  type SeasonCreateInput,
  SeasonCreateInputSchema,
} from '@/lib/types/schemas';

type ActionResult = { ok: true } | { ok: false; error: string };

const SEASONS_PATH = '/admin/dashboard/seasons';
const IdSchema = z.string().uuid('ID inválido');

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}

export async function createSeasonAction(
  input: SeasonCreateInput,
): Promise<ActionResult> {
  const parsed = SeasonCreateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('seasons')
    .insert({ ...parsed.data, is_active: false });

  if (error) {
    console.error('[createSeasonAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  return { ok: true };
}

export async function deleteSeasonAction(id: string): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('seasons')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deleteSeasonAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };
}

export async function activateSeasonAction(id: string): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }

  const supabase = await createClient();

  // Step 1: deactivate all other seasons.
  // NOTE: non-atomic by design — atomic RPC is REQ-3, deferred to a future
  // Supabase migration batch (needs migration access).
  const { error: deactivateError } = await supabase
    .from('seasons')
    .update({ is_active: false })
    .neq('id', parsedId.data);

  if (deactivateError) {
    console.error('[activateSeasonAction] Error:', deactivateError);
    return { ok: false, error: deactivateError.message };
  }

  // Step 2: activate the target.
  const { error: activateError } = await supabase
    .from('seasons')
    .update({ is_active: true })
    .eq('id', parsedId.data);

  if (activateError) {
    console.error('[activateSeasonAction] Error:', activateError);
    return { ok: false, error: activateError.message };
  }

  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };
}

export async function deactivateSeasonAction(
  id: string,
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('seasons')
    .update({ is_active: false })
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deactivateSeasonAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(SEASONS_PATH);
  updateTag('seasons');
  updateTag('archive');
  return { ok: true };
}
