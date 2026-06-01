import { cacheLife, cacheTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Derives the active round for a split from its match results: the highest round
 * with `played = true` across all match groups, or 0 when none are played.
 *
 * Single source the phase machine reads (locked decision 2026-05-27: current_round
 * is derived from matches — there is no dedicated tournament_state table).
 */
export async function getCurrentRound(splitId: string): Promise<number> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`matches:${splitId}`);

  const supabase = await createClient({ session: false });

  const { data, error } = await supabase
    .from('matches')
    .select('round')
    .eq('split_id', splitId)
    .eq('played', true)
    .order('round', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getCurrentRound] Error:', error.message);
    return 0;
  }

  return data?.round ?? 0;
}
