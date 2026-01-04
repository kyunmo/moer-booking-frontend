<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4" max-width="600" width="100%">
      <VCardText>
        <!-- 로고 -->
        <div class="text-center mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            moer
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            회원가입
          </p>
        </div>

        <!-- 회원가입 폼 -->
        <VForm ref="formRef" @submit.prevent="handleRegister">
          <VRow>
            <!-- 매장명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.businessName"
                label="매장명"
                prepend-inner-icon="ri-store-2-line"
                placeholder="준수헤어"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 대표자명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.ownerName"
                label="대표자명"
                prepend-inner-icon="ri-user-line"
                placeholder="홍길동"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 이메일 -->
            <VCol cols="12" md="6">
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

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="전화번호"
                prepend-inner-icon="ri-phone-line"
                placeholder="010-1234-5678"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 비밀번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.password"
                label="비밀번호"
                :type="isPasswordVisible ? 'text' : 'password'"
                prepend-inner-icon="ri-lock-line"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                placeholder="8자 이상"
                :rules="[required, passwordRule]"
                required
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <!-- 비밀번호 확인 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.passwordConfirm"
                label="비밀번호 확인"
                :type="isPasswordConfirmVisible ? 'text' : 'password'"
                prepend-inner-icon="ri-lock-line"
                :append-inner-icon="isPasswordConfirmVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                placeholder="비밀번호 재입력"
                :rules="[required, passwordMatchRule]"
                required
                @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
              />
            </VCol>

            <!-- 약관 동의 -->
            <VCol cols="12">
              <VCheckbox
                v-model="form.agreeTerms"
                :rules="[v => !!v || '약관에 동의해주세요']"
                hide-details="auto"
              >
                <template #label>
                  <div>
                    <a href="javascript:void(0)" class="text-primary text-decoration-none">
                      이용약관
                    </a>
                    및
                    <a href="javascript:void(0)" class="text-primary text-decoration-none">
                      개인정보처리방침
                    </a>
                    에 동의합니다
                  </div>
                </template>
              </VCheckbox>
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

            <!-- 회원가입 버튼 -->
            <VCol cols="12">
              <VBtn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.loading"
              >
                회원가입
              </VBtn>
            </VCol>

            <!-- 로그인 링크 -->
            <VCol cols="12" class="text-center">
              <span class="text-body-2">이미 계정이 있으신가요?</span>
              <a
                href="javascript:void(0)"
                class="text-primary text-decoration-none ms-1"
                @click="router.push('/login')"
              >
                로그인
              </a>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const errorMessage = ref('')

const form = ref({
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  businessType: 'BEAUTY_SHOP',
  agreeTerms: false,
})

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
      ownerName: form.value.ownerName,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      businessType: form.value.businessType,
    })

    // 회원가입 성공 시 대시보드로 이동
    router.push('/')
  }
  catch (error) {
    console.error('회원가입 실패:', error)
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '회원가입에 실패했습니다. 다시 시도해주세요.'
    }
  }
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
