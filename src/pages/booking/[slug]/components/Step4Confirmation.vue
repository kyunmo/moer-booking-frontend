<template>
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
            <!-- Logged-in customer -->
            <template v-if="isCustomerLoggedIn">
              {{ customerAuthStore.customerName }} / {{ customerAuthStore.customerPhone }}
              <template v-if="customerAuthStore.customerEmail">
                <br>{{ customerAuthStore.customerEmail }}
              </template>
            </template>
            <!-- Guest -->
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
        block
        class="flex-sm-grow-0"
        min-width="180"
        :loading="submitting"
        aria-label="예약하기"
        @click="$emit('submit')"
      >
        <VIcon start>
          ri-check-double-line
        </VIcon>
        예약하기
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { formatTimeRange, calculateEndTime, formatDurationBreakdown } from '@/utils/dateFormat'

const props = defineProps({
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['prev', 'submit'])

const bookingStore = useBookingStore()
const customerAuthStore = useCustomerAuthStore()

const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)
const business = computed(() => bookingStore.business)
const selectedServices = computed(() => bookingStore.selectedServices)
const selectedDate = computed(() => bookingStore.selectedDate)
const selectedTime = computed(() => bookingStore.selectedTime)
const selectedStaff = computed(() => bookingStore.selectedStaff)
const customerForm = computed(() => bookingStore.customerForm)
const totalPrice = computed(() => bookingStore.totalPrice)
const totalDuration = computed(() => bookingStore.totalDuration)

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

function formatPrice(price) {
  return (price || 0).toLocaleString()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayOfWeek})`
}
</script>
