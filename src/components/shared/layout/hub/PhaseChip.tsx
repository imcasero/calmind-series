'use client';

import { usePhase } from '@/components/providers/PhaseProvider';
import { TOTAL_ROUNDS } from '@/lib/utils/phase';

/**
 * Top-bar phase indicator: phase icon + label + a J{round}/16 progress bar.
 * Reads the shared phase context so it repaints when the round ticks (FR10).
 */
export function PhaseChip() {
  const { phase, currentRound, progressPct } = usePhase();
  const roundLabel =
    currentRound > 0 ? `J${currentRound}/${TOTAL_ROUNDS}` : 'PRE';

  return (
    <div
      className="flex items-center gap-2 border-2 px-2.5 py-1"
      style={{ borderColor: phase.color }}
    >
      <span
        aria-hidden="true"
        className="text-sm"
        style={{ color: phase.color }}
      >
        {phase.icon}
      </span>
      <div className="flex flex-col gap-1">
        <span
          className="font-pixel text-[8px] uppercase tracking-wider"
          style={{ color: phase.color }}
        >
          {phase.label}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-16 bg-px-deep">
            <div
              className="h-full"
              style={{ width: `${progressPct}%`, background: phase.color }}
            />
          </div>
          <span className="font-num text-[9px] text-px-ink-dim">
            {roundLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
