import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit, getSplitByNames } from '@/lib/queries';

interface PlayoffPageProps {
  params: Promise<{ season: string; split: string }>;
}

/**
 * Legacy J15 route — retired by the redesign (FR11). Active split → /hub/bracket;
 * past splits → /archivo/:season/:split. Temporary redirect (dynamic target).
 */
export default async function LegacyPlayoffPage({ params }: PlayoffPageProps) {
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
