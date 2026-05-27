import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'default' | 'magenta' | 'cyan' | 'gold' | 'success' | 'danger';

const TONE_CLASS: Record<BadgeTone, string> = {
  default: '',
  magenta: 'pixel-badge--magenta',
  cyan: 'pixel-badge--cyan',
  gold: 'pixel-badge--gold',
  success: 'pixel-badge--success',
  danger: 'pixel-badge--danger',
};

interface PixelBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

/** Small pixel-bordered label/badge. Presentational, RSC-safe. */
export function PixelBadge({
  children,
  tone = 'default',
  className,
}: PixelBadgeProps) {
  return (
    <span className={cn('pixel-badge', TONE_CLASS[tone], className)}>
      {children}
    </span>
  );
}
