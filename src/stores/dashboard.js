import apiClient from '@/api/axios'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    loading: false,
  }),

  actions: {
    async fetchDashboard(date = null) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const params = date ? { date } : {}
        const { data } = await apiClient.get(
          `/businesses/${businessId}/dashboard`,
          { params }
        )
        this.dashboardData = data.data
      }
      catch (error) {
        console.error('대시보드 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})
