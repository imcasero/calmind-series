import Link from 'next/link';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';

interface FinalPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export default async function FinalPage({ params }: FinalPageProps) {
  const { season, split } = await params;

  // Mock data - will be replaced with API call
  const mockGrandFinal = {
    tag: 'grand_final',
    home: { name: 'Ganador Semi 1', from: 'J15 Semi 1' },
    away: { name: 'Ganador Semi 2', from: 'J15 Semi 2' },
    winner: null,
  };

  const mockThirdPlace = {
    tag: 'third_place',
    home: { name: 'Perdedor Semi 1', from: 'J15 Semi 1' },
    away: { name: 'Perdedor Semi 2', from: 'J15 Semi 2' },
    winner: null,
  };

  const mockFifthPlace = {
    tag: 'fifth_place',
    home: { name: 'Ganador Surv. 1', from: 'J15 Supervivencia 1' },
    away: { name: 'Ganador Surv. 2', from: 'J15 Supervivencia 2' },
    winner: null,
  };

  const mockRelegation = {
    tag: 'relegation_final',
    home: { name: 'Perdedor Surv. 1', from: 'J15 Supervivencia 1' },
    away: { name: 'Perdedor Surv. 2', from: 'J15 Supervivencia 2' },
    winner: null,
  };

  const mockOlympus = {
    tag: 'promotion_playoff',
    home: { name: 'Perdedor Relegation', from: '1ª División' },
    away: { name: 'Campeón', from: '2ª División' },
    winner: null,
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
            J16 - The Finals
          </h1>
          <p className="text-white/60 text-xs xs:text-sm">
            Finales y Promoción - {season.toUpperCase()}{' '}
            {split.replace('split', 'Split ')}
          </p>
        </section>

        {/* Navigation to J15 */}
        <section className="mb-6 xs:mb-8 text-center">
          <Link
            href={ROUTES.cruces(season, split)}
            className="inline-block text-retro-cyan-300/70 text-xs uppercase tracking-wide hover:text-retro-cyan-300 transition-colors"
          >
            ← Ver J15 - Los Cruces
          </Link>
        </section>

        {/* GRAN FINAL */}
        <section className="mb-6 xs:mb-8">
          <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-gradient-to-br from-jacksons-purple-800 to-jacksons-purple-900 p-4 xs:p-6 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-4 xs:mb-6">
              <span className="text-retro-gold-400 text-lg xs:text-xl">🏆</span>
              <h2 className="text-retro-gold-400 font-bold text-base xs:text-lg uppercase tracking-wide text-center">
                Gran Final
              </h2>
              <span className="text-retro-gold-400 text-lg xs:text-xl">🏆</span>
            </div>

            <div className="retro-border border-2 xs:border-3 border-retro-gold-400/50 bg-jacksons-purple-900/50 p-3 xs:p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-jacksons-purple-700 px-3 xs:px-4 py-2.5 xs:py-3">
                  <span className="text-white font-bold text-sm xs:text-base">
                    {mockGrandFinal.home.name}
                  </span>
                  <span className="text-white/50 text-[10px] xs:text-xs">
                    {mockGrandFinal.home.from}
                  </span>
                </div>
                <div className="text-center text-retro-gold-400 font-bold text-xs xs:text-sm">
                  VS
                </div>
                <div className="flex items-center justify-between bg-jacksons-purple-700 px-3 xs:px-4 py-2.5 xs:py-3">
                  <span className="text-white font-bold text-sm xs:text-base">
                    {mockGrandFinal.away.name}
                  </span>
                  <span className="text-white/50 text-[10px] xs:text-xs">
                    {mockGrandFinal.away.from}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-retro-gold-400 text-[10px] xs:text-xs uppercase tracking-wide">
                  Ganador → Campeón del Split
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3rd Place & 5th Place */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6 mb-6 xs:mb-8">
          {/* 3rd Place Match */}
          <div className="retro-border border-3 xs:border-4 border-retro-cyan-500 bg-jacksons-purple-800 p-4 xs:p-5">
            <h3 className="text-retro-cyan-300 font-bold text-xs xs:text-sm uppercase tracking-wide mb-3 xs:mb-4 text-center">
              🥉 3er Puesto
            </h3>
            <div className="retro-border border-2 border-retro-cyan-500/30 bg-jacksons-purple-900/50 p-2 xs:p-3">
              <div className="space-y-2">
                <div className="bg-jacksons-purple-700 px-2 xs:px-3 py-1.5 xs:py-2">
                  <span className="text-white text-xs xs:text-sm block">
                    {mockThirdPlace.home.name}
                  </span>
                  <span className="text-white/40 text-[9px] xs:text-[10px]">
                    {mockThirdPlace.home.from}
                  </span>
                </div>
                <div className="text-center text-white/40 text-[10px] xs:text-xs">
                  VS
                </div>
                <div className="bg-jacksons-purple-700 px-2 xs:px-3 py-1.5 xs:py-2">
                  <span className="text-white text-xs xs:text-sm block">
                    {mockThirdPlace.away.name}
                  </span>
                  <span className="text-white/40 text-[9px] xs:text-[10px]">
                    {mockThirdPlace.away.from}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5th Place Match */}
          <div className="retro-border border-3 xs:border-4 border-jacksons-purple-500 bg-jacksons-purple-800 p-4 xs:p-5">
            <h3 className="text-jacksons-purple-300 font-bold text-xs xs:text-sm uppercase tracking-wide mb-3 xs:mb-4 text-center">
              5º Puesto
            </h3>
            <div className="retro-border border-2 border-jacksons-purple-500/30 bg-jacksons-purple-900/50 p-2 xs:p-3">
              <div className="space-y-2">
                <div className="bg-jacksons-purple-700 px-2 xs:px-3 py-1.5 xs:py-2">
                  <span className="text-white text-xs xs:text-sm block">
                    {mockFifthPlace.home.name}
                  </span>
                  <span className="text-white/40 text-[9px] xs:text-[10px]">
                    {mockFifthPlace.home.from}
                  </span>
                </div>
                <div className="text-center text-white/40 text-[10px] xs:text-xs">
                  VS
                </div>
                <div className="bg-jacksons-purple-700 px-2 xs:px-3 py-1.5 xs:py-2">
                  <span className="text-white text-xs xs:text-sm block">
                    {mockFifthPlace.away.name}
                  </span>
                  <span className="text-white/40 text-[9px] xs:text-[10px]">
                    {mockFifthPlace.away.from}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Relegation Final */}
        <section className="mb-6 xs:mb-8">
          <div className="retro-border border-3 xs:border-4 border-snuff-500 bg-jacksons-purple-800 p-4 xs:p-5">
            <h3 className="text-snuff-400 font-bold text-xs xs:text-sm uppercase tracking-wide mb-3 xs:mb-4 text-center">
              ⚔️ Lucha por Permanencia
            </h3>
            <div className="retro-border border-2 border-snuff-500/30 bg-jacksons-purple-900/50 p-3 xs:p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                  <span className="text-white text-xs xs:text-sm">
                    {mockRelegation.home.name}
                  </span>
                  <span className="text-white/40 text-[9px] xs:text-[10px]">
                    {mockRelegation.home.from}
                  </span>
                </div>
                <div className="text-center text-white/40 text-[10px] xs:text-xs">
                  VS
                </div>
                <div className="flex items-center justify-between bg-jacksons-purple-700 px-2 xs:px-3 py-2 xs:py-2.5">
                  <span className="text-white text-xs xs:text-sm">
                    {mockRelegation.away.name}
                  </span>
                  <span className="text-white/40 text-[9px] xs:text-[10px]">
                    {mockRelegation.away.from}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <span className="text-snuff-400/80 text-[10px] xs:text-xs">
                  Perdedor → El Olimpo (Play-off de Promoción)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* El Olimpo */}
        <section>
          <div className="retro-border border-3 xs:border-4 border-retro-cyan-400 bg-gradient-to-br from-jacksons-purple-900 to-jacksons-purple-950 p-4 xs:p-6">
            <div className="flex items-center justify-center gap-2 mb-4 xs:mb-6">
              <span className="text-retro-cyan-300 text-lg xs:text-xl">⚡</span>
              <h2 className="text-retro-cyan-300 font-bold text-base xs:text-lg uppercase tracking-wide text-center">
                El Olimpo
              </h2>
              <span className="text-retro-cyan-300 text-lg xs:text-xl">⚡</span>
            </div>
            <p className="text-white/60 text-xs xs:text-sm text-center mb-4 xs:mb-6">
              Play-off de Promoción entre Divisiones
            </p>

            <div className="retro-border border-2 xs:border-3 border-retro-cyan-400/50 bg-jacksons-purple-800/50 p-3 xs:p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-snuff-900/50 border border-snuff-500/30 px-3 xs:px-4 py-2.5 xs:py-3">
                  <div>
                    <span className="text-snuff-400 font-bold text-sm xs:text-base block">
                      El Exiliado
                    </span>
                    <span className="text-white/50 text-[9px] xs:text-[10px]">
                      {mockOlympus.home.from}
                    </span>
                  </div>
                  <span className="text-snuff-400/60 text-[10px] xs:text-xs">
                    Perdedor Permanencia
                  </span>
                </div>
                <div className="text-center text-retro-cyan-300 font-bold text-xs xs:text-sm">
                  VS
                </div>
                <div className="flex items-center justify-between bg-retro-gold-900/30 border border-retro-gold-500/30 px-3 xs:px-4 py-2.5 xs:py-3">
                  <div>
                    <span className="text-retro-gold-400 font-bold text-sm xs:text-base block">
                      El Elegido
                    </span>
                    <span className="text-white/50 text-[9px] xs:text-[10px]">
                      {mockOlympus.away.from}
                    </span>
                  </div>
                  <span className="text-retro-gold-400/60 text-[10px] xs:text-xs">
                    Campeón 2ª Div
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 xs:gap-4 text-center">
                <div className="bg-retro-gold-500/20 border border-retro-gold-500/30 p-2 xs:p-3">
                  <span className="text-retro-gold-400 text-[10px] xs:text-xs uppercase tracking-wide block">
                    Ganador
                  </span>
                  <span className="text-white text-xs xs:text-sm font-bold">
                    1ª División
                  </span>
                </div>
                <div className="bg-snuff-500/20 border border-snuff-500/30 p-2 xs:p-3">
                  <span className="text-snuff-400 text-[10px] xs:text-xs uppercase tracking-wide block">
                    Perdedor
                  </span>
                  <span className="text-white text-xs xs:text-sm font-bold">
                    2ª División
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
