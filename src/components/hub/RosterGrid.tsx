import Link from 'next/link';
import { MonsterSprite } from '@/components/shared/ui/pixel';
import { ROUTES } from '@/lib/constants/routes';
import type { RosterCardVM } from '@/lib/utils/standings';

interface RosterGridProps {
  cards: RosterCardVM[];
}

/**
 * Pure Server roster grid (REQ-23.2) — renders a `RosterCardVM[]` into the
 * trainer card grid markup. Empty state baked in. Used as the `allSlot` / `d1Slot`
 * / `d2Slot` payloads of `<RosterFilterShell>`; the filter pills themselves live
 * in the tiny client shell.
 */
export function RosterGrid({ cards }: RosterGridProps) {
  if (cards.length === 0) {
    return (
      <p className="font-retro text-lg text-px-ink-dim">
        No hay entrenadores todavía.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <TrainerCard key={card.trainerId} card={card} />
      ))}
    </div>
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
