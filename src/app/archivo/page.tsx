import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  type ArchiveSeasonVM,
  ArchiveView,
  HubPageHeader,
} from '@/components/hub';
import { SectionSkeleton } from '@/components/shared';
import {
  getActiveSeasonWithSplit,
  getAllSeasonsWithSplits,
  getArchiveChampions,
} from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Archivo',
  description:
    'Máquina del tiempo: todas las temporadas y splits de Pokemon Calmind Series.',
};

/**
 * Archive index (FR9): seasons + splits, newest first.
 *
 * Wave A REQ-44: the `Promise.all` + VM build lives inside
 * `ArchivoPageInner` so the Suspense boundary owns the await.
 */
async function ArchivoPageInner() {
  const [seasons, seasonInfo, champions] = await Promise.all([
    getAllSeasonsWithSplits(),
    getActiveSeasonWithSplit(),
    getArchiveChampions(),
  ]);

  const activeSplitId = seasonInfo?.activeSplit?.id ?? null;

  const seasonVMs: ArchiveSeasonVM[] = seasons.map((season) => ({
    id: season.id,
    name: season.name,
    year: season.year,
    splits: season.splits.map((split) => {
      const champ = champions.get(split.id);
      return {
        id: split.id,
        name: split.name,
        seasonName: season.name,
        isActive: split.id === activeSplitId,
        d1Champion: champ?.d1Champion ?? null,
        d2Champion: champ?.d2Champion ?? null,
      };
    }),
  }));

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow="Máquina del tiempo" title="Archivo" />
      <ArchiveView seasons={seasonVMs} />
    </div>
  );
}

export default function ArchivoPage() {
  return (
    <Suspense fallback={<SectionSkeleton variant="standings" />}>
      <ArchivoPageInner />
    </Suspense>
  );
}
