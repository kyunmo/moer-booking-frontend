<script setup>
import { computed } from 'vue'
import TermsContent from './TermsContent.vue'
import PrivacyContent from './PrivacyContent.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'terms',
    validator: value => ['terms', 'privacy'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])

const title = computed(() => {
  return props.type === 'terms' ? 'YEMO(예모) 서비스 이용약관' : 'YEMO(예모) 개인정보처리방침'
})

const contentComponent = computed(() => {
  return props.type === 'terms' ? TermsContent : PrivacyContent
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon
          :icon="type === 'terms' ? 'ri-file-text-line' : 'ri-shield-check-line'"
          size="24"
          class="me-3"
        />
        <span>{{ title }}</span>
        <VSpacer />
        <IconBtn @click="close">
          <VIcon icon="ri-close-line" />
        </IconBtn>
      </VCardTitle>

      <VDivider />

      <VCardText style="max-height: 70vh;">
        <component :is="contentComponent" />
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          @click="close"
        >
          확인
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
