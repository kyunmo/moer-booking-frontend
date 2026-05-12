# YEMO Booking System — Frontend

> **예약은 예모로** · 소규모 매장(미용실·필라테스·요가·스터디카페 등)을 위한 SaaS형 예약 관리 플랫폼
> Vue 3 + Vuetify (Materio) + 자체 yemo 디자인 시스템 (공개 페이지) 기반

**버전:** 2.3.0
**상태:** Beta (핵심 기능 완성 + 공개 페이지 리디자인 진행 중)
**최근 업데이트:** 2026-05-13

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [아키텍처](#3-아키텍처)
4. [디자인 시스템 (yemo)](#4-디자인-시스템-yemo)
5. [페이지 구조](#5-페이지-구조)
6. [데이터 흐름 (Store · API)](#6-데이터-흐름-store--api)
7. [인증 체계](#7-인증-체계)
8. [개발 환경 설정](#8-개발-환경-설정)
9. [기능별 완성도](#9-기능별-완성도)
10. [향후 로드맵](#10-향후-로드맵)
11. [참고 문서](#11-참고-문서)

---

## 1. 프로젝트 개요

YEMO는 소규모 매장을 위한 **SaaS형 예약 관리 플랫폼**입니다.

### 사용자 유형 3가지

| 사용자 | 설명 | 진입 경로 |
|---|---|---|
| **매장 관리자 (사장님)** | 예약·고객·스태프·매출 관리 | `/shop-admin/**` (`default` 레이아웃) |
| **고객 (소비자)** | 매장 검색, 예약, 리뷰 작성 | `/booking/**` (`public` 레이아웃) |
| **슈퍼 관리자** | 전체 매장·사용자·감사 로그 관리 | `/shop-admin/super/**` (`default` 레이아웃) |

### 지원 업종 (9종)
미용실 · 필라테스 · 요가 · 카페 · 스터디카페 · 공방 · 학원 · 반려동물미용 · 기타

### 브랜드 가이드
- 워드마크: **YEMO**
- 슬로건: **예약은 예모로**
- 도메인 패턴: `yourshop.yemo.io`
- 연락처: support@yemo.io · 카카오톡 채널 `@YEMO`

---

## 2. 기술 스택

### 핵심 프레임워크

| 기술 | 버전 | 용도 |
|---|---|---|
| Vue | 3.5 | 프레임워크 (`<script setup>`) |
| Vuetify | 3.10 | UI 라이브러리 (Materio 템플릿) — admin 영역 |
| Pinia | 3.0 | 상태 관리 |
| Vue Router | 4.5 | 라우팅 (unplugin-vue-router 파일 기반 자동 생성) |
| Vite | 7.x | 빌드 도구 |
| Axios | — | HTTP 클라이언트 |

### 디자인 시스템 (공개 페이지 전용)

| 기술 | 용도 |
|---|---|
| `src/assets/styles/yemo/` | 디자인 토큰 + reset + typography + utilities (`.yemo` 스코프) |
| `src/components/yemo/` | Headless 컴포넌트 (YBtn, YCard, YInput, YTag, YSection, YContainer, YStack) |
| `@iconify/vue` + `@iconify-json/ph` | Phosphor Icons (`<Icon icon="ph:..." />`) |
| Pretendard Variable | 기본 본문 폰트 (jsdelivr CDN preconnect crossorigin) |

> 디자인 시스템 상세: `docs/superpowers/specs/2026-05-12-public-redesign-design.md`

### 주요 라이브러리

| 라이브러리 | 용도 |
|---|---|
| FullCalendar 6.1 | 예약 캘린더 (day/week/month) — admin |
| ApexCharts 3.54 | 통계 차트 |
| Shepherd.js 13.0 | 가이드 투어 |
| Swiper 11.2 | 이미지 캐로셀 |
| CASL 6.7 | 권한 관리 |
| jwt-decode 4.0 | JWT 파싱 |
| TipTap 2.27 | Rich Text Editor |
| Flatpickr 11.0 | 날짜 선택기 |

---

## 3. 아키텍처

### 디렉토리 구조

```
src/
├── api/                       # API 모듈 (21+) — axios 기반
├── assets/
│   └── styles/yemo/           # yemo 디자인 시스템 (tokens/reset/typography/motion/utilities)
├── components/
│   ├── common/                # 공통 (OfflineBanner 등)
│   ├── dialogs/               # 공용 다이얼로그
│   ├── legal/                 # 구버전 약관 다이얼로그 (admin setup에서 사용 중)
│   ├── public/                # 기존 booking 영역 헤더/푸터 (Phase 3에서 정리 예정)
│   └── yemo/                  # 신규 yemo 디자인 시스템 컴포넌트
│       ├── YBtn.vue
│       ├── YCard.vue
│       ├── YInput.vue
│       ├── YTag.vue
│       ├── YSection.vue
│       ├── YContainer.vue
│       ├── YStack.vue
│       ├── marketing/         # MarketingHeader · MarketingFooter · landing/*
│       └── legal/             # LegalHeader · LegalToc
├── composables/               # Vue Composables
├── layouts/
│   ├── default.vue            # admin
│   ├── blank.vue              # 미인증 fallback
│   ├── public.vue             # 기존 booking layout (Phase 3에서 booking.vue로 분리 예정)
│   ├── marketing.vue          # ✨ 신규 — 마케팅 페이지 전용
│   └── legal.vue              # ✨ 신규 — 법적 페이지 전용
├── navigation/                # admin 사이드바 정의
├── pages/                     # 파일 기반 라우팅
│   ├── booking/               # 고객용 예약 페이지 (Phase 3~4 리디자인 예정)
│   └── shop-admin/            # 관리자 (Materio 유지)
├── plugins/                   # Vue 플러그인
├── stores/                    # Pinia 스토어 (19+)
└── @core/, @layouts/          # Materio 템플릿 코어
```

### 영역별 디자인 전략

| 영역 | 디자인 | 격리 |
|---|---|---|
| **공개 마케팅** (`/`, `/pricing`, `/features`, `/faq`, `/login`, `/register`, `/password-recovery`, `/oauth2-redirect`) | yemo Headless | `<div class="yemo">` 루트 |
| **공개 법적** (`/privacy`, `/terms`, `/refund-policy`) | yemo Headless | `<div class="yemo">` 루트 |
| **공개 Booking** (`/booking/**`) | 기존 layout 유지 (Phase 3 예정) | — |
| **관리자** (`/shop-admin/**`) | Vuetify (Materio) 유지 | — |

> yemo CSS 변수(`--y-*`)는 모두 `.yemo` 셀렉터 내부에 정의되어 Vuetify 영역에 누수되지 않음.

### 다이얼로그 패턴

모든 도메인(예약/고객/스태프/서비스)이 **Detail + Form + ConfirmDelete** 3종 구성, `v-model` (`modelValue` prop + `update:modelValue` emit) 기반.

---

## 4. 디자인 시스템 (yemo)

### 토큰 (CSS 변수, `.yemo` 스코프)

| 카테고리 | 변수 예 |
|---|---|
| **컬러** | `--y-bg` `#FAFAF8` · `--y-surface` `#FFFFFF` · `--y-accent` `#C8A882` (웜 골드) · `--y-text-strong` `#1A1A1A` |
| **상태** | `--y-success` `#4A7C59` · `--y-warning` `#C8893D` · `--y-danger` `#B84A4A` · `--y-info` `#5B7BAA` (각 `-soft` 변형 보유) |
| **라운드** | sm 8 / 기본 12 / md 14 / lg 16 / xl 20 / 2xl 24 / pill 999 |
| **그림자** | sm / 기본 / md / lg / xl / focus(골드 ring) / accent |
| **모션** | `--y-dur-fast` 200ms · `--y-dur-base` 300ms · `--y-dur-slow` 500ms (`prefers-reduced-motion` 시 0) |

### Typography 유틸리티 (`.yemo` 스코프)

| 클래스 | px/lh/weight | 용도 |
|---|---|---|
| `.t-display-xl` | 60 / 1.08 / 800 | 랜딩 hero |
| `.t-display-lg` | 42 / 1.20 / 800 | 섹션 h2 |
| `.t-display-md` | 28 / 1.25 / 800 | 모바일 page title |
| `.t-title-lg/md/sm` | 22 / 18 / 16 | 카드 제목 |
| `.t-body-lg/body/sm` | 17 / 15 / 13 | 본문 |
| `.t-caption` `.t-label` | 12 / 11 | 라벨 (`.t-label`은 uppercase + letter-spacing 0.08em) |
| `.t-strong` `.t-muted` `.t-accent` | — | 색상 유틸 |

### 컴포넌트 (`src/components/yemo/`)

| 컴포넌트 | 주요 props | 비고 |
|---|---|---|
| `YBtn` | `variant`(6) × `size`(3) + `pill` `block` `loading` `prepend-icon` `append-icon` | size별 고정 높이: sm=36 / md=44 / lg=52 |
| `YCard` | `padding`(4) × `radius`(4) + `bordered` `elevated` `interactive` | hover lift |
| `YInput` | `label` `error` `hint` `prepend-icon` `append-icon` + `size`(3) | v-model · useId 기반 a11y |
| `YTag` | `variant`(6) × `size`(2) + `icon` | pill 형태 |
| `YSection` | `eyebrow` `title` `sub` `align` | 마케팅 섹션 헤더 패턴 |
| `YContainer` | `width`(narrow 720/reading 720/default 1200/wide 1440) + `padding` | — |
| `YStack` | `gap` `align` `as` | flex column |

### 마케팅·법적 chrome

| 컴포넌트 | 용도 |
|---|---|
| `marketing/MarketingHeader` | sticky blur 헤더 · 데스크톱 nav 4메뉴 · 모바일 햄버거 → 풀스크린 drawer |
| `marketing/MarketingFooter` | 4단 그리드 · 사업자 정보 · `#1A1A1A` bg |
| `marketing/landing/*` | 랜딩 9 섹션 (Hero, PainPoint, Solution, Features, Industry, Testimonials, PricingPreview, FaqPreview, FinalCta) |
| `legal/LegalHeader` | 미니멀 헤더 (뒤로 + 워드마크) |
| `legal/LegalToc` | sticky TOC + IntersectionObserver 자동 강조 + 모바일 접힘 |

### 시각 검증
- `/dev/components` — 5 컴포넌트 + 타이포 스케일 + 컬러 팔레트 미리보기 라우트 (`layout: blank`, `public: true`)

---

## 5. 페이지 구조

### 공개 페이지 (20개 · 리디자인 진행 중)

#### 마케팅 (8) — ✅ Phase 1 완료 · yemo 적용
| URL | 페이지 | 레이아웃 |
|---|---|---|
| `/` | 랜딩 (9 섹션) | `marketing` |
| `/features` | 기능 상세 (sticky nav + 좌우 교차) | `marketing` |
| `/pricing` | 요금제 (월/연 토글 + 비교 표 + FAQ) | `marketing` |
| `/faq` | FAQ (검색 + 7 카테고리 + 24+ 항목) | `marketing` |
| `/login` | 로그인 (사장님/고객 분기 · 카카오) | `marketing` |
| `/register` | 회원가입 (30일 trial · 약관 동의) | `marketing` |
| `/password-recovery` | 비밀번호 재설정 (4-step 통합 플로우) | `marketing` |
| `/oauth2-redirect` | OAuth2 콜백 (admin/customer 분기) | `marketing` |

#### 법적 (3) — ✅ Phase 2 완료 · yemo 적용
| URL | 페이지 | 레이아웃 |
|---|---|---|
| `/privacy` | 개인정보처리방침 (12조 + 부칙) | `legal` |
| `/terms` | 이용약관 (9장 22조 + 부칙) | `legal` |
| `/refund-policy` | 환불정책 (8 섹션) | `legal` |

#### Booking 고객 (9) — ⏳ Phase 3~4 예정
| URL | 페이지 | 레이아웃 |
|---|---|---|
| `/booking/` | 매장 검색 | `public` (Phase 3에서 `booking`로 분리) |
| `/booking/[slug]/` | 매장 상세 | `public` |
| `/booking/[slug]/reserve` | 예약 4-step wizard | `public` |
| `/booking/[slug]/review` | 리뷰 작성 | `public` |
| `/booking/profile` | 고객 프로필 (필수 온보딩 포함) | `public` |
| `/booking/my-reservations` | 내 예약 | `public` |
| `/booking/my-reviews` | 내 리뷰 | `public` |
| `/booking/bookmarks` | 찜한 매장 | `public` |
| `/booking/reservation` | 비회원 예약 조회 | `public` |

> Phase 1 IA 변경: `/support` → `/faq` 흡수 / `/forgot-password` + `/reset-password` → `/password-recovery` 통합 / `/booking/login` → `/login?role=customer` 흡수 검토 (Phase 3)

### 관리자 메뉴 (Materio 유지)

```
핵심 운영
  ├── 대시보드 (/shop-admin/dashboard)
  ├── 예약 관리 — 캘린더 / 목록
  └── 고객 관리

분석 · 피드백
  ├── 매출 · 통계
  └── 리뷰 관리

매장 설정
  ├── 서비스 관리
  ├── 스태프 관리
  └── 매장 정보 — 기본 / 영업시간 / 휴무일

구독 · 결제
  ├── 구독 관리 / 결제 내역 / 쿠폰 / 알림 이력

슈퍼 관리자
  └── 대시보드 / 매장 / 사용자 / 감사 로그
```

---

## 6. 데이터 흐름 (Store · API)

### Pinia 스토어 (19개)

| Store | 역할 | 주요 상태 |
|---|---|---|
| `auth` | 관리자 인증 | user · business · token · trial |
| `customer-auth` | 고객 인증 (OAuth 전용) | customer · token · isNewUser · handleOAuthCallback() |
| `reservation` · `customer` · `staff` · `service` 등 | 도메인 CRUD | 도메인별 |
| `staff-position` · `service-category` | 마스터 데이터 | 5분 캐시 |
| `booking` | 고객 예약 플로우 | 스테퍼 상태 |
| `review` · `statistics` · `dashboard` | 분석 데이터 | — |
| `business-settings` · `subscription` · `payment` · `coupon` | 매장 설정·결제 | — |
| `notification` | 알림 | 폴링 기반 |
| `superadmin` | 슈퍼관리자 | systemStats · businesses · users · auditLogs |
| `onboarding` | 온보딩 | status |

### API 모듈 (21개)
`src/api/` 내 axios 기반. 인터셉터(`axios.js`)에서 3-way 토큰 분기 (공개 / 고객 / 관리자).

| 주요 모듈 | 엔드포인트 수 |
|---|---|
| `auth` `customer` `superadmin` `staffs` `customers` | 7~13 |
| `reservations` `business-settings` `services` `payment` `coupon` | 6~10 |
| `public-booking` (매장 검색·예약 등 공개 API) | 10 |
| `statistics` `reviews` `dashboard` `subscription` `notifications` | 2~5 |

---

## 7. 인증 체계

### 이중 토큰 시스템

```
관리자 토큰: localStorage.accessToken
              ├── /shop-admin/** 페이지
              └── Authorization: Bearer {token}

고객 토큰:   localStorage.customerAccessToken
              ├── /booking/** 페이지
              └── /api/customer/** 요청
```

### Axios 인터셉터 분기 (3-way)

```
요청 URL 판단:
  ├── /public/** → 토큰 없음
  ├── /customer/** → customerAccessToken
  └── 그 외 → accessToken (+ 슈퍼관리자는 X-Business-Id 헤더 자동 부착)
```

### OAuth2 플로우

```
카카오 로그인 → /oauth2/authorize/kakao?loginType={admin|customer}
              → 카카오 인증
              → /oauth2-redirect (콜백)
              → loginType 분기:
                  admin    → authStore 저장 → /shop-admin/dashboard
                  customer → customerAuthStore → isNewUser ? /booking/profile : /booking
```

> 주의: OAuth URL은 `/oauth2/authorize/kakao` (NOT `/oauth2/authorization/`).

### 라우터 가드

```
beforeEach:
  1. 초기화: authStore + customerAuthStore (Promise.all)
  2. meta.public === true → 통과
  3. 미인증 + 비공개 → /login
  4. /super/* + 비슈퍼 → /dashboard
  5. 슈퍼 + 매장 미선택 → /super/dashboard

* 고객 페이지(/booking/**)는 라우터 가드 대신 각 페이지 onMounted에서 인증 체크
```

---

## 8. 개발 환경 설정

### 요구사항
- Node.js 18+
- npm 또는 pnpm

### 설치 및 실행

```bash
npm install         # 의존성 + postinstall(build-icons + msw init)
npm run dev         # 개발 서버 (포트 5173)
npm run build       # 프로덕션 빌드
npm run lint        # ESLint --fix (전체 프로젝트, 주의)
npm run build:icons # Iconify 아이콘 번들 재생성
```

### 환경 변수 (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=YEMO 예약 관리
VITE_PORT=5173
```

### 백엔드
- API 서버는 `http://localhost:8080`에서 실행 (별도 저장소)
- API 명세: `docs/백엔드-API-요구사항-2026-03-04.md`

### 개발 컨벤션

| 항목 | 규칙 |
|---|---|
| **Dialog** | `v-model` + `modelValue` prop + `update:modelValue` emit (Materio 원본 `isDialogVisible` 패턴 X) |
| **카테고리** | `categoryId` (number) + `categoryName` (JOIN), 5분 캐시 |
| **이미지 업로드** | 5MB 제한, JPG/PNG/WebP, ObjectURL 미리보기 + `onBeforeUnmount` 정리 |
| **OAuth URL** | `/oauth2/authorize/kakao` (NOT `/oauth2/authorization/`) |
| **에러 코드 도메인** | CP(고객인증) · SV(서비스) · IMG · NTF · CRM · STAT · PUB |
| **yemo 페이지** | 항상 `<div class="yemo">` 루트로 감싸기 (격리 보장) |
| **Phosphor 아이콘** | `<Icon icon="ph:..." />` 형태로만 사용 (이모지 금지) |

---

## 9. 기능별 완성도

### 핵심 비즈니스 기능 (admin) — 완성 100%

| 모듈 | 상태 | 비고 |
|---|---|---|
| 예약 관리 | ✅ | 캘린더(드래그앤드롭) + 목록 통합, 상태 인라인 변경, 스태프 배정 |
| 고객 관리 (CRM) | ✅ | VIP/단골/신규 필터 + CSV 내보내기(한글 BOM) + 태그 |
| 스태프 관리 | ✅ | 직급 · 포트폴리오 · 구독 제한 |
| 서비스 관리 | ✅ | 카테고리 시스템(DB) + 이미지 업로드(최대 3장) |
| 매출 · 통계 | ✅ | 5탭 (매출/예약/고객/직원/서비스), ApexCharts |
| 리뷰 관리 | ✅ | 답변/삭제, 이미지 업로드 |
| 매장 설정 | ✅ | 영업시간/휴무일/슬러그 · 가이드 투어 |
| 슈퍼 관리자 | ✅ | 대시보드/매장/사용자/감사로그 |

### 공개 페이지 — 부분 완료

| 영역 | 상태 | 비고 |
|---|---|---|
| 마케팅 8 페이지 | ✅ Phase 1 (2026-05-13) | yemo 디자인 적용 |
| 법적 3 페이지 | ✅ Phase 2 (2026-05-13) | yemo + sticky TOC |
| Booking 9 페이지 | ⏳ Phase 3~4 예정 | 기존 디자인 유지 중 |

### 외부 연동 미구현

| 항목 | 상태 |
|---|---|
| PG 실결제 (Toss 등) | ❌ UI만 |
| 카카오 알림톡 | ❌ 백엔드 미연동 |
| SMS 인증 | ❌ |
| 실시간 WebSocket | ❌ (현재 폴링 + SSE 부분) |

---

## 10. 향후 로드맵

### 공개 페이지 리디자인 (진행 중)

| Phase | 범위 | 상태 |
|---|---|---|
| Phase 0 — Foundation | 디자인 토큰 + 5 핵심 컴포넌트 + Phosphor + Pretendard | ✅ 2026-05-13 |
| Phase 1 — Marketing | 8 마케팅 페이지 + marketing layout | ✅ 2026-05-13 |
| Phase 2 — Legal | 3 법적 페이지 + legal layout | ✅ 2026-05-13 |
| Phase 3 — Booking 입구 | booking layout + 검색·상세·프로필 | ⏳ 예정 |
| Phase 4 — Booking 예약/마이 | reserve wizard + my-reservations 등 | ⏳ 예정 |
| Phase 5 — 정리 | backup 자산 회수 · 미사용 코드 정리 · Lighthouse 90+ | ⏳ 예정 |

### 외부 연동 / 인프라

| 항목 | 의존 |
|---|---|
| PG 결제 연동 | 백엔드 + PG사 선정 |
| 카카오 알림톡 | 백엔드 + 카카오 비즈센터 |
| WebSocket 실시간 알림 | 백엔드 |
| 다국어 지원 (i18n) | vue-i18n 설치됨 |
| E2E 테스트 (Vitest + Cypress) | — |

---

## 11. 참고 문서

### 활성 문서

| 문서 | 설명 |
|---|---|
| `CLAUDE.md` | AI 에이전트 작업 컨텍스트 + 컨벤션 + 세션 재개 가이드 |
| `docs/superpowers/specs/2026-05-12-public-redesign-design.md` | 공개 페이지 리디자인 설계 spec |
| `docs/superpowers/plans/` | Phase별 구현 plan (체크박스 기반) |
| `docs/history/` | 완료 기록 (날짜순) — Phase 완료 시점 산출물·결정 |
| `docs/contents/` | 페이지별 카피 원본 (FAQ · features · pricing · 약관 · 환불정책) |

### 백엔드·API

| 문서 | 설명 |
|---|---|
| `docs/백엔드-API-요구사항-2026-03-04.md` | 12 API · 27 엔드포인트 명세 |
| `docs/phase5-statistics-plan.md` | 통계 페이지 설계 |
| `docs/phase3-addendum-backend-*.md` | 고객 인증 API |
| `docs/phase5-backend-*.md` | 통계 API |

### 백업
- `backup/old-redesign-202603-05` — 이전 리디자인 시도 (참고용)

---

## 라이선스 / 소유권

- **상호:** YEMO
- **대표자:** 구균모
- **사업자등록번호:** 744-02-03358
- **연락처:** support@yemo.io
