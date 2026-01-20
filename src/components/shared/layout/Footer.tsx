import Link from 'next/link';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit } from '@/lib/queries/seasons.queries';

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const activeSeason = await getActiveSeasonWithSplit();

  return (
    <footer className="mt-auto w-full bg-jacksons-purple-900/50 border-t-4 border-jacksons-purple-600">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Info Section */}
          <div className="text-center md:text-left">
            <h3 className="pokemon-title text-base text-yellow-500 mb-2">
              Pokemon Calmind Series
            </h3>
            <p className="text-sm text-gray-300">
              Competición Amateur de Pokemon
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {activeSeason?.name && activeSeason?.activeSplit?.name && (
              <Link
                href={ROUTES.season(
                  activeSeason.name,
                  activeSeason.activeSplit.name,
                )}
                className="text-base text-gray-300 hover:text-yellow-500 transition-colors"
              >
                Temporada Actual
              </Link>
            )}
            <a
              href={EXTERNAL_ROUTES.NORMATIVA_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Normativa
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Pokemon Calmind Series
            </p>
            <p className="text-sm text-gray-500">
              Desarrollado por{' '}
              <a
                href="https://imcasero.dev/"
                target="_blank"
                rel="noopener"
                className="hover:text-zinc-200 font-bold transition-all"
              >
                @imcasero.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
