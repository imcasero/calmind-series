'use client';

import ClassificationSection from '@/components/divisions/ClassificationSection/ClassificationSection';
import MatchesSection from '@/components/divisions/MatchesSection/MatchesSection';
import ParticipantsList from '@/components/divisions/ParticipantsList/ParticipantsList';
import Tabs, { TabPanel } from '@/components/shared/ui/Tabs/Tabs';
import type {
  DivisionPreview,
  MatchesByRound,
  ParticipantsByDivision,
} from '@/lib/types/queries.types';

interface SplitContentProps {
  rankings: DivisionPreview;
  participants: ParticipantsByDivision;
  matches: MatchesByRound;
}

export default function SplitContent({
  rankings,
  participants,
  matches,
}: SplitContentProps) {
  return (
    <Tabs>
      <TabPanel title="Clasificación">
        <ClassificationSection rankings={rankings} />
      </TabPanel>

      <TabPanel title="Participantes">
        <ParticipantsList participants={participants} />
      </TabPanel>

      <TabPanel title="Enfrentamientos">
        <MatchesSection matches={matches} />
      </TabPanel>
    </Tabs>
  );
}
