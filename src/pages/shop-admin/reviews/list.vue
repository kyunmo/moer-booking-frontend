<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-chat-3-line" size="24" class="me-3" />
        <span>리뷰 관리</span>
      </VCardTitle>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="평균 평점"
          :value="statsAverageRating"
          icon="ri-star-fill"
          color="amber"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="총 리뷰"
          :value="`${reviewStore.stats?.totalReviews ?? 0}건`"
          icon="ri-chat-3-line"
          color="primary"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="미답변"
          :value="`${reviewStore.stats?.unrepliedCount ?? 0}건`"
          icon="ri-chat-new-line"
          color="warning"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="이번 달"
          :value="`${reviewStore.stats?.thisMonthCount ?? 0}건`"
          icon="ri-calendar-line"
          color="info"
        />
      </VCol>
    </VRow>

    <!-- 필터 -->
    <VCard class="mb-4">
      <VCardText>
        <VRow>
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
              v-model="filters.rating"
              :items="ratingOptions"
              label="별점"
              density="compact"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VTextField
              v-model="filters.startDate"
              label="시작일"
              type="date"
              density="compact"
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VTextField
              v-model="filters.endDate"
              label="종료일"
              type="date"
              density="compact"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 로딩 -->
    <div v-if="reviewStore.loading" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- 리뷰 목록 -->
    <template v-else>
      <!-- 데이터 없음 -->
      <VCard v-if="reviewStore.reviews.length === 0" class="mb-4">
        <EmptyState
          icon="ri-chat-3-line"
          title="등록된 리뷰가 없습니다"
          description="고객이 리뷰를 작성하면 이곳에 표시됩니다"
        />
      </VCard>

      <!-- 리뷰 카드 목록 -->
      <VCard
        v-for="review in reviewStore.reviews"
        :key="review.id"
        class="mb-4"
      >
        <VCardText>
          <!-- 헤더 행: 고객 정보 + 상태 + 날짜 -->
          <div class="d-flex align-center flex-wrap gap-2 mb-3">
            <VAvatar color="primary" size="36" class="me-2">
              <span class="text-sm">{{ getInitial(review.customerName) }}</span>
            </VAvatar>

            <div class="me-auto">
              <span class="font-weight-bold text-body-1">{{ review.customerName }}</span>
              <span class="text-disabled text-body-2 ms-2">{{ review.customerPhone }}</span>
            </div>

            <VChip
              :color="getStatusColor(review.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusLabel(review.status) }}
            </VChip>

            <span class="text-disabled text-body-2">
              {{ formatDate(review.createdAt) }}
            </span>
          </div>

          <!-- 평점 -->
          <VRating
            :model-value="review.rating"
            readonly
            size="small"
            color="amber"
            active-color="amber"
            density="compact"
            class="mb-2"
          />

          <!-- 리뷰 내용 -->
          <p class="text-body-1 mb-3">
            {{ review.content }}
          </p>

          <!-- 서비스 + 스태프 칩 -->
          <div class="d-flex flex-wrap gap-2 mb-3">
            <VChip
              v-if="review.serviceName"
              size="small"
              variant="outlined"
              prepend-icon="ri-scissors-line"
            >
              {{ review.serviceName }}
            </VChip>

            <VChip
              v-if="review.staffName"
              size="small"
              variant="outlined"
              prepend-icon="ri-user-line"
            >
              {{ review.staffName }}
            </VChip>
          </div>

          <!-- 삭제 사유 (삭제된 리뷰) -->
          <VAlert
            v-if="review.status === 'DELETED' && review.deleteReason"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            <strong>삭제 사유:</strong> {{ review.deleteReason }}
          </VAlert>

          <!-- 답변 표시 (답변 있는 경우) -->
          <VAlert
            v-if="review.isReplied && review.reply"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            <div class="d-flex align-center mb-1">
              <strong>관리자 답변</strong>
              <span class="text-disabled text-body-2 ms-2">
                {{ formatDate(review.reply.createdAt) }}
              </span>
            </div>
            <div>{{ review.reply.content }}</div>
          </VAlert>

          <!-- 액션 버튼 -->
          <div class="d-flex gap-2 mt-2">
            <VBtn
              v-if="!review.isReplied && review.status !== 'DELETED'"
              variant="outlined"
              size="small"
              color="primary"
              prepend-icon="ri-reply-line"
              @click="openReplyDialog(review)"
            >
              답변 작성
            </VBtn>

            <VBtn
              v-if="review.status !== 'DELETED'"
              variant="outlined"
              size="small"
              color="error"
              prepend-icon="ri-delete-bin-line"
              @click="openDeleteDialog(review)"
            >
              삭제
            </VBtn>
          </div>
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

    <!-- 답변 작성 다이얼로그 -->
    <VDialog v-model="isReplyDialogVisible" max-width="500" persistent>
      <VCard>
        <VCardTitle>답변 작성</VCardTitle>

        <VDivider />

        <VCardText>
          <VTextarea
            v-model="replyContent"
            label="답변 내용"
            :rules="[rules.required]"
            maxlength="500"
            counter
            rows="4"
            autofocus
          />
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="closeReplyDialog"
          >
            닫기
          </VBtn>
          <VBtn
            color="primary"
            :loading="replyLoading"
            :disabled="!replyContent.trim()"
            @click="submitReply"
          >
            등록
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="isDeleteDialogVisible" max-width="400" persistent>
      <VCard>
        <VCardTitle>리뷰를 삭제하시겠습니까?</VCardTitle>

        <VDivider />

        <VCardText>
          <VTextField
            v-model="deleteReason"
            label="삭제 사유 (선택)"
            density="compact"
          />
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="closeDeleteDialog"
          >
            닫기
          </VBtn>
          <VBtn
            color="error"
            :loading="deleteLoading"
            @click="submitDelete"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import StatisticsCard from '@/components/StatisticsCard.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useReviewStore } from '@/stores/review'
import { computed, onMounted, ref, watch } from 'vue'

const { success: showSuccess, error: showError } = useSnackbar()
const reviewStore = useReviewStore()

// 필터
const filters = ref({
  status: '',
  rating: '',
  startDate: '',
  endDate: '',
})

const statusOptions = [
  { title: '전체', value: '' },
  { title: '활성', value: 'ACTIVE' },
  { title: '숨김', value: 'HIDDEN' },
  { title: '삭제', value: 'DELETED' },
]

const ratingOptions = [
  { title: '전체', value: '' },
  { title: '5점', value: 5 },
  { title: '4점', value: 4 },
  { title: '3점', value: 3 },
  { title: '2점', value: 2 },
  { title: '1점', value: 1 },
]

// 페이지네이션
const PAGE_SIZE = 10
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil((reviewStore.totalCount || 0) / PAGE_SIZE)
})

// 통계 평균 평점
const statsAverageRating = computed(() => {
  const avg = reviewStore.stats?.averageRating
  if (avg == null) return '0.0'
  return `${Number(avg).toFixed(1)}점`
})

// 답변 다이얼로그
const isReplyDialogVisible = ref(false)
const replyContent = ref('')
const replyLoading = ref(false)
const selectedReviewForReply = ref(null)

// 삭제 다이얼로그
const isDeleteDialogVisible = ref(false)
const deleteReason = ref('')
const deleteLoading = ref(false)
const selectedReviewForDelete = ref(null)

// 유효성 규칙
const rules = {
  required: v => !!v?.trim() || '필수 입력',
}

// 에러 코드 매핑
const errorMessages = {
  RV004: '리뷰를 찾을 수 없습니다',
  RV005: '이미 답변이 등록된 리뷰입니다',
  RV006: '이미 삭제된 리뷰입니다',
}

// 리뷰 목록 조회
async function loadReviews() {
  const params = {
    page: currentPage.value,
    size: PAGE_SIZE,
  }

  if (filters.value.status) params.status = filters.value.status
  if (filters.value.rating) params.rating = filters.value.rating
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate

  try {
    await reviewStore.fetchReviews(params)
  }
  catch (error) {
    showError('리뷰 목록 조회에 실패했습니다')
  }
}

// 필터 변경 시 자동 조회
watch(filters, () => {
  currentPage.value = 1
  loadReviews()
}, { deep: true })

// 페이지 변경 시 조회
watch(currentPage, () => {
  loadReviews()
})

// 유틸: 이니셜
function getInitial(name) {
  return name ? name.charAt(0) : '?'
}

// 유틸: 상태 색상
function getStatusColor(status) {
  const map = {
    ACTIVE: 'success',
    HIDDEN: 'warning',
    DELETED: 'error',
  }
  return map[status] || 'default'
}

// 유틸: 상태 라벨
function getStatusLabel(status) {
  const map = {
    ACTIVE: '활성',
    HIDDEN: '숨김',
    DELETED: '삭제',
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

// 유틸: 에러 메시지 추출
function getErrorMessage(error, defaultMsg) {
  if (error?.code && errorMessages[error.code]) return errorMessages[error.code]
  return error?.message || defaultMsg
}

// 답변 다이얼로그
function openReplyDialog(review) {
  selectedReviewForReply.value = review
  replyContent.value = ''
  isReplyDialogVisible.value = true
}

function closeReplyDialog() {
  isReplyDialogVisible.value = false
  replyContent.value = ''
  selectedReviewForReply.value = null
}

async function submitReply() {
  if (!replyContent.value.trim() || !selectedReviewForReply.value) return

  replyLoading.value = true
  try {
    await reviewStore.replyReview(selectedReviewForReply.value.id, replyContent.value.trim())
    showSuccess('답변이 등록되었습니다')
    closeReplyDialog()
  }
  catch (error) {
    showError(getErrorMessage(error, '답변 등록에 실패했습니다'))
  }
  finally {
    replyLoading.value = false
  }
}

// 삭제 다이얼로그
function openDeleteDialog(review) {
  selectedReviewForDelete.value = review
  deleteReason.value = ''
  isDeleteDialogVisible.value = true
}

function closeDeleteDialog() {
  isDeleteDialogVisible.value = false
  deleteReason.value = ''
  selectedReviewForDelete.value = null
}

async function submitDelete() {
  if (!selectedReviewForDelete.value) return

  deleteLoading.value = true
  try {
    await reviewStore.deleteReview(selectedReviewForDelete.value.id, deleteReason.value)
    showSuccess('리뷰가 삭제되었습니다')
    closeDeleteDialog()
  }
  catch (error) {
    showError(getErrorMessage(error, '리뷰 삭제에 실패했습니다'))
  }
  finally {
    deleteLoading.value = false
  }
}

// 마운트 시 조회
onMounted(() => {
  loadReviews()
})
</script>
