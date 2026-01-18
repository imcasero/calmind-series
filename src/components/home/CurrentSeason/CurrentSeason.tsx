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
      <div className="mx-auto max-w-5xl px-2 xs:px-4 py-8 xs:py-10 sm:py-14 md:py-20">
        <div className="retro-border border-3 xs:border-4 border-retro-gold-500 bg-linear-to-br from-jacksons-purple-800 to-jacksons-purple-900 p-4 xs:p-6 sm:p-8 md:p-10 text-center shadow-2xl">
          {seasonInfo?.activeSplit ? (
            <>
              <h2 className="pokemon-title text-retro-gold-400 font-extrabold text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-2 xs:mb-4">
                Temporada Actual
              </h2>
              <p className="text-retro-cyan-300/90 text-xs xs:text-sm sm:text-base mb-1 xs:mb-2 uppercase tracking-wider font-semibold">
                {seasonInfo.name} · {seasonInfo.activeSplit.name}
              </p>
              <p className="text-white/80 text-xs xs:text-sm mb-4 xs:mb-6 sm:mb-8 max-w-md mx-auto">
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
              <h2 className="pokemon-title text-retro-gold-400 font-extrabold text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-2 xs:mb-4">
                Próximamente...
              </h2>
              <p className="text-white/80 text-xs xs:text-sm max-w-md mx-auto">
                La nueva temporada está en preparación. ¡Mantente atento a
                nuestras redes sociales para no perderte nada!
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
