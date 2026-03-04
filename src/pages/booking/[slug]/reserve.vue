<route lang="yaml">
meta:
  layout: public
  public: true
  title: 예약하기 - 모에르(MOER)
</route>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import customerApi from '@/api/customer'
import { useSnackbar } from '@/composables/useSnackbar'
import { formatTimeRange, calculateEndTime } from '@/utils/dateFormat'
import Step1ServiceSelection from './components/Step1ServiceSelection.vue'
import Step2DateTimeSelection from './components/Step2DateTimeSelection.vue'
import Step3CustomerInfo from './components/Step3CustomerInfo.vue'
import Step4Confirmation from './components/Step4Confirmation.vue'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const customerAuthStore = useCustomerAuthStore()
const { error: showError, success: showSuccess } = useSnackbar()

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

// Step 2: loading state
const datesLoading = ref(false)
const datesError = ref(false)
const slotsLoading = ref(false)
const slotsError = ref(false)

// Step 2 component ref
const step2Ref = ref(null)

// =====================================================
// Computed: Store
// =====================================================
const step = computed({
  get: () => bookingStore.step,
  set: val => { bookingStore.step = val },
})

const business = computed(() => bookingStore.business)
const selectedServices = computed(() => bookingStore.selectedServices)
const selectedDate = computed(() => bookingStore.selectedDate)
const selectedTime = computed(() => bookingStore.selectedTime)
const selectedStaff = computed(() => bookingStore.selectedStaff)
const customerForm = computed(() => bookingStore.customerForm)
const totalPrice = computed(() => bookingStore.totalPrice)
const totalDuration = computed(() => bookingStore.totalDuration)
const reservationResult = computed(() => bookingStore.reservationResult)

const estimatedEndTime = computed(() => {
  if (!selectedTime.value?.startTime || !totalDuration.value) return ''
  return calculateEndTime(selectedTime.value.startTime, totalDuration.value)
})

const timeRangeDisplay = computed(() => {
  if (!selectedTime.value?.startTime || !estimatedEndTime.value) return ''
  return formatTimeRange(selectedTime.value.startTime, estimatedEndTime.value)
})

// =====================================================
// Step 2: Data Loading (managed by parent)
// =====================================================
async function loadAvailableDates(monthKeyOverride) {
  if (!selectedServices.value.length) return
  const mk = monthKeyOverride || step2Ref.value?.monthKey
  datesLoading.value = true
  datesError.value = false
  try {
    await bookingStore.fetchAvailableDates(slug.value, {
      month: mk,
      serviceId: selectedServices.value[0].id,
    })
  } catch (err) {
    datesError.value = true
    showError('예약 가능 날짜를 불러오지 못했습니다')
  } finally {
    datesLoading.value = false
  }
}

async function loadAvailableSlots() {
  if (!selectedDate.value || !selectedServices.value.length) return
  slotsLoading.value = true
  slotsError.value = false
  try {
    await bookingStore.fetchAvailableSlots(slug.value, {
      date: selectedDate.value,
      serviceId: selectedServices.value[0].id,
    })
  } catch (err) {
    slotsError.value = true
    showError('예약 가능 시간을 불러오지 못했습니다')
  } finally {
    slotsLoading.value = false
  }
}

function handleMonthChange(monthKey) {
  if (step.value === 2) {
    loadAvailableDates(monthKey)
  }
}

// =====================================================
// Step Navigation
// =====================================================
async function goNext() {
  step.value = Math.min(step.value + 1, 4)

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

function goToReview() {
  router.push(`/booking/${slug.value}/review`)
}

function goToLogin() {
  router.push(`/booking/login?redirect=/booking/${slug.value}`)
}

function shareReservation() {
  const url = window.location.origin + `/booking/reservation`
  navigator.clipboard.writeText(url)
  showSuccess('예약 조회 링크가 복사되었습니다')
}

// =====================================================
// Profile Navigation with State Preservation
// =====================================================
const navigatingToProfile = ref(false)

function goToProfileWithSave() {
  bookingStore.saveBookingFlowToSession()
  navigatingToProfile.value = true
  router.push(`/booking/profile?redirect=/booking/${slug.value}/reserve`)
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
}

// Rebook: auto-select staff when time slot staffs are available
const currentSlotStaffs = computed(() => {
  if (!selectedTime.value) return []
  return selectedTime.value.availableStaffs || []
})

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

    const restored = bookingStore.restoreBookingFlowFromSession()
    if (restored) {
      showSuccess('예약 정보가 복원되었습니다')
    }
    else if (rebookMode.value && rebookServiceIds.value.length > 0) {
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
  if (!navigatingToProfile.value) {
    bookingStore.resetBookingFlow()
  }
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
            aria-label="예약번호 복사"
            tabindex="0"
            @click="copyReservationNumber"
            @keydown.enter="copyReservationNumber"
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

          <!-- Primary Actions -->
          <div class="d-flex flex-column flex-sm-row justify-center ga-3">
            <VBtn
              color="primary"
              size="large"
              variant="elevated"
              min-width="180"
              aria-label="예약 확인하러 가기"
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
              aria-label="매장 페이지로 돌아가기"
              @click="goToShop"
            >
              <VIcon start>
                ri-store-2-line
              </VIcon>
              매장으로 돌아가기
            </VBtn>
          </div>

          <VDivider class="my-6" />

          <!-- Secondary CTAs -->
          <div class="d-flex flex-column flex-sm-row justify-center ga-3">
            <VBtn
              v-if="isCustomerLoggedIn"
              color="warning"
              variant="tonal"
              aria-label="리뷰 작성하기"
              @click="goToReview"
            >
              <VIcon start>
                ri-star-line
              </VIcon>
              리뷰 작성하기
            </VBtn>

            <VBtn
              v-if="!isCustomerLoggedIn"
              color="info"
              variant="tonal"
              aria-label="회원가입 페이지로 이동"
              @click="goToLogin"
            >
              <VIcon start>
                ri-user-add-line
              </VIcon>
              회원가입하면 더 편하게!
            </VBtn>

            <VBtn
              variant="tonal"
              aria-label="예약 조회 링크 복사"
              @click="shareReservation"
            >
              <VIcon start>
                ri-share-line
              </VIcon>
              예약 조회 링크 복사
            </VBtn>
          </div>

          <!-- Notification info -->
          <VAlert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-6 text-start"
            style="max-inline-size: 400px; margin-inline: auto;"
          >
            <div class="text-body-2">
              <VIcon icon="ri-notification-3-line" size="16" class="me-1" />
              예약 확인 알림이 등록된 연락처로 발송됩니다.
            </div>
          </VAlert>
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
            aria-label="예약 진행률"
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
          <!-- Step 1: Service Selection -->
          <VWindowItem :value="1">
            <Step1ServiceSelection
              :rebook-mode="rebookMode"
              @next="goNext"
            />
          </VWindowItem>

          <!-- Step 2: Date + Time + Staff -->
          <VWindowItem :value="2">
            <Step2DateTimeSelection
              ref="step2Ref"
              :slug="slug"
              :dates-loading="datesLoading"
              :dates-error="datesError"
              :slots-loading="slotsLoading"
              :slots-error="slotsError"
              @next="goNext"
              @prev="goPrev"
              @reload-dates="loadAvailableDates"
              @reload-slots="loadAvailableSlots"
              @load-dates="loadAvailableDates"
              @load-slots="loadAvailableSlots"
              @month-change="handleMonthChange"
            />
          </VWindowItem>

          <!-- Step 3: Customer Info -->
          <VWindowItem :value="3">
            <Step3CustomerInfo
              @next="goNext"
              @prev="goPrev"
              @go-to-profile="goToProfileWithSave"
            />
          </VWindowItem>

          <!-- Step 4: Confirmation -->
          <VWindowItem :value="4">
            <Step4Confirmation
              :submitting="submitting"
              @prev="goPrev"
              @submit="submitReservation"
            />
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

// Booking Stepper
.booking-stepper {
  :deep(.v-stepper-header) {
    box-shadow: none;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
