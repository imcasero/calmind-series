import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'primary' | 'ghost';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: '',
  primary: 'pixel-btn--primary',
  ghost: 'pixel-btn--ghost',
};

interface PixelButtonProps {
  children: ReactNode;
  /** When set, renders a link (internal `next/link`, or `<a>` if external). */
  href?: string;
  newTab?: boolean;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Pixel CTA button. Presentational and RSC-safe: renders a link when `href` is
 * given, otherwise a plain `<button type="button">`. Interactive (onClick)
 * variants belong in client wrappers added by later FRs.
 */
export function PixelButton({
  children,
  href,
  newTab = false,
  variant = 'default',
  size = 'md',
  className,
}: PixelButtonProps) {
  const classes = cn(
    'pixel-btn',
    VARIANT_CLASS[variant],
    size === 'sm' && 'pixel-btn--sm',
    className,
  );

  if (href) {
    const isExternal = newTab || /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          className={classes}
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    }
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type="button">
      {children}
    </button>
  );
}
