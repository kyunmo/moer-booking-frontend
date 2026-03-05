import apiClient from './axios'

export default {
  // ===== 프로필 =====

  // 고객 프로필 조회
  getProfile() {
    return apiClient.get('/customer/profile')
  },

  // 고객 프로필 수정
  updateProfile(data) {
    return apiClient.patch('/customer/profile', data)
  },

  // ===== 예약 =====

  // 예약 생성 (고객 인증 필요)
  createReservation(slug, data) {
    return apiClient.post(`/customer/businesses/${slug}/reservations`, data)
  },

  // 내 예약 목록 조회
  getMyReservations(params = {}) {
    return apiClient.get('/customer/reservations', { params })
  },

  // 예약 상세 조회
  getReservation(reservationNumber) {
    return apiClient.get(`/customer/reservations/${reservationNumber}`)
  },

  // 예약 취소
  cancelReservation(reservationNumber, data) {
    return apiClient.post(`/customer/reservations/${reservationNumber}/cancel`, data)
  },

  // ===== 리뷰 =====

  // 리뷰 작성 (고객 인증 필요)
  createReview(slug, data) {
    return apiClient.post(`/customer/businesses/${slug}/reviews`, data)
  },

  // 리뷰 작성 (이미지 포함, multipart/form-data)
  createReviewWithImages(slug, data, imageFiles = []) {
    const formData = new FormData()
    formData.append('rating', data.rating)
    formData.append('content', data.content || '')
    formData.append('reservationNumber', data.reservationNumber)
    if (data.staffId) formData.append('staffId', data.staffId)

    imageFiles.forEach(file => {
      formData.append('images', file)
    })

    return apiClient.post(`/customer/businesses/${slug}/reviews`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 내 리뷰 목록 조회
  getMyReviews(params = {}) {
    return apiClient.get('/customer/reviews', { params })
  },

  // 리뷰 수정
  updateReview(reviewId, data) {
    return apiClient.put(`/customer/reviews/${reviewId}`, data)
  },

  // 리뷰 삭제
  deleteReview(reviewId) {
    return apiClient.delete(`/customer/reviews/${reviewId}`)
  },

  // 리뷰 이미지 업로드
  uploadReviewImage(reviewId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(`/customer/reviews/${reviewId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 리뷰 이미지 삭제
  deleteReviewImage(reviewId, imageId) {
    return apiClient.delete(`/customer/reviews/${reviewId}/images/${imageId}`)
  },
}
