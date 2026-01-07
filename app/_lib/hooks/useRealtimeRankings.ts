'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../supabase/client';
import type { Player, DivisionParticipant } from '../types/database.types';

export function useRealtimeRankings(divisionId: string, initialPlayers: Player[], divisionName: 'Primera' | 'Segunda') {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isLive, setIsLive] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase
      .channel(`division_${divisionId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'division_participants',
          filter: `division_id=eq.${divisionId}`,
        },
        async () => {
          // Refetch data when any change occurs
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
            .eq('division_id', divisionId)
            .order('points', { ascending: false })
            .order('matches_won', { ascending: false });

          if (participantsData && participantsData.length > 0) {
            const updatedPlayers: Player[] = participantsData.map((participant, index: number) => {
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

            setPlayers(updatedPlayers);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsLive(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [divisionId, divisionName, supabase]);

  return { players, isLive };
}
