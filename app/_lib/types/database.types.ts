// Types based on Supabase database schema

export interface Trainer {
  id: string;
  name: string;
  twitch_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  created_at: string;
}

export interface Division {
  id: string;
  season_id: string;
  name: string;
  created_at: string;
}

export interface DivisionParticipant {
  id: string;
  division_id: string;
  trainer_id: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  points: number;
  created_at: string;
  trainers?: Trainer | Trainer[];
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  division_id: string;
  trainer1_id: string;
  trainer2_id: string;
  scheduled_date: string;
  week_number: number;
  winner_id?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  stream_url?: string;
  created_at: string;
}

// Frontend types
export interface Player {
  id: number;
  name: string;
  avatar: string;
  pj: number;
  pg: number;
  pp: number;
  points: number;
  isChampion?: boolean;
  isPromoted?: boolean;
}

export interface Participant {
  id: number;
  name: string;
  avatar: string;
  pj: number;
  pg: number;
  pp: number;
  points: number;
  twitchUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  isChampion?: boolean;
  isPromoted?: boolean;
}
