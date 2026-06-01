import { Suspense } from 'react';
import { ShellSkeleton } from '@/components/shared';
import { getAdminSeasons } from '@/lib/queries';
import SplitsManager from './_components/SplitsManager';

export default function SplitsPage() {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <SplitsPageInner />
    </Suspense>
  );
}

async function SplitsPageInner() {
  const seasons = await getAdminSeasons();

  return <SplitsManager initialSeasons={seasons} />;
}
