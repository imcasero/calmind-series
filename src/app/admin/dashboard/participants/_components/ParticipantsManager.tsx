'use client';

import { useState } from 'react';
import type { Season, Trainer } from '@/lib/types/database.types';
import AssignmentsTab from './AssignmentsTab';
import { TabButton } from './shared';
import TrainersTab from './TrainersTab';
import { useTrainersManager } from './useTrainersManager';

type Tab = 'trainers' | 'assignments';

interface ParticipantsManagerProps {
  initialSeasons: Season[];
  initialTrainers: Trainer[];
}

export default function ParticipantsManager({
  initialSeasons,
  initialTrainers,
}: ParticipantsManagerProps) {
  const trainersManager = useTrainersManager(initialTrainers);
  const [activeTab, setActiveTab] = useState<Tab>('trainers');
  const [pendingLivesCount, setPendingLivesCount] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
        Participantes
      </h1>

      <div className="flex flex-wrap gap-2">
        <TabButton
          active={activeTab === 'trainers'}
          onClick={() => setActiveTab('trainers')}
        >
          Entrenadores
        </TabButton>
        <TabButton
          active={activeTab === 'assignments'}
          onClick={() => setActiveTab('assignments')}
        >
          Asignación a Divisiones
          {pendingLivesCount > 0 && (
            <span className="ml-2 grid size-4 place-items-center border border-px-deep bg-px-danger text-[8px] text-px-ink">
              !
            </span>
          )}
        </TabButton>
      </div>

      <div className={activeTab === 'trainers' ? undefined : 'hidden'}>
        <TrainersTab manager={trainersManager} />
      </div>
      <div className={activeTab === 'assignments' ? undefined : 'hidden'}>
        <AssignmentsTab
          initialSeasons={initialSeasons}
          trainers={trainersManager.trainers}
          onPendingLivesChange={setPendingLivesCount}
        />
      </div>
    </div>
  );
}
