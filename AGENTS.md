# AGENTS.md

AI 코딩 에이전트(Cursor 등)가 이 저장소에서 작업할 때 따라야 할 규칙과 프로젝트 맥락입니다. 작업을 시작하기 전에 먼저 읽어 주세요.

## 1. 프로젝트 개요

- **이름:** READING IN CHECK | 서재의 한 줄
- **목적:** 읽은 책과 웹툰의 감상을 에디토리얼 아카이브 형태로 기록하고, 월말마다 AI 서평 리포트를 받아보는 개인 독서 기록 웹앱
- **핵심 방향:** 회원가입·로그인·외부 DB 없이 브라우저 `localStorage`만으로 동작 (제로 백엔드 영속성)
- **언어:** UI 문구와 문서는 한국어, 코드 식별자는 영어

## 2. 기술 스택

| 영역 | 기술 |
| :--- | :--- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS Custom Properties, Lucide React |
| Typography | `Cormorant Garamond`(영문), `Gowun Batang`(한글) |
| AI | `@google/genai`, 모델 `gemini-2.5-flash` (서버에서만 호출) |
| Storage / Audio | `localStorage`, Web Audio API, PWA Manifest |
| Testing | Vitest |

## 3. 디렉터리 구조와 역할

```text
src/
├── app/
│   ├── api/report/route.ts   # Gemini 월말 서평 생성 (서버 전용)
│   ├── globals.css           # 라이트/다크 CSS 변수 토큰, 48px 모눈 배경
│   ├── layout.tsx            # 폰트 바인딩, 뷰포트 테마 컬러, 메타데이터
│   └── page.tsx              # 메인 셸, 테마 토글, 3탭 내비, localStorage 동기화
├── components/
│   ├── RecordTab.tsx         # 01. 감상 기록
│   ├── LibraryTab.tsx        # 02. 서재 목록
│   ├── ReportTab.tsx         # 03. AI 서평 분석
│   └── AmbientPlayer.tsx     # 앰비언트 사운드 플레이어
└── lib/
    ├── stats.ts              # filterEntries, sortEntries, summarizeByMonth
    ├── stats.test.ts         # 위 함수들의 단위 테스트
    └── types.ts              # ReadingEntry, MonthlySummary, SortOption 등
```

## 4. 아키텍처 원칙

1. **정량은 코드, 정성은 AI.** 편수·완독 수·평균 별점 같은 수치 집계는 반드시 `src/lib/stats.ts`의 순수 함수로 계산합니다. AI에게 숫자를 세게 하지 않습니다.
2. **AI 호출은 서버에서만.** Gemini 호출은 `src/app/api/report/route.ts`에서만 하며, 클라이언트 코드에서 `@google/genai`를 import하거나 API 키를 노출하지 않습니다.
3. **저장소는 `localStorage`.** 별도 백엔드·DB·인증을 추가하지 않습니다. 필요해 보이면 먼저 사용자에게 확인합니다.
4. **Hydration 안전성.** 날짜(오늘 날짜)나 `localStorage`처럼 서버와 클라이언트 값이 달라질 수 있는 것은 클라이언트 마운트 이후(`useEffect`)에 설정합니다.

## 5. 데이터 스키마

`localStorage`에 저장되는 기록 한 건(`ReadingEntry`)의 형태입니다. 정확한 정의는 `src/lib/types.ts`를 기준으로 합니다.

```ts
{
  id: string;                        // 예: "1732334400000-abc12"
  title: string;                     // 필수
  mediaType: "책" | "웹툰";
  status: "완독" | "보는 중";
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;                      // "YYYY-MM-DD"
  review: string;                    // 한 줄 서평
  // 밑줄 친 문장 필드는 types.ts 정의를 따른다
}
```

| 저장 키 | 용도 |
| :--- | :--- |
| `reading_log_theme_v1` | 선택한 테마(라이트/다크) |

- 스키마를 바꿀 때는 기존 `localStorage` 데이터가 깨지지 않는지 먼저 확인하고, 필요하면 키 버전(`_v1` → `_v2`)을 올립니다.

## 6. 디자인 토큰

에디토리얼 북 커버 & 인덱스 스타일을 유지합니다. 색상은 `globals.css`의 CSS 변수로만 사용하고, 컴포넌트에 색상 값을 직접 쓰지 않습니다.

| 항목 | 라이트 | 다크 |
| :--- | :--- | :--- |
| 배경 | `#F2F1ED` | `#121514` |
| 포인트 | `#0E7C5B` (에메랄드) | `#34B38A` (민트 에메랄드) |

- 테마 전환은 `html.dark` 클래스 기반입니다.
- 배경은 48px 모눈 그리드 종이 질감입니다.
- 보더는 1px 직각 잉크 보더, 그림자는 오프셋 솔리드 그림자를 씁니다. 둥근 모서리와 블러 그림자는 쓰지 않습니다.
- 폰트: 영문 헤드라인은 `Cormorant Garamond`, 한글 본문은 `Gowun Batang`.

## 7. API 규칙 (`POST /api/report`)

- 요청: `{ entries: ReadingEntry[], month: "YYYY-MM" }`
- 서버에서 `month`에 해당하는 기록만 추려 Gemini 프롬프트에 전달합니다.
- 성공: `200 { report: string }`
- 해당 월 기록 0건: `400 { error: "선택한 월에 기록된 감상이 없습니다." }`
- 키 누락 또는 호출 실패: `500 { error: ... }`
- 서평 칼럼에는 **이달의 경향 요약, 인상 깊은 작품 코멘트, 다음 달 추천 방향**이 담겨야 합니다.

## 8. 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:3000)
npx vitest run       # 단위 테스트
```

- 환경 변수: `.env.local`의 `GEMINI_API_KEY` (Git 추적 제외)

## 9. AI 협업 규칙

### 해야 할 것

- 변경 전에 관련 파일을 먼저 읽고, 기존 구조와 네이밍을 따릅니다.
- **테스트 먼저.** `stats.ts`의 로직을 바꾸거나 추가할 때는 `stats.test.ts`에 테스트를 먼저(또는 함께) 작성하고 `npx vitest run`이 통과하는지 확인합니다.
- **화면 확인.** UI나 기능을 바꾼 뒤에는 `npm run dev`로 개발 서버를 띄워 브라우저에서 동작을 직접 확인합니다.
- 변경은 작은 단위로 하고, 무엇을 왜 바꿨는지 짧게 요약합니다.
- 새 UI는 기존 디자인 토큰과 에디토리얼 스타일에 맞춥니다.

### 하지 말 것

- `.env.local`을 열어 키를 출력하거나, API 키를 코드·문서·커밋에 넣지 않습니다.
- 사용자 요청 없이 새 의존성, 백엔드, DB, 로그인 기능을 추가하지 않습니다.
- 요청받지 않은 범위의 리팩터링이나 파일 이동을 하지 않습니다.
- 수치 집계를 AI 프롬프트에 의존하도록 바꾸지 않습니다.
- 삭제·덮어쓰기처럼 되돌리기 어려운 작업은 먼저 확인합니다.

### 작업 완료 기준

1. `npx vitest run` 통과
2. `npm run dev`에서 해당 기능이 라이트/다크 양쪽 테마로 정상 표시
3. 변경한 내용과 확인한 방법을 요약해서 보고

## 10. 배포

- GitHub `love4xox/reading-log` 저장소를 Vercel에 연결해 배포합니다.
- Vercel **Settings → Environment Variables**에 `GEMINI_API_KEY`를 등록해야 서평 기능이 동작합니다.
- 모바일 브라우저의 **홈 화면에 추가**로 PWA 형태로 설치할 수 있습니다 (`public/manifest.json`).
