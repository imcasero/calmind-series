import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HubRightColumnSection } from '@/components/hub/sections/HubRightColumnSection';
import { NewsRailSection } from '@/components/hub/sections/NewsRailSection';
import { PhaseHeaderSection } from '@/components/hub/sections/PhaseHeaderSection';
import { ProjectedBracketTeaserSection } from '@/components/hub/sections/ProjectedBracketTeaserSection';
import { StandingsLiveSection } from '@/components/hub/sections/StandingsLiveSection';
import { EmptyState, SectionSkeleton } from '@/components/shared';
import { getActiveSeasonWithSplit } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Hub',
  description: 'Centro de mando del split activo de Pokemon Calmind Series.',
};

/**
 * Hub master dashboard (FR3 / REQ-22): each panel lives in its own Suspense
 * boundary so a slow query for one does not block the others from streaming in.
 * The top-level only awaits the cheap `getActiveSeasonWithSplit()`; every other
 * fetch happens inside its own async leaf under `components/hub/sections/`.
 * `react.cache` in the query layer dedupes overlapping reads across siblings.
 */
export default async function HubPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!seasonInfo || !split) {
    return (
      <EmptyState
        title="PRETEMPORADA"
        body="No hay un split activo. El próximo arranca pronto."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<SectionSkeleton variant="phaseBanner" />}>
        <PhaseHeaderSection
          splitId={split.id}
          seasonName={seasonInfo.name}
          splitName={split.name}
        />
      </Suspense>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <Suspense fallback={<SectionSkeleton variant="standings" />}>
            <StandingsLiveSection splitId={split.id} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton variant="bracket" />}>
            <ProjectedBracketTeaserSection splitId={split.id} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionSkeleton variant="rightColumn" />}>
          <HubRightColumnSection splitId={split.id} />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton variant="newsRail" />}>
        <NewsRailSection splitId={split.id} />
      </Suspense>
    </div>
  );
}
