import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  IconDashboard,
  IconBriefcase,
  IconFileSearch,
  IconBookOpen,
  IconAward,
  IconCheckSquare,
} from './Icons.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { GoogleSignInButton, SyncStatusBadge, UserAvatar } from './AuthButton.tsx';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { currentTab, setCurrentTab, applications, tasks, studyPlans, credentials, profile } = useApp();
  const { user, authLoading, signOutUser } = useAuth();

  const activeAppsCount = applications.filter(a => a.stage !== '최종합격' && a.stage !== '불합격').length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const navItems = [
    {
      id: 'dashboard',
      label: '한눈에 보기',
      sublabel: '대시보드 & 캘린더',
      icon: IconDashboard,
      badge: null,
    },
    {
      id: 'applications',
      label: '지원 공고',
      sublabel: '전형 관리 & 서류',
      icon: IconBriefcase,
      badge: activeAppsCount,
    },
    {
      id: 'analyze',
      label: '공고문·안내문 AI 분석',
      sublabel: '전형 일정 자동 추출',
      icon: IconFileSearch,
      badge: 'AI 분석',
      badgeColor: 'bg-blue-100 text-blue-700 font-bold',
    },
    {
      id: 'study',
      label: '공부 플래너',
      sublabel: '필기/코테 일정표',
      icon: IconBookOpen,
      badge: studyPlans.length,
    },
    {
      id: 'credentials',
      label: '내 자격',
      sublabel: '어학 성적 & 기사',
      icon: IconAward,
      badge: credentials.length,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentTab('dashboard'); onCloseMobile?.(); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-500/20 tracking-wider">
              NS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">NextStep</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">PRO</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">취업 전형 관리 비서</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 pt-4 pb-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            전형 관리 메뉴
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTab(item.id as any);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm leading-tight">{item.label}</div>
                    <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || (isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Todo task status teaser */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <IconCheckSquare className="w-3.5 h-3.5 text-blue-600" />
              미완료 할 일
            </span>
            <span className="font-bold text-blue-600">{pendingTasksCount}건</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${tasks.length > 0 ? ((tasks.length - pendingTasksCount) / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>달성도 {tasks.length > 0 ? Math.round(((tasks.length - pendingTasksCount) / tasks.length) * 100) : 0}%</span>
            <span>총 {tasks.length}개</span>
          </div>
        </div>

        {/* User Account Profile */}
        <div className="p-3 border-t border-slate-100">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
                <UserAvatar size="w-9 h-9" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{profile.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pt-1.5">
                <SyncStatusBadge />
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <div className="px-2 py-1.5 space-y-2">
              <p className="text-[11px] leading-relaxed text-slate-500">
                지금은 이 브라우저에만 저장됩니다. 로그인하면 Firestore 에 저장되어 어느 기기에서나 이어서 볼 수 있어요.
              </p>
              {authLoading ? (
                <div className="h-8 rounded-lg bg-slate-100 animate-pulse" />
              ) : (
                <GoogleSignInButton fullWidth />
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
