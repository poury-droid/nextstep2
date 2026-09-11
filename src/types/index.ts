export type ApplicationStage = 
  | '서류접수'
  | '서류합격'
  | '필기/코딩테스트'
  | '1차면접'
  | '2차/최종면접'
  | '최종합격'
  | '불합격';

export interface Application {
  id: string;
  company: string;
  position: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  stage: ApplicationStage;
  pdfFileName?: string;
  memo?: string;
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
  memo?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  avatarInitials: string;
}
