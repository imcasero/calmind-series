import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { ROUNDS } from '@/lib/constants/matches';
import { createClient } from '@/lib/supabase/server';
import type { J15Match, J16Match } from '@/lib/types/matches';

/**
 * Data fetching utilities optimized for Next.js 16 + React 19
 * Uses both React cache() and Next.js unstable_cache() for optimal performance
 */

// 1. Server-side data fetching with Next.js unstable_cache
// This caches across requests and persists until revalidation
export const fetchMatchesForRound = unstable_cache(
  async (splitId: string, round: number) => {
    const supabase = await createClient();

    const selectFields =
      round === ROUNDS.J15
        ? `
        id, league_id, match_group, match_tag,
        home_trainer_id, away_trainer_id,
        home_sets, away_sets, played,
        home:trainers!matches_home_trainer_id_fkey(nickname, avatar_url),
        away:trainers!matches_away_trainer_id_fkey(nickname, avatar_url)
      `
        : `
        id, league_id, match_group, match_tag,
        home_trainer_id, away_trainer_id,
        home_sets, away_sets, played
      `;

    const { data, error } = await supabase
      .from('matches')
      .select(selectFields)
      .eq('split_id', splitId)
      .eq('round', round)
      .order('match_tag');

    if (error) {
      console.error(
        `[fetchMatchesForRound] Error fetching round ${round}:`,
        error,
      );
      return null;
    }

    return data;
  },
  ['matches-by-round'],
  {
    revalidate: 60, // Revalidate every minute
    tags: ['matches'],
  },
);

// 2. React cache for deduplication within the same request
export const getMatchesForRound = cache(
  async (splitId: string, round: number) => {
    return fetchMatchesForRound(splitId, round);
  },
);

// 3. Batch fetching for multiple data types
export const fetchSplitData = unstable_cache(
  async (splitId: string) => {
    const supabase = await createClient();

    // Fetch all required data in parallel
    const [leaguesResult, j15Result, j16Result] = await Promise.allSettled([
      supabase
        .from('leagues')
        .select('id, tier_name, tier_priority')
        .eq('split_id', splitId)
        .order('tier_priority'),

      fetchMatchesForRound(splitId, ROUNDS.J15),
      fetchMatchesForRound(splitId, ROUNDS.J16),
    ]);

    const leagues =
      leaguesResult.status === 'fulfilled' ? leaguesResult.value.data : [];
    const j15Matches =
      j15Result.status === 'fulfilled' ? j15Result.value : null;
    const j16Matches =
      j16Result.status === 'fulfilled' ? j16Result.value : null;

    return {
      leagues,
      j15Matches,
      j16Matches,
    };
  },
  ['split-data'],
  {
    revalidate: 60,
    tags: ['split', 'matches', 'leagues'],
  },
);

// 4. Optimized incremental data fetching
export async function fetchSplitDataIncremental(splitId: string) {
  // First, get the leagues (minimal data)
  const supabase = await createClient();
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, tier_name, tier_priority')
    .eq('split_id', splitId)
    .order('tier_priority');

  // Return a function to fetch additional data as needed
  return {
    leagues,
    fetchJ15: () => getMatchesForRound(splitId, ROUNDS.J15),
    fetchJ16: () => getMatchesForRound(splitId, ROUNDS.J16),
  };
}
