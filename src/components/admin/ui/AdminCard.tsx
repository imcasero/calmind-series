import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
}

/** Pixel-bordered admin card with a hard offset shadow. */
export function AdminCard({ children, className }: AdminCardProps) {
  return (
    <div
      className={cn(
        'border-[3px] border-px-border bg-px-elev p-6 shadow-[4px_4px_0_0_var(--color-px-deep)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
