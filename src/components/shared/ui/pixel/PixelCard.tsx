import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PixelCardProps {
  children: ReactNode;
  /** CSS-only hover lift + magenta border (keeps the component RSC). */
  interactive?: boolean;
  /** Chunky stepped corners via clip-path. */
  frame?: boolean;
  className?: string;
}

/**
 * Pixel-bordered card with a hard offset shadow. Hover is pure CSS
 * (`.pixel-card--interactive`), so this stays a Server Component — unlike the
 * prototype's `useState` version.
 */
export function PixelCard({
  children,
  interactive = false,
  frame = false,
  className,
}: PixelCardProps) {
  return (
    <div
      className={cn(
        'pixel-card',
        interactive && 'pixel-card--interactive',
        frame && 'pixel-frame',
        className,
      )}
    >
      {children}
    </div>
  );
}
