import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="retro-border border-4 border-snuff-500 bg-jacksons-purple-800 p-6 xs:p-8 max-w-md text-center">
        <div className="text-4xl mb-4">
          <span role="img" aria-label="confused pokemon">
            &#129300;
          </span>
        </div>
        <h1 className="pokemon-title text-snuff-400 text-lg xs:text-xl mb-4">
          404 - No encontrado
        </h1>
        <p className="text-white/70 text-sm mb-6">
          El Pokemon que buscas no aparece en esta ruta. Puede que se haya
          escapado o nunca haya existido.
        </p>
        <Link
          href="/"
          className="retro-border border-2 border-retro-gold-500 bg-jacksons-purple-700 hover:bg-jacksons-purple-600 px-4 py-2 text-retro-gold-400 font-bold text-sm uppercase tracking-wide transition-colors inline-block"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
