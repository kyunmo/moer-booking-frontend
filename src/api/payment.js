import apiClient from './axios'

/**
 * 결제 관리 API
 */
const paymentApi = {
  /**
   * 결제 생성 및 처리
   * POST /api/payments
   * @param {Object} data - { plan: 'BASIC', paymentMethod: 'CARD' }
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
   * @param {Object} params - { status, page, size }
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
}

export default paymentApi
