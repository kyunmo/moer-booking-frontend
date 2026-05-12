<script setup>
import { Icon } from '@iconify/vue'
import YSection from '@/components/yemo/YSection.vue'
import IndustrySection from '@/components/yemo/marketing/landing/IndustrySection.vue'
import FinalCtaSection from '@/components/yemo/marketing/landing/FinalCtaSection.vue'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: '기능 — YEMO',
    description: 'YEMO의 6가지 핵심 기능. 예약 캘린더, 시간 충돌 방지, 고객용 페이지, 카카오톡 알림, 고객 관리, 통계 대시보드.',
    keywords: 'YEMO 기능, 예약 캘린더, 시간 충돌, 카카오톡, 고객 관리, 통계',
  },
})

const features = [
  {
    id: 'calendar',
    icon: 'ph:calendar-blank',
    title: '한눈에 보는 예약 캘린더',
    desc: '일·주·월 뷰로 자유롭게 전환. 디자이너별 색상 구분으로 일정이 한눈에 들어옵니다. 드래그 한 번으로 예약 시간 조정.',
    bullets: ['일/주/월 뷰 전환', '디자이너별 색상', '드래그 시간 조정', '클릭 한 번으로 상세'],
  },
  {
    id: 'conflict',
    icon: 'ph:shield-check',
    title: '시간 충돌 자동 방지',
    desc: '이미 예약된 시간은 고객 페이지에서 자동 비활성화. 시술 시간이 자동 계산되어 컷+염색이면 120분이 자동 배정됩니다.',
    bullets: ['예약 시간 자동 비활성화', '시술 시간 자동 계산', '점심·휴무 시간 자동 제외'],
  },
  {
    id: 'page',
    icon: 'ph:link',
    title: '고객용 예약 페이지',
    desc: 'yourshop.yemo.io 형식의 전용 주소. 모바일 최적화로 스마트폰에서 빠르게 예약. 카카오톡으로 링크 공유만 하면 끝.',
    bullets: ['전용 도메인 자동 발급', '모바일 완벽 최적화', '디자이너 포트폴리오 노출'],
  },
  {
    id: 'kakao',
    icon: 'ph:chat-circle-dots',
    title: '카카오톡 3단계 알림',
    desc: '예약 확정 즉시 → 하루 전 자동 리마인더 → 시술 완료 후 리뷰 요청. 3개월 후 재방문 알림까지 자동.',
    bullets: ['예약 확정 알림', '하루 전 리마인더', '재방문 알림 (3개월/2개월)'],
  },
  {
    id: 'crm',
    icon: 'ph:users',
    title: '고객 관리(CRM)',
    desc: '방문 횟수·총 결제 금액 자동 집계. 이전 시술 내역 자동 저장. VIP·단골·신규 태그로 한눈에 분류.',
    bullets: ['방문/매출 자동 집계', '시술 이력 자동 저장', 'VIP·단골 태그'],
  },
  {
    id: 'stats',
    icon: 'ph:chart-bar',
    title: '실시간 통계 대시보드',
    desc: '오늘·이번 주·이번 달 매출. 예약 건수 그래프. 인기 시술 순위. 디자이너별 성과를 데이터로 확인.',
    bullets: ['매출·예약 그래프', '인기 시술 순위', '디자이너별 성과'],
  },
]

const scrollTo = id => {
  const el = document.getElementById(`feature-${id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="feats">
    <YSection eyebrow="Features" title="YEMO의 6가지 핵심 기능" align="center" sub="예약 받는 일이 자동이 되면, 사장님은 손님에게 집중할 수 있습니다." />

    <div class="feats__main">
      <aside class="feats__nav">
        <ul>
          <li v-for="f in features" :key="f.id">
            <button @click="scrollTo(f.id)">
              <Icon :icon="f.icon" aria-hidden="true" />
              <span>{{ f.title }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <article class="feats__body">
        <div
          v-for="(f, i) in features"
          :id="`feature-${f.id}`"
          :key="f.id"
          class="feat-row"
          :class="{ 'feat-row--reverse': i % 2 === 1 }"
        >
          <div class="feat-row__text">
            <div class="feat-row__icon"><Icon :icon="f.icon" aria-hidden="true" /></div>
            <h2 class="t-display-md t-strong">{{ f.title }}</h2>
            <p class="feat-row__desc">{{ f.desc }}</p>
            <ul class="feat-row__bullets">
              <li v-for="b in f.bullets" :key="b">
                <Icon icon="ph:check-circle" aria-hidden="true" /><span>{{ b }}</span>
              </li>
            </ul>
          </div>
          <div class="feat-row__visual" aria-hidden="true">
            <div class="feat-row__screen">
              <Icon :icon="f.icon" />
            </div>
          </div>
        </div>
      </article>
    </div>

    <IndustrySection />
    <FinalCtaSection />
  </div>
</template>

<style lang="scss" scoped>
.feats { background: var(--y-bg); }

.feats__main {
  max-width: 1200px;
  margin-inline: auto;
  padding: 0 32px 96px;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 64px;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    padding: 0 16px 64px;
    gap: 32px;
  }
}

.feats__nav {
  position: sticky;
  top: 96px;
  align-self: start;
  @media (max-width: 968px) { display: none; }

  ul { display: flex; flex-direction: column; gap: 4px; }
  button {
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--y-text-muted);
    border-radius: var(--y-radius);
    text-align: left;
    transition: all var(--y-dur-fast) var(--y-ease);
    &:hover { background: var(--y-surface-elev); color: var(--y-text); }
    svg { width: 16px; height: 16px; flex-shrink: 0; }
  }
}

.feats__body { display: flex; flex-direction: column; gap: 96px; }

.feat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  &--reverse .feat-row__text { order: 2; }
  &--reverse .feat-row__visual { order: 1; }
  @media (max-width: 768px) {
    &--reverse .feat-row__text { order: 1; }
    &--reverse .feat-row__visual { order: 2; }
  }

  &__icon {
    width: 48px; height: 48px;
    border-radius: var(--y-radius);
    background: var(--y-accent-soft);
    color: var(--y-accent-deep);
    display: inline-flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    svg { width: 24px; height: 24px; }
  }
  &__desc {
    font-size: 16px;
    line-height: 1.7;
    color: var(--y-text-muted);
    margin: 20px 0 24px;
  }
  &__bullets {
    display: flex; flex-direction: column; gap: 10px;
    li {
      display: flex; gap: 8px; align-items: center;
      font-size: 14px; color: var(--y-text);
      svg { width: 18px; height: 18px; color: var(--y-accent-deep); }
    }
  }

  &__visual {
    background: linear-gradient(135deg, var(--y-accent-soft), var(--y-surface-elev));
    border-radius: var(--y-radius-2xl);
    aspect-ratio: 4/3;
    display: flex; align-items: center; justify-content: center;
  }
  &__screen {
    width: 80px; height: 80px;
    border-radius: var(--y-radius-xl);
    background: var(--y-surface);
    box-shadow: var(--y-shadow-lg);
    display: inline-flex; align-items: center; justify-content: center;
    svg { width: 40px; height: 40px; color: var(--y-accent-deep); }
  }
}
</style>
