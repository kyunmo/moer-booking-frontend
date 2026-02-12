import subscriptionApi from '@/api/subscription'
import { defineStore } from 'pinia'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptionInfo: null,
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * 현재 플랜
     */
    currentPlan: state => state.subscriptionInfo?.plan || null,

    /**
     * 현재 플랜 설명
     */
    planDescription: state => state.subscriptionInfo?.planDescription || '',

    /**
     * 월 요금
     */
    monthlyPrice: state => state.subscriptionInfo?.monthlyPrice || 0,

    /**
     * 구독 상태
     */
    status: state => state.subscriptionInfo?.status || null,

    /**
     * 체험판 활성화 여부
     */
    isTrialActive: state => state.subscriptionInfo?.isTrialActive || false,

    /**
     * 체험판 종료까지 남은 일수
     */
    daysUntilTrialEnd: state => state.subscriptionInfo?.daysUntilTrialEnd || null,

    /**
     * 최대 직원 수
     */
    maxStaff: state => state.subscriptionInfo?.maxStaff || 0,

    /**
     * 최대 월간 예약 수
     */
    maxMonthlyReservations: state => state.subscriptionInfo?.maxMonthlyReservations || 0,

    /**
     * 현재 직원 수
     */
    currentStaffCount: state => state.subscriptionInfo?.currentStaffCount || 0,

    /**
     * 현재 월간 예약 수
     */
    currentMonthReservationCount: state => state.subscriptionInfo?.currentMonthReservationCount || 0,

    /**
     * 서비스 사용 가능 여부
     */
    canUseService: state => state.subscriptionInfo?.canUseService ?? true,

    /**
     * 직원 추가 가능 여부
     */
    canAddStaff: state => state.subscriptionInfo?.canAddStaff ?? true,

    /**
     * 예약 생성 가능 여부
     */
    canCreateReservation: state => state.subscriptionInfo?.canCreateReservation ?? true,

    /**
     * 다음 결제 예정일
     */
    nextBillingDate: state => state.subscriptionInfo?.nextBillingDate || null,

    /**
     * 직원 수 사용률 (%)
     */
    staffUsagePercent: state => {
      if (!state.subscriptionInfo) return 0
      const { maxStaff, currentStaffCount } = state.subscriptionInfo
      if (maxStaff === -1) return 0 // 무제한
      if (maxStaff === 0) return 0
      return Math.round((currentStaffCount / maxStaff) * 100)
    },

    /**
     * 예약 수 사용률 (%)
     */
    reservationUsagePercent: state => {
      if (!state.subscriptionInfo) return 0
      const { maxMonthlyReservations, currentMonthReservationCount } = state.subscriptionInfo
      if (maxMonthlyReservations === -1) return 0 // 무제한
      if (maxMonthlyReservations === 0) return 0
      return Math.round((currentMonthReservationCount / maxMonthlyReservations) * 100)
    },

    /**
     * 직원 수 제한 표시 텍스트
     */
    staffLimitText: state => {
      if (!state.subscriptionInfo) return ''
      const { maxStaff, currentStaffCount } = state.subscriptionInfo
      if (maxStaff === -1) return `${currentStaffCount}명 / 무제한`
      return `${currentStaffCount}명 / ${maxStaff}명`
    },

    /**
     * 예약 수 제한 표시 텍스트
     */
    reservationLimitText: state => {
      if (!state.subscriptionInfo) return ''
      const { maxMonthlyReservations, currentMonthReservationCount } = state.subscriptionInfo
      if (maxMonthlyReservations === -1) return `${currentMonthReservationCount}건 / 무제한`
      return `${currentMonthReservationCount}건 / ${maxMonthlyReservations}건`
    },
  },

  actions: {
    /**
     * 구독 정보 조회
     */
    async fetchSubscriptionInfo() {
      this.loading = true
      this.error = null
      try {
        const { data } = await subscriptionApi.getSubscriptionInfo()
        this.subscriptionInfo = data
        return data
      }
      catch (error) {
        console.error('구독 정보 조회 실패:', error)
        this.error = error.message || '구독 정보를 불러오는데 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 플랜 변경
     */
    async changePlan(newPlan) {
      this.loading = true
      this.error = null
      try {
        const { data } = await subscriptionApi.changePlan(newPlan)
        this.subscriptionInfo = data
        return data
      }
      catch (error) {
        console.error('플랜 변경 실패:', error)
        this.error = error.message || '플랜 변경에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 구독 취소
     */
    async cancelSubscription() {
      this.loading = true
      this.error = null
      try {
        await subscriptionApi.cancelSubscription()
        // 구독 정보 다시 가져오기
        await this.fetchSubscriptionInfo()
      }
      catch (error) {
        console.error('구독 취소 실패:', error)
        this.error = error.message || '구독 취소에 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 상태 초기화
     */
    reset() {
      this.subscriptionInfo = null
      this.loading = false
      this.error = null
    },
  },
})
