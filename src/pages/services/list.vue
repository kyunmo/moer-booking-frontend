<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-scissors-line" size="24" class="me-3" />
        <span>서비스 관리</span>

        <VSpacer />

        <!-- 카테고리 필터 -->
        <VSelect
          v-model="selectedCategory"
          :items="categoryItems"
          label="카테고리"
          density="compact"
          style="max-inline-size: 200px;"
          class="me-3"
          clearable
        />

        <!-- 새 서비스 등록 -->
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openServiceDialog"
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
            <VIcon icon="ri-scissors-line" size="32" class="me-3" />
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
            <VIcon icon="ri-check-line" size="32" class="me-3" />
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
              <h6 class="text-h6">{{ serviceStore.categories.length }}개</h6>
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
              <h6 class="text-h6">{{ formatPrice(averagePrice) }}</h6>
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
            <VCardText>
              <!-- 카테고리 배지 -->
              <div class="d-flex justify-space-between align-center mb-3">
                <VChip
                  :color="getCategoryColor(service.category)"
                  size="small"
                >
                  {{ service.category || '기타' }}
                </VChip>

                <!-- 활성/비활성 -->
                <VChip
                  :color="service.isActive !== false ? 'success' : 'error'"
                  size="small"
                  variant="outlined"
                >
                  {{ service.isActive !== false ? '활성' : '비활성' }}
                </VChip>
              </div>

              <!-- 서비스명 -->
              <h6 class="text-h6 mb-2">
                {{ service.name }}
              </h6>

              <!-- 설명 -->
              <p v-if="service.description" class="text-sm text-disabled mb-3">
                {{ truncateText(service.description, 50) }}
              </p>

              <!-- 가격 & 소요시간 -->
              <div class="d-flex align-center mb-2">
                <VIcon icon="ri-money-dollar-circle-line" size="18" class="me-2" />
                <span class="text-primary font-weight-bold">
                  {{ formatPrice(service.price) }}
                </span>
              </div>

              <div class="d-flex align-center">
                <VIcon icon="ri-time-line" size="18" class="me-2" />
                <span class="text-sm">
                  {{ service.durationMinutes }}분
                </span>
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
      <VCardText class="text-center pa-10">
        <VIcon
          icon="ri-scissors-line"
          size="64"
          class="mb-4 text-disabled"
        />
        <p class="text-h6 mb-2">등록된 서비스가 없습니다</p>
        <p class="text-disabled mb-4">
          첫 서비스를 등록하고 예약을 시작하세요
        </p>
        <VBtn
          color="primary"
          @click="openServiceDialog"
        >
          <VIcon icon="ri-add-line" class="me-2" />
          서비스 등록하기
        </VBtn>
      </VCardText>
    </VCard>

    <!-- 서비스 등록/수정 다이얼로그 -->
    <ServiceDialog
      v-model="isDialogVisible"
      :service="selectedService"
      @saved="handleServiceSaved"
    />

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>서비스 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ selectedService?.name }}</strong> 서비스를 삭제하시겠습니까?
          </p>
          <p class="text-error text-sm mt-2">
            ⚠️ 삭제된 서비스는 복구할 수 없습니다.
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
            @click="deleteService"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useServiceStore } from '@/stores/service'
import { computed, onMounted, ref } from 'vue'
import ServiceDialog from './components/ServiceDialog.vue'

const serviceStore = useServiceStore()

// Refs
const selectedCategory = ref(null)
const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedService = ref(null)

// 카테고리 목록
const categoryItems = computed(() => {
  return [
    { title: '전체', value: null },
    ...serviceStore.categories.map(cat => ({ title: cat, value: cat })),
  ]
})

// 필터링된 서비스
const filteredServices = computed(() => {
  if (!selectedCategory.value) {
    return serviceStore.services
  }
  return serviceStore.services.filter(s => s.category === selectedCategory.value)
})

// 평균 가격
const averagePrice = computed(() => {
  if (serviceStore.services.length === 0) return 0
  const total = serviceStore.services.reduce((sum, s) => sum + (s.price || 0), 0)
  return Math.round(total / serviceStore.services.length)
})

// 카테고리 색상
function getCategoryColor(category) {
  const colors = {
    '컷': 'primary',
    '펌': 'success',
    '염색': 'warning',
    '클리닉': 'info',
    '스타일링': 'secondary',
  }
  return colors[category] || 'default'
}

// 금액 포맷
function formatPrice(price) {
  if (!price) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 텍스트 자르기
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 서비스 보기
function viewService(service) {
  selectedService.value = service
  isDialogVisible.value = true
}

// 서비스 수정
function editService(service) {
  selectedService.value = service
  isDialogVisible.value = true
}

// 삭제 확인
function confirmDelete(service) {
  selectedService.value = service
  isDeleteDialogVisible.value = true
}

// 서비스 삭제
async function deleteService() {
  if (!selectedService.value) return

  try {
    await serviceStore.deleteService(selectedService.value.id)
    isDeleteDialogVisible.value = false
  }
  catch (error) {
    console.error('서비스 삭제 실패:', error)
    alert(error || '서비스 삭제에 실패했습니다.')
  }
}

// 새 서비스 등록
function openServiceDialog() {
  selectedService.value = null
  isDialogVisible.value = true
}

// 서비스 저장 후
async function handleServiceSaved() {
  isDialogVisible.value = false
  await serviceStore.fetchServices()
}

// 컴포넌트 마운트 시
onMounted(() => {
  serviceStore.fetchServices()
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
