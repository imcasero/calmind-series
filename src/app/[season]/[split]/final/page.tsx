import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit, getSplitByNames } from '@/lib/queries';

interface FinalPageProps {
  params: Promise<{ season: string; split: string }>;
}

/**
 * Legacy J16 route — retired by the redesign (FR11). Active split → /hub/bracket;
 * past splits → /archivo/:season/:split. Temporary redirect (dynamic target).
 *
 * Wave A REQ-44: the awaits live inside `LegacyFinalInner` under a
 * `<Suspense fallback={null}>` boundary so the build keeps validating the
 * dynamic data path under `cacheComponents: true` (Wave B).
 */
async function LegacyFinalInner({ params }: FinalPageProps): Promise<never> {
  const { season, split } = await params;
  const info = await getSplitByNames(season, split);

  if (!info) {
    notFound();
  }

  const active = await getActiveSeasonWithSplit();
  if (active?.activeSplit?.id === info.split.id) {
    redirect(ROUTES.hubBracket);
  }
  redirect(ROUTES.archiveDetail(season, split));
}

export default function LegacyFinalPage(props: FinalPageProps) {
  return (
    <Suspense fallback={null}>
      <LegacyFinalInner {...props} />
    </Suspense>
  );
}
