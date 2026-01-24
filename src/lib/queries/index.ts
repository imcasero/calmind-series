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
  getSeasonByName,
  getSeasonWithSplits,
  getSplitByNames,
  type SeasonWithActiveSplit,
  type SeasonWithSplits,
} from './seasons.queries';
