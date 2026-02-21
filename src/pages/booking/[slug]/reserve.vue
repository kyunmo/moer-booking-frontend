<route lang="yaml">
meta:
  layout: public
  public: true
  title: 예약하기 - YEMO
</route>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import customerApi from '@/api/customer'
import { usePhoneValidation } from '@/composables/usePhoneValidation'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatTimeKR, formatTimeRange, calculateEndTime, formatDurationBreakdown } from '@/utils/dateFormat'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const customerAuthStore = useCustomerAuthStore()
const { error: showError, success: showSuccess } = useSnackbar()
const { requiredPhoneRules, formatPhoneInput } = usePhoneValidation()

const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)

const slug = computed(() => route.params.slug)

// =====================================================
// Rebook Mode
// =====================================================
const rebookMode = computed(() => route.query.rebook === 'true')
const rebookServiceIds = computed(() => {
  if (!route.query.serviceIds) return []
  return route.query.serviceIds.split(',').map(Number).filter(Boolean)
})
const rebookStaffId = computed(() => {
  return route.query.staffId ? Number(route.query.staffId) : null
})

// =====================================================
// Error Code Messages
// =====================================================
const errorMessages = {
  BK001: '해당 시간대에 예약할 수 없습니다',
  BK002: '영업시간 외에는 예약할 수 없습니다',
  BK003: '휴무일에는 예약할 수 없습니다',
  BK004: '해당 스태프가 근무하지 않는 시간입니다',
  BK007: '온라인 예약이 비활성화되어 있습니다',
  BK008: '예약 가능 기간을 초과했습니다',
  BK009: '최소 사전 예약 시간을 충족하지 않습니다',
  CP001: '예약을 위해 전화번호 등록이 필요합니다',
}

// =====================================================
// State
// =====================================================
const pageLoading = ref(true)
const submitting = ref(false)
const isCompleted = ref(false)

// Step 2: calendar state
const datesLoading = ref(false)

// Step 2: slots state (integrated with calendar)
const slotsLoading = ref(false)

// Step 3: form validation
const customerFormRef = ref(null)
const customerFormValid = ref(false)

// =====================================================
// Computed: Store
// =====================================================
const step = computed({
  get: () => bookingStore.step,
  set: val => { bookingStore.step = val },
})

const business = computed(() => bookingStore.business)
const servicesByCategory = computed(() => bookingStore.servicesByCategory)
const selectedServices = computed(() => bookingStore.selectedServices)
const selectedDate = computed(() => bookingStore.selectedDate)
const selectedTime = computed(() => bookingStore.selectedTime)
const selectedStaff = computed(() => bookingStore.selectedStaff)
const customerForm = computed(() => bookingStore.customerForm)
const availableDates = computed(() => bookingStore.availableDates)
const availableSlots = computed(() => bookingStore.availableSlots)
const totalPrice = computed(() => bookingStore.totalPrice)
const totalDuration = computed(() => bookingStore.totalDuration)
const reservationResult = computed(() => bookingStore.reservationResult)

// 예상 종료 시간 계산
const estimatedEndTime = computed(() => {
  if (!selectedTime.value?.startTime || !totalDuration.value) return ''
  return calculateEndTime(selectedTime.value.startTime, totalDuration.value)
})

// 시간 범위 표시 (오전/오후)
const timeRangeDisplay = computed(() => {
  if (!selectedTime.value?.startTime || !estimatedEndTime.value) return ''
  return formatTimeRange(selectedTime.value.startTime, estimatedEndTime.value)
})

// 서비스별 소요시간 내역
const durationBreakdown = computed(() => {
  return formatDurationBreakdown(selectedServices.value)
})

// =====================================================
// Step 1: Service Selection
// =====================================================
function toggleService(service) {
  const index = bookingStore.selectedServices.findIndex(s => s.id === service.id)
  if (index >= 0) {
    bookingStore.selectedServices.splice(index, 1)
  } else {
    bookingStore.selectedServices.push(service)
  }
}

function isServiceSelected(service) {
  return bookingStore.selectedServices.some(s => s.id === service.id)
}

// =====================================================
// Step 2: Calendar (VDatePicker)
// =====================================================

// Date picker month/year control
const datePickerMonth = ref(new Date().getMonth())
const datePickerYear = ref(new Date().getFullYear())

const monthKey = computed(() => {
  const m = String(datePickerMonth.value + 1).padStart(2, '0')
  return `${datePickerYear.value}-${m}`
})

// Today's date string for VDatePicker min prop
const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// Bidirectional model for VDatePicker (Date object <-> string)
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
      // Reset time and staff when date changes
      bookingStore.selectedTime = null
      bookingStore.selectedStaff = null
    }
  },
})

// Allowed dates function for VDatePicker
function isDateAllowed(date) {
  // VDatePicker passes a date value (may be Date or internal adapter value)
  let dateStr
  if (typeof date === 'string') {
    dateStr = date
  } else if (date instanceof Date) {
    dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } else {
    // Vuetify internal adapter date - try converting
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

async function loadAvailableDates() {
  if (!selectedServices.value.length) return
  datesLoading.value = true
  try {
    await bookingStore.fetchAvailableDates(slug.value, {
      month: monthKey.value,
      serviceId: selectedServices.value[0].id,
    })
  } catch (err) {
    showError('예약 가능 날짜를 불러오지 못했습니다')
  } finally {
    datesLoading.value = false
  }
}

// Re-fetch dates on month change
watch(monthKey, () => {
  if (step.value === 2) {
    loadAvailableDates()
  }
})

// Auto-load time slots when date is selected in step 2
watch(selectedDate, newDate => {
  if (newDate && step.value === 2) {
    loadAvailableSlots()
  }
})

// =====================================================
// Step 2: Time Slots + Staff (integrated with calendar)
// =====================================================
const currentSlotStaffs = computed(() => {
  if (!selectedTime.value) return []
  return selectedTime.value.availableStaffs || []
})

function selectTime(slot) {
  bookingStore.selectedTime = slot
  bookingStore.selectedStaff = null
}

function selectStaff(staff) {
  bookingStore.selectedStaff = staff
}

async function loadAvailableSlots() {
  if (!selectedDate.value || !selectedServices.value.length) return
  slotsLoading.value = true
  try {
    await bookingStore.fetchAvailableSlots(slug.value, {
      date: selectedDate.value,
      serviceId: selectedServices.value[0].id,
    })
  } catch (err) {
    showError('예약 가능 시간을 불러오지 못했습니다')
  } finally {
    slotsLoading.value = false
  }
}

// =====================================================
// Step 3: Customer Form Validation
// =====================================================

// Phone formatting (from usePhoneValidation composable)
function handlePhoneInput(event) {
  const raw = event.target.value

  customerForm.value.phone = formatPhoneInput(raw)
}

const phoneRules = requiredPhoneRules

const nameRules = [
  v => !!v || '이름을 입력해주세요',
]

const emailRules = [
  v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || '올바른 이메일 형식이 아닙니다',
]

// =====================================================
// Step Navigation
// =====================================================
const canGoNext = computed(() => {
  switch (step.value) {
    case 1: return selectedServices.value.length > 0
    case 2: return !!selectedDate.value && !!selectedTime.value
    case 3:
      if (isCustomerLoggedIn.value) {
        // 고객 로그인 시 전화번호 등록 여부 확인
        return customerAuthStore.hasPhone
      }
      return customerFormValid.value
    case 4: return true
    default: return false
  }
})

async function goNext() {
  if (!canGoNext.value) return

  if (step.value === 3 && !isCustomerLoggedIn.value) {
    // 비회원: Validate form explicitly before proceeding
    const { valid } = await customerFormRef.value.validate()
    if (!valid) return
  }

  step.value = Math.min(step.value + 1, 4)

  // Trigger data loading when entering steps
  await nextTick()
  if (step.value === 2) {
    loadAvailableDates()
  }
}

function goPrev() {
  step.value = Math.max(step.value - 1, 1)
}

// =====================================================
// Step 4: Submit Reservation
// =====================================================
async function submitReservation() {
  submitting.value = true
  try {
    if (isCustomerLoggedIn.value) {
      // 고객 로그인 상태: customerApi 사용
      const payload = {
        serviceIds: selectedServices.value.map(s => s.id),
        staffId: selectedStaff.value?.id || null,
        reservationDate: selectedDate.value,
        startTime: selectedTime.value?.startTime,
        customerRequest: customerForm.value.request || null,
      }
      const { data } = await customerApi.createReservation(slug.value, payload)
      bookingStore.reservationResult = data
    } else {
      // 비회원: 기존 bookingStore 사용
      await bookingStore.createReservation(slug.value)
    }
    isCompleted.value = true
    showSuccess('예약이 완료되었습니다!')
  } catch (err) {
    const code = err.response?.data?.error?.code || err.code
    const message = errorMessages[code] || err.response?.data?.error?.message || err.message || '예약 생성에 실패했습니다'
    showError(message)
  } finally {
    submitting.value = false
  }
}

// =====================================================
// Completion Actions
// =====================================================
function goToLookup() {
  if (isCustomerLoggedIn.value) {
    router.push('/booking/my-reservations')
  } else {
    router.push('/booking/reservation')
  }
}

function goToShop() {
  router.push(`/booking/${slug.value}`)
}

function copyReservationNumber() {
  if (!reservationResult.value?.reservationNumber) return
  navigator.clipboard.writeText(reservationResult.value.reservationNumber)
  showSuccess('예약번호가 복사되었습니다')
}

// =====================================================
// Formatting Helpers
// =====================================================
function formatPrice(price) {
  return (price || 0).toLocaleString()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayOfWeek})`
}

// =====================================================
// Stepper Items
// =====================================================
const stepperItems = computed(() => [
  { title: '서비스 선택', value: 1 },
  { title: '날짜/시간', value: 2 },
  { title: isCustomerLoggedIn.value ? '정보 확인' : '고객 정보', value: 3 },
  { title: '예약 확인', value: 4 },
])

// =====================================================
// Rebook: Auto-select previous services/staff
// =====================================================
function applyRebookData() {
  const allServices = bookingStore.business?.services || []
  const matchedServices = allServices.filter(s => rebookServiceIds.value.includes(s.id))

  if (matchedServices.length > 0) {
    bookingStore.selectedServices = matchedServices
  }

  // staffId는 Step 2에서 시간 선택 후 자동 선택됨 (아래 watch 참고)
}

// 재예약 모드: 시간 선택 시 이전 담당자 자동 선택
watch(currentSlotStaffs, (staffs) => {
  if (!rebookMode.value || !rebookStaffId.value || !staffs.length) return
  const matchedStaff = staffs.find(s => s.id === rebookStaffId.value)
  if (matchedStaff) {
    bookingStore.selectedStaff = matchedStaff
  }
})

// =====================================================
// Lifecycle
// =====================================================
onMounted(async () => {
  try {
    if (!bookingStore.business || bookingStore.business.slug !== slug.value) {
      await bookingStore.fetchBusinessDetail(slug.value)
    }

    // 재예약 모드: 이전 서비스/스태프 자동 선택
    if (rebookMode.value && rebookServiceIds.value.length > 0) {
      applyRebookData()
    }
  } catch (err) {
    showError('매장 정보를 불러오지 못했습니다')
    router.push('/booking')
    return
  } finally {
    pageLoading.value = false
  }
})

onUnmounted(() => {
  bookingStore.resetBookingFlow()
})
</script>

<template>
  <div class="reserve-page">
    <VContainer class="py-6 py-md-10" style="max-inline-size: 800px;">
      <!-- Page Loading -->
      <div v-if="pageLoading" class="text-center py-16">
        <VProgressCircular indeterminate color="primary" size="64" />
        <p class="text-body-1 text-medium-emphasis mt-4">
          매장 정보를 불러오는 중...
        </p>
      </div>

      <!-- Completion Screen -->
      <template v-else-if="isCompleted">
        <VCard class="text-center pa-8 pa-md-12" rounded="xl" elevation="2">
          <VIcon
            icon="ri-checkbox-circle-fill"
            color="success"
            size="80"
            class="mb-6"
          />

          <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
            예약이 완료되었습니다!
          </h1>

          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ isCustomerLoggedIn ? '내 예약에서 예약 상태를 확인할 수 있습니다' : '예약번호와 전화번호로 예약을 확인할 수 있습니다' }}
          </p>

          <!-- Reservation Number -->
          <VCard
            variant="tonal"
            color="primary"
            class="d-inline-flex align-center pa-4 px-6 mb-8 cursor-pointer"
            rounded="lg"
            @click="copyReservationNumber"
          >
            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                예약번호
              </div>
              <div class="text-h5 font-weight-bold">
                {{ reservationResult?.reservationNumber }}
              </div>
            </div>
            <VIcon class="ms-3" size="20">
              ri-file-copy-line
            </VIcon>
          </VCard>

          <!-- Reservation Summary -->
          <VCard variant="outlined" rounded="lg" class="mb-8 text-start" style="max-inline-size: 400px; margin-inline: auto;">
            <VList lines="two" class="pa-0">
              <VListItem>
                <template #prepend>
                  <VAvatar color="primary" variant="tonal" rounded size="36">
                    <VIcon icon="ri-calendar-check-line" size="18" />
                  </VAvatar>
                </template>
                <VListItemTitle class="text-body-2 font-weight-bold">
                  날짜 / 시간
                </VListItemTitle>
                <VListItemSubtitle class="text-body-2">
                  {{ formatDate(selectedDate) }}
                  <br>
                  {{ timeRangeDisplay }}
                </VListItemSubtitle>
              </VListItem>

              <VDivider />

              <VListItem>
                <template #prepend>
                  <VAvatar color="info" variant="tonal" rounded size="36">
                    <VIcon icon="ri-service-line" size="18" />
                  </VAvatar>
                </template>
                <VListItemTitle class="text-body-2 font-weight-bold">
                  서비스
                </VListItemTitle>
                <VListItemSubtitle class="text-body-2">
                  {{ selectedServices.map(s => s.name).join(', ') }}
                </VListItemSubtitle>
              </VListItem>

              <VDivider />

              <VListItem v-if="selectedStaff">
                <template #prepend>
                  <VAvatar color="warning" variant="tonal" rounded size="36">
                    <VIcon icon="ri-user-star-line" size="18" />
                  </VAvatar>
                </template>
                <VListItemTitle class="text-body-2 font-weight-bold">
                  담당자
                </VListItemTitle>
                <VListItemSubtitle class="text-body-2">
                  {{ selectedStaff.name }}
                </VListItemSubtitle>
              </VListItem>

              <VDivider v-if="selectedStaff" />

              <VListItem>
                <template #prepend>
                  <VAvatar color="success" variant="tonal" rounded size="36">
                    <VIcon icon="ri-money-dollar-circle-line" size="18" />
                  </VAvatar>
                </template>
                <VListItemTitle class="text-body-2 font-weight-bold">
                  총 금액
                </VListItemTitle>
                <VListItemSubtitle class="text-body-2 font-weight-bold text-primary">
                  {{ formatPrice(totalPrice) }}원 / {{ totalDuration }}분
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </VCard>

          <div class="d-flex flex-column flex-sm-row justify-center ga-3">
            <VBtn
              color="primary"
              size="large"
              variant="elevated"
              min-width="180"
              @click="goToLookup"
            >
              <VIcon start>
                ri-search-line
              </VIcon>
              예약 확인
            </VBtn>

            <VBtn
              color="secondary"
              size="large"
              variant="outlined"
              min-width="180"
              @click="goToShop"
            >
              <VIcon start>
                ri-store-2-line
              </VIcon>
              매장으로 돌아가기
            </VBtn>
          </div>
        </VCard>
      </template>

      <!-- Booking Stepper -->
      <template v-else>
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-h5 text-md-h4 font-weight-bold mb-1">
            {{ business?.name }} 예약하기
          </h1>
          <p class="text-body-2 text-medium-emphasis">
            원하는 서비스와 시간을 선택해주세요
          </p>
        </div>

        <!-- Step Progress (Mobile) -->
        <div class="d-md-none mb-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2 font-weight-medium">
              {{ stepperItems[step - 1]?.title }}
            </span>
            <span class="text-body-2 text-medium-emphasis">
              {{ step }} / 4
            </span>
          </div>
          <VProgressLinear
            :model-value="(step / 4) * 100"
            color="primary"
            rounded
            height="6"
          />
        </div>

        <!-- Step Indicators (Desktop) -->
        <VStepper
          v-model="step"
          class="d-none d-md-block mb-6 booking-stepper"
          flat
          alt-labels
          bg-color="transparent"
          hide-actions
        >
          <VStepperHeader>
            <template v-for="(item, index) in stepperItems" :key="item.value">
              <VStepperItem
                :value="item.value"
                :title="item.title"
                :complete="step > item.value"
                :editable="step > item.value"
                :color="step >= item.value ? 'primary' : undefined"
                complete-icon="ri-check-line"
              />
              <VDivider v-if="index < stepperItems.length - 1" />
            </template>
          </VStepperHeader>
        </VStepper>

        <!-- Step Content -->
        <VWindow v-model="step">
          <!-- ============================================= -->
          <!-- Step 1: Service Selection -->
          <!-- ============================================= -->
          <VWindowItem :value="1">
            <VCard rounded="lg" variant="outlined">
              <VCardTitle class="text-h6 font-weight-bold pa-5 pb-3">
                <VIcon start color="primary" size="22">
                  ri-service-line
                </VIcon>
                서비스 선택
              </VCardTitle>

              <VDivider />

              <VAlert
                v-if="rebookMode"
                type="info"
                variant="tonal"
                class="ma-5 mb-0"
                density="compact"
                closable
              >
                이전 예약 기반으로 서비스가 자동 선택되었습니다. 변경할 수 있습니다.
              </VAlert>

              <VCardText class="pa-5">
                <!-- No services -->
                <div v-if="Object.keys(servicesByCategory).length === 0" class="text-center py-8">
                  <VIcon icon="ri-information-line" size="48" color="grey-lighten-1" class="mb-3" />
                  <p class="text-body-1 text-medium-emphasis">
                    등록된 서비스가 없습니다
                  </p>
                </div>

                <!-- Services grouped by category -->
                <div v-for="(services, category) in servicesByCategory" :key="category" class="mb-6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-3 text-medium-emphasis">
                    {{ category }}
                  </h3>

                  <VRow>
                    <VCol
                      v-for="service in services"
                      :key="service.id"
                      cols="12"
                      sm="6"
                    >
                      <VCard
                        :variant="isServiceSelected(service) ? 'outlined' : 'flat'"
                        :color="isServiceSelected(service) ? 'primary' : undefined"
                        :class="[
                          'service-card cursor-pointer pa-4',
                          { 'service-card--selected': isServiceSelected(service) },
                        ]"
                        :style="!isServiceSelected(service) ? 'border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))' : ''"
                        rounded="lg"
                        @click="toggleService(service)"
                      >
                        <div class="d-flex align-start justify-space-between">
                          <div class="flex-grow-1">
                            <div class="d-flex align-center mb-1">
                              <span class="text-subtitle-1 font-weight-bold">
                                {{ service.name }}
                              </span>
                            </div>
                            <p v-if="service.description" class="text-body-2 text-medium-emphasis mb-2">
                              {{ service.description }}
                            </p>
                            <div class="d-flex align-center ga-3">
                              <span class="text-body-2 font-weight-bold text-primary">
                                {{ formatPrice(service.price) }}원
                              </span>
                              <VChip size="x-small" variant="tonal" color="secondary">
                                <VIcon start size="12">
                                  ri-time-line
                                </VIcon>
                                {{ service.duration }}분
                              </VChip>
                            </div>
                          </div>
                          <VIcon
                            v-if="isServiceSelected(service)"
                            icon="ri-checkbox-circle-fill"
                            color="primary"
                            size="24"
                            class="ms-2"
                          />
                          <VIcon
                            v-else
                            icon="ri-checkbox-blank-circle-line"
                            color="grey-lighten-1"
                            size="24"
                            class="ms-2"
                          />
                        </div>
                      </VCard>
                    </VCol>
                  </VRow>
                </div>
              </VCardText>

              <!-- Bottom Summary Bar -->
              <VDivider />
              <VCardActions class="pa-5 d-flex flex-column flex-sm-row align-stretch align-sm-center ga-3">
                <div v-if="selectedServices.length > 0" class="d-flex align-center ga-4 flex-grow-1">
                  <VChip color="primary" variant="tonal" size="small">
                    {{ selectedServices.length }}개 선택
                  </VChip>
                  <span class="text-body-2">
                    총 <strong class="text-primary">{{ formatPrice(totalPrice) }}원</strong>
                    / {{ totalDuration }}분
                  </span>
                </div>
                <VSpacer class="d-none d-sm-block" />
                <VBtn
                  color="primary"
                  size="large"
                  :disabled="!canGoNext"
                  block
                  class="flex-sm-grow-0"
                  min-width="140"
                  @click="goNext"
                >
                  다음
                  <VIcon end>
                    ri-arrow-right-line
                  </VIcon>
                </VBtn>
              </VCardActions>
            </VCard>
          </VWindowItem>

          <!-- ============================================= -->
          <!-- Step 2: Date + Time + Staff Selection -->
          <!-- ============================================= -->
          <VWindowItem :value="2">
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

                <template v-else>
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

                  <!-- Time Slots (shown after date selection) -->
                  <template v-if="selectedDate">
                    <VDivider class="my-5" />

                    <!-- Loading slots -->
                    <div v-if="slotsLoading" class="text-center py-6">
                      <VProgressCircular indeterminate color="primary" size="32" />
                      <p class="text-body-2 text-medium-emphasis mt-2">
                        시간 정보를 불러오는 중...
                      </p>
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
                        <VRow class="mb-2">
                          <VCol
                            v-for="slot in availableSlots"
                            :key="slot.startTime"
                            cols="6"
                            sm="4"
                          >
                            <VBtn
                              :color="selectedTime?.startTime === slot.startTime ? 'primary' : undefined"
                              :variant="selectedTime?.startTime === slot.startTime ? 'elevated' : 'outlined'"
                              block
                              class="time-slot-btn"
                              @click="selectTime(slot)"
                            >
                              {{ formatTimeKR(slot.startTime) }}
                            </VBtn>
                          </VCol>
                        </VRow>

                        <!-- 예상 종료 시간 표시 (시간 선택 후) -->
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

                          <div class="d-flex flex-wrap ga-3">
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
                              @click="selectStaff(null)"
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
                              @click="selectStaff(staff)"
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
                  </template>
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
                  @click="goPrev"
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
                  @click="goNext"
                >
                  다음
                  <VIcon end>
                    ri-arrow-right-line
                  </VIcon>
                </VBtn>
              </VCardActions>
            </VCard>
          </VWindowItem>

          <!-- ============================================= -->
          <!-- Step 3: Customer Info -->
          <!-- ============================================= -->
          <VWindowItem :value="3">
            <VCard rounded="lg" variant="outlined">
              <VCardTitle class="text-h6 font-weight-bold pa-5 pb-3">
                <VIcon start color="primary" size="22">
                  ri-user-line
                </VIcon>
                {{ isCustomerLoggedIn ? '고객 정보 확인' : '고객 정보' }}
              </VCardTitle>

              <VDivider />

              <VCardText class="pa-5">
                <!-- 고객 로그인 상태: 읽기 전용 정보 표시 -->
                <template v-if="isCustomerLoggedIn">
                  <VAlert
                    type="info"
                    variant="tonal"
                    class="mb-5"
                  >
                    <VIcon start size="18">
                      ri-kakao-talk-fill
                    </VIcon>
                    카카오 로그인으로 예약합니다. 아래 정보를 확인해주세요.
                  </VAlert>

                  <VRow>
                    <VCol cols="12" sm="6">
                      <VTextField
                        :model-value="customerAuthStore.customerName"
                        label="이름"
                        prepend-inner-icon="ri-user-3-line"
                        variant="outlined"
                        readonly
                        disabled
                      />
                    </VCol>

                    <VCol cols="12" sm="6">
                      <VTextField
                        :model-value="customerAuthStore.customerPhone || '미등록'"
                        label="전화번호"
                        prepend-inner-icon="ri-phone-line"
                        variant="outlined"
                        readonly
                        disabled
                        :error="!customerAuthStore.hasPhone"
                        :error-messages="!customerAuthStore.hasPhone ? '전화번호가 등록되지 않았습니다' : ''"
                      />
                    </VCol>

                    <VCol v-if="customerAuthStore.customerEmail" cols="12">
                      <VTextField
                        :model-value="customerAuthStore.customerEmail"
                        label="이메일"
                        prepend-inner-icon="ri-mail-line"
                        variant="outlined"
                        readonly
                        disabled
                      />
                    </VCol>

                    <!-- 전화번호 미등록 시 프로필 수정 안내 -->
                    <VCol v-if="!customerAuthStore.hasPhone" cols="12">
                      <VAlert
                        type="warning"
                        variant="tonal"
                      >
                        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                          <span>예약을 위해 전화번호 등록이 필요합니다.</span>
                          <VBtn
                            color="warning"
                            variant="elevated"
                            size="small"
                            @click="router.push('/booking/profile')"
                          >
                            <VIcon start size="16">
                              ri-edit-line
                            </VIcon>
                            프로필 수정
                          </VBtn>
                        </div>
                      </VAlert>
                    </VCol>

                    <VCol cols="12">
                      <VTextarea
                        v-model="customerForm.request"
                        label="요청사항 (선택)"
                        placeholder="예약 관련 요청사항을 입력해주세요"
                        :maxlength="500"
                        counter
                        rows="3"
                        variant="outlined"
                      />
                    </VCol>
                  </VRow>
                </template>

                <!-- 비회원 상태: 기존 폼 -->
                <VForm v-else ref="customerFormRef" v-model="customerFormValid">
                  <VRow>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="customerForm.name"
                        label="이름"
                        placeholder="홍길동"
                        :rules="nameRules"
                        prepend-inner-icon="ri-user-3-line"
                        variant="outlined"
                      />
                    </VCol>

                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="customerForm.phone"
                        label="전화번호"
                        placeholder="010-0000-0000"
                        :rules="phoneRules"
                        prepend-inner-icon="ri-phone-line"
                        variant="outlined"
                        maxlength="13"
                        @input="handlePhoneInput"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VTextField
                        v-model="customerForm.email"
                        label="이메일 (선택)"
                        placeholder="example@email.com"
                        :rules="emailRules"
                        prepend-inner-icon="ri-mail-line"
                        variant="outlined"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VTextarea
                        v-model="customerForm.request"
                        label="요청사항 (선택)"
                        placeholder="예약 관련 요청사항을 입력해주세요"
                        :maxlength="500"
                        counter
                        rows="3"
                        variant="outlined"
                      />
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>

              <VDivider />
              <VCardActions class="pa-5 d-flex flex-column flex-sm-row ga-3">
                <VBtn
                  variant="outlined"
                  size="large"
                  block
                  class="flex-sm-grow-0"
                  min-width="140"
                  @click="goPrev"
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
                  @click="goNext"
                >
                  다음
                  <VIcon end>
                    ri-arrow-right-line
                  </VIcon>
                </VBtn>
              </VCardActions>
            </VCard>
          </VWindowItem>

          <!-- ============================================= -->
          <!-- Step 4: Reservation Confirmation -->
          <!-- ============================================= -->
          <VWindowItem :value="4">
            <VCard rounded="lg" variant="outlined">
              <VCardTitle class="text-h6 font-weight-bold pa-5 pb-3">
                <VIcon start color="primary" size="22">
                  ri-file-list-3-line
                </VIcon>
                예약 확인
              </VCardTitle>

              <VDivider />

              <VCardText class="pa-5">
                <!-- Summary -->
                <VList lines="two" class="pa-0">
                  <!-- Shop Name -->
                  <VListItem class="px-0">
                    <template #prepend>
                      <VAvatar color="primary" variant="tonal" rounded>
                        <VIcon icon="ri-store-2-line" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-bold">
                      매장
                    </VListItemTitle>
                    <VListItemSubtitle>
                      {{ business?.name }}
                    </VListItemSubtitle>
                  </VListItem>

                  <VDivider />

                  <!-- Services -->
                  <VListItem class="px-0">
                    <template #prepend>
                      <VAvatar color="info" variant="tonal" rounded>
                        <VIcon icon="ri-service-line" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-bold">
                      서비스
                    </VListItemTitle>
                    <VListItemSubtitle>
                      <div v-for="service in selectedServices" :key="service.id" class="d-flex justify-space-between mt-1">
                        <span>{{ service.name }}</span>
                        <span class="text-body-2">{{ formatPrice(service.price) }}원</span>
                      </div>
                    </VListItemSubtitle>
                  </VListItem>

                  <VDivider />

                  <!-- Date & Time -->
                  <VListItem class="px-0">
                    <template #prepend>
                      <VAvatar color="success" variant="tonal" rounded>
                        <VIcon icon="ri-calendar-check-line" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-bold">
                      날짜 / 시간
                    </VListItemTitle>
                    <VListItemSubtitle>
                      {{ formatDate(selectedDate) }}
                      <br>
                      {{ timeRangeDisplay }}
                      <span v-if="durationBreakdown" class="text-caption text-medium-emphasis">
                        ({{ durationBreakdown }})
                      </span>
                    </VListItemSubtitle>
                  </VListItem>

                  <VDivider />

                  <!-- Staff -->
                  <VListItem class="px-0">
                    <template #prepend>
                      <VAvatar color="warning" variant="tonal" rounded>
                        <VIcon icon="ri-user-star-line" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-bold">
                      담당자
                    </VListItemTitle>
                    <VListItemSubtitle>
                      {{ selectedStaff?.name || '자동 배정' }}
                    </VListItemSubtitle>
                  </VListItem>

                  <VDivider />

                  <!-- Customer Info -->
                  <VListItem class="px-0">
                    <template #prepend>
                      <VAvatar color="secondary" variant="tonal" rounded>
                        <VIcon icon="ri-user-3-line" />
                      </VAvatar>
                    </template>
                    <VListItemTitle class="font-weight-bold">
                      고객 정보
                    </VListItemTitle>
                    <VListItemSubtitle>
                      <!-- 고객 로그인 상태 -->
                      <template v-if="isCustomerLoggedIn">
                        {{ customerAuthStore.customerName }} / {{ customerAuthStore.customerPhone }}
                        <template v-if="customerAuthStore.customerEmail">
                          <br>{{ customerAuthStore.customerEmail }}
                        </template>
                      </template>
                      <!-- 비회원 상태 -->
                      <template v-else>
                        {{ customerForm.name }} / {{ customerForm.phone }}
                        <template v-if="customerForm.email">
                          <br>{{ customerForm.email }}
                        </template>
                      </template>
                      <template v-if="customerForm.request">
                        <br>
                        <span class="text-caption">요청: {{ customerForm.request }}</span>
                      </template>
                    </VListItemSubtitle>
                  </VListItem>
                </VList>

                <!-- Total -->
                <VCard color="primary" variant="tonal" class="mt-5 pa-4" rounded="lg">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
                        총 금액
                      </div>
                      <div class="text-h5 font-weight-bold text-primary">
                        {{ formatPrice(totalPrice) }}원
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-body-2 text-medium-emphasis">
                        총 소요시간
                      </div>
                      <div class="text-h6 font-weight-medium">
                        {{ totalDuration }}분
                      </div>
                    </div>
                  </div>
                </VCard>
              </VCardText>

              <VDivider />
              <VCardActions class="pa-5 d-flex flex-column flex-sm-row ga-3">
                <VBtn
                  variant="outlined"
                  size="large"
                  block
                  class="flex-sm-grow-0"
                  min-width="140"
                  :disabled="submitting"
                  @click="goPrev"
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
                  block
                  class="flex-sm-grow-0"
                  min-width="180"
                  :loading="submitting"
                  @click="submitReservation"
                >
                  <VIcon start>
                    ri-check-double-line
                  </VIcon>
                  예약하기
                </VBtn>
              </VCardActions>
            </VCard>
          </VWindowItem>
        </VWindow>
      </template>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.reserve-page {
  min-block-size: 100vh;
  background: rgb(var(--v-theme-surface));
}

// Service card
.service-card {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-width: 2px !important;
  }
}

// Booking Stepper
.booking-stepper {
  :deep(.v-stepper-header) {
    box-shadow: none;
  }
}

// Time slot
.time-slot-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
}

// Staff card
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
