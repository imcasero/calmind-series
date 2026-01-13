import type { Participant } from '@/lib/types';
import EmptyState from './EmptyState';
import ParticipantCard from './ParticipantCard';

export interface ParticipantsListProps {
  participants: Participant[];
}

export default function ParticipantsList({
  participants,
}: ParticipantsListProps) {
  if (participants.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {participants.map((participant) => (
        <ParticipantCard key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
