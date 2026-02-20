import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { updateSeoMeta, updateStructuredData } from '@/composables/useSeoMeta'

export function setupRouterGuards(router) {
  let isInitialized = false

  // SEO: 라우트 전환 시 메타 태그 동적 업데이트
  router.afterEach(to => {
    updateSeoMeta(to)
    updateStructuredData(to)
  })

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const customerAuthStore = useCustomerAuthStore()

    // 1. 인증 초기화
    if (!isInitialized) {
      await Promise.all([
        authStore.initialize(),
        customerAuthStore.initialize(),
      ])
      isInitialized = true
    }

    // 2. 공개 페이지 체크 (메타 정보 우선)
    const isPublicPage = to.meta.public === true

    // 3. 관리자/슈퍼관리자 페이지 체크
    const isShopAdminPage = to.path.startsWith('/shop-admin')
    const isSuperAdminPage = to.path.startsWith('/shop-admin/super')

    // 4. 공개 페이지 접근
    if (isPublicPage) {
      // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 대시보드로
      if (['/login', '/register'].includes(to.path) && authStore.isAuthenticated) {
        return next('/shop-admin/dashboard')
      }

      // 고객 인증 필요 페이지 체크
      if (to.meta.requiresCustomerAuth && !customerAuthStore.isAuthenticated) {
        return next(`/booking/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // 신규 고객 전화번호 미등록 시 프로필 페이지로 강제 리다이렉트
      // (프로필 페이지 자체는 접근 허용하여 무한 리다이렉트 방지)
      if (
        to.meta.requiresCustomerAuth
        && customerAuthStore.isAuthenticated
        && customerAuthStore.isNewUser
        && !customerAuthStore.hasPhone
        && to.path !== '/booking/profile'
      ) {
        return next({
          path: '/booking/profile',
          query: { redirectAfter: to.fullPath },
        })
      }

      return next()
    }

    // 5. 인증 필요 페이지
    if (!authStore.isAuthenticated) {
      return next('/login')
    }

    // 6. 슈퍼관리자 전용 페이지
    if (isSuperAdminPage && !authStore.isSuperAdmin) {
      return next('/shop-admin/dashboard')
    }

    // 7. 슈퍼관리자의 일반 관리자 페이지 접근 (매장 선택 필요)
    if (isShopAdminPage && !isSuperAdminPage &&
        authStore.isSuperAdmin && !authStore.hasSelectedBusiness) {
      return next('/shop-admin/super/dashboard')
    }

    next()
  })
}
