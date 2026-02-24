<route lang="yaml">
meta:
  layout: blank
  public: true
  title: 로그인 - 모에르(MOER)
  description: 모에르(MOER) 관리자 로그인 페이지입니다.
</route>

<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { useAuthStore } from '@/stores/auth'
import authV1LoginMaskDark from '@images/pages/auth-v1-login-mask-dark.png'
import authV1LoginMaskLight from '@images/pages/auth-v1-login-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { OAUTH_BASE_URL } from '@/utils/oauth'
import { computed, ref } from 'vue'
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

const authV1ThemeLoginMask = useGenerateImageVariant(authV1LoginMaskLight, authV1LoginMaskDark)

// 테스트 계정: 개발 환경이면서 환경변수가 설정된 경우에만 표시
const testEmail = import.meta.env.VITE_TEST_EMAIL
const testPassword = import.meta.env.VITE_TEST_PASSWORD
const showTestAccount = computed(() => import.meta.env.DEV && !!testEmail && !!testPassword)

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
    router.push('/shop-admin/dashboard')
  }
  catch (error) {
    errorMessage.value = error?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
  }
}

// 테스트 계정으로 빠른 로그인 (환경변수 필수)
function quickLogin() {
  if (!testEmail || !testPassword) return
  form.value.email = testEmail
  form.value.password = testPassword
  handleLogin()
}

// SNS 로그인
function handleGoogleLogin() {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorize/google?loginType=admin`
}

function handleNaverLogin() {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorize/naver?loginType=admin`
}

function handleKakaoLogin() {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorize/kakao?loginType=admin`
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-1 pa-sm-7"
      max-width="448"
    >
      <!-- 로고 -->
      <VCardItem class="justify-center pb-6">
        <VCardTitle>
          <RouterLink to="/" class="app-logo text-decoration-none">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="app-logo-title">
              {{ themeConfig.app.title }}
            </h1>
          </RouterLink>
        </VCardTitle>
      </VCardItem>

      <!-- 환영 메시지 -->
      <VCardText>
        <h4 class="text-h4 mb-1">
          Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}! 👋🏻</span>
        </h4>

        <p class="mb-0">
          예약 관리를 쉽고 간편하게 시작하세요
        </p>
      </VCardText>

      <!-- 30일 체험판 안내 -->
      <VCardText class="pt-0">
        <VAlert
          type="success"
          variant="tonal"
          density="compact"
          class="mb-0"
        >
          <div class="d-flex align-center">
            <VIcon icon="ri-gift-line" class="me-2" />
            <span class="text-body-2">
              <strong>회원가입 시 30일 무료 체험!</strong> 모든 기능을 제한 없이 사용해보세요.
            </span>
          </div>
        </VAlert>
      </VCardText>

      <!-- 로그인 폼 -->
      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleLogin">
          <VRow>
            <!-- 이메일 -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                autofocus
                label="이메일"
                type="email"
                placeholder="your@email.com"
                :rules="[required, emailRule]"
              />
            </VCol>

            <!-- 비밀번호 -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="비밀번호"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="password"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                :rules="[required]"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />

              <!-- 로그인 유지 & 비밀번호 찾기 -->
              <div class="d-flex align-center justify-space-between flex-wrap my-6">
                <VCheckbox
                  v-model="form.rememberMe"
                  label="로그인 유지"
                />

                <a
                  href="javascript:void(0)"
                  class="text-primary"
                  @click="router.push('/forgot-password')"
                >
                  비밀번호 찾기
                </a>
              </div>

              <!-- 에러 메시지 -->
              <VAlert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                density="compact"
                closable
                class="mb-4"
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </VAlert>

              <!-- 로그인 버튼 -->
              <VBtn
                block
                type="submit"
                :loading="authStore.loading"
              >
                로그인
              </VBtn>
            </VCol>

            <!-- 회원가입 링크 -->
            <VCol
              cols="12"
              class="text-body-1 text-center"
            >
              <span class="d-inline-block">
                계정이 없으신가요?
              </span>
              <a
                href="javascript:void(0)"
                class="text-primary ms-1 d-inline-block text-body-1"
                @click="router.push('/register')"
              >
                회원가입
              </a>
            </VCol>

            <!-- 구분선 -->
            <VCol
              cols="12"
              class="d-flex align-center"
            >
              <VDivider />
              <span class="mx-4 text-high-emphasis">or</span>
              <VDivider />
            </VCol>

            <!-- SNS 로그인 버튼 -->
            <VCol cols="12">
              <div class="d-flex flex-column gap-3">
                <!-- 구글 로그인 -->
                <VBtn
                  variant="outlined"
                  color="default"
                  size="large"
                  block
                  @click="handleGoogleLogin"
                >
                  <VIcon icon="ri-google-fill" class="me-2" />
                  구글로 로그인
                </VBtn>

                <!-- 네이버 로그인 -->
                <VBtn
                  variant="outlined"
                  color="success"
                  size="large"
                  block
                  @click="handleNaverLogin"
                >
                  <VIcon icon="ri-chat-1-fill" class="me-2" />
                  네이버로 로그인
                </VBtn>

                <!-- 카카오 로그인 -->
                <VBtn
                  variant="outlined"
                  color="warning"
                  size="large"
                  block
                  @click="handleKakaoLogin"
                >
                  <VIcon icon="ri-kakao-talk-fill" class="me-2" />
                  카카오로 로그인
                </VBtn>
              </div>
            </VCol>

            <!-- 홈으로 돌아가기 -->
            <VCol cols="12" class="text-center">
              <RouterLink to="/" class="text-body-2 text-medium-emphasis text-decoration-none">
                <VIcon icon="ri-arrow-left-line" size="16" class="me-1" />
                홈으로 돌아가기
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <!-- 개발용: 빠른 로그인 (환경변수 VITE_TEST_EMAIL, VITE_TEST_PASSWORD 설정 시에만 표시) -->
      <VCardText v-if="showTestAccount">
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

    <!-- 배경 이미지 -->
    <VImg
      :src="authV1ThemeLoginMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
