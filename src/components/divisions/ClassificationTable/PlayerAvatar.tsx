interface PlayerAvatarProps {
  avatarUrl: string | null;
  name: string;
}

export default function PlayerAvatar({ avatarUrl, name }: PlayerAvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] xs:text-xs sm:text-sm bg-linear-to-br from-jacksons-purple-500 to-snuff-500 shrink-0">
          {initials}
        </div>
      )}
      <span className="text-white drop-shadow font-bold truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
        {name}
      </span>
    </div>
  );
}
