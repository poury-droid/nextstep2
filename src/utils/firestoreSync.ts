/**
 * Firestore 동기화 유틸리티
 *
 * 데이터 구조
 *   users/{uid}                     사용자 프로필 (firebase-blueprint.json 의 UserProfile)
 *   users/{uid}/applications/{id}   지원 공고
 *   users/{uid}/tasks/{id}          할 일
 *   users/{uid}/studyPlans/{id}     공부 계획
 *   users/{uid}/credentials/{id}    자격증 / 어학
 *   users/{uid}/blobs/{key}-{n}     이미지(data URL) 조각
 *
 * 공고 포스터, 안내문 캡처 같은 이미지는 data URL 로 저장되어 있어 문서 1개의 한도(1MiB)를
 * 쉽게 넘는다. 그래서 큰 data URL 은 blobs 컬렉션에 조각으로 따로 저장하고,
 * 본문에는 "fsblob:{key}:{조각수}" 참조 문자열만 남긴다. 읽을 때 다시 원래 data URL 로 복원한다.
 */
import {
  collection,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

export const SYNC_COLLECTIONS = ['applications', 'tasks', 'studyPlans', 'credentials'] as const;
export type SyncCollection = (typeof SYNC_COLLECTIONS)[number];

const BLOB_PREFIX = 'fsblob:';
const INLINE_LIMIT = 4 * 1024; // 이보다 긴 data URL 만 분리 저장
const CHUNK_SIZE = 900 * 1024; // 문서 한도(1MiB)보다 작게
const BATCH_LIMIT = 400; // writeBatch 최대 500 건

/* ------------------------------------------------------------------ */
/* 공통 헬퍼                                                            */
/* ------------------------------------------------------------------ */

/** 키 순서와 무관하게 동일한 결과를 내는 JSON 직렬화 (변경 감지용) */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => (v === undefined ? 'null' : stableStringify(v))).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter(k => obj[k] !== undefined)
    .sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

/** 동기 해시(cyrb53) — crypto.subtle 이 없는 http 환경에서도 동작 */
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function blobKey(data: string): string {
  return `${cyrb53(data)}${cyrb53(data, 7)}${data.length.toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* 이미지(blob) 분리 저장 / 복원                                         */
/* ------------------------------------------------------------------ */

/** uid 별 blob 캐시 (key -> data URL). 업로드 여부 확인과 복원에 함께 사용 */
const blobCache = new Map<string, Map<string, string>>();
const pendingBlobFetch = new Map<string, Promise<string | null>>();

function cacheFor(uid: string) {
  let m = blobCache.get(uid);
  if (!m) {
    m = new Map();
    blobCache.set(uid, m);
  }
  return m;
}

export function clearBlobCache(uid?: string) {
  if (uid) blobCache.delete(uid);
  else blobCache.clear();
}

async function uploadBlob(db: Firestore, uid: string, data: string): Promise<string> {
  const key = blobKey(data);
  const total = Math.max(1, Math.ceil(data.length / CHUNK_SIZE));
  const cache = cacheFor(uid);
  if (!cache.has(key)) {
    for (let i = 0; i < total; i++) {
      await setDoc(doc(db, 'users', uid, 'blobs', `${key}-${i}`), {
        data: data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        index: i,
        total,
      });
    }
    cache.set(key, data);
  }
  return `${BLOB_PREFIX}${key}:${total}`;
}

async function downloadBlob(db: Firestore, uid: string, ref: string): Promise<string | null> {
  const [key, totalStr] = ref.slice(BLOB_PREFIX.length).split(':');
  const cache = cacheFor(uid);
  const hit = cache.get(key);
  if (hit) return hit;

  const pendingKey = `${uid}/${key}`;
  const pending = pendingBlobFetch.get(pendingKey);
  if (pending) return pending;

  const job = (async () => {
    try {
      const total = Number(totalStr) || 1;
      const parts = await Promise.all(
        Array.from({ length: total }, (_, i) => getDoc(doc(db, 'users', uid, 'blobs', `${key}-${i}`))),
      );
      if (parts.some(p => !p.exists())) return null;
      const data = parts.map(p => String(p.data()?.data ?? '')).join('');
      cache.set(key, data);
      return data;
    } catch (e) {
      console.warn('[sync] 이미지 조각을 불러오지 못했습니다:', key, e);
      return null;
    } finally {
      pendingBlobFetch.delete(pendingKey);
    }
  })();
  pendingBlobFetch.set(pendingKey, job);
  return job;
}

/** 큰 data URL 을 blobs 컬렉션으로 옮기고 참조 문자열로 치환한 복사본을 만든다 */
export async function dehydrate<T>(db: Firestore, uid: string, value: T): Promise<T> {
  if (typeof value === 'string') {
    if (value.startsWith('data:') && value.length > INLINE_LIMIT) {
      return (await uploadBlob(db, uid, value)) as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return (await Promise.all(value.map(v => dehydrate(db, uid, v)))) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = await dehydrate(db, uid, v);
    }
    return out as T;
  }
  return value;
}

/** 참조 문자열을 원래 data URL 로 되돌린 복사본을 만든다 */
export async function hydrate<T>(db: Firestore, uid: string, value: T): Promise<T> {
  if (typeof value === 'string') {
    if (value.startsWith(BLOB_PREFIX)) {
      const data = await downloadBlob(db, uid, value);
      return (data ?? value) as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return (await Promise.all(value.map(v => hydrate(db, uid, v)))) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = await hydrate(db, uid, v);
    }
    return out as T;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* 컬렉션 쓰기                                                          */
/* ------------------------------------------------------------------ */

export function collectionRef(db: Firestore, uid: string, name: SyncCollection) {
  return collection(db, 'users', uid, name);
}

/**
 * 변경된 항목은 set, 사라진 항목은 delete 로 반영한다.
 * 이미지 업로드가 끝난 뒤 배치로 커밋하므로 참조가 깨진 문서가 저장되지 않는다.
 */
export async function pushChanges<T extends { id: string }>(
  db: Firestore,
  uid: string,
  name: SyncCollection,
  upserts: T[],
  deletedIds: string[],
): Promise<void> {
  const prepared = await Promise.all(upserts.map(item => dehydrate(db, uid, item)));

  const ops: Array<(b: ReturnType<typeof writeBatch>) => void> = [];
  prepared.forEach(item => {
    ops.push(b => b.set(doc(db, 'users', uid, name, item.id), item as Record<string, unknown>));
  });
  deletedIds.forEach(id => {
    ops.push(b => b.delete(doc(db, 'users', uid, name, id)));
  });

  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    ops.slice(i, i + BATCH_LIMIT).forEach(op => op(batch));
    await batch.commit();
  }
}

/* ------------------------------------------------------------------ */
/* 사용자 프로필                                                         */
/* ------------------------------------------------------------------ */

export interface RemoteUserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  targetRole?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * 로그인 시 users/{uid} 문서를 갱신한다.
 * 반환값의 isNewUser 가 true 이면 이 계정으로 처음 로그인한 것이다.
 */
export async function upsertUserProfile(
  db: Firestore,
  profile: Omit<RemoteUserProfile, 'createdAt' | 'lastLoginAt'>,
): Promise<{ isNewUser: boolean; data: RemoteUserProfile }> {
  const ref = doc(db, 'users', profile.uid);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const data: RemoteUserProfile = { ...profile, createdAt: now, lastLoginAt: now };
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return { isNewUser: true, data };
  }

  const prev = snap.data() as RemoteUserProfile;
  const data: RemoteUserProfile = {
    ...prev,
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    photoURL: profile.photoURL,
    // 사용자가 직접 설정한 목표 직무는 유지
    targetRole: prev.targetRole || profile.targetRole,
    lastLoginAt: now,
  };
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return { isNewUser: false, data };
}
