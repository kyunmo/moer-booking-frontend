import customerApi from '@/api/customer'
import { defineStore } from 'pinia'

export const useCustomerAuthStore = defineStore('customerAuth', {
  state: () => ({
    customer: null,
    accessToken: localStorage.getItem('customerAccessToken') || null,
    refreshToken: localStorage.getItem('customerRefreshToken') || null,
    loading: false,
    isNewUser: false,
    redirectAfterLogin: null,
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken,
    customerName: state => state.customer?.name || '',
    customerEmail: state => state.customer?.email || '',
    customerPhone: state => state.customer?.phone || '',
    profileImageUrl: state => state.customer?.profileImageUrl || null,
    hasPhone: state => !!state.customer?.phone,
  },

  actions: {
    /**
     * 카카오 로그인 시작
     */
    startKakaoLogin(redirectPath) {
      // 로그인 후 돌아갈 경로 저장
      if (redirectPath) {
        localStorage.setItem('customerLoginRedirect', redirectPath)
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const apiBaseUrl = baseUrl.replace(/\/api$/, '')

      window.location.href = `${apiBaseUrl}/oauth2/authorize/kakao?loginType=customer`
    },

    /**
     * OAuth 콜백에서 토큰 저장
     */
    handleOAuthCallback(accessToken, refreshToken, isNewUser) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.isNewUser = isNewUser === 'true' || isNewUser === true

      localStorage.setItem('customerAccessToken', accessToken)
      localStorage.setItem('customerRefreshToken', refreshToken)
    },

    /**
     * 고객 프로필 조회
     */
    async fetchProfile() {
      if (!this.accessToken) return

      this.loading = true
      try {
        const { data } = await customerApi.getProfile()
        this.customer = data

        return data
      }
      catch (error) {
        // 인증 실패 시 로그아웃
        if (error.status === 401) {
          this.logout()
        }
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 고객 프로필 수정
     */
    async updateProfile(data) {
      this.loading = true
      try {
        await customerApi.updateProfile(data)

        // 로컬 상태 업데이트
        if (this.customer) {
          if (data.name !== undefined) this.customer.name = data.name
          if (data.phone !== undefined) this.customer.phone = data.phone
          if (data.marketingAgree !== undefined) this.customer.marketingAgree = data.marketingAgree
        }
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
    logout() {
      this.customer = null
      this.accessToken = null
      this.refreshToken = null
      this.isNewUser = false
      localStorage.removeItem('customerAccessToken')
      localStorage.removeItem('customerRefreshToken')
      localStorage.removeItem('customerLoginRedirect')
    },

    /**
     * 앱 시작 시 초기화
     */
    async initialize() {
      if (this.accessToken) {
        try {
          await this.fetchProfile()
        }
        catch {
          // 프로필 조회 실패 시 로그아웃
          this.logout()
        }
      }
    },

    /**
     * 저장된 리다이렉트 경로 가져오기 (한번만 사용)
     */
    consumeRedirectPath() {
      const path = localStorage.getItem('customerLoginRedirect')
      localStorage.removeItem('customerLoginRedirect')

      return path
    },
  },
})
