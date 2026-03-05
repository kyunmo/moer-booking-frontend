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
        <VIcon icon="ri-user-add-line" size="24" class="me-3" />
        <span>{{ isEditMode ? '고객 수정' : '고객 등록' }}</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 이름 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="이름 *"
                placeholder="홍길동"
                prepend-inner-icon="ri-user-line"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="전화번호 *"
                placeholder="010-1234-5678"
                prepend-inner-icon="ri-phone-line"
                :rules="requiredPhoneRules"
                required
              />
            </VCol>

            <!-- 이메일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.email"
                label="이메일"
                type="email"
                placeholder="customer@example.com"
                prepend-inner-icon="ri-mail-line"
                :rules="[emailRule]"
              />
            </VCol>

            <!-- 생년월일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.birthDate"
                label="생년월일"
                type="date"
                prepend-inner-icon="ri-cake-line"
              />
            </VCol>

            <!-- 성별 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.gender"
                label="성별"
                placeholder="선택하세요"
                prepend-inner-icon="ri-user-3-line"
                :items="genderOptions"
                clearable
              />
            </VCol>

            <!-- 태그 -->
            <VCol cols="12" md="6">
              <VCombobox
                v-model="form.tags"
                label="태그"
                placeholder="태그를 입력하세요"
                prepend-inner-icon="ri-price-tag-3-line"
                multiple
                chips
                closable-chips
                hint="Enter를 눌러 태그 추가"
                persistent-hint
              />
            </VCol>

            <!-- 메모 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.memo"
                label="메모"
                placeholder="고객에 대한 메모를 입력하세요"
                prepend-inner-icon="ri-file-text-line"
                rows="3"
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
import { usePhoneValidation } from '@/composables/usePhoneValidation'
import { useCustomerStore } from '@/stores/customer'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  customer: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const customerStore = useCustomerStore()
const { requiredPhoneRules } = usePhoneValidation()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 수정 모드 여부
const isEditMode = computed(() => !!props.customer)

// 성별 옵션
const genderOptions = [
  { title: '남성', value: 'MALE' },
  { title: '여성', value: 'FEMALE' },
]

// 폼 데이터
const form = ref({
  name: '',
  phone: '',
  email: '',
  birthDate: null,
  gender: null,
  tags: [],
  memo: '',
})

// customer prop 변경 시 폼 초기화
watch(() => props.customer, (newCustomer) => {
  if (newCustomer) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      name: newCustomer.name || '',
      phone: newCustomer.phone || '',
      email: newCustomer.email || '',
      birthDate: newCustomer.birthDate || null,
      gender: newCustomer.gender || null,
      tags: newCustomer.tags || [],
      memo: newCustomer.memo || '',
    }
  } else {
    // 등록 모드: 초기화
    resetForm()
  }
}, { immediate: true })

// Validation Rules
const required = value => !!value || '필수 입력 항목입니다.'

const emailRule = value => {
  if (!value) return true
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || '이메일 형식이 올바르지 않습니다'
}

// 폼 초기화
function resetForm() {
  form.value = {
    name: '',
    phone: '',
    email: '',
    birthDate: null,
    gender: null,
    tags: [],
    memo: '',
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
    // 고객 데이터 준비
    const customerData = {
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email || null,
      birthDate: form.value.birthDate || null,
      gender: form.value.gender || null,
      tags: form.value.tags.length > 0 ? form.value.tags : null,
      memo: form.value.memo || null,
    }

    if (isEditMode.value) {
      // 수정
      await customerStore.updateCustomer(props.customer.id, customerData)
    } else {
      // 등록
      await customerStore.createCustomer(customerData)
    }

    emit('saved')
    handleClose()
  }
  catch (error) {
    errorMessage.value = error.response?.data?.message || '저장에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}
</script>
