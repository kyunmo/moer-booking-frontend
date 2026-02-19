<template>
  <!-- 한도 도달 -->
  <VAlert
    v-if="isLimitReached"
    type="warning"
    variant="tonal"
    class="mb-4"
  >
    <div class="d-flex align-center">
      <VIcon icon="ri-error-warning-line" size="24" class="me-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1">
          월 예약 한도에 도달했습니다
        </div>
        <div class="text-sm">
          이번 달 예약 {{ currentMonthReservationCount }}건 / {{ maxMonthlyReservations }}건을 모두 사용했습니다.
        </div>
      </div>
      <VBtn
        color="warning"
        variant="elevated"
        size="small"
        :to="upgradeRoute"
      >
        업그레이드
      </VBtn>
    </div>
  </VAlert>

  <!-- 경고 (20건 이상, 한도 미도달) -->
  <VAlert
    v-else-if="shouldShowReservationWarning"
    type="info"
    variant="tonal"
    class="mb-4"
  >
    <div class="d-flex align-center">
      <VIcon icon="ri-bar-chart-box-line" size="24" class="me-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1">
          이번 달 예약 {{ currentMonthReservationCount }}건 / {{ maxMonthlyReservations }}건 사용 중
        </div>
        <div class="text-sm">
          무제한 예약이 필요하다면 유료 플랜을 확인해 보세요.
        </div>
      </div>
      <VBtn
        color="info"
        variant="text"
        size="small"
        :to="upgradeRoute"
      >
        플랜 보기
      </VBtn>
    </div>
  </VAlert>
</template>

<script setup>
import { useSubscriptionStore } from '@/stores/subscription'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const subscriptionStore = useSubscriptionStore()

const {
  currentPlan,
  currentMonthReservationCount,
  maxMonthlyReservations,
  shouldShowReservationWarning,
} = storeToRefs(subscriptionStore)

const isLimitReached = computed(() => {
  if (currentPlan.value !== 'FREE') return false
  if (maxMonthlyReservations.value === -1) return false

  return currentMonthReservationCount.value >= maxMonthlyReservations.value
})

const upgradeRoute = { path: '/shop-admin/payment', query: { plan: 'PAID' } }
</script>
