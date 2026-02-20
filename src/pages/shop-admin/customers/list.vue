<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2" :class="{ 'flex-wrap ga-2': smAndDown }">
        <VIcon icon="ri-user-heart-line" size="24" class="me-3" />
        <span>고객 관리</span>

        <VSpacer />

        <!-- 새 고객 등록 -->
        <VBtn
          id="customer-create-btn"
          color="primary"
          prepend-icon="ri-user-add-line"
          :size="smAndDown ? 'small' : 'default'"
          @click="openCreateDialog"
        >
          고객 등록
        </VBtn>
      </VCardTitle>

      <!-- 필터 영역 -->
      <VCardText class="pt-0">
        <VRow dense>
          <VCol cols="12" sm="auto">
            <VBtnToggle
              id="customer-filter"
              v-model="filterType"
              density="compact"
              variant="outlined"
              divided
            >
              <VBtn value="all" size="small">
                전체
              </VBtn>
              <VBtn value="vip" size="small">
                VIP
              </VBtn>
              <VBtn value="regular" size="small">
                단골
              </VBtn>
              <VBtn value="new" size="small">
                신규
              </VBtn>
            </VBtnToggle>
          </VCol>

          <VCol cols="12" sm="">
            <VTextField
              v-model="searchQuery"
              placeholder="이름 또는 전화번호 검색"
              prepend-inner-icon="ri-search-line"
              density="compact"
              clearable
              hide-details
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 통계 카드 -->
    <VRow id="customer-stats" class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="전체 고객"
          :value="`${customerStore.customers.length}명`"
          icon="ri-user-line"
          color="primary"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="VIP 고객"
          :value="`${customerStore.vipCustomers.length}명`"
          icon="ri-vip-crown-line"
          color="warning"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="단골 고객"
          :value="`${customerStore.regularCustomers.length}명`"
          icon="ri-user-star-line"
          color="success"
        />
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <StatisticsCard
          title="신규 고객"
          :value="`${customerStore.newCustomers.length}명`"
          icon="ri-user-add-line"
          color="info"
        />
      </VCol>
    </VRow>

    <!-- 고객 테이블 -->
    <VCard id="customer-table">
      <!-- 로딩 -->
      <div v-if="customerStore.loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 모바일 카드 뷰 -->
      <template v-else-if="smAndDown">
        <!-- 데이터 없음 -->
        <template v-if="filteredCustomers.length === 0">
          <EmptyState
            icon="ri-user-line"
            title="등록된 고객이 없습니다"
            description="첫 고객을 등록하고 예약을 시작하세요"
            action-label="고객 등록하기"
            action-icon="ri-user-add-line"
            @action="openCreateDialog"
          />
        </template>

        <!-- 카드 리스트 -->
        <div v-else class="pa-3 d-flex flex-column gap-3">
          <VCard
            v-for="item in paginatedCustomers"
            :key="item.id"
            variant="outlined"
            class="customer-mobile-card"
            @click="viewCustomer(item)"
          >
            <VCardText class="pa-3">
              <!-- 상단: 고객명 + 등급 태그 -->
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <VAvatar
                    color="primary"
                    size="36"
                    class="me-2"
                  >
                    <span class="text-sm">{{ getInitial(item.name) }}</span>
                  </VAvatar>
                  <div>
                    <div class="font-weight-medium text-body-1">{{ item.name }}</div>
                    <div class="text-xs text-disabled">{{ item.phone }}</div>
                  </div>
                </div>

                <div class="d-flex gap-1">
                  <VChip
                    v-if="item.isVip"
                    color="warning"
                    size="x-small"
                    variant="tonal"
                  >
                    VIP
                  </VChip>
                  <VChip
                    v-if="item.isRegular"
                    color="success"
                    size="x-small"
                    variant="tonal"
                  >
                    단골
                  </VChip>
                  <VChip
                    v-if="item.isNew"
                    color="info"
                    size="x-small"
                    variant="tonal"
                  >
                    신규
                  </VChip>
                </div>
              </div>

              <VDivider class="mb-2" />

              <!-- 하단: 핵심 정보 -->
              <div class="d-flex align-center justify-space-between text-body-2">
                <div class="d-flex align-center">
                  <VIcon icon="ri-footprint-line" size="16" class="me-1 text-disabled" />
                  <VChip
                    :color="getVisitCountColor(item.visitCount)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ item.visitCount || 0 }}회 방문
                  </VChip>
                </div>

                <div class="d-flex align-center">
                  <VIcon icon="ri-money-cny-circle-line" size="16" class="me-1 text-disabled" />
                  <span class="font-weight-medium">{{ (item.totalSpent || 0).toLocaleString() }}원</span>
                </div>

                <div class="d-flex align-center">
                  <VIcon icon="ri-calendar-line" size="16" class="me-1 text-disabled" />
                  <span :class="getDateClass(item.lastVisitDate)">
                    {{ formatDateShort(item.lastVisitDate) }}
                  </span>
                </div>
              </div>
            </VCardText>
          </VCard>

          <!-- 모바일 페이지네이션 -->
          <div
            v-if="mobileCustomerTotalPages > 1"
            class="d-flex justify-center pt-2 pb-1"
          >
            <VPagination
              v-model="mobileCustomerPage"
              :length="mobileCustomerTotalPages"
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
        :items="filteredCustomers"
        :search="searchQuery"
        :items-per-page="10"
        class="customer-table"
      >
        <!-- 이름 -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              color="primary"
              size="36"
              class="me-3"
            >
              <span class="text-sm">{{ getInitial(item.name) }}</span>
            </VAvatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-xs text-disabled">{{ item.phone }}</div>
            </div>
          </div>
        </template>

        <!-- 태그 -->
        <template #item.tags="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <VChip
              v-if="item.isVip"
              color="warning"
              size="small"
              variant="tonal"
            >
              VIP
            </VChip>
            <VChip
              v-if="item.isRegular"
              color="success"
              size="small"
              variant="tonal"
            >
              단골
            </VChip>
            <VChip
              v-if="item.isNew"
              color="info"
              size="small"
              variant="tonal"
            >
              신규
            </VChip>
            <VChip
              v-for="tag in item.tags"
              :key="tag"
              size="small"
            >
              {{ tag }}
            </VChip>
          </div>
        </template>

        <!-- 방문 횟수 -->
        <template #item.visitCount="{ item }">
          <VChip
            :color="getVisitCountColor(item.visitCount)"
            size="small"
            variant="tonal"
          >
            {{ item.visitCount || 0 }}회
          </VChip>
        </template>

        <!-- 총 결제액 -->
        <template #item.totalSpent="{ item }">
          <span class="font-weight-medium">
            {{ (item.totalSpent || 0).toLocaleString() }}원
          </span>
        </template>

        <!-- 최근 방문일 -->
        <template #item.lastVisitDate="{ item }">
          <span :class="getDateClass(item.lastVisitDate)">
            {{ formatDate(item.lastVisitDate) }}
          </span>
        </template>

        <!-- 액션 -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              icon
              variant="text"
              size="small"
              @click="viewCustomer(item)"
            >
              <VIcon icon="ri-eye-line" />
              <VTooltip activator="parent" location="top">
                상세보기
              </VTooltip>
            </VBtn>

            <VBtn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="editCustomer(item)"
            >
              <VIcon icon="ri-edit-line" />
              <VTooltip activator="parent" location="top">
                수정
              </VTooltip>
            </VBtn>

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
          </div>
        </template>

        <!-- 데이터 없음 -->
        <template #no-data>
          <EmptyState
            icon="ri-user-line"
            title="등록된 고객이 없습니다"
            description="첫 고객을 등록하고 예약을 시작하세요"
            action-label="고객 등록하기"
            action-icon="ri-user-add-line"
            @action="openCreateDialog"
          />
        </template>
      </VDataTable>
    </VCard>

    <!-- 고객 상세보기 다이얼로그 -->
    <CustomerDetailDialog
      v-model="isDetailDialogVisible"
      :customer="selectedCustomer"
      @edit="handleEditFromDetail"
      @delete="confirmDelete"
    />

    <!-- 고객 등록/수정 다이얼로그 -->
    <CustomerFormDialog
      v-model="isFormDialogVisible"
      :customer="customerToEdit"
      @saved="handleCustomerSaved"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDeleteDialog
      v-model="isDeleteDialogVisible"
      title="고객 삭제"
      :item-name="`${selectedCustomer?.name} 고객`"
      message="삭제된 고객 정보는 복구할 수 없습니다."
      @confirm="deleteCustomer"
    />
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import StatisticsCard from '@/components/StatisticsCard.vue'
import ConfirmDeleteDialog from '@/components/dialogs/ConfirmDeleteDialog.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { useCustomerStore } from '@/stores/customer'
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import CustomerDetailDialog from './components/CustomerDetailDialog.vue'
import CustomerFormDialog from './components/CustomerFormDialog.vue'

const { smAndDown } = useDisplay()
const { error: showError } = useSnackbar()
const customerStore = useCustomerStore()

// Refs
const searchQuery = ref('')
const filterType = ref('all')
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedCustomer = ref(null)
const customerToEdit = ref(null)

// 모바일 페이지네이션
const mobileCustomerPage = ref(1)
const mobileItemsPerPage = 10

// 테이블 헤더
const headers = [
  { title: '이름', key: 'name', sortable: true },
  { title: '태그', key: 'tags', sortable: false },
  { title: '방문', key: 'visitCount', sortable: true, align: 'center' },
  { title: '총 결제액', key: 'totalSpent', sortable: true, align: 'end' },
  { title: '최근 방문', key: 'lastVisitDate', sortable: true },
  { title: '액션', key: 'actions', sortable: false, align: 'center' },
]

// 필터링된 고객 목록
const filteredCustomers = computed(() => {
  let result = customerStore.customers

  // 필터 타입별 적용
  switch (filterType.value) {
    case 'vip':
      result = customerStore.vipCustomers
      break
    case 'regular':
      result = customerStore.regularCustomers
      break
    case 'new':
      result = customerStore.newCustomers
      break
    default:
      result = customerStore.customers
  }

  return result
})

// 모바일 검색 필터가 적용된 고객 목록
const mobileFilteredCustomers = computed(() => {
  if (!searchQuery.value) return filteredCustomers.value
  const query = searchQuery.value.toLowerCase()
  return filteredCustomers.value.filter(item =>
    item.name?.toLowerCase().includes(query)
    || item.phone?.includes(query),
  )
})

// 모바일 페이지네이션 총 페이지 수
const mobileCustomerTotalPages = computed(() =>
  Math.ceil(mobileFilteredCustomers.value.length / mobileItemsPerPage),
)

// 페이지네이션된 고객 목록
const paginatedCustomers = computed(() => {
  const start = (mobileCustomerPage.value - 1) * mobileItemsPerPage
  return mobileFilteredCustomers.value.slice(start, start + mobileItemsPerPage)
})

// 필터 변경 시 목록 새로고침
watch(filterType, async (newType) => {
  if (newType === 'vip') {
    await customerStore.fetchVipCustomers()
  } else if (newType === 'regular') {
    await customerStore.fetchRegularCustomers()
  } else if (newType === 'new') {
    await customerStore.fetchNewCustomers()
  } else {
    await customerStore.fetchCustomers()
  }
})

// 이니셜
function getInitial(name) {
  return name ? name.charAt(0) : '?'
}

// 방문 횟수 색상
function getVisitCountColor(count) {
  if (!count) return 'default'
  if (count >= 10) return 'warning'  // VIP
  if (count >= 3) return 'success'   // 단골
  if (count === 1) return 'info'     // 신규
  return 'default'
}

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 날짜 포맷 (모바일용 짧은 형식)
function formatDateShort(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

// 날짜 클래스 (최근 방문일 강조)
function getDateClass(dateString) {
  if (!dateString) return 'text-disabled'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 7) return 'text-success font-weight-medium'  // 최근 7일
  if (diffDays <= 30) return 'text-primary'                    // 최근 30일
  if (diffDays <= 90) return ''                                 // 최근 90일
  return 'text-disabled'                                        // 90일 이상
}

// 고객 상세보기
function viewCustomer(customer) {
  selectedCustomer.value = customer
  isDetailDialogVisible.value = true
}

// 고객 수정
function editCustomer(customer) {
  customerToEdit.value = customer
  isFormDialogVisible.value = true
}

// 상세보기에서 수정 버튼 클릭 시
function handleEditFromDetail(customer) {
  isDetailDialogVisible.value = false
  customerToEdit.value = customer
  isFormDialogVisible.value = true
}

// 새 고객 등록
function openCreateDialog() {
  customerToEdit.value = null
  isFormDialogVisible.value = true
}

// 삭제 확인
function confirmDelete(customer) {
  selectedCustomer.value = customer
  isDetailDialogVisible.value = false
  isDeleteDialogVisible.value = true
}

// 고객 삭제
async function deleteCustomer() {
  if (!selectedCustomer.value) return

  try {
    await customerStore.deleteCustomer(selectedCustomer.value.id)
    isDeleteDialogVisible.value = false
    selectedCustomer.value = null
  }
  catch (error) {
    showError(error.message || '고객 삭제에 실패했습니다.')
  }
}

// 고객 저장 후
async function handleCustomerSaved() {
  isFormDialogVisible.value = false
  customerToEdit.value = null
  await customerStore.fetchCustomers()
}

// 컴포넌트 마운트 시
onMounted(() => {
  customerStore.fetchCustomers()
})
</script>

<style scoped>
.customer-table :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.customer-mobile-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.customer-mobile-card:hover,
.customer-mobile-card:active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
