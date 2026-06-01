import { Suspense } from 'react';
import {
  type LandingSnapVM,
  type LandingVM,
  PixelLanding,
} from '@/components/landing/PixelLanding';
import { BackgroundDecoration } from '@/components/shared';
import {
  getActiveSeasonWithSplit,
  getAllSeasonsWithSplits,
  getCurrentRound,
  getDivisionPreview,
  getMatchesByRound,
} from '@/lib/queries';
import type {
  DivisionPreview,
  MatchEntry,
  RankingEntry,
} from '@/lib/types/schemas';
import { getPhase } from '@/lib/utils/phase';
import { spriteVariant, winLossRecord } from '@/lib/utils/standings';
import { trainerColor } from '@/lib/utils/trainerColor';

function toSnap(
  entry: RankingEntry | undefined,
  matches: MatchEntry[],
): LandingSnapVM | null {
  if (!entry) {
    return null;
  }
  const { pg, pp } = winLossRecord(entry.trainerId, matches);
  return {
    trainerId: entry.trainerId,
    nickname: entry.nickname,
    color: trainerColor(entry.trainerId),
    variant: spriteVariant(entry.trainerId),
    pt: entry.totalPoints,
    pg,
    pp,
  };
}

/**
 * Landing (FR1). Wave A REQ-44: the data fetch + VM build live inside
 * `HomePageInner` under a Suspense boundary so `cacheComponents: true`
 * (Wave B) can land without aborting prerender.
 */
async function HomePageInner() {
  const [seasonInfo, seasons] = await Promise.all([
    getActiveSeasonWithSplit(),
    getAllSeasonsWithSplits(),
  ]);
  const split = seasonInfo?.activeSplit ?? null;

  let currentRound = 0;
  let preview: DivisionPreview = { primera: [], segunda: [] };
  let allMatches: MatchEntry[] = [];

  if (split) {
    const [round, divisionPreview, matchesByRound] = await Promise.all([
      getCurrentRound(split.id),
      getDivisionPreview(split.id),
      getMatchesByRound(split.id),
    ]);
    currentRound = round;
    preview = divisionPreview;
    allMatches = matchesByRound.flatMap((r) => r.matches);
  }

  const phase = getPhase(currentRound);
  const splitsCount = seasons.reduce((acc, s) => acc + s.splits.length, 0);

  const vm: LandingVM = {
    seasonName: seasonInfo?.name ?? 'Calmind',
    splitName: split?.name ?? '—',
    currentRound,
    phaseLabel: phase.label,
    phaseColor: phase.color,
    splitsCount,
    d1Leader: toSnap(preview.primera[0], allMatches),
    d2Leader: toSnap(preview.segunda[0], allMatches),
    d1Exile: toSnap(preview.primera.at(-1), allMatches),
  };

  return (
    <div className="pixel-root scanlines">
      <PixelLanding vm={vm} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<BackgroundDecoration />}>
      <HomePageInner />
    </Suspense>
  );
}
