import { RosterFilterShell } from '@/components/hub/clients/RosterFilterShell';
import { RosterGrid } from '@/components/hub/RosterGrid';
import { getDivisionPreview, getMatchesByRound } from '@/lib/queries';
import { buildRosterCards } from '@/lib/utils/standings';

interface RosterSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub/entrenadores`: pre-renders the three filtered roster
 * grids server-side (all / D1 / D2) and hands them to the `RosterFilterShell`
 * client as named slots.
 */
export async function RosterSection({ splitId }: RosterSectionProps) {
  const [preview, matchesByRound] = await Promise.all([
    getDivisionPreview(splitId),
    getMatchesByRound(splitId),
  ]);
  const allMatches = matchesByRound.flatMap((r) => r.matches);
  const all = [
    ...buildRosterCards(preview.primera, allMatches, 1),
    ...buildRosterCards(preview.segunda, allMatches, 2),
  ];
  const d1 = all.filter((c) => c.division === 1);
  const d2 = all.filter((c) => c.division === 2);
  return (
    <RosterFilterShell
      allCount={all.length}
      d1Count={d1.length}
      d2Count={d2.length}
      allSlot={<RosterGrid cards={all} />}
      d1Slot={<RosterGrid cards={d1} />}
      d2Slot={<RosterGrid cards={d2} />}
    />
  );
}
