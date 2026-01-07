import DivisionTabs from '../_components/DivisionTabs';
import LinkButton from '../_components/LinkButton';
import LiveClassificationTable from '../_components/LiveClassificationTable';
import { getDivisionData } from '../_lib/services/division.service';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export const metadata = {
  title: 'Segunda División - CalMind Series',
  description: 'Entrenadores prometedores que luchan por ascender',
};

export default async function SegundaDivisionPage() {
  const { players, participants, hasData, divisionId } =
    await getDivisionData('Segunda');

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          {/* Chart Emoji */}
          <div className="text-6xl mb-6">📈</div>

          <h1 className="pokemon-title text-retro-cyan-300 drop-shadow-md font-black tracking-wide text-5xl sm:text-6xl md:text-7xl leading-tight">
            SEGUNDA DIVISIÓN
          </h1>
          <p className="pokemon-title text-white/95 drop-shadow font-extrabold text-2xl sm:text-3xl md:text-4xl mt-1">
            Entrenadores prometedores que luchan por ascender
          </p>
        </div>

        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60"></div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="retro-border bg-gradient-to-r from-retro-cyan-500 to-retro-cyan-600 rounded-lg p-8 text-center text-white border-4 border-retro-cyan-800 shadow-2xl">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="pokemon-title text-retro-gold-300 drop-shadow-md font-black tracking-wide text-3xl md:text-4xl mb-4">
              ¡TU MOMENTO DE BRILLAR HA LLEGADO!
            </h2>
            <p className="text-white/95 drop-shadow font-semibold text-lg mb-6">
              Asciende a Primera División y únete a la élite
            </p>
            <div className="flex justify-center">
              <div className="scale-110">
                <LinkButton
                  text="LUCHAR POR EL ASCENSO"
                  href="https://forms.gle/Ai7mZvu38nj85NiZ8"
                  variant="yellow"
                  newTab={true}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60"></div>
      </section>

      {/* Tabs and Content */}
      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <DivisionTabs hasData={hasData} participants={participants}>
            {hasData && divisionId ? (
              <LiveClassificationTable
                divisionId={divisionId}
                divisionName="Segunda"
                initialPlayers={players}
                showPromotionZones={true}
              />
            ) : (
              <div className="bg-jacksons-purple-800/80 rounded-lg border-4 border-yellow-400 p-8 text-center shadow-2xl">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl drop-shadow-md font-black tracking-wide text-yellow-300 mb-4">
                  Clasificación
                </h3>
                <p className="text-white/95 drop-shadow font-semibold">
                  La clasificación de la Segunda División estará disponible
                  cuando comience la temporada.
                </p>
              </div>
            )}
          </DivisionTabs>
        </div>
      </section>
    </main>
  );
}
