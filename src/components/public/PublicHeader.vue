<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useWindowScroll } from '@vueuse/core'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customer-auth'

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()
const customerAuthStore = useCustomerAuthStore()
const mobileDrawer = ref(false)
const customerMenu = ref(false)

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

// 고객 로그인 상태
const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)

// 고객 표시 이름 (이름 또는 이메일 앞부분)
const customerDisplayName = computed(() => {
  if (customerAuthStore.customerName) return customerAuthStore.customerName
  if (customerAuthStore.customerEmail) return customerAuthStore.customerEmail.split('@')[0]
  return '고객'
})

// 고객 이니셜 (아바타용)
const customerInitial = computed(() => {
  return customerDisplayName.value.charAt(0).toUpperCase()
})

// 기본 네비게이션 메뉴
const defaultNavItems = [
  { title: '홈', to: '/', icon: 'ri-home-line' },
  { title: '기능', to: '/features', icon: 'ri-function-line' },
  { title: '요금제', to: '/pricing', icon: 'ri-price-tag-3-line' },
  { title: 'FAQ', to: '/faq', icon: 'ri-question-line' },
  { title: '지원', to: '/support', icon: 'ri-customer-service-line' },
]

// 예약 페이지 전용 네비게이션 (고객 로그인 시 추가 메뉴)
const bookingNavItems = computed(() => {
  const items = [
    { title: '매장 검색', to: '/booking', icon: 'ri-search-line' },
    { title: '예약 확인', to: '/booking/reservation', icon: 'ri-calendar-check-line' },
  ]
  if (customerAuthStore.isAuthenticated) {
    items.push({ title: '내 예약', to: '/booking/my-reservations', icon: 'ri-calendar-line' })
  }
  return items
})

const navItems = computed(() => isBookingPage.value ? bookingNavItems.value : defaultNavItems)

// Check if current route matches a nav item
const isActiveRoute = (to) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function navigateTo(path) {
  router.push(path)
  mobileDrawer.value = false
}

// 테마 토글
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
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
  customerMenu.value = false
  mobileDrawer.value = false
  customerAuthStore.logout()
  router.push('/booking')
}

// 고객 로그인 페이지로 이동
function goToCustomerLogin() {
  customerAuthStore.startKakaoLogin(route.fullPath)
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
          <h1 class="app-logo-title ms-2">
            {{ themeConfig.app.title }}
          </h1>
        </div>

        <!-- Desktop Navigation (center) - hidden on mobile -->
        <div class="d-none d-md-flex align-center header-nav">
          <VBtn
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            variant="text"
            class="nav-link-btn mx-1"
            :class="{ 'nav-link-active': isActiveRoute(item.to) }"
          >
            {{ item.title }}
          </VBtn>
        </div>

        <!-- Desktop Right Actions - hidden on mobile -->
        <div class="d-none d-md-flex align-center header-actions">
          <!-- Theme Toggle -->
          <VBtn
            icon
            variant="text"
            size="small"
            class="me-1"
            @click="toggleTheme"
          >
            <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
          </VBtn>

          <!-- === AUTH BRANCH: booking page + customer logged in === -->
          <template v-if="isBookingPage && isCustomerLoggedIn">
            <!-- Admin shortcut if also admin-logged-in -->
            <VBtn
              v-if="authStore.isAuthenticated"
              to="/shop-admin/dashboard"
              variant="text"
              class="mx-1"
              prepend-icon="ri-dashboard-line"
              size="small"
            >
              관리자
            </VBtn>

            <!-- Customer Profile Menu -->
            <VMenu v-model="customerMenu" :close-on-content-click="false">
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  variant="text"
                  class="ms-1"
                >
                  <VAvatar
                    size="32"
                    :image="customerAuthStore.profileImageUrl"
                    :color="customerAuthStore.profileImageUrl ? undefined : 'primary'"
                    class="me-2"
                  >
                    <span v-if="!customerAuthStore.profileImageUrl" class="text-caption font-weight-bold">
                      {{ customerInitial }}
                    </span>
                  </VAvatar>
                  <span class="text-body-2">{{ customerDisplayName }}</span>
                  <VIcon end size="18">
                    ri-arrow-down-s-line
                  </VIcon>
                </VBtn>
              </template>

              <VList min-width="200">
                <VListItem
                  prepend-icon="ri-user-line"
                  title="내 프로필"
                  @click="customerMenu = false; navigateTo('/booking/profile')"
                />
                <VListItem
                  prepend-icon="ri-calendar-line"
                  title="내 예약"
                  @click="customerMenu = false; navigateTo('/booking/my-reservations')"
                />
                <VDivider class="my-1" />
                <VListItem
                  prepend-icon="ri-logout-box-r-line"
                  title="로그아웃"
                  class="text-error"
                  @click="handleCustomerLogout"
                />
              </VList>
            </VMenu>
          </template>

          <!-- === AUTH BRANCH: booking page + customer NOT logged in === -->
          <template v-else-if="isBookingPage && !isCustomerLoggedIn">
            <!-- Admin controls if admin is logged in -->
            <template v-if="authStore.isAuthenticated">
              <VBtn
                to="/shop-admin/dashboard"
                variant="text"
                class="mx-1"
                prepend-icon="ri-dashboard-line"
              >
                관리자
              </VBtn>
              <VBtn
                color="error"
                variant="outlined"
                class="ms-2"
                prepend-icon="ri-logout-box-r-line"
                @click="handleLogout"
              >
                로그아웃
              </VBtn>
            </template>

            <!-- Customer Kakao Login -->
            <VBtn
              color="primary"
              variant="outlined"
              class="ms-2"
              prepend-icon="ri-kakao-talk-fill"
              @click="goToCustomerLogin"
            >
              고객 로그인
            </VBtn>
          </template>

          <!-- === AUTH BRANCH: normal pages (non-booking) === -->
          <template v-else>
            <template v-if="authStore.isAuthenticated">
              <VBtn
                to="/shop-admin/dashboard"
                variant="text"
                class="mx-1"
                prepend-icon="ri-dashboard-line"
              >
                관리자
              </VBtn>

              <VBtn
                color="error"
                variant="outlined"
                class="ms-2"
                prepend-icon="ri-logout-box-r-line"
                @click="handleLogout"
              >
                로그아웃
              </VBtn>
            </template>

            <template v-else>
              <VBtn
                to="/login"
                variant="text"
                class="mx-1"
              >
                로그인
              </VBtn>

              <VBtn
                to="/register"
                color="primary"
                variant="elevated"
                class="ms-2"
                prepend-icon="ri-rocket-line"
              >
                무료로 시작하기
              </VBtn>
            </template>
          </template>
        </div>

        <!-- Mobile Hamburger Button -->
        <VSpacer class="d-md-none" />
        <VBtn
          icon
          variant="text"
          class="d-md-none"
          @click="mobileDrawer = !mobileDrawer"
        >
          <VIcon icon="ri-menu-line" />
        </VBtn>
      </VContainer>
    </VAppBar>

    <!-- Mobile Navigation Drawer -->
    <VNavigationDrawer
      v-model="mobileDrawer"
      temporary
      location="end"
      width="280"
      class="public-mobile-drawer"
    >
      <!-- Close Button -->
      <div class="d-flex justify-end pa-2">
        <VBtn icon variant="text" size="small" @click="mobileDrawer = false">
          <VIcon icon="ri-close-line" />
        </VBtn>
      </div>

      <div class="px-4 pb-4">
        <!-- Logo -->
        <div class="d-flex align-center mb-4">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h2 class="app-logo-title ms-2">
            {{ themeConfig.app.title }}
          </h2>
        </div>

        <VDivider class="mb-4" />

        <!-- Nav Items -->
        <VList>
          <VListItem
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :active="isActiveRoute(item.to)"
            @click="navigateTo(item.to)"
          >
            <template #prepend>
              <VIcon :icon="item.icon" />
            </template>
            <VListItemTitle>{{ item.title }}</VListItemTitle>
          </VListItem>
        </VList>

        <VDivider class="my-4" />

        <!-- Theme Toggle -->
        <VListItem @click="toggleTheme">
          <template #prepend>
            <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
          </template>
          <VListItemTitle>
            {{ theme.global.current.value.dark ? '라이트 모드' : '다크 모드' }}
          </VListItemTitle>
        </VListItem>

        <VDivider class="my-4" />

        <!-- Auth Action Buttons -->
        <div class="d-flex flex-column gap-2">
          <!-- === MOBILE AUTH: booking page + customer logged in === -->
          <template v-if="isBookingPage && isCustomerLoggedIn">
            <!-- Customer Info -->
            <div class="d-flex align-center mb-2 px-2">
              <VAvatar
                size="36"
                :image="customerAuthStore.profileImageUrl"
                :color="customerAuthStore.profileImageUrl ? undefined : 'primary'"
                class="me-3"
              >
                <span v-if="!customerAuthStore.profileImageUrl" class="text-caption font-weight-bold">
                  {{ customerInitial }}
                </span>
              </VAvatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ customerDisplayName }}
                </div>
                <div v-if="customerAuthStore.customerEmail" class="text-caption text-medium-emphasis">
                  {{ customerAuthStore.customerEmail }}
                </div>
              </div>
            </div>

            <VDivider class="mb-2" />

            <VBtn
              block
              variant="outlined"
              prepend-icon="ri-user-line"
              @click="navigateTo('/booking/profile')"
            >
              내 프로필
            </VBtn>
            <VBtn
              block
              variant="outlined"
              prepend-icon="ri-calendar-line"
              @click="navigateTo('/booking/my-reservations')"
            >
              내 예약
            </VBtn>

            <!-- Admin shortcut if also admin-logged-in -->
            <VBtn
              v-if="authStore.isAuthenticated"
              block
              variant="outlined"
              prepend-icon="ri-dashboard-line"
              @click="navigateTo('/shop-admin/dashboard')"
            >
              관리자 페이지
            </VBtn>

            <VBtn
              block
              color="error"
              variant="outlined"
              prepend-icon="ri-logout-box-r-line"
              @click="handleCustomerLogout"
            >
              로그아웃
            </VBtn>
          </template>

          <!-- === MOBILE AUTH: booking page + customer NOT logged in === -->
          <template v-else-if="isBookingPage && !isCustomerLoggedIn">
            <!-- Admin controls if admin is logged in -->
            <template v-if="authStore.isAuthenticated">
              <VBtn
                block
                variant="outlined"
                prepend-icon="ri-dashboard-line"
                @click="navigateTo('/shop-admin/dashboard')"
              >
                관리자 페이지
              </VBtn>
              <VBtn
                block
                color="error"
                variant="outlined"
                prepend-icon="ri-logout-box-r-line"
                @click="handleLogout"
              >
                관리자 로그아웃
              </VBtn>
            </template>

            <VBtn
              block
              color="primary"
              prepend-icon="ri-kakao-talk-fill"
              @click="mobileDrawer = false; goToCustomerLogin()"
            >
              고객 로그인
            </VBtn>
          </template>

          <!-- === MOBILE AUTH: normal pages (non-booking) === -->
          <template v-else>
            <template v-if="authStore.isAuthenticated">
              <VBtn
                block
                variant="outlined"
                prepend-icon="ri-dashboard-line"
                @click="navigateTo('/shop-admin/dashboard')"
              >
                관리자 페이지
              </VBtn>
              <VBtn
                block
                color="error"
                variant="outlined"
                prepend-icon="ri-logout-box-r-line"
                @click="handleLogout"
              >
                로그아웃
              </VBtn>
            </template>

            <template v-else>
              <VBtn
                block
                variant="outlined"
                @click="navigateTo('/login')"
              >
                로그인
              </VBtn>
              <VBtn
                block
                color="primary"
                prepend-icon="ri-rocket-line"
                @click="navigateTo('/register')"
              >
                무료로 시작하기
              </VBtn>
            </template>
          </template>
        </div>
      </div>
    </VNavigationDrawer>
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

// Desktop: 3-column layout (logo-left, nav-center, actions-right)
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

// Nav link styling with active state and hover effects
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
