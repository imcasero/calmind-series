/**
 * Match-related type definitions
 */
export interface J15Match {
  id: string;
  league_id: string | null;
  match_tag: string;
  home_trainer_id: string | null;
  away_trainer_id: string | null;
  home_sets: number | null;
  away_sets: number | null;
  played: boolean | null;
  // Optional nested trainer data when fetched with joins
  home?: {
    nickname: string;
    avatar_url?: string | null;
  } | null;
  away?: {
    nickname: string;
    avatar_url?: string | null;
  } | null;
}

export interface J16Match {
  id: string;
  league_id: string | null;
  match_tag: string;
  home_trainer_id: string | null;
  away_trainer_id: string | null;
  home_sets: number | null;
  away_sets: number | null;
  played: boolean | null;
}

export interface Team {
  nickname: string;
  position: number;
  trainerId?: string;
  sets?: number;
  avatar_url?: string | null;
}

export interface Matchup {
  title: string;
  home: Team;
  away: Team;
  played?: boolean;
}

export interface MatchupsGroup {
  top4: Matchup[];
  bottom4: Matchup[];
}
