import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router) {
  let isInitialized = false

  router.beforeEach(async (to, from, next) => {
    console.log('🔍 라우터 가드 실행:', to.path) // ← 로그 추가
    
    const authStore = useAuthStore()

    if (!isInitialized) {
      console.log('🔄 인증 초기화 중...') // ← 로그 추가
      await authStore.initialize()
      isInitialized = true
      console.log('✅ 인증 초기화 완료, isAuthenticated:', authStore.isAuthenticated) // ← 로그 추가
    }

    const publicPages = ['/login', '/register']
    const authRequired = !publicPages.includes(to.path)

    console.log('📍 현재 경로:', to.path, '인증 필요:', authRequired, '로그인됨:', authStore.isAuthenticated) // ← 로그 추가

    if (authRequired && !authStore.isAuthenticated) {
      console.log('⛔ 인증 필요 → /login으로 리다이렉트') // ← 로그 추가
      return next('/login')
    }

    if (!authRequired && authStore.isAuthenticated) {
      console.log('✅ 이미 로그인됨 → /로 리다이렉트') // ← 로그 추가
      return next('/')
    }

    console.log('✅ 통과') // ← 로그 추가
    next()
  })
}
