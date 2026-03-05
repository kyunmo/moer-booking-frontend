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

  // ===== 서비스 이미지 =====

  // 서비스 이미지 업로드 (multipart/form-data)
  uploadServiceImage(businessId, serviceId, file, sortOrder = null, caption = null) {
    const formData = new FormData()
    formData.append('file', file)
    if (sortOrder !== null) formData.append('sortOrder', sortOrder)
    if (caption) formData.append('caption', caption)

    return apiClient.post(`/businesses/${businessId}/services/${serviceId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 서비스 이미지 목록 조회
  getServiceImages(businessId, serviceId) {
    return apiClient.get(`/businesses/${businessId}/services/${serviceId}/images`)
  },

  // 서비스 이미지 삭제
  deleteServiceImage(businessId, serviceId, imageId) {
    return apiClient.delete(`/businesses/${businessId}/services/${serviceId}/images/${imageId}`)
  },

  // 서비스 이미지 순서 변경
  updateImageSort(businessId, serviceId, imageOrders) {
    return apiClient.patch(`/businesses/${businessId}/services/${serviceId}/images/sort`, { imageOrders })
  },

  // Public 서비스 이미지 조회
  getPublicServiceImages(slug, serviceId) {
    return apiClient.get(`/public/businesses/${slug}/services/${serviceId}/images`)
  },
}
