'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { League, Season, Split } from '@/lib/types/database.types';

export interface UseLeagueSelectorOptions {
  /** Required: the full Season[] (loaded server-side by the parent page). */
  initialSeasons: Season[];
  /** When 'season-split': stops at split. When 'season-split-league': cascades to league. */
  depth?: 'season-split' | 'season-split-league';
  /** Optional initial selection (used by MatchesManager which seeds from `activeSplitInfo`). */
  initialSeasonId?: string | null;
  initialSplitId?: string | null;
  initialLeagueId?: string | null;
}

export interface UseLeagueSelectorResult {
  seasons: Season[];
  splits: Split[];
  leagues: League[];
  selectedSeasonId: string | null;
  selectedSplitId: string | null;
  selectedLeagueId: string | null;
  setSeasonId: (id: string | null) => void;
  setSplitId: (id: string | null) => void;
  setLeagueId: (id: string | null) => void;
  loadingSplits: boolean;
  loadingLeagues: boolean;
  error: string | null;
  clearError: () => void;
  /** Re-fetch splits/leagues at the current selection (used after mutations). */
  refresh: () => Promise<void>;
}

function defaultSeasonId(
  seasons: Season[],
  initial?: string | null,
): string | null {
  if (initial !== undefined && initial !== null) return initial;
  const active = seasons.find((s) => s.is_active);
  return active?.id ?? seasons[0]?.id ?? null;
}

export function useLeagueSelector({
  initialSeasons,
  depth = 'season-split-league',
  initialSeasonId,
  initialSplitId = null,
  initialLeagueId = null,
}: UseLeagueSelectorOptions): UseLeagueSelectorResult {
  const supabase = createClient();

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(() =>
    defaultSeasonId(initialSeasons, initialSeasonId),
  );
  const [splits, setSplits] = useState<Split[]>([]);
  const [selectedSplitId, setSelectedSplitId] = useState<string | null>(
    initialSplitId,
  );
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(
    initialLeagueId,
  );

  const [loadingSplits, setLoadingSplits] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track whether we've seeded splits/leagues yet so the first auto-select honors
  // the consumer's initial selection instead of overwriting it.
  const splitsSeeded = useRef(false);
  const leaguesSeeded = useRef(false);

  const clearError = useCallback(() => setError(null), []);

  // Splits effect — fires when the selected season changes.
  useEffect(() => {
    if (!selectedSeasonId) {
      setSplits([]);
      setSelectedSplitId(null);
      setLeagues([]);
      setSelectedLeagueId(null);
      return;
    }

    let cancelled = false;
    const fetchSplits = async () => {
      setLoadingSplits(true);
      const { data, error: supabaseError } = await supabase
        .from('splits')
        .select('*')
        .eq('season_id', selectedSeasonId)
        .order('split_order', { ascending: true });

      if (cancelled) return;

      if (supabaseError) {
        console.error('[useLeagueSelector] Error:', supabaseError);
        setError(supabaseError.message);
        setSplits([]);
        setLoadingSplits(false);
        return;
      }

      const splitsData = data ?? [];
      setSplits(splitsData);
      // Cascading to league? auto-select active or first split (unless the
      // consumer seeded an initial split that we haven't applied yet).
      if (depth === 'season-split-league') {
        if (!splitsSeeded.current && initialSplitId) {
          // honor consumer seed; do not override
        } else {
          const active = splitsData.find((s) => s.is_active) ?? splitsData[0];
          setSelectedSplitId(active?.id ?? null);
        }
      }
      splitsSeeded.current = true;
      setLeagues([]);
      if (depth === 'season-split-league') {
        // league reset is handled by the leagues effect when split changes;
        // keep selection here so the consumer-seeded league can survive the
        // first cycle if its split also matches.
      }
      setLoadingSplits(false);
    };

    fetchSplits();
    return () => {
      cancelled = true;
    };
  }, [selectedSeasonId, depth, initialSplitId, supabase]);

  // Leagues effect — fires when the selected split changes (only when cascading).
  useEffect(() => {
    if (depth !== 'season-split-league') return;
    if (!selectedSplitId) {
      setLeagues([]);
      setSelectedLeagueId(null);
      return;
    }

    let cancelled = false;
    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      const { data, error: supabaseError } = await supabase
        .from('leagues')
        .select('*')
        .eq('split_id', selectedSplitId)
        .order('tier_priority', { ascending: true });

      if (cancelled) return;

      if (supabaseError) {
        console.error('[useLeagueSelector] Error:', supabaseError);
        setError(supabaseError.message);
        setLeagues([]);
        setLoadingLeagues(false);
        return;
      }

      const leaguesData = data ?? [];
      setLeagues(leaguesData);
      // Per REQ-26 contract: do NOT auto-select a league. Reset only if the
      // currently-selected league no longer belongs to this split.
      if (!leaguesSeeded.current && initialLeagueId) {
        // honor consumer seed once
      } else {
        setSelectedLeagueId((prev) =>
          prev && leaguesData.some((l) => l.id === prev) ? prev : null,
        );
      }
      leaguesSeeded.current = true;
      setLoadingLeagues(false);
    };

    fetchLeagues();
    return () => {
      cancelled = true;
    };
  }, [selectedSplitId, depth, initialLeagueId, supabase]);

  const refresh = useCallback(async () => {
    setError(null);
    if (selectedSeasonId) {
      setLoadingSplits(true);
      const { data, error: splitsError } = await supabase
        .from('splits')
        .select('*')
        .eq('season_id', selectedSeasonId)
        .order('split_order', { ascending: true });
      if (splitsError) {
        console.error('[useLeagueSelector] Error:', splitsError);
        setError(splitsError.message);
      } else {
        setSplits(data ?? []);
      }
      setLoadingSplits(false);
    }
    if (depth === 'season-split-league' && selectedSplitId) {
      setLoadingLeagues(true);
      const { data, error: leaguesError } = await supabase
        .from('leagues')
        .select('*')
        .eq('split_id', selectedSplitId)
        .order('tier_priority', { ascending: true });
      if (leaguesError) {
        console.error('[useLeagueSelector] Error:', leaguesError);
        setError(leaguesError.message);
      } else {
        setLeagues(data ?? []);
      }
      setLoadingLeagues(false);
    }
  }, [selectedSeasonId, selectedSplitId, depth, supabase]);

  const setSeasonId = useCallback((id: string | null) => {
    setSelectedSeasonId(id);
  }, []);
  const setSplitId = useCallback((id: string | null) => {
    setSelectedSplitId(id);
  }, []);
  const setLeagueId = useCallback((id: string | null) => {
    setSelectedLeagueId(id);
  }, []);

  return {
    seasons: initialSeasons,
    splits,
    leagues,
    selectedSeasonId,
    selectedSplitId,
    selectedLeagueId,
    setSeasonId,
    setSplitId,
    setLeagueId,
    loadingSplits,
    loadingLeagues,
    error,
    clearError,
    refresh,
  };
}
