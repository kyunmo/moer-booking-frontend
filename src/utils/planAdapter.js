/**
 * 프론트엔드 ↔ 백엔드 플랜명 변환 어댑터
 *
 * 프론트엔드: 'FREE' | 'PAID'
 * 백엔드: 'FREE' | 'BASIC' (추후 'PAID'로 변경 예정)
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
  return ['BASIC', 'PRO', 'ENTERPRISE'].includes(backendPlan) ? 'PAID' : backendPlan
}
