<script setup>
import { Icon } from '@iconify/vue'
import YSection from '@/components/yemo/YSection.vue'
import YCard from '@/components/yemo/YCard.vue'

const pains = [
  { icon: 'ph:phone-call', title: '끊임없이 울리는 전화', desc: '매일 수십 통의 예약 전화. 손님 시술 중에도 받느라 집중 못해요.' },
  { icon: 'ph:notebook', title: '수첩에 빼곡한 예약', desc: '예약이 겹치거나 누락되는 실수. 시간 계산도 만만치 않습니다.' },
  { icon: 'ph:user-circle-minus', title: '예약하고 안 오는 고객', desc: '빈 시간이 곧 매출 손실. 연락해도 이미 늦은 후입니다.' },
  { icon: 'ph:question', title: '지난번에 뭐 했더라?', desc: '고객 이력을 일일이 기억 못해 단골도 새 손님처럼 응대하게 됩니다.' },
]
</script>

<template>
  <YSection eyebrow="Pain Point" title="이런 고민, 혹시 있으신가요?" align="center">
    <div class="pain-grid">
      <YCard v-for="p in pains" :key="p.title" interactive padding="lg">
        <div class="pain-card">
          <div class="pain-card__icon">
            <Icon :icon="p.icon" aria-hidden="true" />
          </div>
          <h3 class="t-title-md t-strong">{{ p.title }}</h3>
          <p class="t-body-sm t-muted">{{ p.desc }}</p>
        </div>
      </YCard>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.pain-grid {
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 968px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}
.pain-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  &__icon {
    width: 48px; height: 48px;
    border-radius: var(--y-radius);
    background: var(--y-accent-soft);
    color: var(--y-accent-deep);
    display: inline-flex; align-items: center; justify-content: center;
    svg { width: 24px; height: 24px; }
  }
}
</style>
