'use client';

import { useEffect } from 'react';
import { AdminButton } from '@/components/admin/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="border-[3px] border-px-danger bg-px-deep p-6">
      <h2 className="mb-2 font-pixel text-sm uppercase tracking-wider text-px-danger">
        ⚠ Error al cargar
      </h2>
      <p className="mb-4 font-retro text-lg text-px-ink-soft">
        No se pudo cargar el contenido de esta sección.
      </p>
      {error.message && (
        <p className="mb-4 border-2 border-px-border bg-px-base p-3 font-num text-xs text-px-danger">
          {error.message}
        </p>
      )}
      <AdminButton tone="primary" size="sm" onClick={reset}>
        Reintentar
      </AdminButton>
    </div>
  );
}
