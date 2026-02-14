import apiClient from './axios'

export default {
  // 알림 목록 조회
  getNotifications(params = {}) {
    return apiClient.get('/notifications', { params })
  },

  // 알림 읽음 처리
  markAsRead(id) {
    return apiClient.patch(`/notifications/${id}/read`)
  },

  // 전체 알림 읽음 처리
  markAllAsRead() {
    return apiClient.patch('/notifications/read-all')
  },
}
