import authApi from '@/api/auth'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    business: null,
    trial: null, // 30일 체험판 정보
    selectedBusinessForSuperAdmin: null, // 슈퍼관리자가 선택한 매장
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
  }),

  getters: {
    /**
     * 로그인 여부
     */
    isAuthenticated: state => !!state.accessToken,

    /**
     * 사용자 이름
     */
    userName: state => state.user?.name || '',

    /**
     * 사용자 이메일
     */
    userEmail: state => state.user?.email || '',

    /**
     * 사용자 역할
     */
    userRole: state => state.user?.role || 'USER',

    /**
     * 슈퍼관리자 여부
     */
    isSuperAdmin: state => state.user?.role === 'SUPER_ADMIN',

    /**
     * 비즈니스 ID
     * 슈퍼관리자: 선택된 매장 ID, 일반관리자: 본인의 businessId
     */
    businessId: state => {
      if (state.user?.role === 'SUPER_ADMIN') {
        return state.selectedBusinessForSuperAdmin?.id || null
      }
      return state.user?.businessId || null
    },

    /**
     * 매장 선택 여부 (슈퍼관리자일 경우에만 의미 있음)
     */
    hasSelectedBusiness: state => {
      if (state.user?.role === 'SUPER_ADMIN') {
        return !!state.selectedBusinessForSuperAdmin
      }
      return !!state.user?.businessId
    },

    /**
     * 선택된 매장 정보
     */
    selectedBusiness: state => {
      if (state.user?.role === 'SUPER_ADMIN') {
        return state.selectedBusinessForSuperAdmin
      }
      return state.business
    },

    businessName: state => state.business?.name || '',
    businessType: state => state.business?.businessType || '',

    /**
     * 체험판 정보
     */
    trialInfo: state => state.trial,
    isPremium: state => state.trial?.isPremium || false,
    isTrialExpired: state => state.trial?.isExpired || false,
    trialRemainingDays: state => state.trial?.remainingDays || 0,
  },

  actions: {
    /**
     * 로그인
     */
    async login(credentials) {
      this.loading = true
      try {
        const { data } = await authApi.login(credentials)

        // 토큰 저장
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // 사용자 정보 저장
        this.user = {
          id: data.userId,
          email: data.email,
          name: data.name,
          role: data.role,
          staffId: data.staffId,
          businessId: data.businessId,
        }

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
     * 로그아웃
     */
    async logout() {
      this.loading = true
      try {
        // API 호출 (선택)
        try {
          await authApi.logout()
        }
        catch (error) {
          // 로그아웃 API 실패해도 로컬 상태는 정리
        }

        // 상태 초기화
        this.user = null
        this.business = null
        this.trial = null
        this.accessToken = null
        this.refreshToken = null
        this.clearSelectedBusiness()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // 로그인 페이지로 이동
        const router = useRouter()
        router.push('/login')
      }
      catch (error) {
        // 로그아웃 실패 무시
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 회원가입
     */
    async register(formData) {
      this.loading = true
      try {
        const { data } = await authApi.register({
          email: formData.email,
          password: formData.password,
          name: formData.ownerName,
          phone: formData.phone,
          businessName: formData.businessName,
          businessType: formData.businessType || 'SALON',  // 기본값
          selectedPlan: formData.selectedPlan || 'BASIC',  // 선택한 플랜 (기본값: BASIC)
        })
        
        // 토큰 저장
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // 사용자 정보 저장 (RegisterResponse 구조)
        this.user = data.user
        this.business = data.business  // 👈 매장 정보 저장
        this.trial = data.trial  // 👈 체험판 정보 저장

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
     * 현재 사용자 정보 조회
     */
    async fetchCurrentUser() {
      if (!this.accessToken) return

      this.loading = true
      try {
        const { data } = await authApi.getCurrentUser()
        this.user = data
        return data
      }
      catch (error) {
        // 토큰이 만료되었을 수 있음
        if (error.response?.status === 401) {
          this.logout()
        }
        
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 토큰 갱신
     */
    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.logout()
        return
      }

      try {
        const { data } = await authApi.refreshToken(this.refreshToken)
        
        this.accessToken = data.accessToken
        localStorage.setItem('accessToken', data.accessToken)

        return data.accessToken
      }
      catch (error) {
        this.logout()
        throw error
      }
    },

    /**
     * 초기화 (앱 시작 시)
     */
    async initialize() {
      if (this.accessToken) {
        try {
          await this.fetchCurrentUser()

          // 슈퍼관리자인 경우 선택된 매장 복원
          if (this.user?.role === 'SUPER_ADMIN') {
            const savedBusiness = localStorage.getItem('selectedBusinessForSuperAdmin')
            if (savedBusiness) {
              try {
                this.selectedBusinessForSuperAdmin = JSON.parse(savedBusiness)
              } catch (e) {
                localStorage.removeItem('selectedBusinessForSuperAdmin')
              }
            }
          }
        }
        catch (error) {
          // 사용자 정보 조회 실패 시 로그아웃
          this.logout()
        }
      }
    },

    /**
     * 슈퍼관리자 매장 선택
     */
    selectBusinessForSuperAdmin(business) {
      if (this.user?.role !== 'SUPER_ADMIN') {
        return
      }

      this.selectedBusinessForSuperAdmin = business

      // localStorage에 저장 (페이지 새로고침 시 유지)
      if (business) {
        localStorage.setItem('selectedBusinessForSuperAdmin', JSON.stringify(business))
      } else {
        localStorage.removeItem('selectedBusinessForSuperAdmin')
      }
    },

    /**
     * 선택된 매장 초기화
     */
    clearSelectedBusiness() {
      this.selectedBusinessForSuperAdmin = null
      localStorage.removeItem('selectedBusinessForSuperAdmin')
    },

    /**
     * 프로필 정보 수정
     */
    async updateProfile(data) {
      const { data: updatedUser } = await authApi.updateProfile(data)
      this.user = updatedUser

      return updatedUser
    },

    /**
     * 프로필 이미지 업로드
     */
    async uploadProfileImage(file) {
      const { data: result } = await authApi.uploadProfileImage(file)
      if (this.user) {
        this.user.profileImageUrl = result.profileImageUrl
      }

      return result
    },

    /**
     * 회원 탈퇴
     */
    async deleteAccount(data) {
      await authApi.deleteAccount(data)

      // 상태 초기화
      this.user = null
      this.business = null
      this.trial = null
      this.accessToken = null
      this.refreshToken = null
      this.selectedBusinessForSuperAdmin = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('selectedBusinessForSuperAdmin')
    },
  },
})
