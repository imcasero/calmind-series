'use client';

import { useEffect } from 'react';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-jacksons-purple-800 border-4 border-red-600 p-8 shadow-[4px_4px_0px_0px_#1a1a1a] max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-400 uppercase tracking-wider mb-2">
          Error
        </h2>
        <p className="text-jacksons-purple-200 text-sm mb-6">
          Ha ocurrido un error al cargar esta página.
        </p>
        {error.message && (
          <p className="text-red-300 text-xs mb-6 font-mono bg-jacksons-purple-950 p-3 border-2 border-jacksons-purple-600">
            {error.message}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="
            px-6 py-3
            bg-retro-gold-500 text-jacksons-purple-950
            border-4 border-jacksons-purple-950
            font-bold uppercase tracking-wide text-sm
            shadow-[4px_4px_0px_0px_#1a1a1a]
            hover:translate-x-0.5 hover:translate-y-0.5
            hover:shadow-[2px_2px_0px_0px_#1a1a1a]
            transition-all duration-100
          "
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
