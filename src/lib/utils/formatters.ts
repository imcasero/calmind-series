/**
 * Tiny formatters used by hub/archive UI. Each entry centralizes a string-build
 * that was duplicated across multiple views (REQ-24).
 */

/**
 * Canonical season/split label, e.g. `"P2024 · VERANO"`. Used by the season chip,
 * phase banner, archive metadata, and the Olimpo hero.
 */
export function formatSeasonSplit(
  seasonName: string,
  splitName: string,
): string {
  return `${seasonName.toUpperCase()} · ${splitName.toUpperCase()}`;
}
