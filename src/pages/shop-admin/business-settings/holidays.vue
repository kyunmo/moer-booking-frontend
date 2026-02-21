<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2" :class="{ 'flex-wrap ga-2': smAndDown }">
        <VIcon icon="ri-calendar-close-line" size="24" class="me-3" />
        <span>휴무일 관리</span>

        <VSpacer />

        <!-- 연도 선택 -->
        <VSelect
          v-model="selectedYear"
          :items="yearOptions"
          density="compact"
          :style="smAndDown ? 'max-inline-size: 110px;' : 'max-inline-size: 150px;'"
          class="me-3"
          hide-details
          @update:model-value="loadHolidays"
        />

        <!-- 휴무일 추가 -->
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          :size="smAndDown ? 'small' : 'default'"
          @click="openCreateDialog"
        >
          휴무일 추가
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="4">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-calendar-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">전체 휴무일</p>
              <h6 class="text-h6">{{ settingsStore.holidays.length }}일</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="4">
        <VCard variant="tonal" color="success">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-calendar-check-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">정기 휴무</p>
              <h6 class="text-h6">{{ regularHolidays.length }}일</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="4">
        <VCard variant="tonal" color="warning">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-calendar-event-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">임시 휴무</p>
              <h6 class="text-h6">{{ temporaryHolidays.length }}일</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 휴무일 목록 -->
    <VCard>
      <!-- 로딩 -->
      <div v-if="settingsStore.loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 모바일 카드 뷰 -->
      <template v-else-if="smAndDown">
        <!-- 데이터 없음 -->
        <template v-if="sortedHolidays.length === 0">
          <EmptyState
            icon="ri-calendar-line"
            title="등록된 휴무일이 없습니다"
            description="휴무일을 추가하세요"
            action-label="휴무일 추가하기"
            action-icon="ri-add-line"
            @action="openCreateDialog"
          />
        </template>

        <!-- 카드 리스트 -->
        <div v-else class="pa-3 d-flex flex-column gap-3">
          <VCard
            v-for="item in paginatedHolidays"
            :key="item.id"
            variant="outlined"
            class="holiday-mobile-card"
          >
            <VCardText class="pa-3">
              <!-- 상단: 날짜 + 유형 칩 -->
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <div class="font-weight-medium text-body-1">{{ formatDate(item.date) }}</div>
                  <div class="text-xs text-disabled">{{ getDayOfWeek(item.date) }}</div>
                </div>
                <VChip
                  :color="getTypeColor(item.type)"
                  size="small"
                  variant="tonal"
                >
                  {{ getTypeText(item.type) }}
                </VChip>
              </div>

              <VDivider class="mb-2" />

              <!-- 중단: 휴무일 정보 -->
              <div class="d-flex flex-column gap-1">
                <div class="d-flex align-center text-body-2">
                  <VIcon icon="ri-text" size="16" class="me-2 text-disabled" />
                  <span class="font-weight-medium">{{ item.name }}</span>
                </div>

                <div v-if="item.reason" class="d-flex align-center text-body-2">
                  <VIcon icon="ri-chat-3-line" size="16" class="me-2 text-disabled" />
                  <span class="text-disabled">{{ item.reason }}</span>
                </div>
              </div>

              <!-- 하단: 액션 버튼 -->
              <div class="mt-2 d-flex justify-end">
                <VBtn
                  variant="tonal"
                  color="error"
                  size="small"
                  prepend-icon="ri-delete-bin-line"
                  @click="confirmDelete(item)"
                >
                  삭제
                </VBtn>
              </div>
            </VCardText>
          </VCard>

          <!-- 모바일 페이지네이션 -->
          <div
            v-if="mobileTotalPages > 1"
            class="d-flex justify-center pt-2 pb-1"
          >
            <VPagination
              v-model="mobilePage"
              :length="mobileTotalPages"
              :total-visible="5"
              density="compact"
              size="small"
            />
          </div>
        </div>
      </template>

      <!-- 데스크톱 테이블 -->
      <VDataTable
        v-else
        :headers="headers"
        :items="sortedHolidays"
        :items-per-page="15"
        class="holiday-table"
      >
        <!-- 날짜 -->
        <template #item.date="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatDate(item.date) }}</div>
            <div class="text-xs text-disabled">{{ getDayOfWeek(item.date) }}</div>
          </div>
        </template>

        <!-- 이름 -->
        <template #item.name="{ item }">
          <div class="font-weight-medium">{{ item.name }}</div>
        </template>

        <!-- 유형 -->
        <template #item.type="{ item }">
          <VChip
            :color="getTypeColor(item.type)"
            size="small"
            variant="tonal"
          >
            {{ getTypeText(item.type) }}
          </VChip>
        </template>

        <!-- 사유 -->
        <template #item.reason="{ item }">
          <span class="text-sm">{{ item.reason || '-' }}</span>
        </template>

        <!-- 액션 -->
        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            @click="confirmDelete(item)"
          >
            <VIcon icon="ri-delete-bin-line" />
            <VTooltip activator="parent" location="top">
              삭제
            </VTooltip>
          </VBtn>
        </template>

        <!-- 데이터 없음 -->
        <template #no-data>
          <EmptyState
            icon="ri-calendar-line"
            title="등록된 휴무일이 없습니다"
            description="휴무일을 추가하세요"
            action-label="휴무일 추가하기"
            action-icon="ri-add-line"
            @action="openCreateDialog"
          />
        </template>
      </VDataTable>
    </VCard>

    <!-- 휴무일 추가 다이얼로그 -->
    <VDialog
      v-model="isDialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center pe-2">
          <VIcon icon="ri-calendar-close-line" size="24" class="me-3" />
          <span>휴무일 추가</span>
          
          <VSpacer />
          
          <VBtn
            icon
            variant="text"
            size="small"
            @click="isDialogVisible = false"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VForm ref="formRef" @submit.prevent="handleSubmit">
            <VRow>
              <!-- 날짜 -->
              <VCol cols="12">
                <VTextField
                  v-model="form.date"
                  label="날짜 *"
                  type="date"
                  prepend-inner-icon="ri-calendar-line"
                  :rules="[required]"
                  required
                />
              </VCol>

              <!-- 이름 -->
              <VCol cols="12">
                <VTextField
                  v-model="form.name"
                  label="휴무일 이름 *"
                  placeholder="예: 설날, 임시 휴무"
                  prepend-inner-icon="ri-text"
                  :rules="[required]"
                  required
                />
              </VCol>

              <!-- 유형 -->
              <VCol cols="12">
                <VSelect
                  v-model="form.type"
                  label="유형 *"
                  prepend-inner-icon="ri-list-check"
                  :items="typeOptions"
                  :rules="[required]"
                  required
                />
              </VCol>

              <!-- 사유 -->
              <VCol cols="12">
                <VTextarea
                  v-model="form.reason"
                  label="사유"
                  placeholder="휴무 사유를 입력하세요 (선택)"
                  rows="3"
                  counter
                  maxlength="200"
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

        <VCardActions class="pa-4">
          <VSpacer />
          
          <VBtn
            variant="outlined"
            @click="isDialogVisible = false"
          >
            취소
          </VBtn>

          <VBtn
            color="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            추가
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDeleteDialog
      v-model="isDeleteDialogVisible"
      title="휴무일 삭제"
      :item-name="`${selectedHoliday?.name} (${formatDate(selectedHoliday?.date)})`"
      message="삭제된 휴무일은 복구할 수 없습니다."
      :loading="loading"
      @confirm="deleteHoliday"
    />
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDeleteDialog from '@/components/dialogs/ConfirmDeleteDialog.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

const { error: showError } = useSnackbar()
const settingsStore = useBusinessSettingsStore()
const { smAndDown } = useDisplay()

const formRef = ref(null)
const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedHoliday = ref(null)
const loading = ref(false)
const errorMessage = ref('')

// 모바일 페이지네이션
const mobilePage = ref(1)
const mobileItemsPerPage = 15

// 현재 연도
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

// 연도 옵션
const yearOptions = ref([
  currentYear - 1,
  currentYear,
  currentYear + 1,
  currentYear + 2,
])

// 테이블 헤더
const headers = [
  { title: '날짜', key: 'date', sortable: true },
  { title: '이름', key: 'name', sortable: true },
  { title: '유형', key: 'type', sortable: true, align: 'center' },
  { title: '사유', key: 'reason', sortable: false },
  { title: '액션', key: 'actions', sortable: false, align: 'center' },
]

// 폼
const form = ref({
  name: '',
  date: '',
  type: 'REGULAR',
  reason: '',
})

// 유형 옵션
const typeOptions = [
  { title: '정기 휴무', value: 'REGULAR' },
  { title: '임시 휴무', value: 'TEMPORARY' },
  { title: '공휴일', value: 'NATIONAL' },
]

// 정렬된 휴무일
const sortedHolidays = computed(() => {
  return [...settingsStore.holidays].sort((a, b) => {
    return new Date(a.date) - new Date(b.date)
  })
})

// 모바일 페이지네이션 총 페이지 수
const mobileTotalPages = computed(() =>
  Math.ceil(sortedHolidays.value.length / mobileItemsPerPage),
)

// 페이지네이션된 휴무일 (모바일)
const paginatedHolidays = computed(() => {
  const start = (mobilePage.value - 1) * mobileItemsPerPage
  return sortedHolidays.value.slice(start, start + mobileItemsPerPage)
})

// 정기 휴무
const regularHolidays = computed(() => {
  return settingsStore.holidays.filter(h => h.type === 'REGULAR')
})

// 임시 휴무
const temporaryHolidays = computed(() => {
  return settingsStore.holidays.filter(h => h.type === 'TEMPORARY')
})

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

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

// 요일
function getDayOfWeek(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${days[date.getDay()]}요일`
}

// 유형 색상
function getTypeColor(type) {
  const colors = {
    REGULAR: 'success',
    TEMPORARY: 'warning',
    NATIONAL: 'info',
  }
  return colors[type] || 'default'
}

// 유형 텍스트
function getTypeText(type) {
  const texts = {
    REGULAR: '정기',
    TEMPORARY: '임시',
    NATIONAL: '공휴일',
  }
  return texts[type] || type
}

// 휴무일 추가 다이얼로그 열기
function openCreateDialog() {
  form.value = {
    name: '',
    date: '',
    type: 'REGULAR',
    reason: '',
  }
  errorMessage.value = ''
  isDialogVisible.value = true
}

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  errorMessage.value = ''
  loading.value = true

  try {
    await settingsStore.createHoliday(form.value)
    isDialogVisible.value = false
    await loadHolidays()
  }
  catch (error) {
    errorMessage.value = error.response?.data?.message || '휴무일 추가에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}

// 삭제 확인
function confirmDelete(holiday) {
  selectedHoliday.value = holiday
  isDeleteDialogVisible.value = true
}

// 휴무일 삭제
async function deleteHoliday() {
  if (!selectedHoliday.value) return

  loading.value = true

  try {
    await settingsStore.deleteHoliday(selectedHoliday.value.id)
    isDeleteDialogVisible.value = false
    selectedHoliday.value = null
  }
  catch (error) {
    showError(error.message || '휴무일 삭제에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}

// 휴무일 로드
async function loadHolidays() {
  try {
    await settingsStore.fetchHolidays(selectedYear.value)
  }
  catch (error) {
    // 휴무일 조회 실패
  }
}

// 컴포넌트 마운트 시
onMounted(() => {
  loadHolidays()
})
</script>

<style scoped>
.holiday-table :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.holiday-mobile-card {
  transition: all 0.2s ease;
}

.holiday-mobile-card:hover,
.holiday-mobile-card:active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
