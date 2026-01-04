<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard v-if="service">
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon
          :icon="getCategoryIcon(service.category)"
          size="24"
          class="me-3"
          :color="getCategoryColor(service.category)"
        />
        <span>서비스 상세정보</span>
        
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
        <!-- 서비스명 & 상태 -->
        <div class="mb-6">
          <h4 class="text-h4 mb-2">{{ service.name }}</h4>
          
          <div class="d-flex align-center gap-2">
            <VChip
              v-if="service.category"
              :color="getCategoryColor(service.category)"
              size="small"
              variant="tonal"
            >
              {{ service.category }}
            </VChip>

            <VChip
              :color="service.isActive !== false ? 'success' : 'error'"
              size="small"
              variant="outlined"
            >
              {{ service.isActive !== false ? '판매중' : '판매중지' }}
            </VChip>
          </div>
        </div>

        <VDivider class="mb-4" />

        <!-- 가격 & 소요시간 -->
        <div class="mb-6">
          <h6 class="text-h6 mb-3">
            <VIcon icon="ri-information-line" class="me-2" />
            기본 정보
          </h6>

          <VRow>
            <!-- 가격 -->
            <VCol cols="12" sm="6">
              <div class="d-flex align-center">
                <VIcon icon="ri-money-dollar-circle-line" size="24" class="me-3 text-disabled" />
                <div>
                  <p class="text-xs text-disabled mb-0">가격</p>
                  <p class="text-h6 mb-0">{{ service.price.toLocaleString() }}원</p>
                </div>
              </div>
            </VCol>

            <!-- 소요시간 -->
            <VCol cols="12" sm="6">
              <div class="d-flex align-center">
                <VIcon icon="ri-time-line" size="24" class="me-3 text-disabled" />
                <div>
                  <p class="text-xs text-disabled mb-0">소요시간</p>
                  <p class="text-h6 mb-0">{{ service.duration }}분</p>
                </div>
              </div>
            </VCol>

            <!-- 등록일 -->
            <VCol cols="12" sm="6">
              <div class="d-flex align-center">
                <VIcon icon="ri-calendar-line" size="24" class="me-3 text-disabled" />
                <div>
                  <p class="text-xs text-disabled mb-0">등록일</p>
                  <p class="text-sm mb-0">{{ formatDate(service.createdAt) }}</p>
                </div>
              </div>
            </VCol>

            <!-- 수정일 -->
            <VCol cols="12" sm="6">
              <div class="d-flex align-center">
                <VIcon icon="ri-refresh-line" size="24" class="me-3 text-disabled" />
                <div>
                  <p class="text-xs text-disabled mb-0">수정일</p>
                  <p class="text-sm mb-0">{{ formatDate(service.updatedAt) }}</p>
                </div>
              </div>
            </VCol>
          </VRow>
        </div>

        <!-- 담당 가능 직원 -->
        <div v-if="service.staffIds && service.staffIds.length > 0" class="mb-6">
          <h6 class="text-h6 mb-3">
            <VIcon icon="ri-user-line" class="me-2" />
            담당 가능 직원
          </h6>
          <div class="d-flex align-center">
            <VIcon icon="ri-team-line" size="20" class="me-2 text-disabled" />
            <span class="text-sm">{{ service.staffIds.length }}명의 직원이 담당 가능합니다</span>
          </div>
        </div>

        <!-- 설명 -->
        <div v-if="service.description">
          <h6 class="text-h6 mb-3">
            <VIcon icon="ri-file-text-line" class="me-2" />
            서비스 설명
          </h6>
          <p class="text-sm text-medium-emphasis">
            {{ service.description }}
          </p>
        </div>
      </VCardText>

      <VDivider />

      <!-- 액션 버튼 -->
      <VCardActions class="pa-4">
        <VBtn
          color="error"
          variant="outlined"
          @click="handleDelete"
        >
          <VIcon icon="ri-delete-bin-line" class="me-2" />
          삭제
        </VBtn>

        <VSpacer />

        <VBtn
          variant="outlined"
          @click="$emit('update:modelValue', false)"
        >
          닫기
        </VBtn>

        <VBtn
          color="primary"
          @click="handleEdit"
        >
          <VIcon icon="ri-edit-line" class="me-2" />
          수정
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
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

const emit = defineEmits(['update:modelValue', 'edit', 'delete'])

// 카테고리 아이콘
function getCategoryIcon(category) {
  const icons = {
    '컷': 'ri-scissors-cut-line',
    '펌': 'ri-contrast-2-line',
    '염색': 'ri-palette-line',
    '클리닉': 'ri-heart-pulse-line',
    '기타': 'ri-more-line',
  }
  return icons[category] || 'ri-scissors-line'
}

// 카테고리 색상
function getCategoryColor(category) {
  const colors = {
    '컷': 'primary',
    '펌': 'info',
    '염색': 'warning',
    '클리닉': 'success',
    '기타': 'secondary',
  }
  return colors[category] || 'default'
}

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 수정 버튼
function handleEdit() {
  emit('edit', props.service)
}

// 삭제 버튼
function handleDelete() {
  emit('delete', props.service)
}
</script>
