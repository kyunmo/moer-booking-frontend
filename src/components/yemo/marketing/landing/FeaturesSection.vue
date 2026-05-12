<script setup>
import { Icon } from '@iconify/vue'
import YSection from '@/components/yemo/YSection.vue'
import YCard from '@/components/yemo/YCard.vue'

const features = [
  { icon: 'ph:calendar-blank', title: '예약 캘린더', desc: '일·주·월 뷰 전환. 디자이너별 색상 구분. 드래그로 시간 조정.' },
  { icon: 'ph:shield-check', title: '시간 충돌 방지', desc: '이미 예약된 시간은 자동 비활성화. 시술 시간 자동 계산.' },
  { icon: 'ph:link', title: '고객 예약 페이지', desc: 'yourshop.yemo.io 전용 주소. 모바일 최적화. 카카오톡 공유.' },
  { icon: 'ph:chat-circle-dots', title: '카카오톡 3단계 알림', desc: '예약 확정 → 하루 전 → 완료 후. 재방문 알림까지.' },
  { icon: 'ph:users', title: '고객 관리', desc: '방문 횟수·결제 금액 자동 집계. VIP·단골·신규 태그.' },
  { icon: 'ph:chart-bar', title: '통계 대시보드', desc: '매출·예약 건수·인기 시술·디자이너별 성과를 한눈에.' },
]
</script>

<template>
  <YSection eyebrow="Features" title="왜 많은 사장님들이 YEMO를 선택할까요?" align="center">
    <div class="feat-grid">
      <YCard v-for="f in features" :key="f.title" interactive padding="md">
        <div class="feat-card">
          <div class="feat-card__icon"><Icon :icon="f.icon" aria-hidden="true" /></div>
          <h3 class="t-title-md t-strong">{{ f.title }}</h3>
          <p class="t-body-sm t-muted">{{ f.desc }}</p>
        </div>
      </YCard>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.feat-grid {
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}
.feat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  &__icon {
    width: 44px; height: 44px;
    border-radius: var(--y-radius);
    background: var(--y-surface-elev);
    color: var(--y-text-strong);
    display: inline-flex; align-items: center; justify-content: center;
    svg { width: 22px; height: 22px; }
  }
}
</style>
