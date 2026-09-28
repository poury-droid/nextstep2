import React from 'react';
import {
  SKILL_LEVELS,
  SKILL_STYLE,
  STUDY_STAGES,
  AMOUNT_UNITS,
  type SubjectAmounts,
  subjectShares,
  type SkillLevel,
  type StudyStage,
} from '../utils/studyScheduler.ts';

/** 진행할 학습 단계 선택 (여러 개 선택, 최소 1개) */
export const StudyStagePicker: React.FC<{ value: StudyStage[]; onChange: (stages: StudyStage[]) => void }> = ({
  value,
  onChange,
}) => {
  const toggle = (id: StudyStage) => {
    const next = value.includes(id) ? value.filter(s => s !== id) : [...value, id];
    if (next.length === 0) return; // 최소 1개는 선택
    onChange(STUDY_STAGES.map(s => s.id).filter(s => next.includes(s)));
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">어떤 공부를 할까요? (여러 개 선택)</label>
      <div className="grid grid-cols-3 gap-2">
        {STUDY_STAGES.map(stage => {
          const on = value.includes(stage.id);
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => toggle(stage.id)}
              aria-pressed={on}
              className={`text-left px-3 py-2 rounded-xl border transition-colors ${
                on
                  ? 'bg-purple-50 border-purple-400 text-purple-800'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] leading-none ${
                    on ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {on ? '✓' : ''}
                </span>
                {stage.label}
              </span>
              <span className="block text-[10px] mt-0.5 opacity-80">{stage.desc}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5">
        고른 순서대로 기간을 나눠 진행하고, 시험 전날은 총정리로 마무리해요.
      </p>
    </div>
  );
};

interface SubjectLevelPickerProps {
  /** 쉼표로 구분된 과목 이름 목록에서 파싱한 이름들 */
  names: string[];
  levels: Record<string, SkillLevel>;
  onChange: (levels: Record<string, SkillLevel>) => void;
  /** 선택한 학습 단계 (분량 입력칸을 이 단계만 보여줌) */
  stages?: StudyStage[];
  amounts?: Record<string, SubjectAmounts>;
  onAmountsChange?: (amounts: Record<string, SubjectAmounts>) => void;
}

/** 과목별 "내 실력" 선택 + 단계별 분량 입력 + 예상 시간 비율 미리보기 */
export const SubjectLevelPicker: React.FC<SubjectLevelPickerProps> = ({
  names,
  levels,
  onChange,
  stages = [],
  amounts = {},
  onAmountsChange,
}) => {
  if (names.length === 0) return null;

  const shares = subjectShares(names.map(name => ({ name, currentLevel: levels[name] || '보통' })));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">과목별 실력 · 분량</span>
        <span className="text-[11px] text-slate-500">약한 과목에 시간을 더 배정해요</span>
      </div>
      {onAmountsChange && stages.length > 0 && (
        <p className="text-[11px] text-slate-500 -mt-1">
          분량을 적으면 그만큼 나눠서 "기출 1~2회차"처럼 배정해요. 비워 두면 자동 과제로 채워요.
        </p>
      )}

      <div className="space-y-1.5">
        {names.map(name => {
          const current = levels[name] || '보통';
          return (
            <div key={name} className="bg-white rounded-lg border border-slate-200 px-2.5 py-1.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex-1 min-w-0 text-xs font-semibold text-slate-800 truncate" title={name}>
                {name}
              </span>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 shrink-0">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ ...levels, [name]: level })}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors border ${
                      current === level ? SKILL_STYLE[level] : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <span className="w-10 text-right text-[11px] font-bold text-slate-500 shrink-0">
                {shares[name]}%
              </span>
            </div>

            {onAmountsChange && stages.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-0.5">
                {stages.map(stage => {
                  const units = AMOUNT_UNITS[stage];
                  const value = amounts[name]?.[stage];
                  const setValue = (next: { total?: number; unit?: string }) => {
                    const prev = amounts[name] || {};
                    const total = next.total !== undefined ? next.total : value?.total ?? 0;
                    const unit = next.unit || value?.unit || units[0];
                    onAmountsChange({ ...amounts, [name]: { ...prev, [stage]: { total, unit } } });
                  };
                  const label = STUDY_STAGES.find(s => s.id === stage)?.label ?? stage;
                  return (
                    <label key={stage} className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <span className="font-semibold">{label}</span>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="-"
                        value={value?.total ? value.total : ''}
                        onChange={e => setValue({ total: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                        className="w-12 px-1.5 py-0.5 text-[11px] text-right border border-slate-200 rounded-md focus:border-purple-400 outline-hidden"
                      />
                      {units.length > 1 ? (
                        <select
                          value={value?.unit || units[0]}
                          onChange={e => setValue({ unit: e.target.value })}
                          className="px-1 py-0.5 text-[11px] border border-slate-200 rounded-md bg-white"
                        >
                          {units.map(u => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{units[0]}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** "A, B, C" → ['A','B','C'] (중복 제거) */
export function parseSubjectNames(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    ),
  );
}
