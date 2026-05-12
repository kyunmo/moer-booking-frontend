<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import YBtn from '@/components/yemo/YBtn.vue'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customer-auth'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: '로그인 처리 중 — YEMO',
  },
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const customerAuthStore = useCustomerAuthStore()

const error = ref(false)
const errorMessage = ref('')
const isCustomer = ref(false)

const loginRedirectPath = computed(() => isCustomer.value ? '/login?role=customer' : '/login?role=admin')

async function handleCustomerLogin(accessToken, refreshToken, isNewUser) {
  customerAuthStore.handleOAuthCallback(accessToken, refreshToken, isNewUser)
  await customerAuthStore.fetchProfile()

  const redirectPath = customerAuthStore.consumeRedirectPath()

  if (customerAuthStore.isNewUser) {
    router.push({
      path: '/booking/profile',
      query: redirectPath ? { redirectAfter: redirectPath } : {},
    })
    return
  }

  router.push(redirectPath || '/booking')
}

async function handleAdminLogin(accessToken, refreshToken, isNewUser) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)

  authStore.accessToken = accessToken
  authStore.refreshToken = refreshToken

  await authStore.fetchCurrentUser()

  if (isNewUser === 'true') {
    router.push('/shop-admin/setup')
  }
  else {
    router.push('/shop-admin/dashboard')
  }
}

onMounted(async () => {
  const {
    accessToken,
    refreshToken,
    isNewUser,
    loginType,
    error: errorParam,
    message,
  } = route.query

  isCustomer.value = loginType === 'customer'

  if (errorParam) {
    error.value = true
    errorMessage.value = message || '소셜 로그인에 실패했습니다. 다시 시도해주세요.'
    return
  }

  if (!accessToken || !refreshToken) {
    error.value = true
    errorMessage.value = '로그인 정보를 받지 못했습니다.'
    return
  }

  try {
    if (isCustomer.value) {
      await handleCustomerLogin(accessToken, refreshToken, isNewUser)
    }
    else {
      await handleAdminLogin(accessToken, refreshToken, isNewUser)
    }
  }
  catch (err) {
    error.value = true
    errorMessage.value = '사용자 정보를 가져오는 데 실패했습니다.'
  }
})
</script>

<template>
  <div class="oauth">
    <div class="oauth__panel">
      <div v-if="!error" class="oauth__loading">
        <Icon icon="ph:circle-notch" class="oauth__spinner" aria-hidden="true" />
        <h1 class="t-title-md t-strong">로그인 처리 중</h1>
        <p class="t-body-sm t-muted">잠시만 기다려주세요…</p>
      </div>
      <div v-else class="oauth__error">
        <Icon icon="ph:warning-circle" aria-hidden="true" />
        <h1 class="t-title-md t-strong">로그인에 실패했습니다</h1>
        <p class="t-body-sm t-muted">{{ errorMessage }}</p>
        <YBtn variant="primary" size="lg" @click="router.push(loginRedirectPath)">
          로그인 페이지로
        </YBtn>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.oauth {
  display: flex; justify-content: center; align-items: center;
  min-height: 60vh;
  padding: 64px 16px;
}
.oauth__panel {
  text-align: center;
  display: flex; flex-direction: column; gap: 12px; align-items: center;
}
.oauth__loading, .oauth__error {
  display: flex; flex-direction: column; gap: 12px; align-items: center;
}
.oauth__loading svg, .oauth__error svg { width: 48px; height: 48px; color: var(--y-accent-deep); }
.oauth__spinner { animation: oauth-spin 1s linear infinite; }
.oauth__error svg { color: var(--y-danger); }
@keyframes oauth-spin { to { transform: rotate(360deg); } }
</style>
