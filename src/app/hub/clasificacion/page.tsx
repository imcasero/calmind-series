import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HubPageHeader, ZoneCards } from '@/components/hub';
import { ClasificacionSection } from '@/components/hub/sections/ClasificacionSection';
import { EmptyState, SectionSkeleton } from '@/components/shared';
import { getActiveSeasonWithSplit, getCurrentRound } from '@/lib/queries';
import { getPhase, TOTAL_ROUNDS } from '@/lib/utils/phase';

export const metadata: Metadata = {
  title: 'Clasificación',
  description:
    'Clasificación completa de Primera y Segunda División de Pokemon Calmind Series.',
};

/**
 * Full standings page (FR4 / REQ-22). Wave A REQ-44: the cheap top-level
 * awaits (`getActiveSeasonWithSplit`, `getCurrentRound`) live inside
 * `ClasificacionPageInner` under an OUTER Suspense; the heavy
 * `ClasificacionSection` (preview + matches join) stays in its own inner
 * Suspense boundary.
 */
async function ClasificacionPageInner() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <EmptyState
        title="Sin clasificación"
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
      <HubPageHeader eyebrow={eyebrow} title="Clasificación" />
      <Suspense fallback={<SectionSkeleton variant="standings" />}>
        <ClasificacionSection splitId={split.id} />
      </Suspense>
      <ZoneCards />
    </div>
  );
}

export default function ClasificacionPage() {
  return (
    <Suspense fallback={<SectionSkeleton variant="standings" />}>
      <ClasificacionPageInner />
    </Suspense>
  );
}
