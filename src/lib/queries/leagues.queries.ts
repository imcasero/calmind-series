import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { LeagueRanking } from '@/lib/types/database.types';
import {
  type DivisionPreview,
  type LeagueInfo,
  type MatchEntry,
  type MatchesByRound,
  type MatchTrainer,
  type ParticipantEntry,
  type ParticipantsByDivision,
  type RankingEntry,
  RankingEntrySchema,
} from '@/lib/types/schemas';
import { applyTiebreakerRules } from '@/lib/utils/ranking';

export type {
  DivisionPreview,
  LeagueInfo,
  MatchEntry,
  MatchesByRound,
  ParticipantEntry,
  ParticipantsByDivision,
  RankingEntry,
  MatchTrainer,
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

    return (data ?? []) as LeagueInfo[];
  },
);

/**
 * Gets rankings for a specific league, formatted for UI
 */
export const getRankingsByLeague = cache(
  async (leagueId: string): Promise<RankingEntry[]> => {
    const supabase = await createClient();

    // Fetch rankings and lives in parallel (Next.js best practice)
    const [
      { data: rankingsData, error: rankingsError },
      { data: participantsData, error: participantsError },
    ] = await Promise.all([
      supabase
        .from('league_rankings')
        .select('*')
        .eq('league_id', leagueId)
        .not('position', 'is', null)
        .not('nickname', 'is', null)
        .order('position', { ascending: true }),
      supabase
        .from('league_participants')
        .select('trainer_id, lives')
        .eq('league_id', leagueId),
    ]);

    if (rankingsError) {
      console.error('[getRankingsByLeague] Error:', rankingsError.message);
      return [];
    }

    if (participantsError) {
      console.error(
        '[getRankingsByLeague] Error fetching lives:',
        participantsError.message,
      );
      return [];
    }

    // Create a map of trainer_id to lives
    const livesMap = new Map(
      (participantsData ?? []).map((p) => [p.trainer_id, p.lives]),
    );

    // Use Zod to validate and format the rankings
    const rankings: RankingEntry[] = [];

    for (const ranking of (rankingsData ?? []) as LeagueRanking[]) {
      const lives = livesMap.get(ranking.trainer_id ?? '') ?? 0;

      const result = RankingEntrySchema.safeParse({
        position: ranking.position,
        nickname: ranking.nickname,
        totalPoints: ranking.total_points ?? 0,
        avatarUrl: ranking.avatar_url,
        setBalance: ranking.set_balance ?? 0,
        matchesPlayed: ranking.matches_played ?? 0,
        totalSetsWon: ranking.total_sets_won ?? 0,
        trainerId: ranking.trainer_id,
        lives,
      });

      if (!result.success) {
        console.error(
          '[getRankingsByLeague] Skipping invalid ranking:',
          result.error.flatten(),
        );
        continue;
      }

      rankings.push(result.data);
    }

    return rankings;
  },
);

/**
 * Gets both divisions with their rankings for a split.
 * Returns data formatted and ready for UI display with tiebreaker rules applied.
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

    // Fetch rankings and matches in parallel
    const [primeraRankings, segundaRankings, matchesByRound] =
      await Promise.all([
        primeraLeague
          ? getRankingsByLeague(primeraLeague.id)
          : Promise.resolve([]),
        segundaLeague
          ? getRankingsByLeague(segundaLeague.id)
          : Promise.resolve([]),
        getMatchesByRound(splitId),
      ]);

    // Extract all matches from the grouped structure
    const allMatches = matchesByRound.flatMap((round) => round.matches);

    // Filter matches by league and apply tiebreaker rules
    const primeraMatches = primeraLeague
      ? allMatches.filter((m) => m.leagueId === primeraLeague.id)
      : [];
    const segundaMatches = segundaLeague
      ? allMatches.filter((m) => m.leagueId === segundaLeague.id)
      : [];

    const primera =
      primeraRankings.length > 0
        ? applyTiebreakerRules(primeraRankings, primeraMatches)
        : [];
    const segunda =
      segundaRankings.length > 0
        ? applyTiebreakerRules(segundaRankings, segundaMatches)
        : [];

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

    return data as LeagueInfo;
  },
);

/**
 * Gets all participants for a split, grouped by division
 */
export const getParticipantsBySplit = cache(
  async (splitId: string): Promise<ParticipantsByDivision> => {
    const supabase = await createClient();

    // Get leagues for this split
    const leagues = await getLeaguesBySplit(splitId);

    if (leagues.length === 0) {
      return { primera: [], segunda: [] };
    }

    const primeraLeague = leagues.find((l) => l.tier_priority === 1);
    const segundaLeague = leagues.find((l) => l.tier_priority === 2);

    // Fetch participants for each league
    const fetchParticipants = async (
      leagueId: string,
    ): Promise<ParticipantEntry[]> => {
      const { data, error } = await supabase
        .from('league_participants')
        .select(
          `
          trainer_id,
          lives,
          trainers!inner(
            id,
            nickname,
            avatar_url
          )
        `,
        )
        .eq('league_id', leagueId)
        .eq('status', 'active');

      if (error) {
        console.error('[getParticipantsBySplit] Error:', error.message);
        return [];
      }

      type ParticipantRow = {
        trainer_id: string | null;
        lives: number;
        trainers: {
          id: string;
          nickname: string;
          avatar_url: string | null;
        };
      };

      return ((data ?? []) as ParticipantRow[]).map((p) => ({
        trainerId: p.trainers.id,
        nickname: p.trainers.nickname,
        avatarUrl: p.trainers.avatar_url,
        lives: p.lives,
      }));
    };

    const [primera, segunda] = await Promise.all([
      primeraLeague ? fetchParticipants(primeraLeague.id) : Promise.resolve([]),
      segundaLeague ? fetchParticipants(segundaLeague.id) : Promise.resolve([]),
    ]);

    // Sort alphabetically
    primera.sort((a, b) => a.nickname.localeCompare(b.nickname));
    segunda.sort((a, b) => a.nickname.localeCompare(b.nickname));

    return { primera, segunda };
  },
);

/**
 * Gets all matches for a split, grouped by round (jornada).
 * Only returns regular season matches (match_group = 'regular').
 */
export const getMatchesByRound = cache(
  async (splitId: string): Promise<MatchesByRound> => {
    const supabase = await createClient();

    // Get leagues for tier lookup (use priority to identify Primera/Segunda)
    const leagues = await getLeaguesBySplit(splitId);
    // Map league_id to normalized tier name based on priority
    const leagueMap = new Map(
      leagues.map((l) => [
        l.id,
        l.tier_priority === 1
          ? 'Primera'
          : l.tier_priority === 2
            ? 'Segunda'
            : l.tier_name,
      ]),
    );

    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        id,
        round,
        match_group,
        match_tag,
        played,
        home_sets,
        away_sets,
        league_id,
        home_trainer:trainers!matches_home_trainer_id_fkey(
          id,
          nickname,
          avatar_url
        ),
        away_trainer:trainers!matches_away_trainer_id_fkey(
          id,
          nickname,
          avatar_url
        )
      `,
      )
      .eq('split_id', splitId)
      .eq('match_group', 'regular')
      .order('round', { ascending: true })
      .order('league_id', { ascending: true });

    if (error) {
      console.error('[getMatchesByRound] Error:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    type MatchRow = {
      id: string;
      round: number;
      match_group: string;
      match_tag: string;
      played: boolean | null;
      home_sets: number | null;
      away_sets: number | null;
      league_id: string | null;
      home_trainer: {
        id: string;
        nickname: string;
        avatar_url: string | null;
      } | null;
      away_trainer: {
        id: string;
        nickname: string;
        avatar_url: string | null;
      } | null;
    };

    // Transform and group by round
    const matchesByRoundMap = new Map<number, MatchEntry[]>();

    for (const row of data as MatchRow[]) {
      const match: MatchEntry = {
        id: row.id,
        round: row.round,
        matchGroup: row.match_group,
        matchTag: row.match_tag,
        played: row.played ?? false,
        homeSets: row.home_sets ?? 0,
        awaySets: row.away_sets ?? 0,
        leagueId: row.league_id,
        leagueTierName: row.league_id
          ? (leagueMap.get(row.league_id) ?? null)
          : null,
        homeTrainer: row.home_trainer
          ? {
              id: row.home_trainer.id,
              nickname: row.home_trainer.nickname,
              avatarUrl: row.home_trainer.avatar_url,
            }
          : null,
        awayTrainer: row.away_trainer
          ? {
              id: row.away_trainer.id,
              nickname: row.away_trainer.nickname,
              avatarUrl: row.away_trainer.avatar_url,
            }
          : null,
      };

      const roundMatches = matchesByRoundMap.get(row.round) ?? [];
      roundMatches.push(match);
      matchesByRoundMap.set(row.round, roundMatches);
    }

    // Convert to array sorted by round
    return Array.from(matchesByRoundMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([round, matches]) => ({ round, matches }));
  },
);
