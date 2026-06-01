import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TrainerProfileSection } from '@/components/hub/sections/TrainerProfileSection';
import { SectionSkeleton } from '@/components/shared';
import { getTrainerById } from '@/lib/queries';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await getTrainerById(id);
  return {
    title: trainer ? trainer.nickname : 'Entrenador',
    description: trainer
      ? `Perfil de ${trainer.nickname} en Pokemon Calmind Series.`
      : undefined,
  };
}

/**
 * Single trainer profile (FR6 / REQ-22). Wave A REQ-44: the top-level
 * `getTrainerById` await lives inside `TrainerPageInner` under an OUTER
 * Suspense boundary so `cacheComponents: true` (Wave B) can land. The
 * `notFound()` short-circuit stays inside the helper; the inner
 * `TrainerProfileSection` keeps its existing Suspense boundary.
 */
async function TrainerPageInner({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = await getTrainerById(id);

  if (!trainer) {
    notFound();
  }

  return (
    <Suspense fallback={<SectionSkeleton variant="trainerProfile" />}>
      <TrainerProfileSection trainerId={id} />
    </Suspense>
  );
}

export default function TrainerPage(props: TrainerPageProps) {
  return (
    <Suspense fallback={<SectionSkeleton variant="trainerProfile" />}>
      <TrainerPageInner {...props} />
    </Suspense>
  );
}
