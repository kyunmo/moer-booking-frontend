<template>
  <VCard>
    <VCardTitle class="d-flex align-center pe-2">
      <VIcon icon="ri-calendar-line" size="24" class="me-3" />
      <span>예약 캘린더</span>

      <VSpacer />

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

    <VCardText>
      <!-- FullCalendar -->
      <FullCalendar
        ref="refCalendar"
        :options="calendarOptions"
      />
    </VCardText>

    <!-- 예약 상세/등록 다이얼로그 -->
    <ReservationDialog
      v-model="isDialogVisible"
      :reservation="selectedReservation"
      :selected-date="selectedDate"
      @saved="handleReservationSaved"
    />
  </VCard>
</template>

<script setup>
import { useReservationStore } from '@/stores/reservation'
import koLocale from '@fullcalendar/core/locales/ko'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import { computed, onMounted, ref } from 'vue'
import ReservationDialog from './components/ReservationDialog.vue'

// Pinia Store
const reservationStore = useReservationStore()

// Refs
const refCalendar = ref(null)
const isDialogVisible = ref(false)
const selectedReservation = ref(null)
const selectedDate = ref(null)

// FullCalendar 옵션
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'timeGridWeek',
  locale: koLocale,
  
  // 헤더 툴바
  headerToolbar: {
    start: 'prev,next today',
    center: 'title',
    end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  
  // 시간 설정
  slotMinTime: '09:00:00',
  slotMaxTime: '21:00:00',
  slotDuration: '00:30:00',
  
  // 이벤트 설정
  events: reservationStore.calendarEvents,
  
  // 높이
  height: 'auto',
  
  // 날짜 클릭
  dateClick: handleDateClick,
  
  // 이벤트 클릭
  eventClick: handleEventClick,
  
  // 날짜 범위 변경 시 (캘린더 이동)
  datesSet: handleDatesSet,
  
  // 이벤트 스타일
  eventClassNames: 'cursor-pointer',
  
  // 주말 표시
  weekends: true,
  
  // 더 많은 이벤트 표시
  dayMaxEvents: true,
  
  // 비즈니스 시간 표시
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // 월~토
    startTime: '09:00',
    endTime: '20:00',
  },
  
  // 현재 시간 표시
  nowIndicator: true,
  
  // 선택 가능
  selectable: true,
  selectMirror: true,
  
  // 드래그 앤 드롭
  editable: false, // TODO: 나중에 true로 변경하여 드래그로 시간 변경 가능
}))

/**
 * 날짜 클릭 핸들러
 */
function handleDateClick(info) {
  selectedDate.value = info.dateStr
  selectedReservation.value = null
  isDialogVisible.value = true
}

/**
 * 이벤트 클릭 핸들러
 */
function handleEventClick(info) {
  selectedReservation.value = info.event.extendedProps.reservation
  selectedDate.value = null
  isDialogVisible.value = true
}

/**
 * 캘린더 날짜 범위 변경 핸들러
 */
async function handleDatesSet(info) {
  const startDate = info.startStr.split('T')[0]
  const endDate = info.endStr.split('T')[0]
  
  try {
    await reservationStore.fetchReservationsByDateRange(startDate, endDate)
  } catch (error) {
    console.error('예약 목록 조회 실패:', error)
  }
}

/**
 * 새 예약 다이얼로그 열기
 */
function openReservationDialog() {
  selectedReservation.value = null
  selectedDate.value = new Date().toISOString().split('T')[0]
  isDialogVisible.value = true
}

/**
 * 예약 저장 후 핸들러
 */
async function handleReservationSaved() {
  // 캘린더 새로고침
  const calendarApi = refCalendar.value.getApi()
  const currentStart = calendarApi.view.currentStart.toISOString().split('T')[0]
  const currentEnd = calendarApi.view.currentEnd.toISOString().split('T')[0]
  
  await reservationStore.fetchReservationsByDateRange(currentStart, currentEnd)
  
  isDialogVisible.value = false
}

/**
 * 컴포넌트 마운트 시
 */
onMounted(async () => {
  // 이번 주 예약 로드
  const today = new Date()
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7))
  
  await reservationStore.fetchReservationsByDateRange(
    startOfWeek.toISOString().split('T')[0],
    endOfWeek.toISOString().split('T')[0],
  )
})
</script>

<style lang="scss">
// FullCalendar 커스텀 스타일
.fc {
  // 이벤트 커서
  .fc-event {
    cursor: pointer;
  }

  // 이벤트 호버
  .fc-event:hover {
    opacity: 0.8;
  }

  // 한글 폰트
  font-family: "Noto Sans KR", sans-serif;
}
</style>
