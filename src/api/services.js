import apiClient from './axios'

export default {
  // 서비스 목록 조회
  getServices(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/services`, { params })
  },

  // 서비스 상세 조회
  getService(businessId, serviceId) {
    return apiClient.get(`/businesses/${businessId}/services/${serviceId}`)
  },

  // 서비스 검색
  searchServices(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/services/search`, { params })
  },

  // 서비스 생성
  createService(businessId, serviceData) {
    return apiClient.post(`/businesses/${businessId}/services`, serviceData)
  },

  // 서비스 수정
  updateService(businessId, serviceId, serviceData) {
    return apiClient.patch(`/businesses/${businessId}/services/${serviceId}`, serviceData)
  },

  // 서비스 활성/비활성 전환
  toggleServiceActive(businessId, serviceId) {
    return apiClient.patch(`/businesses/${businessId}/services/${serviceId}/toggle-active`)
  },

  // 서비스 삭제
  deleteService(businessId, serviceId) {
    return apiClient.delete(`/businesses/${businessId}/services/${serviceId}`)
  },

  // 서비스 이름 중복 확인
  checkServiceName(businessId, name, excludeId = null) {
    const params = { name }
    if (excludeId) params.excludeId = excludeId

    return apiClient.get(`/businesses/${businessId}/services/check-name`, { params })
  },
}
