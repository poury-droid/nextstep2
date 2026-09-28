/**
 * 공부 계획 자동 생성기
 *
 * 과목별 "내 실력(약함 / 보통 / 자신있음)"을 기준으로 시간을 나눈다.
 *  - 약한 과목일수록 더 많은 시간을 배정 (가중치 3 : 2 : 1)
 *  - 오늘부터 시험 전날까지 매일 생성, 평일/주말 공부 가능 시간 반영
 *  - 사용자가 고른 학습 단계(개념 / 기출 / 실전 모의고사)만 순서대로 진행, 마지막 날은 총정리
 */
import type { StudyDay, StudyBlock } from '../types/index.ts';

export type SkillLevel = '약함' | '보통' | '자신있음';

export const SKILL_LEVELS: SkillLevel[] = ['약함', '보통', '자신있음'];

export const SKILL_WEIGHT: Record<SkillLevel, number> = {
  약함: 3,
  보통: 2,
  자신있음: 1,
};

export const SKILL_STYLE: Record<SkillLevel, string> = {
  약함: 'bg-rose-50 text-rose-700 border-rose-200',
  보통: 'bg-amber-50 text-amber-700 border-amber-200',
  자신있음: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

/** 예전 데이터('초급/중급/상급', 별점 중요도)도 새 기준으로 해석 */
export function normalizeLevel(level?: string): SkillLevel {
  switch ((level || '').trim()) {
    case '약함':
    case '초급':
    case '하':
    case '부족':
      return '약함';
    case '자신있음':
    case '상급':
    case '상':
    case '고급':
      return '자신있음';
    default:
      return '보통';
  }
}

/** 과목 · 단계별 분량 (예: 기출 5회, 개념 12강) */
export interface StageAmount {
  total: number;
  unit: string;
}
export type SubjectAmounts = Partial<Record<'개념' | '기출' | '실전', StageAmount>>;

/** 단계별로 고를 수 있는 분량 단위 (첫 번째가 기본값) */
export const AMOUNT_UNITS: Record<'개념' | '기출' | '실전', string[]> = {
  개념: ['강', '챕터', '쪽'],
  기출: ['회', '문제'],
  실전: ['회'],
};

export interface PlannerSubject {
  name: string;
  currentLevel?: string;
  amounts?: SubjectAmounts;
}

/** 입력값 중 0 이하 / 비어 있는 분량 제거 */
export function cleanAmounts(amounts?: SubjectAmounts): SubjectAmounts | undefined {
  if (!amounts) return undefined;
  const out: SubjectAmounts = {};
  (Object.keys(amounts) as (keyof SubjectAmounts)[]).forEach(k => {
    const a = amounts[k];
    if (a && Number(a.total) > 0) out[k] = { total: Math.floor(Number(a.total)), unit: a.unit };
  });
  return Object.keys(out).length ? out : undefined;
}

/** 저장용 과목 객체 (importance 필드는 기존 타입 호환을 위해 가중치로 채움) */
export function toPlanSubject(name: string, level: SkillLevel, amounts?: SubjectAmounts) {
  const cleaned = cleanAmounts(amounts);
  return {
    name,
    currentLevel: level,
    importance: SKILL_WEIGHT[level],
    ...(cleaned ? { amounts: cleaned } : {}),
  };
}

/** "기출 5회 · 개념 12강" 형태의 요약 */
export function formatAmounts(amounts?: SubjectAmounts): string {
  if (!amounts) return '';
  return (['개념', '기출', '실전'] as const)
    .filter(k => amounts[k])
    .map(k => `${k === '실전' ? '모의' : k} ${amounts[k]!.total}${amounts[k]!.unit}`)
    .join(' · ');
}

/* ------------------------------------------------------------------ */
/* 분량 → 블록별 과제 문구                                                */
/* ------------------------------------------------------------------ */

function rangeText(a: number, b: number, unit: string): string {
  if (unit === '쪽') return a === b ? `p.${a}` : `p.${a}~${b}`;
  const r = a === b ? `${a}` : `${a}~${b}`;
  if (unit === '회') return `${r}회차`;
  if (unit === '문제') return `${r}번`;
  return `${r}${unit}`;
}

function amountTopic(stage: '개념' | '기출' | '실전', a: number, b: number, unit: string): string {
  const r = rangeText(a, b, unit);
  if (stage === '개념') return unit === '쪽' ? `개념 ${r} 읽고 정리` : `개념 ${r} 학습 · 정리`;
  if (stage === '기출') return `기출 ${r} 풀이 + 오답 정리`;
  return `모의고사 ${r} 실전 풀이 (시간 재기) + 오답`;
}

function reviewTopic(stage: '개념' | '기출' | '실전'): string {
  if (stage === '개념') return '앞에서 공부한 개념 복습';
  if (stage === '기출') return '기출 오답 다시 풀기';
  return '모의고사 오답 · 취약 유형 복습';
}

/** 과목별 예상 시간 비율(%) */
export function subjectShares(subjects: PlannerSubject[]): Record<string, number> {
  const total = subjects.reduce((acc, s) => acc + SKILL_WEIGHT[normalizeLevel(s.currentLevel)], 0) || 1;
  const out: Record<string, number> = {};
  subjects.forEach(s => {
    out[s.name] = Math.round((SKILL_WEIGHT[normalizeLevel(s.currentLevel)] / total) * 100);
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* 날짜 헬퍼 (로컬 시간 기준)                                            */
/* ------------------------------------------------------------------ */

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/* ------------------------------------------------------------------ */
/* 학습 단계                                                            */
/* ------------------------------------------------------------------ */

/** 사용자가 고를 수 있는 학습 단계 */
export type StudyStage = '개념' | '기출' | '실전';

export const STUDY_STAGES: { id: StudyStage; label: string; desc: string }[] = [
  { id: '개념', label: '개념', desc: '이론 · 핵심 개념 정리' },
  { id: '기출', label: '기출', desc: '기출 · 유형 문제 풀이' },
  { id: '실전', label: '실전 모의고사', desc: '시간 재고 실전처럼 풀기' },
];

export const DEFAULT_STAGES: StudyStage[] = ['개념', '기출', '실전'];

/** 단계별 기간 비율 (선택한 단계끼리 다시 나눔) */
const STAGE_RATIO: Record<StudyStage, number> = { 개념: 0.4, 기출: 0.35, 실전: 0.25 };

export function normalizeStages(stages?: string[]): StudyStage[] {
  const picked = DEFAULT_STAGES.filter(s => stages?.includes(s));
  return picked.length > 0 ? picked : DEFAULT_STAGES;
}

type Phase = StudyStage | '총정리';

const TOPICS: Record<Phase, Record<SkillLevel, string[]>> = {
  개념: {
    약함: ['기본 개념 처음부터 정리', '핵심 개념 + 예제로 이해하기', '헷갈리는 개념 비교 정리'],
    보통: ['핵심 개념 정리', '빈출 개념 요약 노트 만들기'],
    자신있음: ['핵심 개념 빠르게 훑어보기'],
  },
  기출: {
    약함: ['기본 유형 문제 풀이', '틀린 문제 개념 다시 보기', '쉬운 기출부터 유형 익히기'],
    보통: ['기출 빈출 유형 풀이', '오답 노트 정리'],
    자신있음: ['고난도 · 변형 문제 풀이', '시간 단축 연습'],
  },
  실전: {
    약함: ['실전 문제 + 오답 집중 복습', '취약 유형 반복 풀이'],
    보통: ['시간 재고 실전 모의 풀이', '오답 원인 분석'],
    자신있음: ['실전 모의고사 풀이', '실수 줄이기 점검'],
  },
  총정리: {
    약함: ['오답 노트 · 핵심 요약 최종 복습'],
    보통: ['전 범위 핵심 요약 복습'],
    자신있음: ['실수 포인트 최종 점검'],
  },
};

function phaseFor(index: number, total: number, stages: StudyStage[]): Phase {
  if (total <= 1) return stages.length === 1 ? stages[0] : '총정리';
  if (index === total - 1) return '총정리';
  // 남은 기간이 짧으면 선택한 단계 중 마지막 단계에 집중
  if (total <= 3) return stages[stages.length - 1];
  const p = index / (total - 1);
  const ratioSum = stages.reduce((acc, s) => acc + STAGE_RATIO[s], 0);
  let acc = 0;
  for (const s of stages) {
    acc += STAGE_RATIO[s] / ratioSum;
    if (p < acc) return s;
  }
  return stages[stages.length - 1];
}

const PHASE_LABEL: Record<Phase, string> = { 개념: '개념', 기출: '기출', 실전: '실전 모의', 총정리: '총정리' };

/** 하루 공부 시간을 1~2시간짜리 블록으로 나눈다 (예: 5시간 → 2, 2, 1) */
function splitHours(hours: number): number[] {
  const h = Math.max(1, Math.round(hours));
  const blocks: number[] = [];
  let left = h;
  while (left > 0) {
    const take = left >= 2 ? 2 : left;
    blocks.push(take);
    left -= take;
  }
  return blocks;
}

/* ------------------------------------------------------------------ */
/* 일정 생성                                                            */
/* ------------------------------------------------------------------ */

export interface GenerateScheduleInput {
  subjects: PlannerSubject[];
  examDate: string; // YYYY-MM-DD
  weekdayHours: number;
  weekendHours: number;
  stages?: string[]; // 진행할 학습 단계 (기본: 개념 · 기출 · 실전)
  availableDays?: number[]; // 0=일 ... 6=토
  excludedDates?: string[];
  startDate?: string; // 기본: 오늘
  maxDays?: number; // 너무 긴 계획 방지 (기본 90일)
}

export function generateStudySchedule(input: GenerateScheduleInput): StudyDay[] {
  const subjects = input.subjects.filter(s => s.name.trim());
  if (subjects.length === 0) return [];

  const start = input.startDate ? parseKey(input.startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  const exam = input.examDate ? parseKey(input.examDate) : new Date(start.getTime() + 13 * 86400000);

  // 오늘 ~ 시험 전날 (시험이 오늘이거나 지났으면 오늘 하루만)
  const span = Math.max(1, Math.min(diffDays(start, exam), input.maxDays ?? 90));
  const available = new Set(input.availableDays && input.availableDays.length ? input.availableDays : [0, 1, 2, 3, 4, 5, 6]);
  const excluded = new Set(input.excludedDates || []);

  const dates: Date[] = [];
  for (let i = 0; i < span; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (!available.has(d.getDay()) || excluded.has(toKey(d))) continue;
    dates.push(d);
  }
  if (dates.length === 0) dates.push(new Date(start));

  const stages = normalizeStages(input.stages);
  const levels = subjects.map(s => normalizeLevel(s.currentLevel));
  const weights = levels.map(l => SKILL_WEIGHT[l]);
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const assigned = subjects.map(() => 0); // 과목별 누적 배정 시간
  const phaseCount = subjects.map(() => ({} as Record<string, number>)); // 주제 순환용
  let assignedTotal = 0;
  const idSeed = Math.random().toString(36).slice(2, 6);
  // 분량 배정을 위해 (과목, 단계)별 블록 목록을 모아 둠
  const groups = new Map<string, StudyBlock[]>();

  const days: StudyDay[] = dates.map((date, dayIdx) => {
    const key = toKey(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const hours = isWeekend ? input.weekendHours : input.weekdayHours;
    const phase = phaseFor(dayIdx, dates.length, stages);
    const usedToday = new Set<number>();

    const blocks: StudyBlock[] = splitHours(hours || 1).map((h, bIdx) => {
      // 목표 비율 대비 가장 덜 공부한 과목 선택 (같은 날 중복은 가능하면 피함)
      const pool = subjects.length > usedToday.size ? subjects.map((_, i) => i).filter(i => !usedToday.has(i)) : subjects.map((_, i) => i);
      let best = pool[0];
      let bestDeficit = -Infinity;
      for (const i of pool) {
        const target = ((assignedTotal + h) * weights[i]) / weightSum;
        const deficit = target - assigned[i];
        if (deficit > bestDeficit + 1e-9 || (Math.abs(deficit - bestDeficit) < 1e-9 && weights[i] > weights[best])) {
          best = i;
          bestDeficit = deficit;
        }
      }
      usedToday.add(best);
      assigned[best] += h;
      assignedTotal += h;

      const topics = TOPICS[phase][levels[best]];
      const n = phaseCount[best][phase] ?? 0;
      phaseCount[best][phase] = n + 1;

      const block: StudyBlock = {
        id: `b-${key}-${bIdx}-${idSeed}`,
        subject: subjects[best].name,
        topic: topics[n % topics.length],
        hours: h,
        completed: false,
      };
      if (phase !== '총정리') {
        const gKey = `${best}|${phase}`;
        if (!groups.has(gKey)) groups.set(gKey, []);
        groups.get(gKey)!.push(block);
      }
      return block;
    });

    const dDay = diffDays(date, exam);
    return {
      date: key,
      dayOfWeek: `${WEEKDAY_KO[date.getDay()]} · ${PHASE_LABEL[phase]} · 시험 ${dDay > 0 ? `D-${dDay}` : 'D-Day'}`,
      blocks,
    };
  });

  // 분량이 정해진 과목은 해당 단계 블록에 시간 비율대로 범위를 나눠 배정 (예: 기출 1~2회차)
  groups.forEach((blocks, gKey) => {
    const [idxStr, stage] = gKey.split('|') as [string, '개념' | '기출' | '실전'];
    const amount = subjects[Number(idxStr)].amounts?.[stage];
    if (!amount || !(amount.total > 0)) return;
    const totalHours = blocks.reduce((acc, b) => acc + b.hours, 0) || 1;
    let cumHours = 0;
    let done = 0;
    blocks.forEach(b => {
      cumHours += b.hours;
      const end = Math.round((amount.total * cumHours) / totalHours);
      b.topic = end > done ? amountTopic(stage, done + 1, end, amount.unit) : reviewTopic(stage);
      done = Math.max(done, end);
    });
  });

  return days;
}
