import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from '../utils/firebase.ts';

interface AuthContextType {
  user: User | null;
  /** 첫 인증 상태 확인이 끝나기 전에는 true */
  authLoading: boolean;
  /** 로그인 팝업 진행 중 */
  signingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function describeAuthError(error: unknown): string | null {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null; // 사용자가 직접 닫은 경우는 알리지 않음
    case 'auth/unauthorized-domain':
      return `이 도메인(${window.location.hostname})은 Firebase 인증에 등록되지 않았습니다. Firebase 콘솔 > Authentication > 설정 > 승인된 도메인에 추가해 주세요.`;
    case 'auth/operation-not-allowed':
      return 'Firebase 콘솔에서 Google 로그인 제공업체가 사용 설정되어 있지 않습니다.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
    default:
      return `Google 로그인에 실패했습니다. (${code || (error as Error)?.message || '알 수 없는 오류'})`;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 팝업 차단으로 리다이렉트 로그인을 했을 때의 결과 처리
    getRedirectResult(auth).catch(e => setAuthError(describeAuthError(e)));

    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        // 팝업이 막힌 브라우저에서는 리다이렉트 방식으로 재시도
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setAuthError(describeAuthError(e));
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      setAuthError(`로그아웃에 실패했습니다. (${(e as Error)?.message ?? e})`);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        signingIn,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
