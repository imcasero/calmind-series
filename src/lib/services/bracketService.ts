import {
  buildJ15Matchups,
  getFromJ15Match,
  getJ16Match,
} from '@/lib/services/matchService';
import type { J15Match, J16Match, Matchup } from '@/lib/types/matches';
import type { RankingEntry } from '@/lib/types/schemas';

/**
 * Redesign bracket builder (FR7). Reuses the proven matchService helpers and the
 * live DB tag vocabulary; works in both projected (rankings fill J15, J16 = TBD)
 * and official (real matches) modes — matchService already degrades gracefully.
 */

type Division = 1 | 2;

interface DivisionTags {
  final: string;
  third: string;
  releg: string;
  honor: string;
  finalTitle: string;
  thirdTitle: string;
  relegTitle: string;
  honorTitle: string;
}

const DIVISION_TAGS: Record<Division, DivisionTags> = {
  1: {
    final: 'grand_final',
    third: '3rd_place',
    releg: 'relegation_battle',
    honor: 'honor_battle',
    finalTitle: 'Gran Final',
    thirdTitle: '3.º Puesto',
    relegTitle: 'Permanencia',
    honorTitle: 'Honor',
  },
  2: {
    final: 'segunda_final',
    third: 'opportunity',
    releg: 'last_chance',
    honor: 'honor_segunda',
    finalTitle: 'Final D2',
    thirdTitle: 'La Oportunidad',
    relegTitle: 'Última Bala',
    honorTitle: 'Honor',
  },
};

export interface BracketTeamVM {
  nickname: string;
  trainerId?: string;
  sets?: number;
}

export interface BracketMatchVM {
  title: string;
  tag: string;
  home: BracketTeamVM;
  away: BracketTeamVM;
  played: boolean;
}

export interface DivisionBracketVM {
  topSemis: BracketMatchVM[];
  topFinals: BracketMatchVM[];
  bottomSurvival: BracketMatchVM[];
  bottomFinals: BracketMatchVM[];
}

function matchupToVM(m: Matchup, tag: string): BracketMatchVM {
  return {
    title: m.title,
    tag,
    home: {
      nickname: m.home.nickname,
      trainerId: m.home.trainerId,
      sets: m.home.sets,
    },
    away: {
      nickname: m.away.nickname,
      trainerId: m.away.trainerId,
      sets: m.away.sets,
    },
    played: m.played ?? false,
  };
}

function finalsVM(
  title: string,
  tag: string,
  j15: J15Match[] | null,
  leagueId: string | undefined,
  tagA: string,
  tagB: string,
  type: 'winner' | 'loser',
  j16Match: J16Match | undefined,
): BracketMatchVM {
  const home = getFromJ15Match(j15, leagueId, tagA, type);
  const away = getFromJ15Match(j15, leagueId, tagB, type);
  return {
    title,
    tag,
    home: {
      nickname: home.nickname,
      trainerId: home.trainerId,
      sets: j16Match?.played ? (j16Match.home_sets ?? 0) : undefined,
    },
    away: {
      nickname: away.nickname,
      trainerId: away.trainerId,
      sets: j16Match?.played ? (j16Match.away_sets ?? 0) : undefined,
    },
    played: j16Match?.played ?? false,
  };
}

export function buildDivisionBracket(
  ranks: RankingEntry[],
  j15: J15Match[] | null,
  j16: J16Match[] | null,
  leagueId: string | undefined,
  division: Division,
): DivisionBracketVM {
  const tags = DIVISION_TAGS[division];
  const j15Group = buildJ15Matchups(ranks, j15, leagueId);

  const topSemis = [
    matchupToVM(j15Group.top4[0], 'semi_1'),
    matchupToVM(j15Group.top4[1], 'semi_2'),
  ];
  const bottomSurvival = [
    matchupToVM(j15Group.bottom4[0], 'survival_1'),
    matchupToVM(j15Group.bottom4[1], 'survival_2'),
  ];

  const topFinals = [
    finalsVM(
      tags.finalTitle,
      tags.final,
      j15,
      leagueId,
      'semi_1',
      'semi_2',
      'winner',
      getJ16Match(j16, leagueId, tags.final),
    ),
    finalsVM(
      tags.thirdTitle,
      tags.third,
      j15,
      leagueId,
      'semi_1',
      'semi_2',
      'loser',
      getJ16Match(j16, leagueId, tags.third),
    ),
  ];

  const bottomFinals = [
    finalsVM(
      tags.relegTitle,
      tags.releg,
      j15,
      leagueId,
      'survival_1',
      'survival_2',
      'winner',
      getJ16Match(j16, leagueId, tags.releg),
    ),
    finalsVM(
      tags.honorTitle,
      tags.honor,
      j15,
      leagueId,
      'survival_1',
      'survival_2',
      'loser',
      getJ16Match(j16, leagueId, tags.honor),
    ),
  ];

  return { topSemis, topFinals, bottomSurvival, bottomFinals };
}
