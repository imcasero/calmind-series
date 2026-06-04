'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type SignedUploadResult =
  | { ok: true; path: string; token: string }
  | { ok: false; error: string };

type FinalizeResult = { ok: true; url: string } | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/normativa';
const PUBLIC_PATH = '/normativa';
const STORAGE_BUCKET = 'normativas';
const STORAGE_KEY = 'public/normativa_pokemon_calmind_series.pdf';

export async function createRegulationsUploadAction(): Promise<SignedUploadResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(STORAGE_KEY, { upsert: true });

  if (error) {
    console.error('[createRegulationsUploadAction] Error:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true, path: data.path, token: data.token };
}

export async function finalizeRegulationsUploadAction(): Promise<FinalizeResult> {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(STORAGE_KEY);

  // No `updateTag` — storage is not surfaced through `'use cache'` readers.
  // The public `/normativa` route uses a runtime HEAD probe; revalidatePath
  // forces the next request to re-run that probe.
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(PUBLIC_PATH);

  return { ok: true, url: data.publicUrl };
}
