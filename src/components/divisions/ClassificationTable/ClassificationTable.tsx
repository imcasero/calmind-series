import type { RankingEntry } from '@/lib/queries';
import StatsLegend from './StatsLegend';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export interface ClassificationTableProps {
  rankings: RankingEntry[];
}

export default function ClassificationTable({
  rankings,
}: ClassificationTableProps) {
  return (
    <div className="retro-border bg-jacksons-purple-800 border-2 xs:border-4 border-retro-gold-600 rounded-lg overflow-hidden shadow-2xl">
      <TableHeader />

      <div className="overflow-x-auto">
        <table className="w-full text-xs xs:text-sm sm:text-base">
          <thead className="bg-jacksons-purple-700">
            <tr className="text-left border-b-2 xs:border-b-4 border-retro-gold-500">
              <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-retro-gold-300 drop-shadow font-bold">
                #
              </th>
              <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-retro-gold-300 drop-shadow font-bold">
                Entrenador
              </th>
              <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-retro-gold-300 drop-shadow font-bold text-center hidden xs:table-cell">
                JJ
              </th>
              <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-retro-gold-300 drop-shadow font-bold text-center hidden sm:table-cell">
                Sets
              </th>
              <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-retro-gold-300 drop-shadow font-bold text-center hidden sm:table-cell">
                Diff
              </th>
              <th className="px-2 xs:px-3 sm:px-4 py-2 xs:py-3 text-retro-gold-300 drop-shadow font-bold text-center">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking, index) => (
              <TableRow
                key={ranking.trainerId}
                ranking={ranking}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>

      <StatsLegend />
    </div>
  );
}
