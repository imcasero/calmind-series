import type { ParticipantsByDivision } from '@/lib/types/queries.types';

interface ParticipantsListProps {
  participants: ParticipantsByDivision;
}

function ParticipantCard({
  nickname,
  avatarUrl,
}: {
  nickname: string;
  avatarUrl: string | null;
}) {
  const initials = nickname.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 bg-jacksons-purple-700/50 rounded">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={nickname}
          className="w-8 h-8 xs:w-10 xs:h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs xs:text-sm bg-linear-to-br from-jacksons-purple-500 to-snuff-500 shrink-0">
          {initials}
        </div>
      )}
      <span className="text-white font-semibold text-xs xs:text-sm truncate">
        {nickname}
      </span>
    </div>
  );
}

function DivisionSection({
  title,
  participants,
  color,
}: {
  title: string;
  participants: ParticipantsByDivision['primera'];
  color: 'gold' | 'cyan';
}) {
  const titleColor =
    color === 'gold' ? 'text-retro-gold-400' : 'text-retro-cyan-300';
  const borderColor =
    color === 'gold' ? 'border-retro-gold-500' : 'border-retro-cyan-500';

  if (participants.length === 0) {
    return (
      <section>
        <h3
          className={`${titleColor} font-bold text-sm xs:text-base uppercase tracking-wide mb-3 text-center`}
        >
          {title}
        </h3>
        <p className="text-white/50 text-center text-sm">Sin participantes</p>
      </section>
    );
  }

  return (
    <section>
      <h3
        className={`${titleColor} font-bold text-sm xs:text-base uppercase tracking-wide mb-3 text-center`}
      >
        {title} ({participants.length})
      </h3>
      <div
        className={`retro-border border-2 ${borderColor} bg-jacksons-purple-800/80 p-3 xs:p-4`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-3">
          {participants.map((p) => (
            <ParticipantCard
              key={p.trainerId}
              nickname={p.nickname}
              avatarUrl={p.avatarUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ParticipantsList({
  participants,
}: ParticipantsListProps) {
  return (
    <div className="space-y-6 xs:space-y-8">
      <DivisionSection
        title="Primera División"
        participants={participants.primera}
        color="gold"
      />
      <DivisionSection
        title="Segunda División"
        participants={participants.segunda}
        color="cyan"
      />
    </div>
  );
}
