interface StatsLegendProps {
  showPromotionZones: boolean;
  totalPlayers: number;
}

export default function StatsLegend({
  showPromotionZones,
  totalPlayers,
}: StatsLegendProps) {
  return (
    <div className="bg-jacksons-purple-900 p-4 text-sm text-white/90 border-t-4 border-retro-gold-500">
      {/* Stats abbreviations */}
      <div className="flex flex-wrap gap-4 justify-center">
        <span className="drop-shadow font-semibold">
          <strong>PJ:</strong> Partidos jugados
        </span>
        <span className="drop-shadow font-semibold">
          <strong>Sets:</strong> Sets ganados
        </span>
        <span className="drop-shadow font-semibold">
          <strong>Diff:</strong> Balance de sets
        </span>
      </div>

      {/* Zone indicators */}
      {showPromotionZones && (
        <div className="flex flex-wrap gap-4 justify-center mt-2 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500/50 rounded" />
            Zona de campeón
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500/50 rounded" />
            Zona de ascenso a Primera División
          </span>
          {totalPlayers > 6 && (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/50 rounded" />
              Zona de descenso
            </span>
          )}
        </div>
      )}
    </div>
  );
}
