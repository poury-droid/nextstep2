import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DDayBadge } from '../components/DDayBadge.tsx';
import { HomeCalendar } from '../components/HomeCalendar.tsx';
import { getDDay, getTodayString } from '../utils/date.ts';
import {
  IconBriefcase,
  IconClock,
  IconCheckSquare,
  IconBookOpen,
  IconPlus,
  IconChevronRight,
  IconSparkles,
  IconCalendar,
  IconCheckCircle2,
} from '../components/Icons.tsx';

interface DashboardPageProps {
  onSelectApplication: (id: string) => void;
  onOpenNewAppModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectApplication,
  onOpenNewAppModal,
}) => {
  const { applications, tasks, toggleTask, addTask, studyPlans, toggleStudyBlock, setCurrentTab } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Collect all upcoming schedule items across all applications
  const upcomingSchedules = applications
    .flatMap(app => {
      const items = [];
      if (app.deadline) {
        items.push({
          type: '서류 마감',
          app,
          date: app.deadline,
          dday: getDDay(app.deadline),
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        });
      }
      if (app.writtenTestDate) {
        items.push({
          type: '필기/코테',
          app,
          date: app.writtenTestDate,
          dday: getDDay(app.writtenTestDate),
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        });
      }
      if (app.interviewDate) {
        items.push({
          type: '면접 전형',
          app,
          date: app.interviewDate,
          dday: getDDay(app.interviewDate),
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        });
      }
      if (app.replyDeadline) {
        items.push({
          type: '회신 마감',
          app,
          date: app.replyDeadline,
          dday: getDDay(app.replyDeadline),
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        });
      }
      return items;
    })
    .filter(item => item.dday.days >= 0) // Future or today
    .sort((a, b) => a.dday.days - b.dday.days);

  const nearestSchedule = upcomingSchedules[0];

  const activeApps = applications.filter(a => a.stage !== '최종합격' && a.stage !== '불합격');
  const todayTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Today's study blocks across all plans
  const todayStr = getTodayString();
  const allTodayBlocks = studyPlans.flatMap(plan => {
    const todayPlan = plan.days.find(d => d.date === todayStr);
    if (!todayPlan) return [];
    return todayPlan.blocks.map(b => ({
      planId: plan.id,
      examName: plan.examName,
      ...b,
    }));
  });

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      category: '공통',
      dueDate: todayStr,
      completed: false,
      priority: 'normal',
    });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Urgent D-Day Notification */}
      {nearestSchedule ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl shrink-0">
                {nearestSchedule.dday.text}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    가장 가까운 전형
                  </span>
                  <span className="text-xs text-blue-200">{nearestSchedule.type}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold mt-1 tracking-tight">
                  {nearestSchedule.app.company} · {nearestSchedule.app.position}
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                  예정일: {nearestSchedule.date} ({nearestSchedule.dday.text})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectApplication(nearestSchedule.app.id)}
              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white text-blue-900 text-xs sm:text-sm font-bold shadow-xs hover:bg-blue-50 transition-colors shrink-0"
            >
              공고 및 체크리스트 확인
            </button>
          </div>
        </div>
      ) : null}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Active Applications */}
        <div
          onClick={() => setCurrentTab('applications')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">진행 중인 지원</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <IconBriefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{activeApps.length}</span>
            <span className="text-xs text-slate-400 font-medium">/ 총 {applications.length}건</span>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">지원 공고 목록 보기 &rarr;</p>
        </div>

        {/* Stat 2: Upcoming Schedules */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">예정된 주요 일정</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{upcomingSchedules.length}</span>
            <span className="text-xs text-slate-400 font-medium">개 일정</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">서류·필기·면접 종합</p>
        </div>

        {/* Stat 3: Today's Tasks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">미완료 할 일</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <IconCheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{todayTasks.length}</span>
            <span className="text-xs text-slate-400 font-medium">/ 완료 {completedTasks.length}</span>
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">우선순위 순 정렬됨</p>
        </div>

        {/* Stat 4: Study Plans */}
        <div
          onClick={() => setCurrentTab('study')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">오늘의 공부 블록</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <IconBookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{allTodayBlocks.length}</span>
            <span className="text-xs text-slate-400 font-medium">개 과목</span>
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">학습 플래너 열기 &rarr;</p>
        </div>
      </div>

      {/* Monthly Interactive Calendar */}
      <HomeCalendar
        onSelectApplication={onSelectApplication}
        onOpenNewAppModal={onOpenNewAppModal}
      />

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming D-Day Timeline & Active Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Schedule Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconClock className="w-4 h-4 text-blue-600" />
                  다가오는 전형 D-Day 일정표
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  입력된 서류 마감, 필기시험, 면접일이 자동으로 집계됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewAppModal}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <IconPlus className="w-3.5 h-3.5" />
                일정 추가
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingSchedules.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectApplication(item.app.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/70 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-bold shrink-0 ${item.badgeClass}`}>
                      {item.type}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {item.app.company}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {item.app.position}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">일정: {item.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <DDayBadge dateStr={item.date} size="md" />
                    <IconChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}

              {upcomingSchedules.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  등록된 일정이 없습니다. 새 공고를 등록해 보세요.
                </div>
              )}
            </div>
          </div>

          {/* Active Applications Quick Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconBriefcase className="w-4 h-4 text-blue-600" />
                  현재 진행 중인 공고 ({activeApps.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  단계별 상태를 클릭하여 상세 정보를 열람하고 수정할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('applications')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                전체보기 &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeApps.slice(0, 4).map(app => (
                <div
                  key={app.id}
                  onClick={() => onSelectApplication(app.id)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer bg-slate-50/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-slate-900 text-sm leading-tight truncate">
                        {app.company}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold shrink-0">
                        {app.stage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium">{app.position}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[11px] text-slate-500">
                      {app.deadline ? `서류: ${app.deadline}` : '마감일 미정'}
                    </span>
                    {app.deadline && <DDayBadge dateStr={app.deadline} size="sm" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Checklist & Today's Study Blocks */}
        <div className="space-y-6">
          {/* Today's Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconCheckSquare className="w-4 h-4 text-blue-600" />
                  오늘 할 일 체크리스트
                </h3>
                <p className="text-xs text-slate-500">클릭하여 완료 상태를 전환하세요.</p>
              </div>
            </div>

            {/* Quick add input */}
            <form onSubmit={handleQuickAddTask} className="flex gap-1.5 mb-3.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="새로운 할 일 등록..."
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
              >
                추가
              </button>
            </form>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {tasks.map(task => (
                <label
                  key={task.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-snug ${
                        task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.applicationName && (
                      <span className="inline-block text-[10px] text-blue-600 font-semibold mt-1">
                        {task.applicationName}
                      </span>
                    )}
                  </div>
                  {task.dueDate && <DDayBadge dateStr={task.dueDate} size="sm" />}
                </label>
              ))}

              {tasks.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">등록된 할 일이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Today's Study Schedule Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconBookOpen className="w-4 h-4 text-purple-600" />
                  오늘의 공부 계획
                </h3>
                <p className="text-xs text-slate-500">필기/코테 시험 대비 분량</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('study')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                플래너 &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {allTodayBlocks.length > 0 ? (
                allTodayBlocks.map(block => (
                  <div
                    key={block.id}
                    className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 flex items-start justify-between gap-3"
                  >
                    <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={block.completed}
                        onChange={() => toggleStudyBlock(block.planId, block.id)}
                        className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                          {block.subject} · {block.hours}시간
                        </span>
                        <p
                          className={`text-xs mt-0.5 ${
                            block.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                          }`}
                        >
                          {block.topic}
                        </p>
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="p-5 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-xs text-slate-400 mb-2">오늘 할당된 공부 블록이 없습니다.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('study')}
                    className="text-xs font-semibold text-purple-600 hover:underline"
                  >
                    시험 공부 일정 생성하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
