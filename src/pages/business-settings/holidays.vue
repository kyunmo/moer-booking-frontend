<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-calendar-close-line" size="24" class="me-3" />
        <span>휴무일 설정</span>

        <VSpacer />

        <!-- 연도 선택 -->
        <VSelect
          v-model="selectedYear"
          :items="yearOptions"
          label="연도"
          density="compact"
          style="max-inline-size: 150px;"
          class="me-3"
          @update:model-value="loadHolidays"
        />

        <!-- 휴무일 추가 -->
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openHolidayDialog"
        >
          휴무일 추가
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- 통계 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="4">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-calendar-close-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">총 휴무일</p>
              <h6 class="text-h6">{{ settingsStore.holidays.length }}일</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard variant="tonal" color="info">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-calendar-event-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">정기 휴무</p>
              <h6 class="text-h6">{{ regularHolidays.length }}일</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard variant="tonal" color="warning">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-calendar-check-line" size="32" class="me-3" />
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
      <VCardText>
        <!-- 로딩 -->
        <div v-if="settingsStore.loading" class="text-center pa-10">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <!-- 휴무일 목록 -->
        <div v-else-if="settingsStore.holidays.length > 0">
          <VList>
            <VListItem
              v-for="holiday in sortedHolidays"
              :key="holiday.id"
              class="mb-2"
            >
              <template #prepend>
                <VAvatar
                  :color="getHolidayTypeColor(holiday.type)"
                  variant="tonal"
                  size="40"
                >
                  <VIcon :icon="getHolidayTypeIcon(holiday.type)" />
                </VAvatar>
              </template>

              <VListItemTitle class="font-weight-medium">
                {{ holiday.name }}
              </VListItemTitle>

              <VListItemSubtitle>
                <div class="d-flex align-center mt-1">
                  <VIcon icon="ri-calendar-line" size="16" class="me-1" />
                  {{ formatDate(holiday.date) }}
                  <VChip
                    :color="getHolidayTypeColor(holiday.type)"
                    size="small"
                    class="ms-2"
                  >
                    {{ getHolidayTypeText(holiday.type) }}
                  </VChip>
                </div>
                <div v-if="holiday.description" class="text-xs text-disabled mt-1">
                  {{ holiday.description }}
                </div>
              </VListItemSubtitle>

              <template #append>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(holiday)"
                >
                  <VIcon icon="ri-delete-bin-line" />
                </VBtn>
              </template>
            </VListItem>
          </VList>
        </div>

        <!-- 데이터 없음 -->
        <div v-else class="text-center pa-10">
          <VIcon
            icon="ri-calendar-close-line"
            size="64"
            class="mb-4 text-disabled"
          />
          <p class="text-h6 mb-2">등록된 휴무일이 없습니다</p>
          <p class="text-disabled mb-4">
            {{ selectedYear }}년의 휴무일을 추가하세요
          </p>
          <VBtn
            color="primary"
            @click="openHolidayDialog"
          >
            <VIcon icon="ri-add-line" class="me-2" />
            휴무일 추가
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- 휴무일 추가 다이얼로그 -->
    <VDialog
      v-model="isDialogVisible"
      max-width="500"
      persistent
    >
      <VCard>
        <VCardTitle>휴무일 추가</VCardTitle>

        <VDivider />

        <VCardText>
          <VForm ref="formRef">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="form.name"
                  label="휴무일명"
                  prepend-inner-icon="ri-text"
                  placeholder="예: 설날, 정기휴무"
                  :rules="[required]"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="form.date"
                  label="날짜"
                  type="date"
                  prepend-inner-icon="ri-calendar-line"
                  :rules="[required]"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="form.type"
                  label="유형"
                  :items="typeOptions"
                  prepend-inner-icon="ri-bookmark-line"
                  :rules="[required]"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="form.description"
                  label="설명"
                  prepend-inner-icon="ri-file-text-line"
                  placeholder="휴무 사유나 기타 메모를 입력하세요"
                  rows="3"
                  auto-grow
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
            :loading="settingsStore.loading"
            @click="handleSubmit"
          >
            추가
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>휴무일 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ selectedHoliday?.name }}</strong> 휴무일을 삭제하시겠습니까?
          </p>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="isDeleteDialogVisible = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            @click="deleteHoliday"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { computed, onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()

const formRef = ref(null)
const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedHoliday = ref(null)

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

// 폼
const form = ref({
  name: '',
  date: '',
  type: 'REGULAR',
  description: '',
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
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

// 휴무일 유형 색상
function getHolidayTypeColor(type) {
  const colors = {
    REGULAR: 'primary',
    TEMPORARY: 'warning',
    NATIONAL: 'error',
  }
  return colors[type] || 'default'
}

// 휴무일 유형 아이콘
function getHolidayTypeIcon(type) {
  const icons = {
    REGULAR: 'ri-calendar-line',
    TEMPORARY: 'ri-calendar-close-line',
    NATIONAL: 'ri-flag-line',
  }
  return icons[type] || 'ri-calendar-line'
}

// 휴무일 유형 텍스트
function getHolidayTypeText(type) {
  const texts = {
    REGULAR: '정기 휴무',
    TEMPORARY: '임시 휴무',
    NATIONAL: '공휴일',
  }
  return texts[type] || type
}

// 휴무일 추가 다이얼로그 열기
function openHolidayDialog() {
  form.value = {
    name: '',
    date: '',
    type: 'REGULAR',
    description: '',
  }
  isDialogVisible.value = true
}

// 다이얼로그 닫기
function closeDialog() {
  isDialogVisible.value = false
}

// 휴무일 추가
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    await settingsStore.createHoliday(form.value)
    isDialogVisible.value = false
  }
  catch (error) {
    console.error('휴무일 추가 실패:', error)
    alert(error || '휴무일 추가에 실패했습니다.')
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

  try {
    await settingsStore.deleteHoliday(selectedHoliday.value.id)
    isDeleteDialogVisible.value = false
  }
  catch (error) {
    console.error('휴무일 삭제 실패:', error)
    alert(error || '휴무일 삭제에 실패했습니다.')
  }
}

// 휴무일 로드
async function loadHolidays() {
  try {
    await settingsStore.fetchHolidays(selectedYear.value)
  }
  catch (error) {
    console.error('휴무일 조회 실패:', error)
  }
}

// 컴포넌트 마운트 시
onMounted(() => {
  loadHolidays()
})
</script>
