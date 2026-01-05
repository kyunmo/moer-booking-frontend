import customerApi from '@/api/customers'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    selectedCustomer: null,
    loading: false,
  }),

  getters: {
    /**
     * VIP 고객 필터
     */
    vipCustomers: state => {
      return state.customers.filter(c => c.isVip === true)
    },

    /**
     * 신규 고객 필터
     */
    newCustomers: state => {
      return state.customers.filter(c => c.isNew === true)
    },

    /**
     * 단골 고객 필터
     */
    regularCustomers: state => {
      return state.customers.filter(c => c.isRegular === true)
    },

    /**
     * 방문 횟수별 정렬
     */
    customersByVisitCount: state => {
      return [...state.customers].sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
    },
  },

  actions: {
    /**
     * 고객 목록 가져오기
     */
    async fetchCustomers(params = {}) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await customerApi.getCustomers(businessId, params)
        this.customers = data
      }
      catch (error) {
        console.error('고객 목록 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 고객 검색
     */
    async searchCustomers(searchParams) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await customerApi.searchCustomers(businessId, searchParams)
        this.customers = data
      }
      catch (error) {
        console.error('고객 검색 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * VIP 고객 조회
     */
    async fetchVipCustomers() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await customerApi.getVipCustomers(businessId)
        this.customers = data
      }
      catch (error) {
        console.error('VIP 고객 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 신규 고객 조회
     */
    async fetchNewCustomers() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await customerApi.getNewCustomers(businessId)
        this.customers = data
      }
      catch (error) {
        console.error('신규 고객 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 단골 고객 조회
     */
    async fetchRegularCustomers() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await customerApi.getRegularCustomers(businessId)
        this.customers = data
      }
      catch (error) {
        console.error('단골 고객 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 고객 상세 조회
     */
    async fetchCustomer(customerId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await customerApi.getCustomer(businessId, customerId)
        this.selectedCustomer = data
        return data
      }
      catch (error) {
        console.error('고객 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 고객 생성
     */
    async createCustomer(customerData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await customerApi.createCustomer(businessId, customerData)
        this.customers.push(data)
        return data
      }
      catch (error) {
        console.error('고객 생성 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 고객 수정
     */
    async updateCustomer(customerId, customerData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await customerApi.updateCustomer(businessId, customerId, customerData)
        
        // 목록에서 업데이트
        const index = this.customers.findIndex(c => c.id === customerId)
        if (index !== -1) {
          this.customers[index] = data
        }
        
        return data
      }
      catch (error) {
        console.error('고객 수정 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 고객 삭제
     */
    async deleteCustomer(customerId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await customerApi.deleteCustomer(businessId, customerId)
        
        // 목록에서 제거
        this.customers = this.customers.filter(c => c.id !== customerId)
      }
      catch (error) {
        console.error('고객 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})
