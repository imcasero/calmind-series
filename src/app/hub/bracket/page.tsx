import type { Metadata } from 'next';
import { BracketView, HubPageHeader } from '@/components/hub';
import {
  getActiveSeasonWithSplit,
  getBracketData,
  getCurrentRound,
  getDivisionPreview,
} from '@/lib/queries';
import { buildDivisionBracket } from '@/lib/services/bracketService';
import { getPhase } from '@/lib/utils/phase';

export const metadata: Metadata = {
  title: 'Bracket',
  description:
    'Cruces y finales de Pokemon Calmind Series — proyectado durante la fase regular, oficial desde la J15.',
};

/** Bracket page (FR7): projected from standings until J15, official from matches after. */
export default async function BracketPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-pixel text-2xl text-px-ink">Sin bracket</h1>
        <p className="mt-4 font-retro text-lg text-px-ink-soft">
          No hay un split activo todavía.
        </p>
      </div>
    );
  }

  const [currentRound, preview, bracketData] = await Promise.all([
    getCurrentRound(split.id),
    getDivisionPreview(split.id),
    getBracketData(split.id),
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

  const phase = getPhase(currentRound);

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={phase.label} title="Bracket" />
      <BracketView
        primera={primera}
        segunda={segunda}
        currentRound={currentRound}
      />
    </div>
  );
}
