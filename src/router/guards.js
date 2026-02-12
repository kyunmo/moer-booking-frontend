import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router) {
  let isInitialized = false

  router.beforeEach(async (to, from, next) => {
    console.log('🔍 라우터 가드 실행:', to.path)

    const authStore = useAuthStore()

    // 1. 인증 초기화
    if (!isInitialized) {
      console.log('🔄 인증 초기화 중...')
      await authStore.initialize()
      isInitialized = true
      console.log('✅ 인증 초기화 완료, isAuthenticated:', authStore.isAuthenticated)
    }

    // 2. 공개 페이지 체크 (메타 정보 우선)
    const isPublicPage = to.meta.public === true

    // 3. 관리자/슈퍼관리자 페이지 체크
    const isShopAdminPage = to.path.startsWith('/shop-admin')
    const isSuperAdminPage = to.path.startsWith('/shop-admin/super')

    console.log('📍 현재 경로:', to.path, {
      isPublicPage,
      isShopAdminPage,
      isSuperAdminPage,
      isAuthenticated: authStore.isAuthenticated,
      isSuperAdmin: authStore.isSuperAdmin,
      hasSelectedBusiness: authStore.hasSelectedBusiness,
    })

    // 4. 공개 페이지 접근
    if (isPublicPage) {
      // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 대시보드로
      if (['/login', '/register'].includes(to.path) && authStore.isAuthenticated) {
        console.log('✅ 이미 로그인됨 → /shop-admin/dashboard로 리다이렉트')
        return next('/shop-admin/dashboard')
      }
      console.log('✅ 공개 페이지 접근 허용')
      return next()
    }

    // 5. 인증 필요 페이지
    if (!authStore.isAuthenticated) {
      console.log('⛔ 인증 필요 → /login으로 리다이렉트')
      return next('/login')
    }

    // 6. 슈퍼관리자 전용 페이지
    if (isSuperAdminPage && !authStore.isSuperAdmin) {
      console.log('⛔ 슈퍼관리자 권한 필요 → /shop-admin/dashboard로 리다이렉트')
      return next('/shop-admin/dashboard')
    }

    // 7. 슈퍼관리자의 일반 관리자 페이지 접근 (매장 선택 필요)
    if (isShopAdminPage && !isSuperAdminPage &&
        authStore.isSuperAdmin && !authStore.hasSelectedBusiness) {
      console.log('⛔ 매장 선택 필요 → /shop-admin/super/dashboard로 리다이렉트')
      return next('/shop-admin/super/dashboard')
    }

    console.log('✅ 접근 허용')
    next()
  })
}
