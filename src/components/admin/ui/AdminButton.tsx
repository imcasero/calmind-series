import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'cyan' | 'success' | 'danger' | 'ghost' | 'default';

const TONE_CLASS: Record<Tone, string> = {
  primary: 'pixel-btn--primary',
  cyan: 'pixel-btn--cyan',
  success: 'pixel-btn--success',
  danger: 'pixel-btn--danger',
  ghost: 'pixel-btn--ghost',
  default: '',
};

interface AdminButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  tone?: Tone;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

/** Pixel admin button. Presentational — handlers come from the client Manager. */
export function AdminButton({
  children,
  onClick,
  type = 'button',
  tone = 'default',
  size = 'md',
  disabled = false,
  className,
}: AdminButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'pixel-btn',
        TONE_CLASS[tone],
        size === 'sm' && 'pixel-btn--sm',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
