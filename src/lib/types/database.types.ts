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
          lives: number;
          status: string | null;
          trainer_id: string | null;
        };
        Insert: {
          id?: string;
          initial_seed?: number | null;
          league_id?: string | null;
          lives?: number;
          status?: string | null;
          trainer_id?: string | null;
        };
        Update: {
          id?: string;
          initial_seed?: number | null;
          league_id?: string | null;
          lives?: number;
          status?: string | null;
          trainer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'league_participants_league_id_fkey';
            columns: ['league_id'];
            isOneToOne: false;
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'league_participants_trainer_id_fkey';
            columns: ['trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'leagues_split_id_fkey';
            columns: ['split_id'];
            isOneToOne: false;
            referencedRelation: 'splits';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'matches_away_trainer_id_fkey';
            columns: ['away_trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_home_trainer_id_fkey';
            columns: ['home_trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_league_id_fkey';
            columns: ['league_id'];
            isOneToOne: false;
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_split_id_fkey';
            columns: ['split_id'];
            isOneToOne: false;
            referencedRelation: 'splits';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'splits_season_id_fkey';
            columns: ['season_id'];
            isOneToOne: false;
            referencedRelation: 'seasons';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'league_participants_league_id_fkey';
            columns: ['league_id'];
            isOneToOne: false;
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'league_participants_trainer_id_fkey';
            columns: ['trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'league_participants_league_id_fkey';
            columns: ['league_id'];
            isOneToOne: false;
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'league_participants_trainer_id_fkey';
            columns: ['trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'matches_away_trainer_id_fkey';
            columns: ['away_trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_home_trainer_id_fkey';
            columns: ['home_trainer_id'];
            isOneToOne: false;
            referencedRelation: 'trainers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_league_id_fkey';
            columns: ['league_id'];
            isOneToOne: false;
            referencedRelation: 'leagues';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_split_id_fkey';
            columns: ['split_id'];
            isOneToOne: false;
            referencedRelation: 'splits';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

// Convenience exports for frequently used types
export type Season = Tables<'seasons'>;
export type Split = Tables<'splits'>;
export type League = Tables<'leagues'>;
export type Trainer = Tables<'trainers'>;
export type Match = Tables<'matches'>;
export type LeagueParticipant = Tables<'league_participants'>;

export type LeagueRanking = Tables<'league_rankings'>;
export type LeagueStanding = Tables<'league_standings'>;
export type PlayerMatchPerformance = Tables<'player_match_performance'>;
