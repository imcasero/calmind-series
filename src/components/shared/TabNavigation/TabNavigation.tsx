import { useState } from 'preact/hooks';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function TabNavigation({ tabs, defaultTab, onTabChange }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div class="w-full">
      <div class="flex rounded-lg border-2 border-yellow-400 overflow-hidden">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;

          let bgClass = isActive ? 'bg-yellow-400' : 'bg-purple-600';
          let textClass = isActive ? 'text-slate-900' : 'text-white';

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              class={`flex-1 px-4 py-3 font-semibold text-sm uppercase tracking-wide transition-all duration-200 hover:opacity-80 ${bgClass} ${textClass} ${!isLast ? 'border-r border-slate-600' : ''}`}
            >
              <div class="flex items-center justify-center gap-2">
                <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
