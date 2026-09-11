import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Application, ApplicationStage } from '../types/index.ts';
import { DDayBadge } from './DDayBadge.tsx';
import {
  IconX,
  IconClock,
  IconMapPin,
  IconCheckCircle2,
  IconBookOpen,
  IconTrash2,
  IconEdit3,
  IconPlus,
  IconCheckSquare,
} from './Icons.tsx';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onEdit: (app: Application) => void;
}

const STAGES: ApplicationStage[] = [
  '서류접수',
  '서류합격',
  '필기/코딩테스트',
  '1차면접',
  '2차/최종면접',
  '최종합격',
  '불합격',
];

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onEdit,
}) => {
  const {
    updateApplicationStage,
    toggleRequiredDoc,
    deleteApplication,
    tasks,
    toggleTask,
    addTask,
    studyPlans,
    setCurrentTab,
  } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const appTasks = tasks.filter(t => t.applicationId === application.id);
  const linkedStudyPlan = studyPlans.find(sp => sp.applicationId === application.id);

  const handleStageChange = (stage: ApplicationStage) => {
    updateApplicationStage(application.id, stage);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      applicationId: application.id,
      applicationName: application.company,
      title: newTaskTitle.trim(),
      category: '공통',
      dueDate: newTaskDueDate || application.deadline || '',
      completed: false,
      priority: 'normal',
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const handleDelete = () => {
    if (confirm(`[${application.company}] 지원 공고를 정말 삭제하시겠습니까?`)) {
      deleteApplication(application.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {application.company.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{application.company}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  {application.stage}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{application.position}</p>
              <p className="text-xs text-slate-500 mt-1">{application.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(application)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="공고 수정"
            >
              <IconEdit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="공고 삭제"
            >
              <IconTrash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="닫기"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stage Progress Stepper */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              전형 단계 변경
            </label>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
              {STAGES.map(stage => {
                const isCurrent = application.stage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleStageChange(stage)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Dates Schedule Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              주요 전형 일정
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500 font-medium block mb-1">서류 마감일</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    {application.deadline || '미정'}
                  </span>
                  {application.deadline && <DDayBadge dateStr={application.deadline} size="sm" />}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                <span className="text-xs text-indigo-700 font-medium block mb-1">필기/코딩테스트</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">
                    {application.writtenTestDate || '미정'}
                  </span>
                  {application.writtenTestDate && <DDayBadge dateStr={application.writtenTestDate} size="sm" />}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50">
                <span className="text-xs text-purple-700 font-medium block mb-1">면접 전형일</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-sm">
                    {application.interviewDate || '미정'}
                  </span>
                  {application.interviewDate && <DDayBadge dateStr={application.interviewDate} size="sm" />}
                </div>
              </div>
            </div>

            {application.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 px-1">
                <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>장소 / 면접 위치: {application.location}</span>
              </div>
            )}
          </div>

          {/* Required Documents Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                제출 서류 체크리스트
              </label>
              <span className="text-xs text-slate-500">
                {application.requiredDocuments.filter(d => d.checked).length} / {application.requiredDocuments.length} 완료
              </span>
            </div>

            {application.requiredDocuments.length > 0 ? (
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                {application.requiredDocuments.map((doc, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={doc.checked}
                      onChange={() => toggleRequiredDoc(application.id, idx)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${doc.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'}`}>
                      {doc.name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                등록된 필수 서류 항목이 없습니다. 공고 수정에서 추가할 수 있습니다.
              </div>
            )}
          </div>

          {/* Linked Study Plan Banner */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <IconBookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-950">
                  {linkedStudyPlan ? linkedStudyPlan.examName : `${application.company} 필기/면접 공부 계획`}
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  {linkedStudyPlan
                    ? `시험일 ${linkedStudyPlan.examDate} (${linkedStudyPlan.subjects.map(s => s.name).join(', ')})`
                    : '시험일에 맞춘 일일 공부 플랜을 생성할 수 있습니다.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                setCurrentTab('study');
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              {linkedStudyPlan ? '플래너 열기' : '공부 계획 생성'}
            </button>
          </div>

          {/* Specific Tasks & Checklist for this application */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              공고별 할 일 ({appTasks.length})
            </label>

            <form onSubmit={handleCreateTask} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="이 공고에 대한 새 할 일 입력..."
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
              <input
                type="date"
                value={newTaskDueDate}
                onChange={e => setNewTaskDueDate(e.target.value)}
                className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <IconPlus className="w-3.5 h-3.5" />
                추가
              </button>
            </form>

            <div className="space-y-1.5">
              {appTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className={`text-xs truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                      {task.title}
                    </span>
                  </label>
                  {task.dueDate && <DDayBadge dateStr={task.dueDate} size="sm" />}
                </div>
              ))}

              {appTasks.length === 0 && (
                <p className="text-xs text-slate-400 py-2 text-center">등록된 공고별 할 일이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Memo & Notes */}
          {application.memo && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                전형 준비 메모
              </label>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs leading-relaxed whitespace-pre-wrap">
                {application.memo}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
