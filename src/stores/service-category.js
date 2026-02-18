import serviceCategoryApi from '@/api/service-categories'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

export const useServiceCategoryStore = defineStore('serviceCategory', {
  state: () => ({
    categories: [],
    loading: false,
    lastFetchedAt: null, // 캐시 타임스탬프
  }),

  getters: {
    /**
     * 드롭다운용 옵션 (id, name)
     */
    categoryOptions: state => {
      return state.categories.map(c => ({
        title: c.name,
        value: c.id,
      }))
    },

    /**
     * ID로 카테고리 찾기
     */
    getCategoryById: state => id => {
      return state.categories.find(c => c.id === id) || null
    },

    /**
     * 이름으로 카테고리 찾기
     */
    getCategoryNameById: state => id => {
      if (!id) return '미분류'
      const category = state.categories.find(c => c.id === id)

      return category?.name || '미분류'
    },

    /**
     * 캐시가 유효한지 확인
     */
    isCacheValid: state => {
      if (!state.lastFetchedAt) return false

      return Date.now() - state.lastFetchedAt < CACHE_DURATION
    },
  },

  actions: {
    /**
     * 카테고리 목록 조회 (캐시 우선)
     * @param {boolean} forceRefresh - 강제 새로고침
     */
    async fetchCategories(forceRefresh = false) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        return
      }

      // 캐시가 유효하고 강제 새로고침이 아니면 캐시 반환
      if (!forceRefresh && this.isCacheValid && this.categories.length > 0) {
        return this.categories
      }

      this.loading = true
      try {
        const { data } = await serviceCategoryApi.getCategories(businessId)

        this.categories = data
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
     * 카테고리 생성
     */
    async createCategory(categoryData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await serviceCategoryApi.createCategory(businessId, categoryData)

        this.categories.push(data)
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
     * 카테고리 수정
     */
    async updateCategory(categoryId, categoryData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await serviceCategoryApi.updateCategory(businessId, categoryId, categoryData)

        // 목록에서 업데이트
        const index = this.categories.findIndex(c => c.id === categoryId)
        if (index !== -1) {
          this.categories[index] = data
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
     * 카테고리 삭제
     */
    async deleteCategory(categoryId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await serviceCategoryApi.deleteCategory(businessId, categoryId)

        // 목록에서 제거
        this.categories = this.categories.filter(c => c.id !== categoryId)
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
     * 카테고리 정렬 순서 변경
     */
    async updateSortOrder(items) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await serviceCategoryApi.updateSortOrder(businessId, items)

        this.categories = data
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
