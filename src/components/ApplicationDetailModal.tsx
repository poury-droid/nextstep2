import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Application, ApplicationStage, StageNotice, NoticeType, Task } from '../types/index.ts';
import { DDayBadge } from './DDayBadge.tsx';
import { ImageLightboxModal } from './ImageLightboxModal.tsx';
import { StageNoticeModal } from './StageNoticeModal.tsx';
import { StageChangePromptModal } from './StageChangePromptModal.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { optimizeImageDataUrl } from '../utils/imageCompressor.ts';
import {
  IconX,
  IconClock,
  IconMapPin,
  IconCheckCircle2,
  IconBookOpen,
  IconTrash2,
  IconEdit3,
  IconPlus,
  IconCheckSquare,
  IconCheck,
  IconImage,
  IconMaximize2,
  IconZoomIn,
  IconScan,
  IconUploadCloud,
  IconSparkles,
  IconRotateCw,
  IconAlertCircle,
  IconMessageSquare,
  IconFileText,
  IconMail,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
} from './Icons.tsx';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onEdit: (app: Application) => void;
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

export const STAGE_NAV_ITEMS: { stage: ApplicationStage | 'ALL'; label: string; icon: string }[] = [
  { stage: '서류접수', label: '서류접수', icon: '📝' },
  { stage: '서류합격', label: '서류합격', icon: '🎉' },
  { stage: '필기/코딩테스트', label: '필기/코테', icon: '💻' },
  { stage: '1차면접', label: '1차면접', icon: '🗣️' },
  { stage: '2차/최종면접', label: '2차 면접', icon: '👔' },
  { stage: '최종합격', label: '최종합격', icon: '🏆' },
  { stage: 'ALL', label: '전체 모아보기', icon: '📋' },
];

export const STAGE_QUICK_PRESETS: Record<string, { text: string; category: '준비물' | '시험장소' | '복장/기타' }[]> = {
  '2차/최종면접': [
    { text: '본인 사진 부착 신분증 원본 (주민등록증 / 운전면허증) 지참', category: '준비물' },
    { text: '대학교 졸업(예정)증명서 원본 및 전학년 성적증명서', category: '준비물' },
    { text: '포트폴리오 및 프로젝트 아키텍처 요약 출력본 2~3부', category: '준비물' },
    { text: '임원 면접 1분 자기소개 및 핵심 역량 어필 답변 암기 점검', category: '복장/기타' },
    { text: '면접 시작 30분 전 1층 인포데스크 출입증 수령 완료', category: '시험장소' },
    { text: '최종 면접장 대기실 위치 및 지하철역 도보 이동 동선 사전 확인', category: '시험장소' },
    { text: '단정한 정장 또는 비즈니스 캐주얼 복장 착용 점검', category: '복장/기타' },
  ],
  '1차면접': [
    { text: '본인 사진 부착 신분증 원본 지참', category: '준비물' },
    { text: '포트폴리오 출력본 2부 및 깃허브 코드 아키텍처 요약본', category: '준비물' },
    { text: 'CS 전공 지식(OS, 네트워크, DB 트랜잭션) 핵심 정리', category: '준비물' },
    { text: '면접 시작 20분 전 1층 로비 도착 및 방문증 수령', category: '시험장소' },
    { text: '인터뷰룸 위치 및 대중교통 이동 동선 사전 확인', category: '시험장소' },
    { text: '단정한 자율 복장(비즈니스 캐주얼 / 셔츠) 착용 점검', category: '복장/기타' },
  ],
  '필기/코딩테스트': [
    { text: '본인 사진 부착 신분증 원본 지참', category: '준비물' },
    { text: '수험표 또는 시험 응시표 출력본 지참', category: '준비물' },
    { text: '화상 카메라(웹캠) 및 마이크 음질 사전 점검', category: '준비물' },
    { text: '컴퓨터용 사인펜 및 문제풀이용 연습장 구비', category: '준비물' },
    { text: '시험 시작 15분 전 온라인 시험 플랫폼 로그인 및 환경 체크', category: '시험장소' },
    { text: '오프라인 고사장 이동 동선 및 입실 마감 시간 확인', category: '시험장소' },
  ],
  '서류합격': [
    { text: '본인 확인용 신분증 지참', category: '준비물' },
    { text: '서류 합격 알림 문자 및 다음 전형 안내문 캡처 보관', category: '준비물' },
    { text: '공인 어학 성적표 및 자격증 사본 원본 대조 확인', category: '준비물' },
    { text: '다음 면접/테스트 전형 일시 캘린더 등록', category: '시험장소' },
    { text: '채용 포털에서 면접 참석 여부 회신 완료', category: '복장/기타' },
  ],
  '서류접수': [
    { text: '이력서 및 경력기술서 PDF 최신본 검토', category: '준비물' },
    { text: '포트폴리오 파일 및 깃허브 링크 정상 동작 확인', category: '준비물' },
    { text: '자기소개서 문항별 글자수 및 맞춤법 검사기 점검', category: '준비물' },
    { text: '접수 마감 1시간 전 채용 사이트 최종 제출 완료', category: '시험장소' },
  ],
  '최종합격': [
    { text: '지정병원 채용 신체검사 결과서 원본 수령', category: '준비물' },
    { text: '주민등록등본 2부 및 신분증 사본', category: '준비물' },
    { text: '급여 지급용 본인 명의 계좌 통장 사본', category: '준비물' },
    { text: '최종학력 졸업증명서 및 경력증명서 원본', category: '준비물' },
    { text: '첫 출근일 본사 대강당 집결 동선 확인', category: '시험장소' },
    { text: '첫 출근 단정한 정장 복장 준비', category: '복장/기타' },
  ],
};

export const getStageRegisterButtonLabel = (stage: ApplicationStage) => {
  switch (stage) {
    case '서류접수':
      return '+ 서류접수 확인서 / 안내 등록';
    case '서류합격':
      return '+ 서류합격 안내문 / 문자 등록';
    case '필기/코딩테스트':
      return '+ 필기/코테 수험표 · 안내문 등록';
    case '1차면접':
      return '+ 1차 면접 안내문 / 문자 등록';
    case '2차/최종면접':
      return '+ 2차 면접 안내문 / 공문 등록';
    case '최종합격':
      return '+ 최종합격 통지서 / 입사 안내문 등록';
    default:
      return `+ ${stage} 안내문 등록`;
  }
};

// Interactive slider for notices with multiple images
const NoticeImageSlider: React.FC<{
  images: string[];
  title: string;
  subtitle?: string;
  onOpenLightbox: (images: string[], index: number) => void;
}> = ({ images, title, subtitle, onOpenLightbox }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col items-center w-full space-y-1.5">
      {/* Main Slide Image */}
      <div
        onClick={() => onOpenLightbox(images, currentIndex)}
        className="group relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:border-blue-400 transition-all flex items-center justify-center shadow-xs select-none"
        title="클릭하여 원본 사진 크게 보기"
      >
        <img
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-slate-900/85 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700 transition-all hover:scale-110 active:scale-95 shadow-md"
            title="이전 사진 (클릭하여 넘기기)"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-slate-900/85 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700 transition-all hover:scale-110 active:scale-95 shadow-md"
            title="다음 사진 (클릭하여 넘기기)"
          >
            <IconChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Counter Pill */}
        {images.length > 1 && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-slate-900/85 text-[10px] font-mono font-bold text-white border border-slate-700">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold pointer-events-none">
          <IconZoomIn className="w-4 h-4" />
          <span>크게 보기</span>
        </div>
      </div>

      {/* Mini Thumbnail Strip if multiple photos */}
      {images.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={e => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-9 h-9 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                currentIndex === idx
                  ? 'border-blue-500 ring-1 ring-blue-400 scale-105'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
              title={`${idx + 1}번째 사진 선택`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <span className="text-[10px] text-slate-400">
        {images.length > 1 ? '화살표로 사진 넘겨보기 • 클릭 시 확대' : '클릭 시 원본 확대'}
      </span>
    </div>
  );
};

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application: initialApplication,
  onClose,
  onEdit,
}) => {
  const {
    applications,
    updateApplication,
    updateApplicationStage,
    toggleRequiredDoc,
    deleteApplication,
    tasks,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    studyPlans,
    setCurrentTab,
  } = useApp();

  // Always use the latest application state from context
  const application = applications.find(a => a.id === initialApplication.id) || initialApplication;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'서류' | '필기' | '면접' | '공통'>('공통');

  // Task inline editing states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskCategory, setEditTaskCategory] = useState<'서류' | '필기' | '면접' | '공통'>('공통');
  const [editTaskPriority, setEditTaskPriority] = useState<'high' | 'normal' | 'low'>('normal');

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('공고 원본 포스터');
  const [lightboxSubtitle, setLightboxSubtitle] = useState<string | undefined>(undefined);

  // Delete confirmation states
  const [isConfirmingDeletePoster, setIsConfirmingDeletePoster] = useState(false);
  const [isDeleteAppModalOpen, setIsDeleteAppModalOpen] = useState(false);
  const [noticeToDeleteId, setNoticeToDeleteId] = useState<string | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Stage change celebratory prompt
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptTargetStage, setPromptTargetStage] = useState<ApplicationStage>('서류합격');

  // Selected stage tab for separating notices, checklists, and memos per stage
  const [selectedStageTab, setSelectedStageTab] = useState<ApplicationStage | 'ALL'>(() => {
    return application.stage || '2차/최종면접';
  });

  // Stage-specific memo editing states
  const [editingStageMemoStage, setEditingStageMemoStage] = useState<ApplicationStage | null>(null);
  const [stageMemoDraft, setStageMemoDraft] = useState('');

  // Stage-level standalone checklist add input
  const [stageQuickItemText, setStageQuickItemText] = useState<Record<string, string>>({});
  const [stageQuickItemCategory, setStageQuickItemCategory] = useState<Record<string, '준비물' | '시험장소' | '복장/기타'>>({});

  // Stage Notice Modal states
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeModalStage, setNoticeModalStage] = useState<ApplicationStage>('서류합격');
  const [noticeModalType, setNoticeModalType] = useState<NoticeType>('sms');
  const [editingNotice, setEditingNotice] = useState<StageNotice | null>(null);
  const [copiedNoticeId, setCopiedNoticeId] = useState<string | null>(null);
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const [quickItemText, setQuickItemText] = useState<Record<string, string>>({});
  const [quickItemCategory, setQuickItemCategory] = useState<Record<string, '준비물' | '시험장소' | '복장/기타'>>({});

  // Poster OCR & Image saving states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'info' | 'error'>('success');

  const appTasks = tasks.filter(t => t.applicationId === application.id);
  const linkedStudyPlan = studyPlans.find(sp => sp.applicationId === application.id);

  // Stage change handler: updates stage and pops up prompt to register notice
  const handleStageChange = (stage: ApplicationStage) => {
    const oldStage = application.stage;
    updateApplicationStage(application.id, stage);
    setSelectedStageTab(stage);
    if (stage !== oldStage && (stage === '서류합격' || stage === '1차면접' || stage === '2차/최종면접' || stage === '최종합격')) {
      setPromptTargetStage(stage);
      setIsPromptOpen(true);
    }
  };

  const handleOpenNoticeRegister = (stage: ApplicationStage, preferredType: 'sms' | 'document') => {
    setEditingNotice(null);
    setNoticeModalStage(stage);
    setNoticeModalType(preferredType);
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = (
    notice: StageNotice,
    options: { syncSchedule: boolean; syncTask: boolean }
  ) => {
    const existing = application.stageNotices || [];
    const isEdit = existing.some(n => n.id === notice.id);
    const updatedNotices = isEdit
      ? existing.map(n => (n.id === notice.id ? notice : n))
      : [notice, ...existing];

    const updates: Partial<Application> = {
      stageNotices: updatedNotices,
    };

    if (options.syncSchedule) {
      if (notice.interviewDate) updates.interviewDate = notice.interviewDate;
      if (notice.location) updates.location = notice.location;
    }

    updateApplication(application.id, updates);
    setSelectedStageTab(notice.stage);

    if (options.syncTask && notice.interviewDate) {
      addTask({
        applicationId: application.id,
        applicationName: application.company,
        title: `[${notice.stage}] ${application.company} 면접 참석 및 최종 준비`,
        category: '면접',
        dueDate: notice.interviewDate.split(' ')[0],
        completed: false,
        priority: 'high',
      });
    }

    setStatusType('success');
    setStatusMessage(`[${notice.title}] 안내문이 [${notice.stage}] 탭에 성공적으로 저장되었습니다!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Helper to get all checklist items for a stage (from notices + application stageChecklists)
  const getStageChecklistData = (stage: ApplicationStage) => {
    const stageNotices = (application.stageNotices || []).filter(n => n.stage === stage);
    const noticeItems = stageNotices.flatMap(n =>
      (n.checklistItems || []).map(item => ({ ...item, noticeId: n.id }))
    );
    const directItems = (application.stageChecklists?.[stage] || []).map(item => ({
      ...item,
      isDirect: true,
      noticeId: undefined,
    }));
    const allItems = [...noticeItems, ...directItems];
    const completedCount = allItems.filter(i => i.checked).length;
    const totalCount = allItems.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return {
      stageNotices,
      items: allItems,
      completedCount,
      totalCount,
      percent,
    };
  };

  const handleToggleStageItem = (stage: ApplicationStage, itemId: string, noticeId?: string) => {
    if (noticeId) {
      handleToggleNoticeChecklistItem(noticeId, itemId);
      return;
    }
    const currentDirect = application.stageChecklists?.[stage] || [];
    const updated = currentDirect.map(i => (i.id === itemId ? { ...i, checked: !i.checked } : i));
    updateApplication(application.id, {
      stageChecklists: { ...(application.stageChecklists || {}), [stage]: updated },
    });
  };

  const handleAddStageItem = (
    stage: ApplicationStage,
    text: string,
    category: '준비물' | '시험장소' | '복장/기타' = '준비물'
  ) => {
    if (!text.trim()) return;
    const stageNotices = (application.stageNotices || []).filter(n => n.stage === stage);
    if (stageNotices.length > 0) {
      handleAddNoticeChecklistItem(stageNotices[0].id, text, category);
    } else {
      const currentDirect = application.stageChecklists?.[stage] || [];
      if (currentDirect.some(i => i.text.trim() === text.trim())) return;
      const newItem = {
        id: `st-chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: text.trim(),
        checked: false,
        category,
      };
      updateApplication(application.id, {
        stageChecklists: {
          ...(application.stageChecklists || {}),
          [stage]: [...currentDirect, newItem],
        },
      });
    }
    setStageQuickItemText(prev => ({ ...prev, [stage]: '' }));
  };

  const handleDeleteStageItem = (stage: ApplicationStage, itemId: string, noticeId?: string) => {
    if (noticeId) {
      handleDeleteNoticeChecklistItem(noticeId, itemId);
      return;
    }
    const currentDirect = application.stageChecklists?.[stage] || [];
    const updated = currentDirect.filter(i => i.id !== itemId);
    updateApplication(application.id, {
      stageChecklists: { ...(application.stageChecklists || {}), [stage]: updated },
    });
  };

  const handleStartEditStageMemo = (stage: ApplicationStage, currentText: string) => {
    setEditingStageMemoStage(stage);
    setStageMemoDraft(currentText);
  };

  const handleSaveStageMemo = (stage: ApplicationStage) => {
    const currentMemos = application.stageMemos || {};
    const updatedMemos = {
      ...currentMemos,
      [stage]: stageMemoDraft.trim(),
    };
    updateApplication(application.id, { stageMemos: updatedMemos });
    setEditingStageMemoStage(null);
    setStatusType('success');
    setStatusMessage(`[${stage}] 전형 대비 메모가 저장되었습니다.`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleCancelEditStageMemo = () => {
    setEditingStageMemoStage(null);
    setStageMemoDraft('');
  };

  const handleDeleteNotice = (noticeId: string) => {
    setNoticeToDeleteId(noticeId);
  };

  const handleCopyNoticeText = (notice: StageNotice) => {
    const textToCopy = `${notice.title}\n\n${notice.content}${notice.interviewDate ? `\n\n■ 일시: ${notice.interviewDate}` : ''}${notice.location ? `\n■ 장소: ${notice.location}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoticeId(notice.id);
    setTimeout(() => setCopiedNoticeId(null), 2000);
  };

  const handleCopyLocationText = (noticeId: string, locationStr: string) => {
    navigator.clipboard.writeText(locationStr);
    setCopiedLocationId(noticeId);
    setTimeout(() => setCopiedLocationId(null), 2000);
  };

  // Toggle individual checklist item on a stage notice
  const handleToggleNoticeChecklistItem = (noticeId: string, itemId: string) => {
    const existing = application.stageNotices || [];
    const updated = existing.map(n => {
      if (n.id !== noticeId) return n;
      const items = (n.checklistItems || []).map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      return { ...n, checklistItems: items };
    });
    updateApplication(application.id, { stageNotices: updated });
  };

  // Add a new checklist item to a stage notice
  const handleAddNoticeChecklistItem = (
    noticeId: string,
    text: string,
    category: '준비물' | '시험장소' | '복장/기타' = '준비물'
  ) => {
    if (!text.trim()) return;
    const existing = application.stageNotices || [];
    const updated = existing.map(n => {
      if (n.id !== noticeId) return n;
      const prevItems = n.checklistItems || [];
      if (prevItems.some(i => i.text.trim() === text.trim())) return n;
      const newItem = {
        id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: text.trim(),
        checked: false,
        category,
      };
      return { ...n, checklistItems: [...prevItems, newItem] };
    });
    updateApplication(application.id, { stageNotices: updated });
    // clear input for this card
    setQuickItemText(prev => ({ ...prev, [noticeId]: '' }));
  };

  // Delete a checklist item from a stage notice
  const handleDeleteNoticeChecklistItem = (noticeId: string, itemId: string) => {
    const existing = application.stageNotices || [];
    const updated = existing.map(n => {
      if (n.id !== noticeId) return n;
      const filtered = (n.checklistItems || []).filter(item => item.id !== itemId);
      return { ...n, checklistItems: filtered };
    });
    updateApplication(application.id, { stageNotices: updated });
  };

  // Process and attach uploaded file
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStep('1/3단계: 포스터 이미지 최적화 및 공고에 저장 중...');
    setStatusMessage(null);

    try {
      const dataUrl = await optimizeImageDataUrl(file);

      // 1. Immediately save image to this application so user can see it right away
      updateApplication(application.id, { imageUrl: dataUrl });

      setScanStep('2/3단계: Gemini 3.8 Flash Vision OCR로 공고문 텍스트 분석 중...');

      // 2. Call OCR analyze API
      const response = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: dataUrl,
          mimeType: file.type || 'image/png',
          category: 'job_posting',
        }),
      });

      setScanStep('3/3단계: 전형 일정 및 시험 과목 공고 연동 중...');

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const d = result.data;
          const updates: Partial<Application> = {
            imageUrl: dataUrl,
          };

          if (d.deadline) updates.deadline = d.deadline;
          if (d.writtenTestDate) updates.writtenTestDate = d.writtenTestDate;
          if (d.interviewDate) updates.interviewDate = d.interviewDate;
          if (d.replyDeadline) updates.replyDeadline = d.replyDeadline;
          if (d.location) updates.location = d.location;

          if (Array.isArray(d.subjects) && d.subjects.length > 0) {
            updates.subjects = Array.from(new Set([...application.subjects, ...d.subjects]));
          }

          if (Array.isArray(d.requiredDocuments) && d.requiredDocuments.length > 0 && (!application.requiredDocuments || application.requiredDocuments.length === 0)) {
            updates.requiredDocuments = d.requiredDocuments.map((name: string) => ({ name, checked: false }));
          }

          if (d.memo && !application.memo) {
            updates.memo = d.memo;
          }

          updateApplication(application.id, updates);
          setStatusType('success');
          setStatusMessage('포스터 이미지가 이 공고에 저장되었습니다! AI가 공고문을 분석하여 전형 일정과 시험 과목을 자동 연동했습니다.');
        } else {
          setStatusType('success');
          setStatusMessage('포스터 이미지가 이 공고에 성공적으로 저장되었습니다!');
        }
      } else {
        setStatusType('success');
        setStatusMessage('포스터 이미지가 이 공고에 저장되었습니다!');
      }
    } catch (err: any) {
      console.error('OCR analysis error:', err);
      setStatusType('info');
      setStatusMessage('포스터 이미지는 저장되었습니다. (일정 자동 추출 오류 시 수동으로 입력할 수 있습니다.)');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Remove poster image
  const handleRemovePoster = () => {
    updateApplication(application.id, { imageUrl: undefined });
    setIsConfirmingDeletePoster(false);
    setStatusType('info');
    setStatusMessage('공고 포스터 사진이 삭제되었습니다.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      applicationId: application.id,
      applicationName: application.company,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      dueDate: newTaskDueDate || application.deadline || '',
      completed: false,
      priority: 'normal',
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
    setStatusType('success');
    setStatusMessage('새 할 일이 등록되었습니다.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDueDate(task.dueDate || '');
    setEditTaskCategory(task.category || '공통');
    setEditTaskPriority(task.priority || 'normal');
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
  };

  const handleSaveEditedTask = (taskId: string) => {
    if (!editTaskTitle.trim()) return;
    updateTask(taskId, {
      title: editTaskTitle.trim(),
      dueDate: editTaskDueDate,
      category: editTaskCategory,
      priority: editTaskPriority,
    });
    setEditingTaskId(null);
    setStatusType('success');
    setStatusMessage('할 일이 성공적으로 수정되었습니다.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleDelete = () => {
    setIsDeleteAppModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {application.company.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{application.company}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                  {application.stage}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{application.position}</p>
              <p className="text-xs text-slate-500 mt-1">{application.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {application.imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setLightboxImages([]);
                  setLightboxIndex(0);
                  setLightboxImageUrl(application.imageUrl || null);
                  setLightboxTitle(`${application.company} 채용 공고 원문 사진`);
                  setLightboxSubtitle(`${application.position} · ${application.title}`);
                  setIsLightboxOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200/60 shadow-2xs mr-1"
                title="공고 원본 사진 크게 보기"
              >
                <IconImage className="w-3.5 h-3.5 text-blue-600" />
                <span>사진 보기</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(application)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="공고 수정"
            >
              <IconEdit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="공고 삭제"
            >
              <IconTrash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="닫기"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Original Document Photo Section (선택 사항: 등록된 경우 표시, 없을 때는 간결한 추가 버튼 제공) */}
          {application.imageUrl ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <IconImage className="w-4 h-4 text-blue-600" />
                    채용 공고 포스터 원본 (선택)
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200/70 flex items-center gap-1">
                    <IconCheckCircle2 className="w-3 h-3 text-emerald-600" />
                    보관 중
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileScan}
                    className="hidden"
                    id={`poster-reupload-${application.id}`}
                  />
                  <label
                    htmlFor={`poster-reupload-${application.id}`}
                    className="cursor-pointer text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    title="포스터 사진 교체"
                  >
                    <IconUploadCloud className="w-3.5 h-3.5 text-blue-600" />
                    사진 변경
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxImages([]);
                      setLightboxIndex(0);
                      setLightboxImageUrl(application.imageUrl || null);
                      setLightboxTitle(`${application.company} 채용 공고 원문 사진`);
                      setLightboxSubtitle(`${application.position} · ${application.title}`);
                      setIsLightboxOpen(true);
                    }}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 transition-colors"
                  >
                    <IconMaximize2 className="w-3.5 h-3.5" />
                    크게 보기
                  </button>
                  {isConfirmingDeletePoster ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 text-xs animate-in fade-in duration-150">
                      <span className="text-rose-700 font-bold text-[11px]">사진 삭제?</span>
                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        삭제
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDeletePoster(false)}
                        className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDeletePoster(true)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 border border-rose-200/60"
                      title="포스터 사진 삭제"
                    >
                      <IconTrash2 className="w-3.5 h-3.5" />
                      <span>사진 삭제</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scanning status banner */}
              {isScanning && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-blue-900 text-xs font-medium animate-pulse">
                  <IconRotateCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  <span>{scanStep}</span>
                </div>
              )}

              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  statusType === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  <IconCheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div
                className="relative rounded-xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center max-h-[260px] cursor-pointer group shadow-2xs"
                onClick={() => {
                  setLightboxImageUrl(application.imageUrl || null);
                  setLightboxTitle(`${application.company} 채용 공고 원문 사진`);
                  setLightboxSubtitle(`${application.position} · ${application.title}`);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={application.imageUrl}
                  alt={`${application.company} 공고 사진`}
                  className="max-h-[250px] max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/95 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5">
                    <IconZoomIn className="w-4 h-4 text-blue-600" />
                    클릭하여 크게 보기
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* 포스터가 없을 때는 거대한 박스 대신 깔끔하고 부담 없는 선택형 바로 축소 */
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <IconImage className="w-4 h-4 text-slate-400" />
                <span>공고 포스터 사진 (선택 사항)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileScan}
                  className="hidden"
                  id={`poster-upload-${application.id}`}
                />
                <label
                  htmlFor={`poster-upload-${application.id}`}
                  className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <IconUploadCloud className="w-3 h-3 text-blue-600" />
                  <span>사진 첨부하기</span>
                </label>
              </div>
            </div>
          )}

          {/* Stage Progress Stepper */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              전형 단계 변경
            </label>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
              {STAGES.map(stage => {
                const isCurrent = application.stage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => handleStageChange(stage)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Dates Schedule Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              주요 전형 일정
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500 font-medium block mb-1">서류 마감일</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    {application.deadline || '미정'}
                  </span>
                  {application.deadline && <DDayBadge dateStr={application.deadline} size="sm" />}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                <span className="text-xs text-indigo-700 font-medium block mb-1">필기/코딩테스트</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-sm">
                    {application.writtenTestDate || '미정'}
                  </span>
                  {application.writtenTestDate && <DDayBadge dateStr={application.writtenTestDate} size="sm" />}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50">
                <span className="text-xs text-purple-700 font-medium block mb-1">면접 전형일</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-sm">
                    {application.interviewDate || '미정'}
                  </span>
                  {application.interviewDate && <DDayBadge dateStr={application.interviewDate} size="sm" />}
                </div>
              </div>
            </div>

            {application.location && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 px-1">
                <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>장소 / 면접 위치: {application.location}</span>
              </div>
            )}
          </div>

          {/* 전형별 분리 관리 탭 (Stage Navigation Tabs) */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>🎯 전형 단계별 관리 보관함</span>
                    <span className="text-xs text-blue-600 font-semibold">
                      (안내문 · 체크리스트 · 메모 전형별 분리)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    각 전형 탭을 선택하여 해당 단계의 합격 안내문, 준비물/시험장소 체크리스트, 대비 메모를 독립적으로 관리하세요.
                  </p>
                </div>
              </div>

              {/* Stage Navigation Tab Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-thin">
                {STAGE_NAV_ITEMS.map(item => {
                  const isSelected = selectedStageTab === item.stage;
                  const isCurrentAppStage = application.stage === item.stage;
                  const stageChecklist = item.stage !== 'ALL' ? getStageChecklistData(item.stage) : null;
                  const noticeCount = item.stage === 'ALL'
                    ? (application.stageNotices || []).length
                    : (stageChecklist?.stageNotices.length || 0);

                  return (
                    <button
                      key={item.stage}
                      type="button"
                      onClick={() => setSelectedStageTab(item.stage)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>

                      {isCurrentAppStage && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            isSelected ? 'bg-white text-blue-700' : 'bg-emerald-100 text-emerald-800'
                          }`}
                          title="현재 지원자가 위치한 전형 단계"
                        >
                          현재
                        </span>
                      )}

                      {noticeCount > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          안내 {noticeCount}
                        </span>
                      )}

                      {stageChecklist && stageChecklist.totalCount > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected
                              ? 'bg-blue-700 text-white'
                              : stageChecklist.completedCount === stageChecklist.totalCount
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {stageChecklist.completedCount}/{stageChecklist.totalCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT: Specific Stage Tab View */}
            {selectedStageTab !== 'ALL' ? (() => {
              const currentStage = selectedStageTab;
              const { stageNotices, items: stageItems, completedCount, totalCount, percent } = getStageChecklistData(currentStage);
              const isCurrentStageActive = application.stage === currentStage;
              const isPastStage = STAGES.indexOf(application.stage) > STAGES.indexOf(currentStage);
              const stageMemoText = application.stageMemos?.[currentStage] || '';
              const stageCategoryTasks = appTasks.filter(t => {
                if (currentStage.includes('면접')) return t.category === '면접';
                if (currentStage.includes('필기')) return t.category === '필기';
                return t.category === '서류';
              });
              const stageLocation = stageNotices.find(n => n.location)?.location || (isCurrentStageActive ? application.location : undefined);
              const stageLocationDetail = stageNotices.find(n => n.locationDetail)?.locationDetail;
              const stageDressCode = stageNotices.find(n => n.dressCode)?.dressCode;

              return (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Stage Top Banner & Register Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100 shadow-2xs">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{STAGE_NAV_ITEMS.find(n => n.stage === currentStage)?.icon}</span>
                          <span>[{currentStage}] 전형 관리</span>
                        </span>
                        {isCurrentStageActive ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            현재 진행 전형
                          </span>
                        ) : isPastStage ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                            ✓ 통과/완료된 단계
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                            예정된 전형 단계
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {currentStage === '2차/최종면접' && '2차 최종 임원면접의 합격 안내문, 수험표, 준비물 및 시험장소 체크리스트와 면접 대비 메모입니다.'}
                        {currentStage === '1차면접' && '1차 기술/직무면접 안내 문자, 면접장 이동 동선, 포트폴리오 준비물 및 CS 기술면접 대비 메모입니다.'}
                        {currentStage === '필기/코딩테스트' && '필기 시험 및 온라인 코딩테스트 수험표, 시험 환경 점검 체크리스트, 공부 계획 및 시험 대비 메모입니다.'}
                        {currentStage === '서류합격' && '서류전형 합격 알림 문자, 면접 일정 안내, 사전 제출 서류 체크리스트 및 메모입니다.'}
                        {currentStage === '서류접수' && '입사지원서 접수 확인증, 필수 제출 서류 목록(자기소개서/포트폴리오) 및 서류 작성 메모입니다.'}
                        {currentStage === '최종합격' && '최종 합격 통지서, 신입사원 입사 안내문, 입사 구비서류 체크리스트 및 첫 출근 준비 메모입니다.'}
                      </p>
                    </div>

                    {/* Notice Register Button ONLY for this stage! */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenNoticeRegister(
                            currentStage,
                            currentStage === '서류합격' || currentStage === '1차면접' ? 'sms' : 'document'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                        <span>{getStageRegisterButtonLabel(currentStage)}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. Stage Notices (Only for this stage!) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <IconMessageSquare className="w-4 h-4 text-blue-600" />
                        <span>[{currentStage}] 안내문 & 수험표 / 공문 보관함</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 font-bold text-blue-700 border border-blue-200/50">
                          {stageNotices.length}건
                        </span>
                      </label>
                    </div>

                    {stageNotices.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2.5">
                        <div className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                          <IconMessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            아직 [{currentStage}]에 등록된 안내문이나 문자가 없습니다.
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-0.5">
                            {currentStage === '2차/최종면접'
                              ? '1차 합격 후 수신한 2차 최종 임원면접 공식 안내문이나 일시·장소 안내 사진을 등록하세요.'
                              : currentStage === '1차면접'
                              ? '서류 합격 후 수신한 1차 면접 안내 문자나 기술면접 가이드를 등록하세요.'
                              : currentStage === '필기/코딩테스트'
                              ? '코딩테스트 응시 안내 메일, 수험표 사진 또는 지필평가 안내문을 등록하세요.'
                              : `${currentStage} 단계의 수신 문자(SMS/알림톡)나 공문 사진을 등록하여 보관하세요.`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenNoticeRegister(
                              currentStage,
                              currentStage === '서류합격' || currentStage === '1차면접' ? 'sms' : 'document'
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 font-bold text-xs transition-colors shadow-2xs"
                        >
                          <IconPlus className="w-3.5 h-3.5" />
                          <span>{getStageRegisterButtonLabel(currentStage)}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {stageNotices.map(notice => {
                          const isSms = notice.noticeType === 'sms';
                          const isEmail = notice.noticeType === 'email';
                          const noticeImages =
                            notice.imageUrls && notice.imageUrls.length > 0
                              ? notice.imageUrls
                              : notice.imageUrl
                              ? [notice.imageUrl]
                              : [];
                          const hasImages = noticeImages.length > 0;

                          return (
                            <div
                              key={notice.id}
                              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3.5"
                            >
                              {/* Notice Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                                      isSms
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isEmail
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {isSms ? '💬 면접안내 문자' : isEmail ? '✉️ 이메일 안내' : '📄 공식 안내문'}
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                      {notice.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                      {notice.sender && <span className="font-semibold text-slate-700">{notice.sender}</span>}
                                      {notice.receivedDate && <span>• 수신: {notice.receivedDate}</span>}
                                      <span className="text-blue-600 font-medium">• {notice.stage} 전형</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyNoticeText(notice)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="안내문 텍스트 복사"
                                  >
                                    <IconCopy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNotice(notice);
                                      setNoticeModalStage(notice.stage);
                                      setNoticeModalType(notice.noticeType);
                                      setIsNoticeModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="수정"
                                  >
                                    <IconEdit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNotice(notice.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="삭제"
                                  >
                                    <IconTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Notice Content & Images Layout */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                                {hasImages && (
                                  <div className="sm:col-span-4">
                                    <NoticeImageSlider
                                      images={noticeImages}
                                      title={`[${application.company}] ${notice.title}`}
                                      subtitle={`${notice.sender || ''} • ${notice.receivedDate || ''}`}
                                      onOpenLightbox={(imgs, idx) => {
                                        setLightboxImages(imgs);
                                        setLightboxIndex(idx);
                                        setLightboxImageUrl(imgs[idx] || null);
                                        setLightboxTitle(`[${application.company}] ${notice.title}`);
                                        setLightboxSubtitle(`${notice.sender || ''} • ${notice.receivedDate || ''}`);
                                        setIsLightboxOpen(true);
                                      }}
                                    />
                                  </div>
                                )}

                                <div className={hasImages ? 'sm:col-span-8' : 'sm:col-span-12'}>
                                  <div
                                    className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans border ${
                                      isSms
                                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                                        : 'bg-blue-50/40 border-blue-100 text-slate-800'
                                    }`}
                                  >
                                    {notice.content}
                                  </div>
                                </div>
                              </div>

                              {/* Notice Schedule, Location & Dress Code Bar */}
                              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  {notice.interviewDate && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                                      <IconClock className="w-3.5 h-3.5 text-blue-600" />
                                      <span>면접/시험 일시: {notice.interviewDate}</span>
                                    </div>
                                  )}

                                  {notice.location && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                                      <IconMapPin className="w-3.5 h-3.5 text-rose-500" />
                                      <span>장소: {notice.location}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyLocationText(notice.id, notice.location || '')}
                                        className="ml-1 p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                                        title="장소 복사"
                                      >
                                        <IconCopy className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  {notice.dressCode && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-medium border border-purple-200/60">
                                      <span className="text-[11px] font-bold">👔 권장 복장:</span>
                                      <span>{notice.dressCode}</span>
                                    </div>
                                  )}

                                  {notice.notes && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-medium border border-amber-200/60">
                                      <span className="text-[11px] font-bold">💡 유의 사항:</span>
                                      <span>{notice.notes}</span>
                                    </div>
                                  )}

                                  {copiedLocationId === notice.id && (
                                    <span className="text-[11px] text-emerald-600 font-bold ml-auto flex items-center gap-1 animate-in fade-in">
                                      <IconCheckCircle2 className="w-3 h-3" />
                                      장소 복사됨!
                                    </span>
                                  )}

                                  {copiedNoticeId === notice.id && (
                                    <span className="text-[11px] text-emerald-600 font-bold ml-auto flex items-center gap-1 animate-in fade-in">
                                      <IconCheckCircle2 className="w-3 h-3" />
                                      본문 복사됨!
                                    </span>
                                  )}
                                </div>

                                {notice.locationDetail && (
                                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 font-medium leading-relaxed">
                                    <div className="flex items-start gap-2">
                                      <IconMapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold text-blue-900">오시는 길 / 세부 위치: </span>
                                        <span>{notice.locationDetail}</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyLocationText(notice.id, notice.locationDetail || '')}
                                      className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 shrink-0 font-bold text-[10px] transition-colors shadow-2xs"
                                    >
                                      위치 복사
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. Stage Checklist: Supplies & Exam Location (전형별 준비물 & 시험 장소 체크리스트) */}
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <IconCheckSquare className="w-4 h-4 text-emerald-600" />
                          <span>[{currentStage}] 준비물 & 시험 장소 체크리스트</span>
                        </label>
                        {totalCount > 0 && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            completedCount === totalCount
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {completedCount}/{totalCount} 완료 ({percent}%)
                          </span>
                        )}
                      </div>

                      {totalCount > 0 && (
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden self-start sm:self-auto border border-slate-200/60">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Checklist Items Grid */}
                    {totalCount > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {stageItems.map(item => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                              item.checked
                                ? 'bg-emerald-50/50 border-emerald-200 text-slate-400'
                                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs hover:bg-white'
                            }`}
                          >
                            <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none min-w-0">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggleStageItem(currentStage, item.id, item.noticeId)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 shrink-0 cursor-pointer"
                              />
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                  item.category === '시험장소'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.category === '복장/기타'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.category || '준비물'}
                              </span>
                              <span className={`text-xs truncate leading-snug ${item.checked ? 'line-through text-slate-400' : 'font-medium text-slate-900'}`}>
                                {item.text}
                              </span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDeleteStageItem(currentStage, item.id, item.noticeId)}
                              className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors shrink-0"
                              title="항목 삭제"
                            >
                              <IconTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-1.5">
                        등록된 [{currentStage}] 준비물 또는 시험 장소 체크 항목이 없습니다. 아래 빠른 추가 칩을 눌러 바로 등록해보세요.
                      </p>
                    )}

                    {/* Stage-Tailored Quick Add Chips */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <IconSparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>[{currentStage}] 추천 준비물 & 점검 항목 원클릭 추가:</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(STAGE_QUICK_PRESETS[currentStage] || []).map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddStageItem(currentStage, preset.text, preset.category)}
                            className="px-2 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            + {preset.category === '시험장소' ? '📍' : preset.category === '복장/기타' ? '👔' : '🎒'} {preset.text.split('(')[0].slice(0, 18)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inline Custom Item Add Row */}
                    <div className="flex items-center gap-2 pt-1.5">
                      <select
                        value={stageQuickItemCategory[currentStage] || '준비물'}
                        onChange={e =>
                          setStageQuickItemCategory(prev => ({
                            ...prev,
                            [currentStage]: e.target.value as '준비물' | '시험장소' | '복장/기타',
                          }))
                        }
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold shrink-0 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="준비물">🎒 준비물</option>
                        <option value="시험장소">📍 시험장소</option>
                        <option value="복장/기타">👔 복장/기타</option>
                      </select>
                      <input
                        type="text"
                        value={stageQuickItemText[currentStage] || ''}
                        onChange={e =>
                          setStageQuickItemText(prev => ({ ...prev, [currentStage]: e.target.value }))
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddStageItem(
                              currentStage,
                              stageQuickItemText[currentStage] || '',
                              stageQuickItemCategory[currentStage] || '준비물'
                            );
                          }
                        }}
                        placeholder={`[${currentStage}] 전형 준비물 또는 시험 장소 체크 항목 직접 입력... (Enter)`}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleAddStageItem(
                            currentStage,
                            stageQuickItemText[currentStage] || '',
                            stageQuickItemCategory[currentStage] || '준비물'
                          )
                        }
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
                      >
                        추가
                      </button>
                    </div>
                  </div>

                  {/* 3. Stage Location & Route Guide (If location exists) */}
                  {(stageLocation || stageLocationDetail) && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <IconMapPin className="w-4 h-4 text-rose-500" />
                          <span>[{currentStage}] 시험 / 면접 장소 및 오시는 길</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleCopyLocationText('stage-loc', `${stageLocation || ''} ${stageLocationDetail || ''}`.trim())}
                          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <IconCopy className="w-3 h-3" />
                          장소 정보 전체 복사
                        </button>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        {stageLocation && (
                          <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <span className="text-slate-500 font-medium">📍 장소:</span>
                            <span>{stageLocation}</span>
                          </div>
                        )}
                        {stageLocationDetail && (
                          <div className="flex items-start gap-2 text-slate-700 font-medium pt-0.5">
                            <span className="text-blue-600 font-bold shrink-0">🚇 오시는 길:</span>
                            <span>{stageLocationDetail}</span>
                          </div>
                        )}
                        {stageDressCode && (
                          <div className="flex items-center gap-2 text-purple-800 font-medium pt-0.5">
                            <span className="font-bold">👔 권장 복장:</span>
                            <span>{stageDressCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. Stage-Specific Memo & Preparation Strategy (전형별 분리된 메모) */}
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <IconEdit3 className="w-4 h-4 text-amber-600" />
                        <span>[{currentStage}] 전형 전용 대비 메모 & 전략</span>
                        {stageMemoText && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 font-bold text-amber-800 border border-amber-200/60">
                            기록됨
                          </span>
                        )}
                      </label>

                      {editingStageMemoStage !== currentStage && (
                        <button
                          type="button"
                          onClick={() => handleStartEditStageMemo(currentStage, stageMemoText)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <IconEdit3 className="w-3 h-3" />
                          <span>메모 작성/수정</span>
                        </button>
                      )}
                    </div>

                    {editingStageMemoStage === currentStage ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={stageMemoDraft}
                          onChange={e => setStageMemoDraft(e.target.value)}
                          placeholder={`[${currentStage}] 전형에 대한 예상 질문, 어필할 강점, 면접관 성향, 주의사항 등을 자유롭게 기록하세요...`}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] leading-relaxed focus:outline-hidden focus:border-blue-500 focus:bg-white"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEditStageMemo}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveStageMemo(currentStage)}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs"
                          >
                            메모 저장
                          </button>
                        </div>
                      </div>
                    ) : stageMemoText ? (
                      <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-slate-800 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                        {stageMemoText}
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEditStageMemo(currentStage, '')}
                        className="p-4 rounded-xl border border-dashed border-slate-200 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-xs text-slate-500 font-medium">
                          아직 [{currentStage}] 전형 메모가 없습니다.
                        </p>
                        <p className="text-[11px] text-blue-600 font-bold mt-0.5">
                          클릭하여 {currentStage} 예상 질문, 복기 내용 및 핵심 대비 노트를 작성해보세요.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 5. Special Stage Extras */}
                  {/* If 서류접수: show Required Documents */}
                  {currentStage === '서류접수' && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <IconFileText className="w-4 h-4 text-blue-600" />
                          <span>서류 접수 필수 제출 서류 ({application.requiredDocuments.length})</span>
                        </label>
                        <span className="text-xs text-slate-500">
                          {application.requiredDocuments.filter(d => d.checked).length} / {application.requiredDocuments.length} 완료
                        </span>
                      </div>

                      {application.requiredDocuments.length > 0 ? (
                        <div className="space-y-1.5">
                          {application.requiredDocuments.map((doc, idx) => (
                            <label
                              key={idx}
                              className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/40 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={doc.checked}
                                onChange={() => toggleRequiredDoc(application.id, idx)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                              />
                              <span className={`text-xs ${doc.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-semibold'}`}>
                                {doc.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 py-1">등록된 필수 서류 항목이 없습니다.</p>
                      )}
                    </div>
                  )}

                  {/* If 필기/코딩테스트: show Linked Study Plan Banner */}
                  {currentStage === '필기/코딩테스트' && (
                    <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <IconBookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                            {linkedStudyPlan ? linkedStudyPlan.examName : `${application.company} 필기/코테 공부 계획`}
                          </h4>
                          <p className="text-[11px] text-indigo-700 mt-0.5">
                            {linkedStudyPlan
                              ? `시험일 ${linkedStudyPlan.examDate} (${linkedStudyPlan.subjects.map(s => s.name).join(', ')})`
                              : '시험일에 맞춘 일일 공부 플랜을 생성하고 점검할 수 있습니다.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          setCurrentTab('study');
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0"
                      >
                        {linkedStudyPlan ? '플래너 열기' : '공부 계획 생성'}
                      </button>
                    </div>
                  )}

                  {/* 6. Tasks for this stage */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <IconCheckSquare className="w-4 h-4 text-blue-600" />
                        <span>[{currentStage}] 관련 할 일 ({stageCategoryTasks.length})</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        완료 {stageCategoryTasks.filter(t => t.completed).length} / 전체 {stageCategoryTasks.length}건
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {stageCategoryTasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 transition-all text-xs"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                              {task.category}
                            </span>
                            <span className={`truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                              {task.title}
                            </span>
                          </div>
                          {task.dueDate && <DDayBadge dateStr={task.dueDate} size="sm" />}
                        </div>
                      ))}

                      {stageCategoryTasks.length === 0 && (
                        <p className="text-xs text-slate-400 py-2 text-center border border-dashed border-slate-200 rounded-xl">
                          이 전형에 등록된 전용 할 일이 없습니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })() : (
              /* TAB CONTENT: 'ALL' (전체 모아보기) View */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Stage Progress Roadmap Summary */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2 text-white">
                        <span>전체 전형 로드맵 & 진행 현황</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                          현재: {application.stage}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        단계별 탭을 클릭하여 각 전형의 안내문과 체크리스트를 개별적으로 관리할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {STAGES.filter(s => s !== '불합격').map((st, idx) => {
                      const isCurrent = application.stage === st;
                      const isPast = STAGES.indexOf(application.stage) > STAGES.indexOf(st);
                      const stageData = getStageChecklistData(st);
                      const hasNotice = stageData.stageNotices.length > 0;
                      const hasMemo = !!application.stageMemos?.[st];

                      return (
                        <div
                          key={st}
                          onClick={() => setSelectedStageTab(st)}
                          className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-[1.02] ${
                            isCurrent
                              ? 'bg-blue-600/90 border-blue-400 text-white shadow-sm ring-2 ring-blue-400/40'
                              : isPast
                              ? 'bg-slate-800/80 border-emerald-500/50 text-slate-200'
                              : 'bg-slate-800/40 border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 text-[11px] font-bold mb-1">
                            <span>{STAGE_NAV_ITEMS.find(n => n.stage === st)?.icon}</span>
                            <span className="truncate">{st}</span>
                          </div>

                          <div className="text-[10px] space-y-0.5 font-medium">
                            {isCurrent ? (
                              <span className="inline-block px-1.5 py-0.2 rounded-full bg-white text-blue-700 font-bold text-[9px]">
                                현재 진행
                              </span>
                            ) : isPast ? (
                              <span className="text-emerald-400 font-bold">✓ 완료</span>
                            ) : (
                              <span className="text-slate-400">예정</span>
                            )}

                            <div className="text-[10px] text-slate-300">
                              {hasNotice ? `안내문 ${stageData.stageNotices.length}건` : '안내문 없음'}
                            </div>

                            {stageData.totalCount > 0 && (
                              <div className="text-[9px] text-emerald-300">
                                체크 {stageData.completedCount}/{stageData.totalCount}
                              </div>
                            )}

                            {hasMemo && (
                              <div className="text-[9px] text-amber-300">
                                💡 메모 작성됨
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. All Registered Notices List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <IconMessageSquare className="w-4 h-4 text-blue-600" />
                      <span>전체 전형 안내문 목록 ({(application.stageNotices || []).length}건)</span>
                    </label>
                  </div>

                  {(!application.stageNotices || application.stageNotices.length === 0) ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
                      등록된 안내문이 없습니다. 상단 전형 탭에서 각 전형별 안내문을 등록해보세요.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {application.stageNotices.map(notice => {
                        const isSms = notice.noticeType === 'sms';
                        const isEmail = notice.noticeType === 'email';
                        const noticeImages =
                          notice.imageUrls && notice.imageUrls.length > 0
                            ? notice.imageUrls
                            : notice.imageUrl
                            ? [notice.imageUrl]
                            : [];
                        const hasImages = noticeImages.length > 0;

                        return (
                          <div
                            key={notice.id}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                                    isSms
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isEmail
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {isSms ? '💬 문자' : isEmail ? '✉️ 메일' : '📄 공문'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                                  {notice.stage}
                                </span>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                    {notice.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                    {notice.sender && <span>{notice.sender}</span>}
                                    {notice.receivedDate && <span>• 수신: {notice.receivedDate}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStageTab(notice.stage)}
                                  className="px-2 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  [{notice.stage}] 탭 보기
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyNoticeText(notice)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                  title="복사"
                                >
                                  <IconCopy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNotice(notice.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                  title="삭제"
                                >
                                  <IconTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Text snippet */}
                            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 line-clamp-3 leading-relaxed border border-slate-200">
                              {notice.content}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Required Documents */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      제출 서류 체크리스트
                    </label>
                    <span className="text-xs text-slate-500">
                      {application.requiredDocuments.filter(d => d.checked).length} / {application.requiredDocuments.length} 완료
                    </span>
                  </div>

                  {application.requiredDocuments.length > 0 ? (
                    <div className="space-y-1.5">
                      {application.requiredDocuments.map((doc, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={doc.checked}
                            onChange={() => toggleRequiredDoc(application.id, idx)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span className={`text-xs ${doc.checked ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                            {doc.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-1">등록된 필수 서류가 없습니다.</p>
                  )}
                </div>

                {/* 4. Linked Study Plan Banner */}
                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <IconBookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                        {linkedStudyPlan ? linkedStudyPlan.examName : `${application.company} 필기/면접 공부 계획`}
                      </h4>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        {linkedStudyPlan
                          ? `시험일 ${linkedStudyPlan.examDate} (${linkedStudyPlan.subjects.map(s => s.name).join(', ')})`
                          : '시험일에 맞춘 일일 공부 플랜을 생성할 수 있습니다.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setCurrentTab('study');
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0"
                  >
                    {linkedStudyPlan ? '플래너 열기' : '공부 계획 생성'}
                  </button>
                </div>

                {/* 5. Tasks */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <IconCheckSquare className="w-4 h-4 text-blue-600" />
                      <span>공고별 전형 할 일 ({appTasks.length})</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      완료 {appTasks.filter(t => t.completed).length} / 전체 {appTasks.length}건
                    </span>
                  </div>

                  {/* Quick Task Add Form */}
                  <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex-1 flex gap-1.5 min-w-0">
                      <select
                        value={newTaskCategory}
                        onChange={e => setNewTaskCategory(e.target.value as any)}
                        className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-semibold shrink-0 focus:outline-hidden"
                      >
                        <option value="공통">공통</option>
                        <option value="서류">서류</option>
                        <option value="필기">필기</option>
                        <option value="면접">면접</option>
                      </select>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="새 할 일 입력 (예: 코테 기출 3문제, 1분 자기소개 암기)..."
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={e => setNewTaskDueDate(e.target.value)}
                        className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs shrink-0"
                      >
                        <IconPlus className="w-3.5 h-3.5" />
                        추가
                      </button>
                    </div>
                  </form>

                  {/* Tasks List */}
                  <div className="space-y-1.5">
                    {appTasks.map(task => {
                      const isEditing = editingTaskId === task.id;
                      if (isEditing) {
                        return (
                          <div
                            key={task.id}
                            className="p-3 rounded-xl bg-blue-50/60 border-2 border-blue-400 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-900 shrink-0">할 일 수정:</span>
                              <input
                                type="text"
                                value={editTaskTitle}
                                onChange={e => setEditTaskTitle(e.target.value)}
                                autoFocus
                                className="flex-1 text-xs font-semibold px-3 py-1.5 border border-blue-300 rounded-lg bg-white"
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveEditedTask(task.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditTask();
                                  }
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={cancelEditTask}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditedTask(task.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                              >
                                <IconCheck className="w-3.5 h-3.5" />
                                수정 완료
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200 shrink-0">
                              {task.category || '공통'}
                            </span>
                            <span className={`truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {task.dueDate && <DDayBadge dateStr={task.dueDate} size="sm" />}
                            <button
                              type="button"
                              onClick={() => startEditTask(task)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            >
                              <IconEdit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskToDeleteId(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <IconTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {appTasks.length === 0 && (
                      <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-xl">
                        등록된 공고별 할 일이 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. General Memo */}
                {application.memo && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-amber-950 block mb-1">💡 공고 종합 메모:</span>
                    {application.memo}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => {
          setIsLightboxOpen(false);
          setLightboxImages([]);
        }}
        images={lightboxImages.length > 0 ? lightboxImages : undefined}
        initialIndex={lightboxIndex}
        imageUrl={lightboxImageUrl || application.imageUrl || null}
        title={lightboxTitle}
        subtitle={lightboxSubtitle}
      />

      {/* Stage Change Celebratory Prompt Modal */}
      <StageChangePromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        application={application}
        targetStage={promptTargetStage}
        onOpenNoticeRegister={handleOpenNoticeRegister}
      />

      {/* Stage Notice Register / Edit Modal */}
      <StageNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        application={application}
        initialStage={noticeModalStage}
        initialNoticeType={noticeModalType}
        editingNotice={editingNotice}
        onSaveNotice={handleSaveNotice}
      />

      {/* Confirm Job Application Deletion Modal */}
      <ConfirmModal
        isOpen={isDeleteAppModalOpen}
        title="지원 공고 삭제"
        message={`[${application.company}] ${application.title} 공고를 정말 삭제하시겠습니까?\n등록된 일정과 체크리스트도 함께 삭제됩니다.`}
        confirmText="공고 삭제"
        isDestructive
        onConfirm={() => {
          setIsDeleteAppModalOpen(false);
          deleteApplication(application.id);
          onClose();
        }}
        onCancel={() => setIsDeleteAppModalOpen(false)}
      />

      {/* Confirm Stage Notice Deletion Modal */}
      <ConfirmModal
        isOpen={!!noticeToDeleteId}
        title="안내문/문자 삭제"
        message="선택하신 합격/면접 안내문 및 첨부 사진을 정말 삭제하시겠습니까?"
        confirmText="삭제"
        isDestructive
        onConfirm={() => {
          if (noticeToDeleteId) {
            const updated = (application.stageNotices || []).filter(n => n.id !== noticeToDeleteId);
            updateApplication(application.id, { stageNotices: updated });
            setNoticeToDeleteId(null);
          }
        }}
        onCancel={() => setNoticeToDeleteId(null)}
      />

      {/* Confirm Task Deletion Modal */}
      <ConfirmModal
        isOpen={!!taskToDeleteId}
        title="공고 할 일 삭제"
        message="선택하신 공고별 전형 할 일을 삭제하시겠습니까?"
        confirmText="할 일 삭제"
        isDestructive
        onConfirm={() => {
          if (taskToDeleteId) {
            deleteTask(taskToDeleteId);
            setTaskToDeleteId(null);
            setStatusType('info');
            setStatusMessage('할 일이 삭제되었습니다.');
            setTimeout(() => setStatusMessage(null), 2500);
          }
        }}
        onCancel={() => setTaskToDeleteId(null)}
      />
    </div>
  );
};
