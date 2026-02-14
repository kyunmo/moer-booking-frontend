import apiClient from './axios'

export default {
  // 온보딩 상태 조회
  getOnboardingStatus(businessId) {
    return apiClient.get(`/businesses/${businessId}/onboarding`)
  },

  // 온보딩 건너뛰기
  skipOnboarding(businessId) {
    return apiClient.post(`/businesses/${businessId}/onboarding/skip`)
  },
}
