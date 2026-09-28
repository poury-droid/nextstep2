import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { IconMenu, IconSparkles } from './Icons.tsx';
import { AuthButton, SyncStatusBadge } from './AuthButton.tsx';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { currentTab, setCurrentTab } = useApp();

  const tabTitles: Record<string, { title: string; desc: string }> = {
    dashboard: { title: '한눈에 보기', desc: '전형 일정, D-Day, 오늘 할 일과 공부 계획을 한눈에 파악하세요.' },
    applications: { title: '지원 공고 관리', desc: '기업별 서류, 코딩테스트, 면접 일정과 전형 단계를 체계적으로 관리합니다.' },
    analyze: { title: 'AI 공고 분석', desc: '채용 공고 포스터, 모집 요강 캡처 사진, 어학 성적표를 AI가 분석하여 전형 일정과 필요 서류를 자동으로 추출합니다.' },
    study: { title: '공부 플래너', desc: '시험 날짜와 공부 가능 시간에 맞춰 최적의 데일리 학습 일정을 생성합니다.' },
    credentials: { title: '내 자격증 & 어학', desc: '보유한 공인 어학 성적과 자격증의 유효기간과 취득 현황을 관리합니다.' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'NextStep', desc: '' };

  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/70 px-4 lg:px-8 py-3.5 flex items-center justify-between">
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
        <SyncStatusBadge onlyOnError />

        <AuthButton />
      </div>
    </header>
  );
};
