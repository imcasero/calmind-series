'use client';

import { startTransition, useOptimistic, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Trainer } from '@/lib/types/database.types';
import type { TrainerInput } from '@/lib/types/schemas';
import {
  createTrainerAction,
  deleteTrainerAction,
  updateTrainerAction,
} from '../_actions';

export type TrainerActionResult = { ok: true } | { ok: false; error: string };

type Optimistic =
  | { type: 'create'; trainer: Trainer }
  | { type: 'update'; trainer: Trainer }
  | { type: 'delete'; id: string };

function reducer(state: Trainer[], action: Optimistic): Trainer[] {
  switch (action.type) {
    case 'create':
      return [...state, action.trainer].sort((a, b) =>
        a.nickname.localeCompare(b.nickname),
      );
    case 'update':
      return state.map((t) =>
        t.id === action.trainer.id ? action.trainer : t,
      );
    case 'delete':
      return state.filter((t) => t.id !== action.id);
  }
}

export interface TrainersManager {
  trainers: Trainer[];
  create: (input: TrainerInput) => Promise<TrainerActionResult>;
  update: (
    id: string,
    input: TrainerInput,
    base: Trainer,
  ) => Promise<TrainerActionResult>;
  remove: (id: string) => Promise<TrainerActionResult>;
}

export function useTrainersManager(initial: Trainer[]): TrainersManager {
  const supabase = createClient();
  const [trainers, setTrainers] = useState<Trainer[]>(initial);
  const [optimistic, applyOptimistic] = useOptimistic(trainers, reducer);

  const refresh = async () => {
    const { data } = await supabase
      .from('trainers')
      .select('*')
      .order('nickname', { ascending: true });
    if (data) setTrainers(data);
  };

  const create = (input: TrainerInput) =>
    new Promise<TrainerActionResult>((resolve) => {
      const temp: Trainer = {
        id: `optimistic-${crypto.randomUUID()}`,
        nickname: input.nickname,
        avatar_url: input.avatar_url,
        bio: input.bio,
        created_at: new Date().toISOString(),
      };
      startTransition(async () => {
        applyOptimistic({ type: 'create', trainer: temp });
        const result = await createTrainerAction(input);
        if (!result.ok) {
          resolve({ ok: false, error: result.error });
          return;
        }
        await refresh();
        resolve({ ok: true });
      });
    });

  const update = (id: string, input: TrainerInput, base: Trainer) =>
    new Promise<TrainerActionResult>((resolve) => {
      const next: Trainer = { ...base, ...input };
      startTransition(async () => {
        applyOptimistic({ type: 'update', trainer: next });
        const result = await updateTrainerAction(id, input);
        if (!result.ok) {
          resolve({ ok: false, error: result.error });
          return;
        }
        await refresh();
        resolve({ ok: true });
      });
    });

  const remove = (id: string) =>
    new Promise<TrainerActionResult>((resolve) => {
      startTransition(async () => {
        applyOptimistic({ type: 'delete', id });
        const result = await deleteTrainerAction(id);
        if (!result.ok) {
          resolve({ ok: false, error: result.error });
          return;
        }
        await refresh();
        resolve({ ok: true });
      });
    });

  return { trainers: optimistic, create, update, remove };
}
