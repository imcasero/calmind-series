import type { Player } from '@/lib/types';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadge from './PlayerBadge';
import { getRowClassName } from './utils';

interface TableRowProps {
  player: Player;
  position: number;
  showPromotionZones: boolean;
  totalPlayers: number;
}

export default function TableRow({
  player,
  position,
  showPromotionZones,
  totalPlayers,
}: TableRowProps) {
  const isChampion = player.isChampion || false;
  const isPromoted = (player.isPromoted && !isChampion) || false;
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
        <PlayerAvatar avatar={player.avatar} name={player.name} />
      </td>
      <td className="px-4 py-3 text-center text-white drop-shadow font-bold">
        {player.pj}
      </td>
      <td className="px-4 py-3 text-center text-green-400 drop-shadow font-bold">
        {player.pg}
      </td>
      <td className="px-4 py-3 text-center text-red-400 drop-shadow font-bold">
        {player.pp}
      </td>
      <td className="px-4 py-3 text-center text-retro-gold-400 drop-shadow font-black text-lg">
        {player.points}
      </td>
    </tr>
  );
}
