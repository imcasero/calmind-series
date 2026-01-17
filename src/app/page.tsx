import { AboutCalmind } from '@/components/home/AboutCalmind/AboutCalmind';
import { CurrentSeason } from '@/components/home/CurrentSeason/CurrentSeason';
import { Hero } from '@/components/home/Hero/Hero';
import { TournamentFormat } from '@/components/home/TorunamentFormat/TournamentFormat';
import { Navbar } from '@/components/shared';

import { getActiveSeasonWithSplit } from '@/lib/queries';

export default async function HomePage() {
  const seasonInfo = await getActiveSeasonWithSplit();

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4">
        {/* Hero Section */}
        <Hero />
        {/* Tournament Format Section */}
        <TournamentFormat />
        {/* About Section */}
        <AboutCalmind />
        {/* Current Season CTA */}
        <CurrentSeason seasonInfo={seasonInfo} />
      </div>
    </>
  );
}
