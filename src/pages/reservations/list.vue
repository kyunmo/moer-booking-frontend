<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-list-check" size="24" class="me-3" />
        <span>예약 목록</span>

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

        <!-- 검색 -->
        <VTextField
          v-model="searchQuery"
          placeholder="고객명 또는 전화번호 검색"
          prepend-inner-icon="ri-search-line"
          density="compact"
          style="max-inline-size: 300px;"
          class="me-3"
          clearable
        />

        <!-- 새 예약 등록 -->
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreateDialog"
        >
          예약 등록
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-time-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">대기</p>
              <h6 class="text-h6">{{ reservationStore.pendingReservations.length }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-check-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">확정</p>
              <h6 class="text-h6">{{ reservationStore.confirmedReservations.length }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-checkbox-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">완료</p>
              <h6 class="text-h6">{{ reservationStore.completedReservations.length }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="error">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-close-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">취소</p>
              <h6 class="text-h6">{{ reservationStore.cancelledReservations.length }}건</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 예약 테이블 -->
    <VCard>
      <!-- 로딩 -->
      <div v-if="reservationStore.loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 테이블 -->
      <VDataTable
        v-else
        :headers="headers"
        :items="filteredReservations"
        :search="searchQuery"
        :items-per-page="15"
        class="reservation-table"
      >
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
              {{ item.startTime }} - {{ item.endTime }}
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
          <VChip
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
          <div class="text-center pa-10">
            <VIcon
              icon="ri-calendar-line"
              size="64"
              class="mb-4 text-disabled"
            />
            <p class="text-h6 mb-2">등록된 예약이 없습니다</p>
            <p class="text-disabled mb-4">
              첫 예약을 등록하세요
            </p>
            <VBtn
              color="primary"
              @click="openCreateDialog"
            >
              <VIcon icon="ri-add-line" class="me-2" />
              예약 등록하기
            </VBtn>
          </div>
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
            ⚠️ 취소된 예약은 다시 복구할 수 없습니다.
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
  </div>
</template>

<script setup>
import { useReservationStore } from '@/stores/reservation'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AssignStaffDialog from './components/AssignStaffDialog.vue'
import ReservationDetailDialog from './components/ReservationDetailDialog.vue'
import ReservationFormDialog from './components/ReservationFormDialog.vue'


const route = useRoute()


const reservationStore = useReservationStore()

// Refs
const searchQuery = ref('')
const statusFilter = ref(null)
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isCancelDialogVisible = ref(false)
const selectedReservation = ref(null)
const reservationToEdit = ref(null)
const cancelReason = ref('')
const isAssignStaffDialogVisible = ref(false)

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

// 상태 색상
function getStatusColor(status) {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'secondary',
  }
  return colors[status] || 'default'
}

// 상태 텍스트
function getStatusText(status) {
  const texts = {
    PENDING: '대기',
    CONFIRMED: '확정',
    COMPLETED: '완료',
    CANCELLED: '취소',
    NO_SHOW: '노쇼',
  }
  return texts[status] || status
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
    console.error('예약 취소 실패:', error)
    alert(error.response?.data?.message || '예약 취소에 실패했습니다.')
  }
}

// 상태 변경
async function handleStatusChange(reservationId, newStatus) {
  try {
    await reservationStore.updateReservationStatus(reservationId, newStatus)
    isDetailDialogVisible.value = false
    await reservationStore.fetchReservations()
  }
  catch (error) {
    console.error('상태 변경 실패:', error)
    alert(error.response?.data?.message || '상태 변경에 실패했습니다.')
  }
}

// 예약 저장 후
async function handleReservationSaved() {
  isFormDialogVisible.value = false
  reservationToEdit.value = null
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
</style>
