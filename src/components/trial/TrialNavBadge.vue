<template>
  <div v-if="shouldShow" class="d-inline-flex align-center">
    <VBtn
      variant="tonal"
      :color="chipColor"
      size="small"
      class="trial-nav-badge"
      aria-label="구독 관리"
      :to="{ name: 'shop-admin-subscription' }"
    >
      <VIcon icon="ri-vip-crown-line" size="18" start />
      <span class="text-caption font-weight-bold">{{ labelText }}</span>
    </VBtn>
  </div>
</template>

<script setup>
import { useSubscriptionStore } from '@/stores/subscription'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const subscriptionStore = useSubscriptionStore()
const { currentPlan, trialStatus, daysUntilTrialEnd, isTrialExpired } = storeToRefs(subscriptionStore)

const shouldShow = computed(() => {
  return currentPlan.value === 'FREE' || trialStatus.value === 'active' || trialStatus.value === 'expiring'
})

const labelText = computed(() => {
  if (trialStatus.value === 'active' || trialStatus.value === 'expiring') {
    return `체험 D-${daysUntilTrialEnd.value}`
  }
  if (isTrialExpired.value) {
    return '무료'
  }

  return '무료'
})

const chipColor = computed(() => {
  if (trialStatus.value === 'expiring') return 'warning'
  if (trialStatus.value === 'active') return 'info'
  if (isTrialExpired.value) return 'error'

  return 'secondary'
})
</script>

<style lang="scss" scoped>
.trial-nav-badge {
  white-space: nowrap;
  min-inline-size: auto;
  letter-spacing: 0.2px;
}
</style>
