import serviceApi from '@/api/services'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [],
    selectedService: null,
    loading: false,
  }),

  getters: {
    /**
     * 카테고리별로 그룹화된 서비스
     */
    servicesByCategory: state => {
      const grouped = {}
      state.services.forEach(service => {
        const category = service.categoryName || service.category || '미분류'
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
     * 서비스에서 사용 중인 카테고리명 목록 (필터용)
     */
    usedCategoryNames: state => {
      const cats = new Set()
      state.services.forEach(service => {
        const name = service.categoryName || service.category
        if (name) {
          cats.add(name)
        }
      })
      return Array.from(cats).sort()
    },
  },

  actions: {
    /**
     * 서비스 목록 가져오기
     */
    async fetchServices(params = {}) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await serviceApi.getServices(businessId, params)
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
     * 서비스 상세 조회
     */
    async fetchService(serviceId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await serviceApi.getService(businessId, serviceId)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await serviceApi.createService(businessId, serviceData)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await serviceApi.updateService(businessId, serviceId, serviceData)
        
        // 목록에서 업데이트
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
     * 서비스 활성/비활성 전환
     */
    async toggleServiceActive(serviceId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await serviceApi.toggleServiceActive(businessId, serviceId)
        
        // 목록에서 업데이트
        const index = this.services.findIndex(s => s.id === serviceId)
        if (index !== -1) {
          this.services[index] = data
        }
        
        return data
      }
      catch (error) {
        console.error('서비스 상태 변경 실패:', error)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await serviceApi.deleteService(businessId, serviceId)
        
        // 목록에서 제거
        this.services = this.services.filter(s => s.id !== serviceId)
      }
      catch (error) {
        console.error('서비스 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})
