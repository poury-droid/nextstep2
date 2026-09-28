import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp, type SyncStatus } from '../context/AppContext.tsx';

export function GoogleLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const SYNC_LABEL: Record<SyncStatus, { label: string; className: string; dot: string }> = {
  offline: { label: '이 기기에만 저장', className: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  connecting: { label: '불러오는 중', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
  saving: { label: '저장 중', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  synced: { label: '동기화됨', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  error: { label: '동기화 오류', className: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

export const SyncStatusBadge: React.FC<{ className?: string; onlyOnError?: boolean }> = ({
  className = '',
  onlyOnError = false,
}) => {
  const { syncStatus, syncError } = useApp();
  // onlyOnError: 평소에는 숨기고 동기화 오류가 났을 때만 표시
  if (onlyOnError && syncStatus !== 'error') return null;
  const info = SYNC_LABEL[syncStatus];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border ${info.className} ${className}`}
      title={syncError ?? (syncStatus === 'offline' ? '로그인하면 Firestore 에 저장되어 다른 기기에서도 볼 수 있습니다.' : 'Firestore 클라우드 동기화')}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
};

export const UserAvatar: React.FC<{ size?: string }> = ({ size = 'w-8 h-8' }) => {
  const { profile } = useApp();
  const [broken, setBroken] = useState(false);
  if (profile.photoURL && !broken) {
    return (
      <img
        src={profile.photoURL}
        alt={profile.name}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`${size} rounded-full object-cover border border-slate-200 shadow-xs`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs`}>
      {profile.avatarInitials}
    </div>
  );
};

/** Google 로그인 버튼 (로그아웃 상태) */
export const GoogleSignInButton: React.FC<{ fullWidth?: boolean; compact?: boolean }> = ({ fullWidth = false, compact = false }) => {
  const { signInWithGoogle, signingIn } = useAuth();
  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={signingIn}
      className={`inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-wait text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs transition-colors ${
        fullWidth ? 'w-full py-2' : ''
      }`}
    >
      <GoogleLogo className="w-4 h-4" />
      <span className={compact ? 'hidden sm:inline' : ''}>{signingIn ? '로그인 중…' : 'Google로 로그인'}</span>
    </button>
  );
};

/** 상단 바에 들어가는 로그인 / 계정 메뉴 */
export const AuthButton: React.FC = () => {
  const { user, authLoading, signOutUser, authError, clearAuthError } = useAuth();
  const { profile, syncError } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <>
      {authLoading ? (
        <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" aria-label="로그인 상태 확인 중" />
      ) : !user ? (
        <GoogleSignInButton compact />
      ) : (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 rounded-full pl-0.5 pr-0.5 sm:pr-2 py-0.5 hover:bg-slate-100 transition-colors"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <UserAvatar />
            <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">{profile.name}</span>
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <UserAvatar size="w-10 h-10" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{profile.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="py-3 space-y-1.5">
                <SyncStatusBadge />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {syncError ?? '지원 공고, 할 일, 공부 계획, 자격증이 Firestore 에 자동 저장되어 다른 기기에서도 이어서 볼 수 있습니다.'}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  signOutUser();
                }}
                className="w-full text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-2 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}

      {authError && (
        <div className="fixed top-16 right-4 z-[60] max-w-sm bg-white border border-rose-200 shadow-lg rounded-xl p-3 flex items-start gap-2" role="alert">
          <p className="text-xs text-rose-700 leading-relaxed flex-1">{authError}</p>
          <button type="button" onClick={clearAuthError} className="text-slate-400 hover:text-slate-700 text-sm leading-none" aria-label="닫기">
            ×
          </button>
        </div>
      )}
    </>
  );
};
