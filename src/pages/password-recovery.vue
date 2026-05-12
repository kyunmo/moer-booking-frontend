<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import YBtn from '@/components/yemo/YBtn.vue'
import YInput from '@/components/yemo/YInput.vue'
import authApi from '@/api/auth'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: '비밀번호 재설정 — YEMO',
  },
})

const route = useRoute()
const router = useRouter()

const step = ref('request')
const email = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const submitting = ref(false)
const error = ref('')
const token = ref('')

onMounted(() => {
  if (route.query.token) {
    token.value = String(route.query.token)
    step.value = 'reset'
  }
})

const canSubmitRequest = computed(() => !!email.value)
const canSubmitReset = computed(() => newPassword.value && newPassword.value === newPasswordConfirm.value)

const requestReset = async () => {
  if (!canSubmitRequest.value) {
    error.value = '이메일을 입력해주세요'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await authApi.forgotPassword(email.value)
    step.value = 'sent'
  }
  catch (e) {
    error.value = e?.response?.data?.message || '요청에 실패했습니다'
  }
  finally {
    submitting.value = false
  }
}

const submitReset = async () => {
  if (!canSubmitReset.value) {
    error.value = '비밀번호가 일치하지 않습니다'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await authApi.resetPassword(token.value, newPassword.value)
    step.value = 'done'
  }
  catch (e) {
    error.value = e?.response?.data?.message || '비밀번호 변경에 실패했습니다'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="rec">
    <div class="rec__panel">
      <form v-if="step === 'request'" class="rec__form" @submit.prevent="requestReset">
        <Icon class="rec__icon" icon="ph:key" />
        <h1 class="t-title-lg t-strong">비밀번호 재설정</h1>
        <p class="t-body-sm t-muted">가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</p>
        <YInput v-model="email" label="이메일" type="email" autocomplete="email" required />
        <div v-if="error" class="rec__error">{{ error }}</div>
        <YBtn type="submit" variant="primary" size="lg" :loading="submitting" block>재설정 링크 보내기</YBtn>
        <RouterLink to="/login" class="rec__back">로그인으로 돌아가기</RouterLink>
      </form>

      <div v-else-if="step === 'sent'" class="rec__form rec__form--center">
        <Icon class="rec__icon rec__icon--success" icon="ph:envelope-simple-open" />
        <h1 class="t-title-lg t-strong">메일을 확인해주세요</h1>
        <p class="t-body-sm t-muted"><strong>{{ email }}</strong>로 재설정 링크를 보냈습니다.<br>메일이 오지 않으면 스팸함도 확인해주세요.</p>
        <YBtn variant="secondary" size="lg" block @click="step = 'request'">다른 이메일로 다시 시도</YBtn>
        <RouterLink to="/login" class="rec__back">로그인으로 돌아가기</RouterLink>
      </div>

      <form v-else-if="step === 'reset'" class="rec__form" @submit.prevent="submitReset">
        <Icon class="rec__icon" icon="ph:lock-key" />
        <h1 class="t-title-lg t-strong">새 비밀번호 설정</h1>
        <p class="t-body-sm t-muted">새로 사용할 비밀번호를 입력해주세요.</p>
        <YInput v-model="newPassword" label="새 비밀번호" type="password" hint="8자 이상" autocomplete="new-password" required />
        <YInput v-model="newPasswordConfirm" label="비밀번호 확인" type="password" autocomplete="new-password" required />
        <div v-if="error" class="rec__error">{{ error }}</div>
        <YBtn type="submit" variant="primary" size="lg" :loading="submitting" :disabled="!canSubmitReset" block>비밀번호 변경</YBtn>
      </form>

      <div v-else class="rec__form rec__form--center">
        <Icon class="rec__icon rec__icon--success" icon="ph:check-circle" />
        <h1 class="t-title-lg t-strong">변경 완료</h1>
        <p class="t-body-sm t-muted">이제 새 비밀번호로 로그인하실 수 있습니다.</p>
        <YBtn variant="primary" size="lg" block @click="router.push('/login')">로그인 페이지로</YBtn>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rec {
  display: flex; justify-content: center;
  padding: 96px 16px;
  @media (max-width: 768px) { padding: 48px 16px; }
}
.rec__panel {
  width: 100%; max-width: 400px;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-2xl);
  padding: 48px 36px;
  box-shadow: var(--y-shadow);
}
.rec__form {
  display: flex; flex-direction: column; gap: 16px;
  &--center { text-align: center; align-items: center; }
}
.rec__icon {
  width: 48px; height: 48px;
  padding: 10px;
  border-radius: var(--y-radius);
  background: var(--y-accent-soft);
  color: var(--y-accent-deep);
  align-self: flex-start;
  &--success { background: var(--y-success-soft); color: #2D5C3D; align-self: center; }
}
.rec__error {
  font-size: 13px; color: var(--y-danger);
  padding: 10px 12px;
  background: var(--y-danger-soft);
  border-radius: var(--y-radius);
}
.rec__back {
  text-align: center;
  font-size: 13px; color: var(--y-text-muted);
  margin-top: 8px;
  &:hover { color: var(--y-text); }
}
</style>
