import customerApi from '@/api/customers'
import { defineStore } from 'pinia'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    selectedCustomer: null,
    loading: false,
    businessId: 1, // TODO: 로그인 시스템 연동 후 동적으로 설정
  }),

  getters: {
    /**
     * VIP 고객 필터
     */
    vipCustomers: state => {
      return state.customers.filter(c => 
        c.tags && c.tags.includes('VIP'),
      )
    },

    /**
     * 신규 고객 필터
     */
    newCustomers: state => {
      return state.customers.filter(c => 
        c.tags && c.tags.includes('신규'),
      )
    },

    /**
     * 단골 고객 필터
     */
    regularCustomers: state => {
      return state.customers.filter(c => 
        c.tags && c.tags.includes('단골'),
      )
    },

    /**
     * 방문 횟수별 정렬
     */
    customersByVisitCount: state => {
      return [...state.customers].sort((a, b) => b.visitCount - a.visitCount)
    },
  },

  actions: {
    /**
     * 고객 목록 가져오기
     */
    async fetchCustomers(params = {}) {
      this.loading = true
      try {
        const { data } = await customerApi.getCustomers(this.businessId, params)
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
    async searchCustomers(keyword) {
      this.loading = true
      try {
        const { data } = await customerApi.searchCustomers(this.businessId, keyword)
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
     * 고객 상세 조회
     */
    async fetchCustomer(customerId) {
      this.loading = true
      try {
        const { data } = await customerApi.getCustomer(customerId)
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
      this.loading = true
      try {
        const { data } = await customerApi.createCustomer({
          ...customerData,
          businessId: this.businessId,
        })
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
      this.loading = true
      try {
        const { data } = await customerApi.updateCustomer(customerId, customerData)
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
      this.loading = true
      try {
        await customerApi.deleteCustomer(customerId)
        const index = this.customers.findIndex(c => c.id === customerId)
        if (index !== -1) {
          this.customers.splice(index, 1)
        }
      }
      catch (error) {
        console.error('고객 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 선택된 고객 설정
     */
    setSelectedCustomer(customer) {
      this.selectedCustomer = customer
    },
  },
})
