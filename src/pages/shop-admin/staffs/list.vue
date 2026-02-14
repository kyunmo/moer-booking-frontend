<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-team-line" size="24" class="me-3" />
        <span>스태프 관리</span>

        <VSpacer />

        <!-- 검색 -->
        <VTextField
          v-model="searchQuery"
          placeholder="이름 검색"
          prepend-inner-icon="ri-search-line"
          density="compact"
          style="max-inline-size: 250px;"
          class="me-3"
          clearable
        />

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
              <h6 class="text-h6">{{ staffStore.activeStaffs.length }}명</h6>
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
              <p class="text-xs mb-1">총 서비스</p>
              <h6 class="text-h6">{{ staffStore.staffs.reduce((sum, s) => sum + (s.serviceCount || 0), 0) }}건</h6>
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
    <div v-else-if="filteredStaffs.length > 0">
      <VRow>
        <VCol
          v-for="staff in filteredStaffs"
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
                :image="staff.profileImageUrl"
                size="80"
                class="mb-3"
              >
                <span v-if="!staff.profileImageUrl" class="text-h5">
                  {{ getInitial(staff.name) }}
                </span>
              </VAvatar>

              <!-- 이름 -->
              <h6 class="text-h6 mb-1">
                {{ staff.name }}
              </h6>

              <!-- 직급 -->
              <VChip
                v-if="staff.position"
                :color="getPositionColor(staff.position)"
                size="small"
                class="mb-2"
              >
                {{ staff.position }}
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
      <VCardText class="text-center pa-10">
        <VIcon
          icon="ri-team-line"
          size="64"
          class="mb-4 text-disabled"
        />
        <p class="text-h6 mb-2">등록된 스태프가 없습니다</p>
        <p class="text-disabled mb-4">
          첫 스태프를 등록하고 예약을 시작하세요
        </p>
        <VTooltip
          v-if="!subscriptionStore.canAddStaff"
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
          v-else
          color="primary"
          @click="openCreateDialog"
        >
          <VIcon icon="ri-user-add-line" class="me-2" />
          스태프 등록하기
        </VBtn>
      </VCardText>
    </VCard>

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
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>스태프 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ selectedStaff?.name }}</strong> 스태프를 삭제하시겠습니까?
          </p>
          <p class="text-error text-sm mt-2">
            ⚠️ 삭제된 스태프 정보는 복구할 수 없습니다.
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
            @click="deleteStaff"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useStaffStore } from '@/stores/staff'
import { useSubscriptionStore } from '@/stores/subscription'
import { computed, onMounted, ref } from 'vue'
import StaffDetailDialog from './components/StaffDetailDialog.vue'
import StaffFormDialog from './components/StaffFormDialog.vue'

const staffStore = useStaffStore()
const subscriptionStore = useSubscriptionStore()

// Refs
const searchQuery = ref('')
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedStaff = ref(null)
const staffToEdit = ref(null)

// 검색 필터링
const filteredStaffs = computed(() => {
  if (!searchQuery.value) return staffStore.staffs
  
  const query = searchQuery.value.toLowerCase()
  return staffStore.staffs.filter(s => 
    s.name.toLowerCase().includes(query),
  )
})

// 평균 경력
const averageCareer = computed(() => {
  if (staffStore.staffs.length === 0) return 0
  const total = staffStore.staffs.reduce((sum, s) => sum + (s.careerYears || 0), 0)
  return Math.round(total / staffStore.staffs.length)
})

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
    alert(error.response?.data?.message || '스태프 삭제에 실패했습니다.')
  }
}

// 스태프 저장 후
async function handleStaffSaved() {
  isFormDialogVisible.value = false
  staffToEdit.value = null
  await staffStore.fetchStaffs()
}

// 컴포넌트 마운트 시
onMounted(async () => {
  await staffStore.fetchStaffs()
  await subscriptionStore.fetchSubscriptionInfo()
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
