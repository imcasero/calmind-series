'use client';

import { useRealtimeRankings } from '../_lib/hooks/useRealtimeRankings';
import ClassificationTable from './ClassificationTable';
import type { Player } from '../_lib/types/database.types';

interface Props {
  divisionId: string;
  divisionName: 'Primera' | 'Segunda';
  initialPlayers: Player[];
  showPromotionZones?: boolean;
}

export default function LiveClassificationTable({
  divisionId,
  divisionName,
  initialPlayers,
  showPromotionZones = false,
}: Props) {
  const { players, isLive } = useRealtimeRankings(divisionId, initialPlayers, divisionName);

  return (
    <div>
      {isLive && (
        <div className="flex items-center gap-2 mb-4 justify-center">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-green-400 font-bold text-sm uppercase tracking-wide">
            Actualización en tiempo real
          </span>
        </div>
      )}
      <ClassificationTable players={players} showPromotionZones={showPromotionZones} />
    </div>
  );
}
