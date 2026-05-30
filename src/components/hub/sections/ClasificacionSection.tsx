import { ClasificacionView } from '@/components/hub/ClasificacionView';
import { getDivisionPreview, getMatchesByRound } from '@/lib/queries';
import { buildStandingRows } from '@/lib/utils/standings';

interface ClasificacionSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub/clasificacion`: builds the per-division standing rows
 * server-side and hands them to the `ClasificacionView` (which renders the
 * tabbed view via the `DivisionTabsShell` client shell).
 */
export async function ClasificacionSection({
  splitId,
}: ClasificacionSectionProps) {
  const [preview, matchesByRound] = await Promise.all([
    getDivisionPreview(splitId),
    getMatchesByRound(splitId),
  ]);
  const allMatches = matchesByRound.flatMap((r) => r.matches);
  const primera = buildStandingRows(preview.primera, allMatches);
  const segunda = buildStandingRows(preview.segunda, allMatches);
  return <ClasificacionView primera={primera} segunda={segunda} />;
}
