import { StandingsLive } from '@/components/hub/StandingsLive';
import { getDivisionPreview, getMatchesByRound } from '@/lib/queries';

interface StandingsLiveSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub`: the dual live standings panel. Reads the deduped
 * `getDivisionPreview` + `getMatchesByRound` via `react.cache`, so siblings that
 * share the same queries do not trigger extra DB round-trips.
 */
export async function StandingsLiveSection({
  splitId,
}: StandingsLiveSectionProps) {
  const [preview, matchesByRound] = await Promise.all([
    getDivisionPreview(splitId),
    getMatchesByRound(splitId),
  ]);
  const allMatches = matchesByRound.flatMap((r) => r.matches);
  return <StandingsLive preview={preview} matches={allMatches} />;
}
