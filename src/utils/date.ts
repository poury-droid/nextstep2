export function getDDay(dateStr: string): { text: string; days: number; isUrgent: boolean; isPast: boolean } {
  if (!dateStr) return { text: '-', days: 999, isUrgent: false, isPast: false };

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { text: 'D-Day', days: 0, isUrgent: true, isPast: false };
  } else if (diffDays > 0) {
    return { text: `D-${diffDays}`, days: diffDays, isUrgent: diffDays <= 3, isPast: false };
  } else {
    return { text: `D+${Math.abs(diffDays)}`, days: diffDays, isUrgent: false, isPast: true };
  }
}

export function formatDateKorean(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}.${day}`;
  } catch {
    return dateStr;
  }
}

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getFutureDateString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeekInMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatToDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

