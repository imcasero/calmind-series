import type { Metadata } from 'next';
import { ClasificacionView, HubPageHeader, ZoneCards } from '@/components/hub';
import {
  getActiveSeasonWithSplit,
  getCurrentRound,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';
import { getPhase, TOTAL_ROUNDS } from '@/lib/utils/phase';
import { buildStandingRows } from '@/lib/utils/standings';

export const metadata: Metadata = {
  title: 'Clasificación',
  description:
    'Clasificación completa de Primera y Segunda División de Pokemon Calmind Series.',
};

/**
 * Full standings page (FR4). Both divisions via tabs; PG/PP derived from match
 * results, streak from matches. ELO/region/real-name columns omitted (no DB).
 */
export default async function ClasificacionPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-pixel text-2xl text-px-ink">Sin clasificación</h1>
        <p className="mt-4 font-retro text-lg text-px-ink-soft">
          No hay un split activo todavía.
        </p>
      </div>
    );
  }

  const [currentRound, preview, matchesByRound] = await Promise.all([
    getCurrentRound(split.id),
    getDivisionPreview(split.id),
    getMatchesByRound(split.id),
  ]);

  const allMatches = matchesByRound.flatMap((r) => r.matches);
  const phase = getPhase(currentRound);
  const primera = buildStandingRows(preview.primera, allMatches);
  const segunda = buildStandingRows(preview.segunda, allMatches);

  const eyebrow =
    currentRound > 0
      ? `J${currentRound} de ${TOTAL_ROUNDS} · ${phase.label}`
      : phase.label;

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow={eyebrow} title="Clasificación" />
      <ClasificacionView primera={primera} segunda={segunda} />
      <ZoneCards />
    </div>
  );
}
