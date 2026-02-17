# Tour(가이드 투어) 기능 기획서

## 1. 개요

### 목적
신규 사용자가 관리자 화면의 핵심 기능을 빠르게 이해하고, 기존 사용자도 언제든 다시 기능을 확인할 수 있는 인터랙티브 가이드 투어 기능.

### 기술 스택
| 항목 | 내용 |
|------|------|
| 라이브러리 | **Shepherd.js v13.0.3** + **vue-shepherd v3.0.0** |
| 설치 상태 | **이미 설치됨** (package.json에 포함) |
| SCSS | `src/@core/scss/template/libs/shepherd.scss` (이미 존재) |
| 호환성 | NavSearchBar에 `Shepherd.activeTour?.cancel()` 이미 연동됨 |
| 참고 템플릿 | `docs/vue-version/.../src/pages/extensions/tour.vue` |

---

## 2. 사용자 시나리오

### 2-1. 신규 사용자 (첫 접속)
```
회원가입 → 로그인 → 대시보드
  ├─ OnboardingWizard 표시 (기존: 서비스/스태프/첫예약 설정)
  ├─ OnboardingWizard 완료 or 건너뛰기
  └─ 자동으로 대시보드 투어 시작 (첫 1회만)
       └─ localStorage에 'tour_completed_dashboard' = true 저장
```

### 2-2. 기존 사용자 (수동 실행)
```
관리자 화면 어디서든
  ├─ 상단 Navbar의 투어 버튼 (?) 클릭
  │    └─ 현재 페이지에 맞는 투어 시작
  └─ 또는 UserProfile 드롭다운 > "가이드 투어" 메뉴 클릭
       └─ 대시보드로 이동 후 전체 투어 시작
```

---

## 3. 투어 버튼 배치

### 위치 1: 상단 Navbar (주요)
```
[햄버거] [테마전환]     ─── 빈공간 ───     [투어?] [알림🔔] [프로필👤]
```
- **파일**: `src/layouts/components/DefaultLayoutWithVerticalNav.vue`
- **위치**: `NavBarNotifications` 왼쪽
- **컴포넌트**: `IconBtn` (ri-compass-discover-line 또는 ri-route-line)
- **Tooltip**: "가이드 투어"
- **ID**: `#tour-trigger-btn` (Shepherd step attach 용)

### 위치 2: UserProfile 드롭다운 메뉴 (보조)
```
프로필
매장 설정
──────
가이드 투어  ← 추가
고객지원
```
- **파일**: `src/layouts/components/UserProfile.vue`
- **위치**: "고객지원" 위에 추가

---

## 4. 투어 스텝 설계

### 4-1. 대시보드 투어 (Dashboard Tour) - 신규 사용자 자동 + 수동
> 대시보드 페이지(`/shop-admin/dashboard`)에서 실행

| # | ID | 대상 요소 | 제목 | 설명 | attachTo |
|---|-----|-----------|------|------|----------|
| 1 | welcome | `.layout-navbar` | 환영합니다! 🎉 | YEMO 관리자 화면을 소개합니다. 주요 기능을 빠르게 안내해드릴게요. | bottom |
| 2 | sidebar-nav | `.layout-vertical-nav` | 사이드바 메뉴 | 왼쪽 메뉴에서 예약 관리, 고객 관리, 매장 설정 등 모든 기능에 접근할 수 있습니다. | right |
| 3 | quick-actions | `.quick-action-card:first-child` 의 부모 Row | 퀵 액션 | 자주 사용하는 기능을 빠르게 실행할 수 있습니다. 예약 등록, 고객 등록, 통계, 매장 설정에 바로 접근하세요. | bottom |
| 4 | notifications | `#notification-btn` 또는 NavBarNotifications | 알림 센터 | 새 예약, 예약 확정 요청 등 중요한 알림을 실시간으로 받아보세요. | bottom |
| 5 | theme-switcher | NavbarThemeSwitcher | 테마 전환 | 다크 모드와 라이트 모드를 전환할 수 있습니다. | bottom |
| 6 | tour-btn | `#tour-trigger-btn` | 가이드 투어 | 언제든 이 버튼을 눌러 가이드를 다시 볼 수 있습니다. | bottom |
| 7 | user-profile | `.user-profile-badge` | 프로필 메뉴 | 프로필 수정, 매장 설정, 로그아웃 등을 이용할 수 있습니다. | bottom-end |

### 4-2. 예약 관리 투어 (Reservation Tour)
> 예약 캘린더 페이지(`/shop-admin/reservations/calendar`)에서 실행

| # | ID | 대상 요소 | 제목 | 설명 |
|---|-----|-----------|------|------|
| 1 | calendar-view | `.fc` (FullCalendar) | 예약 캘린더 | 캘린더에서 모든 예약을 한눈에 확인하세요. 색상별로 예약 상태를 구분할 수 있습니다. (노랑=대기, 파랑=확정, 초록=완료, 빨강=취소) |
| 2 | date-picker | `.calendar-date-picker` 또는 인라인 달력 | 날짜 선택 | 왼쪽 달력에서 날짜를 클릭하면 해당 날짜로 빠르게 이동합니다. |
| 3 | status-filter | 상태 필터 체크박스 영역 | 상태 필터 | 보고 싶은 상태만 선택해서 필터링할 수 있습니다. |
| 4 | create-reservation | 예약 추가 버튼 | 새 예약 추가 | 이 버튼을 클릭하거나, 캘린더의 빈 시간을 클릭해서 새 예약을 만들 수 있습니다. |

### 4-3. 고객 관리 투어 (Customer Tour)
> 고객 목록 페이지(`/shop-admin/customers/list`)에서 실행

| # | ID | 대상 요소 | 제목 | 설명 |
|---|-----|-----------|------|------|
| 1 | customer-filters | 필터 버튼 영역 | 고객 분류 | 전체, VIP, 단골, 신규로 고객을 분류하여 볼 수 있습니다. 방문 횟수에 따라 자동 분류됩니다. |
| 2 | customer-stats | 통계 카드 영역 | 고객 통계 | 전체 고객 수, VIP 수, 신규 고객 수를 한눈에 확인할 수 있습니다. |
| 3 | customer-table | 데이터 테이블 | 고객 목록 | 고객 이름, 방문 횟수, 총 결제 금액 등을 확인하고 관리할 수 있습니다. |
| 4 | add-customer | 고객 추가 버튼 | 고객 등록 | 새로운 고객을 등록할 수 있습니다. 예약 시 자동으로 등록되기도 합니다. |

### 4-4. 서비스/스태프 투어 (Service Tour)
> 서비스 관리 페이지(`/shop-admin/services/list`)에서 실행

| # | ID | 대상 요소 | 제목 | 설명 |
|---|-----|-----------|------|------|
| 1 | service-categories | 카테고리 필터 | 서비스 카테고리 | 카테고리별로 서비스를 분류하여 관리할 수 있습니다. |
| 2 | service-card | 서비스 카드 첫번째 | 서비스 카드 | 서비스명, 가격, 소요 시간, 담당 스태프 등의 정보를 확인할 수 있습니다. 활성/비활성 토글로 예약 가능 여부를 제어하세요. |
| 3 | add-service | 서비스 추가 버튼 | 서비스 등록 | 새 서비스를 등록하세요. 이름, 가격, 소요 시간, 카테고리를 설정할 수 있습니다. |

### 4-5. 매장 설정 투어 (Settings Tour)
> 매장 기본 정보 페이지(`/shop-admin/business-settings`)에서 실행

| # | ID | 대상 요소 | 제목 | 설명 |
|---|-----|-----------|------|------|
| 1 | business-info | 기본 정보 폼 영역 | 매장 기본 정보 | 매장명, 업종, 연락처, 주소 등 기본 정보를 설정할 수 있습니다. |
| 2 | booking-url | 예약 페이지 URL 영역 | 예약 페이지 주소 | 고객이 접속하는 예약 페이지 URL입니다. 카카오톡이나 SNS에 공유하세요! |
| 3 | revenue-goals | 매출 목표 영역 | 매출 목표 | 일별/월별 목표 매출을 설정하면 대시보드에서 달성률을 확인할 수 있습니다. |

---

## 5. 구현 구조

### 5-1. 파일 구조
```
src/
  composables/
    useTour.js                  ← [신규] Tour 핵심 로직 composable
  layouts/
    components/
      DefaultLayoutWithVerticalNav.vue  ← [수정] 투어 버튼 추가
      UserProfile.vue                   ← [수정] 메뉴에 "가이드 투어" 추가
  pages/
    shop-admin/
      dashboard.vue             ← [수정] 온보딩 완료 후 자동 투어 트리거
```

### 5-2. useTour.js Composable 설계

```js
// src/composables/useTour.js
import { useShepherd } from 'vue-shepherd'

const TOUR_STORAGE_PREFIX = 'yemo_tour_completed_'

export function useTour() {
  let tourInstance = null

  // 투어 완료 여부 확인
  function isTourCompleted(tourId) {
    return localStorage.getItem(`${TOUR_STORAGE_PREFIX}${tourId}`) === 'true'
  }

  // 투어 완료 기록
  function markTourCompleted(tourId) {
    localStorage.setItem(`${TOUR_STORAGE_PREFIX}${tourId}`, 'true')
  }

  // 투어 완료 기록 초기화
  function resetTourCompleted(tourId) {
    localStorage.removeItem(`${TOUR_STORAGE_PREFIX}${tourId}`)
  }

  // 모든 투어 초기화
  function resetAllTours() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(TOUR_STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }

  // 투어 생성 및 시작
  function startTour(tourId, steps) {
    // 기존 투어가 활성 중이면 종료
    if (tourInstance?.isActive()) {
      tourInstance.cancel()
    }

    tourInstance = useShepherd({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        modalOverlayOpeningPadding: 4,
        modalOverlayOpeningRadius: 8,
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    })

    tourInstance.addSteps(steps)

    tourInstance.on('complete', () => {
      markTourCompleted(tourId)
    })

    tourInstance.start()
    return tourInstance
  }

  // 현재 페이지에 맞는 투어 시작
  function startPageTour(routeName) {
    const tourMap = {
      'shop-admin-dashboard': startDashboardTour,
      'shop-admin-reservations-calendar': startReservationTour,
      'shop-admin-customers-list': startCustomerTour,
      'shop-admin-services-list': startServiceTour,
      'shop-admin-business-settings': startSettingsTour,
    }

    const tourFn = tourMap[routeName]
    if (tourFn) tourFn()
    else startDashboardTour() // 기본: 대시보드 투어
  }

  return {
    isTourCompleted,
    markTourCompleted,
    resetTourCompleted,
    resetAllTours,
    startTour,
    startPageTour,
    startDashboardTour,
    startReservationTour,
    // ... 각 페이지별 투어 함수
  }
}
```

### 5-3. 투어 스텝 버튼 패턴 (Shepherd)
```js
// 공통 버튼 패턴
function makeButtons(tour, isFirst, isLast) {
  const buttons = []

  if (!isFirst) {
    buttons.push({
      text: '이전',
      action: tour.back,
      classes: 'backBtnClass',
    })
  }

  if (isLast) {
    buttons.push({
      text: '완료',
      action: tour.complete,
      classes: 'nextBtnClass',
    })
  } else {
    buttons.push({
      text: '다음',
      action: tour.next,
      classes: 'nextBtnClass',
    })
  }

  return buttons
}
```

---

## 6. 신규 사용자 자동 투어 흐름

```
dashboard.vue onMounted()
  │
  ├─ onboardingStore.fetchStatus()
  │
  ├─ if (!status.completed && !status.skipped)
  │    └─ showOnboarding = true (기존 OnboardingWizard)
  │
  └─ else
       ├─ loadDashboard()
       └─ if (!isTourCompleted('dashboard'))
            └─ nextTick → setTimeout(300ms) → startDashboardTour()
                 └─ tour.on('complete') → markTourCompleted('dashboard')
```

### 핵심: OnboardingWizard와의 관계
| 구분 | OnboardingWizard (기존) | Tour (신규) |
|------|-------------------------|-------------|
| 목적 | 초기 데이터 설정 (서비스/스태프/첫예약) | UI 기능 안내 |
| 트리거 | 백엔드 상태 기반 | localStorage 기반 |
| 형태 | 카드형 위저드 (대시보드 대체) | 오버레이 하이라이트 (대시보드 위에) |
| 순서 | **먼저** (데이터가 있어야 안내 가능) | **나중에** (대시보드 로드 후) |
| 건너뛰기 | 다음 접속시 다시 표시 가능 | localStorage로 영구 저장 |

---

## 7. 투어 버튼 UI 동작

### Navbar 투어 버튼
```vue
<!-- DefaultLayoutWithVerticalNav.vue navbar slot 내 -->
<IconBtn
  id="tour-trigger-btn"
  @click="handleTourClick"
>
  <VTooltip activator="parent" location="bottom">
    가이드 투어
  </VTooltip>
  <VIcon icon="ri-compass-discover-line" />
</IconBtn>
```

- 클릭 시: 현재 페이지의 route name을 확인 → 해당 페이지 투어 시작
- 대시보드가 아닌 페이지에서는 해당 페이지 전용 투어 실행
- 매핑되지 않은 페이지에서 클릭 시: 대시보드 투어 실행 (대시보드로 이동 후)

### UserProfile 메뉴
```js
{
  type: 'navItem',
  icon: 'ri-compass-discover-line',
  title: '가이드 투어',
  action: 'tour',
}
```
- 클릭 시: 대시보드로 이동 → 대시보드 투어 시작 (전체 투어)

---

## 8. 반응형 고려사항

| 화면 크기 | 동작 |
|-----------|------|
| 데스크톱 (lg+) | 사이드바 투어 스텝 포함, 전체 7스텝 |
| 태블릿 (md) | 사이드바 스텝 건너뜀 (접힌 상태), 6스텝 |
| 모바일 (sm-) | 사이드바/navbar 축소, 투어 텍스트 간결화, 핵심 3-4스텝만 |

- Shepherd의 `scrollTo` 옵션으로 모바일에서도 대상 요소가 뷰포트에 보이도록 처리
- `when.show` 콜백에서 `window.innerWidth` 체크하여 모바일 분기

---

## 9. CSS/SCSS 스타일링

기존 `src/@core/scss/template/libs/shepherd.scss`에 이미 스타일 정의됨:
- `.nextBtnClass`: Primary 색상 버튼
- `.backBtnClass`: Secondary 색상 버튼
- 오버레이 모달, 화살표, 타이틀, 텍스트 등 Vuetify 테마 변수 연동
- 반응형 (600px 이하) 스타일

필요시 추가할 커스텀 스타일:
```scss
// 투어 스텝 내 한글 스타일링
.shepherd-text {
  line-height: 1.7;
  word-break: keep-all;
}
```

---

## 10. 대상 요소 ID 규칙

투어에서 하이라이트할 요소에 `id` 또는 `data-tour` 속성을 부여:

| 요소 | ID/Selector | 파일 |
|------|-------------|------|
| 투어 버튼 | `#tour-trigger-btn` | DefaultLayoutWithVerticalNav.vue |
| 알림 버튼 | `#notification-btn` (기존) | NavBarNotifications.vue |
| 사이드바 | `.layout-vertical-nav` (기존) | @layouts |
| 테마 전환 | `#theme-switcher-btn` | NavbarThemeSwitcher.vue |
| 유저 프로필 | `.user-profile-badge` (기존) | UserProfile.vue |
| 퀵 액션 영역 | `#dashboard-quick-actions` | dashboard.vue |
| 통계 카드 영역 | `#dashboard-stats` | dashboard.vue |
| 캘린더 | `.fc` (FullCalendar 기존) | calendar.vue |
| 날짜 선택기 | `.calendar-date-picker` (기존) | calendar.vue |

---

## 11. 구현 우선순위

### Phase 1 (MVP) - 대시보드 투어
1. `useTour.js` composable 생성
2. Navbar에 투어 버튼 추가
3. 대시보드 투어 7스텝 구현
4. 신규 사용자 자동 실행 (OnboardingWizard 완료/건너뛰기 후)
5. localStorage 기반 완료 상태 관리

### Phase 2 - 페이지별 투어
6. 예약 캘린더 투어
7. 고객 관리 투어
8. 서비스 관리 투어
9. 매장 설정 투어

### Phase 3 - 고도화
10. UserProfile 메뉴에 "가이드 투어" 추가
11. 모바일 최적화 (스텝 간소화)
12. "모든 투어 초기화" 기능 (설정에서)

---

## 12. 참고 사항

- **Shepherd.js 공식 문서**: https://docs.shepherdpro.com/
- **vue-shepherd**: https://github.com/shepherd-pro/vue-shepherd
- **Materio 템플릿 예제**: `docs/vue-version/.../src/pages/extensions/tour.vue`
- **기존 SCSS**: `src/@core/scss/template/libs/shepherd.scss`
- **NavSearchBar 연동**: 검색창 열 때 `Shepherd.activeTour?.cancel()` 이미 처리됨
