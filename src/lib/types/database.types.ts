/**
 * Auto-generated types from Supabase
 * Run `supabase gen types typescript` to regenerate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      league_participants: {
        Row: {
          id: string;
          initial_seed: number | null;
          league_id: string | null;
          status: string | null;
          trainer_id: string | null;
        };
        Insert: {
          id?: string;
          initial_seed?: number | null;
          league_id?: string | null;
          status?: string | null;
          trainer_id?: string | null;
        };
        Update: {
          id?: string;
          initial_seed?: number | null;
          league_id?: string | null;
          status?: string | null;
          trainer_id?: string | null;
        };
      };
      leagues: {
        Row: {
          created_at: string | null;
          id: string;
          split_id: string | null;
          tier_name: string;
          tier_priority: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          split_id?: string | null;
          tier_name: string;
          tier_priority: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          split_id?: string | null;
          tier_name?: string;
          tier_priority?: number;
        };
      };
      matches: {
        Row: {
          away_sets: number | null;
          away_trainer_id: string | null;
          created_at: string | null;
          home_sets: number | null;
          home_trainer_id: string | null;
          id: string;
          league_id: string | null;
          match_group: string;
          match_tag: string;
          metadata: Json | null;
          played: boolean | null;
          round: number;
          split_id: string | null;
        };
        Insert: {
          away_sets?: number | null;
          away_trainer_id?: string | null;
          created_at?: string | null;
          home_sets?: number | null;
          home_trainer_id?: string | null;
          id?: string;
          league_id?: string | null;
          match_group: string;
          match_tag: string;
          metadata?: Json | null;
          played?: boolean | null;
          round: number;
          split_id?: string | null;
        };
        Update: {
          away_sets?: number | null;
          away_trainer_id?: string | null;
          created_at?: string | null;
          home_sets?: number | null;
          home_trainer_id?: string | null;
          id?: string;
          league_id?: string | null;
          match_group?: string;
          match_tag?: string;
          metadata?: Json | null;
          played?: boolean | null;
          round?: number;
          split_id?: string | null;
        };
      };
      seasons: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          year: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          year: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          year?: number;
        };
      };
      splits: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          season_id: string | null;
          split_order: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          season_id?: string | null;
          split_order: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          season_id?: string | null;
          split_order?: number;
        };
      };
      trainers: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          id: string;
          nickname: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          id?: string;
          nickname: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          id?: string;
          nickname?: string;
        };
      };
    };
    Views: {
      league_rankings: {
        Row: {
          avatar_url: string | null;
          league_id: string | null;
          matches_played: number | null;
          nickname: string | null;
          position: number | null;
          set_balance: number | null;
          total_points: number | null;
          total_sets_won: number | null;
          trainer_id: string | null;
        };
      };
      league_standings: {
        Row: {
          avatar_url: string | null;
          league_id: string | null;
          matches_played: number | null;
          nickname: string | null;
          set_balance: number | null;
          total_points: number | null;
          total_sets_won: number | null;
          trainer_id: string | null;
        };
      };
      player_match_performance: {
        Row: {
          league_id: string | null;
          match_group: string | null;
          match_id: string | null;
          points_earned: number | null;
          round: number | null;
          sets_lost: number | null;
          sets_won: number | null;
          trainer_id: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Convenience exports
export type Season = Tables<'seasons'>;
export type Split = Tables<'splits'>;
export type League = Tables<'leagues'>;
export type Trainer = Tables<'trainers'>;
export type Match = Tables<'matches'>;
export type LeagueParticipant = Tables<'league_participants'>;

export type LeagueRanking = Views<'league_rankings'>;
export type LeagueStanding = Views<'league_standings'>;
export type PlayerMatchPerformance = Views<'player_match_performance'>;
