import superadminApi from '@/api/superadmin'
import { defineStore } from 'pinia'

export const useSuperAdminStore = defineStore('superadmin', {
  state: () => ({
    // 대시보드
    systemStats: null,
    businessRanking: [],
    statsByType: [],

    // 매장 목록
    businesses: [],
    businessPagination: {
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },

    // 사용자 목록
    users: [],
    userPagination: {
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },

    // 감사 로그 목록
    auditLogs: [],
    auditLogPagination: {
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },

    // 로딩 상태
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * 전체 매장 수
     */
    totalBusinesses: state => state.systemStats?.totalBusinesses || 0,

    /**
     * 활성 매장 수
     */
    activeBusinesses: state => state.systemStats?.activeBusinesses || 0,

    /**
     * 전체 사용자 수
     */
    totalUsers: state => state.systemStats?.totalUsers || 0,

    /**
     * 오늘 예약 수
     */
    todayReservations: state => state.systemStats?.totalReservationsToday || 0,

    /**
     * 오늘 매출
     */
    todayRevenue: state => state.systemStats?.totalRevenueToday || 0,

    /**
     * 이번 달 매출
     */
    monthRevenue: state => state.systemStats?.totalRevenueThisMonth || 0,
  },

  actions: {
    // ========================================
    // 대시보드
    // ========================================

    /**
     * 시스템 통계 조회
     */
    async fetchSystemStats() {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.getSystemStats()
        this.systemStats = data
        return data
      }
      catch (error) {
        console.error('시스템 통계 조회 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매출 랭킹 조회
     */
    async fetchBusinessRanking(startDate, endDate, limit = 10) {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.getBusinessRanking(startDate, endDate, limit)
        this.businessRanking = data
        return data
      }
      catch (error) {
        console.error('매출 랭킹 조회 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 업종별 통계 조회
     */
    async fetchStatsByType() {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.getStatsByType()
        this.statsByType = data
        return data
      }
      catch (error) {
        console.error('업종별 통계 조회 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    // ========================================
    // 매장 관리
    // ========================================

    /**
     * 전체 매장 목록 조회
     */
    async fetchBusinesses(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.getBusinesses(params)

        this.businesses = data.content
        this.businessPagination = {
          page: data.page,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        }

        return data
      }
      catch (error) {
        console.error('매장 목록 조회 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 삭제
     */
    async deleteBusiness(id, hard = false) {
      this.loading = true
      this.error = null
      try {
        await superadminApi.deleteBusiness(id, hard)

        // 목록에서 제거
        this.businesses = this.businesses.filter(b => b.id !== id)
        this.businessPagination.totalElements--

        return true
      }
      catch (error) {
        console.error('매장 삭제 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 상태 일괄 변경
     */
    async bulkUpdateBusinessStatus(businessIds, status) {
      this.loading = true
      this.error = null
      try {
        await superadminApi.bulkUpdateBusinessStatus(businessIds, status)

        // 목록 업데이트
        this.businesses = this.businesses.map(b =>
          businessIds.includes(b.id) ? { ...b, status } : b
        )

        return true
      }
      catch (error) {
        console.error('매장 상태 변경 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    // ========================================
    // 사용자 관리
    // ========================================

    /**
     * 전체 사용자 목록 조회
     */
    async fetchUsers(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.getUsers(params)

        this.users = data.content
        this.userPagination = {
          page: data.page,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        }

        return data
      }
      catch (error) {
        console.error('사용자 목록 조회 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 사용자 역할 변경
     */
    async changeUserRole(id, role) {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.changeUserRole(id, role)

        // 목록 업데이트
        this.users = this.users.map(u =>
          u.id === id ? { ...u, role } : u
        )

        return data
      }
      catch (error) {
        console.error('사용자 역할 변경 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 사용자 정지
     */
    async suspendUser(id) {
      this.loading = true
      this.error = null
      try {
        await superadminApi.suspendUser(id)

        // 목록 업데이트
        this.users = this.users.map(u =>
          u.id === id ? { ...u, status: 'SUSPENDED' } : u
        )

        return true
      }
      catch (error) {
        console.error('사용자 정지 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 사용자 활성화
     */
    async activateUser(id) {
      this.loading = true
      this.error = null
      try {
        await superadminApi.activateUser(id)

        // 목록 업데이트
        this.users = this.users.map(u =>
          u.id === id ? { ...u, status: 'ACTIVE' } : u
        )

        return true
      }
      catch (error) {
        console.error('사용자 활성화 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 사용자 삭제
     */
    async deleteUser(id) {
      this.loading = true
      this.error = null
      try {
        await superadminApi.deleteUser(id)

        // 목록에서 제거
        this.users = this.users.filter(u => u.id !== id)
        this.userPagination.totalElements--

        return true
      }
      catch (error) {
        console.error('사용자 삭제 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    // ========================================
    // 감사 로그
    // ========================================

    /**
     * 감사 로그 목록 조회
     */
    async fetchAuditLogs(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await superadminApi.getAuditLogs(params)

        this.auditLogs = data.content

        // 백엔드 응답 구조에 따라 pageInfo가 중첩되어 있거나 평탄할 수 있음
        const pageInfo = data.pageInfo || data
        this.auditLogPagination = {
          page: pageInfo.page || 1,
          size: pageInfo.size || 20,
          totalElements: pageInfo.totalElements || 0,
          totalPages: pageInfo.totalPages || 0,
        }

        return data
      }
      catch (error) {
        console.error('감사 로그 조회 실패:', error)
        this.error = error.message
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 초기화
     */
    reset() {
      this.$reset()
    },
  },
})
