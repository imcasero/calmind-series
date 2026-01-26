export const TournamentFormat = () => {
  return (
    <section id="formato" className="w-full">
      <div className="mx-auto max-w-5xl px-1 xs:px-2 sm:px-4 py-12 xs:py-16 sm:py-20 md:py-28">
        {/* Section Header with decorative lines - matching cruces style */}
        <div className="flex items-center gap-6 mb-6 xs:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-retro-cyan-500/30" />
          <h2 className="pokemon-title text-center text-retro-gold-400 font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-[0.2em]">
            Formato del Torneo
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-retro-cyan-500/30" />
        </div>
        <div className="text-center mb-8 xs:mb-10 sm:mb-14">
          <span className="text-retro-cyan-300/80 text-[10px] xs:text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold">
            Sistema de Splits por Temporada
          </span>
        </div>

        {/* Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6">
          {/* Regular Season */}
          <div className="retro-border border-3 xs:border-4 border-retro-cyan-500 bg-jacksons-purple-800 p-3 xs:p-5 shadow-lg">
            <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="bg-retro-cyan-600 p-1.5 xs:p-2 retro-border">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
                  Fase Regular
                </span>
                <span className="block text-white/60 text-xs xs:text-sm">
                  Jornadas 1-14
                </span>
              </div>
            </div>
            <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
              16 entrenadores en 2 divisiones compiten en partidas Bo3 a doble
              vuelta. Acumula puntos y escala en la clasificación.
            </p>
          </div>

          {/* J15 - Cruces */}
          <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-jacksons-purple-800 p-3 xs:p-5 shadow-lg">
            <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="bg-retro-gold-500 p-1.5 xs:p-2 retro-border">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-jacksons-purple-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
                  Los Cruces
                </span>
                <span className="block text-white/60 text-xs xs:text-sm">
                  Jornada 15
                </span>
              </div>
            </div>
            <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
              Cada división se divide: Top 4 (1v4, 2v3) luchan por el título y
              Bottom 4 (5v8, 6v7) por la permanencia.
            </p>
          </div>

          {/* J16 - Finals */}
          <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-jacksons-purple-800 p-3 xs:p-5 shadow-lg">
            <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="bg-retro-gold-500 p-1.5 xs:p-2 retro-border">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-jacksons-purple-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
                  Las Finales
                </span>
                <span className="block text-white/60 text-xs xs:text-sm">
                  Jornada 16
                </span>
              </div>
            </div>
            <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
              Gran Final, 3er puesto, Lucha por Permanencia y más. Se decide El
              Elegido y El Exiliado para el Olimpo.
            </p>
          </div>

          {/* Olympus */}
          <div className="retro-border border-3 xs:border-4 border-snuff-500 bg-jacksons-purple-800 p-3 xs:p-5 shadow-lg">
            <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="bg-snuff-500 p-1.5 xs:p-2 retro-border">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
                  El Olimpo
                </span>
                <span className="block text-white/60 text-xs xs:text-sm">
                  Post-J16
                </span>
              </div>
            </div>
            <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
              <strong>El exiliado</strong> de primera vs{' '}
              <strong>el elegido</strong> de segunda. El ganador asciende o
              mantiene su puesto en la elite.
            </p>
          </div>
        </div>

        {/* Scoring System */}
        <div className="mt-6 xs:mt-8 sm:mt-10 retro-border border-2 xs:border-3 sm:border-4 border-jacksons-purple-600 bg-jacksons-purple-900/50 p-3 xs:p-4 sm:p-6">
          <h3 className="text-retro-cyan-300 font-bold text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide mb-2 xs:mb-3 sm:mb-4 text-center">
            Sistema de Puntuación
          </h3>
          <div className="grid grid-cols-4 gap-1 xs:gap-2 sm:gap-4 text-center">
            <div>
              <span className="block text-retro-gold-400 font-bold text-lg xs:text-xl sm:text-2xl">
                3
              </span>
              <span className="text-white/70 text-[8px] xs:text-[10px] sm:text-sm uppercase tracking-wide">
                Victoria 2-0
              </span>
            </div>
            <div className="border-l border-white/20">
              <span className="block text-retro-gold-400 font-bold text-lg xs:text-xl sm:text-2xl">
                2
              </span>
              <span className="text-white/70 text-[8px] xs:text-[10px] sm:text-sm uppercase tracking-wide">
                Victoria 2-1
              </span>
            </div>
            <div className="border-l border-white/20">
              <span className="block text-retro-cyan-400 font-bold text-lg xs:text-xl sm:text-2xl">
                1
              </span>
              <span className="text-white/70 text-[8px] xs:text-[10px] sm:text-sm uppercase tracking-wide">
                Derrota 1-2
              </span>
            </div>
            <div className="border-l border-white/20">
              <span className="block text-snuff-400 font-bold text-lg xs:text-xl sm:text-2xl">
                0
              </span>
              <span className="text-white/70 text-[8px] xs:text-[10px] sm:text-sm uppercase tracking-wide">
                Derrota 0-2
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
