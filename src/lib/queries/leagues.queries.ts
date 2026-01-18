import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { League, LeagueRanking } from '@/lib/types/database.types';

/**
 * League with basic info for display
 */
export type LeagueInfo = Pick<League, 'id' | 'tier_name' | 'tier_priority'>;

/**
 * Ranking entry formatted for UI display
 */
export type RankingEntry = {
  position: number;
  nickname: string;
  totalPoints: number;
  avatarUrl: string | null;
  setBalance: number;
  matchesPlayed: number;
  totalSetsWon: number;
  trainerId: string;
};

/**
 * Division preview with rankings ready for display
 */
export type DivisionPreview = {
  primera: RankingEntry[];
  segunda: RankingEntry[];
};

/**
 * Gets all leagues for a specific split, ordered by tier priority
 */
export const getLeaguesBySplit = cache(
  async (splitId: string): Promise<LeagueInfo[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('leagues')
      .select('id, tier_name, tier_priority')
      .eq('split_id', splitId)
      .order('tier_priority', { ascending: true });

    if (error) {
      console.error('[getLeaguesBySplit] Error:', error.message);
      return [];
    }

    return data ?? [];
  },
);

/**
 * Gets rankings for a specific league, formatted for UI
 */
export const getRankingsByLeague = cache(
  async (leagueId: string): Promise<RankingEntry[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('league_rankings')
      .select('*')
      .eq('league_id', leagueId)
      .not('position', 'is', null)
      .not('nickname', 'is', null)
      .order('position', { ascending: true });

    if (error) {
      console.error('[getRankingsByLeague] Error:', error.message);
      return [];
    }

    return (data ?? []).map((ranking: LeagueRanking) => ({
      position: ranking.position!,
      nickname: ranking.nickname!,
      totalPoints: ranking.total_points ?? 0,
      avatarUrl: ranking.avatar_url,
      setBalance: ranking.set_balance ?? 0,
      matchesPlayed: ranking.matches_played ?? 0,
      totalSetsWon: ranking.total_sets_won ?? 0,
      trainerId: ranking.trainer_id ?? '',
    }));
  },
);

/**
 * Gets both divisions with their rankings for a split.
 * Returns data formatted and ready for UI display.
 */
export const getDivisionPreview = cache(
  async (splitId: string): Promise<DivisionPreview> => {
    const leagues = await getLeaguesBySplit(splitId);

    if (leagues.length === 0) {
      return { primera: [], segunda: [] };
    }

    // Find leagues by tier priority (1 = Primera, 2 = Segunda)
    const primeraLeague = leagues.find((l) => l.tier_priority === 1);
    const segundaLeague = leagues.find((l) => l.tier_priority === 2);

    // Fetch rankings in parallel
    const [primera, segunda] = await Promise.all([
      primeraLeague
        ? getRankingsByLeague(primeraLeague.id)
        : Promise.resolve([]),
      segundaLeague
        ? getRankingsByLeague(segundaLeague.id)
        : Promise.resolve([]),
    ]);

    return { primera, segunda };
  },
);

/**
 * Gets a single league by split and tier priority
 */
export const getLeagueByTier = cache(
  async (splitId: string, tierPriority: number): Promise<LeagueInfo | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('leagues')
      .select('id, tier_name, tier_priority')
      .eq('split_id', splitId)
      .eq('tier_priority', tierPriority)
      .single();

    if (error) {
      console.error('[getLeagueByTier] Error:', error.message);
      return null;
    }

    return data;
  },
);
