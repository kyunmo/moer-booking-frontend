<template>
  <div>
    <!-- 페이지 헤더 -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 mb-1">
          쿠폰 관리
        </h2>
        <p class="text-body-1 text-medium-emphasis">
          할인 쿠폰을 생성하고 관리하세요
        </p>
      </div>
      <VBtn
        color="primary"
        prepend-icon="ri-coupon-line"
        @click="openCreateDialog"
      >
        쿠폰 생성
      </VBtn>
    </div>

    <!-- 통계 카드 -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-checkbox-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">활성 쿠폰</p>
              <h6 class="text-h6">{{ couponCounts.ACTIVE }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="error">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-close-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">만료된 쿠폰</p>
              <h6 class="text-h6">{{ couponCounts.EXPIRED }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-percent-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">정률 할인</p>
              <h6 class="text-h6">{{ couponCounts.PERCENTAGE }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="info">
          <VCardText class="d-flex align-center">
            <VIcon icon="ri-money-dollar-circle-line" size="32" class="me-3" />
            <div>
              <p class="text-xs mb-1">정액 할인</p>
              <h6 class="text-h6">{{ couponCounts.FIXED_AMOUNT }}개</h6>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 쿠폰 목록 -->
    <VCard>
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-coupon-line" size="24" class="me-3" />
        <span>쿠폰 목록</span>

        <VSpacer />

        <!-- 검색 -->
        <VTextField
          v-model="searchKeyword"
          placeholder="쿠폰 코드 또는 이름 검색"
          prepend-inner-icon="ri-search-line"
          density="compact"
          style="max-inline-size: 300px;"
          class="me-3"
          clearable
        />

        <!-- 상태 필터 -->
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="전체 상태"
          density="compact"
          style="max-inline-size: 150px;"
          clearable
        />
      </VCardTitle>

      <!-- 로딩 상태 -->
      <div v-if="loading && coupons.length === 0" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
        <p class="text-body-1 text-medium-emphasis mt-4">
          쿠폰 목록을 불러오는 중...
        </p>
      </div>

      <!-- 쿠폰 목록 -->
      <div v-else-if="filteredCoupons.length > 0" class="pa-4">
        <VRow>
          <VCol
            v-for="coupon in filteredCoupons"
            :key="coupon.id"
            cols="12"
            md="6"
            lg="4"
          >
            <VCard variant="outlined" class="h-100">
              <VCardText>
                <!-- 헤더 -->
                <div class="d-flex justify-space-between align-center mb-3">
                  <VChip
                    :color="getCouponTypeColor(coupon.couponType)"
                    size="small"
                  >
                    {{ getCouponTypeText(coupon.couponType) }}
                  </VChip>
                  <VChip
                    :color="getStatusColor(coupon.status, coupon.isExpired)"
                    size="small"
                  >
                    {{ getStatusText(coupon.status, coupon.isExpired) }}
                  </VChip>
                </div>

                <!-- 쿠폰 코드 -->
                <h5 class="text-h5 mb-2 font-weight-bold">
                  {{ coupon.code }}
                </h5>

                <!-- 쿠폰 이름 -->
                <p class="text-body-1 mb-3">
                  {{ coupon.name }}
                </p>

                <VDivider class="my-3" />

                <!-- 할인 정보 -->
                <div class="mb-3">
                  <p class="text-body-2 text-medium-emphasis mb-1">할인</p>
                  <p class="text-h6 text-primary font-weight-bold">
                    {{ formatDiscount(coupon) }}
                  </p>
                </div>

                <!-- 사용 조건 -->
                <div v-if="coupon.minOrderAmount" class="mb-3">
                  <p class="text-body-2 text-medium-emphasis mb-1">최소 주문 금액</p>
                  <p class="text-body-1">{{ formatCurrency(coupon.minOrderAmount) }}</p>
                </div>

                <!-- 사용 횟수 -->
                <div v-if="coupon.maxUsageCount" class="mb-3">
                  <p class="text-body-2 text-medium-emphasis mb-1">사용 횟수</p>
                  <p class="text-body-1">
                    {{ coupon.currentUsageCount }} / {{ coupon.maxUsageCount }}회
                  </p>
                  <VProgressLinear
                    :model-value="(coupon.currentUsageCount / coupon.maxUsageCount) * 100"
                    color="primary"
                    height="4"
                    class="mt-1"
                  />
                </div>

                <!-- 유효 기간 -->
                <div class="mb-3">
                  <p class="text-body-2 text-medium-emphasis mb-1">유효 기간</p>
                  <p class="text-body-2">
                    {{ formatDate(coupon.validFrom) }} ~
                    {{ formatDate(coupon.validUntil) }}
                  </p>
                </div>

                <!-- 설명 -->
                <div v-if="coupon.description" class="mb-3">
                  <p class="text-caption text-medium-emphasis">
                    {{ coupon.description }}
                  </p>
                </div>

                <!-- 액션 버튼 -->
                <div class="d-flex gap-2">
                  <VBtn
                    variant="text"
                    size="small"
                    @click="viewDetail(coupon)"
                  >
                    <VIcon icon="ri-eye-line" class="me-1" />
                    상세
                  </VBtn>
                  <VSpacer />
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click="confirmDelete(coupon)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>

      <!-- 데이터 없음 -->
      <EmptyState
        v-else
        icon="ri-coupon-line"
        title="등록된 쿠폰이 없습니다"
        description="첫 쿠폰을 생성하여 고객에게 할인 혜택을 제공하세요"
        action-label="쿠폰 생성하기"
        action-icon="ri-coupon-line"
        @action="openCreateDialog"
      />
    </VCard>

    <!-- 쿠폰 생성 다이얼로그 -->
    <CouponFormDialog
      v-model="isFormDialogOpen"
      @saved="handleCouponSaved"
    />

    <!-- 상세보기 다이얼로그 -->
    <VDialog
      v-model="isDetailDialogOpen"
      max-width="600"
    >
      <VCard v-if="selectedCoupon">
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="ri-coupon-line" class="me-2" />
            쿠폰 상세 정보
          </div>
          <VBtn
            icon="ri-close-line"
            variant="text"
            size="small"
            @click="isDetailDialogOpen = false"
          />
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VRow>
            <!-- 쿠폰 코드 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">쿠폰 코드</p>
              <p class="text-h6 font-weight-bold">{{ selectedCoupon.code }}</p>
            </VCol>

            <!-- 상태 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">상태</p>
              <VChip
                :color="getStatusColor(selectedCoupon.status, selectedCoupon.isExpired)"
                size="small"
              >
                {{ getStatusText(selectedCoupon.status, selectedCoupon.isExpired) }}
              </VChip>
            </VCol>

            <!-- 쿠폰 이름 -->
            <VCol cols="12">
              <p class="text-body-2 text-medium-emphasis mb-1">쿠폰 이름</p>
              <p class="text-body-1">{{ selectedCoupon.name }}</p>
            </VCol>

            <!-- 설명 -->
            <VCol v-if="selectedCoupon.description" cols="12">
              <p class="text-body-2 text-medium-emphasis mb-1">설명</p>
              <p class="text-body-2">{{ selectedCoupon.description }}</p>
            </VCol>

            <!-- 쿠폰 타입 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">쿠폰 타입</p>
              <VChip
                :color="getCouponTypeColor(selectedCoupon.couponType)"
                size="small"
              >
                {{ getCouponTypeText(selectedCoupon.couponType) }}
              </VChip>
            </VCol>

            <!-- 할인 정보 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">할인</p>
              <p class="text-h6 text-primary font-weight-bold">
                {{ formatDiscount(selectedCoupon) }}
              </p>
            </VCol>

            <!-- 최소 주문 금액 -->
            <VCol v-if="selectedCoupon.minOrderAmount" cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">최소 주문 금액</p>
              <p class="text-body-1">{{ formatCurrency(selectedCoupon.minOrderAmount) }}</p>
            </VCol>

            <!-- 사용 횟수 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">사용 횟수</p>
              <p class="text-body-1">
                {{ selectedCoupon.currentUsageCount }} /
                {{ selectedCoupon.maxUsageCount || '무제한' }}회
              </p>
            </VCol>

            <!-- 유효 기간 -->
            <VCol cols="12">
              <p class="text-body-2 text-medium-emphasis mb-1">유효 기간</p>
              <p class="text-body-1">
                {{ formatDate(selectedCoupon.validFrom) }} ~
                {{ formatDate(selectedCoupon.validUntil) }}
              </p>
            </VCol>

            <!-- 생성일 -->
            <VCol cols="6">
              <p class="text-body-2 text-medium-emphasis mb-1">생성일</p>
              <p class="text-body-2">{{ formatDate(selectedCoupon.createdAt) }}</p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <ConfirmDeleteDialog
      v-model="isDeleteDialogOpen"
      title="쿠폰 삭제"
      :item-name="`${selectedCoupon?.name} 쿠폰`"
      message="삭제된 쿠폰은 복구할 수 없습니다."
      :loading="loading"
      @confirm="deleteCoupon"
    />
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDeleteDialog from '@/components/dialogs/ConfirmDeleteDialog.vue'
import { useCouponStore } from '@/stores/coupon'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import CouponFormDialog from '@/components/coupon/CouponFormDialog.vue'

const couponStore = useCouponStore()
const { showSnackbar } = useSnackbar()

const {
  coupons,
  loading,
  couponCounts,
} = storeToRefs(couponStore)

const searchKeyword = ref('')
const statusFilter = ref(null)
const isFormDialogOpen = ref(false)
const isDetailDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedCoupon = ref(null)

// 상태 옵션
const statusOptions = [
  { title: '전체', value: null },
  { title: '활성', value: 'ACTIVE' },
  { title: '만료', value: 'EXPIRED' },
  { title: '비활성', value: 'DISABLED' },
]

// 필터링된 쿠폰 목록
const filteredCoupons = computed(() => {
  let result = coupons.value

  // 키워드 검색
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c =>
      c.code.toLowerCase().includes(keyword) ||
      c.name.toLowerCase().includes(keyword),
    )
  }

  // 상태 필터
  if (statusFilter.value) {
    result = result.filter(c => c.status === statusFilter.value)
  }

  return result
})

// 쿠폰 타입 텍스트
function getCouponTypeText(type) {
  const types = {
    PERCENTAGE: '정률 할인',
    FIXED_AMOUNT: '정액 할인',
  }
  return types[type] || type
}

// 쿠폰 타입 색상
function getCouponTypeColor(type) {
  const colors = {
    PERCENTAGE: 'primary',
    FIXED_AMOUNT: 'info',
  }
  return colors[type] || 'default'
}

// 상태 텍스트
function getStatusText(status, isExpired) {
  if (isExpired) return '만료'
  const texts = {
    ACTIVE: '활성',
    EXPIRED: '만료',
    DISABLED: '비활성',
  }
  return texts[status] || status
}

// 상태 색상
function getStatusColor(status, isExpired) {
  if (isExpired) return 'error'
  const colors = {
    ACTIVE: 'success',
    EXPIRED: 'error',
    DISABLED: 'secondary',
  }
  return colors[status] || 'default'
}

// 할인 포맷팅
function formatDiscount(coupon) {
  if (coupon.couponType === 'PERCENTAGE') {
    let text = `${coupon.discountPercentage}% 할인`
    if (coupon.maxDiscountAmount) {
      text += ` (최대 ${formatCurrency(coupon.maxDiscountAmount)})`
    }
    return text
  } else if (coupon.couponType === 'FIXED_AMOUNT') {
    return `${formatCurrency(coupon.discountAmount)} 할인`
  }
  return '-'
}

// 금액 포맷팅
function formatCurrency(amount) {
  if (!amount) return '0원'
  return `${amount.toLocaleString()}원`
}

// 날짜 포맷팅
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 쿠폰 생성 다이얼로그 열기
function openCreateDialog() {
  isFormDialogOpen.value = true
}

// 상세보기
function viewDetail(coupon) {
  selectedCoupon.value = coupon
  isDetailDialogOpen.value = true
}

// 삭제 확인
function confirmDelete(coupon) {
  selectedCoupon.value = coupon
  isDeleteDialogOpen.value = true
}

// 쿠폰 삭제
async function deleteCoupon() {
  if (!selectedCoupon.value) return

  try {
    await couponStore.deleteCoupon(selectedCoupon.value.id)
    showSnackbar('쿠폰이 삭제되었습니다.', 'success')
    isDeleteDialogOpen.value = false
    selectedCoupon.value = null
  }
  catch (error) {
    console.error('쿠폰 삭제 실패:', error)
    showSnackbar(error.message || '쿠폰 삭제에 실패했습니다.', 'error')
  }
}

// 쿠폰 저장 후
async function handleCouponSaved() {
  isFormDialogOpen.value = false
  await couponStore.fetchCoupons()
}

// 초기화
onMounted(async () => {
  try {
    await couponStore.fetchCoupons()
  }
  catch (error) {
    console.error('쿠폰 목록 조회 실패:', error)
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.gap-2 {
  gap: 8px;
}
</style>
