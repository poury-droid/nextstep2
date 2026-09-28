import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DDayBadge } from './DDayBadge.tsx';
import {
  getDaysInMonth,
  getFirstDayOfWeekInMonth,
  formatToDateKey,
  formatDateKorean,
  getDDay,
  getTodayString,
} from '../utils/date.ts';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconCheckCircle2,
  IconBriefcase,
  IconClock,
} from './Icons.tsx';

export type CalendarEventType = 'deadline' | 'written' | 'interview' | 'reply' | 'task';

export interface CalendarEventItem {
  id: string;
  type: CalendarEventType;
  typeLabel: string;
  date: string;
  title: string;
  subtitle?: string;
  appId?: string;
  badgeClass: string;
  dotColor: string;
  completed?: boolean;
}

interface HomeCalendarProps {
  onSelectApplication: (id: string) => void;
  onOpenNewAppModal?: () => void;
}

export const HomeCalendar: React.FC<HomeCalendarProps> = ({
  onSelectApplication,
}) => {
  const { applications, tasks, toggleTask } = useApp();

  const todayStr = getTodayString();
  const [todayYear, todayMonth] = todayStr.split('-').map(Number);

  const [currentYear, setCurrentYear] = useState<number>(todayYear || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>((todayMonth ? todayMonth - 1 : new Date().getMonth()));
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedFilter, setSelectedFilter] = useState<'all' | CalendarEventType>('all');

  // Collect all events from applications and tasks
  const allEvents = useMemo(() => {
    const events: CalendarEventItem[] = [];

    applications.forEach(app => {
      if (app.deadline) {
        events.push({
          id: `${app.id}-deadline`,
          type: 'deadline',
          typeLabel: '서류 마감',
          date: app.deadline,
          title: app.company,
          subtitle: `${app.position} (서류마감)`,
          appId: app.id,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotColor: 'bg-rose-500',
        });
      }
      if (app.writtenTestDate) {
        events.push({
          id: `${app.id}-written`,
          type: 'written',
          typeLabel: '필기/코테',
          date: app.writtenTestDate,
          title: app.company,
          subtitle: `${app.position} (코딩테스트/필기)`,
          appId: app.id,
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dotColor: 'bg-indigo-500',
        });
      }
      if (app.interviewDate) {
        events.push({
          id: `${app.id}-interview`,
          type: 'interview',
          typeLabel: '면접 전형',
          date: app.interviewDate,
          title: app.company,
          subtitle: `${app.position} (면접)`,
          appId: app.id,
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotColor: 'bg-purple-500',
        });
      }
      if (app.replyDeadline) {
        events.push({
          id: `${app.id}-reply`,
          type: 'reply',
          typeLabel: '발표/회신',
          date: app.replyDeadline,
          title: app.company,
          subtitle: `${app.position} (합격 회신)`,
          appId: app.id,
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotColor: 'bg-amber-500',
        });
      }
    });

    tasks.forEach(t => {
      if (t.dueDate) {
        // 할 일과 연결된 공고 찾기 (ID 우선, 없으면 회사명으로 보조 매칭)
        const linkedApp =
          (t.applicationId ? applications.find(a => a.id === t.applicationId) : undefined) ||
          (t.applicationName ? applications.find(a => a.company === t.applicationName) : undefined);
        events.push({
          id: `task-${t.id}`,
          type: 'task',
          typeLabel: '할 일',
          date: t.dueDate,
          title: t.title,
          subtitle: linkedApp
            ? `${linkedApp.company} · ${linkedApp.position}`
            : t.applicationName || '일반 할 일',
          appId: linkedApp?.id,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotColor: 'bg-emerald-500',
          completed: t.completed,
        });
      }
    });

    return events;
  }, [applications, tasks]);

  // Filter events based on filter chips
  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') return allEvents;
    return allEvents.filter(e => e.type === selectedFilter);
  }, [allEvents, selectedFilter]);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    filteredEvents.forEach(evt => {
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Build grid days
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeekInMonth(currentYear, currentMonth);

  // Previous month spillover days
  const prevMonthDays = currentMonth === 0 ? getDaysInMonth(currentYear - 1, 11) : getDaysInMonth(currentYear, currentMonth - 1);
  const prevSpilloverCount = firstDayOfWeek;

  // Calendar cells
  const calendarCells = useMemo(() => {
    const cells = [];

    // Previous month days
    for (let i = prevSpilloverCount - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateKey = formatToDateKey(y, m, dayNum);
      cells.push({
        dateKey,
        dayNum,
        isCurrentMonth: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatToDateKey(currentYear, currentMonth, d);
      cells.push({
        dateKey,
        dayNum: d,
        isCurrentMonth: true,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Next month spillover days to complete weeks (multiple of 7)
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateKey = formatToDateKey(y, m, d);
      cells.push({
        dateKey,
        dayNum: d,
        isCurrentMonth: false,
        events: eventsByDate[dateKey] || [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek, prevMonthDays, prevSpilloverCount, eventsByDate]);

  // Events on the selected date
  const selectedDateEvents = useMemo(() => {
    return allEvents.filter(e => e.date === selectedDate);
  }, [allEvents, selectedDate]);

  const weekDayNames = [
    { label: '일', isSunday: true },
    { label: '월' },
    { label: '화' },
    { label: '수' },
    { label: '목' },
    { label: '금' },
    { label: '토', isSaturday: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Top Header: Title, Month Navigation & Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <IconCalendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                전형 캘린더 (월간 일정표)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                채용 서류 마감, 코딩테스트, 면접 일정을 한눈에 조망하고 날짜별로 관리하세요.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            오늘
          </button>

          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="이전 달"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 px-3 min-w-[105px] text-center">
              {currentYear}년 {currentMonth + 1}월
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="다음 달"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 font-semibold mr-1">전형 필터:</span>
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            selectedFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          전체 보기 ({allEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('deadline')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            selectedFilter === 'deadline'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          서류 마감
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('written')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            selectedFilter === 'written'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          필기/코테
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('interview')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            selectedFilter === 'interview'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          면접 전형
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('task')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            selectedFilter === 'task'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          할 일
        </button>
      </div>

      {/* Main Calendar Layout (2-Column Grid on large screen: Calendar grid + Selected Date Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Monthly Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center border-b border-slate-200 pb-2">
            {weekDayNames.map((wd, i) => (
              <span
                key={i}
                className={`text-xs font-bold ${
                  wd.isSunday ? 'text-rose-500' : wd.isSaturday ? 'text-blue-500' : 'text-slate-500'
                }`}
              >
                {wd.label}
              </span>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarCells.map((cell, idx) => {
              const isToday = cell.dateKey === todayStr;
              const isSelected = cell.dateKey === selectedDate;
              const hasEvents = cell.events.length > 0;
              const isWeekend = idx % 7 === 0 || idx % 7 === 6;

              return (
                <div
                  key={cell.dateKey}
                  onClick={() => setSelectedDate(cell.dateKey)}
                  className={`min-h-[76px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-xs'
                      : isToday
                      ? 'border-blue-300 bg-blue-50/20'
                      : cell.isCurrentMonth
                      ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                      : 'border-slate-50 bg-slate-50/40 text-slate-300'
                  }`}
                >
                  {/* Day Number Row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-700 font-black'
                          : !cell.isCurrentMonth
                          ? 'text-slate-300'
                          : idx % 7 === 0
                          ? 'text-rose-600'
                          : idx % 7 === 6
                          ? 'text-blue-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Dot indicators on mobile or count badge */}
                    {hasEvents && (
                      <div className="flex items-center gap-0.5 sm:hidden">
                        {cell.events.slice(0, 3).map((e, ei) => (
                          <span key={ei} className={`w-1.5 h-1.5 rounded-full ${e.dotColor}`} />
                        ))}
                        {cell.events.length > 3 && (
                          <span className="text-[9px] font-bold text-slate-400">+{cell.events.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Event Chips on Desktop */}
                  <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden">
                    {cell.events.slice(0, 2).map((evt, ei) => (
                      <div
                        key={ei}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate border ${evt.badgeClass}`}
                        title={`${evt.typeLabel}: ${evt.title}`}
                      >
                        <span className="font-black mr-1">[{evt.typeLabel}]</span>
                        {evt.title}
                      </div>
                    ))}
                    {cell.events.length > 2 && (
                      <span className="text-[10px] font-bold text-blue-600 pl-1">
                        +{cell.events.length - 2}개 더보기
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Date Schedule Detail (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with selected date */}
            <div className="pb-3 border-b border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  선택한 날짜
                </span>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    오늘
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-slate-900 mt-0.5">
                {formatDateKorean(selectedDate)}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <DDayBadge dateStr={selectedDate} size="sm" />
                <span className="text-xs text-slate-500 font-medium">
                  총 {selectedDateEvents.length}개 일정/할 일
                </span>
              </div>
            </div>

            {/* Event List on Selected Date */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {selectedDateEvents.map(evt => (
                <div
                  key={evt.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md border font-bold ${evt.badgeClass}`}>
                      {evt.typeLabel}
                    </span>

                    {evt.appId && (
                      <button
                        type="button"
                        onClick={() => onSelectApplication(evt.appId!)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        공고 열기 &rarr;
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    {evt.type === 'task' ? (
                      <>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={evt.completed}
                          onChange={() => toggleTask(evt.id.replace('task-', ''))}
                          className="mt-0.5 w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span
                          className={`text-xs ${
                            evt.completed ? 'line-through text-slate-400' : 'text-slate-800 font-bold'
                          }`}
                        >
                          {evt.title}
                        </span>
                      </label>
                      {evt.appId ? (
                        <button
                          type="button"
                          onClick={() => onSelectApplication(evt.appId!)}
                          className="mt-1.5 ml-5 inline-flex items-center gap-1 max-w-[calc(100%-1.25rem)] text-[11px] font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-md px-2 py-0.5 transition-colors"
                          title="연결된 공고 보기"
                        >
                          <IconBriefcase className="w-3 h-3 shrink-0" />
                          <span className="truncate">{evt.subtitle}</span>
                        </button>
                      ) : (
                        <p className="mt-1 ml-5 text-[11px] text-slate-400">{evt.subtitle}</p>
                      )}
                      </>
                    ) : (
                      <>
                        <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {evt.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {evt.subtitle}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {selectedDateEvents.length === 0 && (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <IconClock className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    이 날짜에 등록된 전형 일정이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
