import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrainerProfile, type TrainerProfileVM } from '@/components/hub';
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

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await getTrainerById(id);
  return {
    title: trainer ? trainer.nickname : 'Entrenador',
    description: trainer
      ? `Perfil de ${trainer.nickname} en Pokemon Calmind Series.`
      : undefined,
  };
}

/** Single trainer profile (FR6). */
export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const [trainer, seasonInfo] = await Promise.all([
    getTrainerById(id),
    getActiveSeasonWithSplit(),
  ]);

  if (!trainer) {
    notFound();
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

    const inPrimera = preview.primera.find((e) => e.trainerId === id);
    const inSegunda = preview.segunda.find((e) => e.trainerId === id);
    const entry = inPrimera ?? inSegunda;
    division = inPrimera ? 1 : inSegunda ? 2 : null;

    if (entry) {
      position = entry.position;
      pt = entry.totalPoints;
      lives = entry.lives;
    }

    const record = winLossRecord(id, allMatches);
    pg = record.pg;
    pp = record.pp;
    streak = recentStreak(id, allMatches, 5);
    recent = trainerRecentMatches(id, allMatches, 6);
  }

  const winrate = pg + pp > 0 ? Math.round((pg / (pg + pp)) * 100) : 0;

  const vm: TrainerProfileVM = {
    nickname: trainer.nickname,
    bio: trainer.bio,
    color: trainerColor(id),
    variant: spriteVariant(id),
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
