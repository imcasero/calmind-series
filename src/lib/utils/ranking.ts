import type { MatchEntry, RankingEntry } from '@/lib/types/schemas';

/**
 * Tiebreaker comparison function type
 * Returns negative if a should rank higher, positive if b should rank higher, 0 if equal
 */
type TiebreakerFn = (a: RankingEntry, b: RankingEntry) => number;

/**
 * Get head-to-head results between two trainers
 * Returns the difference in sets won (positive means trainer A won more sets)
 */
function getHeadToHeadBalance(
  trainerAId: string,
  trainerBId: string,
  matches: MatchEntry[],
): number {
  let trainerASets = 0;
  let trainerBSets = 0;

  for (const match of matches) {
    if (!match.played) continue;

    const isAHome = match.homeTrainer?.id === trainerAId;
    const isAAway = match.awayTrainer?.id === trainerAId;
    const isBHome = match.homeTrainer?.id === trainerBId;
    const isBAway = match.awayTrainer?.id === trainerBId;

    // Check if this match is between these two trainers
    if ((isAHome && isBAway) || (isAAway && isBHome)) {
      if (isAHome) {
        trainerASets += match.homeSets;
        trainerBSets += match.awaySets;
      } else {
        trainerASets += match.awaySets;
        trainerBSets += match.homeSets;
      }
    }
  }

  return trainerASets - trainerBSets;
}

/**
 * Tiebreaker criteria in order of priority
 */
export function createTiebreakers(matches: MatchEntry[]): TiebreakerFn[] {
  return [
    // 1. Total points (higher is better)
    (a, b) => b.totalPoints - a.totalPoints,

    // 2. Lives remaining (higher is better)
    (a, b) => b.lives - a.lives,

    // 3. Set balance/diff (higher is better)
    (a, b) => b.setBalance - a.setBalance,

    // 4. Head-to-head results (higher is better)
    (a, b) => getHeadToHeadBalance(b.trainerId, a.trainerId, matches),

    // 5. Fallback: alphabetical by nickname (for complete determinism)
    (a, b) => a.nickname.localeCompare(b.nickname),
  ];
}

/**
 * Applies tiebreaker rules in order and returns comparison result
 */
function comparePlayers(
  a: RankingEntry,
  b: RankingEntry,
  tiebreakers: TiebreakerFn[],
): number {
  for (const tiebreaker of tiebreakers) {
    const result = tiebreaker(a, b);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}

/**
 * Sorts rankings by tiebreaker rules and assigns unique positions
 */
export function applyTiebreakerRules(
  rankings: RankingEntry[],
  matches: MatchEntry[],
): RankingEntry[] {
  const tiebreakers = createTiebreakers(matches);

  // Sort rankings using tiebreaker rules
  const sorted = [...rankings].sort((a, b) =>
    comparePlayers(a, b, tiebreakers),
  );

  // Assign unique positions (1-indexed)
  return sorted.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}
