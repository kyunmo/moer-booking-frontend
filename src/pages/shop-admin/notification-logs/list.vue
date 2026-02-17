<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-notification-3-line" size="24" class="me-3" />
        <span>알림 발송 이력</span>
      </VCardTitle>
    </VCard>

    <!-- 필터 -->
    <VCard class="mb-4">
      <VCardText>
        <VRow>
          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="filters.channel"
              :items="channelOptions"
              label="채널"
              density="compact"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="filters.status"
              :items="statusOptions"
              label="상태"
              density="compact"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="filters.size"
              :items="pageSizeOptions"
              label="표시 건수"
              density="compact"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- 알림 목록 -->
    <template v-else>
      <!-- 데이터 없음 -->
      <VCard v-if="logs.length === 0" class="mb-4">
        <VCardText class="text-center pa-10">
          <VIcon
            icon="ri-notification-off-line"
            size="64"
            class="mb-4 text-disabled"
          />
          <p class="text-h6 mb-2">발송 이력이 없습니다</p>
          <p class="text-disabled">
            예약 생성/변경/취소 시 알림이 자동 발송되며 이곳에 기록됩니다
          </p>
        </VCardText>
      </VCard>

      <!-- 알림 카드 목록 -->
      <VCard
        v-for="log in logs"
        :key="log.id"
        class="mb-3"
      >
        <VCardText>
          <div class="d-flex align-center flex-wrap gap-2">
            <!-- 채널 아이콘 -->
            <VAvatar
              :color="getChannelColor(log.channel)"
              size="40"
              class="me-2"
              variant="tonal"
            >
              <VIcon :icon="getChannelIcon(log.channel)" size="20" />
            </VAvatar>

            <!-- 수신자 정보 -->
            <div class="me-auto">
              <div class="d-flex align-center gap-2 flex-wrap">
                <span class="font-weight-bold text-body-1">{{ log.recipientName || '-' }}</span>
                <span class="text-disabled text-body-2">{{ log.recipientPhone }}</span>
              </div>
              <div class="text-body-2 mt-1">
                <VChip
                  size="x-small"
                  variant="tonal"
                  :color="getChannelColor(log.channel)"
                  class="me-2"
                >
                  {{ log.channel }}
                </VChip>
                <span class="text-disabled">{{ getTemplateLabel(log.templateType) }}</span>
              </div>
            </div>

            <!-- 상태 + 날짜 -->
            <div class="text-end">
              <VChip
                :color="getLogStatusColor(log.status)"
                size="small"
                variant="tonal"
              >
                {{ getLogStatusLabel(log.status) }}
              </VChip>
              <div class="text-disabled text-body-2 mt-1">
                {{ formatDate(log.sentAt || log.createdAt) }}
              </div>
            </div>
          </div>

          <!-- 제목 -->
          <div v-if="log.title" class="mt-2 text-body-2">
            {{ log.title }}
          </div>

          <!-- 에러 메시지 (실패 시) -->
          <VAlert
            v-if="log.status === 'FAILED' && log.errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ log.errorMessage }}
          </VAlert>
        </VCardText>
      </VCard>
    </template>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="d-flex justify-center mt-4">
      <VPagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        rounded
      />
    </div>
  </div>
</template>

<script setup>
import notificationLogsApi from '@/api/notification-logs'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref, watch } from 'vue'

const { error: showError } = useSnackbar()
const authStore = useAuthStore()

// 상태
const logs = ref([])
const loading = ref(false)
const totalElements = ref(0)
const currentPage = ref(1)

// 필터
const filters = ref({
  channel: '',
  status: '',
  size: 20,
})

const channelOptions = [
  { title: '전체', value: '' },
  { title: '카카오톡', value: 'KAKAO' },
  { title: 'SMS', value: 'SMS' },
  { title: '이메일', value: 'EMAIL' },
]

const statusOptions = [
  { title: '전체', value: '' },
  { title: '대기중', value: 'PENDING' },
  { title: '발송완료', value: 'SENT' },
  { title: '발송실패', value: 'FAILED' },
]

const pageSizeOptions = [
  { title: '10건', value: 10 },
  { title: '20건', value: 20 },
  { title: '50건', value: 50 },
]

// 페이지네이션
const totalPages = computed(() => {
  return Math.ceil(totalElements.value / filters.value.size)
})

// 알림 목록 조회
async function loadLogs() {
  const businessId = authStore.businessId
  if (!businessId) return

  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: filters.value.size,
    }

    if (filters.value.channel) params.channel = filters.value.channel
    if (filters.value.status) params.status = filters.value.status

    const { data } = await notificationLogsApi.getNotificationLogs(businessId, params)
    logs.value = data.content || []
    totalElements.value = data.pageInfo?.totalElements || 0
  }
  catch (error) {
    showError('알림 발송 이력 조회에 실패했습니다')
    console.error('알림 발송 이력 조회 실패:', error)
  }
  finally {
    loading.value = false
  }
}

// 필터 변경 시 자동 조회
watch(filters, () => {
  currentPage.value = 1
  loadLogs()
}, { deep: true })

// 페이지 변경 시 조회
watch(currentPage, () => {
  loadLogs()
})

// 유틸: 채널 아이콘
function getChannelIcon(channel) {
  const map = {
    KAKAO: 'ri-kakao-talk-fill',
    SMS: 'ri-message-2-line',
    EMAIL: 'ri-mail-line',
  }
  return map[channel] || 'ri-notification-3-line'
}

// 유틸: 채널 색상
function getChannelColor(channel) {
  const map = {
    KAKAO: 'warning',
    SMS: 'info',
    EMAIL: 'primary',
  }
  return map[channel] || 'secondary'
}

// 유틸: 템플릿 타입 라벨
function getTemplateLabel(templateType) {
  const map = {
    RESERVATION_CREATED: '예약 접수 알림',
    RESERVATION_CONFIRMED: '예약 확정 알림',
    RESERVATION_REMINDER: '예약 리마인더',
    RESERVATION_CHANGED: '예약 변경 알림',
    RESERVATION_CANCELLED: '예약 취소 알림',
    REVIEW_REQUEST: '리뷰 작성 요청',
  }
  return map[templateType] || templateType
}

// 유틸: 상태 색상
function getLogStatusColor(status) {
  const map = {
    PENDING: 'warning',
    SENT: 'success',
    FAILED: 'error',
  }
  return map[status] || 'default'
}

// 유틸: 상태 라벨
function getLogStatusLabel(status) {
  const map = {
    PENDING: '대기중',
    SENT: '발송완료',
    FAILED: '실패',
  }
  return map[status] || status
}

// 유틸: 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 마운트 시 조회
onMounted(() => {
  loadLogs()
})
</script>
