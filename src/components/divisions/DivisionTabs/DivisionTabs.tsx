'use client';

import { useState } from 'react';
import type { Participant } from '@/lib/types';
import ParticipantsList from '../ParticipantsList/ParticipantsList';
import TabButton from './TabButton';
import TabEmptyState from './TabEmptyState';
import { DIVISION_TABS, type TabId } from './tabs.config';

export interface DivisionTabsProps {
  activeTab?: TabId;
  children: React.ReactNode;
  hasData?: boolean;
  participants?: Participant[];
}

export default function DivisionTabs({
  activeTab = 'clasificacion',
  children,
  hasData = false,
  participants = [],
}: DivisionTabsProps) {
  const [currentTab, setCurrentTab] = useState<TabId>(activeTab);

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="flex rounded-lg border-4 border-yellow-400 overflow-hidden mb-8 shadow-2xl">
        {DIVISION_TABS.map((tab, index) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            emoji={tab.emoji}
            isActive={currentTab === tab.id}
            showBorder={index < DIVISION_TABS.length - 1}
            onClick={() => setCurrentTab(tab.id as TabId)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Clasificación Tab */}
        {currentTab === 'clasificacion' && <div>{children}</div>}

        {/* Participantes Tab */}
        {currentTab === 'participantes' && (
          <div>
            {hasData && participants.length > 0 ? (
              <ParticipantsList participants={participants} />
            ) : (
              <TabEmptyState
                emoji="👥"
                title="Participantes"
                message={
                  hasData
                    ? 'Información detallada de los participantes estará disponible próximamente.'
                    : 'Los participantes se mostrarán cuando comience la temporada.'
                }
              />
            )}
          </div>
        )}

        {/* Calendario Tab */}
        {currentTab === 'calendario' && (
          <TabEmptyState
            emoji="📅"
            title="Calendario"
            message="El calendario de partidos y fechas importantes se publicará pronto."
          />
        )}
      </div>
    </div>
  );
}
