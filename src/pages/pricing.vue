<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import YBtn from '@/components/yemo/YBtn.vue'
import YTag from '@/components/yemo/YTag.vue'
import YSection from '@/components/yemo/YSection.vue'
import FinalCtaSection from '@/components/yemo/marketing/landing/FinalCtaSection.vue'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: '요금제 — YEMO',
    description: '무료로 시작하고 필요할 때 업그레이드. 월 20,000원(VAT 별도)으로 모든 기능 사용. 30일 무료 체험.',
    keywords: '예약 시스템 가격, 요금제, 무료 체험, 월 결제, 연간 결제',
  },
})

const router = useRouter()
const cycle = ref('monthly')

const paid = computed(() => cycle.value === 'yearly'
  ? { price: '16,000', sub: '연 192,000원 청구 (20% 할인)' }
  : { price: '20,000', sub: 'VAT 별도 · 언제든 해지' })

const compareRows = [
  { feature: '월 요금', free: '0원', paid: () => cycle.value === 'yearly' ? '16,000원 (연 결제)' : '20,000원' },
  { feature: '월 예약 건수', free: '50건', paid: () => '무제한' },
  { feature: '디자이너', free: '1명', paid: () => '5명' },
  { feature: '시술 메뉴', free: '10개', paid: () => '무제한' },
  { feature: '카카오톡 알림', free: false, paid: () => true },
  { feature: '재방문 자동 알림', free: false, paid: () => true },
  { feature: '포트폴리오', free: '5장', paid: () => '무제한' },
  { feature: '고급 통계', free: false, paid: () => true },
  { feature: '이메일 지원', free: true, paid: () => true },
]

const faqs = [
  { q: '연간 결제 시 위약금이 있나요?', a: '없습니다. 해지 시 남은 기간 일할 환불 처리합니다.' },
  { q: '무료에서 유료로 변경하면 데이터가 유지되나요?', a: '네, 모든 기존 데이터가 유지됩니다. 디자이너·시술 메뉴·고객 정보 그대로 이어집니다.' },
  { q: '환불은 어떻게 받나요?', a: '대시보드의 결제 메뉴에서 해지하면 자동으로 환불 처리됩니다. 일할 계산되어 영업일 기준 3-5일 내 입금됩니다.' },
]

const openFaq = ref(-1)
</script>

<template>
  <div class="pricing">
    <YSection eyebrow="Pricing" title="간단하고 투명한 요금제" align="center" sub="숨겨진 비용 없음. 언제든 해지 가능. 플랜 변경 자유.">
      <div class="pricing__toggle-wrap">
        <div class="pricing__toggle" role="tablist">
          <button
            role="tab"
            :aria-selected="cycle === 'monthly'"
            class="pricing__toggle-btn"
            :class="{ 'is-active': cycle === 'monthly' }"
            @click="cycle = 'monthly'"
          >월간 결제</button>
          <button
            role="tab"
            :aria-selected="cycle === 'yearly'"
            class="pricing__toggle-btn"
            :class="{ 'is-active': cycle === 'yearly' }"
            @click="cycle = 'yearly'"
          >
            연간 결제 <span class="pricing__save">−20%</span>
          </button>
        </div>
      </div>

      <div class="pricing__plans">
        <div class="plan">
          <div class="plan__name">무료</div>
          <div class="plan__price">
            <span class="plan__amount">0</span>
            <span class="plan__currency">원 / 월</span>
          </div>
          <p class="plan__sub">체험용으로 딱</p>
          <YBtn variant="secondary" size="lg" block @click="router.push('/register')">무료로 시작</YBtn>
        </div>
        <div class="plan plan--featured">
          <YTag variant="accent">대부분이 선택</YTag>
          <div class="plan__name">유료</div>
          <div class="plan__price">
            <span class="plan__amount">{{ paid.price }}</span>
            <span class="plan__currency">원 / 월</span>
          </div>
          <p class="plan__sub">{{ paid.sub }}</p>
          <YBtn variant="accent" size="lg" block @click="router.push('/register')">유료 플랜 시작</YBtn>
        </div>
      </div>
    </YSection>

    <YSection eyebrow="Compare" title="플랜 비교" align="center">
      <div class="compare">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>무료</th>
              <th>유료</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in compareRows" :key="row.feature">
              <td>{{ row.feature }}</td>
              <td>
                <template v-if="typeof row.free === 'boolean'">
                  <Icon :icon="row.free ? 'ph:check' : 'ph:x'" :class="row.free ? 'ok' : 'no'" />
                </template>
                <template v-else>{{ row.free }}</template>
              </td>
              <td class="paid">
                <template v-if="typeof row.paid() === 'boolean'">
                  <Icon :icon="row.paid() ? 'ph:check' : 'ph:x'" :class="row.paid() ? 'ok' : 'no'" />
                </template>
                <template v-else>{{ row.paid() }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </YSection>

    <YSection eyebrow="FAQ" title="요금제 관련 자주 묻는 질문" align="center">
      <div class="faq">
        <button
          v-for="(item, i) in faqs"
          :key="item.q"
          class="faq__item"
          :class="{ 'is-open': openFaq === i }"
          :aria-expanded="openFaq === i"
          @click="openFaq = openFaq === i ? -1 : i"
        >
          <div class="faq__q">
            <span>{{ item.q }}</span>
            <Icon :icon="openFaq === i ? 'ph:minus' : 'ph:plus'" aria-hidden="true" />
          </div>
          <div v-show="openFaq === i" class="faq__a">{{ item.a }}</div>
        </button>
      </div>
    </YSection>

    <FinalCtaSection />
  </div>
</template>

<style lang="scss" scoped>
.pricing { background: var(--y-bg); }

.pricing__toggle-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 56px;
}
.pricing__toggle {
  display: inline-flex;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-pill);
  padding: 4px;
}
.pricing__toggle-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--y-text-muted);
  border-radius: var(--y-radius-pill);
  display: inline-flex; align-items: center; gap: 6px;
  &.is-active { background: var(--y-text-strong); color: var(--y-bg); }
}
.pricing__save {
  background: var(--y-accent);
  color: var(--y-text-strong);
  padding: 2px 6px;
  border-radius: var(--y-radius-sm);
  font-size: 10px;
  font-weight: 800;
}

.pricing__plans {
  max-width: 720px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}
.plan {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-2xl);
  padding: 36px 28px;
  display: flex; flex-direction: column; gap: 16px;

  &--featured {
    background: var(--y-text-strong);
    color: var(--y-bg);
    border-color: var(--y-text-strong);
    .plan__name, .plan__amount { color: var(--y-bg); }
    .plan__currency, .plan__sub { color: rgba(255, 255, 255, 0.7); }
  }
  &__name { font-size: 16px; font-weight: 700; color: var(--y-text-strong); }
  &__price { display: flex; align-items: baseline; gap: 4px; }
  &__amount { font-size: 42px; font-weight: 800; letter-spacing: -0.03em; color: var(--y-text-strong); }
  &__currency { font-size: 14px; color: var(--y-text-muted); }
  &__sub { font-size: 12px; color: var(--y-text-muted); }
}

.compare {
  max-width: 720px;
  margin-inline: auto;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-xl);
  overflow: hidden;

  table { width: 100%; border-collapse: collapse; }
  th, td {
    padding: 14px 20px;
    font-size: 14px;
    border-bottom: 1px solid var(--y-border);
    text-align: left;
  }
  th { background: var(--y-bg); font-weight: 700; color: var(--y-text-strong); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
  td.paid { font-weight: 600; color: var(--y-text-strong); }
  tr:last-child td { border-bottom: none; }
  svg { width: 18px; height: 18px; }
  .ok { color: var(--y-success); }
  .no { color: var(--y-text-disabled); }
}

.faq {
  max-width: 720px;
  margin-inline: auto;
  display: flex; flex-direction: column; gap: 8px;
  &__item {
    background: var(--y-surface);
    border: 1px solid var(--y-border);
    border-radius: var(--y-radius-lg);
    text-align: left; width: 100%;
    &.is-open { border-color: var(--y-accent); }
  }
  &__q {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px;
    font-size: 15px; font-weight: 600;
    color: var(--y-text-strong);
    svg { width: 20px; height: 20px; color: var(--y-text-muted); }
  }
  &__a { padding: 0 24px 24px; font-size: 14px; line-height: 1.7; color: var(--y-text-muted); }
}
</style>
