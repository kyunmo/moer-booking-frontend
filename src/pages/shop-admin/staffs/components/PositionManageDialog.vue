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
        <VIcon icon="ri-shield-star-line" size="24" class="me-3" />
        <span>직급 관리</span>

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
        <!-- 새 직급 추가 폼 -->
        <div class="d-flex align-center gap-2 mb-4">
          <VTextField
            v-model="newPositionName"
            placeholder="새 직급명 입력 (예: 원장, 실장, 디자이너)"
            density="compact"
            hide-details
            prepend-inner-icon="ri-add-line"
            @keyup.enter="addPosition"
          />
          <VBtn
            color="primary"
            :loading="addLoading"
            :disabled="!newPositionName.trim()"
            @click="addPosition"
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
        <div v-if="positionStore.loading && positions.length === 0" class="text-center pa-6">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <!-- 직급 없음 -->
        <div v-else-if="positions.length === 0" class="text-center pa-6">
          <VIcon icon="ri-shield-star-line" size="48" class="mb-3 text-disabled" />
          <p class="text-body-2 text-disabled">
            등록된 직급이 없습니다
          </p>
          <p class="text-caption text-disabled">
            직급을 추가하면 스태프 등록/수정 시 선택할 수 있습니다
          </p>
        </div>

        <!-- 직급 목록 -->
        <VList v-else density="compact" class="position-list">
          <template v-for="(position, index) in positions" :key="position.id">
            <VListItem class="position-item">
              <!-- 드래그 핸들 -->
              <template #prepend>
                <VIcon
                  icon="ri-draggable"
                  class="drag-handle me-2 text-disabled cursor-grab"
                  size="20"
                />
              </template>

              <!-- 수정 모드 -->
              <template v-if="editingId === position.id">
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VTextField
                    v-model="editingName"
                    density="compact"
                    hide-details
                    autofocus
                    @keyup.enter="saveEdit(position)"
                    @keyup.escape="cancelEdit"
                  />
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="success"
                    :loading="editLoading"
                    @click="saveEdit(position)"
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
                  <span class="text-body-1">{{ position.name }}</span>
                  <VChip
                    v-if="position.staffCount > 0"
                    size="x-small"
                    variant="tonal"
                    color="info"
                    class="ms-2"
                  >
                    {{ position.staffCount }}명
                  </VChip>
                </VListItemTitle>
              </template>

              <!-- 액션 버튼 -->
              <template v-if="editingId !== position.id" #append>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  @click="startEdit(position)"
                >
                  <VIcon icon="ri-edit-line" size="18" />
                </VBtn>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(position)"
                >
                  <VIcon icon="ri-delete-bin-line" size="18" />
                </VBtn>
              </template>
            </VListItem>

            <VDivider v-if="index < positions.length - 1" />
          </template>
        </VList>
      </VCardText>

      <VDivider />

      <!-- 하단 -->
      <VCardActions class="pa-4">
        <span class="text-caption text-disabled">
          총 {{ positions.length }}개 직급
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
        <VCardTitle>직급 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ positionToDelete?.name }}</strong> 직급을 삭제하시겠습니까?
          </p>
          <p v-if="positionToDelete?.staffCount > 0" class="text-error text-sm mt-2">
            이 직급에 {{ positionToDelete.staffCount }}명의 스태프가 배정되어 있어 삭제할 수 없습니다.
            스태프의 직급을 변경한 후 다시 시도해주세요.
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
            :disabled="positionToDelete?.staffCount > 0"
            @click="deletePosition"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<script setup>
import { useStaffPositionStore } from '@/stores/staff-position'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const positionStore = useStaffPositionStore()

// State
const newPositionName = ref('')
const editingId = ref(null)
const editingName = ref('')
const positionToDelete = ref(null)
const isDeleteConfirmVisible = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const addLoading = ref(false)
const editLoading = ref(false)
const deleteLoading = ref(false)

// 직급 목록
const positions = computed(() => positionStore.positions)

// 다이얼로그 열릴 때 직급 로드
watch(() => props.modelValue, async visible => {
  if (visible) {
    errorMessage.value = ''
    successMessage.value = ''
    newPositionName.value = ''
    cancelEdit()
    await positionStore.fetchPositions(true)
  }
})

// 직급 추가
async function addPosition() {
  const name = newPositionName.value.trim()
  if (!name) return

  addLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await positionStore.createPosition({ name })
    newPositionName.value = ''
    successMessage.value = `'${name}' 직급이 추가되었습니다.`
    emit('updated')
  }
  catch (error) {
    if (error.code === 'SP002') {
      errorMessage.value = '이미 동일한 이름의 직급이 존재합니다.'
    }
    else {
      errorMessage.value = error.message || '직급 추가에 실패했습니다.'
    }
  }
  finally {
    addLoading.value = false
  }
}

// 수정 시작
function startEdit(position) {
  editingId.value = position.id
  editingName.value = position.name
}

// 수정 취소
function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

// 수정 저장
async function saveEdit(position) {
  const name = editingName.value.trim()
  if (!name) return
  if (name === position.name) {
    cancelEdit()

    return
  }

  editLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await positionStore.updatePosition(position.id, { name })
    cancelEdit()
    successMessage.value = '직급이 수정되었습니다.'
    emit('updated')
  }
  catch (error) {
    if (error.code === 'SP002') {
      errorMessage.value = '이미 동일한 이름의 직급이 존재합니다.'
    }
    else {
      errorMessage.value = error.message || '직급 수정에 실패했습니다.'
    }
  }
  finally {
    editLoading.value = false
  }
}

// 삭제 확인
function confirmDelete(position) {
  positionToDelete.value = position
  isDeleteConfirmVisible.value = true
}

// 삭제 실행
async function deletePosition() {
  if (!positionToDelete.value) return

  deleteLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await positionStore.deletePosition(positionToDelete.value.id)
    const deletedName = positionToDelete.value.name

    isDeleteConfirmVisible.value = false
    positionToDelete.value = null
    successMessage.value = `'${deletedName}' 직급이 삭제되었습니다.`
    emit('updated')
  }
  catch (error) {
    if (error.code === 'SP003') {
      errorMessage.value = '이 직급에 스태프가 배정되어 있어 삭제할 수 없습니다.'
    }
    else {
      errorMessage.value = error.message || '직급 삭제에 실패했습니다.'
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
.position-list {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  max-block-size: 400px;
  overflow-y: auto;
}

.position-item {
  min-block-size: 48px;
}

.cursor-grab {
  cursor: grab;
}
</style>
