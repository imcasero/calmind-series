/**
 * Central export point for all queries
 *
 * Usage in Server Components:
 * import { getActiveSeasonWithSplit, getLeagueRankings } from "@/lib/queries";
 */

export {
  getActiveSeasonWithSplit,
  getAllSeasons,
  getSeasonWithSplits,
  type SeasonWithActiveSplit,
} from './seasons.queries';
