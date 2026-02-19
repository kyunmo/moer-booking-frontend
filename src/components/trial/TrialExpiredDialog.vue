<template>
  <VDialog
    :model-value="modelValue"
    max-width="520"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardItem>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-error-warning-line" color="error" class="me-2" />
          유료 체험이 종료되었습니다
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <p class="text-body-1 mb-4">
          30일 무료 체험이 종료되어 다음 기능을 더 이상 사용할 수 없습니다.
        </p>

        <VList density="compact" class="mb-4">
          <VListItem
            v-for="(feature, index) in excludedFeatures"
            :key="index"
            class="px-0"
          >
            <template #prepend>
              <VIcon icon="ri-lock-line" size="18" color="error" class="me-2" />
            </template>
            <VListItemTitle class="text-body-2">
              {{ feature }}
            </VListItemTitle>
          </VListItem>
        </VList>

        <VAlert type="info" variant="tonal" density="compact">
          업그레이드하면 모든 기능을 제한 없이 사용할 수 있습니다.
        </VAlert>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          나중에 할게요
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :to="upgradeRoute"
          @click="$emit('update:modelValue', false)"
        >
          <VIcon icon="ri-vip-crown-line" start />
          업그레이드하기
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { PLANS } from '@/constants/pricing'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const excludedFeatures = PLANS.FREE.excludedFeatures
const upgradeRoute = { path: '/shop-admin/payment', query: { plan: 'PAID' } }
</script>
