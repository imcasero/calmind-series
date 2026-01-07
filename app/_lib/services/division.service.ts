import { createServerClient } from '../supabase/server';
import type { Player, Participant, DivisionParticipant } from '../types/database.types';

export interface DivisionData {
  season: {
    id: string;
    name: string;
  } | null;
  division: {
    id: string;
    name: string;
  } | null;
  divisionId: string | null;
  players: Player[];
  participants: Participant[];
  hasData: boolean;
}

export async function getDivisionData(divisionName: 'Primera' | 'Segunda'): Promise<DivisionData> {
  const supabase = await createServerClient();

  // 1. Get active season
  const { data: activeSeasonData } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('is_active', true)
    .single();

  if (!activeSeasonData) {
    return {
      season: null,
      division: null,
      divisionId: null,
      players: [],
      participants: [],
      hasData: false,
    };
  }

  // 2. Get division
  const { data: divisionData } = await supabase
    .from('divisions')
    .select('id, name')
    .eq('season_id', activeSeasonData.id)
    .eq('name', divisionName)
    .single();

  if (!divisionData) {
    return {
      season: activeSeasonData,
      division: null,
      divisionId: null,
      players: [],
      participants: [],
      hasData: false,
    };
  }

  // 3. Get participants
  const { data: participantsData } = await supabase
    .from('division_participants')
    .select(`
      id,
      matches_played,
      matches_won,
      matches_lost,
      points,
      trainers (
        id,
        name,
        twitch_url,
        twitter_url,
        instagram_url
      )
    `)
    .eq('division_id', divisionData.id)
    .order('points', { ascending: false })
    .order('matches_won', { ascending: false });

  if (!participantsData || participantsData.length === 0) {
    return {
      season: activeSeasonData,
      division: divisionData,
      divisionId: divisionData.id,
      players: [],
      participants: [],
      hasData: false,
    };
  }

  // 4. Transform data for Players (Classification Table)
  const players: Player[] = participantsData.map((participant: DivisionParticipant, index: number) => {
    const trainer = Array.isArray(participant.trainers)
      ? participant.trainers[0]
      : participant.trainers;

    return {
      id: index + 1,
      name: trainer?.name || 'Sin nombre',
      avatar: String(index + 1),
      pj: participant.matches_played,
      pg: participant.matches_won,
      pp: participant.matches_lost,
      points: participant.points,
      isChampion: divisionName === 'Primera' && index === 0,
      isPromoted: divisionName === 'Segunda' && index < 2,
    };
  });

  // 5. Transform data for Participants (Participants Grid)
  const participants: Participant[] = participantsData.map((participant: DivisionParticipant, index: number) => {
    const trainer = Array.isArray(participant.trainers)
      ? participant.trainers[0]
      : participant.trainers;

    return {
      id: index + 1,
      name: trainer?.name || 'Sin nombre',
      avatar: String(index + 1),
      pj: participant.matches_played,
      pg: participant.matches_won,
      pp: participant.matches_lost,
      points: participant.points,
      twitchUrl: trainer?.twitch_url,
      twitterUrl: trainer?.twitter_url,
      instagramUrl: trainer?.instagram_url,
      isChampion: divisionName === 'Primera' && index === 0,
      isPromoted: divisionName === 'Segunda' && index < 2,
    };
  });

  return {
    season: activeSeasonData,
    division: divisionData,
    divisionId: divisionData.id,
    players,
    participants,
    hasData: true,
  };
}
