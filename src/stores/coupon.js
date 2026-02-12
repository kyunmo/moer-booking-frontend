import couponApi from '@/api/coupon'
import { defineStore } from 'pinia'

export const useCouponStore = defineStore('coupon', {
  state: () => ({
    coupons: [],
    currentCoupon: null,
    validatedCoupon: null, // 검증된 쿠폰
    discountAmount: 0, // 할인 금액
    loading: false,
    error: null,
    totalCount: 0,
  }),

  getters: {
    /**
     * 활성 쿠폰 목록
     */
    activeCoupons: state => {
      return state.coupons.filter(c => c.status === 'ACTIVE' && !c.isExpired)
    },

    /**
     * 만료된 쿠폰 목록
     */
    expiredCoupons: state => {
      return state.coupons.filter(c => c.status === 'EXPIRED' || c.isExpired)
    },

    /**
     * 정률 할인 쿠폰 목록
     */
    percentageCoupons: state => {
      return state.coupons.filter(c => c.couponType === 'PERCENTAGE')
    },

    /**
     * 정액 할인 쿠폰 목록
     */
    fixedAmountCoupons: state => {
      return state.coupons.filter(c => c.couponType === 'FIXED_AMOUNT')
    },

    /**
     * 쿠폰 타입별 개수
     */
    couponCounts: state => {
      const counts = {
        ACTIVE: 0,
        EXPIRED: 0,
        DISABLED: 0,
        PERCENTAGE: 0,
        FIXED_AMOUNT: 0,
      }
      state.coupons.forEach(c => {
        // 상태별
        if (counts[c.status] !== undefined) {
          counts[c.status]++
        }
        // 타입별
        if (counts[c.couponType] !== undefined) {
          counts[c.couponType]++
        }
      })
      return counts
    },
  },

  actions: {
    /**
     * 쿠폰 생성
     */
    async createCoupon(couponData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await couponApi.createCoupon(couponData)
        this.currentCoupon = data
        return data
      }
      catch (error) {
        console.error('쿠폰 생성 실패:', error)
        this.error = error.message || '쿠폰 생성에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 쿠폰 검증
     */
    async validateCoupon(code, orderAmount) {
      this.loading = true
      this.error = null
      try {
        const { data } = await couponApi.validateCoupon(code, orderAmount)
        this.validatedCoupon = data

        // 할인 금액 계산
        if (data.couponType === 'PERCENTAGE') {
          let discount = Math.floor(orderAmount * (data.discountPercentage / 100))
          if (data.maxDiscountAmount && discount > data.maxDiscountAmount) {
            discount = data.maxDiscountAmount
          }
          this.discountAmount = discount
        } else if (data.couponType === 'FIXED_AMOUNT') {
          this.discountAmount = Math.min(data.discountAmount, orderAmount)
        }

        return data
      }
      catch (error) {
        console.error('쿠폰 검증 실패:', error)
        this.error = error.message || '쿠폰 검증에 실패했습니다.'
        this.validatedCoupon = null
        this.discountAmount = 0
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 쿠폰 단건 조회
     */
    async fetchCoupon(couponId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await couponApi.getCoupon(couponId)
        this.currentCoupon = data
        return data
      }
      catch (error) {
        console.error('쿠폰 조회 실패:', error)
        this.error = error.message || '쿠폰 정보를 불러오는데 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 쿠폰 목록 조회
     */
    async fetchCoupons(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await couponApi.getCouponList(params)

        // 응답이 배열인지 객체인지 확인
        if (Array.isArray(data)) {
          this.coupons = data
        } else if (data.items) {
          this.coupons = data.items
          this.totalCount = data.total || data.items.length
        } else {
          this.coupons = []
        }

        return data
      }
      catch (error) {
        console.error('쿠폰 목록 조회 실패:', error)
        this.error = error.message || '쿠폰 목록을 불러오는데 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 쿠폰 수정
     */
    async updateCoupon(couponId, couponData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await couponApi.updateCoupon(couponId, couponData)
        this.currentCoupon = data

        // 목록에서 업데이트
        const index = this.coupons.findIndex(c => c.id === couponId)
        if (index !== -1) {
          this.coupons[index] = data
        }

        return data
      }
      catch (error) {
        console.error('쿠폰 수정 실패:', error)
        this.error = error.message || '쿠폰 수정에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 쿠폰 삭제
     */
    async deleteCoupon(couponId) {
      this.loading = true
      this.error = null
      try {
        await couponApi.deleteCoupon(couponId)

        // 목록에서 제거
        this.coupons = this.coupons.filter(c => c.id !== couponId)
      }
      catch (error) {
        console.error('쿠폰 삭제 실패:', error)
        this.error = error.message || '쿠폰 삭제에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 검증된 쿠폰 초기화
     */
    clearValidatedCoupon() {
      this.validatedCoupon = null
      this.discountAmount = 0
    },

    /**
     * 상태 초기화
     */
    reset() {
      this.coupons = []
      this.currentCoupon = null
      this.validatedCoupon = null
      this.discountAmount = 0
      this.loading = false
      this.error = null
      this.totalCount = 0
    },
  },
})
