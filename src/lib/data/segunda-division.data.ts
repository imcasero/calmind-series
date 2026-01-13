import type { Participant } from '@/lib/types/participant.types';
import type { Player } from '@/lib/types/player.types';

/**
 * Mock data for Segunda División
 */

export const segundaPlayers: Player[] = [
  {
    id: 1,
    name: 'Entrenador A',
    avatar: '10',
    pj: 4,
    pg: 4,
    pp: 0,
    points: 12,
    isPromoted: true,
  },
  {
    id: 2,
    name: 'Entrenador B',
    avatar: '11',
    pj: 4,
    pg: 3,
    pp: 1,
    points: 9,
    isPromoted: true,
  },
  {
    id: 3,
    name: 'Entrenador C',
    avatar: '12',
    pj: 4,
    pg: 2,
    pp: 2,
    points: 6,
  },
  {
    id: 4,
    name: 'Entrenador D',
    avatar: '13',
    pj: 4,
    pg: 1,
    pp: 3,
    points: 3,
  },
];

export const segundaParticipants: Participant[] = [
  {
    id: 1,
    name: 'Entrenador A',
    avatar: '10',
    pj: 4,
    pg: 4,
    pp: 0,
    points: 12,
    twitterUrl: 'https://twitter.com/example',
  },
  {
    id: 2,
    name: 'Entrenador B',
    avatar: '11',
    pj: 4,
    pg: 3,
    pp: 1,
    points: 9,
    twitchUrl: 'https://twitch.tv/example',
  },
  {
    id: 3,
    name: 'Entrenador C',
    avatar: '12',
    pj: 4,
    pg: 2,
    pp: 2,
    points: 6,
  },
  {
    id: 4,
    name: 'Entrenador D',
    avatar: '13',
    pj: 4,
    pg: 1,
    pp: 3,
    points: 3,
  },
];
