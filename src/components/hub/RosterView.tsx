'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MonsterSprite } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { RosterCardVM } from '@/lib/utils/standings';

type Filter = 'all' | 1 | 2;

interface RosterViewProps {
  cards: RosterCardVM[];
}

/** Roster grid with TODOS / D1 / D2 filter pills (FR6). */
export function RosterView({ cards }: RosterViewProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const d1Count = cards.filter((c) => c.division === 1).length;
  const d2Count = cards.filter((c) => c.division === 2).length;
  const shown =
    filter === 'all' ? cards : cards.filter((c) => c.division === filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label={`Todos · ${cards.length}`}
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

      {shown.length === 0 ? (
        <p className="font-retro text-lg text-px-ink-dim">
          No hay entrenadores todavía.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((card) => (
            <TrainerCard key={card.trainerId} card={card} />
          ))}
        </div>
      )}
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

function TrainerCard({ card }: { card: RosterCardVM }) {
  const divisionColor =
    card.division === 1 ? 'var(--color-px-magenta)' : 'var(--color-px-cyan)';

  return (
    <Link
      href={ROUTES.hubTrainer(card.trainerId)}
      className="flex flex-col gap-3 border-[3px] bg-px-elev p-4 transition-transform hover:-translate-y-0.5"
      style={{ borderColor: card.color }}
    >
      <div className="flex items-center justify-between">
        <span
          className="border-2 px-2 py-0.5 font-pixel text-[8px] uppercase"
          style={{ borderColor: divisionColor, color: divisionColor }}
        >
          {card.division === 1 ? 'D1' : 'D2'}
        </span>
      </div>

      <div
        className="grid place-items-center py-2"
        style={{
          backgroundColor: `color-mix(in srgb, ${card.color} 14%, transparent)`,
        }}
      >
        <MonsterSprite size={72} variant={card.variant} color={card.color} />
      </div>

      <p className="font-pixel text-sm text-px-ink">{card.nickname}</p>

      <div className="grid grid-cols-4 gap-1 border-t-[3px] border-px-border pt-3 text-center">
        <Stat label="PG" value={card.pg} />
        <Stat label="PP" value={card.pp} />
        <Stat label="PT" value={card.pt} />
        <Stat label="J" value={card.j} />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-num text-base font-bold text-px-ink">{value}</span>
      <span className="font-pixel text-[7px] uppercase tracking-wider text-px-ink-dim">
        {label}
      </span>
    </div>
  );
}
