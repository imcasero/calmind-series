import Link from 'next/link';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';

interface CrucesPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export default async function CrucesPage({ params }: CrucesPageProps) {
  const { season, split } = await params;

  // Mock data - will be replaced with API call
  const mockTop4Bracket = {
    semi_1: {
      tag: 'semi_1',
      home: { name: '1º Clasificado', seed: 1 },
      away: { name: '4º Clasificado', seed: 4 },
      winner: null,
    },
    semi_2: {
      tag: 'semi_2',
      home: { name: '2º Clasificado', seed: 2 },
      away: { name: '3º Clasificado', seed: 3 },
      winner: null,
    },
  };

  const mockBottom4Bracket = {
    survival_1: {
      tag: 'survival_1',
      home: { name: '5º Clasificado', seed: 5 },
      away: { name: '8º Clasificado', seed: 8 },
      winner: null,
    },
    survival_2: {
      tag: 'survival_2',
      home: { name: '6º Clasificado', seed: 6 },
      away: { name: '7º Clasificado', seed: 7 },
      winner: null,
    },
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 py-6 xs:py-8">
        {/* Header */}
        <section className="text-center mb-6 xs:mb-8">
          <Link
            href={`/${season}/${split}`}
            className="text-retro-cyan-300/60 text-xs uppercase tracking-wider hover:text-retro-cyan-300 transition-colors"
          >
            ← {split.replace('split', 'Split ')}
          </Link>
          <h1 className="pokemon-title text-retro-gold-400 text-xl xs:text-2xl sm:text-3xl mt-2 mb-1">
            J15 - Los Cruces
          </h1>
          <p className="text-white/60 text-xs xs:text-sm">
            Semifinales y Supervivencia
          </p>
        </section>

        {/* TOP 4 Bracket - Lucha por el Título */}
        <section className="mb-6 xs:mb-8">
          <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-jacksons-purple-800 p-4 xs:p-6">
            <h2 className="text-retro-gold-400 font-bold text-sm xs:text-base uppercase tracking-wide mb-4 xs:mb-6 text-center">
              Top 4 - Lucha por el Título
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
              {/* Semi 1: 1st vs 4th */}
              <div className="retro-border border-2 xs:border-3 border-retro-gold-400/50 bg-jacksons-purple-900/50 p-3 xs:p-4">
                <div className="text-retro-gold-400/70 text-[10px] xs:text-xs uppercase tracking-wide mb-2 xs:mb-3 text-center">
                  Semifinal 1
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-retro-gold-400 font-bold text-xs xs:text-sm w-5">
                        #{mockTop4Bracket.semi_1.home.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockTop4Bracket.semi_1.home.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-white/40 text-xs">VS</div>
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-retro-gold-400 font-bold text-xs xs:text-sm w-5">
                        #{mockTop4Bracket.semi_1.away.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockTop4Bracket.semi_1.away.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-white/50 text-[10px] xs:text-xs">
                    Ganador → Gran Final
                  </span>
                </div>
              </div>

              {/* Semi 2: 2nd vs 3rd */}
              <div className="retro-border border-2 xs:border-3 border-retro-gold-400/50 bg-jacksons-purple-900/50 p-3 xs:p-4">
                <div className="text-retro-gold-400/70 text-[10px] xs:text-xs uppercase tracking-wide mb-2 xs:mb-3 text-center">
                  Semifinal 2
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-retro-gold-400 font-bold text-xs xs:text-sm w-5">
                        #{mockTop4Bracket.semi_2.home.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockTop4Bracket.semi_2.home.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-white/40 text-xs">VS</div>
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-retro-gold-400 font-bold text-xs xs:text-sm w-5">
                        #{mockTop4Bracket.semi_2.away.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockTop4Bracket.semi_2.away.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-white/50 text-[10px] xs:text-xs">
                    Ganador → Gran Final
                  </span>
                </div>
              </div>
            </div>

            {/* Flow indicator */}
            <div className="mt-4 xs:mt-6 pt-4 border-t border-white/10 text-center">
              <span className="text-retro-gold-400/70 text-[10px] xs:text-xs uppercase tracking-wide">
                Perdedores → Partido por 3er Puesto (J16)
              </span>
            </div>
          </div>
        </section>

        {/* BOTTOM 4 Bracket - Supervivencia */}
        <section className="mb-6 xs:mb-8">
          <div className="retro-border border-3 xs:border-4 border-snuff-500 bg-jacksons-purple-800 p-4 xs:p-6">
            <h2 className="text-snuff-400 font-bold text-sm xs:text-base uppercase tracking-wide mb-4 xs:mb-6 text-center">
              Bottom 4 - Supervivencia
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
              {/* Survival 1: 5th vs 8th */}
              <div className="retro-border border-2 xs:border-3 border-snuff-500/50 bg-jacksons-purple-900/50 p-3 xs:p-4">
                <div className="text-snuff-400/70 text-[10px] xs:text-xs uppercase tracking-wide mb-2 xs:mb-3 text-center">
                  Supervivencia 1
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-snuff-400 font-bold text-xs xs:text-sm w-5">
                        #{mockBottom4Bracket.survival_1.home.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockBottom4Bracket.survival_1.home.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-white/40 text-xs">VS</div>
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-snuff-400 font-bold text-xs xs:text-sm w-5">
                        #{mockBottom4Bracket.survival_1.away.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockBottom4Bracket.survival_1.away.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-white/50 text-[10px] xs:text-xs">
                    Ganador → 5º Puesto
                  </span>
                </div>
              </div>

              {/* Survival 2: 6th vs 7th */}
              <div className="retro-border border-2 xs:border-3 border-snuff-500/50 bg-jacksons-purple-900/50 p-3 xs:p-4">
                <div className="text-snuff-400/70 text-[10px] xs:text-xs uppercase tracking-wide mb-2 xs:mb-3 text-center">
                  Supervivencia 2
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-snuff-400 font-bold text-xs xs:text-sm w-5">
                        #{mockBottom4Bracket.survival_2.home.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockBottom4Bracket.survival_2.home.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-white/40 text-xs">VS</div>
                  <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-snuff-400 font-bold text-xs xs:text-sm w-5">
                        #{mockBottom4Bracket.survival_2.away.seed}
                      </span>
                      <span className="text-white text-xs xs:text-sm">
                        {mockBottom4Bracket.survival_2.away.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-white/50 text-[10px] xs:text-xs">
                    Ganador → 5º Puesto
                  </span>
                </div>
              </div>
            </div>

            {/* Flow indicator */}
            <div className="mt-4 xs:mt-6 pt-4 border-t border-white/10 text-center">
              <span className="text-snuff-400/70 text-[10px] xs:text-xs uppercase tracking-wide">
                Perdedores → Lucha por Permanencia (J16) → El Olimpo
              </span>
            </div>
          </div>
        </section>

        {/* Navigation to J16 */}
        <section className="text-center">
          <Link
            href={ROUTES.finals(season, split)}
            className="inline-block retro-border border-2 xs:border-3 border-retro-gold-500 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 px-4 xs:px-6 py-2 xs:py-3 transition-all hover:-translate-y-1"
          >
            <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
              Ver J16 - The Finals →
            </span>
          </Link>
        </section>
      </div>
    </>
  );
}
