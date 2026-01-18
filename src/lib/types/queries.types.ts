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
};

/**
 * Participants grouped by division
 */
export type ParticipantsByDivision = {
  primera: ParticipantEntry[];
  segunda: ParticipantEntry[];
};
