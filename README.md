# 말장난 말티즈 🐕

[말장난 말티즈](https://maltese.app)는 귀여운 말티즈 강아지들과 함께 한국어 말장난을 공유하는 웹 플랫폼입니다.

![화면 스크린샷](/src/readme/assets/screenshot.jpg)

## 주요 기능

- 🎨 **인터랙티브 캔버스** - 떠다니는 말티즈 강아지들이 말장난을 보여줍니다
- ✏️ **말장난 작성** - 나만의 말장난을 만들고 공유할 수 있습니다
- 🔗 **공유 기능** - 고유 링크로 특정 말장난을 친구에게 공유할 수 있습니다
- ❤️ **좋아요/신고** - 커뮤니티 모더레이션 시스템

## 기술 스택

| 영역 | 기술 |
|------|------|
| **프레임워크** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| **백엔드** | [Convex](https://convex.dev/) (서버리스 백엔드) |
| **인증** | [Clerk](https://clerk.com/) |
| **상태 관리** | [Jotai](https://jotai.org/) |
| **스타일링** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI 컴포넌트** | [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **배포** | [Vercel](https://vercel.com/) |

## 프로젝트 구조

```
maltese/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── _components/      # 페이지 전용 컴포넌트
│   │   ├── minad/            # 관리자 페이지
│   │   ├── page.tsx          # 메인 페이지
│   │   └── layout.tsx        # 루트 레이아웃
│   ├── components/           # 공통 UI 컴포넌트
│   │   ├── ui/               # 기본 UI 요소
│   │   └── providers/        # Context Providers
│   ├── lib/                  # 유틸리티 함수
│   │   ├── canvas/           # 캔버스 렌더링 로직
│   │   └── server-actions/   # 서버 액션
│   ├── constants/            # 상수 정의
│   └── store/                # Jotai 아톰
├── convex/                   # Convex 백엔드
│   ├── schema.ts             # 데이터베이스 스키마
│   ├── puns.ts               # 말장난 관련 함수
│   ├── animals.ts            # 동물 이미지 관리
│   └── discord.ts            # Discord 알림
└── public/                   # 정적 파일
```

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (Next.js + Convex)
npm run dev
```

### 환경 변수

`.env.local` 파일에 다음 변수들을 설정하세요:

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Discord (선택)
DISCORD_WEBHOOK_URL=
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (Next.js + Convex) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | Biome로 린트 검사 |
| `npm run format` | Biome로 코드 포맷팅 |

## 라이선스

이 프로젝트는 비공개입니다.