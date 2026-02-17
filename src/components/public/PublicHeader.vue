<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
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
    console.error('로그아웃 실패:', error)
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
  <VAppBar
    elevation="0"
    :border="true"
    class="public-header"
  >
    <VContainer fluid class="header-container d-flex align-center px-4 px-sm-6">
      <!-- 로고 (왼쪽) -->
      <div
        class="app-logo d-flex align-center cursor-pointer header-logo"
        @click="navigateTo('/')"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="app-logo-title ms-2">
          {{ themeConfig.app.title }}
        </h1>
      </div>

      <!-- 데스크톱 네비게이션 (가운데) -->
      <div class="d-none d-md-flex align-center header-nav">
        <VBtn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          variant="text"
          class="mx-1"
        >
          {{ item.title }}
        </VBtn>
      </div>

      <!-- 우측 액션 영역 -->
      <div class="d-none d-md-flex align-center header-actions">
        <!-- 테마 전환 -->
        <VBtn
          icon
          variant="text"
          @click="toggleTheme"
        >
          <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
        </VBtn>

        <!-- booking 페이지 + 고객 로그인 상태 -->
        <template v-if="isBookingPage && isCustomerLoggedIn">
          <!-- 관리자도 로그인된 경우 관리자 바로가기 -->
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

          <!-- 고객 프로필 메뉴 -->
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

        <!-- booking 페이지 + 고객 미로그인 -->
        <template v-else-if="isBookingPage && !isCustomerLoggedIn">
          <!-- 관리자 로그인 상태이면 관리자 메뉴 유지 -->
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

          <!-- 고객 로그인 버튼 -->
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

        <!-- 일반 페이지 (non-booking) -->
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
              class="ms-2"
            >
              무료로 시작하기
            </VBtn>
          </template>
        </template>
      </div>

      <!-- 모바일 메뉴 버튼 -->
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

  <!-- 모바일 네비게이션 드로어 -->
  <VNavigationDrawer
    v-model="mobileDrawer"
    temporary
    location="end"
    class="public-mobile-drawer"
  >
    <div class="pa-4">
      <!-- 로고 -->
      <div class="d-flex align-center mb-6">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h2 class="app-logo-title ms-2">
          {{ themeConfig.app.title }}
        </h2>
      </div>

      <VDivider class="mb-4" />

      <!-- 메뉴 아이템 -->
      <VList>
        <VListItem
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="navigateTo(item.to)"
        >
          <template #prepend>
            <VIcon :icon="item.icon" />
          </template>
          <VListItemTitle>{{ item.title }}</VListItemTitle>
        </VListItem>
      </VList>

      <VDivider class="my-4" />

      <!-- 테마 전환 -->
      <VListItem @click="toggleTheme">
        <template #prepend>
          <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
        </template>
        <VListItemTitle>
          {{ theme.global.current.value.dark ? '라이트 모드' : '다크 모드' }}
        </VListItemTitle>
      </VListItem>

      <VDivider class="my-4" />

      <!-- CTA 버튼들 -->
      <div class="d-flex flex-column gap-2">
        <!-- booking 페이지 + 고객 로그인 상태 -->
        <template v-if="isBookingPage && isCustomerLoggedIn">
          <!-- 고객 정보 -->
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

          <!-- 관리자도 로그인된 경우 -->
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

        <!-- booking 페이지 + 고객 미로그인 -->
        <template v-else-if="isBookingPage && !isCustomerLoggedIn">
          <!-- 관리자 로그인 상태 -->
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

        <!-- 일반 페이지 (non-booking) -->
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
              @click="navigateTo('/register')"
            >
              무료로 시작하기
            </VBtn>
          </template>
        </template>
      </div>
    </div>
  </VNavigationDrawer>
</template>

<style lang="scss" scoped>
.public-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.header-container {
  position: relative;
}

// 데스크톱: 3분할 레이아웃 (로고-왼, 메뉴-중앙, 액션-우)
.header-logo {
  flex-shrink: 0;
}

.header-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-actions {
  margin-left: auto;
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
</style>
