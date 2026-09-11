import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { StudyPlan } from '../types/index.ts';
import { DDayBadge } from '../components/DDayBadge.tsx';
import { getTodayString, getFutureDateString } from '../utils/date.ts';
import {
  IconBookOpen,
  IconPlus,
  IconClock,
  IconCheckCircle2,
  IconTrash2,
  IconSparkles,
  IconX,
} from '../components/Icons.tsx';

export const StudyPlannerPage: React.FC = () => {
  const { studyPlans, addStudyPlan, toggleStudyBlock, deleteStudyPlan, applications } = useApp();

  const [activePlanId, setActivePlanId] = useState<string>(studyPlans[0]?.id || '');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  // New plan form state
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(getFutureDateString(14));
  const [selectedAppId, setSelectedAppId] = useState('');
  const [weekdayHours, setWeekdayHours] = useState(4);
  const [weekendHours, setWeekendHours] = useState(7);
  const [subjectsText, setSubjectsText] = useState('자료구조/알고리즘, 운영체제/네트워크, 데이터베이스/SQL');

  const currentPlan = studyPlans.find(p => p.id === activePlanId) || studyPlans[0];

  const totalBlocks = currentPlan
    ? currentPlan.days.reduce((acc, d) => acc + d.blocks.length, 0)
    : 0;
  const completedBlocks = currentPlan
    ? currentPlan.days.reduce((acc, d) => acc + d.blocks.filter(b => b.completed).length, 0)
    : 0;
  const progressPercent = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    const subjectsList = subjectsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map((name, idx) => ({
        name,
        importance: 5 - idx > 1 ? 5 - idx : 2,
        currentLevel: '중급',
      }));

    // Auto-generate 7 days of smart study blocks
    const generatedDays = [
      {
        date: getTodayString(),
        dayOfWeek: '오늘',
        blocks: [
          { id: `b-${Date.now()}-1`, subject: subjectsList[0]?.name || '핵심 개념', topic: '기본 이론 정립 및 빈출 유형 정리', hours: 2, completed: false },
          { id: `b-${Date.now()}-2`, subject: subjectsList[1]?.name || '문제 풀이', topic: '실전 기출 문제 집중 풀이 3제', hours: 2, completed: false },
        ],
      },
      {
        date: getFutureDateString(1),
        dayOfWeek: 'D-13',
        blocks: [
          { id: `b-${Date.now()}-3`, subject: subjectsList[0]?.name || '심화 응용', topic: '고난도 변형 유형 풀이 및 오답 체크', hours: 2.5, completed: false },
          { id: `b-${Date.now()}-4`, subject: subjectsList[2]?.name || '암기/정리', topic: '핵심 요약 노트 작성 및 키워드 암기', hours: 1.5, completed: false },
        ],
      },
      {
        date: getFutureDateString(2),
        dayOfWeek: 'D-12',
        blocks: [
          { id: `b-${Date.now()}-5`, subject: subjectsList[1]?.name || '실전 연습', topic: '시간 제한 타이머 실전 모의고사 1회', hours: 3, completed: false },
        ],
      },
      {
        date: getFutureDateString(3),
        dayOfWeek: 'D-11',
        blocks: [
          { id: `b-${Date.now()}-6`, subject: '오답 노트', topic: '틀린 문제 원인 분석 및 유사 문제 재풀이', hours: 2, completed: false },
          { id: `b-${Date.now()}-7`, subject: subjectsList[0]?.name || '약점 보완', topic: '취약 단원 개념 복습', hours: 2, completed: false },
        ],
      },
    ];

    addStudyPlan({
      applicationId: selectedAppId || undefined,
      examName: examName.trim(),
      examDate,
      targetScoreOrRank: '상위 10% 합격선 목표',
      weekdayHours,
      weekendHours,
      subjects: subjectsList,
      availableDays: [1, 2, 3, 4, 5, 6, 0],
      excludedDates: [],
      days: generatedDays,
    });

    setShowNewPlanModal(false);
    setExamName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <IconBookOpen className="w-5 h-5 text-purple-600" />
            시험 대비 데일리 공부 플래너
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            목표 시험일까지의 기간과 공부 가능 시간에 맞춘 맞춤형 과목 분배 일정표입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Plan tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {studyPlans.map(plan => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setActivePlanId(plan.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  (currentPlan?.id === plan.id)
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {plan.examName.slice(0, 12)}...
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowNewPlanModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0"
          >
            <IconPlus className="w-4 h-4" />
            <span>새 계획</span>
          </button>
        </div>
      </div>

      {currentPlan ? (
        <div className="space-y-6">
          {/* Current Plan Overview Card */}
          <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    목표 시험
                  </span>
                  <DDayBadge dateStr={currentPlan.examDate} size="md" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {currentPlan.examName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  시험 예정일: {currentPlan.examDate} · 평일 하루 {currentPlan.weekdayHours}시간 / 주말 {currentPlan.weekendHours}시간
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">학습 달성률</span>
                  <span className="text-2xl font-black text-purple-700">
                    {progressPercent}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`[${currentPlan.examName}] 플랜을 삭제하시겠습니까?`)) {
                      deleteStudyPlan(currentPlan.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="플랜 삭제"
                >
                  <IconTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                <span>완료: {completedBlocks}개 블록</span>
                <span>전체: {totalBlocks}개 블록</span>
              </div>
            </div>

            {/* Subjects Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {currentPlan.subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  {sub.name} (중요도: {'★'.repeat(sub.importance)})
                </span>
              ))}
            </div>
          </div>

          {/* Daily Schedule Timetable */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              일자별 학습 과제 및 체크리스트
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{day.date}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                          {day.dayOfWeek}
                        </span>
                      </div>
                      <DDayBadge dateStr={day.date} size="sm" />
                    </div>

                    <div className="space-y-2.5">
                      {day.blocks.map(block => (
                        <label
                          key={block.id}
                          className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={block.completed}
                            onChange={() => toggleStudyBlock(currentPlan.id, block.id)}
                            className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-purple-700">
                                {block.subject}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                ({block.hours}시간)
                              </span>
                            </div>
                            <p
                              className={`text-xs mt-0.5 leading-relaxed ${
                                block.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                              }`}
                            >
                              {block.topic}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
            <IconBookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">등록된 공부 플랜이 없습니다.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            목표하는 시험과 날짜를 입력하여 데일리 학습 스케줄을 자동으로 생성해 보세요.
          </p>
          <button
            type="button"
            onClick={() => setShowNewPlanModal(true)}
            className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            플랜 생성하기
          </button>
        </div>
      )}

      {/* Create New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-purple-600" />
                새 맞춤 공부 계획 생성
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPlanModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  시험명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  placeholder="예: 네이버 1차 코딩테스트, 정보처리기사 실기"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    시험 날짜
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    연계 지원 공고 (선택)
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={e => setSelectedAppId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">공고 선택 안함</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.company} - {app.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    평일 공부 가능 시간 (시간/일)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={weekdayHours}
                    onChange={e => setWeekdayHours(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    주말 공부 가능 시간 (시간/일)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={weekendHours}
                    onChange={e => setWeekendHours(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  공부 과목 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={subjectsText}
                  onChange={e => setSubjectsText(e.target.value)}
                  placeholder="예: 알고리즘, CS 운영체제, SQL"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-xs"
                >
                  스케줄 자동 분배 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
