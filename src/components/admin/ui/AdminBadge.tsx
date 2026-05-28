import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'danger' | 'gold' | 'neutral';

const TONE_CLASS: Record<Tone, string> = {
  success: 'border-px-success text-px-success',
  danger: 'border-px-danger text-px-danger',
  gold: 'border-px-gold text-px-gold',
  neutral: 'border-px-border text-px-ink-dim',
};

interface AdminBadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function AdminBadge({
  children,
  tone = 'neutral',
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border-2 px-2 py-0.5 font-pixel text-[8px] uppercase tracking-wider',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
