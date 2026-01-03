<template>
  <VCard>
    <VCardTitle class="d-flex align-center pe-2">
      <VIcon icon="ri-list-check" size="24" class="me-3" />
      <span>예약 목록</span>

      <VSpacer />

      <!-- 검색 -->
      <VTextField
        v-model="searchQuery"
        placeholder="고객명, 전화번호 검색"
        prepend-inner-icon="ri-search-line"
        density="compact"
        style="max-inline-size: 300px;"
        class="me-3"
        clearable
      />

      <!-- 새 예약 버튼 -->
      <VBtn
        color="primary"
        prepend-icon="ri-add-line"
        @click="openReservationDialog"
      >
        예약 등록
      </VBtn>
    </VCardTitle>

    <VDivider />

    <!-- 필터 -->
    <VCardText>
      <VRow>
        <VCol cols="12" md="3">
          <VSelect
            v-model="filterStatus"
            label="예약 상태"
            :items="statusOptions"
            clearable
            density="compact"
          />
        </VCol>

        <VCol cols="12" md="3">
          <VTextField
            v-model="filterStartDate"
            label="시작 날짜"
            type="date"
            density="compact"
          />
        </VCol>

        <VCol cols="12" md="3">
          <VTextField
            v-model="filterEndDate"
            label="종료 날짜"
            type="date"
            density="compact"
          />
        </VCol>

        <VCol cols="12" md="3" class="d-flex align-center">
          <VBtn
            color="primary"
            variant="outlined"
            @click="applyFilters"
          >
            <VIcon icon="ri-filter-line" class="me-1" />
            필터 적용
          </VBtn>
          
          <VBtn
            variant="text"
            class="ms-2"
            @click="resetFilters"
          >
            초기화
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <!-- 데이터 테이블 -->
    <VDataTable
      :headers="headers"
      :items="filteredReservations"
      :loading="loading"
      :search="searchQuery"
      :items-per-page="10"
      class="text-no-wrap"
    >
      <!-- 예약 번호 -->
      <template #item.reservationNumber="{ item }">
        <span class="text-primary font-weight-medium">
          {{ item.reservationNumber }}
        </span>
      </template>

      <!-- 예약 날짜/시간 -->
      <template #item.reservationDateTime="{ item }">
        <div>
          <div class="font-weight-medium">
            {{ formatDate(item.reservationDate) }}
          </div>
          <div class="text-xs text-disabled">
            {{ item.startTime }} ~ {{ item.endTime }}
          </div>
        </div>
      </template>

      <!-- 고객 정보 -->
      <template #item.customer="{ item }">
        <div>
          <div class="font-weight-medium">
            {{ item.customerName }}
          </div>
          <div class="text-xs text-disabled">
            {{ item.customerPhone }}
          </div>
        </div>
      </template>

      <!-- 서비스 -->
      <template #item.services="{ item }">
        <VChip
          v-for="(service, index) in item.serviceNames"
          :key="index"
          size="small"
          class="me-1"
        >
          {{ service }}
        </VChip>
      </template>

      <!-- 담당자 -->
      <template #item.staffName="{ item }">
        <span v-if="item.staffName">{{ item.staffName }}</span>
        <span v-else class="text-disabled">상관없음</span>
      </template>

      <!-- 금액 -->
      <template #item.totalPrice="{ item }">
        <span class="font-weight-medium">
          {{ formatPrice(item.totalPrice) }}
        </span>
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

      <!-- 액션 -->
      <template #item.actions="{ item }">
        <VBtn
          icon
          variant="text"
          size="small"
          @click="viewReservation(item)"
        >
          <VIcon icon="ri-eye-line" />
        </VBtn>

        <VBtn
          icon
          variant="text"
          size="small"
          @click="editReservation(item)"
        >
          <VIcon icon="ri-edit-line" />
        </VBtn>

        <VBtn
          icon
          variant="text"
          size="small"
          color="error"
          @click="confirmDelete(item)"
        >
          <VIcon icon="ri-delete-bin-line" />
        </VBtn>
      </template>

      <!-- 로딩 -->
      <template #loading>
        <VSkeletonLoader type="table-row@10" />
      </template>

      <!-- 데이터 없음 -->
      <template #no-data>
        <div class="text-center pa-5">
          <VIcon
            icon="ri-inbox-line"
            size="48"
            class="mb-3 text-disabled"
          />
          <p class="text-disabled">예약 내역이 없습니다.</p>
        </div>
      </template>
    </VDataTable>

    <!-- 예약 다이얼로그 -->
    <ReservationDialog
      v-model="isDialogVisible"
      :reservation="selectedReservation"
      @saved="handleReservationSaved"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>예약 취소</VCardTitle>
        <VCardText>
          <p class="mb-4">
            정말로 이 예약을 취소하시겠습니까?
          </p>
          
          <VTextarea
            v-model="cancelReason"
            label="취소 사유"
            placeholder="취소 사유를 입력하세요"
            rows="3"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="isDeleteDialogVisible = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            @click="deleteReservation"
          >
            확인
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<script setup>
import { useReservationStore } from '@/stores/reservation'
import { computed, onMounted, ref } from 'vue'
import ReservationDialog from './components/ReservationDialog.vue'

const reservationStore = useReservationStore()

// Refs
const searchQuery = ref('')
const filterStatus = ref(null)
const filterStartDate = ref('')
const filterEndDate = ref('')
const loading = ref(false)
const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedReservation = ref(null)
const cancelReason = ref('')

// 테이블 헤더
const headers = [
  { title: '예약번호', key: 'reservationNumber', sortable: true },
  { title: '예약일시', key: 'reservationDateTime', sortable: true },
  { title: '고객', key: 'customer', sortable: false },
  { title: '서비스', key: 'services', sortable: false },
  { title: '담당자', key: 'staffName', sortable: true },
  { title: '금액', key: 'totalPrice', sortable: true },
  { title: '상태', key: 'status', sortable: true },
  { title: '액션', key: 'actions', sortable: false, align: 'center' },
]

// 상태 옵션
const statusOptions = [
  { title: '대기', value: 'PENDING' },
  { title: '확정', value: 'CONFIRMED' },
  { title: '완료', value: 'COMPLETED' },
  { title: '취소', value: 'CANCELLED' },
  { title: '노쇼', value: 'NOSHOW' },
]

// 필터링된 예약 목록
const filteredReservations = computed(() => {
  let result = reservationStore.reservations

  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  if (filterStartDate.value) {
    result = result.filter(r => r.reservationDate >= filterStartDate.value)
  }

  if (filterEndDate.value) {
    result = result.filter(r => r.reservationDate <= filterEndDate.value)
  }

  return result
})

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// 금액 포맷
function formatPrice(price) {
  if (!price) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 상태 색상
function getStatusColor(status) {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NOSHOW: 'default',
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
    NOSHOW: '노쇼',
  }
  return texts[status] || status
}

// 필터 적용
function applyFilters() {
  // 필터는 computed에서 자동으로 적용됨
  console.log('필터 적용됨')
}

// 필터 초기화
function resetFilters() {
  filterStatus.value = null
  filterStartDate.value = ''
  filterEndDate.value = ''
  searchQuery.value = ''
}

// 예약 보기
function viewReservation(reservation) {
  selectedReservation.value = reservation
  isDialogVisible.value = true
}

// 예약 수정
function editReservation(reservation) {
  selectedReservation.value = reservation
  isDialogVisible.value = true
}

// 삭제 확인
function confirmDelete(reservation) {
  selectedReservation.value = reservation
  cancelReason.value = ''
  isDeleteDialogVisible.value = true
}

// 예약 삭제
async function deleteReservation() {
  if (!selectedReservation.value) return

  try {
    await reservationStore.cancelReservation(
      selectedReservation.value.id,
      cancelReason.value,
    )
    
    isDeleteDialogVisible.value = false
    
    // 목록 새로고침
    await loadReservations()
  }
  catch (error) {
    console.error('예약 취소 실패:', error)
    alert(error || '예약 취소에 실패했습니다.')
  }
}

// 새 예약 등록
function openReservationDialog() {
  selectedReservation.value = null
  isDialogVisible.value = true
}

// 예약 저장 후
async function handleReservationSaved() {
  isDialogVisible.value = false
  await loadReservations()
}

// 예약 목록 로드
async function loadReservations() {
  loading.value = true
  try {
    // 최근 30일 예약 조회
    const today = new Date()
    const endDate = today.toISOString().split('T')[0]
    
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 30)
    
    await reservationStore.fetchReservationsByDateRange(
      startDate.toISOString().split('T')[0],
      endDate,
    )
  }
  catch (error) {
    console.error('예약 목록 조회 실패:', error)
  }
  finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시
onMounted(() => {
  loadReservations()
})
</script>
