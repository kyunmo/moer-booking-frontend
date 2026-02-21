export const TRIAL = {
  DURATION_DAYS: 30,
  WARNING_THRESHOLD_DAYS: 7,
  RESERVATION_WARNING_COUNT: 20,
}

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
}

export const PLANS = {
  FREE: {
    key: 'FREE',
    name: '무료',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceVatIncluded: 0,
    yearlyPriceVatIncluded: 0,
    maxReservations: 30,
    maxStaff: 1,
    maxServices: 10,
    description: '가볍게 시작하기',
    color: 'info',
    icon: 'ri-gift-line',
    features: [
      '월 예약 30건',
      '스태프 1명',
      '시술 메뉴 10개',
      '기본 예약 관리',
      '고객 기본 정보',
      '방문 이력 (최근 10건)',
    ],
    excludedFeatures: [
      '카카오톡 알림',
      '고객 태그 관리',
      '매출 통계',
      '재방문 알림',
      '데이터 추출',
    ],
    limits: [
      '광고 표시',
      '카카오톡 알림 미지원',
      '고급 통계 미지원',
    ],
  },
  PAID: {
    key: 'PAID',
    name: '유료',
    monthlyPrice: 18000,
    yearlyPrice: 180000,
    monthlyPriceVatIncluded: 19800,
    yearlyPriceVatIncluded: 198000,
    maxReservations: -1,
    maxStaff: 5,
    maxServices: -1,
    description: '모든 기능을 하나의 플랜으로',
    color: 'primary',
    icon: 'ri-vip-crown-line',
    yearlyBadge: '2개월 무료',
    features: [
      '예약 무제한',
      '스태프 5명',
      '시술 메뉴 무제한',
      '예약 캘린더 (일/주/월 뷰)',
      '예약 승인/거절',
      '고객 자동 등록 + 태그 관리',
      '방문 이력 무제한',
      '카카오톡 자동 알림',
      '매출 통계 (일/주/월)',
      '재방문 알림',
      'CSV/Excel 데이터 추출',
      '광고 제거',
    ],
    excludedFeatures: [],
    limits: [],
  },
}

/**
 * 플랜 가격 조회 (VAT 별도 기준)
 */
export function getPlanPrice(planKey, billingCycle) {
  const plan = PLANS[planKey]
  if (!plan) return 0

  return billingCycle === BILLING_CYCLES.YEARLY
    ? plan.yearlyPrice
    : plan.monthlyPrice
}

/**
 * 플랜 가격 조회 (VAT 포함 기준)
 */
export function getPlanPriceVatIncluded(planKey, billingCycle) {
  const plan = PLANS[planKey]
  if (!plan) return 0

  return billingCycle === BILLING_CYCLES.YEARLY
    ? plan.yearlyPriceVatIncluded
    : plan.monthlyPriceVatIncluded
}

/**
 * 월 환산 금액 (VAT 포함)
 */
export function getMonthlyEquivalent(planKey, billingCycle) {
  const plan = PLANS[planKey]
  if (!plan) return 0

  return billingCycle === BILLING_CYCLES.YEARLY
    ? Math.round(plan.yearlyPriceVatIncluded / 12)
    : plan.monthlyPriceVatIncluded
}

/**
 * 연간 결제 시 절약 금액 (VAT 포함)
 */
export function getYearlySavings(planKey) {
  const plan = PLANS[planKey]
  if (!plan) return 0

  return (plan.monthlyPriceVatIncluded * 12) - plan.yearlyPriceVatIncluded
}

/**
 * VAT 계산 (10%)
 */
export function getVatAmount(amount) {
  return Math.round(amount * 0.1)
}

/**
 * VAT 포함 금액
 */
export function getAmountWithVat(amount) {
  return amount + getVatAmount(amount)
}

/**
 * VAT 포함 금액에서 공급가액 역산
 */
export function getSupplyAmount(vatIncludedAmount) {
  return Math.round(vatIncludedAmount / 1.1)
}

/**
 * VAT 포함 금액에서 VAT 역산
 */
export function getVatFromTotal(vatIncludedAmount) {
  return vatIncludedAmount - getSupplyAmount(vatIncludedAmount)
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}
