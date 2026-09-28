import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { Application, Task, StudyPlan, StudyBlock, Credential, UserProfile, ApplicationStage } from '../types/index.ts';
import {
  loadApplications,
  saveApplications,
  loadTasks,
  saveTasks,
  loadStudyPlans,
  saveStudyPlans,
  loadCredentials,
  saveCredentials,
  loadProfile,
  saveProfile,
} from '../utils/storage.ts';
import { db } from '../utils/firebase.ts';
import { useAuth } from './AuthContext.tsx';
import {
  SYNC_COLLECTIONS,
  type SyncCollection,
  collectionRef,
  pushChanges,
  hydrate,
  stableStringify,
  upsertUserProfile,
  clearBlobCache,
} from '../utils/firestoreSync.ts';

/**
 * offline    : 로그인하지 않음 (이 브라우저의 localStorage 에만 저장)
 * connecting : 로그인 직후 Firestore 에서 데이터를 불러오는 중
 * synced     : 모든 변경 사항이 Firestore 에 저장됨
 * saving     : 변경 사항을 Firestore 에 저장하는 중
 * error      : 동기화 실패 (syncError 참고)
 */
export type SyncStatus = 'offline' | 'connecting' | 'synced' | 'saving' | 'error';

type SyncedMap = Record<SyncCollection, Map<string, string>>;
const emptySynced = (): SyncedMap => ({
  applications: new Map(),
  tasks: new Map(),
  studyPlans: new Map(),
  credentials: new Map(),
});
const notReady = (): Record<SyncCollection, boolean> => ({
  applications: false,
  tasks: false,
  studyPlans: false,
  credentials: false,
});

function makeInitials(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  if (/[가-힣]/.test(trimmed)) {
    const compact = trimmed.replace(/\s+/g, '');
    return compact.length >= 3 ? compact.slice(-2) : compact;
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('');
}

function describeSyncError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'permission-denied') {
    return 'Firestore 접근 권한이 없습니다. firestore.rules 가 배포되었는지 확인해 주세요.';
  }
  if (code === 'unavailable') {
    return '서버에 연결할 수 없습니다. 연결이 복구되면 자동으로 다시 저장됩니다.';
  }
  return `클라우드 동기화 오류: ${code || (e as Error)?.message || e}`;
}

/**
 * 문서 ID 생성. Firestore 에서는 ID 가 곧 문서 키이므로 같은 밀리초에 여러 개를 만들어도
 * (예: 공고 등록 시 자동 생성되는 할 일 2건) 겹치지 않도록 난수 접미사를 붙인다.
 */
function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 원격 목록을 현재 화면 순서를 최대한 유지하면서 반영한다 */
function mergeRemoteOrder<T extends { id: string; createdAt?: string }>(
  name: SyncCollection,
  prev: T[],
  remote: T[],
): T[] {
  const remoteById = new Map(remote.map(item => [item.id, item]));
  const prevIds = new Set(prev.map(item => item.id));
  const kept = prev.filter(item => remoteById.has(item.id)).map(item => remoteById.get(item.id)!);
  const added = remote
    .filter(item => !prevIds.has(item.id))
    .sort((a, b) => {
      const byDate = (b.createdAt || '').localeCompare(a.createdAt || '');
      return byDate !== 0 ? byDate : b.id.localeCompare(a.id, undefined, { numeric: true });
    });
  // 자격증은 뒤에 추가, 나머지는 최신 항목이 위로 오도록 앞에 추가 (기존 add* 동작과 동일)
  return name === 'credentials' ? [...kept, ...added.reverse()] : [...added, ...kept];
}

interface AppContextType {
  applications: Application[];
  tasks: Task[];
  studyPlans: StudyPlan[];
  credentials: Credential[];
  profile: UserProfile;
  currentTab: 'dashboard' | 'applications' | 'analyze' | 'study' | 'credentials';
  setCurrentTab: (tab: 'dashboard' | 'applications' | 'analyze' | 'study' | 'credentials') => void;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  
  // Application Actions
  addApplication: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStage: (id: string, stage: ApplicationStage) => void;
  toggleRequiredDoc: (appId: string, docIndex: number) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Study Plan Actions
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudyPlan: (id: string, updates: Partial<StudyPlan>) => void;
  toggleStudyBlock: (planId: string, blockId: string) => void;
  updateStudyBlock: (planId: string, blockId: string, updates: Partial<StudyBlock>) => void;
  addStudyBlock: (planId: string, dayDate: string, block: Omit<StudyBlock, 'id' | 'completed'>) => void;
  deleteStudyBlock: (planId: string, blockId: string) => void;
  addStudyDay: (planId: string, date: string, dayOfWeek: string) => void;
  deleteStudyDay: (planId: string, dayDate: string) => void;
  deleteStudyPlan: (id: string) => void;

  // Credential Actions
  addCredential: (cred: Omit<Credential, 'id'>) => void;
  deleteCredential: (id: string) => void;

  // Cloud sync (Firestore)
  syncStatus: SyncStatus;
  syncError: string | null;
  /** 로그인 후 Firestore 데이터를 불러와 동기화가 활성화된 상태 */
  isCloudSynced: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(loadApplications);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(loadStudyPlans);
  const [credentials, setCredentials] = useState<Credential[]>(loadCredentials);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'applications' | 'analyze' | 'study' | 'credentials'>('dashboard');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /* Firestore 동기화                                                     */
  /* ------------------------------------------------------------------ */
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cloudUid, setCloudUid] = useState<string | null>(null);

  const cloudUidRef = useRef<string | null>(null);
  const syncedRef = useRef<SyncedMap>(emptySynced()); // 마지막으로 Firestore 와 일치한 상태 (id -> JSON)
  const readyRef = useRef<Record<SyncCollection, boolean>>(notReady());
  const pendingWritesRef = useRef(0);
  const latestRef = useRef({ applications, tasks, studyPlans, credentials });
  latestRef.current = { applications, tasks, studyPlans, credentials };

  const setters: Record<SyncCollection, React.Dispatch<React.SetStateAction<any[]>>> = {
    applications: setApplications,
    tasks: setTasks,
    studyPlans: setStudyPlans,
    credentials: setCredentials,
  };

  const reloadLocalData = () => {
    setApplications(loadApplications());
    setTasks(loadTasks());
    setStudyPlans(loadStudyPlans());
    setCredentials(loadCredentials());
    setProfile(loadProfile());
  };

  // 로그인 / 로그아웃에 따라 Firestore 구독을 시작하거나 해제
  useEffect(() => {
    if (!uid || !user) {
      if (cloudUidRef.current) {
        // 로그아웃: 계정 데이터를 화면에서 지우고 이 브라우저의 게스트 데이터로 복귀
        clearBlobCache(cloudUidRef.current);
        cloudUidRef.current = null;
        setCloudUid(null);
        reloadLocalData();
      }
      readyRef.current = notReady();
      syncedRef.current = emptySynced();
      setSyncStatus('offline');
      setSyncError(null);
      return;
    }

    let cancelled = false;
    const unsubscribes: Unsubscribe[] = [];
    readyRef.current = notReady();
    syncedRef.current = emptySynced();
    setSyncStatus('connecting');
    setSyncError(null);

    (async () => {
      try {
        const localProfile = loadProfile();
        const { isNewUser, data } = await upsertUserProfile(db, {
          uid,
          name: user.displayName || user.email?.split('@')[0] || '사용자',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          targetRole: localProfile.targetRole,
        });
        if (cancelled) return;

        setProfile({
          name: data.name,
          email: data.email,
          targetRole: data.targetRole || localProfile.targetRole,
          avatarInitials: makeInitials(data.name),
          photoURL: data.photoURL,
        });

        if (isNewUser) {
          // 이 계정으로 처음 로그인: 지금 브라우저에 있던 데이터를 계정으로 옮긴다
          const local = latestRef.current;
          await Promise.all(
            SYNC_COLLECTIONS.map(name => pushChanges(db, uid, name, local[name] as { id: string }[], [])),
          );
        }
        if (cancelled) return;

        let readyCount = 0;
        SYNC_COLLECTIONS.forEach(name => {
          let version = 0;
          const unsubscribe = onSnapshot(
            collectionRef(db, uid, name),
            async snap => {
              // 캐시에 아무것도 없을 때는 서버 응답을 기다린다 (빈 목록으로 덮어쓰지 않도록)
              if (!readyRef.current[name] && snap.metadata.fromCache && snap.empty) return;

              const myVersion = ++version;
              const items = await Promise.all(
                snap.docs.map(d => hydrate(db, uid, { ...(d.data() as object), id: d.id } as { id: string })),
              );
              if (cancelled || myVersion !== version) return;

              syncedRef.current[name] = new Map(items.map(item => [item.id, stableStringify(item)]));
              readyRef.current[name] = true;
              setters[name](prev => mergeRemoteOrder(name, prev, items as any[]));

              if (++readyCount === SYNC_COLLECTIONS.length) {
                cloudUidRef.current = uid;
                setCloudUid(uid);
                if (pendingWritesRef.current === 0) setSyncStatus('synced');
              }
            },
            err => {
              if (cancelled) return;
              console.error(`[sync] ${name} 구독 실패`, err);
              setSyncStatus('error');
              setSyncError(describeSyncError(err));
            },
          );
          unsubscribes.push(unsubscribe);
        });
      } catch (e) {
        if (cancelled) return;
        console.error('[sync] 초기 동기화 실패', e);
        setSyncStatus('error');
        setSyncError(describeSyncError(e));
      }
    })();

    return () => {
      cancelled = true;
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // 로컬 변경 → Firestore (마지막 동기화 상태와 비교해 바뀐 항목만 저장/삭제)
  const pushCollection = useCallback(
    (name: SyncCollection, items: { id: string }[]) => {
      if (!uid || !readyRef.current[name]) return;

      const synced = syncedRef.current[name];
      const next = new Map<string, string>();
      const upserts: { id: string }[] = [];
      for (const item of items) {
        if (!item || typeof item.id !== 'string' || !item.id) continue;
        const json = stableStringify(item);
        next.set(item.id, json);
        if (synced.get(item.id) !== json) upserts.push(item);
      }
      const deletedIds = [...synced.keys()].filter(id => !next.has(id));
      if (upserts.length === 0 && deletedIds.length === 0) return;

      syncedRef.current[name] = next;
      pendingWritesRef.current += 1;
      setSyncStatus('saving');

      pushChanges(db, uid, name, upserts, deletedIds)
        .then(() => {
          pendingWritesRef.current -= 1;
          if (pendingWritesRef.current === 0) {
            setSyncStatus('synced');
            setSyncError(null);
          }
        })
        .catch(e => {
          pendingWritesRef.current -= 1;
          console.error(`[sync] ${name} 저장 실패`, e);
          // 다음 변경 때 다시 시도되도록 실패한 항목을 '미동기화' 로 표시
          const current = syncedRef.current[name];
          upserts.forEach(item => current.delete(item.id));
          deletedIds.forEach(id => current.set(id, ''));
          setSyncStatus('error');
          setSyncError(describeSyncError(e));
        });
    },
    [uid],
  );

  // 로그인하지 않은 경우에만 localStorage 에 저장 (로그인 중에는 Firestore 가 원본)
  useEffect(() => {
    if (uid) pushCollection('applications', applications);
    else saveApplications(applications);
  }, [applications, uid, pushCollection]);

  useEffect(() => {
    if (uid) pushCollection('tasks', tasks);
    else saveTasks(tasks);
  }, [tasks, uid, pushCollection]);

  useEffect(() => {
    if (uid) pushCollection('studyPlans', studyPlans);
    else saveStudyPlans(studyPlans);
  }, [studyPlans, uid, pushCollection]);

  useEffect(() => {
    if (uid) pushCollection('credentials', credentials);
    else saveCredentials(credentials);
  }, [credentials, uid, pushCollection]);

  const addApplication = (appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Application => {
    const newApp: Application = {
      ...appData,
      id: newId('app'),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setApplications(prev => [newApp, ...prev]);

    // Automatically generate basic milestone tasks for the application
    if (newApp.deadline) {
      addTask({
        applicationId: newApp.id,
        applicationName: newApp.company,
        title: `[${newApp.company}] 서류 최종 검토 및 마감 전 제출`,
        category: '서류',
        dueDate: newApp.deadline,
        completed: false,
        priority: 'high',
      });
    }
    if (newApp.writtenTestDate) {
      addTask({
        applicationId: newApp.id,
        applicationName: newApp.company,
        title: `[${newApp.company}] 코딩테스트/필기시험 응시 및 환경 점검`,
        category: '필기',
        dueDate: newApp.writtenTestDate,
        completed: false,
        priority: 'high',
      });
    }

    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== id) return app;
        const updated = { ...app, ...updates, updatedAt: new Date().toISOString().split('T')[0] };
        if ('imageUrl' in updates && (!updates.imageUrl || updates.imageUrl === '')) {
          delete (updated as any).imageUrl;
        }
        return updated;
      })
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    setTasks(prev => prev.filter(t => t.applicationId !== id));
    setStudyPlans(prev => prev.filter(sp => sp.applicationId !== id));
    if (selectedAppId === id) setSelectedAppId(null);
  };

  const updateApplicationStage = (id: string, stage: ApplicationStage) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, stage, updatedAt: new Date().toISOString().split('T')[0] } : app))
    );
  };

  const toggleRequiredDoc = (appId: string, docIndex: number) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const newDocs = [...app.requiredDocuments];
        if (newDocs[docIndex]) {
          newDocs[docIndex] = { ...newDocs[docIndex], checked: !newDocs[docIndex].checked };
        }
        return { ...app, requiredDocuments: newDocs };
      })
    );
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: newId('task'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addStudyPlan = (planData: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: StudyPlan = {
      ...planData,
      id: newId('plan'),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setStudyPlans(prev => [newPlan, ...prev]);
  };

  const updateStudyPlan = (id: string, updates: Partial<StudyPlan>) => {
    setStudyPlans(prev =>
      prev.map(plan =>
        plan.id === id
          ? { ...plan, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : plan
      )
    );
  };

  const toggleStudyBlock = (planId: string, blockId: string) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        let blockFound = false;
        const newDays = plan.days.map(day => {
          const newBlocks = day.blocks.map(b => {
            if (b.id === blockId) {
              blockFound = true;
              return { ...b, completed: !b.completed };
            }
            return b;
          });
          return { ...day, blocks: newBlocks };
        });
        if (!blockFound) return plan;
        return { ...plan, days: newDays, updatedAt: new Date().toISOString().split('T')[0] };
      })
    );
  };

  const updateStudyBlock = (planId: string, blockId: string, updates: Partial<StudyBlock>) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        let modified = false;
        const newDays = plan.days.map(day => {
          const newBlocks = day.blocks.map(b => {
            if (b.id === blockId) {
              modified = true;
              return { ...b, ...updates };
            }
            return b;
          });
          return { ...day, blocks: newBlocks };
        });
        if (!modified) return plan;
        return { ...plan, days: newDays, updatedAt: new Date().toISOString().split('T')[0] };
      })
    );
  };

  const addStudyBlock = (planId: string, dayDate: string, blockData: Omit<StudyBlock, 'id' | 'completed'>) => {
    const newBlock: StudyBlock = {
      ...blockData,
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completed: false,
    };
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        let dayFound = false;
        const newDays = plan.days.map(day => {
          if (day.date === dayDate) {
            dayFound = true;
            return { ...day, blocks: [...day.blocks, newBlock] };
          }
          return day;
        });
        if (!dayFound) return plan;
        return { ...plan, days: newDays, updatedAt: new Date().toISOString().split('T')[0] };
      })
    );
  };

  const deleteStudyBlock = (planId: string, blockId: string) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        const newDays = plan.days.map(day => ({
          ...day,
          blocks: day.blocks.filter(b => b.id !== blockId),
        }));
        return { ...plan, days: newDays, updatedAt: new Date().toISOString().split('T')[0] };
      })
    );
  };

  const addStudyDay = (planId: string, date: string, dayOfWeek: string) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        if (plan.days.some(d => d.date === date)) return plan;
        const newDay = {
          date,
          dayOfWeek,
          blocks: [],
        };
        const newDays = [...plan.days, newDay].sort((a, b) => a.date.localeCompare(b.date));
        return { ...plan, days: newDays, updatedAt: new Date().toISOString().split('T')[0] };
      })
    );
  };

  const deleteStudyDay = (planId: string, dayDate: string) => {
    setStudyPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          days: plan.days.filter(d => d.date !== dayDate),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const deleteStudyPlan = (id: string) => {
    setStudyPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const addCredential = (credData: Omit<Credential, 'id'>) => {
    const newCred: Credential = {
      ...credData,
      id: newId('cred'),
    };
    setCredentials(prev => [...prev, newCred]);
  };

  const deleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        applications,
        tasks,
        studyPlans,
        credentials,
        profile,
        currentTab,
        setCurrentTab,
        selectedAppId,
        setSelectedAppId,
        addApplication,
        updateApplication,
        deleteApplication,
        updateApplicationStage,
        toggleRequiredDoc,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        addStudyPlan,
        updateStudyPlan,
        toggleStudyBlock,
        updateStudyBlock,
        addStudyBlock,
        deleteStudyBlock,
        addStudyDay,
        deleteStudyDay,
        deleteStudyPlan,
        addCredential,
        deleteCredential,
        syncStatus,
        syncError,
        isCloudSynced: cloudUid !== null && cloudUid === uid,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
