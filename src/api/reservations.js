import apiClient from './axios'

export default {
  // 예약 목록 조회
  getReservations(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/reservations`, { params })
  },

  // 예약 상세 조회
  getReservation(businessId, reservationId) {
    return apiClient.get(`/businesses/${businessId}/reservations/${reservationId}`)
  },

  // 특정 날짜의 예약 조회
  getReservationsByDate(businessId, date) {
    return apiClient.get(`/businesses/${businessId}/reservations/date/${date}`)
  },

  // 기간별 예약 조회 ✅
  getReservationsByDateRange(businessId, startDate, endDate) {
    return apiClient.get(`/businesses/${businessId}/reservations/date-range`, {
      params: { startDate, endDate },
    })
  },

  // 예약 생성
  createReservation(businessId, reservationData) {
    return apiClient.post(`/businesses/${businessId}/reservations`, reservationData)
  },

  // 예약 수정
  updateReservation(businessId, reservationId, reservationData) {
    return apiClient.patch(`/businesses/${businessId}/reservations/${reservationId}`, reservationData)
  },

  // 예약 상태 변경 (통합) ✅
  updateReservationStatus(businessId, reservationId, status) {
    return apiClient.patch(`/businesses/${businessId}/reservations/${reservationId}/status`, null, {
      params: { status },
    })
  },

  // 예약 취소
  cancelReservation(businessId, reservationId, reason = '') {
    return apiClient.patch(`/businesses/${businessId}/reservations/${reservationId}/cancel`, null, {
      params: { reason },
    })
  },

  // 예약 삭제
  deleteReservation(businessId, reservationId) {
    return apiClient.delete(`/businesses/${businessId}/reservations/${reservationId}`)
  },
}
