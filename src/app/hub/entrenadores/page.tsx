import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HubPageHeader } from '@/components/hub';
import { RosterSection } from '@/components/hub/sections/RosterSection';
import { EmptyState, SectionSkeleton } from '@/components/shared';
import { getActiveSeasonWithSplit } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Entrenadores',
  description: 'Roster de entrenadores de Pokemon Calmind Series.',
};

/**
 * Roster page (FR6 / REQ-22). Wave A REQ-44: the cheap top-level
 * `getActiveSeasonWithSplit()` await lives inside `EntrenadoresPageInner`
 * under an OUTER Suspense; the heavy data + grid pre-rendering stays in the
 * inner `RosterSection` Suspense boundary.
 */
async function EntrenadoresPageInner() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <EmptyState title="Sin roster" body="No hay un split activo todavía." />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow="Roster del split" title="Entrenadores" />
      <Suspense fallback={<SectionSkeleton variant="roster" />}>
        <RosterSection splitId={split.id} />
      </Suspense>
    </div>
  );
}

export default function EntrenadoresPage() {
  return (
    <Suspense fallback={<SectionSkeleton variant="roster" />}>
      <EntrenadoresPageInner />
    </Suspense>
  );
}
