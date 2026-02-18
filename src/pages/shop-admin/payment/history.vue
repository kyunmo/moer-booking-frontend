<template>
  <div>
    <!-- 페이지 헤더 -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 mb-1">
          결제 내역
        </h2>
        <p class="text-body-1 text-medium-emphasis">
          모든 결제 및 환불 내역을 확인하세요
        </p>
      </div>
    </div>

    <!-- 통계 카드 -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-checkbox-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">완료된 결제</p>
              <h6 class="text-h6">{{ paymentCounts.COMPLETED }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="error">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-close-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">실패한 결제</p>
              <h6 class="text-h6">{{ paymentCounts.FAILED }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-refund-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">환불 완료</p>
              <h6 class="text-h6">{{ paymentCounts.REFUNDED }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-money-dollar-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">총 결제 금액</p>
              <h6 class="text-h6">{{ formatCurrency(totalPaymentAmount) }}</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 결제 목록 -->
    <VCard>
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-file-list-line" size="24" class="me-3" />
        <span>결제 내역</span>

        <VSpacer />

        <!-- 상태 필터 -->
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="전체 상태"
          density="compact"
          style="max-inline-size: 180px;"
          class="me-3"
          clearable
        />
      </VCardTitle>

      <!-- 로딩 상태 -->
      <div v-if="loading && payments.length === 0" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
        <p class="text-body-1 text-medium-emphasis mt-4">
          결제 내역을 불러오는 중...
        </p>
      </div>

      <!-- 결제 목록 테이블 -->
      <VDataTable
        v-else
        :headers="headers"
        :items="filteredPayments"
        :loading="loading"
        :items-per-page="10"
        class="elevation-0"
      >
        <!-- 결제 ID -->
        <template #item.id="{ item }">
          <span class="font-weight-medium">#{{ item.id }}</span>
        </template>

        <!-- 플랜 -->
        <template #item.subscriptionPlan="{ item }">
          <VChip
            :color="getPlanColor(item.subscriptionPlan)"
            size="small"
          >
            {{ getPlanName(item.subscriptionPlan) }}
          </VChip>
        </template>

        <!-- 금액 -->
        <template #item.amount="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <!-- 결제 수단 -->
        <template #item.paymentMethod="{ item }">
          <div class="d-flex align-center">
            <VIcon :icon="getPaymentMethodIcon(item.paymentMethod)" class="me-2" size="20" />
            <span>{{ getPaymentMethodName(item.paymentMethod) }}</span>
          </div>
        </template>

        <!-- 상태 -->
        <template #item.status="{ item }">
          <VChip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ getStatusText(item.status) }}
          </VChip>
        </template>

        <!-- 결제일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <!-- 액션 -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <VBtn
              icon
              variant="text"
              size="small"
              @click="viewDetail(item)"
            >
              <VIcon icon="ri-eye-line" />
              <VTooltip activator="parent" location="top">
                상세보기
              </VTooltip>
            </VBtn>

            <VBtn
              v-if="item.status === 'COMPLETED'"
              icon
              variant="text"
              size="small"
              color="error"
              @click="openRefundDialog(item)"
            >
              <VIcon icon="ri-refund-line" />
              <VTooltip activator="parent" location="top">
                환불
              </VTooltip>
            </VBtn>
          </div>
        </template>

        <!-- 데이터 없음 -->
        <template #no-data>
          <div class="text-center pa-10">
            <VIcon
              icon="ri-file-list-line"
              size="64"
              class="mb-4 text-disabled"
            />
            <p class="text-h6 mb-2">결제 내역이 없습니다</p>
            <p class="text-disabled mb-4">
              플랜을 구매하여 서비스를 이용하세요
            </p>
            <VBtn
              color="primary"
              @click="router.push('/shop-admin/payment')"
            >
              <VIcon icon="ri-shopping-cart-line" class="me-2" />
              플랜 구매하기
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- 상세보기 다이얼로그 -->
    <VDialog
      v-model="isDetailDialogOpen"
      max-width="600"
    >
      <VCard v-if="selectedPayment">
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="ri-file-text-line" class="me-2" />
            결제 상세 정보
          </div>
          <VBtn
            icon="ri-close-line"
            variant="text"
            size="small"
            @click="isDetailDialogOpen = false"
          />
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VRow>
            <!-- 결제 ID -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">결제 ID</p>
              <p class="text-body-1 font-weight-medium">#{{ selectedPayment.id }}</p>
            </VCol>

            <!-- 상태 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">상태</p>
              <VChip
                :color="getStatusColor(selectedPayment.status)"
                size="small"
              >
                {{ getStatusText(selectedPayment.status) }}
              </VChip>
            </VCol>

            <!-- 플랜 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">플랜</p>
              <p class="text-body-1 font-weight-medium">
                {{ getPlanName(selectedPayment.subscriptionPlan) }}
              </p>
            </VCol>

            <!-- 금액 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">결제 금액</p>
              <p class="text-h6 text-primary font-weight-bold">
                {{ formatCurrency(selectedPayment.amount) }}
              </p>
            </VCol>

            <!-- 결제 수단 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">결제 수단</p>
              <p class="text-body-1 font-weight-medium">
                {{ getPaymentMethodName(selectedPayment.paymentMethod) }}
              </p>
            </VCol>

            <!-- PG 거래 ID -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">거래 ID</p>
              <p class="text-body-2">{{ selectedPayment.pgTransactionId || '-' }}</p>
            </VCol>

            <!-- 결제일 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">결제일</p>
              <p class="text-body-1">{{ formatDate(selectedPayment.createdAt) }}</p>
            </VCol>

            <!-- 구독 기간 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">구독 기간</p>
              <p class="text-body-2">
                {{ formatDate(selectedPayment.billingStartDate) }} ~
                {{ formatDate(selectedPayment.billingEndDate) }}
              </p>
            </VCol>

            <!-- 실패 사유 -->
            <VCol v-if="selectedPayment.failReason" cols="12">
              <VAlert type="error" variant="tonal" density="compact">
                <strong>실패 사유:</strong> {{ selectedPayment.failReason }}
              </VAlert>
            </VCol>

            <!-- 환불 정보 -->
            <VCol v-if="selectedPayment.status === 'REFUNDED'" cols="12">
              <VAlert type="warning" variant="tonal" density="compact">
                <p class="mb-1"><strong>환불 사유:</strong> {{ selectedPayment.refundReason }}</p>
                <p class="mb-1"><strong>환불 금액:</strong> {{ formatCurrency(selectedPayment.refundedAmount) }}</p>
                <p class="mb-0"><strong>환불일:</strong> {{ formatDate(selectedPayment.refundedAt) }}</p>
              </VAlert>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 환불 다이얼로그 -->
    <VDialog
      v-model="isRefundDialogOpen"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-refund-line" color="warning" class="me-2" />
          환불 요청
        </VCardTitle>

        <VCardText>
          <p class="text-body-1 mb-4">
            정말로 환불을 진행하시겠습니까?
          </p>

          <VTextField
            v-model="refundReason"
            label="환불 사유 *"
            placeholder="환불 사유를 입력하세요"
            rows="3"
            counter
            maxlength="200"
          />

          <VAlert
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            환불 후에는 서비스 이용이 제한될 수 있습니다.
          </VAlert>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="isRefundDialogOpen = false"
          >
            취소
          </VBtn>
          <VBtn
            color="warning"
            variant="elevated"
            :disabled="!refundReason"
            :loading="loading"
            @click="handleRefund"
          >
            환불 요청
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { usePaymentStore } from '@/stores/payment'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const paymentStore = usePaymentStore()
const { showSnackbar } = useSnackbar()

const {
  payments,
  loading,
  paymentCounts,
  totalPaymentAmount,
} = storeToRefs(paymentStore)

const statusFilter = ref(null)
const isDetailDialogOpen = ref(false)
const isRefundDialogOpen = ref(false)
const selectedPayment = ref(null)
const refundReason = ref('')

// 테이블 헤더
const headers = [
  { title: '결제 ID', key: 'id', width: '100' },
  { title: '플랜', key: 'subscriptionPlan', width: '120' },
  { title: '금액', key: 'amount', width: '120' },
  { title: '결제 수단', key: 'paymentMethod', width: '150' },
  { title: '상태', key: 'status', width: '100' },
  { title: '결제일', key: 'createdAt', width: '150' },
  { title: '액션', key: 'actions', width: '120', sortable: false },
]

// 상태 옵션
const statusOptions = [
  { title: '전체', value: null },
  { title: '완료', value: 'COMPLETED' },
  { title: '실패', value: 'FAILED' },
  { title: '환불', value: 'REFUNDED' },
  { title: '대기', value: 'PENDING' },
]

// 필터링된 결제 목록
const filteredPayments = computed(() => {
  if (!statusFilter.value) return payments.value

  return payments.value.filter(p => p.status === statusFilter.value)
})

// 플랜 이름
function getPlanName(plan) {
  const names = {
    FREE: '무료',
    BASIC: '베이직',
    PRO: '프로',
    ENTERPRISE: '엔터프라이즈',
  }
  return names[plan] || plan
}

// 플랜 색상
function getPlanColor(plan) {
  const colors = {
    FREE: 'default',
    BASIC: 'success',
    PRO: 'primary',
    ENTERPRISE: 'secondary',
  }
  return colors[plan] || 'default'
}

// 결제 수단 이름
function getPaymentMethodName(method) {
  const names = {
    CARD: '신용/체크카드',
    BANK_TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE: '간편결제',
  }
  return names[method] || method
}

// 결제 수단 아이콘
function getPaymentMethodIcon(method) {
  const icons = {
    CARD: 'ri-bank-card-line',
    BANK_TRANSFER: 'ri-exchange-dollar-line',
    VIRTUAL_ACCOUNT: 'ri-bank-line',
    MOBILE: 'ri-smartphone-line',
  }
  return icons[method] || 'ri-question-line'
}

// 상태 텍스트
function getStatusText(status) {
  const texts = {
    PENDING: '대기',
    COMPLETED: '완료',
    FAILED: '실패',
    REFUNDED: '환불',
  }
  return texts[status] || status
}

// 상태 색상
function getStatusColor(status) {
  const colors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'secondary',
  }
  return colors[status] || 'default'
}

// 금액 포맷팅
function formatCurrency(amount) {
  if (!amount) return '0원'
  return `${amount.toLocaleString()}원`
}

// 날짜 포맷팅
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 상세보기
function viewDetail(payment) {
  selectedPayment.value = payment
  isDetailDialogOpen.value = true
}

// 환불 다이얼로그 열기
function openRefundDialog(payment) {
  selectedPayment.value = payment
  refundReason.value = ''
  isRefundDialogOpen.value = true
}

// 환불 처리
async function handleRefund() {
  if (!refundReason.value) {
    showSnackbar('환불 사유를 입력해주세요.', 'warning')
    return
  }

  try {
    await paymentStore.refundPayment(selectedPayment.value.id, refundReason.value)
    showSnackbar('환불이 완료되었습니다.', 'success')
    isRefundDialogOpen.value = false
    selectedPayment.value = null
    refundReason.value = ''

    // 목록 새로고침
    await paymentStore.fetchPayments()
  }
  catch (error) {
    showSnackbar(error.message || '환불 처리에 실패했습니다.', 'error')
  }
}

// 초기화
onMounted(async () => {
  try {
    await paymentStore.fetchPayments()
  }
  catch (error) {
    // 결제 내역 조회 실패
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
