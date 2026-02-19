<template>
  <!-- 만료 상태 -->
  <VAlert
    v-if="isTrialExpired"
    type="error"
    variant="tonal"
    class="mb-4"
  >
    <div class="d-flex align-center">
      <VIcon icon="ri-error-warning-line" size="24" class="me-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1">
          유료 체험이 종료되었습니다
        </div>
        <div class="text-sm">
          유료 기능을 계속 사용하려면 업그레이드해 주세요.
        </div>
      </div>
      <VBtn
        color="error"
        variant="elevated"
        size="small"
        :to="upgradeRoute"
      >
        업그레이드하기
      </VBtn>
    </div>
  </VAlert>

  <!-- 임박 상태 (≤7일) -->
  <VAlert
    v-else-if="trialStatus === 'expiring'"
    type="warning"
    variant="tonal"
    class="mb-4"
  >
    <div class="d-flex align-center">
      <VIcon icon="ri-alarm-warning-line" size="24" class="me-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1">
          체험이 곧 끝납니다! ({{ daysUntilTrialEnd }}일 남음)
        </div>
        <div class="text-sm">
          체험 종료 전에 업그레이드하면 서비스가 중단 없이 이어집니다.
        </div>
      </div>
      <VBtn
        color="warning"
        variant="elevated"
        size="small"
        :to="upgradeRoute"
      >
        지금 업그레이드
      </VBtn>
    </div>
  </VAlert>

  <!-- 활성 상태 (>7일) -->
  <VAlert
    v-else-if="trialStatus === 'active'"
    type="info"
    variant="tonal"
    class="mb-4"
  >
    <div class="d-flex align-center">
      <VIcon icon="ri-gift-line" size="24" class="me-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1">
          유료 기능 체험 중 ({{ daysUntilTrialEnd }}일 남음)
        </div>
        <div class="text-sm">
          체험 기간 동안 모든 유료 기능을 자유롭게 이용해 보세요.
        </div>
      </div>
      <VBtn
        color="info"
        variant="elevated"
        size="small"
        :to="upgradeRoute"
      >
        업그레이드
      </VBtn>
    </div>
  </VAlert>
</template>

<script setup>
import { useSubscriptionStore } from '@/stores/subscription'
import { storeToRefs } from 'pinia'

const subscriptionStore = useSubscriptionStore()

const { trialStatus, isTrialExpired, daysUntilTrialEnd } = storeToRefs(subscriptionStore)

const upgradeRoute = { path: '/shop-admin/payment', query: { plan: 'PAID' } }
</script>
