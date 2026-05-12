<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import YBtn from '@/components/yemo/YBtn.vue'
import YInput from '@/components/yemo/YInput.vue'
import YTag from '@/components/yemo/YTag.vue'
import { useAuthStore } from '@/stores/auth'
import { OAUTH_BASE_URL } from '@/utils/oauth'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: '회원가입 — YEMO',
    description: '30일 무료 체험. 신용카드 없이 5분 만에 시작하세요.',
  },
})

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const ownerName = ref('')
const phone = ref('')
const businessName = ref('')

const agreeAll = ref(false)
const agreeTerms = ref(false)
const agreePrivacy = ref(false)

const submitting = ref(false)
const error = ref('')

const toggleAll = () => {
  agreeAll.value = !agreeAll.value
  agreeTerms.value = agreeAll.value
  agreePrivacy.value = agreeAll.value
}

const canSubmit = computed(() =>
  email.value && password.value && password.value === passwordConfirm.value &&
  ownerName.value && phone.value && businessName.value &&
  agreeTerms.value && agreePrivacy.value)

const submit = async () => {
  if (!canSubmit.value) {
    error.value = '필수 항목을 모두 입력하고 약관에 동의해주세요'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      ownerName: ownerName.value,
      phone: phone.value,
      businessName: businessName.value,
    })
    router.push('/shop-admin/setup')
  }
  catch (e) {
    error.value = e?.response?.data?.message || '회원가입에 실패했습니다'
  }
  finally {
    submitting.value = false
  }
}

const kakaoSignup = () => {
  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorize/kakao?loginType=admin`
}
</script>

<template>
  <div class="reg">
    <div class="reg__panel">
      <YTag variant="accent" icon="ph:sparkle">30일 무료체험</YTag>
      <h1 class="t-display-md t-strong">사장님, 환영합니다</h1>
      <p class="t-body t-muted">신용카드 없이 5분 만에 시작. 30일간 모든 기능을 무료로 사용해보세요.</p>

      <YBtn variant="accent" size="lg" prepend-icon="ph:chat-circle-dots" block @click="kakaoSignup">
        카카오로 시작하기
      </YBtn>

      <div class="reg__divider"><span>또는 이메일로 가입</span></div>

      <form class="reg__form" @submit.prevent="submit">
        <YInput v-model="email" label="이메일" type="email" placeholder="you@example.com" autocomplete="email" required />
        <YInput v-model="password" label="비밀번호" type="password" hint="8자 이상" autocomplete="new-password" required />
        <YInput v-model="passwordConfirm" label="비밀번호 확인" type="password" autocomplete="new-password" required />
        <YInput v-model="ownerName" label="사장님 이름" placeholder="홍길동" autocomplete="name" required />
        <YInput v-model="phone" label="휴대폰" type="tel" placeholder="010-1234-5678" autocomplete="tel" required />
        <YInput v-model="businessName" label="매장 이름" placeholder="예: 강남 헤어샵" required />

        <div class="reg__agree">
          <label class="reg__agree-row reg__agree-row--all">
            <input type="checkbox" :checked="agreeAll" @change="toggleAll">
            <span>전체 동의</span>
          </label>
          <label class="reg__agree-row">
            <input v-model="agreeTerms" type="checkbox">
            <span>이용약관 동의 <span class="reg__req">(필수)</span></span>
            <RouterLink to="/terms" target="_blank">보기</RouterLink>
          </label>
          <label class="reg__agree-row">
            <input v-model="agreePrivacy" type="checkbox">
            <span>개인정보처리방침 동의 <span class="reg__req">(필수)</span></span>
            <RouterLink to="/privacy" target="_blank">보기</RouterLink>
          </label>
        </div>

        <div v-if="error" class="reg__error">{{ error }}</div>
        <YBtn type="submit" variant="primary" size="lg" :loading="submitting" :disabled="!canSubmit" block>
          무료로 시작하기
        </YBtn>
      </form>

      <p class="reg__login">
        이미 회원이신가요? <RouterLink to="/login">로그인</RouterLink>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reg {
  display: flex; justify-content: center;
  padding: 64px 16px;
  @media (max-width: 768px) { padding: 32px 16px; }
}
.reg__panel {
  width: 100%;
  max-width: 440px;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-2xl);
  padding: 48px 36px;
  display: flex; flex-direction: column; gap: 20px;
  box-shadow: var(--y-shadow);
  @media (max-width: 480px) { padding: 32px 20px; }
}

.reg__divider {
  display: flex; align-items: center; gap: 12px;
  font-size: 12px; color: var(--y-text-muted);
  &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--y-border); }
  span { white-space: nowrap; }
}

.reg__form { display: flex; flex-direction: column; gap: 16px; }

.reg__agree {
  display: flex; flex-direction: column; gap: 8px;
  padding: 16px;
  background: var(--y-bg);
  border-radius: var(--y-radius);
}
.reg__agree-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--y-text);
  &--all { font-weight: 700; padding-bottom: 8px; border-bottom: 1px solid var(--y-border); margin-bottom: 4px; }
  input { width: 16px; height: 16px; accent-color: var(--y-accent); }
  a { margin-left: auto; font-size: 12px; color: var(--y-accent-deep); }
}
.reg__req { color: var(--y-danger); font-size: 11px; font-weight: 600; }

.reg__error {
  font-size: 13px; color: var(--y-danger);
  padding: 10px 12px;
  background: var(--y-danger-soft);
  border-radius: var(--y-radius);
}

.reg__login {
  text-align: center;
  font-size: 13px; color: var(--y-text-muted);
  a { color: var(--y-accent-deep); font-weight: 600; }
}
</style>
