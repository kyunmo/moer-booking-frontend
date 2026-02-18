import paymentApi from '@/api/payment'
import { defineStore } from 'pinia'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [],
    currentPayment: null,
    latestPayment: null,
    loading: false,
    error: null,
    totalCount: 0,
  }),

  getters: {
    /**
     * 완료된 결제 목록
     */
    completedPayments: state => {
      return state.payments.filter(p => p.status === 'COMPLETED')
    },

    /**
     * 실패한 결제 목록
     */
    failedPayments: state => {
      return state.payments.filter(p => p.status === 'FAILED')
    },

    /**
     * 환불된 결제 목록
     */
    refundedPayments: state => {
      return state.payments.filter(p => p.status === 'REFUNDED')
    },

    /**
     * 결제 상태별 개수
     */
    paymentCounts: state => {
      const counts = {
        COMPLETED: 0,
        PENDING: 0,
        FAILED: 0,
        REFUNDED: 0,
      }
      state.payments.forEach(p => {
        if (counts[p.status] !== undefined) {
          counts[p.status]++
        }
      })
      return counts
    },

    /**
     * 총 결제 금액 (완료된 결제만)
     */
    totalPaymentAmount: state => {
      return state.completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    },

    /**
     * 총 환불 금액
     */
    totalRefundAmount: state => {
      return state.refundedPayments.reduce((sum, p) => sum + (p.refundedAmount || 0), 0)
    },
  },

  actions: {
    /**
     * 결제 생성 및 처리
     */
    async createPayment(plan, paymentMethod, couponCode = null) {
      this.loading = true
      this.error = null
      try {
        const requestData = {
          plan,
          paymentMethod,
        }

        // 쿠폰 코드가 있으면 추가
        if (couponCode) {
          requestData.couponCode = couponCode
        }

        const { data } = await paymentApi.createPayment(requestData)
        this.currentPayment = data
        return data
      }
      catch (error) {

        this.error = error.message || '결제 처리에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 환불 처리
     */
    async refundPayment(paymentId, reason) {
      this.loading = true
      this.error = null
      try {
        const { data } = await paymentApi.refundPayment(paymentId, reason)

        // 목록에서 해당 결제 업데이트
        const index = this.payments.findIndex(p => p.id === paymentId)
        if (index !== -1) {
          this.payments[index] = data
        }

        return data
      }
      catch (error) {

        this.error = error.message || '환불 처리에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 결제 단건 조회
     */
    async fetchPayment(paymentId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await paymentApi.getPayment(paymentId)
        this.currentPayment = data
        return data
      }
      catch (error) {

        this.error = error.message || '결제 정보를 불러오는데 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 결제 목록 조회
     */
    async fetchPayments(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await paymentApi.getPaymentList(params)

        // 응답이 배열인지 객체인지 확인
        if (Array.isArray(data)) {
          this.payments = data
        } else if (data.items) {
          this.payments = data.items
          this.totalCount = data.total || data.items.length
        } else {
          this.payments = []
        }

        return data
      }
      catch (error) {

        this.error = error.message || '결제 내역을 불러오는데 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 최근 결제 조회
     */
    async fetchLatestPayment() {
      this.loading = true
      this.error = null
      try {
        const { data } = await paymentApi.getLatestPayment()
        this.latestPayment = data
        return data
      }
      catch (error) {
        // 404는 에러로 처리하지 않음 (결제 내역이 없을 수 있음)
        if (error.status !== 404) {

          this.error = error.message || '최근 결제 정보를 불러오는데 실패했습니다.'
        }
        this.latestPayment = null
        return null
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 상태 초기화
     */
    reset() {
      this.payments = []
      this.currentPayment = null
      this.latestPayment = null
      this.loading = false
      this.error = null
      this.totalCount = 0
    },
  },
})
