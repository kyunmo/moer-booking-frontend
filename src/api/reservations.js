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

  // 기간별 예약 조회
  getReservationsByDateRange(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/reservations/date-range`, { params })
  },

  // 상태별 예약 조회
  getReservationsByStatus(businessId, status) {
    return apiClient.get(`/businesses/${businessId}/reservations/status/${status}`)
  },

  // 고객의 예약 조회
  getCustomerReservations(customerId, params = {}) {
    return apiClient.get(`/customers/${customerId}/reservations`, { params })
  },

  // 직원의 예약 조회
  getStaffReservations(staffId, params = {}) {
    return apiClient.get(`/staffs/${staffId}/reservations`, { params })
  },

  // 예약번호로 조회 (고객용)
  getReservationByNumber(reservationNumber) {
    return apiClient.get(`/reservations/number/${reservationNumber}`)
  },

  // 예약 생성
  createReservation(businessId, reservationData) {
    return apiClient.post(`/businesses/${businessId}/reservations`, reservationData)
  },

  // 예약 수정
  updateReservation(businessId, reservationId, reservationData) {
    return apiClient.patch(`/businesses/${businessId}/reservations/${reservationId}`, reservationData)
  },

  // 예약 상태 변경
  updateReservationStatus(businessId, reservationId, status) {
    return apiClient.patch(`/businesses/${businessId}/reservations/${reservationId}/status`, { status })
  },

  // 예약 취소
  deleteReservation(businessId, reservationId) {
    return apiClient.delete(`/businesses/${businessId}/reservations/${reservationId}`)
  },
}
