import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-jacksons-purple-900/50 border-t-4 border-jacksons-purple-600">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Info Section */}
          <div className="text-center md:text-left">
            <h3 className="pokemon-title text-sm text-yellow-500 mb-2">
              Pokemon Calmind Series
            </h3>
            <p className="text-xs text-gray-300">
              Competición Amateur de Pokemon
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Link
              href="/primera-division"
              className="text-sm text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Primera División
            </Link>
            <Link
              href="/segunda-division"
              className="text-sm text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Segunda División
            </Link>
            <a
              href="/normativa_pokemon_calmind_series.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Normativa
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Pokemon Calmind Series
            </p>
            <p className="text-xs text-gray-500">
              Desarrollado por Diego Casero Martín
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
