import reviewApi from '@/api/reviews'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [],
    stats: null,
    loading: false,
    totalCount: 0,
    currentPage: 1,
  }),

  getters: {
    unrepliedReviews: state => {
      return state.reviews.filter(r => !r.isReplied)
    },
  },

  actions: {
    async fetchReviews(params = {}) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await reviewApi.getReviews(businessId, params)
        this.reviews = data.items || []
        this.stats = data.stats || null
        this.totalCount = data.totalCount || 0
        this.currentPage = params.page || 1
        return data
      }
      catch (error) {
        console.error('리뷰 목록 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    async replyReview(reviewId, content) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      try {
        await reviewApi.replyReview(businessId, reviewId, { content })
        const index = this.reviews.findIndex(r => r.id === reviewId)
        if (index !== -1) {
          this.reviews[index].isReplied = true
          this.reviews[index].reply = {
            content,
            createdAt: new Date().toISOString(),
          }
        }
      }
      catch (error) {
        console.error('리뷰 답변 실패:', error)
        throw error
      }
    },

    async deleteReview(reviewId, reason = '') {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      try {
        await reviewApi.deleteReview(businessId, reviewId, { reason })
        const index = this.reviews.findIndex(r => r.id === reviewId)
        if (index !== -1) {
          this.reviews[index].status = 'DELETED'
          this.reviews[index].deleteReason = reason
        }
      }
      catch (error) {
        console.error('리뷰 삭제 실패:', error)
        throw error
      }
    },
  },
})
