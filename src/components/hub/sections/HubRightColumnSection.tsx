import { HubRightColumn } from '@/components/hub/HubRightColumn';
import {
  getCurrentRound,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';

interface HubRightColumnSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub`: the right-column live feed + last results + Olympus
 * projection card.
 */
export async function HubRightColumnSection({
  splitId,
}: HubRightColumnSectionProps) {
  const [preview, matchesByRound, currentRound] = await Promise.all([
    getDivisionPreview(splitId),
    getMatchesByRound(splitId),
    getCurrentRound(splitId),
  ]);
  return (
    <HubRightColumn
      preview={preview}
      matchesByRound={matchesByRound}
      currentRound={currentRound}
    />
  );
}
