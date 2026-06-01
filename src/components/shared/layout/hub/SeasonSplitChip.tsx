'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/lib/constants/routes';
import type { SeasonWithSplits } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { formatSeasonSplit } from '@/lib/utils/formatters';

interface SeasonSplitChipProps {
  activeSeasonName: string | null;
  activeSplitName: string | null;
  seasons: SeasonWithSplits[];
}

/**
 * Season/Split selector. The chip always reflects the live split. The dropdown
 * routes the active split to /hub and any past split to /archivo/:season/:split.
 */
export function SeasonSplitChip({
  activeSeasonName,
  activeSplitName,
  seasons,
}: SeasonSplitChipProps) {
  const [open, setOpen] = useState(false);

  const label =
    activeSeasonName && activeSplitName
      ? formatSeasonSplit(activeSeasonName, activeSplitName)
      : 'SIN TEMPORADA';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 border-2 border-px-border-hi bg-px-deep px-2.5 py-1.5 font-pixel text-[9px] uppercase tracking-wider text-px-ink"
      >
        <span>{label}</span>
        {activeSeasonName && <span className="text-px-success">LIVE</span>}
        <span aria-hidden="true" className="text-px-magenta">
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <button
            type="button"
            aria-label="Cerrar selector"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 z-50 mt-2 min-w-[320px] border-[3px] border-px-border bg-px-base p-3 shadow-[6px_6px_0_0_var(--color-px-deep)]">
            {seasons.length === 0 && (
              <p className="font-retro text-px-ink-dim text-base">
                No hay temporadas todavía.
              </p>
            )}
            {seasons.map((season) => (
              <div key={season.id} className="mb-3 last:mb-0">
                <p className="mb-1.5 font-pixel text-[9px] uppercase tracking-widest text-px-ink-dim">
                  {season.name} · {season.year}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {season.splits.map((split) => {
                    const isActive =
                      season.name === activeSeasonName &&
                      split.name === activeSplitName;
                    const href = isActive
                      ? ROUTES.hub
                      : ROUTES.archiveDetail(season.name, split.name);
                    return (
                      <Link
                        key={split.id}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'border-2 px-2.5 py-1.5 font-pixel text-[9px] uppercase',
                          isActive
                            ? 'border-px-magenta bg-px-magenta text-px-deep'
                            : 'border-px-border text-px-ink-soft hover:border-px-border-hi',
                        )}
                      >
                        {isActive ? '● ' : '✓ '}
                        {split.name.toUpperCase()}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
