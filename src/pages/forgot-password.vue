<route lang="yaml">
meta:
  layout: blank
  public: true
  title: 비밀번호 찾기 - 모에르(MOER)
</route>

<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authApi from '@/api/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authV1ForgotPasswordMaskDark from '@images/pages/auth-v1-forgot-password-mask-dark.png'
import authV1ForgotPasswordMaskLight from '@images/pages/auth-v1-forgot-password-mask-light.png'

const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const success = ref(false)
const errorMessage = ref('')

const form = ref({
  email: '',
})

const authV1ThemeForgotPasswordMask = useGenerateImageVariant(
  authV1ForgotPasswordMaskLight,
  authV1ForgotPasswordMaskDark,
)

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const emailRule = value => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || '올바른 이메일 형식이 아닙니다.'
}

// 비밀번호 찾기 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''

  try {
    await authApi.forgotPassword(form.value.email)
    success.value = true
  }
  catch (error) {
    errorMessage.value = error?.message || '비밀번호 찾기에 실패했습니다. 다시 시도해주세요.'
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

      <!-- 성공 메시지 -->
      <VCardText v-if="success">
        <div class="text-center">
          <VIcon
            icon="ri-mail-send-line"
            size="64"
            color="success"
            class="mb-4"
          />
          <h4 class="text-h4 mb-2">
            이메일을 확인하세요 📧
          </h4>
          <p class="text-body-1 mb-2">
            비밀번호 재설정 링크를 <strong>{{ form.email }}</strong>로 발송했습니다.
          </p>
          <p class="text-body-2 text-medium-emphasis mb-6">
            이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
          </p>
          <VBtn
            color="primary"
            size="large"
            block
            @click="router.push('/login')"
          >
            로그인 페이지로 돌아가기
          </VBtn>
        </div>
      </VCardText>

      <!-- 비밀번호 찾기 폼 -->
      <template v-else>
        <VCardText>
          <h4 class="text-h4 mb-1">
            비밀번호를 잊으셨나요? 🔒
          </h4>
          <p class="mb-0">
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </VCardText>

        <VCardText>
          <VForm ref="formRef" @submit.prevent="handleSubmit">
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
                  재설정 링크 발송
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
      :src="authV1ThemeForgotPasswordMask"
      class="d-none d-md-block auth-footer-mask flip-in-rtl"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
