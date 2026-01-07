import LinkButton from './_components/LinkButton';
import DivisionCard from './_components/DivisionCard';

// SVG paths para los iconos
const trophyIcon = "M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V7C19 10.31 16.31 13 13 13H12V16H14C14.55 16 15 16.45 15 17S14.55 18 14 18H10C9.45 18 9 17.55 9 17S9.45 16 10 16H12V13H11C7.69 13 5 10.31 5 7V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V7C7 9.21 8.79 11 11 11H13C15.21 11 17 9.21 17 7V6H7Z";
const usersIcon = "M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z";

export default function HomePage() {
  return (
    <>
      {/* Welcome Section */}
      <section id="home" className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">

          <h1 className="pokemon-title text-retro-gold-400 drop-shadow-md font-black tracking-wide text-5xl sm:text-6xl md:text-7xl leading-tight">
            POKEMON
          </h1>
          <p className="pokemon-title text-retro-cyan-300 drop-shadow font-extrabold text-2xl sm:text-3xl md:text-4xl mt-1">
            CALMIND SERIES
          </p>

          <p className="text-white/90 mt-6 text-sm sm:text-base">
            Competición Amateur de Pokemon
          </p>
          <p className="text-white/85 mt-2 text-sm sm:text-base">
            Combates estratégicos · Accesible para todos · Demuestra tu habilidad
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-5 flex-wrap">
            <div className="scale-110">
              <LinkButton text="Participar" href="https://forms.gle/Ai7mZvu38nj85NiZ8" variant="yellow" newTab={true} />
            </div>
            <div className="scale-110">
              <LinkButton text="Normativa" href="/normativa_pokemon_calmind_series.pdf" variant="primary" newTab={true} />
            </div>
          </div>

        </div>

        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60"></div>
      </section>

      {/* Info Section */}
      <section id="info" className="w-full">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <h2 className="pokemon-title text-center text-retro-gold-400 font-extrabold text-2xl sm:text-3xl md:text-4xl">
            Sobre CalMind
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <div className="retro-border border-4 border-retro-cyan-500 bg-jacksons-purple-800 p-6 shadow-lg">
              <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                CalMind comenzó como un equipo de eSports y ha evolucionado para convertirse en una promotora de eventos
                gaming dedicada a crear experiencias competitivas de calidad.
              </p>
            </div>
            <div className="retro-border border-4 border-retro-cyan-500 bg-jacksons-purple-800 p-6 shadow-lg">
              <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                Nuestro objetivo es fomentar la competición sana y accesible, creando un ambiente donde los jugadores puedan
                desarrollar sus habilidades y disfrutar del juego estratégico.
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-8 flex justify-center">
            <a
              href="https://x.com/calmind_team"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 border-3 border-retro-cyan-500 retro-border px-4 py-2 transition-all duration-300 hover:-translate-y-1"
              aria-label="Síguenos en Twitter/X"
            >
              <svg className="w-4 h-4 text-retro-cyan-300 group-hover:text-retro-cyan-200 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-white font-bold uppercase tracking-wide text-xs">
                Síguenos en X
              </span>
            </a>
          </div>
        </div>
        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60"></div>
      </section>

      {/* Divisions Section */}
      <section id="divisiones" className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-12 text-center">
            <h2 className="pokemon-title text-center text-retro-gold-400 font-extrabold text-2xl sm:text-3xl md:text-4xl mb-4">
              Divisiones
            </h2>
            <p className="text-white/90 text-sm sm:text-base">
              Compite en tu nivel y asciende en las clasificaciones
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <DivisionCard
              title="PRIMERA DIVISIÓN"
              subtitle="Elite de entrenadores"
              description="Los mejores entrenadores compiten por el título de campeón en combates de alto nivel estratégico."
              variant="gold"
              icon={trophyIcon}
              buttonText="Ver clasificación"
              buttonHref="/primera-division"
            />

            <DivisionCard
              title="SEGUNDA DIVISIÓN"
              subtitle="Entrenadores en ascenso"
              description="Competidores prometedores que buscan demostrar su valía y ascender a la Primera División."
              variant="purple"
              icon={usersIcon}
              buttonText="Ver clasificación"
              buttonHref="/segunda-division"
            />
          </div>
        </div>

        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60"></div>
      </section>
    </>
  );
}
