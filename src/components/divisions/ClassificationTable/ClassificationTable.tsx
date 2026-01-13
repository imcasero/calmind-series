import type { Player } from '@/lib/types';
import StatsLegend from './StatsLegend';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export interface ClassificationTableProps {
  players: Player[];
  showPromotionZones?: boolean;
}

export default function ClassificationTable({
  players,
  showPromotionZones = false,
}: ClassificationTableProps) {
  return (
    <div className="retro-border bg-jacksons-purple-800 border-4 border-retro-gold-600 rounded-lg overflow-hidden shadow-2xl">
      <TableHeader />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-jacksons-purple-700">
            <tr className="text-left border-b-4 border-retro-gold-500">
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold">
                Pos.
              </th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold">
                Entrenador
              </th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">
                PJ
              </th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">
                PG
              </th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">
                PP
              </th>
              <th className="px-4 py-3 text-retro-gold-300 drop-shadow font-bold text-center">
                Puntos
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <TableRow
                key={player.id}
                player={player}
                position={index + 1}
                showPromotionZones={showPromotionZones}
                totalPlayers={players.length}
              />
            ))}
          </tbody>
        </table>
      </div>

      <StatsLegend
        showPromotionZones={showPromotionZones}
        totalPlayers={players.length}
      />
    </div>
  );
}
