import { cacheLife, cacheTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  type DivisionPreview,
  type RankingEntry,
  RankingEntrySchema,
  type SeasonWithActiveSplit,
  SeasonWithActiveSplitSchema,
  type SeasonWithSplits,
  SeasonWithSplitsSchema,
} from '@/lib/types/schemas';

export interface SplitChampions {
  d1Champion: string | null;
  d2Champion: string | null;
}

type ChampRow = {
  split_id: string | null;
  match_tag: string;
  home_sets: number | null;
  away_sets: number | null;
  home: { nickname: string } | null;
  away: { nickname: string } | null;
};

/**
 * Champions per split across all history, in one query: the winner of each split's
 * `grand_final` (D1) and `segunda_final` (D2). Returns a Map keyed by split_id.
 * Feeds the time-machine archive (FR9). No `olympus` match tag exists in the live
 * DB, so the cross-league winner is not derived here.
 */
export async function getArchiveChampions(): Promise<
  Map<string, SplitChampions>
> {
  'use cache';
  cacheLife('days');
  cacheTag('archive');

  const supabase = await createClient({ session: false });

  const { data, error } = await supabase
    .from('matches')
    .select(
      `
        split_id,
        match_tag,
        home_sets,
        away_sets,
        home:trainers!matches_home_trainer_id_fkey(nickname),
        away:trainers!matches_away_trainer_id_fkey(nickname)
      `,
    )
    .in('match_tag', ['grand_final', 'segunda_final'])
    .eq('played', true);

  const map = new Map<string, SplitChampions>();
  if (error) {
    console.error('[getArchiveChampions] Error:', error.message);
    return map;
  }

  for (const row of (data ?? []) as unknown as ChampRow[]) {
    if (!row.split_id) {
      continue;
    }
    const winner =
      (row.home_sets ?? 0) > (row.away_sets ?? 0)
        ? row.home?.nickname
        : row.away?.nickname;
    if (!winner) {
      continue;
    }
    const existing = map.get(row.split_id) ?? {
      d1Champion: null,
      d2Champion: null,
    };
    if (row.match_tag === 'grand_final') {
      existing.d1Champion = winner;
    } else if (row.match_tag === 'segunda_final') {
      existing.d2Champion = winner;
    }
    map.set(row.split_id, existing);
  }

  return map;
}

/**
 * Cookie-free archive-only sibling of `getDivisionPreview` (REQ-21 Option B
 * fallback). The hub variant lives in `leagues.queries.ts` and stays
 * cookie-aware so `/hub/*` routes remain request-time live; this one uses the
 * `{ session: false }` client so the archive route can be statically
 * prerendered via `generateStaticParams`.
 *
 * Archive pages only render top-3 podiums, which the archive consumer already
 * has via the league_rankings view's stored `position` (the live hub re-applies
 * tiebreakers because lives/sets can change mid-split; past splits are frozen
 * and the view's `position` is authoritative). So this variant skips the
 * matches-driven tiebreaker pass that `getDivisionPreview` does.
 */
export async function getArchiveDivisionPreview(
  splitId: string,
): Promise<DivisionPreview> {
  'use cache';
  cacheLife('days');
  cacheTag('archive', `splits:${splitId}`);

  const supabase = await createClient({ session: false });

  const { data: leagueRows, error: leagueError } = await supabase
    .from('leagues')
    .select('id, tier_priority')
    .eq('split_id', splitId)
    .order('tier_priority', { ascending: true });

  if (leagueError || !leagueRows) {
    console.error(
      '[getArchiveDivisionPreview] Error fetching leagues:',
      leagueError?.message ?? 'No data',
    );
    return { primera: [], segunda: [] };
  }

  const primeraLeagueId =
    leagueRows.find((l) => l.tier_priority === 1)?.id ?? null;
  const segundaLeagueId =
    leagueRows.find((l) => l.tier_priority === 2)?.id ?? null;

  const fetchRankings = async (leagueId: string): Promise<RankingEntry[]> => {
    const [
      { data: rankingsData, error: rankingsError },
      { data: livesData, error: livesError },
    ] = await Promise.all([
      supabase
        .from('league_rankings')
        .select('*')
        .eq('league_id', leagueId)
        .not('position', 'is', null)
        .not('nickname', 'is', null)
        .order('position', { ascending: true }),
      supabase
        .from('league_participants')
        .select('trainer_id, lives')
        .eq('league_id', leagueId),
    ]);
    if (rankingsError || livesError) {
      console.error(
        '[getArchiveDivisionPreview] Error fetching rankings:',
        rankingsError?.message ?? livesError?.message,
      );
      return [];
    }
    const livesMap = new Map(
      (livesData ?? []).map((p) => [p.trainer_id, p.lives]),
    );
    const out: RankingEntry[] = [];
    for (const row of rankingsData ?? []) {
      const lives = livesMap.get(row.trainer_id ?? '') ?? 0;
      const parsed = RankingEntrySchema.safeParse({
        position: row.position,
        nickname: row.nickname,
        totalPoints: row.total_points ?? 0,
        avatarUrl: row.avatar_url,
        setBalance: row.set_balance ?? 0,
        matchesPlayed: row.matches_played ?? 0,
        totalSetsWon: row.total_sets_won ?? 0,
        trainerId: row.trainer_id,
        lives,
      });
      if (parsed.success) {
        out.push(parsed.data);
      }
    }
    return out;
  };

  const [primera, segunda] = await Promise.all([
    primeraLeagueId ? fetchRankings(primeraLeagueId) : Promise.resolve([]),
    segundaLeagueId ? fetchRankings(segundaLeagueId) : Promise.resolve([]),
  ]);

  return { primera, segunda };
}

/**
 * Cookie-free sibling of `getActiveSeasonWithSplit` (REQ-21). The hub layout
 * uses the cookie-aware variant so `/hub/*` remains live; the archive layout
 * uses this one so `/archivo/[season]/[split]` stays SSG-eligible.
 */
export async function getPublicActiveSeasonWithSplit(): Promise<SeasonWithActiveSplit | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('seasons', 'archive');

  const supabase = await createClient({ session: false });

  const { data, error } = await supabase
    .from('seasons')
    .select(`
        *,
        splits(*)
      `)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error(
      '[getPublicActiveSeasonWithSplit] Error:',
      error?.message ?? 'No data',
    );
    return null;
  }

  const splits = data.splits ?? [];
  const activeSplit = splits.find((s) => s.is_active) ?? null;

  const result = SeasonWithActiveSplitSchema.safeParse({
    ...data,
    activeSplit,
  });

  if (!result.success) {
    console.error(
      '[getPublicActiveSeasonWithSplit] Validation error:',
      result.error,
    );
    return null;
  }

  return result.data;
}

/**
 * Cookie-free sibling of `getAllSeasonsWithSplits` (REQ-21). Feeds the
 * Season/Split chip dropdown from the archive layout.
 */
export async function getPublicAllSeasonsWithSplits(): Promise<
  SeasonWithSplits[]
> {
  'use cache';
  cacheLife('hours');
  cacheTag('seasons', 'archive');

  const supabase = await createClient({ session: false });

  const { data, error } = await supabase
    .from('seasons')
    .select(`
        *,
        splits(*)
      `)
    .order('year', { ascending: false });

  if (error || !data) {
    console.error(
      '[getPublicAllSeasonsWithSplits] Error:',
      error?.message ?? 'No data',
    );
    return [];
  }

  const result: SeasonWithSplits[] = [];
  for (const raw of data) {
    const splits = [...(raw.splits ?? [])].sort(
      (a, b) => a.split_order - b.split_order,
    );
    const parsed = SeasonWithSplitsSchema.safeParse({ ...raw, splits });
    if (parsed.success) {
      result.push(parsed.data);
    } else {
      console.error(
        '[getPublicAllSeasonsWithSplits] Validation error:',
        parsed.error,
      );
    }
  }

  return result;
}

/**
 * Cookie-free sibling of `getCurrentRound` (REQ-21). The archive layout uses
 * this for the marquee/phase display even though past splits have no "current
 * round" semantics — the value still drives the shared phase banner UI.
 */
export async function getPublicCurrentRound(splitId: string): Promise<number> {
  'use cache';
  cacheLife('hours');
  cacheTag('archive', `matches:${splitId}`);

  const supabase = await createClient({ session: false });

  const { data, error } = await supabase
    .from('matches')
    .select('round')
    .eq('split_id', splitId)
    .eq('played', true)
    .order('round', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getPublicCurrentRound] Error:', error.message);
    return 0;
  }

  return data?.round ?? 0;
}
