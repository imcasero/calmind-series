import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { LeagueRanking } from '@/lib/types/database.types';

/**
 * Gets all league rankings ordered by position.
 *
 * @deprecated Prefer using getRankingsByLeague from leagues.queries.ts for filtered results
 */
export const getAllRankings = cache(async (): Promise<LeagueRanking[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('league_rankings')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('[getAllRankings] Error:', error.message);
    return [];
  }

  return data ?? [];
});

/**
 * Gets a trainer's ranking in a specific league
 */
export const getTrainerRanking = cache(
  async (
    leagueId: string,
    trainerId: string,
  ): Promise<LeagueRanking | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('league_rankings')
      .select('*')
      .eq('league_id', leagueId)
      .eq('trainer_id', trainerId)
      .single();

    if (error) {
      console.error('[getTrainerRanking] Error:', error.message);
      return null;
    }

    return data;
  },
);
