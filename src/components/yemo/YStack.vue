<script setup>
defineProps({
  gap: {
    type: [Number, String],
    default: 16,
  },
  align: {
    type: String,
    default: 'stretch',
    validator: v => ['stretch', 'start', 'center', 'end'].includes(v),
  },
  as: { type: String, default: 'div' },
})
</script>

<template>
  <component
    :is="as"
    class="y-stack"
    :class="`y-stack--align-${align}`"
    :style="{ '--y-stack-gap': typeof gap === 'number' ? `${gap}px` : gap }"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.y-stack {
  display: flex;
  flex-direction: column;
  gap: var(--y-stack-gap, 16px);

  &--align-stretch { align-items: stretch; }
  &--align-start   { align-items: flex-start; }
  &--align-center  { align-items: center; }
  &--align-end     { align-items: flex-end; }
}
</style>
