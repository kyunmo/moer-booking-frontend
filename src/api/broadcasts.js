import apiClient from './axios'

export default {
  /**
   * 공지 발송 (슈퍼 관리자 전용)
   * POST /api/super-admin/broadcasts
   */
  createBroadcast(data) {
    return apiClient.post('/super-admin/broadcasts', data)
  },

  /**
   * 발송 내역 조회 (슈퍼 관리자 전용)
   * GET /api/super-admin/broadcasts
   */
  getBroadcasts(params = {}) {
    return apiClient.get('/super-admin/broadcasts', { params })
  },
}
