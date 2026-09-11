import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Application, ApplicationStage } from '../types/index.ts';
import { IconX, IconPlus, IconTrash2 } from './Icons.tsx';

interface ApplicationFormModalProps {
  application?: Application | null;
  onClose: () => void;
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

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  application,
  onClose,
}) => {
  const { addApplication, updateApplication } = useApp();

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<ApplicationStage>('서류접수');
  const [deadline, setDeadline] = useState('');
  const [writtenTestDate, setWrittenTestDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [replyDeadline, setReplyDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);

  const [docInput, setDocInput] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<{ name: string; checked: boolean }[]>([]);

  useEffect(() => {
    if (application) {
      setCompany(application.company || '');
      setPosition(application.position || '');
      setTitle(application.title || '');
      setStage(application.stage || '서류접수');
      setDeadline(application.deadline || '');
      setWrittenTestDate(application.writtenTestDate || '');
      setInterviewDate(application.interviewDate || '');
      setReplyDeadline(application.replyDeadline || '');
      setLocation(application.location || '');
      setMemo(application.memo || '');
      setSubjects(application.subjects || []);
      setRequiredDocuments(application.requiredDocuments || []);
    } else {
      setCompany('');
      setPosition('');
      setTitle('');
      setStage('서류접수');
      setDeadline('');
      setWrittenTestDate('');
      setInterviewDate('');
      setReplyDeadline('');
      setLocation('');
      setMemo('');
      setSubjects([]);
      setRequiredDocuments([
        { name: '이력서 및 자기소개서', checked: false },
        { name: '포트폴리오', checked: false },
        { name: '어학 성적 증명서', checked: false },
      ]);
    }
  }, [application]);

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput('');
    }
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleAddDoc = () => {
    if (docInput.trim()) {
      setRequiredDocuments([...requiredDocuments, { name: docInput.trim(), checked: false }]);
      setDocInput('');
    }
  };

  const handleRemoveDoc = (idx: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      alert('회사명을 입력해 주세요.');
      return;
    }
    if (!position.trim()) {
      alert('지원 직무를 입력해 주세요.');
      return;
    }

    if (application) {
      updateApplication(application.id, {
        company: company.trim(),
        position: position.trim(),
        title: title.trim() || `${company.trim()} ${position.trim()} 채용`,
        stage,
        deadline,
        writtenTestDate,
        interviewDate,
        replyDeadline,
        location: location.trim(),
        memo: memo.trim(),
        subjects,
        requiredDocuments,
      });
    } else {
      addApplication({
        company: company.trim(),
        position: position.trim(),
        title: title.trim() || `${company.trim()} ${position.trim()} 채용`,
        stage,
        deadline,
        writtenTestDate,
        interviewDate,
        replyDeadline,
        location: location.trim(),
        memo: memo.trim(),
        subjects,
        requiredDocuments,
        priority: 'high',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {application ? '지원 공고 수정' : '새 지원 공고 등록'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              회사의 지원 마감일과 전형 일정을 등록해 D-Day와 일정 알림을 받으세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Company & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                회사명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="예: 네이버, 현대자동차, 카카오"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                지원 직무 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="예: 백엔드 개발자, SW 엔지니어"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Title & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">공고 제목 (선택)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 2026 하반기 신입 공개채용"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">현재 전형 단계</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as ApplicationStage)}
                className="w-full text-sm px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                {STAGES.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Schedule Dates */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">주요 전형 일정</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">서류 마감일</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">필기/코딩테스트</label>
                <input
                  type="date"
                  value={writtenTestDate}
                  onChange={e => setWrittenTestDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">면접 전형일</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Location & Reply deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">근무지 / 면접 장소</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="예: 서울 강남구 / 판교 테크노밸리"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">합격 회신 마감일</label>
              <input
                type="date"
                value={replyDeadline}
                onChange={e => setReplyDeadline(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">제출 필수 서류</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={docInput}
                onChange={e => setDocInput(e.target.value)}
                placeholder="예: 포트폴리오, 공인어학성적표, 졸업증명서"
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDoc();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <IconPlus className="w-3.5 h-3.5" />
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requiredDocuments.map((doc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  {doc.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="hover:text-rose-600"
                  >
                    <IconX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes & Memo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">전형 준비 메모 / 핵심 포인트</label>
            <textarea
              rows={3}
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="자기소개서 작성 팁, 코테 출제경향, 면접 예상 질문 등..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs"
            >
              {application ? '변경사항 저장' : '공고 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
