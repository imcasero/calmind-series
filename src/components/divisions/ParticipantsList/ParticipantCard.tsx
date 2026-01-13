import type { Participant } from '@/lib/types';
import ParticipantAvatar from './ParticipantAvatar';
import SocialMediaLinks from './SocialMediaLinks';

interface ParticipantCardProps {
  participant: Participant;
}

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  const hasSocialMedia =
    participant.twitterUrl || participant.twitchUrl || participant.instagramUrl;

  return (
    <div className="bg-jacksons-purple-800/90 rounded-lg border-4 border-yellow-400 p-4 shadow-xl hover:shadow-yellow-400/20 transition-all duration-200 hover:scale-105">
      <ParticipantAvatar avatar={participant.avatar} name={participant.name} />

      {hasSocialMedia && (
        <SocialMediaLinks
          twitterUrl={participant.twitterUrl}
          twitchUrl={participant.twitchUrl}
          instagramUrl={participant.instagramUrl}
        />
      )}
    </div>
  );
}
