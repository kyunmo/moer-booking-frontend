<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon :icon="serviceIcon" size="24" class="me-3" />
        <span>서비스 관리</span>

        <VSpacer />

        <!-- 카테고리 필터 -->
        <VSelect
          v-model="selectedCategory"
          :items="categoryFilterOptions"
          placeholder="전체 카테고리"
          density="compact"
          style="max-inline-size: 200px;"
          class="me-3"
          clearable
        />

        <!-- 검색 -->
        <VTextField
          v-model="searchQuery"
          placeholder="서비스명 검색"
          prepend-inner-icon="ri-search-line"
          density="compact"
          style="max-inline-size: 250px;"
          class="me-3"
          clearable
        />

        <!-- 카테고리 관리 -->
        <VBtn
          variant="outlined"
          prepend-icon="ri-folder-settings-line"
          class="me-3"
          @click="isCategoryDialogVisible = true"
        >
          카테고리 관리
        </VBtn>

        <!-- 새 서비스 등록 -->
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreateDialog"
        >
          서비스 등록
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- 통계 카드 -->
    <VRow class="mb-4">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-service-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">전체 서비스</p>
              <h6 class="text-h6">{{ serviceStore.services.length }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-checkbox-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">활성 서비스</p>
              <h6 class="text-h6">{{ serviceStore.activeServices.length }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="info">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-folder-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">카테고리</p>
              <h6 class="text-h6">{{ categoryStore.categories.length }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-money-dollar-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">평균 가격</p>
              <h6 class="text-h6">{{ averagePrice.toLocaleString() }}원</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 로딩 -->
    <div v-if="serviceStore.loading" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- 서비스 카드 그리드 -->
    <div v-else-if="filteredServices.length > 0">
      <VRow>
        <VCol
          v-for="service in filteredServices"
          :key="service.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard class="service-card">
            <!-- 헤더 -->
            <VCardTitle class="d-flex align-center">
              <VIcon
                :icon="getCategoryIcon(service.categoryName || service.category)"
                size="20"
                class="me-2"
                :color="getCategoryColor(service.categoryName || service.category)"
              />
              <span class="text-truncate">{{ service.name }}</span>
              
              <VSpacer />
              
              <VChip
                :color="service.isActive !== false ? 'success' : 'error'"
                size="small"
                variant="outlined"
              >
                {{ service.isActive !== false ? '판매중' : '판매중지' }}
              </VChip>
            </VCardTitle>

            <VDivider />

            <VCardText>
              <!-- 카테고리 -->
              <div class="mb-3">
                <VChip
                  v-if="service.categoryName || service.category"
                  :color="getCategoryColor(service.categoryName || service.category)"
                  size="small"
                  variant="tonal"
                >
                  {{ service.categoryName || service.category }}
                </VChip>
              </div>

              <!-- 설명 -->
              <p v-if="service.description" class="text-sm text-medium-emphasis mb-3">
                {{ truncateText(service.description, 80) }}
              </p>

              <!-- 정보 -->
              <div class="d-flex align-center mb-2">
                <VIcon icon="ri-time-line" size="18" class="me-2 text-disabled" />
                <span class="text-sm">{{ service.duration }}분</span>
              </div>

              <div class="d-flex align-center mb-2">
                <VIcon icon="ri-money-dollar-circle-line" size="18" class="me-2 text-disabled" />
                <span class="text-sm font-weight-medium">{{ service.price.toLocaleString() }}원</span>
              </div>

              <!-- 담당 직원 -->
              <div v-if="service.staffIds && service.staffIds.length > 0" class="d-flex align-center">
                <VIcon icon="ri-user-line" size="18" class="me-2 text-disabled" />
                <span class="text-xs text-disabled">{{ service.staffIds.length }}명 담당 가능</span>
              </div>
            </VCardText>

            <VDivider />

            <!-- 액션 버튼 -->
            <VCardActions>
              <VBtn
                variant="text"
                size="small"
                @click="viewService(service)"
              >
                <VIcon icon="ri-eye-line" class="me-1" />
                상세
              </VBtn>

              <VBtn
                variant="text"
                size="small"
                color="primary"
                @click="editService(service)"
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
                @click="confirmDelete(service)"
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
        :icon="serviceIcon"
        title="등록된 서비스가 없습니다"
        description="첫 서비스를 등록하고 예약을 시작하세요"
        action-label="서비스 등록하기"
        action-icon="ri-add-line"
        @action="openCreateDialog"
      />
    </VCard>

    <!-- 서비스 상세보기 다이얼로그 -->
    <ServiceDetailDialog
      v-model="isDetailDialogVisible"
      :service="selectedService"
      @edit="handleEditFromDetail"
      @delete="confirmDelete"
    />

    <!-- 서비스 등록/수정 다이얼로그 -->
    <ServiceFormDialog
      v-model="isFormDialogVisible"
      :service="serviceToEdit"
      @saved="handleServiceSaved"
    />

    <!-- 카테고리 관리 다이얼로그 -->
    <CategoryManageDialog
      v-model="isCategoryDialogVisible"
      @updated="handleCategoryUpdated"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDeleteDialog
      v-model="isDeleteDialogVisible"
      title="서비스 삭제"
      :item-name="`${selectedService?.name} 서비스`"
      message="삭제된 서비스 정보는 복구할 수 없습니다."
      @confirm="deleteService"
    />
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDeleteDialog from '@/components/dialogs/ConfirmDeleteDialog.vue'
import { useBusinessIcon } from '@/composables/useBusinessIcon'
import { useSnackbar } from '@/composables/useSnackbar'
import { useServiceCategoryStore } from '@/stores/service-category'
import { useServiceStore } from '@/stores/service'
import { computed, onMounted, ref } from 'vue'
import CategoryManageDialog from './components/CategoryManageDialog.vue'
import ServiceDetailDialog from './components/ServiceDetailDialog.vue'
import ServiceFormDialog from './components/ServiceFormDialog.vue'

const { serviceIcon, serviceIconLine, getCategoryIcon, getCategoryColor } = useBusinessIcon()
const { error: showError } = useSnackbar()

const serviceStore = useServiceStore()
const categoryStore = useServiceCategoryStore()

// Refs
const searchQuery = ref('')
const selectedCategory = ref(null)
const isDetailDialogVisible = ref(false)
const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const isCategoryDialogVisible = ref(false)
const selectedService = ref(null)
const serviceToEdit = ref(null)

// 카테고리 필터 옵션 (DB 카테고리 사용)
const categoryFilterOptions = computed(() => {
  return ['전체', ...categoryStore.categories.map(c => c.name)]
})

// 검색 및 필터링
const filteredServices = computed(() => {
  let result = serviceStore.services

  // 카테고리 필터
  if (selectedCategory.value && selectedCategory.value !== '전체') {
    result = result.filter(s => {
      const name = s.categoryName || s.category
      return name === selectedCategory.value
    })
  }

  // 검색
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)),
    )
  }

  return result
})

// 평균 가격
const averagePrice = computed(() => {
  if (serviceStore.services.length === 0) return 0
  const total = serviceStore.services.reduce((sum, s) => sum + (s.price || 0), 0)
  return Math.round(total / serviceStore.services.length)
})

// 텍스트 자르기
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 서비스 상세보기
function viewService(service) {
  selectedService.value = service
  isDetailDialogVisible.value = true
}

// 서비스 수정
function editService(service) {
  serviceToEdit.value = service
  isFormDialogVisible.value = true
}

// 상세보기에서 수정 버튼 클릭 시
function handleEditFromDetail(service) {
  isDetailDialogVisible.value = false
  serviceToEdit.value = service
  isFormDialogVisible.value = true
}

// 새 서비스 등록
function openCreateDialog() {
  serviceToEdit.value = null
  isFormDialogVisible.value = true
}

// 삭제 확인
function confirmDelete(service) {
  selectedService.value = service
  isDetailDialogVisible.value = false
  isDeleteDialogVisible.value = true
}

// 서비스 삭제
async function deleteService() {
  if (!selectedService.value) return

  try {
    await serviceStore.deleteService(selectedService.value.id)
    isDeleteDialogVisible.value = false
    selectedService.value = null
  }
  catch (error) {
    console.error('서비스 삭제 실패:', error)
    showError(error.message || '서비스 삭제에 실패했습니다.')
  }
}

// 서비스 저장 후
async function handleServiceSaved() {
  isFormDialogVisible.value = false
  serviceToEdit.value = null
  await serviceStore.fetchServices()
}

// 카테고리 업데이트 후
async function handleCategoryUpdated() {
  await categoryStore.fetchCategories(true)
}

// 컴포넌트 마운트 시
onMounted(() => {
  serviceStore.fetchServices()
  categoryStore.fetchCategories()
})
</script>

<style scoped>
.service-card {
  block-size: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 10%);
  transform: translateY(-4px);
}
</style>
