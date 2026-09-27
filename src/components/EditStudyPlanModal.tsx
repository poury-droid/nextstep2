import React, { useState, useEffect } from 'react';
import { StudyPlan, Application } from '../types/index.ts';
import { IconX, IconEdit3, IconSparkles, IconPlus, IconTrash2, IconAlertCircle } from './Icons.tsx';

interface EditStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: StudyPlan;
  applications: Application[];
  onSave: (updates: Partial<StudyPlan>, regenerateSchedule?: boolean) => void;
}

export const EditStudyPlanModal: React.FC<EditStudyPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  applications,
  onSave,
}) => {
  const [examName, setExamName] = useState(plan.examName);
  const [examDate, setExamDate] = useState(plan.examDate);
  const [targetScoreOrRank, setTargetScoreOrRank] = useState(plan.targetScoreOrRank || '');
  const [applicationId, setApplicationId] = useState(plan.applicationId || '');
  const [weekdayHours, setWeekdayHours] = useState(plan.weekdayHours || 4);
  const [weekendHours, setWeekendHours] = useState(plan.weekendHours || 7);
  const [subjectsText, setSubjectsText] = useState(
    plan.subjects.map(s => s.name).join(', ')
  );
  const [regenerateSchedule, setRegenerateSchedule] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setExamName(plan.examName);
      setExamDate(plan.examDate);
      setTargetScoreOrRank(plan.targetScoreOrRank || '');
      setApplicationId(plan.applicationId || '');
      setWeekdayHours(plan.weekdayHours || 4);
      setWeekendHours(plan.weekendHours || 7);
      setSubjectsText(plan.subjects.map(s => s.name).join(', '));
      setRegenerateSchedule(false);
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    const subjectsList = subjectsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map((name, idx) => {
        const existing = plan.subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          importance: existing ? existing.importance : (5 - idx > 1 ? 5 - idx : 2),
          currentLevel: existing ? existing.currentLevel : '중급',
        };
      });

    onSave(
      {
        examName: examName.trim(),
        examDate,
        targetScoreOrRank: targetScoreOrRank.trim() || undefined,
        applicationId: applicationId || undefined,
        weekdayHours,
        weekendHours,
        subjects: subjectsList.length > 0 ? subjectsList : plan.subjects,
      },
      regenerateSchedule
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <IconEdit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">학습 계획 기본 정보 수정</h3>
              <p className="text-xs text-slate-500">시험 목표일, 공부 시간 및 과목을 수정합니다.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              시험명 / 목표 플랜명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={examName}
              onChange={e => setExamName(e.target.value)}
              placeholder="예: 현대자동차 코딩테스트 집중 대비"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시험일 / 목표 마감일 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                연계 지원 공고 (선택)
              </label>
              <select
                value={applicationId}
                onChange={e => setApplicationId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">공고 연계 없음</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company} - {app.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              목표 점수 / 합격 목표
            </label>
            <input
              type="text"
              value={targetScoreOrRank}
              onChange={e => setTargetScoreOrRank(e.target.value)}
              placeholder="예: 4문제 중 3문제 이상 해결, 상위 5% 커트라인"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                평일 하루 공부 (시간)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={weekdayHours}
                onChange={e => setWeekdayHours(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                주말 하루 공부 (시간)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={weekendHours}
                onChange={e => setWeekendHours(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              과목 순서에 따라 중요도가 자동 분배됩니다.
            </p>
          </div>

          {/* Option to regenerate schedule */}
          <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50 space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={regenerateSchedule}
                onChange={e => setRegenerateSchedule(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <div className="text-xs">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <IconSparkles className="w-3.5 h-3.5 text-purple-600" />
                  스케줄 전체 자동 재분배 (일정 다시 생성)
                </span>
                <p className="text-purple-700/80 text-[11px] mt-0.5 leading-relaxed">
                  체크 시 변경된 과목과 공부 시간에 맞춰 일자별 과제 블록을 새로 다시 자동 편성합니다.
                  (체크를 해제하면 기존 작성한 일자별 블록이 유지됩니다)
                </p>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-xs"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
