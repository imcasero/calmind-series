import Image from 'next/image';
import Link from 'next/link';
import LinkButton from '@/components/shared/ui/Button/LinkButton';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit } from '@/lib/queries';
import CalmindLogo from '../../../../public/CalmindSeriesLogo.png';

export default async function Navbar() {
  const seasonInfo = await getActiveSeasonWithSplit();
  return (
    <nav className="flex flex-col md:flex-row items-center justify-between md:justify-around gap-4 p-6 md:p-8 max-w-7xl mx-auto bg-transparent w-full">
      <Link
        href={ROUTES.HOME}
        className="flex items-center justify-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <Image
          src={CalmindLogo}
          alt="Calmind Series Logo"
          className="h-22 w-22"
          width={88}
          height={88}
        />
        <h1 className="pokemon-title text-3xl font-bold text-yellow-500">
          Pokemon
          <br />
          Calmind
          <br />
          <span className="text-xl font-semibold text-retro-cyan-300">
            Series
          </span>
        </h1>
      </Link>

      <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap">
        {seasonInfo?.name && seasonInfo?.activeSplit?.name && (
          <LinkButton
            text="Temporada"
            href={ROUTES.season(seasonInfo.name, seasonInfo.activeSplit.name)}
            variant="primary"
            newTab={false}
          />
        )}
        <LinkButton
          text="Unete!"
          href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
          variant="yellow"
          newTab={true}
        />
      </div>
    </nav>
  );
}
