import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
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
  trainers?: Trainer;
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
