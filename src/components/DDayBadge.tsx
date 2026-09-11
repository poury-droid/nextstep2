import React from 'react';
import { getDDay } from '../utils/date.ts';

interface DDayBadgeProps {
  dateStr: string;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DDayBadge: React.FC<DDayBadgeProps> = ({ dateStr, prefix, size = 'md' }) => {
  const { text, days, isUrgent, isPast } = getDDay(dateStr);

  if (text === '-') return null;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (isPast) {
    colorClasses = 'bg-slate-100 text-slate-400 border-slate-200';
  } else if (days === 0) {
    colorClasses = 'bg-rose-50 text-rose-600 border-rose-200 font-bold animate-pulse';
  } else if (days <= 3) {
    colorClasses = 'bg-rose-50 text-rose-600 border-rose-200 font-bold';
  } else if (days <= 7) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
  } else if (days <= 14) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-md border',
    md: 'text-xs px-2.5 py-1 rounded-full border',
    lg: 'text-sm px-3 py-1.5 rounded-lg border font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 shrink-0 ${sizeClasses} ${colorClasses}`}>
      {prefix && <span className="opacity-75">{prefix}</span>}
      <span>{text}</span>
    </span>
  );
};
