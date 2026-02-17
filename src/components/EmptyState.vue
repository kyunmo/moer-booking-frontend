<script setup>
defineProps({
  icon: { type: String, default: 'ri-inbox-line' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  actionIcon: { type: String, default: '' },
})
const emit = defineEmits(['action'])
</script>

<template>
  <div class="text-center pa-12">
    <VAvatar color="primary" variant="tonal" size="80" class="mb-4">
      <VIcon :icon="icon" size="40" />
    </VAvatar>
    <h3 class="text-h6 font-weight-bold mb-2">{{ title }}</h3>
    <p v-if="description" class="text-body-2 text-medium-emphasis mb-6">{{ description }}</p>
    <slot>
      <VBtn v-if="actionLabel" color="primary" variant="elevated" @click="emit('action')">
        <VIcon v-if="actionIcon" start>{{ actionIcon }}</VIcon>
        {{ actionLabel }}
      </VBtn>
    </slot>
  </div>
</template>
