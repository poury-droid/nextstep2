// Utility to provide realistic visual sample posters and certificates as data URLs for OCR AI testing

export interface VisualSampleDoc {
  id: string;
  name: string;
  category: 'job_posting' | 'certificate' | 'exam_ticket';
  categoryLabel: string;
  description: string;
  badgeColor: string;
  previewDataUrl: string;
  fileName: string;
  ocrDefaultText: string;
  structuredDates?: {
    deadline?: string;
    writtenTestDate?: string;
    interviewDate?: string;
    replyDeadline?: string;
    issueDate?: string;
    expiryDate?: string;
  };
}

// Generate SVG Data URL for Samsung Electronics DX recruitment poster
function createSamsungPosterSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
    <defs>
      <linearGradient id="samsungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#07204b"/>
        <stop offset="60%" stop-color="#0d3b82"/>
        <stop offset="100%" stop-color="#144fb0"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#samsungGrad)"/>
    <circle cx="500" cy="150" r="180" fill="#38bdf8" opacity="0.08"/>
    <circle cx="100" cy="700" r="220" fill="#818cf8" opacity="0.07"/>

    <!-- Header badge -->
    <rect x="40" y="40" width="130" height="32" rx="16" fill="#ffffff" opacity="0.15"/>
    <text x="55" y="61" fill="#38bdf8" font-size="12" font-weight="900" font-family="sans-serif">SAMSUNG DX</text>

    <text x="40" y="115" fill="#93c5fd" font-size="14" font-weight="700" letter-spacing="2" font-family="sans-serif">2026 하반기 신입사원 공개채용</text>
    <text x="40" y="155" fill="#ffffff" font-size="28" font-weight="900" font-family="sans-serif">삼성전자 DX부문</text>
    <text x="40" y="190" fill="#ffffff" font-size="28" font-weight="900" font-family="sans-serif">S/W 개발 신입 채용</text>

    <!-- Content Box -->
    <rect x="40" y="220" width="520" height="530" rx="16" fill="#ffffff" opacity="0.97"/>

    <!-- Section: 모집 직무 -->
    <text x="65" y="260" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[모집 직무]</text>
    <text x="65" y="285" fill="#334155" font-size="13" font-family="sans-serif">▪ SW 개발 (클라우드 플랫폼 / 분산 시스템 / AI 인프라)</text>
    <text x="65" y="308" fill="#334155" font-size="13" font-family="sans-serif">▪ 근무지: 경기 수원 디지털시티 / 서울 R&amp;D 캠퍼스</text>

    <!-- Section: 전형 일정 -->
    <line x1="65" y1="330" x2="515" y2="330" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="65" y="360" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[전형 일정 및 마감]</text>
    <rect x="65" y="375" width="450" height="85" rx="10" fill="#eff6ff"/>
    <text x="80" y="400" fill="#1e40af" font-size="13" font-weight="700" font-family="sans-serif">1. 서류접수: 2026년 9월 16일(수) ~ 9월 25일(금) 17:00 마감</text>
    <text x="80" y="425" fill="#1e40af" font-size="13" font-weight="700" font-family="sans-serif">2. SW역량테스트(코딩테스트): 2026년 10월 11일(일) 실시</text>
    <text x="80" y="448" fill="#1e40af" font-size="13" font-weight="700" font-family="sans-serif">3. 직무/임원 면접 전형: 2026년 11월 4일(수) ~ 11월 12일</text>

    <!-- Section: 지원 자격 & 우대사항 -->
    <text x="65" y="490" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[지원 자격 및 평가 과목]</text>
    <text x="65" y="515" fill="#334155" font-size="13" font-family="sans-serif">▪ 평가 과목: C / C++ / Java / Python 알고리즘 역량 검정 (2문항 4시간)</text>
    <text x="65" y="538" fill="#334155" font-size="13" font-family="sans-serif">▪ 자격 요건: 2027년 2월 이전 졸업 또는 졸업 예정자</text>
    <text x="65" y="561" fill="#334155" font-size="13" font-family="sans-serif">▪ 어학 자격: OPIc IM1 이상 또는 토익스피킹 120점 이상 보유자</text>

    <!-- Section: 제출 서류 -->
    <line x1="65" y1="585" x2="515" y2="585" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="65" y="615" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[제출 필수 서류]</text>
    <text x="65" y="640" fill="#334155" font-size="13" font-family="sans-serif">▪ 삼성 채용홈페이지 온라인 입사지원서</text>
    <text x="65" y="663" fill="#334155" font-size="13" font-family="sans-serif">▪ 최종학교 전학년 성적증명서 및 졸업(예정)증명서</text>
    <text x="65" y="686" fill="#334155" font-size="13" font-family="sans-serif">▪ 공인 영어말하기 성적증명서 사본</text>

    <!-- Footer Notice -->
    <rect x="65" y="705" width="450" height="30" rx="6" fill="#f8fafc"/>
    <text x="80" y="725" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">※ 마감 시각 임박 시 서버 접속이 원활하지 않을 수 있으니 사전 제출 바랍니다.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate SVG Data URL for OPIc Score Certificate
function createOpicCertSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
    <defs>
      <linearGradient id="certBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffdfa"/>
        <stop offset="100%" stop-color="#fbf7ee"/>
      </linearGradient>
    </defs>
    <!-- Certificate Border -->
    <rect width="600" height="750" fill="url(#certBg)"/>
    <rect x="25" y="25" width="550" height="700" rx="12" fill="none" stroke="#b45309" stroke-width="3" opacity="0.6"/>
    <rect x="33" y="33" width="534" height="684" rx="8" fill="none" stroke="#d97706" stroke-width="1" opacity="0.4"/>

    <!-- Header Seal & Title -->
    <circle cx="300" cy="95" r="32" fill="#d97706" opacity="0.12"/>
    <text x="300" y="102" text-anchor="middle" fill="#92400e" font-size="16" font-weight="900" font-family="serif">ACTFL</text>

    <text x="300" y="150" text-anchor="middle" fill="#78350f" font-size="22" font-weight="900" letter-spacing="1" font-family="sans-serif">OFFICIAL OPIc SCORE REPORT</text>
    <text x="300" y="175" text-anchor="middle" fill="#a16207" font-size="13" font-weight="600" font-family="sans-serif">공인 영어 말하기 능력 평가 성적 인증서</text>

    <!-- Candidate Card -->
    <rect x="60" y="210" width="480" height="150" rx="10" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5"/>
    <text x="85" y="245" fill="#6b7280" font-size="12" font-weight="600" font-family="sans-serif">수험자 성명 (Candidate):</text>
    <text x="250" y="245" fill="#111827" font-size="14" font-weight="800" font-family="sans-serif">김인재 (KIM INJAE)</text>

    <text x="85" y="275" fill="#6b7280" font-size="12" font-weight="600" font-family="sans-serif">생년월일 (Birth Date):</text>
    <text x="250" y="275" fill="#111827" font-size="13" font-family="sans-serif">1999. 04. 12</text>

    <text x="85" y="305" fill="#6b7280" font-size="12" font-weight="600" font-family="sans-serif">평가 일자 (Test Date):</text>
    <text x="250" y="305" fill="#111827" font-size="13" font-weight="700" font-family="sans-serif">2026년 08월 15일</text>

    <text x="85" y="335" fill="#6b7280" font-size="12" font-weight="600" font-family="sans-serif">인증 번호 (Report No):</text>
    <text x="250" y="335" fill="#111827" font-size="13" font-family="monospace">ACTFL-2026-ENG-84920</text>

    <!-- Score Big Result Box -->
    <rect x="60" y="380" width="480" height="130" rx="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="300" y="415" text-anchor="middle" fill="#92400e" font-size="14" font-weight="800" font-family="sans-serif">취득 등급 (Proficiency Rating)</text>
    <text x="300" y="470" text-anchor="middle" fill="#b45309" font-size="44" font-weight="900" font-family="sans-serif">AL</text>
    <text x="300" y="495" text-anchor="middle" fill="#78350f" font-size="13" font-weight="700" font-family="sans-serif">Advanced Low (고급 최우수 등급)</text>

    <!-- Expiry & Validity Info -->
    <rect x="60" y="530" width="480" height="110" rx="10" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5"/>
    <text x="85" y="565" fill="#4b5563" font-size="13" font-weight="700" font-family="sans-serif">유효 기간 (Validity Period):</text>
    <text x="250" y="565" fill="#dc2626" font-size="13" font-weight="800" font-family="sans-serif">2026. 08. 15 ~ 2028. 08. 14 (2년)</text>

    <text x="85" y="598" fill="#4b5563" font-size="13" font-weight="700" font-family="sans-serif">시행 / 주관 기관:</text>
    <text x="250" y="598" fill="#111827" font-size="13" font-family="sans-serif">ACTFL / (주)크레듀 OPIc 한국위원회</text>

    <text x="85" y="625" fill="#4b5563" font-size="12" font-family="sans-serif">평가 언어: 영어 (English Speaking)</text>

    <!-- Footer Official Stamp Note -->
    <text x="300" y="685" text-anchor="middle" fill="#9ca3af" font-size="11" font-family="sans-serif">This document is electronically verified by ACTFL Testing Office Korea.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate SVG Data URL for Coding Test Exam Ticket
function createExamTicketSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
    <rect width="600" height="700" fill="#f8fafc"/>
    <rect x="30" y="30" width="540" height="640" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    
    <!-- Top Header Banner -->
    <rect x="30" y="30" width="540" height="75" rx="16" fill="#1e293b"/>
    <text x="60" y="75" fill="#ffffff" font-size="20" font-weight="900" font-family="sans-serif">2026 하반기 온라인 코딩테스트 수험표</text>

    <!-- Candidate details -->
    <text x="60" y="145" fill="#64748b" font-size="12" font-weight="700" font-family="sans-serif">수험 번호</text>
    <text x="60" y="175" fill="#0f172a" font-size="18" font-weight="900" font-family="monospace">2026-DX-90214</text>

    <text x="320" y="145" fill="#64748b" font-size="12" font-weight="700" font-family="sans-serif">성명 / 수험 직무</text>
    <text x="320" y="175" fill="#0f172a" font-size="16" font-weight="800" font-family="sans-serif">김인재 / SW 서버 개발</text>

    <!-- Exam Schedule Box -->
    <line x1="60" y1="205" x2="540" y2="205" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="60" y="225" width="480" height="120" rx="12" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
    <text x="85" y="260" fill="#1e40af" font-size="14" font-weight="800" font-family="sans-serif">▪ 시험 일시: 2026년 10월 11일(일) 09:00 ~ 12:30 (총 210분)</text>
    <text x="85" y="290" fill="#1e40af" font-size="13" font-family="sans-serif">▪ 입실 및 환경 검사: 08:30 ~ 08:50 (08:50 이후 접속 차단)</text>
    <text x="85" y="320" fill="#1e40af" font-size="13" font-family="sans-serif">▪ 시험 장소: 화상 플랫폼 사전 테스트 접속 링크 (사전 이메일 발송)</text>

    <!-- Requirements & Checklist -->
    <text x="60" y="380" fill="#0f172a" font-size="15" font-weight="800" font-family="sans-serif">필수 지참물 및 시험 규정</text>
    <text x="60" y="410" fill="#334155" font-size="13" font-family="sans-serif">1. 신분증: 주민등록증, 운전면허증, 유효 여권 중 택 1 (모바일 신분증 불가)</text>
    <text x="60" y="435" fill="#334155" font-size="13" font-family="sans-serif">2. 모니터링 장비: 웹캠 및 스마트폰 거치대 (양손과 모니터 동시 촬영)</text>
    <text x="60" y="460" fill="#334155" font-size="13" font-family="sans-serif">3. 평가 언어: C++, Java, Python 중 1개 언어 선택 응시</text>
    <text x="60" y="485" fill="#334155" font-size="13" font-family="sans-serif">4. 부정행위 방지: 듀얼 모니터 및 검색 엔진 사용 엄격히 금지</text>

    <!-- Barcode simulation -->
    <rect x="60" y="525" width="480" height="90" rx="8" fill="#f1f5f9"/>
    <text x="300" y="575" text-anchor="middle" fill="#334155" font-size="20" letter-spacing="8" font-family="monospace">||| | |||| || | ||||| |||| | ||</text>
    <text x="300" y="600" text-anchor="middle" fill="#64748b" font-size="11" font-family="monospace">AUTHENTICATION TOKEN: 90214-SAMSUNG-DX</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate SVG Data URL for Toss Recruitment
function createTossPosterSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
    <rect width="600" height="750" fill="#021b38"/>
    <circle cx="500" cy="120" r="160" fill="#0064ff" opacity="0.25"/>

    <text x="45" y="80" fill="#3182f6" font-size="24" font-weight="900" font-family="sans-serif">toss</text>
    <text x="45" y="130" fill="#ffffff" font-size="30" font-weight="900" font-family="sans-serif">코어 뱅킹 서버 엔지니어</text>
    <text x="45" y="165" fill="#90c2ff" font-size="16" font-weight="700" font-family="sans-serif">비바리퍼블리카 / 토스뱅크 대규모 공채</text>

    <!-- Content Card -->
    <rect x="45" y="195" width="510" height="510" rx="16" fill="#ffffff"/>
    
    <text x="75" y="240" fill="#191f28" font-size="16" font-weight="800" font-family="sans-serif">[서류 접수 및 전형 일정]</text>
    <rect x="75" y="255" width="450" height="80" rx="10" fill="#f2f8ff"/>
    <text x="95" y="285" fill="#1b64da" font-size="13" font-weight="700" font-family="sans-serif">▪ 서류 접수: 2026년 9월 28일(월) 23:59 마감</text>
    <text x="95" y="312" fill="#1b64da" font-size="13" font-weight="700" font-family="sans-serif">▪ 코딩테스트 및 직무 과제: 2026년 10월 5일(월) 진행</text>

    <text x="75" y="365" fill="#191f28" font-size="16" font-weight="800" font-family="sans-serif">[기술 스택 및 평가 과목]</text>
    <text x="75" y="392" fill="#4e5968" font-size="13" font-family="sans-serif">▪ Java, Kotlin, Spring Boot, MySQL, Kafka, Redis</text>
    <text x="75" y="415" fill="#4e5968" font-size="13" font-family="sans-serif">▪ 대규모 트래픽 분산 처리 및 금융 트랜잭션 무결성 설계</text>

    <text x="75" y="455" fill="#191f28" font-size="16" font-weight="800" font-family="sans-serif">[제출 필수 서류]</text>
    <text x="75" y="482" fill="#4e5968" font-size="13" font-family="sans-serif">▪ 자유 양식 이력서 및 경력 기술서 (PDF)</text>
    <text x="75" y="505" fill="#4e5968" font-size="13" font-family="sans-serif">▪ 깃허브(GitHub) 리포지토리 또는 기술 블로그 링크</text>

    <text x="75" y="545" fill="#191f28" font-size="16" font-weight="800" font-family="sans-serif">[근무지 및 보상]</text>
    <text x="75" y="572" fill="#4e5968" font-size="13" font-family="sans-serif">▪ 서울 강남구 테헤란로 142 아크플레이스</text>
    <text x="75" y="595" fill="#4e5968" font-size="13" font-family="sans-serif">▪ 업계 최고 수준의 사이닝 보너스 및 스톡옵션 부여</text>

    <rect x="75" y="630" width="450" height="45" rx="8" fill="#e8f3ff"/>
    <text x="95" y="658" fill="#1b64da" font-size="12" font-weight="700" font-family="sans-serif">전형 마감 직전까지 수정 접수가 가능하며 선착순 검토가 병행됩니다.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate SVG Data URL for Hyundai Motor SW recruitment poster
function createHyundaiPosterSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 780" width="600" height="780">
    <defs>
      <linearGradient id="hyundaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#002c5f"/>
        <stop offset="100%" stop-color="#001833"/>
      </linearGradient>
    </defs>
    <rect width="600" height="780" fill="url(#hyundaiGrad)"/>
    <circle cx="520" cy="100" r="140" fill="#00aad2" opacity="0.12"/>
    
    <text x="45" y="70" fill="#00aad2" font-size="13" font-weight="900" letter-spacing="3" font-family="sans-serif">HYUNDAI MOTOR GROUP</text>
    <text x="45" y="115" fill="#ffffff" font-size="28" font-weight="900" font-family="sans-serif">현대자동차 R&amp;D본부</text>
    <text x="45" y="150" fill="#6ee7b7" font-size="22" font-weight="800" font-family="sans-serif">자율주행 인포테인먼트 SW 연구원 채용</text>

    <!-- Card -->
    <rect x="45" y="180" width="510" height="555" rx="16" fill="#ffffff"/>

    <text x="75" y="225" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[주요 전형 일정]</text>
    <rect x="75" y="240" width="450" height="85" rx="10" fill="#f0fdf4"/>
    <text x="95" y="268" fill="#15803d" font-size="13" font-weight="700" font-family="sans-serif">▪ 서류 접수 마감: 2026년 9월 22일(화) 18:00 마감</text>
    <text x="95" y="293" fill="#15803d" font-size="13" font-weight="700" font-family="sans-serif">▪ 소프티어(Softeer) 코딩테스트: 2026년 10월 3일(토)</text>
    <text x="95" y="316" fill="#15803d" font-size="13" font-weight="700" font-family="sans-serif">▪ 직무 면접 및 종합 PT: 2026년 10월 20일(화)</text>

    <text x="75" y="360" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[평가 과목 및 우대 역량]</text>
    <text x="75" y="388" fill="#334155" font-size="13" font-family="sans-serif">▪ C/C++ 기반 자료구조, CAN 통신 프로토콜, 임베디드 리눅스</text>
    <text x="75" y="412" fill="#334155" font-size="13" font-family="sans-serif">▪ Softeer 인증 레벨 3 보유자 코딩테스트 면제 혜택</text>
    <text x="75" y="436" fill="#334155" font-size="13" font-family="sans-serif">▪ 자율주행 알고리즘 및 ROS 프로젝트 수행자 우대</text>

    <text x="75" y="475" fill="#0f172a" font-size="16" font-weight="900" font-family="sans-serif">[제출 서류 및 근무지]</text>
    <text x="75" y="503" fill="#334155" font-size="13" font-family="sans-serif">▪ 현대자동차 채용포털 지원서 및 GitHub 포트폴리오</text>
    <text x="75" y="527" fill="#334155" font-size="13" font-family="sans-serif">▪ 공인 어학 성적표 (SPA, TOEIC Speaking, OPIc 중 1개)</text>
    <text x="75" y="551" fill="#334155" font-size="13" font-family="sans-serif">▪ 근무지: 현대자동차 남양연구소 및 양재 본사</text>

    <rect x="75" y="585" width="450" height="40" rx="8" fill="#f8fafc"/>
    <text x="95" y="610" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">※ 전형 단계별 결과는 채용 홈페이지 및 SMS로 개별 안내됩니다.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const VISUAL_SAMPLES: VisualSampleDoc[] = [
  {
    id: 'hyundai-sw',
    name: '현대자동차 R&D SW 채용 포스터',
    category: 'job_posting',
    categoryLabel: '채용 공고 포스터',
    description: '서류 마감, 소프티어 코테, 면접 일정 및 임베디드/자율주행 역량',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    previewDataUrl: createHyundaiPosterSvg(),
    fileName: 'hyundai_rnd_sw_recruitment.png',
    structuredDates: {
      deadline: '2026-09-22',
      writtenTestDate: '2026-10-03',
      interviewDate: '2026-10-20',
    },
    ocrDefaultText: `[현대자동차 R&D본부 하반기 신입 채용]
자율주행 인포테인먼트 SW 연구원 채용
[주요 전형 일정]
▪ 서류 접수 마감: 2026년 9월 22일(화) 18:00 마감
▪ 소프티어(Softeer) 코딩테스트: 2026년 10월 3일(토)
▪ 직무 면접 및 종합 PT: 2026년 10월 20일(화)
[평가 과목 및 우대 역량]
▪ C/C++ 기반 자료구조, CAN 통신 프로토콜, 임베디드 리눅스
▪ Softeer 인증 레벨 3 보유자 코딩테스트 면제 혜택
▪ 자율주행 알고리즘 및 ROS 프로젝트 수행자 우대
[제출 서류 및 근무지]
▪ 현대자동차 채용포털 지원서 및 GitHub 포트폴리오
▪ 공인 어학 성적표 (SPA, TOEIC Speaking, OPIc 중 1개)
▪ 근무지: 현대자동차 남양연구소 및 양재 본사`,
  },
  {
    id: 'samsung-dx',
    name: '삼성전자 DX 신입 SW 공채 포스터',
    category: 'job_posting',
    categoryLabel: '채용 공고 포스터',
    description: '서류 마감, 코딩테스트(SW역량테스트), 면접 일정 및 OPIc 어학 요건',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    previewDataUrl: createSamsungPosterSvg(),
    fileName: 'samsung_dx_sw_recruitment_2026.png',
    structuredDates: {
      deadline: '2026-09-25',
      writtenTestDate: '2026-10-11',
      interviewDate: '2026-11-04',
    },
    ocrDefaultText: `[2026 하반기 신입사원 공개채용]
삼성전자 DX부문 S/W 개발 신입 채용
[모집 직무]
▪ SW 개발 (클라우드 플랫폼 / 분산 시스템 / AI 인프라)
▪ 근무지: 경기 수원 디지털시티 / 서울 R&D 캠퍼스
[전형 일정 및 마감]
1. 서류접수: 2026년 9월 16일(수) ~ 9월 25일(금) 17:00 마감
2. SW역량테스트(코딩테스트): 2026년 10월 11일(일) 실시
3. 직무/임원 면접 전형: 2026년 11월 4일(수) ~ 11월 12일
[지원 자격 및 평가 과목]
▪ 평가 과목: C / C++ / Java / Python 알고리즘 역량 검정 (2문항 4시간)
▪ 자격 요건: 2027년 2월 이전 졸업 또는 졸업 예정자
▪ 어학 자격: OPIc IM1 이상 또는 토익스피킹 120점 이상 보유자
[제출 필수 서류]
▪ 삼성 채용홈페이지 온라인 입사지원서
▪ 최종학교 전학년 성적증명서 및 졸업(예정)증명서
▪ 공인 영어말하기 성적증명서 사본`,
  },
  {
    id: 'toss-bank',
    name: '토스(비바리퍼블리카) 코어 뱅킹 공고',
    category: 'job_posting',
    categoryLabel: '테크 공고 이미지',
    description: '코어 뱅킹 서버 엔지니어, 과제 전형 및 필수 기술 스택',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    previewDataUrl: createTossPosterSvg(),
    fileName: 'toss_core_banking_engineer.png',
    structuredDates: {
      deadline: '2026-09-28',
      writtenTestDate: '2026-10-05',
    },
    ocrDefaultText: `toss
코어 뱅킹 서버 엔지니어
비바리퍼블리카 / 토스뱅크 대규모 공채
[서류 접수 및 전형 일정]
▪ 서류 접수: 2026년 9월 28일(월) 23:59 마감
▪ 코딩테스트 및 직무 과제: 2026년 10월 5일(월) 진행
[기술 스택 및 평가 과목]
▪ Java, Kotlin, Spring Boot, MySQL, Kafka, Redis
▪ 대규모 트래픽 분산 처리 및 금융 트랜잭션 무결성 설계
[제출 필수 서류]
▪ 자유 양식 이력서 및 경력 기술서 (PDF)
▪ 깃허브(GitHub) 리포지토리 또는 기술 블로그 링크
[근무지 및 보상]
▪ 서울 강남구 테헤란로 142 아크플레이스`,
  },
  {
    id: 'opic-score',
    name: 'ACTFL OPIc 공인 어학 성적표',
    category: 'certificate',
    categoryLabel: '어학 성적표 OCR',
    description: 'AL 등급 취득, 시험 일자 및 2년 유효기간 자동 인식',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    previewDataUrl: createOpicCertSvg(),
    fileName: 'opic_official_score_al.png',
    structuredDates: {
      issueDate: '2026-08-15',
      expiryDate: '2028-08-14',
    },
    ocrDefaultText: `ACTFL
OFFICIAL OPIc SCORE REPORT
공인 영어 말하기 능력 평가 성적 인증서
수험자 성명 (Candidate): 김인재 (KIM INJAE)
생년월일 (Birth Date): 1999. 04. 12
평가 일자 (Test Date): 2026년 08월 15일
인증 번호 (Report No): ACTFL-2026-ENG-84920
취득 등급 (Proficiency Rating): AL (Advanced Low)
유효 기간 (Validity Period): 2026. 08. 15 ~ 2028. 08. 14 (2년간 유효)
시행 / 주관 기관: ACTFL / (주)크레듀 OPIc 한국위원회
평가 언어: 영어 (English Speaking)`,
  },
  {
    id: 'exam-ticket-samsung',
    name: '코딩테스트 온라인 수험표',
    category: 'exam_ticket',
    categoryLabel: '시험 수험표 OCR',
    description: '수험 번호, 시험 일시, 준비물 및 신분증 지참 규정',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    previewDataUrl: createExamTicketSvg(),
    fileName: 'exam_admission_ticket.png',
    structuredDates: {
      writtenTestDate: '2026-10-11',
    },
    ocrDefaultText: `2026 하반기 온라인 코딩테스트 수험표
수험 번호: 2026-DX-90214
성명 / 수험 직무: 김인재 / SW 서버 개발
▪ 시험 일시: 2026년 10월 11일(일) 09:00 ~ 12:30 (총 210분)
▪ 입실 및 환경 검사: 08:30 ~ 08:50 (08:50 이후 접속 차단)
▪ 시험 장소: 화상 플랫폼 사전 테스트 접속 링크 (사전 이메일 발송)
필수 지참물 및 시험 규정:
1. 신분증: 주민등록증, 운전면허증, 유효 여권 중 택 1
2. 모니터링 장비: 웹캠 및 스마트폰 거치대 (양손과 모니터 동시 촬영)
3. 평가 언어: C++, Java, Python 중 1개 언어 선택 응시
4. 부정행위 방지: 듀얼 모니터 및 검색 엔진 사용 엄격히 금지
AUTHENTICATION TOKEN: 90214-SAMSUNG-DX`,
  },
];

export const VISUAL_SAMPLE_DOCS = VISUAL_SAMPLES;
