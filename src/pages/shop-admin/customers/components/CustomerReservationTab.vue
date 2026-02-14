<template>
  <div>
    <!-- 상단 요약 카드 -->
    <VRow v-if="summary" class="mb-4">
      <VCol cols="12" sm="6" md="4">
        <VCard variant="tonal" color="primary">
          <VCardText class="text-center pa-3">
            <VIcon icon="ri-calendar-check-line" size="28" class="mb-1" />
            <p class="text-xs text-disabled mb-1">총 방문</p>
            <h5 class="text-h5">{{ summary.totalVisits || 0 }}회</h5>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard variant="tonal" color="success">
          <VCardText class="text-center pa-3">
            <VIcon icon="ri-money-dollar-circle-line" size="28" class="mb-1" />
            <p class="text-xs text-disabled mb-1">총 지출</p>
            <h5 class="text-h5">{{ (summary.totalSpent || 0).toLocaleString() }}원</h5>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard variant="tonal" color="info">
          <VCardText class="text-center pa-3">
            <VIcon icon="ri-time-line" size="28" class="mb-1" />
            <p class="text-xs text-disabled mb-1">최근 방문일</p>
            <p class="text-sm font-weight-medium mb-0">{{ formatDate(summary.lastVisitDate) }}</p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="6">
        <VCard variant="tonal" color="warning">
          <VCardText class="text-center pa-3">
            <VIcon icon="ri-scissors-line" size="28" class="mb-1" />
            <p class="text-xs text-disabled mb-1">자주 이용 서비스</p>
            <p class="text-sm font-weight-medium mb-0">{{ summary.favoriteService || '-' }}</p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="6">
        <VCard variant="tonal" color="secondary">
          <VCardText class="text-center pa-3">
            <VIcon icon="ri-user-star-line" size="28" class="mb-1" />
            <p class="text-xs text-disabled mb-1">자주 만난 스태프</p>
            <p class="text-sm font-weight-medium mb-0">{{ summary.favoriteStaff || '-' }}</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 상태 필터 -->
    <div class="mb-4">
      <VChipGroup
        v-model="selectedStatus"
        filter
        mandatory
      >
        <VChip
          v-for="statusOption in statusOptions"
          :key="statusOption.value"
          :color="statusOption.color"
          :value="statusOption.value"
          variant="tonal"
          size="small"
        >
          {{ statusOption.label }}
        </VChip>
      </VChipGroup>
    </div>

    <!-- 예약 목록 테이블 -->
    <VDataTableServer
      :headers="headers"
      :items="reservations"
      :items-length="totalCount"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :page="page"
      density="compact"
      @update:options="handleOptionsUpdate"
    >
      <!-- 날짜 -->
      <template #item.reservationDate="{ item }">
        <span class="font-weight-medium">{{ formatDate(item.reservationDate) }}</span>
      </template>

      <!-- 시간 -->
      <template #item.startTime="{ item }">
        <span>{{ item.startTime }} ~ {{ item.endTime }}</span>
      </template>

      <!-- 서비스 목록 -->
      <template #item.services="{ item }">
        <span class="text-sm">{{ item.services?.join(', ') || '-' }}</span>
      </template>

      <!-- 금액 -->
      <template #item.totalPrice="{ item }">
        <span class="font-weight-medium">{{ (item.totalPrice || 0).toLocaleString() }}원</span>
      </template>

      <!-- 상태 -->
      <template #item.status="{ item }">
        <VChip
          :color="getStatusColor(item.status)"
          size="small"
          variant="tonal"
        >
          {{ getStatusLabel(item.status) }}
        </VChip>
      </template>

      <!-- 데이터 없음 -->
      <template #no-data>
        <div class="text-center pa-6">
          <VIcon
            icon="ri-calendar-line"
            size="48"
            class="mb-3 text-disabled"
          />
          <p class="text-body-1 text-disabled mb-0">예약 이력이 없습니다</p>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup>
import customerApi from '@/api/customers'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAuthStore } from '@/stores/auth'
import { ref, watch } from 'vue'

const props = defineProps({
  customerId: {
    type: Number,
    required: true,
  },
})

const { error: showError } = useSnackbar()
const authStore = useAuthStore()

// State
const loading = ref(false)
const reservations = ref([])
const totalCount = ref(0)
const summary = ref(null)
const page = ref(1)
const itemsPerPage = ref(10)
const selectedStatus = ref('ALL')

// 상태 옵션
const statusOptions = [
  { label: '전체', value: 'ALL', color: 'default' },
  { label: '완료', value: 'COMPLETED', color: 'success' },
  { label: '취소', value: 'CANCELLED', color: 'error' },
  { label: '노쇼', value: 'NO_SHOW', color: 'warning' },
  { label: '대기', value: 'PENDING', color: 'info' },
  { label: '확정', value: 'CONFIRMED', color: 'primary' },
]

// 테이블 헤더
const headers = [
  { title: '날짜', key: 'reservationDate', sortable: false },
  { title: '시간', key: 'startTime', sortable: false },
  { title: '담당', key: 'staffName', sortable: false },
  { title: '서비스', key: 'services', sortable: false },
  { title: '금액', key: 'totalPrice', sortable: false, align: 'end' },
  { title: '상태', key: 'status', sortable: false, align: 'center' },
]

// 상태별 색상
function getStatusColor(status) {
  const map = {
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'warning',
    PENDING: 'info',
    CONFIRMED: 'primary',
  }

  return map[status] || 'default'
}

// 상태 라벨
function getStatusLabel(status) {
  const map = {
    COMPLETED: '완료',
    CANCELLED: '취소',
    NO_SHOW: '노쇼',
    PENDING: '대기',
    CONFIRMED: '확정',
  }

  return map[status] || status
}

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 데이터 조회
async function fetchReservations() {
  if (!props.customerId || !authStore.businessId) return

  loading.value = true
  try {
    const params = {
      page: page.value,
      size: itemsPerPage.value,
    }

    if (selectedStatus.value !== 'ALL') {
      params.status = selectedStatus.value
    }

    const { data } = await customerApi.getCustomerReservations(
      authStore.businessId,
      props.customerId,
      params,
    )

    reservations.value = data.items || []
    totalCount.value = data.totalCount || 0

    if (data.summary) {
      summary.value = data.summary
    }
  }
  catch (error) {
    console.error('예약 이력 조회 실패:', error)
    showError('예약 이력을 불러오는데 실패했습니다.')
    reservations.value = []
    totalCount.value = 0
  }
  finally {
    loading.value = false
  }
}

// 페이지/옵션 변경 핸들러
function handleOptionsUpdate(options) {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  fetchReservations()
}

// 상태 필터 변경 시 page=1로 리셋 후 재조회
watch(selectedStatus, () => {
  page.value = 1
  fetchReservations()
})

// customerId 변경 시 데이터 리로드
watch(
  () => props.customerId,
  newId => {
    if (newId) {
      page.value = 1
      selectedStatus.value = 'ALL'
      fetchReservations()
    }
  },
  { immediate: true },
)
</script>
