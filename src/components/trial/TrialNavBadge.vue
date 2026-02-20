<template>
  <div v-if="shouldShow" class="d-inline-flex">
    <VTooltip location="bottom">
      <template #activator="{ props }">
        <VBtn
          v-bind="props"
          icon
          variant="text"
          size="small"
          aria-label="구독 관리"
          :to="{ name: 'shop-admin-subscription' }"
        >
          <VBadge
            :content="badgeText"
            :color="badgeColor"
            inline
          >
            <VIcon icon="ri-vip-crown-line" size="22" />
          </VBadge>
        </VBtn>
      </template>
      <span>{{ tooltipText }}</span>
    </VTooltip>
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

const badgeText = computed(() => {
  if (trialStatus.value === 'active' || trialStatus.value === 'expiring') {
    return `D-${daysUntilTrialEnd.value}`
  }
  if (isTrialExpired.value) {
    return 'FREE'
  }

  return 'FREE'
})

const badgeColor = computed(() => {
  if (trialStatus.value === 'expiring') return 'warning'
  if (trialStatus.value === 'active') return 'info'
  if (isTrialExpired.value) return 'error'

  return 'secondary'
})

const tooltipText = computed(() => {
  if (trialStatus.value === 'active') {
    return `유료 기능 체험 중 (${daysUntilTrialEnd.value}일 남음)`
  }
  if (trialStatus.value === 'expiring') {
    return `체험 종료 임박 (${daysUntilTrialEnd.value}일 남음)`
  }
  if (isTrialExpired.value) {
    return '유료 체험이 종료되었습니다. 업그레이드하세요!'
  }

  return '무료 플랜 사용 중'
})
</script>
