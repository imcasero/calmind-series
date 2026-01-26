import Link from 'next/link';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/server';
import { CrucesBracket } from '../../../../components/cross/CrucesBracket';

interface RankingRow {
  league_id: string | null;
  nickname: string | null;
  position: number | null;
  trainer_id: string | null;
}

interface CrucesPageProps {
  params: Promise<{
    season: string;
    split: string;
  }>;
}

export default async function CrucesPage({ params }: CrucesPageProps) {
  const { season, split } = await params;
  const supabase = await createClient();

  // 1. Get split ID based on the split name (s1, etc)
  const { data: splitData } = await supabase
    .from('splits')
    .select('id')
    .eq('name', split)
    .single();

  if (!splitData) {
    return <div>Split not found</div>;
  }

  // 2. Get leagues for this split
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, tier_name')
    .eq('split_id', splitData.id);

  if (!leagues || leagues.length === 0) {
    return <div>Leagues not found for this split</div>;
  }

  const primeraLeague = leagues.find((l) => l.tier_name === 'primera');
  const segundaLeague = leagues.find((l) => l.tier_name === 'segunda');

  // 3. Get rankings for both leagues
  const { data: rankings } = await supabase
    .from('league_rankings')
    .select('league_id, nickname, position, trainer_id')
    .in(
      'league_id',
      leagues.map((l) => l.id),
    )
    .order('position', { ascending: true });

  const getRankData = (leagueId?: string): RankingRow[] => {
    if (!leagueId) return [];
    return (
      (rankings?.filter((r) => r.league_id === leagueId) as RankingRow[]) || []
    );
  };

  const primeraRanks = getRankData(primeraLeague?.id);
  const segundaRanks = getRankData(segundaLeague?.id);

  function buildMatchups(ranks: RankingRow[]) {
    const getTeam = (pos: number) => {
      const team = ranks.find((r) => r.position === pos);
      return {
        nickname: team?.nickname || `TBD (${pos}º)`,
        position: pos,
      };
    };

    return {
      top4: [
        { title: 'Semifinal 1', home: getTeam(1), away: getTeam(4) },
        { title: 'Semifinal 2', home: getTeam(2), away: getTeam(3) },
      ],
      bottom4: [
        { title: 'Supervivencia 1', home: getTeam(5), away: getTeam(8) },
        { title: 'Supervivencia 2', home: getTeam(6), away: getTeam(7) },
      ],
    };
  }

  const primeraMatchups = buildMatchups(primeraRanks);
  const segundaMatchups = buildMatchups(segundaRanks);

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
