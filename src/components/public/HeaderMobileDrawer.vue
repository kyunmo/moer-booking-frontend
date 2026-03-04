<script setup>
import { useTheme } from 'vuetify'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customer-auth'

defineProps({
  navItems: { type: Array, required: true },
  isBookingPage: { type: Boolean, default: false },
})

const emit = defineEmits(['navigate', 'logout', 'customer-logout', 'provider-login'])

const modelValue = defineModel({ type: Boolean, default: false })

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

const isActiveRoute = (to) => {
  const route = useRoute()

  if (to === '/') return route.path === '/'

  return route.path.startsWith(to)
}

function navigateTo(path) {
  emit('navigate', path)
  modelValue.value = false
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<template>
  <Teleport to="body">
    <VNavigationDrawer
      v-model="modelValue"
      temporary
      location="end"
      width="280"
      class="public-mobile-drawer"
    >
      <!-- Close Button -->
      <div class="d-flex justify-end pa-2">
        <VBtn icon variant="text" size="small" aria-label="메뉴 닫기" @click="modelValue = false">
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

            <VBtn block variant="outlined" prepend-icon="ri-user-line" @click="navigateTo('/booking/profile')">
              내 프로필
            </VBtn>
            <VBtn block variant="outlined" prepend-icon="ri-calendar-line" @click="navigateTo('/booking/my-reservations')">
              내 예약
            </VBtn>
            <VBtn block variant="outlined" prepend-icon="ri-chat-3-line" @click="navigateTo('/booking/my-reviews')">
              내 리뷰
            </VBtn>

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
              @click="emit('customer-logout')"
            >
              로그아웃
            </VBtn>
          </template>

          <!-- === MOBILE AUTH: booking page + customer NOT logged in === -->
          <template v-else-if="isBookingPage && !isCustomerLoggedIn">
            <template v-if="authStore.isAuthenticated">
              <VBtn block variant="outlined" prepend-icon="ri-dashboard-line" @click="navigateTo('/shop-admin/dashboard')">
                관리자 페이지
              </VBtn>
              <VBtn block color="error" variant="outlined" prepend-icon="ri-logout-box-r-line" @click="emit('logout')">
                관리자 로그아웃
              </VBtn>
            </template>

            <VBtn block variant="outlined" class="mb-2" prepend-icon="ri-calendar-check-line" @click="navigateTo('/booking/reservation')">
              예약 조회
            </VBtn>

            <VBtn block class="kakao-mobile-btn mb-2" prepend-icon="ri-kakao-talk-fill" @click="emit('provider-login', 'kakao')">
              카카오 로그인
            </VBtn>
            <VBtn block color="success" variant="outlined" class="mb-2" prepend-icon="ri-global-line" @click="emit('provider-login', 'naver')">
              네이버 로그인
            </VBtn>
            <VBtn block variant="outlined" prepend-icon="ri-google-fill" @click="emit('provider-login', 'google')">
              구글 로그인
            </VBtn>
          </template>

          <!-- === MOBILE AUTH: normal pages (non-booking) === -->
          <template v-else>
            <template v-if="authStore.isAuthenticated">
              <VBtn block variant="outlined" prepend-icon="ri-dashboard-line" @click="navigateTo('/shop-admin/dashboard')">
                관리자 페이지
              </VBtn>
              <VBtn block color="error" variant="outlined" prepend-icon="ri-logout-box-r-line" @click="emit('logout')">
                로그아웃
              </VBtn>
            </template>

            <template v-else>
              <VBtn block variant="outlined" @click="navigateTo('/login')">
                로그인
              </VBtn>
              <VBtn block color="primary" prepend-icon="ri-rocket-line" @click="navigateTo('/register')">
                무료로 시작하기
              </VBtn>
            </template>
          </template>
        </div>
      </div>
    </VNavigationDrawer>
  </Teleport>
</template>

<style lang="scss" scoped>
.public-mobile-drawer {
  z-index: 2000 !important;
}

.kakao-mobile-btn {
  background-color: #FEE500 !important;
  color: #191919 !important;
}

.app-logo-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
}
</style>
