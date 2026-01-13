interface PlayerBadgeProps {
  isChampion: boolean;
  isPromoted: boolean;
  position: number;
}

export default function PlayerBadge({
  isChampion,
  isPromoted,
  position,
}: PlayerBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {isChampion && <span className="text-yellow-400 text-lg">👑</span>}
      {isPromoted && !isChampion && (
        <span className="text-green-400 text-lg">⬆️</span>
      )}
      <span>{position}</span>
    </div>
  );
}
