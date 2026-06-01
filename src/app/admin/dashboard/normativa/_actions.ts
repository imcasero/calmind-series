'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { RegulationsUploadSchema } from '@/lib/types/schemas';

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/normativa';
const PUBLIC_PATH = '/normativa';
const STORAGE_BUCKET = 'normativas';
const STORAGE_KEY = 'public/normativa_pokemon_calmind_series.pdf';

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}

export async function uploadRegulationsAction(
  formData: FormData,
): Promise<UploadResult> {
  const raw = formData.get('file');
  if (!(raw instanceof File)) {
    return { ok: false, error: 'Archivo inválido' };
  }

  const parsed = RegulationsUploadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(STORAGE_KEY, parsed.data, {
      cacheControl: '0',
      upsert: true,
    });

  if (uploadError) {
    console.error('[uploadRegulationsAction] Error:', uploadError);
    return { ok: false, error: uploadError.message };
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(STORAGE_KEY);

  // No `updateTag` — storage is not surfaced through `'use cache'` readers.
  // The public `/normativa` route uses a runtime HEAD probe; revalidatePath
  // forces the next request to re-run that probe.
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(PUBLIC_PATH);
  return { ok: true, url: publicData.publicUrl };
}
