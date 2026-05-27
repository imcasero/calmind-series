/**
 * Phase machine for the Calmind tournament (pixel redesign, FR1).
 * Pure + JSX-free, so it runs in Server and Client components alike.
 * Mirrors the design handoff `data.jsx getPhase`; the whole redesign UI mutates
 * off this single function (README §"Phase machine").
 */

export const TOTAL_ROUNDS = 16;
export const FINALS_START_ROUND = 15;

export type PhaseId =
  | 'OFFSEASON'
  | 'REGULAR'
  | 'FINALS_J15'
  | 'FINALS_J16'
  | 'OLYMPUS';

export interface Phase {
  id: PhaseId;
  /** Spanish UI label. */
  label: string;
  /** Accent color as a `--color-px-*` CSS variable reference. */
  color: string;
  /** Glyph icon (matches the prototype). */
  icon: string;
}

/**
 * Maps a round number to its tournament phase.
 * round ≤ 0 → OFFSEASON · 1–14 → REGULAR · 15 → FINALS_J15 ·
 * 16 → FINALS_J16 · ≥ 17 → OLYMPUS.
 */
export function getPhase(round: number): Phase {
  if (round <= 0) {
    return {
      id: 'OFFSEASON',
      label: 'Pretemporada',
      color: 'var(--color-px-ink-faint)',
      icon: '○',
    };
  }
  if (round <= 14) {
    return {
      id: 'REGULAR',
      label: 'Fase Regular',
      color: 'var(--color-px-cyan)',
      icon: '►',
    };
  }
  if (round === 15) {
    return {
      id: 'FINALS_J15',
      label: 'Cruces · J15',
      color: 'var(--color-px-magenta)',
      icon: '⚔',
    };
  }
  if (round === 16) {
    return {
      id: 'FINALS_J16',
      label: 'Finales · J16',
      color: 'var(--color-px-gold)',
      icon: '★',
    };
  }
  return {
    id: 'OLYMPUS',
    label: 'El Olimpo · POST',
    color: 'var(--color-px-gold)',
    icon: '♛',
  };
}

/** True once the playoff bracket goes live (round 15+). */
export function isFinalsUnlocked(round: number): boolean {
  return round >= FINALS_START_ROUND;
}

/** Season completion as a 0–100 percentage (clamped). */
export function progressPct(round: number): number {
  const pct = (round / TOTAL_ROUNDS) * 100;
  return Math.max(0, Math.min(100, pct));
}
