import apiClient from '@/api/axios'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDashboard(date = null) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        console.error('businessId가 없습니다')
        this.error = 'businessId가 없습니다'
        return
      }

      this.loading = true
      this.error = null
      try {
        const params = date ? { date } : {}
        const response = await apiClient.get(
          `/businesses/${businessId}/dashboard`,
          { params }
        )

        console.log('🔍 Full API Response:', response)
        console.log('🔍 Response.data:', response.data)
        console.log('🔍 Response.data.data:', response.data?.data)

        // API 응답 구조에 따라 데이터 추출
        // 응답 구조: { data: { todayStats: ..., weekStats: ... }, success: true }
        const apiData = response.data?.data || response.data

        console.log('🔍 Extracted apiData:', apiData)
        console.log('🔍 apiData.todayStats:', apiData?.todayStats)

        this.dashboardData = apiData

        console.log('✅ dashboardData assigned:', this.dashboardData)
      }
      catch (error) {
        console.error('❌ 대시보드 조회 실패:', error)
        console.error('❌ Error details:', error.response?.data || error.message)
        this.error = error.response?.data?.message || '대시보드 데이터를 불러오는데 실패했습니다'
        this.dashboardData = null
      }
      finally {
        this.loading = false
      }
    },
  },
})
