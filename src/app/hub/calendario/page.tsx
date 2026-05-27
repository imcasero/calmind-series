import type { Metadata } from 'next';
import { CalendarView, HubPageHeader } from '@/components/hub';
import {
  getActiveSeasonWithSplit,
  getCurrentRound,
  getMatchesByRound,
} from '@/lib/queries';
import { getPhase, TOTAL_ROUNDS } from '@/lib/utils/phase';

export const metadata: Metadata = {
  title: 'Calendario',
  description:
    'Calendario de jornadas y enfrentamientos de Pokemon Calmind Series.',
};

/**
 * Calendar page (FR5): round timeline + per-round match listings. Per-round dates
 * are not stored, so the known weekly cadence is shown instead of real dates.
 */
export default async function CalendarioPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-pixel text-2xl text-px-ink">Sin calendario</h1>
        <p className="mt-4 font-retro text-lg text-px-ink-soft">
          No hay un split activo todavía.
        </p>
      </div>
    );
  }

  const [currentRound, matchesByRound] = await Promise.all([
    getCurrentRound(split.id),
    getMatchesByRound(split.id),
  ]);

  const phase = getPhase(currentRound);
  const eyebrow =
    currentRound > 0
      ? `J${currentRound} de ${TOTAL_ROUNDS} · ${phase.label}`
      : phase.label;

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={eyebrow} title="Calendario" />
      <CalendarView
        matchesByRound={matchesByRound}
        currentRound={currentRound}
      />
    </div>
  );
}
