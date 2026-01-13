import { ClassificationTable, DivisionTabs } from '@/components/divisions';
import { LinkButton } from '@/components/shared';
import { EXTERNAL_ROUTES } from '@/lib/constants/routes';
import {
  primeraParticipants,
  primeraPlayers,
} from '@/lib/data/primera-division.data';

export const metadata = {
  title: 'Primera División - CalMind Series',
  description: 'La élite de Pokémon CalMind Series',
};

export default function PrimeraDivisionPage() {
  return (
    <main className="w-full">
      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <div className="text-6xl mb-6">👑</div>
          <h1 className="pokemon-title text-retro-gold-400 drop-shadow-md font-black tracking-wide text-5xl sm:text-6xl md:text-7xl leading-tight">
            PRIMERA DIVISIÓN
          </h1>
          <p className="pokemon-title text-white/95 drop-shadow font-extrabold text-2xl sm:text-3xl md:text-4xl mt-1">
            La élite de Pokémon CalMind Series
          </p>
        </div>
        <div className="border-t-4 border-retro-gold-500 max-w-5xl mx-auto opacity-60" />
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="retro-border bg-linear-to-r from-snuff-500 to-snuff-600 rounded-lg p-8 text-center text-white border-4 border-snuff-800 shadow-2xl">
            <div className="text-4xl mb-4">⭐</div>
            <h2 className="pokemon-title text-retro-gold-300 drop-shadow-md font-black tracking-wide text-3xl md:text-4xl mb-4">
              ¿ESTÁS LISTO PARA SER EL PRÓXIMO NÚMERO 1?
            </h2>
            <p className="text-white/95 drop-shadow font-semibold text-lg mb-6">
              Demuestra que tienes lo necesario para llegar a la cima
            </p>
            <div className="flex justify-center">
              <div className="scale-110">
                <LinkButton
                  text="INSCRÍBETE AL TORNEO"
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
          <DivisionTabs hasData={true} participants={primeraParticipants}>
            <ClassificationTable
              players={primeraPlayers}
              showPromotionZones={false}
            />
          </DivisionTabs>
        </div>
      </section>
    </main>
  );
}
