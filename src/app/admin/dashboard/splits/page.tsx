import { getAdminSeasons } from '@/lib/queries';
import SplitsManager from './_components/SplitsManager';

export default async function SplitsPage() {
  const seasons = await getAdminSeasons();

  return <SplitsManager initialSeasons={seasons} />;
}
