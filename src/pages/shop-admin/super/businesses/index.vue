<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex align-center">
          <div>
            <h4 class="text-h4 font-weight-medium mb-1">
              매장 관리
            </h4>
            <p class="text-body-2 mb-0">
              전체 매장을 조회, 수정, 삭제할 수 있습니다
            </p>
          </div>

          <VSpacer />

          <VBtn
            color="primary"
            prepend-icon="ri-refresh-line"
            @click="loadBusinesses"
          >
            새로고침
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- 필터 -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VTextField
              v-model="filters.keyword"
              label="검색"
              placeholder="매장명 검색"
              prepend-inner-icon="ri-search-line"
              clearable
              @keyup.enter="handleSearch"
            />
          </VCol>

          <VCol cols="12" md="3">
            <VSelect
              v-model="filters.businessType"
              label="업종"
              :items="businessTypes"
              clearable
            />
          </VCol>

          <VCol cols="12" md="3">
            <VSelect
              v-model="filters.status"
              label="상태"
              :items="statusOptions"
              clearable
            />
          </VCol>

          <VCol cols="12" md="2">
            <VBtn
              block
              color="primary"
              @click="handleSearch"
            >
              검색
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 매장 목록 -->
    <VCard>
      <VCardTitle class="d-flex align-center">
        <span>매장 목록 ({{ pagination.totalElements }}개)</span>

        <VSpacer />

        <!-- 일괄 작업 -->
        <VMenu v-if="selected.length > 0">
          <template #activator="{ props }">
            <VBtn
              color="primary"
              variant="tonal"
              v-bind="props"
            >
              일괄 작업 ({{ selected.length }}개)
              <VIcon icon="ri-arrow-down-s-line" end />
            </VBtn>
          </template>

          <VList>
            <VListItem @click="handleBulkStatusChange('ACTIVE')">
              <template #prepend>
                <VIcon icon="ri-check-line" />
              </template>
              <VListItemTitle>활성화</VListItemTitle>
            </VListItem>

            <VListItem @click="handleBulkStatusChange('INACTIVE')">
              <template #prepend>
                <VIcon icon="ri-close-line" />
              </template>
              <VListItemTitle>비활성화</VListItemTitle>
            </VListItem>

            <VListItem @click="handleBulkStatusChange('SUSPENDED')">
              <template #prepend>
                <VIcon icon="ri-pause-line" />
              </template>
              <VListItemTitle>정지</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </VCardTitle>

      <VDivider />

      <!-- 로딩 -->
      <div v-if="loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 에러 -->
      <VAlert v-else-if="error" type="error" variant="tonal" class="ma-4">
        {{ error }}
      </VAlert>

      <!-- 테이블 -->
      <VTable v-else class="text-no-wrap">
        <thead>
          <tr>
            <th>
              <VCheckbox
                :model-value="isAllSelected"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th>ID</th>
            <th>매장명</th>
            <th>업종</th>
            <th>사장님</th>
            <th>상태</th>
            <th>생성일</th>
            <th class="text-center">액션</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="businesses.length === 0">
            <td colspan="8" class="text-center pa-6">
              매장이 없습니다
            </td>
          </tr>

          <tr v-for="business in businesses" :key="business.id">
            <td>
              <VCheckbox
                :model-value="selected.includes(business.id)"
                @update:model-value="toggleSelect(business.id)"
              />
            </td>

            <td>{{ business.id }}</td>

            <td class="font-weight-medium">
              {{ business.name }}
            </td>

            <td>
              <VChip size="small" variant="tonal">
                {{ getBusinessTypeLabel(business.businessType) }}
              </VChip>
            </td>

            <td>{{ business.ownerName || '-' }}</td>

            <td>
              <VChip
                :color="getStatusColor(business.status)"
                size="small"
                variant="tonal"
              >
                {{ getStatusLabel(business.status) }}
              </VChip>
            </td>

            <td>{{ formatDate(business.createdAt) }}</td>

            <td class="text-center">
              <VMenu>
                <template #activator="{ props }">
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    v-bind="props"
                  >
                    <VIcon icon="ri-more-2-fill" />
                  </VBtn>
                </template>

                <VList>
                  <VListItem @click="handleDelete(business, false)">
                    <template #prepend>
                      <VIcon icon="ri-delete-bin-line" />
                    </template>
                    <VListItemTitle>소프트 삭제</VListItemTitle>
                  </VListItem>

                  <VListItem @click="handleDelete(business, true)">
                    <template #prepend>
                      <VIcon icon="ri-delete-bin-line" color="error" />
                    </template>
                    <VListItemTitle class="text-error">
                      하드 삭제
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </td>
          </tr>
        </tbody>
      </VTable>

      <!-- 페이지네이션 -->
      <VCardText v-if="pagination.totalPages > 1">
        <VPagination
          v-model="currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          @update:model-value="handlePageChange"
        />
      </VCardText>
    </VCard>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h5">
          {{ deleteHard ? '하드 삭제' : '소프트 삭제' }}
        </VCardTitle>

        <VCardText>
          <VAlert
            :type="deleteHard ? 'error' : 'warning'"
            variant="tonal"
            class="mb-4"
          >
            <VAlertTitle>
              {{ deleteHard ? '복구 불가능' : '주의' }}
            </VAlertTitle>
            <template v-if="deleteHard">
              매장 및 관련된 모든 데이터가 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </template>
            <template v-else>
              매장 정보만 삭제되며, 설정은 유지됩니다.
            </template>
          </VAlert>

          <p class="mb-4">
            <strong>{{ deleteTarget?.name }}</strong> 매장을 삭제하시겠습니까?
          </p>

          <VTextField
            v-if="deleteHard"
            v-model="deleteConfirmText"
            label="'DELETE'를 입력하세요"
            placeholder="DELETE"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn @click="deleteDialog = false">
            취소
          </VBtn>
          <VBtn
            :color="deleteHard ? 'error' : 'warning'"
            :disabled="deleteHard && deleteConfirmText !== 'DELETE'"
            @click="confirmDelete"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'
import { getBusinessTypeLabel as getBusinessTypeLabelUtil } from '@/constants/businessTypes'
import { useSuperAdminStore } from '@/stores/superadmin'
import { computed, onMounted, ref } from 'vue'

const superadminStore = useSuperAdminStore()
const { success, error: showError } = useSnackbar()

// State
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const selected = ref([])

const filters = ref({
  keyword: '',
  businessType: null,
  status: null,
})

// 삭제 다이얼로그
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const deleteHard = ref(false)
const deleteConfirmText = ref('')

// Options
const businessTypes = [
  { title: '미용실', value: 'BEAUTY_SHOP' },
  { title: '필라테스', value: 'PILATES' },
  { title: '요가', value: 'YOGA' },
  { title: '카페', value: 'CAFE' },
  { title: '스터디카페', value: 'STUDY_CAFE' },
  { title: '공방', value: 'WORKSHOP' },
  { title: '학원', value: 'ACADEMY' },
  { title: '애견미용', value: 'PET_SALON' },
  { title: '기타', value: 'OTHER' },
]

const statusOptions = [
  { title: '활성', value: 'ACTIVE' },
  { title: '비활성', value: 'INACTIVE' },
  { title: '정지', value: 'SUSPENDED' },
]

// Computed
const businesses = computed(() => superadminStore.businesses)
const pagination = computed(() => superadminStore.businessPagination)

const isAllSelected = computed(() => {
  return businesses.value.length > 0
    && businesses.value.every(b => selected.value.includes(b.id))
})

// Methods
async function loadBusinesses() {
  loading.value = true
  error.value = null

  try {
    await superadminStore.fetchBusinesses({
      page: currentPage.value,
      size: 20,
      ...filters.value,
    })
  }
  catch (err) {

    error.value = err.message
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  selected.value = []
  loadBusinesses()
}

function handlePageChange(page) {
  currentPage.value = page
  selected.value = []
  loadBusinesses()
}

function toggleSelect(id) {
  const index = selected.value.indexOf(id)
  if (index > -1) {
    selected.value.splice(index, 1)
  }
  else {
    selected.value.push(id)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selected.value = []
  }
  else {
    selected.value = businesses.value.map(b => b.id)
  }
}

async function handleBulkStatusChange(status) {
  if (selected.value.length === 0) return

  try {
    await superadminStore.bulkUpdateBusinessStatus(selected.value, status)
    success(`${selected.value.length}개 매장의 상태가 변경되었습니다.`)
    selected.value = []
    loadBusinesses()
  }
  catch (err) {
    showError(err.message)
  }
}

function handleDelete(business, hard) {
  deleteTarget.value = business
  deleteHard.value = hard
  deleteConfirmText.value = ''
  deleteDialog.value = true
}

async function confirmDelete() {
  if (deleteHard.value && deleteConfirmText.value !== 'DELETE') {
    return
  }

  try {
    await superadminStore.deleteBusiness(deleteTarget.value.id, deleteHard.value)
    success('매장이 삭제되었습니다.')
    deleteDialog.value = false
    loadBusinesses()
  }
  catch (err) {
    showError(err.message)
  }
}

function getBusinessTypeLabel(type) {
  return getBusinessTypeLabelUtil(type)
}

function getStatusLabel(status) {
  const labels = {
    ACTIVE: '활성',
    INACTIVE: '비활성',
    SUSPENDED: '정지',
  }
  return labels[status] || status
}

function getStatusColor(status) {
  const colors = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
  }
  return colors[status] || 'default'
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// Lifecycle
onMounted(() => {
  loadBusinesses()
})
</script>
