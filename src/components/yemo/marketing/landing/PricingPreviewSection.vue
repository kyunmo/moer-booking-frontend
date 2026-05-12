<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import YSection from '@/components/yemo/YSection.vue'
import YBtn from '@/components/yemo/YBtn.vue'
import YTag from '@/components/yemo/YTag.vue'

const router = useRouter()
const plans = [
  {
    name: '무료',
    price: '0',
    sub: '체험용으로 딱',
    includes: ['월 예약 50건', '디자이너 1명', '시술 메뉴 10개', '예약 캘린더', '고객 관리 (기본)'],
    excludes: ['카카오톡 알림', '재방문 알림'],
    cta: '무료로 시작',
    variant: 'secondary',
  },
  {
    name: '유료',
    price: '20,000',
    badge: '대부분이 선택',
    sub: 'VAT 별도 · 연 결제 시 20% 할인',
    includes: ['월 예약 무제한', '디자이너 5명', '시술 메뉴 무제한', '카카오톡 자동 알림', '재방문 자동 알림', '포트폴리오 무제한', '고급 통계'],
    excludes: [],
    cta: '유료 플랜 시작',
    variant: 'accent',
    featured: true,
  },
]
</script>

<template>
  <YSection eyebrow="Pricing" title="간단하고 투명한 요금제" align="center" sub="모든 기능을 30일간 무료로 체험. 신용카드 없이 시작하세요.">
    <div class="price-grid">
      <div v-for="p in plans" :key="p.name" class="plan" :class="{ 'plan--featured': p.featured }">
        <div class="plan__head">
          <YTag v-if="p.badge" variant="accent">{{ p.badge }}</YTag>
          <div class="plan__name">{{ p.name }}</div>
          <div class="plan__price">
            <span class="plan__amount">{{ p.price }}</span>
            <span class="plan__currency">원 / 월</span>
          </div>
          <p class="plan__sub">{{ p.sub }}</p>
        </div>
        <ul class="plan__list">
          <li v-for="i in p.includes" :key="i">
            <Icon icon="ph:check" aria-hidden="true" /><span>{{ i }}</span>
          </li>
          <li v-for="i in p.excludes" :key="i" class="is-excluded">
            <Icon icon="ph:x" aria-hidden="true" /><span>{{ i }}</span>
          </li>
        </ul>
        <YBtn :variant="p.variant" size="lg" block @click="router.push('/register')">
          {{ p.cta }}
        </YBtn>
      </div>
    </div>
    <div class="price-foot">
      <YBtn variant="text" append-icon="ph:arrow-right" @click="router.push('/pricing')">
        전체 비교표 보기
      </YBtn>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.price-grid {
  max-width: 800px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}
.plan {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-2xl);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all var(--y-dur-base) var(--y-ease);

  &--featured {
    background: var(--y-text-strong);
    color: var(--y-bg);
    border-color: var(--y-text-strong);
    .plan__name, .plan__amount { color: var(--y-bg); }
    .plan__currency, .plan__sub { color: rgba(255, 255, 255, 0.7); }
    .plan__list li { color: var(--y-bg); }
    .plan__list svg { color: var(--y-accent); }
  }

  &__name {
    font-size: 16px;
    font-weight: 700;
    color: var(--y-text-strong);
    margin-top: 12px;
  }
  &__price { display: flex; align-items: baseline; gap: 4px; margin-top: 8px; }
  &__amount { font-size: 42px; font-weight: 800; color: var(--y-text-strong); letter-spacing: -0.03em; }
  &__currency { font-size: 14px; color: var(--y-text-muted); }
  &__sub { font-size: 12px; color: var(--y-text-muted); margin-top: 8px; }

  &__list {
    display: flex; flex-direction: column; gap: 10px;
    li {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; color: var(--y-text);
      svg { width: 16px; height: 16px; color: var(--y-success); flex-shrink: 0; }
      &.is-excluded { color: var(--y-text-disabled); svg { color: var(--y-text-disabled); } }
    }
  }
}
.price-foot { text-align: center; margin-top: 32px; }
</style>
