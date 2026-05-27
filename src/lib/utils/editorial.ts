import type { DivisionPreview } from '@/lib/types/schemas';
import { isFinalsUnlocked, TOTAL_ROUNDS } from '@/lib/utils/phase';

/**
 * Auto-generated editorial content (FR3). News, Story Beat and the marquee are
 * fictional in the prototype; the locked decision (2026-05-27) is to derive them
 * from real standings/round data instead of new tables or hand-kept constants.
 */

export interface NewsItem {
  id: string;
  tag: string;
  text: string;
}

/** Single editorial headline for the Hub Story Beat. */
export function buildStoryBeat(
  preview: DivisionPreview,
  currentRound: number,
): string {
  if (currentRound <= 0) {
    return 'El próximo split está por comenzar. Prepárate para la batalla.';
  }

  const d1Leader = preview.primera[0];
  if (d1Leader) {
    return `${d1Leader.nickname} lidera la Primera División con ${d1Leader.totalPoints} pts tras la J${currentRound}.`;
  }
  return `Jornada ${currentRound} en marcha — la clasificación se calienta.`;
}

/** Up to four derived announcement cards for the News Rail. */
export function buildNews(
  preview: DivisionPreview,
  currentRound: number,
): NewsItem[] {
  const items: NewsItem[] = [];

  const d1Leader = preview.primera[0];
  const d2Leader = preview.segunda[0];
  const d1Bottom = preview.primera.at(-1);

  if (d1Leader) {
    items.push({
      id: 'd1-leader',
      tag: 'CLAVE',
      text: `${d1Leader.nickname} manda en Primera con ${d1Leader.totalPoints} pts.`,
    });
  }
  if (d2Leader) {
    items.push({
      id: 'd2-leader',
      tag: 'ASCENSO',
      text: `${d2Leader.nickname} lidera Segunda y apunta al Olimpo.`,
    });
  }
  if (d1Bottom && d1Bottom.position >= 7) {
    items.push({
      id: 'd1-exile',
      tag: 'ALERTA',
      text: `${d1Bottom.nickname} en zona de exilio en Primera.`,
    });
  }
  items.push({
    id: 'phase',
    tag: 'OFICIAL',
    text: isFinalsUnlocked(currentRound)
      ? 'Fases finales en juego — el Olimpo se acerca.'
      : `Fase regular · J${Math.max(currentRound, 1)} de ${TOTAL_ROUNDS}.`,
  });

  return items.slice(0, 4);
}
