<script setup>
import { Icon } from '@iconify/vue'
import YSection from '@/components/yemo/YSection.vue'
import YCard from '@/components/yemo/YCard.vue'

const solutions = [
  { icon: 'ph:moon-stars', title: '24시간 자동 예약', desc: '고객이 언제든 직접 예약. 관리자는 아침에 확인만 하면 끝.', tip: '자는 동안에도 예약이 들어와요.' },
  { icon: 'ph:chat-circle-dots', title: '카카오톡 자동 알림', desc: '예약 확정 즉시 발송. 하루 전 자동 리마인더로 노쇼율 80% 감소.', tip: '3개월 후 재방문 알림도 자동.' },
  { icon: 'ph:chart-line-up', title: '고객 이력 자동 기록', desc: '시술 내역·선호 스타일·VIP 등급을 자동으로 파악합니다.', tip: '"지난번에 어떻게 했지?" 묻지 않아도 됩니다.' },
  { icon: 'ph:gauge', title: '실시간 통계', desc: '일·주·월 매출, 디자이너별 성과를 한눈에 확인합니다.', tip: '데이터 기반 경영 결정.' },
]
</script>

<template>
  <YSection eyebrow="Solution" title="YEMO로 바뀌는 하루" align="center" sub="네 가지 변화. 사장님 시간을 손님에게 돌려드립니다.">
    <div class="sol-grid">
      <YCard v-for="s in solutions" :key="s.title" interactive padding="lg">
        <div class="sol-card">
          <div class="sol-card__icon">
            <Icon :icon="s.icon" aria-hidden="true" />
          </div>
          <h3 class="t-title-md t-strong">{{ s.title }}</h3>
          <p class="t-body-sm t-muted">{{ s.desc }}</p>
          <div class="sol-card__tip">
            <Icon icon="ph:lightbulb" aria-hidden="true" />
            <span>{{ s.tip }}</span>
          </div>
        </div>
      </YCard>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.sol-grid {
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 968px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}
.sol-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  &__icon {
    width: 48px; height: 48px;
    border-radius: var(--y-radius);
    background: var(--y-text-strong);
    color: var(--y-bg);
    display: inline-flex; align-items: center; justify-content: center;
    svg { width: 24px; height: 24px; }
  }
  &__tip {
    margin-top: 4px;
    padding: 10px 12px;
    border-radius: var(--y-radius);
    background: var(--y-accent-soft);
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; color: #7A5A2A; font-weight: 500;
    svg { width: 14px; height: 14px; }
  }
}
</style>
