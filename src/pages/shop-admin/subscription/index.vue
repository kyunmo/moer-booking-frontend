<template>
  <div>
    <!-- 페이지 헤더 -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 mb-1">
          구독 관리
        </h2>
        <p class="text-body-1 text-medium-emphasis">
          플랜 및 사용량을 관리하세요
        </p>
      </div>
    </div>

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
                  <p class="text-body-2 text-medium-emphasis">
                    / 월
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
                  @click="router.push('/shop-admin/payment/history')"
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
              <!-- 직원 수 -->
              <div class="mb-6">
                <div class="d-flex justify-space-between align-center mb-2">
                  <p class="text-body-2 text-medium-emphasis">
                    직원 수
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
                  직원 수 제한에 도달했습니다
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
                  md="3"
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

    <!-- 플랜 변경 다이얼로그 -->
    <PlanChangeDialog
      v-model="isPlanChangeDialogOpen"
      :current-plan="currentPlan"
      :current-staff-count="currentStaffCount"
      :current-reservation-count="currentMonthReservationCount"
      @confirm="handlePlanChange"
    />

    <!-- 구독 취소 확인 다이얼로그 -->
    <VDialog
      v-model="isCancelDialogOpen"
      max-width="500"
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
          <VAlert
            type="warning"
            variant="tonal"
            density="compact"
          >
            구독을 취소하면 모든 서비스 이용이 중단됩니다.
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
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PlanChangeDialog from '@/components/subscription/PlanChangeDialog.vue'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const { showSnackbar } = useSnackbar()

const {
  subscriptionInfo,
  loading,
  error,
  currentPlan,
  planDescription,
  monthlyPrice,
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

// 플랜 정보
const plans = [
  {
    value: 'FREE',
    name: '무료',
    priceText: '0원',
    features: [
      '월 예약 30건',
      '직원 1명',
      '기본 예약 관리',
      '고객 관리',
    ],
  },
  {
    value: 'BASIC',
    name: '베이직',
    priceText: '29,000원',
    badge: '인기',
    badgeColor: 'success',
    features: [
      '월 예약 100건',
      '직원 3명',
      '카카오톡 알림',
      '통계 및 분석',
    ],
  },
  {
    value: 'PRO',
    name: '프로',
    priceText: '79,000원',
    badge: '추천',
    badgeColor: 'primary',
    features: [
      '월 예약 500건',
      '직원 10명',
      '고급 통계',
      '프리미엄 지원',
    ],
  },
  {
    value: 'ENTERPRISE',
    name: '엔터프라이즈',
    priceText: '문의',
    features: [
      '무제한 예약',
      '무제한 직원',
      '맞춤형 기능',
      '전담 지원',
    ],
  },
]

// 가격 포맷팅
const formattedPrice = computed(() => {
  if (monthlyPrice.value === 0) return '무료'
  return `${monthlyPrice.value.toLocaleString()}원`
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
async function handlePlanChange(newPlan) {
  try {
    await subscriptionStore.changePlan(newPlan)
    showSnackbar('플랜이 성공적으로 변경되었습니다.', 'success')
    isPlanChangeDialogOpen.value = false
  }
  catch (error) {
    console.error('플랜 변경 실패:', error)
    showSnackbar(error.message || '플랜 변경에 실패했습니다.', 'error')
  }
}

// 구독 취소 다이얼로그 열기
function openCancelDialog() {
  isCancelDialogOpen.value = true
}

// 구독 취소 처리
async function handleCancelSubscription() {
  try {
    await subscriptionStore.cancelSubscription()
    showSnackbar('구독이 취소되었습니다.', 'success')
    isCancelDialogOpen.value = false
  }
  catch (error) {
    console.error('구독 취소 실패:', error)
    showSnackbar(error.message || '구독 취소에 실패했습니다.', 'error')
  }
}

// 초기화
onMounted(async () => {
  try {
    await subscriptionStore.fetchSubscriptionInfo()
  }
  catch (error) {
    console.error('구독 정보 조회 실패:', error)
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
