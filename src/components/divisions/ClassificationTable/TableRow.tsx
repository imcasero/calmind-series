'use client';

import { motion } from 'motion/react';
import type { RankingEntry } from '@/lib/queries';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadge from './PlayerBadge';

interface TableRowProps {
  ranking: RankingEntry;
  index: number;
  tierColor: 'gold' | 'cyan';
}

export default function TableRow({ ranking, index, tierColor }: TableRowProps) {
  const position = ranking.position;
  const isChampion = position === 1;
  const isTop4 = position <= 4;
  const isBottom2 = position >= 7;

  // Subtle row highlight for top 4 and bottom 2
  const rowBg = isTop4
    ? 'bg-retro-gold-500/5'
    : isBottom2
      ? 'bg-red-500/5'
      : '';

  const borderBottom = index < 7 ? `border-b border-white/5` : '';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`cursor-default ${rowBg} ${borderBottom}`}
    >
      <td className="px-3 xs:px-4 py-3 xs:py-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black">
        <PlayerBadge isChampion={isChampion} position={position} />
      </td>
      <td className="px-3 xs:px-4 py-3 xs:py-4">
        <PlayerAvatar avatarUrl={ranking.avatarUrl} name={ranking.nickname} />
      </td>
      <td className="px-3 xs:px-4 py-3 xs:py-4 text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-bold hidden xs:table-cell">
        {ranking.matchesPlayed}
      </td>
      <td className="px-3 xs:px-4 py-3 xs:py-4 text-center text-retro-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-bold hidden sm:table-cell">
        {ranking.totalSetsWon}
      </td>
      <td
        className={`px-3 xs:px-4 py-3 xs:py-4 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-bold hidden sm:table-cell ${ranking.setBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}
      >
        {ranking.setBalance > 0 ? `+${ranking.setBalance}` : ranking.setBalance}
      </td>
      <td
        className={`px-3 xs:px-4 py-3 xs:py-4 text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black text-base xs:text-lg ${tierColor === 'gold' ? 'text-retro-gold-400' : 'text-retro-cyan-300'}`}
      >
        {ranking.totalPoints}
      </td>
    </motion.tr>
  );
}
