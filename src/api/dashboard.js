import apiClient from './axios'

export default {
  // 기간별 통계
  getStats(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/dashboard/stats`, { params })
  },

  // 목표 달성률
  getGoals(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/dashboard/goals`, { params })
  },
}
