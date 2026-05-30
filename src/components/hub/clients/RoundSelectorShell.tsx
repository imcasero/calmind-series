'use client';

import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { getPhase, TOTAL_ROUNDS } from '@/lib/utils/phase';

const ROUNDS = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1);

interface RoundSlot {
  round: number;
  node: ReactNode;
}

interface RoundSelectorShellProps {
  currentRound: number;
  initialRound: number;
  roundSlots: RoundSlot[];
}

/**
 * Tiny client shell wrapping the calendar's round timeline used on
 * `/hub/calendario`. Owns the `useState<number>` selection; the 16 round detail
 * blocks are pre-rendered Server JSX passed in as `roundSlots`. Each slot is
 * always mounted (kept alive via CSS `hidden`) so Suspense boundaries don't
 * remount and so the bulk markup never reaches the client bundle (REQ-23.3).
 */
export function RoundSelectorShell({
  currentRound,
  initialRound,
  roundSlots,
}: RoundSelectorShellProps) {
  const [selected, setSelected] = useState(initialRound);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ROUNDS.map((round) => {
          const rPhase = getPhase(round);
          const state =
            round < currentRound
              ? 'past'
              : round === currentRound
                ? 'current'
                : 'future';
          const active = round === selected;
          return (
            <button
              key={round}
              type="button"
              onClick={() => setSelected(round)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 border-2 px-3 py-2 font-pixel text-[9px] uppercase transition-colors',
                active ? 'bg-px-base' : 'bg-px-deep',
              )}
              style={{
                borderColor: active ? 'var(--color-px-magenta)' : rPhase.color,
                color: rPhase.color,
                opacity: state === 'future' ? 0.7 : 1,
              }}
            >
              {state === 'current' && (
                <span className="blink text-px-success">●</span>
              )}
              J{String(round).padStart(2, '0')}
            </button>
          );
        })}
      </div>

      {roundSlots.map((slot) => (
        <div key={slot.round} hidden={slot.round !== selected}>
          {slot.node}
        </div>
      ))}
    </div>
  );
}
