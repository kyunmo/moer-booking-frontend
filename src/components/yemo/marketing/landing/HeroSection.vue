<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import YBtn from '@/components/yemo/YBtn.vue'
import YTag from '@/components/yemo/YTag.vue'

const router = useRouter()

const trustItems = [
  { icon: 'ph:credit-card-slash', label: '신용카드 없이 가입' },
  { icon: 'ph:clock', label: '5분 안에 시작' },
  { icon: 'ph:hand-waving', label: '언제든 해지' },
]
</script>

<template>
  <section class="hero">
    <div class="hero__container">
      <div class="hero__copy">
        <YTag variant="accent" icon="ph:sparkle">30일 무료체험 진행 중</YTag>
        <h1 class="hero__title t-display-xl">
          예약 관리,<br>
          <span class="t-accent">예모</span>로 자동으로 끝내세요
        </h1>
        <p class="hero__sub">
          전화 받느라 손님 시술 놓치는 일은 이제 그만.<br>
          고객은 직접 예약하고, 카카오톡으로 자동 알림이 갑니다.
        </p>
        <div class="hero__cta">
          <YBtn variant="primary" size="lg" append-icon="ph:arrow-right" @click="router.push('/register')">
            무료로 시작하기
          </YBtn>
          <YBtn variant="ghost" size="lg" prepend-icon="ph:play-circle" @click="router.push('/features')">
            기능 둘러보기
          </YBtn>
        </div>
        <ul class="hero__trust">
          <li v-for="t in trustItems" :key="t.label">
            <Icon :icon="t.icon" aria-hidden="true" />
            <span>{{ t.label }}</span>
          </li>
        </ul>
      </div>

      <div class="hero__mock" aria-hidden="true">
        <div class="mock-card">
          <div class="mock-card__head">
            <div class="mock-card__title">오늘의 예약</div>
            <div class="mock-card__date">2026 · 05 · 13</div>
          </div>
          <div class="mock-card__items">
            <div v-for="i in 3" :key="i" class="mock-card__item">
              <div class="mock-card__time">{{ ['10:00', '13:30', '16:00'][i - 1] }}</div>
              <div class="mock-card__name">{{ ['김 ○○ · 컷+염색', '이 ○○ · 펌', '박 ○○ · 컷'][i - 1] }}</div>
              <span class="mock-card__status">확정</span>
            </div>
          </div>
        </div>
        <div class="mock-stats">
          <div v-for="s in [
            { label: '이번 달 매출', value: '4.8M' },
            { label: '예약 건수', value: '187' },
            { label: '신규 고객', value: '23' },
            { label: '재방문율', value: '68%' },
          ]" :key="s.label" class="mock-stat">
            <div class="mock-stat__value">{{ s.value }}</div>
            <div class="mock-stat__label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  padding: 80px 0 120px;
  @media (max-width: 768px) { padding: 56px 0 64px; }

  &__container {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: 32px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    @media (max-width: 968px) {
      grid-template-columns: 1fr;
      padding-inline: 16px;
      gap: 48px;
    }
  }

  &__title {
    margin: 24px 0 20px;
    color: var(--y-text-strong);
  }
  &__sub {
    font-size: 17px;
    line-height: 1.7;
    color: var(--y-text-muted);
    max-width: 500px;
  }

  &__cta {
    display: flex;
    gap: 12px;
    margin-top: 36px;
    @media (max-width: 480px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__trust {
    display: flex;
    gap: 24px;
    margin-top: 32px;
    flex-wrap: wrap;
    li {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--y-text-muted);
      svg { width: 16px; height: 16px; color: var(--y-accent-deep); }
    }
  }

  &__mock {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.mock-card {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-xl);
  padding: 24px;
  box-shadow: var(--y-shadow-lg);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--y-border);
  }
  &__title { font-weight: 700; font-size: 15px; color: var(--y-text-strong); }
  &__date  { font-size: 12px; color: var(--y-text-muted); }

  &__items { display: flex; flex-direction: column; gap: 12px; padding-top: 16px; }
  &__item {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: var(--y-bg);
    border-radius: var(--y-radius);
  }
  &__time { font-weight: 700; font-size: 13px; color: var(--y-accent-deep); }
  &__name { font-size: 13px; color: var(--y-text); }
  &__status {
    font-size: 11px; font-weight: 600;
    padding: 3px 8px;
    border-radius: var(--y-radius-pill);
    background: var(--y-success-soft);
    color: #2D5C3D;
  }
}

.mock-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
}
.mock-stat {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-lg);
  padding: 16px 12px;
  text-align: center;
  &__value { font-size: 18px; font-weight: 800; color: var(--y-text-strong); }
  &__label { font-size: 11px; color: var(--y-text-muted); margin-top: 4px; }
}
</style>
