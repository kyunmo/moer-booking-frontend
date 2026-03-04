<template>
  <div>
    <!-- 페이지 헤더 -->
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-vip-crown-line" size="24" class="me-3" />
        <span>구독 관리</span>
      </VCardTitle>
      <VCardText class="pt-0">
        <p class="text-body-1 text-medium-emphasis mb-0">
          플랜, 결제 및 사용량을 관리하세요
        </p>
      </VCardText>
    </VCard>

    <!-- 탭 네비게이션 -->
    <VTabs v-model="activeTab" class="mb-6">
      <VTab value="plan">
        <VIcon icon="ri-vip-crown-line" class="me-2" />
        현재 플랜
      </VTab>
      <VTab value="payment">
        <VIcon icon="ri-bank-card-line" class="me-2" />
        결제
      </VTab>
      <VTab value="history">
        <VIcon icon="ri-file-list-line" class="me-2" />
        결제 이력
      </VTab>
    </VTabs>

    <!-- 결제 탭 (lazy load) -->
    <template v-if="activeTab === 'payment'">
      <Suspense>
        <PaymentView />
        <template #fallback>
          <div class="text-center pa-10">
            <VProgressCircular indeterminate color="primary" size="48" />
          </div>
        </template>
      </Suspense>
    </template>

    <!-- 결제 이력 탭 (lazy load) -->
    <template v-if="activeTab === 'history'">
      <Suspense>
        <PaymentHistoryView />
        <template #fallback>
          <div class="text-center pa-10">
            <VProgressCircular indeterminate color="primary" size="48" />
          </div>
        </template>
      </Suspense>
    </template>

    <!-- 현재 플랜 탭 -->
    <template v-if="activeTab === 'plan'">
    <!-- 로딩 상태 -->
    <div v-if="loading && !subscriptionInfo" class="text-center py-16">
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
      <p class="text-body-1 text-medium-emphasis mt-4">
        구독 정보를 불러오는 중...
      </p>
    </div>

    <!-- 구독 정보 -->
    <div v-else-if="subscriptionInfo">
      <VRow>
        <!-- 현재 플랜 카드 -->
        <VCol cols="12" md="8">
          <VCard>
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="ri-vip-crown-line" class="me-2" color="primary" />
                현재 플랜
              </VCardTitle>
            </VCardItem>

            <VCardText>
              <div class="d-flex align-center justify-space-between mb-6">
                <div>
                  <h3 class="text-h3 mb-2">
                    {{ planDescription }}
                  </h3>
                  <div class="d-flex align-center gap-2">
                    <VChip
                      :color="statusColor"
                      size="small"
                    >
                      {{ statusText }}
                    </VChip>
                    <VChip
                      v-if="isTrialActive"
                      color="success"
                      size="small"
                    >
                      체험판 진행 중
                    </VChip>
                  </div>
                </div>
                <div class="text-end">
                  <p class="text-h4 font-weight-bold text-primary">
                    {{ formattedPrice }}
                  </p>
                  <p v-if="priceSubText" class="text-body-2 text-medium-emphasis">
                    {{ priceSubText }}
                  </p>
                </div>
              </div>

              <!-- 체험판 안내 -->
              <VAlert
                v-if="isTrialActive && daysUntilTrialEnd !== null"
                type="info"
                variant="tonal"
                class="mb-6"
              >
                <div class="d-flex align-center">
                  <VIcon icon="ri-gift-line" class="me-2" />
                  <span>
                    <strong>30일 무료 체험 진행 중!</strong>
                    체험 종료까지 <strong>{{ daysUntilTrialEnd }}일</strong> 남았습니다.
                  </span>
                </div>
              </VAlert>

              <!-- 다음 결제일 -->
              <div v-if="nextBillingDate" class="mb-6">
                <p class="text-body-2 text-medium-emphasis mb-1">
                  다음 결제 예정일
                </p>
                <p class="text-body-1 font-weight-medium">
                  {{ formatDate(nextBillingDate) }}
                </p>
              </div>

              <!-- 플랜 변경 버튼 -->
              <div class="d-flex gap-2 flex-wrap">
                <VBtn
                  color="primary"
                  variant="elevated"
                  @click="openPlanChangeDialog"
                >
                  <VIcon icon="ri-refresh-line" start />
                  플랜 변경
                </VBtn>
                <VBtn
                  color="success"
                  variant="outlined"
                  @click="activeTab = 'history'"
                >
                  <VIcon icon="ri-file-list-line" start />
                  결제 내역
                </VBtn>
                <VBtn
                  v-if="status === 'ACTIVE'"
                  color="error"
                  variant="outlined"
                  @click="openCancelDialog"
                >
                  구독 취소
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- 사용량 카드 -->
        <VCol cols="12" md="4">
          <VCard>
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="ri-line-chart-line" class="me-2" color="success" />
                사용량
              </VCardTitle>
            </VCardItem>

            <VCardText>
              <!-- 스태프 수 -->
              <div class="mb-6">
                <div class="d-flex justify-space-between align-center mb-2">
                  <p class="text-body-2 text-medium-emphasis">
                    스태프 수
                  </p>
                  <p class="text-body-1 font-weight-medium">
                    {{ staffLimitText }}
                  </p>
                </div>
                <VProgressLinear
                  :model-value="staffUsagePercent"
                  :color="getUsageColor(staffUsagePercent)"
                  height="8"
                  rounded
                />
                <p
                  v-if="!canAddStaff"
                  class="text-caption text-error mt-1"
                >
                  스태프 수 제한에 도달했습니다
                </p>
              </div>

              <!-- 월간 예약 수 -->
              <div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <p class="text-body-2 text-medium-emphasis">
                    월간 예약 수
                  </p>
                  <p class="text-body-1 font-weight-medium">
                    {{ reservationLimitText }}
                  </p>
                </div>
                <VProgressLinear
                  :model-value="reservationUsagePercent"
                  :color="getUsageColor(reservationUsagePercent)"
                  height="8"
                  rounded
                />
                <p
                  v-if="!canCreateReservation"
                  class="text-caption text-error mt-1"
                >
                  예약 수 제한에 도달했습니다
                </p>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- 플랜 비교 -->
        <VCol cols="12">
          <VCard>
            <VCardItem>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="ri-contrast-2-line" class="me-2" color="info" />
                플랜 비교
              </VCardTitle>
            </VCardItem>

            <VCardText>
              <VRow>
                <VCol
                  v-for="plan in plans"
                  :key="plan.value"
                  cols="12"
                  sm="6"
                  md="6"
                >
                  <VCard
                    :variant="currentPlan === plan.value ? 'elevated' : 'outlined'"
                    :color="currentPlan === plan.value ? 'primary' : undefined"
                    class="h-100"
                  >
                    <VCardText>
                      <div class="text-center mb-4">
                        <VChip
                          v-if="plan.badge"
                          :color="plan.badgeColor"
                          size="small"
                          class="mb-2"
                        >
                          {{ plan.badge }}
                        </VChip>
                        <h4 class="text-h5 mb-2">
                          {{ plan.name }}
                        </h4>
                        <p class="text-h4 font-weight-bold">
                          {{ plan.priceText }}
                        </p>
                      </div>
                      <VDivider class="my-4" />
                      <VList density="compact" class="pa-0">
                        <VListItem
                          v-for="(feature, index) in plan.features"
                          :key="index"
                          class="px-0"
                        >
                          <template #prepend>
                            <VIcon
                              icon="ri-check-line"
                              size="20"
                              color="success"
                            />
                          </template>
                          <VListItemTitle class="text-body-2">
                            {{ feature }}
                          </VListItemTitle>
                        </VListItem>
                      </VList>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- 에러 상태 -->
    <VAlert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
    >
      {{ error }}
    </VAlert>

    </template><!-- end plan tab -->

    <!-- 플랜 변경 다이얼로그 -->
    <PlanChangeDialog
      v-model="isPlanChangeDialogOpen"
      :current-plan="currentPlan"
      :current-staff-count="currentStaffCount"
      :current-reservation-count="currentMonthReservationCount"
      :latest-payment="paymentStore.latestPayment"
      @confirm="handlePlanChange"
    />

    <!-- 구독 취소 확인 다이얼로그 -->
    <VDialog
      v-model="isCancelDialogOpen"
      max-width="520"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-error-warning-line" color="error" class="me-2" />
          구독 취소
        </VCardTitle>
        <VCardText>
          <p class="text-body-1 mb-4">
            정말로 구독을 취소하시겠습니까?
          </p>

          <!-- 환불 정보 (유료 플랜인 경우) -->
          <template v-if="cancelLoading">
            <div class="text-center pa-4">
              <VProgressCircular indeterminate color="primary" size="32" />
              <p class="text-body-2 text-medium-emphasis mt-2">환불 정보를 조회하는 중...</p>
            </div>
          </template>

          <VCard
            v-else-if="cancelRefundPreview"
            variant="outlined"
            class="mb-4"
          >
            <VCardText>
              <div class="d-flex align-center mb-3">
                <VIcon icon="ri-refund-line" color="warning" class="me-2" />
                <span class="text-body-1 font-weight-medium">환불 예상 정보</span>
              </div>

              <div class="d-flex flex-column gap-2 text-body-2">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">결제 금액</span>
                  <span>{{ formatCurrency(cancelRefundPreview.paymentAmount || 0) }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">사용 기간</span>
                  <span>{{ cancelRefundPreview.usedDays }}일 / {{ cancelRefundPreview.totalDays }}일</span>
                </div>
                <VDivider />
                <div class="d-flex justify-space-between">
                  <span class="font-weight-medium">예상 환불 금액</span>
                  <span class="font-weight-bold text-warning text-h6">
                    {{ formatCurrency(cancelRefundPreview.refundAmount || 0) }}
                  </span>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- 잔여 기간 안내 -->
          <VAlert
            v-if="nextBillingDate"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="text-body-2">
              <VIcon icon="ri-calendar-line" size="16" class="me-1" />
              현재 결제 기간(<strong>~{{ formatDate(nextBillingDate) }}</strong>)까지 유료 기능을 계속 이용할 수 있습니다.
            </div>
          </VAlert>

          <VAlert
            type="warning"
            variant="tonal"
            density="compact"
          >
            <ul class="text-caption ps-4 mb-0">
              <li>구독 취소 시 무료 플랜으로 전환됩니다.</li>
              <li>유료 기능(카카오 알림, 통계 등)이 제한됩니다.</li>
              <li v-if="cancelRefundPreview">
                잔여 기간에 대한 환불이 진행됩니다.
              </li>
            </ul>
          </VAlert>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="isCancelDialogOpen = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            :loading="loading"
            :disabled="cancelLoading"
            @click="handleCancelSubscription"
          >
            구독 취소
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useSubscriptionStore } from '@/stores/subscription'
import { storeToRefs } from 'pinia'
import { defineAsyncComponent, onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PlanChangeDialog from '@/components/subscription/PlanChangeDialog.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { usePaymentStore } from '@/stores/payment'
import { calculateRefund } from '@/utils/refundCalculator'
import { formatCurrency } from '@/constants/pricing'

// Lazy-load payment views
const PaymentView = defineAsyncComponent(() =>
  import('@/pages/shop-admin/payment/index.vue'),
)
const PaymentHistoryView = defineAsyncComponent(() =>
  import('@/pages/shop-admin/payment/history.vue'),
)

const router = useRouter()
const route = useRoute()

// Tab state
const activeTab = ref(route.query.tab || 'plan')
const subscriptionStore = useSubscriptionStore()
const paymentStore = usePaymentStore()
const { showSnackbar } = useSnackbar()

const {
  subscriptionInfo,
  loading,
  error,
  currentPlan,
  planDescription,
  monthlyPrice,
  billingCycle,
  status,
  isTrialActive,
  daysUntilTrialEnd,
  maxStaff,
  maxMonthlyReservations,
  currentStaffCount,
  currentMonthReservationCount,
  canAddStaff,
  canCreateReservation,
  nextBillingDate,
  staffUsagePercent,
  reservationUsagePercent,
  staffLimitText,
  reservationLimitText,
} = storeToRefs(subscriptionStore)

const isPlanChangeDialogOpen = ref(false)
const isCancelDialogOpen = ref(false)
const cancelRefundPreview = ref(null)
const cancelLoading = ref(false)

// 플랜 정보 (2티어: 무료 + 유료)
const plans = [
  {
    value: 'FREE',
    name: '무료',
    priceText: '0원',
    features: [
      '월 예약 30건',
      '스태프 1명',
      '기본 예약 관리',
      '고객 관리',
    ],
  },
  {
    value: 'PAID',
    name: '유료',
    priceText: '19,800원/월 (VAT 포함)',
    badge: '추천',
    badgeColor: 'primary',
    features: [
      '월 예약 무제한',
      '스태프 5명',
      '카카오톡 알림',
      '통계 및 리포트',
    ],
  },
]

// 가격 포맷팅 (월간/연간 분기)
const formattedPrice = computed(() => {
  if (monthlyPrice.value === 0) return '무료'
  if (billingCycle.value === 'YEARLY') {
    const yearlyPrice = monthlyPrice.value * 10 // 연간 = 월간 × 10 (2개월 무료)
    return `${yearlyPrice.toLocaleString()}원`
  }
  return `${monthlyPrice.value.toLocaleString()}원`
})

// 가격 부가 텍스트 (/ 월, / 년)
const priceSubText = computed(() => {
  if (monthlyPrice.value === 0) return ''
  if (billingCycle.value === 'YEARLY') {
    return `/ 년 (월 ${monthlyPrice.value.toLocaleString()}원)`
  }
  return '/ 월'
})

// 상태 텍스트
const statusText = computed(() => {
  const statusMap = {
    ACTIVE: '활성',
    TRIAL: '체험판',
    EXPIRED: '만료',
    CANCELED: '취소됨',
    SUSPENDED: '정지',
  }
  return statusMap[status.value] || status.value
})

// 상태 색상
const statusColor = computed(() => {
  const colorMap = {
    ACTIVE: 'success',
    TRIAL: 'info',
    EXPIRED: 'error',
    CANCELED: 'warning',
    SUSPENDED: 'error',
  }
  return colorMap[status.value] || 'default'
})

// 사용량 색상
function getUsageColor(percent) {
  if (percent >= 90) return 'error'
  if (percent >= 70) return 'warning'
  return 'success'
}

// 날짜 포맷팅
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 플랜 변경 다이얼로그 열기
function openPlanChangeDialog() {
  isPlanChangeDialogOpen.value = true
}

// 플랜 변경 처리
async function handlePlanChange(newPlan, billingCycle) {
  const planOrder = ['FREE', 'PAID']
  const currentIndex = planOrder.indexOf(currentPlan.value)
  const selectedIndex = planOrder.indexOf(newPlan)
  const isUpgrade = selectedIndex > currentIndex

  if (isUpgrade) {
    // 업그레이드: 결제 페이지로 리다이렉트
    const query = { plan: newPlan }
    if (billingCycle) query.billing = billingCycle
    isPlanChangeDialogOpen.value = false
    router.push({ path: '/shop-admin/payment', query })
    return
  }

  // 다운그레이드: 기존 changePlan 호출
  try {
    await subscriptionStore.changePlan(newPlan)
    showSnackbar('플랜이 성공적으로 변경되었습니다.', 'success')
    isPlanChangeDialogOpen.value = false
  }
  catch (error) {
    showSnackbar(error.message || '플랜 변경에 실패했습니다.', 'error')
  }
}

// 구독 취소 다이얼로그 열기
async function openCancelDialog() {
  cancelRefundPreview.value = null
  cancelLoading.value = true
  isCancelDialogOpen.value = true

  // 유료 플랜인 경우에만 환불 미리보기 조회
  if (currentPlan.value !== 'FREE') {
    try {
      const latestPayment = await paymentStore.fetchLatestPayment()
      if (latestPayment) {
        const preview = await paymentStore.fetchRefundPreview(latestPayment.id)
        if (preview) {
          cancelRefundPreview.value = { ...preview, paymentAmount: latestPayment.amount }
        } else {
          const calc = calculateRefund(latestPayment)
          cancelRefundPreview.value = { ...calc, paymentAmount: latestPayment.amount }
        }
      }
    } catch {
      // 환불 미리보기 실패 시 무시
    }
  }
  cancelLoading.value = false
}

// 구독 취소 처리
async function handleCancelSubscription() {
  try {
    const result = await subscriptionStore.cancelSubscription()

    // 취소 후 잔여 기간 안내
    const expiresAt = result?.nextBillingDate
    if (expiresAt) {
      showSnackbar(`구독이 취소되었습니다. ${formatDate(expiresAt)}까지 유료 기능을 이용할 수 있습니다.`, 'success')
    }
    else {
      showSnackbar('구독이 취소되었습니다.', 'success')
    }
    isCancelDialogOpen.value = false
  }
  catch (error) {
    const code = error.response?.data?.error?.code
    if (code === 'PM001') {
      showSnackbar('이미 취소된 결제입니다.', 'warning')
    } else if (code === 'PM002') {
      showSnackbar('취소할 수 없는 결제 상태입니다.', 'warning')
    } else {
      showSnackbar(error.response?.data?.error?.message || error.message || '구독 취소에 실패했습니다.', 'error')
    }
  }
}

// 초기화
onMounted(async () => {
  try {
    await subscriptionStore.fetchSubscriptionInfo()
    // 유료 플랜이면 최근 결제 정보도 미리 조회
    if (subscriptionStore.currentPlan !== 'FREE') {
      paymentStore.fetchLatestPayment()
    }
  }
  catch (error) {
    // 구독 정보 조회 실패
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
