'use client';

import { useState } from 'react';
import ParticipantsList from './ParticipantsList';
import type { Participant } from '../_lib/types/database.types';

interface Tab {
  id: string;
  label: string;
  emoji: string;
}

interface Props {
  activeTab?: string;
  children: React.ReactNode;
  hasData?: boolean;
  participants?: Participant[];
}

const tabs: Tab[] = [
  { id: 'clasificacion', label: 'Clasificación', emoji: '🏆' },
  { id: 'participantes', label: 'Participantes', emoji: '👥' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
];

export default function DivisionTabs({
  activeTab = 'clasificacion',
  children,
  hasData = false,
  participants = [],
}: Props) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="flex rounded-lg border-4 border-yellow-400 overflow-hidden mb-8 shadow-2xl">
        {tabs.map((tab, index) => {
          const isActive = currentTab === tab.id;
          const bgClass = isActive ? 'bg-yellow-400' : 'bg-jacksons-purple-600';
          const textClass = isActive
            ? 'text-slate-900 drop-shadow-md font-black'
            : 'text-white drop-shadow font-bold';
          const borderClass =
            index < tabs.length - 1 ? 'border-r-4 border-jacksons-purple-800' : '';

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide transition-all duration-200 hover:opacity-80 ${bgClass} ${textClass} ${borderClass}`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{tab.emoji}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {currentTab === 'clasificacion' && <div>{children}</div>}
        {currentTab === 'participantes' && (
          <div>
            {hasData && participants.length > 0 ? (
              <ParticipantsList participants={participants} />
            ) : (
              <div className="bg-jacksons-purple-800/80 rounded-lg border-4 border-yellow-400 p-8 text-center shadow-2xl">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl drop-shadow-md font-black tracking-wide text-yellow-300 mb-4">
                  Participantes
                </h3>
                <p className="text-white/95 drop-shadow font-semibold">
                  {hasData
                    ? 'Información detallada de los participantes estará disponible próximamente.'
                    : 'Los participantes se mostrarán cuando comience la temporada.'}
                </p>
              </div>
            )}
          </div>
        )}
        {currentTab === 'calendario' && (
          <div className="bg-jacksons-purple-800/80 rounded-lg border-4 border-yellow-400 p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl drop-shadow-md font-black tracking-wide text-yellow-300 mb-4">
              Calendario
            </h3>
            <p className="text-white/95 drop-shadow font-semibold">
              El calendario de partidos y fechas importantes se publicará pronto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
