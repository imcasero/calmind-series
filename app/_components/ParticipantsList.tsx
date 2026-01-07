import type { Participant } from '../_lib/types/database.types';

interface Props {
  participants: Participant[];
}

export default function ParticipantsList({ participants }: Props) {
  if (participants.length === 0) {
    return (
      <div className="bg-jacksons-purple-800/80 rounded-lg border-4 border-yellow-400 p-8 text-center shadow-2xl">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-2xl drop-shadow-md font-black tracking-wide text-yellow-300 mb-4">
          Sin Participantes
        </h3>
        <p className="text-white/95 drop-shadow font-semibold">
          Aún no hay participantes registrados en esta división.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="bg-jacksons-purple-800/90 rounded-lg border-4 border-yellow-400 p-4 shadow-xl hover:shadow-yellow-400/20 transition-all duration-200 hover:scale-105"
        >
          {/* Avatar y nombre */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-3 border-yellow-300 shadow-lg">
              <span className="text-lg font-black text-slate-900">
                #{participant.avatar}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-yellow-300 drop-shadow-md truncate">
                {participant.name}
              </h3>
            </div>
          </div>

          {/* Redes sociales */}
          {(participant.twitterUrl ||
            participant.twitchUrl ||
            participant.instagramUrl) && (
            <div className="flex gap-2 justify-center pt-2 border-t-2 border-yellow-400/30">
              {participant.twitterUrl && (
                <a
                  href={participant.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-900 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-yellow-400/40"
                  title="Twitter / X"
                >
                  <span className="text-sm">𝕏</span>
                </a>
              )}
              {participant.twitchUrl && (
                <a
                  href={participant.twitchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-900 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-yellow-400/40"
                  title="Twitch"
                >
                  <span className="text-sm">📺</span>
                </a>
              )}
              {participant.instagramUrl && (
                <a
                  href={participant.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-900 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-yellow-400/40"
                  title="Instagram"
                >
                  <span className="text-sm">📷</span>
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
