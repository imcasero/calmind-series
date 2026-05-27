'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePhase } from '@/components/providers/PhaseProvider';
import { HUB_NAV } from '@/lib/constants/hubNav';
import { cn } from '@/lib/utils';

/**
 * Top-bar nav. Active item gets gold top/bottom borders. Gated items (Bracket,
 * Olimpo) render locked + tooltip and are not clickable until the finals phase.
 */
export function HubNav() {
  const pathname = usePathname();
  const { isFinalsUnlocked } = usePhase();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {HUB_NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const locked = item.gated === true && !isFinalsUnlocked;

        if (locked) {
          return (
            <span
              key={item.href}
              title="Se desbloquea en J15"
              aria-disabled="true"
              className="cursor-not-allowed select-none px-3 py-2.5 font-pixel text-[10px] uppercase tracking-wider text-px-ink-faint"
            >
              🔒 {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'border-y-[3px] px-3 py-2.5 font-pixel text-[10px] uppercase tracking-wider transition-colors',
              active
                ? 'border-px-gold text-px-gold'
                : 'border-transparent text-px-ink-soft hover:text-px-magenta',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
