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
        <VCard variant="tonal" color="default">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-forbid-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">취소된 결제</p>
              <h6 class="text-h6">{{ paymentCounts.CANCELLED }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 결제 목록 -->
    <VCard>
      <VCardTitle class="d-flex align-center pe-2" :class="{ 'flex-wrap ga-2': smAndDown }">
        <VIcon icon="ri-file-list-line" size="24" class="me-3" />
        <span>결제 내역</span>

        <VSpacer />

        <!-- 날짜 필터 -->
        <VTextField
          v-model="dateFrom"
          type="date"
          label="시작일"
          density="compact"
          hide-details
          clearable
          :style="smAndDown ? 'max-inline-size: 130px;' : 'max-inline-size: 160px;'"
          class="me-2"
        />
        <VTextField
          v-model="dateTo"
          type="date"
          label="종료일"
          density="compact"
          hide-details
          clearable
          :style="smAndDown ? 'max-inline-size: 130px;' : 'max-inline-size: 160px;'"
          class="me-2"
        />

        <!-- 상태 필터 -->
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="전체 상태"
          density="compact"
          :style="smAndDown ? 'max-inline-size: 140px;' : 'max-inline-size: 180px;'"
          clearable
          hide-details
        />
      </VCardTitle>

      <!-- 로딩 상태 -->
      <div v-if="loading && payments.length === 0" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
        <p class="text-body-1 text-medium-emphasis mt-4">
          결제 내역을 불러오는 중...
        </p>
      </div>

      <!-- 모바일 카드 뷰 -->
      <template v-else-if="smAndDown">
        <!-- 데이터 없음 -->
        <template v-if="filteredPayments.length === 0">
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

        <!-- 카드 리스트 -->
        <div v-else class="pa-3 d-flex flex-column gap-3">
          <VCard
            v-for="item in paginatedPayments"
            :key="item.id"
            variant="outlined"
            class="payment-mobile-card"
            @click="viewDetail(item)"
          >
            <VCardText class="pa-3">
              <!-- 상단: 결제일 + 상태 -->
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-body-2 text-disabled">
                  {{ formatDate(item.createdAt) }}
                </div>
                <div class="d-flex align-center gap-1">
                  <VChip
                    v-if="item.isExtension"
                    color="info"
                    size="x-small"
                    variant="tonal"
                  >
                    연장
                  </VChip>
                  <VChip
                    :color="getStatusColor(item.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ getStatusText(item.status) }}
                  </VChip>
                </div>
              </div>

              <VDivider class="mb-2" />

              <!-- 중단: 결제 정보 -->
              <div class="d-flex flex-column gap-1">
                <div class="d-flex align-center justify-space-between text-body-2">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-money-dollar-circle-line" size="16" class="me-2 text-disabled" />
                    <span>결제금액</span>
                  </div>
                  <span class="font-weight-bold text-primary">{{ formatCurrency(item.amount) }}</span>
                </div>

                <div class="d-flex align-center justify-space-between text-body-2">
                  <div class="d-flex align-center">
                    <VIcon :icon="getPaymentMethodIcon(item.paymentMethod)" size="16" class="me-2 text-disabled" />
                    <span>결제수단</span>
                  </div>
                  <span>{{ getPaymentMethodName(item.paymentMethod) }}</span>
                </div>

                <div class="d-flex align-center justify-space-between text-body-2">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-price-tag-3-line" size="16" class="me-2 text-disabled" />
                    <span>플랜</span>
                  </div>
                  <VChip
                    :color="getPlanColor(item.subscriptionPlan)"
                    size="x-small"
                  >
                    {{ getPlanName(item.subscriptionPlan) }}
                  </VChip>
                </div>

                <div class="d-flex align-center justify-space-between text-body-2">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-hashtag" size="16" class="me-2 text-disabled" />
                    <span>주문번호</span>
                  </div>
                  <span class="text-disabled">#{{ item.id }}</span>
                </div>
              </div>

              <!-- 하단: 액션 버튼 -->
              <div v-if="item.status === 'COMPLETED' || item.status === 'PENDING'" class="mt-2 d-flex justify-end gap-2">
                <VBtn
                  v-if="item.status === 'COMPLETED' || item.status === 'PENDING'"
                  variant="tonal"
                  color="default"
                  size="small"
                  prepend-icon="ri-forbid-line"
                  @click.stop="openCancelDialog(item)"
                >
                  취소
                </VBtn>
                <VBtn
                  v-if="item.status === 'COMPLETED'"
                  variant="tonal"
                  color="error"
                  size="small"
                  prepend-icon="ri-refund-line"
                  @click.stop="openRefundDialog(item)"
                >
                  환불
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <!-- 모바일 페이지네이션 -->
          <div
            v-if="mobileTotalPages > 1"
            class="d-flex justify-center pt-2 pb-1"
          >
            <VPagination
              v-model="mobilePage"
              :length="mobileTotalPages"
              :total-visible="5"
              density="compact"
              size="small"
            />
          </div>
        </div>
      </template>

      <!-- 데스크톱 결제 목록 테이블 -->
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
          <div class="d-flex align-center gap-1">
            <VChip
              :color="getPlanColor(item.subscriptionPlan)"
              size="small"
            >
              {{ getPlanName(item.subscriptionPlan) }}
            </VChip>
            <VChip
              v-if="item.isExtension"
              color="info"
              size="x-small"
              variant="tonal"
            >
              연장
            </VChip>
          </div>
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
              v-if="item.status === 'COMPLETED' || item.status === 'PENDING'"
              icon
              variant="text"
              size="small"
              @click="openCancelDialog(item)"
            >
              <VIcon icon="ri-forbid-line" />
              <VTooltip activator="parent" location="top">
                취소
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

            <!-- 기간 연장 여부 -->
            <VCol v-if="selectedPayment.isExtension" cols="12">
              <VAlert type="info" variant="tonal" density="compact">
                <div class="d-flex align-center mb-1">
                  <VIcon icon="ri-calendar-check-line" size="18" class="me-2" />
                  <strong>기간 연장 결제</strong>
                </div>
                <p class="mb-0">
                  기존 종료일 {{ formatDate(selectedPayment.previousBillingEndDate) }} 에서 연장되었습니다.
                </p>
              </VAlert>
            </VCol>

            <!-- 실패 사유 -->
            <VCol v-if="selectedPayment.failReason" cols="12">
              <VAlert type="error" variant="tonal" density="compact">
                <strong>실패 사유:</strong> {{ selectedPayment.failReason }}
              </VAlert>
            </VCol>

            <!-- 취소 정보 -->
            <VCol v-if="selectedPayment.status === 'CANCELLED'" cols="12">
              <VAlert type="default" variant="tonal" density="compact">
                <p class="mb-1"><strong>취소 사유:</strong> {{ selectedPayment.cancelReason || '-' }}</p>
                <p class="mb-1"><strong>취소일:</strong> {{ formatDate(selectedPayment.cancelledAt) }}</p>
                <p v-if="selectedPayment.refundAmount" class="mb-0">
                  <strong>환불 금액:</strong> {{ formatCurrency(selectedPayment.refundAmount) }}
                </p>
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

    <!-- 결제 취소 다이얼로그 -->
    <VDialog
      v-model="isCancelDialogOpen"
      max-width="480"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-forbid-line" color="error" class="me-2" />
          결제 취소
        </VCardTitle>

        <VCardText>
          <VAlert type="info" variant="tonal" class="mb-4">
            <div class="d-flex flex-column gap-1">
              <div class="d-flex justify-space-between">
                <span>결제 금액</span>
                <strong>{{ formatCurrency(selectedCancelPayment?.amount) }}</strong>
              </div>
              <div class="d-flex justify-space-between">
                <span>결제일</span>
                <span>{{ formatDate(selectedCancelPayment?.createdAt) }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span>현재 상태</span>
                <VChip :color="getStatusColor(selectedCancelPayment?.status)" size="x-small">
                  {{ getStatusText(selectedCancelPayment?.status) }}
                </VChip>
              </div>
            </div>
          </VAlert>

          <VTextField
            v-model="cancelReason"
            label="취소 사유 *"
            placeholder="취소 사유를 입력하세요"
            counter
            maxlength="200"
            class="mb-4"
          />

          <VAlert
            type="warning"
            variant="tonal"
            density="compact"
          >
            <ul class="text-caption ps-4 mb-0">
              <li>대기 상태 결제는 즉시 취소됩니다.</li>
              <li>완료 상태 결제는 취소 후 자동 환불 처리됩니다.</li>
              <li>취소 후에는 되돌릴 수 없습니다.</li>
            </ul>
          </VAlert>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="isCancelDialogOpen = false"
          >
            닫기
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            :disabled="!cancelReason"
            :loading="cancelSubmitting"
            @click="handleCancel"
          >
            결제 취소
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 환불 다이얼로그 -->
    <VDialog
      v-model="isRefundDialogOpen"
      max-width="560"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-refund-line" color="warning" class="me-2" />
          환불 요청
        </VCardTitle>

        <VCardText>
          <!-- 로딩 -->
          <div v-if="refundLoading" class="text-center pa-4">
            <VProgressCircular indeterminate color="primary" size="32" />
            <p class="text-body-2 text-medium-emphasis mt-2">환불 정보를 계산하는 중...</p>
          </div>

          <template v-else>
            <!-- 1. 결제 정보 요약 -->
            <VAlert type="info" variant="tonal" class="mb-4">
              <div class="d-flex flex-column gap-1">
                <div class="d-flex justify-space-between">
                  <span>결제 금액</span>
                  <strong>{{ formatCurrency(selectedPayment?.amount) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>결제일</span>
                  <span>{{ formatDate(selectedPayment?.createdAt) }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span>구독 기간</span>
                  <span>{{ formatDate(selectedPayment?.billingStartDate) }} ~ {{ formatDate(selectedPayment?.billingEndDate) }}</span>
                </div>
              </div>
            </VAlert>

            <!-- 2. 환불 예상 금액 -->
            <VCard variant="outlined" class="mb-4">
              <VCardText>
                <p class="text-body-2 text-medium-emphasis mb-2">환불 예상 금액</p>

                <!-- 사용/잔여 기간 -->
                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span>사용 {{ refundPreview?.usedDays || 0 }}일 / 잔여 {{ refundPreview?.remainingDays || 0 }}일</span>
                  <span>총 {{ refundPreview?.totalDays || 0 }}일</span>
                </div>
                <VProgressLinear
                  :model-value="refundPreview?.usagePercent || 0"
                  color="primary"
                  height="8"
                  rounded
                  class="mb-3"
                />

                <!-- 계산 수식 -->
                <p v-if="refundPreview?.formula" class="text-caption text-medium-emphasis mb-3">
                  {{ refundPreview.formula }}
                </p>

                <!-- 환불 금액 강조 -->
                <div class="text-center pa-3 rounded" style="background: rgba(var(--v-theme-warning), 0.08);">
                  <p class="text-body-2 text-medium-emphasis mb-1">예상 환불 금액</p>
                  <p class="text-h4 font-weight-bold text-warning">
                    {{ formatCurrency(refundPreview?.refundAmount || 0) }}
                  </p>
                  <VChip
                    v-if="refundPreview?.isFullRefund"
                    color="success"
                    size="small"
                    class="mt-1"
                  >
                    전액 환불
                  </VChip>
                </div>
              </VCardText>
            </VCard>

            <!-- 3. 환불 사유 입력 -->
            <VTextField
              v-model="refundReason"
              label="환불 사유 *"
              placeholder="환불 사유를 입력하세요"
              counter
              maxlength="200"
              class="mb-4"
            />

            <!-- 4. 경고 안내 -->
            <VAlert
              type="warning"
              variant="tonal"
              density="compact"
            >
              <ul class="text-caption ps-4 mb-0">
                <li>환불 처리 후 구독이 무료 플랜으로 전환됩니다.</li>
                <li>결제 후 7일 이내 전액 환불이 가능합니다.</li>
                <li>환불 금액은 사용 기간에 따라 일할 계산됩니다.</li>
              </ul>
            </VAlert>
          </template>
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
            :disabled="!refundReason || refundLoading"
            :loading="refundSubmitting"
            @click="handleRefund"
          >
            {{ refundPreview?.refundAmount ? formatCurrency(refundPreview.refundAmount) + ' 환불' : '환불 요청' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { usePaymentStore } from '@/stores/payment'
import { calculateRefund } from '@/utils/refundCalculator'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import { useDisplay } from 'vuetify'

const router = useRouter()
const paymentStore = usePaymentStore()
const { showSnackbar } = useSnackbar()
const { smAndDown } = useDisplay()

const {
  payments,
  loading,
  paymentCounts,
} = storeToRefs(paymentStore)

const statusFilter = ref(null)
const dateFrom = ref(null)
const dateTo = ref(null)
const isDetailDialogOpen = ref(false)
const isRefundDialogOpen = ref(false)
const isCancelDialogOpen = ref(false)
const selectedPayment = ref(null)
const selectedCancelPayment = ref(null)
const refundReason = ref('')
const cancelReason = ref('')
const refundPreview = ref(null)
const refundLoading = ref(false)
const refundSubmitting = ref(false)
const cancelSubmitting = ref(false)

// 모바일 페이지네이션
const mobilePage = ref(1)
const mobileItemsPerPage = 10

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
  { title: '취소', value: 'CANCELLED' },
  { title: '대기', value: 'PENDING' },
]

// 서버사이드 필터 파라미터를 구성하여 결제 목록 조회
async function loadPayments() {
  const params = {}
  if (statusFilter.value) params.status = statusFilter.value
  if (dateFrom.value) params.startDate = dateFrom.value
  if (dateTo.value) params.endDate = dateTo.value

  try {
    await paymentStore.fetchPayments(params)
  } catch {
    // 조회 실패
  }
}

// 필터 변경 감시 → 서버사이드 필터 재조회
watch([statusFilter, dateFrom, dateTo], () => {
  loadPayments()
})

// 필터링된 결제 목록 (서버사이드 필터 적용 후 그대로 사용)
const filteredPayments = computed(() => payments.value)

// 모바일 페이지네이션 총 페이지 수
const mobileTotalPages = computed(() =>
  Math.ceil(filteredPayments.value.length / mobileItemsPerPage),
)

// 페이지네이션된 결제 목록 (모바일)
const paginatedPayments = computed(() => {
  const start = (mobilePage.value - 1) * mobileItemsPerPage
  return filteredPayments.value.slice(start, start + mobileItemsPerPage)
})

// 플랜 이름
function getPlanName(plan) {
  const names = {
    FREE: '무료',
    BASIC: '유료',
    PAID: '유료',
  }
  return names[plan] || plan
}

// 플랜 색상
function getPlanColor(plan) {
  const colors = {
    FREE: 'default',
    BASIC: 'success',
    PAID: 'primary',
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
    CANCELLED: '취소',
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
    CANCELLED: 'default',
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
async function openRefundDialog(payment) {
  selectedPayment.value = payment
  refundReason.value = ''
  refundPreview.value = null
  refundLoading.value = true
  isRefundDialogOpen.value = true

  // Try API first, fallback to local calculation
  try {
    const preview = await paymentStore.fetchRefundPreview(payment.id)
    if (preview) {
      refundPreview.value = preview
    } else {
      refundPreview.value = calculateRefund(payment)
    }
  } catch {
    refundPreview.value = calculateRefund(payment)
  } finally {
    refundLoading.value = false
  }
}

// 환불 처리
async function handleRefund() {
  if (!refundReason.value) {
    showSnackbar('환불 사유를 입력해주세요.', 'warning')
    return
  }

  refundSubmitting.value = true
  try {
    await paymentStore.refundPayment(selectedPayment.value.id, refundReason.value)
    showSnackbar('환불이 완료되었습니다.', 'success')
    isRefundDialogOpen.value = false
    selectedPayment.value = null
    refundReason.value = ''

    // 목록 새로고침
    await loadPayments()
  }
  catch (error) {
    showSnackbar(error.message || '환불 처리에 실패했습니다.', 'error')
  }
  finally {
    refundSubmitting.value = false
  }
}

// 결제 취소 다이얼로그 열기
function openCancelDialog(payment) {
  selectedCancelPayment.value = payment
  cancelReason.value = ''
  isCancelDialogOpen.value = true
}

// 결제 취소 처리
async function handleCancel() {
  if (!cancelReason.value) {
    showSnackbar('취소 사유를 입력해주세요.', 'warning')
    return
  }

  cancelSubmitting.value = true
  try {
    const result = await paymentStore.cancelPayment(selectedCancelPayment.value.id, cancelReason.value)
    const msg = result?.refundAmount
      ? `결제가 취소되었습니다. (환불 금액: ${formatCurrency(result.refundAmount)})`
      : '결제가 취소되었습니다.'
    showSnackbar(msg, 'success')
    isCancelDialogOpen.value = false
    selectedCancelPayment.value = null
    cancelReason.value = ''

    // 목록 새로고침
    await loadPayments()
  }
  catch (error) {
    const code = error.response?.data?.error?.code
    if (code === 'PM001') {
      showSnackbar('이미 취소된 결제입니다.', 'warning')
    } else if (code === 'PM002') {
      showSnackbar('취소할 수 없는 결제 상태입니다.', 'warning')
    } else {
      showSnackbar(error.response?.data?.error?.message || error.message || '결제 취소에 실패했습니다.', 'error')
    }
  }
  finally {
    cancelSubmitting.value = false
  }
}

// 초기화
onMounted(() => {
  loadPayments()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.payment-mobile-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-mobile-card:hover,
.payment-mobile-card:active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
