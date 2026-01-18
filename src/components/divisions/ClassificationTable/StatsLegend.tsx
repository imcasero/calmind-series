interface StatsLegendProps {
  showPromotionZones: boolean;
  totalPlayers: number;
}

export default function StatsLegend({
  showPromotionZones,
  totalPlayers,
}: StatsLegendProps) {
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

      {/* Zone indicators */}
      {showPromotionZones && (
        <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 justify-center xs:mt-2">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 xs:w-3 xs:h-3 bg-yellow-500/50 rounded" />
            <span className="hidden xs:inline">Campeón</span>
            <span className="xs:hidden">🏆</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 xs:w-3 xs:h-3 bg-green-500/50 rounded" />
            <span className="hidden xs:inline">Ascenso</span>
            <span className="xs:hidden">↑</span>
          </span>
          {totalPlayers > 6 && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 xs:w-3 xs:h-3 bg-red-500/50 rounded" />
              <span className="hidden xs:inline">Descenso</span>
              <span className="xs:hidden">↓</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
