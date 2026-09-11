import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Credential } from '../types/index.ts';
import { DDayBadge } from '../components/DDayBadge.tsx';
import {
  IconAward,
  IconPlus,
  IconTrash2,
  IconClock,
  IconCheckCircle2,
  IconX,
} from '../components/Icons.tsx';

export const CredentialsPage: React.FC = () => {
  const { credentials, addCredential, deleteCredential } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [grade, setGrade] = useState('');
  const [issuer, setIssuer] = useState('');
  const [acquiredDate, setAcquiredDate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [memo, setMemo] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCredential({
      name: name.trim(),
      score: score.trim(),
      grade: grade.trim(),
      issuer: issuer.trim(),
      acquiredDate,
      expiresAt,
      memo: memo.trim(),
    });

    setShowAddModal(false);
    setName('');
    setScore('');
    setGrade('');
    setIssuer('');
    setAcquiredDate('');
    setExpiresAt('');
    setMemo('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <IconAward className="w-5 h-5 text-amber-500" />
            내 자격증 & 어학 성적 관리
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            어학 시험 유효기간(2년) 만료 알림 및 입사 지원 시 기재할 공인 자격증 목록을 보관합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <IconPlus className="w-4 h-4" />
          <span>자격증 / 성적 추가</span>
        </button>
      </div>

      {/* Grid of Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credentials.map(cred => (
          <div
            key={cred.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <IconAward className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{cred.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cred.issuer || '발급기관 미입력'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`[${cred.name}] 항목을 삭제하시겠습니까?`)) {
                      deleteCredential(cred.id);
                    }
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <IconTrash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Score or Grade Highlight */}
              <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">취득 성적 / 등급</span>
                <span className="text-sm font-extrabold text-blue-700">
                  {cred.score || cred.grade || '취득 완료'}
                </span>
              </div>

              {/* Expiration Dates */}
              <div className="space-y-1.5 text-xs text-slate-600">
                {cred.acquiredDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">취득일:</span>
                    <span className="font-medium text-slate-700">{cred.acquiredDate}</span>
                  </div>
                )}
                {cred.expiresAt ? (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">만료일:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">{cred.expiresAt}</span>
                      <DDayBadge dateStr={cred.expiresAt} prefix="만료" size="sm" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-slate-400">유효기간:</span>
                    <span className="font-medium text-emerald-600">영구 유효</span>
                  </div>
                )}
              </div>

              {/* Memo */}
              {cred.memo && (
                <p className="text-xs text-slate-500 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60 mt-3 leading-relaxed">
                  {cred.memo}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {credentials.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <IconAward className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">등록된 자격증이나 어학 성적이 없습니다.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            토익, 오픽, 기사 자격증을 등록하여 유효기간 만료일을 안전하게 챙기세요.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            자격증 추가
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IconAward className="w-4 h-4 text-amber-500" />
                새 자격증 / 어학 성적 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  자격 / 시험명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="예: TOEIC, OPIc, 정보처리기사, SQLD"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">취득 점수 (선택)</label>
                  <input
                    type="text"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    placeholder="예: 935점, Level 7"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">등급 / 급수 (선택)</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    placeholder="예: AL, 1급, 최종합격"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">발행 기관</label>
                <input
                  type="text"
                  value={issuer}
                  onChange={e => setIssuer(e.target.value)}
                  placeholder="예: 한국산업인력공단, YBM"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">취득일자</label>
                  <input
                    type="date"
                    value={acquiredDate}
                    onChange={e => setAcquiredDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">만료일자 (어학 등)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">메모</label>
                <textarea
                  rows={2}
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="자격증 번호, 가산점 적용 대상 등"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
