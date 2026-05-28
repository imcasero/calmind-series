'use client';

import { useEffect } from 'react';
import { AdminButton } from '@/components/admin/ui';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="pixel-root flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md border-[3px] border-px-danger bg-px-elev p-8 text-center shadow-[6px_6px_0_0_var(--color-px-deep)]">
        <h2 className="mb-2 font-pixel text-lg uppercase tracking-wider text-px-danger">
          ⚠ Error
        </h2>
        <p className="mb-6 font-retro text-lg text-px-ink-soft">
          Ha ocurrido un error al cargar esta página.
        </p>
        {error.message && (
          <p className="mb-6 border-2 border-px-border bg-px-deep p-3 font-num text-xs text-px-danger">
            {error.message}
          </p>
        )}
        <AdminButton tone="primary" onClick={reset} className="justify-center">
          Reintentar
        </AdminButton>
      </div>
    </div>
  );
}
