<route lang="yaml">
meta:
  layout: public
  public: true
  title: 예약 조회 - YEMO
</route>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const bookingStore = useBookingStore()
const { success: showSuccess, error: showError } = useSnackbar()

// Search form
const reservationNumber = ref('')
const phone = ref('')
const searchLoading = ref(false)
const searched = ref(false)

// Cancel dialog
const cancelDialog = ref(false)
const cancelReason = ref('')
const cancelLoading = ref(false)

// Store state
const reservation = computed(() => bookingStore.reservationLookup)

// Status config
const statusConfig = {
  PENDING: { color: 'warning', label: '대기중', icon: 'ri-time-line' },
  CONFIRMED: { color: 'info', label: '확정', icon: 'ri-check-line' },
  COMPLETED: { color: 'success', label: '완료', icon: 'ri-check-double-line' },
  CANCELLED: { color: 'error', label: '취소됨', icon: 'ri-close-circle-line' },
  NO_SHOW: { color: 'default', label: '노쇼', icon: 'ri-user-unfollow-line' },
}

function getStatusConfig(status) {
  return statusConfig[status] || { color: 'default', label: status, icon: 'ri-question-line' }
}

// Error code to message mapping
const errorMessages = {
  BK010: '전화번호가 일치하지 않습니다',
  BK005: '취소 기한이 초과되었습니다',
  BK006: '이미 취소된 예약입니다',
}

function getErrorMessage(error, defaultMessage) {
  return errorMessages[error?.code] || error?.message || defaultMessage
}

// Lookup reservation
async function handleLookup() {
  if (!reservationNumber.value.trim() || !phone.value.trim()) {
    showError('예약번호와 전화번호를 모두 입력해주세요')
    return
  }

  searchLoading.value = true
  searched.value = true

  try {
    await bookingStore.lookupReservation(
      reservationNumber.value.trim(),
      phone.value.trim(),
    )
  }
  catch (error) {
    const message = getErrorMessage(error, '예약 조회에 실패했습니다')
    showError(message)
    bookingStore.reservationLookup = null
  }
  finally {
    searchLoading.value = false
  }
}

// Open cancel dialog
function openCancelDialog() {
  cancelReason.value = ''
  cancelDialog.value = true
}

// Confirm cancellation
async function handleCancel() {
  cancelLoading.value = true

  try {
    await bookingStore.cancelReservation(reservationNumber.value.trim(), {
      phone: phone.value.trim(),
      reason: cancelReason.value || null,
    })
    showSuccess('예약이 취소되었습니다')
    cancelDialog.value = false

    // Reload reservation data
    await bookingStore.lookupReservation(
      reservationNumber.value.trim(),
      phone.value.trim(),
    )
  }
  catch (error) {
    const message = getErrorMessage(error, '예약 취소에 실패했습니다')
    showError(message)
  }
  finally {
    cancelLoading.value = false
  }
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

// Format datetime
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format cancel deadline
function formatCancelDeadline(deadlineStr) {
  if (!deadlineStr) return ''
  const date = new Date(deadlineStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="reservation-lookup-page py-8 py-md-12">
    <VContainer style="max-inline-size: 600px;">
          <!-- Page Title -->
          <div class="text-center mb-8">
            <VIcon
              icon="ri-calendar-check-line"
              size="48"
              color="primary"
              class="mb-3"
            />
            <h1 class="text-h4 font-weight-bold mb-2">
              예약 조회
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              예약번호와 전화번호로 예약 내역을 확인하세요
            </p>
          </div>

          <!-- Search Form Card -->
          <VCard
            class="mb-6"
            rounded="lg"
            elevation="2"
          >
            <VCardText class="pa-6">
              <VTextField
                v-model="reservationNumber"
                label="예약번호"
                placeholder="260220-A3B9"
                prepend-inner-icon="ri-hashtag"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                hide-details="auto"
                @keydown.enter="handleLookup"
              />

              <VTextField
                v-model="phone"
                label="전화번호"
                placeholder="010-0000-0000"
                prepend-inner-icon="ri-phone-line"
                variant="outlined"
                density="comfortable"
                class="mb-6"
                hide-details="auto"
                @keydown.enter="handleLookup"
              />

              <VBtn
                color="primary"
                size="large"
                block
                :loading="searchLoading"
                :disabled="!reservationNumber.trim() || !phone.trim()"
                @click="handleLookup"
              >
                <VIcon start>
                  ri-search-line
                </VIcon>
                예약 조회
              </VBtn>
            </VCardText>
          </VCard>

          <!-- No Result Message -->
          <div
            v-if="searched && !reservation && !searchLoading"
            class="text-center py-8"
          >
            <VIcon
              icon="ri-file-search-line"
              size="64"
              color="grey-lighten-1"
              class="mb-3"
            />
            <p class="text-body-1 text-medium-emphasis">
              예약 정보를 찾을 수 없습니다
            </p>
          </div>

          <!-- Result Card -->
          <VCard
            v-if="reservation"
            rounded="lg"
            elevation="2"
          >
            <!-- Status Header -->
            <div class="pa-6 pb-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <p class="text-body-2 text-medium-emphasis mb-1">
                    예약번호
                  </p>
                  <p class="text-h6 font-weight-bold">
                    {{ reservation.reservationNumber }}
                  </p>
                </div>
                <VChip
                  :color="getStatusConfig(reservation.status).color"
                  :prepend-icon="getStatusConfig(reservation.status).icon"
                  size="default"
                  label
                >
                  {{ getStatusConfig(reservation.status).label }}
                </VChip>
              </div>
            </div>

            <VDivider />

            <!-- Business Info -->
            <VCardText class="pa-6">
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  <VIcon
                    icon="ri-store-2-line"
                    size="20"
                    class="me-1"
                  />
                  매장 정보
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">매장명</span>
                    <span class="info-value">{{ reservation.businessName }}</span>
                  </div>
                  <div
                    v-if="reservation.businessAddress"
                    class="info-item"
                  >
                    <span class="info-label">주소</span>
                    <span class="info-value">{{ reservation.businessAddress }}</span>
                  </div>
                  <div
                    v-if="reservation.businessPhone"
                    class="info-item"
                  >
                    <span class="info-label">전화</span>
                    <span class="info-value">
                      <a
                        :href="`tel:${reservation.businessPhone}`"
                        class="text-primary text-decoration-none"
                      >
                        {{ reservation.businessPhone }}
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              <VDivider class="mb-6" />

              <!-- Reservation Details -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  <VIcon
                    icon="ri-calendar-line"
                    size="20"
                    class="me-1"
                  />
                  예약 정보
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">예약 날짜</span>
                    <span class="info-value">{{ formatDate(reservation.reservationDate) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">예약 시간</span>
                    <span class="info-value">{{ reservation.startTime }} ~ {{ reservation.endTime }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">담당 스태프</span>
                    <span class="info-value">{{ reservation.staffName || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">서비스</span>
                    <span class="info-value">
                      <VChip
                        v-for="(service, idx) in reservation.services"
                        :key="idx"
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="me-1 mb-1"
                      >
                        {{ service }}
                      </VChip>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">총 금액</span>
                    <span class="info-value font-weight-bold text-primary">
                      {{ reservation.totalPrice?.toLocaleString() }}원
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">소요 시간</span>
                    <span class="info-value">{{ reservation.totalDuration }}분</span>
                  </div>
                  <div
                    v-if="reservation.customerMemo"
                    class="info-item"
                  >
                    <span class="info-label">요청사항</span>
                    <span class="info-value">{{ reservation.customerMemo }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">예약일시</span>
                    <span class="info-value text-medium-emphasis">{{ formatDateTime(reservation.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Cancel Section -->
              <template v-if="reservation.canCancel">
                <VDivider class="mb-6" />

                <div>
                  <div class="d-flex align-center mb-3">
                    <VIcon
                      icon="ri-error-warning-line"
                      size="18"
                      color="warning"
                      class="me-2"
                    />
                    <span class="text-body-2 text-medium-emphasis">
                      취소 마감: {{ formatCancelDeadline(reservation.cancelDeadline) }}
                    </span>
                  </div>

                  <VBtn
                    color="error"
                    variant="outlined"
                    block
                    @click="openCancelDialog"
                  >
                    <VIcon start>
                      ri-close-circle-line
                    </VIcon>
                    예약 취소
                  </VBtn>
                </div>
              </template>
            </VCardText>
          </VCard>
    </VContainer>

    <!-- Cancel Confirmation Dialog -->
    <VDialog
      v-model="cancelDialog"
      max-width="440"
      persistent
    >
      <VCard rounded="lg">
        <VCardTitle class="text-h6 pa-6 pb-2">
          예약을 취소하시겠습니까?
        </VCardTitle>

        <VCardText class="pa-6 pt-3">
          <p class="text-body-2 text-medium-emphasis mb-4">
            예약 취소 후에는 되돌릴 수 없습니다. 취소 사유를 입력해 주세요.
          </p>

          <VTextarea
            v-model="cancelReason"
            label="취소 사유"
            placeholder="취소 사유를 입력해주세요 (선택)"
            variant="outlined"
            rows="3"
            counter="200"
            maxlength="200"
            hide-details="auto"
          />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="cancelDialog = false"
          >
            닫기
          </VBtn>
          <VBtn
            color="error"
            :loading="cancelLoading"
            @click="handleCancel"
          >
            취소하기
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss" scoped>
.reservation-lookup-page {
  min-block-size: 80vh;
  padding-block-end: 56px; // VBottomNavigation height

  @media (min-width: 600px) {
    padding-block-end: 0;
  }
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-label {
  flex-shrink: 0;
  inline-size: 80px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.info-value {
  flex: 1;
  font-size: 0.875rem;
  word-break: break-word;
}
</style>
