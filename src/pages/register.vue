<route lang="yaml">
meta:
  layout: blank
  public: true
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
import PricingCard from '@/components/pricing/PricingCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const errorMessage = ref('')

const form = ref({
  businessName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  businessType: 'BEAUTY_SHOP',
  selectedPlan: 'BASIC', // 기본값: BASIC 플랜
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
      selectedPlan: form.value.selectedPlan, // 선택한 플랜 전송
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
          <div class="app-logo">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="app-logo-title">
              {{ themeConfig.app.title }}
            </h1>
          </div>
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
              <strong>30일 무료 체험!</strong> 회원가입 즉시 모든 기능을 체험할 수 있습니다.
            </span>
          </div>
        </VAlert>
      </VCardText>

      <!-- 플랜 선택 -->
      <VCardText>
        <h5 class="text-h6 mb-2">
          플랜 선택
        </h5>
        <p class="text-body-2 text-medium-emphasis mb-4">
          나에게 맞는 플랜을 선택하세요. 언제든지 변경 가능합니다.
        </p>

        <VRow>
          <VCol
            cols="12"
            md="4"
            v-for="plan in ['FREE', 'BASIC', 'PRO']"
            :key="plan"
          >
            <PricingCard
              :plan="plan"
              :selected="form.selectedPlan === plan"
              compact
              @select="form.selectedPlan = $event"
            />
          </VCol>
        </VRow>

        <VAlert
          v-if="form.selectedPlan !== 'FREE'"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <div class="text-body-2">
            <VIcon icon="ri-information-line" class="me-2" />
            <strong>{{ form.selectedPlan === 'BASIC' ? '베이직' : '프로' }} 플랜</strong>을 30일간 무료로 체험하실 수 있습니다. 체험 기간 종료 후 자동 과금되지 않습니다.
          </div>
        </VAlert>
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
                    <RouterLink
                      to="/terms"
                      class="text-primary"
                      target="_blank"
                    >이용약관</RouterLink>
                    및
                    <RouterLink
                      to="/privacy"
                      class="text-primary"
                      target="_blank"
                    >개인정보처리방침</RouterLink>에 동의합니다
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
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

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
