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
      <div className="relative overflow-hidden">
        {/* Background Aesthetic Decorations - matching cruces/final pages */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-retro-gold-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-snuff-500/5 blur-[120px] rounded-full" />
          <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-retro-cyan-500/3 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8">
          {/* Hero Section */}
          <Hero />
          {/* Tournament Format Section */}
          <TournamentFormat />
          {/* About Section */}
          <AboutCalmind />
          {/* Current Season CTA */}
          <CurrentSeason seasonInfo={seasonInfo} />
        </div>
      </div>
    </>
  );
}
