import { cn } from '@/lib/utils';
import { formatSeasonSplit } from '@/lib/utils/formatters';
import { type Phase, TOTAL_ROUNDS } from '@/lib/utils/phase';

interface PhaseBannerProps {
  phase: Phase;
  currentRound: number;
  seasonName: string;
  splitName: string;
}

const ROUNDS = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1);

/**
 * Hub phase banner: phase icon tile + season/split badge + phase title, with a
 * per-round progress strip (rounds 15–16 widened for the finals).
 */
export function PhaseBanner({
  phase,
  currentRound,
  seasonName,
  splitName,
}: PhaseBannerProps) {
  return (
    <section className="flex flex-col gap-4 border-[3px] border-px-border bg-px-elev p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className="grid size-14 place-items-center border-[3px] text-2xl"
          style={{ borderColor: phase.color, color: phase.color }}
        >
          <span aria-hidden="true">{phase.icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-pixel text-[9px] uppercase tracking-widest text-px-ink-dim">
            {formatSeasonSplit(seasonName, splitName)}
          </span>
          <h2
            className="font-pixel text-lg uppercase"
            style={{ color: phase.color }}
          >
            {phase.label}
          </h2>
        </div>
      </div>

      <div className="flex items-end gap-1" aria-hidden="true">
        {ROUNDS.map((round) => {
          const isFinals = round >= 15;
          const state =
            round < currentRound
              ? 'past'
              : round === currentRound
                ? 'current'
                : 'future';
          return (
            <div
              key={round}
              className={cn(
                'h-6',
                isFinals ? 'w-4' : 'w-2',
                state === 'current' && 'blink',
              )}
              style={{
                backgroundColor:
                  state === 'current'
                    ? phase.color
                    : state === 'past'
                      ? 'color-mix(in srgb, var(--color-px-border-hi) 60%, transparent)'
                      : 'transparent',
                border:
                  state === 'future'
                    ? '2px solid var(--color-px-border)'
                    : 'none',
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
