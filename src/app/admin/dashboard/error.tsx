'use client';

import { useEffect } from 'react';

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
    <div className="space-y-6">
      <div className="bg-red-600/20 border-4 border-red-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <div className="flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-red-400 uppercase tracking-wider mb-2">
              Error al cargar
            </h2>
            <p className="text-jacksons-purple-200 text-sm mb-4">
              No se pudo cargar el contenido de esta sección.
            </p>
            {error.message && (
              <p className="text-red-300 text-xs mb-4 font-mono bg-jacksons-purple-950 p-3 border-2 border-jacksons-purple-600">
                {error.message}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              className="
                px-4 py-2
                bg-retro-gold-500 text-jacksons-purple-950
                border-2 border-jacksons-purple-950
                font-bold uppercase tracking-wide text-xs
                shadow-[2px_2px_0px_0px_#1a1a1a]
                hover:translate-x-0.5 hover:translate-y-0.5
                hover:shadow-[1px_1px_0px_0px_#1a1a1a]
                transition-all duration-100
              "
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
