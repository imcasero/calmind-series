/**
 * Participant types for participant cards
 */

export interface Participant {
  id: number;
  name: string;
  avatar: string;
  pj: number;
  pg: number;
  pp: number;
  points: number;
  twitterUrl?: string;
  twitchUrl?: string;
  instagramUrl?: string;
  isChampion?: boolean;
  isPromoted?: boolean;
}

export interface SocialMedia {
  twitterUrl?: string;
  twitchUrl?: string;
  instagramUrl?: string;
}
