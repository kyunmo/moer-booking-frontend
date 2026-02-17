import apiClient from './axios'

export default {
  // 알림 발송 이력 조회
  getNotificationLogs(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/notification-logs`, { params })
  },
}
