import { getAdminSeasons } from '@/lib/queries';
import SeasonsManager from './_components/SeasonsManager';

export default async function SeasonsPage() {
  const seasons = await getAdminSeasons();

  return <SeasonsManager initialSeasons={seasons} />;
}
