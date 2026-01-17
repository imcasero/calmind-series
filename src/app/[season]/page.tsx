import Link from 'next/link';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit, getSeasonWithSplits } from '@/lib/queries';

interface SeasonPageProps {
  params: Promise<{
    season: string;
  }>;
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { season } = await params;
  const seasonInfo = await getActiveSeasonWithSplit();

  const seasonWithSplits = seasonInfo
    ? await getSeasonWithSplits(seasonInfo.id)
    : null;
  const splits = seasonWithSplits?.splits ?? [];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 py-8">
        {/* Season Header */}
        <section className="text-center mb-8 xs:mb-12">
          <h1 className="pokemon-title text-retro-gold-400 text-2xl xs:text-3xl sm:text-4xl mb-2">
            Temporada {season.toUpperCase()}
          </h1>
          <p className="text-retro-cyan-300/80 text-xs xs:text-sm uppercase tracking-wider">
            Pokemon Calmind Series
          </p>
        </section>

        {/* Splits Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
          {splits.map((split) => (
            <Link
              key={split.id}
              href={ROUTES.season(season, split.name)}
              className={`retro-border border-3 xs:border-4 p-4 xs:p-6 text-center transition-transform hover:-translate-y-1 ${
                split.is_active
                  ? 'border-retro-gold-500 bg-jacksons-purple-800'
                  : 'border-jacksons-purple-600 bg-jacksons-purple-900/50 opacity-60'
              }`}
            >
              <h2 className="text-retro-gold-400 font-bold text-lg xs:text-xl mb-2">
                {split.name}
              </h2>
              {split.is_active ? (
                <span className="inline-block bg-retro-cyan-600 text-white text-[10px] xs:text-xs px-2 py-1 uppercase tracking-wide">
                  Activo
                </span>
              ) : (
                <span className="inline-block bg-jacksons-purple-600 text-white/60 text-[10px] xs:text-xs px-2 py-1 uppercase tracking-wide">
                  Proximamente
                </span>
              )}
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
