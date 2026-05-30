import { NewsRail } from '@/components/hub/NewsRail';
import { getCurrentRound, getDivisionPreview } from '@/lib/queries';
import { buildNews } from '@/lib/utils/editorial';

interface NewsRailSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub`: the auto-generated news rail. Cheap; lives in its own
 * Suspense boundary for consistency so the rest of the page never blocks on it.
 */
export async function NewsRailSection({ splitId }: NewsRailSectionProps) {
  const [preview, currentRound] = await Promise.all([
    getDivisionPreview(splitId),
    getCurrentRound(splitId),
  ]);
  const news = buildNews(preview, currentRound);
  return <NewsRail items={news} />;
}
