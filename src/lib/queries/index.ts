/**
 * Central export point for all queries
 *
 * All queries use React cache() for deduplication within the same request.
 *
 * Usage in Server Components:
 * import { getActiveSeasonWithSplit, getDivisionPreview } from "@/lib/queries";
 */

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
// Ranking queries (low-level)
export {
  getAllRankings,
  getTrainerRanking,
} from './ranking.queries';
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
