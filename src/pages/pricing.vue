<route lang="yaml">
meta:
  layout: public
  public: true
  title: 요금제 - YEMO
  description: 업종과 규모에 맞는 합리적인 요금제. 30일 무료 체험으로 먼저 경험해보세요. 월 29,000원부터 시작.
  keywords: 예약 시스템 가격, 요금제, 무료 체험, 베이직 플랜, 프로 플랜
</route>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PricingCard from '@/components/pricing/PricingCard.vue'

const router = useRouter()
const selectedPlan = ref('BASIC')

// 플랜별 상세 정보 (백엔드 스펙 기준)
const plansDetail = {
  FREE: {
    name: '무료',
    price: 0,
    priceText: '0원',
    features: [
      { text: '월 예약 30건', included: true },
      { text: '직원 1명', included: true },
      { text: '시술 메뉴 10개', included: true },
      { text: '예약 캘린더', included: true },
      { text: '수동 예약 등록', included: true },
      { text: '휴무일 설정', included: true },
      { text: '고객 기본 정보', included: true },
      { text: '방문 이력 (최근 10건)', included: true },
      { text: '카카오톡 알림', included: false },
      { text: '고객 태그', included: false },
      { text: '고급 통계', included: false },
    ],
    limits: [
      '월 30건 초과 시 업그레이드 필요',
      '하단 광고 표시',
    ],
  },
  BASIC: {
    name: '베이직',
    price: 29000,
    priceText: '29,000원',
    badge: '가장 인기',
    features: [
      { text: '월 예약 100건', included: true },
      { text: '직원 3명', included: true },
      { text: '시술 메뉴 무제한', included: true },
      { text: '예약 캘린더 (일/주/월 뷰)', included: true },
      { text: '예약 승인/거절', included: true },
      { text: '고객 자동 등록', included: true },
      { text: '방문 이력 무제한', included: true },
      { text: '고객 태그 관리 (VIP, 단골)', included: true },
      { text: '카카오톡 자동 알림', included: true },
      { text: '오늘/주간/월간 매출', included: true },
      { text: '광고 제거', included: true },
      { text: '재방문 알림', included: false },
      { text: '디자이너별 성과', included: false },
    ],
  },
  PRO: {
    name: '프로',
    price: 79000,
    priceText: '79,000원',
    features: [
      { text: '월 예약 500건', included: true },
      { text: '직원 10명', included: true },
      { text: '베이직 플랜 모든 기능', included: true },
      { text: '재방문 자동 알림', included: true },
      { text: '디자이너별 성과 분석', included: true },
      { text: '시간대별 예약 분석', included: true },
      { text: '고급 통계 대시보드', included: true },
      { text: 'CSV/Excel 데이터 추출', included: true },
      { text: '우선 기술 지원', included: true },
    ],
  },
}

// FAQ 데이터
const faqs = [
  {
    question: 'VAT는 별도인가요?',
    answer: '네, VAT 10%가 별도 부과됩니다.\n\n베이직 29,000원 + VAT 2,900원 = 31,900원\n프로 79,000원 + VAT 5,900원 = 86,900원\n\n사업자 고객은 세금계산서 발행 가능합니다.',
  },
  {
    question: '30일 무료 체험은 어떤 플랜인가요?',
    answer: '베이직 또는 프로 플랜을 선택하여 체험 가능합니다.\n\n• 30일 동안 선택한 플랜의 모든 기능 사용\n• 신용카드 등록 불필요\n• 체험 종료 후 자동 과금 없음\n• 원하시면 유료 플랜으로 전환\n\n무료 플랜은 체험 없이 바로 사용 가능합니다.',
  },
  {
    question: '예약 건수를 초과하면 어떻게 되나요?',
    answer: '자동으로 차단되지 않습니다.\n\n무료 플랜 (월 30건): 30건 초과 시 알림 후 업그레이드 권장\n베이직 플랜 (월 100건): 100건 초과 시 알림 후 프로 플랜 권장\n프로 플랜: 500건까지 가능\n\n초과해도 예약은 계속 접수되며, 다음 달부터 적절한 플랜으로 업그레이드를 권장드립니다.',
  },
  {
    question: '직원 수를 초과하면?',
    answer: '업그레이드가 필요합니다.\n\n무료: 1명 → 베이직: 3명 → 프로: 10명\n\n베이직 플랜에서 4명째 직원 추가 시도 시 "프로 플랜으로 업그레이드하세요" 안내가 표시됩니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '공정하게 처리합니다.\n\n30일 무료 체험 기간: 100% 환불 (이용 기간 상관없이)\n\n유료 전환 후: 사용 일수 차감 후 일할 계산 환불\n예: 월 29,000원, 10일 사용 → 19,000원 환불\n\n환불 신청 후 5영업일 이내 처리됩니다.',
  },
  {
    question: '플랜을 변경하면 데이터는 어떻게 되나요?',
    answer: '모든 데이터는 그대로 유지됩니다.\n\n업그레이드 (무료 → 베이직 → 프로):\n모든 데이터 유지 + 추가 기능 사용 가능\n\n다운그레이드 (프로 → 베이직 → 무료):\n모든 데이터 유지되지만 제한 사항 적용\n예: 베이직→무료 시 고객 이력은 유지되지만 최근 10건만 표시',
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
            간단하고 투명한 요금제
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
        <VRow>
          <VCol
            v-for="plan in ['FREE', 'BASIC', 'PRO']"
            :key="plan"
            cols="12"
            md="4"
          >
            <PricingCard
              :plan="plan"
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
            플랜별 제공되는 기능을 자세히 비교해보세요
          </p>
        </div>

        <!-- 모바일: 탭으로 전환 -->
        <div class="d-md-none mb-6">
          <VTabs v-model="selectedPlan" grow>
            <VTab value="FREE">무료</VTab>
            <VTab value="BASIC">베이직</VTab>
            <VTab value="PRO">프로</VTab>
          </VTabs>

          <VCard class="mt-4">
            <VCardTitle class="text-center">
              {{ plansDetail[selectedPlan].name }}
              <VChip
                v-if="plansDetail[selectedPlan].badge"
                color="success"
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
                  /월 (VAT 별도)
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
              <th class="text-left" style="width: 40%">기능</th>
              <th class="text-center" style="width: 20%">
                <div class="py-4">
                  <div class="text-h6 font-weight-bold">무료</div>
                  <div class="text-h5 font-weight-bold text-info mt-2">0원</div>
                  <div class="text-caption">/월</div>
                </div>
              </th>
              <th class="text-center" style="width: 20%">
                <div class="py-4">
                  <VChip color="success" size="small" class="mb-2">가장 인기</VChip>
                  <div class="text-h6 font-weight-bold">베이직</div>
                  <div class="text-h5 font-weight-bold text-success mt-2">29,000원</div>
                  <div class="text-caption">/월</div>
                </div>
              </th>
              <th class="text-center" style="width: 20%">
                <div class="py-4">
                  <div class="text-h6 font-weight-bold">프로</div>
                  <div class="text-h5 font-weight-bold text-primary mt-2">79,000원</div>
                  <div class="text-caption">/월</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 기능별 행 생성 -->
            <tr v-for="(feature, index) in plansDetail.BASIC.features" :key="index">
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
                  v-if="plansDetail.BASIC.features[index]?.included"
                  icon="ri-check-line"
                  color="success"
                  size="24"
                />
                <VIcon v-else icon="ri-close-line" color="error" size="24" />
              </td>
              <td class="text-center">
                <VIcon
                  v-if="plansDetail.PRO.features[index]?.included"
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
                <VBtn color="success" @click="startWithPlan('BASIC')">
                  30일 무료 체험
                </VBtn>
              </td>
              <td class="text-center py-4">
                <VBtn color="primary" @click="startWithPlan('PRO')">
                  30일 무료 체험
                </VBtn>
              </td>
            </tr>
          </tfoot>
        </VTable>
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
              완벽한 요금제를 찾으셨나요?
            </p>
            <VBtn
              size="x-large"
              color="white"
              prepend-icon="ri-rocket-line"
              @click="startWithPlan('BASIC')"
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
