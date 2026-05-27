/**
 * Deterministic signature color for a trainer (pixel redesign, FR1).
 * Trainers have no `color` column (locked decision 2026-05-27), so the color is
 * hashed from the trainer id over a fixed palette — the same id always maps to
 * the same color across sessions and components.
 */

// The 8 signature colors the design handoff `data.jsx` rotated through.
const TRAINER_COLORS = [
  '#ff3df8', // magenta
  '#3df8ff', // cyan
  '#ffd83d', // gold
  '#b6ff3d', // lime
  '#ff7b3d', // orange
  '#a774ff', // purple
  '#ff3d6e', // pink
  '#3dff8a', // green
] as const;

/** Stable, non-cryptographic string hash (deterministic across runtimes). */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Returns a stable hex signature color for a trainer id. */
export function trainerColor(id: string): string {
  return TRAINER_COLORS[hashString(id) % TRAINER_COLORS.length];
}
