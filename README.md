# MOER 예약 관리 시스템 - 프론트엔드

> **Vue 3 + Vuetify (Materio) 기반 SaaS형 예약 관리 플랫폼**
> 미용실, 필라테스, 요가, 카페 등 다양한 업종의 예약/고객/매출을 통합 관리

**버전:** 2.3.0 | **최종 점검일:** 2026-02-18 | **상태:** Beta (핵심 기능 완성)

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [아키텍처](#3-아키텍처)
4. [기능별 완성도 현황](#4-기능별-완성도-현황)
5. [페이지 구조](#5-페이지-구조)
6. [데이터 흐름 (Store / API)](#6-데이터-흐름-store--api)
7. [인증 체계](#7-인증-체계)
8. [알려진 이슈 및 기술 부채](#8-알려진-이슈-및-기술-부채)
9. [향후 로드맵](#9-향후-로드맵)
10. [개발 환경 설정](#10-개발-환경-설정)

---

## 1. 프로젝트 개요

MOER는 소규모 매장(미용실, 필라테스, 요가 등)을 위한 **SaaS형 예약 관리 플랫폼**입니다.

### 사용자 유형 3가지

| 사용자 | 설명 | 접근 경로 |
|--------|------|----------|
| **매장 관리자** | 예약/고객/스태프/매출 관리 | `/shop-admin/*` (default 레이아웃) |
| **고객 (소비자)** | 매장 검색, 예약, 리뷰 작성 | `/booking/*` (public 레이아웃) |
| **슈퍼 관리자** | 전체 매장/사용자/감사 로그 관리 | `/shop-admin/super/*` (default 레이아웃) |

### 지원 업종 (9종)

미용실, 필라테스, 요가, 카페, 스터디카페, 공방, 학원, 반려동물미용, 기타

---

## 2. 기술 스택

### 핵심 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| Vue 3 | 3.5.23 | 프레임워크 |
| Vuetify | 3.10.8 | UI 라이브러리 (Materio 템플릿) |
| Pinia | 3.0.4 | 상태 관리 |
| Vue Router | 4.5.1 | 라우팅 (파일 기반 자동 라우팅) |
| Axios | - | HTTP 클라이언트 |
| Vite | - | 빌드 도구 |

### 주요 라이브러리

| 라이브러리 | 용도 |
|-----------|------|
| FullCalendar 6.1 | 예약 캘린더 (day/week/month) |
| ApexCharts 3.54 | 통계 차트 |
| Shepherd.js 13.0 | 가이드 투어 |
| Swiper 11.2 | 이미지 캐로셀 |
| CASL 6.7 | 권한 관리 |
| jwt-decode 4.0 | JWT 토큰 파싱 |
| TipTap 2.27 | Rich Text Editor |
| Flatpickr 11.0 | 날짜 선택기 |

---

## 3. 아키텍처

### 디렉토리 구조

```
src/
├── api/                    # API 모듈 (21개) - axios 기반
├── assets/                 # 정적 자원 (이미지, SVG)
├── components/             # 공통 컴포넌트 (38개)
│   ├── dialogs/            # 공용 다이얼로그
│   ├── landing/            # 랜딩 페이지 섹션
│   └── public/             # 공개 레이아웃 (Header, Footer, BottomNav)
├── composables/            # Vue Composables (4개)
├── constants/              # 상수 정의 (업종 등)
├── layouts/                # 레이아웃 (default, blank, public)
├── navigation/             # 네비게이션 메뉴 정의
├── pages/                  # 페이지 컴포넌트 (68개) - 파일 기반 라우팅
│   ├── booking/            # 고객용 예약 페이지
│   └── shop-admin/         # 관리자 페이지
│       ├── reservations/   # 예약 관리
│       ├── customers/      # 고객 관리
│       ├── staffs/         # 스태프 관리
│       ├── services/       # 서비스 관리
│       ├── statistics/     # 통계/분석
│       ├── reviews/        # 리뷰 관리
│       ├── business-settings/ # 매장 설정
│       ├── subscription/   # 구독 관리
│       ├── payment/        # 결제
│       ├── coupon/         # 쿠폰
│       ├── notification-logs/ # 알림 이력
│       └── super/          # 슈퍼 관리자
├── plugins/                # Vue 플러그인 (Vuetify, Pinia, Router)
├── stores/                 # Pinia 스토어 (19개)
└── @core/, @layouts/       # Materio 템플릿 코어
```

### 레이아웃 체계

| 레이아웃 | 용도 | 인증 |
|---------|------|------|
| `default` | 관리자 페이지 | 필수 (admin token) |
| `blank` | 로그인/회원가입 | 불필요 |
| `public` | 고객 예약/랜딩 | 선택 (customer token) |

### 다이얼로그 패턴 (프로젝트 표준)

모든 도메인(예약/고객/스태프/서비스)이 `v-model` (modelValue prop + update:modelValue emit) 기반
**Detail + Form + ConfirmDelete** 3종 다이얼로그 구성.

---

## 4. 기능별 완성도 현황

### 전체 요약

```
핵심 운영 기능:   ████████████████████ 100%  (예약/고객/스태프/서비스)
분석/피드백:      ████████████████████ 100%  (통계 5탭/리뷰)
매장 설정:        ████████████████████ 100%  (기본정보/영업시간/휴무일/슬러그)
고객 예약 플로우:  ████████████████████ 100%  (검색/예약/리뷰/내예약)
고객 인증:        ████████████████████ 100%  (카카오 OAuth/프로필)
슈퍼 관리자:      ████████████████████ 100%  (대시보드/매장/사용자/감사로그)
구독/결제:        ████████████████░░░░  80%  (UI 완성, PG 미연동)
UX 부가기능:      ██████████████░░░░░░  70%  (투어/온보딩 완성, 알림톡/SMS 미구현)
공개 정적 페이지:  ████████████████░░░░  80%  (법률문서 임시/연락처 미정)
```

### 모듈별 상세

#### A. 예약 관리 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 캘린더 뷰 (일/주/월) | 완성 | FullCalendar, 영업시간 연동 |
| 목록 뷰 (테이블) | 완성 | 날짜/상태/검색 필터 |
| 예약 생성/수정/취소 | 완성 | 다이얼로그, 구독 제한 체크 |
| 상태 인라인 변경 | 완성 | 대기→확정→완료, 칩 클릭 |
| 스태프 배정 | 완성 | AssignStaffDialog |
| 날짜 범위 필터 | 완성 | Flatpickr 연동 |

#### B. 고객 관리 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 고객 목록 (테이블) | 완성 | VDataTable, 이름/전화번호 검색 |
| VIP/단골/신규 필터 | 완성 | 서버사이드 필터링 |
| 고객 등록/수정/삭제 | 완성 | FormDialog |
| 방문 이력/결제액 표시 | 완성 | 테이블 컬럼 |

#### C. 스태프 관리 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 스태프 목록 (카드) | 완성 | 그리드 뷰, 활성 토글 |
| 등록/수정/삭제 | 완성 | FormDialog |
| 직급 관리 | 완성 | PositionManageDialog |
| 포트폴리오 | 완성 | 이미지 업로드 |
| 구독 제한 | 완성 | 인원수 초과 시 안내 |

#### D. 서비스 관리 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 서비스 목록 (카드) | 완성 | 그리드 뷰, 활성 토글 |
| 카테고리 관리 | 완성 | DB 기반, 정렬/아이콘/색상 |
| 등록/수정/삭제 | 완성 | FormDialog |
| 카테고리 필터 | 완성 | 동적 옵션 |

#### E. 매출/통계 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 매출 분석 탭 | 완성 | 일/주/월별, ApexCharts |
| 예약 분석 탭 | 완성 | 상태별, 시간대별 |
| 고객 분석 탭 | 완성 | 신규/재방문, 세그먼트 |
| 직원 성과 탭 | 완성 | 건수/매출 비교 |
| 서비스 분석 탭 | 완성 | 카테고리별, 인기도 |
| 공통 필터바 | 완성 | 기간 선택, 전기간/전년 비교 |

#### F. 리뷰 관리 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 리뷰 목록 | 완성 | 카드, 평점/상태/날짜 필터 |
| 답변 작성 | 완성 | 텍스트 입력, API 연동 |
| 리뷰 삭제 | 완성 | 사유 입력, 소프트 삭제 |

#### G. 고객 예약 플로우 (public) - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 매장 검색 | 완성 | 키워드/업종/정렬, 페이지네이션 |
| 매장 상세 | 완성 | 서비스/영업시간/리뷰, 탭 구조 |
| 단계별 예약 | 완성 | 서비스→날짜→시간→확인 스테퍼 |
| 비회원 예약 조회 | 완성 | 예약번호+전화번호 |
| 내 예약 (회원) | 완성 | 상태 필터, 취소 기능 |
| 리뷰 작성 | 완성 | 별점, 스태프 선택, 로그인 필요 |
| 카카오 로그인 | 완성 | OAuth2, 신규→프로필 등록 플로우 |
| 고객 프로필 | 완성 | 이름/전화번호/마케팅동의 |
| 모바일 하단 네비게이션 | 완성 | BookingBottomNav 컴포넌트 |

#### H. 매장 설정 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 기본 정보 | 완성 | 매장명/업종/전화/주소/소개 |
| 목표 설정 | 완성 | 일일매출/월간매출/신규고객 목표 |
| 영업시간 | 완성 | 요일별 ON/OFF + 시간 설정 |
| 휴무일 | 완성 | 정기/임시 구분, 연도별 |
| 예약 URL (슬러그) | 완성 | 실시간 중복 체크, 추천 주소 |
| 가이드 투어 초기화 | 완성 | 완료 투어 카운트/리셋 |

#### I. 구독/결제 - 80% (UI 완성)

| 기능 | 상태 | 비고 |
|------|------|------|
| 구독 현황 표시 | 완성 | 플랜/사용량/남은 기간 |
| 플랜 변경 UI | 완성 | PlanChangeDialog |
| 결제 내역 조회 | 완성 | 완료/실패/환불 통계 |
| 쿠폰 관리 | 완성 | 생성/검증/통계 |
| **PG 실결제 연동** | **미구현** | UI만 존재, PG사 미연결 |

#### J. 슈퍼 관리자 - 완성

| 기능 | 상태 | 비고 |
|------|------|------|
| 시스템 대시보드 | 완성 | 전체 통계 카드 |
| 매장 관리 | 완성 | 조회/수정/삭제, 일괄 상태 변경 |
| 사용자 관리 | 완성 | 역할 변경/정지/삭제 |
| 감사 로그 | 완성 | 액션 타입 필터 |

#### K. UX 부가 기능

| 기능 | 상태 | 비고 |
|------|------|------|
| 온보딩 위저드 | 완성 | 매장등록→서비스→스태프→영업시간→완료 |
| 가이드 투어 | 완성 | 5개 페이지, 모바일 반응형, 리셋 |
| 랜딩 페이지 | 완성 | Hero/기능소개/통계/요금/FAQ/CTA |
| 다크 모드 | 완성 | Vuetify 자동 지원 |
| 알림 시스템 | 완성 | 폴링 기반, 읽음/전체읽음 |
| **카카오 알림톡** | **미구현** | 백엔드 미연동 |
| **SMS 인증** | **미구현** | Phase 4 이관 |
| **실시간 WebSocket** | **미구현** | 현재 폴링 방식 |

---

## 5. 페이지 구조

### 관리자 메뉴 구성

```
핵심 운영
  ├── 대시보드                    /shop-admin/dashboard
  ├── 예약 관리
  │   ├── 예약 캘린더             /shop-admin/reservations/calendar
  │   └── 예약 목록               /shop-admin/reservations/list
  └── 고객 관리                   /shop-admin/customers/list

분석 · 피드백
  ├── 매출 · 통계                 /shop-admin/statistics
  └── 리뷰 관리                   /shop-admin/reviews/list

매장 설정
  ├── 서비스 관리                  /shop-admin/services/list
  ├── 스태프 관리                  /shop-admin/staffs/list
  └── 매장 정보
      ├── 기본 정보               /shop-admin/business-settings
      ├── 영업시간                /shop-admin/business-settings/hours
      └── 휴무일                  /shop-admin/business-settings/holidays

구독 · 결제
  ├── 구독 관리                   /shop-admin/subscription
  ├── 결제 내역                   /shop-admin/payment/history
  ├── 쿠폰 관리                   /shop-admin/coupon
  └── 알림 이력                   /shop-admin/notification-logs/list
```

### 슈퍼 관리자 메뉴

```
슈퍼 관리자
  ├── 대시보드                    /shop-admin/super/dashboard
  ├── 매장 관리                   /shop-admin/super/businesses
  ├── 사용자 관리                  /shop-admin/super/users
  └── 감사 로그                   /shop-admin/super/audit-logs
```

### 고객 예약 페이지

```
/booking                         매장 검색/목록
/booking/:slug                   매장 상세 (서비스/리뷰/영업시간)
/booking/:slug/reserve           단계별 예약 (서비스→날짜→시간→확인)
/booking/:slug/review            리뷰 작성
/booking/login                   카카오 로그인
/booking/profile                 프로필 관리
/booking/my-reservations         내 예약 목록
/booking/reservation             비회원 예약 조회
```

### 공개 페이지

```
/                                랜딩 페이지
/login                           관리자 로그인 (이메일 + SNS)
/register                        관리자 회원가입 (30일 체험판)
/forgot-password                 비밀번호 찾기
/reset-password                  비밀번호 재설정
/oauth2-redirect                 OAuth2 콜백 (admin/customer 분기)
/features                        기능 소개
/pricing                         요금제 안내
/faq                             자주 묻는 질문
/support                         고객 지원
/terms                           이용약관 (임시 버전)
/privacy                         개인정보처리방침 (임시 버전)
```

---

## 6. 데이터 흐름 (Store / API)

### Store 목록 (19개)

| Store | 역할 | 주요 상태 |
|-------|------|----------|
| `auth` | 관리자 인증 | user, business, token, trial |
| `customer-auth` | 고객 인증 | customer, token, isNewUser |
| `reservation` | 예약 CRUD | reservations, calendarEvents |
| `customer` | 고객 관리 (관리자용) | customers (VIP/단골/신규 getter) |
| `staff` | 스태프 관리 | staffs (활성/직급/전문분야 getter) |
| `staff-position` | 직급 관리 | positions (5분 캐시) |
| `service` | 서비스 관리 | services (카테고리별/활성 getter) |
| `service-category` | 카테고리 관리 | categories (5분 캐시) |
| `booking` | 고객 예약 플로우 | 스테퍼 상태, 매장/서비스/시간 |
| `review` | 리뷰 관리 | reviews, stats, pagination |
| `statistics` | 통계 데이터 | 도메인별 5개 (매출/예약/고객/직원/서비스) |
| `dashboard` | 대시보드 | dashboardData, goals |
| `business-settings` | 매장 설정 | business, holidays |
| `subscription` | 구독 관리 | subscriptionInfo (사용량 getter) |
| `payment` | 결제 | payments (완료/실패/환불 getter) |
| `coupon` | 쿠폰 | coupons (활성/만료 getter) |
| `notification` | 알림 | notifications, unreadCount, polling |
| `superadmin` | 슈퍼관리자 | systemStats, businesses, users, auditLogs |
| `onboarding` | 온보딩 | status |

### API 모듈 (21개)

| 모듈 | 엔드포인트 수 | 비고 |
|------|-------------|------|
| `auth.js` | 13 | 로그인/가입/프로필/소셜/탈퇴 |
| `reservations.js` | 9 | 예약 CRUD + 상태 변경 |
| `customers.js` | 10 | 고객 CRUD + VIP/신규/단골 필터 |
| `staffs.js` | 13 | 스태프 CRUD + 스케줄/포트폴리오 |
| `services.js` | 6 | 서비스 CRUD + 활성 토글 |
| `service-categories.js` | 6 | 카테고리 CRUD + 정렬 |
| `staff-positions.js` | 6 | 직급 CRUD + 정렬 |
| `public-booking.js` | 10 | 공개 예약 (매장검색/예약/리뷰) |
| `customer.js` | 7 | 고객 인증 (프로필/예약/리뷰) |
| `statistics.js` | 5 | 통계 5개 도메인 |
| `reviews.js` | 3 | 리뷰 조회/답변/삭제 |
| `dashboard.js` | 2 | 대시보드 통계/목표 |
| `business-settings.js` | 8 | 매장 정보/설정/휴무일 |
| `subscription.js` | 3 | 구독 조회/변경/취소 |
| `payment.js` | 6 | 결제 CRUD/환불 |
| `coupon.js` | 6 | 쿠폰 CRUD/검증 |
| `notifications.js` | 3 | 알림 조회/읽음 처리 |
| `notification-logs.js` | 1 | 알림 이력 조회 |
| `onboarding.js` | 2 | 온보딩 상태/스킵 |
| `superadmin.js` | 13 | 시스템 통계/매장/사용자/감사로그 |
| `axios.js` | - | 인터셉터 (토큰 3분기, 자동 갱신) |

### Composables (4개)

| 파일 | 역할 |
|------|------|
| `useSnackbar.js` | 전역 스낵바 (success/error/warning/info) |
| `useBusinessIcon.js` | 업종/카테고리별 아이콘/색상 |
| `useTour.js` | Shepherd.js 가이드 투어 (5페이지, 모바일 반응형) |
| `useApi.js` | VueUse fetch 래퍼 (사실상 미사용) |

---

## 7. 인증 체계

### 이중 토큰 시스템

```
관리자 토큰: localStorage.accessToken
              ├── /shop-admin/* 페이지에서 사용
              └── Authorization: Bearer {token} 헤더

고객 토큰:   localStorage.customerAccessToken
              ├── /booking/* 페이지에서 사용
              └── /api/customer/** 요청에만 적용
```

### Axios 인터셉터 분기 (3-way)

```
요청 URL 판단:
  ├── /public/** → 토큰 없음 (공개 API)
  ├── /customer/** → customerAccessToken 사용
  └── 나머지 → accessToken 사용 (+ 슈퍼관리자: X-Business-Id 헤더)
```

### OAuth2 플로우

```
카카오 로그인 → /oauth2/authorize/kakao?loginType={admin|customer}
              → 카카오 인증
              → /oauth2-redirect (콜백)
              → loginType 분기:
                  admin    → authStore 저장 → /shop-admin/dashboard
                  customer → customerAuthStore 저장
                             → isNewUser ? /booking/profile : /booking/my-reservations
```

### 라우터 가드 흐름

```
beforeEach:
  1. 초기화: authStore + customerAuthStore (Promise.all)
  2. meta.public === true → 통과 (이미 로그인 시 /login,/register 리다이렉트)
  3. 미인증 + 비공개 → /login 리다이렉트
  4. /super/* + 비슈퍼관리자 → /dashboard 리다이렉트
  5. 슈퍼관리자 + 매장 미선택 → /super/dashboard 리다이렉트
```

> **참고:** 고객 페이지(/booking/*)는 라우터 가드가 아닌 각 페이지 `onMounted`에서 인증 체크

---

## 8. 알려진 이슈 및 기술 부채

### 우선순위: 높음 (프로덕션 배포 전 필수)

| # | 이슈 | 위치 | 설명 |
|---|------|------|------|
| 1 | 에러 핸들링 패턴 비일관 | stores 전체 | 3가지 패턴 혼재: (A) error 상태 저장 + throw, (B) throw만, (C) throw 없음. statistics store는 throw 없어 UI 에러 감지 불가 |
| 2 | auth.js error.response?.status 오용 | `stores/auth.js` | axios 인터셉터 변환 후 error.response는 없음. error.status가 올바른 접근 |
| 3 | console.log 디버그 코드 잔존 | `stores/reservation.js`, `stores/auth.js` | 프로덕션 배포 시 제거 필요 |
| 4 | login.vue 테스트 계정 노출 | `pages/login.vue` | isDev 조건만으로 보호. 환경변수 제어 또는 제거 필요 |
| 5 | 법률 문서 임시 버전 | `terms.vue`, `privacy.vue` | "임시 버전" 주석. 서비스 런칭 전 법률 검토 필수 |
| 6 | 연락처 미정 | `faq.vue`, `support.vue` | `1588-XXXX` 하드코딩 |

### 우선순위: 중간 (코드 품질)

| # | 이슈 | 위치 | 설명 |
|---|------|------|------|
| 7 | Materio 미사용 다이얼로그 14개 | `components/dialogs/` | ConfirmDeleteDialog, ConfirmDialog 외 12개 미사용 |
| 8 | useApi.js 사실상 미사용 | `composables/useApi.js` | NavSearchBar에서만 참조. 제거 또는 통합 검토 |
| 9 | notification-logs Store 미구현 | `notification-logs/list.vue` | API 직접 호출. 다른 페이지는 모두 Store 경유 |
| 10 | nul 파일 | 프로젝트 루트 | Windows 환경 잘못 생성된 파일. 삭제 필요 |
| 11 | dashboard.js 미사용 import | `stores/dashboard.js` | dashboardApi import 후 apiClient 직접 사용 |
| 12 | ConfirmDialog 2종 패턴 | `dialogs/` | Materio 원본(isDialogVisible) vs 프로젝트 표준(modelValue) |
| 13 | 고객 페이지 인증 가드 불일관 | `booking/*.vue` | 라우터 가드 대신 각 페이지 onMounted에서 직접 체크 |
| 14 | API 함수 중 Store 미연결분 | 다수 | staffs(스케줄/포트폴리오), customers(전화번호 조회) 등 일부 API 함수는 페이지에서 직접 호출 |

---

## 9. 향후 로드맵

### 개요: 현재 위치

핵심 비즈니스 기능(예약/고객/스태프/서비스/통계/리뷰/고객예약)이 **모두 구현 완료**된 상태.
프로덕션 배포를 위해서는 **코드 안정화 → 결제 연동 → 알림 고도화** 순서가 필요.

### Phase 6: 안정화 및 코드 품질 (권장 최우선)

> 프로덕션 배포 전 반드시 해결해야 할 기술 부채 정리

| # | 작업 | 규모 |
|---|------|------|
| 6-1 | 에러 핸들링 패턴 통일 (throw 기반 + 컴포넌트 catch) | 중 |
| 6-2 | console.log / 디버그 코드 전수 제거 | 소 |
| 6-3 | Materio 미사용 코드 정리 (다이얼로그 12개, horizontal nav 등) | 소 |
| 6-4 | 법률 문서 정식 버전 교체 (약관/개인정보) | 소 |
| 6-5 | 연락처/사업자 정보 확정 반영 | 소 |
| 6-6 | login.vue 테스트 계정 제거/환경변수 제어 | 소 |
| 6-7 | .env.example 문서화 | 소 |

### Phase 7: PG 결제 연동

> 구독 모델 수익화를 위한 핵심. UI는 이미 완성됨

| # | 작업 | 의존성 |
|---|------|--------|
| 7-1 | PG사 선정 및 API 키 설정 (Toss Payments 등) | 사업 결정 |
| 7-2 | 백엔드 결제 웹훅 구현 | 백엔드 |
| 7-3 | 프론트엔드 결제 위젯 연동 | 7-1, 7-2 |
| 7-4 | 정기 결제 (구독 자동 갱신) | 7-3 |
| 7-5 | 환불 플로우 완성 | 7-3 |

### Phase 8: 알림 고도화

> 현재 폴링 기반 → 실시간 전환 + 외부 메시징

| # | 작업 | 의존성 |
|---|------|--------|
| 8-1 | WebSocket 실시간 알림 | 백엔드 |
| 8-2 | 카카오 알림톡 연동 (예약 확인/변경/리마인드) | 카카오 비즈니스 계정 + 백엔드 |
| 8-3 | SMS 인증 로그인 (고객용) | SMS API + 백엔드 |
| 8-4 | 이메일 알림 설정 | 백엔드 |

### Phase 9: 고도화 기능

| # | 작업 | 설명 |
|---|------|------|
| 9-1 | 매출 리포트 다운로드 (PDF/Excel) | 통계 페이지 확장 |
| 9-2 | 고객 세그먼트별 마케팅 메시지 | CRM 기능 |
| 9-3 | 스태프 스케줄 관리 고도화 | 캘린더 기반 근무표 |
| 9-4 | 다국어 지원 (i18n) | vue-i18n 이미 설치됨 |
| 9-5 | PWA 지원 | 모바일 앱 대체 |
| 9-6 | 테스트 코드 (Vitest + Cypress) | 품질 보증 |

### 우선순위 결정 매트릭스

```
                  긴급함
                    ↑
      Phase 6      |    Phase 7
     (코드 품질)    |    (PG 결제)
                    |
  ──────────────────┼────────────────→ 비즈니스 임팩트
                    |
      Phase 9      |    Phase 8
     (고도화)       |    (알림)
                    |
```

**권장 순서:** Phase 6 (안정화) → Phase 7 (결제) → Phase 8 (알림) → Phase 9 (고도화)

---

## 10. 개발 환경 설정

### 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 (포트 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 린트
npm run lint
```

### 환경 변수 (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=moer 예약 관리 시스템
VITE_APP_SHORT_NAME=moer
VITE_PORT=5173
```

### 백엔드 연동

- 백엔드 API 서버가 `http://localhost:8080`에서 실행 중이어야 합니다
- API 문서: `docs/` 폴더 내 phase별 request/response 문서 참조

---

## 부록: 주요 문서 목록

| 문서 | 설명 |
|------|------|
| `docs/TODO-2026-02-14.md` | UX 페르소나 평가 + Phase별 로드맵 (원본) |
| `docs/phase5-statistics-plan.md` | 통계 페이지 설계 |
| `docs/phase3-addendum-backend-*.md` | 고객 인증 시스템 API 정의 |
| `docs/phase5-backend-*.md` | 통계 API 정의 |
| `docs/tour-feature-plan.md` | 가이드 투어 기능 설계 |
