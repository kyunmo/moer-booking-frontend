<script setup>
import { Icon } from '@iconify/vue'
import YSection from '@/components/yemo/YSection.vue'
import YCard from '@/components/yemo/YCard.vue'

const cases = [
  {
    industry: '미용실',
    quote: '전화 받느라 손님 시술에 집중 못했는데, YEMO 쓰고 나서 일이 정말 편해졌어요. 노쇼도 거의 사라졌고요.',
    author: '강남 헤어샵 대표 김○○',
    stats: [
      { label: '노쇼율', value: '30% → 6%' },
      { label: '예약 건수', value: '월 120 → 180건' },
      { label: '관리 시간', value: '2h → 30m' },
    ],
  },
  {
    industry: '필라테스',
    quote: '수강권 관리가 제일 힘들었는데, 출석 체크만 하면 자동으로 차감돼요. 수강생들도 잔여 횟수를 스스로 확인하니 문의 전화가 확 줄었어요.',
    author: '서초 필라테스 원장 이○○',
    stats: [
      { label: '관리 시간', value: '1h → 0m' },
      { label: '출석률', value: '70% → 85%' },
      { label: '만족도', value: '상승' },
    ],
  },
  {
    industry: '스터디카페',
    quote: '좌석 관리가 수동이었는데, YEMO 쓰고 나서 고객이 직접 좌석 선택하니까 너무 편하고, 매출도 20% 올랐어요.',
    author: '홍대 스터디카페 대표 박○○',
    stats: [
      { label: '좌석 배정', value: '0분' },
      { label: '고객 만족', value: '상승' },
      { label: '매출', value: '+20%' },
    ],
  },
]
</script>

<template>
  <YSection eyebrow="Testimonials" title="실제로 쓰는 사장님들의 후기" align="center">
    <div class="testim">
      <YCard v-for="c in cases" :key="c.author" padding="lg" radius="2xl" elevated :bordered="false">
        <div class="testim__card">
          <div class="testim__industry">
            <Icon icon="ph:quotes" aria-hidden="true" />
            <span>{{ c.industry }}</span>
          </div>
          <p class="testim__quote">{{ c.quote }}</p>
          <div class="testim__stats">
            <div v-for="s in c.stats" :key="s.label" class="testim__stat">
              <div class="testim__stat-value">{{ s.value }}</div>
              <div class="testim__stat-label">{{ s.label }}</div>
            </div>
          </div>
          <div class="testim__author">— {{ c.author }}</div>
        </div>
      </YCard>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.testim {
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 968px) { grid-template-columns: 1fr; }

  &__card { display: flex; flex-direction: column; gap: 20px; height: 100%; }
  &__industry {
    display: inline-flex; align-items: center; gap: 6px;
    color: var(--y-accent-deep);
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    svg { width: 16px; height: 16px; }
  }
  &__quote {
    font-size: 16px;
    line-height: 1.7;
    color: var(--y-text);
    flex: 1;
  }
  &__stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 16px;
    background: var(--y-bg);
    border-radius: var(--y-radius);
  }
  &__stat { text-align: center; }
  &__stat-value { font-weight: 800; font-size: 14px; color: var(--y-accent-deep); }
  &__stat-label { font-size: 11px; color: var(--y-text-muted); margin-top: 2px; }

  &__author { font-size: 13px; color: var(--y-text-muted); }
}
</style>
