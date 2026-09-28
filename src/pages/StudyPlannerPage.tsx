import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { StudyPlan, StudyBlock, StudyDay } from '../types/index.ts';
import { DDayBadge } from '../components/DDayBadge.tsx';
import { EditStudyPlanModal } from '../components/EditStudyPlanModal.tsx';
import { getTodayString, getFutureDateString, getDDay, formatShortDate } from '../utils/date.ts';
import {
  IconBookOpen,
  IconPlus,
  IconClock,
  IconCheckCircle2,
  IconTrash2,
  IconEdit3,
  IconSparkles,
  IconX,
  IconCalendar,
} from '../components/Icons.tsx';
import {
  generateStudySchedule,
  normalizeLevel,
  subjectShares,
  toPlanSubject,
  SKILL_STYLE,
  DEFAULT_STAGES,
  normalizeStages,
  STUDY_STAGES,
  formatAmounts,
  type SkillLevel,
  type StudyStage,
  type SubjectAmounts,
} from '../utils/studyScheduler.ts';
import { SubjectLevelPicker, StudyStagePicker, parseSubjectNames } from '../components/SubjectLevelPicker.tsx';


export const StudyPlannerPage: React.FC = () => {
  const {
    studyPlans,
    addStudyPlan,
    updateStudyPlan,
    toggleStudyBlock,
    updateStudyBlock,
    addStudyBlock,
    deleteStudyBlock,
    addStudyDay,
    deleteStudyDay,
    deleteStudyPlan,
    applications,
  } = useApp();

  const [activePlanId, setActivePlanId] = useState<string>(studyPlans[0]?.id || '');
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayDate, setNewDayDate] = useState(getFutureDateString(4));

  // New plan form state
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(getFutureDateString(14));
  const [selectedAppId, setSelectedAppId] = useState('');
  const [weekdayHours, setWeekdayHours] = useState(4);
  const [weekendHours, setWeekendHours] = useState(7);
  const [subjectsText, setSubjectsText] = useState('자료구조/알고리즘, 운영체제/네트워크, 데이터베이스/SQL');
  const [subjectLevels, setSubjectLevels] = useState<Record<string, SkillLevel>>({});
  const [studyStages, setStudyStages] = useState<StudyStage[]>(DEFAULT_STAGES);
  const [subjectAmounts, setSubjectAmounts] = useState<Record<string, SubjectAmounts>>({});
  const newPlanSubjectNames = parseSubjectNames(subjectsText);

  // Block editing state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editHours, setEditHours] = useState(2);

  // Block adding state (by day date)
  const [addingBlockDayDate, setAddingBlockDayDate] = useState<string | null>(null);
  const [newBlockSubject, setNewBlockSubject] = useState('');
  const [newBlockTopic, setNewBlockTopic] = useState('');
  const [newBlockHours, setNewBlockHours] = useState(2);

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

    // 선택하지 않은 단계의 분량은 저장하지 않음
    const pickAmounts = (a?: SubjectAmounts): SubjectAmounts | undefined =>
      a ? (Object.fromEntries(Object.entries(a).filter(([k]) => studyStages.includes(k as StudyStage))) as SubjectAmounts) : undefined;
    const subjectsList = newPlanSubjectNames.map(name =>
      toPlanSubject(name, subjectLevels[name] || '보통', pickAmounts(subjectAmounts[name])),
    );
    if (subjectsList.length === 0) return;

    const generatedDays = generateStudySchedule({
      subjects: subjectsList,
      examDate,
      weekdayHours,
      weekendHours,
      stages: studyStages,
    });

    addStudyPlan({
      applicationId: selectedAppId || undefined,
      examName: examName.trim(),
      examDate,
      targetScoreOrRank: '상위 10% 합격선 목표',
      weekdayHours,
      weekendHours,
      subjects: subjectsList,
      stages: studyStages,
      availableDays: [1, 2, 3, 4, 5, 6, 0],
      excludedDates: [],
      days: generatedDays,
    });

    setShowNewPlanModal(false);
    setExamName('');
    setSubjectLevels({});
    setStudyStages(DEFAULT_STAGES);
    setSubjectAmounts({});
  };

  const handleSavePlanSettings = (updates: Partial<StudyPlan>, regenerateSchedule?: boolean) => {
    if (!currentPlan) return;

    if (regenerateSchedule) {
      const merged = { ...currentPlan, ...updates };
      const newDays = generateStudySchedule({
        subjects: merged.subjects,
        examDate: merged.examDate,
        weekdayHours: merged.weekdayHours,
        weekendHours: merged.weekendHours,
        stages: merged.stages,
        availableDays: merged.availableDays,
        excludedDates: merged.excludedDates,
      });
      updateStudyPlan(currentPlan.id, {
        ...updates,
        days: newDays,
      });
    } else {
      updateStudyPlan(currentPlan.id, updates);
    }
  };

  const handleStartEditBlock = (block: StudyBlock) => {
    setEditingBlockId(block.id);
    setEditSubject(block.subject);
    setEditTopic(block.topic);
    setEditHours(block.hours);
  };

  const handleSaveBlockEdit = (planId: string, blockId: string) => {
    if (!editTopic.trim() || !editSubject.trim()) return;
    updateStudyBlock(planId, blockId, {
      subject: editSubject.trim(),
      topic: editTopic.trim(),
      hours: Number(editHours) || 1,
    });
    setEditingBlockId(null);
  };

  const handleStartAddBlock = (dayDate: string) => {
    setAddingBlockDayDate(dayDate);
    setNewBlockSubject(currentPlan?.subjects[0]?.name || '공통');
    setNewBlockTopic('');
    setNewBlockHours(2);
  };

  const handleSaveNewBlock = (planId: string, dayDate: string) => {
    if (!newBlockTopic.trim()) return;
    addStudyBlock(planId, dayDate, {
      subject: newBlockSubject.trim() || '공통',
      topic: newBlockTopic.trim(),
      hours: Number(newBlockHours) || 1,
    });
    setAddingBlockDayDate(null);
  };

  const handleAddDaySubmit = () => {
    if (!newDayDate || !currentPlan) return;
    const dDay = getDDay(newDayDate);
    const dayLabel = dDay.text !== '-' ? dDay.text : formatShortDate(newDayDate);
    addStudyDay(currentPlan.id, newDayDate, dayLabel);
    setShowAddDayModal(false);
  };

  const handleRegenerateEntireSchedule = () => {
    if (!currentPlan) return;
    if (
      window.confirm(
        `[${currentPlan.examName}] 일정을 과목별 실력과 공부 가능 시간에 맞춰 시험일까지 다시 만드시겠습니까?\n(직접 수정한 과제와 완료 체크는 초기화됩니다)`
      )
    ) {
      const refreshedDays = generateStudySchedule({
        subjects: currentPlan.subjects,
        examDate: currentPlan.examDate,
        weekdayHours: currentPlan.weekdayHours,
        weekendHours: currentPlan.weekendHours,
        stages: currentPlan.stages,
        availableDays: currentPlan.availableDays,
        excludedDates: currentPlan.excludedDates,
      });
      updateStudyPlan(currentPlan.id, { days: refreshedDays });
    }
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
            과목별 실력에 맞춰 시험일까지 자동으로 만든 계획을 자유롭게 수정하고 추가할 수 있습니다.
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 transition-colors"
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
                  {currentPlan.targetScoreOrRank && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {currentPlan.targetScoreOrRank}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {currentPlan.examName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  시험 예정일: {currentPlan.examDate} · 평일 {currentPlan.weekdayHours}시간 / 주말 {currentPlan.weekendHours}시간
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <span className="text-xs text-slate-500 font-medium block">학습 달성률</span>
                  <span className="text-2xl font-black text-purple-700">
                    {progressPercent}%
                  </span>
                </div>

                {/* Edit Plan Button */}
                <button
                  type="button"
                  onClick={() => setShowEditPlanModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors shadow-2xs"
                  title="플랜 기본 정보 수정"
                >
                  <IconEdit3 className="w-3.5 h-3.5" />
                  <span>계획 수정</span>
                </button>

                {/* Delete Plan Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`[${currentPlan.examName}] 플랜을 삭제하시겠습니까?`)) {
                      deleteStudyPlan(currentPlan.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
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
                <span>전체: {totalBlocks}개 과제 블록</span>
              </div>
            </div>

            {/* Subjects Chips & Quick Action */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-400 mr-1">학습 단계:</span>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-1 rounded-lg mr-2">
                  {normalizeStages(currentPlan.stages)
                    .map(id => STUDY_STAGES.find(s => s.id === id)?.label)
                    .join(' → ')}
                  {' → 총정리'}
                </span>
                <span className="text-xs font-bold text-slate-400 mr-1">대비 과목:</span>
                {(() => {
                  const shares = subjectShares(currentPlan.subjects);
                  return currentPlan.subjects.map((sub, idx) => {
                    const level = normalizeLevel(sub.currentLevel);
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                      >
                        {sub.name}
                        <span className={`text-[10px] font-bold px-1.5 py-px rounded border ${SKILL_STYLE[level]}`}>
                          {level}
                        </span>
                        <span className="text-[10px] text-slate-500">{shares[sub.name]}%</span>
                        {sub.amounts && (
                          <span className="text-[10px] text-purple-700">{formatAmounts(sub.amounts)}</span>
                        )}
                      </span>
                    );
                  });
                })()}
              </div>

              <button
                type="button"
                onClick={handleRegenerateEntireSchedule}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50/60 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200/60 transition-colors"
                title="과목별 실력과 공부 시간에 맞춰 시험일까지 일정 다시 만들기"
              >
                <IconSparkles className="w-3.5 h-3.5 text-purple-600" />
                일정 다시 만들기
              </button>
            </div>
          </div>

          {/* Daily Schedule Timetable */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  일자별 학습 과제 및 체크리스트
                  <span className="text-xs font-medium text-slate-500 normal-case">
                    (과제 수정, 시간 변경, 과제 추가 가능)
                  </span>
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDayModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
                >
                  <IconCalendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>+ 공부 날짜 추가</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.days.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{day.date}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                          {day.dayOfWeek}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DDayBadge dateStr={day.date} size="sm" />
                        {currentPlan.days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`[${day.date}] 일정을 플래너에서 삭제하시겠습니까?`)) {
                                deleteStudyDay(currentPlan.id, day.date);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                            title="이 날짜 일정 삭제"
                          >
                            <IconTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Day Study Blocks */}
                    <div className="space-y-2.5">
                      {day.blocks.map(block => {
                        const isEditingThisBlock = editingBlockId === block.id;

                        if (isEditingThisBlock) {
                          return (
                            <div
                              key={block.id}
                              className="p-3 rounded-xl border-2 border-purple-400 bg-purple-50/50 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                                  <IconEdit3 className="w-3.5 h-3.5 text-purple-600" />
                                  학습 과제 수정
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingBlockId(null)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <IconX className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    과목명
                                  </label>
                                  <input
                                    type="text"
                                    list={`subjects-list-${block.id}`}
                                    value={editSubject}
                                    onChange={e => setEditSubject(e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                  />
                                  <datalist id={`subjects-list-${block.id}`}>
                                    {currentPlan.subjects.map((s, sIdx) => (
                                      <option key={sIdx} value={s.name} />
                                    ))}
                                  </datalist>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    시간 (h)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="16"
                                    value={editHours}
                                    onChange={e => setEditHours(Number(e.target.value))}
                                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  학습 내용 및 문제 목표
                                </label>
                                <input
                                  type="text"
                                  value={editTopic}
                                  onChange={e => setEditTopic(e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingBlockId(null)}
                                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveBlockEdit(currentPlan.id, block.id)}
                                  className="px-3.5 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-2xs"
                                >
                                  수정 저장
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={block.id}
                            className="group flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition-colors"
                          >
                            <label className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer">
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

                            {/* Block Action Buttons */}
                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditBlock(block)}
                                className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                title="과제 수정"
                              >
                                <IconEdit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteStudyBlock(currentPlan.id, block.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="과제 삭제"
                              >
                                <IconTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {day.blocks.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          등록된 과제가 없습니다. 아래에서 새 과제를 추가해 보세요.
                        </p>
                      )}
                    </div>

                    {/* Inline Add Block Form */}
                    {addingBlockDayDate === day.date ? (
                      <div className="p-3 rounded-xl border border-dashed border-purple-300 bg-purple-50/40 space-y-2.5 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                            <IconPlus className="w-3.5 h-3.5 text-purple-600" />
                            새 과제 추가 ({day.date})
                          </span>
                          <button
                            type="button"
                            onClick={() => setAddingBlockDayDate(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <IconX className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              과목
                            </label>
                            <input
                              type="text"
                              list={`new-subjects-list-${day.date}`}
                              value={newBlockSubject}
                              onChange={e => setNewBlockSubject(e.target.value)}
                              placeholder="예: 알고리즘"
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <datalist id={`new-subjects-list-${day.date}`}>
                              {currentPlan.subjects.map((s, sIdx) => (
                                <option key={sIdx} value={s.name} />
                              ))}
                            </datalist>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              시간 (h)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="16"
                              value={newBlockHours}
                              onChange={e => setNewBlockHours(Number(e.target.value))}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            학습 내용 / 문제 풀이 계획
                          </label>
                          <input
                            type="text"
                            value={newBlockTopic}
                            onChange={e => setNewBlockTopic(e.target.value)}
                            placeholder="예: 백준 DFS/BFS 실버 3문제 풀이 및 복습"
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setAddingBlockDayDate(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNewBlock(currentPlan.id, day.date)}
                            className="px-3.5 py-1 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-2xs"
                          >
                            과제 등록
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartAddBlock(day.date)}
                        className="w-full py-2 mt-3 rounded-xl border border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                        <span>학습 과제 추가</span>
                      </button>
                    )}
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

      {/* Edit Existing Plan Modal */}
      {currentPlan && (
        <EditStudyPlanModal
          isOpen={showEditPlanModal}
          onClose={() => setShowEditPlanModal(false)}
          plan={currentPlan}
          applications={applications}
          onSave={handleSavePlanSettings}
        />
      )}

      {/* Add Study Day Modal */}
      {showAddDayModal && currentPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <IconCalendar className="w-4 h-4 text-purple-600" />
                공부 일정 날짜 추가
              </h4>
              <button
                type="button"
                onClick={() => setShowAddDayModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                추가할 날짜 선택
              </label>
              <input
                type="date"
                value={newDayDate}
                onChange={e => setNewDayDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                선택한 날짜가 데일리 스케줄 목록에 추가되며, 새 과제를 등록할 수 있습니다.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddDayModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddDaySubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
              >
                날짜 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
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

              <StudyStagePicker value={studyStages} onChange={setStudyStages} />

              <SubjectLevelPicker
                names={newPlanSubjectNames}
                levels={subjectLevels}
                onChange={setSubjectLevels}
                stages={studyStages}
                amounts={subjectAmounts}
                onAmountsChange={setSubjectAmounts}
              />

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
                  시험일까지 계획 만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
