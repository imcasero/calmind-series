import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

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
export const getArchiveChampions = cache(
  async (): Promise<Map<string, SplitChampions>> => {
    const supabase = await createClient();

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
  },
);
