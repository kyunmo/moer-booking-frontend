import apiClient from './axios'

export default {
  /**
   * 즐겨찾기 추가
   * POST /api/customer/bookmarks/{businessId}
   */
  addBookmark(businessId) {
    return apiClient.post(`/customer/bookmarks/${businessId}`)
  },

  /**
   * 즐겨찾기 해제
   * DELETE /api/customer/bookmarks/{businessId}
   */
  removeBookmark(businessId) {
    return apiClient.delete(`/customer/bookmarks/${businessId}`)
  },

  /**
   * 즐겨찾기 목록 조회
   * GET /api/customer/bookmarks
   */
  getBookmarks() {
    return apiClient.get('/customer/bookmarks')
  },

  /**
   * 즐겨찾기 여부 확인
   * GET /api/customer/bookmarks/{businessId}/check
   */
  checkBookmark(businessId) {
    return apiClient.get(`/customer/bookmarks/${businessId}/check`)
  },
}
