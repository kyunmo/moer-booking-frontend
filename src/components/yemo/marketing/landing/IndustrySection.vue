<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import YSection from '@/components/yemo/YSection.vue'

const tabs = [
  {
    key: 'hair',
    label: '미용실',
    icon: 'ph:scissors',
    features: [
      { title: '디자이너 포트폴리오', desc: '시술 전후 사진 업로드, 해시태그 분류, 고객이 보고 예약' },
      { title: '재방문 자동 알림', desc: '펌 3개월 후, 염색 2개월 후 자동 발송' },
      { title: '시술 시간 자동 계산', desc: '컷+염색 120분 자동 배정' },
    ],
  },
  {
    key: 'pilates',
    label: '필라테스·요가',
    icon: 'ph:heartbeat',
    features: [
      { title: '그룹 수업 관리', desc: '정원 설정, 대기자 자동 관리, 취소 시 자동 알림' },
      { title: '수강권·횟수권', desc: '출석 체크로 잔여 횟수 자동 차감, 만료 알림' },
      { title: '출석 관리', desc: 'QR 셀프 체크인 또는 수동 체크, 출석률 통계' },
    ],
  },
  {
    key: 'cafe',
    label: '스터디카페·공방',
    icon: 'ph:armchair',
    features: [
      { title: '좌석·룸 선택', desc: '배치도로 시각적 선택, 실시간 예약 현황' },
      { title: '시간당 요금', desc: '2시간권·종일권 등록, 초과 시간 자동 과금' },
      { title: '단체 예약', desc: '스터디그룹 예약, 그룹 할인 자동 적용' },
    ],
  },
]
const active = ref('hair')
</script>

<template>
  <YSection eyebrow="Industry" title="업종별 맞춤 기능" align="center">
    <div class="ind">
      <div class="ind__tabs-wrap">
        <div class="ind__tabs" role="tablist">
          <button
            v-for="t in tabs"
            :key="t.key"
            role="tab"
            :aria-selected="active === t.key"
            class="ind__tab"
            :class="{ 'is-active': active === t.key }"
            @click="active = t.key"
          >
            <Icon :icon="t.icon" aria-hidden="true" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>
      <div class="ind__panel">
        <div v-for="t in tabs" v-show="active === t.key" :key="t.key" class="ind__grid">
          <div v-for="f in t.features" :key="f.title" class="ind__feature">
            <Icon icon="ph:check-circle" class="ind__check" aria-hidden="true" />
            <div>
              <h4 class="t-title-sm t-strong">{{ f.title }}</h4>
              <p class="t-body-sm t-muted">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.ind {
  max-width: 960px;
  margin-inline: auto;

  &__tabs-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
  }
  &__tabs {
    display: inline-flex;
    background: var(--y-surface);
    border: 1px solid var(--y-border);
    border-radius: var(--y-radius-pill);
    padding: 4px;
    gap: 4px;
    @media (max-width: 480px) { width: 100%; }
  }
  &__tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--y-text-muted);
    border-radius: var(--y-radius-pill);
    transition: all var(--y-dur-fast) var(--y-ease);
    flex: 1;
    justify-content: center;
    &:hover { color: var(--y-text); }
    &.is-active {
      background: var(--y-text-strong);
      color: var(--y-bg);
    }
    svg { width: 18px; height: 18px; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
  }
  &__feature {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  &__check {
    width: 20px; height: 20px;
    color: var(--y-accent-deep);
    flex-shrink: 0;
    margin-top: 2px;
  }
}
</style>
