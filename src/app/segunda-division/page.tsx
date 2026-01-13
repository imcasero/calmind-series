import { ClassificationTable, DivisionTabs } from '@/components/divisions';
import { LinkButton } from '@/components/shared';
import { EXTERNAL_ROUTES } from '@/lib/constants/routes';
import {
  segundaParticipants,
  segundaPlayers,
} from '@/lib/data/segunda-division.data';

export const metadata = {
  title: 'Segunda División - CalMind Series',
  description: 'Entrenadores prometedores que luchan por ascender',
};

export default function SegundaDivisionPage() {
  return (
    <main className="w-full">
      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <div className="text-6xl mb-6">📈</div>
          <h1 className="pokemon-title text-retro-cyan-300 drop-shadow-md font-black tracking-wide text-5xl sm:text-6xl md:text-7xl leading-tight">
            SEGUNDA DIVISIÓN
          </h1>
          <p className="pokemon-title text-white/95 drop-shadow font-extrabold text-2xl sm:text-3xl md:text-4xl mt-1">
            Entrenadores prometedores que luchan por ascender
          </p>
        </div>
        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60" />
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="retro-border bg-linear-to-r from-retro-cyan-500 to-retro-cyan-600 rounded-lg p-8 text-center text-white border-4 border-retro-cyan-800 shadow-2xl">
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
                  href={EXTERNAL_ROUTES.INSCRIPTION_FORM}
                  variant="yellow"
                  newTab={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60" />
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <DivisionTabs hasData={true} participants={segundaParticipants}>
            <ClassificationTable
              players={segundaPlayers}
              showPromotionZones={true}
            />
          </DivisionTabs>
        </div>
      </section>
    </main>
  );
}
