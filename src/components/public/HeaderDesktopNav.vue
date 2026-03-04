<script setup>
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customer-auth'

defineProps({
  navItems: { type: Array, required: true },
  isBookingPage: { type: Boolean, default: false },
})

const emit = defineEmits(['navigate', 'logout', 'customer-logout', 'provider-login'])

const theme = useTheme()
const authStore = useAuthStore()
const customerAuthStore = useCustomerAuthStore()

const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)

const customerDisplayName = computed(() => {
  if (customerAuthStore.customerName) return customerAuthStore.customerName
  if (customerAuthStore.customerEmail) return customerAuthStore.customerEmail.split('@')[0]
  return '고객'
})

const customerInitial = computed(() => {
  return customerDisplayName.value.charAt(0).toUpperCase()
})

const customerMenu = ref(false)

const isActiveRoute = (to) => {
  const route = useRoute()

  if (to === '/') return route.path === '/'

  return route.path.startsWith(to)
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<template>
  <div class="d-none d-md-flex align-center header-actions">
    <!-- Theme Toggle -->
    <VBtn
      icon
      variant="text"
      size="small"
      class="me-1"
      :aria-label="theme.global.current.value.dark ? '라이트 모드로 전환' : '다크 모드로 전환'"
      @click="toggleTheme"
    >
      <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
    </VBtn>

    <!-- === AUTH BRANCH: booking page + customer logged in === -->
    <template v-if="isBookingPage && isCustomerLoggedIn">
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
            @click="customerMenu = false; emit('navigate', '/booking/profile')"
          />
          <VListItem
            prepend-icon="ri-calendar-line"
            title="내 예약"
            @click="customerMenu = false; emit('navigate', '/booking/my-reservations')"
          />
          <VListItem
            prepend-icon="ri-chat-3-line"
            title="내 리뷰"
            @click="customerMenu = false; emit('navigate', '/booking/my-reviews')"
          />
          <VDivider class="my-1" />
          <VListItem
            prepend-icon="ri-logout-box-r-line"
            title="로그아웃"
            class="text-error"
            @click="emit('customer-logout')"
          />
        </VList>
      </VMenu>
    </template>

    <!-- === AUTH BRANCH: booking page + customer NOT logged in === -->
    <template v-else-if="isBookingPage && !isCustomerLoggedIn">
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
          @click="emit('logout')"
        >
          로그아웃
        </VBtn>
      </template>

      <VBtn
        variant="text"
        class="ms-1"
        prepend-icon="ri-calendar-check-line"
        @click="emit('navigate', '/booking/reservation')"
      >
        예약 조회
      </VBtn>

      <VMenu>
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            color="primary"
            variant="outlined"
            class="ms-2"
            prepend-icon="ri-login-box-line"
          >
            고객 로그인
          </VBtn>
        </template>
        <VList min-width="200">
          <VListItem
            prepend-icon="ri-kakao-talk-fill"
            title="카카오 로그인"
            @click="emit('provider-login', 'kakao')"
          />
          <VListItem
            prepend-icon="ri-global-line"
            title="네이버 로그인"
            @click="emit('provider-login', 'naver')"
          />
          <VListItem
            prepend-icon="ri-google-fill"
            title="구글 로그인"
            @click="emit('provider-login', 'google')"
          />
        </VList>
      </VMenu>
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
          @click="emit('logout')"
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

  <!-- Desktop Navigation (center) -->
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
</template>
