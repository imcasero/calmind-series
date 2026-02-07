import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CrucesBracket } from '@/components/cross/CrucesBracket';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { getDivisionPreview, getSplitByNames } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import type { RankingEntry } from '@/lib/types/schemas';

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
      .eq('round', 15),
  ]);

  const primeraLeague = leagues?.find((l) => l.tier_priority === 1);
  const segundaLeague = leagues?.find((l) => l.tier_priority === 2);

  type J15Match = {
    id: string;
    league_id: string | null;
    match_tag: string;
    home_trainer_id: string | null;
    away_trainer_id: string | null;
    home_sets: number | null;
    away_sets: number | null;
    played: boolean | null;
  };

  function buildMatchups(ranks: RankingEntry[], leagueId?: string) {
    const getTeam = (pos: number) => {
      // Positions are now guaranteed to be unique thanks to tiebreaker rules
      const team = ranks.find((r) => r.position === pos);
      return {
        nickname: team?.nickname || `TBD (${pos}º)`,
        position: pos,
        trainerId: team?.trainerId,
      };
    };

    // Helper to get match result for a specific tag
    const getMatchResult = (tag: string) => {
      const match = (j15Matches as J15Match[] | null)?.find(
        (m) => m.league_id === leagueId && m.match_tag === tag,
      );
      return match;
    };

    // Semifinal 1: 1º vs 4º
    const semi1Match = getMatchResult('semi_1');
    const semi1Home = getTeam(1);
    const semi1Away = getTeam(4);

    // Semifinal 2: 2º vs 3º
    const semi2Match = getMatchResult('semi_2');
    const semi2Home = getTeam(2);
    const semi2Away = getTeam(3);

    // Survival 1: 5º vs 8º
    const surv1Match = getMatchResult('survival_1');
    const surv1Home = getTeam(5);
    const surv1Away = getTeam(8);

    // Survival 2: 6º vs 7º
    const surv2Match = getMatchResult('survival_2');
    const surv2Home = getTeam(6);
    const surv2Away = getTeam(7);

    return {
      top4: [
        {
          title: 'Semifinal 1',
          home: {
            ...semi1Home,
            sets: semi1Match?.played ? semi1Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...semi1Away,
            sets: semi1Match?.played ? semi1Match.away_sets ?? 0 : undefined,
          },
          played: semi1Match?.played ?? false,
        },
        {
          title: 'Semifinal 2',
          home: {
            ...semi2Home,
            sets: semi2Match?.played ? semi2Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...semi2Away,
            sets: semi2Match?.played ? semi2Match.away_sets ?? 0 : undefined,
          },
          played: semi2Match?.played ?? false,
        },
      ],
      bottom4: [
        {
          title: 'Supervivencia 1',
          home: {
            ...surv1Home,
            sets: surv1Match?.played ? surv1Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...surv1Away,
            sets: surv1Match?.played ? surv1Match.away_sets ?? 0 : undefined,
          },
          played: surv1Match?.played ?? false,
        },
        {
          title: 'Supervivencia 2',
          home: {
            ...surv2Home,
            sets: surv2Match?.played ? surv2Match.home_sets ?? 0 : undefined,
          },
          away: {
            ...surv2Away,
            sets: surv2Match?.played ? surv2Match.away_sets ?? 0 : undefined,
          },
          played: surv2Match?.played ?? false,
        },
      ],
    };
  }

  const primeraMatchups = buildMatchups(primeraRanks, primeraLeague?.id);
  const segundaMatchups = buildMatchups(segundaRanks, segundaLeague?.id);

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
        <section className="text-center mb-16 xs:mb-24">
          <Link
            href={ROUTES.season(season, split)}
            className="inline-flex items-center gap-2 text-retro-cyan-300/40 text-[10px] uppercase tracking-[0.3em] hover:text-retro-cyan-300 transition-colors font-pokemon border border-white/5 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full"
          >
            ← {split.toUpperCase()} Standings
          </Link>
          <h1 className="pokemon-title animate-in fade-in zoom-in duration-700 text-retro-gold-400 text-3xl xs:text-4xl sm:text-6xl mt-8 mb-4 tracking-tighter">
            J15 - Los Cruces
          </h1>
          <div className="flex items-center justify-center gap-4 opacity-50">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-white/20" />
            <p className="text-white/60 text-xs xs:text-sm font-pokemon uppercase tracking-[0.4em]">
              Playoffs & Supervivencia
            </p>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-white/20" />
          </div>
        </section>

        {/* PRIMERA DIVISIÓN */}
        <div className="mb-20 xs:mb-32">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-retro-gold-500/30" />
            <h2 className="font-pokemon text-retro-gold-400 text-lg xs:text-2xl uppercase tracking-[0.3em] font-black italic drop-shadow-[0_0_10px_rgba(255,237,78,0.2)]">
              Primera <span className="text-white/20">División</span>
            </h2>
            <div className="h-px flex-1 bg-linear-to-l from-transparent to-retro-gold-500/30" />
          </div>

          <CrucesBracket
            title="THE CHAMPIONSHIP"
            subtitle="Top 4 - Road to Glory"
            matchups={primeraMatchups.top4}
            accentColor="var(--color-retro-gold-500)"
            innerAccentColor="var(--color-retro-gold-400)"
            footerNote="Ganadores → Gran Final | Perdedores → 3er Puesto"
          />

          <CrucesBracket
            title="SURVIVAL SECTOR"
            subtitle="Bottom 4 - Battle for Status"
            matchups={primeraMatchups.bottom4}
            accentColor="var(--color-snuff-500)"
            innerAccentColor="var(--color-snuff-400)"
            footerNote="Ganadores → 5º Puesto | Perdedores → Play-Out (J16)"
          />
        </div>

        {/* SEGUNDA DIVISIÓN */}
        <div className="mb-20 xs:mb-32">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-snuff-500/30" />
            <h2 className="font-pokemon text-snuff-400 text-lg xs:text-2xl uppercase tracking-[0.3em] font-black italic drop-shadow-[0_0_10px_rgba(247,42,155,0.2)]">
              Segunda <span className="text-white/20">División</span>
            </h2>
            <div className="h-px flex-1 bg-linear-to-l from-transparent to-snuff-500/30" />
          </div>

          <CrucesBracket
            title="THE ASCENSION"
            subtitle="Top 4 - Playoffs"
            matchups={segundaMatchups.top4}
            accentColor="var(--color-retro-gold-500)"
            innerAccentColor="var(--color-retro-gold-400)"
            footerNote="Ganadores → Gran Final | Perdedores → 3er Puesto"
          />

          <CrucesBracket
            title="SURVIVAL SECTOR"
            subtitle="Bottom 4 - Battle for Status"
            matchups={segundaMatchups.bottom4}
            accentColor="var(--color-snuff-500)"
            innerAccentColor="var(--color-snuff-400)"
            footerNote="Ganadores → 5º Puesto | Perdedores → The Olympus Fight"
          />
        </div>

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
