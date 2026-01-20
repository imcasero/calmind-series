interface PlayerBadgeProps {
  isChampion: boolean;
  position: number;
}

export default function PlayerBadge({
  isChampion,
  position,
}: PlayerBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {isChampion && <span className="text-yellow-400 text-lg">👑</span>}
      <span>{position}</span>
    </div>
  );
}
