import Image from 'next/image';
import pokeballImg from '@/assets/pokeball.png';
import { LinkButton } from '@/components/shared';
import { EXTERNAL_ROUTES } from '@/lib/constants/routes';

export const Hero = () => {
  return (
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
  );
};
