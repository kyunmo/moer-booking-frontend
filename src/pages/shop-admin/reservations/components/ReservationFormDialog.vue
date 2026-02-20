<template>
  <VDialog
    :model-value="modelValue"
    max-width="960"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-calendar-check-line" size="24" class="me-3" />
        <span>{{ isEditMode ? '예약 수정' : '예약 등록' }}</span>

        <VSpacer />

        <VBtn
          icon
          variant="text"
          size="small"
          @click="handleClose"
        >
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText style="max-block-size: 80vh;">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 좌측 패널: 폼 -->
            <VCol cols="12" md="7">
              <!-- 에러 메시지 - 폼 최상단 -->
              <VAlert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </VAlert>

              <!-- 고객 정보 -->
              <div class="text-subtitle-2 text-medium-emphasis mb-2">
                <VIcon icon="ri-user-line" size="18" class="me-1" />
                고객 정보
              </div>

              <VTabs
                v-model="customerType"
                density="compact"
                class="mb-3"
              >
                <VTab value="existing">
                  <VIcon icon="ri-user-search-line" size="18" start />
                  기존 고객
                </VTab>
                <VTab value="new">
                  <VIcon icon="ri-user-add-line" size="18" start />
                  신규 고객
                </VTab>
              </VTabs>

              <VWindow v-model="customerType" class="mb-2">
                <VWindowItem value="existing">
                  <VAutocomplete
                    v-model="form.customerId"
                    label="고객 선택 *"
                    placeholder="고객을 검색하세요"
                    prepend-inner-icon="ri-user-search-line"
                    :items="customerOptions"
                    item-title="nameWithPhone"
                    item-value="id"
                    :rules="customerType === 'existing' ? [customerRequired] : []"
                    clearable
                  >
                    <template #item="{ props: itemProps, item }">
                      <VListItem v-bind="itemProps">
                        <template #prepend>
                          <VAvatar color="primary" size="32">
                            {{ getInitial(item.raw.name) }}
                          </VAvatar>
                        </template>
                        <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                        <VListItemSubtitle>{{ item.raw.phone }}</VListItemSubtitle>
                      </VListItem>
                    </template>
                  </VAutocomplete>
                </VWindowItem>

                <VWindowItem value="new">
                  <VRow dense>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="form.customerName"
                        label="고객 이름 *"
                        placeholder="홍길동"
                        prepend-inner-icon="ri-user-add-line"
                        :rules="customerType === 'new' ? [required] : []"
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="form.customerPhone"
                        label="전화번호 *"
                        placeholder="010-1234-5678"
                        prepend-inner-icon="ri-phone-line"
                        :rules="customerType === 'new' ? [required, phoneRule] : []"
                        persistent-hint
                        hint="연락처가 같은 기존 고객이 있으면 자동으로 연결됩니다"
                      />
                    </VCol>
                  </VRow>
                </VWindowItem>
              </VWindow>

              <!-- 예약 일시 -->
              <div class="text-subtitle-2 text-medium-emphasis mb-2 mt-2">
                <VIcon icon="ri-calendar-line" size="18" class="me-1" />
                예약 일시
              </div>

              <VRow dense>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="form.reservationDate"
                    label="예약 날짜 *"
                    type="date"
                    prepend-inner-icon="ri-calendar-event-line"
                    :rules="[required]"
                  />
                </VCol>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="form.startTime"
                    label="시작 시간 *"
                    type="time"
                    prepend-inner-icon="ri-time-line"
                    :rules="[required]"
                  />
                </VCol>
              </VRow>

              <!-- 서비스 선택 -->
              <div class="text-subtitle-2 text-medium-emphasis mb-2 mt-2">
                <VIcon :icon="serviceIcon" size="18" class="me-1" />
                서비스 선택
              </div>

              <VAutocomplete
                v-model="form.serviceIds"
                label="서비스 선택 *"
                placeholder="서비스를 선택하세요"
                :prepend-inner-icon="serviceIconLine"
                :items="serviceOptions"
                item-title="nameWithPrice"
                item-value="id"
                :rules="[servicesRequired]"
                multiple
                chips
                closable-chips
              >
                <template #chip="{ props: chipProps, item }">
                  <VChip v-bind="chipProps">
                    {{ item.raw.name }}
                    <span class="text-xs ms-1">({{ item.raw.duration }}분)</span>
                  </VChip>
                </template>
              </VAutocomplete>

              <!-- 담당 직원 -->
              <div class="text-subtitle-2 text-medium-emphasis mb-2 mt-2">
                <VIcon icon="ri-user-star-line" size="18" class="me-1" />
                담당 직원
              </div>

              <VSelect
                v-model="form.staffId"
                label="담당 직원"
                placeholder="선택하세요 (선택사항)"
                prepend-inner-icon="ri-user-line"
                :items="staffOptions"
                item-title="name"
                item-value="id"
                clearable
                hint="지정하지 않으면 나중에 배정할 수 있습니다"
                persistent-hint
              >
                <template #item="{ props: itemProps, item }">
                  <VListItem v-bind="itemProps">
                    <template #prepend>
                      <VAvatar color="info" size="32">
                        {{ getInitial(item.raw.name) }}
                      </VAvatar>
                    </template>
                    <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                    <VListItemSubtitle>{{ item.raw.position }}</VListItemSubtitle>
                  </VListItem>
                </template>
              </VSelect>

              <!-- 시간 충돌 경고 -->
              <VAlert
                v-if="conflictWarning && !conflictWarning.available"
                type="warning"
                variant="tonal"
                class="mt-2 mb-2"
                density="compact"
              >
                <div class="text-subtitle-2 mb-1">
                  해당 시간에 이미 예약이 있습니다
                </div>
                <div
                  v-for="c in conflictWarning.conflicts"
                  :key="c.reservationId"
                  class="text-body-2"
                >
                  {{ c.customerName }} ({{ c.startTime }}~{{ c.endTime }}, {{ c.serviceName }})
                </div>
              </VAlert>

              <!-- 가용 확인 중 표시 -->
              <div
                v-if="availabilityChecking"
                class="d-flex align-center gap-2 mt-2 mb-2"
              >
                <VProgressCircular
                  indeterminate
                  size="16"
                  width="2"
                  color="primary"
                />
                <span class="text-caption text-medium-emphasis">시간 가용성 확인 중...</span>
              </div>

              <!-- 메모 -->
              <div class="text-subtitle-2 text-medium-emphasis mb-2 mt-4">
                <VIcon icon="ri-file-text-line" size="18" class="me-1" />
                메모
              </div>

              <VTextarea
                v-model="form.customerMemo"
                label="고객 요청사항"
                placeholder="고객의 요청사항을 입력하세요"
                prepend-inner-icon="ri-chat-3-line"
                rows="2"
                counter
                maxlength="500"
                class="mb-2"
              />

              <VTextarea
                v-model="form.staffMemo"
                label="직원 메모"
                placeholder="직원 전달사항을 입력하세요"
                prepend-inner-icon="ri-sticky-note-line"
                rows="2"
                counter
                maxlength="500"
              />
            </VCol>

            <!-- 우측 패널: 예약 요약 -->
            <VCol cols="12" md="5">
              <VCard
                variant="tonal"
                color="primary"
                class="sticky-summary"
              >
                <VCardTitle class="text-subtitle-1 font-weight-bold py-3">
                  <VIcon icon="ri-file-list-3-line" size="20" class="me-2" />
                  예약 요약
                </VCardTitle>

                <VDivider />

                <VCardText class="d-flex flex-column gap-3 pa-4">
                  <!-- 고객 정보 -->
                  <div>
                    <p class="text-caption text-disabled mb-1">고객</p>
                    <p class="text-body-2 font-weight-medium mb-0">
                      {{ summaryCustomerName || '-' }}
                    </p>
                    <p v-if="summaryCustomerPhone" class="text-caption text-medium-emphasis mb-0">
                      {{ summaryCustomerPhone }}
                    </p>
                  </div>

                  <!-- 일시 -->
                  <div>
                    <p class="text-caption text-disabled mb-1">일시</p>
                    <p class="text-body-2 font-weight-medium mb-0">
                      {{ formatSummaryDate() }}
                    </p>
                    <p v-if="timeRangeDisplay" class="text-caption text-medium-emphasis mb-0">
                      {{ timeRangeDisplay }}
                    </p>
                  </div>

                  <!-- 서비스 -->
                  <div>
                    <p class="text-caption text-disabled mb-1">서비스</p>
                    <template v-if="selectedServices.length > 0">
                      <div
                        v-for="svc in selectedServices"
                        :key="svc.id"
                        class="d-flex justify-space-between align-center"
                      >
                        <span class="text-body-2">{{ svc.name }}</span>
                        <span class="text-caption text-medium-emphasis">
                          {{ svc.price.toLocaleString() }}원 / {{ svc.duration }}분
                        </span>
                      </div>
                    </template>
                    <p v-else class="text-caption text-disabled mb-0">
                      선택된 서비스 없음
                    </p>
                  </div>

                  <VDivider />

                  <!-- 총액 -->
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-body-2 font-weight-bold">총 금액</span>
                    <span class="text-subtitle-1 font-weight-bold">
                      {{ totalPrice.toLocaleString() }}원
                    </span>
                  </div>

                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption text-medium-emphasis">소요시간</span>
                    <span class="text-body-2 font-weight-medium">
                      {{ totalDuration }}분
                    </span>
                  </div>
                  <p v-if="durationBreakdownText" class="text-caption text-medium-emphasis mb-0">
                    {{ durationBreakdownText }}
                  </p>

                  <!-- 담당 직원 -->
                  <div>
                    <p class="text-caption text-disabled mb-1">담당 직원</p>
                    <p class="text-body-2 font-weight-medium mb-0">
                      {{ selectedStaffName || '미지정' }}
                    </p>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <!-- 액션 버튼 -->
      <VCardActions class="pa-4">
        <VSpacer />

        <VBtn
          variant="outlined"
          @click="handleClose"
        >
          취소
        </VBtn>

        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? '수정' : '등록' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useBusinessIcon } from '@/composables/useBusinessIcon'
import { useSnackbar } from '@/composables/useSnackbar'
import { useCustomerStore } from '@/stores/customer'
import { useReservationStore } from '@/stores/reservation'
import { useServiceStore } from '@/stores/service'
import { useStaffStore } from '@/stores/staff'
import { formatTimeKR, formatTimeRange, calculateEndTime, formatDurationBreakdown } from '@/utils/dateFormat'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  reservation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { serviceIcon, serviceIconLine } = useBusinessIcon()
const { success: showSuccess } = useSnackbar()
const reservationStore = useReservationStore()
const customerStore = useCustomerStore()
const staffStore = useStaffStore()
const serviceStore = useServiceStore()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const customerType = ref('existing')
const availabilityChecking = ref(false)
const conflictWarning = ref(null)

// 수정 모드 여부
const isEditMode = computed(() => !!props.reservation?.id)

// 고객 옵션
const customerOptions = computed(() => {
  return customerStore.customers.map(c => ({
    ...c,
    nameWithPhone: `${c.name} (${c.phone})`,
  }))
})

// 직원 옵션
const staffOptions = computed(() => {
  return staffStore.activeStaffs
})

// 서비스 옵션
const serviceOptions = computed(() => {
  return serviceStore.activeServices.map(s => ({
    ...s,
    nameWithPrice: `${s.name} - ${s.price.toLocaleString()}원 (${s.duration}분)`,
  }))
})

// 폼 데이터
const form = ref({
  customerId: null,
  customerName: '',
  customerPhone: '',
  reservationDate: '',
  startTime: '10:00',
  serviceIds: [],
  staffId: null,
  customerMemo: '',
  staffMemo: '',
})

// === 요약 패널용 computed ===

const summaryCustomerName = computed(() => {
  if (customerType.value === 'existing' && form.value.customerId) {
    const customer = customerStore.customers.find(c => c.id === form.value.customerId)

    return customer?.name || ''
  }

  return form.value.customerName || ''
})

const summaryCustomerPhone = computed(() => {
  if (customerType.value === 'existing' && form.value.customerId) {
    const customer = customerStore.customers.find(c => c.id === form.value.customerId)

    return customer?.phone || ''
  }

  return form.value.customerPhone || ''
})

const selectedServices = computed(() => {
  if (!form.value.serviceIds || form.value.serviceIds.length === 0) return []

  return form.value.serviceIds
    .map(id => serviceStore.services.find(s => s.id === id))
    .filter(Boolean)
})

const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + (s.price || 0), 0)
})

const totalDuration = computed(() => {
  return selectedServices.value.reduce((sum, s) => sum + (s.duration || 0), 0)
})

const selectedStaffName = computed(() => {
  if (!form.value.staffId) return ''
  const staff = staffStore.staffs.find(s => s.id === form.value.staffId)

  return staff?.name || ''
})

// 예상 종료 시간 계산
const estimatedEndTime = computed(() => {
  if (!form.value.startTime || !totalDuration.value) return ''
  return calculateEndTime(form.value.startTime, totalDuration.value)
})

// 시간 범위 표시 (오전/오후)
const timeRangeDisplay = computed(() => {
  if (!form.value.startTime || !estimatedEndTime.value) return ''
  return formatTimeRange(form.value.startTime, estimatedEndTime.value)
})

// 서비스별 소요시간 내역
const durationBreakdownText = computed(() => {
  return formatDurationBreakdown(selectedServices.value)
})

// 요약 날짜 포맷
function formatSummaryDate() {
  if (!form.value.reservationDate) return '-'

  const days = ['일', '월', '화', '수', '목', '금', '토']
  const date = new Date(form.value.reservationDate + 'T00:00:00')
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const dayName = days[date.getDay()]
  const time = form.value.startTime ? formatTimeKR(form.value.startTime) : ''

  return `${y}.${m}.${d} (${dayName}) ${time}`
}

// === 시간 충돌 검증 ===

let availabilityTimer = null

watch(
  [() => form.value.staffId, () => form.value.reservationDate, () => form.value.startTime, estimatedEndTime],
  () => {
    conflictWarning.value = null
    clearTimeout(availabilityTimer)
    if (!form.value.staffId || !form.value.reservationDate || !form.value.startTime || !estimatedEndTime.value) return
    availabilityTimer = setTimeout(() => checkTimeConflict(), 500)
  },
)

async function checkTimeConflict() {
  availabilityChecking.value = true
  try {
    const params = {
      staffId: form.value.staffId,
      date: form.value.reservationDate,
      startTime: form.value.startTime,
      endTime: estimatedEndTime.value,
    }

    if (isEditMode.value) {
      params.excludeReservationId = props.reservation.id
    }

    const result = await reservationStore.checkAvailability(params)

    conflictWarning.value = result
  }
  catch {
    // 가용성 확인 실패는 무시 (제출 시 서버에서 검증)
  }
  finally {
    availabilityChecking.value = false
  }
}

// === Watchers ===

// customerType 전환 시 반대 모드 필드 초기화
watch(customerType, newType => {
  if (newType === 'existing') {
    form.value.customerName = ''
    form.value.customerPhone = ''
  }
  else {
    form.value.customerId = null
  }
})

// 다이얼로그 열릴 때 폼 초기화
watch(() => props.modelValue, visible => {
  if (!visible) return

  const reservation = props.reservation
  if (reservation?.id) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      customerId: reservation.customerId,
      customerName: '',
      customerPhone: '',
      reservationDate: reservation.reservationDate,
      startTime: reservation.startTime,
      serviceIds: reservation.serviceIds || [],
      staffId: reservation.staffId,
      customerMemo: reservation.customerMemo || '',
      staffMemo: reservation.staffMemo || '',
    }

    // 수정 모드에서 customerType 설정
    customerType.value = reservation.customerId ? 'existing' : 'new'
  } else {
    // 등록 모드: 항상 초기화 후 캘린더 날짜 적용
    resetForm()
    if (reservation?.reservationDate) {
      form.value.reservationDate = reservation.reservationDate
      form.value.startTime = reservation.startTime || '10:00'
    }
  }
})

// Validation Rules
const required = value => !!value || '필수 입력 항목입니다.'

const customerRequired = value => {
  if (customerType.value === 'existing') {
    return !!value || '고객을 선택하세요.'
  }

  return true
}

const servicesRequired = value => {
  if (!value || value.length === 0) return '서비스를 최소 1개 이상 선택하세요.'

  return true
}

const phoneRule = value => {
  if (!value) return true
  const pattern = /^010-\d{4}-\d{4}$/

  return pattern.test(value) || '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'
}

// 이니셜
function getInitial(name) {
  if (!name) return '?'

  return name.charAt(0)
}

// 폼 초기화
function resetForm() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  form.value = {
    customerId: null,
    customerName: '',
    customerPhone: '',
    reservationDate: todayStr,
    startTime: '10:00',
    serviceIds: [],
    staffId: null,
    customerMemo: '',
    staffMemo: '',
  }
  customerType.value = 'existing'
  errorMessage.value = ''
  conflictWarning.value = null
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// 닫기
function handleClose() {
  resetForm()
  emit('update:modelValue', false)
}

// 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  errorMessage.value = ''
  loading.value = true

  try {
    // 예약 데이터 준비
    const reservationData = {
      customerId: form.value.customerId || null,
      customerName: form.value.customerName || null,
      customerPhone: form.value.customerPhone || null,
      reservationDate: form.value.reservationDate,
      startTime: form.value.startTime,
      serviceIds: form.value.serviceIds,
      staffId: form.value.staffId || null,
      customerMemo: form.value.customerMemo || null,
      staffMemo: form.value.staffMemo || null,
    }

    if (isEditMode.value) {
      await reservationStore.updateReservation(props.reservation.id, reservationData)
      showSuccess('예약이 수정되었습니다.')
    } else {
      await reservationStore.createReservation(reservationData)
      showSuccess('예약이 등록되었습니다.')
    }

    emit('saved')
    handleClose()
  }
  catch (error) {
    if (error.code === 'C001') {
      errorMessage.value = '해당 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.'
    }
    else {
      errorMessage.value = error.details || error.message || '저장에 실패했습니다.'
    }
  }
  finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  if (customerStore.customers.length === 0) {
    customerStore.fetchCustomers()
  }
  if (staffStore.staffs.length === 0) {
    staffStore.fetchStaffs()
  }
  if (serviceStore.services.length === 0) {
    serviceStore.fetchServices()
  }
})
</script>

<style scoped>
.sticky-summary {
  position: sticky;
  inset-block-start: 0;
}
</style>
