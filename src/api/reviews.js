import apiClient from './axios'

export default {
  // 관리자 리뷰 목록 조회
  getReviews(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/reviews`, { params })
  },

  // 리뷰 답변 등록
  replyReview(businessId, reviewId, data) {
    return apiClient.post(`/businesses/${businessId}/reviews/${reviewId}/reply`, data)
  },

  // 리뷰 삭제
  deleteReview(businessId, reviewId, data = {}) {
    return apiClient.delete(`/businesses/${businessId}/reviews/${reviewId}`, { data })
  },
}
