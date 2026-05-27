import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit, getSplitByNames } from '@/lib/queries';

interface SplitPageProps {
  params: Promise<{ season: string; split: string }>;
}

/**
 * Legacy route — retired by the pixel redesign (FR11). The active split lives at
 * /hub; past splits live at /archivo/:season/:split. Temporary (not permanent)
 * redirect: the active/past target for a given URL changes over time.
 */
export default async function LegacySplitPage({ params }: SplitPageProps) {
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
