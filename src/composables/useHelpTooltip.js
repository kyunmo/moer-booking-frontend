/**
 * useHelpTooltip - 인앱 도움말 시스템
 *
 * 주요 기능 옆에 `?` 아이콘 + 툴팁을 쉽게 추가할 수 있는 헬퍼 컴포저블.
 * 각 페이지별 도움말 텍스트를 중앙에서 관리합니다.
 */

const helpTexts = {
  // ── 대시보드 ──
  'dashboard.todayReservations': '오늘 예정된 전체 예약 현황입니다. 대기/확정/완료/취소 상태를 한눈에 확인할 수 있습니다.',
  'dashboard.actionAlerts': '즉시 처리가 필요한 항목입니다. 예약 확정 대기, 곧 시작하는 예약, 생일 고객 등을 표시합니다.',
  'dashboard.weeklyChart': '이번 주 요일별 예약 건수를 막대 차트로 보여줍니다. 어떤 요일에 예약이 많은지 파악할 수 있습니다.',
  'dashboard.monthSummary': '이번 달 총 예약 수, 매출, 신규 고객 수를 요약해서 보여줍니다.',
  'dashboard.quickActions': '자주 사용하는 기능으로 빠르게 이동할 수 있는 바로가기입니다.',
  'dashboard.stats': '오늘 예약 건수, 대기 중인 예약, 예상 매출, 신규 고객 수를 실시간으로 표시합니다.',

  // ── 서비스 관리 ──
  'service.categoryFilter': '카테고리별로 서비스를 필터링합니다. 카테고리는 "카테고리 관리" 버튼에서 추가/수정할 수 있습니다.',
  'service.categoryManage': '서비스 카테고리를 추가, 수정, 삭제할 수 있습니다. 카테고리를 먼저 등록한 후 서비스를 등록하세요.',
  'service.create': '새 서비스를 등록합니다. 서비스명, 가격, 소요시간, 담당 직원을 설정할 수 있습니다.',
  'service.activeToggle': '서비스 판매 상태를 변경합니다. 비활성화하면 고객 예약 페이지에서 해당 서비스가 숨겨집니다.',
  'service.stats': '전체/활성 서비스 수, 카테고리 수, 평균 가격을 한눈에 확인합니다.',

  // ── 예약 관리 ──
  'reservation.statusFilter': '예약 상태별로 목록을 필터링합니다. 대기/확정/완료/취소/노쇼 상태가 있습니다.',
  'reservation.statusChange': '예약 상태를 변경합니다. 대기 -> 확정 -> 완료 순서로 진행됩니다. 취소된 예약은 복구할 수 없습니다.',
  'reservation.bulkAction': '여러 예약을 선택하여 일괄적으로 상태를 변경할 수 있습니다.',
  'reservation.calendar': '캘린더에서 예약을 시각적으로 확인합니다. 날짜를 클릭하면 해당 시간에 새 예약을 등록할 수 있습니다.',
  'reservation.list': '예약 목록을 테이블 형태로 확인합니다. 검색, 필터링, 일괄 처리가 가능합니다.',
  'reservation.stats': '대기/확정/완료/취소된 예약 건수를 요약해서 보여줍니다.',

  // ── 직원 관리 ──
  'staff.positionManage': '직급(포지션)을 관리합니다. 원장, 실장, 디자이너 등 매장에 맞는 직급을 설정하세요.',
  'staff.create': '새 스태프를 등록합니다. 이름, 전화번호, 직급, 전문분야, 프로필 이미지를 설정할 수 있습니다.',
  'staff.schedule': '스태프별 근무 스케줄을 관리합니다. 요일별 근무시간, 휴무일을 설정할 수 있습니다.',
  'staff.stats': '전체/활성 스태프 수, 평균 경력을 한눈에 확인합니다.',

  // ── 구독 관리 ──
  'subscription.currentPlan': '현재 구독 중인 플랜 정보입니다. 플랜 변경, 결제 내역 확인, 구독 취소가 가능합니다.',
  'subscription.usage': '현재 플랜의 스태프 수와 월간 예약 수 사용량입니다. 제한에 도달하면 플랜 업그레이드가 필요합니다.',
  'subscription.planCompare': '무료/유료 플랜의 기능 차이를 비교합니다.',
}

/**
 * 도움말 텍스트를 가져오는 컴포저블
 * @returns {{ getHelpText: (key: string) => string, helpIcon: string, helpTexts: object }}
 */
export function useHelpTooltip() {
  /**
   * 도움말 텍스트 조회
   * @param {string} key - 도움말 키 (예: 'dashboard.todayReservations')
   * @returns {string} 도움말 텍스트
   */
  function getHelpText(key) {
    return helpTexts[key] || ''
  }

  /**
   * 도움말 아이콘
   */
  const helpIcon = 'ri-question-line'

  return {
    getHelpText,
    helpIcon,
    helpTexts,
  }
}
