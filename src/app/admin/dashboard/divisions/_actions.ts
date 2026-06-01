'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  type LeagueCreateInput,
  LeagueCreateInputSchema,
} from '@/lib/types/schemas';

type ActionResult = { ok: true } | { ok: false; error: string };

type CreateLeagueResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/divisions';
const IdSchema = z.string().uuid('ID inválido');

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}

export async function createLeagueAction(
  splitId: string,
  input: LeagueCreateInput,
): Promise<CreateLeagueResult> {
  const parsedSplitId = IdSchema.safeParse(splitId);
  if (!parsedSplitId.success) {
    return { ok: false, error: formatZodIssues(parsedSplitId.error) };
  }

  const parsed = LeagueCreateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leagues')
    .insert({ split_id: parsedSplitId.data, ...parsed.data })
    .select('id')
    .single();

  if (error) {
    console.error('[createLeagueAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag('seasons');
  updateTag(`splits:${parsedSplitId.data}`);
  return { ok: true, id: data.id };
}

export async function deleteLeagueAction(
  id: string,
  splitId: string,
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedSplitId = IdSchema.safeParse(splitId);
  if (!parsedSplitId.success) {
    return { ok: false, error: formatZodIssues(parsedSplitId.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('leagues')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deleteLeagueAction] Error:', error);
    return { ok: false, error: error.message };
  }

  // TODO: also `updateTag('archive')` once a closed-season UI surfaces league
  // rows from archived splits. F6b leaves this out per requirements.md REQ-62.
  revalidatePath(DASHBOARD_PATH);
  updateTag('seasons');
  updateTag(`splits:${parsedSplitId.data}`);
  updateTag(`participants:${parsedSplitId.data}`);
  return { ok: true };
}
