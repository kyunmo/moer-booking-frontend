import { formatCurrency } from '@/constants/pricing'

/**
 * 환불 미리보기 계산 유틸리티
 * 백엔드 API 응답 전 fallback용 프론트 계산
 */

/**
 * 두 날짜 사이의 일수 계산
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffMs = d2.getTime() - d1.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * 환불 금액 계산
 * @param {Object} payment - 결제 정보
 * @param {number} payment.amount - 결제 금액 (finalAmount)
 * @param {string} payment.billingStartDate - 구독 시작일
 * @param {string} payment.billingEndDate - 구독 종료일
 * @param {string} payment.createdAt - 결제일
 * @returns {Object} 환불 계산 결과
 */
export function calculateRefund(payment) {
  if (!payment || !payment.amount) {
    return {
      refundAmount: 0,
      usedDays: 0,
      remainingDays: 0,
      totalDays: 0,
      usagePercent: 0,
      isFullRefund: false,
      formula: '',
    }
  }

  const now = new Date()
  const startDate = new Date(payment.billingStartDate || payment.createdAt)
  const endDate = new Date(payment.billingEndDate)
  const paymentDate = new Date(payment.createdAt)

  const totalDays = daysBetween(startDate, endDate)
  const usedDays = Math.max(0, daysBetween(startDate, now))
  const remainingDays = Math.max(0, daysBetween(now, endDate))
  const daysSincePayment = daysBetween(paymentDate, now)

  let refundAmount = 0
  let isFullRefund = false
  let formula = ''

  if (remainingDays <= 0) {
    // 기간 만료
    refundAmount = 0
    formula = '구독 기간 만료 (환불 불가)'
  }
  else if (daysSincePayment <= 0) {
    // 결제 당일
    refundAmount = payment.amount
    isFullRefund = true
    formula = '결제 당일 전액 환불'
  }
  else if (daysSincePayment <= 7) {
    // 7일 이내 전액 환불
    refundAmount = payment.amount
    isFullRefund = true
    formula = '결제 7일 이내 전액 환불'
  }
  else {
    // 일할 계산
    refundAmount = Math.round(payment.amount * (remainingDays / totalDays))
    formula = `${formatCurrency(payment.amount)} x (${remainingDays}일 / ${totalDays}일)`
  }

  const usagePercent = totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0

  return {
    refundAmount,
    usedDays,
    remainingDays,
    totalDays,
    usagePercent: Math.min(100, usagePercent),
    isFullRefund,
    formula,
  }
}

/**
 * 환불 금액 포맷팅된 문자열 반환
 */
export function formatRefundAmount(refundAmount) {
  return formatCurrency(refundAmount)
}
