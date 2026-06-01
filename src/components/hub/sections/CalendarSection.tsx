import { CalendarView } from '@/components/hub/CalendarView';
import { getCurrentRound, getMatchesByRound } from '@/lib/queries';

interface CalendarSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub/calendario`: loads `matchesByRound` + `currentRound`
 * and hands them to `CalendarView` (the Server orchestrator from REQ-23.3).
 */
export async function CalendarSection({ splitId }: CalendarSectionProps) {
  const [matchesByRound, currentRound] = await Promise.all([
    getMatchesByRound(splitId),
    getCurrentRound(splitId),
  ]);
  return (
    <CalendarView matchesByRound={matchesByRound} currentRound={currentRound} />
  );
}
