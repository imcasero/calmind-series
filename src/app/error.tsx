'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="retro-border border-4 border-snuff-500 bg-jacksons-purple-800 p-6 xs:p-8 max-w-md text-center">
        <div className="text-4xl mb-4">
          <span role="img" aria-label="error">
            &#128165;
          </span>
        </div>
        <h1 className="pokemon-title text-snuff-400 text-lg xs:text-xl mb-4">
          Algo salió mal
        </h1>
        <p className="text-white/70 text-sm mb-6">
          Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
        </p>
        <div className="flex flex-col xs:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="retro-border border-2 border-retro-cyan-500 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 px-4 py-2 text-retro-cyan-300 font-bold text-sm uppercase tracking-wide transition-colors cursor-pointer"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="retro-border border-2 border-retro-gold-500 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 px-4 py-2 text-retro-gold-400 font-bold text-sm uppercase tracking-wide transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
