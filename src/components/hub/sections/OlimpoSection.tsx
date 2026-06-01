import { type OlimpoChampionVM, OlimpoView } from '@/components/hub/OlimpoView';
import {
  getCurrentRound,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';
import type { MatchEntry, RankingEntry } from '@/lib/types/schemas';
import { isFinalsUnlocked } from '@/lib/utils/phase';
import { spriteVariant, winLossRecord } from '@/lib/utils/standings';
import { trainerColor } from '@/lib/utils/trainerColor';

interface OlimpoSectionProps {
  splitId: string;
  seasonName: string;
  splitName: string;
}

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

/**
 * REQ-22 leaf for `/hub/olimpo`: builds the projected/official competitor cards
 * from standings + matches, then renders the Olimpo view.
 */
export async function OlimpoSection({
  splitId,
  seasonName,
  splitName,
}: OlimpoSectionProps) {
  const [preview, matchesByRound, currentRound] = await Promise.all([
    getDivisionPreview(splitId),
    getMatchesByRound(splitId),
    getCurrentRound(splitId),
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
    <OlimpoView
      seasonName={seasonName}
      splitName={splitName}
      official={official}
      d1={d1}
      d2={d2}
    />
  );
}
