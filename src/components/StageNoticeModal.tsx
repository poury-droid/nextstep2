import React, { useState, useRef, useEffect } from 'react';
import { Application, ApplicationStage, NoticeType, StageNotice, NoticeChecklistItem } from '../types/index.ts';
import { optimizeImageDataUrl } from '../utils/imageCompressor.ts';
import { NOTICE_TEMPLATES } from '../utils/sampleNotices.ts';
import {
  IconX,
  IconMessageSquare,
  IconFileText,
  IconMail,
  IconUploadCloud,
  IconSparkles,
  IconRotateCw,
  IconCheckCircle2,
  IconCalendar,
  IconMapPin,
  IconTrash2,
  IconCheckSquare,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconImage,
} from './Icons.tsx';

interface StageNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  initialStage?: ApplicationStage;
  initialNoticeType?: NoticeType;
  editingNotice?: StageNotice | null;
  onSaveNotice: (
    notice: StageNotice,
    options: { syncSchedule: boolean; syncTask: boolean }
  ) => void;
}

export const StageNoticeModal: React.FC<StageNoticeModalProps> = ({
  isOpen,
  onClose,
  application,
  initialStage,
  initialNoticeType,
  editingNotice,
  onSaveNotice,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [stage, setStage] = useState<ApplicationStage>(
    editingNotice?.stage || initialStage || application.stage || '서류합격'
  );
  const [noticeType, setNoticeType] = useState<NoticeType>(
    editingNotice?.noticeType || initialNoticeType || (stage === '서류합격' ? 'sms' : 'document')
  );
  const [title, setTitle] = useState(editingNotice?.title || '');
  const [sender, setSender] = useState(editingNotice?.sender || `[${application.company} 채용팀]`);
  const [receivedDate, setReceivedDate] = useState(
    editingNotice?.receivedDate || new Date().toISOString().split('T')[0]
  );
  const [interviewDate, setInterviewDate] = useState(
    editingNotice?.interviewDate || application.interviewDate || ''
  );
  const [location, setLocation] = useState(
    editingNotice?.location || application.location || ''
  );
  const [locationDetail, setLocationDetail] = useState(
    editingNotice?.locationDetail || ''
  );
  const [dressCode, setDressCode] = useState(
    editingNotice?.dressCode || ''
  );
  const [content, setContent] = useState(editingNotice?.content || '');
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    if (editingNotice?.imageUrls && editingNotice.imageUrls.length > 0) {
      return editingNotice.imageUrls;
    }
    return editingNotice?.imageUrl ? [editingNotice.imageUrl] : [];
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notes, setNotes] = useState(editingNotice?.notes || '');

  // Checklist items state (준비물, 시험장소, 복장/기타)
  const [checklistItems, setChecklistItems] = useState<NoticeChecklistItem[]>(() => {
    if (editingNotice?.checklistItems && editingNotice.checklistItems.length > 0) {
      return JSON.parse(JSON.stringify(editingNotice.checklistItems));
    }
    return [
      { id: `chk-1-${Date.now()}`, text: '본인 사진 부착 신분증 (주민등록증 / 운전면허증) 지참', checked: false, category: '준비물' },
      { id: `chk-2-${Date.now()}`, text: '수험표 또는 면접 참석 안내문 출력본', checked: false, category: '준비물' },
      { id: `chk-3-${Date.now()}`, text: '시험/면접 장소 위치 및 대중교통 이동 동선 사전 확인', checked: false, category: '시험장소' },
      { id: `chk-4-${Date.now()}`, text: '면접 시작 20분 전 1층 대기실/인포데스크 도착 완료', checked: false, category: '시험장소' },
    ];
  });
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<'준비물' | '시험장소' | '복장/기타'>('준비물');

  // Options
  const [syncSchedule, setSyncSchedule] = useState(true);
  const [syncTask, setSyncTask] = useState(true);

  // OCR state
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);

  // Initialize or reset values when editingNotice or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (editingNotice) {
        setStage(editingNotice.stage);
        setNoticeType(editingNotice.noticeType);
        setTitle(editingNotice.title);
        setSender(editingNotice.sender || `[${application.company} 채용팀]`);
        setReceivedDate(editingNotice.receivedDate || new Date().toISOString().split('T')[0]);
        setInterviewDate(editingNotice.interviewDate || '');
        setLocation(editingNotice.location || '');
        setLocationDetail(editingNotice.locationDetail || '');
        setDressCode(editingNotice.dressCode || '');
        setContent(editingNotice.content || '');
        const imgs = editingNotice.imageUrls && editingNotice.imageUrls.length > 0
          ? editingNotice.imageUrls
          : (editingNotice.imageUrl ? [editingNotice.imageUrl] : []);
        setImageUrls(imgs);
        setActiveImageIndex(0);
        setNotes(editingNotice.notes || '');
        setChecklistItems(
          editingNotice.checklistItems && editingNotice.checklistItems.length > 0
            ? JSON.parse(JSON.stringify(editingNotice.checklistItems))
            : [
                { id: `chk-1-${Date.now()}`, text: '본인 사진 부착 신분증 원본 지참', checked: false, category: '준비물' },
                { id: `chk-2-${Date.now()}`, text: '수험표 또는 참석 확인증 출력본', checked: false, category: '준비물' },
                { id: `chk-3-${Date.now()}`, text: '시험/면접 장소 위치 및 대중교통 이동 동선 확인', checked: false, category: '시험장소' },
                { id: `chk-4-${Date.now()}`, text: '면접 시작 20분 전 대기실 도착 완료', checked: false, category: '시험장소' },
              ]
        );
      } else {
        const defaultStage = initialStage || application.stage || '서류합격';
        setStage(defaultStage);
        const defaultType: NoticeType = defaultStage === '서류합격' ? 'sms' : 'document';
        setNoticeType(initialNoticeType || defaultType);

        if (defaultStage === '서류접수') {
          setTitle(`[서류 접수] 입사지원서 접수 완료 및 서류전형 일정 안내`);
        } else if (defaultStage === '서류합격') {
          setTitle(`[서류 합격] 1차 면접 안내 문자 (SMS)`);
        } else if (defaultStage === '필기/코딩테스트') {
          setTitle(`[필기/코테] 수험표 및 코딩테스트 시험 안내`);
        } else if (defaultStage === '1차면접') {
          setTitle(`[1차 면접] 직무역량 기술면접 안내 문자`);
        } else if (defaultStage === '2차/최종면접') {
          setTitle(`[2차 면접] 2차 최종 임원면접 공식 안내문`);
        } else if (defaultStage === '최종합격') {
          setTitle(`[최종 합격] 최종 합격 통지서 및 입사 안내문`);
        } else {
          setTitle(`[${defaultStage}] 전형 합격 및 전형 안내문`);
        }

        setSender(`[${application.company} 채용팀]`);
        setReceivedDate(new Date().toISOString().split('T')[0]);
        setInterviewDate(application.interviewDate || '');
        setLocation(application.location || '');
        setLocationDetail('');
        setDressCode('단정한 비즈니스 캐주얼');
        setContent('');
        setImageUrls([]);
        setActiveImageIndex(0);
        setNotes('');
        setChecklistItems([
          { id: `chk-1-${Date.now()}`, text: '본인 사진 부착 신분증 (주민등록증 / 운전면허증) 지참', checked: false, category: '준비물' },
          { id: `chk-2-${Date.now()}`, text: '수험표 또는 면접 참석 확인증 출력본', checked: false, category: '준비물' },
          { id: `chk-3-${Date.now()}`, text: '시험/면접 장소 위치 및 대중교통 이동 경로 확인', checked: false, category: '시험장소' },
          { id: `chk-4-${Date.now()}`, text: '면접 시작 20분 전 시험/면접장 대기실 도착 완료', checked: false, category: '시험장소' },
          { id: `chk-5-${Date.now()}`, text: '단정한 면접 복장(비즈니스 캐주얼) 착용 점검', checked: false, category: '복장/기타' },
        ]);
      }
      setOcrStatus(null);
    }
  }, [isOpen, editingNotice, initialStage, initialNoticeType, application]);

  if (!isOpen) return null;

  // Handle template selection
  const handleApplyTemplate = (tpl: typeof NOTICE_TEMPLATES[0]) => {
    setStage(tpl.stage);
    setNoticeType(tpl.noticeType);
    setTitle(tpl.title.replace('네이버 (NAVER)', application.company).replace('카카오 (Kakao)', application.company));
    setSender(tpl.sender.replace('NAVER', application.company).replace('카카오', application.company));
    setContent(tpl.content.replace(/네이버|카카오|삼성전자|토스/g, application.company));
    setLocation(tpl.location);
    setLocationDetail(tpl.locationDetail || '');
    setDressCode(tpl.dressCode || '');
    setImageUrls([tpl.previewSvgDataUrl]);
    setActiveImageIndex(0);
    setNotes(tpl.notes);

    if (tpl.checklistItems && tpl.checklistItems.length > 0) {
      setChecklistItems(JSON.parse(JSON.stringify(tpl.checklistItems)));
    }

    if (tpl.interviewDateOffsetDays) {
      const d = new Date();
      d.setDate(d.getDate() + tpl.interviewDateOffsetDays);
      setInterviewDate(d.toISOString().split('T')[0]);
    }
    setOcrStatus('템플릿의 안내문, 시험장소, 준비물 체크리스트가 즉시 적용되었습니다.');
    setTimeout(() => setOcrStatus(null), 3000);
  };

  // Quick preset items for checklist
  const handleAddPresetChecklistItem = (text: string, category: '준비물' | '시험장소' | '복장/기타') => {
    if (checklistItems.some(item => item.text.trim() === text.trim())) {
      return; // prevent duplicate
    }
    setChecklistItems(prev => [
      ...prev,
      { id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, checked: false, category },
    ]);
  };

  // Add custom checklist item
  const handleAddCustomChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklistItems(prev => [
      ...prev,
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: newChecklistText.trim(),
        checked: false,
        category: newChecklistCategory,
      },
    ]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  // Auto-extract checklist items from content text
  const handleExtractChecklistFromText = () => {
    const raw = `${content}\n${notes}`;
    if (!raw.trim()) return;

    const extracted: { text: string; category: '준비물' | '시험장소' | '복장/기타' }[] = [];

    // Check for supplies
    if (/신분증|주민등록증|운전면허증|여권/i.test(raw) && !checklistItems.some(i => i.text.includes('신분증'))) {
      extracted.push({ text: '본인 사진 부착 신분증 원본 지참', category: '준비물' });
    }
    if (/수험표|참석증/i.test(raw) && !checklistItems.some(i => i.text.includes('수험표'))) {
      extracted.push({ text: '수험표 또는 참석 확인증 출력본', category: '준비물' });
    }
    if (/포트폴리오|출력본|인쇄본/i.test(raw) && !checklistItems.some(i => i.text.includes('포트폴리오'))) {
      extracted.push({ text: '포트폴리오 인쇄본 2~3부 지참', category: '준비물' });
    }
    if (/졸업증명서|성적증명서|어학/i.test(raw) && !checklistItems.some(i => i.text.includes('증명서'))) {
      extracted.push({ text: '대학교 졸업/성적증명서 원본 및 어학성적표 사본', category: '준비물' });
    }
    if (/필기도구|필기구|볼펜/i.test(raw) && !checklistItems.some(i => i.text.includes('필기도구'))) {
      extracted.push({ text: '필기도구 (검정 볼펜 및 메모장) 준비', category: '준비물' });
    }

    // Check for location & arrival
    if (/사옥|로비|안내데스크|출입증|접견실|층/i.test(raw) && !checklistItems.some(i => i.text.includes('출입증') || i.text.includes('로비'))) {
      extracted.push({ text: '1층 로비/안내데스크 방문 출입증 수령 확인', category: '시험장소' });
    }
    if (/도착|대기|입실/i.test(raw) && !checklistItems.some(i => i.text.includes('도착') || i.text.includes('입실'))) {
      extracted.push({ text: '면접/시험 시작 20분 전 시험장 도착 및 대기실 입실', category: '시험장소' });
    }
    if (location && !checklistItems.some(i => i.text.includes('이동 경로') || i.text.includes('오시는 길'))) {
      extracted.push({ text: `시험/면접 장소 (${location.slice(0, 20)}) 대중교통 이동 동선 확인`, category: '시험장소' });
    }

    // Check for virtual/online interview
    if (/화상|구글\s*미트|zoom|meet|웹캠/i.test(raw) && !checklistItems.some(i => i.text.includes('화상') || i.text.includes('웹캠'))) {
      extracted.push({ text: '웹캠, 마이크 음질 및 화상 인터뷰 접속 링크 사전 테스트', category: '복장/기타' });
    }

    // Check for dress code
    if (/복장|정장|캐주얼/i.test(raw) && !checklistItems.some(i => i.text.includes('복장'))) {
      extracted.push({ text: '단정한 면접 복장(비즈니스 캐주얼 또는 정장) 점검', category: '복장/기타' });
    }

    if (extracted.length > 0) {
      const newItems: NoticeChecklistItem[] = extracted.map(item => ({
        id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: item.text,
        checked: false,
        category: item.category,
      }));
      setChecklistItems(prev => [...prev, ...newItems]);
      setOcrStatus(`본문에서 ${newItems.length}개의 준비물 및 시험 장소 체크 항목을 자동 추출했습니다.`);
      setTimeout(() => setOcrStatus(null), 3500);
    } else {
      setOcrStatus('본문에서 추가로 추출할 체크 항목이 없습니다.');
      setTimeout(() => setOcrStatus(null), 2500);
    }
  };

  // Image Upload handler (supports multiple photos)
  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setOcrStatus(`${files.length}개의 이미지 최적화 중...`);
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const optimized = await optimizeImageDataUrl(file);
        newImages.push(optimized);
      }
      setImageUrls(prev => {
        const next = [...prev, ...newImages];
        return next;
      });
      setActiveImageIndex(imageUrls.length);
      setOcrStatus(`${files.length}장의 사진이 추가되었습니다.`);
      setTimeout(() => setOcrStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setOcrStatus('이미지 로딩 실패');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeImageIndex >= updated.length) {
        setActiveImageIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  // OCR Text Extraction from the currently active image
  const handleExtractTextWithOcr = async () => {
    const currentActiveImage = imageUrls[activeImageIndex];
    if (!currentActiveImage) return;
    setIsOcrLoading(true);
    setOcrStatus(`사진 ${activeImageIndex + 1}을(를) Gemini 3.8 Flash OCR로 판독 중...`);

    try {
      const imgMime = currentActiveImage.startsWith('data:image/svg')
        ? 'image/svg+xml'
        : currentActiveImage.startsWith('data:image/webp')
        ? 'image/webp'
        : currentActiveImage.startsWith('data:image/jpeg')
        ? 'image/jpeg'
        : 'image/png';

      const res = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `stage_notice_capture_${activeImageIndex + 1}.png`,
          fileBase64: currentActiveImage,
          mimeType: imgMime,
          category: 'job_posting',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          let extractedText = '';
          if (d.memo) extractedText += d.memo + '\n';
          if (d.interviewDate) {
            setInterviewDate(d.interviewDate);
            extractedText += `■ 면접 일시: ${d.interviewDate}\n`;
          }
          if (d.location) {
            setLocation(d.location);
            extractedText += `■ 면접 장소: ${d.location}\n`;
          }
          if (d.title && !title) {
            setTitle(d.title);
          }

          if (extractedText) {
            setContent(prev => (prev ? prev + '\n\n' + extractedText : extractedText));
            setOcrStatus('OCR 분석 완료! 일정과 장소가 자동 추출되었습니다.');
          } else {
            setOcrStatus('문자 추출이 완료되었습니다.');
          }

          // Also suggest or add supplies/location checklist from OCR memo
          if (d.memo) {
            const rawMemo = d.memo;
            if (/신분증|수험표|제출서류|증명서|도착|대기실|복장/i.test(rawMemo)) {
              setTimeout(() => {
                handleExtractChecklistFromText();
              }, 500);
            }
          }
        } else {
          setOcrStatus('이미지가 성공적으로 연결되었습니다.');
        }
      } else {
        setOcrStatus('텍스트를 직접 입력할 수 있습니다.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrStatus('수동으로 본문과 일정을 작성하실 수 있습니다.');
    } finally {
      setIsOcrLoading(false);
      setTimeout(() => setOcrStatus(null), 4000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('안내문 또는 문자 제목을 입력해주세요.');
      return;
    }

    const newNotice: StageNotice = {
      id: editingNotice ? editingNotice.id : `notice-${Date.now()}`,
      stage,
      title: title.trim(),
      noticeType,
      content: content.trim(),
      imageUrl: imageUrls[0] || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      sender: sender.trim() || `[${application.company} 채용팀]`,
      receivedDate: receivedDate || new Date().toISOString().split('T')[0],
      interviewDate: interviewDate.trim() || undefined,
      location: location.trim() || undefined,
      locationDetail: locationDetail.trim() || undefined,
      dressCode: dressCode.trim() || undefined,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
      notes: notes.trim() || undefined,
      createdAt: editingNotice ? editingNotice.createdAt : new Date().toISOString(),
    };

    onSaveNotice(newNotice, { syncSchedule, syncTask });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs ${
              noticeType === 'sms' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {noticeType === 'sms' ? (
                <IconMessageSquare className="w-5 h-5" />
              ) : (
                <IconFileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingNotice ? '전형 안내문 / 문자 수정' : '전형 안내문 & 준비물·장소 체크'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                  {application.company}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {stage === '서류합격'
                  ? '서류 합격 후 수신한 면접 안내 문자(SMS/알림톡) 및 시험장소·준비물을 체크합니다.'
                  : '면접 전형별 합격 안내문과 함께 지참할 준비물, 시험 장소, 동선을 보관합니다.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Quick Presets / Templates */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconSparkles className="w-3.5 h-3.5 text-amber-500" />
                원클릭 추천 템플릿 불러오기
              </span>
              <span className="text-[11px] text-slate-400">클릭 시 안내문 내용, 시험장소, 준비물 체크리스트가 즉시 채워집니다</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {NOTICE_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-1"
                >
                  {tpl.noticeType === 'sms' ? '💬' : '📄'} {tpl.title.split(']')[0]}] {tpl.title.split(']')[1]?.slice(0, 15)}...
                </button>
              ))}
            </div>
          </div>

          {/* Type and Stage Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                전형 단계 <span className="text-rose-500">*</span>
              </label>
              <select
                value={stage}
                onChange={e => {
                  const newStage = e.target.value as ApplicationStage;
                  setStage(newStage);
                  if (newStage === '서류접수') {
                    setNoticeType('email');
                    setTitle(`[서류 접수] 입사지원서 접수 완료 및 서류전형 일정 안내`);
                  } else if (newStage === '서류합격') {
                    setNoticeType('sms');
                    setTitle(`[서류 합격] 1차 면접 안내 문자 (SMS)`);
                  } else if (newStage === '필기/코딩테스트') {
                    setNoticeType('document');
                    setTitle(`[필기/코테] 수험표 및 코딩테스트 시험 안내`);
                  } else if (newStage === '1차면접') {
                    setNoticeType('sms');
                    setTitle(`[1차 면접] 직무역량 기술면접 안내 문자`);
                  } else if (newStage === '2차/최종면접') {
                    setNoticeType('document');
                    setTitle(`[2차 면접] 2차 최종 임원면접 공식 안내문`);
                  } else if (newStage === '최종합격') {
                    setNoticeType('document');
                    setTitle(`[최종 합격] 최종 합격 통지서 및 입사 안내문`);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-500"
              >
                <option value="서류접수">서류접수 (접수 확인증/공고)</option>
                <option value="서류합격">서류합격 (1차 면접안내 문자)</option>
                <option value="필기/코딩테스트">필기/코딩테스트 (수험표/가이드)</option>
                <option value="1차면접">1차면접 (1차 기술/직무면접 안내)</option>
                <option value="2차/최종면접">2차/최종면접 (2차 최종 임원면접 안내문)</option>
                <option value="최종합격">최종합격 (최종합격 통지서/입사안내)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                안내문 형태 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setNoticeType('sms')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    noticeType === 'sms'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <IconMessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  문자(SMS)
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeType('document')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    noticeType === 'document'
                      ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <IconFileText className="w-3.5 h-3.5 text-blue-600" />
                  공식안내문
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeType('email')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                    noticeType === 'email'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <IconMail className="w-3.5 h-3.5 text-indigo-600" />
                  이메일
                </button>
              </div>
            </div>
          </div>

          {/* Title and Sender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                안내문 / 문자 제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: [서류 합격] 1차 직무역량 면접 안내 문자"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                발신처
              </label>
              <input
                type="text"
                value={sender}
                onChange={e => setSender(e.target.value)}
                placeholder="예: [NAVER 채용팀]"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Interview Date & Location Section */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                  <IconCalendar className="w-3.5 h-3.5 text-blue-600" />
                  면접 / 시험 일시
                </label>
                <input
                  type="text"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  placeholder="YYYY-MM-DD 또는 2026.10.04 14:00"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                  <IconMapPin className="w-3.5 h-3.5 text-rose-500" />
                  시험 / 면접 장소 (대표 위치)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="예: NAVER 1784 사옥 4층 인터뷰룸 또는 온라인(Google Meet)"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location Detail & Dress Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-blue-100">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <span>📍 오시는 길 / 세부 호실 / 대기실 / 화상접속 링크</span>
                </label>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={e => setLocationDetail(e.target.value)}
                  placeholder="예: 정자역 3번 출구 도보 6분, 1층 로비 인포데스크 출입증 수령 / https://meet.google.com/..."
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <span>👔 권장 면접 복장</span>
                </label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={e => setDressCode(e.target.value)}
                  placeholder="예: 단정한 비즈니스 캐주얼 / 셔츠"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Checklist for Supplies & Test Location (준비물 및 시험장소 체크리스트) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <IconCheckSquare className="w-4 h-4 text-emerald-600" />
                  전형별 준비물 & 시험 장소 체크리스트
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  {checklistItems.filter(i => i.checked).length} / {checklistItems.length} 완료
                </span>
              </div>
              <button
                type="button"
                onClick={handleExtractChecklistFromText}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 self-start sm:self-auto hover:underline"
              >
                <IconSparkles className="w-3 h-3 text-amber-500" />
                <span>안내문 본문에서 준비물·장소 자동 추출</span>
              </button>
            </div>

            {/* Quick Presets Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">빠른 항목 추가 (클릭 시 추가):</span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('본인 사진 부착 신분증 원본 (주민등록증/운전면허증)', '준비물')}
                  className="px-2 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 🪪 신분증 원본
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('수험표 및 면접 참석 안내문 출력본', '준비물')}
                  className="px-2 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 📄 수험표 출력본
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('포트폴리오 출력본 2~3부 및 발표자료', '준비물')}
                  className="px-2 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 📁 포트폴리오 사본
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('대학교 졸업(예정)증명서 및 성적표 원본', '준비물')}
                  className="px-2 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 🎓 졸업/성적 증명서
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('시험/면접 장소 위치 및 대중교통 이동 동선 사전 확인', '시험장소')}
                  className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 🚇 이동 동선 확인
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('면접 시작 20분 전 1층 대기실/인포데스크 도착 완료', '시험장소')}
                  className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + ⏱ 20분 전 도착 입실
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('웹캠/마이크 음질 및 화상 인터뷰 링크 사전 테스트', '복장/기타')}
                  className="px-2 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 💻 화상 장비 점검
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetChecklistItem('단정한 면접 복장(비즈니스 캐주얼/정장) 점검', '복장/기타')}
                  className="px-2 py-1 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 rounded-md text-[11px] font-medium transition-colors"
                >
                  + 👔 복장 점검
                </button>
              </div>
            </div>

            {/* Checklist items list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {checklistItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-colors ${
                    item.checked
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer select-none text-xs">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 shrink-0"
                    />
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        item.category === '준비물'
                          ? 'bg-amber-100 text-amber-800'
                          : item.category === '시험장소'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.category || '준비물'}
                    </span>
                    <span className={item.checked ? 'line-through text-slate-400' : 'font-medium'}>
                      {item.text}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    title="항목 삭제"
                  >
                    <IconTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {checklistItems.length === 0 && (
                <p className="text-center py-3 text-xs text-slate-400">
                  등록된 준비물 또는 시험 장소 체크 항목이 없습니다. 위의 추천 항목을 클릭하거나 직접 추가해주세요.
                </p>
              )}
            </div>

            {/* Custom Item Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <select
                value={newChecklistCategory}
                onChange={e => setNewChecklistCategory(e.target.value as '준비물' | '시험장소' | '복장/기타')}
                className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold shrink-0 focus:outline-hidden focus:border-blue-500"
              >
                <option value="준비물">🎒 준비물</option>
                <option value="시험장소">📍 시험장소</option>
                <option value="복장/기타">👔 복장/기타</option>
              </select>
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomChecklistItem();
                  }
                }}
                placeholder="직접 준비물이나 시험 장소 유의사항 입력 (Enter)"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomChecklistItem()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                추가
              </button>
            </div>
          </div>

          {/* Image Upload & OCR section (Multiple Images Support) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconUploadCloud className="w-4 h-4 text-blue-600" />
                <span>수신 문자 캡처 또는 안내문 원본 사진</span>
                {imageUrls.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {imageUrls.length}장 첨부됨
                  </span>
                )}
              </label>

              {imageUrls.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                    <span>사진 추가</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrls([]);
                      setActiveImageIndex(0);
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <IconTrash2 className="w-3 h-3" />
                    <span>전체 삭제</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input supporting multiple files */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleImageFiles}
              className="hidden"
            />

            {imageUrls.length > 0 ? (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-200 space-y-3">
                {/* Active Photo Main Display with Left/Right arrows */}
                <div className="relative w-full h-44 sm:h-52 bg-slate-950/80 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                  {/* Previous Button */}
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : imageUrls.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700 transition-all hover:scale-110 active:scale-95"
                      title="이전 사진"
                    >
                      <IconChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Active Image */}
                  <img
                    src={imageUrls[activeImageIndex]}
                    alt={`안내문 사진 ${activeImageIndex + 1}`}
                    className="h-full max-w-full object-contain"
                  />

                  {/* Top-Left Page Counter */}
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-slate-900/85 border border-slate-700/80 text-[11px] font-mono font-bold text-white flex items-center gap-1.5">
                    <IconImage className="w-3 h-3 text-blue-400" />
                    <span>사진 {activeImageIndex + 1} / {imageUrls.length}</span>
                  </div>

                  {/* Top-Right Delete Current Photo */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(activeImageIndex)}
                    className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white text-[11px] font-medium flex items-center gap-1 shadow-xs transition-colors"
                    title="현재 사진 삭제"
                  >
                    <IconTrash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">이 사진 삭제</span>
                  </button>

                  {/* Next Button */}
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex(prev => (prev < imageUrls.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center border border-slate-700 transition-all hover:scale-110 active:scale-95"
                      title="다음 사진"
                    >
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Horizontal Thumbnails Carousel Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                  {imageUrls.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`group relative w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-blue-500 ring-2 ring-blue-400/40 scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                      }`}
                      title={`${idx + 1}번째 사진 선택`}
                    >
                      <img src={img} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 px-1 text-[9px] font-bold bg-slate-900/85 text-white rounded-tl">
                        {idx + 1}
                      </span>
                    </div>
                  ))}

                  {/* Add more button thumbnail */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-400 bg-slate-800/60 hover:bg-blue-900/30 text-slate-400 hover:text-blue-300 shrink-0 flex flex-col items-center justify-center gap-0.5 transition-colors"
                    title="추가 사진 올리기"
                  >
                    <IconPlus className="w-4 h-4" />
                    <span className="text-[10px] font-bold">추가</span>
                  </button>
                </div>

                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px]">
                    좌우 화살표 버튼 또는 아래 썸네일을 클릭하여 사진을 넘겨볼 수 있습니다.
                  </span>
                  <button
                    type="button"
                    disabled={isOcrLoading}
                    onClick={handleExtractTextWithOcr}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isOcrLoading ? (
                      <>
                        <IconRotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>OCR 텍스트 추출 중...</span>
                      </>
                    ) : (
                      <>
                        <IconSparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>현재 사진 텍스트 추출 (Gemini OCR)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 cursor-pointer text-center transition-colors space-y-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <IconUploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  수신한 문자 화면 캡처 또는 안내문 사진을 클릭하여 업로드 (여러 장 가능)
                </p>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WebP 지원 • 여러 장을 한 번에 선택하거나 계속 추가할 수 있습니다
                </p>
              </div>
            )}

            {ocrStatus && (
              <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">
                <IconCheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{ocrStatus}</span>
              </div>
            )}
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              안내문 전문 / 문자 내용 본문 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="수신한 문자 메시지 전문이나 안내문 내용을 붙여넣거나 입력해주세요.&#10;&#10;예:&#10;[NAVER] 지현명님 서류 전형 합격을 축하드립니다.&#10;■ 1차 직무면접 안내&#10;- 일시: 2026.10.04 14:00&#10;- 장소: NAVER 1784 사옥&#10;- 준비물: 신분증, 포트폴리오 출력본"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>

          {/* Notes / Checkpoints */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              나의 면접 대비 메모 / 핵심 답변 포인트
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="예: CS 지필고사(OS, 네트워크) 복습, 1분 자기소개 암기, 포트폴리오 아키텍처 다이어그램 지참"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Automation Checkboxes */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncSchedule}
                onChange={e => setSyncSchedule(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                공고의 메인 면접 일정(일시·장소)을 이 안내문 내용으로 자동 갱신하기
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncTask}
                onChange={e => setSyncTask(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                캘린더 D-Day 할 일(Task)에 [{stage}] 면접 참석 일정 자동 등록하기
              </span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <IconCheckSquare className="w-4 h-4" />
              <span>{editingNotice ? '안내문 및 체크리스트 수정 완료' : '안내문 및 체크리스트 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
