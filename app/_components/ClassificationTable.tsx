import type { Player } from '../_lib/types/database.types';

interface Props {
  players: Player[];
  showPromotionZones?: boolean;
}

export default function ClassificationTable({ players, showPromotionZones = false }: Props) {
  return (
    <div className="retro-border bg-jacksons-purple-800 border-4 border-retro-gold-600 rounded-lg overflow-hidden shadow-2xl">
      <div className="bg-jacksons-purple-900 p-4 border-b-4 border-retro-gold-500">
        <h3 className="pokemon-title text-retro-gold-400 drop-shadow-md font-black tracking-wide text-xl">Clasificación actual</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-jacksons-purple-700">
            <tr className="text-left border-b-4 border-retro-gold-500">
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold">Pos.</th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold">Entrenador</th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">PJ</th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">PG</th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">PP</th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const position = index + 1;
              const isChampion = player.isChampion;
              const isPromoted = player.isPromoted && !isChampion;
              const isRelegation = showPromotionZones && position > players.length - 2;

              let rowClass = "border-b-2 border-jacksons-purple-600 hover:bg-jacksons-purple-700 transition-colors";

              if (isChampion) {
                rowClass += " bg-retro-gold-900/60 border-retro-gold-600";
              } else if (isPromoted) {
                rowClass += " bg-retro-cyan-900/60 border-retro-cyan-600";
              } else if (isRelegation) {
                rowClass += " bg-snuff-900/60 border-snuff-600";
              }

              return (
                <tr key={player.id} className={rowClass}>
                  <td className="px-4 py-3 text-white drop-shadow font-bold">
                    <div className="flex items-center gap-2">
                      {isChampion && <span className="text-yellow-400 text-lg">👑</span>}
                      {isPromoted && !isChampion && <span className="text-green-400 text-lg">⬆️</span>}
                      <span>{position}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-jacksons-purple-500 to-snuff-500">
                        S{player.avatar}
                      </div>
                      <span className="text-white drop-shadow font-bold">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-white drop-shadow font-bold">{player.pj}</td>
                  <td className="px-4 py-3 text-center text-green-400 drop-shadow font-bold">{player.pg}</td>
                  <td className="px-4 py-3 text-center text-red-400 drop-shadow font-bold">{player.pp}</td>
                  <td className="px-4 py-3 text-center text-retro-gold-400 drop-shadow font-black text-lg">{player.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-jacksons-purple-900 p-4 text-sm text-white/90 border-t-4 border-retro-gold-500">
        <div className="flex flex-wrap gap-4 justify-center">
          <span className="drop-shadow font-semibold"><strong>PJ:</strong> Partidos jugados</span>
          <span className="drop-shadow font-semibold"><strong>PG:</strong> Partidos ganados</span>
          <span className="drop-shadow font-semibold"><strong>PP:</strong> Partidos perdidos</span>
        </div>
        {showPromotionZones && (
          <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500/50 rounded"></div>
              Zona de campeón
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/50 rounded"></div>
              Zona de ascenso a Primera División
            </span>
            {players.length > 6 && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/50 rounded"></div>
                Zona de descenso
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
