import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Season, Split } from '@/lib/types/database.types';

/**
 * Season with its active split included
 */
export type SeasonWithActiveSplit = Season & {
  activeSplit: Split | null;
};

/**
 * Season with all its splits
 */
export type SeasonWithSplits = Season & {
  splits: Split[];
};

/**
 * Raw response type from Supabase join query
 */
type SeasonWithSplitsRaw = Season & {
  splits: Split[];
};

/**
 * Gets the currently active season with its active split using a single query.
 * Returns null if no active season exists.
 *
 * @example
 * const season = await getActiveSeasonWithSplit();
 * if (season) {
 *   console.log(season.name, season.activeSplit?.name);
 * }
 */
export const getActiveSeasonWithSplit = cache(
  async (): Promise<SeasonWithActiveSplit | null> => {
    const supabase = await createClient();

    // Single query with join to get season and active split
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
        '[getActiveSeasonWithSplit] Error:',
        error?.message ?? 'No data',
      );
      return null;
    }

    // Type assertion for Supabase join result
    const seasonWithSplits = data as unknown as SeasonWithSplitsRaw;

    // Find the active split from the joined data
    const activeSplit =
      seasonWithSplits.splits.find((split) => split.is_active) ?? null;

    // Destructure to remove splits array and return clean type
    const { splits: _, ...season } = seasonWithSplits;

    return {
      ...season,
      activeSplit,
    };
  },
);

/**
 * Gets all seasons ordered by year (most recent first)
 */
export const getAllSeasons = cache(async (): Promise<Season[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch seasons: ${error.message}`);
  }

  return data ?? [];
});

/**
 * Gets a season by its ID with all its splits using a single query
 */
export const getSeasonWithSplits = cache(
  async (seasonId: string): Promise<SeasonWithSplits | null> => {
    const supabase = await createClient();

    // Single query with join
    const { data, error } = await supabase
      .from('seasons')
      .select(`
      *,
      splits(*)
    `)
      .eq('id', seasonId)
      .single();

    if (error || !data) {
      console.error(
        '[getSeasonWithSplits] Error:',
        error?.message ?? 'No data',
      );
      return null;
    }

    // Type assertion for Supabase join result
    const seasonWithSplits = data as unknown as SeasonWithSplitsRaw;

    // Sort splits by split_order
    const splits = seasonWithSplits.splits.sort(
      (a, b) => a.split_order - b.split_order,
    );

    // Destructure to get clean season object
    const { splits: _, ...season } = seasonWithSplits;

    return {
      ...season,
      splits,
    };
  },
);

/**
 * Gets a season by name with all its splits
 */
export const getSeasonByName = cache(
  async (seasonName: string): Promise<SeasonWithSplits | null> => {
    const supabase = await createClient();

    // Find season by name (case-insensitive)
    const { data, error } = await supabase
      .from('seasons')
      .select(`
        *,
        splits(*)
      `)
      .ilike('name', seasonName)
      .single();

    if (error || !data) {
      console.error('[getSeasonByName] Season not found:', seasonName);
      return null;
    }

    // Type assertion for Supabase join result
    const seasonWithSplits = data as unknown as SeasonWithSplitsRaw;

    // Sort splits by split_order
    const splits = seasonWithSplits.splits.sort(
      (a, b) => a.split_order - b.split_order,
    );

    const { splits: _, ...season } = seasonWithSplits;

    return {
      ...season,
      splits,
    };
  },
);

/**
 * Resolves a split by season name and split name from URL params.
 * Returns the split with its season info if found.
 */
export const getSplitByNames = cache(
  async (
    seasonName: string,
    splitName: string,
  ): Promise<{ season: Season; split: Split } | null> => {
    const supabase = await createClient();

    // Find season by name (case-insensitive)
    const { data: seasonData, error: seasonError } = await supabase
      .from('seasons')
      .select('*')
      .ilike('name', seasonName)
      .single();

    if (seasonError || !seasonData) {
      console.error('[getSplitByNames] Season not found:', seasonName);
      return null;
    }

    const season = seasonData as Season;

    // Find split by name within that season
    const { data: splitData, error: splitError } = await supabase
      .from('splits')
      .select('*')
      .eq('season_id', season.id)
      .ilike('name', splitName)
      .single();

    if (splitError || !splitData) {
      console.error('[getSplitByNames] Split not found:', splitName);
      return null;
    }

    return {
      season,
      split: splitData as Split,
    };
  },
);
