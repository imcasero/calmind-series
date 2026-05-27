'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TrainerAvatar } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { StandingRowVM, StreakResult } from '@/lib/utils/standings';

type Division = 'primera' | 'segunda';
type Accent = 'magenta' | 'cyan';

const ROW_GRID =
  'grid grid-cols-[36px_minmax(140px,1fr)_44px_44px_52px_128px_96px] items-center gap-2';

interface ClasificacionViewProps {
  primera: StandingRowVM[];
  segunda: StandingRowVM[];
}

/** Standings page body: division tabs + the full table for the active division. */
export function ClasificacionView({
  primera,
  segunda,
}: ClasificacionViewProps) {
  const [active, setActive] = useState<Division>('primera');
  const rows = active === 'primera' ? primera : segunda;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <TabButton
          label="División 1 · Élite"
          accent="magenta"
          active={active === 'primera'}
          onClick={() => setActive('primera')}
        />
        <TabButton
          label="División 2 · Aspirantes"
          accent="cyan"
          active={active === 'segunda'}
          onClick={() => setActive('segunda')}
        />
      </div>
      <StandingsTable rows={rows} />
    </div>
  );
}

function TabButton({
  label,
  accent,
  active,
  onClick,
}: {
  label: string;
  accent: Accent;
  active: boolean;
  onClick: () => void;
}) {
  const color =
    accent === 'magenta' ? 'var(--color-px-magenta)' : 'var(--color-px-cyan)';
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-[3px] px-4 py-3 font-pixel text-[10px] uppercase tracking-wider transition-colors sm:text-xs"
      style={
        active
          ? {
              borderColor: color,
              background: color,
              color: 'var(--color-px-deep)',
            }
          : { borderColor: color, color }
      }
    >
      {label}
    </button>
  );
}

function StandingsTable({ rows }: { rows: StandingRowVM[] }) {
  if (rows.length === 0) {
    return (
      <p className="font-retro text-lg text-px-ink-dim">
        Sin clasificación todavía.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div
          className={cn(
            ROW_GRID,
            'border-b-[3px] border-px-border px-3 py-2 font-pixel text-[8px] uppercase tracking-wider text-px-ink-dim',
          )}
        >
          <span>#</span>
          <span>Entrenador</span>
          <span className="text-center">PG</span>
          <span className="text-center">PP</span>
          <span className="text-center">PT</span>
          <span>Racha</span>
          <span className="text-center">Zona</span>
        </div>
        {rows.map((row) => (
          <TableRow key={row.trainerId} row={row} />
        ))}
      </div>
    </div>
  );
}

function TableRow({ row }: { row: StandingRowVM }) {
  const pips = row.streak.map((result, i) => ({
    id: `${row.trainerId}-s${i}`,
    result,
  }));

  return (
    <Link
      href={ROUTES.hubTrainer(row.trainerId)}
      className={cn(
        ROW_GRID,
        'border-b border-px-border/40 px-3 py-2.5 transition-colors hover:bg-px-base',
      )}
    >
      <span className="font-num text-sm text-px-gold">
        {row.position === 1 ? '★' : row.position}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <TrainerAvatar color={row.color} size={36} />
        <span className="truncate font-retro text-lg text-px-ink">
          {row.nickname}
        </span>
      </span>
      <span className="text-center font-num text-sm text-px-success">
        {row.pg}
      </span>
      <span className="text-center font-num text-sm text-px-danger">
        {row.pp}
      </span>
      <span className="text-center font-num text-base font-bold text-px-ink">
        {row.totalPoints}
      </span>
      <span className="flex items-center gap-1">
        {pips.map((pip) => (
          <Pip key={pip.id} result={pip.result} />
        ))}
      </span>
      <span className="flex justify-center">
        <span
          className="px-2 py-1 font-pixel text-[8px] uppercase"
          style={{
            color: row.zone.color,
            border: `2px solid ${row.zone.color}`,
          }}
        >
          {row.zone.label}
        </span>
      </span>
    </Link>
  );
}

function Pip({ result }: { result: StreakResult }) {
  return (
    <span
      className={cn(
        'grid size-4 place-items-center font-pixel text-[8px] text-px-deep',
        result === 'W' ? 'bg-px-success' : 'bg-px-danger',
      )}
    >
      {result}
    </span>
  );
}
