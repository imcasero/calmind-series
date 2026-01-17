import { createClient } from '@/lib/supabase/server';
import type { Season, Split } from '@/lib/types/database.types';

/**
 * Season with its active split included
 */
export type SeasonWithActiveSplit = Season & {
  activeSplit: Split | null;
};

/**
 * Gets the currently active season with its active split.
 * Returns null if no active season exists.
 *
 * @example
 * const season = await getActiveSeasonWithSplit();
 * if (season) {
 *   console.log(season.name, season.activeSplit?.name);
 * }
 */
export async function getActiveSeasonWithSplit(): Promise<SeasonWithActiveSplit | null> {
  const supabase = await createClient();

  // Get active season
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('[getActiveSeasonWithSplit] Error:', error?.message ?? 'No data');
    return null;
  }

  const season: Season = data;

  // Get active split for this season
  const { data: splitData } = await supabase
    .from('splits')
    .select('*')
    .eq('season_id', season.id)
    .eq('is_active', true)
    .single();

  const activeSplit: Split | null = splitData ?? null;

  return {
    ...season,
    activeSplit,
  };
}

/**
 * Gets all seasons ordered by year (most recent first)
 */
export async function getAllSeasons(): Promise<Season[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch seasons: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Gets a season by its ID with all its splits
 */
export async function getSeasonWithSplits(seasonId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('id', seasonId)
    .single();

  if (error || !data) {
    return null;
  }

  const season: Season = data;

  const { data: splitsData } = await supabase
    .from('splits')
    .select('*')
    .eq('season_id', seasonId)
    .order('split_order', { ascending: true });

  const splits: Split[] = splitsData ?? [];

  return {
    ...season,
    splits,
  };
}
