import { EXTERNAL_ROUTES } from '@/lib/constants/routes';

export const AboutCalmind = () => {
  return (
    <section id="about" className="w-full">
      <div className="mx-auto max-w-5xl px-1 xs:px-2 sm:px-4 py-12 xs:py-16 sm:py-20 md:py-28">
        {/* Section Header with decorative lines - matching cruces style */}
        <div className="flex items-center gap-6 mb-12 xs:mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-retro-gold-500/30" />
          <h2 className="pokemon-title text-center text-retro-gold-400 font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-[0.2em]">
            Sobre CalMind
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-retro-gold-500/30" />
        </div>

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
              CalMind nació como un equipo de eSports y ha evolucionado hasta
              convertirse en una promotora de eventos gaming dedicada a crear
              experiencias competitivas de calidad para la comunidad Pokemon.
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
              donde los jugadores puedan desarrollar sus habilidades, aprender
              de sus rivales y disfrutar del juego estratégico al máximo nivel
              amateur.
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
  );
};
