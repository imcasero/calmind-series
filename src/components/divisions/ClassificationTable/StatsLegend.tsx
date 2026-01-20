export default function StatsLegend() {
  return (
    <div className="bg-jacksons-purple-900 p-2 xs:p-3 sm:p-4 text-[10px] xs:text-xs sm:text-sm text-white/90 border-t-2 xs:border-t-4 border-retro-gold-500">
      {/* Stats abbreviations - hidden on smallest screens */}
      <div className="hidden xs:flex flex-wrap gap-2 xs:gap-3 sm:gap-4 justify-center">
        <span className="drop-shadow font-semibold">
          <strong>PJ:</strong> Partidos
        </span>
        <span className="drop-shadow font-semibold hidden sm:inline">
          <strong>Sets:</strong> Sets ganados
        </span>
        <span className="drop-shadow font-semibold hidden sm:inline">
          <strong>Diff:</strong> Balance
        </span>
      </div>
    </div>
  );
}
