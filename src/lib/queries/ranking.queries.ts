import { createClient } from '@/lib/supabase/server';
import type { League, LeagueRanking } from '@/lib/types/database.types';

/**
 * Gets all league rankings ordered by position.
 * Returns an empty array if no rankings are found or on error.
 *
 * @example
 * const rankings = await getRankings();
 * rankings.forEach(ranking => {
 *   console.log(ranking.nickname, ranking.position);
 * });
 */
export async function getRankings(): Promise<LeagueRanking[]> {
  const supabase = await createClient();

  const { data: league_rankings, error } = await supabase
    .from('league_rankings')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('[getRankings] Error:', error.message);
    return [];
  }

  return league_rankings ?? [];
}

/**
 * Gets all leagues with only id and tier_name.
 * Returns an empty array if no leagues are found or on error.
 *
 * @example
 * const leagues = await getAllLeagues();
 * leagues.forEach(league => {
 *   console.log(league.id, league.tier_name);
 * });
 */
export async function getAllLeagues(): Promise<Pick<League, 'id' | 'tier_name'>[]> {
  const supabase = await createClient();

  const { data: leagues, error } = await supabase
    .from('leagues')
    .select('id, tier_name');

  if (error) {
    console.error('[getAllLeagues] Error:', error.message);
    return [];
  }

  return leagues ?? [];
}
