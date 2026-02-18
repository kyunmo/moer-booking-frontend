import statisticsApi from '@/api/statistics'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    revenueData: null,
    revenueLoading: false,
    revenueError: null,

    reservationData: null,
    reservationLoading: false,
    reservationError: null,

    customerData: null,
    customerLoading: false,
    customerError: null,

    staffData: null,
    staffLoading: false,
    staffError: null,

    serviceData: null,
    serviceLoading: false,
    serviceError: null,
  }),

  actions: {
    _getBusinessId() {
      const authStore = useAuthStore()

      return authStore.businessId
    },

    async fetchRevenue(params) {
      const businessId = this._getBusinessId()
      if (!businessId) return

      this.revenueLoading = true
      this.revenueError = null
      try {
        const response = await statisticsApi.getRevenue(businessId, params)

        this.revenueData = response.data || response
      }
      catch (error) {

        this.revenueError = error.message || '매출 통계를 불러오는데 실패했습니다'
      }
      finally {
        this.revenueLoading = false
      }
    },

    async fetchReservations(params) {
      const businessId = this._getBusinessId()
      if (!businessId) return

      this.reservationLoading = true
      this.reservationError = null
      try {
        const response = await statisticsApi.getReservations(businessId, params)

        this.reservationData = response.data || response
      }
      catch (error) {

        this.reservationError = error.message || '예약 통계를 불러오는데 실패했습니다'
      }
      finally {
        this.reservationLoading = false
      }
    },

    async fetchCustomers(params) {
      const businessId = this._getBusinessId()
      if (!businessId) return

      this.customerLoading = true
      this.customerError = null
      try {
        const response = await statisticsApi.getCustomers(businessId, params)

        this.customerData = response.data || response
      }
      catch (error) {

        this.customerError = error.message || '고객 통계를 불러오는데 실패했습니다'
      }
      finally {
        this.customerLoading = false
      }
    },

    async fetchStaff(params) {
      const businessId = this._getBusinessId()
      if (!businessId) return

      this.staffLoading = true
      this.staffError = null
      try {
        const response = await statisticsApi.getStaff(businessId, params)

        this.staffData = response.data || response
      }
      catch (error) {

        this.staffError = error.message || '직원 성과를 불러오는데 실패했습니다'
      }
      finally {
        this.staffLoading = false
      }
    },

    async fetchServices(params) {
      const businessId = this._getBusinessId()
      if (!businessId) return

      this.serviceLoading = true
      this.serviceError = null
      try {
        const response = await statisticsApi.getServices(businessId, params)

        this.serviceData = response.data || response
      }
      catch (error) {

        this.serviceError = error.message || '서비스 통계를 불러오는데 실패했습니다'
      }
      finally {
        this.serviceLoading = false
      }
    },

    resetAll() {
      this.revenueData = null
      this.revenueLoading = false
      this.revenueError = null
      this.reservationData = null
      this.reservationLoading = false
      this.reservationError = null
      this.customerData = null
      this.customerLoading = false
      this.customerError = null
      this.staffData = null
      this.staffLoading = false
      this.staffError = null
      this.serviceData = null
      this.serviceLoading = false
      this.serviceError = null
    },
  },
})
