import type { Participant } from '@/lib/types/participant.types';
import type { Player } from '@/lib/types/player.types';

/**
 * Mock data for Primera División
 */

export const primeraPlayers: Player[] = [
  {
    id: 1,
    name: 'Entrenador 1',
    avatar: '1',
    pj: 5,
    pg: 5,
    pp: 0,
    points: 15,
    isChampion: true,
  },
  {
    id: 2,
    name: 'Entrenador 2',
    avatar: '2',
    pj: 5,
    pg: 4,
    pp: 1,
    points: 12,
  },
  {
    id: 3,
    name: 'Entrenador 3',
    avatar: '3',
    pj: 5,
    pg: 3,
    pp: 2,
    points: 9,
  },
];

export const primeraParticipants: Participant[] = [
  {
    id: 1,
    name: 'Entrenador 1',
    avatar: '1',
    pj: 5,
    pg: 5,
    pp: 0,
    points: 15,
    twitterUrl: 'https://twitter.com/example',
    twitchUrl: 'https://twitch.tv/example',
  },
  {
    id: 2,
    name: 'Entrenador 2',
    avatar: '2',
    pj: 5,
    pg: 4,
    pp: 1,
    points: 12,
    instagramUrl: 'https://instagram.com/example',
  },
  {
    id: 3,
    name: 'Entrenador 3',
    avatar: '3',
    pj: 5,
    pg: 3,
    pp: 2,
    points: 9,
  },
];
