/**
 * 프론트엔드 ↔ 백엔드 플랜명 변환 어댑터
 *
 * 프론트엔드: 'FREE' | 'PAID'
 * 백엔드: 'FREE' | 'BASIC'
 */

/**
 * 프론트엔드 플랜명 → 백엔드 플랜명
 */
export function toBackendPlan(frontendPlan) {
  return frontendPlan === 'PAID' ? 'BASIC' : frontendPlan
}

/**
 * 백엔드 플랜명 → 프론트엔드 플랜명
 */
export function toFrontendPlan(backendPlan) {
  return backendPlan === 'BASIC' ? 'PAID' : backendPlan
}

/**
 * billingCycle UI값 → 백엔드 값
 * UI: 'monthly' | 'yearly'
 * 백엔드: 'MONTHLY' | 'YEARLY'
 */
export function toBackendBillingCycle(uiCycle) {
  return (uiCycle || 'monthly').toUpperCase()
}

/**
 * billingCycle 백엔드 값 → UI값
 */
export function toFrontendBillingCycle(backendCycle) {
  return (backendCycle || 'MONTHLY').toLowerCase()
}
