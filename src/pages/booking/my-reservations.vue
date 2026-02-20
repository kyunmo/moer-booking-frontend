<route lang="yaml">
meta:
  layout: public
  public: true
  requiresCustomerAuth: true
  title: 내 예약 - YEMO
</route>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { useSnackbar } from '@/composables/useSnackbar'
import customerApi from '@/api/customer'
import { formatTimeRange } from '@/utils/dateFormat'

const router = useRouter()
const customerAuthStore = useCustomerAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

onMounted(() => {
  fetchReservations()
})

// --- State ---
const reservations = ref([])
const totalCount = ref(0)
const loading = ref(false)
const statusFilter = ref('ALL')
const page = ref(1)
const pageSize = 10

// Detail dialog
const detailDialog = ref(false)
const detailItem = ref(null)
const detailLoading = ref(false)

// Cancel dialog
const cancelDialog = ref(false)
const cancelTarget = ref(null)
const cancelReason = ref('')
const cancelLoading = ref(false)

// --- Status Config ---
const statusConfig = {
  PENDING: { color: 'warning', label: '대기중', icon: 'ri-time-line' },
  CONFIRMED: { color: 'info', label: '확정', icon: 'ri-check-line' },
  COMPLETED: { color: 'success', label: '완료', icon: 'ri-check-double-line' },
  CANCELLED: { color: 'error', label: '취소됨', icon: 'ri-close-circle-line' },
  NO_SHOW: { color: 'grey', label: '노쇼', icon: 'ri-user-unfollow-line' },
}

const statusFilters = [
  { label: '전체', value: 'ALL' },
  { label: '대기중', value: 'PENDING' },
  { label: '확정', value: 'CONFIRMED' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소됨', value: 'CANCELLED' },
  { label: '노쇼', value: 'NO_SHOW' },
]

function getStatusConfig(status) {
  return statusConfig[status] || { color: 'default', label: status, icon: 'ri-question-line' }
}

// --- Computed ---
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)
const isEmpty = computed(() => !loading.value && reservations.value.length === 0)

// --- API ---
async function fetchReservations() {
  loading.value = true

  try {
    const params = {
      page: page.value,
      size: pageSize,
    }

    if (statusFilter.value !== 'ALL') {
      params.status = statusFilter.value
    }

    const result = await customerApi.getMyReservations(params)

    // axios interceptor가 response.data를 반환 → { success, data: { content, totalElements, ... } }
    const data = result?.data ?? result

    if (Array.isArray(data)) {
      reservations.value = data
      totalCount.value = data.length
    }
    else if (data) {
      reservations.value = data.content || data.items || []
      totalCount.value = data.totalElements || data.totalCount || 0
    }
    else {
      reservations.value = []
      totalCount.value = 0
    }
  }
  catch (error) {
    if (error.status === 401) {
      showError('로그인이 필요합니다')
      router.replace('/booking/login?redirect=/booking/my-reservations')

      return
    }
    showError(error.message || '예약 목록을 불러오지 못했습니다')
  }
  finally {
    loading.value = false
  }
}

async function openDetail(reservation) {
  detailItem.value = reservation
  detailDialog.value = true
  detailLoading.value = true

  try {
    const result = await customerApi.getReservation(reservation.reservationNumber)

    detailItem.value = result?.data ?? result
  }
  catch (error) {
    showError(error.message || '예약 상세 조회에 실패했습니다')
  }
  finally {
    detailLoading.value = false
  }
}

function openCancelDialog(reservation) {
  cancelTarget.value = reservation
  cancelReason.value = ''
  cancelDialog.value = true
}

async function handleCancel() {
  if (!cancelTarget.value) return

  cancelLoading.value = true

  try {
    await customerApi.cancelReservation(cancelTarget.value.reservationNumber, {
      reason: cancelReason.value || null,
    })

    showSuccess('예약이 취소되었습니다')
    cancelDialog.value = false
    cancelTarget.value = null

    // 목록 새로고침
    await fetchReservations()
  }
  catch (error) {
    const message = error.message || '예약 취소에 실패했습니다'

    showError(message)
  }
  finally {
    cancelLoading.value = false
  }
}

function getBusinessIdentifier(reservation) {
  return reservation.businessSlug || reservation.businessId || null
}

function goToReview(reservation) {
  const identifier = getBusinessIdentifier(reservation)
  if (!identifier) {
    showError('매장 정보를 찾을 수 없습니다')

    return
  }
  router.push(`/booking/${identifier}/review?reservationNumber=${reservation.reservationNumber}`)
}

function goToBooking(reservation) {
  const identifier = getBusinessIdentifier(reservation)
  if (!identifier) {
    showError('매장 정보를 찾을 수 없습니다')

    return
  }
  router.push(`/booking/${identifier}`)
}

async function handleRebook(reservation) {
  const identifier = getBusinessIdentifier(reservation)
  if (!identifier) {
    showError('매장 정보를 찾을 수 없습니다')

    return
  }

  // 상세 조회로 serviceIds, staffId 확보
  try {
    const result = await customerApi.getReservation(reservation.reservationNumber)
    const data = result?.data ?? result
    const query = { rebook: 'true' }

    if (data?.serviceIds?.length) {
      query.serviceIds = data.serviceIds.join(',')
    }
    if (data?.staffId) {
      query.staffId = String(data.staffId)
    }

    router.push({
      path: `/booking/${identifier}/reserve`,
      query,
    })
  }
  catch (error) {
    showError('재예약 정보를 불러오지 못했습니다')
  }
}

// --- Watchers ---
watch(statusFilter, () => {
  page.value = 1
  fetchReservations()
})

watch(page, () => {
  fetchReservations()
})

// --- Formatters ---
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

function formatPrice(price) {
  if (!price && price !== 0) return ''

  return price.toLocaleString() + '원'
}
</script>

<template>
  <div class="my-reservations-page py-8 py-md-12">
    <VContainer style="max-inline-size: 800px;">
      <!-- Page Title -->
      <div class="text-center mb-8">
        <VIcon
          icon="ri-calendar-check-line"
          size="48"
          color="primary"
          class="mb-3"
        />
        <h1 class="text-h4 font-weight-bold mb-2">
          내 예약
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          예약 내역을 확인하고 관리하세요
        </p>
      </div>

      <!-- Status Filter -->
      <div class="d-flex justify-center mb-6">
        <VChipGroup
          v-model="statusFilter"
          mandatory
          selected-class="text-primary"
        >
          <VChip
            v-for="filter in statusFilters"
            :key="filter.value"
            :value="filter.value"
            variant="outlined"
            filter
          >
            {{ filter.label }}
          </VChip>
        </VChipGroup>
      </div>

      <!-- Loading State -->
      <template v-if="loading">
        <VCard
          v-for="n in 3"
          :key="n"
          class="mb-4"
          rounded="lg"
          variant="outlined"
        >
          <VCardText>
            <VSkeletonLoader type="list-item-avatar-three-line" />
          </VCardText>
        </VCard>
      </template>

      <!-- Empty State -->
      <div
        v-else-if="isEmpty"
        class="text-center py-16"
      >
        <VIcon
          icon="ri-calendar-line"
          size="80"
          color="grey-lighten-1"
          class="mb-4"
        />
        <h3 class="text-h6 text-medium-emphasis mb-2">
          예약 내역이 없습니다
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-6">
          {{ statusFilter === 'ALL' ? '아직 예약한 내역이 없습니다' : '해당 상태의 예약이 없습니다' }}
        </p>
        <VBtn
          color="primary"
          variant="outlined"
          @click="router.push('/booking')"
        >
          <VIcon start>
            ri-search-line
          </VIcon>
          매장 검색하기
        </VBtn>
      </div>

      <!-- Reservation List -->
      <template v-else>
        <VCard
          v-for="reservation in reservations"
          :key="reservation.reservationNumber"
          class="reservation-card mb-4"
          rounded="lg"
          variant="outlined"
          hover
          @click="openDetail(reservation)"
        >
          <VCardText class="pa-4 pa-sm-5">
            <!-- Top: Business + Status -->
            <div class="d-flex align-start justify-space-between mb-3">
              <div class="d-flex align-center gap-3 flex-grow-1" style="min-inline-size: 0;">
                <!-- Business Avatar -->
                <VAvatar
                  size="48"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <VImg
                    v-if="reservation.businessProfileImageUrl"
                    :src="reservation.businessProfileImageUrl"
                    :alt="reservation.businessName"
                    cover
                  />
                  <VIcon
                    v-else
                    icon="ri-store-2-line"
                    size="24"
                  />
                </VAvatar>

                <div style="min-inline-size: 0;">
                  <div class="text-subtitle-1 font-weight-bold text-truncate">
                    {{ reservation.businessName }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ formatDate(reservation.reservationDate) }}
                  </div>
                </div>
              </div>

              <VChip
                :color="getStatusConfig(reservation.status).color"
                :prepend-icon="getStatusConfig(reservation.status).icon"
                size="small"
                label
                class="ms-2 flex-shrink-0"
              >
                {{ getStatusConfig(reservation.status).label }}
              </VChip>
            </div>

            <!-- Middle: Details -->
            <div class="d-flex flex-wrap gap-x-4 gap-y-1 mb-3 text-body-2">
              <div class="d-flex align-center gap-1">
                <VIcon
                  icon="ri-time-line"
                  size="16"
                  color="medium-emphasis"
                />
                <span>{{ formatTimeRange(reservation.startTime, reservation.endTime) }}</span>
              </div>

              <div class="d-flex align-center gap-1">
                <VIcon
                  icon="ri-user-line"
                  size="16"
                  color="medium-emphasis"
                />
                <span>{{ reservation.staffName || '자동 배정' }}</span>
              </div>

              <div class="d-flex align-center gap-1 font-weight-bold text-primary">
                {{ formatPrice(reservation.totalPrice) }}
              </div>
            </div>

            <!-- Services -->
            <div class="d-flex flex-wrap gap-1 mb-3">
              <VChip
                v-for="(service, idx) in reservation.services"
                :key="idx"
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ typeof service === 'string' ? service : service.name }}
              </VChip>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                v-if="reservation.canCancel"
                color="error"
                variant="outlined"
                size="small"
                @click.stop="openCancelDialog(reservation)"
              >
                <VIcon
                  start
                  size="16"
                >
                  ri-close-circle-line
                </VIcon>
                예약 취소
              </VBtn>

              <VBtn
                v-if="reservation.status === 'COMPLETED' && !reservation.hasReview"
                color="warning"
                variant="tonal"
                size="small"
                @click.stop="goToReview(reservation)"
              >
                <VIcon
                  start
                  size="16"
                >
                  ri-star-line
                </VIcon>
                리뷰 작성
              </VBtn>

              <VBtn
                v-if="reservation.status === 'COMPLETED' && reservation.hasReview"
                color="success"
                variant="text"
                size="small"
                disabled
              >
                <VIcon
                  start
                  size="16"
                >
                  ri-check-line
                </VIcon>
                리뷰 작성됨
              </VBtn>

              <VBtn
                v-if="reservation.status === 'COMPLETED'"
                color="primary"
                variant="tonal"
                size="small"
                @click.stop="handleRebook(reservation)"
              >
                <VIcon
                  start
                  size="16"
                >
                  ri-repeat-line
                </VIcon>
                재예약
              </VBtn>
            </div>
          </VCardText>
        </VCard>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="d-flex justify-center mt-6"
        >
          <VPagination
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            rounded
            active-color="primary"
          />
        </div>
      </template>
    </VContainer>

    <!-- Detail Dialog -->
    <VDialog
      v-model="detailDialog"
      max-width="600"
      scrollable
    >
      <VCard rounded="lg">
        <VCardTitle class="d-flex align-center justify-space-between pa-5 pb-3">
          <span class="text-h6">예약 상세</span>
          <VBtn
            icon
            size="small"
            variant="text"
            @click="detailDialog = false"
          >
            <VIcon>ri-close-line</VIcon>
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <!-- Loading -->
          <div
            v-if="detailLoading"
            class="text-center py-8"
          >
            <VProgressCircular
              indeterminate
              color="primary"
            />
          </div>

          <template v-else-if="detailItem">
            <!-- Status & Reservation Number -->
            <div class="d-flex align-center justify-space-between mb-6">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">
                  예약번호
                </p>
                <p class="text-h6 font-weight-bold">
                  {{ detailItem.reservationNumber }}
                </p>
              </div>
              <VChip
                :color="getStatusConfig(detailItem.status).color"
                :prepend-icon="getStatusConfig(detailItem.status).icon"
                size="default"
                label
              >
                {{ getStatusConfig(detailItem.status).label }}
              </VChip>
            </div>

            <!-- Business Info -->
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
                  <span class="info-value">
                    <a
                      v-if="getBusinessIdentifier(detailItem)"
                      class="text-primary text-decoration-none cursor-pointer"
                      @click="goToBooking(detailItem); detailDialog = false"
                    >
                      {{ detailItem.businessName }}
                    </a>
                    <span v-else>{{ detailItem.businessName }}</span>
                  </span>
                </div>
              </div>
            </div>

            <VDivider class="mb-6" />

            <!-- Reservation Info -->
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
                  <span class="info-value">{{ formatDate(detailItem.reservationDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">예약 시간</span>
                  <span class="info-value">{{ formatTimeRange(detailItem.startTime, detailItem.endTime) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">담당자</span>
                  <span class="info-value">{{ detailItem.staffName || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">서비스</span>
                  <span class="info-value">
                    <VChip
                      v-for="(service, idx) in detailItem.services"
                      :key="idx"
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="me-1 mb-1"
                    >
                      {{ typeof service === 'string' ? service : service.name }}
                    </VChip>
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">총 금액</span>
                  <span class="info-value font-weight-bold text-primary">
                    {{ formatPrice(detailItem.totalPrice) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">예약일시</span>
                  <span class="info-value text-medium-emphasis">
                    {{ formatDateTime(detailItem.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <VDivider class="mb-4" />

            <div class="d-flex flex-wrap gap-2">
              <VBtn
                v-if="detailItem.canCancel"
                color="error"
                variant="outlined"
                @click="detailDialog = false; openCancelDialog(detailItem)"
              >
                <VIcon start>
                  ri-close-circle-line
                </VIcon>
                예약 취소
              </VBtn>

              <VBtn
                v-if="detailItem.status === 'COMPLETED' && !detailItem.hasReview"
                color="warning"
                variant="tonal"
                @click="detailDialog = false; goToReview(detailItem)"
              >
                <VIcon start>
                  ri-star-line
                </VIcon>
                리뷰 작성
              </VBtn>

              <VBtn
                v-if="detailItem.status === 'COMPLETED'"
                color="primary"
                variant="tonal"
                @click="detailDialog = false; handleRebook(detailItem)"
              >
                <VIcon start>
                  ri-repeat-line
                </VIcon>
                재예약
              </VBtn>

              <VSpacer />

              <VBtn
                variant="text"
                @click="detailDialog = false"
              >
                닫기
              </VBtn>
            </div>
          </template>
        </VCardText>
      </VCard>
    </VDialog>

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
.my-reservations-page {
  min-block-size: 80vh;
  padding-block-end: 56px; // VBottomNavigation height

  @media (min-width: 600px) {
    padding-block-end: 0;
  }
}

.reservation-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
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

.cursor-pointer {
  cursor: pointer;
}
</style>
