import type { RankingEntry } from '@/lib/types/schemas';
import type { J15Match, J16Match, Matchup, MatchupsGroup, Team } from '@/lib/types/matches';
import { MATCH_TAGS, ROUNDS } from '@/lib/constants/matches';

/**
 * Service for building match data and matchups
 */
export class MatchService {
  /**
   * Creates a team object from ranking data
   */
  static getTeam(ranks: RankingEntry[], position: number): Team {
    const team = ranks.find((r) => r.position === position);
    return {
      nickname: team?.nickname || `TBD (${position}º)`,
      position: position,
      trainerId: team?.trainerId,
    };
  }

  /**
   * Finds a match result by tag and league ID
   */
  static getMatchResult(
    matches: J15Match[] | null,
    tag: string,
    leagueId?: string
  ): J15Match | undefined {
    return matches?.find((m) => m.league_id === leagueId && m.match_tag === tag);
  }

  /**
   * Builds matchups for J15 (Los Cruces)
   */
  static buildJ15Matchups(
    ranks: RankingEntry[],
    j15Matches: J15Match[] | null,
    leagueId?: string
  ): MatchupsGroup {
    const getTeam = (pos: number) => this.getTeam(ranks, pos);
    const getMatch = (tag: string) => this.getMatchResult(j15Matches, tag, leagueId);

    // Semifinal 1: 1º vs 4º
    const semi1Match = getMatch(MATCH_TAGS.SEMI_1);
    const semi1Home = getTeam(1);
    const semi1Away = getTeam(4);

    // Semifinal 2: 2º vs 3º
    const semi2Match = getMatch(MATCH_TAGS.SEMI_2);
    const semi2Home = getTeam(2);
    const semi2Away = getTeam(3);

    // Survival 1: 5º vs 8º
    const surv1Match = getMatch(MATCH_TAGS.SURVIVAL_1);
    const surv1Home = getTeam(5);
    const surv1Away = getTeam(8);

    // Survival 2: 6º vs 7º
    const surv2Match = getMatch(MATCH_TAGS.SURVIVAL_2);
    const surv2Home = getTeam(6);
    const surv2Away = getTeam(7);

    return {
      top4: [
        {
          title: 'Semifinal 1',
          home: {
            ...semi1Home,
            sets: semi1Match?.played ? semi1Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...semi1Away,
            sets: semi1Match?.played ? semi1Match.away_sets ?? 0 : undefined,
          },
          played: semi1Match?.played ?? false,
        },
        {
          title: 'Semifinal 2',
          home: {
            ...semi2Home,
            sets: semi2Match?.played ? semi2Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...semi2Away,
            sets: semi2Match?.played ? semi2Match.away_sets ?? 0 : undefined,
          },
          played: semi2Match?.played ?? false,
        },
      ],
      bottom4: [
        {
          title: 'Supervivencia 1',
          home: {
            ...surv1Home,
            sets: surv1Match?.played ? surv1Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...surv1Away,
            sets: surv1Match?.played ? surv1Match.away_sets ?? 0 : undefined,
          },
          played: surv1Match?.played ?? false,
        },
        {
          title: 'Supervivencia 2',
          home: {
            ...surv2Home,
            sets: surv2Match?.played ? surv2Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...surv2Away,
            sets: surv2Match?.played ? surv2Match.away_sets ?? 0 : undefined,
          },
          played: surv2Match?.played ?? false,
        },
      ],
    };
  }

  /**
   * Gets winner or loser from a J15 match
   */
  static getFromJ15Match(
    j15Matches: any[] | null,
    leagueId: string | undefined,
    tag: string,
    type: 'winner' | 'loser'
  ): Team {
    const match = j15Matches?.find(
      (m) => m.league_id === leagueId && m.match_tag === tag,
    );
    
    if (!match) return { nickname: 'TBD', position: 0 };

    if (!match.played) {
      const label = type === 'winner' ? 'Ganador' : 'Perdedor';
      const tagName = tag
        .replace('semi_', 'Semi ')
        .replace('survival_', 'Superv. ');
      return { nickname: `${label} ${tagName}`, position: 0 };
    }

    const isHomeWinner = (match.home_sets || 0) > (match.away_sets || 0);
    const winner = isHomeWinner ? match.home : match.away;
    const loser = isHomeWinner ? match.away : match.home;

    const target = type === 'winner' ? winner : loser;
    return {
      nickname: target?.nickname || 'Unknown',
      position: 0,
      avatar_url: target?.avatar_url,
    };
  }

  /**
   * Finds a J16 match by tag and league ID
   */
  static getJ16Match(
    j16Matches: J16Match[] | null,
    leagueId: string | undefined,
    tag: string
  ): J16Match | undefined {
    return j16Matches?.find((m) => m.league_id === leagueId && m.match_tag === tag);
  }
}
