import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { getFutureDateString } from '../utils/date.ts';
import {
  IconFileSearch,
  IconUploadCloud,
  IconSparkles,
  IconCheckCircle2,
  IconPlus,
  IconAlertCircle,
  IconBookOpen,
} from '../components/Icons.tsx';

interface ExtractedData {
  company: string;
  position: string;
  title: string;
  deadline: string;
  writtenTestDate: string;
  interviewDate: string;
  replyDeadline: string;
  location: string;
  subjects: string[];
  requiredDocuments: string[];
  memo: string;
  analysisSummary?: string;
}

interface SampleDoc {
  name: string;
  type: string;
  description: string;
  textPayload: string;
}

const SAMPLE_DOCS: SampleDoc[] = [
  {
    name: '네이버클라우드 2026 Tech 신입 공채 요강',
    type: '공채 모집요강 텍스트',
    description: '분산 스토리지 / 인프라 SW 개발자 전형',
    textPayload: `[네이버클라우드] 2026 Tech 신입 개발자 공개채용
모집 부문: 분산 스토리지 및 클라우드 플랫폼 인프라 SW 엔지니어
지원 접수 기간: 2026년 9월 18일(금) 18:00까지
근무지: 경기 성남시 분당구 1784 사옥
전형 절차:
1. 서류 전형 (입사지원서, 포트폴리오 PDF, 성적증명서 제출)
2. 1차 온라인 코딩테스트 및 CS 필기: 2026년 9월 25일(금) 예정 (알고리즘, 네트워크, 리눅스 커널 기초)
3. 2차 기술 심층 면접: 2026년 10월 12일(월)
4. 최종 합격자 발표: 2026년 10월 30일
우대사항: 대규모 트래픽 분산 시스템 설계 경험, 오픈소스 기여 경험자`,
  },
  {
    name: '현대자동차 R&D본부 SW 연구개발 채용',
    type: '채용 공고문 텍스트',
    description: '자율주행 인포테인먼트 및 센서퓨전 연구원',
    textPayload: `[현대자동차] R&D본부 자율주행 SW부문 채용 공고
모집 직무: 자율주행 센서퓨전 알고리즘 개발 연구원
지원서 접수 마감일: 2026년 9월 15일 17시 마감
전형 일정:
- 서류 심사 합격자 발표 후 Softeer 역량테스트(코딩테스트 C++/Python 및 알고리즘): 2026년 9월 22일 시행
- 직무 기술면접 및 임원면접: 2026년 10월 8일 예정
- 근무 장소: 남양 R&D 연구센터 (경기 화성)
제출 필수 서류: 현대자동차 채용포털 자기소개서, 공인 어학성적표(OPIc/TOEIC), 최종학위 증명서
우대사항: ROS2 기반 로보틱스 프로젝트 경험, 칼만필터 센서 융합 프로젝트`,
  },
  {
    name: '토스 커뮤니티 서버 플랫폼 엔지니어',
    type: '상시 채용 공고',
    description: '토스뱅크 코어 뱅킹 서버 엔지니어',
    textPayload: `[Viva Republica / 토스뱅크] Core Banking Server Engineer 상시 채용
직무: 코어 뱅킹 서버 플랫폼 엔지니어 (수신/여신/트랜잭션)
서류 접수: 2026년 9월 28일 마감
과제 전형(직무 과제 및 코딩테스트): 2026년 10월 5일 실시 (Java/Kotlin, Spring Boot, 분산 트랜잭션 무결성)
직무 인터뷰 및 컬처핏 면접: 2026년 10월 19일 예정
근무지: 서울 강남구 테헤란로 142 아크플레이스
필수 제출 서류: 자유 양식 이력서(PDF), 경력 및 프로젝트 기술서, 깃허브 링크`,
  },
];

export const DocumentAnalyzerPage: React.FC = () => {
  const { addApplication, setCurrentTab } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'samples'>('upload');
  const [inputText, setInputText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Default extracted preview data
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    company: '네이버클라우드',
    position: '분산 스토리지 / 인프라 SW 개발자',
    title: '2026 네이버클라우드 Tech 신입 공채',
    deadline: getFutureDateString(5),
    writtenTestDate: getFutureDateString(12),
    interviewDate: getFutureDateString(26),
    replyDeadline: getFutureDateString(32),
    location: '경기 성남시 분당구 정자사옥 (1784)',
    subjects: ['알고리즘 코딩테스트', '리눅스 커널 기초', '네트워크 소켓 프로그래밍'],
    requiredDocuments: ['온라인 입사지원서', '포트폴리오 (자유양식 PDF)', '성적증명서'],
    memo: '대규모 분산 환경 트래픽 처리 경험 우대, 1차 온라인 코딩테스트 및 CS 기본기 철저 대비 필요.',
    analysisSummary: 'Gemini AI가 서류 마감 및 코딩테스트/면접 일정을 자동으로 파싱했습니다.',
  });

  // Call the real backend Gemini API endpoint
  const executeAnalysis = async (payload: {
    text?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setIsSaved(false);
    setStatusStep('문서 데이터 및 채용 정보를 전송 중입니다...');

    try {
      setStatusStep('Gemini 3.8 Flash AI 모델이 채용 요강을 분석하고 있습니다...');

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `서버 응답 오류 (HTTP ${response.status})`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'AI 분석 결과 데이터를 받아오지 못했습니다.');
      }

      setStatusStep('전형 일정 및 서류 체크리스트 구조화 완료!');
      setAiSource(result.source);
      setExtractedData({
        company: result.data.company || '지원 기업',
        position: result.data.position || '모집 직무',
        title: result.data.title || `${result.data.company || ''} 채용 공고`,
        deadline: result.data.deadline || '',
        writtenTestDate: result.data.writtenTestDate || '',
        interviewDate: result.data.interviewDate || '',
        replyDeadline: result.data.replyDeadline || '',
        location: result.data.location || '',
        subjects: Array.isArray(result.data.subjects) ? result.data.subjects : [],
        requiredDocuments: Array.isArray(result.data.requiredDocuments) ? result.data.requiredDocuments : [],
        memo: result.data.memo || '',
        analysisSummary: result.data.analysisSummary || '채용 정보 분석이 완료되었습니다.',
      });
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setErrorMessage(err.message || 'AI 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle actual file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result as string;
      await executeAnalysis({
        fileName: file.name,
        fileBase64: base64Data,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
        text: inputText || undefined,
      });
    };

    reader.onerror = () => {
      setErrorMessage('파일을 읽는 중 오류가 발생했습니다.');
    };

    reader.readAsDataURL(file);
  };

  // Handle raw text submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      alert('분석할 채용 공고 텍스트를 입력해 주세요.');
      return;
    }

    await executeAnalysis({
      text: inputText.trim(),
      fileName: '직접 입력한 채용 공고',
    });
  };

  // Handle sample selection
  const handleSampleSelect = async (sample: SampleDoc) => {
    setSelectedFileName(sample.name);
    setInputText(sample.textPayload);
    await executeAnalysis({
      text: sample.textPayload,
      fileName: sample.name,
    });
  };

  // Save parsed data directly to applications
  const handleSaveToApplications = () => {
    addApplication({
      company: extractedData.company.trim() || '지원 대상 회사',
      position: extractedData.position.trim() || '소프트웨어 개발',
      title: extractedData.title.trim() || `${extractedData.company} 채용`,
      stage: '서류접수',
      deadline: extractedData.deadline,
      writtenTestDate: extractedData.writtenTestDate,
      interviewDate: extractedData.interviewDate,
      replyDeadline: extractedData.replyDeadline,
      location: extractedData.location,
      subjects: extractedData.subjects,
      requiredDocuments: extractedData.requiredDocuments.map(name => ({ name, checked: false })),
      memo: extractedData.memo,
      priority: 'high',
    });

    setIsSaved(true);
    setTimeout(() => {
      setCurrentTab('applications');
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 flex items-center gap-1.5">
                <IconSparkles className="w-3.5 h-3.5" />
                Gemini 3.8 Flash 기반 채용 문서 AI 분석기
              </span>
              {aiSource === 'gemini-3.8-flash' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Gemini 실시간 연동 완료
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              채용 공고 PDF, 이미지, 텍스트를 넣으면 AI가 핵심 일정을 자동 추출합니다
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
              복잡한 모집 요강을 일일이 읽지 않아도 서류 마감일, 코딩테스트/필기시험 날짜, 면접 일정, 시험 과목, 제출 필수 서류를 자동으로 파악합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Input Modes (Upload, Text Paste, Samples) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                파일 업로드 (PDF/이미지)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'text'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                공고 텍스트 붙여넣기
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('samples')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'samples'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                예시 공고
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div className="relative border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-indigo-50/20 group">
                  <input
                    type="file"
                    id="doc-file-upload"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isAnalyzing}
                  />
                  <label
                    htmlFor="doc-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2.5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconUploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 block">
                        채용 공고 파일 선택 또는 드래그
                      </span>
                      <span className="text-xs text-slate-400 mt-1 block">
                        PDF 파일 또는 캡처 이미지 (PNG, JPG, WebP)
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                      <IconSparkles className="w-3.5 h-3.5" />
                      파일 선택하여 AI 분석
                    </span>
                  </label>
                </div>

                {selectedFileName && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-700 truncate">{selectedFileName}</span>
                    <span className="text-slate-400 shrink-0">선택됨</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Text Paste */}
            {activeTab === 'text' && (
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="사람인, 원티드, 잡코리아 또는 기업 채용 페이지에서 복사한 공고문 텍스트를 여기에 그대로 붙여넣으세요..."
                  className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <IconSparkles className="w-4 h-4" />
                  <span>Gemini AI 공고 텍스트 분석 시작</span>
                </button>
              </form>
            )}

            {/* Tab 3: Sample Announcements */}
            {activeTab === 'samples' && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-500 mb-2">
                  클릭하면 실제 대기업/테크 채용 요강 텍스트를 Gemini AI로 즉시 분석합니다.
                </p>
                {SAMPLE_DOCS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => handleSampleSelect(sample)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{sample.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sample.description}</div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 shrink-0">분석 실행 &rarr;</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">분석 실패</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Extracted Output & 1-Click Registration */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IconFileSearch className="w-5 h-5 text-blue-600" />
                  AI 분석 결과 및 추출 정보
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  추출된 내용을 확인하고 필요한 경우 직접 수정한 뒤 지원 공고로 바로 등록하세요.
                </p>
              </div>

              {isAnalyzing && (
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  AI 분석 중
                </span>
              )}
            </div>

            {isAnalyzing ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{statusStep}</p>
                  <p className="text-xs text-slate-400">Gemini 3.8 Flash가 채용 일정과 자격 요건을 파싱하고 있습니다.</p>
                </div>
              </div>
            ) : (
              <>
                {/* AI Summary Banner */}
                {extractedData.analysisSummary && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                    <IconSparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 font-medium leading-relaxed">
                      <span className="font-bold">AI 총평: </span>
                      {extractedData.analysisSummary}
                    </p>
                  </div>
                )}

                {/* Company & Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      회사명
                    </label>
                    <input
                      type="text"
                      value={extractedData.company}
                      onChange={e => setExtractedData({ ...extractedData, company: e.target.value })}
                      className="w-full text-sm font-bold px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      지원 직무
                    </label>
                    <input
                      type="text"
                      value={extractedData.position}
                      onChange={e => setExtractedData({ ...extractedData, position: e.target.value })}
                      className="w-full text-sm font-bold px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Key Dates Extracted */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    자동 인식된 주요 전형 일정
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block mb-1">서류 마감일</span>
                      <input
                        type="date"
                        value={extractedData.deadline}
                        onChange={e => setExtractedData({ ...extractedData, deadline: e.target.value })}
                        className="w-full text-xs font-bold text-slate-800 focus:outline-hidden"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <span className="text-[11px] text-indigo-600 font-semibold block mb-1">필기/코딩테스트</span>
                      <input
                        type="date"
                        value={extractedData.writtenTestDate}
                        onChange={e => setExtractedData({ ...extractedData, writtenTestDate: e.target.value })}
                        className="w-full text-xs font-bold text-indigo-900 focus:outline-hidden"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-purple-100">
                      <span className="text-[11px] text-purple-600 font-semibold block mb-1">면접 전형일</span>
                      <input
                        type="date"
                        value={extractedData.interviewDate}
                        onChange={e => setExtractedData({ ...extractedData, interviewDate: e.target.value })}
                        className="w-full text-xs font-bold text-purple-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Subjects Extracted */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    필기/코딩테스트 평가 과목 및 필요 역량
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.subjects.map((subj, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold"
                      >
                        <IconBookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        {subj}
                      </span>
                    ))}
                    {extractedData.subjects.length === 0 && (
                      <span className="text-xs text-slate-400">추출된 시험 과목 없음</span>
                    )}
                  </div>
                </div>

                {/* Required Documents Extracted */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    필수 제출 서류 목록
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.requiredDocuments.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                      >
                        <IconCheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {doc}
                      </span>
                    ))}
                    {extractedData.requiredDocuments.length === 0 && (
                      <span className="text-xs text-slate-400">추출된 필수 서류 없음</span>
                    )}
                  </div>
                </div>

                {/* Location & Memo */}
                <div className="space-y-3">
                  {extractedData.location && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        근무지 / 면접 장소
                      </label>
                      <input
                        type="text"
                        value={extractedData.location}
                        onChange={e => setExtractedData({ ...extractedData, location: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      전형 핵심 요약 및 준비 팁
                    </label>
                    <textarea
                      rows={3}
                      value={extractedData.memo}
                      onChange={e => setExtractedData({ ...extractedData, memo: e.target.value })}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl leading-relaxed"
                    />
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    등록 시 공고 목록 및 캘린더 D-Day에 즉시 반영됩니다.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveToApplications}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    {isSaved ? (
                      <>
                        <IconCheckCircle2 className="w-4 h-4" />
                        지원 공고로 등록 완료!
                      </>
                    ) : (
                      <>
                        <IconPlus className="w-4 h-4" />
                        지원 공고로 즉시 등록
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
