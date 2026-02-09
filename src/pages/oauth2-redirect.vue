<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-8 text-center" max-width="500" width="100%">
      <VCardText>
        <!-- 로딩 스피너 -->
        <div v-if="!error">
          <VProgressCircular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          />
          <h3 class="text-h5 mb-2">로그인 처리 중...</h3>
          <p class="text-body-2 text-medium-emphasis">
            잠시만 기다려주세요.
          </p>
        </div>

        <!-- 에러 -->
        <div v-else>
          <VIcon
            icon="ri-error-warning-line"
            size="64"
            color="error"
            class="mb-4"
          />
          <h3 class="text-h5 mb-2">로그인 실패</h3>
          <p class="text-body-1 text-error mb-4">
            {{ errorMessage }}
          </p>
          <VBtn
            color="primary"
            size="large"
            @click="router.push('/login')"
          >
            로그인 페이지로 돌아가기
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
  public: true
</route>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const error = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  // URL에서 쿼리 파라미터 추출
  const { accessToken, refreshToken, error: errorParam, message } = route.query

  // 에러가 있는 경우
  if (errorParam) {
    error.value = true
    errorMessage.value = message || 'SNS 로그인에 실패했습니다.'
    console.error('OAuth2 로그인 실패:', errorParam, message)
    return
  }

  // 토큰이 없는 경우
  if (!accessToken || !refreshToken) {
    error.value = true
    errorMessage.value = '로그인 정보를 받지 못했습니다.'
    console.error('토큰이 없습니다:', { accessToken, refreshToken })
    return
  }

  try {
    // 토큰을 localStorage에 저장
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    // store에 토큰 저장
    authStore.accessToken = accessToken
    authStore.refreshToken = refreshToken

    // 사용자 정보 가져오기
    await authStore.fetchCurrentUser()

    // 대시보드로 이동
    router.push('/')
  }
  catch (err) {
    error.value = true
    errorMessage.value = '사용자 정보를 가져오는 데 실패했습니다.'
    console.error('사용자 정보 가져오기 실패:', err)
  }
})
</script>

<style scoped>
.auth-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-block-size: 100vh;
}

.auth-card {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 10%);
}
</style>
