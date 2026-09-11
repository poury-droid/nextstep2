import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ApplicationCard } from '../components/ApplicationCard.tsx';
import { ApplicationStage } from '../types/index.ts';
import { IconSearch, IconPlus, IconBriefcase } from '../components/Icons.tsx';

interface ApplicationsPageProps {
  onSelectApplication: (id: string) => void;
  onOpenNewAppModal: () => void;
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: '전체', value: 'ALL' },
  { label: '서류접수', value: '서류접수' },
  { label: '서류합격', value: '서류합격' },
  { label: '필기/코테', value: '필기/코딩테스트' },
  { label: '면접 전형', value: '면접' },
  { label: '최종합격', value: '최종합격' },
  { label: '불합격', value: '불합격' },
];

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({
  onSelectApplication,
  onOpenNewAppModal,
}) => {
  const { applications } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredApps = applications.filter(app => {
    // Search match
    const matchSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === '면접') {
      return app.stage === '1차면접' || app.stage === '2차/최종면접';
    }
    return app.stage === selectedFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search input */}
          <div className="relative w-full sm:w-96">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="회사명, 지원 직무, 공고명 검색..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* New App Button */}
          <button
            type="button"
            onClick={onOpenNewAppModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <IconPlus className="w-4 h-4" />
            <span>새 지원 공고 등록</span>
          </button>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          {FILTER_TABS.map(tab => {
            const isActive = selectedFilter === tab.value;
            const count = applications.filter(a => {
              if (tab.value === 'ALL') return true;
              if (tab.value === '면접') return a.stage === '1차면접' || a.stage === '2차/최종면접';
              return a.stage === tab.value;
            }).length;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map(app => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => onSelectApplication(app.id)}
          />
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <IconBriefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">해당 조건의 지원 공고가 없습니다.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            검색어를 변경하거나 새로운 취업 지원 공고를 등록해 보세요.
          </p>
          <button
            type="button"
            onClick={onOpenNewAppModal}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            새 공고 등록
          </button>
        </div>
      )}
    </div>
  );
};
