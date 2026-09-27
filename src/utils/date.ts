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

export interface ExtractedKoreanDates {
  deadline: string;
  writtenTestDate: string;
  interviewDate: string;
  replyDeadline: string;
  issueDate: string;
  expiryDate: string;
}

export function parseDateStringComponent(str: string, fallbackYear: number = 2026): string {
  if (!str) return '';
  // Format: 2026-09-25, 2026.09.25, 2026/09/25, 2026 09 25
  const m1 = str.match(/(\d{4})[-./\s]+(\d{1,2})[-./\s]+(\d{1,2})/);
  if (m1) {
    const y = m1[1];
    const m = m1[2].padStart(2, '0');
    const d = m1[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Format: 2026년 9월 25일
  const m2 = str.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (m2) {
    const y = m2[1];
    const m = m2[2].padStart(2, '0');
    const d = m2[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Format: 9월 25일
  const m3 = str.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (m3) {
    const m = m3[1].padStart(2, '0');
    const d = m3[2].padStart(2, '0');
    return `${fallbackYear}-${m}-${d}`;
  }
  // Format: 09.25 or 09-25
  const m4 = str.match(/(?:^|[^\d])(\d{1,2})[-./](\d{1,2})(?:$|[^\d])/);
  if (m4) {
    const mNum = parseInt(m4[1], 10);
    const dNum = parseInt(m4[2], 10);
    if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
      return `${fallbackYear}-${String(mNum).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    }
  }
  return '';
}

export function extractDatesFromKoreanDoc(text: string): ExtractedKoreanDates {
  const result: ExtractedKoreanDates = {
    deadline: '',
    writtenTestDate: '',
    interviewDate: '',
    replyDeadline: '',
    issueDate: '',
    expiryDate: '',
  };

  if (!text) return result;

  // Extract base year from document if present
  const yearMatch = text.match(/(202[4-9])년?/);
  const docYear = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

  const lines = text.split('\n');

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // 1. Deadline (서류 접수, 마감, 지원 기간)
    if (/서류|접수|마감|지원\s*기간/i.test(cleanLine) && !result.deadline) {
      // If line contains range like "9월 16일 ~ 9월 25일", DEADLINE is the second (end) date!
      if (cleanLine.includes('~')) {
        const parts = cleanLine.split('~');
        const endPart = parts[1] || '';
        const parsedEnd = parseDateStringComponent(endPart, docYear);
        if (parsedEnd) {
          result.deadline = parsedEnd;
        } else {
          result.deadline = parseDateStringComponent(parts[0], docYear);
        }
      } else {
        const parsed = parseDateStringComponent(cleanLine, docYear);
        if (parsed) result.deadline = parsed;
      }
    }

    // 2. Written / Coding Test (코딩테스트, SW역량, 소프티어, 필기, 시험, 과제)
    if (/(?:코딩\s*테스트|코테|역량\s*테스트|소프티어|softeer|필기|인증\s*평가|온라인\s*평가|수험|과제|시험\s*일시)/i.test(cleanLine) && !result.writtenTestDate) {
      if (cleanLine.includes('~') && (cleanLine.includes(':') || cleanLine.includes('시'))) {
        const parsed = parseDateStringComponent(cleanLine.split('~')[0], docYear);
        if (parsed) result.writtenTestDate = parsed;
      } else {
        const parsed = parseDateStringComponent(cleanLine, docYear);
        if (parsed) result.writtenTestDate = parsed;
      }
    }

    // 3. Interview (면접, 인터뷰, 컬처핏, 임원, 직무 면접)
    if (/(?:면접|인터뷰|컬처핏|임원|직무\s*면접|pt\s*면접)/i.test(cleanLine) && !result.interviewDate) {
      const parsed = parseDateStringComponent(cleanLine.split('~')[0], docYear);
      if (parsed) result.interviewDate = parsed;
    }

    // 4. Reply deadline / Result announcement (발표, 합격자 회신)
    if (/(?:합격자\s*발표|결과\s*발표|회신\s*기한|등록\s*마감)/i.test(cleanLine) && !result.replyDeadline) {
      const parsed = parseDateStringComponent(cleanLine, docYear);
      if (parsed) result.replyDeadline = parsed;
    }

    // 5. Certificate Issue Date (평가 일자, 시험 일자, 발급일자)
    if (/(?:평가\s*일자|시험\s*일자|발급\s*일자|취득\s*일자|test\s*date)/i.test(cleanLine) && !result.issueDate) {
      const parsed = parseDateStringComponent(cleanLine, docYear);
      if (parsed) result.issueDate = parsed;
    }

    // 6. Certificate Expiry Date (유효 기간, 만료일)
    if (/(?:유효\s*기간|validity|만료)/i.test(cleanLine)) {
      if (cleanLine.includes('~')) {
        const parts = cleanLine.split('~');
        const start = parseDateStringComponent(parts[0], docYear);
        const end = parseDateStringComponent(parts[1], docYear);
        if (start && !result.issueDate) result.issueDate = start;
        if (end) result.expiryDate = end;
      } else {
        const parsed = parseDateStringComponent(cleanLine, docYear);
        if (parsed && !result.expiryDate) result.expiryDate = parsed;
      }
    }
  }

  // Fallback for deadline if not found by line
  if (!result.deadline) {
    const match = text.match(/(?:서류접수|접수마감|지원마감|마감일?)[^\n\r]{0,35}(?:~[^\n\r]{0,25})?(\d{4}[-./년\s]+\d{1,2}[-./월\s]+\d{1,2}|\d{1,2}월\s*\d{1,2}일)/i);
    if (match) {
      result.deadline = parseDateStringComponent(match[1], docYear);
    }
  }

  return result;
}

