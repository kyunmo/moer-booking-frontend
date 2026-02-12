<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-user-heart-line" size="24" class="me-3" />
        <span>고객 관리</span>

        <VSpacer />

        <!-- 필터 -->
        <VBtnToggle
          v-model="filterType"
          density="compact"
          class="me-3"
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

        <!-- 검색 -->
        <VTextField
          v-model="searchQuery"
          placeholder="이름 또는 전화번호 검색"
          prepend-inner-icon="ri-search-line"
          density="compact"
          style="max-inline-size: 300px;"
          class="me-3"
          clearable
        />

        <!-- 새 고객 등록 -->
        <VBtn
          color="primary"
          prepend-icon="ri-user-add-line"
          @click="openCreateDialog"
        >
          고객 등록
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
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
    <VCard>
      <!-- 로딩 -->
      <div v-if="customerStore.loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 테이블 -->
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
          <div class="text-center pa-10">
            <VIcon
              icon="ri-user-line"
              size="64"
              class="mb-4 text-disabled"
            />
            <p class="text-h6 mb-2">등록된 고객이 없습니다</p>
            <p class="text-disabled mb-4">
              첫 고객을 등록하고 예약을 시작하세요
            </p>
            <VBtn
              color="primary"
              @click="openCreateDialog"
            >
              <VIcon icon="ri-user-add-line" class="me-2" />
              고객 등록하기
            </VBtn>
          </div>
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
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>고객 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ selectedCustomer?.name }}</strong> 고객을 삭제하시겠습니까?
          </p>
          <p class="text-error text-sm mt-2">
            ⚠️ 삭제된 고객 정보는 복구할 수 없습니다.
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
            @click="deleteCustomer"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import StatisticsCard from '@/components/StatisticsCard.vue'
import { useCustomerStore } from '@/stores/customer'
import { computed, onMounted, ref, watch } from 'vue'
import CustomerDetailDialog from './components/CustomerDetailDialog.vue'
import CustomerFormDialog from './components/CustomerFormDialog.vue'

const customerStore = useCustomerStore()

// Refs
const searchQuery = ref('')
const filterType = ref('all')
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedCustomer = ref(null)
const customerToEdit = ref(null)

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
    console.error('고객 삭제 실패:', error)
    alert(error.response?.data?.message || '고객 삭제에 실패했습니다.')
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
</style>
