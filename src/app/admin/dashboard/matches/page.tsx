export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Partidos
        </h1>
        <button
          type="button"
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
          + Registrar Partido
        </button>
      </div>

      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
        <p className="text-jacksons-purple-300 text-sm">
          Registra y gestiona los resultados de los enfrentamientos Bo3.
        </p>
      </div>
    </div>
  );
}
