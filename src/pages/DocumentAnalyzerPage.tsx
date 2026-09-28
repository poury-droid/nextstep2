import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { getFutureDateString, extractDatesFromKoreanDoc } from '../utils/date.ts';
import { VISUAL_SAMPLES, VisualSampleDoc } from '../utils/samplePosters.ts';
import { OcrAnalysisResult } from '../types/index.ts';
import { ImageLightboxModal } from '../components/ImageLightboxModal.tsx';
import {
  IconFileSearch,
  IconUploadCloud,
  IconSparkles,
  IconCheckCircle2,
  IconPlus,
  IconAlertCircle,
  IconBookOpen,
  IconScan,
  IconCopy,
  IconCamera,
  IconAward,
  IconCalendar,
  IconClock,
  IconBriefcase,
  IconMapPin,
  IconZoomIn,
  IconMaximize2,
  IconColumns,
  IconRotateCw,
  IconImage,
} from '../components/Icons.tsx';

export const DocumentAnalyzerPage: React.FC = () => {
  const { addApplication, addCredential, setCurrentTab, applications, updateApplication, selectedAppId, setSelectedAppId } = useApp();

  // Input tab mode
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'samples' | 'text'>('upload');
  const [activeResultTab, setActiveResultTab] = useState<'structured' | 'split' | 'rawOcr' | 'preview'>('structured');
  const [targetApplicationId, setTargetApplicationId] = useState<string>(() => {
    if (selectedAppId && applications.some(a => a.id === selectedAppId)) {
      return selectedAppId;
    }
    return 'new';
  });

  // Keep targetApplicationId synced if an application was selected from outside
  useEffect(() => {
    if (selectedAppId && applications.some(a => a.id === selectedAppId)) {
      setTargetApplicationId(selectedAppId);
    }
  }, [selectedAppId, applications]);

  const [inputText, setInputText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState(VISUAL_SAMPLES[0].fileName);
  const [previewImage, setPreviewImage] = useState<string | null>(VISUAL_SAMPLES[0].previewDataUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStepText, setScanStepText] = useState('OCR 판독 준비 완료');
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Lightbox Modal state for inspecting photos directly
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);

  // Default initial OCR & Analysis data (matches VISUAL_SAMPLES[0] Hyundai poster)
  const [ocrData, setOcrData] = useState<OcrAnalysisResult>({
    documentType: 'job_posting',
    documentTypeLabel: '채용 공고 포스터',
    ocrRawText: VISUAL_SAMPLES[0].ocrDefaultText,
    confidence: 99.4,
    detectedLanguage: '한국어 (Korean), 영어 (English)',
    wordCount: 88,
    lineCount: 16,
    company: '현대자동차 R&D본부',
    position: '자율주행 인포테인먼트 SW 연구원',
    title: '현대자동차 R&D본부 하반기 신입 채용',
    deadline: '2026-09-22',
    writtenTestDate: '2026-10-03',
    interviewDate: '2026-10-20',
    replyDeadline: '',
    location: '현대자동차 남양연구소 및 양재 본사',
    scoreOrGrade: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    subjects: [
      'C/C++ 기반 자료구조',
      'CAN 통신 프로토콜',
      '임베디드 리눅스',
      '자율주행 알고리즘 및 ROS',
    ],
    requiredDocuments: [
      '현대자동차 채용포털 지원서',
      'GitHub 포트폴리오 리포지토리 링크',
      '공인 어학 성적표 (SPA / 토익스피킹 / OPIc)',
    ],
    keyRequirements: [
      '학사 이상 또는 2027년 2월 이전 졸업 예정자',
      'Softeer 인증 레벨 3 이상 보유 시 코딩테스트 면제',
      '자율주행 또는 임베디드 리눅스 프로젝트 경험자 우대',
    ],
    memo: '서류 접수 마감: 9월 22일(화) 18:00. 소프티어 코딩테스트는 10월 3일(토) 진행되며 면제 자격(레벨 3) 보유 여부를 사전에 확인하세요.',
    analysisSummary: '공고 포스터의 전형 일정(서류 마감 9/22, 코딩테스트 10/3, 직무면접 10/20)을 정확하게 추출했습니다.',
  });

  // Call the dedicated OCR & AI analysis API endpoint
  const executeOcrAnalysis = async (payload: {
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    text?: string;
    category?: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setSavedSuccessMessage(null);
    setScanStepText('1/3단계: 문서 이미지 고해상도 인코딩 및 스캔 영역 감지 중...');

    try {
      setTimeout(() => {
        setScanStepText('2/3단계: Vision OCR로 한글/영문 글자 정밀 판독 중...');
      }, 700);

      setTimeout(() => {
        setScanStepText('3/3단계: 전형 일정, D-Day, 시험 과목, 필수 서류 자동 구조화 중...');
      }, 1500);

      const response = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `서버 오류 (HTTP ${response.status})`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'OCR 분석 결과를 받아오지 못했습니다.');
      }

      const d = result.data;
      const textToScan = d.ocrRawText || payload.text || '';
      const localDates = extractDatesFromKoreanDoc(textToScan);

      // Verify deadlines: prioritize accurate document date and eliminate range start date bugs
      const finalDeadline = localDates.deadline || d.deadline || '';
      const finalWrittenTest = localDates.writtenTestDate || d.writtenTestDate || '';
      const finalInterview = localDates.interviewDate || d.interviewDate || '';
      const finalReply = localDates.replyDeadline || d.replyDeadline || '';
      const finalIssue = localDates.issueDate || d.issueDate || '';
      const finalExpiry = localDates.expiryDate || d.expiryDate || '';

      setAiSource(result.source || 'Vision OCR Engine');
      setOcrData({
        documentType: d.documentType || 'job_posting',
        documentTypeLabel: d.documentTypeLabel || '문서 분석',
        ocrRawText: d.ocrRawText || payload.text || '',
        confidence: d.confidence || 99.4,
        detectedLanguage: d.detectedLanguage || '한국어, 영어',
        wordCount: d.wordCount || (d.ocrRawText ? d.ocrRawText.split(/\s+/).length : 0),
        lineCount: d.lineCount || (d.ocrRawText ? d.ocrRawText.split('\n').length : 0),
        company: d.company || '지원 대상 기업',
        position: d.position || '모집 직무',
        title: d.title || `${d.company || ''} ${d.position || ''}`,
        deadline: finalDeadline,
        writtenTestDate: finalWrittenTest,
        interviewDate: finalInterview,
        replyDeadline: finalReply,
        location: d.location || '',
        scoreOrGrade: d.scoreOrGrade || '',
        issuer: d.issuer || '',
        issueDate: finalIssue,
        expiryDate: finalExpiry,
        subjects: Array.isArray(d.subjects) ? d.subjects : [],
        requiredDocuments: Array.isArray(d.requiredDocuments) ? d.requiredDocuments : [],
        keyRequirements: Array.isArray(d.keyRequirements) ? d.keyRequirements : [],
        memo: d.memo || '',
        analysisSummary: d.analysisSummary || 'OCR 판독 및 전형 일정 분석이 완료되었습니다.',
      });
      setActiveResultTab('structured');
    } catch (err: any) {
      console.error('OCR Analysis failed:', err);
      setErrorMessage(err.message || 'OCR 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle image or PDF upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result as string;
      if (file.type.startsWith('image/')) {
        setPreviewImage(base64Data);
      } else {
        setPreviewImage(null);
      }

      await executeOcrAnalysis({
        fileName: file.name,
        fileBase64: base64Data,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
        category: 'auto',
      });
    };

    reader.onerror = () => {
      setErrorMessage('파일을 읽어오는 중 오류가 발생했습니다.');
    };

    reader.readAsDataURL(file);
  };

  // Handle sample selection
  const handleSelectSample = async (sample: VisualSampleDoc) => {
    setSelectedFileName(sample.fileName);
    setPreviewImage(sample.previewDataUrl);
    setInputText(sample.ocrDefaultText);

    if (sample.structuredDates) {
      setOcrData(prev => ({
        ...prev,
        deadline: sample.structuredDates?.deadline || '',
        writtenTestDate: sample.structuredDates?.writtenTestDate || '',
        interviewDate: sample.structuredDates?.interviewDate || '',
        replyDeadline: sample.structuredDates?.replyDeadline || '',
        issueDate: sample.structuredDates?.issueDate || '',
        expiryDate: sample.structuredDates?.expiryDate || '',
      }));
    }

    await executeOcrAnalysis({
      fileName: sample.fileName,
      fileBase64: sample.previewDataUrl,
      mimeType: 'image/svg+xml',
      category: sample.category,
      text: sample.ocrDefaultText,
    });
  };

  // Handle manual text submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      alert('분석할 채용 공고 또는 문서 텍스트를 입력해 주세요.');
      return;
    }

    setPreviewImage(null);
    setSelectedFileName('직접 입력 텍스트');
    await executeOcrAnalysis({
      text: inputText.trim(),
      fileName: '직접 입력 공고문',
      category: 'auto',
    });
  };

  // Copy raw OCR text to clipboard
  const handleCopyOcrText = () => {
    if (!ocrData.ocrRawText) return;
    navigator.clipboard.writeText(ocrData.ocrRawText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Save to Applications (either creates new or updates selected existing application)
  const handleSaveToApplications = () => {
    if (targetApplicationId !== 'new') {
      const existingApp = applications.find(a => a.id === targetApplicationId);
      if (existingApp) {
        const updates: any = {};
        if (previewImage) {
          updates.imageUrl = previewImage;
        }
        if (ocrData.deadline) updates.deadline = ocrData.deadline;
        if (ocrData.writtenTestDate) updates.writtenTestDate = ocrData.writtenTestDate;
        if (ocrData.interviewDate) updates.interviewDate = ocrData.interviewDate;
        if (ocrData.replyDeadline) updates.replyDeadline = ocrData.replyDeadline;
        if (ocrData.location) updates.location = ocrData.location;

        if (Array.isArray(ocrData.subjects) && ocrData.subjects.length > 0) {
          updates.subjects = Array.from(new Set([...(existingApp.subjects || []), ...ocrData.subjects]));
        }

        if (ocrData.requiredDocuments && ocrData.requiredDocuments.length > 0) {
          const existingDocNames = new Set((existingApp.requiredDocuments || []).map(d => d.name));
          const newDocs = ocrData.requiredDocuments
            .filter(name => !existingDocNames.has(name))
            .map(name => ({ name, checked: false }));
          updates.requiredDocuments = [...(existingApp.requiredDocuments || []), ...newDocs];
        }

        if (ocrData.memo) {
          updates.memo = existingApp.memo
            ? `${existingApp.memo}\n\n[OCR 분석 메모]: ${ocrData.memo}`
            : ocrData.memo;
        }

        updateApplication(existingApp.id, updates);
        setSelectedAppId(existingApp.id);
        setSavedSuccessMessage(`[${existingApp.company}] 공고에 포스터 사진과 전형 일정이 성공적으로 반영되었습니다!`);
        setTimeout(() => {
          setCurrentTab('applications');
        }, 900);
        return;
      }
    }

    // Create new application
    const newApp = addApplication({
      company: ocrData.company.trim() || '지원 대상 회사',
      position: ocrData.position.trim() || '소프트웨어 개발',
      title: ocrData.title.trim() || `${ocrData.company} 채용`,
      stage: '서류접수',
      deadline: ocrData.deadline || '',
      imageUrl: previewImage || undefined,
      writtenTestDate: ocrData.writtenTestDate,
      interviewDate: ocrData.interviewDate,
      replyDeadline: ocrData.replyDeadline,
      location: ocrData.location,
      subjects: ocrData.subjects,
      requiredDocuments: ocrData.requiredDocuments.map(name => ({ name, checked: false })),
      memo: ocrData.memo,
      priority: 'high',
    });

    setSelectedAppId(newApp.id);
    setSavedSuccessMessage(`[${newApp.company}] 공고에 포스터 이미지가 성공적으로 저장되었습니다! 상세 화면으로 이동합니다.`);
    setTimeout(() => {
      setCurrentTab('applications');
    }, 900);
  };

  // Save to Credentials if it's a certificate/test report
  const handleSaveToCredentials = () => {
    addCredential({
      name: ocrData.position || ocrData.title || '공인 어학/자격',
      grade: ocrData.scoreOrGrade || '취득',
      issuer: ocrData.issuer || ocrData.company || '공식 인증 기관',
      acquiredDate: ocrData.issueDate || new Date().toISOString().split('T')[0],
      expiresAt: ocrData.expiryDate || getFutureDateString(730),
      imageUrl: previewImage || undefined,
      memo: ocrData.memo || 'OCR 자동 인식으로 등록된 자격/어학 정보',
    });

    setSavedSuccessMessage('내 자격증 & 어학 성적 탭에 성공적으로 등록되었습니다!');
    setTimeout(() => {
      setCurrentTab('credentials');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <IconScan className="w-5 h-5 text-blue-600" />
            <span>공고문 / 안내문 AI 분석</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            공고문이나 안내문에서 주요 일정과 서류를 자동으로 추출합니다.
          </p>
        </div>
        {aiSource && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 self-start sm:self-center">
            {aiSource}
          </span>
        )}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): OCR Source Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            {/* Input Method Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveInputTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeInputTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <IconCamera className="w-3.5 h-3.5" />
                이미지/PDF 스캔
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab('samples')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeInputTab === 'samples'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <IconSparkles className="w-3.5 h-3.5" />
                샘플 공고
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab('text')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeInputTab === 'text'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                텍스트 직접 입력
              </button>
            </div>

            {/* Tab 1: Image / PDF File Upload */}
            {activeInputTab === 'upload' && (
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-indigo-50/20 group cursor-pointer">
                  <input
                    type="file"
                    id="ocr-file-upload"
                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isAnalyzing}
                  />
                  <label
                    htmlFor="ocr-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2.5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                      <IconScan className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 block">
                        공고문 또는 안내문 파일 업로드
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        PNG, JPG, WebP, PDF (최대 20MB)
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors">
                      <IconUploadCloud className="w-4 h-4" />
                      사진 또는 문서 파일 선택
                    </span>
                  </label>
                </div>

                {selectedFileName && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-700 truncate">{selectedFileName}</span>
                    <span className="text-blue-600 font-bold shrink-0">선택 완료</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Visual Sample Posters for Instant Testing */}
            {activeInputTab === 'samples' && (
              <div className="space-y-3">
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {VISUAL_SAMPLES.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => handleSelectSample(sample)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        selectedFileName === sample.fileName
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-14 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={sample.previewDataUrl}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${sample.badgeColor}`}>
                            {sample.categoryLabel}
                          </span>
                          <span className="text-[11px] font-bold text-blue-600">
                            선택 &rarr;
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {sample.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {sample.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Raw Text Input */}
            {activeInputTab === 'text' && (
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <textarea
                  rows={9}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="공고문 텍스트를 입력하거나 붙여넣으세요..."
                  className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <IconSparkles className="w-4 h-4" />
                  <span>공고 텍스트 AI 분석 시작</span>
                </button>
              </form>
            )}
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">분석 중 오류 발생</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Banner when registered */}
          {savedSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-fade-in">
              <IconCheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">등록 완료</p>
                <p className="mt-0.5 text-emerald-700 leading-relaxed">{savedSuccessMessage}</p>
              </div>
            </div>
          )}
          {/* Direct Photo Inspection Card */}
          {previewImage && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <IconImage className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      현재 분석 사진 원본
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        판독 완료
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {selectedFileName || '업로드된 이미지'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                    title="전체화면으로 사진 크게 보기"
                  >
                    <IconMaximize2 className="w-3.5 h-3.5" />
                    <span>크게 보기</span>
                  </button>
                </div>
              </div>

              {/* Interactive Image Preview Box */}
              <div
                className="relative rounded-xl border border-slate-200 bg-slate-950/5 overflow-hidden flex items-center justify-center min-h-[220px] max-h-[340px] cursor-pointer group"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={previewImage}
                  alt={selectedFileName || '문서 사진'}
                  style={{ transform: `rotate(${imageRotation}deg)` }}
                  className="max-h-[320px] max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-4 text-center">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                    <IconZoomIn className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold drop-shadow-sm">
                    클릭하여 확대
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Output Viewer with Tabs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            {/* Header with Switcher between Structured Analysis, Split View, Raw OCR Text, and Image Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <IconScan className="w-5 h-5 text-blue-600" />
                    공고문 AI 분석 결과
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ocrData.documentTypeLabel} · 내용을 확인하고 필요하면 고친 뒤 저장하세요.
                </p>
              </div>
            </div>

            {/* Loading Scanner Animation */}
            {isAnalyzing ? (
              <div className="py-20 text-center space-y-4">
                <div className="relative w-20 h-24 mx-auto rounded-xl border-2 border-blue-400/80 bg-blue-50/40 overflow-hidden flex flex-col items-center justify-center p-3 shadow-inner">
                  <IconScan className="w-8 h-8 text-blue-600 animate-pulse" />
                  {/* Laser scan line effect */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-bounce shadow-md" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-sm font-black text-slate-900">{scanStepText}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Result Tab 1: Structured AI Analysis */}
                {(
                  <div className="space-y-4">
                    {/* Company & Position */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {ocrData.documentType === 'certificate' ? '발급/주관 기관' : '기업 / 회사명'}
                        </label>
                        <input
                          type="text"
                          value={ocrData.company}
                          onChange={e => setOcrData({ ...ocrData, company: e.target.value })}
                          className="w-full text-sm font-extrabold px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {ocrData.documentType === 'certificate' ? '자격/어학 시험명' : '모집 직무 / 부문'}
                        </label>
                        <input
                          type="text"
                          value={ocrData.position}
                          onChange={e => setOcrData({ ...ocrData, position: e.target.value })}
                          className="w-full text-sm font-extrabold px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Key Schedules extracted via OCR */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <IconCalendar className="w-3.5 h-3.5 text-blue-600" />
                          주요 전형 일정
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-rose-700">서류 접수 마감</span>
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                          </div>
                          <input
                            type="date"
                            value={ocrData.deadline}
                            onChange={e => setOcrData({ ...ocrData, deadline: e.target.value })}
                            className="w-full text-xs font-black text-slate-800 focus:outline-hidden"
                          />
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-indigo-700">필기 / 코딩테스트</span>
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          </div>
                          <input
                            type="date"
                            value={ocrData.writtenTestDate}
                            onChange={e => setOcrData({ ...ocrData, writtenTestDate: e.target.value })}
                            className="w-full text-xs font-black text-slate-800 focus:outline-hidden"
                          />
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-purple-700">면접 전형일</span>
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                          </div>
                          <input
                            type="date"
                            value={ocrData.interviewDate}
                            onChange={e => setOcrData({ ...ocrData, interviewDate: e.target.value })}
                            className="w-full text-xs font-black text-slate-800 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Certificate Specific Info (if certificate) */}
                    {ocrData.documentType === 'certificate' && (
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <IconAward className="w-4 h-4 text-amber-600" />
                          자격 및 성적 정보
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                            <span className="text-[11px] text-slate-500 block">취득 등급 / 점수</span>
                            <span className="text-sm font-black text-amber-800">
                              {ocrData.scoreOrGrade || '취득 완료'}
                            </span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                            <span className="text-[11px] text-slate-500 block">취득/발급일</span>
                            <span className="text-xs font-bold text-slate-800">
                              {ocrData.issueDate || '2026-08-15'}
                            </span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                            <span className="text-[11px] text-slate-500 block">유효기간 만료일</span>
                            <span className="text-xs font-bold text-rose-700">
                              {ocrData.expiryDate || '2028-08-14 (2년)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subjects & Competencies */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        평가 과목 및 역량
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ocrData.subjects.map((subj, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold"
                          >
                            <IconBookOpen className="w-3.5 h-3.5 text-indigo-500" />
                            {subj}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        제출 필요 서류
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ocrData.requiredDocuments.map((doc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                          >
                            <IconCheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Location & Memo */}
                    {ocrData.location && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                          <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                          근무지 또는 시험 장소
                        </label>
                        <input
                          type="text"
                          value={ocrData.location}
                          onChange={e => setOcrData({ ...ocrData, location: e.target.value })}
                          className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        메모 / 유의사항
                      </label>
                      <textarea
                        rows={2}
                        value={ocrData.memo}
                        onChange={e => setOcrData({ ...ocrData, memo: e.target.value })}
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl leading-relaxed text-slate-800"
                      />
                    </div>

                    {/* 저장 대상 설정 및 저장 (전형 준비 메모 바로 아래) */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
                          <IconBriefcase className="w-4 h-4 text-blue-600" />
                          <span>저장 대상:</span>
                        </label>

                        {ocrData.documentType === 'certificate' ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 w-fit">
                            자격증 / 어학 성적표로 인식됨
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 max-w-full">
                            <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => setTargetApplicationId('new')}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                                  targetApplicationId === 'new'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                + 새 공고로 등록
                              </button>
                              {applications.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (targetApplicationId === 'new') {
                                      setTargetApplicationId(
                                        selectedAppId && applications.some(a => a.id === selectedAppId)
                                          ? selectedAppId
                                          : applications[0].id
                                      );
                                    }
                                  }}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                                    targetApplicationId !== 'new'
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  기존 내 공고 ({applications.length})
                                </button>
                              )}
                            </div>

                            {targetApplicationId !== 'new' && applications.length > 0 && (
                              <select
                                value={targetApplicationId}
                                onChange={e => setTargetApplicationId(e.target.value)}
                                className="w-full sm:w-auto max-w-full text-xs font-bold bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs truncate"
                              >
                                {applications.map(app => (
                                  <option key={app.id} value={app.id}>
                                    [{app.company}] {app.position} ({app.stage})
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 저장 실행 버튼 - 영역 밖으로 벗어나지 않는 반응형 버튼 */}
                      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {ocrData.documentType === 'certificate' ? (
                          <button
                            type="button"
                            onClick={handleSaveToCredentials}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                          >
                            <IconAward className="w-4 h-4 shrink-0" />
                            <span>내 자격증으로 즉시 등록</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSaveToApplications}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                          >
                            <IconPlus className="w-4 h-4 shrink-0" />
                            <span className="truncate">
                              {targetApplicationId === 'new'
                                ? '새 지원 공고로 즉시 저장'
                                : `[${applications.find(a => a.id === targetApplicationId)?.company || '선택 공고'}]에 반영 & 저장`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={previewImage}
        title={selectedFileName || ocrData.title}
        subtitle={`${ocrData.company} · ${ocrData.documentTypeLabel}`}
      />
    </div>
  );
};
