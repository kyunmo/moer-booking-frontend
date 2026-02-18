import staffPositionApi from '@/api/staff-positions'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

export const useStaffPositionStore = defineStore('staffPosition', {
  state: () => ({
    positions: [],
    loading: false,
    lastFetchedAt: null,
  }),

  getters: {
    /**
     * 드롭다운용 옵션 (title, value)
     */
    positionOptions: state => {
      return state.positions.map(p => ({
        title: p.name,
        value: p.id,
      }))
    },

    /**
     * ID로 직급 찾기
     */
    getPositionById: state => id => {
      return state.positions.find(p => p.id === id) || null
    },

    /**
     * ID로 직급명 가져오기
     */
    getPositionNameById: state => id => {
      if (!id) return null
      const position = state.positions.find(p => p.id === id)

      return position?.name || null
    },

    /**
     * 캐시 유효 여부
     */
    isCacheValid: state => {
      if (!state.lastFetchedAt) return false

      return Date.now() - state.lastFetchedAt < CACHE_DURATION
    },
  },

  actions: {
    /**
     * 직급 목록 조회 (캐시 우선)
     */
    async fetchPositions(forceRefresh = false) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        return
      }

      if (!forceRefresh && this.isCacheValid && this.positions.length > 0) {
        return this.positions
      }

      this.loading = true
      try {
        const { data } = await staffPositionApi.getPositions(businessId)

        this.positions = data
        this.lastFetchedAt = Date.now()

        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 직급 생성
     */
    async createPosition(positionData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await staffPositionApi.createPosition(businessId, positionData)

        this.positions.push(data)
        this.lastFetchedAt = Date.now()

        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 직급 수정
     */
    async updatePosition(positionId, positionData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await staffPositionApi.updatePosition(businessId, positionId, positionData)

        const index = this.positions.findIndex(p => p.id === positionId)
        if (index !== -1) {
          this.positions[index] = data
        }

        this.lastFetchedAt = Date.now()

        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 직급 삭제
     */
    async deletePosition(positionId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await staffPositionApi.deletePosition(businessId, positionId)

        this.positions = this.positions.filter(p => p.id !== positionId)
        this.lastFetchedAt = Date.now()
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 정렬 순서 일괄 변경
     */
    async updateSortOrder(items) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await staffPositionApi.updateSortOrder(businessId, items)

        this.positions = data
        this.lastFetchedAt = Date.now()

        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 캐시 무효화
     */
    invalidateCache() {
      this.lastFetchedAt = null
    },
  },
})
