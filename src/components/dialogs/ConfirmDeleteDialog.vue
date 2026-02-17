<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '삭제 확인' },
  itemName: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '삭제' },
  confirmColor: { type: String, default: 'error' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <VDialog :model-value="modelValue" max-width="400" @update:model-value="emit('update:modelValue', $event)">
    <VCard>
      <VCardTitle class="text-h6 pa-5 pb-3">{{ title }}</VCardTitle>
      <VCardText class="pa-5 pt-0">
        <p v-if="itemName" class="text-body-1 mb-3">
          <strong>{{ itemName }}</strong>을(를) {{ confirmText.toLowerCase() }}하시겠습니까?
        </p>
        <VAlert type="warning" variant="tonal" density="compact">
          {{ message || '삭제된 정보는 복구할 수 없습니다.' }}
        </VAlert>
      </VCardText>
      <VDivider />
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn variant="text" @click="close">취소</VBtn>
        <VBtn :color="confirmColor" :loading="loading" @click="confirm">{{ confirmText }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
