<template>
  <div>
    <!-- 통계 카드 -->
    <VRow id="reservation-stats" class="mb-4">
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
          id="reservation-sidebar"
          v-model="isLeftSidebarOpen"
          width="280"
          absolute
          touchless
          location="start"
          :temporary="$vuetify.display.mdAndDown"
          class="calendar-sidebar"
          aria-label="예약 캘린더 사이드바"
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
              id="reservation-create-btn"
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
          <div class="d-flex align-center justify-center pa-2">
            <AppDateTimePicker
              id="calendar-date-picker"
              :model-value="selectedDateStr"
              :config="{ inline: true, locale: Korean }"
              class="calendar-date-picker"
              @update:model-value="onDatePickerChange"
            />
          </div>

          <VDivider />

          <!-- 상태 필터 -->
          <div id="reservation-status-filter" class="pa-5">
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

          <VDivider />

          <!-- 직원 필터 -->
          <div id="reservation-staff-filter" class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <h6 class="text-h6">
                <VIcon icon="ri-team-line" class="me-2" />
                직원 필터
              </h6>
              <VTooltip location="top">
                <template #activator="{ props: tooltipProps }">
                  <VBtn
                    v-bind="tooltipProps"
                    :icon="colorByStaff ? 'ri-palette-fill' : 'ri-palette-line'"
                    :color="colorByStaff ? 'primary' : 'default'"
                    size="x-small"
                    variant="text"
                    :aria-label="colorByStaff ? '상태별 색상으로 전환' : '직원별 색상으로 전환'"
                    @click="colorByStaff = !colorByStaff"
                  />
                </template>
                <span>{{ colorByStaff ? '상태별 색상으로 전환' : '직원별 색상으로 전환' }}</span>
              </VTooltip>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <VChip
                :color="isAllStaffSelected ? 'primary' : 'default'"
                :variant="isAllStaffSelected ? 'elevated' : 'outlined'"
                size="small"
                @click="isAllStaffSelected = true"
              >
                전체
              </VChip>
              <VChip
                v-for="staff in staffStore.activeStaffs"
                :key="staff.id"
                :color="selectedStaffIds.includes(staff.id) ? getStaffColor(staff.id) : 'default'"
                :variant="selectedStaffIds.includes(staff.id) ? 'elevated' : 'outlined'"
                size="small"
                @click="toggleStaffFilter(staff.id)"
              >
                <VAvatar
                  v-if="colorByStaff"
                  start
                  size="18"
                  :color="getStaffColor(staff.id)"
                >
                  <span class="text-white text-caption">{{ staff.name?.charAt(0) }}</span>
                </VAvatar>
                {{ staff.name }}
              </VChip>
            </div>

            <p
              v-if="staffStore.activeStaffs.length === 0"
              class="text-body-2 text-medium-emphasis mt-2"
            >
              등록된 직원이 없습니다.
            </p>
          </div>
        </VNavigationDrawer>

        <!-- 👉 메인 캘린더 -->
        <VMain>
          <VCard flat style="position: relative;">
            <VOverlay
              :model-value="calendarLoading"
              contained
              persistent
              class="align-center justify-center"
            >
              <VProgressCircular indeterminate color="primary" size="48" />
            </VOverlay>

            <!-- 모바일 메뉴 버튼 -->
            <VCardTitle
              v-if="$vuetify.display.mdAndDown"
              class="d-flex align-center"
            >
              <VBtn
                icon
                variant="text"
                aria-label="사이드바 열기/닫기"
                @click="isLeftSidebarOpen = !isLeftSidebarOpen"
              >
                <VIcon icon="ri-menu-line" />
              </VBtn>
              <span class="ms-2">예약 캘린더</span>
            </VCardTitle>

            <VCardText>
              <FullCalendar
                id="reservation-calendar"
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

    <!-- 드래그앤드롭 시간 변경 확인 다이얼로그 -->
    <VDialog
      v-model="isRescheduleDialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-drag-move-line" size="24" class="me-3" color="warning" />
          <span>예약 시간 변경</span>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <p class="mb-4">
            <strong>{{ rescheduleInfo.customerName }}</strong>님의 예약 시간을 변경하시겠습니까?
          </p>

          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-center gap-2">
                <VIcon icon="ri-time-line" size="18" />
                <span><strong>변경 전:</strong> {{ rescheduleInfo.oldDate }} {{ rescheduleInfo.oldStart }} ~ {{ rescheduleInfo.oldEnd }}</span>
              </div>
              <div class="d-flex align-center gap-2">
                <VIcon icon="ri-arrow-right-line" size="18" />
                <span><strong>변경 후:</strong> {{ rescheduleInfo.newDate }} {{ rescheduleInfo.newStart }} ~ {{ rescheduleInfo.newEnd }}</span>
              </div>
            </div>
          </VAlert>

          <VAlert
            type="warning"
            variant="tonal"
          >
            변경된 예약 시간은 고객에게 알림이 발송됩니다.
          </VAlert>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="cancelReschedule"
          >
            취소
          </VBtn>
          <VBtn
            color="primary"
            :loading="rescheduleLoading"
            @click="confirmReschedule"
          >
            변경 확인
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

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
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { useReservationStore } from '@/stores/reservation'
import { useStaffStore } from '@/stores/staff'
import { useSubscriptionStore } from '@/stores/subscription'
import koLocale from '@fullcalendar/core/locales/ko'
import { Korean } from 'flatpickr/dist/l10n/ko.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import { computed, onMounted, ref, watch } from 'vue'
import StatisticsCard from '@/components/StatisticsCard.vue'
import ReservationDetailDialog from './components/ReservationDetailDialog.vue'
import ReservationFormDialog from './components/ReservationFormDialog.vue'

const { success: showSuccess, error: showError } = useSnackbar()
const businessSettingsStore = useBusinessSettingsStore()
const reservationStore = useReservationStore()
const staffStore = useStaffStore()
const subscriptionStore = useSubscriptionStore()

// 직원별 색상 팔레트
const staffColorPalette = [
  '#5B8DEF', // 파랑
  '#FF6B6B', // 빨강
  '#51CF66', // 초록
  '#FF922B', // 오렌지
  '#CC5DE8', // 보라
  '#20C997', // 틸
  '#FCC419', // 노랑
  '#F06595', // 핑크
  '#339AF0', // 스카이블루
  '#A9E34B', // 라임
  '#845EF7', // 인디고
  '#22B8CF', // 시안
]

// 직원 ID -> 색상 매핑
const staffColorMap = computed(() => {
  const map = {}
  staffStore.activeStaffs.forEach((staff, index) => {
    map[staff.id] = staffColorPalette[index % staffColorPalette.length]
  })
  return map
})

// 직원 색상 가져오기
function getStaffColor(staffId) {
  return staffColorMap.value[staffId] || '#78909C'
}

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
const calendarLoading = ref(false)

// 드래그앤드롭 시간 변경
const isRescheduleDialogVisible = ref(false)
const rescheduleLoading = ref(false)
const pendingRescheduleEvent = ref(null)
const rescheduleInfo = ref({
  customerName: '',
  oldDate: '',
  oldStart: '',
  oldEnd: '',
  newDate: '',
  newStart: '',
  newEnd: '',
})
const selectedDate = ref(new Date())

// Flatpickr용 날짜 문자열
const selectedDateStr = computed(() => {
  const d = selectedDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function onDatePickerChange(dateStr) {
  selectedDate.value = new Date(dateStr)
  jumpToDate(dateStr)
}

// 상태 필터
const availableStatuses = [
  { label: '대기', value: 'PENDING', color: 'warning' },
  { label: '확정', value: 'CONFIRMED', color: 'primary' },
  { label: '완료', value: 'COMPLETED', color: 'success' },
  { label: '취소', value: 'CANCELLED', color: 'error' },
]

const selectedStatuses = ref(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])

// 직원 필터
const selectedStaffIds = ref([]) // 빈 배열 = 전체 선택

const isAllStaffSelected = computed({
  get: () => selectedStaffIds.value.length === 0,
  set: val => {
    if (val) {
      selectedStaffIds.value = []
    }
  },
})

function toggleStaffFilter(staffId) {
  const index = selectedStaffIds.value.indexOf(staffId)
  if (index > -1) {
    selectedStaffIds.value.splice(index, 1)
  }
  else {
    selectedStaffIds.value.push(staffId)
  }
}

// 직원 색상 모드 (상태 색상 vs 직원 색상)
const colorByStaff = ref(false)

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
  return reservationStore.calendarEvents
    .filter(event => {
      const reservation = event.extendedProps.reservation

      // 상태 필터
      if (!selectedStatuses.value.includes(reservation.status))
        return false

      // 직원 필터 (빈 배열이면 전체)
      if (selectedStaffIds.value.length > 0 && !selectedStaffIds.value.includes(reservation.staffId))
        return false

      return true
    })
    .map(event => {
      // 직원 색상 모드일 때 색상 오버라이드
      if (colorByStaff.value && event.extendedProps.reservation.staffId) {
        const staffColor = getStaffColor(event.extendedProps.reservation.staffId)
        return {
          ...event,
          backgroundColor: staffColor,
          borderColor: staffColor,
        }
      }
      return event
    })
})

// 필터링된 통계
const filteredStats = computed(() => {
  const filtered = reservationStore.reservations.filter(r => {
    if (!selectedStatuses.value.includes(r.status))
      return false
    if (selectedStaffIds.value.length > 0 && !selectedStaffIds.value.includes(r.staffId))
      return false
    return true
  })

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
  editable: true,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  selectable: true,
  allDaySlot: false,
  nowIndicator: true,
  datesSet: (dateInfo) => {
    const start = dateInfo.startStr.split('T')[0]
    const end = dateInfo.endStr.split('T')[0]
    loadReservations(start, end)
  },
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
    showError(error.message || '예약 취소에 실패했습니다.')
  }
}

// 상태 변경
async function handleStatusChange(reservationId, newStatus) {
  try {
    if (newStatus === 'COMPLETED') {
      await reservationStore.completeReservation(reservationId)
    }
    else {
      await reservationStore.updateReservationStatus(reservationId, newStatus)
    }

    isDetailDialogVisible.value = false
    await loadReservations()
  }
  catch (error) {
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
async function loadReservations(startStr, endStr) {
  calendarLoading.value = true
  try {
    let startDate, endDate
    if (startStr && endStr) {
      startDate = startStr
      endDate = endStr
    } else {
      const today = new Date()
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
    }
    await reservationStore.fetchReservationsByDateRange(startDate, endDate)
  } finally {
    calendarLoading.value = false
  }
}

// --- 드래그앤드롭 핸들러 ---

function formatEventDateTime(dateObj) {
  const date = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const time = dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
  return { date, time }
}

function handleEventDrop(info) {
  showRescheduleConfirm(info)
}

function handleEventResize(info) {
  showRescheduleConfirm(info)
}

function showRescheduleConfirm(info) {
  const reservation = info.event.extendedProps.reservation
  const oldStart = info.oldEvent.start
  const oldEnd = info.oldEvent.end
  const newStart = info.event.start
  const newEnd = info.event.end

  const oldStartFmt = formatEventDateTime(oldStart)
  const oldEndFmt = formatEventDateTime(oldEnd)
  const newStartFmt = formatEventDateTime(newStart)
  const newEndFmt = formatEventDateTime(newEnd)

  rescheduleInfo.value = {
    customerName: reservation.customerName || '고객',
    oldDate: oldStartFmt.date,
    oldStart: oldStartFmt.time,
    oldEnd: oldEndFmt.time,
    newDate: newStartFmt.date,
    newStart: newStartFmt.time,
    newEnd: newEndFmt.time,
  }

  pendingRescheduleEvent.value = info
  isRescheduleDialogVisible.value = true
}

async function confirmReschedule() {
  if (!pendingRescheduleEvent.value) return

  const info = pendingRescheduleEvent.value
  const reservation = info.event.extendedProps.reservation
  const newStart = info.event.start
  const newEnd = info.event.end

  const newDate = newStart.toISOString().split('T')[0]
  const newStartTime = newStart.toTimeString().substring(0, 5)
  const newEndTime = newEnd.toTimeString().substring(0, 5)

  rescheduleLoading.value = true
  try {
    // TODO: 백엔드에 PATCH /api/businesses/{businessId}/reservations/{id}/reschedule 엔드포인트가 구현되면 전용 API 호출로 변경
    await reservationStore.updateReservation(reservation.id, {
      ...reservation,
      reservationDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
    })

    isRescheduleDialogVisible.value = false
    pendingRescheduleEvent.value = null
    await loadReservations()
  }
  catch (error) {
    // 실패 시 원래 위치로 복원
    info.revert()
    showError(error.message || '예약 시간 변경에 실패했습니다.')
    isRescheduleDialogVisible.value = false
    pendingRescheduleEvent.value = null
  }
  finally {
    rescheduleLoading.value = false
  }
}

function cancelReschedule() {
  if (pendingRescheduleEvent.value) {
    pendingRescheduleEvent.value.revert()
  }
  isRescheduleDialogVisible.value = false
  pendingRescheduleEvent.value = null
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
    staffStore.staffs.length === 0 ? staffStore.fetchStaffs() : Promise.resolve(),
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

.calendar-date-picker {
  display: none;

  + .flatpickr-input {
    + .flatpickr-calendar.inline {
      border: none;
      box-shadow: none;

      .flatpickr-months {
        border-block-end: none;
      }
    }
  }

  & ~ .flatpickr-calendar .flatpickr-weekdays {
    margin-block: 0 4px;
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
