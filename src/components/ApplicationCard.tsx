import React from 'react';
import { Application, ApplicationStage } from '../types/index.ts';
import { DDayBadge } from './DDayBadge.tsx';
import { IconMapPin, IconChevronRight, IconCheckCircle2, IconClock } from './Icons.tsx';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  onAdvanceStage?: (e: React.MouseEvent) => void;
}

const STAGE_CONFIG: Record<ApplicationStage, { bg: string; text: string; border: string }> = {
  '서류접수': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '서류합격': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '필기/코딩테스트': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  '1차면접': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '2차/최종면접': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  '최종합격': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  '불합격': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick, onAdvanceStage }) => {
  const stageStyle = STAGE_CONFIG[application.stage] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const completedDocs = application.requiredDocuments.filter(d => d.checked).length;
  const totalDocs = application.requiredDocuments.length;
  const docPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 100;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {application.company.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                {application.company}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{application.position}</p>
            </div>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}>
            {application.stage}
          </span>
        </div>

        {/* Title / Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-2 font-normal leading-relaxed">
          {application.title}
        </p>

        {/* Upcoming Milestones Schedule */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          {application.deadline && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-slate-700">
              <IconClock className="w-3.5 h-3.5 text-slate-400" />
              <span>서류마감 {application.deadline}</span>
              <DDayBadge dateStr={application.deadline} size="sm" />
            </div>
          )}

          {application.writtenTestDate && (
            <div className="flex items-center gap-1.5 bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-100 text-indigo-900">
              <span className="font-semibold">필기/코테 {application.writtenTestDate}</span>
              <DDayBadge dateStr={application.writtenTestDate} size="sm" />
            </div>
          )}

          {application.interviewDate && (
            <div className="flex items-center gap-1.5 bg-purple-50/70 px-2.5 py-1 rounded-lg border border-purple-100 text-purple-900">
              <span className="font-semibold">면접일 {application.interviewDate}</span>
              <DDayBadge dateStr={application.interviewDate} size="sm" />
            </div>
          )}

          {application.location && (
            <div className="flex items-center gap-1 text-slate-400 text-[11px] px-1">
              <IconMapPin className="w-3 h-3" />
              <span>{application.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Document Progress & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {totalDocs > 0 ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <IconCheckCircle2 className={`w-3.5 h-3.5 ${completedDocs === totalDocs ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>서류 준비 {completedDocs}/{totalDocs} ({docPercent}%)</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">등록된 필수 서류 없음</div>
        )}

        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
          <span>상세보기</span>
          <IconChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
