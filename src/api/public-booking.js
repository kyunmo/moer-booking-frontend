import apiClient from './axios'

export default {
  // ===== 매장 =====

  // 매장 검색/목록
  getBusinesses(params = {}) {
    return apiClient.get('/public/businesses', { params })
  },

  // 매장 상세 조회
  getBusinessDetail(slug) {
    return apiClient.get(`/public/businesses/${slug}`)
  },

  // 슬러그 사용 가능 여부 확인
  checkSlug(slug) {
    return apiClient.get('/public/businesses/check-slug', { params: { slug } })
  },

  // ===== 예약 =====

  // 예약 가능 날짜 조회
  getAvailableDates(slug, params = {}) {
    return apiClient.get(`/public/businesses/${slug}/available-dates`, { params })
  },

  // 예약 가능 시간 조회
  getAvailableTimes(slug, params = {}) {
    return apiClient.get(`/public/businesses/${slug}/available-times`, { params })
  },

  // 예약 생성
  createReservation(slug, data) {
    return apiClient.post(`/public/businesses/${slug}/reservations`, data)
  },

  // 예약 조회 (예약번호 + 전화번호)
  getReservation(reservationNumber, phone) {
    return apiClient.get(`/public/reservations/${reservationNumber}`, { params: { phone } })
  },

  // 예약 취소
  cancelReservation(reservationNumber, data) {
    return apiClient.post(`/public/reservations/${reservationNumber}/cancel`, data)
  },

  // ===== 포트폴리오 =====

  // 스태프 포트폴리오 조회 (Public)
  getStaffPortfolios(slug, staffId) {
    return apiClient.get(`/public/businesses/${slug}/staffs/${staffId}/portfolios`)
  },

  // ===== 리뷰 =====

  // 리뷰 목록 조회 (Public)
  getPublicReviews(slug, params = {}) {
    return apiClient.get(`/public/businesses/${slug}/reviews`, { params })
  },
}
