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
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-linear-to-br from-jacksons-purple-500 to-snuff-500">
          {initials}
        </div>
      )}
      <span className="text-white drop-shadow font-bold">{name}</span>
    </div>
  );
}
