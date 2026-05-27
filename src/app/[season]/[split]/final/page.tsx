import { notFound, redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit, getSplitByNames } from '@/lib/queries';

interface FinalPageProps {
  params: Promise<{ season: string; split: string }>;
}

/**
 * Legacy J16 route — retired by the redesign (FR11). Active split → /hub/bracket;
 * past splits → /archivo/:season/:split. Temporary redirect (dynamic target).
 */
export default async function LegacyFinalPage({ params }: FinalPageProps) {
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
