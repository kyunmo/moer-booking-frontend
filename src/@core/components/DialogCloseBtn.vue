<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: 'ri-close-line',
  },
  iconSize: {
    type: String,
    required: false,
    default: '22',
  },
})
</script>

<template>
  <IconBtn class="v-dialog-close-btn" aria-label="닫기">
    <VIcon
      :icon="props.icon"
      :size="props.iconSize"
    />
  </IconBtn>
</template>
