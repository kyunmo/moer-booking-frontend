# URL 재구조화 및 권한 시스템 개선 보고서

**작성일:** 2026-02-12
**작성자:** Claude Code
**목적:** 공개 페이지와 관리자 페이지의 명확한 분리, 권한 기반 접근 제어 강화

---

## 1. 개요

### 1.1 배경
- 기존 시스템에서 모든 페이지가 루트 레벨에 위치하여 공개 페이지와 관리자 페이지가 혼재
- 하드코딩된 권한 체크 (publicPages 배열)로 유지보수 어려움
- URL 구조만으로는 페이지의 접근 권한을 파악하기 어려움

### 1.2 목표
- 관리자 페이지를 `/shop-admin/*` 경로로 이동하여 명확한 URL 구조 확립
- 메타 정보 기반 권한 시스템으로 전환
- 역할 기반 접근 제어 (RBAC) 구현
- 슈퍼관리자와 일반 관리자의 접근 권한 명확히 구분

### 1.3 주요 변경사항
- ✅ 디렉토리 구조 재편성 (관리자 페이지 → `shop-admin/`)
- ✅ 라우터 가드 개선 (메타 기반 권한 체크)
- ✅ 네비게이션 메뉴 URL 업데이트
- ✅ 모든 router.push() 호출 업데이트
- ✅ 공개 페이지 메타 정보 설정
- ✅ PublicHeader에 지원 링크 추가

---

## 2. 전체 사이트맵

```
moer-booking-frontend/
│
├── 공개 페이지 (Public Pages) - 인증 불필요
│   ├── / (홈페이지)
│   ├── /features (기능 소개)
│   ├── /pricing (요금제)
│   ├── /faq (자주 묻는 질문)
│   ├── /support (고객지원)
│   ├── /privacy (개인정보처리방침)
│   └── /terms (이용약관)
│
├── 인증 페이지 (Auth Pages) - blank 레이아웃
│   ├── /login (로그인)
│   ├── /register (회원가입)
│   ├── /forgot-password (비밀번호 찾기)
│   ├── /reset-password (비밀번호 재설정)
│   └── /oauth2-redirect (OAuth2 리다이렉트)
│
├── 관리자 페이지 (Shop Admin Pages) - 인증 필요
│   └── /shop-admin/
│       ├── dashboard (대시보드)
│       │
│       ├── reservations/ (예약 관리)
│       │   ├── calendar (예약 캘린더)
│       │   └── list (예약 목록)
│       │
│       ├── customers/ (고객 관리)
│       │   └── list (고객 목록)
│       │
│       ├── services/ (서비스 관리)
│       │   └── list (서비스 목록)
│       │
│       ├── staffs/ (스태프 관리)
│       │   └── list (스태프 목록)
│       │
│       ├── subscription/ (구독 관리)
│       │   └── index (구독 정보)
│       │
│       ├── coupon/ (쿠폰 관리)
│       │   └── index (쿠폰 목록)
│       │
│       ├── payment/ (결제 관리)
│       │   ├── index (결제하기)
│       │   └── history (결제 내역)
│       │
│       ├── business-settings/ (매장 설정)
│       │   ├── index (기본 설정)
│       │   ├── hours (영업시간)
│       │   └── holidays (휴무일)
│       │
│       └── super/ (슈퍼관리자 전용)
│           ├── dashboard (슈퍼관리자 대시보드)
│           ├── businesses/ (매장 관리)
│           │   └── index (매장 목록)
│           ├── users/ (사용자 관리)
│           │   └── index (사용자 목록)
│           └── audit-logs/ (감사 로그)
│               └── index (로그 목록)
│
└── 에러 페이지
    └── /[...error] (404 페이지)
```

---

## 3. URL 매핑 테이블

### 3.1 변경된 URL 매핑

| 구분 | 구 URL | 신 URL | 비고 |
|------|--------|--------|------|
| 대시보드 | `/dashboard` | `/shop-admin/dashboard` | 관리자 메인 |
| 예약 캘린더 | `/reservations/calendar` | `/shop-admin/reservations/calendar` | 예약 관리 |
| 예약 목록 | `/reservations/list` | `/shop-admin/reservations/list` | 예약 관리 |
| 고객 목록 | `/customers/list` | `/shop-admin/customers/list` | 고객 관리 |
| 서비스 목록 | `/services/list` | `/shop-admin/services/list` | 서비스 관리 |
| 스태프 목록 | `/staffs/list` | `/shop-admin/staffs/list` | 스태프 관리 |
| 구독 관리 | `/subscription` | `/shop-admin/subscription` | 구독/결제 |
| 쿠폰 관리 | `/coupon` | `/shop-admin/coupon` | 구독/결제 |
| 결제하기 | `/payment` | `/shop-admin/payment` | 구독/결제 |
| 결제 내역 | `/payment/history` | `/shop-admin/payment/history` | 구독/결제 |
| 매장 설정 | `/business-settings` | `/shop-admin/business-settings` | 설정 |
| 영업시간 | `/business-settings/hours` | `/shop-admin/business-settings/hours` | 설정 |
| 휴무일 | `/business-settings/holidays` | `/shop-admin/business-settings/holidays` | 설정 |
| 슈퍼 대시보드 | `/superadmin/dashboard` | `/shop-admin/super/dashboard` | 슈퍼관리자 |
| 매장 관리 | `/superadmin/businesses` | `/shop-admin/super/businesses` | 슈퍼관리자 |
| 사용자 관리 | `/superadmin/users` | `/shop-admin/super/users` | 슈퍼관리자 |
| 감사 로그 | `/superadmin/audit-logs` | `/shop-admin/super/audit-logs` | 슈퍼관리자 |

### 3.2 변경되지 않은 URL (공개 페이지)

| 페이지 | URL | 레이아웃 | 비고 |
|--------|-----|----------|------|
| 홈페이지 | `/` | public | 메인 랜딩 |
| 기능 소개 | `/features` | public | 제품 소개 |
| 요금제 | `/pricing` | public | 플랜 소개 |
| FAQ | `/faq` | public | 자주 묻는 질문 |
| 고객지원 | `/support` | public | 지원 페이지 |
| 개인정보처리방침 | `/privacy` | public | 법적 문서 |
| 이용약관 | `/terms` | public | 법적 문서 |
| 로그인 | `/login` | blank | 인증 페이지 |
| 회원가입 | `/register` | blank | 인증 페이지 |
| 비밀번호 찾기 | `/forgot-password` | blank | 인증 페이지 |
| 비밀번호 재설정 | `/reset-password` | blank | 인증 페이지 |
| OAuth2 리다이렉트 | `/oauth2-redirect` | blank | 인증 페이지 |

---

## 4. 권한 매트릭스

### 4.1 역할 정의

| 역할 | 코드 | 설명 |
|------|------|------|
| 비로그인 사용자 | - | 인증되지 않은 일반 방문자 |
| 일반 관리자 | `USER` | 매장 관리자 (자신의 매장만 관리) |
| 슈퍼 관리자 | `SUPER_ADMIN` | 전체 시스템 관리자 (모든 매장 관리 가능) |

### 4.2 페이지별 접근 권한

| 페이지 구분 | URL 패턴 | 비로그인 | 일반 관리자 | 슈퍼 관리자 | 비고 |
|------------|----------|----------|-------------|-------------|------|
| **공개 페이지** | | | | | |
| 홈페이지 | `/` | ✅ | ✅ | ✅ | |
| 기능/요금제/FAQ | `/features`, `/pricing`, `/faq` | ✅ | ✅ | ✅ | |
| 지원/법적문서 | `/support`, `/privacy`, `/terms` | ✅ | ✅ | ✅ | |
| **인증 페이지** | | | | | |
| 로그인/회원가입 | `/login`, `/register` | ✅ | → 대시보드 | → 대시보드 | 로그인 시 리다이렉트 |
| 비밀번호 찾기 | `/forgot-password`, `/reset-password` | ✅ | ✅ | ✅ | |
| OAuth2 리다이렉트 | `/oauth2-redirect` | ✅ | ✅ | ✅ | |
| **일반 관리자 페이지** | | | | | |
| 대시보드 | `/shop-admin/dashboard` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 예약 관리 | `/shop-admin/reservations/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 고객 관리 | `/shop-admin/customers/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 서비스 관리 | `/shop-admin/services/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 스태프 관리 | `/shop-admin/staffs/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 구독/결제 | `/shop-admin/subscription/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 쿠폰 관리 | `/shop-admin/coupon/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 결제 관리 | `/shop-admin/payment/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| 매장 설정 | `/shop-admin/business-settings/*` | → 로그인 | ✅ | ✅* | *매장 선택 필요 |
| **슈퍼 관리자 페이지** | | | | | |
| 슈퍼 대시보드 | `/shop-admin/super/dashboard` | → 로그인 | → 일반 대시보드 | ✅ | 슈퍼관리자 전용 |
| 매장 관리 | `/shop-admin/super/businesses/*` | → 로그인 | → 일반 대시보드 | ✅ | 슈퍼관리자 전용 |
| 사용자 관리 | `/shop-admin/super/users/*` | → 로그인 | → 일반 대시보드 | ✅ | 슈퍼관리자 전용 |
| 감사 로그 | `/shop-admin/super/audit-logs/*` | → 로그인 | → 일반 대시보드 | ✅ | 슈퍼관리자 전용 |

### 4.3 접근 제어 규칙

#### 규칙 1: 공개 페이지
```
IF to.meta.public === true
  → 접근 허용
```

#### 규칙 2: 로그인한 사용자의 인증 페이지 접근
```
IF to.path IN ['/login', '/register'] AND isAuthenticated
  → 리다이렉트: /shop-admin/dashboard
```

#### 규칙 3: 비로그인 사용자의 관리자 페이지 접근
```
IF NOT isAuthenticated AND to.path.startsWith('/shop-admin')
  → 리다이렉트: /login
```

#### 규칙 4: 슈퍼관리자 전용 페이지
```
IF to.path.startsWith('/shop-admin/super') AND NOT isSuperAdmin
  → 리다이렉트: /shop-admin/dashboard
```

#### 규칙 5: 슈퍼관리자의 일반 관리자 페이지 접근
```
IF isSuperAdmin AND NOT hasSelectedBusiness
   AND to.path.startsWith('/shop-admin')
   AND NOT to.path.startsWith('/shop-admin/super')
  → 리다이렉트: /shop-admin/super/dashboard
```

---

## 5. 라우터 가드 구현

### 5.1 가드 흐름도

```
┌─────────────────────────────────────────────┐
│          Router Guard 실행                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ 인증 초기화     │
         │ (1회만)        │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐     YES
         │ 공개 페이지?   ├──────────┐
         │ (meta.public)  │          │
         └────────┬───────┘          │
                  │ NO               │
                  ▼                  │
         ┌────────────────┐          │
         │ 로그인 상태?   │          │
         └────────┬───────┘          │
                  │                  │
         ┌────────┴─────────┐        │
         │                  │        │
        NO                 YES       │
         │                  │        │
         ▼                  ▼        │
    ┌────────┐      ┌──────────────┐│
    │/login  │      │ 슈퍼관리자?   ││
    │리다이렉트│      └──────┬───────┘│
    └────────┘             │        │
                   ┌───────┴────┐   │
                   │            │   │
                  NO           YES  │
                   │            │   │
                   ▼            ▼   │
              ┌────────┐  ┌──────────────┐
              │접근허용 │  │매장선택체크  │
              └────────┘  └──────┬───────┘
                                 │
                        ┌────────┴────────┐
                        │                 │
                   선택됨              미선택
                        │                 │
                        ▼                 ▼
                   ┌────────┐      ┌──────────┐
                   │접근허용 │      │슈퍼대시보드│
                   └────────┘      │리다이렉트  │
                                   └──────────┘
                                        │
                                        ▼
                                   ┌────────┐
                                   │접근허용 │
                                   └────────┘
```

### 5.2 구현 코드 (guards.js)

```javascript
import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router) {
  let isInitialized = false

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 1. 인증 초기화 (1회만)
    if (!isInitialized) {
      await authStore.initialize()
      isInitialized = true
    }

    // 2. 공개 페이지 체크
    const isPublicPage = to.meta.public === true
    const isShopAdminPage = to.path.startsWith('/shop-admin')
    const isSuperAdminPage = to.path.startsWith('/shop-admin/super')

    // 3. 공개 페이지 접근
    if (isPublicPage) {
      if (['/login', '/register'].includes(to.path) && authStore.isAuthenticated) {
        return next('/shop-admin/dashboard')
      }
      return next()
    }

    // 4. 인증 필요 페이지
    if (!authStore.isAuthenticated) {
      return next('/login')
    }

    // 5. 슈퍼관리자 전용 페이지
    if (isSuperAdminPage && !authStore.isSuperAdmin) {
      return next('/shop-admin/dashboard')
    }

    // 6. 슈퍼관리자의 일반 관리자 페이지 접근 (매장 선택 필요)
    if (isShopAdminPage && !isSuperAdminPage &&
        authStore.isSuperAdmin && !authStore.hasSelectedBusiness) {
      return next('/shop-admin/super/dashboard')
    }

    next()
  })
}
```

---

## 6. 레이아웃별 UI 요소

### 6.1 Public 레이아웃

**사용 페이지:** 공개 페이지 (홈, 기능, 요금제, FAQ, 지원, 법적문서)

**UI 구성:**
```
┌────────────────────────────────────────────┐
│  PublicHeader                              │
│  - 로고                                    │
│  - 네비게이션 (홈/기능/요금제/FAQ/지원)      │
│  - 로그인 버튼                              │
│  - 무료로 시작하기 버튼                      │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│                                            │
│  페이지 콘텐츠                              │
│                                            │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│  PublicFooter                              │
│  - 회사 정보                                │
│  - 링크 (개인정보처리방침, 이용약관)          │
│  - SNS 링크                                 │
└────────────────────────────────────────────┘
```

### 6.2 Default 레이아웃 (관리자)

**사용 페이지:** `/shop-admin/*` (슈퍼관리자 페이지 포함)

**UI 구성:**
```
┌────┬──────────────────────────────────────┐
│    │  AppBar                              │
│    │  - 매장 선택 드롭다운                  │
│    │  - 알림                               │
│    │  - 사용자 프로필                       │
│    └──────────────────────────────────────┘
│    ┌──────────────────────────────────────┐
│ V  │                                      │
│ e  │  페이지 콘텐츠                        │
│ r  │                                      │
│ t  │                                      │
│ i  │                                      │
│ c  │                                      │
│ a  │                                      │
│ l  │                                      │
│    │                                      │
│ N  │                                      │
│ a  │                                      │
│ v  │                                      │
│    └──────────────────────────────────────┘
└────┴──────────────────────────────────────┘
```

**VerticalNav 메뉴:**
- 대시보드
- 예약 관리 (캘린더, 목록)
- 고객 관리
- 서비스 관리
- 스태프 관리
- 구독 & 결제 (구독, 결제내역, 쿠폰)
- 설정 (매장설정, 영업시간, 휴무일)
- 슈퍼관리자 (슈퍼관리자만 표시)

### 6.3 Blank 레이아웃

**사용 페이지:** 인증 페이지 (로그인, 회원가입, 비밀번호 찾기/재설정, OAuth2)

**UI 구성:**
```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│         ┌──────────────────┐               │
│         │                  │               │
│         │   인증 폼         │               │
│         │                  │               │
│         └──────────────────┘               │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

- 헤더 없음
- 푸터 없음
- 네비게이션 없음
- 중앙 정렬된 카드 형태

---

## 7. 네비게이션 메뉴 구조

### 7.1 PublicHeader 네비게이션

```javascript
const navItems = [
  { title: '홈', to: '/', icon: 'ri-home-line' },
  { title: '기능', to: '/features', icon: 'ri-function-line' },
  { title: '요금제', to: '/pricing', icon: 'ri-price-tag-3-line' },
  { title: 'FAQ', to: '/faq', icon: 'ri-question-line' },
  { title: '지원', to: '/support', icon: 'ri-customer-service-line' },
]
```

### 7.2 VerticalNav 일반 메뉴

```javascript
export default [
  {
    title: '대시보드',
    to: { name: 'shop-admin-dashboard' },
    icon: { icon: 'ri-dashboard-line' },
  },
  {
    title: '예약 관리',
    icon: { icon: 'ri-calendar-line' },
    children: [
      {
        title: '예약 캘린더',
        to: { name: 'shop-admin-reservations-calendar' },
      },
      {
        title: '예약 목록',
        to: { name: 'shop-admin-reservations-list' },
      },
    ],
  },
  {
    title: '고객 관리',
    to: { name: 'shop-admin-customers-list' },
    icon: { icon: 'ri-user-line' },
  },
  {
    title: '서비스 관리',
    to: { name: 'shop-admin-services-list' },
    icon: { icon: 'ri-scissors-line' },
  },
  {
    title: '스태프 관리',
    to: { name: 'shop-admin-staffs-list' },
    icon: { icon: 'ri-team-line' },
  },
  {
    title: '구독 & 결제',
    icon: { icon: 'ri-vip-crown-line' },
    children: [
      {
        title: '구독 관리',
        to: { name: 'shop-admin-subscription' },
      },
      {
        title: '결제 내역',
        to: { name: 'shop-admin-payment-history' },
      },
      {
        title: '쿠폰 관리',
        to: { name: 'shop-admin-coupon' },
      },
    ],
  },
  {
    title: '설정',
    icon: { icon: 'ri-settings-3-line' },
    children: [
      {
        title: '매장 설정',
        to: { name: 'shop-admin-business-settings' },
      },
      {
        title: '영업시간',
        to: { name: 'shop-admin-business-settings-hours' },
      },
      {
        title: '휴무일',
        to: { name: 'shop-admin-business-settings-holidays' },
      },
    ],
  },
]
```

### 7.3 VerticalNav 슈퍼관리자 메뉴

```javascript
export const superAdminItems = [
  {
    heading: '슈퍼 관리자',
  },
  {
    title: '슈퍼 관리자',
    icon: { icon: 'ri-shield-star-line' },
    children: [
      {
        title: '대시보드',
        to: { name: 'shop-admin-super-dashboard' },
      },
      {
        title: '매장 관리',
        to: { name: 'shop-admin-super-businesses' },
      },
      {
        title: '사용자 관리',
        to: { name: 'shop-admin-super-users' },
      },
      {
        title: '감사 로그',
        to: { name: 'shop-admin-super-audit-logs' },
      },
    ],
  },
  {
    heading: '일반 메뉴',
  },
]
```

---

## 8. 파일 구조 변경 내역

### 8.1 이동된 파일

```bash
# 메인 관리자 페이지
src/pages/dashboard.vue → src/pages/shop-admin/dashboard.vue

# 예약 관리
src/pages/reservations/ → src/pages/shop-admin/reservations/
├── calendar.vue
├── list.vue
└── components/

# 고객 관리
src/pages/customers/ → src/pages/shop-admin/customers/
├── list.vue
└── components/

# 서비스 관리
src/pages/services/ → src/pages/shop-admin/services/
├── list.vue
└── components/

# 스태프 관리
src/pages/staffs/ → src/pages/shop-admin/staffs/
├── list.vue
└── components/

# 구독/결제
src/pages/subscription/ → src/pages/shop-admin/subscription/
src/pages/coupon/ → src/pages/shop-admin/coupon/
src/pages/payment/ → src/pages/shop-admin/payment/

# 매장 설정
src/pages/business-settings/ → src/pages/shop-admin/business-settings/

# 슈퍼관리자
src/pages/superadmin/ → src/pages/shop-admin/super/
```

### 8.2 수정된 파일

#### 라우터 및 권한
- ✅ `src/router/guards.js` - 메타 기반 권한 체크로 전면 개편
- ✅ `src/navigation/vertical/index.js` - 모든 라우트 이름에 `shop-admin-` 접두사 추가

#### 인증 관련
- ✅ `src/pages/login.vue` - 로그인 후 `/shop-admin/dashboard`로 리다이렉트
- ✅ `src/pages/register.vue` - 회원가입 후 `/shop-admin/dashboard`로 리다이렉트
- ✅ `src/pages/oauth2-redirect.vue` - OAuth2 로그인 후 `/shop-admin/dashboard`로 리다이렉트

#### 관리자 페이지 내부 링크
- ✅ `src/pages/shop-admin/payment/index.vue` - `/subscription` → `/shop-admin/subscription`
- ✅ `src/pages/shop-admin/payment/history.vue` - `/payment` → `/shop-admin/payment`
- ✅ `src/pages/shop-admin/subscription/index.vue` - `/payment/history` → `/shop-admin/payment/history`

#### 공개 페이지 메타 정보
- ✅ `src/pages/support.vue` - `meta.public: true` 추가
- ✅ `src/pages/privacy.vue` - `meta.public: true` 추가
- ✅ `src/pages/terms.vue` - `meta.public: true` 추가

#### UI 컴포넌트
- ✅ `src/components/public/PublicHeader.vue` - '지원' 링크 추가

---

## 9. 검증 체크리스트

### 9.1 공개 페이지 접근 테스트 (로그인 없이)
- ✅ `/` → 정상 접근 (홈페이지)
- ✅ `/features` → 정상 접근 (기능 소개)
- ✅ `/pricing` → 정상 접근 (요금제)
- ✅ `/faq` → 정상 접근 (FAQ)
- ✅ `/support` → 정상 접근 (고객지원)
- ✅ `/privacy` → 정상 접근 (개인정보처리방침)
- ✅ `/terms` → 정상 접근 (이용약관)
- ✅ `/login` → 정상 접근 (로그인 페이지)
- ✅ `/register` → 정상 접근 (회원가입 페이지)

### 9.2 관리자 페이지 접근 테스트
- ✅ 비로그인 시 `/shop-admin/dashboard` → `/login`으로 리다이렉트
- ✅ 로그인 후 `/shop-admin/dashboard` → 정상 접근
- ✅ `/shop-admin/reservations/calendar` → 정상 접근
- ✅ `/shop-admin/customers/list` → 정상 접근
- ✅ `/shop-admin/services/list` → 정상 접근
- ✅ `/shop-admin/staffs/list` → 정상 접근

### 9.3 슈퍼관리자 페이지 테스트
- ✅ 일반 사용자가 `/shop-admin/super/dashboard` 접근 → `/shop-admin/dashboard`로 리다이렉트
- ✅ 슈퍼관리자 (매장 미선택)가 `/shop-admin/dashboard` 접근 → `/shop-admin/super/dashboard`로 리다이렉트
- ✅ 슈퍼관리자 (매장 선택 후)가 `/shop-admin/dashboard` 접근 → 정상 접근

### 9.4 로그인 플로우 테스트
- ✅ `/login` 접근 → 로그인 양식 표시
- ✅ 로그인 성공 → `/shop-admin/dashboard`로 리다이렉트
- ✅ 로그인 상태에서 `/login` 접근 → `/shop-admin/dashboard`로 리다이렉트
- ✅ 회원가입 성공 → `/shop-admin/dashboard`로 리다이렉트

### 9.5 네비게이션 메뉴 테스트
- ✅ VerticalNav 메뉴 클릭 → 올바른 페이지 이동 (`/shop-admin/*`)
- ✅ PublicHeader 메뉴 클릭 → 올바른 페이지 이동 (공개 페이지)
- ✅ 슈퍼관리자 메뉴 표시 여부 (역할에 따라)

### 9.6 디자인 일관성 확인
- ✅ 공개 페이지: PublicHeader + PublicFooter 표시
- ✅ 관리자 페이지: VerticalNav + AppBar 표시
- ✅ 인증 페이지: 헤더/푸터/네비 모두 없음 (blank 레이아웃)

---

## 10. 마이그레이션 가이드

### 10.1 개발자용 체크리스트

프론트엔드 개발자가 이 변경사항을 적용할 때 확인해야 할 사항:

1. **라우터 링크 업데이트**
   - [ ] 모든 `router.push()`, `router.replace()` 호출에서 `/dashboard`, `/reservations` 등의 경로를 `/shop-admin/*`로 변경
   - [ ] 템플릿의 `:to` 속성도 확인
   - [ ] `router-link`의 `to` 속성도 확인

2. **라우트 이름 참조 업데이트**
   - [ ] `{ name: 'dashboard' }` → `{ name: 'shop-admin-dashboard' }`
   - [ ] 모든 네비게이션 가드, 미들웨어에서 라우트 이름 확인

3. **메타 정보 확인**
   - [ ] 새로운 공개 페이지 추가 시 `meta.public: true` 설정
   - [ ] 레이아웃 설정 (public, default, blank)

4. **권한 체크 로직**
   - [ ] 컴포넌트 내 권한 체크 로직이 있다면 새로운 경로 패턴 고려
   - [ ] 슈퍼관리자 매장 선택 기능 테스트

### 10.2 백엔드 팀 공유사항

- **API 엔드포인트 변경 없음**: 프론트엔드 URL만 변경되었으며, 백엔드 API는 영향 없음
- **인증/권한**: 기존 JWT 기반 인증 유지, 역할 정보 (`role`) 활용

### 10.3 QA 팀 테스트 가이드

**우선순위 높음:**
1. 모든 공개 페이지에 로그인 없이 접근 가능한지 확인
2. 관리자 페이지는 로그인 없이 접근 불가, `/login`으로 리다이렉트 확인
3. 로그인 후 대시보드 URL이 `/shop-admin/dashboard`인지 확인
4. 슈퍼관리자로 로그인 시 매장 선택 없이는 일반 관리자 페이지 접근 불가 확인

**우선순위 보통:**
5. 모든 네비게이션 메뉴가 올바른 페이지로 이동하는지 확인
6. 브라우저 뒤로가기/앞으로가기 동작 확인
7. 북마크된 구 URL 접근 시 404 페이지 확인

---

## 11. 향후 개선 사항

### 11.1 단기 개선 (1-2주)
- [ ] 구 URL에서 신 URL로의 자동 리다이렉트 규칙 추가
- [ ] 404 페이지 개선 (추천 페이지 링크 제공)
- [ ] 브레드크럼(Breadcrumb) 컴포넌트 추가로 현재 위치 명확화

### 11.2 중기 개선 (1-2개월)
- [ ] 페이지별 권한 세분화 (읽기/쓰기/삭제 권한)
- [ ] 감사 로그 시스템 강화 (페이지 접근 기록)
- [ ] 역할 관리 UI 추가 (슈퍼관리자용)

### 11.3 장기 개선 (3개월 이상)
- [ ] 다국어 지원 (i18n) 시 URL 구조 고려
- [ ] 공개 API 문서 페이지 추가 (`/docs/api`)
- [ ] 개발자 포털 구축 (`/developers`)

---

## 12. 참고 자료

### 12.1 관련 파일
- `src/router/guards.js` - 라우터 가드 구현
- `src/navigation/vertical/index.js` - 네비게이션 메뉴
- `src/stores/auth.js` - 인증 상태 관리
- `src/layouts/public.vue` - 공개 페이지 레이아웃
- `src/layouts/default.vue` - 관리자 페이지 레이아웃

### 12.2 외부 참고
- [Vue Router - Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Vue Router Auto - File-based Routing](https://github.com/posva/unplugin-vue-router)
- [Role-Based Access Control (RBAC) Best Practices](https://auth0.com/docs/manage-users/access-control/rbac)

---

## 13. 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2026-02-12 | 1.0 | 초기 문서 작성 - URL 재구조화 및 권한 시스템 개선 완료 | Claude Code |

---

## 14. 결론

이번 URL 재구조화 및 권한 시스템 개선을 통해:

✅ **명확한 URL 구조**: 공개 페이지와 관리자 페이지가 URL 레벨에서 명확히 구분
✅ **유지보수성 향상**: 메타 정보 기반 권한 체크로 하드코딩 제거
✅ **확장 가능성**: 새로운 페이지 추가 시 메타 정보만 설정하면 자동으로 권한 체크
✅ **보안 강화**: 역할 기반 접근 제어로 권한 없는 페이지 접근 차단
✅ **사용자 경험 개선**: 적절한 리다이렉트로 혼란 최소화

이 문서는 개발팀, QA팀, 그리고 향후 시스템 유지보수를 담당할 모든 구성원이 참고할 수 있는 완전한 가이드입니다.

---

**문의사항:** 이 문서에 대한 질문이나 개선 제안은 개발팀에 문의해주세요.
