'use client';

import { type ReactNode, useState } from 'react';

type Division = 'primera' | 'segunda';
type Accent = 'magenta' | 'cyan';

interface DivisionTabsShellProps {
  primeraSlot: ReactNode;
  segundaSlot: ReactNode;
}

/**
 * Tiny client shell wrapping the División 1/2 tab switcher used on
 * `/hub/clasificacion`. Owns the `useState<'primera' | 'segunda'>` selection;
 * the table bodies are pre-rendered Server JSX passed in as `primeraSlot` and
 * `segundaSlot` — this client component only flips which slot is visible, so
 * the row markup stays out of the client bundle (REQ-23).
 */
export function DivisionTabsShell({
  primeraSlot,
  segundaSlot,
}: DivisionTabsShellProps) {
  const [active, setActive] = useState<Division>('primera');

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
      {active === 'primera' ? primeraSlot : segundaSlot}
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
