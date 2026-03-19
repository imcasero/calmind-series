import { cache } from 'react';
import { fetchSplitData } from '@/lib/data/fetchData';
import {
  getDivisionPreview,
  getMatchesByRound,
  getParticipantsBySplit,
} from '@/lib/queries';
import {
  buildJ15Matchups,
  getFromJ15Match,
  getJ16Match,
} from '@/lib/services/matchService';
import type { J15Match, MatchupsGroup } from '@/lib/types/matches';
import type {
  DivisionPreview,
  MatchesByRound,
  ParticipantsByDivision,
} from '@/lib/types/queries.types';

interface SplitDataProviderProps {
  splitId: string;
  children: (data: {
    rankings: DivisionPreview;
    participants: ParticipantsByDivision;
    matches: MatchesByRound;
  }) => React.ReactNode;
}

/**
 * Server Component that provides all split data to children
 * Uses React 19's improved Server Component patterns
 */
export default async function SplitDataProvider({
  splitId,
  children,
}: SplitDataProviderProps) {
  // Fetch all data in parallel using React cache for deduplication
  const [rankings, participants, matches] = await Promise.all([
    getDivisionPreview(splitId),
    getParticipantsBySplit(splitId),
    getMatchesByRound(splitId),
  ]);

  return (
    <>
      {children({
        rankings,
        participants,
        matches,
      })}
    </>
  );
}

/**
 * Enhanced provider for J15 (Los Cruces) page with optimized data fetching
 */
interface CrucesDataProviderProps {
  splitId: string;
  primeraRanks: any[];
  segundaRanks: any[];
  children: (data: {
    primeraMatchups: MatchupsGroup;
    segundaMatchups: MatchupsGroup;
  }) => React.ReactNode;
}

export async function CrucesDataProvider({
  splitId,
  primeraRanks,
  segundaRanks,
  children,
}: CrucesDataProviderProps) {
  // Use the optimized fetch function
  const { leagues, j15Matches } = await fetchSplitData(splitId);

  const primeraLeague = leagues?.find((l: any) => l.tier_priority === 1);
  const segundaLeague = leagues?.find((l: any) => l.tier_priority === 2);

  // Build matchups using the service
  const [primeraMatchups, segundaMatchups] = await Promise.all([
    Promise.resolve(
      buildJ15Matchups(
        primeraRanks,
        j15Matches as J15Match[] | null,
        primeraLeague?.id,
      ),
    ),
    Promise.resolve(
      buildJ15Matchups(
        segundaRanks,
        j15Matches as J15Match[] | null,
        segundaLeague?.id,
      ),
    ),
  ]);

  return (
    <>
      {children({
        primeraMatchups,
        segundaMatchups,
      })}
    </>
  );
}

/**
 * Enhanced provider for J16 (Finals) page
 */
interface FinalsDataProviderProps {
  splitId: string;
  children: (data: {
    primeraFinals: any[];
    primeraRelegation: any[];
    segundaFinals: any[];
    segundaBottom: any[];
  }) => React.ReactNode;
}

export async function FinalsDataProvider({
  splitId,
  children,
}: FinalsDataProviderProps) {
  // Fetch all data at once
  const { leagues, j15Matches, j16Matches } = await fetchSplitData(splitId);

  const primeraLeague = leagues?.find((l: any) => l.tier_name === 'primera');
  const segundaLeague = leagues?.find((l: any) => l.tier_name === 'segunda');

  // Build all matchups
  const [primeraFinals, primeraRelegation, segundaFinals, segundaBottom] =
    await Promise.all([
      buildPrimeraFinals(primeraLeague?.id, j15Matches, j16Matches),
      buildPrimeraRelegation(primeraLeague?.id, j15Matches, j16Matches),
      buildSegundaFinals(segundaLeague?.id, j15Matches, j16Matches),
      buildSegundaBottom(segundaLeague?.id, j15Matches, j16Matches),
    ]);

  return (
    <>
      {children({
        primeraFinals,
        primeraRelegation,
        segundaFinals,
        segundaBottom,
      })}
    </>
  );
}

// Helper functions to build matchups
async function buildPrimeraFinals(
  leagueId: string | undefined,
  j15Matches: any[] | null,
  j16Matches: any[] | null,
) {
  const grandFinalMatch = getJ16Match(j16Matches, leagueId, 'grand_final');
  const thirdPlaceMatch = getJ16Match(j16Matches, leagueId, '3rd_place');

  return [
    {
      title: 'Grand Final',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_1', 'winner'),
        sets: grandFinalMatch?.played
          ? (grandFinalMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_2', 'winner'),
        sets: grandFinalMatch?.played
          ? (grandFinalMatch.away_sets ?? 0)
          : undefined,
      },
      played: grandFinalMatch?.played ?? false,
    },
    {
      title: '3rd Place',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_1', 'loser'),
        sets: thirdPlaceMatch?.played
          ? (thirdPlaceMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_2', 'loser'),
        sets: thirdPlaceMatch?.played
          ? (thirdPlaceMatch.away_sets ?? 0)
          : undefined,
      },
      played: thirdPlaceMatch?.played ?? false,
    },
  ];
}

async function buildPrimeraRelegation(
  leagueId: string | undefined,
  j15Matches: any[] | null,
  j16Matches: any[] | null,
) {
  const relegationMatch = getJ16Match(
    j16Matches,
    leagueId,
    'relegation_battle',
  );
  const honorMatch = getJ16Match(j16Matches, leagueId, 'honor_battle');

  return [
    {
      title: 'Lucha por Permanencia',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_1', 'winner'),
        sets: relegationMatch?.played
          ? (relegationMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_2', 'winner'),
        sets: relegationMatch?.played
          ? (relegationMatch.away_sets ?? 0)
          : undefined,
      },
      played: relegationMatch?.played ?? false,
    },
    {
      title: 'Morir de Pie',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_1', 'loser'),
        sets: honorMatch?.played ? (honorMatch.home_sets ?? 0) : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_2', 'loser'),
        sets: honorMatch?.played ? (honorMatch.away_sets ?? 0) : undefined,
      },
      played: honorMatch?.played ?? false,
    },
  ];
}

async function buildSegundaFinals(
  leagueId: string | undefined,
  j15Matches: any[] | null,
  j16Matches: any[] | null,
) {
  const segundaFinalMatch = getJ16Match(j16Matches, leagueId, 'segunda_final');
  const opportunityMatch = getJ16Match(j16Matches, leagueId, 'opportunity');

  return [
    {
      title: 'Final Segunda',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_1', 'winner'),
        sets: segundaFinalMatch?.played
          ? (segundaFinalMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_2', 'winner'),
        sets: segundaFinalMatch?.played
          ? (segundaFinalMatch.away_sets ?? 0)
          : undefined,
      },
      played: segundaFinalMatch?.played ?? false,
    },
    {
      title: 'La Oportunidad',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_1', 'loser'),
        sets: opportunityMatch?.played
          ? (opportunityMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'semi_2', 'loser'),
        sets: opportunityMatch?.played
          ? (opportunityMatch.away_sets ?? 0)
          : undefined,
      },
      played: opportunityMatch?.played ?? false,
    },
  ];
}

async function buildSegundaBottom(
  leagueId: string | undefined,
  j15Matches: any[] | null,
  j16Matches: any[] | null,
) {
  const lastChanceMatch = getJ16Match(j16Matches, leagueId, 'last_chance');
  const honorSegundaMatch = getJ16Match(j16Matches, leagueId, 'honor_segunda');

  return [
    {
      title: 'Last Chance',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_1', 'winner'),
        sets: lastChanceMatch?.played
          ? (lastChanceMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_2', 'winner'),
        sets: lastChanceMatch?.played
          ? (lastChanceMatch.away_sets ?? 0)
          : undefined,
      },
      played: lastChanceMatch?.played ?? false,
    },
    {
      title: 'El Combate del Honor',
      home: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_1', 'loser'),
        sets: honorSegundaMatch?.played
          ? (honorSegundaMatch.home_sets ?? 0)
          : undefined,
      },
      away: {
        ...getFromJ15Match(j15Matches, leagueId, 'survival_2', 'loser'),
        sets: honorSegundaMatch?.played
          ? (honorSegundaMatch.away_sets ?? 0)
          : undefined,
      },
      played: honorSegundaMatch?.played ?? false,
    },
  ];
}
