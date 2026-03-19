import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CrucesBracket } from '@/components/cross/CrucesBracket';
import { Navbar, PageHeader, DivisionSection, DivisionBracket } from '@/components/shared';
import { ROUTES } from '@/lib/constants/routes';
import { MATCH_TAGS, ROUNDS, TIER_NAMES } from '@/lib/constants/matches';
import { getSplitByNames } from '@/lib/queries';
import { createClient } from '@/lib/supabase/server';
import type { J16Match } from '@/lib/types/matches';
import { MatchService } from '@/lib/services/matchService';

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
      .eq('round', ROUNDS.J15),
  ]);

  const primeraLeague = leagues?.find((l) => l.tier_name === TIER_NAMES.PRIMERA);
  const segundaLeague = leagues?.find((l) => l.tier_name === TIER_NAMES.SEGUNDA);

  // Fetch J16 matches to show results if they exist
  const { data: j16Matches } = await supabase
    .from('matches')
    .select(
      'id, league_id, match_tag, home_trainer_id, away_trainer_id, home_sets, away_sets, played',
    )
    .eq('split_id', splitInfo.split.id)
    .eq('round', ROUNDS.J16);


  // --- PRIMERA DIVISION LOGIC ---
  const grandFinalMatch = MatchService.getJ16Match(j16Matches, primeraLeague?.id, MATCH_TAGS.GRAND_FINAL);
  const thirdPlaceMatch = MatchService.getJ16Match(j16Matches, primeraLeague?.id, MATCH_TAGS.THIRD_PLACE);
  const relegationMatch = MatchService.getJ16Match(j16Matches, primeraLeague?.id, MATCH_TAGS.RELEGATION_BATTLE);
  const honorMatch = MatchService.getJ16Match(j16Matches, primeraLeague?.id, MATCH_TAGS.HONOR_BATTLE);

  const primeraFinals = [
    {
      title: 'Grand Final',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SEMI_1, 'winner'),
        sets: grandFinalMatch?.played
          ? grandFinalMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SEMI_2, 'winner'),
        sets: grandFinalMatch?.played
          ? grandFinalMatch.away_sets ?? 0
          : undefined,
      },
      played: grandFinalMatch?.played ?? false,
    },
    {
      title: '3rd Place',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SEMI_1, 'loser'),
        sets: thirdPlaceMatch?.played
          ? thirdPlaceMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SEMI_2, 'loser'),
        sets: thirdPlaceMatch?.played
          ? thirdPlaceMatch.away_sets ?? 0
          : undefined,
      },
      played: thirdPlaceMatch?.played ?? false,
    },
  ];

  const primeraRelegation = [
    {
      title: 'Lucha por Permanencia',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SURVIVAL_1, 'winner'),
        sets: relegationMatch?.played
          ? relegationMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SURVIVAL_2, 'winner'),
        sets: relegationMatch?.played
          ? relegationMatch.away_sets ?? 0
          : undefined,
      },
      played: relegationMatch?.played ?? false,
    },
    {
      title: 'Morir de Pie',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SURVIVAL_1, 'loser'),
        sets: honorMatch?.played ? honorMatch.home_sets ?? 0 : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, primeraLeague?.id, MATCH_TAGS.SURVIVAL_2, 'loser'),
        sets: honorMatch?.played ? honorMatch.away_sets ?? 0 : undefined,
      },
      played: honorMatch?.played ?? false,
    },
  ];

  // --- SEGUNDA DIVISION LOGIC ---
  const segundaFinalMatch = MatchService.getJ16Match(j16Matches, segundaLeague?.id, MATCH_TAGS.SEGUNDA_FINAL);
  const opportunityMatch = MatchService.getJ16Match(j16Matches, segundaLeague?.id, MATCH_TAGS.OPPORTUNITY);
  const lastChanceMatch = MatchService.getJ16Match(j16Matches, segundaLeague?.id, MATCH_TAGS.LAST_CHANCE);
  const honorSegundaMatch = MatchService.getJ16Match(j16Matches, segundaLeague?.id, MATCH_TAGS.HONOR_SEGUNDA);

  const segundaFinals = [
    {
      title: 'Final Segunda',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SEMI_1, 'winner'),
        sets: segundaFinalMatch?.played
          ? segundaFinalMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SEMI_2, 'winner'),
        sets: segundaFinalMatch?.played
          ? segundaFinalMatch.away_sets ?? 0
          : undefined,
      },
      played: segundaFinalMatch?.played ?? false,
    },
    {
      title: 'La Oportunidad',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SEMI_1, 'loser'),
        sets: opportunityMatch?.played
          ? opportunityMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SEMI_2, 'loser'),
        sets: opportunityMatch?.played
          ? opportunityMatch.away_sets ?? 0
          : undefined,
      },
      played: opportunityMatch?.played ?? false,
    },
  ];

  const segundaBottom = [
    {
      title: 'Last Chance',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SURVIVAL_1, 'winner'),
        sets: lastChanceMatch?.played
          ? lastChanceMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SURVIVAL_2, 'winner'),
        sets: lastChanceMatch?.played
          ? lastChanceMatch.away_sets ?? 0
          : undefined,
      },
      played: lastChanceMatch?.played ?? false,
    },
    {
      title: 'El Combate del Honor',
      home: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SURVIVAL_1, 'loser'),
        sets: honorSegundaMatch?.played
          ? honorSegundaMatch.home_sets ?? 0
          : undefined,
      },
      away: {
        ...MatchService.getFromJ15Match(j15Matches, segundaLeague?.id, MATCH_TAGS.SURVIVAL_2, 'loser'),
        sets: honorSegundaMatch?.played
          ? honorSegundaMatch.away_sets ?? 0
          : undefined,
      },
      played: honorSegundaMatch?.played ?? false,
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
        <PageHeader
          season={season}
          split={split}
          title="J16 - THE FINALS"
          subtitle="Glory & Redemption"
          backText="Volver a J15"
          backHref={ROUTES.cruces(season, split)}
        />

        {/* PRIMERA DIVISIÓN */}
        <DivisionSection
          title="Primera División"
          subtitle=""
          accentColor="var(--color-retro-gold-500)"
          innerAccentColor="var(--color-retro-gold-400)"
        >
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
        <DivisionSection
          title="Segunda División"
          subtitle=""
          accentColor="var(--color-snuff-500)"
          innerAccentColor="var(--color-snuff-400)"
        >
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
