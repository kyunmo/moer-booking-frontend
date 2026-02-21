<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2" :class="{ 'flex-wrap ga-2': smAndDown }">
        <VIcon icon="ri-list-check" size="24" class="me-3" />
        <span>예약 목록</span>

        <VSpacer />

        <!-- 새 예약 등록 -->
        <VTooltip
          v-if="!subscriptionStore.canCreateReservation"
          location="bottom"
        >
          <template #activator="{ props }">
            <VBtn
              color="primary"
              prepend-icon="ri-add-line"
              disabled
              v-bind="props"
              :size="smAndDown ? 'small' : 'default'"
            >
              예약 등록
            </VBtn>
          </template>
          <span>월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
        </VTooltip>
        <VBtn
          v-else
          color="primary"
          prepend-icon="ri-add-line"
          :size="smAndDown ? 'small' : 'default'"
          @click="openCreateDialog"
        >
          예약 등록
        </VBtn>
      </VCardTitle>

      <!-- 필터 영역 -->
      <VCardText class="pt-0">
        <VRow dense>
          <VCol cols="12" sm="4" md="3">
            <VTextField
              v-model="dateFilter"
              type="date"
              label="예약 날짜"
              prepend-inner-icon="ri-calendar-line"
              density="compact"
              clearable
              hide-details
            />
          </VCol>

          <VCol cols="6" sm="4" md="3">
            <VSelect
              v-model="statusFilter"
              :items="statusOptions"
              placeholder="전체 상태"
              aria-label="예약 상태 필터"
              density="compact"
              clearable
              hide-details
            />
          </VCol>

          <VCol cols="6" sm="4" md="6">
            <VTextField
              v-model="searchQuery"
              placeholder="고객명 또는 전화번호 검색"
              aria-label="고객명 또는 전화번호 검색"
              prepend-inner-icon="ri-search-line"
              density="compact"
              clearable
              hide-details
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="대기"
          :value="`${reservationStore.pendingReservations.length}건`"
          icon="ri-time-line"
          color="warning"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="확정"
          :value="`${reservationStore.confirmedReservations.length}건`"
          icon="ri-check-line"
          color="primary"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="완료"
          :value="`${reservationStore.completedReservations.length}건`"
          icon="ri-checkbox-circle-line"
          color="success"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="취소"
          :value="`${reservationStore.cancelledReservations.length}건`"
          icon="ri-close-circle-line"
          color="error"
        />
      </VCol>
    </VRow>

    <!-- 예약 테이블 -->
    <VCard>
      <!-- 로딩 -->
      <div v-if="reservationStore.loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 모바일 카드 뷰 -->
      <template v-else-if="smAndDown">
        <!-- 데이터 없음 -->
        <template v-if="filteredReservations.length === 0">
          <EmptyState
            icon="ri-calendar-line"
            title="등록된 예약이 없습니다"
            description="첫 예약을 등록하세요"
          >
            <VTooltip
              v-if="!subscriptionStore.canCreateReservation"
              location="bottom"
            >
              <template #activator="{ props }">
                <VBtn
                  color="primary"
                  disabled
                  v-bind="props"
                >
                  <VIcon icon="ri-add-line" class="me-2" />
                  예약 등록하기
                </VBtn>
              </template>
              <span>월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
            </VTooltip>
            <VBtn
              v-else
              color="primary"
              @click="openCreateDialog"
            >
              <VIcon icon="ri-add-line" class="me-2" />
              예약 등록하기
            </VBtn>
          </EmptyState>
        </template>

        <!-- 카드 리스트 -->
        <div v-else class="pa-3 d-flex flex-column gap-3">
          <VCard
            v-for="item in paginatedReservations"
            :key="item.id"
            variant="outlined"
            class="reservation-mobile-card"
            :class="getReservationRowClass(item)"
            :style="getReservationRowStyle(item)"
            @click="viewReservation(item)"
          >
            <VCardText class="pa-3">
              <!-- 상단: 고객명 + 상태 -->
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <VAvatar
                    color="primary"
                    size="32"
                    class="me-2"
                  >
                    <span class="text-xs">{{ item.customerName ? item.customerName.charAt(0) : '?' }}</span>
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium text-body-1">{{ item.customerName || '-' }}</div>
                    <div class="text-xs text-disabled">{{ item.customerPhone || '-' }}</div>
                  </div>
                </div>

                <!-- 상태 칩 (변경 가능) -->
                <VMenu v-if="['PENDING', 'CONFIRMED'].includes(item.status)">
                  <template #activator="{ props }">
                    <VChip
                      v-bind="props"
                      :color="getStatusColor(item.status)"
                      size="small"
                      variant="tonal"
                      class="cursor-pointer"
                      append-icon="ri-arrow-down-s-line"
                      @click.stop
                    >
                      {{ getStatusText(item.status) }}
                    </VChip>
                  </template>
                  <VList density="compact" min-width="140">
                    <VListItem
                      v-if="item.status === 'PENDING'"
                      prepend-icon="ri-check-line"
                      title="예약 확정"
                      @click="handleStatusChange(item.id, 'CONFIRMED')"
                    />
                    <VListItem
                      v-if="item.status === 'CONFIRMED'"
                      prepend-icon="ri-checkbox-circle-line"
                      title="완료 처리"
                      @click="handleStatusChange(item.id, 'COMPLETED')"
                    />
                    <VListItem
                      prepend-icon="ri-close-circle-line"
                      title="예약 취소"
                      class="text-error"
                      @click="confirmCancel(item)"
                    />
                  </VList>
                </VMenu>
                <VChip
                  v-else
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="tonal"
                >
                  {{ getStatusText(item.status) }}
                </VChip>
              </div>

              <VDivider class="mb-2" />

              <!-- 중단: 서비스 + 날짜/시간 -->
              <div class="d-flex flex-column gap-1">
                <div class="d-flex align-center text-body-2">
                  <VIcon icon="ri-scissors-line" size="16" class="me-2 text-disabled" />
                  <span>{{ getServiceNames(item.serviceNames) }}</span>
                  <span class="text-disabled ms-1">({{ item.totalDuration }}분)</span>
                </div>

                <div class="d-flex align-center text-body-2">
                  <VIcon icon="ri-calendar-line" size="16" class="me-2 text-disabled" />
                  <span>{{ formatDate(item.reservationDate) }}</span>
                  <span class="text-disabled ms-1">{{ formatTimeRange(item.startTime, item.endTime) }}</span>
                </div>

                <div class="d-flex align-center text-body-2">
                  <VIcon icon="ri-user-line" size="16" class="me-2 text-disabled" />
                  <template v-if="!item.staffId">
                    <VChip color="warning" size="x-small" variant="tonal">
                      미배정
                    </VChip>
                  </template>
                  <span v-else>{{ item.staffName }}</span>
                </div>

                <div class="d-flex align-center text-body-2">
                  <VIcon icon="ri-money-cny-circle-line" size="16" class="me-2 text-disabled" />
                  <span class="font-weight-medium">{{ item.totalPrice?.toLocaleString() }}원</span>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- 모바일 페이지네이션 -->
          <div
            v-if="mobileReservationTotalPages > 1"
            class="d-flex justify-center pt-2 pb-1"
          >
            <VPagination
              v-model="mobileReservationPage"
              :length="mobileReservationTotalPages"
              :total-visible="5"
              density="compact"
              size="small"
            />
          </div>
        </div>
      </template>

      <!-- 데스크톱 테이블 -->
      <VDataTable
        v-else
        v-model="selectedReservations"
        :headers="headers"
        :items="filteredReservations"
        :search="searchQuery"
        :items-per-page="15"
        class="reservation-table"
        show-select
        item-value="id"
        return-object
        :row-props="getRowProps"
      >
        <!-- 일괄 액션 바 -->
        <template #top>
          <VSlideYTransition>
            <VToolbar
              v-if="selectedReservations.length > 0"
              color="primary"
              density="compact"
              class="px-4"
            >
              <span class="text-body-2 font-weight-medium">
                {{ selectedReservations.length }}건 선택됨
              </span>
              <VSpacer />
              <VBtn
                variant="text"
                size="small"
                prepend-icon="ri-check-line"
                @click="handleBulkAction('CONFIRMED')"
              >
                일괄 확정
              </VBtn>
              <VBtn
                variant="text"
                size="small"
                prepend-icon="ri-checkbox-circle-line"
                @click="handleBulkAction('COMPLETED')"
              >
                일괄 완료
              </VBtn>
              <VBtn
                variant="text"
                size="small"
                prepend-icon="ri-close-circle-line"
                @click="handleBulkAction('CANCELLED')"
              >
                일괄 취소
              </VBtn>
              <VBtn
                icon
                variant="text"
                size="small"
                aria-label="선택 해제"
                @click="selectedReservations = []"
              >
                <VIcon icon="ri-close-line" />
              </VBtn>
            </VToolbar>
          </VSlideYTransition>
        </template>
        <!-- 예약번호 -->
        <template #item.reservationNumber="{ item }">
          <VChip
            size="small"
            variant="tonal"
            color="primary"
          >
            {{ item.reservationNumber }}
          </VChip>
        </template>

        <!-- 고객명 -->
        <template #item.customerName="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.customerName || '-' }}</div>
            <div class="text-xs text-disabled">{{ item.customerPhone || '-' }}</div>
          </div>
        </template>

        <!-- 예약일시 -->
        <template #item.reservationDateTime="{ item }">
          <div>
            <div>{{ formatDate(item.reservationDate) }}</div>
            <div class="text-xs text-disabled">
              {{ formatTimeRange(item.startTime, item.endTime) }}
            </div>
          </div>
        </template>

        <!-- 직원명 표시 -->
        <template #item.staffName="{ item }">
          <VChip
            v-if="!item.staffId"
            color="warning"
            size="small"
            variant="tonal"
          >
            <VIcon icon="ri-alert-line" class="me-1" />
            미배정
          </VChip>
          <span v-else>{{ item.staffName }}</span>
        </template>

        <!-- 서비스 -->
        <template #item.services="{ item }">
          <div>
            <div class="text-sm">{{ getServiceNames(item.serviceNames) }}</div>
            <div class="text-xs text-disabled">
              {{ item.totalDuration }}분 / {{ item.totalPrice.toLocaleString() }}원
            </div>
          </div>
        </template>

        <!-- 상태 -->
        <template #item.status="{ item }">
          <!-- 변경 가능한 상태: PENDING, CONFIRMED -->
          <VMenu v-if="['PENDING', 'CONFIRMED'].includes(item.status)">
            <template #activator="{ props }">
              <VChip
                v-bind="props"
                :color="getStatusColor(item.status)"
                size="small"
                variant="tonal"
                class="cursor-pointer"
                append-icon="ri-arrow-down-s-line"
              >
                {{ getStatusText(item.status) }}
              </VChip>
            </template>
            <VList density="compact" min-width="140">
              <!-- PENDING → 확정 -->
              <VListItem
                v-if="item.status === 'PENDING'"
                prepend-icon="ri-check-line"
                title="예약 확정"
                @click="handleStatusChange(item.id, 'CONFIRMED')"
              />
              <!-- CONFIRMED → 완료 -->
              <VListItem
                v-if="item.status === 'CONFIRMED'"
                prepend-icon="ri-checkbox-circle-line"
                title="완료 처리"
                @click="handleStatusChange(item.id, 'COMPLETED')"
              />
              <!-- 공통: 취소 -->
              <VListItem
                prepend-icon="ri-close-circle-line"
                title="예약 취소"
                class="text-error"
                @click="confirmCancel(item)"
              />
            </VList>
          </VMenu>

          <!-- 변경 불가 상태: COMPLETED, CANCELLED, NO_SHOW -->
          <VChip
            v-else
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.status) }}
          </VChip>
        </template>

        <!-- 액션 -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              icon
              variant="text"
              size="small"
              aria-label="상세보기"
              @click="viewReservation(item)"
            >
              <VIcon icon="ri-eye-line" />
              <VTooltip activator="parent" location="top">
                상세보기
              </VTooltip>
            </VBtn>

            <VBtn
              v-if="item.status === 'PENDING' || item.status === 'CONFIRMED'"
              icon
              variant="text"
              size="small"
              color="primary"
              aria-label="수정"
              @click="editReservation(item)"
            >
              <VIcon icon="ri-edit-line" />
              <VTooltip activator="parent" location="top">
                수정
              </VTooltip>
            </VBtn>

            <VBtn
              v-if="item.status !== 'CANCELLED' && item.status !== 'COMPLETED'"
              icon
              variant="text"
              size="small"
              color="error"
              aria-label="취소"
              @click="confirmCancel(item)"
            >
              <VIcon icon="ri-close-circle-line" />
              <VTooltip activator="parent" location="top">
                취소
              </VTooltip>
            </VBtn>
          </div>
        </template>

        <!-- 데이터 없음 -->
        <template #no-data>
          <EmptyState
            icon="ri-calendar-line"
            title="등록된 예약이 없습니다"
            description="첫 예약을 등록하세요"
          >
            <VTooltip
              v-if="!subscriptionStore.canCreateReservation"
              location="bottom"
            >
              <template #activator="{ props }">
                <VBtn
                  color="primary"
                  disabled
                  v-bind="props"
                >
                  <VIcon icon="ri-add-line" class="me-2" />
                  예약 등록하기
                </VBtn>
              </template>
              <span>월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
            </VTooltip>
            <VBtn
              v-else
              color="primary"
              @click="openCreateDialog"
            >
              <VIcon icon="ri-add-line" class="me-2" />
              예약 등록하기
            </VBtn>
          </EmptyState>
        </template>
      </VDataTable>
    </VCard>

    <!-- 예약 상세보기 다이얼로그 -->
    <ReservationDetailDialog
      v-model="isDetailDialogVisible"
      :reservation="selectedReservation"
      @edit="handleEditFromDetail"
      @cancel="confirmCancel"
      @status-change="handleStatusChange"
      @assign-staff="openAssignStaffDialog"
    />

    <!-- 직원 배정 다이얼로그 -->
    <AssignStaffDialog
      v-model="isAssignStaffDialogVisible"
      :reservation="selectedReservation"
      @assigned="handleStaffAssigned"
    />

    <!-- 예약 등록/수정 다이얼로그 -->
    <ReservationFormDialog
      v-model="isFormDialogVisible"
      :reservation="reservationToEdit"
      @saved="handleReservationSaved"
    />

    <!-- 취소 확인 다이얼로그 -->
    <VDialog
      v-model="isCancelDialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle>예약 취소</VCardTitle>
        <VCardText>
          <p class="mb-4">
            <strong>{{ selectedReservation?.customerName }}</strong>님의 예약을 취소하시겠습니까?
          </p>

          <VTextarea
            v-model="cancelReason"
            label="취소 사유"
            placeholder="취소 사유를 입력하세요 (선택)"
            rows="3"
          />

          <VAlert
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            취소된 예약은 다시 복구할 수 없습니다.
          </VAlert>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="isCancelDialogVisible = false"
          >
            닫기
          </VBtn>
          <VBtn
            color="error"
            @click="cancelReservation"
          >
            예약 취소
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 일괄 처리 확인 다이얼로그 -->
    <VDialog v-model="bulkActionDialog" max-width="440">
      <VCard>
        <VCardTitle>일괄 상태 변경</VCardTitle>
        <VCardText>
          <p>
            선택된 <strong>{{ selectedReservations.length }}건</strong>의 예약을
            <VChip :color="getStatusColor(bulkActionStatus)" size="small" variant="tonal" class="mx-1">
              {{ getStatusText(bulkActionStatus) }}
            </VChip>
            상태로 변경하시겠습니까?
          </p>
          <VAlert v-if="bulkActionStatus === 'CANCELLED'" type="warning" variant="tonal" class="mt-3">
            취소된 예약은 되돌릴 수 없습니다.
          </VAlert>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" @click="bulkActionDialog = false">
            닫기
          </VBtn>
          <VBtn
            :color="bulkActionStatus === 'CANCELLED' ? 'error' : 'primary'"
            :loading="bulkActionLoading"
            @click="executeBulkAction"
          >
            변경
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { getStatusColor, getStatusLabel } from '@/constants/reservation-status'
import { useReservationStore } from '@/stores/reservation'
import { useSubscriptionStore } from '@/stores/subscription'
import { formatTimeRange } from '@/utils/dateFormat'
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'
import StatisticsCard from '@/components/StatisticsCard.vue'
import AssignStaffDialog from './components/AssignStaffDialog.vue'
import ReservationDetailDialog from './components/ReservationDetailDialog.vue'
import ReservationFormDialog from './components/ReservationFormDialog.vue'


const route = useRoute()
const { smAndDown } = useDisplay()

const { success: showSuccess, error: showError, warning: showWarning } = useSnackbar()
const reservationStore = useReservationStore()
const subscriptionStore = useSubscriptionStore()

// Refs
const searchQuery = ref('')
const dateFilter = ref(null)
const statusFilter = ref(null)
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isCancelDialogVisible = ref(false)
const selectedReservation = ref(null)
const reservationToEdit = ref(null)
const cancelReason = ref('')
const isAssignStaffDialogVisible = ref(false)
const selectedReservations = ref([])

// 일괄 처리 다이얼로그
const bulkActionDialog = ref(false)
const bulkActionStatus = ref('')
const bulkActionLoading = ref(false)

// 모바일 페이지네이션
const mobileReservationPage = ref(1)
const mobileItemsPerPage = 10

// 상태 옵션
const statusOptions = [
  { title: '전체', value: null },
  { title: '대기', value: 'PENDING' },
  { title: '확정', value: 'CONFIRMED' },
  { title: '완료', value: 'COMPLETED' },
  { title: '취소', value: 'CANCELLED' },
  { title: '노쇼', value: 'NO_SHOW' },
]

// 테이블 헤더
const headers = [
  { title: '예약번호', key: 'reservationNumber', sortable: true },
  { title: '고객명', key: 'customerName', sortable: true },
  { title: '예약일시', key: 'reservationDateTime', sortable: true },
  { title: '담당', key: 'staffName', sortable: true },
  { title: '서비스', key: 'services', sortable: false },
  { title: '상태', key: 'status', sortable: true, align: 'center' },
  { title: '액션', key: 'actions', sortable: false, align: 'center' },
]

// 필터링된 예약 목록
const filteredReservations = computed(() => {
  let result = reservationStore.reservations

  // 날짜 필터
  if (dateFilter.value) {
    result = result.filter(r => r.reservationDate === dateFilter.value)
  }

  // 상태 필터
  if (statusFilter.value) {
    result = result.filter(r => r.status === statusFilter.value)
  }

  // 날짜 순 정렬 (최신순)
  return result.sort((a, b) => {
    const dateA = new Date(`${a.reservationDate}T${a.startTime}`)
    const dateB = new Date(`${b.reservationDate}T${b.startTime}`)
    return dateB - dateA
  })
})

// 모바일 검색 필터가 적용된 예약 목록
const mobileFilteredReservations = computed(() => {
  if (!searchQuery.value) return filteredReservations.value
  const query = searchQuery.value.toLowerCase()
  return filteredReservations.value.filter(item =>
    item.customerName?.toLowerCase().includes(query)
    || item.customerPhone?.includes(query),
  )
})

// 모바일 페이지네이션 총 페이지 수
const mobileReservationTotalPages = computed(() =>
  Math.ceil(mobileFilteredReservations.value.length / mobileItemsPerPage),
)

// 페이지네이션된 예약 목록
const paginatedReservations = computed(() => {
  const start = (mobileReservationPage.value - 1) * mobileItemsPerPage
  return mobileFilteredReservations.value.slice(start, start + mobileItemsPerPage)
})

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

// 서비스명 표시
function getServiceNames(serviceNames) {
  if (!serviceNames || serviceNames.length === 0) return '-'
  if (serviceNames.length === 1) return serviceNames[0]
  return `${serviceNames[0]} 외 ${serviceNames.length - 1}개`
}

// 상태 텍스트 (imported getStatusLabel을 getStatusText로 alias)
const getStatusText = getStatusLabel

// 과거/오늘 예약 판별 유틸
const PAST_STATUSES = ['COMPLETED', 'CANCELLED', 'NO_SHOW']

function isPastReservation(item) {
  const today = new Date().toISOString().split('T')[0]
  return PAST_STATUSES.includes(item.status) && item.reservationDate < today
}

function isTodayReservation(item) {
  const today = new Date().toISOString().split('T')[0]
  return item.reservationDate === today
}

// 데스크톱 테이블 행 props
function getRowProps({ item }) {
  const classes = []
  const style = {}

  if (isPastReservation(item)) {
    style.opacity = '0.6'
  }
  if (isTodayReservation(item)) {
    classes.push('reservation-row-today')
  }

  return { class: classes, style }
}

// 모바일 카드 클래스
function getReservationRowClass(item) {
  return {
    'reservation-card-today': isTodayReservation(item),
  }
}

// 모바일 카드 스타일
function getReservationRowStyle(item) {
  if (isPastReservation(item)) {
    return { opacity: '0.6' }
  }
  return {}
}

// 예약 상세보기
function viewReservation(reservation) {
  selectedReservation.value = reservation
  isDetailDialogVisible.value = true
}

// 예약 수정
function editReservation(reservation) {
  reservationToEdit.value = reservation
  isFormDialogVisible.value = true
}

// 상세보기에서 수정 버튼 클릭
function handleEditFromDetail(reservation) {
  isDetailDialogVisible.value = false
  reservationToEdit.value = reservation
  isFormDialogVisible.value = true
}

// 새 예약 등록
function openCreateDialog() {
  reservationToEdit.value = null
  isFormDialogVisible.value = true
}

// 취소 확인
function confirmCancel(reservation) {
  selectedReservation.value = reservation
  cancelReason.value = ''
  isDetailDialogVisible.value = false
  isCancelDialogVisible.value = true
}

// 예약 취소
async function cancelReservation() {
  if (!selectedReservation.value) return

  try {
    await reservationStore.updateReservationStatus(
      selectedReservation.value.id,
      'CANCELLED',
    )
    isCancelDialogVisible.value = false
    selectedReservation.value = null
    await reservationStore.fetchReservations()
  }
  catch (error) {
    showError(error.message || '예약 취소에 실패했습니다.')
  }
}

// 상태 변경 (✅ 올바른 API 호출)
async function handleStatusChange(reservationId, newStatus) {
  try {
    // COMPLETED만 전용 API 사용, 나머지는 기존 방식
    if (newStatus === 'COMPLETED') {
      // ✅ 완료 전용 API 호출 (고객 통계 자동 업데이트)
      await reservationStore.completeReservation(reservationId)
    }
    else {
      // CONFIRMED, CANCELLED 등은 기존 방식 사용
      await reservationStore.updateReservationStatus(reservationId, newStatus)
    }

    isDetailDialogVisible.value = false
    await reservationStore.fetchReservations()
  }
  catch (error) {
    showError(error.message || '상태 변경에 실패했습니다.')
  }
}

// 일괄 상태 변경 다이얼로그 열기
function handleBulkAction(status) {
  bulkActionStatus.value = status
  bulkActionDialog.value = true
}

// 일괄 상태 변경 실행
async function executeBulkAction() {
  bulkActionLoading.value = true
  try {
    const ids = selectedReservations.value.map(r => r.id)
    const result = await reservationStore.bulkUpdateStatus(ids, bulkActionStatus.value)

    // 성공/실패 메시지
    if (result.success.length > 0) {
      showSuccess(`${result.success.length}건이 ${getStatusText(bulkActionStatus.value)} 처리되었습니다`)
    }
    if (result.failed.length > 0) {
      result.failed.forEach(f => {
        showWarning(`예약 #${f.reservationId}: ${f.reason}`)
      })
    }

    selectedReservations.value = []
    bulkActionDialog.value = false
    await reservationStore.fetchReservations()
  }
  catch (error) {
    showError(error.message || '일괄 처리에 실패했습니다.')
  }
  finally {
    bulkActionLoading.value = false
  }
}

// 예약 저장 후
async function handleReservationSaved() {
  isFormDialogVisible.value = false
  reservationToEdit.value = null
  selectedReservations.value = []
  await reservationStore.fetchReservations()
}

// 직원 배정 다이얼로그 열기
function openAssignStaffDialog(reservation) {
  selectedReservation.value = reservation
  isDetailDialogVisible.value = false
  isAssignStaffDialogVisible.value = true
}

// 직원 배정 완료
async function handleStaffAssigned() {
  isAssignStaffDialogVisible.value = false
  await reservationStore.fetchReservations()
}

// 컴포넌트 마운트 시
// URL 쿼리 파라미터 확인
onMounted(async () => {
  await reservationStore.fetchReservations()
  await subscriptionStore.fetchSubscriptionInfo()

  // unassigned 쿼리가 있으면 검색어에 자동 입력
  if (route.query.unassigned === 'true') {
    searchQuery.value = '미배정'
    // 또는 직접 필터링
    // statusFilter.value = null
  }
})
</script>

<style scoped>
.reservation-table :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.reservation-mobile-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.reservation-mobile-card:hover,
.reservation-mobile-card:active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* 오늘 예약 강조: 왼쪽 보더 */
.reservation-card-today {
  border-left: 3px solid rgb(var(--v-theme-primary)) !important;
}

.reservation-table :deep(.reservation-row-today) {
  border-left: 3px solid rgb(var(--v-theme-primary));
}
</style>
