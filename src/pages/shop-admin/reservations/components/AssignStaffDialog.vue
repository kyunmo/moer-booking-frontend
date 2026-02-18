<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-user-add-line" size="24" class="me-3" />
        <span>직원 배정</span>
        
        <VSpacer />
        
        <VBtn
          icon
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
        >
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <!-- 예약 정보 -->
          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-sm">
              <div><strong>고객:</strong> {{ reservation?.customerName }}</div>
              <div><strong>날짜:</strong> {{ formatDate(reservation?.reservationDate) }}</div>
              <div><strong>시간:</strong> {{ reservation?.startTime }} - {{ reservation?.endTime }}</div>
            </div>
          </VAlert>

          <!-- 직원 선택 -->
          <VSelect
            v-model="selectedStaffId"
            label="담당 직원 선택 *"
            placeholder="직원을 선택하세요"
            prepend-inner-icon="ri-user-line"
            :items="staffOptions"
            item-title="name"
            item-value="id"
            :rules="[required]"
            required
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

          <!-- 에러 메시지 -->
          <VAlert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </VAlert>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />
        
        <VBtn
          variant="outlined"
          @click="$emit('update:modelValue', false)"
        >
          취소
        </VBtn>

        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          배정
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useReservationStore } from '@/stores/reservation'
import { useStaffStore } from '@/stores/staff'
import { onMounted, ref } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'assigned'])

const reservationStore = useReservationStore()
const staffStore = useStaffStore()

const formRef = ref(null)
const selectedStaffId = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const staffOptions = ref([])

// Validation
const required = value => !!value || '필수 선택 항목입니다.'

// 이니셜
function getInitial(name) {
  if (!name) return '?'
  return name.charAt(0)
}

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

// 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  errorMessage.value = ''
  loading.value = true

  try {
    await reservationStore.updateReservation(props.reservation.id, {
      staffId: selectedStaffId.value,
    })

    emit('assigned')
    emit('update:modelValue', false)
  }
  catch (error) {
    errorMessage.value = error.response?.data?.message || '직원 배정에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시
onMounted(async () => {
  if (staffStore.staffs.length === 0) {
    await staffStore.fetchStaffs()
  }
  staffOptions.value = staffStore.activeStaffs
})
</script>
