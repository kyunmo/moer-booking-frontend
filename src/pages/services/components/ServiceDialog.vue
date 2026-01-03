<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
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
        <span>{{ isEditMode ? '서비스 수정' : '새 서비스 등록' }}</span>

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
            <!-- 서비스명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="서비스명"
                prepend-inner-icon="ri-scissors-line"
                placeholder="예: 여성컷"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 카테고리 -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="form.category"
                label="카테고리"
                :items="categoryOptions"
                prepend-inner-icon="ri-folder-line"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 가격 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.price"
                label="가격"
                type="number"
                prepend-inner-icon="ri-money-dollar-circle-line"
                suffix="원"
                :rules="[required, minPrice]"
                required
              />
            </VCol>

            <!-- 소요시간 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.durationMinutes"
                label="소요시간"
                type="number"
                prepend-inner-icon="ri-time-line"
                suffix="분"
                :rules="[required, minDuration]"
                required
              />
            </VCol>

            <!-- 설명 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="서비스 설명"
                prepend-inner-icon="ri-file-text-line"
                placeholder="서비스에 대한 상세 설명을 입력하세요"
                rows="3"
                auto-grow
              />
            </VCol>

            <!-- 활성 여부 -->
            <VCol cols="12">
              <VSwitch
                v-model="form.isActive"
                label="서비스 활성화"
                color="success"
                hide-details
              >
                <template #label>
                  <div class="d-flex align-center">
                    <span class="me-2">서비스 활성화</span>
                    <VChip
                      :color="form.isActive ? 'success' : 'error'"
                      size="small"
                    >
                      {{ form.isActive ? '활성' : '비활성' }}
                    </VChip>
                  </div>
                </template>
              </VSwitch>
              <p class="text-xs text-disabled mt-1">
                비활성화된 서비스는 예약 시 선택할 수 없습니다
              </p>
            </VCol>

            <!-- 구분선 -->
            <VCol cols="12">
              <VDivider />
            </VCol>

            <!-- 추가 옵션 -->
            <VCol cols="12">
              <p class="text-sm font-weight-medium mb-2">
                추가 옵션 (선택)
              </p>
            </VCol>

            <!-- 할인가 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.discountPrice"
                label="할인가"
                type="number"
                prepend-inner-icon="ri-percent-line"
                suffix="원"
                hint="할인 중일 때 표시될 가격"
                persistent-hint
              />
            </VCol>

            <!-- 표시 순서 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.displayOrder"
                label="표시 순서"
                type="number"
                prepend-inner-icon="ri-sort-asc"
                hint="숫자가 작을수록 먼저 표시"
                persistent-hint
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
import { useServiceStore } from '@/stores/service'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  service: Object,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const serviceStore = useServiceStore()

const formRef = ref(null)
const loading = ref(false)

const isEditMode = computed(() => !!props.service)

const form = ref({
  name: '',
  category: '',
  price: 0,
  durationMinutes: 30,
  description: '',
  isActive: true,
  discountPrice: null,
  displayOrder: 0,
})

// 카테고리 옵션
const categoryOptions = [
  '컷',
  '펌',
  '염색',
  '클리닉',
  '스타일링',
  '기타',
]

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const minPrice = value => {
  if (value === null || value === undefined) return true
  return value >= 0 || '가격은 0원 이상이어야 합니다.'
}

const minDuration = value => {
  if (value === null || value === undefined) return true
  return value >= 10 || '소요시간은 최소 10분 이상이어야 합니다.'
}

// 다이얼로그 열릴 때
watch(() => props.modelValue, newVal => {
  if (newVal) {
    if (props.service) {
      // 수정 모드
      form.value = {
        name: props.service.name,
        category: props.service.category,
        price: props.service.price,
        durationMinutes: props.service.durationMinutes,
        description: props.service.description || '',
        isActive: props.service.isActive !== false,
        discountPrice: props.service.discountPrice || null,
        displayOrder: props.service.displayOrder || 0,
      }
    }
    else {
      // 등록 모드
      form.value = {
        name: '',
        category: '',
        price: 0,
        durationMinutes: 30,
        description: '',
        isActive: true,
        discountPrice: null,
        displayOrder: 0,
      }
    }
  }
})

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    if (isEditMode.value) {
      // 수정
      await serviceStore.updateService(props.service.id, form.value)
    }
    else {
      // 등록
      await serviceStore.createService(form.value)
    }

    emit('saved')
  }
  catch (error) {
    console.error('서비스 저장 실패:', error)
    alert(error || '서비스 저장에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}

// 다이얼로그 닫기
function closeDialog() {
  emit('update:modelValue', false)
}
</script>
