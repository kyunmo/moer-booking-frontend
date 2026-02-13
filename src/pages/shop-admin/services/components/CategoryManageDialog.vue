<template>
  <VDialog
    :model-value="modelValue"
    max-width="550"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-folder-settings-line" size="24" class="me-3" />
        <span>카테고리 관리</span>

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
        <!-- 새 카테고리 추가 폼 -->
        <div class="d-flex align-center gap-2 mb-4">
          <VTextField
            v-model="newCategoryName"
            placeholder="새 카테고리명 입력"
            density="compact"
            hide-details
            prepend-inner-icon="ri-add-line"
            @keyup.enter="addCategory"
          />
          <VBtn
            color="primary"
            :loading="addLoading"
            :disabled="!newCategoryName.trim()"
            @click="addCategory"
          >
            추가
          </VBtn>
        </div>

        <!-- 에러 메시지 -->
        <VAlert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="mb-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </VAlert>

        <!-- 성공 메시지 -->
        <VAlert
          v-if="successMessage"
          type="success"
          variant="tonal"
          density="compact"
          closable
          class="mb-4"
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </VAlert>

        <!-- 로딩 -->
        <div v-if="categoryStore.loading && categories.length === 0" class="text-center pa-6">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <!-- 카테고리 없음 -->
        <div v-else-if="categories.length === 0" class="text-center pa-6">
          <VIcon icon="ri-folder-line" size="48" class="mb-3 text-disabled" />
          <p class="text-body-2 text-disabled">
            등록된 카테고리가 없습니다
          </p>
        </div>

        <!-- 카테고리 목록 -->
        <VList v-else density="compact" class="category-list">
          <template v-for="(category, index) in categories" :key="category.id">
            <VListItem class="category-item">
              <!-- 드래그 핸들 -->
              <template #prepend>
                <VIcon
                  icon="ri-draggable"
                  class="drag-handle me-2 text-disabled cursor-grab"
                  size="20"
                />
              </template>

              <!-- 수정 모드 -->
              <template v-if="editingId === category.id">
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VTextField
                    v-model="editingName"
                    density="compact"
                    hide-details
                    autofocus
                    @keyup.enter="saveEdit(category)"
                    @keyup.escape="cancelEdit"
                  />
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="success"
                    :loading="editLoading"
                    @click="saveEdit(category)"
                  >
                    <VIcon icon="ri-check-line" />
                  </VBtn>
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    @click="cancelEdit"
                  >
                    <VIcon icon="ri-close-line" />
                  </VBtn>
                </div>
              </template>

              <!-- 일반 모드 -->
              <template v-else>
                <VListItemTitle>
                  <span class="text-body-1">{{ category.name }}</span>
                  <VChip
                    v-if="category.serviceCount > 0"
                    size="x-small"
                    variant="tonal"
                    color="info"
                    class="ms-2"
                  >
                    {{ category.serviceCount }}개 서비스
                  </VChip>
                </VListItemTitle>
              </template>

              <!-- 액션 버튼 -->
              <template v-if="editingId !== category.id" #append>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  @click="startEdit(category)"
                >
                  <VIcon icon="ri-edit-line" size="18" />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(category)"
                >
                  <VIcon icon="ri-delete-bin-line" size="18" />
                </VBtn>
              </template>
            </VListItem>

            <VDivider v-if="index < categories.length - 1" />
          </template>
        </VList>
      </VCardText>

      <VDivider />

      <!-- 하단 -->
      <VCardActions class="pa-4">
        <span class="text-caption text-disabled">
          총 {{ categories.length }}개 카테고리
        </span>
        <VSpacer />
        <VBtn
          variant="outlined"
          @click="handleClose"
        >
          닫기
        </VBtn>
      </VCardActions>
    </VCard>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog
      v-model="isDeleteConfirmVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>카테고리 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ categoryToDelete?.name }}</strong> 카테고리를 삭제하시겠습니까?
          </p>
          <p v-if="categoryToDelete?.serviceCount > 0" class="text-error text-sm mt-2">
            이 카테고리에 {{ categoryToDelete.serviceCount }}개의 서비스가 등록되어 있어 삭제할 수 없습니다.
            서비스의 카테고리를 변경한 후 다시 시도해주세요.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="isDeleteConfirmVisible = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            :loading="deleteLoading"
            :disabled="categoryToDelete?.serviceCount > 0"
            @click="deleteCategory"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<script setup>
import { useServiceCategoryStore } from '@/stores/service-category'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const categoryStore = useServiceCategoryStore()

// State
const newCategoryName = ref('')
const editingId = ref(null)
const editingName = ref('')
const categoryToDelete = ref(null)
const isDeleteConfirmVisible = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const addLoading = ref(false)
const editLoading = ref(false)
const deleteLoading = ref(false)

// 카테고리 목록
const categories = computed(() => categoryStore.categories)

// 다이얼로그 열릴 때 카테고리 로드
watch(() => props.modelValue, async (visible) => {
  if (visible) {
    errorMessage.value = ''
    successMessage.value = ''
    newCategoryName.value = ''
    cancelEdit()
    await categoryStore.fetchCategories()
  }
})

// 카테고리 추가
async function addCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return

  addLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await categoryStore.createCategory({ name })
    newCategoryName.value = ''
    successMessage.value = `'${name}' 카테고리가 추가되었습니다.`
    emit('updated')
  }
  catch (error) {
    const code = error.response?.data?.code
    if (code === 'SV004') {
      errorMessage.value = '이미 동일한 이름의 카테고리가 존재합니다.'
    }
    else {
      errorMessage.value = error.response?.data?.message || '카테고리 추가에 실패했습니다.'
    }
  }
  finally {
    addLoading.value = false
  }
}

// 수정 시작
function startEdit(category) {
  editingId.value = category.id
  editingName.value = category.name
}

// 수정 취소
function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

// 수정 저장
async function saveEdit(category) {
  const name = editingName.value.trim()
  if (!name) return
  if (name === category.name) {
    cancelEdit()
    return
  }

  editLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await categoryStore.updateCategory(category.id, { name })
    cancelEdit()
    successMessage.value = '카테고리가 수정되었습니다.'
    emit('updated')
  }
  catch (error) {
    const code = error.response?.data?.code
    if (code === 'SV004') {
      errorMessage.value = '이미 동일한 이름의 카테고리가 존재합니다.'
    }
    else {
      errorMessage.value = error.response?.data?.message || '카테고리 수정에 실패했습니다.'
    }
  }
  finally {
    editLoading.value = false
  }
}

// 삭제 확인
function confirmDelete(category) {
  categoryToDelete.value = category
  isDeleteConfirmVisible.value = true
}

// 삭제 실행
async function deleteCategory() {
  if (!categoryToDelete.value) return

  deleteLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await categoryStore.deleteCategory(categoryToDelete.value.id)
    const deletedName = categoryToDelete.value.name
    isDeleteConfirmVisible.value = false
    categoryToDelete.value = null
    successMessage.value = `'${deletedName}' 카테고리가 삭제되었습니다.`
    emit('updated')
  }
  catch (error) {
    const code = error.response?.data?.code
    if (code === 'SV005') {
      errorMessage.value = '이 카테고리에 서비스가 등록되어 있어 삭제할 수 없습니다.'
    }
    else {
      errorMessage.value = error.response?.data?.message || '카테고리 삭제에 실패했습니다.'
    }
    isDeleteConfirmVisible.value = false
  }
  finally {
    deleteLoading.value = false
  }
}

// 닫기
function handleClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.category-list {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  max-block-size: 400px;
  overflow-y: auto;
}

.category-item {
  min-block-size: 48px;
}

.drag-handle {
  cursor: grab;
}

.cursor-grab {
  cursor: grab;
}
</style>
