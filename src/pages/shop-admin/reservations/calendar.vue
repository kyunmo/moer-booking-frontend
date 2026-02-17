<template>
  <div>
    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="대기"
          :value="`${filteredStats.pending}건`"
          icon="ri-time-line"
          color="warning"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="확정"
          :value="`${filteredStats.confirmed}건`"
          icon="ri-check-line"
          color="primary"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="완료"
          :value="`${filteredStats.completed}건`"
          icon="ri-checkbox-circle-line"
          color="success"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="취소"
          :value="`${filteredStats.cancelled}건`"
          icon="ri-close-circle-line"
          color="error"
        />
      </VCol>
    </VRow>

    <!-- 캘린더 메인 -->
    <VCard>
      <VLayout style="z-index: 0;">
        <!-- 👉 왼쪽 사이드바 -->
        <VNavigationDrawer
          v-model="isLeftSidebarOpen"
          width="280"
          absolute
          touchless
          location="start"
          :temporary="$vuetify.display.mdAndDown"
          class="calendar-sidebar"
        >
          <!-- 예약 등록 버튼 -->
          <div class="pa-5">
            <VTooltip
              v-if="!subscriptionStore.canCreateReservation"
              location="bottom"
            >
              <template #activator="{ props }">
                <VBtn
                  block
                  color="primary"
                  prepend-icon="ri-add-line"
                  disabled
                  v-bind="props"
                >
                  예약 등록
                </VBtn>
              </template>
              <span>월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
            </VTooltip>
            <VBtn
              v-else
              block
              color="primary"
              prepend-icon="ri-add-line"
              @click="openCreateDialog"
            >
              예약 등록
            </VBtn>
          </div>

          <VDivider />

          <!-- 인라인 날짜 선택 -->
          <div class="pa-5">
            <h6 class="text-h6 mb-4">
              <VIcon icon="ri-calendar-line" class="me-2" />
              날짜 선택
            </h6>
            <VDatePicker
              v-model="selectedDate"
              :show-adjacent-months="true"
              hide-header
              width="100%"
              @update:model-value="jumpToDate"
            />
          </div>

          <VDivider />

          <!-- 상태 필터 -->
          <div class="pa-5">
            <h6 class="text-h6 mb-4">
              <VIcon icon="ri-filter-line" class="me-2" />
              상태 필터
            </h6>

            <div class="d-flex flex-column calendars-checkbox">
              <VCheckbox
                v-model="checkAll"
                label="전체 보기"
                hide-details
                density="compact"
              />
              <VCheckbox
                v-for="status in availableStatuses"
                :key="status.value"
                v-model="selectedStatuses"
                :value="status.value"
                :color="status.color"
                :label="status.label"
                hide-details
                density="compact"
              />
            </div>
          </div>
        </VNavigationDrawer>

        <!-- 👉 메인 캘린더 -->
        <VMain>
          <VCard flat>
            <!-- 모바일 메뉴 버튼 -->
            <VCardTitle
              v-if="$vuetify.display.mdAndDown"
              class="d-flex align-center"
            >
              <VBtn
                icon
                variant="text"
                @click="isLeftSidebarOpen = !isLeftSidebarOpen"
              >
                <VIcon icon="ri-menu-line" />
              </VBtn>
              <span class="ms-2">예약 캘린더</span>
            </VCardTitle>

            <VCardText>
              <FullCalendar
                ref="calendarRef"
                :options="calendarOptions"
              />
            </VCardText>
          </VCard>
        </VMain>
      </VLayout>
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
  </div>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { useReservationStore } from '@/stores/reservation'
import { useSubscriptionStore } from '@/stores/subscription'
import koLocale from '@fullcalendar/core/locales/ko'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import { computed, onMounted, ref, watch } from 'vue'
import StatisticsCard from '@/components/StatisticsCard.vue'
import ReservationDetailDialog from './components/ReservationDetailDialog.vue'
import ReservationFormDialog from './components/ReservationFormDialog.vue'

const { error: showError } = useSnackbar()
const businessSettingsStore = useBusinessSettingsStore()
const reservationStore = useReservationStore()
const subscriptionStore = useSubscriptionStore()

// 요일 매핑 (FullCalendar: 0=일, 1=월, ..., 6=토)
const dayToNumber = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

// 영업시간 computed (store 데이터 → FullCalendar 형식 변환)
const businessHoursConfig = computed(() => {
  const hours = businessSettingsStore.business?.businessHours
  if (!hours) {
    return {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '10:00',
      endTime: '20:00',
    }
  }

  return Object.entries(hours)
    .filter(([, config]) => config && config.isOpen)
    .map(([day, config]) => ({
      daysOfWeek: [dayToNumber[day]],
      startTime: config.openTime,
      endTime: config.closeTime,
    }))
})

// slotMinTime: 가장 빠른 openTime에서 1시간 뺀 값
const calendarSlotMinTime = computed(() => {
  const hours = businessSettingsStore.business?.businessHours
  if (!hours) return '09:00:00'

  const openTimes = Object.values(hours)
    .filter(config => config && config.isOpen && config.openTime)
    .map(config => config.openTime)

  if (openTimes.length === 0) return '09:00:00'

  const earliest = openTimes.sort()[0]
  const [h, m] = earliest.split(':').map(Number)
  const adjustedHour = Math.max(0, h - 1)

  return `${String(adjustedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
})

// slotMaxTime: 가장 늦은 closeTime에서 1시간 더한 값
const calendarSlotMaxTime = computed(() => {
  const hours = businessSettingsStore.business?.businessHours
  if (!hours) return '21:00:00'

  const closeTimes = Object.values(hours)
    .filter(config => config && config.isOpen && config.closeTime)
    .map(config => config.closeTime)

  if (closeTimes.length === 0) return '21:00:00'

  const latest = closeTimes.sort().at(-1)
  const [h, m] = latest.split(':').map(Number)
  const adjustedHour = Math.min(24, h + 1)

  return `${String(adjustedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
})

// Refs
const calendarRef = ref(null)
const isLeftSidebarOpen = ref(true)
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isCancelDialogVisible = ref(false)
const selectedReservation = ref(null)
const reservationToEdit = ref(null)
const cancelReason = ref('')
const selectedDate = ref(new Date())

// 상태 필터
const availableStatuses = [
  { label: '대기', value: 'PENDING', color: 'warning' },
  { label: '확정', value: 'CONFIRMED', color: 'primary' },
  { label: '완료', value: 'COMPLETED', color: 'success' },
  { label: '취소', value: 'CANCELLED', color: 'error' },
]

const selectedStatuses = ref(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])

// 전체 선택 체크박스
const checkAll = computed({
  get: () => selectedStatuses.value.length === availableStatuses.length,
  set: val => {
    if (val) {
      selectedStatuses.value = availableStatuses.map(s => s.value)
    }
    else if (selectedStatuses.value.length === availableStatuses.length) {
      selectedStatuses.value = []
    }
  },
})

// 필터링된 이벤트
const filteredEvents = computed(() => {
  return reservationStore.calendarEvents.filter(event => {
    return selectedStatuses.value.includes(event.extendedProps.reservation.status)
  })
})

// 필터링된 통계
const filteredStats = computed(() => {
  const filtered = reservationStore.reservations.filter(r =>
    selectedStatuses.value.includes(r.status)
  )

  return {
    pending: filtered.filter(r => r.status === 'PENDING').length,
    confirmed: filtered.filter(r => r.status === 'CONFIRMED').length,
    completed: filtered.filter(r => r.status === 'COMPLETED').length,
    cancelled: filtered.filter(r => r.status === 'CANCELLED').length,
  }
})

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
  slotMinTime: calendarSlotMinTime.value,
  slotMaxTime: calendarSlotMaxTime.value,
  businessHours: businessHoursConfig.value,
  height: 'auto',
  events: filteredEvents.value,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  editable: false,
  selectable: true,
  allDaySlot: false,
  nowIndicator: true,
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
  },
}))

// 날짜 선택 시 캘린더 이동
function jumpToDate(date) {
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi()
    calendarApi.gotoDate(date)
  }
}

// 캘린더 이벤트 클릭
function handleEventClick(info) {
  const reservation = info.event.extendedProps.reservation
  viewReservation(reservation)
}

// 캘린더 날짜 클릭
function handleDateClick(info) {
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
    showError(error.message || '예약 취소에 실패했습니다.')
  }
}

// 상태 변경
async function handleStatusChange(reservationId, newStatus) {
  try {
    console.log(`🔍 상태 변경 시도: ${newStatus}`)

    if (newStatus === 'COMPLETED') {
      await reservationStore.completeReservation(reservationId)
    }
    else {
      await reservationStore.updateReservationStatus(reservationId, newStatus)
    }

    isDetailDialogVisible.value = false
    await loadReservations()

    console.log(`✅ 예약 상태가 ${newStatus}(으)로 변경되었습니다`)
  }
  catch (error) {
    console.error('❌ 상태 변경 실패:', error)
    console.error('에러 상세:', error.response?.data)
    showError(error.message || '상태 변경에 실패했습니다.')
  }
}

// 예약 저장 후
async function handleReservationSaved() {
  isFormDialogVisible.value = false
  reservationToEdit.value = null
  await loadReservations()
}

// 예약 목록 로드
async function loadReservations() {
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  await reservationStore.fetchReservationsByDateRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
  )
}

// 반응형 처리
watch(() => isLeftSidebarOpen.value, (val) => {
  // 사이드바 토글 시 캘린더 리사이즈
  setTimeout(() => {
    if (calendarRef.value) {
      const calendarApi = calendarRef.value.getApi()
      calendarApi.updateSize()
    }
  }, 300)
})

// 컴포넌트 마운트
onMounted(async () => {
  await Promise.all([
    loadReservations(),
    subscriptionStore.fetchSubscriptionInfo(),
    businessSettingsStore.fetchBusinessInfo(),
  ])
})
</script>

<style lang="scss">
// FullCalendar 기본 스타일
@use "@core/scss/template/libs/full-calendar";

.calendars-checkbox {
  .v-label {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    opacity: var(--v-high-emphasis-opacity);
  }
}

.calendar-sidebar {
  &.v-navigation-drawer:not(.v-navigation-drawer--temporary) {
    border-end-start-radius: 0.375rem;
    border-start-start-radius: 0.375rem;
  }
}
</style>

<style scoped>
/* FullCalendar 커스터마이징 */
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
  cursor: pointer;
}

:deep(.fc-event:hover) {
  opacity: 0.85;
}

:deep(.fc-daygrid-day-number) {
  font-weight: 500;
}

:deep(.fc-col-header-cell-cushion) {
  font-weight: 600;
}

/* 현재 시간 표시 */
:deep(.fc-timegrid-now-indicator-line) {
  border-color: rgb(var(--v-theme-error));
  border-width: 2px;
}

/* 비즈니스 시간 강조 */
:deep(.fc-non-business) {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}
</style>
