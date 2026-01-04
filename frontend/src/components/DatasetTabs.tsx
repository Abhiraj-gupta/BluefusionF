import React, { useState } from 'react';
import { OceanographicPage } from '../pages/OceanographicPage';
import { ClimatePage } from '../pages/ClimatePage';
import { SocioEconomicPage } from '../pages/SocioEconomicPage';

const DATASETS = [
  {
    id: 'oceanographic',
    label: 'Oceanographic Data',
    icon: '🌊',
    Page: OceanographicPage
  },
  {
    id: 'climate',
    label: 'Climate Patterns',
    icon: '☀️',
    Page: ClimatePage
  },
  {
    id: 'socioeconomic',
    label: 'Socio-Economic Trends',
    icon: '📊',
    Page: SocioEconomicPage
  }
];

export const DatasetTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(DATASETS[0].id);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const handleTabClick = (id: string) => {
    if (id === activeTab) return;
    setSlideDirection(DATASETS.findIndex(ds => ds.id === id) > DATASETS.findIndex(ds => ds.id === activeTab) ? 'right' : 'left');
    setActiveTab(id);
  };

  const ActivePage = DATASETS.find(ds => ds.id === activeTab)?.Page;

  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-8">
        {DATASETS.map((ds) => (
          <button
            key={ds.id}
            className={`flex items-center px-8 py-4 rounded-2xl font-bold text-2xl transition-all duration-200 border-4 focus:outline-none shadow-lg tracking-wide
              ${
                activeTab === ds.id
                  ? 'bg-gradient-to-br from-cyan-900 to-cyan-700 border-cyan-300 text-white scale-105 drop-shadow-xl'
                  : 'bg-gradient-to-br from-slate-800 to-slate-700 border-transparent text-cyan-100 hover:bg-cyan-800/40 hover:text-cyan-200 opacity-80'
              }
            `}
            style={{ minWidth: 260, letterSpacing: '0.01em' }}
            onClick={() => handleTabClick(ds.id)}
            aria-selected={activeTab === ds.id}
            aria-controls={`tab-panel-${ds.id}`}
            role="tab"
          >
            <span className="mr-3 text-3xl drop-shadow-lg">{ds.icon}</span>
            {ds.label}
          </button>
        ))}
      </div>
      {/* Animated Page Card */}
      <div className="bg-white/10 backdrop-blur rounded-b-2xl rounded-tr-2xl p-12 border border-white/20 min-h-[220px] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden w-full" role="tabpanel" id={`tab-panel-${activeTab}`}> 
        {ActivePage && (
          <div
            key={activeTab}
            className={`w-full h-full transition-transform duration-500 ease-in-out
              ${slideDirection === 'right' ? 'animate-slidein-right' : 'animate-slidein-left'}`}
          >
            <ActivePage />
          </div>
        )}
      </div>
    </div>
  );
}
