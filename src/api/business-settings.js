import apiClient from './axios'

export default {
  // 매장 정보 조회
  getBusinessInfo(businessId) {
    return apiClient.get(`/businesses/${businessId}`)
  },

  // 매장 정보 수정
  updateBusinessInfo(businessId, businessData) {
    return apiClient.patch(`/businesses/${businessId}`, businessData)
  },

  // 매장 설정 수정 (영업시간 등)
  updateBusinessSettings(businessId, settingsData) {
    return apiClient.patch(`/businesses/${businessId}/settings`, settingsData)
  },

  // 매장 상태 변경
  updateBusinessStatus(businessId, status) {
    return apiClient.patch(`/businesses/${businessId}/status`, { status })
  },

  // 휴무일 목록 조회
  getHolidays(businessId, year = null) {
    return apiClient.get(`/businesses/${businessId}/holidays`, {
      params: year ? { year } : {},
    })
  },

  // 기간별 휴무일 조회
  getHolidaysByRange(businessId, startDate, endDate) {
    return apiClient.get(`/businesses/${businessId}/holidays/range`, {
      params: { startDate, endDate },
    })
  },

  // 특정 날짜 휴무일 확인
  checkHoliday(businessId, date) {
    return apiClient.get(`/businesses/${businessId}/holidays/check`, {
      params: { date },
    })
  },

  // 휴무일 추가
  createHoliday(businessId, holidayData) {
    return apiClient.post(`/businesses/${businessId}/holidays`, holidayData)
  },

  // 휴무일 삭제
  deleteHoliday(businessId, holidayId) {
    return apiClient.delete(`/businesses/${businessId}/holidays/${holidayId}`)
  },
}
