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
 * `react.cache` in the query layer dedupes overlapping reads across siblings.
 *
 * Wave A REQ-44: the cheap top-level `getActiveSeasonWithSplit()` await
 * moves into `HubPageInner` under an OUTER Suspense boundary so
 * `cacheComponents: true` (Wave B) can land. The existing per-section F5
 * Suspense boundaries stay as additive inner children.
 */
async function HubPageInner() {
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

export default function HubPage() {
  return (
    <Suspense fallback={<SectionSkeleton variant="phaseBanner" />}>
      <HubPageInner />
    </Suspense>
  );
}
