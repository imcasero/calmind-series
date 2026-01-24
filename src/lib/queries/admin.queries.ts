import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  League,
  LeagueParticipant,
  Match,
  Season,
  Split,
  Trainer,
} from '@/lib/types/database.types';

/**
 * Admin queries for server-side data fetching.
 * All functions use React cache() for request deduplication.
 */

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
  totalSeasons: number;
  totalDivisions: number;
  totalParticipants: number;
  totalMatches: number;
  activeSeasonName: string | null;
  activeSplitName: string | null;
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const supabase = await createClient();

  const [seasonsResult, divisionsResult, participantsResult, matchesResult] =
    await Promise.all([
      supabase
        .from('seasons')
        .select('id, name, is_active', { count: 'exact' }),
      supabase.from('leagues').select('id', { count: 'exact' }),
      supabase.from('league_participants').select('id', { count: 'exact' }),
      supabase.from('matches').select('id', { count: 'exact' }),
    ]);

  // Find active season
  const activeSeason = seasonsResult.data?.find((s) => s.is_active);
  let activeSplitName: string | null = null;

  if (activeSeason) {
    const { data: splits } = await supabase
      .from('splits')
      .select('name, is_active')
      .eq('season_id', activeSeason.id)
      .eq('is_active', true)
      .single();
    activeSplitName = splits?.name ?? null;
  }

  return {
    totalSeasons: seasonsResult.count ?? 0,
    totalDivisions: divisionsResult.count ?? 0,
    totalParticipants: participantsResult.count ?? 0,
    totalMatches: matchesResult.count ?? 0,
    activeSeasonName: activeSeason?.name ?? null,
    activeSplitName,
  };
});

// ============================================================================
// Seasons
// ============================================================================

export const getAdminSeasons = cache(async (): Promise<Season[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('[getAdminSeasons] Error:', error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as Season[];
});

// ============================================================================
// Splits
// ============================================================================

export const getAdminSplitsBySeason = cache(
  async (seasonId: string): Promise<Split[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('splits')
      .select('*')
      .eq('season_id', seasonId)
      .order('split_order', { ascending: true });

    if (error) {
      console.error('[getAdminSplitsBySeason] Error:', error.message);
      throw new Error(error.message);
    }

    return (data ?? []) as Split[];
  },
);

// ============================================================================
// Leagues (Divisions)
// ============================================================================

export const getAdminLeaguesBySplit = cache(
  async (splitId: string): Promise<League[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('split_id', splitId)
      .order('tier_priority', { ascending: true });

    if (error) {
      console.error('[getAdminLeaguesBySplit] Error:', error.message);
      throw new Error(error.message);
    }

    return (data ?? []) as League[];
  },
);

// ============================================================================
// Trainers
// ============================================================================

export const getAdminTrainers = cache(async (): Promise<Trainer[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .order('nickname', { ascending: true });

  if (error) {
    console.error('[getAdminTrainers] Error:', error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as Trainer[];
});

// ============================================================================
// League Participants
// ============================================================================

export type ParticipantWithTrainer = LeagueParticipant & {
  trainer: Trainer;
};

export const getAdminParticipantsByLeague = cache(
  async (leagueId: string): Promise<ParticipantWithTrainer[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('league_participants')
      .select('*, trainer:trainers(*)')
      .eq('league_id', leagueId)
      .order('initial_seed', { ascending: true });

    if (error) {
      console.error('[getAdminParticipantsByLeague] Error:', error.message);
      throw new Error(error.message);
    }

    return (data ?? []) as ParticipantWithTrainer[];
  },
);

// ============================================================================
// Matches
// ============================================================================

export type MatchWithTrainers = Match & {
  home_trainer: Trainer | null;
  away_trainer: Trainer | null;
};

export const getAdminMatchesByLeague = cache(
  async (leagueId: string): Promise<MatchWithTrainers[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        home_trainer:trainers!matches_home_trainer_id_fkey(*),
        away_trainer:trainers!matches_away_trainer_id_fkey(*)
      `,
      )
      .eq('league_id', leagueId)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[getAdminMatchesByLeague] Error:', error.message);
      throw new Error(error.message);
    }

    return (data ?? []) as MatchWithTrainers[];
  },
);

// ============================================================================
// Active Split Info (for results tab)
// ============================================================================

export interface ActiveSplitInfo {
  season: Season;
  split: Split;
  leagues: League[];
}

export const getActiveSplitInfo = cache(
  async (): Promise<ActiveSplitInfo | null> => {
    const supabase = await createClient();

    // Get active season
    const { data: seasonData, error: seasonError } = await supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .single();

    if (seasonError || !seasonData) {
      return null;
    }

    const season = seasonData as Season;

    // Get active split
    const { data: splitData, error: splitError } = await supabase
      .from('splits')
      .select('*')
      .eq('season_id', season.id)
      .eq('is_active', true)
      .single();

    if (splitError || !splitData) {
      return null;
    }

    const split = splitData as Split;

    // Get leagues for this split
    const { data: leaguesData } = await supabase
      .from('leagues')
      .select('*')
      .eq('split_id', split.id)
      .order('tier_priority', { ascending: true });

    return {
      season,
      split,
      leagues: (leaguesData ?? []) as League[],
    };
  },
);
