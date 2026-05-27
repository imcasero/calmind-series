import type { Metadata } from 'next';
import { HubPageHeader, RosterView } from '@/components/hub';
import {
  getActiveSeasonWithSplit,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';
import { buildRosterCards } from '@/lib/utils/standings';

export const metadata: Metadata = {
  title: 'Entrenadores',
  description: 'Roster de entrenadores de Pokemon Calmind Series.',
};

/** Roster page (FR6): trainer cards grid with division filters. */
export default async function EntrenadoresPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-pixel text-2xl text-px-ink">Sin roster</h1>
        <p className="mt-4 font-retro text-lg text-px-ink-soft">
          No hay un split activo todavía.
        </p>
      </div>
    );
  }

  const [preview, matchesByRound] = await Promise.all([
    getDivisionPreview(split.id),
    getMatchesByRound(split.id),
  ]);

  const allMatches = matchesByRound.flatMap((r) => r.matches);
  const cards = [
    ...buildRosterCards(preview.primera, allMatches, 1),
    ...buildRosterCards(preview.segunda, allMatches, 2),
  ];

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow="Roster del split" title="Entrenadores" />
      <RosterView cards={cards} />
    </div>
  );
}
