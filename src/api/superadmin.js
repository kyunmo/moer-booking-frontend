import apiClient from './axios'

/**
 * 슈퍼 관리자 API
 */
export default {
  // ========================================
  // 대시보드
  // ========================================

  /**
   * 시스템 통계 조회
   */
  getSystemStats() {
    return apiClient.get('/superadmin/dashboard/stats')
  },

  /**
   * 매출 랭킹 조회
   * @param {string} startDate - 시작일 (yyyy-MM-dd)
   * @param {string} endDate - 종료일 (yyyy-MM-dd)
   * @param {number} limit - 조회 개수
   */
  getBusinessRanking(startDate, endDate, limit = 10) {
    return apiClient.get('/superadmin/dashboard/business-ranking', {
      params: { startDate, endDate, limit },
    })
  },

  /**
   * 업종별 통계 조회
   */
  getStatsByType() {
    return apiClient.get('/superadmin/dashboard/stats-by-type')
  },

  // ========================================
  // 매장 관리
  // ========================================

  /**
   * 전체 매장 목록 조회
   * @param {Object} params - 필터 파라미터
   * @param {number} params.page - 페이지 번호 (1부터 시작)
   * @param {number} params.size - 페이지당 개수
   * @param {string} params.keyword - 검색어
   * @param {string} params.businessType - 업종
   * @param {string} params.status - 상태
   */
  getBusinesses(params) {
    return apiClient.get('/superadmin/businesses', { params })
  },

  /**
   * 매장 상세 조회
   * @param {number} id - 매장 ID
   */
  getBusinessById(id) {
    return apiClient.get(`/superadmin/businesses/${id}`)
  },

  /**
   * 매장 강제 삭제
   * @param {number} id - 매장 ID
   * @param {boolean} hard - 하드 삭제 여부
   */
  deleteBusiness(id, hard = false) {
    return apiClient.delete(`/superadmin/businesses/${id}`, {
      params: { hard },
    })
  },

  /**
   * 매장 상태 일괄 변경
   * @param {number[]} businessIds - 매장 ID 배열
   * @param {string} status - 변경할 상태 (ACTIVE, INACTIVE, SUSPENDED)
   */
  bulkUpdateBusinessStatus(businessIds, status) {
    return apiClient.patch('/superadmin/businesses/bulk-status', {
      businessIds,
      status,
    })
  },

  // ========================================
  // 사용자 관리
  // ========================================

  /**
   * 전체 사용자 목록 조회
   * @param {Object} params - 필터 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지당 개수
   * @param {string} params.keyword - 검색어
   * @param {string} params.role - 역할
   * @param {string} params.status - 상태
   * @param {number} params.businessId - 매장 ID
   */
  getUsers(params) {
    return apiClient.get('/superadmin/users', { params })
  },

  /**
   * 사용자 상세 조회
   * @param {number} id - 사용자 ID
   */
  getUserById(id) {
    return apiClient.get(`/superadmin/users/${id}`)
  },

  /**
   * 사용자 역할 변경
   * @param {number} id - 사용자 ID
   * @param {string} role - 변경할 역할 (SUPER_ADMIN, ADMIN, OWNER, STAFF)
   */
  changeUserRole(id, role) {
    return apiClient.patch(`/superadmin/users/${id}/role`, { role })
  },

  /**
   * 사용자 정지
   * @param {number} id - 사용자 ID
   */
  suspendUser(id) {
    return apiClient.patch(`/superadmin/users/${id}/suspend`)
  },

  /**
   * 사용자 활성화
   * @param {number} id - 사용자 ID
   */
  activateUser(id) {
    return apiClient.patch(`/superadmin/users/${id}/activate`)
  },

  /**
   * 사용자 강제 삭제
   * @param {number} id - 사용자 ID
   */
  deleteUser(id) {
    return apiClient.delete(`/superadmin/users/${id}`)
  },

  // ========================================
  // 감사 로그
  // ========================================

  /**
   * 감사 로그 목록 조회
   * @param {Object} params - 필터 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지당 개수
   * @param {number} params.userId - 액션 수행 사용자 ID
   * @param {string} params.action - 액션 타입
   * @param {string} params.entityType - 대상 엔티티 타입
   * @param {string} params.startDate - 시작일 (yyyy-MM-dd)
   * @param {string} params.endDate - 종료일 (yyyy-MM-dd)
   */
  getAuditLogs(params) {
    return apiClient.get('/audit-logs', { params })
  },

  /**
   * 감사 로그 상세 조회
   * @param {number} id - 로그 ID
   */
  getAuditLogById(id) {
    return apiClient.get(`/audit-logs/${id}`)
  },
}
