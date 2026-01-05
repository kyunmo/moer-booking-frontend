<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
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

      <VCardText style="max-block-size: 600px;">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 고객 선택 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-user-line" class="me-2" />
                고객 정보
              </h6>
            </VCol>

            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="form.customerId"
                label="고객 선택 *"
                placeholder="고객을 검색하세요"
                prepend-inner-icon="ri-user-search-line"
                :items="customerOptions"
                item-title="nameWithPhone"
                item-value="id"
                :rules="[customerRequired]"
                clearable
                @update:model-value="handleCustomerSelect"
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
            </VCol>

            <!-- 또는 신규 고객 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.customerName"
                label="신규 고객 이름"
                placeholder="홍길동"
                prepend-inner-icon="ri-user-add-line"
                :disabled="!!form.customerId"
                hint="기존 고객이 없으면 이름을 입력하세요"
                persistent-hint
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.customerPhone"
                label="신규 고객 전화번호"
                placeholder="010-1234-5678"
                prepend-inner-icon="ri-phone-line"
                :disabled="!!form.customerId"
                :rules="form.customerId ? [] : [phoneRule]"
              />
            </VCol>

            <!-- 예약 일시 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3 mt-4">
                <VIcon icon="ri-calendar-line" class="me-2" />
                예약 일시
              </h6>
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.reservationDate"
                label="예약 날짜 *"
                type="date"
                prepend-inner-icon="ri-calendar-event-line"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.startTime"
                label="시작 시간 *"
                type="time"
                prepend-inner-icon="ri-time-line"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 서비스 선택 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3 mt-4">
                <VIcon icon="ri-scissors-cut-line" class="me-2" />
                서비스 선택
              </h6>
            </VCol>

            <VCol cols="12">
              <VAutocomplete
                v-model="form.serviceIds"
                label="서비스 선택 *"
                placeholder="서비스를 선택하세요"
                prepend-inner-icon="ri-scissors-line"
                :items="serviceOptions"
                item-title="nameWithPrice"
                item-value="id"
                :rules="[servicesRequired]"
                multiple
                chips
                closable-chips
                required
              >
                <template #chip="{ props: chipProps, item }">
                  <VChip v-bind="chipProps">
                    {{ item.raw.name }}
                    <span class="text-xs ms-1">({{ item.raw.duration }}분)</span>
                  </VChip>
                </template>
              </VAutocomplete>
            </VCol>

            <!-- 담당 직원 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3 mt-4">
                <VIcon icon="ri-user-star-line" class="me-2" />
                담당 직원
              </h6>
            </VCol>

            <VCol cols="12" md="6">
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

                <!-- clearable 아이콘으로 "상관없음" 처리 -->
                <template #append>
                  <VTooltip location="top">
                    <template #activator="{ props }">
                      <VIcon
                        v-bind="props"
                        icon="ri-information-line"
                        size="20"
                        class="text-disabled"
                      />
                    </template>
                    직원을 선택하지 않으면 관리자가 나중에 배정할 수 있습니다
                  </VTooltip>
                </template>
              </VSelect>
            </VCol>

            <!-- 예상 금액 표시 -->
            <VCol cols="12" md="6">
              <VCard variant="tonal" color="success">
                <VCardText>
                  <p class="text-xs text-disabled mb-1">예상 금액</p>
                  <h5 class="text-h5">{{ calculateTotalPrice().toLocaleString() }}원</h5>
                  <p class="text-xs text-disabled mb-0">
                    예상 시간: {{ calculateTotalDuration() }}분
                  </p>
                </VCardText>
              </VCard>
            </VCol>

            <!-- 메모 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3 mt-4">
                <VIcon icon="ri-file-text-line" class="me-2" />
                메모
              </h6>
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="form.customerMemo"
                label="고객 요청사항"
                placeholder="고객의 요청사항을 입력하세요"
                prepend-inner-icon="ri-chat-3-line"
                rows="2"
                counter
                maxlength="500"
              />
            </VCol>

            <VCol cols="12">
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

            <!-- 에러 메시지 -->
            <VCol v-if="errorMessage" cols="12">
              <VAlert
                type="error"
                variant="tonal"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </VAlert>
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
import { useCustomerStore } from '@/stores/customer'
import { useReservationStore } from '@/stores/reservation'
import { useServiceStore } from '@/stores/service'
import { useStaffStore } from '@/stores/staff'
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

const reservationStore = useReservationStore()
const customerStore = useCustomerStore()
const staffStore = useStaffStore()
const serviceStore = useServiceStore()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')

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

// reservation prop 변경 시 폼 초기화
watch(() => props.reservation, (newReservation) => {
  if (newReservation?.id) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      customerId: newReservation.customerId,
      customerName: '',
      customerPhone: '',
      reservationDate: newReservation.reservationDate,
      startTime: newReservation.startTime,
      serviceIds: newReservation.serviceIds || [],
      staffId: newReservation.staffId,
      customerMemo: newReservation.customerMemo || '',
      staffMemo: newReservation.staffMemo || '',
    }
  } else if (newReservation?.reservationDate) {
    // 캘린더에서 날짜 클릭한 경우
    form.value.reservationDate = newReservation.reservationDate
    form.value.startTime = newReservation.startTime || '10:00'
  } else {
    // 등록 모드: 초기화
    resetForm()
  }
}, { immediate: true })

// Validation Rules
const required = value => !!value || '필수 입력 항목입니다.'

const customerRequired = value => {
  if (value) return true
  if (form.value.customerName && form.value.customerPhone) return true
  return '고객을 선택하거나 신규 고객 정보를 입력하세요.'
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

// 고객 선택 시
function handleCustomerSelect(customerId) {
  if (customerId) {
    // 기존 고객 선택 시 신규 고객 입력 필드 초기화
    form.value.customerName = ''
    form.value.customerPhone = ''
  }
}

// 총 금액 계산
function calculateTotalPrice() {
  if (!form.value.serviceIds || form.value.serviceIds.length === 0) return 0
  
  return form.value.serviceIds.reduce((sum, serviceId) => {
    const service = serviceStore.services.find(s => s.id === serviceId)
    return sum + (service?.price || 0)
  }, 0)
}

// 총 소요시간 계산
function calculateTotalDuration() {
  if (!form.value.serviceIds || form.value.serviceIds.length === 0) return 0
  
  return form.value.serviceIds.reduce((sum, serviceId) => {
    const service = serviceStore.services.find(s => s.id === serviceId)
    return sum + (service?.duration || 0)
  }, 0)
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
  errorMessage.value = ''
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
      // 수정
      await reservationStore.updateReservation(props.reservation.id, reservationData)
    } else {
      // 등록
      await reservationStore.createReservation(reservationData)
    }

    emit('saved')
    handleClose()
  }
  catch (error) {
    console.error('예약 저장 실패:', error)
    errorMessage.value = error.response?.data?.message || '저장에 실패했습니다.'
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
