interface ParticipantAvatarProps {
  avatar: string;
  name: string;
}

export default function ParticipantAvatar({
  avatar,
  name,
}: ParticipantAvatarProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-3 border-yellow-300 shadow-lg">
        <span className="text-lg font-black text-slate-900">#{avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-yellow-300 drop-shadow-md truncate">
          {name}
        </h3>
      </div>
    </div>
  );
}
