import { LinkButton } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import type { SeasonWithActiveSplit } from '@/lib/queries';

export const CurrentSeason = ({
  seasonInfo,
}: {
  seasonInfo: SeasonWithActiveSplit | null;
}) => {
  return (
    <section id="season" className="w-full">
      <div className="mx-auto max-w-5xl px-2 xs:px-4 py-12 xs:py-16 sm:py-20 md:py-28">
        <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-gradient-to-br from-jacksons-purple-800 to-jacksons-purple-900 p-6 xs:p-8 sm:p-10 md:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background decorative detail */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[30px_30px]" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-retro-gold-500/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-retro-cyan-500/10 blur-3xl rounded-full" />

          <div className="relative z-10">
            {seasonInfo?.activeSplit ? (
              <>
                <h2 className="pokemon-title text-retro-gold-400 font-extrabold text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-3 xs:mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-[0.15em]">
                  Temporada Actual
                </h2>
                <p className="text-retro-cyan-300/90 text-sm xs:text-base sm:text-lg mb-2 xs:mb-3 uppercase tracking-[0.2em] font-bold">
                  {seasonInfo.name} · {seasonInfo.activeSplit.name}
                </p>
                <p className="text-white/70 text-xs xs:text-sm mb-6 xs:mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
                  Consulta las clasificaciones en tiempo real, resultados de
                  partidas y el bracket de los playoffs.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-4">
                  <div className="w-full xs:w-auto xs:min-w-[160px] sm:min-w-[180px]">
                    <LinkButton
                      text="Ver Clasificación"
                      href={ROUTES.season(
                        seasonInfo.name,
                        seasonInfo.activeSplit.name,
                      )}
                      variant="yellow"
                      newTab={false}
                    />
                  </div>
                  <div className="w-full xs:w-auto xs:min-w-[160px] sm:min-w-[180px]">
                    <LinkButton
                      text="The Finals"
                      href={ROUTES.finals(
                        seasonInfo.name,
                        seasonInfo.activeSplit.name,
                      )}
                      variant="primary"
                      newTab={false}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="pokemon-title text-retro-gold-400 font-extrabold text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-3 xs:mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-[0.15em]">
                  Próximamente...
                </h2>
                <p className="text-white/70 text-xs xs:text-sm max-w-md mx-auto leading-relaxed">
                  La nueva temporada está en preparación. ¡Mantente atento a
                  nuestras redes sociales para no perderte nada!
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
