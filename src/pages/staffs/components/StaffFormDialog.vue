<template>
  <VDialog
    :model-value="modelValue"
    max-width="700"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-user-add-line" size="24" class="me-3" />
        <span>{{ isEditMode ? '스태프 수정' : '스태프 등록' }}</span>
        
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

            <!-- 직급 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.position"
                label="직급"
                placeholder="선택하세요"
                prepend-inner-icon="ri-shield-star-line"
                :items="positionOptions"
                clearable
              />
            </VCol>

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="전화번호"
                placeholder="010-1234-5678"
                prepend-inner-icon="ri-phone-line"
                :rules="[phoneRule]"
              />
            </VCol>

            <!-- 이메일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.email"
                label="이메일"
                type="email"
                placeholder="staff@example.com"
                prepend-inner-icon="ri-mail-line"
                :rules="[emailRule]"
              />
            </VCol>

            <!-- 경력 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.careerYears"
                label="경력 (년)"
                type="number"
                placeholder="0"
                prepend-inner-icon="ri-briefcase-line"
                :rules="[minValueRule]"
                min="0"
              />
            </VCol>

            <!-- 전문분야 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.specialty"
                label="전문분야"
                placeholder="펌, 컬러, 남성컷"
                prepend-inner-icon="ri-star-line"
                hint="쉼표(,)로 구분하여 입력하세요"
                persistent-hint
              />
            </VCol>

            <!-- 프로필 이미지 URL -->
            <VCol cols="12">
              <VTextField
                v-model="form.profileImageUrl"
                label="프로필 이미지 URL"
                placeholder="https://example.com/image.jpg"
                prepend-inner-icon="ri-image-line"
                hint="이미지 URL을 입력하세요 (선택사항)"
                persistent-hint
              />
            </VCol>

            <!-- 소개글 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.introduction"
                label="소개글"
                placeholder="스태프 소개를 입력하세요"
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
import { useStaffStore } from '@/stores/staff'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  staff: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const staffStore = useStaffStore()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 수정 모드 여부
const isEditMode = computed(() => !!props.staff)

// 직급 옵션
const positionOptions = [
  '원장',
  '실장',
  '디자이너',
  '스타일리스트',
  '인턴',
]

// 폼 데이터
const form = ref({
  name: '',
  position: null,
  phone: '',
  email: '',
  specialty: '',
  careerYears: 0,
  profileImageUrl: '',
  introduction: '',
})

// staff prop 변경 시 폼 초기화
watch(() => props.staff, (newStaff) => {
  if (newStaff) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      name: newStaff.name || '',
      position: newStaff.position || null,
      phone: newStaff.phone || '',
      email: newStaff.email || '',
      specialty: newStaff.specialty || '',
      careerYears: newStaff.careerYears || 0,
      profileImageUrl: newStaff.profileImageUrl || '',
      introduction: newStaff.introduction || '',
    }
  } else {
    // 등록 모드: 초기화
    resetForm()
  }
}, { immediate: true })

// Validation Rules
const required = value => !!value || '필수 입력 항목입니다.'

const phoneRule = value => {
  if (!value) return true
  const pattern = /^010-\d{4}-\d{4}$/
  return pattern.test(value) || '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'
}

const emailRule = value => {
  if (!value) return true
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || '이메일 형식이 올바르지 않습니다'
}

const minValueRule = value => {
  if (value === null || value === '') return true
  return value >= 0 || '0 이상의 숫자를 입력하세요'
}

// 폼 초기화
function resetForm() {
  form.value = {
    name: '',
    position: null,
    phone: '',
    email: '',
    specialty: '',
    careerYears: 0,
    profileImageUrl: '',
    introduction: '',
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
    // 빈 문자열을 null로 변환
    const staffData = {
      name: form.value.name,
      position: form.value.position || null,
      phone: form.value.phone || null,
      email: form.value.email || null,
      specialty: form.value.specialty || null,
      careerYears: form.value.careerYears || 0,
      profileImageUrl: form.value.profileImageUrl || null,
      introduction: form.value.introduction || null,
    }

    if (isEditMode.value) {
      // 수정
      await staffStore.updateStaff(props.staff.id, staffData)
    } else {
      // 등록
      await staffStore.createStaff(staffData)
    }

    emit('saved')
    handleClose()
  }
  catch (error) {
    console.error('스태프 저장 실패:', error)
    errorMessage.value = error.response?.data?.message || '저장에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}
</script>
