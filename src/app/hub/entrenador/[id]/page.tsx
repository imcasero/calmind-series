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
 * Single trainer profile (FR6 / REQ-22). The page-level check guarantees the
 * trainer exists (otherwise `notFound()` short-circuits). The streamed
 * `TrainerProfileSection` does the per-split data join under its own Suspense
 * boundary.
 */
export default async function TrainerPage({ params }: TrainerPageProps) {
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
