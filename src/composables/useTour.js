import { useShepherd } from 'vue-shepherd'

const TOUR_STORAGE_PREFIX = 'yemo_tour_'

// ── Responsive helpers ──

function isMobile() {
  return window.innerWidth < 600
}

function isTablet() {
  return window.innerWidth >= 600 && window.innerWidth < 960
}

/**
 * Tour composable for guided user onboarding
 */
export function useTour() {
  let currentTour = null

  // ── Storage helpers ──

  function isTourCompleted(tourId) {
    return localStorage.getItem(`${TOUR_STORAGE_PREFIX}${tourId}`) === 'done'
  }

  function markTourCompleted(tourId) {
    localStorage.setItem(`${TOUR_STORAGE_PREFIX}${tourId}`, 'done')
  }

  function resetTour(tourId) {
    localStorage.removeItem(`${TOUR_STORAGE_PREFIX}${tourId}`)
  }

  function resetAllTours() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(TOUR_STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }

  function getCompletedTourCount() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(TOUR_STORAGE_PREFIX) && localStorage.getItem(key) === 'done')
      .length
  }

  const TOUR_IDS = ['dashboard', 'reservation', 'customer', 'service', 'settings']

  // ── Tour instance helpers ──

  function cancelActiveTour() {
    if (currentTour?.isActive()) {
      currentTour.cancel()
    }
    currentTour = null
  }

  function createTour() {
    cancelActiveTour()

    const tour = useShepherd({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        modalOverlayOpeningPadding: 4,
        modalOverlayOpeningRadius: 8,
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    })

    currentTour = tour
    return tour
  }

  // ── Button factory ──

  function makeButtons(tour, { isFirst = false, isLast = false } = {}) {
    const buttons = []

    if (!isFirst) {
      buttons.push({
        text: '이전',
        action: tour.back,
        classes: 'backBtnClass',
      })
    } else {
      buttons.push({
        text: '건너뛰기',
        action: tour.cancel,
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

  // ── Dashboard Tour ──

  function startDashboardTour() {
    const tour = createTour()
    const mobile = isMobile()

    const steps = []

    // Step 1: Welcome
    const navbar = document.querySelector('.layout-navbar')
    if (navbar) {
      steps.push({
        id: 'welcome',
        title: '환영합니다!',
        text: mobile
          ? 'YEMO 관리자에 오신 것을 환영합니다.'
          : 'YEMO 관리자 화면에 오신 것을 환영합니다.<br>주요 기능을 빠르게 안내해드릴게요.',
        arrow: true,
        attachTo: { element: navbar, on: 'bottom' },
        buttons: makeButtons(tour, { isFirst: true }),
      })
    }

    // Step 2: Sidebar (skip on mobile - collapsed)
    if (!mobile) {
      const sidebar = document.querySelector('.layout-vertical-nav')
      if (sidebar) {
        steps.push({
          id: 'sidebar-nav',
          title: '사이드바 메뉴',
          text: '왼쪽 메뉴에서 모든 기능에 접근할 수 있습니다.<br><strong>예약 관리, 고객 관리, 매장 설정</strong> 등 카테고리별로 정리되어 있어요.',
          arrow: true,
          attachTo: { element: sidebar, on: 'right' },
          buttons: makeButtons(tour),
        })
      }
    }

    // Step 3: Quick Actions
    const quickActions = document.querySelector('#dashboard-quick-actions')
    if (quickActions) {
      steps.push({
        id: 'quick-actions',
        title: '퀵 액션',
        text: mobile
          ? '자주 사용하는 기능에 바로 접근하세요.'
          : '자주 사용하는 기능을 빠르게 실행할 수 있습니다.<br><strong>예약 등록, 고객 등록, 통계, 매장 설정</strong>에 바로 접근하세요.',
        arrow: true,
        attachTo: { element: quickActions, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 4: Stats
    const stats = document.querySelector('#dashboard-stats')
    if (stats) {
      steps.push({
        id: 'today-stats',
        title: '오늘의 통계',
        text: mobile
          ? '오늘의 예약 수와 매출을 확인하세요.'
          : '오늘 예약 수, 대기 중인 예약, 예상 매출, 신규 고객 수를<br>한눈에 확인할 수 있습니다.',
        arrow: true,
        attachTo: { element: stats, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 5: Notifications (skip on mobile for brevity)
    if (!mobile) {
      const notificationBtn = document.querySelector('.layout-navbar .notifications-btn') || document.querySelector('.layout-navbar [class*="notification"]')
      if (notificationBtn) {
        steps.push({
          id: 'notifications',
          title: '알림 센터',
          text: '새 예약, 예약 확정 요청 등<br>중요한 알림을 실시간으로 받아보세요.',
          arrow: true,
          attachTo: { element: notificationBtn, on: 'bottom' },
          buttons: makeButtons(tour),
        })
      }
    }

    // Step 6: Tour button
    const tourBtn = document.querySelector('#tour-trigger-btn')
    if (tourBtn) {
      steps.push({
        id: 'tour-btn',
        title: '가이드 투어',
        text: '언제든 이 버튼을 눌러<br>가이드를 다시 볼 수 있습니다.',
        arrow: true,
        attachTo: { element: tourBtn, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 7: User Profile (last)
    const userProfile = document.querySelector('.user-profile-badge')
    if (userProfile) {
      steps.push({
        id: 'user-profile',
        title: '프로필 메뉴',
        text: mobile
          ? '프로필 수정, 설정, 로그아웃은 여기서.'
          : '프로필 수정, 매장 설정, 로그아웃 등을<br>이곳에서 이용할 수 있습니다.',
        arrow: true,
        attachTo: { element: userProfile, on: 'bottom-end' },
        buttons: makeButtons(tour, { isLast: true }),
      })
    }

    if (steps.length === 0) return null

    // Ensure first/last buttons are correct after filtering
    steps[0].buttons = makeButtons(tour, { isFirst: true })
    steps[steps.length - 1].buttons = makeButtons(tour, { isLast: steps.length === 1 })

    tour.addSteps(steps)

    tour.on('complete', () => {
      markTourCompleted('dashboard')
    })

    tour.on('cancel', () => {
      markTourCompleted('dashboard')
    })

    tour.start()
    return tour
  }

  // ── Reservation Calendar Tour ──

  function startReservationTour() {
    const tour = createTour()
    const mobile = isMobile()
    const steps = []

    // Step 1: 통계 카드
    const stats = document.querySelector('#reservation-stats')
    if (stats) {
      steps.push({
        id: 'reservation-stats',
        title: '예약 현황 통계',
        text: mobile
          ? '상태별 예약 건수를 확인하세요.'
          : '대기, 확정, 완료, 취소 상태별 예약 건수를<br>한눈에 확인할 수 있습니다.',
        arrow: true,
        attachTo: { element: stats, on: 'bottom' },
        buttons: makeButtons(tour, { isFirst: true }),
      })
    }

    // Step 2: 사이드바 (skip on mobile - hidden as drawer)
    if (!mobile) {
      const sidebar = document.querySelector('#reservation-sidebar')
      if (sidebar) {
        steps.push({
          id: 'reservation-sidebar',
          title: '캘린더 사이드바',
          text: '<strong>예약 등록</strong> 버튼, <strong>날짜 선택</strong>, <strong>상태 필터</strong>를<br>이곳에서 이용할 수 있습니다.',
          arrow: true,
          attachTo: { element: sidebar, on: 'right' },
          buttons: makeButtons(tour),
        })
      }

      // Step 3: 예약 등록 버튼 (inside sidebar, skip on mobile)
      const createBtn = document.querySelector('#reservation-create-btn')
      if (createBtn) {
        steps.push({
          id: 'reservation-create',
          title: '예약 등록',
          text: '이 버튼을 클릭하면 새 예약을 등록할 수 있습니다.<br>캘린더의 빈 시간대를 클릭해도 등록 가능합니다.',
          arrow: true,
          attachTo: { element: createBtn, on: 'right' },
          buttons: makeButtons(tour),
        })
      }

      // Step 4: 상태 필터 (inside sidebar, skip on mobile)
      const statusFilter = document.querySelector('#reservation-status-filter')
      if (statusFilter) {
        steps.push({
          id: 'reservation-filter',
          title: '상태 필터',
          text: '보고 싶은 예약 상태를 선택하여<br>캘린더에 표시되는 예약을 필터링하세요.',
          arrow: true,
          attachTo: { element: statusFilter, on: 'right' },
          buttons: makeButtons(tour),
        })
      }
    }

    // Step 5: 캘린더
    const calendar = document.querySelector('#reservation-calendar')
    if (calendar) {
      steps.push({
        id: 'reservation-calendar',
        title: '예약 캘린더',
        text: mobile
          ? '예약을 확인하고 클릭하면 상세 정보를 볼 수 있어요.'
          : '월/주/일 단위로 예약을 확인할 수 있습니다.<br>예약 블록을 <strong>클릭</strong>하면 상세 정보를 볼 수 있어요.',
        arrow: true,
        attachTo: { element: calendar, on: 'top' },
        buttons: makeButtons(tour, { isLast: true }),
      })
    }

    if (steps.length === 0) return null

    steps[0].buttons = makeButtons(tour, { isFirst: true })
    steps[steps.length - 1].buttons = makeButtons(tour, { isLast: steps.length === 1 })

    tour.addSteps(steps)

    tour.on('complete', () => markTourCompleted('reservation'))
    tour.on('cancel', () => markTourCompleted('reservation'))

    tour.start()
    return tour
  }

  // ── Customer Tour ──

  function startCustomerTour() {
    const tour = createTour()
    const mobile = isMobile()
    const steps = []

    // Step 1: 필터 (skip on mobile - header items overflow)
    if (!mobile) {
      const filter = document.querySelector('#customer-filter')
      if (filter) {
        steps.push({
          id: 'customer-filter',
          title: '고객 필터',
          text: '<strong>전체, VIP, 단골, 신규</strong> 필터로<br>고객 유형별 목록을 빠르게 확인하세요.',
          arrow: true,
          attachTo: { element: filter, on: 'bottom' },
          buttons: makeButtons(tour, { isFirst: true }),
        })
      }
    }

    // Step 2: 고객 등록 버튼
    const createBtn = document.querySelector('#customer-create-btn')
    if (createBtn) {
      steps.push({
        id: 'customer-create',
        title: '고객 등록',
        text: mobile
          ? '새 고객을 등록할 수 있습니다.'
          : '이 버튼으로 새 고객을 등록할 수 있습니다.<br>이름, 전화번호, 메모 등을 입력하세요.',
        arrow: true,
        attachTo: { element: createBtn, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 3: 통계
    const stats = document.querySelector('#customer-stats')
    if (stats) {
      steps.push({
        id: 'customer-stats',
        title: '고객 통계',
        text: mobile
          ? '고객 유형별 현황을 확인하세요.'
          : '전체 고객 수, VIP, 단골, 신규 고객 수를<br>한눈에 확인할 수 있습니다.',
        arrow: true,
        attachTo: { element: stats, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 4: 고객 테이블
    const table = document.querySelector('#customer-table')
    if (table) {
      steps.push({
        id: 'customer-table',
        title: '고객 목록',
        text: mobile
          ? '고객 정보를 확인하고 관리하세요.'
          : '고객의 이름, 태그, 방문 횟수, 총 결제액을 확인하고<br><strong>상세보기, 수정, 삭제</strong>가 가능합니다.',
        arrow: true,
        attachTo: { element: table, on: 'top' },
        buttons: makeButtons(tour, { isLast: true }),
      })
    }

    if (steps.length === 0) return null

    steps[0].buttons = makeButtons(tour, { isFirst: true })
    steps[steps.length - 1].buttons = makeButtons(tour, { isLast: steps.length === 1 })

    tour.addSteps(steps)

    tour.on('complete', () => markTourCompleted('customer'))
    tour.on('cancel', () => markTourCompleted('customer'))

    tour.start()
    return tour
  }

  // ── Service Tour ──

  function startServiceTour() {
    const tour = createTour()
    const mobile = isMobile()
    const steps = []

    // Step 1: 카테고리 필터 (skip on mobile - header items overflow)
    if (!mobile) {
      const categoryFilter = document.querySelector('#service-category-filter')
      if (categoryFilter) {
        steps.push({
          id: 'service-category-filter',
          title: '카테고리 필터',
          text: '카테고리별로 서비스를 필터링하여<br>원하는 서비스를 빠르게 찾을 수 있습니다.',
          arrow: true,
          attachTo: { element: categoryFilter, on: 'bottom' },
          buttons: makeButtons(tour, { isFirst: true }),
        })
      }

      // Step 2: 카테고리 관리
      const categoryBtn = document.querySelector('#service-category-btn')
      if (categoryBtn) {
        steps.push({
          id: 'service-category-manage',
          title: '카테고리 관리',
          text: '서비스 카테고리를 추가, 수정, 삭제할 수 있습니다.<br>카테고리로 서비스를 체계적으로 분류하세요.',
          arrow: true,
          attachTo: { element: categoryBtn, on: 'bottom' },
          buttons: makeButtons(tour),
        })
      }
    }

    // Step 3: 서비스 등록
    const createBtn = document.querySelector('#service-create-btn')
    if (createBtn) {
      steps.push({
        id: 'service-create',
        title: '서비스 등록',
        text: mobile
          ? '새 서비스를 등록하세요.'
          : '새 서비스를 등록하세요.<br><strong>서비스명, 가격, 소요시간, 담당 직원</strong> 등을 설정합니다.',
        arrow: true,
        attachTo: { element: createBtn, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 4: 통계
    const stats = document.querySelector('#service-stats')
    if (stats) {
      steps.push({
        id: 'service-stats',
        title: '서비스 현황',
        text: mobile
          ? '서비스 현황을 확인하세요.'
          : '전체 서비스 수, 활성 서비스, 카테고리 수,<br>평균 가격을 확인할 수 있습니다.',
        arrow: true,
        attachTo: { element: stats, on: 'bottom' },
        buttons: makeButtons(tour),
      })
    }

    // Step 5: 서비스 카드 그리드
    const grid = document.querySelector('#service-grid')
    if (grid) {
      steps.push({
        id: 'service-grid',
        title: '서비스 카드',
        text: mobile
          ? '서비스 정보를 확인하고 관리하세요.'
          : '각 서비스의 정보를 카드 형태로 확인할 수 있습니다.<br><strong>활성/비활성 토글, 수정, 삭제</strong>가 가능합니다.',
        arrow: true,
        attachTo: { element: grid, on: 'top' },
        buttons: makeButtons(tour, { isLast: true }),
      })
    }

    if (steps.length === 0) return null

    steps[0].buttons = makeButtons(tour, { isFirst: true })
    steps[steps.length - 1].buttons = makeButtons(tour, { isLast: steps.length === 1 })

    tour.addSteps(steps)

    tour.on('complete', () => markTourCompleted('service'))
    tour.on('cancel', () => markTourCompleted('service'))

    tour.start()
    return tour
  }

  // ── Settings Tour ──

  function startSettingsTour() {
    const tour = createTour()
    const mobile = isMobile()
    const steps = []

    // Step 1: 기본 정보
    const basicInfo = document.querySelector('#settings-basic-info')
    if (basicInfo) {
      steps.push({
        id: 'settings-basic-info',
        title: '매장 기본 정보',
        text: mobile
          ? '매장의 기본 정보를 설정하세요.'
          : '매장명, 업종, 전화번호, 주소, 소개글 등<br><strong>매장의 기본 정보</strong>를 설정하세요.',
        arrow: true,
        attachTo: { element: basicInfo, on: 'top' },
        buttons: makeButtons(tour, { isFirst: true }),
      })
    }

    // Step 2: 목표 설정
    const goals = document.querySelector('#settings-goals')
    if (goals) {
      steps.push({
        id: 'settings-goals',
        title: '목표 설정',
        text: mobile
          ? '매출/고객 목표를 설정하세요.'
          : '<strong>일일 매출, 월간 매출, 신규 고객 목표</strong>를 설정하면<br>대시보드에서 달성률을 확인할 수 있습니다.',
        arrow: true,
        attachTo: { element: goals, on: 'top' },
        buttons: makeButtons(tour),
      })
    }

    // Step 3: 예약 URL
    const bookingUrl = document.querySelector('#settings-booking-url')
    if (bookingUrl) {
      steps.push({
        id: 'settings-booking-url',
        title: '예약 페이지 주소',
        text: mobile
          ? '고객용 예약 페이지 URL을 설정하세요.'
          : '고객이 접속할 <strong>예약 페이지 URL</strong>을 설정합니다.<br>설정한 주소로 고객이 온라인 예약을 할 수 있어요.',
        arrow: true,
        attachTo: { element: bookingUrl, on: 'top' },
        buttons: makeButtons(tour, { isLast: true }),
      })
    }

    if (steps.length === 0) return null

    steps[0].buttons = makeButtons(tour, { isFirst: true })
    steps[steps.length - 1].buttons = makeButtons(tour, { isLast: steps.length === 1 })

    tour.addSteps(steps)

    tour.on('complete', () => markTourCompleted('settings'))
    tour.on('cancel', () => markTourCompleted('settings'))

    tour.start()
    return tour
  }

  // ── Page-specific tour starter ──

  function startPageTour(routeName) {
    const tourMap = {
      'shop-admin-dashboard': startDashboardTour,
      'shop-admin-reservations-calendar': startReservationTour,
      'shop-admin-customers-list': startCustomerTour,
      'shop-admin-services-list': startServiceTour,
      'shop-admin-business-settings': startSettingsTour,
    }

    const tourFn = tourMap[routeName]
    if (tourFn) {
      return tourFn()
    }

    // Default: dashboard tour
    return startDashboardTour()
  }

  return {
    isTourCompleted,
    markTourCompleted,
    resetTour,
    resetAllTours,
    getCompletedTourCount,
    TOUR_IDS,
    cancelActiveTour,
    startDashboardTour,
    startReservationTour,
    startCustomerTour,
    startServiceTour,
    startSettingsTour,
    startPageTour,
  }
}
