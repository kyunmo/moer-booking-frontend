import apiClient from './axios'

export default {
  // 스태프 목록 조회
  getStaffs(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/staffs`, { params })
  },

  // 스태프 상세 조회
  getStaff(businessId, staffId) {
    return apiClient.get(`/businesses/${businessId}/staffs/${staffId}`)
  },

  // 스태프 생성
  createStaff(businessId, staffData) {
    return apiClient.post(`/businesses/${businessId}/staffs`, staffData)
  },

  // 스태프 수정
  updateStaff(businessId, staffId, staffData) {
    return apiClient.patch(`/businesses/${businessId}/staffs/${staffId}`, staffData)
  },

  // 스태프 활성/비활성 전환
  toggleStaffActive(businessId, staffId) {
    return apiClient.patch(`/businesses/${businessId}/staffs/${staffId}/toggle-active`)
  },

  // 스태프 삭제
  deleteStaff(businessId, staffId) {
    return apiClient.delete(`/businesses/${businessId}/staffs/${staffId}`)
  },

  // 스태프 예약 목록 조회
  getStaffReservations(staffId, date = null) {
    return apiClient.get(`/staffs/${staffId}/reservations`, {
      params: date ? { date } : {},
    })
  },
}
