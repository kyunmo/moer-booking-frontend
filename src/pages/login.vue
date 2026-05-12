<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import YBtn from '@/components/yemo/YBtn.vue'
import YInput from '@/components/yemo/YInput.vue'
import { useAuthStore } from '@/stores/auth'
import { OAUTH_BASE_URL } from '@/utils/oauth'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: '로그인 — YEMO',
  },
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const initialRole = route.query.role === 'customer' || route.query.role === 'admin' ? route.query.role : 'select'
const mode = ref(initialRole)

const email = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref('')

const adminLogin = async () => {
  if (!email.value || !password.value) {
    error.value = '이메일과 비밀번호를 입력해주세요'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/shop-admin/dashboard')
  }
  catch (e) {
    error.value = e?.response?.data?.message || '로그인에 실패했습니다'
  }
  finally {
    submitting.value = false
  }
}

const kakaoLogin = role => {
  const url = `${OAUTH_BASE_URL}/oauth2/authorize/kakao?loginType=${role}`
  window.location.href = url
}
</script>

<template>
  <div class="login">
    <div class="login__left" aria-hidden="true">
      <div class="login__brand">
        <div class="login__wordmark">YEMO</div>
        <p class="login__slogan">예약은 예모로</p>
        <p class="login__pitch">전화 받느라 손님 시술 놓치지 않도록.<br>5분이면 시작할 수 있어요.</p>
      </div>
    </div>

    <div class="login__right">
      <div class="login__panel">
        <div v-if="mode === 'select'" class="login__select">
          <h1 class="t-display-md t-strong">어떻게 로그인하시겠어요?</h1>
          <p class="t-body t-muted">아래에서 본인에게 맞는 옵션을 선택해주세요.</p>
          <div class="login__roles">
            <button class="role-card" @click="mode = 'admin'">
              <Icon icon="ph:storefront" aria-hidden="true" />
              <div class="t-title-md t-strong">사장님</div>
              <div class="t-body-sm t-muted">매장 운영 · 예약 관리</div>
            </button>
            <button class="role-card" @click="mode = 'customer'">
              <Icon icon="ph:user" aria-hidden="true" />
              <div class="t-title-md t-strong">고객</div>
              <div class="t-body-sm t-muted">예약하기 · 내 예약 관리</div>
            </button>
          </div>
          <p class="login__signup">
            아직 회원이 아니신가요?
            <RouterLink to="/register">사장님 가입 →</RouterLink>
          </p>
        </div>

        <form v-else-if="mode === 'admin'" class="login__form" @submit.prevent="adminLogin">
          <button type="button" class="login__back" @click="mode = 'select'">
            <Icon icon="ph:arrow-left" aria-hidden="true" /> 다른 옵션
          </button>
          <h2 class="t-title-lg t-strong">사장님 로그인</h2>
          <YInput v-model="email" label="이메일" type="email" placeholder="you@example.com" autocomplete="email" required />
          <YInput v-model="password" label="비밀번호" type="password" autocomplete="current-password" required />
          <div v-if="error" class="login__error">{{ error }}</div>
          <YBtn type="submit" variant="primary" size="lg" :loading="submitting" block>로그인</YBtn>
          <div class="login__divider"><span>또는</span></div>
          <YBtn variant="secondary" size="lg" prepend-icon="ph:chat-circle-dots" block @click="kakaoLogin('admin')">
            카카오로 로그인
          </YBtn>
          <p class="login__signup">
            <RouterLink to="/password-recovery">비밀번호 찾기</RouterLink>
            <span aria-hidden="true">·</span>
            <RouterLink to="/register">회원가입</RouterLink>
          </p>
        </form>

        <div v-else class="login__form">
          <button type="button" class="login__back" @click="mode = 'select'">
            <Icon icon="ph:arrow-left" aria-hidden="true" /> 다른 옵션
          </button>
          <h2 class="t-title-lg t-strong">고객 로그인</h2>
          <p class="t-body-sm t-muted">카카오로 간편하게 로그인하세요.</p>
          <YBtn variant="accent" size="lg" prepend-icon="ph:chat-circle-dots" block @click="kakaoLogin('customer')">
            카카오로 로그인
          </YBtn>
          <div class="login__guest">
            예약번호로 조회만 하시려면
            <RouterLink to="/booking/reservation">비회원 조회 →</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 72px);
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: calc(100vh - 56px);
  }
}
.login__left {
  background: var(--y-text-strong);
  color: var(--y-bg);
  display: flex; align-items: center; justify-content: center;
  padding: 48px;
  @media (max-width: 768px) { display: none; }
}
.login__wordmark { font-size: 48px; font-weight: 800; letter-spacing: -0.04em; }
.login__slogan { font-size: 18px; color: rgba(255, 255, 255, 0.7); margin-top: 8px; }
.login__pitch { font-size: 14px; color: rgba(255, 255, 255, 0.5); margin-top: 24px; line-height: 1.7; }

.login__right {
  display: flex; align-items: center; justify-content: center;
  padding: 48px;
  @media (max-width: 768px) { padding: 32px 16px; }
}
.login__panel {
  width: 100%;
  max-width: 400px;
  display: flex; flex-direction: column; gap: 24px;
}

.login__select { display: flex; flex-direction: column; gap: 16px; }
.login__roles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}
.role-card {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-xl);
  padding: 32px 20px;
  display: flex; flex-direction: column; gap: 8px; align-items: center;
  text-align: center;
  transition: all var(--y-dur-base) var(--y-ease-dramatic);
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--y-shadow-lg);
    border-color: var(--y-accent);
  }
  svg {
    width: 36px; height: 36px;
    color: var(--y-accent-deep);
    margin-bottom: 4px;
  }
}

.login__form { display: flex; flex-direction: column; gap: 16px; }
.login__back {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--y-text-muted);
  margin-bottom: 4px;
  &:hover { color: var(--y-text); }
  svg { width: 16px; height: 16px; }
}

.login__error {
  font-size: 13px; color: var(--y-danger);
  padding: 10px 12px;
  background: var(--y-danger-soft);
  border-radius: var(--y-radius);
}

.login__divider {
  display: flex; align-items: center; gap: 12px;
  font-size: 12px; color: var(--y-text-muted);
  margin: 8px 0;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--y-border); }
  span { white-space: nowrap; }
}

.login__signup {
  font-size: 13px; color: var(--y-text-muted);
  text-align: center;
  display: flex; gap: 8px; justify-content: center;
  a { color: var(--y-accent-deep); font-weight: 600; }
}
.login__guest {
  font-size: 13px; color: var(--y-text-muted);
  text-align: center;
  a { color: var(--y-accent-deep); font-weight: 600; }
}
</style>
