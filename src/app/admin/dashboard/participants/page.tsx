import { getAdminSeasons, getAdminTrainers } from '@/lib/queries';
import ParticipantsManager from './_components/ParticipantsManager';

export default async function ParticipantsPage() {
  const [seasons, trainers] = await Promise.all([
    getAdminSeasons(),
    getAdminTrainers(),
  ]);

  return (
    <ParticipantsManager initialSeasons={seasons} initialTrainers={trainers} />
  );
}
