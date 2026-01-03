<template>
  <VCard>
    <VCardTitle class="d-flex align-center pe-2">
      <VIcon icon="ri-user-line" size="24" class="me-3" />
      <span>고객 관리</span>

      <VSpacer />

      <!-- 검색 -->
      <VTextField
        v-model="searchQuery"
        placeholder="이름, 전화번호 검색"
        prepend-inner-icon="ri-search-line"
        density="compact"
        style="max-inline-size: 300px;"
        class="me-3"
        clearable
        @keyup.enter="handleSearch"
      />

      <!-- 새 고객 등록 -->
      <VBtn
        color="primary"
        prepend-icon="ri-user-add-line"
        @click="openCustomerDialog"
      >
        고객 등록
      </VBtn>
    </VCardTitle>

    <VDivider />

    <!-- 통계 카드 -->
    <VCardText>
      <VRow>
        <VCol cols="12" sm="6" md="3">
          <VCard variant="tonal" color="primary">
            <VCardText class="d-flex align-center">
              <VIcon icon="ri-user-line" size="32" class="me-3" />
              <div>
                <p class="text-xs mb-1">전체 고객</p>
                <h6 class="text-h6">{{ customerStore.customers.length }}명</h6>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VCard variant="tonal" color="success">
            <VCardText class="d-flex align-center">
              <VIcon icon="ri-vip-crown-line" size="32" class="me-3" />
              <div>
                <p class="text-xs mb-1">VIP 고객</p>
                <h6 class="text-h6">{{ customerStore.vipCustomers.length }}명</h6>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VCard variant="tonal" color="warning">
            <VCardText class="d-flex align-center">
              <VIcon icon="ri-user-star-line" size="32" class="me-3" />
              <div>
                <p class="text-xs mb-1">단골 고객</p>
                <h6 class="text-h6">{{ customerStore.regularCustomers.length }}명</h6>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VCard variant="tonal" color="info">
            <VCardText class="d-flex align-center">
              <VIcon icon="ri-user-add-line" size="32" class="me-3" />
              <div>
                <p class="text-xs mb-1">신규 고객</p>
                <h6 class="text-h6">{{ customerStore.newCustomers.length }}명</h6>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>

    <VDivider />

    <!-- 데이터 테이블 -->
    <VDataTable
      :headers="headers"
      :items="customerStore.customers"
      :loading="customerStore.loading"
      :search="searchQuery"
      :items-per-page="10"
      class="text-no-wrap"
    >
      <!-- 이름 -->
      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <VAvatar
            color="primary"
            variant="tonal"
            size="32"
            class="me-3"
          >
            <span class="text-xs">{{ getInitial(item.name) }}</span>
          </VAvatar>
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div v-if="item.email" class="text-xs text-disabled">
              {{ item.email }}
            </div>
          </div>
        </div>
      </template>

      <!-- 전화번호 -->
      <template #item.phone="{ item }">
        <span>{{ item.phone }}</span>
      </template>

      <!-- 방문 횟수 -->
      <template #item.visitCount="{ item }">
        <VChip
          size="small"
          :color="getVisitCountColor(item.visitCount)"
        >
          {{ item.visitCount }}회
        </VChip>
      </template>

      <!-- 총 결제 금액 -->
      <template #item.totalSpent="{ item }">
        <span class="font-weight-medium">
          {{ formatPrice(item.totalSpent) }}
        </span>
      </template>

      <!-- 최근 방문일 -->
      <template #item.lastVisit="{ item }">
        <span v-if="item.lastVisit">
          {{ formatDate(item.lastVisit) }}
        </span>
        <span v-else class="text-disabled">-</span>
      </template>

      <!-- 태그 -->
      <template #item.tags="{ item }">
        <VChip
          v-for="tag in item.tags"
          :key="tag"
          size="small"
          :color="getTagColor(tag)"
          class="me-1"
        >
          {{ tag }}
        </VChip>
      </template>

      <!-- 액션 -->
      <template #item.actions="{ item }">
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
      </template>

      <!-- 로딩 -->
      <template #loading>
        <VSkeletonLoader type="table-row@10" />
      </template>

      <!-- 데이터 없음 -->
      <template #no-data>
        <div class="text-center pa-5">
          <VIcon
            icon="ri-user-line"
            size="48"
            class="mb-3 text-disabled"
          />
          <p class="text-disabled">등록된 고객이 없습니다.</p>
          <VBtn
            color="primary"
            variant="outlined"
            class="mt-3"
            @click="openCustomerDialog"
          >
            첫 고객 등록하기
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <!-- 고객 등록/수정 다이얼로그 -->
    <CustomerDialog
      v-model="isDialogVisible"
      :customer="selectedCustomer"
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
  </VCard>
</template>

<script setup>
import { useCustomerStore } from '@/stores/customer'
import { onMounted, ref } from 'vue'
import CustomerDialog from './components/CustomerDialog.vue'

const customerStore = useCustomerStore()

// Refs
const searchQuery = ref('')
const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedCustomer = ref(null)

// 테이블 헤더
const headers = [
  { title: '이름', key: 'name', sortable: true },
  { title: '전화번호', key: 'phone', sortable: true },
  { title: '방문횟수', key: 'visitCount', sortable: true },
  { title: '총 결제금액', key: 'totalSpent', sortable: true },
  { title: '최근방문', key: 'lastVisit', sortable: true },
  { title: '태그', key: 'tags', sortable: false },
  { title: '액션', key: 'actions', sortable: false, align: 'center' },
]

// 이름 이니셜
function getInitial(name) {
  return name ? name.charAt(0) : '?'
}

// 방문 횟수 색상
function getVisitCountColor(count) {
  if (count >= 10) return 'success'
  if (count >= 5) return 'warning'
  return 'default'
}

// 금액 포맷
function formatPrice(price) {
  if (!price) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// 태그 색상
function getTagColor(tag) {
  const colors = {
    'VIP': 'error',
    '단골': 'success',
    '신규': 'info',
  }
  return colors[tag] || 'default'
}

// 검색
function handleSearch() {
  if (searchQuery.value.trim()) {
    customerStore.searchCustomers(searchQuery.value)
  }
  else {
    customerStore.fetchCustomers()
  }
}

// 고객 보기
function viewCustomer(customer) {
  selectedCustomer.value = customer
  isDialogVisible.value = true
}

// 고객 수정
function editCustomer(customer) {
  selectedCustomer.value = customer
  isDialogVisible.value = true
}

// 삭제 확인
function confirmDelete(customer) {
  selectedCustomer.value = customer
  isDeleteDialogVisible.value = true
}

// 고객 삭제
async function deleteCustomer() {
  if (!selectedCustomer.value) return

  try {
    await customerStore.deleteCustomer(selectedCustomer.value.id)
    isDeleteDialogVisible.value = false
  }
  catch (error) {
    console.error('고객 삭제 실패:', error)
    alert(error || '고객 삭제에 실패했습니다.')
  }
}

// 새 고객 등록
function openCustomerDialog() {
  selectedCustomer.value = null
  isDialogVisible.value = true
}

// 고객 저장 후
async function handleCustomerSaved() {
  isDialogVisible.value = false
  await customerStore.fetchCustomers()
}

// 컴포넌트 마운트 시
onMounted(() => {
  customerStore.fetchCustomers()
})
</script>
