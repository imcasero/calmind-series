import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CrucesBracket } from '@/components/cross/CrucesBracket';
import { Navbar, PageHeader, DivisionSection, DivisionBracket } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { ROUNDS, TIER_PRIORITIES, TIER_NAMES } from '@/lib/constants/matches';
import { getDivisionPreview, getSplitByNames } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import type { RankingEntry } from '@/lib/types/schemas';
import type { J15Match } from '@/lib/types/matches';
import { MatchService } from '@/lib/services/matchService';

interface CrucesPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export async function generateMetadata({
  params,
}: CrucesPageProps): Promise<Metadata> {
  const { season, split } = await params;
  const seasonName = season.toUpperCase();
  const splitName = split.replace('split', 'Split ');

  return {
    title: `J15 - Los Cruces - ${splitName} ${seasonName}`,
    description: `Cruces de playoffs y supervivencia del ${splitName} de la temporada ${seasonName}. Semifinales y batallas por el descenso en Pokemon Calmind Series.`,
    openGraph: {
      title: `J15 - Los Cruces - ${splitName} ${seasonName} | Pokemon Calmind Series`,
      description: `Playoffs y supervivencia del ${splitName}. Enfrentamientos de la jornada 15.`,
    },
  };
}

export default async function CrucesPage({ params }: CrucesPageProps) {
  const { season, split } = await params;

  // Get split info using the existing query (follows Next.js best practices)
  const splitInfo = await getSplitByNames(season, split);

  if (!splitInfo) {
    notFound();
  }

  // Get rankings with tiebreaker rules already applied
  const rankings = await getDivisionPreview(splitInfo.split.id);

  const primeraRanks = rankings.primera;
  const segundaRanks = rankings.segunda;

  // Fetch J15 matches to show results if they exist
  const supabase = await createClient();
  const [{ data: leagues }, { data: j15Matches }] = await Promise.all([
    supabase
      .from('leagues')
      .select('id, tier_name, tier_priority')
      .eq('split_id', splitInfo.split.id),
    supabase
      .from('matches')
      .select(
        'id, league_id, match_tag, home_trainer_id, away_trainer_id, home_sets, away_sets, played',
      )
      .eq('split_id', splitInfo.split.id)
      .eq('round', ROUNDS.J15),
  ]);

  const primeraLeague = leagues?.find((l) => l.tier_priority === TIER_PRIORITIES.PRIMERA);
  const segundaLeague = leagues?.find((l) => l.tier_priority === TIER_PRIORITIES.SEGUNDA);


  const primeraMatchups = MatchService.buildJ15Matchups(
    primeraRanks,
    j15Matches as J15Match[] | null,
    primeraLeague?.id
  );
  const segundaMatchups = MatchService.buildJ15Matchups(
    segundaRanks,
    j15Matches as J15Match[] | null,
    segundaLeague?.id
  );

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
          title="J15 - Los Cruces"
          subtitle="Playoffs & Supervivencia"
          backText={`${split.toUpperCase()} Standings`}
        />

        {/* PRIMERA DIVISIÓN */}
        <DivisionSection
          title="Primera División"
          subtitle=""
          accentColor="var(--color-retro-gold-500)"
          innerAccentColor="var(--color-retro-gold-400)"
        >
          <DivisionBracket
            title="THE CHAMPIONSHIP"
            subtitle="Top 4 - Road to Glory"
            matchups={primeraMatchups.top4}
            accentColor="var(--color-retro-gold-500)"
            innerAccentColor="var(--color-retro-gold-400)"
            footerNote="Ganadores → Gran Final | Perdedores → 3er Puesto"
          />

          <DivisionBracket
            title="SURVIVAL SECTOR"
            subtitle="Bottom 4 - Battle for Status"
            matchups={primeraMatchups.bottom4}
            accentColor="var(--color-snuff-500)"
            innerAccentColor="var(--color-snuff-400)"
            footerNote="Ganadores → 5º Puesto | Perdedores → Play-Out (J16)"
          />
        </DivisionSection>

        {/* SEGUNDA DIVISIÓN */}
        <DivisionSection
          title="Segunda División"
          subtitle=""
          accentColor="var(--color-snuff-500)"
          innerAccentColor="var(--color-snuff-400)"
        >
          <DivisionBracket
            title="THE ASCENSION"
            subtitle="Top 4 - Playoffs"
            matchups={segundaMatchups.top4}
            accentColor="var(--color-retro-gold-500)"
            innerAccentColor="var(--color-retro-gold-400)"
            footerNote="Ganadores → Gran Final | Perdedores → 3er Puesto"
          />

          <DivisionBracket
            title="SURVIVAL SECTOR"
            subtitle="Bottom 4 - Battle for Status"
            matchups={segundaMatchups.bottom4}
            accentColor="var(--color-snuff-500)"
            innerAccentColor="var(--color-snuff-400)"
            footerNote="Ganadores → 5º Puesto | Perdedores → The Olympus Fight"
          />
        </DivisionSection>

        {/* Navigation to J16 */}
        <section className="text-center mt-12 pb-12">
          <div className="animate-in fade-in zoom-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Link
              href={ROUTES.finals(season, split)}
              className="inline-block relative group"
            >
              <div className="absolute inset-0 bg-retro-gold-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center gap-4 retro-border border-3 border-retro-gold-500 bg-jacksons-purple-950 px-8 xs:px-12 py-4 xs:py-5 transition-all group-hover:-translate-y-1">
                <span className="text-retro-gold-400 font-black text-sm xs:text-base uppercase tracking-[0.3em] font-pokemon">
                  Ver J16 - The Finals →
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
