<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import HeaderDesktopNav from './HeaderDesktopNav.vue'
import HeaderMobileDrawer from './HeaderMobileDrawer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const customerAuthStore = useCustomerAuthStore()
const mobileDrawer = ref(false)

// Scroll detection
const { y: scrollY } = useWindowScroll()
const isScrolled = computed(() => scrollY.value > 20)

// Navbar background style based on scroll
const navbarBgStyle = computed(() => ({
  backgroundColor: isScrolled.value
    ? 'rgb(var(--v-theme-surface))'
    : 'rgba(var(--v-theme-surface), 0.78)',
  backdropFilter: 'blur(6px)',
  transition: 'all 0.3s ease',
}))

// booking 경로 여부 판별
const isBookingPage = computed(() => route.path.startsWith('/booking'))

// 기본 네비게이션 메뉴
const defaultNavItems = [
  { title: '홈', to: '/', icon: 'ri-home-line' },
  { title: '기능', to: '/features', icon: 'ri-function-line' },
  { title: '요금제', to: '/pricing', icon: 'ri-price-tag-3-line' },
  { title: 'FAQ', to: '/faq', icon: 'ri-question-line' },
  { title: '지원', to: '/support', icon: 'ri-customer-service-line' },
]

// 예약 페이지 전용 네비게이션
const bookingNavItems = computed(() => {
  const items = [
    { title: '매장 검색', to: '/booking', icon: 'ri-search-line' },
  ]
  if (customerAuthStore.isAuthenticated) {
    items.push({ title: '내 예약', to: '/booking/my-reservations', icon: 'ri-calendar-line' })
  } else {
    items.push({ title: '예약 조회', to: '/booking/reservation', icon: 'ri-calendar-check-line' })
  }
  return items
})

const navItems = computed(() => isBookingPage.value ? bookingNavItems.value : defaultNavItems)

function navigateTo(path) {
  router.push(path)
  mobileDrawer.value = false
}

// 관리자 로그아웃
async function handleLogout() {
  mobileDrawer.value = false
  try {
    await authStore.logout()
  }
  catch (error) {
    router.push('/')
  }
}

// 고객 로그아웃
function handleCustomerLogout() {
  mobileDrawer.value = false
  customerAuthStore.logout()
  router.push('/booking')
}

// 고객 소셜 로그인
function handleProviderLogin(provider) {
  mobileDrawer.value = false
  customerAuthStore.startSocialLogin(provider, route.fullPath)
}
</script>

<template>
  <div class="front-page-navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <VAppBar
      :elevation="0"
      height="64"
      class="rounded-b-lg"
      :style="navbarBgStyle"
    >
      <VContainer fluid class="header-container d-flex align-center px-4 px-sm-6">
        <!-- Logo (left) -->
        <div
          class="app-logo d-flex align-center cursor-pointer header-logo"
          @click="navigateTo('/')"
        >
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <span class="app-logo-title ms-2">
            {{ themeConfig.app.title }}
          </span>
        </div>

        <!-- Desktop Navigation + Actions -->
        <HeaderDesktopNav
          :nav-items="navItems"
          :is-booking-page="isBookingPage"
          @navigate="navigateTo"
          @logout="handleLogout"
          @customer-logout="handleCustomerLogout"
          @provider-login="handleProviderLogin"
        />

        <!-- Mobile Hamburger Button -->
        <VSpacer class="d-md-none" />
        <VBtn
          icon
          variant="text"
          class="d-md-none"
          :aria-label="mobileDrawer ? '메뉴 닫기' : '메뉴 열기'"
          @click="mobileDrawer = !mobileDrawer"
        >
          <VIcon icon="ri-menu-line" />
        </VBtn>
      </VContainer>
    </VAppBar>

    <!-- Mobile Navigation Drawer -->
    <HeaderMobileDrawer
      v-model="mobileDrawer"
      :nav-items="navItems"
      :is-booking-page="isBookingPage"
      @navigate="navigateTo"
      @logout="handleLogout"
      @customer-logout="handleCustomerLogout"
      @provider-login="handleProviderLogin"
    />
  </div>
</template>

<style lang="scss" scoped>
.front-page-navbar {
  position: sticky;
  inset-block-start: 0;
  z-index: 1000;

  :deep(.v-toolbar) {
    transition: all 0.3s ease;
  }

  &.navbar-scrolled {
    :deep(.v-toolbar) {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    }
  }
}

.header-container {
  position: relative;
}

.header-logo {
  flex-shrink: 0;
}

.header-nav {
  position: absolute;
  inset-inline-start: 50%;
  transform: translateX(-50%);
}

.header-actions {
  margin-inline-start: auto;
  flex-shrink: 0;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;

  &-title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    margin: 0;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.nav-link-btn {
  font-weight: 500;
  letter-spacing: 0.015em;
  transition: opacity 0.2s ease, color 0.2s ease;
  opacity: 0.78;

  &:hover {
    opacity: 1;
  }

  &.nav-link-active {
    opacity: 1;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
  }
}
</style>
