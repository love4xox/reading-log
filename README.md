# READING IN CHECK | 서재의 한 줄

> **"Everything changes when you read."**

읽은 책과 웹툰의 여운을 에디토리얼 아카이브 형태로 기록하고, 월말마다 AI 문학 에디터의 취향 분석 서평을 받아보는 개인 독서 기록 웹 애플리케이션입니다.

🔗 **배포 주소:** [READING LOG | 서재의 한 줄](https://reading-log-gilt.vercel.app/)

---

## 목차

1. [주요 특징](#1-주요-특징)
2. [핵심 기능](#2-핵심-기능)
3. [기술 스택](#3-기술-스택)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [시작하기](#5-시작하기)
6. [API 명세](#6-api-명세)
7. [배포 (Vercel)](#7-배포-vercel)

---

## 1. 주요 특징

| 특징 | 설명 |
| :--- | :--- |
| **제로 백엔드 영속성** | 회원가입·로그인·외부 DB 없이 `localStorage` 기반으로 브라우저에서 즉시 기록하고 열람합니다. |
| **정량 · 정성 하이브리드** | 편수·완독률·평균 별점처럼 오차가 없어야 하는 집계는 TypeScript 순수 함수로 처리해 단위 테스트로 검증하고, 감상평의 맥락·취향 해석은 Gemini API에 위임합니다. |
| **에디토리얼 북 커버 UI** | 48px 모눈 그리드 종이 질감, 1px 직각 잉크 보더, 오프셋 솔리드 그림자, 영문 `Cormorant Garamond` + 한글 `Gowun Batang` 세리프 조합으로 한 권의 출판물 같은 분위기를 만듭니다. |

---

## 2. 핵심 기능

### 01. 감상 기록 — `RecordTab.tsx`

- **구조화된 입력 폼:** 작품 제목(필수), 매체(`책` / `웹툰`), 감상 상태(`완독` / `보는 중`), 기록일(`YYYY-MM-DD`), 만족도(`1~5점`), 밑줄 친 문장 및 한 줄 서평
  - 기록일은 Next.js 16 Hydration 안전성을 위해 클라이언트 마운트 시 자동으로 설정됩니다.
- **즉시 피드백:** 등록 완료 시 상단에 `ARCHIVED ✓` 배지가 표시됩니다.
- **최근 수록 인덱스:** 폼 하단 `Recent Index`에 가장 최근 등록한 3편이 번호(`01.`, `02.`, `03.`)와 함께 실시간으로 렌더링됩니다.

### 02. 서재 목록 — `LibraryTab.tsx`

- **다중 교차 필터링:** 매체별(`전체` / `책` / `웹툰`) × 상태별(`전체` / `완독` / `보는 중`) 조합
- **다기준 정렬:** 최신순(`date-desc`), 오래된순(`date-asc`), 별점 높은순(`rating-desc`)
- **인라인 상태 전환 · 삭제:** 카드의 상태 배지를 클릭하면 수정 모달 없이 즉시 전환되고, 휴지통 아이콘으로 개별 기록을 삭제할 수 있습니다.

### 03. AI 서평 분석 — `ReportTab.tsx` · `api/report/route.ts`

- **월간 정량 결산 표:** 연월 선택기(`YYYY-MM`)로 달을 지정하면 3단 에디토리얼 통계 표에 즉시 산출됩니다.
  - 총 감상 편수 (책·웹툰 세부 카운트 포함)
  - 완독 달성 편수
  - 평균 별점 (소수점 첫째 자리 반올림)
- **AI 큐레이션 칼럼:** `AI 월말 서평 리포트 발행하기` 버튼을 누르면 해당 월 기록만 `/api/report`로 전송되고, `gemini-2.5-flash`가 아래 내용을 담은 서평 칼럼을 생성합니다.
  - 이달의 독서·감상 경향 요약
  - 인상 깊은 작품 코멘트
  - 다음 달 추천 방향

### 04. 에디토리얼 테마 & 앰비언트 사운드 — `AmbientPlayer.tsx`

**라이트 / 다크 모눈 종이 테마**

| 모드 | 배경 | 포인트 컬러 |
| :--- | :--- | :--- |
| `LIGHT` | `#F2F1ED` | 에메랄드 `#0E7C5B` |
| `DARK` | `#121514` | 민트 에메랄드 `#34B38A` |

상단 유틸리티 바의 토글로 전환하며, 선택한 테마는 `localStorage`(`reading_log_theme_v1`)에 자동 저장됩니다.

**Web Audio API 실시간 사운드 합성**

외부 MP3/WAV 파일 없이 브라우저 `AudioContext`만으로 3가지 사운드를 합성하며, 재생 중 슬라이더로 볼륨(`0.05 ~ 0.80`)을 조절할 수 있습니다.

| 모드 | 이름 | 합성 방식 |
| :--- | :--- | :--- |
| `rain` | 빗소리 | 핑크/브라운 노이즈 버퍼 + 950Hz 로우패스 필터 |
| `fire` | 벽난로 | 520Hz 로우패스 저주파 베이스 + 확률적 장작 크래클 펄스 |
| `pad` | 심야 코드 | Fmaj7 화음(174.61 / 220.00 / 261.63 / 329.63Hz)을 사인파·트라이앵글 파형으로 겹침 |

---

## 3. 기술 스택

| 영역 | 기술 | 역할 |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19, TypeScript | 클라이언트 상태 관리, 파일 기반 라우팅, 서버 API Route |
| **Styling** | Tailwind CSS v4, CSS Custom Properties, Lucide React | `html.dark` 기반 CSS 변수 테마 전환, 모눈 그리드 배경, 아이콘 |
| **Typography** | Google Fonts (`Cormorant Garamond`, `Gowun Batang`) | 영문 세리프 헤드라인, 한국어 바탕 본문 |
| **AI SDK** | Google GenAI SDK (`@google/genai`) | 서버 사이드 `gemini-2.5-flash` 호출 및 서평 생성 |
| **Audio & Storage** | Web Audio API, `localStorage`, PWA Manifest | 무의존성 사운드 합성, 로컬 데이터 영속성, 홈 화면 설치 |
| **Testing** | Vitest | 필터링·정렬·월별 통계 순수 함수 단위 테스트 |

---

## 4. 프로젝트 구조

```text
reading-log/
├── public/
│   ├── icon.svg                  # PWA 매니페스트용 벡터 아이콘
│   └── manifest.json             # 모바일 홈 화면 추가(Standalone) PWA 설정
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── report/
│   │   │       └── route.ts      # Gemini 월말 서평 리포트 생성 엔드포인트
│   │   ├── apple-icon.svg        # iOS / Android 홈 화면용 180x180 아이콘
│   │   ├── icon.svg              # 브라우저 탭용 64x64 파비콘
│   │   ├── globals.css           # 라이트/다크 CSS 변수 토큰, 48px 모눈 배경
│   │   ├── layout.tsx            # 폰트 변수 바인딩, 뷰포트 테마 컬러, 메타데이터
│   │   └── page.tsx              # 메인 셸, 테마 토글, 3탭 내비게이션, localStorage 동기화
│   ├── components/
│   │   ├── AmbientPlayer.tsx     # Web Audio API 3모드 배경음 플레이어
│   │   ├── LibraryTab.tsx        # 서재 목록 (필터·정렬·인라인 상태 전환)
│   │   ├── RecordTab.tsx         # 감상 입력 폼 및 최근 수록 인덱스
│   │   └── ReportTab.tsx         # 월간 정량 결산 표 및 AI 서평 칼럼
│   └── lib/
│       ├── stats.ts              # filterEntries, sortEntries, summarizeByMonth
│       ├── stats.test.ts         # Vitest 단위 테스트
│       └── types.ts              # ReadingEntry, MonthlySummary, SortOption 등 타입
├── .env.local                    # GEMINI_API_KEY (Git 추적 제외)
├── AGENTS.md                     # 아키텍처·데이터 스키마·디자인 토큰·AI 협업 규칙
└── README.md
```

---

## 5. 시작하기

### 사전 준비

- Node.js 및 npm
- [Google AI Studio](https://aistudio.google.com/)에서 발급받은 Gemini API 키

### 설치 및 실행

```bash
# 1. 저장소 클론 및 이동
git clone https://github.com/love4xox/reading-log.git
cd reading-log

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (루트 경로에 .env.local 생성)
echo "GEMINI_API_KEY=여기에_API_키_입력" > .env.local

# 4. 단위 테스트 실행
npx vitest run

# 5. 개발 서버 실행 → http://localhost:3000
npm run dev
```

### 환경 변수

| 변수 | 필수 | 설명 |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | ✅ | AI 월말 서평 생성에 사용하는 Gemini API 키 (서버에서만 사용) |

---

## 6. API 명세

### `POST /api/report`

클라이언트가 보낸 전체 기록 배열에서 요청한 연월(`month`)에 해당하는 항목만 추출해 Gemini(`gemini-2.5-flash`)에 프롬프트로 전달하고, 생성된 서평 텍스트를 반환합니다.

**Request** (`application/json`)

```json
{
  "entries": [
    {
      "id": "1732334400000-abc12",
      "title": "불편한 편의점",
      "mediaType": "책",
      "status": "완독",
      "rating": 5,
      "date": "2026-11-23",
      "review": "결국 사람을 살리는 건 거창한 위로가 아니라 따뜻한 말 한마디였다."
    }
  ],
  "month": "2026-11"
}
```

**Response** — `200 OK`

```json
{
  "report": "2026년 11월의 서재는 따뜻한 인간관계와 일상의 회복을 다룬 이야기로 채워졌습니다..."
}
```

**Error Responses**

| 상태 코드 | 발생 조건 | 응답 예시 |
| :--- | :--- | :--- |
| `400 Bad Request` | 선택한 월(`YYYY-MM`)에 해당하는 기록이 0건 | `{"error": "선택한 월에 기록된 감상이 없습니다."}` |
| `500 Internal Server Error` | `GEMINI_API_KEY` 누락 또는 API 호출 실패 | `{"error": "GEMINI_API_KEY가 설정되지 않았습니다."}` |

---

## 7. 배포 (Vercel)

### 1) GitHub 푸시

`.env.local`은 `.gitignore`에 포함되어 있으므로 소스 코드만 커밋·푸시됩니다.

```bash
git add .
git commit -m "feat: READING IN CHECK 에디토리얼 독서·웹툰 기록장 구현"
git branch -M main
git remote add origin https://github.com/love4xox/reading-log.git
git push -u origin main
```

### 2) Vercel 프로젝트 연결

1. Vercel 대시보드에서 **Add New... → Project**를 선택하고 `love4xox/reading-log` 저장소를 Import 합니다.
2. **Settings → Environment Variables**에서 `GEMINI_API_KEY`를 등록합니다.
3. **Deploy**를 실행합니다.

### 3) 모바일 PWA 설치

배포된 URL에 모바일 브라우저(Edge / Chrome / Safari)로 접속한 뒤, 브라우저 메뉴에서 **홈 화면에 추가**를 선택하면 주소창 없는 독립 앱 형태로 실행됩니다.
