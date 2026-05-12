<script setup>
defineProps({
  width: {
    type: String,
    default: 'default',
    validator: v => ['narrow', 'reading', 'default', 'wide'].includes(v),
  },
  padding: { type: Boolean, default: true },
})
</script>

<template>
  <div class="y-container" :class="[`y-container--${width}`, { 'y-container--padded': padding }]">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.y-container {
  margin-inline: auto;
  width: 100%;

  &--narrow  { max-width: 720px; }
  &--reading { max-width: 720px; }
  &--default { max-width: 1200px; }
  &--wide    { max-width: 1440px; }

  &--padded {
    padding-inline: 32px;
    @media (max-width: 768px) { padding-inline: 16px; }
  }
}
</style>
