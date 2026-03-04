<template>
  <VDialog
    :model-value="modelValue"
    max-width="700"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <DialogCloseBtn @click="handleClose" />

      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-notification-line" size="24" class="me-3" color="primary" />
        <span>알림 발송</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 발송 대상 -->
            <VCol cols="12">
              <VAlert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <div class="d-flex align-center gap-2">
                  <VIcon icon="ri-user-line" size="18" />
                  <span>
                    발송 대상:
                    <strong>
                      {{ targetLabel }}
                    </strong>
                  </span>
                </div>
              </VAlert>
            </VCol>

            <!-- 알림 유형 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.type"
                label="알림 유형 *"
                placeholder="알림 유형을 선택하세요"
                prepend-inner-icon="ri-notification-badge-line"
                :items="notificationTypes"
                :rules="[required]"
              />
            </VCol>

            <!-- 발송 채널 -->
            <VCol cols="12" md="6">
              <div class="text-body-2 font-weight-medium mb-2">발송 채널</div>
              <div class="d-flex flex-column">
                <VCheckbox
                  v-model="form.channels"
                  label="앱 내 알림"
                  value="IN_APP"
                  hide-details
                  density="compact"
                />
                <VCheckbox
                  v-model="form.channels"
                  label="카카오 알림톡"
                  value="KAKAO"
                  hide-details
                  density="compact"
                />
              </div>
            </VCol>

            <!-- 제목 -->
            <VCol cols="12">
              <VTextField
                v-model="form.title"
                label="제목 *"
                placeholder="알림 제목을 입력하세요"
                prepend-inner-icon="ri-text"
                :rules="[required]"
                counter
                maxlength="100"
              />
            </VCol>

            <!-- 메시지 내용 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.message"
                label="메시지 내용 *"
                placeholder="알림 메시지를 입력하세요"
                prepend-inner-icon="ri-chat-3-line"
                :rules="[required]"
                rows="5"
                counter
                maxlength="1000"
              />
            </VCol>

            <!-- 예약일 (리마인더 유형 선택 시) -->
            <VCol v-if="form.type === 'REMINDER'" cols="12" md="6">
              <VTextField
                v-model="form.scheduledDate"
                label="발송 예정일"
                type="date"
                prepend-inner-icon="ri-calendar-line"
                hint="비워두면 즉시 발송됩니다"
                persistent-hint
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
          :disabled="form.channels.length === 0"
          prepend-icon="ri-send-plane-line"
          @click="handleSubmit"
        >
          발송
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  /** 선택된 고객 목록 (빈 배열이면 전체 고객 대상) */
  selectedCustomers: {
    type: Array,
    default: () => [],
  },
  /** 전체 고객 수 */
  totalCustomerCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'sent'])

const { success: showSuccess, error: showError } = useSnackbar()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 알림 유형 옵션
const notificationTypes = [
  { title: '예약 리마인더', value: 'REMINDER' },
  { title: '프로모션', value: 'PROMOTION' },
  { title: '공지사항', value: 'NOTICE' },
]

// 폼 데이터
const form = ref({
  type: null,
  title: '',
  message: '',
  channels: ['IN_APP'],
  scheduledDate: null,
})

// 발송 대상 라벨
const targetLabel = computed(() => {
  if (props.selectedCustomers.length === 0) {
    return `전체 고객 (${props.totalCustomerCount}명)`
  }
  if (props.selectedCustomers.length === 1) {
    return props.selectedCustomers[0].name
  }
  return `선택된 고객 ${props.selectedCustomers.length}명`
})

// Validation Rules
const required = value => !!value || '필수 입력 항목입니다.'

// 다이얼로그 열릴 때 폼 초기화
watch(() => props.modelValue, (open) => {
  if (open) {
    resetForm()
  }
})

// 폼 초기화
function resetForm() {
  form.value = {
    type: null,
    title: '',
    message: '',
    channels: ['IN_APP'],
    scheduledDate: null,
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

  if (form.value.channels.length === 0) {
    errorMessage.value = '발송 채널을 하나 이상 선택해주세요.'
    return
  }

  errorMessage.value = ''
  loading.value = true

  try {
    // TODO: 백엔드 API 구현 후 실제 API 호출로 교체
    // const payload = {
    //   type: form.value.type,
    //   title: form.value.title,
    //   message: form.value.message,
    //   channels: form.value.channels,
    //   scheduledDate: form.value.scheduledDate || null,
    //   customerIds: props.selectedCustomers.length > 0
    //     ? props.selectedCustomers.map(c => c.id)
    //     : null, // null = 전체 고객
    // }
    // await notificationApi.sendNotification(businessId, payload)

    // 임시: 성공 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))

    showSuccess('알림이 발송되었습니다.')
    emit('sent')
    handleClose()
  }
  catch (error) {
    errorMessage.value = error.response?.data?.message || '알림 발송에 실패했습니다.'
    showError(errorMessage.value)
  }
  finally {
    loading.value = false
  }
}
</script>
