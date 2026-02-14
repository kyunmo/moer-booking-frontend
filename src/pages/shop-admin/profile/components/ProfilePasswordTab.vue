<template>
  <div>
    <VForm ref="formRef" @submit.prevent="handleSubmit">
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.currentPassword"
            label="현재 비밀번호 *"
            prepend-inner-icon="ri-lock-line"
            :type="showCurrentPassword ? 'text' : 'password'"
            :append-inner-icon="showCurrentPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
            :rules="[rules.required]"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          />
        </VCol>
      </VRow>

      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.newPassword"
            label="새 비밀번호 *"
            prepend-inner-icon="ri-lock-password-line"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
            :rules="newPasswordRules"
            @click:append-inner="showNewPassword = !showNewPassword"
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            v-model="form.confirmPassword"
            label="새 비밀번호 확인 *"
            prepend-inner-icon="ri-lock-password-line"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
            :rules="confirmPasswordRules"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />
        </VCol>
      </VRow>

      <div class="d-flex justify-end mt-4">
        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          비밀번호 변경
        </VBtn>
      </div>
    </VForm>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/auth'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const { success, error: showError } = useSnackbar()

const formRef = ref(null)
const loading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules = {
  required: v => !!v || '필수 입력 항목입니다.',
}

const newPasswordRules = [
  v => !!v || '새 비밀번호를 입력해주세요.',
  v => (v && v.length >= 8) || '비밀번호는 8자 이상이어야 합니다.',
  v => /(?=.*[a-zA-Z])(?=.*\d)/.test(v) || '비밀번호는 영문과 숫자를 포함해야 합니다.',
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요.',
  v => v === form.value.newPassword || '새 비밀번호와 일치하지 않습니다.',
]

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authApi.changePassword({
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword,
    })

    success('비밀번호가 변경되었습니다. 다시 로그인해주세요.')

    // 토큰 제거 및 로그인 페이지로 이동
    setTimeout(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.push('/login')
    }, 2000)
  }
  catch (err) {
    console.error('비밀번호 변경 실패:', err)
    showError(err.message || '비밀번호 변경에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}
</script>
