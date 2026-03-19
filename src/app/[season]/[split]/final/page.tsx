import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CrucesBracket } from '@/components/cross/CrucesBracket';
import { FinalsDataProvider } from '@/components/divisions/SplitDataProvider/SplitDataProvider';
import {
  DivisionBracket,
  DivisionSection,
  Navbar,
  PageHeader,
} from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { getSplitByNames } from '@/lib/queries';

interface FinalPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: FinalPageProps): Promise<Metadata> {
  const { season, split } = await params;
  const seasonName = season.toUpperCase();
  const splitName = split.replace('split', 'Split ');

  return {
    title: `J16 - The Finals - ${splitName} ${seasonName}`,
    description: `Finales y combates por la permanencia del ${splitName} de la temporada ${seasonName}. Gran final, tercer puesto y El Olimpo en Pokemon Calmind Series.`,
    openGraph: {
      title: `J16 - The Finals - ${splitName} ${seasonName} | Pokemon Calmind Series`,
      description: `Finales de gloria y redención del ${splitName}. Jornada 16.`,
    },
  };
}

export default async function FinalPage({ params }: FinalPageProps) {
  const { season, split } = await params;

  // Get split info using existing query (Next.js best practice)
  const splitInfo = await getSplitByNames(season, split);

  if (!splitInfo) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 py-10 xs:py-16 relative overflow-hidden">
        {/* Background Aesthetic Decorations */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-retro-gold-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-snuff-500/5 blur-[120px] rounded-full" />
        </div>

        {/* Header */}
        <PageHeader
          season={season}
          split={split}
          title="J16 - THE FINALS"
          subtitle="Glory & Redemption"
          backText="Volver a J15"
          backHref={ROUTES.cruces(season, split)}
        />

        <FinalsDataProvider splitId={splitInfo.split.id}>
          {({
            primeraFinals,
            primeraRelegation,
            segundaFinals,
            segundaBottom,
          }) => (
            <>
              {/* PRIMERA DIVISIÓN */}
              <DivisionSection title="Primera División">
                <DivisionBracket
                  title="THE FINALS"
                  subtitle="Championship & 3rd Place"
                  matchups={primeraFinals}
                  accentColor="var(--color-retro-gold-500)"
                  innerAccentColor="var(--color-retro-gold-400)"
                  footerNote="Ganador Final → CAMPEÓN | Ganador 3er → Podio"
                />

                <DivisionBracket
                  title="THE LAST STAND"
                  subtitle="Permanencia & Honor"
                  matchups={primeraRelegation}
                  accentColor="var(--color-snuff-500)"
                  innerAccentColor="var(--color-snuff-400)"
                  footerNote="Ganador Perm. → Se queda en 1ª | Perdedor Perm. → El Olimpo (vs Elegido)"
                />
              </DivisionSection>

              {/* SEGUNDA DIVISIÓN */}
              <DivisionSection title="Segunda División">
                <DivisionBracket
                  title="ASCENSION FINALS"
                  subtitle="Title & Opportunity"
                  matchups={segundaFinals}
                  accentColor="var(--color-retro-gold-500)"
                  innerAccentColor="var(--color-retro-gold-400)"
                  footerNote="Ganador Final → Campeón 2ª | Perdedor Oportunidad → Se queda en 2ª"
                />

                <DivisionBracket
                  title="BOTTOM SECTOR"
                  subtitle="Last Chance & Honor"
                  matchups={segundaBottom}
                  accentColor="var(--color-snuff-500)"
                  innerAccentColor="var(--color-snuff-400)"
                  footerNote="Ganador Last Chance → Se queda en 2ª | Todos los demás → Qualifier"
                />
              </DivisionSection>
            </>
          )}
        </FinalsDataProvider>

        {/* EL OLIMPO TEASER */}
        <section className="mt-20 border-t border-white/10 pt-16 text-center opacity-60 hover:opacity-100 transition-opacity">
          <h3 className="font-pokemon text-white/40 text-xl tracking-[0.5em] mb-4">
            NEXT EVENT: EL OLIMPO
          </h3>
          <p className="text-xs text-white/30 max-w-md mx-auto font-mono">
            Perdedor [Lucha por Permanencia] vs Ganador [La Oportunidad]
          </p>
        </section>
      </div>
    </>
  );
}
