import type { MatchEntry, RankingEntry } from '@/lib/types/schemas';
import { trainerColor } from '@/lib/utils/trainerColor';

/**
 * Standings helpers for the pixel redesign (FR3). Position-based zones drive the
 * row accent (design); `lives` is shown alongside as a secondary indicator
 * (decision 2026-05-27). Thresholds assume 8-player divisions (the league format).
 */

export type ZoneId = 'titulo' | 'neutral' | 'exilio';

export interface Zone {
  id: ZoneId;
  label: string;
  /** Accent as a `--color-px-*` CSS variable. */
  color: string;
}

export function zoneForPosition(position: number): Zone {
  if (position <= 4) {
    return { id: 'titulo', label: 'Título', color: 'var(--color-px-gold)' };
  }
  if (position <= 6) {
    return {
      id: 'neutral',
      label: 'Neutral',
      color: 'var(--color-px-ink-faint)',
    };
  }
  return { id: 'exilio', label: 'Exilio', color: 'var(--color-px-danger)' };
}

/** The three zones, top-to-bottom — for legend rendering. */
export const ZONES: Zone[] = [
  zoneForPosition(1),
  zoneForPosition(5),
  zoneForPosition(7),
];

export type StreakResult = 'W' | 'L';

/**
 * The trainer's most recent W/L results (oldest → newest), derived from played
 * matches. Returns at most `limit` entries.
 */
export function recentStreak(
  trainerId: string,
  matches: MatchEntry[],
  limit = 3,
): StreakResult[] {
  const played = matches
    .filter(
      (m) =>
        m.played &&
        (m.homeTrainer?.id === trainerId || m.awayTrainer?.id === trainerId),
    )
    .sort((a, b) => a.round - b.round)
    .slice(-limit);

  return played.map((m) => {
    const isHome = m.homeTrainer?.id === trainerId;
    const won = isHome ? m.homeSets > m.awaySets : m.awaySets > m.homeSets;
    return won ? 'W' : 'L';
  });
}

/**
 * Win/loss record (PG/PP) derived from played matches. The `league_rankings` view
 * exposes points/sets but not a win count, so it's computed from set scores.
 */
export function winLossRecord(
  trainerId: string,
  matches: MatchEntry[],
): { pg: number; pp: number } {
  let pg = 0;
  let pp = 0;
  for (const m of matches) {
    if (!m.played) {
      continue;
    }
    const isHome = m.homeTrainer?.id === trainerId;
    const isAway = m.awayTrainer?.id === trainerId;
    if (!isHome && !isAway) {
      continue;
    }
    const won = isHome ? m.homeSets > m.awaySets : m.awaySets > m.homeSets;
    if (won) {
      pg += 1;
    } else {
      pp += 1;
    }
  }
  return { pg, pp };
}

/** A standings table row, fully resolved for the UI. */
export interface StandingRowVM {
  position: number;
  trainerId: string;
  nickname: string;
  color: string;
  pg: number;
  pp: number;
  totalPoints: number;
  streak: StreakResult[];
  zone: Zone;
}

/** Builds full standings rows from ranking entries + match results. */
export function buildStandingRows(
  entries: RankingEntry[],
  matches: MatchEntry[],
): StandingRowVM[] {
  return entries.map((entry) => {
    const { pg, pp } = winLossRecord(entry.trainerId, matches);
    return {
      position: entry.position,
      trainerId: entry.trainerId,
      nickname: entry.nickname,
      color: trainerColor(entry.trainerId),
      pg,
      pp,
      totalPoints: entry.totalPoints,
      streak: recentStreak(entry.trainerId, matches, 5),
      zone: zoneForPosition(entry.position),
    };
  });
}

/** Deterministic MonsterSprite variant (0–3) for a trainer id. */
export function spriteVariant(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return sum % 4;
}

/** A roster grid card, fully resolved for the UI. */
export interface RosterCardVM {
  trainerId: string;
  nickname: string;
  color: string;
  division: 1 | 2;
  pg: number;
  pp: number;
  pt: number;
  j: number;
  variant: number;
}

/** Builds roster cards for one division. */
export function buildRosterCards(
  entries: RankingEntry[],
  matches: MatchEntry[],
  division: 1 | 2,
): RosterCardVM[] {
  return entries.map((entry) => {
    const { pg, pp } = winLossRecord(entry.trainerId, matches);
    return {
      trainerId: entry.trainerId,
      nickname: entry.nickname,
      color: trainerColor(entry.trainerId),
      division,
      pg,
      pp,
      pt: entry.totalPoints,
      j: entry.matchesPlayed,
      variant: spriteVariant(entry.trainerId),
    };
  });
}

/** One recent match from a trainer's perspective. */
export interface RecentMatchVM {
  id: string;
  round: number;
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  won: boolean;
}

/** A trainer's most recent played matches (newest first). */
export function trainerRecentMatches(
  trainerId: string,
  matches: MatchEntry[],
  limit = 6,
): RecentMatchVM[] {
  return matches
    .filter(
      (m) =>
        m.played &&
        (m.homeTrainer?.id === trainerId || m.awayTrainer?.id === trainerId),
    )
    .sort((a, b) => b.round - a.round)
    .slice(0, limit)
    .map((m) => {
      const isHome = m.homeTrainer?.id === trainerId;
      const opponent = isHome
        ? m.awayTrainer?.nickname
        : m.homeTrainer?.nickname;
      const scoreFor = isHome ? m.homeSets : m.awaySets;
      const scoreAgainst = isHome ? m.awaySets : m.homeSets;
      return {
        id: m.id,
        round: m.round,
        opponent: opponent ?? '—',
        scoreFor,
        scoreAgainst,
        won: scoreFor > scoreAgainst,
      };
    });
}
