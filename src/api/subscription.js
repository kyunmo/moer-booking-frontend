import apiClient from './axios'

/**
 * 구독 관리 API
 */
const subscriptionApi = {
  /**
   * 구독 정보 조회
   * GET /api/subscription
   */
  getSubscriptionInfo() {
    return apiClient.get('/subscription')
  },

  /**
   * 플랜 변경
   * POST /api/subscription/change-plan
   * @param {string} newPlan - FREE, BASIC, PRO, ENTERPRISE
   */
  changePlan(newPlan) {
    return apiClient.post('/subscription/change-plan', { newPlan })
  },

  /**
   * 구독 취소
   * POST /api/subscription/cancel
   */
  cancelSubscription() {
    return apiClient.post('/subscription/cancel')
  },
}

export default subscriptionApi
