/**
 * Utility functions for ClassificationTable
 */

interface RowStyleParams {
  isChampion: boolean;
  isPromoted: boolean;
  isRelegation: boolean;
}

export function getRowClassName({
  isChampion,
  isPromoted,
  isRelegation,
}: RowStyleParams): string {
  let rowClass =
    'border-b-2 border-jacksons-purple-600 hover:bg-jacksons-purple-700 transition-colors';

  if (isChampion) {
    rowClass += ' bg-retro-gold-900/60 border-retro-gold-600';
  } else if (isPromoted) {
    rowClass += ' bg-retro-cyan-900/60 border-retro-cyan-600';
  } else if (isRelegation) {
    rowClass += ' bg-snuff-900/60 border-snuff-600';
  }

  return rowClass;
}
