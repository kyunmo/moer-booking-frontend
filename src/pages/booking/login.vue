<route lang="yaml">
meta:
  layout: public
  public: true
  title: 로그인 - YEMO
</route>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customer-auth'

const route = useRoute()
const router = useRouter()
const customerAuthStore = useCustomerAuthStore()

// URL 쿼리에서 redirect 경로 추출
const redirectPath = computed(() => route.query.redirect || '/booking')

// 비회원 예약 경로 계산: redirect에 /reserve가 포함되면 해당 경로로, 아니면 null
const guestReservePath = computed(() => {
  const redirect = route.query.redirect || ''
  if (redirect.includes('/reserve')) {
    return redirect
  }

  // redirect에서 slug 추출 시도 (/booking/slug-name 패턴)
  const match = redirect.match(/^\/booking\/([^/]+)/)
  if (match) {
    return `/booking/${match[1]}/reserve`
  }

  return null
})

// 이미 로그인된 경우 redirect 경로로 이동
onMounted(() => {
  if (customerAuthStore.isAuthenticated) {
    router.replace(redirectPath.value)
  }
})

// 카카오 로그인
function handleKakaoLogin() {
  customerAuthStore.startKakaoLogin(redirectPath.value)
}

// 매장 검색으로 돌아가기
function goToSearch() {
  router.push('/booking')
}
</script>

<template>
  <div class="customer-login-page d-flex align-center justify-center">
    <VContainer style="max-inline-size: 440px;">
          <VCard
            class="login-card pa-6 pa-sm-8"
            rounded="xl"
            elevation="4"
          >
            <!-- 로고 아이콘 -->
            <div class="text-center mb-6">
              <VAvatar
                size="72"
                color="primary"
                variant="tonal"
                class="mb-4"
              >
                <VIcon
                  icon="ri-calendar-check-line"
                  size="36"
                />
              </VAvatar>

              <h1 class="text-h5 font-weight-bold mb-2">
                YEMO
              </h1>

              <p class="text-body-1 text-medium-emphasis mb-0">
                예약을 위해 로그인이 필요합니다
              </p>
            </div>

            <VDivider class="mb-6" />

            <!-- 카카오 로그인 버튼 -->
            <VBtn
              block
              size="large"
              class="kakao-login-btn mb-4"
              height="52"
              @click="handleKakaoLogin"
            >
              <svg
                class="me-2"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2C5.029 2 1 5.216 1 9.156c0 2.548 1.694 4.79 4.243 6.053-.187.697-.677 2.527-.776 2.918-.122.486.178.48.375.35.154-.103 2.46-1.675 3.455-2.355.557.08 1.13.122 1.703.122 4.971 0 9-3.216 9-7.088C19 5.216 14.971 2 10 2z"
                  fill="#191919"
                />
              </svg>
              카카오로 시작하기
            </VBtn>

            <!-- 안내 문구 -->
            <p class="text-body-2 text-medium-emphasis text-center mb-6">
              카카오 계정으로 간편하게 로그인하고<br>
              예약 내역을 관리할 수 있습니다
            </p>

            <VDivider class="mb-4" />

            <!-- 하단 링크 -->
            <div class="d-flex flex-column align-center ga-3">
              <!-- 비회원 예약 링크 -->
              <RouterLink
                v-if="guestReservePath"
                :to="guestReservePath"
                class="text-body-2 text-primary text-decoration-none"
              >
                비회원으로 예약하기
              </RouterLink>

              <!-- 매장 검색으로 돌아가기 -->
              <a
                href="javascript:void(0)"
                class="text-body-2 text-medium-emphasis text-decoration-none"
                @click="goToSearch"
              >
                <VIcon
                  icon="ri-arrow-left-s-line"
                  size="16"
                  class="me-1"
                />
                매장 검색으로 돌아가기
              </a>
            </div>
          </VCard>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.customer-login-page {
  min-block-size: calc(100vh - 64px);
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.03) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

.login-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.kakao-login-btn {
  background-color: #FEE500 !important;
  color: #191919 !important;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: -0.02em;
  border-radius: 8px !important;
  text-transform: none;

  &:hover {
    background-color: #F5DC00 !important;
  }
}
</style>
