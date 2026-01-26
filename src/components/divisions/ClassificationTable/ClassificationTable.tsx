import type { RankingEntry } from '@/lib/queries';
import StatsLegend from './StatsLegend';
import TableRow from './TableRow';

export interface ClassificationTableProps {
  rankings: RankingEntry[];
  tierColor: 'gold' | 'cyan';
}

export default function ClassificationTable({
  rankings,
  tierColor,
}: ClassificationTableProps) {
  const borderColor = tierColor === 'gold' ? 'border-retro-gold-500' : 'border-retro-cyan-500';
  const headerBg = tierColor === 'gold' ? 'bg-retro-gold-500/10' : 'bg-retro-cyan-500/10';
  const headerText = tierColor === 'gold' ? 'text-retro-gold-400' : 'text-retro-cyan-300';

  return (
    <div className={`retro-border border-[3px] ${borderColor} overflow-hidden`}>
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs xs:text-sm sm:text-base">
          <thead className={headerBg}>
            <tr className={`text-left border-b-[3px] ${borderColor}`}>
              <th className={`px-3 xs:px-4 py-3 xs:py-4 ${headerText} drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] font-black uppercase tracking-wider text-[10px] xs:text-xs`}>
                #
              </th>
              <th className={`px-3 xs:px-4 py-3 xs:py-4 ${headerText} drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] font-black uppercase tracking-wider text-[10px] xs:text-xs`}>
                Entrenador
              </th>
              <th className={`px-3 xs:px-4 py-3 xs:py-4 ${headerText} drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] font-black uppercase tracking-wider text-center hidden xs:table-cell text-[10px] xs:text-xs`}>
                J
              </th>
              <th className={`px-3 xs:px-4 py-3 xs:py-4 ${headerText} drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] font-black uppercase tracking-wider text-center hidden sm:table-cell text-[10px] xs:text-xs`}>
                Sets
              </th>
              <th className={`px-3 xs:px-4 py-3 xs:py-4 ${headerText} drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] font-black uppercase tracking-wider text-center hidden sm:table-cell text-[10px] xs:text-xs`}>
                Diff
              </th>
              <th className={`px-3 xs:px-4 py-3 xs:py-4 ${headerText} drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] font-black uppercase tracking-wider text-center text-[10px] xs:text-xs`}>
                Pts
              </th>
            </tr>
          </thead>
          <tbody className="bg-jacksons-purple-950/40">
            {rankings.map((ranking, index) => (
              <TableRow
                key={ranking.trainerId}
                ranking={ranking}
                index={index}
                tierColor={tierColor}
              />
            ))}
          </tbody>
        </table>
      </div>

      <StatsLegend tierColor={tierColor} />
    </div>
  );
}
