import { ProjectedBracketTeaser } from '@/components/hub/ProjectedBracketTeaser';
import { getCurrentRound, getDivisionPreview } from '@/lib/queries';

interface ProjectedBracketTeaserSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub`: the projected bracket teaser. Cheap — only depends on
 * the deduped `getDivisionPreview` and `getCurrentRound`.
 */
export async function ProjectedBracketTeaserSection({
  splitId,
}: ProjectedBracketTeaserSectionProps) {
  const [preview, currentRound] = await Promise.all([
    getDivisionPreview(splitId),
    getCurrentRound(splitId),
  ]);
  return (
    <ProjectedBracketTeaser preview={preview} currentRound={currentRound} />
  );
}
