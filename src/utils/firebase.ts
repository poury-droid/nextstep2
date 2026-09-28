import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// firebase-applet-config.json 에 지정된 Named Database 를 사용한다.
// (getFirestore(app) 만 호출하면 '(default)' DB 로 연결되어 데이터가 엉뚱한 곳에 저장된다.)
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

function createFirestore(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        // undefined 필드가 섞인 객체도 그대로 저장할 수 있도록 허용
        ignoreUndefinedProperties: true,
        // 오프라인 캐시 + 여러 탭 동시 사용 지원
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      },
      databaseId,
    );
  } catch {
    // HMR 등으로 이미 초기화된 경우
    return getFirestore(app, databaseId);
  }
}

export const db = createFirestore();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged };
export type { User };
