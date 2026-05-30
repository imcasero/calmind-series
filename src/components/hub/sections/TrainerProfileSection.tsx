import {
  TrainerProfile,
  type TrainerProfileVM,
} from '@/components/hub/TrainerProfile';
import {
  getActiveSeasonWithSplit,
  getDivisionPreview,
  getMatchesByRound,
  getTrainerById,
} from '@/lib/queries';
import {
  recentStreak,
  spriteVariant,
  trainerRecentMatches,
  winLossRecord,
} from '@/lib/utils/standings';
import { trainerColor } from '@/lib/utils/trainerColor';

interface TrainerProfileSectionProps {
  trainerId: string;
}

/**
 * REQ-22 leaf for `/hub/entrenador/[id]`: loads the trainer, the active split
 * (deduped via `react.cache`), and the per-split preview + matches; derives the
 * VM; and renders the profile. Throws `notFound()` via the parent page when the
 * trainer is missing — this leaf assumes a valid id (the parent already checked).
 */
export async function TrainerProfileSection({
  trainerId,
}: TrainerProfileSectionProps) {
  const [trainer, seasonInfo] = await Promise.all([
    getTrainerById(trainerId),
    getActiveSeasonWithSplit(),
  ]);

  if (!trainer) {
    // Defensive: page wrapper already covers this path, but the leaf renders
    // a tiny placeholder rather than crashing if the cache slip misses.
    return null;
  }

  const split = seasonInfo?.activeSplit;

  let division: 1 | 2 | null = null;
  let position: number | null = null;
  let pt = 0;
  let lives = 0;
  let pg = 0;
  let pp = 0;
  let streak: ReturnType<typeof recentStreak> = [];
  let recent: ReturnType<typeof trainerRecentMatches> = [];

  if (split) {
    const [preview, matchesByRound] = await Promise.all([
      getDivisionPreview(split.id),
      getMatchesByRound(split.id),
    ]);
    const allMatches = matchesByRound.flatMap((r) => r.matches);

    const inPrimera = preview.primera.find((e) => e.trainerId === trainerId);
    const inSegunda = preview.segunda.find((e) => e.trainerId === trainerId);
    const entry = inPrimera ?? inSegunda;
    division = inPrimera ? 1 : inSegunda ? 2 : null;

    if (entry) {
      position = entry.position;
      pt = entry.totalPoints;
      lives = entry.lives;
    }

    const record = winLossRecord(trainerId, allMatches);
    pg = record.pg;
    pp = record.pp;
    streak = recentStreak(trainerId, allMatches, 5);
    recent = trainerRecentMatches(trainerId, allMatches, 6);
  }

  const winrate = pg + pp > 0 ? Math.round((pg / (pg + pp)) * 100) : 0;

  const vm: TrainerProfileVM = {
    nickname: trainer.nickname,
    bio: trainer.bio,
    color: trainerColor(trainerId),
    variant: spriteVariant(trainerId),
    division,
    position,
    isLeader: position === 1,
    pg,
    pp,
    pt,
    winrate,
    lives,
    streak,
    recent,
  };

  return <TrainerProfile vm={vm} />;
}
