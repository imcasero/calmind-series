import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CrucesBracket } from '@/components/cross/CrucesBracket';
import { Navbar } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { getSplitByNames } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';

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

  const supabase = await createClient();

  // Fetch leagues and J15 matches in parallel (Next.js best practice)
  const [{ data: leagues }, { data: j15Matches }] = await Promise.all([
    supabase
      .from('leagues')
      .select('id, tier_name')
      .eq('split_id', splitInfo.split.id),
    supabase
      .from('matches')
      .select(`
        id, league_id, match_group, match_tag,
        home_trainer_id, away_trainer_id,
        home_sets, away_sets, played,
        home:trainers!matches_home_trainer_id_fkey(nickname, avatar_url),
        away:trainers!matches_away_trainer_id_fkey(nickname, avatar_url)
      `)
      .eq('split_id', splitInfo.split.id)
      .eq('round', 15),
  ]);

  const primeraLeague = leagues?.find((l) => l.tier_name === 'primera');
  const segundaLeague = leagues?.find((l) => l.tier_name === 'segunda');

  // Helper to get winner/loser from a J15 match tag
  const getFromJ15 = (
    leagueId: string | undefined,
    tag: string,
    type: 'winner' | 'loser',
  ) => {
    const match = j15Matches?.find(
      (m) => m.league_id === leagueId && m.match_tag === tag,
    );
    if (!match) return { nickname: 'TBD', position: 0 };

    if (!match.played) {
      const label = type === 'winner' ? 'Ganador' : 'Perdedor';
      // Map tag to readable name
      const tagName = tag
        .replace('semi_', 'Semi ')
        .replace('survival_', 'Superv. ');
      return { nickname: `${label} ${tagName}`, position: 0 };
    }

    const isHomeWinner = (match.home_sets || 0) > (match.away_sets || 0);
    const winner = isHomeWinner ? match.home : match.away;
    const loser = isHomeWinner ? match.away : match.home;

    const target = type === 'winner' ? winner : loser;
    return {
      nickname: target?.nickname || 'Unknown',
      position: 0,
      avatar_url: target?.avatar_url,
    };
  };

  // --- PRIMERA DIVISION LOGIC ---
  const primeraFinals = [
    {
      title: 'Grand Final',
      home: getFromJ15(primeraLeague?.id, 'semi_1', 'winner'), // Winner Semi 1
      away: getFromJ15(primeraLeague?.id, 'semi_2', 'winner'), // Winner Semi 2
    },
    {
      title: '3rd Place',
      home: getFromJ15(primeraLeague?.id, 'semi_1', 'loser'), // Loser Semi 1
      away: getFromJ15(primeraLeague?.id, 'semi_2', 'loser'), // Loser Semi 2
    },
  ];

  const primeraRelegation = [
    {
      title: 'Lucha por Permanencia',
      home: getFromJ15(primeraLeague?.id, 'survival_1', 'winner'), // Winner Surv 1
      away: getFromJ15(primeraLeague?.id, 'survival_2', 'winner'), // Winner Surv 2
    },
    {
      title: 'Morir de Pie',
      home: getFromJ15(primeraLeague?.id, 'survival_1', 'loser'), // Loser Surv 1
      away: getFromJ15(primeraLeague?.id, 'survival_2', 'loser'), // Loser Surv 2
    },
  ];

  // --- SEGUNDA DIVISION LOGIC ---
  const segundaFinals = [
    {
      title: 'Final Segunda',
      home: getFromJ15(segundaLeague?.id, 'semi_1', 'winner'), // Winner Semi 1
      away: getFromJ15(segundaLeague?.id, 'semi_2', 'winner'), // Winner Semi 2
    },
    {
      title: 'La Oportunidad',
      home: getFromJ15(segundaLeague?.id, 'semi_1', 'loser'), // Loser Semi 1
      away: getFromJ15(segundaLeague?.id, 'semi_2', 'loser'), // Loser Semi 2
    },
  ];

  const segundaBottom = [
    {
      title: 'Last Chance',
      home: getFromJ15(segundaLeague?.id, 'survival_1', 'winner'), // Winner Surv 1
      away: getFromJ15(segundaLeague?.id, 'survival_2', 'winner'), // Winner Surv 2
    },
    {
      title: 'El Combate del Honor',
      home: getFromJ15(segundaLeague?.id, 'survival_1', 'loser'), // Loser Surv 1
      away: getFromJ15(segundaLeague?.id, 'survival_2', 'loser'), // Loser Surv 2
    },
  ];

  // --- EL OLIMPO ---
  // Loser of "Lucha por Permanencia" (Primera) vs Winner of "La Oportunidad" (Segunda)
  // Since "Lucha por Permanencia" is a J16 match, we theoretically need J16 results.
  // BUT this page IS J16. So El Olimpo is usually played AFTER or if this is the view FOR J16,
  // we show the participants who *qualified* for it.
  // Wait, the prompt says "el que pierte ira al combate llamado EL OLIMPO".
  // This implies El Olimpo is a separate event *after* J16 results? Or maybe it's displayed here as the *destination*?
  // "este combate el ganador sera el elegido e ira al combate llamado EL OLIMPO"
  // If J16 contains "Lucha por Permanencia" and "La Oportunidad", then El Olimpo cannot happen in J16 effectively unless it's a double header?
  // Let's assume for this page we display the brackets OF J16. El Olimpo might be a future match.
  // HOWEVER, I will include a placeholder section for "El Olimpo Qualifiers" to show who is fighting for it.

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
            href={ROUTES.cruces(season, split)}
            className="inline-flex items-center gap-2 text-retro-cyan-300/40 text-[10px] uppercase tracking-[0.3em] hover:text-retro-cyan-300 transition-colors font-pokemon border border-white/5 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full"
          >
            ← Volver a J15
          </Link>
          <h1 className="pokemon-title animate-in fade-in zoom-in duration-700 text-retro-gold-400 text-3xl xs:text-4xl sm:text-6xl mt-8 mb-4 tracking-tighter">
            J16 - THE FINALS
          </h1>
          <div className="flex items-center justify-center gap-4 opacity-50">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-white/20" />
            <p className="text-white/60 text-xs xs:text-sm font-pokemon uppercase tracking-[0.4em]">
              Glory & Redemption
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
            title="THE FINALS"
            subtitle="Championship & 3rd Place"
            matchups={primeraFinals}
            accentColor="var(--color-retro-gold-500)"
            innerAccentColor="var(--color-retro-gold-400)"
            footerNote="Ganador Final → CAMPEÓN | Ganador 3er → Podio"
          />

          <CrucesBracket
            title="THE LAST STAND"
            subtitle="Permanencia & Honor"
            matchups={primeraRelegation}
            accentColor="var(--color-snuff-500)"
            innerAccentColor="var(--color-snuff-400)"
            footerNote="Ganador Perm. → Se queda en 1ª | Perdedor Perm. → El Olimpo (vs Elegido)"
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
            title="ASCENSION FINALS"
            subtitle="Title & Opportunity"
            matchups={segundaFinals}
            accentColor="var(--color-retro-gold-500)"
            innerAccentColor="var(--color-retro-gold-400)"
            footerNote="Ganador Final → Campeón 2ª | Perdedor Oportunidad → Se queda en 2ª"
          />

          <CrucesBracket
            title="BOTTOM SECTOR"
            subtitle="Last Chance & Honor"
            matchups={segundaBottom}
            accentColor="var(--color-snuff-500)"
            innerAccentColor="var(--color-snuff-400)"
            footerNote="Ganador Last Chance → Se queda en 2ª | Todos los demás → Qualifier"
          />
        </div>

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
