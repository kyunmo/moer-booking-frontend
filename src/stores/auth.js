import authApi from '@/api/auth'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
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
     * 비즈니스 ID
     */
    businessId: state => state.user?.businessId || null,
  },

  actions: {
    /**
     * 로그인
     */
    async login(credentials) {
      this.loading = true
      try {
        const data = await authApi.login(credentials)
        
        // 토큰 저장
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // 사용자 정보 저장
        this.user = data.user

        return data
      }
      catch (error) {
        console.error('로그인 실패:', error)
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
          console.warn('로그아웃 API 호출 실패:', error)
        }

        // 상태 초기화
        this.user = null
        this.accessToken = null
        this.refreshToken = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        // 로그인 페이지로 이동
        const router = useRouter()
        router.push('/login')
      }
      catch (error) {
        console.error('로그아웃 실패:', error)
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 회원가입
     */
    async register(userData) {
      this.loading = true
      try {
        const data = await authApi.register(userData)
        
        // 회원가입 후 자동 로그인
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        this.user = data.user

        return data
      }
      catch (error) {
        console.error('회원가입 실패:', error)
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
        const data = await authApi.getCurrentUser()
        this.user = data
        return data
      }
      catch (error) {
        console.error('사용자 정보 조회 실패:', error)
        
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
        const data = await authApi.refreshToken(this.refreshToken)
        
        this.accessToken = data.accessToken
        localStorage.setItem('accessToken', data.accessToken)

        return data.accessToken
      }
      catch (error) {
        console.error('토큰 갱신 실패:', error)
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
        }
        catch (error) {
          // 사용자 정보 조회 실패 시 로그아웃
          this.logout()
        }
      }
    },
  },
})
