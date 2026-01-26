import Image from 'next/image';
import Link from 'next/link';
import LinkButton from '@/components/shared/ui/Button/LinkButton';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit } from '@/lib/queries';
import CalmindLogo from '../../../../public/CalmindSeriesLogo.png';

export default async function Navbar() {
  const seasonInfo = await getActiveSeasonWithSplit();
  return (
    <nav className="relative flex flex-col md:flex-row items-center justify-between md:justify-around gap-4 xs:gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Subtle background with border */}
      <div className="absolute inset-0 " />

      <Link
        href={ROUTES.HOME}
        className="relative flex items-center justify-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105 cursor-pointer group"
      >
        <div className="relative">
          <Image
            src={CalmindLogo}
            alt="Calmind Series Logo"
            className="h-22 w-22 drop-shadow-lg"
            width={88}
            height={88}
          />
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-retro-gold-500/0 group-hover:bg-retro-gold-500/10 blur-xl transition-all duration-300 rounded-full" />
        </div>
        <h1 className="pokemon-title text-2xl xs:text-3xl font-bold text-retro-gold-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Pokemon
          <br />
          Calmind
          <br />
          <span className="text-lg xs:text-xl font-semibold text-retro-cyan-300">
            Series
          </span>
        </h1>
      </Link>

      <div className="relative flex items-center justify-center md:justify-end gap-2 xs:gap-3 flex-wrap">
        {seasonInfo?.name && seasonInfo?.activeSplit?.name && (
          <LinkButton
            text="Temporada"
            href={ROUTES.season(seasonInfo.name, seasonInfo.activeSplit.name)}
            variant="primary"
            newTab={false}
          />
        )}
        <LinkButton
          text="Únete!"
          href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
          variant="yellow"
          newTab={true}
        />
      </div>
    </nav>
  );
}
