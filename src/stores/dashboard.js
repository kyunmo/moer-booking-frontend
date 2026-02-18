import dashboardApi from '@/api/dashboard'
import apiClient from '@/api/axios'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    periodStats: null,
    goals: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDashboard(date = null) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        this.error = 'businessId가 없습니다'
        return
      }

      this.loading = true
      this.error = null
      try {
        const params = date ? { date } : {}
        const response = await apiClient.get(
          `/businesses/${businessId}/dashboard`,
          { params },
        )

        const apiData = response.data || response

        this.dashboardData = apiData
      }
      catch (error) {

        this.error = error.message || '대시보드 데이터를 불러오는데 실패했습니다'
        this.dashboardData = null
      }
      finally {
        this.loading = false
      }
    },

    async fetchPeriodStats(startDate, endDate, compareWith = null) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) return

      try {
        const params = { startDate, endDate }
        if (compareWith) params.compareWith = compareWith

        const response = await dashboardApi.getStats(businessId, params)

        this.periodStats = response.data || response
      }
      catch (error) {

        throw error
      }
    },

    async fetchGoals(month = null) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) return

      try {
        const params = month ? { month } : {}
        const response = await dashboardApi.getGoals(businessId, params)

        this.goals = response.data || response
      }
      catch (error) {

        throw error
      }
    },
  },
})
