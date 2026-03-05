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
        <VIcon icon="ri-add-line" size="24" class="me-3" />
        <span>{{ isEditMode ? '서비스 수정' : '서비스 등록' }}</span>
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
                :loading="nameChecking"
                :error-messages="nameDuplicate ? '이미 사용 중인 서비스명입니다' : ''"
                required
              >
                <template v-if="form.name && !nameChecking && !nameDuplicate && !(isEditMode && props.service?.name === form.name)" #append-inner>
                  <VIcon icon="ri-check-line" color="success" size="20" />
                </template>
              </VTextField>
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

            <!-- 서비스 이미지 (최대 3장) -->
            <VCol cols="12">
              <div class="text-subtitle-2 mb-2">
                서비스 이미지 (최대 3장)
              </div>

              <!-- 기존 이미지 미리보기 -->
              <div v-if="existingImages.length > 0 || imagePreviewUrls.length > 0" class="d-flex flex-wrap ga-3 mb-3">
                <!-- 기존 이미지 (수정 모드) -->
                <div
                  v-for="(img, idx) in existingImages"
                  :key="'existing-' + idx"
                  class="position-relative"
                  style="inline-size: 120px; block-size: 120px;"
                >
                  <VImg
                    :src="resolveImageUrl(img.thumbnailUrl || img.imageUrl)"
                    width="120"
                    height="120"
                    cover
                    rounded="lg"
                    style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                  />
                  <VBtn
                    icon
                    size="x-small"
                    color="error"
                    variant="elevated"
                    class="position-absolute"
                    style="inset-block-start: -8px; inset-inline-end: -8px;"
                    @click="removeExistingImage(idx)"
                  >
                    <VIcon icon="ri-close-line" size="14" />
                  </VBtn>
                </div>

                <!-- 새로 추가된 이미지 미리보기 -->
                <div
                  v-for="(url, idx) in imagePreviewUrls"
                  :key="'new-' + idx"
                  class="position-relative"
                  style="inline-size: 120px; block-size: 120px;"
                >
                  <VImg
                    :src="url"
                    width="120"
                    height="120"
                    cover
                    rounded="lg"
                    style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                  />
                  <VBtn
                    icon
                    size="x-small"
                    color="error"
                    variant="elevated"
                    class="position-absolute"
                    style="inset-block-start: -8px; inset-inline-end: -8px;"
                    @click="removeNewImage(idx)"
                  >
                    <VIcon icon="ri-close-line" size="14" />
                  </VBtn>
                </div>
              </div>

              <!-- 이미지 추가 버튼 -->
              <VBtn
                v-if="totalImageCount < 3"
                variant="outlined"
                color="secondary"
                size="small"
                @click="triggerImageInput"
              >
                <VIcon icon="ri-image-add-line" class="me-1" />
                이미지 추가 ({{ totalImageCount }}/3)
              </VBtn>

              <p v-else class="text-caption text-medium-emphasis mt-1">
                최대 3장까지 등록할 수 있습니다
              </p>

              <input
                ref="imageInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                @change="handleImageSelect"
              >

              <p class="text-caption text-medium-emphasis mt-1">
                JPG, PNG, WebP / 파일당 최대 5MB
              </p>
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
import serviceApi from '@/api/services'
import { resolveImageUrl } from '@/utils/imageUrl'
import { useBusinessIcon } from '@/composables/useBusinessIcon'
import { useAuthStore } from '@/stores/auth'
import { useServiceCategoryStore } from '@/stores/service-category'
import { useServiceStore } from '@/stores/service'
import { useStaffStore } from '@/stores/staff'
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'

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
const authStore = useAuthStore()
const serviceStore = useServiceStore()
const staffStore = useStaffStore()
const categoryStore = useServiceCategoryStore()

// Refs
const formRef = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const nameChecking = ref(false)
const nameDuplicate = ref(false)

// Image upload refs
const imageInputRef = ref(null)
const newImageFiles = ref([])
const imagePreviewUrls = ref([])
const existingImages = ref([])
const removedImageIds = ref([])

const totalImageCount = computed(() => existingImages.value.length + newImageFiles.value.length)

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

// 서비스명 중복 체크 (debounced)
let nameCheckTimer = null

watch(() => form.value.name, newName => {
  nameDuplicate.value = false
  clearTimeout(nameCheckTimer)

  if (!newName || newName.trim().length === 0) return

  // 수정 모드에서 기존 이름과 동일하면 체크 불필요
  if (isEditMode.value && props.service?.name === newName) return

  nameCheckTimer = setTimeout(() => checkServiceName(newName), 300)
})

async function checkServiceName(name) {
  const businessId = authStore.businessId
  if (!businessId) return

  nameChecking.value = true
  try {
    const { data } = await serviceApi.checkServiceName(
      businessId,
      name,
      isEditMode.value ? props.service.id : null,
    )
    nameDuplicate.value = data.duplicate
  }
  catch {
    // 중복 확인 실패 시 무시
  }
  finally {
    nameChecking.value = false
  }
}

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
    // 기존 이미지 로드
    existingImages.value = Array.isArray(newService.images) ? [...newService.images] : []
    newImageFiles.value = []
    imagePreviewUrls.value.forEach(url => URL.revokeObjectURL(url))
    imagePreviewUrls.value = []
    removedImageIds.value = []
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

// Image upload handlers
function triggerImageInput() {
  imageInputRef.value?.click()
}

function handleImageSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = '이미지 크기는 5MB 이하만 가능합니다'
    event.target.value = ''
    return
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    errorMessage.value = 'JPG, PNG, WebP 형식만 지원합니다'
    event.target.value = ''
    return
  }

  if (totalImageCount.value >= 3) {
    errorMessage.value = '이미지는 최대 3장까지 등록할 수 있습니다'
    event.target.value = ''
    return
  }

  newImageFiles.value.push(file)
  imagePreviewUrls.value.push(URL.createObjectURL(file))
  event.target.value = ''
}

function removeNewImage(index) {
  URL.revokeObjectURL(imagePreviewUrls.value[index])
  newImageFiles.value.splice(index, 1)
  imagePreviewUrls.value.splice(index, 1)
}

function removeExistingImage(index) {
  const removed = existingImages.value.splice(index, 1)
  if (removed[0]?.id) {
    removedImageIds.value.push(removed[0].id)
  }
}

function cleanupImagePreviews() {
  imagePreviewUrls.value.forEach(url => URL.revokeObjectURL(url))
  imagePreviewUrls.value = []
  newImageFiles.value = []
  existingImages.value = []
  removedImageIds.value = []
}

onBeforeUnmount(() => {
  cleanupImagePreviews()
})

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
  nameDuplicate.value = false
  cleanupImagePreviews()
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

    let savedService
    if (isEditMode.value) {
      // 수정
      savedService = await serviceStore.updateService(props.service.id, serviceData)
    } else {
      // 등록
      savedService = await serviceStore.createService(serviceData)
    }

    const serviceId = savedService?.data?.id || savedService?.id || props.service?.id
    if (serviceId) {
      // 삭제된 기존 이미지 처리
      for (const imageId of removedImageIds.value) {
        try {
          await serviceApi.deleteServiceImage(authStore.businessId, serviceId, imageId)
        } catch {
          // 이미지 삭제 실패 시 무시
        }
      }
      // 새 이미지 업로드
      for (let i = 0; i < newImageFiles.value.length; i++) {
        try {
          await serviceApi.uploadServiceImage(
            authStore.businessId,
            serviceId,
            newImageFiles.value[i],
            existingImages.value.length + i,
          )
        } catch {
          // 이미지 업로드 실패 시 무시
        }
      }
    }

    emit('saved')
    handleClose()
  }
  catch (error) {
    const code = error.code || error.response?.data?.error?.code
    if (code === 'SV007') {
      nameDuplicate.value = true
      errorMessage.value = '동일한 이름의 서비스가 이미 존재합니다.'
    }
    else {
      errorMessage.value = error.response?.data?.message || error.message || '저장에 실패했습니다.'
    }
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
