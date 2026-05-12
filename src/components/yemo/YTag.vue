<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'accent', 'success', 'warning', 'danger', 'info'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md'].includes(v),
  },
  icon: { type: String, default: '' },
})
</script>

<template>
  <span class="y-tag" :class="[`y-tag--${variant}`, `y-tag--${size}`]">
    <Icon v-if="icon" :icon="icon" class="y-tag__icon" aria-hidden="true" />
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.y-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--y-radius-pill);
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;

  &--sm { padding: 3px 10px; font-size: 11px; }
  &--md { padding: 6px 14px; font-size: 12px; }

  &__icon { width: 12px; height: 12px; }

  // Variants
  &--default { background: var(--y-surface-elev); color: var(--y-text); }
  &--accent  { background: var(--y-accent-soft); color: #7A5A2A; }
  &--success { background: var(--y-success-soft); color: #2D5C3D; }
  &--warning { background: var(--y-warning-soft); color: #7A5A2A; }
  &--danger  { background: var(--y-danger-soft); color: #8A2A2A; }
  &--info    { background: var(--y-info-soft); color: #2D4A7A; }
}
</style>
