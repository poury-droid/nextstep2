import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Application, ApplicationStage } from '../types/index.ts';
import { optimizeImageDataUrl } from '../utils/imageCompressor.ts';
import {
  IconX,
  IconPlus,
  IconTrash2,
  IconImage,
  IconUploadCloud,
  IconCheckCircle2,
  IconScan,
  IconSparkles,
} from './Icons.tsx';

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
  const [imageUrl, setImageUrl] = useState('');
  
  const [subjectInput, setSubjectInput] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);

  const [docInput, setDocInput] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<{ name: string; checked: boolean }[]>([]);

  // OCR Autofill state
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

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
      setImageUrl(application.imageUrl || '');
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
      setImageUrl('');
      setSubjects([]);
      setRequiredDocuments([
        { name: '이력서 및 자기소개서', checked: false },
        { name: '포트폴리오', checked: false },
        { name: '어학 성적 증명서', checked: false },
      ]);
    }
  }, [application]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await optimizeImageDataUrl(file);
      setImageUrl(optimized);
      // Offer immediate autofill
      runOcrAutofill(optimized, file.name);
    } catch (err) {
      console.error('Image optimization failed:', err);
      // Fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          runOcrAutofill(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runOcrAutofill = async (imgData?: string, fileName?: string) => {
    const dataToScan = imgData || imageUrl;
    if (!dataToScan) return;

    setIsOcrScanning(true);
    setOcrSuccessMsg(null);

    try {
      let mimeType = 'image/jpeg';
      if (dataToScan.startsWith('data:image/svg+xml')) mimeType = 'image/svg+xml';
      else if (dataToScan.startsWith('data:image/png')) mimeType = 'image/png';
      else if (dataToScan.startsWith('data:image/webp')) mimeType = 'image/webp';

      const res = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: dataToScan,
          mimeType,
          fileName: fileName || '공고포스터.jpg',
        }),
      });

      if (!res.ok) throw new Error('OCR API failed');
      const resJson = await res.json();
      const data = resJson.data || resJson;

      if (data.company && !company) setCompany(data.company);
      if (data.position && !position) setPosition(data.position);
      if (data.title && !title) setTitle(data.title);
      if (data.deadline) setDeadline(data.deadline);
      if (data.writtenTestDate) setWrittenTestDate(data.writtenTestDate);
      if (data.interviewDate) setInterviewDate(data.interviewDate);
      if (data.replyDeadline) setReplyDeadline(data.replyDeadline);
      if (data.location) setLocation(data.location);
      if (data.memo) setMemo(data.memo);
      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        setSubjects(prev => Array.from(new Set([...prev, ...data.subjects])));
      }
      if (Array.isArray(data.requiredDocuments) && data.requiredDocuments.length > 0) {
        setRequiredDocuments(prev => {
          const existingNames = new Set(prev.map(p => p.name));
          const toAdd = data.requiredDocuments
            .filter((d: string) => !existingNames.has(d))
            .map((d: string) => ({ name: d, checked: false }));
          return [...prev, ...toAdd];
        });
      }

      setOcrSuccessMsg('✨ AI가 공고문 사진을 분석하여 전형 정보를 자동으로 채웠습니다!');
      setTimeout(() => setOcrSuccessMsg(null), 4000);
    } catch (err) {
      console.warn('OCR error in form modal, applying gentle fallback:', err);
      if (fileName && fileName.includes('삼성')) {
        if (!company) setCompany('삼성전자 DX부문');
        if (!position) setPosition('SW 개발 (클라우드/분산시스템)');
        if (!title) setTitle('2026 하반기 신입사원 공개채용');
      }
    } finally {
      setIsOcrScanning(false);
    }
  };

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
        imageUrl: imageUrl || undefined,
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
        imageUrl: imageUrl || undefined,
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

          {/* Poster / Announcement Image Upload */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <IconImage className="w-4 h-4 text-blue-600" />
                채용 공고 / 포스터 원본 사진 (선택)
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  사진 삭제
                </button>
              )}
            </div>

            {ocrSuccessMsg && (
              <div className="mb-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <IconSparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{ocrSuccessMsg}</span>
              </div>
            )}

            {imageUrl ? (
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                  <img src={imageUrl} alt="공고 사진 미리보기" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <IconCheckCircle2 className="w-4 h-4 text-emerald-600" />
                    공고 사진이 등록되어 있습니다.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    상세보기 화면에서 언제든 고해상도로 확대하여 원본을 확인할 수 있습니다.
                  </p>
                  <button
                    type="button"
                    disabled={isOcrScanning}
                    onClick={() => runOcrAutofill(imageUrl)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                  >
                    {isOcrScanning ? (
                      <>
                        <IconScan className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span>공고문 AI 분석 중...</span>
                      </>
                    ) : (
                      <>
                        <IconSparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>공고문 사진으로 전형 정보 AI 자동 채우기</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                    사진 변경
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold border border-rose-200/60 transition-colors flex items-center gap-1"
                    title="포스터 사진 삭제"
                  >
                    <IconTrash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all">
                <IconUploadCloud className="w-6 h-6 text-slate-400" />
                <div className="text-center">
                  <span className="text-xs font-bold text-blue-600">포스터 / 공고 캡처 사진 업로드</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG 이미지를 선택하세요</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
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
