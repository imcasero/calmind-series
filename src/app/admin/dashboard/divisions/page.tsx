import { Suspense } from 'react';
import { ShellSkeleton } from '@/components/shared';
import { getAdminSeasons } from '@/lib/queries';
import DivisionsManager from './_components/DivisionsManager';

export default function DivisionsPage() {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <DivisionsPageInner />
    </Suspense>
  );
}

async function DivisionsPageInner() {
  const seasons = await getAdminSeasons();

  return <DivisionsManager initialSeasons={seasons} />;
}
