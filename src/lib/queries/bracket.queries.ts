import { cache } from 'react';
import { getLeaguesBySplit } from '@/lib/queries/leagues.queries';
import { createClient } from '@/lib/supabase/server';
import type { J15Match, J16Match } from '@/lib/types/matches';

export interface BracketData {
  primeraLeagueId?: string;
  segundaLeagueId?: string;
  j15Matches: J15Match[];
  j16Matches: J16Match[];
}

type BracketRow = {
  id: string;
  league_id: string | null;
  match_tag: string;
  round: number;
  home_trainer_id: string | null;
  away_trainer_id: string | null;
  home_sets: number | null;
  away_sets: number | null;
  played: boolean | null;
  home: { nickname: string; avatar_url: string | null } | null;
  away: { nickname: string; avatar_url: string | null } | null;
};

/**
 * Fetches the finals matches (rounds 15 & 16) for a split, with trainer joins,
 * plus the division league ids. Feeds the bracket builder (FR7). Tag vocabulary
 * matches the live app (semi_1/2, survival_1/2, grand_final, 3rd_place,
 * relegation_battle, honor_battle, segunda_final, opportunity, last_chance,
 * honor_segunda) — confirmed via the existing matchService/finals page.
 */
export const getBracketData = cache(
  async (splitId: string): Promise<BracketData> => {
    const supabase = await createClient();
    const leagues = await getLeaguesBySplit(splitId);
    const primeraLeagueId = leagues.find((l) => l.tier_priority === 1)?.id;
    const segundaLeagueId = leagues.find((l) => l.tier_priority === 2)?.id;

    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        id,
        league_id,
        match_tag,
        round,
        home_trainer_id,
        away_trainer_id,
        home_sets,
        away_sets,
        played,
        home:trainers!matches_home_trainer_id_fkey(nickname, avatar_url),
        away:trainers!matches_away_trainer_id_fkey(nickname, avatar_url)
      `,
      )
      .eq('split_id', splitId)
      .in('round', [15, 16]);

    if (error) {
      console.error('[getBracketData] Error:', error.message);
      return {
        primeraLeagueId,
        segundaLeagueId,
        j15Matches: [],
        j16Matches: [],
      };
    }

    const rows = (data ?? []) as unknown as BracketRow[];
    const j15Matches = rows.filter((r) => r.round === 15) as J15Match[];
    const j16Matches = rows.filter((r) => r.round === 16) as J16Match[];

    return { primeraLeagueId, segundaLeagueId, j15Matches, j16Matches };
  },
);
