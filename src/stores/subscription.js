import subscriptionApi from '@/api/subscription'
import { TRIAL } from '@/constants/pricing'
import { toBackendPlan, toFrontendPlan } from '@/utils/planAdapter'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptionInfo: null,
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * 현재 플랜 (프론트엔드 키: FREE | PAID)
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
     * 연간 요금
     */
    yearlyPrice: state => state.subscriptionInfo?.yearlyPrice || 0,

    /**
     * 결제 주기 (MONTHLY | YEARLY)
     */
    billingCycle: state => state.subscriptionInfo?.billingCycle || null,

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
    daysUntilTrialEnd: state => state.subscriptionInfo?.daysUntilTrialEnd ?? null,

    /**
     * 체험판 시작일
     */
    trialStartedAt: state => state.subscriptionInfo?.trialStartedAt || null,

    /**
     * 체험판 종료일
     */
    trialEndsAt: state => state.subscriptionInfo?.trialEndsAt || null,

    /**
     * 구독 시작일
     */
    subscriptionStartedAt: state => state.subscriptionInfo?.subscriptionStartedAt || null,

    /**
     * 최대 직원 수
     */
    maxStaff: state => state.subscriptionInfo?.maxStaff || 0,

    /**
     * 최대 월간 예약 수
     */
    maxMonthlyReservations: state => state.subscriptionInfo?.maxMonthlyReservations || 0,

    /**
     * 최대 서비스(시술 메뉴) 수
     */
    maxServices: state => state.subscriptionInfo?.maxServices || 0,

    /**
     * 광고 표시 여부
     */
    showAds: state => state.subscriptionInfo?.showAds ?? false,

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

    /**
     * 체험 상태: 'active' | 'expiring' | 'expired' | 'none'
     *
     * 백엔드 status 흐름:
     *   가입 → TRIAL (30일) → EXPIRED (만료) → ACTIVE (결제 후)
     */
    trialStatus: state => {
      if (!state.subscriptionInfo) return 'none'
      const { isTrialActive, daysUntilTrialEnd, plan, status } = state.subscriptionInfo

      // 체험 활성 중 (status=TRIAL)
      if (isTrialActive && daysUntilTrialEnd != null && daysUntilTrialEnd > 0) {
        return daysUntilTrialEnd <= TRIAL.WARNING_THRESHOLD_DAYS ? 'expiring' : 'active'
      }

      // FREE 플랜 + 만료 (status=EXPIRED 또는 isTrialActive=false)
      if (plan === 'FREE' && (status === 'EXPIRED' || !isTrialActive)) return 'expired'

      return 'none'
    },

    /**
     * 체험판 만료 여부 (FREE + trial 끝)
     */
    isTrialExpired: state => {
      if (!state.subscriptionInfo) return false
      const { plan, isTrialActive, status } = state.subscriptionInfo

      return plan === 'FREE' && (status === 'EXPIRED' || !isTrialActive)
    },

    /**
     * 예약 사용량 경고 표시 여부 (FREE + 20건 이상)
     */
    shouldShowReservationWarning: state => {
      if (!state.subscriptionInfo) return false
      const { plan, currentMonthReservationCount, maxMonthlyReservations } = state.subscriptionInfo
      if (plan !== 'FREE') return false
      if (maxMonthlyReservations === -1) return false

      return currentMonthReservationCount >= TRIAL.RESERVATION_WARNING_COUNT
    },
  },

  actions: {
    /**
     * 구독 정보 조회
     */
    async fetchSubscriptionInfo() {
      const authStore = useAuthStore()

      this.loading = true
      this.error = null
      try {
        // 슈퍼관리자인 경우 선택된 매장의 businessId를 전달
        const businessId = authStore.isSuperAdmin ? authStore.businessId : null
        const { data } = await subscriptionApi.getSubscriptionInfo(businessId)

        // 백엔드 BASIC → 프론트엔드 PAID 변환
        this.subscriptionInfo = {
          ...data,
          plan: toFrontendPlan(data.plan),
        }

        return this.subscriptionInfo
      }
      catch (error) {

        this.error = error.message || '구독 정보를 불러오는데 실패했습니다.'
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 플랜 변경
     * @param {string} newPlan - 프론트엔드 플랜명 (FREE | PAID)
     * @param {string} billingCycle - 결제 주기 (MONTHLY | YEARLY, 선택)
     */
    async changePlan(newPlan, billingCycle) {
      this.loading = true
      this.error = null
      try {
        // 프론트엔드 PAID → 백엔드 BASIC 변환
        const backendPlan = toBackendPlan(newPlan)
        const { data } = await subscriptionApi.changePlan(backendPlan, billingCycle)

        // 응답도 변환하여 저장
        this.subscriptionInfo = {
          ...data,
          plan: toFrontendPlan(data.plan),
        }

        return this.subscriptionInfo
      }
      catch (error) {

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
