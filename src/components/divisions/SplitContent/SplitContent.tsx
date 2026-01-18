'use client';

import ClassificationSection from '@/components/divisions/ClassificationSection/ClassificationSection';
import ParticipantsList from '@/components/divisions/ParticipantsList/ParticipantsList';
import Tabs, { TabPanel } from '@/components/shared/ui/Tabs/Tabs';
import type {
  DivisionPreview,
  ParticipantsByDivision,
} from '@/lib/types/queries.types';

interface SplitContentProps {
  rankings: DivisionPreview;
  participants: ParticipantsByDivision;
}

export default function SplitContent({
  rankings,
  participants,
}: SplitContentProps) {
  return (
    <Tabs>
      <TabPanel title="Clasificación">
        <ClassificationSection rankings={rankings} />
      </TabPanel>

      <TabPanel title="Participantes">
        <ParticipantsList participants={participants} />
      </TabPanel>
    </Tabs>
  );
}
