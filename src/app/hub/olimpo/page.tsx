import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HubPageHeader } from '@/components/hub';
import { OlimpoSection } from '@/components/hub/sections/OlimpoSection';
import { EmptyState, SectionSkeleton } from '@/components/shared';
import { getActiveSeasonWithSplit } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'El Olimpo',
  description:
    'El playoff entre divisiones de Pokemon Calmind Series: superviviente de Primera vs campeón de Segunda.',
};

/**
 * El Olimpo page (FR8 / REQ-22). Top-level only awaits
 * `getActiveSeasonWithSplit()`; the heavy preview + matches join lives in the
 * streamed `OlimpoSection`.
 */
export default async function OlimpoPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <EmptyState title="El Olimpo" body="No hay un split activo todavía." />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow="Playoff entre divisiones" title="El Olimpo" />
      <Suspense fallback={<SectionSkeleton variant="olimpo" />}>
        <OlimpoSection
          splitId={split.id}
          seasonName={seasonInfo.name}
          splitName={split.name}
        />
      </Suspense>
    </div>
  );
}
