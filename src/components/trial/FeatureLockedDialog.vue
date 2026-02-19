<template>
  <VDialog
    :model-value="modelValue"
    max-width="460"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardItem>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-lock-line" color="warning" class="me-2" />
          유료 기능 안내
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <p class="text-body-1 mb-4">
          이 기능은 유료 플랜에서만 사용할 수 있습니다.
        </p>

        <VAlert
          v-if="info?.message"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ info.message }}
        </VAlert>

        <p class="text-body-2 text-medium-emphasis">
          유료 플랜으로 업그레이드하면 모든 기능을 제한 없이 사용할 수 있습니다.
        </p>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          닫기
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
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  info: {
    type: Object,
    default: () => ({ code: '', message: '' }),
  },
})

defineEmits(['update:modelValue'])

const upgradeRoute = { path: '/shop-admin/payment', query: { plan: 'PAID' } }
</script>
