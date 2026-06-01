import { PhaseBanner } from '@/components/hub/PhaseBanner';
import { StoryBeat } from '@/components/hub/StoryBeat';
import { getCurrentRound, getDivisionPreview } from '@/lib/queries';
import { buildStoryBeat } from '@/lib/utils/editorial';
import { getPhase } from '@/lib/utils/phase';

interface PhaseHeaderSectionProps {
  splitId: string;
  seasonName: string;
  splitName: string;
}

/**
 * REQ-22 leaf for `/hub`: pairs the PhaseBanner + StoryBeat. Both depend on
 * `currentRound` and (for the editorial beat) on `divisionPreview`; sharing the
 * leaf saves one Suspense boundary without coupling them to the heavier panels.
 */
export async function PhaseHeaderSection({
  splitId,
  seasonName,
  splitName,
}: PhaseHeaderSectionProps) {
  const [currentRound, preview] = await Promise.all([
    getCurrentRound(splitId),
    getDivisionPreview(splitId),
  ]);
  const phase = getPhase(currentRound);
  const storyBeat = buildStoryBeat(preview, currentRound);

  return (
    <>
      <PhaseBanner
        phase={phase}
        currentRound={currentRound}
        seasonName={seasonName}
        splitName={splitName}
      />
      <StoryBeat text={storyBeat} currentRound={currentRound} />
    </>
  );
}
