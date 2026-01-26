import Link from 'next/link';
import { EXTERNAL_ROUTES, ROUTES } from '@/lib/constants/routes';
import { getActiveSeasonWithSplit } from '@/lib/queries/seasons.queries';

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const activeSeason = await getActiveSeasonWithSplit();

  return (
    <footer className="mt-auto w-full relative bg-jacksons-purple-950/60 backdrop-blur-sm border-t-[3px] border-retro-cyan-500/30">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-retro-gold-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 xs:px-8 py-10 xs:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 xs:gap-10">
          {/* Info Section */}
          <div className="text-center md:text-left space-y-2">
            <h3 className="pokemon-title text-sm xs:text-base text-retro-gold-400 drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
              Pokemon Calmind Series
            </h3>
            <p className="text-xs xs:text-sm text-white/60 uppercase tracking-wider font-semibold">
              Competición Amateur de Pokemon
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col md:flex-row gap-4 xs:gap-6 items-center">
            {activeSeason?.name && activeSeason?.activeSplit?.name && (
              <Link
                href={ROUTES.season(
                  activeSeason.name,
                  activeSeason.activeSplit.name,
                )}
                className="text-sm xs:text-base text-white/70 hover:text-retro-gold-400 transition-all duration-300 uppercase tracking-wide font-semibold hover:drop-shadow-[0_0_8px_rgba(255,237,78,0.3)]"
              >
                Temporada Actual
              </Link>
            )}
            <a
              href={EXTERNAL_ROUTES.NORMATIVA_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm xs:text-base text-white/70 hover:text-retro-cyan-300 transition-all duration-300 uppercase tracking-wide font-semibold hover:drop-shadow-[0_0_8px_rgba(155,143,255,0.3)]"
            >
              Normativa
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right space-y-1.5">
            <p className="text-xs xs:text-sm text-white/50 font-mono">
              &copy; {currentYear} Pokemon Calmind Series
            </p>
            <p className="text-xs text-white/30 font-mono">
              Desarrollado por{' '}
              <a
                href="https://imcasero.dev/"
                target="_blank"
                rel="noopener"
                className="hover:text-retro-cyan-300 font-bold transition-all duration-300"
              >
                @imcasero.dev
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom decorative glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-12 bg-retro-gold-500/5 blur-3xl pointer-events-none" />
    </footer>
  );
}
