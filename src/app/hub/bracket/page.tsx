import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HubPageHeader } from '@/components/hub';
import { BracketSection } from '@/components/hub/sections/BracketSection';
import { EmptyState, SectionSkeleton } from '@/components/shared';
import { getActiveSeasonWithSplit, getCurrentRound } from '@/lib/queries';
import { getPhase } from '@/lib/utils/phase';

export const metadata: Metadata = {
  title: 'Bracket',
  description:
    'Cruces y finales de Pokemon Calmind Series — proyectado durante la fase regular, oficial desde la J15.',
};

/**
 * Bracket page (FR7 / REQ-22). Wave A REQ-44: the cheap top-level awaits
 * (`getActiveSeasonWithSplit`, `getCurrentRound`) live inside
 * `BracketPageInner` under an OUTER Suspense; the heavy bracket build lives
 * in the streamed `BracketSection` (existing F5 boundary).
 */
async function BracketPageInner() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <EmptyState title="Sin bracket" body="No hay un split activo todavía." />
    );
  }

  const currentRound = await getCurrentRound(split.id);
  const phase = getPhase(currentRound);

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={phase.label} title="Bracket" />
      <Suspense fallback={<SectionSkeleton variant="bracket" />}>
        <BracketSection splitId={split.id} />
      </Suspense>
    </div>
  );
}

export default function BracketPage() {
  return (
    <Suspense fallback={<SectionSkeleton variant="bracket" />}>
      <BracketPageInner />
    </Suspense>
  );
}
