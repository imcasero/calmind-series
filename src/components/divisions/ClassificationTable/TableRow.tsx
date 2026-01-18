import type { RankingEntry } from '@/lib/queries';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadge from './PlayerBadge';
import { getRowClassName } from './utils';

interface TableRowProps {
  ranking: RankingEntry;
  showPromotionZones: boolean;
  totalPlayers: number;
}

export default function TableRow({
  ranking,
  showPromotionZones,
  totalPlayers,
}: TableRowProps) {
  const position = ranking.position;
  const isChampion = position === 1;
  const isPromoted = position <= 4 && !isChampion;
  const isRelegation = showPromotionZones && position > totalPlayers - 2;

  const rowClass = getRowClassName({ isChampion, isPromoted, isRelegation });

  return (
    <tr className={rowClass}>
      <td className="px-4 py-3 text-white drop-shadow font-bold">
        <PlayerBadge
          isChampion={isChampion}
          isPromoted={isPromoted}
          position={position}
        />
      </td>
      <td className="px-4 py-3">
        <PlayerAvatar avatarUrl={ranking.avatarUrl} name={ranking.nickname} />
      </td>
      <td className="px-4 py-3 text-center text-white drop-shadow font-bold">
        {ranking.matchesPlayed}
      </td>
      <td className="px-4 py-3 text-center text-retro-cyan-400 drop-shadow font-bold">
        {ranking.totalSetsWon}
      </td>
      <td className={`px-4 py-3 text-center drop-shadow font-bold ${ranking.setBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {ranking.setBalance > 0 ? `+${ranking.setBalance}` : ranking.setBalance}
      </td>
      <td className="px-4 py-3 text-center text-retro-gold-400 drop-shadow font-black text-lg">
        {ranking.totalPoints}
      </td>
    </tr>
  );
}
