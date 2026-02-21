<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-store-2-line" size="24" class="me-3" />
        <span>매장 상세 정보</span>

        <VSpacer />

        <VBtn
          icon="ri-close-line"
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
        />
      </VCardTitle>

      <VDivider />

      <!-- 로딩 -->
      <VCardText v-if="loading" class="text-center py-12">
        <VProgressCircular indeterminate color="primary" size="48" />
        <p class="text-body-1 mt-4">매장 정보를 불러오는 중...</p>
      </VCardText>

      <!-- 컨텐츠 -->
      <template v-else-if="business">
        <VTabs v-model="activeTab" grow>
          <VTab value="info">기본 정보</VTab>
          <VTab value="subscription">구독 상세</VTab>
          <VTab value="usage">사용량</VTab>
          <VTab value="payments">결제 내역</VTab>
        </VTabs>

        <VDivider />

        <VWindow v-model="activeTab">
          <!-- Tab 1: 기본 정보 -->
          <VWindowItem value="info">
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="business.id"
                    label="ID"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="business.name"
                    label="매장명"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="getBusinessTypeLabel(business.businessType)"
                    label="업종"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="business.ownerName"
                    label="사장님"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="business.ownerEmail"
                    label="이메일"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="business.address"
                    label="주소"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <div class="d-flex align-center ga-2">
                    <span class="text-body-2 text-disabled">상태:</span>
                    <VChip
                      :color="getBusinessStatusColor(business.status)"
                      variant="tonal"
                      size="small"
                    >
                      {{ getBusinessStatusLabel(business.status) }}
                    </VChip>
                  </div>
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="formatDate(business.createdAt)"
                    label="생성일"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VWindowItem>

          <!-- Tab 2: 구독 상세 -->
          <VWindowItem value="subscription">
            <VCardText>
              <VRow v-if="business.subscription">
                <VCol cols="12" md="6">
                  <div class="d-flex align-center ga-2 mb-4">
                    <span class="text-body-2 text-disabled">플랜:</span>
                    <VChip
                      :color="planColor"
                      variant="tonal"
                      size="small"
                    >
                      {{ planLabel }}
                    </VChip>
                  </div>
                </VCol>

                <VCol cols="12" md="6">
                  <div class="d-flex align-center ga-2 mb-4">
                    <span class="text-body-2 text-disabled">구독 상태:</span>
                    <VChip
                      :color="getSubscriptionStatusColor(business.subscription.status)"
                      variant="tonal"
                      size="small"
                    >
                      {{ getSubscriptionStatusLabel(business.subscription.status) }}
                    </VChip>
                  </div>
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="getBillingCycleLabel(business.subscription.billingCycle)"
                    label="결제주기"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="formatDate(business.subscription.startDate)"
                    label="구독시작일"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
                    :model-value="formatDate(business.subscription.nextBillingDate)"
                    label="다음결제일"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>

                <VCol v-if="business.subscription.isTrialActive" cols="12" md="6">
                  <VTextField
                    :model-value="trialRemainingDays + '일'"
                    label="체험판 잔여일"
                    readonly
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
              </VRow>

              <VAlert v-else type="info" variant="tonal">
                구독 정보가 없습니다.
              </VAlert>
            </VCardText>
          </VWindowItem>

          <!-- Tab 3: 사용량 -->
          <VWindowItem value="usage">
            <VCardText v-if="business.subscription">
              <!-- 스태프 사용량 -->
              <div class="mb-6">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-1 font-weight-medium">스태프</span>
                  <span class="text-body-2">
                    {{ business.subscription.currentStaffCount }} / {{ business.subscription.maxStaff }}
                  </span>
                </div>
                <VProgressLinear
                  :model-value="staffUsagePercent"
                  :color="getUsageColor(staffUsagePercent)"
                  height="12"
                  rounded
                />
                <p class="text-xs text-disabled mt-1">
                  사용률 {{ staffUsagePercent }}%
                </p>
              </div>

              <!-- 월간 예약 사용량 -->
              <div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-1 font-weight-medium">월간 예약</span>
                  <span class="text-body-2">
                    <template v-if="isUnlimitedReservations">
                      {{ business.subscription.currentMonthReservationCount }} / 무제한
                    </template>
                    <template v-else>
                      {{ business.subscription.currentMonthReservationCount }} / {{ business.subscription.maxMonthlyReservations }}
                    </template>
                  </span>
                </div>
                <VProgressLinear
                  :model-value="isUnlimitedReservations ? 100 : reservationUsagePercent"
                  :color="isUnlimitedReservations ? 'success' : getUsageColor(reservationUsagePercent)"
                  height="12"
                  rounded
                />
                <p class="text-xs text-disabled mt-1">
                  <template v-if="isUnlimitedReservations">
                    무제한 사용 가능
                  </template>
                  <template v-else>
                    사용률 {{ reservationUsagePercent }}%
                  </template>
                </p>
              </div>
            </VCardText>

            <VCardText v-else>
              <VAlert type="info" variant="tonal">
                구독 정보가 없습니다.
              </VAlert>
            </VCardText>
          </VWindowItem>

          <!-- Tab 4: 결제 내역 -->
          <VWindowItem value="payments">
            <VCardText>
              <VTable v-if="business.recentPayments?.length" density="comfortable">
                <thead>
                  <tr>
                    <th>결제ID</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>결제일</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in business.recentPayments.slice(0, 5)" :key="payment.id">
                    <td>{{ payment.id }}</td>
                    <td>{{ formatCurrency(payment.amount) }}</td>
                    <td>
                      <VChip
                        :color="getPaymentStatusColor(payment.status)"
                        variant="tonal"
                        size="small"
                      >
                        {{ getPaymentStatusLabel(payment.status) }}
                      </VChip>
                    </td>
                    <td>{{ formatDate(payment.createdAt) }}</td>
                  </tr>
                </tbody>
              </VTable>

              <VAlert v-else type="info" variant="tonal">
                결제 내역이 없습니다.
              </VAlert>
            </VCardText>
          </VWindowItem>
        </VWindow>
      </template>

      <!-- 데이터 없음 -->
      <VCardText v-else class="text-center py-12">
        <VIcon icon="ri-information-line" size="48" color="disabled" />
        <p class="text-body-1 mt-4 text-disabled">매장 정보를 불러올 수 없습니다.</p>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="outlined"
          @click="$emit('update:modelValue', false)"
        >
          닫기
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { getBusinessTypeLabel } from '@/constants/businessTypes'
import { useSuperAdminStore } from '@/stores/superadmin'
import { toFrontendPlan } from '@/utils/planAdapter'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  businessId: {
    type: Number,
    default: null,
  },
})

defineEmits(['update:modelValue'])

const superadminStore = useSuperAdminStore()

const activeTab = ref('info')
const loading = ref(false)

const business = computed(() => superadminStore.selectedBusiness)

// ========================================
// 데이터 로드
// ========================================

watch(
  () => [props.modelValue, props.businessId],
  async ([isOpen, id]) => {
    if (isOpen && id) {
      loading.value = true
      activeTab.value = 'info'
      try {
        await superadminStore.fetchBusinessDetail(id)
      }
      catch (error) {
        console.error('매장 상세 조회 실패:', error)
      }
      finally {
        loading.value = false
      }
    }
  },
  { immediate: true },
)

// ========================================
// 플랜 관련
// ========================================

const frontendPlan = computed(() => {
  if (!business.value?.subscription?.plan) return null

  return toFrontendPlan(business.value.subscription.plan)
})

const planLabel = computed(() => {
  if (frontendPlan.value === 'FREE') return '무료'
  if (frontendPlan.value === 'PAID') return '유료'

  return frontendPlan.value || '-'
})

const planColor = computed(() => {
  if (frontendPlan.value === 'FREE') return 'info'
  if (frontendPlan.value === 'PAID') return 'primary'

  return 'default'
})

// ========================================
// 사용량 계산
// ========================================

const staffUsagePercent = computed(() => {
  const sub = business.value?.subscription
  if (!sub || !sub.maxStaff) return 0

  return Math.round((sub.currentStaffCount / sub.maxStaff) * 100)
})

const isUnlimitedReservations = computed(() => {
  return business.value?.subscription?.maxMonthlyReservations === -1
})

const reservationUsagePercent = computed(() => {
  const sub = business.value?.subscription
  if (!sub || !sub.maxMonthlyReservations || sub.maxMonthlyReservations === -1) return 0

  return Math.round((sub.currentMonthReservationCount / sub.maxMonthlyReservations) * 100)
})

const trialRemainingDays = computed(() => {
  const trialEnd = business.value?.subscription?.trialEndDate
  if (!trialEnd) return 0

  const now = new Date()
  const end = new Date(trialEnd)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  return Math.max(0, diff)
})

// ========================================
// 포맷 헬퍼
// ========================================

function formatDate(dateString) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(amount) {
  if (amount == null) return '-'

  return amount.toLocaleString() + '원'
}

// ========================================
// 상태 레이블/색상
// ========================================

function getBusinessStatusColor(status) {
  const map = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
  }

  return map[status] || 'default'
}

function getBusinessStatusLabel(status) {
  const map = {
    ACTIVE: '활성',
    INACTIVE: '비활성',
    SUSPENDED: '정지',
  }

  return map[status] || status
}

function getSubscriptionStatusColor(status) {
  const map = {
    ACTIVE: 'success',
    TRIAL: 'info',
    EXPIRED: 'error',
    CANCELED: 'warning',
  }

  return map[status] || 'default'
}

function getSubscriptionStatusLabel(status) {
  const map = {
    ACTIVE: '활성',
    TRIAL: '체험판',
    EXPIRED: '만료',
    CANCELED: '취소',
  }

  return map[status] || status
}

function getBillingCycleLabel(cycle) {
  const map = {
    MONTHLY: '월간',
    YEARLY: '연간',
  }

  return map[cycle] || cycle || '-'
}

function getPaymentStatusColor(status) {
  const map = {
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'secondary',
    PENDING: 'warning',
  }

  return map[status] || 'default'
}

function getPaymentStatusLabel(status) {
  const map = {
    COMPLETED: '완료',
    FAILED: '실패',
    REFUNDED: '환불',
    PENDING: '대기',
  }

  return map[status] || status
}

function getUsageColor(percent) {
  if (percent >= 90) return 'error'
  if (percent >= 70) return 'warning'

  return 'success'
}
</script>
