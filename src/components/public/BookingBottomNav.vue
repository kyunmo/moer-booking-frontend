<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customer-auth'

const route = useRoute()
const router = useRouter()
const customerAuthStore = useCustomerAuthStore()

// booking 페이지인지 판별
const isBookingPage = computed(() => route.path.startsWith('/booking'))

// 하단 네비게이션을 숨겨야 하는 페이지 (예약 플로우, 로그인 페이지)
const isHiddenPage = computed(() => {
  const path = route.path
  return path.includes('/reserve') || path === '/booking/login'
})

// 하단 네비게이션 표시 여부
const showBottomNav = computed(() => isBookingPage.value && !isHiddenPage.value)

// 현재 활성 탭 (route path 기준)
const activeTab = computed(() => {
  const path = route.path
  if (path === '/booking/my-reservations') return 'my-reservations'
  if (path === '/booking/reservation') return 'reservation-lookup'
  if (path === '/booking/profile') return 'profile'

  // /booking 또는 /booking/[slug] 등은 검색 탭으로
  return 'search'
})

// 고객 로그인 상태
const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)

// 탭 클릭 핸들러 - 보호된 페이지는 로그인 체크
function handleTabClick(tabPath) {
  const protectedPaths = ['/booking/my-reservations', '/booking/profile']
  if (protectedPaths.includes(tabPath) && !isCustomerLoggedIn.value) {
    router.push(`/booking/login?redirect=${encodeURIComponent(tabPath)}`)
  } else {
    router.push(tabPath)
  }
}
</script>

<template>
  <VBottomNavigation
    v-if="showBottomNav"
    :model-value="activeTab"
    grow
    color="primary"
    class="booking-bottom-nav d-sm-none"
    role="navigation"
    aria-label="하단 네비게이션"
  >
    <VBtn
      value="search"
      @click="handleTabClick('/booking')"
    >
      <VIcon>ri-search-line</VIcon>
      <span>검색</span>
    </VBtn>

    <!-- 로그인 상태: 내 예약 -->
    <VBtn
      v-if="isCustomerLoggedIn"
      value="my-reservations"
      @click="handleTabClick('/booking/my-reservations')"
    >
      <VIcon>ri-calendar-line</VIcon>
      <span>내 예약</span>
    </VBtn>

    <!-- 비로그인 상태: 예약 확인 (전화번호 조회) -->
    <VBtn
      v-else
      value="reservation-lookup"
      @click="handleTabClick('/booking/reservation')"
    >
      <VIcon>ri-calendar-check-line</VIcon>
      <span>예약확인</span>
    </VBtn>

    <VBtn
      value="profile"
      @click="handleTabClick('/booking/profile')"
    >
      <VIcon>ri-user-line</VIcon>
      <span>프로필</span>
    </VBtn>
  </VBottomNavigation>
</template>

<style lang="scss" scoped>
.booking-bottom-nav {
  position: fixed !important;
  z-index: 99;
}
</style>
