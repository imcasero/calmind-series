import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit, getSplitByNames } from '@/lib/queries';

interface SplitPageProps {
  params: Promise<{ season: string; split: string }>;
}

/**
 * Legacy route — retired by the pixel redesign (FR11). The active split lives at
 * /hub; past splits live at /archivo/:season/:split. Temporary (not permanent)
 * redirect: the active/past target for a given URL changes over time.
 *
 * Wave A REQ-44: the awaits live inside `LegacySplitInner` under a
 * `<Suspense fallback={null}>` boundary so the build keeps validating the
 * dynamic data path under `cacheComponents: true` (Wave B). The leaf never
 * renders UI — it always redirects or 404s.
 */
async function LegacySplitInner({ params }: SplitPageProps): Promise<never> {
  const { season, split } = await params;
  const info = await getSplitByNames(season, split);

  if (!info) {
    notFound();
  }

  const active = await getActiveSeasonWithSplit();
  if (active?.activeSplit?.id === info.split.id) {
    redirect(ROUTES.hub);
  }
  redirect(ROUTES.archiveDetail(season, split));
}

export default function LegacySplitPage(props: SplitPageProps) {
  return (
    <Suspense fallback={null}>
      <LegacySplitInner {...props} />
    </Suspense>
  );
}
