import { BracketView } from '@/components/hub/BracketView';
import {
  getBracketData,
  getCurrentRound,
  getDivisionPreview,
} from '@/lib/queries';
import { buildDivisionBracket } from '@/lib/services/bracketService';

interface BracketSectionProps {
  splitId: string;
}

/**
 * REQ-22 leaf for `/hub/bracket`: loads preview + bracket data + current round
 * in parallel, builds both division VMs, and renders the bracket view.
 */
export async function BracketSection({ splitId }: BracketSectionProps) {
  const [preview, bracketData, currentRound] = await Promise.all([
    getDivisionPreview(splitId),
    getBracketData(splitId),
    getCurrentRound(splitId),
  ]);
  const primera = buildDivisionBracket(
    preview.primera,
    bracketData.j15Matches,
    bracketData.j16Matches,
    bracketData.primeraLeagueId,
    1,
  );
  const segunda = buildDivisionBracket(
    preview.segunda,
    bracketData.j15Matches,
    bracketData.j16Matches,
    bracketData.segundaLeagueId,
    2,
  );
  return (
    <BracketView
      primera={primera}
      segunda={segunda}
      currentRound={currentRound}
    />
  );
}
