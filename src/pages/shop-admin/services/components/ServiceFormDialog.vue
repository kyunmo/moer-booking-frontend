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
        <VIcon icon="ri-add-line" size="24" class="me-3" />
        <span>{{ isEditMode ? '서비스 수정' : '서비스 등록' }}</span>
        
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
            <!-- 카테고리 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.categoryId"
                label="카테고리 *"
                placeholder="선택하세요"
                prepend-inner-icon="ri-folder-line"
                :items="categoryOptions"
                item-title="title"
                item-value="value"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 서비스명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="서비스명 *"
                placeholder="예: 여성 컷"
                :prepend-inner-icon="serviceIconLine"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 가격 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.price"
                label="가격 (원) *"
                type="number"
                placeholder="30000"
                prepend-inner-icon="ri-money-dollar-circle-line"
                :rules="[required, minValueRule]"
                required
                min="0"
                step="1000"
              />
            </VCol>

            <!-- 소요시간 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.duration"
                label="소요시간 (분) *"
                type="number"
                placeholder="60"
                prepend-inner-icon="ri-time-line"
                :rules="[required, minValueRule]"
                required
                min="0"
                step="10"
              />
            </VCol>

            <!-- 담당 가능 직원 -->
            <VCol cols="12">
              <VSelect
                v-model="form.staffIds"
                label="담당 가능 직원"
                placeholder="직원을 선택하세요"
                prepend-inner-icon="ri-user-line"
                :items="staffOptions"
                item-title="name"
                item-value="id"
                multiple
                chips
                closable-chips
                hint="이 서비스를 담당할 수 있는 직원을 선택하세요"
                persistent-hint
              />
            </VCol>

            <!-- 서비스 설명 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="서비스 설명"
                placeholder="서비스에 대한 상세 설명을 입력하세요"
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
import { useBusinessIcon } from '@/composables/useBusinessIcon'
import { useServiceCategoryStore } from '@/stores/service-category'
import { useServiceStore } from '@/stores/service'
import { useStaffStore } from '@/stores/staff'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  service: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { serviceIconLine } = useBusinessIcon()
const serviceStore = useServiceStore()
const staffStore = useStaffStore()
const categoryStore = useServiceCategoryStore()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 수정 모드 여부
const isEditMode = computed(() => !!props.service)

// 카테고리 옵션 (DB에서 로드)
const categoryOptions = computed(() => categoryStore.categoryOptions)

// 직원 옵션 (활성 직원만)
const staffOptions = computed(() => {
  return staffStore.activeStaffs
})

// 폼 데이터
const form = ref({
  categoryId: null,
  name: '',
  price: null,
  duration: null,
  staffIds: [],
  description: '',
})

// service prop 변경 시 폼 초기화
watch(() => props.service, (newService) => {
  if (newService) {
    // 수정 모드: 기존 데이터 로드
    form.value = {
      categoryId: newService.categoryId || null,
      name: newService.name || '',
      price: newService.price || null,
      duration: newService.duration || null,
      staffIds: newService.staffIds || [],
      description: newService.description || '',
    }
  } else {
    // 등록 모드: 초기화
    resetForm()
  }
}, { immediate: true })

// Validation Rules
const required = value => !!value || '필수 입력 항목입니다.'

const minValueRule = value => {
  if (value === null || value === '') return '필수 입력 항목입니다.'
  return value > 0 || '0보다 큰 숫자를 입력하세요'
}

// 폼 초기화
function resetForm() {
  form.value = {
    categoryId: null,
    name: '',
    price: null,
    duration: null,
    staffIds: [],
    description: '',
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
    // 서비스 데이터 준비
    const serviceData = {
      categoryId: form.value.categoryId,
      name: form.value.name,
      price: form.value.price,
      duration: form.value.duration,
      staffIds: form.value.staffIds.length > 0 ? form.value.staffIds : null,
      description: form.value.description || null,
    }

    if (isEditMode.value) {
      // 수정
      await serviceStore.updateService(props.service.id, serviceData)
    } else {
      // 등록
      await serviceStore.createService(serviceData)
    }

    emit('saved')
    handleClose()
  }
  catch (error) {
    console.error('서비스 저장 실패:', error)
    errorMessage.value = error.response?.data?.message || '저장에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시 직원/카테고리 목록 로드
onMounted(() => {
  if (staffStore.staffs.length === 0) {
    staffStore.fetchStaffs()
  }
  categoryStore.fetchCategories()
})
</script>
