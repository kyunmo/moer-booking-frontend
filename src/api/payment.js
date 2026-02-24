import apiClient from './axios'

/**
 * 결제 관리 API
 */
const paymentApi = {
  /**
   * 결제 생성 및 처리
   * POST /api/payments
   * @param {Object} data - { plan: 'BASIC', billingCycle: 'MONTHLY', paymentMethod: 'CARD', couponCode? }
   */
  createPayment(data) {
    return apiClient.post('/payments', data)
  },

  /**
   * 환불 처리
   * POST /api/payments/{paymentId}/refund
   * @param {number} paymentId - 결제 ID
   * @param {string} reason - 환불 사유
   */
  refundPayment(paymentId, reason) {
    return apiClient.post(`/payments/${paymentId}/refund`, { reason })
  },

  /**
   * 결제 취소
   * POST /api/payments/{paymentId}/cancel
   * @param {number} paymentId - 결제 ID
   * @param {string} reason - 취소 사유
   */
  cancelPayment(paymentId, reason) {
    return apiClient.post(`/payments/${paymentId}/cancel`, { reason })
  },

  /**
   * 결제 단건 조회
   * GET /api/payments/{paymentId}
   * @param {number} paymentId - 결제 ID
   */
  getPayment(paymentId) {
    return apiClient.get(`/payments/${paymentId}`)
  },

  /**
   * 결제 목록 조회
   * GET /api/payments
   * @param {Object} params - { status, page, size, startDate, endDate }
   * @param {string} [params.status] - 결제 상태 필터 (PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED)
   * @param {number} [params.page] - 페이지 번호 (기본 1)
   * @param {number} [params.size] - 페이지 크기 (기본 20)
   * @param {string} [params.startDate] - 조회 시작일 (yyyy-MM-dd)
   * @param {string} [params.endDate] - 조회 종료일 (yyyy-MM-dd)
   */
  getPaymentList(params = {}) {
    return apiClient.get('/payments', { params })
  },

  /**
   * PG 거래 ID로 조회
   * GET /api/payments/pg/{pgTransactionId}
   * @param {string} pgTransactionId - PG 거래 ID
   */
  getPaymentByPgTransactionId(pgTransactionId) {
    return apiClient.get(`/payments/pg/${pgTransactionId}`)
  },

  /**
   * 최근 결제 조회
   * GET /api/payments/latest
   */
  getLatestPayment() {
    return apiClient.get('/payments/latest')
  },

  /**
   * 환불 미리보기
   * GET /api/payments/{paymentId}/refund-preview
   * @param {number} paymentId - 결제 ID
   * @returns {{ refundAmount, usedDays, remainingDays, totalDays, formula }}
   */
  getRefundPreview(paymentId) {
    return apiClient.get(`/payments/${paymentId}/refund-preview`)
  },
}

export default paymentApi
