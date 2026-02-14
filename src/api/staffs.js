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

  // 근무 스케줄 조회
  getStaffSchedules(businessId, staffId) {
    return apiClient.get(`/businesses/${businessId}/staffs/${staffId}/schedules`)
  },

  // 근무 스케줄 일괄 저장
  saveStaffSchedules(businessId, staffId, schedules) {
    return apiClient.put(`/businesses/${businessId}/staffs/${staffId}/schedules`, { schedules })
  },

  // 특정 날짜 가용 시간 조회
  getAvailableTimes(businessId, staffId, date) {
    return apiClient.get(`/businesses/${businessId}/staffs/${staffId}/available-times`, {
      params: { date },
    })
  },

  // 프로필 이미지 업로드
  uploadProfileImage(businessId, staffId, file) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(
      `/businesses/${businessId}/staffs/${staffId}/profile-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },

  // 포트폴리오 목록 조회
  getPortfolios(businessId, staffId) {
    return apiClient.get(`/businesses/${businessId}/staffs/${staffId}/portfolios`)
  },

  // 포트폴리오 추가
  addPortfolio(businessId, staffId, file, data = {}) {
    const formData = new FormData()
    formData.append('file', file)
    if (data.title) formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (data.serviceCategory) formData.append('serviceCategory', data.serviceCategory)

    return apiClient.post(
      `/businesses/${businessId}/staffs/${staffId}/portfolios`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },

  // 포트폴리오 삭제
  deletePortfolio(businessId, staffId, portfolioId) {
    return apiClient.delete(`/businesses/${businessId}/staffs/${staffId}/portfolios/${portfolioId}`)
  },
}
