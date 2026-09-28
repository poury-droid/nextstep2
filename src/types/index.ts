export type ApplicationStage = 
  | '서류접수'
  | '서류합격'
  | '필기/코딩테스트'
  | '1차면접'
  | '2차/최종면접'
  | '최종합격'
  | '불합격';

export type NoticeType = 'sms' | 'document' | 'image' | 'email';

export interface NoticeChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category?: '준비물' | '시험장소' | '복장/기타';
}

export interface StageNotice {
  id: string;
  stage: ApplicationStage;
  title: string;
  noticeType: NoticeType;
  content: string;
  imageUrl?: string;
  imageUrls?: string[]; // Multiple photos attached to notice (SMS capture, guide pages, etc.)
  sender?: string;
  receivedDate?: string;
  interviewDate?: string;
  location?: string;
  locationDetail?: string; // 오시는 길 / 호실 / 화상접속 링크 등
  dressCode?: string; // 권장 복장
  checklistItems?: NoticeChecklistItem[]; // 전형단계별 준비물 및 시험장소 등 체크리스트
  notes?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  company: string;
  position: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  stage: ApplicationStage;
  pdfFileName?: string;
  imageUrl?: string; // Poster, scan, or exam ticket image
  stageNotices?: StageNotice[]; // 전형 단계별 합격/면접 안내문 (서류 합격 면접안내 문자, 최종면접 안내문 등)
  memo?: string;
  stageMemos?: Partial<Record<ApplicationStage, string>>; // 각 전형 단계별(서류, 1차면접, 2차면접 등) 분리된 대비 메모
  stageChecklists?: Partial<Record<ApplicationStage, NoticeChecklistItem[]>>; // 각 전형 단계별 추가 체크리스트
  writtenTestDate?: string; // YYYY-MM-DD
  interviewDate?: string; // YYYY-MM-DD
  replyDeadline?: string; // YYYY-MM-DD
  location?: string;
  subjects: string[];
  requiredDocuments: { name: string; checked: boolean }[];
  priority?: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  applicationId?: string;
  applicationName?: string;
  title: string;
  category: '서류' | '필기' | '면접' | '공통';
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: 'high' | 'normal' | 'low';
  createdAt: string;
}

export interface StudyBlock {
  id: string;
  subject: string;
  topic: string;
  hours: number;
  completed: boolean;
}

export interface StudyDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isExcluded?: boolean;
  blocks: StudyBlock[];
}

export interface StudyPlan {
  id: string;
  applicationId?: string;
  examName: string;
  examDate: string;
  targetScoreOrRank?: string;
  weekdayHours: number;
  weekendHours: number;
  subjects: { name: string; importance: number; currentLevel: string }[];
  availableDays: number[]; // 0 for Sun, 1 for Mon...
  excludedDates: string[];
  days: StudyDay[];
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  name: string;
  grade?: string;
  score?: string;
  issuer: string;
  acquiredDate: string; // YYYY-MM-DD
  expiresAt?: string; // YYYY-MM-DD
  imageUrl?: string; // Certificate or score report image
  memo?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  avatarInitials: string;
  photoURL?: string; // Google 계정 프로필 사진 (로그인 시)
}

export interface OcrAnalysisResult {
  documentType: 'job_posting' | 'certificate' | 'exam_ticket' | 'other';
  documentTypeLabel: string;
  ocrRawText: string;
  confidence: number; // 0 - 100 percentage
  detectedLanguage: string;
  wordCount: number;
  lineCount: number;
  company: string;
  position: string;
  title: string;
  deadline?: string;
  writtenTestDate?: string;
  interviewDate?: string;
  replyDeadline?: string;
  location?: string;
  scoreOrGrade?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  subjects: string[];
  requiredDocuments: string[];
  keyRequirements: string[];
  memo?: string;
  analysisSummary: string;
  imageUrl?: string;
}

