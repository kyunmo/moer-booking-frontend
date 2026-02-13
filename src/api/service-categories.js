import apiClient from './axios'

export default {
  // 카테고리 목록 조회
  getCategories(businessId) {
    return apiClient.get(`/businesses/${businessId}/service-categories`)
  },

  // 카테고리 단건 조회
  getCategory(businessId, categoryId) {
    return apiClient.get(`/businesses/${businessId}/service-categories/${categoryId}`)
  },

  // 카테고리 생성
  createCategory(businessId, categoryData) {
    return apiClient.post(`/businesses/${businessId}/service-categories`, categoryData)
  },

  // 카테고리 수정
  updateCategory(businessId, categoryId, categoryData) {
    return apiClient.patch(`/businesses/${businessId}/service-categories/${categoryId}`, categoryData)
  },

  // 카테고리 삭제
  deleteCategory(businessId, categoryId) {
    return apiClient.delete(`/businesses/${businessId}/service-categories/${categoryId}`)
  },

  // 카테고리 정렬 순서 변경
  updateSortOrder(businessId, items) {
    return apiClient.patch(`/businesses/${businessId}/service-categories/sort-order`, { items })
  },
}
