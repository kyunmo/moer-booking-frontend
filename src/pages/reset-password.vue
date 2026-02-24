<route lang="yaml">
meta:
  layout: blank
  public: true
  title: 비밀번호 재설정 - 모에르(MOER)
</route>

<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authApi from '@/api/auth'
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authV1ResetPasswordMaskDark from '@images/pages/auth-v1-reset-password-mask-dark.png'
import authV1ResetPasswordMaskLight from '@images/pages/auth-v1-reset-password-mask-light.png'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)
const success = ref(false)
const errorMessage = ref('')
const token = ref('')

const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)

const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const authV1ThemeResetPasswordMask = useGenerateImageVariant(
  authV1ResetPasswordMaskLight,
  authV1ResetPasswordMaskDark,
)

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const passwordRule = value => {
  return value.length >= 8 || '비밀번호는 최소 8자 이상이어야 합니다.'
}

const passwordMatchRule = value => {
  return value === form.value.newPassword || '비밀번호가 일치하지 않습니다.'
}

// URL에서 토큰 추출
onMounted(() => {
  token.value = route.query.token || ''
})

// 비밀번호 재설정 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    await authApi.resetPassword(token.value, form.value.newPassword)
    success.value = true
  }
  catch (error) {
    const errorMessages = {
      PR001: '유효하지 않은 재설정 링크입니다. 비밀번호 찾기를 다시 시도해주세요.',
      PR002: '재설정 링크가 만료되었습니다(30분). 비밀번호 찾기를 다시 시도해주세요.',
      PR003: '이미 사용된 재설정 링크입니다. 비밀번호 찾기를 다시 시도해주세요.',
    }

    errorMessage.value = errorMessages[error?.code] || error?.message || '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.'
  }
  finally {
    loading.value = false
  }
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
          <div class="app-logo">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="app-logo-title">
              {{ themeConfig.app.title }}
            </h1>
          </div>
        </VCardTitle>
      </VCardItem>

      <!-- 토큰 없음 -->
      <VCardText v-if="!token">
        <div class="text-center">
          <VIcon
            icon="ri-error-warning-line"
            size="64"
            color="error"
            class="mb-4"
          />
          <h4 class="text-h4 mb-2">
            유효하지 않은 링크입니다 ⚠️
          </h4>
          <p class="text-body-1 text-medium-emphasis mb-6">
            비밀번호 재설정 링크가 올바르지 않습니다.
          </p>
          <VBtn
            color="primary"
            size="large"
            block
            @click="router.push('/forgot-password')"
          >
            비밀번호 찾기
          </VBtn>
        </div>
      </VCardText>

      <!-- 성공 메시지 -->
      <VCardText v-else-if="success">
        <div class="text-center">
          <VIcon
            icon="ri-check-line"
            size="64"
            color="success"
            class="mb-4"
          />
          <h4 class="text-h4 mb-2">
            비밀번호가 재설정되었습니다 ✓
          </h4>
          <p class="text-body-1 text-medium-emphasis mb-6">
            새 비밀번호로 로그인해주세요.
          </p>
          <VBtn
            color="primary"
            size="large"
            block
            @click="router.push('/login')"
          >
            로그인
          </VBtn>
        </div>
      </VCardText>

      <!-- 비밀번호 재설정 폼 -->
      <template v-else>
        <VCardText>
          <h4 class="text-h4 mb-1">
            새 비밀번호 설정 🔐
          </h4>
          <p class="mb-0">
            안전한 비밀번호로 설정해주세요
          </p>
        </VCardText>

        <VCardText>
          <VForm ref="formRef" @submit.prevent="handleSubmit">
            <VRow>
              <!-- 새 비밀번호 -->
              <VCol cols="12">
                <VTextField
                  v-model="form.newPassword"
                  autofocus
                  label="새 비밀번호"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  placeholder="최소 8자 이상"
                  autocomplete="new-password"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  :rules="[required, passwordRule]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- 비밀번호 확인 -->
              <VCol cols="12">
                <VTextField
                  v-model="form.confirmPassword"
                  label="비밀번호 확인"
                  :type="isPasswordConfirmVisible ? 'text' : 'password'"
                  placeholder="비밀번호 재입력"
                  autocomplete="new-password"
                  :append-inner-icon="isPasswordConfirmVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  :rules="[required, passwordMatchRule]"
                  @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
                />
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

              <!-- 제출 버튼 -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  비밀번호 재설정
                </VBtn>
              </VCol>

              <!-- 로그인 링크 -->
              <VCol
                cols="12"
                class="d-flex align-center justify-center"
              >
                <VIcon
                  icon="ri-arrow-left-s-line"
                  size="20"
                  class="me-1"
                />
                <a
                  href="javascript:void(0)"
                  class="text-primary"
                  @click="router.push('/login')"
                >
                  로그인 페이지로 돌아가기
                </a>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </template>
    </VCard>

    <!-- 배경 이미지 -->
    <VImg
      :src="authV1ThemeResetPasswordMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
