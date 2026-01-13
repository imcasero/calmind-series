interface PlayerAvatarProps {
  avatar: string;
  name: string;
}

export default function PlayerAvatar({ avatar, name }: PlayerAvatarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-linear-to-br from-jacksons-purple-500 to-snuff-500">
        S{avatar}
      </div>
      <span className="text-white drop-shadow font-bold">{name}</span>
    </div>
  );
}
