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
}
