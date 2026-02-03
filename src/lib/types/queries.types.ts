/**
 * Types for query results - safe to import in client components
 */

/**
 * Ranking entry formatted for UI display
 */
export type RankingEntry = {
  position: number;
  nickname: string;
  totalPoints: number;
  avatarUrl: string | null;
  setBalance: number;
  matchesPlayed: number;
  totalSetsWon: number;
  trainerId: string;
  lives: number;
};

/**
 * Division preview with rankings ready for display
 */
export type DivisionPreview = {
  primera: RankingEntry[];
  segunda: RankingEntry[];
};

/**
 * Participant entry for UI display
 */
export type ParticipantEntry = {
  trainerId: string;
  nickname: string;
  avatarUrl: string | null;
  lives: number;
};

/**
 * Participants grouped by division
 */
export type ParticipantsByDivision = {
  primera: ParticipantEntry[];
  segunda: ParticipantEntry[];
};

/**
 * Trainer info for match display
 */
export type MatchTrainer = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

/**
 * Match entry for UI display
 */
export type MatchEntry = {
  id: string;
  round: number;
  matchGroup: string;
  matchTag: string;
  played: boolean;
  homeSets: number;
  awaySets: number;
  homeTrainer: MatchTrainer | null;
  awayTrainer: MatchTrainer | null;
  leagueId: string | null;
  leagueTierName: string | null;
};

/**
 * Matches grouped by round (jornada)
 */
export type MatchesByRound = {
  round: number;
  matches: MatchEntry[];
}[];

/**
 * League info for display
 */
export type LeagueInfo = {
  id: string;
  tierName: string;
  tierPriority: number;
};
