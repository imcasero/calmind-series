import Link from 'next/link';
import { notFound } from 'next/navigation';
import SplitContent from '@/components/divisions/SplitContent/SplitContent';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import {
  getDivisionPreview,
  getParticipantsBySplit,
  getSplitByNames,
} from '@/lib/queries';

interface SplitPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export default async function SplitPage({ params }: SplitPageProps) {
  const { season, split } = await params;

  // Resolve split from URL params
  const splitInfo = await getSplitByNames(season, split);

  if (!splitInfo) {
    notFound();
  }

  // Get rankings and participants in parallel
  const [rankings, participants] = await Promise.all([
    getDivisionPreview(splitInfo.split.id),
    getParticipantsBySplit(splitInfo.split.id),
  ]);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 py-6 xs:py-8">
        {/* Header */}
        <section className="text-center mb-6 xs:mb-8">
          <Link
            href={`/${season}`}
            className="text-retro-cyan-300/60 text-xs uppercase tracking-wider hover:text-retro-cyan-300 transition-colors"
          >
            ← {season.toUpperCase()}
          </Link>
          <h1 className="pokemon-title text-retro-gold-400 text-xl xs:text-2xl sm:text-3xl mt-2 mb-1">
            {split.replace('split', 'Split ')}
          </h1>
          <p className="text-white/60 text-xs xs:text-sm">
            Temporada {season.toUpperCase()}
          </p>
        </section>

        {/* Tabs: Clasificación / Participantes */}
        <SplitContent rankings={rankings} participants={participants} />

        {/* J8 & J9 Action Buttons */}
        <section className="retro-border border-3 xs:border-4 border-jacksons-purple-600 bg-jacksons-purple-900/50 p-4 xs:p-6 mt-6 xs:mt-8">
          <h3 className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide mb-4 xs:mb-6 text-center">
            Fases Finales
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 xs:gap-4">
            {/* J8 - Los Cruces */}
            <Link
              href={`/${season}/${split}/cruces`}
              className="w-full sm:w-auto retro-border border-2 xs:border-3 border-retro-cyan-500 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 px-4 xs:px-6 py-3 xs:py-4 text-center transition-all hover:-translate-y-1"
            >
              <span className="block text-retro-cyan-300 font-bold text-sm xs:text-base mb-1">
                J8 - Los Cruces
              </span>
              <span className="text-white/60 text-[10px] xs:text-xs uppercase tracking-wide">
                Cuartos de Final
              </span>
            </Link>

            {/* J9 - The Finals */}
            <Link
              href={ROUTES.finals(season, split)}
              className="w-full sm:w-auto retro-border border-2 xs:border-3 border-retro-gold-500 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 px-4 xs:px-6 py-3 xs:py-4 text-center transition-all hover:-translate-y-1"
            >
              <span className="block text-retro-gold-400 font-bold text-sm xs:text-base mb-1">
                J9 - The Finals
              </span>
              <span className="text-white/60 text-[10px] xs:text-xs uppercase tracking-wide">
                Gran Final del Split
              </span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
