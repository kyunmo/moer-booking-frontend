<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4" max-width="500" width="100%">
      <VCardText>
        <!-- 로고 -->
        <div class="text-center mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            moer
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            예약 관리 시스템
          </p>
        </div>

        <!-- 로그인 폼 -->
        <VForm ref="formRef" @submit.prevent="handleLogin">
          <VRow>
            <!-- 이메일 -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="이메일"
                type="email"
                prepend-inner-icon="ri-mail-line"
                placeholder="your@email.com"
                :rules="[required, emailRule]"
                required
              />
            </VCol>

            <!-- 비밀번호 -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="비밀번호"
                :type="isPasswordVisible ? 'text' : 'password'"
                prepend-inner-icon="ri-lock-line"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                placeholder="••••••••"
                :rules="[required]"
                required
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <!-- 로그인 유지 & 비밀번호 찾기 -->
            <VCol cols="12" class="d-flex align-center justify-space-between">
              <VCheckbox
                v-model="form.rememberMe"
                label="로그인 유지"
                hide-details
                density="compact"
              />

              <a
                href="javascript:void(0)"
                class="text-primary text-decoration-none"
                @click="showForgotPassword"
              >
                비밀번호 찾기
              </a>
            </VCol>

            <!-- 에러 메시지 -->
            <VCol v-if="errorMessage" cols="12">
              <VAlert
                type="error"
                variant="tonal"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </VAlert>
            </VCol>

            <!-- 로그인 버튼 -->
            <VCol cols="12">
              <VBtn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.loading"
              >
                로그인
              </VBtn>
            </VCol>

            <!-- 회원가입 링크 -->
            <VCol cols="12" class="text-center">
              <span class="text-body-2">계정이 없으신가요?</span>
              <a
                href="javascript:void(0)"
                class="text-primary text-decoration-none ms-1"
                @click="showRegister"
              >
                회원가입
              </a>
            </VCol>
          </VRow>
        </VForm>

        <!-- 구분선 -->
        <div class="d-flex align-center gap-2 my-6">
          <VDivider />
          <span class="text-body-2 text-disabled">또는</span>
          <VDivider />
        </div>

        <!-- 개발용: 빠른 로그인 -->
        <VCard variant="tonal" color="info" class="pa-3">
          <div class="text-body-2 text-center mb-2">
            <VIcon icon="ri-information-line" size="18" class="me-1" />
            개발용 테스트 계정
          </div>
          <VBtn
            variant="outlined"
            color="info"
            size="small"
            block
            @click="quickLogin"
          >
            테스트 계정으로 로그인
          </VBtn>
        </VCard>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
// 레이아웃 없이 표시 (전체 화면)
defineOptions({
  layout: false,
})

import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const isPasswordVisible = ref(false)
const errorMessage = ref('')

const form = ref({
  email: '',
  password: '',
  rememberMe: false,
})

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const emailRule = value => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || '올바른 이메일 형식이 아닙니다.'
}

// 로그인 처리
async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  errorMessage.value = ''

  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    })

    // 로그인 성공 시 대시보드로 이동
    router.push('/')
  }
  catch (error) {
    console.error('로그인 실패:', error)
    errorMessage.value = error || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
  }
}

// 테스트 계정으로 빠른 로그인
function quickLogin() {
  form.value.email = 'admin@moer.io'
  form.value.password = 'password123'
  handleLogin()
}

// 비밀번호 찾기
function showForgotPassword() {
  alert('비밀번호 찾기 기능은 곧 구현됩니다.')
}

// 회원가입
function showRegister() {
  router.push('/register')
}
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
