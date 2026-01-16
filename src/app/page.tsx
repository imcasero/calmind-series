import Image from 'next/image';
import pokeballImg from '@/assets/pokeball.png';
import { LinkButton, Navbar } from '@/components/shared';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-4">
        {/* Hero Section */}
        <section id="home" className="relative w-full overflow-hidden">
          <div className="mx-auto max-w-5xl px-1 xs:px-2 sm:px-4 pt-8 pb-8 xs:pt-10 xs:pb-10 sm:pt-16 sm:pb-12 md:pt-24 md:pb-16 text-center relative z-10">
            {/* Main Title with embedded Pokeballs */}
            <div className="relative inline-block">
              {/* Embedded Pokeballs - solid, part of the title */}
              <Image
                src={pokeballImg}
                alt=""
                width={44}
                height={44}
                className="absolute -left-12 sm:-left-14 top-1 -rotate-20 hidden sm:block drop-shadow-lg"
              />
              <Image
                src={pokeballImg}
                alt=""
                width={36}
                height={36}
                className="absolute -right-10 sm:-right-12 top-12 rotate-15 hidden sm:block drop-shadow-lg"
              />
              <h1 className="pokemon-title text-retro-gold-400 drop-shadow-md font-black tracking-wide text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                POKEMON
              </h1>
              <h2 className="pokemon-title text-retro-cyan-300 drop-shadow font-extrabold text-base xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-1">
                CALMIND SERIES
              </h2>
            </div>

            {/* Tagline Badge */}
            <div className="mt-4 xs:mt-6 sm:mt-8 flex justify-center px-1">
              <div className="retro-border bg-jacksons-purple-800/90 border-2 sm:border-3 border-retro-cyan-500 px-2 xs:px-3 sm:px-6 py-1.5 xs:py-2 sm:py-3">
                <span className="text-retro-gold-300 font-bold uppercase tracking-wider sm:tracking-widest text-[10px] xs:text-xs sm:text-sm">
                  Competición Amateur de Pokemon VGC
                </span>
              </div>
            </div>

            {/* Feature Pills - Unified styling */}
            <div className="mt-4 xs:mt-5 sm:mt-6 flex flex-wrap justify-center gap-1.5 xs:gap-2 sm:gap-3">
              <span className="retro-border bg-jacksons-purple-700 border-2 border-retro-cyan-500 text-retro-cyan-300 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-bold uppercase tracking-wide">
                Combates Bo3
              </span>
              <span className="retro-border bg-jacksons-purple-700 border-2 border-retro-gold-500 text-retro-gold-300 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-bold uppercase tracking-wide">
                Sistema de Ligas
              </span>
              <span className="retro-border bg-jacksons-purple-700 border-2 border-retro-cyan-500 text-retro-cyan-300 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-bold uppercase tracking-wide">
                Ascensos y Descensos
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 xs:mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-4">
              <LinkButton
                text="Inscribirme"
                href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
                variant="yellow"
                newTab={true}
              />
              <LinkButton
                text="Ver Normativa"
                href={EXTERNAL_ROUTES.NORMATIVA_PDF}
                variant="primary"
                newTab={true}
              />
            </div>
          </div>
        </section>

        {/* Tournament Format Section */}
        <section id="formato" className="w-full">
          <div className="mx-auto max-w-5xl px-1 xs:px-2 sm:px-4 py-8 xs:py-10 sm:py-14 md:py-20">
            <h2 className="pokemon-title text-center text-retro-gold-400 font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 xs:mb-3 sm:mb-4">
              Formato del Torneo
            </h2>
            <div className="text-center mb-4 xs:mb-6 sm:mb-10">
              <span className="text-retro-cyan-300/80 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider font-semibold">
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
                      Jornadas 1-7
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
                  16 entrenadores en 2 divisiones compiten en partidas Bo3.
                  Acumula puntos y escala en la clasificación.
                </p>
              </div>

              {/* J8 - Cruces */}
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
                      Jornada 8
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
                  Cada división se divide: Top 4 (1v4, 2v3) luchan por el título
                  y Bottom 4 (5v8, 6v7) por la permanencia.
                </p>
              </div>

              {/* J9 - Finals */}
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
                      Jornada 9
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
                  Gran Final, 3er puesto, Lucha por Permanencia y más. Se decide
                  El Elegido y El Exiliado para el Olimpo.
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
                      Post-J9
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

        {/* About Section */}
        <section id="about" className="w-full">
          <div className="mx-auto max-w-5xl px-1 xs:px-2 sm:px-4 py-8 xs:py-10 sm:py-14 md:py-20">
            <h2 className="pokemon-title text-center text-retro-gold-400 font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 xs:mb-6 sm:mb-10">
              Sobre CalMind
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6">
              {/* Origin Card */}
              <div className="retro-border border-3 xs:border-4 border-retro-cyan-500 bg-jacksons-purple-800 p-4 xs:p-6 shadow-lg">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
                    Nuestro Origen
                  </span>
                </div>
                <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
                  CalMind nació como un equipo de eSports y ha evolucionado
                  hasta convertirse en una promotora de eventos gaming dedicada
                  a crear experiencias competitivas de calidad para la comunidad
                  Pokemon.
                </p>
              </div>

              {/* Mission Card */}
              <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-jacksons-purple-800 p-4 xs:p-6 shadow-lg">
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
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <span className="text-retro-gold-400 font-bold text-xs xs:text-sm uppercase tracking-wide">
                    Nuestra Misión
                  </span>
                </div>
                <p className="text-white/90 text-xs xs:text-sm leading-relaxed">
                  Fomentar la competición sana y accesible, creando un ambiente
                  donde los jugadores puedan desarrollar sus habilidades,
                  aprender de sus rivales y disfrutar del juego estratégico al
                  máximo nivel amateur.
                </p>
              </div>
            </div>

            {/* Stats Row - Retro styled */}
            <div className="mt-4 xs:mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-4">
              <div className="retro-border bg-jacksons-purple-700 border-2 sm:border-3 border-jacksons-purple-500 p-2 xs:p-3 sm:p-4 text-center">
                <span className="text-retro-cyan-300 text-lg xs:text-xl sm:text-2xl font-bold mb-1 block">
                  16
                </span>
                <span className="text-white/80 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">
                  Entrenadores
                </span>
              </div>
              <div className="retro-border bg-jacksons-purple-700 border-2 sm:border-3 border-jacksons-purple-500 p-2 xs:p-3 sm:p-4 text-center">
                <span className="text-retro-gold-400 text-lg xs:text-xl sm:text-2xl font-bold mb-1 block">
                  2
                </span>
                <span className="text-white/80 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">
                  Divisiones
                </span>
              </div>
              <div className="retro-border bg-jacksons-purple-700 border-2 sm:border-3 border-jacksons-purple-500 p-2 xs:p-3 sm:p-4 text-center">
                <span className="text-retro-cyan-300 text-lg xs:text-xl sm:text-2xl font-bold mb-1 block">
                  9
                </span>
                <span className="text-white/80 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">
                  Jornadas
                </span>
              </div>
              <div className="retro-border bg-jacksons-purple-700 border-2 sm:border-3 border-jacksons-purple-500 p-2 xs:p-3 sm:p-4 text-center">
                <span className="text-retro-gold-400 text-lg xs:text-xl sm:text-2xl font-bold mb-1 block">
                  Bo3
                </span>
                <span className="text-white/80 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wide">
                  Formato
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 xs:mt-8 sm:mt-10 flex justify-center px-2">
              <a
                href={EXTERNAL_ROUTES.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 xs:gap-3 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 border-2 xs:border-3 border-retro-cyan-500 retro-border px-3 xs:px-5 py-2 xs:py-3 transition-all duration-300 hover:-translate-y-1"
                aria-label="Síguenos en Twitter/X"
              >
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-retro-cyan-300 group-hover:text-retro-cyan-200 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-white font-bold uppercase tracking-wide text-xs xs:text-sm">
                  Síguenos en X
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Current Season CTA */}
        <section id="season" className="w-full">
          <div className="mx-auto max-w-5xl px-2 xs:px-4 py-8 xs:py-10 sm:py-14 md:py-20">
            <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-linear-to-br from-jacksons-purple-800 to-jacksons-purple-900 p-4 xs:p-6 sm:p-8 md:p-10 text-center shadow-2xl">
              <h2 className="pokemon-title text-retro-gold-400 font-extrabold text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-2 xs:mb-4">
                Temporada Actual
              </h2>
              <p className="text-retro-cyan-300/90 text-xs xs:text-sm sm:text-base mb-1 xs:mb-2 uppercase tracking-wider font-semibold">
                Season 1 · Split 1
              </p>
              <p className="text-white/80 text-xs xs:text-sm mb-4 xs:mb-6 sm:mb-8 max-w-md mx-auto">
                Consulta las clasificaciones en tiempo real, resultados de
                partidas y el bracket de los playoffs.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-4">
                <div className="w-full xs:w-auto xs:min-w-[160px] sm:min-w-[180px]">
                  <LinkButton
                    text="Ver Clasificación"
                    href={ROUTES.CURRENT_SEASON}
                    variant="yellow"
                    newTab={false}
                  />
                </div>
                <div className="w-full xs:w-auto xs:min-w-[160px] sm:min-w-[180px]">
                  <LinkButton
                    text="The Finals"
                    href={ROUTES.finals('s1', 'split1')}
                    variant="primary"
                    newTab={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
