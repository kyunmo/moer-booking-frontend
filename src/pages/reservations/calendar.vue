<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-calendar-check-line" size="24" class="me-3" />
        <span>예약 캘린더</span>

        <VSpacer />

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

    <!-- 캘린더 -->
    <VCard>
      <VCardText>
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
        />
      </VCardText>
    </VCard>

    <!-- 예약 상세보기 다이얼로그 -->
    <ReservationDetailDialog
      v-model="isDetailDialogVisible"
      :reservation="selectedReservation"
      @edit="handleEditFromDetail"
      @cancel="confirmCancel"
      @status-change="handleStatusChange"
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
import koLocale from '@fullcalendar/core/locales/ko'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import { computed, onMounted, ref } from 'vue'
import ReservationDetailDialog from './components/ReservationDetailDialog.vue'
import ReservationFormDialog from './components/ReservationFormDialog.vue'

const reservationStore = useReservationStore()

// Refs
const calendarRef = ref(null)
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isCancelDialogVisible = ref(false)
const selectedReservation = ref(null)
const reservationToEdit = ref(null)
const cancelReason = ref('')

// FullCalendar 옵션
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  locale: koLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  slotMinTime: '09:00:00',
  slotMaxTime: '21:00:00',
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    startTime: '10:00',
    endTime: '20:00',
  },
  height: 'auto',
  events: reservationStore.calendarEvents,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  editable: false,
  selectable: true,
}))

// 캘린더 이벤트 클릭
function handleEventClick(info) {
  const reservation = info.event.extendedProps.reservation
  viewReservation(reservation)
}

// 캘린더 날짜 클릭
function handleDateClick(info) {
  // 선택한 날짜로 예약 등록 다이얼로그 열기
  reservationToEdit.value = {
    reservationDate: info.dateStr.split('T')[0],
    startTime: info.dateStr.split('T')[1]?.substring(0, 5) || '10:00',
  }
  isFormDialogVisible.value = true
}

// 예약 상세보기
function viewReservation(reservation) {
  selectedReservation.value = reservation
  isDetailDialogVisible.value = true
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
    await loadReservations()
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
    await loadReservations()
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
  await loadReservations()
}

// 예약 목록 로드 (이번 달)
async function loadReservations() {
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  await reservationStore.fetchReservationsByDateRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
  )
}

// 컴포넌트 마운트 시
onMounted(() => {
  loadReservations()
})
</script>

<style scoped>
/* FullCalendar 스타일 커스터마이징 */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 600;
}

:deep(.fc-button) {
  font-weight: 500;
  text-transform: none;
}

:deep(.fc-event) {
  border-radius: 4px;
  font-size: 0.875rem;
  padding-block: 2px;
  padding-inline: 4px;
}
</style>
