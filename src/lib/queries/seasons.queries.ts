import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Season, Split } from '@/lib/types/database.types';
import {
  type SeasonWithActiveSplit,
  SeasonWithActiveSplitSchema,
  type SeasonWithSplits,
  SeasonWithSplitsSchema,
} from '@/lib/types/schemas';

export type { SeasonWithActiveSplit, SeasonWithSplits };

/**
 * Gets the currently active season with its active split using a single query.
 * Returns null if no active season exists.
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

    // Use Zod to validate and format the result
    const rawData = data as Record<string, unknown>;
    const rawSplits = (rawData.splits as unknown[]) ?? [];
    const activeSplit =
      rawSplits.find(
        (s) => (s as { is_active: boolean; created_at: string }).is_active,
      ) ?? null;

    const result = SeasonWithActiveSplitSchema.safeParse({
      ...rawData,
      activeSplit,
    });

    if (!result.success) {
      console.error(
        '[getActiveSeasonWithSplit] Validation error:',
        result.error,
      );
      return null;
    }

    return result.data;
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
    console.error('[getAllSeasons] Error:', error.message);
    return [];
  }

  return (data ?? []) as Season[];
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

    const rawData = data as Record<string, unknown>;
    // Sort splits by split_order
    const rawSplits = (rawData.splits as unknown[]) ?? [];
    const splits = [...rawSplits].sort(
      (a, b) =>
        (a as { split_order: number }).split_order -
        (b as { split_order: number }).split_order,
    );

    const result = SeasonWithSplitsSchema.safeParse({
      ...rawData,
      splits,
    });

    if (!result.success) {
      console.error('[getSeasonWithSplits] Validation error:', result.error);
      return null;
    }

    return result.data;
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

    const rawData = data as Record<string, unknown>;
    // Sort splits by split_order
    const rawSplits = (rawData.splits as unknown[]) ?? [];
    const splits = [...rawSplits].sort(
      (a, b) =>
        (a as { split_order: number }).split_order -
        (b as { split_order: number }).split_order,
    );

    const result = SeasonWithSplitsSchema.safeParse({
      ...rawData,
      splits,
    });

    if (!result.success) {
      console.error('[getSeasonByName] Validation error:', result.error);
      return null;
    }

    return result.data;
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
