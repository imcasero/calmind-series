import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HubPageHeader } from '@/components/hub';
import { CalendarSection } from '@/components/hub/sections/CalendarSection';
import { EmptyState, SectionSkeleton } from '@/components/shared';
import { getActiveSeasonWithSplit, getCurrentRound } from '@/lib/queries';
import { getPhase, TOTAL_ROUNDS } from '@/lib/utils/phase';

export const metadata: Metadata = {
  title: 'Calendario',
  description:
    'Calendario de jornadas y enfrentamientos de Pokemon Calmind Series.',
};

/**
 * Calendar page (FR5 / REQ-22). The top-level only awaits the cheap
 * `getActiveSeasonWithSplit()` + `getCurrentRound()` (for the eyebrow); the
 * heavy `getMatchesByRound` lives inside the streamed `CalendarSection`.
 */
export default async function CalendarioPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <EmptyState
        title="Sin calendario"
        body="No hay un split activo todavía."
      />
    );
  }

  const currentRound = await getCurrentRound(split.id);
  const phase = getPhase(currentRound);
  const eyebrow =
    currentRound > 0
      ? `J${currentRound} de ${TOTAL_ROUNDS} · ${phase.label}`
      : phase.label;

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={eyebrow} title="Calendario" />
      <Suspense fallback={<SectionSkeleton variant="calendar" />}>
        <CalendarSection splitId={split.id} />
      </Suspense>
    </div>
  );
}
