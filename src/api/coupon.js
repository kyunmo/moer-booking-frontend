import apiClient from './axios'

/**
 * 쿠폰 관리 API
 */
const couponApi = {
  /**
   * 쿠폰 생성
   * POST /api/coupons
   * @param {Object} data - 쿠폰 생성 정보
   */
  createCoupon(data) {
    return apiClient.post('/coupons', data)
  },

  /**
   * 쿠폰 검증
   * POST /api/coupons/validate
   * @param {string} code - 쿠폰 코드
   * @param {number} orderAmount - 주문 금액
   */
  validateCoupon(code, orderAmount) {
    return apiClient.post('/coupons/validate', {
      code,
      orderAmount,
    })
  },

  /**
   * 쿠폰 단건 조회
   * GET /api/coupons/{couponId}
   * @param {number} couponId - 쿠폰 ID
   */
  getCoupon(couponId) {
    return apiClient.get(`/coupons/${couponId}`)
  },

  /**
   * 쿠폰 목록 조회
   * GET /api/coupons
   * @param {Object} params - { keyword, status, couponType, page, size }
   */
  getCouponList(params = {}) {
    return apiClient.get('/coupons', { params })
  },

  /**
   * 쿠폰 수정
   * PUT /api/coupons/{couponId}
   * @param {number} couponId - 쿠폰 ID
   * @param {Object} data - 수정할 정보
   */
  updateCoupon(couponId, data) {
    return apiClient.put(`/coupons/${couponId}`, data)
  },

  /**
   * 쿠폰 삭제
   * DELETE /api/coupons/{couponId}
   * @param {number} couponId - 쿠폰 ID
   */
  deleteCoupon(couponId) {
    return apiClient.delete(`/coupons/${couponId}`)
  },
}

export default couponApi
