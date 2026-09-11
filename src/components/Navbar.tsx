import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { IconMenu, IconPlus, IconSparkles } from './Icons.tsx';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenNewAppModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, onOpenNewAppModal }) => {
  const { currentTab, setCurrentTab, resetData } = useApp();

  const tabTitles: Record<string, { title: string; desc: string }> = {
    dashboard: { title: '한눈에 보기', desc: '전형 일정, D-Day, 오늘 할 일과 공부 계획을 한눈에 파악하세요.' },
    applications: { title: '지원 공고 관리', desc: '기업별 서류, 코딩테스트, 면접 일정과 전형 단계를 체계적으로 관리합니다.' },
    analyze: { title: '자료 분석 (AI)', desc: '채용 공고 PDF나 이미지를 업로드하면 주요 일정과 자격을 자동으로 추출합니다.' },
    study: { title: '공부 플래너', desc: '시험 날짜와 공부 가능 시간에 맞춰 최적의 데일리 학습 일정을 생성합니다.' },
    credentials: { title: '내 자격증 & 어학', desc: '보유한 공인 어학 성적과 자격증의 유효기간과 취득 현황을 관리합니다.' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'NextStep', desc: '' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="메뉴 열기"
        >
          <IconMenu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {currentInfo.title}
            {currentTab === 'analyze' && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                <IconSparkles className="w-3 h-3" />
                AI 지원
              </span>
            )}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">{currentInfo.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (confirm('예시 데이터를 초기 상태로 복원하시겠습니까?')) {
              resetData();
            }
          }}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          title="초기 예시 데이터 복원"
        >
          데이터 초기화
        </button>

        {currentTab !== 'analyze' && (
          <button
            type="button"
            onClick={() => setCurrentTab('analyze')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            공고 AI 분석
          </button>
        )}

        <button
          type="button"
          onClick={onOpenNewAppModal}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
        >
          <IconPlus className="w-4 h-4" />
          <span className="hidden xs:inline">공고 추가</span>
        </button>
      </div>
    </header>
  );
};
