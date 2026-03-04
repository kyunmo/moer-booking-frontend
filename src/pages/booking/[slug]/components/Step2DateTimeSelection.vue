<template>
  <VCard rounded="lg" variant="outlined">
    <VCardTitle class="text-h6 font-weight-bold pa-5 pb-3">
      <VIcon start color="primary" size="22">
        ri-calendar-line
      </VIcon>
      날짜 및 시간 선택
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-5">
      <!-- Loading dates -->
      <div v-if="datesLoading" class="text-center py-8">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- Dates load error -->
      <div v-else-if="datesError" class="text-center py-8">
        <VAlert type="error" variant="tonal" class="mb-4">
          예약 가능 날짜를 불러오지 못했습니다
        </VAlert>
        <VBtn
          color="primary"
          variant="outlined"
          prepend-icon="ri-refresh-line"
          aria-label="날짜 다시 불러오기"
          @click="$emit('reload-dates')"
        >
          다시 시도
        </VBtn>
      </div>

      <template v-else>
        <VRow>
          <!-- Left Column: Date Picker -->
          <VCol cols="12" md="5">
            <!-- Date Picker -->
            <div class="d-flex justify-center">
              <VDatePicker
                v-model="selectedDateModel"
                :allowed-dates="isDateAllowed"
                :min="todayStr"
                :month="datePickerMonth"
                :year="datePickerYear"
                :weekdays="[0, 1, 2, 3, 4, 5, 6]"
                first-day-of-week="0"
                color="primary"
                width="100%"
                max-width="400"
                show-adjacent-months
                hide-header
                aria-label="예약 날짜 선택 달력"
                @update:month="handleMonthUpdate"
                @update:year="handleYearUpdate"
              />
            </div>

            <!-- Selected date display -->
            <div v-if="selectedDate" class="text-center mt-4">
              <VChip color="primary" variant="tonal">
                <VIcon start size="16">
                  ri-calendar-check-line
                </VIcon>
                {{ formatDate(selectedDate) }}
              </VChip>
            </div>
          </VCol>

          <!-- Right Column: Time Slots + Staff Selection -->
          <VCol cols="12" md="7">
            <!-- Time Slots (shown after date selection) -->
            <template v-if="selectedDate">
              <div ref="timeSlotsSection">
                <!-- Loading slots -->
                <div v-if="slotsLoading" class="text-center py-6">
                  <VProgressCircular indeterminate color="primary" size="32" />
                  <p class="text-body-2 text-medium-emphasis mt-2">
                    시간 정보를 불러오는 중...
                  </p>
                </div>

                <!-- Slots load error -->
                <div v-else-if="slotsError" class="text-center py-6">
                  <VAlert type="error" variant="tonal" class="mb-4">
                    예약 가능 시간을 불러오지 못했습니다
                  </VAlert>
                  <VBtn
                    color="primary"
                    variant="outlined"
                    prepend-icon="ri-refresh-line"
                    aria-label="시간 다시 불러오기"
                    @click="$emit('reload-slots')"
                  >
                    다시 시도
                  </VBtn>
                </div>

                <template v-else>
                  <!-- No Slots -->
                  <div v-if="availableSlots.length === 0" class="text-center py-6">
                    <VIcon icon="ri-time-line" size="48" color="grey-lighten-1" class="mb-3" />
                    <p class="text-body-1 text-medium-emphasis">
                      선택한 날짜에 예약 가능한 시간이 없습니다
                    </p>
                  </div>

                  <template v-else>
                    <!-- Time Slots Grid -->
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">
                      시간 선택
                    </h3>

                    <!-- AM -->
                    <template v-if="amSlots.length > 0">
                      <div class="d-flex align-center ga-2 mb-2">
                        <VIcon icon="ri-sun-line" size="18" color="warning" />
                        <span class="text-body-2 font-weight-medium text-medium-emphasis">오전</span>
                        <VDivider />
                      </div>
                      <VRow class="mb-4">
                        <VCol
                          v-for="slot in amSlots"
                          :key="slot.startTime"
                          cols="6"
                          sm="4"
                        >
                          <VBtn
                            :color="selectedTime?.startTime === slot.startTime ? 'primary' : undefined"
                            :variant="selectedTime?.startTime === slot.startTime ? 'elevated' : 'outlined'"
                            block
                            class="time-slot-btn"
                            :aria-label="`오전 ${formatTimeKR(slot.startTime)} 선택`"
                            :aria-pressed="selectedTime?.startTime === slot.startTime"
                            @click="selectTime(slot)"
                          >
                            {{ formatTimeKR(slot.startTime) }}
                          </VBtn>
                        </VCol>
                      </VRow>
                    </template>

                    <!-- PM -->
                    <template v-if="pmSlots.length > 0">
                      <div class="d-flex align-center ga-2 mb-2">
                        <VIcon icon="ri-moon-line" size="18" color="info" />
                        <span class="text-body-2 font-weight-medium text-medium-emphasis">오후</span>
                        <VDivider />
                      </div>
                      <VRow class="mb-2">
                        <VCol
                          v-for="slot in pmSlots"
                          :key="slot.startTime"
                          cols="6"
                          sm="4"
                        >
                          <VBtn
                            :color="selectedTime?.startTime === slot.startTime ? 'primary' : undefined"
                            :variant="selectedTime?.startTime === slot.startTime ? 'elevated' : 'outlined'"
                            block
                            class="time-slot-btn"
                            :aria-label="`오후 ${formatTimeKR(slot.startTime)} 선택`"
                            :aria-pressed="selectedTime?.startTime === slot.startTime"
                            @click="selectTime(slot)"
                          >
                            {{ formatTimeKR(slot.startTime) }}
                          </VBtn>
                        </VCol>
                      </VRow>
                    </template>

                    <!-- Estimated end time -->
                    <template v-if="selectedTime && estimatedEndTime">
                      <VAlert
                        type="info"
                        variant="tonal"
                        class="mt-4"
                        density="compact"
                      >
                        <div class="d-flex align-center flex-wrap ga-1">
                          <VIcon icon="ri-time-line" size="18" class="me-1" />
                          <span class="font-weight-bold">{{ timeRangeDisplay }}</span>
                          <span class="text-medium-emphasis ms-1">({{ durationBreakdown }}, 총 {{ totalDuration }}분)</span>
                        </div>
                      </VAlert>
                    </template>

                    <!-- Staff Selection (after time selected) -->
                    <template v-if="selectedTime">
                      <VDivider class="my-5" />
                      <h3 class="text-subtitle-1 font-weight-bold mb-3">
                        담당자 선택
                      </h3>

                      <div class="d-flex flex-wrap ga-3" role="radiogroup" aria-label="담당자 선택">
                        <!-- "아무나" option -->
                        <VCard
                          :variant="selectedStaff === null ? 'outlined' : 'flat'"
                          :color="selectedStaff === null ? 'primary' : undefined"
                          :class="[
                            'staff-card cursor-pointer pa-3 text-center',
                            { 'staff-card--selected': selectedStaff === null },
                          ]"
                          :style="selectedStaff !== null ? 'border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))' : ''"
                          rounded="lg"
                          min-width="100"
                          role="radio"
                          :aria-checked="selectedStaff === null"
                          aria-label="자동 배정 (아무나)"
                          tabindex="0"
                          @click="selectStaff(null)"
                          @keydown.enter="selectStaff(null)"
                          @keydown.space.prevent="selectStaff(null)"
                        >
                          <VAvatar color="grey-lighten-2" size="48" class="mb-2">
                            <VIcon icon="ri-group-line" size="24" />
                          </VAvatar>
                          <div class="text-body-2 font-weight-medium">
                            아무나
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            자동 배정
                          </div>
                        </VCard>

                        <!-- Available Staffs -->
                        <VCard
                          v-for="staff in currentSlotStaffs"
                          :key="staff.id"
                          :variant="selectedStaff?.id === staff.id ? 'outlined' : 'flat'"
                          :color="selectedStaff?.id === staff.id ? 'primary' : undefined"
                          :class="[
                            'staff-card cursor-pointer pa-3 text-center',
                            { 'staff-card--selected': selectedStaff?.id === staff.id },
                          ]"
                          :style="selectedStaff?.id !== staff.id ? 'border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))' : ''"
                          rounded="lg"
                          min-width="100"
                          role="radio"
                          :aria-checked="selectedStaff?.id === staff.id"
                          :aria-label="`담당자 ${staff.name} 선택`"
                          tabindex="0"
                          @click="selectStaff(staff)"
                          @keydown.enter="selectStaff(staff)"
                          @keydown.space.prevent="selectStaff(staff)"
                        >
                          <VAvatar color="primary" variant="tonal" size="48" class="mb-2">
                            <VImg v-if="staff.profileImageUrl" :src="staff.profileImageUrl" :alt="`${staff.name} 프로필 사진`" />
                            <span v-else class="text-body-1 font-weight-bold">
                              {{ staff.name?.charAt(0) }}
                            </span>
                          </VAvatar>
                          <div class="text-body-2 font-weight-medium">
                            {{ staff.name }}
                          </div>
                        </VCard>
                      </div>
                    </template>
                  </template>
                </template>
              </div>
            </template>
            <div v-else class="text-center py-8 text-medium-emphasis">
              <VIcon icon="ri-calendar-line" size="48" color="grey-lighten-1" class="mb-3" />
              <p class="text-body-1">왼쪽 달력에서 날짜를 선택해주세요</p>
            </div>
          </VCol>
        </VRow>
      </template>
    </VCardText>

    <VDivider />
    <VCardActions class="pa-5 d-flex flex-column flex-sm-row ga-3">
      <VBtn
        variant="outlined"
        size="large"
        block
        class="flex-sm-grow-0"
        min-width="140"
        aria-label="이전 단계로 이동"
        @click="$emit('prev')"
      >
        <VIcon start>
          ri-arrow-left-line
        </VIcon>
        이전
      </VBtn>
      <VSpacer class="d-none d-sm-block" />
      <VBtn
        color="primary"
        size="large"
        :disabled="!canGoNext"
        block
        class="flex-sm-grow-0"
        min-width="140"
        aria-label="다음 단계로 이동"
        @click="$emit('next')"
      >
        다음
        <VIcon end>
          ri-arrow-right-line
        </VIcon>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatTimeKR, formatTimeRange, calculateEndTime, formatDurationBreakdown } from '@/utils/dateFormat'

const props = defineProps({
  slug: { type: String, required: true },
  datesLoading: { type: Boolean, default: false },
  datesError: { type: Boolean, default: false },
  slotsLoading: { type: Boolean, default: false },
  slotsError: { type: Boolean, default: false },
})

const emit = defineEmits(['next', 'prev', 'reload-dates', 'reload-slots', 'load-dates', 'load-slots', 'month-change'])

const bookingStore = useBookingStore()

// Refs
const timeSlotsSection = ref(null)
const datePickerMonth = ref(new Date().getMonth())
const datePickerYear = ref(new Date().getFullYear())

// Computed from store
const selectedServices = computed(() => bookingStore.selectedServices)
const selectedDate = computed(() => bookingStore.selectedDate)
const selectedTime = computed(() => bookingStore.selectedTime)
const selectedStaff = computed(() => bookingStore.selectedStaff)
const availableDates = computed(() => bookingStore.availableDates)
const availableSlots = computed(() => bookingStore.availableSlots)
const totalDuration = computed(() => bookingStore.totalDuration)

const canGoNext = computed(() => !!selectedDate.value && !!selectedTime.value)

const monthKey = computed(() => {
  const m = String(datePickerMonth.value + 1).padStart(2, '0')
  return `${datePickerYear.value}-${m}`
})

const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const estimatedEndTime = computed(() => {
  if (!selectedTime.value?.startTime || !totalDuration.value) return ''
  return calculateEndTime(selectedTime.value.startTime, totalDuration.value)
})

const timeRangeDisplay = computed(() => {
  if (!selectedTime.value?.startTime || !estimatedEndTime.value) return ''
  return formatTimeRange(selectedTime.value.startTime, estimatedEndTime.value)
})

const durationBreakdown = computed(() => {
  return formatDurationBreakdown(selectedServices.value)
})

const amSlots = computed(() => {
  return availableSlots.value.filter(slot => {
    const hour = parseInt(slot.startTime?.split(':')[0], 10)
    return hour < 12
  })
})

const pmSlots = computed(() => {
  return availableSlots.value.filter(slot => {
    const hour = parseInt(slot.startTime?.split(':')[0], 10)
    return hour >= 12
  })
})

const currentSlotStaffs = computed(() => {
  if (!selectedTime.value) return []
  return selectedTime.value.availableStaffs || []
})

// Date picker model
const selectedDateModel = computed({
  get: () => {
    if (!selectedDate.value) return null
    return new Date(selectedDate.value + 'T00:00:00')
  },
  set: (val) => {
    if (val) {
      const d = new Date(val)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      bookingStore.selectedDate = dateStr
      bookingStore.selectedTime = null
      bookingStore.selectedStaff = null
    }
  },
})

function isDateAllowed(date) {
  let dateStr
  if (typeof date === 'string') {
    dateStr = date
  } else if (date instanceof Date) {
    dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } else {
    const d = new Date(date)
    dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  return availableDates.value.includes(dateStr)
}

function handleMonthUpdate(month) {
  datePickerMonth.value = month
}

function handleYearUpdate(year) {
  datePickerYear.value = year
}

function selectTime(slot) {
  bookingStore.selectedTime = slot
  bookingStore.selectedStaff = null
}

function selectStaff(staff) {
  bookingStore.selectedStaff = staff
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayOfWeek})`
}

// Watch month changes to reload dates
watch(monthKey, () => {
  emit('month-change', monthKey.value)
})

// Auto-load slots when date selected
watch(selectedDate, (newDate) => {
  if (newDate) {
    emit('load-slots')
    nextTick(() => {
      setTimeout(() => {
        timeSlotsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    })
  }
})

// Expose for parent to call initial load
defineExpose({
  loadDates: () => emit('load-dates'),
  monthKey,
})
</script>

<style lang="scss" scoped>
.time-slot-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
}

.staff-card {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-width: 2px !important;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
