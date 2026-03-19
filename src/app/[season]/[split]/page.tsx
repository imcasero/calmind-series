import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SplitContent from '@/components/divisions/SplitContent/SplitContent';
import SplitDataProvider from '@/components/divisions/SplitDataProvider/SplitDataProvider';
import { Navbar, PageHeader } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { getSplitByNames } from '@/lib/queries';

interface SplitPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export async function generateMetadata({
  params,
}: SplitPageProps): Promise<Metadata> {
  const { season, split } = await params;
  const seasonName = season.toUpperCase();
  const splitName = split.replace('split', 'Split ');

  return {
    title: `${splitName} - ${seasonName}`,
    description: `Clasificación, participantes y enfrentamientos del ${splitName} de la temporada ${seasonName}. Competición amateur de Pokemon.`,
    openGraph: {
      title: `${splitName} - ${seasonName} | Pokemon Calmind Series`,
      description: `${splitName} de la temporada ${seasonName}. Clasificaciones, participantes y calendario de enfrentamientos.`,
    },
  };
}

export default async function SplitPage({ params }: SplitPageProps) {
  const { season, split } = await params;

  // Resolve split from URL params
  const splitInfo = await getSplitByNames(season, split);

  if (!splitInfo) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="max-w-[1800px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-16 xl:px-20 py-10 xs:py-12 sm:py-16">
        {/* Header with decorative lines */}
        <PageHeader
          season={season}
          split={split}
          title={split.replace('split', 'Split ')}
          subtitle={`Temporada ${season.toUpperCase()}`}
        />

        <SplitDataProvider splitId={splitInfo.split.id}>
          {({ rankings, participants, matches }) => (
            <>
              {/* Tabs: Clasificación / Participantes / Enfrentamientos */}
              <SplitContent
                rankings={rankings}
                participants={participants}
                matches={matches}
              />
            </>
          )}
        </SplitDataProvider>

        {/* J15 & J16 Action Buttons */}
        <section className="mt-12 xs:mt-16 sm:mt-20">
          <div className="flex items-center gap-6 mb-8 xs:mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-retro-gold-500/30" />
            <h3 className="text-retro-gold-400 font-pokemon font-bold text-sm xs:text-base uppercase tracking-[0.3em] drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
              Fases Finales
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-retro-gold-500/30" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 xs:gap-6">
            {/* J15 - Los Cruces */}
            <Link
              href={`/${season}/${split}/cruces`}
              className="w-full sm:w-auto relative group"
            >
              <div className="retro-border border-[3px] border-retro-cyan-500 bg-jacksons-purple-950 px-6 xs:px-8 py-4 xs:py-5 text-center transition-all group-hover:-translate-y-1">
                <span className="block text-retro-cyan-300 font-pokemon font-bold text-sm xs:text-base mb-2 uppercase tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                  J15 - Los Cruces
                </span>
                <span className="text-white/50 text-[10px] xs:text-xs uppercase tracking-[0.3em] font-mono">
                  Playoffs & Supervivencia
                </span>
              </div>
            </Link>

            {/* J16 - The Finals */}
            <Link
              href={ROUTES.finals(season, split)}
              className="w-full sm:w-auto relative group"
            >
              <div className="retro-border border-[3px] border-retro-gold-500 bg-jacksons-purple-950 px-6 xs:px-8 py-4 xs:py-5 text-center transition-all group-hover:-translate-y-1">
                <span className="block text-retro-gold-400 font-pokemon font-bold text-sm xs:text-base mb-2 uppercase tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                  J16 - The Finals
                </span>
                <span className="text-white/50 text-[10px] xs:text-xs uppercase tracking-[0.3em] font-mono">
                  Glory & Redemption
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
