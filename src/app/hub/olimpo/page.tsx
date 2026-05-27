import type { Metadata } from 'next';
import {
  HubPageHeader,
  type OlimpoChampionVM,
  OlimpoView,
} from '@/components/hub';
import {
  getActiveSeasonWithSplit,
  getCurrentRound,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';
import type { MatchEntry, RankingEntry } from '@/lib/types/schemas';
import { isFinalsUnlocked } from '@/lib/utils/phase';
import { spriteVariant, winLossRecord } from '@/lib/utils/standings';
import { trainerColor } from '@/lib/utils/trainerColor';

export const metadata: Metadata = {
  title: 'El Olimpo',
  description:
    'El playoff entre divisiones de Pokemon Calmind Series: superviviente de Primera vs campeón de Segunda.',
};

function toChampion(
  entry: RankingEntry | undefined,
  role: string,
  accent: string,
  matches: MatchEntry[],
): OlimpoChampionVM | null {
  if (!entry) {
    return null;
  }
  const { pg, pp } = winLossRecord(entry.trainerId, matches);
  const winrate = pg + pp > 0 ? Math.round((pg / (pg + pp)) * 100) : 0;
  return {
    role,
    accent,
    nickname: entry.nickname,
    color: trainerColor(entry.trainerId),
    variant: spriteVariant(entry.trainerId),
    position: entry.position,
    pt: entry.totalPoints,
    winrate,
    lives: entry.lives,
  };
}

/** El Olimpo page (FR8): hero + projected face-off + el camino + stakes. */
export default async function OlimpoPage() {
  const seasonInfo = await getActiveSeasonWithSplit();
  const split = seasonInfo?.activeSplit;

  if (!split) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-pixel text-2xl text-px-ink">El Olimpo</h1>
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
  const official = isFinalsUnlocked(currentRound);

  // Projected competitors: D1 survivor ≈ pos-7, D2 champion ≈ #1.
  const d1Entry = preview.primera[6] ?? preview.primera.at(-1);
  const d2Entry = preview.segunda[0];

  const d1 = toChampion(
    d1Entry,
    'D1 · Survivor',
    'var(--color-px-magenta)',
    allMatches,
  );
  const d2 = toChampion(
    d2Entry,
    'D2 · Champion',
    'var(--color-px-cyan)',
    allMatches,
  );

  return (
    <div className="flex flex-col gap-8">
      <HubPageHeader eyebrow="Playoff entre divisiones" title="El Olimpo" />
      <OlimpoView
        seasonName={seasonInfo.name}
        splitName={split.name}
        official={official}
        d1={d1}
        d2={d2}
      />
    </div>
  );
}
