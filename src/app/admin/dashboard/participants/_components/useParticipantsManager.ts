'use client';

import { startTransition, useEffect, useOptimistic, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LeagueParticipant, Trainer } from '@/lib/types/database.types';
import {
  assignParticipantAction,
  removeParticipantAction,
  updateParticipantLivesAction,
} from '../_actions';

export type ParticipantWithTrainer = LeagueParticipant & { trainer: Trainer };

export type ParticipantActionResult =
  | { ok: true }
  | { ok: false; error: string };

type Optimistic =
  | { type: 'assign'; participant: ParticipantWithTrainer }
  | { type: 'remove'; id: string }
  | { type: 'lives'; changes: Array<{ id: string; lives: number }> };

const DEFAULT_LIVES = 20;

function reducer(
  state: ParticipantWithTrainer[],
  action: Optimistic,
): ParticipantWithTrainer[] {
  switch (action.type) {
    case 'assign':
      return [...state, action.participant].sort(
        (a, b) => (a.initial_seed ?? 0) - (b.initial_seed ?? 0),
      );
    case 'remove':
      return state.filter((p) => p.id !== action.id);
    case 'lives': {
      const map = new Map(action.changes.map((c) => [c.id, c.lives]));
      return state.map((p) =>
        map.has(p.id) ? { ...p, lives: map.get(p.id) ?? p.lives } : p,
      );
    }
  }
}

interface Params {
  leagueId: string | null;
  splitId: string | null;
}

export interface ParticipantsManager {
  participants: ParticipantWithTrainer[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  pendingLivesCount: number;
  hasLivesChanges: boolean;
  hasPendingLivesChange: (id: string) => boolean;
  getLives: (p: ParticipantWithTrainer) => number;
  setLives: (id: string, current: number, delta: number) => void;
  assign: (trainer: Trainer) => Promise<ParticipantActionResult>;
  remove: (id: string) => Promise<ParticipantActionResult>;
  saveLives: () => Promise<ParticipantActionResult>;
  discardLives: () => void;
}

export function useParticipantsManager({
  leagueId,
  splitId,
}: Params): ParticipantsManager {
  const supabase = createClient();
  const [participants, setParticipants] = useState<ParticipantWithTrainer[]>(
    [],
  );
  const [optimistic, applyOptimistic] = useOptimistic(participants, reducer);
  const [pendingLives, setPendingLives] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId) {
      setParticipants([]);
      setPendingLives({});
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPendingLives({});
      const { data, error: dbError } = await supabase
        .from('league_participants')
        .select('*, trainer:trainers(*)')
        .eq('league_id', leagueId)
        .order('initial_seed', { ascending: true });
      if (cancelled) return;
      if (dbError) {
        setError(dbError.message);
      } else {
        setParticipants((data ?? []) as ParticipantWithTrainer[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [leagueId, supabase]);

  const refresh = async () => {
    if (!leagueId) return;
    const { data } = await supabase
      .from('league_participants')
      .select('*, trainer:trainers(*)')
      .eq('league_id', leagueId)
      .order('initial_seed', { ascending: true });
    if (data) {
      setParticipants(data as ParticipantWithTrainer[]);
      setPendingLives({});
    }
  };

  const requireCtx = (): { leagueId: string; splitId: string } | string => {
    if (!leagueId || !splitId) return 'Selecciona temporada, split y división';
    return { leagueId, splitId };
  };

  const assign = (trainer: Trainer) =>
    new Promise<ParticipantActionResult>((resolve) => {
      const ctx = requireCtx();
      if (typeof ctx === 'string') {
        resolve({ ok: false, error: ctx });
        return;
      }
      const initialSeed = participants.length + 1;
      const temp: ParticipantWithTrainer = {
        id: `optimistic-${crypto.randomUUID()}`,
        league_id: ctx.leagueId,
        trainer_id: trainer.id,
        initial_seed: initialSeed,
        status: 'active',
        lives: DEFAULT_LIVES,
        trainer,
      };
      startTransition(async () => {
        applyOptimistic({ type: 'assign', participant: temp });
        const result = await assignParticipantAction({
          leagueId: ctx.leagueId,
          trainerId: trainer.id,
          splitId: ctx.splitId,
          initialSeed,
          lives: DEFAULT_LIVES,
        });
        if (!result.ok) {
          resolve({ ok: false, error: result.error });
          return;
        }
        await refresh();
        resolve({ ok: true });
      });
    });

  const remove = (id: string) =>
    new Promise<ParticipantActionResult>((resolve) => {
      const ctx = requireCtx();
      if (typeof ctx === 'string') {
        resolve({ ok: false, error: ctx });
        return;
      }
      startTransition(async () => {
        applyOptimistic({ type: 'remove', id });
        const result = await removeParticipantAction(id, ctx);
        if (!result.ok) {
          resolve({ ok: false, error: result.error });
          return;
        }
        setPendingLives((prev) => {
          if (prev[id] === undefined) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
        await refresh();
        resolve({ ok: true });
      });
    });

  const setLives = (id: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    setPendingLives((prev) => ({ ...prev, [id]: next }));
  };

  const getLives = (p: ParticipantWithTrainer) =>
    pendingLives[p.id] ?? p.lives ?? 0;

  const saveLives = () =>
    new Promise<ParticipantActionResult>((resolve) => {
      const ctx = requireCtx();
      if (typeof ctx === 'string') {
        resolve({ ok: false, error: ctx });
        return;
      }
      const changes = Object.entries(pendingLives).map(([id, lives]) => ({
        id,
        lives,
      }));
      if (changes.length === 0) {
        resolve({ ok: true });
        return;
      }
      startTransition(async () => {
        applyOptimistic({ type: 'lives', changes });
        const result = await updateParticipantLivesAction(changes, ctx);
        if (!result.ok) {
          resolve({ ok: false, error: result.error });
          return;
        }
        await refresh();
        resolve({ ok: true });
      });
    });

  const pendingIds = Object.keys(pendingLives);

  return {
    participants: optimistic,
    loading,
    error,
    clearError: () => setError(null),
    pendingLivesCount: pendingIds.length,
    hasLivesChanges: pendingIds.length > 0,
    hasPendingLivesChange: (id) => pendingLives[id] !== undefined,
    getLives,
    setLives,
    assign,
    remove,
    saveLives,
    discardLives: () => setPendingLives({}),
  };
}
