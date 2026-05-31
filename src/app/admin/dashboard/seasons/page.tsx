import { Suspense } from 'react';
import { ShellSkeleton } from '@/components/shared';
import { getAdminSeasons } from '@/lib/queries';
import SeasonsManager from './_components/SeasonsManager';

export default function SeasonsPage() {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <SeasonsPageInner />
    </Suspense>
  );
}

async function SeasonsPageInner() {
  const seasons = await getAdminSeasons();

  return <SeasonsManager initialSeasons={seasons} />;
}
