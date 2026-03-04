<route lang="yaml">
meta:
  layout: blank
  public: true
  title: 회원가입 - 모에르(MOER)
  description: 모에르(MOER)에 가입하고 예약 관리를 자동화하세요. 무료로 시작 가능합니다.
</route>

<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authV1RegisterMaskDark from '@images/pages/auth-v1-register-mask-dark.png'
import authV1RegisterMaskLight from '@images/pages/auth-v1-register-mask-light.png'
import LegalDialog from '@/components/legal/LegalDialog.vue'
import { OAUTH_BASE_URL } from '@/utils/oauth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const errorMessage = ref('')
const legalDialog = ref(false)
const legalType = ref('terms')

const form = ref({
  businessName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  businessType: 'BEAUTY_SHOP',
  agreeTerms: false,
})

const authV1ThemeRegisterMask = useGenerateImageVariant(authV1RegisterMaskLight, authV1RegisterMaskDark)

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const emailRule = value => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || '올바른 이메일 형식이 아닙니다.'
}

const passwordRule = value => {
  return value.length >= 8 || '비밀번호는 8자 이상이어야 합니다.'
}

const passwordMatchRule = value => {
  return value === form.value.password || '비밀번호가 일치하지 않습니다.'
}

// SNS 로그인 (카카오)
function handleKakaoRegister() {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorize/kakao?loginType=admin`
}

// 회원가입 처리
async function handleRegister() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  errorMessage.value = ''

  try {
    await authStore.register({
      businessName: form.value.businessName,
      ownerName: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      businessType: form.value.businessType,
    })

    // 회원가입 성공 시 대시보드로 이동
    router.push('/shop-admin/dashboard')
  }
  catch (error) {
    errorMessage.value = error?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-1 pa-sm-7"
      max-width="900"
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
          지금 시작하세요! 🚀
        </h4>
        <p class="mb-0">
          쉽고 편리한 예약 관리를 경험해보세요
        </p>
      </VCardText>

      <!-- 30일 무료 체험 배지 -->
      <VCardText class="pt-0">
        <VCard
          color="primary"
          variant="tonal"
          class="pa-4"
        >
          <div class="d-flex align-center justify-center mb-2">
            <VAvatar color="primary" variant="flat" size="40" class="me-3">
              <VIcon icon="ri-gift-2-line" size="24" />
            </VAvatar>
            <div>
              <h5 class="text-h6 font-weight-bold">
                30일 무료 체험
              </h5>
            </div>
          </div>
          <p class="text-body-2 text-center mb-0">
            회원가입 즉시 <strong>모든 유료 기능</strong>을 30일간 무료로 체험할 수 있습니다.
            체험 종료 후 무료 플랜으로 자동 전환되며, 별도 결제 없이 안심하고 시작하세요.
          </p>
          <div class="d-flex justify-center ga-4 mt-3">
            <VChip color="primary" size="small" variant="flat">
              <VIcon icon="ri-bar-chart-box-line" size="14" start />
              통계 분석
            </VChip>
            <VChip color="primary" size="small" variant="flat">
              <VIcon icon="ri-team-line" size="14" start />
              직원 관리
            </VChip>
            <VChip color="primary" size="small" variant="flat">
              <VIcon icon="ri-calendar-check-line" size="14" start />
              예약 관리
            </VChip>
          </div>
        </VCard>
      </VCardText>

      <!-- 회원가입 폼 -->
      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleRegister">
          <VRow>
            <!-- 매장명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.businessName"
                label="매장명"
                placeholder="준수헤어"
                :rules="[required]"
              />
            </VCol>

            <!-- 대표자명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="대표자명"
                placeholder="홍길동"
                :rules="[required]"
              />
            </VCol>

            <!-- 이메일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.email"
                label="이메일"
                type="email"
                placeholder="your@email.com"
                :rules="[required, emailRule]"
              />
            </VCol>

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="전화번호"
                placeholder="010-1234-5678"
                :rules="[required]"
              />
            </VCol>

            <!-- 비밀번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.password"
                label="비밀번호"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="new-password"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                :rules="[required, passwordRule]"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <!-- 비밀번호 확인 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.passwordConfirm"
                label="비밀번호 확인"
                placeholder="············"
                :type="isPasswordConfirmVisible ? 'text' : 'password'"
                autocomplete="new-password"
                :append-inner-icon="isPasswordConfirmVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                :rules="[required, passwordMatchRule]"
                @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
              />
            </VCol>

            <!-- 약관 동의 -->
            <VCol cols="12">
              <div class="d-flex align-center">
                <VCheckbox
                  id="privacy-policy"
                  v-model="form.agreeTerms"
                  :rules="[v => !!v || '약관에 동의해주세요']"
                  inline
                  hide-details="auto"
                />
                <VLabel
                  for="privacy-policy"
                  style="opacity: 1;"
                >
                  <span class="me-1 text-high-emphasis">
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                      @click="legalType = 'terms'; legalDialog = true"
                    >이용약관</a>
                    및
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                      @click="legalType = 'privacy'; legalDialog = true"
                    >개인정보처리방침</a>에 동의합니다
                  </span>
                </VLabel>
              </div>
            </VCol>

            <!-- 에러 메시지 -->
            <VCol v-if="errorMessage" cols="12">
              <VAlert
                type="error"
                variant="tonal"
                density="compact"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </VAlert>
            </VCol>

            <!-- 회원가입 버튼 -->
            <VCol cols="12">
              <VBtn
                block
                type="submit"
                :loading="authStore.loading"
              >
                회원가입
              </VBtn>
            </VCol>

            <!-- 구분선 -->
            <VCol cols="12" class="d-flex align-center">
              <VDivider />
              <span class="mx-4 text-high-emphasis text-no-wrap">or</span>
              <VDivider />
            </VCol>

            <!-- 카카오 소셜 로그인 -->
            <VCol cols="12">
              <VBtn
                variant="outlined"
                color="warning"
                size="large"
                block
                @click="handleKakaoRegister"
              >
                <VIcon icon="ri-kakao-talk-fill" class="me-2" />
                카카오로 간편 가입
              </VBtn>
            </VCol>

            <!-- 로그인 링크 -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>이미 계정이 있으신가요?</span>
              <a
                href="javascript:void(0)"
                class="text-primary ms-2"
                @click="router.push('/login')"
              >
                로그인
              </a>
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
    </VCard>

    <!-- 약관/개인정보 모달 -->
    <LegalDialog
      v-model="legalDialog"
      :type="legalType"
    />

    <!-- 배경 이미지 -->
    <VImg
      :src="authV1ThemeRegisterMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
