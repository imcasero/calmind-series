'use client';

import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

type Filter = 'all' | 1 | 2;

interface RosterFilterShellProps {
  allCount: number;
  d1Count: number;
  d2Count: number;
  allSlot: ReactNode;
  d1Slot: ReactNode;
  d2Slot: ReactNode;
}

/**
 * Tiny client shell wrapping the TODOS / D1 / D2 filter pills used on
 * `/hub/entrenadores`. Owns the `useState<'all' | 1 | 2>` selection; the three
 * card grids are pre-rendered Server JSX passed in as `allSlot` / `d1Slot` /
 * `d2Slot`. The grid markup stays out of the client bundle (REQ-23).
 */
export function RosterFilterShell({
  allCount,
  d1Count,
  d2Count,
  allSlot,
  d1Slot,
  d2Slot,
}: RosterFilterShellProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const activeSlot =
    filter === 'all' ? allSlot : filter === 1 ? d1Slot : d2Slot;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label={`Todos · ${allCount}`}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterPill
          label={`División 1 · ${d1Count}`}
          active={filter === 1}
          onClick={() => setFilter(1)}
        />
        <FilterPill
          label={`División 2 · ${d2Count}`}
          active={filter === 2}
          onClick={() => setFilter(2)}
        />
      </div>
      {activeSlot}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-2 px-3 py-2 font-pixel text-[9px] uppercase tracking-wider transition-colors',
        active
          ? 'border-px-magenta bg-px-magenta text-px-deep'
          : 'border-px-border text-px-ink-soft hover:border-px-border-hi',
      )}
    >
      {label}
    </button>
  );
}
