// Sample templates and SVG visual generators for Stage Notices (면접 안내 문자, 최종면접 안내문)
import { NoticeType, StageNotice, ApplicationStage, NoticeChecklistItem } from '../types/index.ts';

export interface NoticeTemplatePreset {
  id: string;
  stage: ApplicationStage;
  noticeType: NoticeType;
  title: string;
  sender: string;
  content: string;
  interviewDateOffsetDays: number;
  location: string;
  locationDetail?: string;
  dressCode?: string;
  checklistItems?: NoticeChecklistItem[];
  notes: string;
  previewSvgDataUrl: string;
}

// Helper to encode SVG string to Data URL
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

// Generate a smartphone SMS / KakaoTalk notification card SVG
export function createInterviewSmsSvg(
  company: string = '네이버 (NAVER)',
  dateText: string = '2026.10.04 (일) 14:00',
  location: string = 'NAVER 1784 사옥 4층 인터뷰룸'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 620" width="450" height="620">
    <defs>
      <linearGradient id="phoneBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#f1f5f9"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Background card -->
    <rect width="450" height="620" rx="28" fill="url(#phoneBg)"/>
    <rect x="1" y="1" width="448" height="618" rx="27" fill="none" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Smartphone Header Bar -->
    <rect x="175" y="14" width="100" height="18" rx="9" fill="#0f172a"/>
    <text x="32" y="27" fill="#64748b" font-size="11" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif">09:41</text>
    <text x="418" y="27" text-anchor="end" fill="#64748b" font-size="11" font-family="-apple-system, BlinkMacSystemFont, sans-serif">5G 95%</text>

    <!-- Top Navigation -->
    <rect x="0" y="44" width="450" height="52" fill="#ffffff"/>
    <line x1="0" y1="96" x2="450" y2="96" stroke="#f1f5f9" stroke-width="1.5"/>
    <circle cx="48" cy="70" r="16" fill="#eff6ff"/>
    <text x="48" y="75" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="bold" font-family="sans-serif">HR</text>
    <text x="76" y="67" fill="#0f172a" font-size="14" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${company} 채용팀</text>
    <text x="76" y="83" fill="#64748b" font-size="11" font-family="sans-serif">공식 알림톡 / 수신 확인됨</text>

    <!-- Timestamp -->
    <rect x="170" y="112" width="110" height="22" rx="11" fill="#e2e8f0"/>
    <text x="225" y="127" text-anchor="middle" fill="#475569" font-size="11" font-weight="600" font-family="sans-serif">오늘 오전 09:30</text>

    <!-- SMS Message Bubble -->
    <g filter="url(#shadow)">
      <rect x="24" y="146" width="402" height="440" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    </g>

    <!-- Header tag inside message -->
    <rect x="42" y="166" width="135" height="24" rx="6" fill="#fef3c7"/>
    <text x="48" y="182" fill="#92400e" font-size="11" font-weight="bold" font-family="sans-serif">[서류 합격] 1차 면접 안내</text>

    <text x="42" y="215" fill="#0f172a" font-size="15" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, sans-serif">[${company}] 서류전형 결과 발표</text>

    <text x="42" y="244" fill="#334155" font-size="12.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif">지현명 지원자님, 축하드립니다!</text>
    <text x="42" y="266" fill="#334155" font-size="12.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif">귀하께서는 당사 서류 전형에 우수한 성적으로</text>
    <text x="42" y="286" fill="#334155" font-size="12.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif">합격하셨기에 1차 직무역량 면접을 안내드립니다.</text>

    <!-- Details Box inside Bubble -->
    <rect x="40" y="306" width="370" height="154" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="3 3"/>

    <text x="56" y="332" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">📌 면접 일시:</text>
    <text x="140" y="332" fill="#2563eb" font-size="12" font-weight="bold" font-family="sans-serif">${dateText}</text>

    <text x="56" y="360" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">🏢 면접 장소:</text>
    <text x="140" y="360" fill="#0f172a" font-size="12" font-weight="medium" font-family="sans-serif">${location}</text>

    <text x="56" y="388" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">👔 권장 복장:</text>
    <text x="140" y="388" fill="#475569" font-size="12" font-family="sans-serif">단정한 비즈니스 캐주얼 / 자율</text>

    <text x="56" y="416" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">🆔 필수 지참:</text>
    <text x="140" y="416" fill="#475569" font-size="12" font-family="sans-serif">본인 사진 부착 신분증(주민등록증/운전면허증)</text>

    <text x="56" y="442" fill="#1e293b" font-size="12" font-weight="bold" font-family="sans-serif">⏱ 대기 시간:</text>
    <text x="140" y="442" fill="#dc2626" font-size="12" font-weight="bold" font-family="sans-serif">면접 시작 20분 전 로비 안내데스크 도착</text>

    <!-- Footer button mockup -->
    <rect x="42" y="480" width="366" height="42" rx="10" fill="#2563eb"/>
    <text x="225" y="506" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif">채용 포털에서 면접 참석 여부 확정하기</text>

    <text x="225" y="555" text-anchor="middle" fill="#94a3b8" font-size="10.5" font-family="sans-serif">※ 본 문자는 채용시스템에서 자동 발송되었습니다.</text>
  </svg>`;
  return svgToDataUrl(svg);
}

// Generate an official final interview notice document card SVG
export function createFinalNoticeSvg(
  company: string = '카카오 (Kakao)',
  dateText: string = '2026.09.27 (토) 15:30',
  location: string = '판교 카카오 아지트 7층 접견실'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 620" width="450" height="620">
    <defs>
      <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fafafa"/>
      </linearGradient>
      <filter id="docShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="5" stdDeviation="8" flood-opacity="0.1"/>
      </filter>
    </defs>

    <!-- Outer frame -->
    <rect width="450" height="620" fill="#f1f5f9"/>

    <!-- Document Page -->
    <g filter="url(#docShadow)">
      <rect x="25" y="25" width="400" height="570" rx="12" fill="url(#docGrad)" stroke="#cbd5e1" stroke-width="1"/>
    </g>

    <!-- Document Header & Logo -->
    <rect x="45" y="45" width="85" height="26" rx="6" fill="#0f172a"/>
    <text x="87" y="62" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" font-family="sans-serif">OFFICIAL</text>
    <text x="405" y="62" text-anchor="end" fill="#64748b" font-size="11" font-family="sans-serif">문서번호: HR-2026-FINAL-09</text>

    <line x1="45" y1="84" x2="405" y2="84" stroke="#0f172a" stroke-width="2"/>

    <!-- Document Title -->
    <text x="225" y="125" text-anchor="middle" fill="#0f172a" font-size="18" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, sans-serif">2차 최종 면접(임원면접) 시행 안내문</text>
    <text x="225" y="148" text-anchor="middle" fill="#64748b" font-size="12" font-family="sans-serif">${company} 2026 채용 연계 전형</text>

    <!-- Receiver & Salutation -->
    <rect x="45" y="168" width="360" height="34" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="60" y="190" fill="#0f172a" font-size="12" font-weight="bold" font-family="sans-serif">수신: 지현명 지원자 귀하</text>
    <text x="390" y="190" text-anchor="end" fill="#059669" font-size="11" font-weight="bold" font-family="sans-serif">1차 면접 합격</text>

    <!-- Body Text -->
    <text x="45" y="228" fill="#334155" font-size="12" font-family="-apple-system, BlinkMacSystemFont, sans-serif">1차 실무 인터뷰에 최종 합격하신 것을 진심으로 축하드립니다.</text>
    <text x="45" y="248" fill="#334155" font-size="12" font-family="-apple-system, BlinkMacSystemFont, sans-serif">당사의 최종 선발을 위한 2차 임원/컬처핏 인터뷰 일정을 아래와 같이</text>
    <text x="45" y="268" fill="#334155" font-size="12" font-family="-apple-system, BlinkMacSystemFont, sans-serif">공지하오니 기한 내 참석 준비를 완료해 주시기 바랍니다.</text>

    <!-- Details Table -->
    <rect x="45" y="286" width="360" height="186" rx="8" fill="#ffffff" stroke="#cbd5e1"/>

    <rect x="45" y="286" width="100" height="37" fill="#f1f5f9" rx="8 0 0 0"/>
    <text x="58" y="310" fill="#334155" font-size="11.5" font-weight="bold" font-family="sans-serif">최종면접 일시</text>
    <text x="156" y="310" fill="#2563eb" font-size="12" font-weight="bold" font-family="sans-serif">${dateText}</text>
    <line x1="45" y1="323" x2="405" y2="323" stroke="#e2e8f0"/>

    <rect x="45" y="324" width="100" height="37" fill="#f1f5f9"/>
    <text x="58" y="348" fill="#334155" font-size="11.5" font-weight="bold" font-family="sans-serif">면접 장소</text>
    <text x="156" y="348" fill="#0f172a" font-size="12" font-weight="medium" font-family="sans-serif">${location}</text>
    <line x1="45" y1="361" x2="405" y2="361" stroke="#e2e8f0"/>

    <rect x="45" y="362" width="100" height="37" fill="#f1f5f9"/>
    <text x="58" y="386" fill="#334155" font-size="11.5" font-weight="bold" font-family="sans-serif">면접 형식</text>
    <text x="156" y="386" fill="#475569" font-size="11.5" font-family="sans-serif">다대일 심층 면접 (임원 3인 / 지원자 1인, 40분)</text>
    <line x1="45" y1="399" x2="405" y2="399" stroke="#e2e8f0"/>

    <rect x="45" y="400" width="100" height="37" fill="#f1f5f9"/>
    <text x="58" y="424" fill="#334155" font-size="11.5" font-weight="bold" font-family="sans-serif">제출 서류</text>
    <text x="156" y="424" fill="#475569" font-size="11" font-family="sans-serif">대학 졸업(예정)증명서 원본, 공인어학성적표 사본</text>
    <line x1="45" y1="437" x2="405" y2="437" stroke="#e2e8f0"/>

    <rect x="45" y="438" width="100" height="34" fill="#f1f5f9" rx="0 0 0 8"/>
    <text x="58" y="460" fill="#334155" font-size="11.5" font-weight="bold" font-family="sans-serif">안내 및 주의</text>
    <text x="156" y="460" fill="#e11d48" font-size="11" font-weight="bold" font-family="sans-serif">면접 30분 전 1층 인포데스크 출입증 수령 필수</text>

    <!-- Official Stamp Mark -->
    <circle cx="340" cy="525" r="32" fill="none" stroke="#dc2626" stroke-width="2.5" opacity="0.85"/>
    <circle cx="340" cy="525" r="26" fill="none" stroke="#dc2626" stroke-width="1" stroke-dasharray="2 2" opacity="0.85"/>
    <text x="340" y="522" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="bold" font-family="sans-serif">주식회사</text>
    <text x="340" y="534" text-anchor="middle" fill="#dc2626" font-size="9.5" font-weight="bold" font-family="sans-serif">${company.slice(0, 4)} 직인</text>

    <!-- Sign-off -->
    <text x="60" y="515" fill="#475569" font-size="11" font-family="sans-serif">문의처: ${company} 인재영입팀 (recruit@company.com)</text>
    <text x="60" y="535" fill="#0f172a" font-size="13" font-weight="bold" font-family="sans-serif">${company} 채용인사위원회</text>
  </svg>`;
  return svgToDataUrl(svg);
}

// Preset templates for quick 1-click registration
export const NOTICE_TEMPLATES: NoticeTemplatePreset[] = [
  {
    id: 'template-naver-interview',
    stage: '서류합격',
    noticeType: 'sms',
    title: '[서류 합격] 1차 직무면접 안내 문자 (SMS)',
    sender: '[NAVER 채용팀]',
    content: `[NAVER] 안녕하세요 지현명님, 클라우드 플랫폼 백엔드 개발자 서류 전형 합격을 진심으로 축하드립니다.\n\n■ 1차 직무역량 기술면접 안내\n- 일시: 2026년 10월 4일(일) 14:00 (15분 전 도착 대기)\n- 방식: NAVER 1784 사옥 4층 인터뷰룸 대면 면접\n- 면접 내용: CS 기본기, 제출 포트폴리오 코드 아키텍처 리뷰, 직무 역량 검증\n- 준비물: 신분증(주민등록증 또는 운전면허증)\n- 복장: 단정한 자율 복장\n\n상세한 안내 및 참석 확인은 네이버 채용 포털을 확인해 주시기 바랍니다.`,
    interviewDateOffsetDays: 22,
    location: '경기 성남시 분당구 1784 사옥 4층 인터뷰룸',
    locationDetail: '신분당선/수인분당선 정자역 3번 출구 도보 6분 (1784 로비 안내데스크 출입증 수령)',
    dressCode: '단정한 자율 복장 (비즈니스 캐주얼 / 셔츠)',
    checklistItems: [
      { id: 'nv-1', text: '본인 신분증 (주민등록증 또는 운전면허증 지참)', checked: true, category: '준비물' },
      { id: 'nv-2', text: '포트폴리오 출력본 2부 및 깃허브 코드 아키텍처 요약', checked: true, category: '준비물' },
      { id: 'nv-3', text: '1784 사옥 위치 및 지하철 정자역 이동 경로 사전 확인', checked: true, category: '시험장소' },
      { id: 'nv-4', text: '면접 시작 20분 전(13:40) 1층 로비 도착 및 방문증 수령', checked: false, category: '시험장소' },
      { id: 'nv-5', text: '단정한 자율 복장 착용 점검', checked: false, category: '복장/기타' },
    ],
    notes: 'CS 전공지식(OS, 네트워크, DB 트랜잭션) 및 깃허브 코드 리뷰 준비',
    previewSvgDataUrl: createInterviewSmsSvg('네이버 (NAVER)', '2026.10.04 (일) 14:00', 'NAVER 1784 사옥 4층 인터뷰룸'),
  },
  {
    id: 'template-kakao-final',
    stage: '2차/최종면접',
    noticeType: 'document',
    title: '[1차 면접 합격] 2차 최종 임원면접 공식 안내문',
    sender: '[카카오 인사팀 (HR)]',
    content: `[카카오] 1차 기술 인터뷰 합격 안내 및 2차 최종 컬처핏 면접 일정 안내문\n\n1차 기술 인터뷰에 최종 합격하셨습니다.\n2차 최종 인터뷰는 카카오 판교 아지트에서 대면으로 진행됩니다.\n\n- 면접 일시: 2026년 9월 27일(토) 15:30\n- 장소: 경기 성남시 판교 카카오 아지트 7층 접견실\n- 면접 형식: 임원 3인 / 지원자 1인 심층 면접 (40분 진행)\n- 지참 서류: 대학교 졸업(예정)증명서 원본, 공인 어학 성적표 사본\n- 안내 사항: 면접 시작 30분 전 1층 인포데스크에서 방문 출입증을 수령하시기 바랍니다.`,
    interviewDateOffsetDays: 15,
    location: '경기 성남시 판교 카카오 아지트 7층 접견실',
    locationDetail: '신분당선 판교역 1번 출구 도보 2분 카카오 판교 아지트',
    dressCode: '비즈니스 캐주얼 또는 깔끔한 정장',
    checklistItems: [
      { id: 'kk-1', text: '대학교 졸업(예정)증명서 원본 및 공인 어학 성적표 사본', checked: true, category: '준비물' },
      { id: 'kk-2', text: '본인 사진 부착 신분증 원본', checked: true, category: '준비물' },
      { id: 'kk-3', text: '판교 아지트 1층 인포데스크 출입증 수령 (30분 전 도착 필수)', checked: false, category: '시험장소' },
      { id: 'kk-4', text: '임원 면접용 1분 자기소개 및 카카오 컬처핏 답변 최종 정리', checked: false, category: '복장/기타' },
    ],
    notes: '카카오 크루 철학, 협업 갈등 해결 사례, 자기주도적 문제해결 경험 정리',
    previewSvgDataUrl: createFinalNoticeSvg('카카오 (Kakao)', '2026.09.27 (토) 15:30', '판교 카카오 아지트 7층 접견실'),
  },
  {
    id: 'template-samsung-interview',
    stage: '1차면접',
    noticeType: 'sms',
    title: '[SW테스트 합격] 직무역량 & 창의성 면접 안내 문자',
    sender: '[삼성전자 채용팀 031-200-XXXX]',
    content: `[삼성전자 DX부문] SW개발 3급 신입 채용 1차 면접 전형 안내\n\n지현명 지원자님, SW역량테스트 합격을 축하드립니다.\n직무역량 및 창의성 면접 전형 일정을 안내해 드립니다.\n\n- 일시: 2026년 9월 21일(월) 08:30 등록 (종일 진행)\n- 장소: 경기 수원시 영통구 삼성디지털시티 인재개발원\n- 준비물: 수험표, 신분증, 재학/졸업증명서\n- 복장: 정장 또는 비즈니스 캐주얼`,
    interviewDateOffsetDays: 9,
    location: '경기 수원시 영통구 삼성디지털시티 인재개발원',
    locationDetail: '수원 사업장 인재개발원 서문 안내실 (수원역 셔틀버스 탑승 가능)',
    dressCode: '단정한 정장 또는 비즈니스 캐주얼 (넥타이 자율)',
    checklistItems: [
      { id: 'ss-1', text: '삼성 채용포털 출력 수험표 지참', checked: true, category: '준비물' },
      { id: 'ss-2', text: '본인 신분증 (주민등록증 / 운전면허증)', checked: true, category: '준비물' },
      { id: 'ss-3', text: '재학/졸업증명서 및 전학년 성적증명서 원본', checked: false, category: '준비물' },
      { id: 'ss-4', text: '인재개발원 셔틀버스 탑승 위치(수원역 4번 출구) 확인', checked: true, category: '시험장소' },
      { id: 'ss-5', text: '08:30 등록 마감 20분 전 도착 완료', checked: false, category: '시험장소' },
    ],
    notes: 'SW 문제풀이 코드 설명 및 PT 발표 연습',
    previewSvgDataUrl: createInterviewSmsSvg('삼성전자 DX', '2026.09.21 (월) 08:30', '수원 삼성디지털시티 인재개발원'),
  },
  {
    id: 'template-toss-assignment',
    stage: '필기/코딩테스트',
    noticeType: 'email',
    title: '[서류 합격] 사전 과제 전형 및 기술 인터뷰 가이드',
    sender: '[토스 피플팀 recruit@toss.im]',
    content: `[토스 (Toss)] 서버 플랫폼 엔지니어 전형 안내\n\n서류 전형을 통과하셨습니다.\n다음 단계인 온라인 과제 전형 및 화상 기술 인터뷰를 안내드립니다.\n\n- 과제 제출 마감: 2026년 9월 17일 23:59\n- 1차 직무 인터뷰: 2026년 9월 30일 16:00 (Google Meet 화상 진행)\n- 화상 링크: https://meet.google.com/tos-tech-interview\n- 과제 내용: 대용량 트래픽 동시성 제어 및 캐시 전략 구현`,
    interviewDateOffsetDays: 18,
    location: '온라인 화상 면접 (Google Meet)',
    locationDetail: 'Google Meet 접속 링크: https://meet.google.com/tos-tech-interview (면접 5분 전 대기실 입장)',
    dressCode: '자율 복장 (편안하고 단정한 상의)',
    checklistItems: [
      { id: 'ts-1', text: '과제 완성본 GitHub 리포지토리 제출 완료 (마감 23:59)', checked: true, category: '준비물' },
      { id: 'ts-2', text: '웹캠, 마이크 음질 및 이어폰 사전 점검', checked: true, category: '준비물' },
      { id: 'ts-3', text: 'Google Meet 화상 접속 링크 사전 테스트', checked: true, category: '시험장소' },
      { id: 'ts-4', text: '조용하고 독립된 화상 면접 공간 확보', checked: false, category: '시험장소' },
      { id: 'ts-5', text: '화면 공유할 아키텍처 다이어그램 창 띄워두기', checked: false, category: '준비물' },
    ],
    notes: 'Spring Boot 멀티스레드 동시성 제어 과제 완성 후 GitHub 제출',
    previewSvgDataUrl: createInterviewSmsSvg('토스 (Toss)', '2026.09.30 (수) 16:00', '온라인 화상 면접 (Google Meet)'),
  },
  {
    id: 'template-final-pass',
    stage: '최종합격',
    noticeType: 'document',
    title: '[최종 합격] 최종 합격 통지서 및 신입사원 입사 안내문',
    sender: '[채용인사팀 HR]',
    content: `[최종 합격 통지] 당사 2026 공개채용에 최종 합격하신 것을 진심으로 축하드립니다.\n\n귀하의 탁월한 역량과 열정을 높이 평가하여 함께 일할 인재로 모시게 되었습니다.\n\n- 오리엔테이션 일시: 2026년 10월 12일(월) 09:00\n- 장소: 본사 2층 대강당 및 교육연수원\n- 필수 제출 서류: 채용 신체검사서, 주민등록등본 2부, 급여계좌 통장사본, 최종학력 졸업증명서\n- 안내 사항: 첫 출근일 08:40까지 본사 로비 인포데스크로 집결 바랍니다.`,
    interviewDateOffsetDays: 30,
    location: '본사 2층 대강당 및 인재개발 연수원',
    locationDetail: '지하철역 2번 출구 도보 3분 본사 정문 로비 (신분증 지참 후 사원증 임시 발급)',
    dressCode: '단정한 정장 (비즈니스 수트)',
    checklistItems: [
      { id: 'fn-1', text: '지정병원 채용 신체검사 결과서 원본 수령', checked: false, category: '준비물' },
      { id: 'fn-2', text: '주민등록등본 2부 및 신분증 사본', checked: false, category: '준비물' },
      { id: 'fn-3', text: '급여 지급용 통장 사본 (본인 명의)', checked: false, category: '준비물' },
      { id: 'fn-4', text: '본사 2층 대강당 첫 출근 이동 동선 및 출근길 확인', checked: true, category: '시험장소' },
      { id: 'fn-5', text: '첫 출근 단정한 정장 복장 준비', checked: false, category: '복장/기타' },
    ],
    notes: '근로계약서 확인 및 처우 협의 조건 검토, 연수원 입소 준비',
    previewSvgDataUrl: createFinalNoticeSvg('최종 합격 통지서', '2026.10.12 (월) 09:00', '본사 2층 대강당 및 인재개발원'),
  },
  {
    id: 'template-document-apply',
    stage: '서류접수',
    noticeType: 'email',
    title: '[서류 접수] 입사지원서 접수 완료 및 서류전형 일정 안내',
    sender: '[채용시스템 no-reply]',
    content: `[입사지원서 접수 완료]\n지원자님의 입사지원서가 정상적으로 접수되었습니다.\n\n- 지원 분야: SW 엔지니어링\n- 서류 심사 결과 발표 예정: 2026년 9월 22일(화) 17:00 채용 홈페이지 공지\n- 다음 전형: 1차 온라인 코딩테스트 및 직무역량 면접\n- 유의사항: 지원서 마감 후에는 수정이 불가하오니 제출 서류 목록을 다시 한번 점검해 주시기 바랍니다.`,
    interviewDateOffsetDays: 7,
    location: '채용 공식 홈페이지 (온라인 발표)',
    locationDetail: '채용 포털 마이페이지 > 지원현황 메뉴에서 합격 여부 확인',
    dressCode: '자율 (온라인 확인)',
    checklistItems: [
      { id: 'da-1', text: '이력서 및 포트폴리오 PDF 최신본 확인', checked: true, category: '준비물' },
      { id: 'da-2', text: '어학 성적 유효기간 및 등록번호 재확인', checked: true, category: '준비물' },
      { id: 'da-3', text: '서류 발표일(D-Day) 캘린더 등록 완료', checked: true, category: '시험장소' },
      { id: 'da-4', text: '자기소개서 사본 백업 및 예상 질문 정리', checked: false, category: '복장/기타' },
    ],
    notes: '서류 발표 전까지 코딩테스트 기출 알고리즘 및 전공 CS 복습',
    previewSvgDataUrl: createInterviewSmsSvg('채용시스템', '2026.09.22 (화) 17:00 발표', '채용 포털 마이페이지 온라인 확인'),
  },
];
