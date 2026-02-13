<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard v-if="reservation">
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-calendar-check-line" size="24" class="me-3" />
        <span>예약 상세정보</span>
        
        <VSpacer />

        <VChip
          :color="getStatusColor(reservation.status)"
          variant="tonal"
          class="me-2"
        >
          {{ getStatusText(reservation.status) }}
        </VChip>
        
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
        <!-- 예약번호 -->
        <div class="text-center mb-6">
          <VChip
            color="primary"
            size="large"
            variant="tonal"
          >
            <VIcon icon="ri-ticket-line" class="me-2" />
            {{ reservation.reservationNumber }}
          </VChip>
        </div>

        <VDivider class="mb-4" />

        <!-- 예약 정보 -->
        <VRow class="mb-4">
          <!-- 예약 일시 -->
          <VCol cols="12" md="6">
            <h6 class="text-h6 mb-3">
              <VIcon icon="ri-calendar-line" class="me-2" />
              예약 일시
            </h6>
            <div class="d-flex align-center mb-2">
              <VIcon icon="ri-calendar-event-line" size="20" class="me-3 text-disabled" />
              <div>
                <p class="text-xs text-disabled mb-0">날짜</p>
                <p class="text-sm font-weight-medium mb-0">{{ formatDate(reservation.reservationDate) }}</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <VIcon icon="ri-time-line" size="20" class="me-3 text-disabled" />
              <div>
                <p class="text-xs text-disabled mb-0">시간</p>
                <p class="text-sm font-weight-medium mb-0">
                  {{ reservation.startTime }} - {{ reservation.endTime }}
                  <span class="text-xs text-disabled">({{ reservation.totalDuration }}분)</span>
                </p>
              </div>
            </div>
          </VCol>

          <!-- 고객 정보 -->
          <VCol cols="12" md="6">
            <h6 class="text-h6 mb-3">
              <VIcon icon="ri-user-line" class="me-2" />
              고객 정보
            </h6>
            <div class="d-flex align-center mb-2">
              <VAvatar
                color="primary"
                size="40"
                class="me-3"
              >
                <span>{{ getInitial(reservation.customerName) }}</span>
              </VAvatar>
              <div>
                <p class="font-weight-medium mb-0">{{ reservation.customerName || '-' }}</p>
                <p class="text-xs text-disabled mb-0">{{ reservation.customerPhone || '-' }}</p>
              </div>
            </div>
          </VCol>
        </VRow>

        <VDivider class="mb-4" />

        <!-- 서비스 & 직원 -->
        
        <VRow class="mb-4">
          <!-- 서비스 -->
          <VCol cols="12" md="6">
            <h6 class="text-h6 mb-3">
              <VIcon :icon="serviceIcon" class="me-2" />
              서비스
            </h6>
            <VList density="compact">
              <VListItem
                v-for="(serviceName, index) in reservation.serviceNames"
                :key="index"
              >
                <template #prepend>
                  <VIcon icon="ri-checkbox-circle-fill" color="primary" size="20" class="me-2" />
                </template>
                <VListItemTitle>{{ serviceName }}</VListItemTitle>
              </VListItem>
            </VList>
          </VCol>

          <!-- 담당 직원 -->
          <VCol cols="12" md="6">
            <h6 class="text-h6 mb-3">
              <VIcon icon="ri-user-star-line" class="me-2" />
              담당 직원
            </h6>

            <!-- 직원 배정됨 -->
            <div v-if="reservation.staffId" class="d-flex align-center">
              <VAvatar
                color="info"
                size="40"
                class="me-3"
              >
                <span>{{ getInitial(reservation.staffName) }}</span>
              </VAvatar>
              <div>
                <p class="font-weight-medium mb-0">{{ reservation.staffName }}</p>
                <p class="text-xs text-disabled mb-0">담당 직원</p>
              </div>
            </div>

            <!-- 직원 미배정 -->
            <div v-else>
              <VAlert
                type="warning"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                <div class="d-flex align-center">
                  <VIcon icon="ri-alert-line" size="20" class="me-2" />
                  <span class="text-sm">담당 직원이 배정되지 않았습니다</span>
                </div>
              </VAlert>

              <VBtn
                color="primary"
                variant="elevated"
                prepend-icon="ri-user-add-line"
                block
                @click="openAssignStaffDialog"
              >
                직원 배정하기
              </VBtn>
            </div>
          </VCol>
        </VRow>

        <VDivider class="mb-4" />

        <!-- 금액 정보 -->
        <div class="mb-4">
          <h6 class="text-h6 mb-3">
            <VIcon icon="ri-money-dollar-circle-line" class="me-2" />
            금액 정보
          </h6>
          <VCard variant="tonal" color="success">
            <VCardText class="d-flex align-center justify-space-between">
              <div>
                <p class="text-xs text-disabled mb-1">총 결제 금액</p>
                <h4 class="text-h4">{{ reservation.totalPrice.toLocaleString() }}원</h4>
              </div>
              <VIcon icon="ri-money-dollar-circle-fill" size="48" />
            </VCardText>
          </VCard>
        </div>

        <!-- 메모 -->
        <div v-if="reservation.customerMemo || reservation.staffMemo" class="mb-4">
          <h6 class="text-h6 mb-3">
            <VIcon icon="ri-file-text-line" class="me-2" />
            메모
          </h6>
          
          <VAlert
            v-if="reservation.customerMemo"
            color="info"
            variant="tonal"
            class="mb-2"
          >
            <div class="d-flex align-center mb-1">
              <VIcon icon="ri-user-line" size="16" class="me-1" />
              <span class="text-xs font-weight-medium">고객 요청사항</span>
            </div>
            <p class="text-sm mb-0">{{ reservation.customerMemo }}</p>
          </VAlert>

          <VAlert
            v-if="reservation.staffMemo"
            color="warning"
            variant="tonal"
          >
            <div class="d-flex align-center mb-1">
              <VIcon icon="ri-user-star-line" size="16" class="me-1" />
              <span class="text-xs font-weight-medium">직원 메모</span>
            </div>
            <p class="text-sm mb-0">{{ reservation.staffMemo }}</p>
          </VAlert>
        </div>

        <!-- 취소 정보 -->
        <div v-if="reservation.status === 'CANCELLED' && reservation.cancelReason" class="mb-4">
          <VAlert
            color="error"
            variant="tonal"
          >
            <div class="d-flex align-center mb-1">
              <VIcon icon="ri-error-warning-line" size="16" class="me-1" />
              <span class="text-xs font-weight-medium">취소 사유</span>
            </div>
            <p class="text-sm mb-0">{{ reservation.cancelReason }}</p>
            <p class="text-xs text-disabled mt-2 mb-0">
              취소일시: {{ formatDateTime(reservation.cancelledAt) }}
            </p>
          </VAlert>
        </div>

        <!-- 등록 정보 -->
        <div class="text-center">
          <p class="text-xs text-disabled">
            등록일: {{ formatDateTime(reservation.createdAt) }}
            <span v-if="reservation.updatedAt !== reservation.createdAt">
              | 수정일: {{ formatDateTime(reservation.updatedAt) }}
            </span>
          </p>
        </div>
      </VCardText>

      <VDivider />

      <!-- 액션 버튼 -->
      <VCardActions class="pa-4">
        <!-- 상태별 액션 버튼 -->
        <div class="d-flex gap-2">
          <VBtn
            v-if="reservation.status === 'PENDING'"
            color="primary"
            variant="outlined"
            size="small"
            @click="handleStatusChange('CONFIRMED')"
          >
            <VIcon icon="ri-check-line" class="me-1" />
            확정
          </VBtn>

          <VBtn
            v-if="reservation.status === 'CONFIRMED'"
            color="success"
            variant="outlined"
            size="small"
            @click="handleStatusChange('COMPLETED')"
          >
            <VIcon icon="ri-checkbox-circle-line" class="me-1" />
            완료
          </VBtn>

          <VBtn
            v-if="reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED'"
            color="error"
            variant="outlined"
            size="small"
            @click="handleCancel"
          >
            <VIcon icon="ri-close-circle-line" class="me-1" />
            취소
          </VBtn>
        </div>

        <VSpacer />

        <VBtn
          variant="outlined"
          @click="$emit('update:modelValue', false)"
        >
          닫기
        </VBtn>

        <VBtn
          v-if="reservation.status === 'PENDING' || reservation.status === 'CONFIRMED'"
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
import { useBusinessIcon } from '@/composables/useBusinessIcon'

const { serviceIcon } = useBusinessIcon()

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


const emit = defineEmits(['update:modelValue', 'edit', 'cancel', 'status-change', 'assign-staff'])


// 이니셜
function getInitial(name) {
  if (!name) return '?'
  return name.charAt(0)
}

// 상태 색상
function getStatusColor(status) {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'secondary',
  }
  return colors[status] || 'default'
}

// 상태 텍스트
function getStatusText(status) {
  const texts = {
    PENDING: '대기',
    CONFIRMED: '확정',
    COMPLETED: '완료',
    CANCELLED: '취소',
    NO_SHOW: '노쇼',
  }
  return texts[status] || status
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

// 날짜시간 포맷
function formatDateTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 수정 버튼
function handleEdit() {
  emit('edit', props.reservation)
}

// 취소 버튼
function handleCancel() {
  emit('cancel', props.reservation)
}

// 상태 변경
function handleStatusChange(newStatus) {
  emit('status-change', props.reservation.id, newStatus)
}

// 직원 배정 다이얼로그 열기
function openAssignStaffDialog() {
  emit('assign-staff', props.reservation)
}
</script>
