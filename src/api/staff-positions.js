import apiClient from './axios'

export default {
  // 직급 목록 조회
  getPositions(businessId) {
    return apiClient.get(`/businesses/${businessId}/staff-positions`)
  },

  // 직급 단건 조회
  getPosition(businessId, positionId) {
    return apiClient.get(`/businesses/${businessId}/staff-positions/${positionId}`)
  },

  // 직급 생성
  createPosition(businessId, positionData) {
    return apiClient.post(`/businesses/${businessId}/staff-positions`, positionData)
  },

  // 직급 수정
  updatePosition(businessId, positionId, positionData) {
    return apiClient.patch(`/businesses/${businessId}/staff-positions/${positionId}`, positionData)
  },

  // 직급 삭제
  deletePosition(businessId, positionId) {
    return apiClient.delete(`/businesses/${businessId}/staff-positions/${positionId}`)
  },

  // 정렬 순서 일괄 변경
  updateSortOrder(businessId, items) {
    return apiClient.patch(`/businesses/${businessId}/staff-positions/sort-order`, { items })
  },
}
