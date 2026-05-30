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
    const splits = data.splits ?? [];
    const activeSplit = splits.find((s) => s.is_active) ?? null;

    const result = SeasonWithActiveSplitSchema.safeParse({
      ...data,
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

  return data ?? [];
});

/**
 * Gets every season with its splits (nested), newest year first, splits ordered
 * by split_order. One query — feeds the redesign's Season/Split selector chip.
 */
export const getAllSeasonsWithSplits = cache(
  async (): Promise<SeasonWithSplits[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('seasons')
      .select(`
      *,
      splits(*)
    `)
      .order('year', { ascending: false });

    if (error || !data) {
      console.error(
        '[getAllSeasonsWithSplits] Error:',
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
          '[getAllSeasonsWithSplits] Validation error:',
          parsed.error,
        );
      }
    }

    return result;
  },
);

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

    // Sort splits by split_order
    const splits = [...(data.splits ?? [])].sort(
      (a, b) => a.split_order - b.split_order,
    );

    const result = SeasonWithSplitsSchema.safeParse({
      ...data,
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

    // Sort splits by split_order
    const splits = [...(data.splits ?? [])].sort(
      (a, b) => a.split_order - b.split_order,
    );

    const result = SeasonWithSplitsSchema.safeParse({
      ...data,
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
 * Cookie-free URL-shape pairs for every (season, split) in the DB. Powers
 * `generateStaticParams()` on `/archivo/[season]/[split]` (REQ-21) — must use
 * the `{ session: false }` client so the call stays eligible for build-time
 * prerender. Lowercases both segments so the canonical SSG URL matches the
 * case-insensitive lookup that `getSplitByNames` performs at request time.
 */
export const getArchiveSplitParams = cache(
  async (): Promise<Array<{ season: string; split: string }>> => {
    const supabase = await createClient({ session: false });

    const { data, error } = await supabase
      .from('seasons')
      .select(`
        name,
        splits(name)
      `)
      .order('year', { ascending: false });

    if (error || !data) {
      console.error(
        '[getArchiveSplitParams] Error:',
        error?.message ?? 'No data',
      );
      return [];
    }

    return data.flatMap((season) =>
      (season.splits ?? []).map((split) => ({
        season: season.name.toLowerCase(),
        split: split.name.toLowerCase(),
      })),
    );
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
    const supabase = await createClient({ session: false });

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

    const season = seasonData;

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
      split: splitData,
    };
  },
);
