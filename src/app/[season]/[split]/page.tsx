import Link from 'next/link';
import { Navbar } from '@/components/shared';
import { LinkButton } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import type { JornadaStatus } from '@/lib/types/season.types';

interface SplitPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export default async function SplitPage({ params }: SplitPageProps) {
  const { season, split } = await params;

  // Mock data - will be replaced with API call
  const mockJornadaStatus: {
    current: number;
    total: number;
    status: JornadaStatus;
    statusMessage: string;
  } = {
    current: 5,
    total: 9,
    status: 'in_progress',
    statusMessage: 'Jornada 5 en curso - Finalizando 20 de Enero',
  };

  const mockLeaguePreview = {
    primera: [
      { position: 1, name: 'Trainer Red', points: 12 },
      { position: 2, name: 'Trainer Blue', points: 10 },
      { position: 3, name: 'Trainer Green', points: 9 },
    ],
    segunda: [
      { position: 1, name: 'Trainer Gold', points: 11 },
      { position: 2, name: 'Trainer Silver', points: 10 },
      { position: 3, name: 'Trainer Crystal', points: 8 },
    ],
  };

  const getStatusColor = (status: JornadaStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-retro-cyan-600 border-retro-cyan-400';
      case 'completed':
        return 'bg-retro-gold-600 border-retro-gold-400';
      case 'upcoming':
        return 'bg-jacksons-purple-600 border-jacksons-purple-400';
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4 py-6 xs:py-8">
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

        {/* Jornada Status Banner */}
        <section
          className={`retro-border border-2 xs:border-3 ${getStatusColor(mockJornadaStatus.status)} p-3 xs:p-4 mb-6 xs:mb-8 text-center`}
        >
          <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4">
            <span className="text-white font-bold text-sm xs:text-base">
              Jornada {mockJornadaStatus.current} / {mockJornadaStatus.total}
            </span>
            <span className="hidden xs:block text-white/40">|</span>
            <span className="text-white/90 text-xs xs:text-sm">
              {mockJornadaStatus.statusMessage}
            </span>
          </div>
        </section>

        {/* League Table Previews */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6 mb-6 xs:mb-8">
          {/* Primera División Preview */}
          <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-jacksons-purple-800 p-3 xs:p-4">
            <h3 className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide mb-3 xs:mb-4 text-center">
              Primera División
            </h3>
            <div className="space-y-2">
              {mockLeaguePreview.primera.map((player) => (
                <div
                  key={player.position}
                  className="flex items-center justify-between bg-jacksons-purple-900/50 px-2 xs:px-3 py-1.5 xs:py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-retro-gold-400 font-bold text-xs xs:text-sm w-4">
                      {player.position}
                    </span>
                    <span className="text-white text-xs xs:text-sm truncate max-w-[120px] xs:max-w-none">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-retro-cyan-300 font-bold text-xs xs:text-sm">
                    {player.points} pts
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/${season}/${split}/primera`}
              className="block mt-3 xs:mt-4 text-center text-retro-cyan-300 text-[10px] xs:text-xs uppercase tracking-wide hover:text-retro-cyan-200 transition-colors"
            >
              Ver tabla completa →
            </Link>
          </div>

          {/* Segunda División Preview */}
          <div className="retro-border border-3 xs:border-4 border-retro-cyan-500 bg-jacksons-purple-800 p-3 xs:p-4">
            <h3 className="text-retro-cyan-300 font-bold text-xs xs:text-sm uppercase tracking-wide mb-3 xs:mb-4 text-center">
              Segunda División
            </h3>
            <div className="space-y-2">
              {mockLeaguePreview.segunda.map((player) => (
                <div
                  key={player.position}
                  className="flex items-center justify-between bg-jacksons-purple-900/50 px-2 xs:px-3 py-1.5 xs:py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-retro-cyan-300 font-bold text-xs xs:text-sm w-4">
                      {player.position}
                    </span>
                    <span className="text-white text-xs xs:text-sm truncate max-w-[120px] xs:max-w-none">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-retro-gold-400 font-bold text-xs xs:text-sm">
                    {player.points} pts
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/${season}/${split}/segunda`}
              className="block mt-3 xs:mt-4 text-center text-retro-gold-400 text-[10px] xs:text-xs uppercase tracking-wide hover:text-retro-gold-300 transition-colors"
            >
              Ver tabla completa →
            </Link>
          </div>
        </section>

        {/* J8 & J9 Action Buttons */}
        <section className="retro-border border-3 xs:border-4 border-jacksons-purple-600 bg-jacksons-purple-900/50 p-4 xs:p-6">
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
