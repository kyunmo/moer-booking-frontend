<template>
  <div>
    <!-- 페이지 헤더 -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 mb-1">
          결제
        </h2>
        <p class="text-body-1 text-medium-emphasis">
          플랜을 선택하고 결제를 진행하세요
        </p>
      </div>
    </div>

    <!-- 결제 성공 메시지 -->
    <VAlert
      v-if="paymentSuccess"
      type="success"
      variant="tonal"
      class="mb-6"
      closable
      @click:close="paymentSuccess = false"
    >
      <div class="d-flex align-center">
        <VIcon icon="ri-checkbox-circle-line" class="me-2" />
        <div>
          <strong>결제가 완료되었습니다!</strong>
          <p class="mb-0">구독이 활성화되었습니다.</p>
        </div>
      </div>
    </VAlert>

    <!-- 결제 실패 메시지 -->
    <VAlert
      v-if="paymentFailed"
      type="error"
      variant="tonal"
      class="mb-6"
      closable
      @click:close="paymentFailed = false"
    >
      <div class="d-flex align-center">
        <VIcon icon="ri-error-warning-line" class="me-2" />
        <div>
          <strong>결제에 실패했습니다</strong>
          <p class="mb-0">{{ failReason }}</p>
        </div>
      </div>
    </VAlert>

    <VRow>
      <!-- 왼쪽: 플랜 선택 및 결제 수단 -->
      <VCol cols="12" md="8">
        <!-- 플랜 선택 -->
        <VCard class="mb-6">
          <VCardItem>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="ri-vip-crown-line" class="me-2" color="primary" />
              플랜 선택
            </VCardTitle>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol
                v-for="plan in availablePlans"
                :key="plan.value"
                cols="12"
                sm="6"
                md="4"
              >
                <VCard
                  :variant="selectedPlan === plan.value ? 'elevated' : 'outlined'"
                  :color="selectedPlan === plan.value ? 'primary' : undefined"
                  class="cursor-pointer h-100"
                  @click="selectPlan(plan.value)"
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
                      <p class="text-h4 font-weight-bold text-primary">
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

        <!-- 결제 수단 선택 -->
        <VCard>
          <VCardItem>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="ri-bank-card-line" class="me-2" color="success" />
              결제 수단
            </VCardTitle>
          </VCardItem>

          <VCardText>
            <VRadioGroup v-model="selectedPaymentMethod">
              <VRadio
                v-for="method in paymentMethods"
                :key="method.value"
                :value="method.value"
                class="mb-3"
              >
                <template #label>
                  <div class="d-flex align-center">
                    <VIcon :icon="method.icon" class="me-3" size="24" />
                    <div>
                      <p class="text-body-1 font-weight-medium mb-0">
                        {{ method.name }}
                      </p>
                      <p class="text-caption text-medium-emphasis mb-0">
                        {{ method.description }}
                      </p>
                    </div>
                  </div>
                </template>
              </VRadio>
            </VRadioGroup>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 오른쪽: 결제 요약 -->
      <VCol cols="12" md="4">
        <VCard class="sticky-top">
          <VCardItem>
            <VCardTitle class="d-flex align-center">
              <VIcon icon="ri-file-list-line" class="me-2" color="info" />
              결제 요약
            </VCardTitle>
          </VCardItem>

          <VCardText>
            <!-- 선택한 플랜 -->
            <div class="mb-4">
              <p class="text-body-2 text-medium-emphasis mb-2">
                선택한 플랜
              </p>
              <p class="text-h6 font-weight-bold">
                {{ selectedPlanInfo?.name || '플랜을 선택하세요' }}
              </p>
            </div>

            <!-- 쿠폰 적용 -->
            <div v-if="selectedPlan && selectedPlan !== 'ENTERPRISE'" class="mb-4">
              <p class="text-body-2 text-medium-emphasis mb-2">
                쿠폰 코드
              </p>
              <div v-if="!appliedCoupon" class="d-flex gap-2">
                <VTextField
                  v-model="couponCode"
                  placeholder="쿠폰 코드 입력"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @keyup.enter="validateAndApplyCoupon"
                />
                <VBtn
                  color="primary"
                  variant="tonal"
                  :loading="couponLoading"
                  @click="validateAndApplyCoupon"
                >
                  적용
                </VBtn>
              </div>
              <VAlert
                v-else
                type="success"
                variant="tonal"
                density="compact"
                closable
                @click:close="removeCoupon"
              >
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <strong>{{ appliedCoupon.name }}</strong>
                    <p class="text-caption mb-0">{{ appliedCoupon.code }}</p>
                  </div>
                </div>
              </VAlert>
            </div>

            <VDivider class="my-4" />

            <!-- 결제 금액 상세 -->
            <div class="mb-4">
              <!-- 원래 금액 -->
              <div class="d-flex justify-space-between align-center mb-2">
                <p class="text-body-2 text-medium-emphasis mb-0">
                  상품 금액
                </p>
                <p class="text-body-1 mb-0">
                  {{ selectedPlanInfo ? formatCurrency(originalAmount) : '0원' }}
                </p>
              </div>

              <!-- 할인 금액 -->
              <div v-if="appliedCoupon" class="d-flex justify-space-between align-center mb-2">
                <p class="text-body-2 text-medium-emphasis mb-0">
                  쿠폰 할인
                </p>
                <p class="text-body-1 mb-0 text-error">
                  -{{ formatCurrency(discountAmount) }}
                </p>
              </div>

              <VDivider class="my-3" />

              <!-- 최종 결제 금액 -->
              <div class="d-flex justify-space-between align-center">
                <p class="text-subtitle-1 font-weight-bold mb-0">
                  최종 결제 금액
                </p>
                <p class="text-h5 font-weight-bold text-primary mb-0">
                  {{ selectedPlanInfo ? formatCurrency(finalAmount) : '0원' }}
                </p>
              </div>
            </div>

            <!-- 다음 결제일 -->
            <div class="mb-4">
              <p class="text-body-2 text-medium-emphasis mb-2">
                다음 결제 예정일
              </p>
              <p class="text-body-1">
                {{ nextBillingDate }}
              </p>
            </div>

            <VDivider class="my-4" />

            <!-- 안내 사항 -->
            <VAlert
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              <div class="text-body-2">
                • 결제 후 즉시 서비스가 활성화됩니다<br>
                • 다음 결제일에 자동으로 갱신됩니다<br>
                • 언제든지 플랜을 변경할 수 있습니다
              </div>
            </VAlert>

            <!-- 결제 버튼 -->
            <VBtn
              block
              color="primary"
              size="large"
              :disabled="!selectedPlan || !selectedPaymentMethod"
              :loading="loading"
              @click="handlePayment"
            >
              <VIcon icon="ri-secure-payment-line" start />
              결제하기
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { usePaymentStore } from '@/stores/payment'
import { useSubscriptionStore } from '@/stores/subscription'
import { useCouponStore } from '@/stores/coupon'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()
const subscriptionStore = useSubscriptionStore()
const couponStore = useCouponStore()
const { showSnackbar } = useSnackbar()

const selectedPlan = ref(null)
const selectedPaymentMethod = ref('CARD')
const loading = ref(false)
const paymentSuccess = ref(false)
const paymentFailed = ref(false)
const failReason = ref('')

// 쿠폰 관련 상태
const couponCode = ref('')
const couponLoading = ref(false)
const appliedCoupon = ref(null)

// 플랜 정보 (FREE 제외)
const availablePlans = [
  {
    value: 'BASIC',
    name: '베이직',
    price: 29000,
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
    price: 79000,
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
    price: 0,
    priceText: '문의',
    features: [
      '무제한 예약',
      '무제한 직원',
      '맞춤형 기능',
      '전담 지원',
    ],
  },
]

// 결제 수단
const paymentMethods = [
  {
    value: 'CARD',
    name: '신용/체크카드',
    description: '일반 카드 결제',
    icon: 'ri-bank-card-line',
  },
  {
    value: 'BANK_TRANSFER',
    name: '계좌이체',
    description: '실시간 계좌이체',
    icon: 'ri-exchange-dollar-line',
  },
  {
    value: 'VIRTUAL_ACCOUNT',
    name: '가상계좌',
    description: '가상계좌 입금',
    icon: 'ri-bank-line',
  },
  {
    value: 'MOBILE',
    name: '간편결제',
    description: '카카오페이, 네이버페이 등',
    icon: 'ri-smartphone-line',
  },
]

// 선택한 플랜 정보
const selectedPlanInfo = computed(() => {
  return availablePlans.find(p => p.value === selectedPlan.value)
})

// 다음 결제 예정일
const nextBillingDate = computed(() => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// 원래 금액
const originalAmount = computed(() => {
  return selectedPlanInfo.value?.price || 0
})

// 할인 금액
const discountAmount = computed(() => {
  return appliedCoupon.value ? couponStore.discountAmount : 0
})

// 최종 결제 금액
const finalAmount = computed(() => {
  return Math.max(0, originalAmount.value - discountAmount.value)
})

// 통화 포맷팅
function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)
}

// 플랜 선택
function selectPlan(plan) {
  selectedPlan.value = plan
  // 플랜 변경 시 쿠폰 재검증
  if (appliedCoupon.value) {
    validateAndApplyCoupon()
  }
}

// 쿠폰 적용
async function validateAndApplyCoupon() {
  if (!couponCode.value) {
    showSnackbar('쿠폰 코드를 입력해주세요.', 'warning')
    return
  }

  if (!selectedPlan.value) {
    showSnackbar('먼저 플랜을 선택해주세요.', 'warning')
    return
  }

  const orderAmount = selectedPlanInfo.value?.price
  if (!orderAmount || orderAmount === 0) {
    showSnackbar('유효한 플랜을 선택해주세요.', 'warning')
    return
  }

  couponLoading.value = true
  try {
    const validatedCoupon = await couponStore.validateCoupon(couponCode.value, orderAmount)
    appliedCoupon.value = validatedCoupon
    showSnackbar(`쿠폰이 적용되었습니다! ${formatCurrency(couponStore.discountAmount)} 할인`, 'success')
  }
  catch (error) {
    showSnackbar(error.response?.data?.message || '유효하지 않은 쿠폰입니다.', 'error')
    appliedCoupon.value = null
  }
  finally {
    couponLoading.value = false
  }
}

// 쿠폰 취소
function removeCoupon() {
  appliedCoupon.value = null
  couponCode.value = ''
  couponStore.clearValidatedCoupon()
  showSnackbar('쿠폰이 취소되었습니다.', 'info')
}

// 결제 처리
async function handlePayment() {
  if (!selectedPlan.value || !selectedPaymentMethod.value) {
    showSnackbar('플랜과 결제 수단을 선택해주세요.', 'warning')
    return
  }

  // ENTERPRISE 플랜은 문의 필요
  if (selectedPlan.value === 'ENTERPRISE') {
    showSnackbar('엔터프라이즈 플랜은 별도 문의가 필요합니다.', 'info')
    return
  }

  loading.value = true
  paymentSuccess.value = false
  paymentFailed.value = false

  try {
    const result = await paymentStore.createPayment(
      selectedPlan.value,
      selectedPaymentMethod.value,
      appliedCoupon.value?.code || null, // 쿠폰 코드 전달
    )

    // 결제 성공/실패 확인
    if (result.status === 'COMPLETED') {
      paymentSuccess.value = true
      showSnackbar('결제가 완료되었습니다!', 'success')

      // 구독 정보 갱신
      await subscriptionStore.fetchSubscriptionInfo()

      // 쿠폰 상태 초기화
      appliedCoupon.value = null
      couponCode.value = ''
      couponStore.clearValidatedCoupon()

      // 3초 후 구독 관리 페이지로 이동
      setTimeout(() => {
        router.push('/shop-admin/subscription')
      }, 3000)
    } else if (result.status === 'FAILED') {
      paymentFailed.value = true
      failReason.value = result.failReason || '결제 처리 중 오류가 발생했습니다.'
      showSnackbar('결제에 실패했습니다. 다시 시도해주세요.', 'error')
    }
  }
  catch (error) {
    paymentFailed.value = true
    failReason.value = error.message || '결제 처리 중 오류가 발생했습니다.'
    showSnackbar(error.message || '결제 처리에 실패했습니다.', 'error')
  }
  finally {
    loading.value = false
  }
}

// 초기화
onMounted(() => {
  // URL에서 플랜 파라미터 확인
  if (route.query.plan) {
    const plan = route.query.plan.toUpperCase()
    if (availablePlans.some(p => p.value === plan)) {
      selectedPlan.value = plan
    }
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-4px);
}

.sticky-top {
  position: sticky;
  top: 80px;
}
</style>
