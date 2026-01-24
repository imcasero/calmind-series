import { getAdminSeasons } from '@/lib/queries';
import DivisionsManager from './_components/DivisionsManager';

export default async function DivisionsPage() {
  const seasons = await getAdminSeasons();

  return <DivisionsManager initialSeasons={seasons} />;
}
