<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon
          :icon="isEditMode ? 'ri-edit-line' : 'ri-add-line'"
          size="24"
          class="me-2"
        />
        <span>{{ isEditMode ? '예약 수정' : '예약 등록' }}</span>

        <VSpacer />

        <VBtn
          icon="ri-close-line"
          variant="text"
          @click="closeDialog"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.reservationDate"
                label="예약 날짜"
                type="date"
                prepend-inner-icon="ri-calendar-line"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model="form.startTime"
                label="시작 시간"
                type="time"
                prepend-inner-icon="ri-time-line"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model="form.endTime"
                label="종료 시간"
                type="time"
                prepend-inner-icon="ri-time-line"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.customerName"
                label="고객명"
                prepend-inner-icon="ri-user-line"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.customerPhone"
                label="전화번호"
                prepend-inner-icon="ri-phone-line"
                placeholder="010-1234-5678"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.staffId"
                label="담당 디자이너"
                :items="staffOptions"
                item-title="name"
                item-value="id"
                prepend-inner-icon="ri-user-star-line"
                clearable
              />
            </VCol>

            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="form.serviceIds"
                label="서비스 선택"
                :items="serviceOptions"
                item-title="name"
                item-value="id"
                :prepend-inner-icon="serviceIconLine"
                multiple
                chips
                closable-chips
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.totalPrice"
                label="총 금액"
                type="number"
                prepend-inner-icon="ri-money-dollar-circle-line"
                suffix="원"
              />
            </VCol>

            <VCol v-if="isEditMode" cols="12" md="6">
              <VSelect
                v-model="form.status"
                label="예약 상태"
                :items="statusOptions"
                prepend-inner-icon="ri-refresh-line"
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="form.customerRequest"
                label="고객 요청사항"
                prepend-inner-icon="ri-message-2-line"
                rows="2"
                auto-grow
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="form.adminMemo"
                label="관리자 메모"
                prepend-inner-icon="ri-file-text-line"
                rows="2"
                auto-grow
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          color="secondary"
          variant="outlined"
          @click="closeDialog"
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
import { useReservationStore } from '@/stores/reservation'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  reservation: Object,
  selectedDate: String,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { serviceIconLine } = useBusinessIcon()
const reservationStore = useReservationStore()

const formRef = ref(null)
const loading = ref(false)

const isEditMode = computed(() => !!props.reservation)

const form = ref({
  reservationDate: '',
  startTime: '',
  endTime: '',
  customerName: '',
  customerPhone: '',
  staffId: null,
  serviceIds: [],
  totalPrice: 0,
  status: 'PENDING',
  customerRequest: '',
  adminMemo: '',
})

// TODO: API에서 가져오기
const staffOptions = ref([
  { id: 1, name: '김디자이너' },
  { id: 2, name: '이디자이너' },
  { id: 3, name: '박디자이너' },
])

const serviceOptions = ref([
  { id: 1, name: '여성컷', price: 30000 },
  { id: 2, name: '남성컷', price: 20000 },
  { id: 3, name: '펌', price: 80000 },
  { id: 4, name: '염색', price: 100000 },
])

const statusOptions = [
  { title: '대기', value: 'PENDING' },
  { title: '확정', value: 'CONFIRMED' },
  { title: '완료', value: 'COMPLETED' },
  { title: '취소', value: 'CANCELLED' },
  { title: '노쇼', value: 'NOSHOW' },
]

const required = value => !!value || '필수 입력 항목입니다.'

watch(() => props.modelValue, newVal => {
  if (newVal) {
    if (props.reservation) {
      form.value = { ...props.reservation }
    } else {
      form.value = {
        reservationDate: props.selectedDate || new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        customerName: '',
        customerPhone: '',
        staffId: null,
        serviceIds: [],
        totalPrice: 0,
        status: 'PENDING',
        customerRequest: '',
        adminMemo: '',
      }
    }
  }
})

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    if (isEditMode.value) {
      await reservationStore.updateReservation(props.reservation.id, form.value)
    } else {
      await reservationStore.createReservation(form.value)
    }

    emit('saved')
  } catch (error) {
    console.error('예약 저장 실패:', error)
    alert(error || '예약 저장에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

function closeDialog() {
  emit('update:modelValue', false)
}
</script>
