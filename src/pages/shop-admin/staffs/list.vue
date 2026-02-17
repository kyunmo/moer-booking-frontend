<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-team-line" size="24" class="me-3" />
        <span>스태프 관리</span>

        <VSpacer />

        <!-- 직급 관리 -->
        <VBtn
          variant="outlined"
          prepend-icon="ri-shield-star-line"
          class="me-2"
          @click="isPositionDialogVisible = true"
        >
          직급 관리
        </VBtn>

        <!-- 새 스태프 등록 -->
        <VTooltip
          v-if="!subscriptionStore.canAddStaff"
          location="bottom"
        >
          <template #activator="{ props }">
            <VBtn
              color="primary"
              prepend-icon="ri-user-add-line"
              disabled
              v-bind="props"
            >
              스태프 등록
            </VBtn>
          </template>
          <span>직원 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
        </VTooltip>
        <VBtn
          v-else
          color="primary"
          prepend-icon="ri-user-add-line"
          @click="openCreateDialog"
        >
          스태프 등록
        </VBtn>
      </VCardTitle>

      <!-- 검색 필터 -->
      <VCardText class="pb-4">
        <VRow dense>
          <!-- 이름 검색 -->
          <VCol cols="12" sm="6" md="3">
            <VTextField
              v-model="filters.name"
              placeholder="이름 검색"
              prepend-inner-icon="ri-search-line"
              density="compact"
              clearable
              hide-details
              @click:clear="filters.name = ''"
            />
          </VCol>

          <!-- 직급 필터 -->
          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="filters.positionId"
              placeholder="직급 전체"
              prepend-inner-icon="ri-shield-star-line"
              :items="positionFilterOptions"
              density="compact"
              clearable
              hide-details
            />
          </VCol>

          <!-- 전문분야 검색 -->
          <VCol cols="12" sm="6" md="3">
            <VTextField
              v-model="filters.specialty"
              placeholder="전문분야 검색"
              prepend-inner-icon="ri-star-line"
              density="compact"
              clearable
              hide-details
              @click:clear="filters.specialty = ''"
            />
          </VCol>

          <!-- 정렬 -->
          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="sortOption"
              prepend-inner-icon="ri-sort-desc"
              :items="sortOptions"
              density="compact"
              hide-details
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-team-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">전체 스태프</p>
              <h6 class="text-h6">{{ staffStore.staffs.length }}명</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-checkbox-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">활성 스태프</p>
              <h6 class="text-h6">{{ activeCount }}명</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="info">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-user-star-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">평균 경력</p>
              <h6 class="text-h6">{{ averageCareer }}년</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-briefcase-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">검색 결과</p>
              <h6 class="text-h6">{{ staffStore.staffs.length }}명</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 로딩 -->
    <div v-if="staffStore.loading" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- 스태프 카드 그리드 -->
    <div v-else-if="staffStore.staffs.length > 0">
      <VRow>
        <VCol
          v-for="staff in staffStore.staffs"
          :key="staff.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard class="staff-card">
            <!-- 프로필 섹션 -->
            <VCardText class="text-center pb-0">
              <!-- 프로필 이미지 -->
              <VAvatar
                :color="staff.profileImageUrl ? undefined : 'primary'"
                size="80"
                class="mb-3"
              >
                <VImg v-if="staff.profileImageUrl" :src="getImageUrl(staff.profileImageUrl)" />
                <span v-else class="text-h5">
                  {{ getInitial(staff.name) }}
                </span>
              </VAvatar>

              <!-- 이름 -->
              <h6 class="text-h6 mb-1">
                {{ staff.name }}
              </h6>

              <!-- 직급 -->
              <VChip
                v-if="staff.positionName || staff.position"
                :color="getPositionColor(staff.positionName || staff.position)"
                size="small"
                class="mb-2"
              >
                {{ staff.positionName || staff.position }}
              </VChip>

              <!-- 활성/비활성 -->
              <div class="mb-3">
                <VChip
                  :color="staff.isActive !== false ? 'success' : 'error'"
                  size="small"
                  variant="outlined"
                >
                  {{ staff.isActive !== false ? '근무중' : '휴직' }}
                </VChip>
              </div>
            </VCardText>

            <VDivider />

            <!-- 정보 섹션 -->
            <VCardText>
              <!-- 전화번호 -->
              <div v-if="staff.phone" class="d-flex align-center mb-2">
                <VIcon icon="ri-phone-line" size="18" class="me-2 text-disabled" />
                <span class="text-sm">{{ staff.phone }}</span>
              </div>

              <!-- 경력 -->
              <div class="d-flex align-center mb-2">
                <VIcon icon="ri-briefcase-line" size="18" class="me-2 text-disabled" />
                <span class="text-sm">{{ staff.careerYears || 0 }}년 경력</span>
              </div>

              <!-- 전문분야 -->
              <div v-if="staff.specialty" class="mt-3">
                <p class="text-xs text-disabled mb-1">전문분야</p>
                <div>
                  <VChip
                    v-for="(spec, index) in parseSpecialty(staff.specialty)"
                    :key="index"
                    size="small"
                    class="me-1 mb-1"
                  >
                    {{ spec }}
                  </VChip>
                </div>
              </div>

              <!-- 소개 -->
              <div v-if="staff.introduction" class="mt-3">
                <p class="text-xs text-disabled">
                  {{ truncateText(staff.introduction, 60) }}
                </p>
              </div>
            </VCardText>

            <VDivider />

            <!-- 액션 버튼 -->
            <VCardActions>
              <VBtn
                variant="text"
                size="small"
                @click="viewStaff(staff)"
              >
                <VIcon icon="ri-eye-line" class="me-1" />
                상세
              </VBtn>

              <VBtn
                variant="text"
                size="small"
                color="primary"
                @click="editStaff(staff)"
              >
                <VIcon icon="ri-edit-line" class="me-1" />
                수정
              </VBtn>

              <VSpacer />

              <VBtn
                icon
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(staff)"
              >
                <VIcon icon="ri-delete-bin-line" />
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- 데이터 없음 -->
    <VCard v-else>
      <EmptyState
        icon="ri-team-line"
        :title="hasActiveFilters ? '검색 결과가 없습니다' : '등록된 스태프가 없습니다'"
        :description="hasActiveFilters ? '다른 검색 조건을 시도해보세요' : '첫 스태프를 등록하고 예약을 시작하세요'"
      >
        <VBtn
          v-if="hasActiveFilters"
          variant="outlined"
          class="me-2"
          @click="clearFilters"
        >
          필터 초기화
        </VBtn>
        <VTooltip
          v-if="!subscriptionStore.canAddStaff && !hasActiveFilters"
          location="bottom"
        >
          <template #activator="{ props }">
            <VBtn
              color="primary"
              disabled
              v-bind="props"
            >
              <VIcon icon="ri-user-add-line" class="me-2" />
              스태프 등록하기
            </VBtn>
          </template>
          <span>직원 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
        </VTooltip>
        <VBtn
          v-else-if="!hasActiveFilters"
          color="primary"
          @click="openCreateDialog"
        >
          <VIcon icon="ri-user-add-line" class="me-2" />
          스태프 등록하기
        </VBtn>
      </EmptyState>
    </VCard>

    <!-- 직급 관리 다이얼로그 -->
    <PositionManageDialog
      v-model="isPositionDialogVisible"
      @updated="handlePositionUpdated"
    />

    <!-- 스태프 상세보기 다이얼로그 -->
    <StaffDetailDialog
      v-model="isDetailDialogVisible"
      :staff="selectedStaff"
      @edit="handleEditFromDetail"
      @delete="confirmDelete"
    />

    <!-- 스태프 등록/수정 다이얼로그 -->
    <StaffFormDialog
      v-model="isFormDialogVisible"
      :staff="staffToEdit"
      @saved="handleStaffSaved"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDeleteDialog
      v-model="isDeleteDialogVisible"
      title="스태프 삭제"
      :item-name="`${selectedStaff?.name} 스태프`"
      message="삭제된 스태프 정보는 복구할 수 없습니다."
      @confirm="deleteStaff"
    />
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDeleteDialog from '@/components/dialogs/ConfirmDeleteDialog.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useStaffStore } from '@/stores/staff'
import { useStaffPositionStore } from '@/stores/staff-position'
import { useSubscriptionStore } from '@/stores/subscription'
import { getImageUrl } from '@/utils/image'
import { useDebounceFn } from '@vueuse/core'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import PositionManageDialog from './components/PositionManageDialog.vue'
import StaffDetailDialog from './components/StaffDetailDialog.vue'
import StaffFormDialog from './components/StaffFormDialog.vue'

const { error: showError } = useSnackbar()
const staffStore = useStaffStore()
const staffPositionStore = useStaffPositionStore()
const subscriptionStore = useSubscriptionStore()

// Refs
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const isPositionDialogVisible = ref(false)
const selectedStaff = ref(null)
const staffToEdit = ref(null)

// 검색 필터
const filters = reactive({
  name: '',
  positionId: null,
  specialty: '',
})

// 정렬 옵션
const sortOption = ref('created_at:desc')

const sortOptions = [
  { title: '최근 등록순', value: 'created_at:desc' },
  { title: '이름순', value: 'name:asc' },
  { title: '경력 높은순', value: 'career_years:desc' },
  { title: '경력 낮은순', value: 'career_years:asc' },
  { title: '직급순', value: 'position:asc' },
]

// 직급 필터 옵션 (store에서 가져옴)
const positionFilterOptions = computed(() => staffPositionStore.positionOptions)

// 필터 활성 여부
const hasActiveFilters = computed(() => {
  return !!(filters.name || filters.positionId || filters.specialty)
})

// 통계
const activeCount = computed(() => {
  return staffStore.staffs.filter(s => s.isActive !== false).length
})

const averageCareer = computed(() => {
  if (staffStore.staffs.length === 0) return 0
  const total = staffStore.staffs.reduce((sum, s) => sum + (s.careerYears || 0), 0)

  return Math.round(total / staffStore.staffs.length)
})

// 서버 검색 실행
async function searchStaffs() {
  const [sortBy, sortOrder] = sortOption.value.split(':')

  const params = {}
  if (filters.name) params.name = filters.name
  if (filters.positionId) params.positionId = filters.positionId
  if (filters.specialty) params.specialty = filters.specialty
  params.sortBy = sortBy
  params.sortOrder = sortOrder

  await staffStore.fetchStaffs(params)
}

// 디바운스된 검색 (텍스트 입력용 300ms)
const debouncedSearch = useDebounceFn(searchStaffs, 300)

// 필터 변경 감지 → 검색 실행
watch(
  () => [filters.name, filters.specialty],
  () => debouncedSearch(),
)

// 즉시 실행 필터 (select)
watch(
  () => [filters.positionId, sortOption.value],
  () => searchStaffs(),
)

// 필터 초기화
function clearFilters() {
  filters.name = ''
  filters.positionId = null
  filters.specialty = ''
  sortOption.value = 'created_at:desc'
}

// 전문분야 파싱 (String → Array)
function parseSpecialty(specialty) {
  if (!specialty) return []

  return specialty.split(',').map(s => s.trim()).filter(Boolean)
}

// 이니셜
function getInitial(name) {
  return name ? name.charAt(0) : '?'
}

// 직급 색상
function getPositionColor(position) {
  const colors = {
    '원장': 'success',
    '실장': 'primary',
    '디자이너': 'info',
    '인턴': 'warning',
  }

  return colors[position] || 'default'
}

// 텍스트 자르기
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + '...'
}

// 스태프 상세보기
function viewStaff(staff) {
  selectedStaff.value = staff
  isDetailDialogVisible.value = true
}

// 스태프 수정
function editStaff(staff) {
  staffToEdit.value = staff
  isFormDialogVisible.value = true
}

// 상세보기에서 수정 버튼 클릭 시
function handleEditFromDetail(staff) {
  isDetailDialogVisible.value = false
  staffToEdit.value = staff
  isFormDialogVisible.value = true
}

// 새 스태프 등록
function openCreateDialog() {
  staffToEdit.value = null
  isFormDialogVisible.value = true
}

// 삭제 확인
function confirmDelete(staff) {
  selectedStaff.value = staff
  isDetailDialogVisible.value = false
  isDeleteDialogVisible.value = true
}

// 스태프 삭제
async function deleteStaff() {
  if (!selectedStaff.value) return

  try {
    await staffStore.deleteStaff(selectedStaff.value.id)
    isDeleteDialogVisible.value = false
    selectedStaff.value = null
  }
  catch (error) {
    console.error('스태프 삭제 실패:', error)
    showError(error.message || '스태프 삭제에 실패했습니다.')
  }
}

// 직급 변경 후
async function handlePositionUpdated() {
  await staffPositionStore.fetchPositions(true)
  await searchStaffs()
}

// 스태프 저장 후
async function handleStaffSaved() {
  isFormDialogVisible.value = false
  staffToEdit.value = null
  await searchStaffs()
}

// 컴포넌트 마운트 시
onMounted(async () => {
  await Promise.all([
    searchStaffs(),
    staffPositionStore.fetchPositions(),
    subscriptionStore.fetchSubscriptionInfo(),
  ])
})
</script>

<style scoped>
.staff-card {
  block-size: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.staff-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 10%);
  transform: translateY(-4px);
}
</style>
