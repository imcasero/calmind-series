'use client';

import { motion } from 'motion/react';
import type { RankingEntry } from '@/lib/queries';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadge from './PlayerBadge';

interface TableRowProps {
  ranking: RankingEntry;
  index: number;
}

export default function TableRow({ ranking, index }: TableRowProps) {
  const position = ranking.position;
  const isChampion = position === 1;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ backgroundColor: 'rgba(107, 91, 208, 0.3)' }}
      className="transition-colors cursor-default"
    >
      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-white drop-shadow font-bold">
        <PlayerBadge isChampion={isChampion} position={position} />
      </td>
      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3">
        <PlayerAvatar avatarUrl={ranking.avatarUrl} name={ranking.nickname} />
      </td>
      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-center text-white drop-shadow font-bold hidden xs:table-cell">
        {ranking.matchesPlayed}
      </td>
      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-center text-retro-cyan-400 drop-shadow font-bold hidden sm:table-cell">
        {ranking.totalSetsWon}
      </td>
      <td
        className={`px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-center drop-shadow font-bold hidden sm:table-cell ${ranking.setBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}
      >
        {ranking.setBalance > 0 ? `+${ranking.setBalance}` : ranking.setBalance}
      </td>
      <td className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-center text-retro-gold-400 drop-shadow font-black text-sm xs:text-base sm:text-lg">
        {ranking.totalPoints}
      </td>
    </motion.tr>
  );
}
