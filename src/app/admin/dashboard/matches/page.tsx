import { getActiveSplitInfo, getAdminSeasons } from '@/lib/queries';
import MatchesManager from './_components/MatchesManager';

export default async function MatchesPage() {
  const [seasons, activeSplitInfo] = await Promise.all([
    getAdminSeasons(),
    getActiveSplitInfo(),
  ]);

  return (
    <MatchesManager
      initialSeasons={seasons}
      activeSplitInfo={activeSplitInfo}
    />
  );
}
