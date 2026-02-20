<route lang="yaml">
meta:
  layout: public
  public: true
  title: 요금제 - YEMO
  description: 무료로 시작하고 필요할 때 업그레이드. 월 22,000원(VAT 포함)으로 모든 기능을 사용하세요.
  keywords: 예약 시스템 가격, 요금제, 무료 체험, 월 결제, 연간 결제
</route>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PricingCard from '@/components/pricing/PricingCard.vue'
import { PLANS, BILLING_CYCLES, formatCurrency, getMonthlyEquivalent, getYearlySavings } from '@/constants/pricing'

const router = useRouter()
const selectedPlan = ref('PAID')
const billingCycle = ref('yearly')

const isYearly = computed({
  get: () => billingCycle.value === 'yearly',
  set: (val) => { billingCycle.value = val ? 'yearly' : 'monthly' },
})

// 플랜별 상세 정보 (2티어: 무료 + 유료)
const plansDetail = computed(() => {
  const paidMonthlyEquivalent = getMonthlyEquivalent('PAID', billingCycle.value)

  return {
    FREE: {
      name: '무료',
      price: 0,
      priceText: '0원',
      features: [
        { text: '월 예약 30건', included: true },
        { text: '직원 1명', included: true },
        { text: '시술 메뉴 관리', included: true },
        { text: '예약 캘린더', included: true },
        { text: '수동 예약 등록', included: true },
        { text: '휴무일 설정', included: true },
        { text: '고객 기본 정보', included: true },
        { text: '방문 이력 (최근 10건)', included: true },
        { text: '카카오톡 자동 알림', included: false },
        { text: '고객 태그 관리', included: false },
        { text: '통계 및 리포트', included: false },
      ],
      limits: [
        '월 30건 초과 시 업그레이드 필요',
      ],
    },
    PAID: {
      name: '유료',
      price: paidMonthlyEquivalent,
      priceText: formatCurrency(paidMonthlyEquivalent),
      priceSubText: billingCycle.value === 'yearly'
        ? `연 ${formatCurrency(PLANS.PAID.yearlyPriceVatIncluded)} (VAT 포함)`
        : '(VAT 포함)',
      badge: '추천',
      features: [
        { text: '월 예약 무제한', included: true },
        { text: '직원 5명', included: true },
        { text: '시술 메뉴 무제한', included: true },
        { text: '예약 캘린더 (일/주/월 뷰)', included: true },
        { text: '예약 승인/거절', included: true },
        { text: '고객 자동 등록', included: true },
        { text: '방문 이력 무제한', included: true },
        { text: '고객 태그 관리 (VIP, 단골)', included: true },
        { text: '카카오톡 자동 알림', included: true },
        { text: '통계 및 리포트', included: true },
        { text: '디자이너별 성과 분석', included: true },
      ],
    },
  }
})

// FAQ 데이터
const faqs = [
  {
    question: '가격에 VAT가 포함되어 있나요?',
    answer: '네, 표시된 가격은 모두 VAT 포함 금액입니다.\n\n유료 플랜 월 22,000원(VAT 포함)이며, 사업자 고객은 세금계산서 발행이 가능합니다.\n(공급가액 20,000원 + VAT 2,000원)',
  },
  {
    question: '30일 무료 체험은 어떻게 이용하나요?',
    answer: '유료 플랜을 30일간 무료로 체험할 수 있습니다.\n\n• 30일 동안 유료 플랜의 모든 기능 사용\n• 신용카드 등록 불필요\n• 체험 종료 후 자동 과금 없음\n• 체험 종료 후 무료 플랜으로 자동 전환\n\n무료 플랜은 체험 없이 바로 사용 가능합니다.',
  },
  {
    question: '무료 플랜에서 예약 30건을 초과하면 어떻게 되나요?',
    answer: '월 30건 초과 시 새로운 예약 등록이 제한됩니다.\n\n기존 예약은 그대로 유지되며, 유료 플랜으로 업그레이드하면 즉시 무제한으로 사용 가능합니다.\n\n다음 달 1일에 예약 카운트가 초기화됩니다.',
  },
  {
    question: '직원 수를 초과하면?',
    answer: '업그레이드가 필요합니다.\n\n무료: 1명 → 유료: 5명\n\n무료 플랜에서 2명째 직원 추가 시 "유료 플랜으로 업그레이드하세요" 안내가 표시됩니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '공정하게 처리합니다.\n\n30일 무료 체험 기간: 과금 없음\n\n유료 전환 후: 사용 일수 차감 후 일할 계산 환불\n예: 월 22,000원(VAT 포함), 10일 사용 → 약 14,667원 환불\n\n환불 신청 후 5영업일 이내 처리됩니다.',
  },
  {
    question: '플랜을 변경하면 데이터는 어떻게 되나요?',
    answer: '모든 데이터는 그대로 유지됩니다.\n\n업그레이드 (무료 → 유료):\n모든 데이터 유지 + 추가 기능 즉시 활성화\n\n다운그레이드 (유료 → 무료):\n모든 데이터 유지, 단 직원 수/예약 건수 제한 적용\n예: 유료→무료 시 고객 이력은 유지되지만 최근 10건만 표시',
  },
  {
    question: '연간 결제 시 할인이 있나요?',
    answer: '네! 연간 결제 시 2개월 무료 혜택이 적용됩니다.\n\n월 결제: 22,000원 × 12개월 = 264,000원/년 (VAT 포함)\n연간 결제: 220,000원/년 (VAT 포함)\n\n절약 금액: 44,000원 (VAT 포함)\n\n연간 결제를 선택하면 월 환산 약 18,333원(VAT 포함)에 모든 기능을 사용하실 수 있습니다.',
  },
  {
    question: '월 결제에서 연간 결제로 변경 가능한가요?',
    answer: '네, 구독 관리에서 언제든 변경 가능합니다.\n\n변경 방법:\n1. 대시보드 > 구독 관리\n2. "결제 주기 변경" 선택\n3. 연간 결제 선택\n4. 차액 결제 후 즉시 적용\n\n이미 결제한 월 구독료는 일할 계산하여 차감됩니다.',
  },
]

function selectPlan(plan) {
  selectedPlan.value = plan
}

function startWithPlan(plan) {
  router.push({
    path: '/register',
    query: { plan },
  })
}
</script>

<template>
  <div class="pricing-page">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <VContainer>
        <div class="text-center">
          <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">
            심플한 요금제
          </h1>
          <p class="text-h6 text-medium-emphasis mb-2">
            숨겨진 비용 없음 | 언제든 해지 가능 | 플랜 변경 자유
          </p>
          <VChip color="success" variant="tonal" size="large" prepend-icon="ri-gift-line" class="mt-2">
            30일 무료 체험
          </VChip>
        </div>
      </VContainer>
    </section>

    <!-- 요금제 카드 -->
    <section class="pricing-cards-section py-12">
      <VContainer>
        <!-- 월/연간 결제 토글 -->
        <div class="d-flex align-center justify-center gap-4 mb-8">
          <span class="text-body-1" :class="{ 'font-weight-bold text-primary': billingCycle === 'monthly' }">월 결제</span>
          <VSwitch v-model="isYearly" hide-details inset color="primary" />
          <span class="text-body-1" :class="{ 'font-weight-bold text-primary': billingCycle === 'yearly' }">
            연간 결제
            <VChip color="success" size="x-small" class="ms-1">2개월 무료</VChip>
          </span>
        </div>

        <VRow justify="center">
          <VCol
            v-for="plan in ['FREE', 'PAID']"
            :key="plan"
            cols="12"
            sm="6"
            md="5"
            lg="4"
          >
            <PricingCard
              :plan="plan"
              :billing-cycle="billingCycle"
              :selected="selectedPlan === plan"
              @select="selectPlan"
            />
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- 상세 비교표 -->
    <section class="comparison-section py-16 bg-surface">
      <VContainer>
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-2">
            상세 기능 비교
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            무료 플랜과 유료 플랜의 기능을 비교해보세요
          </p>
        </div>

        <!-- 모바일: 탭으로 전환 -->
        <div class="d-md-none mb-6">
          <VTabs v-model="selectedPlan" grow>
            <VTab value="FREE">무료</VTab>
            <VTab value="PAID">유료</VTab>
          </VTabs>

          <VCard class="mt-4">
            <VCardTitle class="text-center">
              {{ plansDetail[selectedPlan].name }}
              <VChip
                v-if="plansDetail[selectedPlan].badge"
                color="primary"
                size="small"
                class="ms-2"
              >
                {{ plansDetail[selectedPlan].badge }}
              </VChip>
            </VCardTitle>
            <VCardText>
              <div class="text-center mb-4">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ plansDetail[selectedPlan].priceText }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  /월 {{ plansDetail[selectedPlan].priceSubText || '' }}
                </div>
              </div>

              <VList>
                <VListItem
                  v-for="(feature, index) in plansDetail[selectedPlan].features"
                  :key="index"
                  density="compact"
                >
                  <template #prepend>
                    <VIcon
                      :icon="feature.included ? 'ri-check-line' : 'ri-close-line'"
                      :color="feature.included ? 'success' : 'error'"
                      size="20"
                    />
                  </template>
                  <VListItemTitle :class="{ 'text-medium-emphasis': !feature.included }">
                    {{ feature.text }}
                  </VListItemTitle>
                </VListItem>
              </VList>

              <VDivider v-if="plansDetail[selectedPlan].limits" class="my-4" />

              <div v-if="plansDetail[selectedPlan].limits">
                <div class="text-subtitle-2 font-weight-bold mb-2">제한 사항</div>
                <VList density="compact">
                  <VListItem
                    v-for="(limit, index) in plansDetail[selectedPlan].limits"
                    :key="index"
                  >
                    <template #prepend>
                      <VIcon icon="ri-error-warning-line" color="warning" size="20" />
                    </template>
                    <VListItemTitle class="text-body-2">
                      {{ limit }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </div>

              <VBtn
                block
                color="primary"
                size="large"
                class="mt-4"
                @click="startWithPlan(selectedPlan)"
              >
                {{ selectedPlan === 'FREE' ? '무료로 시작하기' : '30일 무료 체험' }}
              </VBtn>
            </VCardText>
          </VCard>
        </div>

        <!-- 데스크톱: 테이블 -->
        <VTable class="d-none d-md-block comparison-table">
          <thead>
            <tr>
              <th class="text-left" style="width: 50%">기능</th>
              <th class="text-center" style="width: 25%">
                <div class="py-4">
                  <div class="text-h6 font-weight-bold">무료</div>
                  <div class="text-h5 font-weight-bold text-info mt-2">0원</div>
                  <div class="text-caption">/월</div>
                </div>
              </th>
              <th class="text-center" style="width: 25%">
                <div class="py-4">
                  <VChip color="primary" size="small" class="mb-2">추천</VChip>
                  <div class="text-h6 font-weight-bold">유료</div>
                  <div class="text-h5 font-weight-bold text-primary mt-2">
                    {{ plansDetail.PAID.priceText }}
                  </div>
                  <div class="text-caption">/월 {{ plansDetail.PAID.priceSubText || '' }}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(feature, index) in plansDetail.PAID.features" :key="index">
              <td class="text-body-2 font-weight-medium">{{ feature.text }}</td>
              <td class="text-center">
                <VIcon
                  v-if="plansDetail.FREE.features[index]?.included"
                  icon="ri-check-line"
                  color="success"
                  size="24"
                />
                <VIcon v-else icon="ri-close-line" color="error" size="24" />
              </td>
              <td class="text-center">
                <VIcon
                  v-if="plansDetail.PAID.features[index]?.included"
                  icon="ri-check-line"
                  color="success"
                  size="24"
                />
                <VIcon v-else icon="ri-close-line" color="error" size="24" />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td class="text-center py-4">
                <VBtn color="info" variant="outlined" @click="startWithPlan('FREE')">
                  무료로 시작하기
                </VBtn>
              </td>
              <td class="text-center py-4">
                <VBtn color="primary" @click="startWithPlan('PAID')">
                  30일 무료 체험
                </VBtn>
              </td>
            </tr>
          </tfoot>
        </VTable>

        <p class="text-body-2 text-medium-emphasis text-center mt-4">
          * 일부 기능은 베타 기간 중 순차 오픈됩니다
        </p>
      </VContainer>
    </section>

    <!-- FAQ 섹션 -->
    <section class="faq-section py-16">
      <VContainer>
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-2">
            자주 묻는 질문
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            요금제에 대해 궁금한 점을 확인하세요
          </p>
        </div>

        <VRow justify="center">
          <VCol cols="12" md="10" lg="8">
            <VExpansionPanels>
              <VExpansionPanel
                v-for="(faq, index) in faqs"
                :key="index"
                :value="index"
              >
                <VExpansionPanelTitle class="text-h6">
                  {{ faq.question }}
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  <div class="text-body-2" style="white-space: pre-line;">
                    {{ faq.answer }}
                  </div>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </VCol>
        </VRow>

        <div class="text-center mt-8">
          <p class="text-body-1 mb-4">
            더 궁금한 점이 있으신가요?
          </p>
          <VBtn variant="outlined" to="/support">
            1:1 문의하기
            <VIcon icon="ri-arrow-right-line" end />
          </VBtn>
        </div>
      </VContainer>
    </section>

    <!-- 최종 CTA -->
    <section class="final-cta-section py-16 bg-primary">
      <VContainer>
        <VRow align="center" justify="center">
          <VCol cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-bold mb-4 text-white">
              지금 시작하세요
            </h2>
            <p class="text-h6 mb-8 text-white opacity-90">
              커피 2~3잔 값으로 예약 관리 자동화
            </p>
            <VBtn
              size="x-large"
              color="white"
              prepend-icon="ri-rocket-line"
              @click="startWithPlan('PAID')"
            >
              30일 무료 체험 시작하기
            </VBtn>
            <div class="d-flex flex-wrap justify-center gap-3 mt-6">
              <div class="d-flex align-center text-white text-body-2">
                <VIcon icon="ri-check-line" size="20" class="me-1" />
                신용카드 등록 불필요
              </div>
              <VDivider vertical class="mx-2 opacity-50" />
              <div class="d-flex align-center text-white text-body-2">
                <VIcon icon="ri-check-line" size="20" class="me-1" />
                30일 동안 모든 기능 무료
              </div>
              <VDivider vertical class="mx-2 opacity-50" />
              <div class="d-flex align-center text-white text-body-2">
                <VIcon icon="ri-check-line" size="20" class="me-1" />
                언제든 해지 가능
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.pricing-page {
  width: 100%;
}

.hero-section {
  padding-block: 80px 60px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.pricing-cards-section {
  background-color: rgb(var(--v-theme-background));
}

.comparison-section {
  background-color: rgb(var(--v-theme-surface));
}

.comparison-table {
  th {
    background-color: rgb(var(--v-theme-surface));
    border-bottom: 2px solid rgb(var(--v-theme-primary));
  }

  tbody tr:hover {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}

.faq-section {
  background-color: rgb(var(--v-theme-background));
}

.final-cta-section {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(99, 102, 241, 0.8) 100%);
}
</style>
