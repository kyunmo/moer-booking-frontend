import apiClient from './axios'

export default {
  // 고객 목록 조회
  getCustomers(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/customers`, { params })
  },

  // 고객 상세 조회
  getCustomer(businessId, customerId) {
    return apiClient.get(`/businesses/${businessId}/customers/${customerId}`)
  },

  // 전화번호로 고객 조회
  getCustomerByPhone(businessId, phone) {
    return apiClient.get(`/businesses/${businessId}/customers/phone/${phone}`)
  },

  // 고객 검색
  searchCustomers(businessId, params = {}) {
    return apiClient.get(`/businesses/${businessId}/customers/search`, { params })
  },

  // VIP 고객 목록
  getVipCustomers(businessId) {
    return apiClient.get(`/businesses/${businessId}/customers/vip`)
  },

  // 신규 고객 목록
  getNewCustomers(businessId) {
    return apiClient.get(`/businesses/${businessId}/customers/new`)
  },

  // 단골 고객 목록
  getRegularCustomers(businessId) {
    return apiClient.get(`/businesses/${businessId}/customers/regular`)
  },

  // 고객 생성
  createCustomer(businessId, customerData) {
    return apiClient.post(`/businesses/${businessId}/customers`, customerData)
  },

  // 고객 수정
  updateCustomer(businessId, customerId, customerData) {
    return apiClient.patch(`/businesses/${businessId}/customers/${customerId}`, customerData)
  },

  // 고객 삭제
  deleteCustomer(businessId, customerId) {
    return apiClient.delete(`/businesses/${businessId}/customers/${customerId}`)
  },
}
