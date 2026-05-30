/**
 * Central export point for all queries
 *
 * All queries use React cache() for deduplication within the same request.
 *
 * Usage in Server Components:
 * import { getActiveSeasonWithSplit, getDivisionPreview } from "@/lib/queries";
 */

// Admin queries
export {
  type ActiveSplitInfo,
  type DashboardStats,
  getActiveSplitInfo,
  getAdminLeaguesBySplit,
  getAdminMatchesByLeague,
  getAdminParticipantsByLeague,
  getAdminSeasons,
  getAdminSplitsBySeason,
  getAdminTrainers,
  getDashboardStats,
  type MatchWithTrainers,
  type ParticipantWithTrainer,
} from './admin.queries';
// Archive queries (cookie-free public reads — see REQ-21)
export {
  getArchiveChampions,
  getArchiveDivisionPreview,
  getPublicActiveSeasonWithSplit,
  getPublicAllSeasonsWithSplits,
  getPublicCurrentRound,
  type SplitChampions,
} from './archive.queries';
// Bracket / finals queries
export { type BracketData, getBracketData } from './bracket.queries';
// League queries (preferred for UI)
export {
  type DivisionPreview,
  getDivisionPreview,
  getLeagueByTier,
  getLeaguesBySplit,
  getMatchesByRound,
  getParticipantsBySplit,
  getRankingsByLeague,
  type LeagueInfo,
  type MatchEntry,
  type MatchesByRound,
  type MatchTrainer,
  type ParticipantEntry,
  type ParticipantsByDivision,
  type RankingEntry,
} from './leagues.queries';
// Season queries
export {
  getActiveSeasonWithSplit,
  getAllSeasons,
  getAllSeasonsWithSplits,
  getArchiveSplitParams,
  getSeasonByName,
  getSeasonWithSplits,
  getSplitByNames,
  type SeasonWithActiveSplit,
  type SeasonWithSplits,
} from './seasons.queries';
// Tournament / phase queries
export { getCurrentRound } from './tournament.queries';
// Trainer queries
export { getTrainerById, type TrainerProfileInfo } from './trainers.queries';
