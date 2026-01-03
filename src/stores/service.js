import serviceApi from '@/api/services'
import { defineStore } from 'pinia'

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [],
    selectedService: null,
    loading: false,
    businessId: 1, // TODO: 로그인 시스템 연동 후 동적으로 설정
  }),

  getters: {
    /**
     * 카테고리별로 그룹화된 서비스
     */
    servicesByCategory: state => {
      const grouped = {}
      state.services.forEach(service => {
        const category = service.category || '기타'
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push(service)
      })
      return grouped
    },

    /**
     * 활성화된 서비스만
     */
    activeServices: state => {
      return state.services.filter(s => s.isActive !== false)
    },

    /**
     * 카테고리 목록
     */
    categories: state => {
      const cats = new Set()
      state.services.forEach(service => {
        if (service.category) {
          cats.add(service.category)
        }
      })
      return Array.from(cats)
    },
  },

  actions: {
    /**
     * 서비스 목록 가져오기
     */
    async fetchServices(params = {}) {
      this.loading = true
      try {
        const { data } = await serviceApi.getServices(this.businessId, params)
        this.services = data
      }
      catch (error) {
        console.error('서비스 목록 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 카테고리별 서비스 조회
     */
    async fetchServicesByCategory(category) {
      this.loading = true
      try {
        const { data } = await serviceApi.getServicesByCategory(this.businessId, category)
        this.services = data
      }
      catch (error) {
        console.error('서비스 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 서비스 상세 조회
     */
    async fetchService(serviceId) {
      this.loading = true
      try {
        const { data } = await serviceApi.getService(serviceId)
        this.selectedService = data
        return data
      }
      catch (error) {
        console.error('서비스 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 서비스 생성
     */
    async createService(serviceData) {
      this.loading = true
      try {
        const { data } = await serviceApi.createService({
          ...serviceData,
          businessId: this.businessId,
        })
        this.services.push(data)
        return data
      }
      catch (error) {
        console.error('서비스 생성 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 서비스 수정
     */
    async updateService(serviceId, serviceData) {
      this.loading = true
      try {
        const { data } = await serviceApi.updateService(serviceId, serviceData)
        const index = this.services.findIndex(s => s.id === serviceId)
        if (index !== -1) {
          this.services[index] = data
        }
        return data
      }
      catch (error) {
        console.error('서비스 수정 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 서비스 삭제
     */
    async deleteService(serviceId) {
      this.loading = true
      try {
        await serviceApi.deleteService(serviceId)
        const index = this.services.findIndex(s => s.id === serviceId)
        if (index !== -1) {
          this.services.splice(index, 1)
        }
      }
      catch (error) {
        console.error('서비스 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 선택된 서비스 설정
     */
    setSelectedService(service) {
      this.selectedService = service
    },
  },
})
