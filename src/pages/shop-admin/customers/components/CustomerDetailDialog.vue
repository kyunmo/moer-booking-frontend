<template>
  <VDialog
    :model-value="modelValue"
    max-width="700"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard v-if="customer">
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-user-line" size="24" class="me-3" />
        <span>고객 상세정보</span>

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

      <!-- 탭 -->
      <VTabs v-model="activeTab" grow>
        <VTab value="info">
          <VIcon icon="ri-user-line" class="me-2" />
          기본 정보
        </VTab>
        <VTab value="reservations">
          <VIcon icon="ri-calendar-line" class="me-2" />
          예약 이력
        </VTab>
      </VTabs>

      <VDivider />

      <!-- 탭 컨텐츠 -->
      <VWindow v-model="activeTab">
        <!-- Tab 1: 기본 정보 -->
        <VWindowItem value="info">
          <VCardText>
            <!-- 프로필 섹션 -->
            <div class="text-center mb-6">
              <VAvatar
                color="primary"
                size="80"
                class="mb-3"
              >
                <span class="text-h4">{{ getInitial(customer.name) }}</span>
              </VAvatar>

              <h5 class="text-h5 mb-2">{{ customer.name }}</h5>

              <div class="d-flex justify-center gap-2 mb-2">
                <VChip
                  v-if="customer.isVip"
                  color="warning"
                  size="small"
                  variant="tonal"
                >
                  <VIcon icon="ri-vip-crown-line" class="me-1" size="16" />
                  VIP
                </VChip>

                <VChip
                  v-if="customer.isRegular"
                  color="success"
                  size="small"
                  variant="tonal"
                >
                  <VIcon icon="ri-user-star-line" class="me-1" size="16" />
                  단골
                </VChip>

                <VChip
                  v-if="customer.isNew"
                  color="info"
                  size="small"
                  variant="tonal"
                >
                  <VIcon icon="ri-user-add-line" class="me-1" size="16" />
                  신규
                </VChip>
              </div>

              <!-- 커스텀 태그 -->
              <div v-if="customer.tags && customer.tags.length > 0" class="d-flex justify-center gap-1">
                <VChip
                  v-for="tag in customer.tags"
                  :key="tag"
                  size="small"
                >
                  {{ tag }}
                </VChip>
              </div>
            </div>

            <VDivider class="mb-4" />

            <!-- 연락처 정보 -->
            <div class="mb-6">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-contacts-line" class="me-2" />
                연락처 정보
              </h6>

              <VRow>
                <!-- 전화번호 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-phone-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">전화번호</p>
                      <p class="text-sm mb-0">{{ customer.phone }}</p>
                    </div>
                  </div>
                </VCol>

                <!-- 이메일 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-mail-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">이메일</p>
                      <p class="text-sm mb-0">{{ customer.email || '-' }}</p>
                    </div>
                  </div>
                </VCol>

                <!-- 생년월일 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-cake-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">생년월일</p>
                      <p class="text-sm mb-0">{{ formatDate(customer.birthDate) }}</p>
                    </div>
                  </div>
                </VCol>

                <!-- 성별 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon
                      :icon="customer.gender === 'MALE' ? 'ri-men-line' : 'ri-women-line'"
                      size="20"
                      class="me-3 text-disabled"
                    />
                    <div>
                      <p class="text-xs text-disabled mb-0">성별</p>
                      <p class="text-sm mb-0">{{ getGenderText(customer.gender) }}</p>
                    </div>
                  </div>
                </VCol>
              </VRow>
            </div>

            <VDivider class="mb-4" />

            <!-- 방문 통계 -->
            <div class="mb-6">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-bar-chart-line" class="me-2" />
                방문 통계
              </h6>

              <VRow>
                <!-- 방문 횟수 -->
                <VCol cols="12" sm="4">
                  <VCard variant="tonal" color="primary">
                    <VCardText class="text-center">
                      <VIcon icon="ri-calendar-check-line" size="32" class="mb-2" />
                      <p class="text-xs text-disabled mb-1">총 방문 횟수</p>
                      <h4 class="text-h4">{{ customer.visitCount || 0 }}회</h4>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- 총 결제액 -->
                <VCol cols="12" sm="4">
                  <VCard variant="tonal" color="success">
                    <VCardText class="text-center">
                      <VIcon icon="ri-money-dollar-circle-line" size="32" class="mb-2" />
                      <p class="text-xs text-disabled mb-1">총 결제액</p>
                      <h4 class="text-h4">{{ (customer.totalSpent || 0).toLocaleString() }}원</h4>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- 최근 방문일 -->
                <VCol cols="12" sm="4">
                  <VCard variant="tonal" color="info">
                    <VCardText class="text-center">
                      <VIcon icon="ri-time-line" size="32" class="mb-2" />
                      <p class="text-xs text-disabled mb-1">최근 방문</p>
                      <p class="text-sm font-weight-medium">{{ formatDate(customer.lastVisitDate) }}</p>
                      <p class="text-xs text-disabled">{{ getDaysAgo(customer.lastVisitDate) }}</p>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </div>

            <!-- 메모 -->
            <div v-if="customer.memo">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-file-text-line" class="me-2" />
                메모
              </h6>
              <VAlert
                color="info"
                variant="tonal"
                class="mb-0"
              >
                {{ customer.memo }}
              </VAlert>
            </div>

            <!-- 등록일 -->
            <div class="mt-4 text-center">
              <p class="text-xs text-disabled">
                등록일: {{ formatDateTime(customer.createdAt) }}
              </p>
            </div>
          </VCardText>
        </VWindowItem>

        <!-- Tab 2: 예약 이력 -->
        <VWindowItem value="reservations">
          <VCardText>
            <CustomerReservationTab
              v-if="customer?.id"
              :customer-id="customer.id"
            />
          </VCardText>
        </VWindowItem>
      </VWindow>

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
import { ref, watch } from 'vue'
import CustomerReservationTab from './CustomerReservationTab.vue'

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

const emit = defineEmits(['update:modelValue', 'edit', 'delete'])

const activeTab = ref('info')

// 다이얼로그가 열릴 때 기본 탭으로 리셋
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    activeTab.value = 'info'
  }
})

// 이니셜
function getInitial(name) {
  return name ? name.charAt(0) : '?'
}

// 성별 텍스트
function getGenderText(gender) {
  if (!gender) return '-'
  return gender === 'MALE' ? '남성' : '여성'
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

// 며칠 전
function getDaysAgo(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return `${Math.floor(diffDays / 365)}년 전`
}

// 수정 버튼
function handleEdit() {
  emit('edit', props.customer)
}

// 삭제 버튼
function handleDelete() {
  emit('delete', props.customer)
}
</script>
