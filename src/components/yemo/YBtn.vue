<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'text', 'accent', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
  pill: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
  appendIcon: { type: String, default: '' },
  type: { type: String, default: 'button' },
  ariaLabel: { type: String, default: '' },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel || undefined"
    :aria-busy="loading || undefined"
    class="y-btn"
    :class="[
      `y-btn--${variant}`,
      `y-btn--${size}`,
      { 'y-btn--pill': pill, 'y-btn--block': block, 'y-btn--loading': loading },
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="y-btn__spinner" aria-hidden="true">
      <Icon icon="ph:circle-notch" />
    </span>
    <Icon v-else-if="prependIcon" :icon="prependIcon" class="y-btn__icon" aria-hidden="true" />
    <span class="y-btn__label"><slot /></span>
    <Icon v-if="appendIcon && !loading" :icon="appendIcon" class="y-btn__icon" aria-hidden="true" />
  </button>
</template>

<style lang="scss" scoped>
.y-btn {
  font-family: inherit;
  font-weight: 600;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: var(--y-radius-md);
  cursor: pointer;
  transition:
    background-color var(--y-dur-fast) var(--y-ease),
    border-color var(--y-dur-fast) var(--y-ease),
    color var(--y-dur-fast) var(--y-ease),
    transform var(--y-dur-fast) var(--y-ease),
    box-shadow var(--y-dur-fast) var(--y-ease);

  &:disabled { cursor: not-allowed; opacity: 0.5; }
  &:active:not(:disabled) { transform: translateY(0); }

  // Sizes (fixed heights)
  &--sm { height: 36px; padding: 0 16px; font-size: 12px; border-radius: var(--y-radius); }
  &--md { height: 44px; padding: 0 22px; font-size: 14px; }
  &--lg { height: 52px; padding: 0 28px; font-size: 15px; font-weight: 700; border-radius: var(--y-radius-lg); }

  &--pill { border-radius: var(--y-radius-pill); }
  &--block { width: 100%; }

  &__icon { width: 18px; height: 18px; flex-shrink: 0; }
  &--sm &__icon { width: 14px; height: 14px; }

  &__spinner {
    width: 16px; height: 16px;
    display: inline-flex;
    animation: y-btn-spin 1s linear infinite;
  }
  &--loading { pointer-events: none; }

  // ── Variants ─────────────────────────────────────
  &--primary {
    background: var(--y-text-strong);
    color: var(--y-bg);
    &:hover:not(:disabled) { background: #000; transform: translateY(-1px); box-shadow: var(--y-shadow-md); }
  }
  &--secondary {
    background: var(--y-surface);
    color: var(--y-text);
    border-color: var(--y-border);
    &:hover:not(:disabled) { background: var(--y-bg); border-color: var(--y-border-strong); }
  }
  &--ghost {
    background: transparent;
    color: var(--y-text);
    &:hover:not(:disabled) { background: var(--y-surface-elev); }
  }
  &--text {
    background: transparent;
    color: var(--y-accent-deep);
    font-weight: 600;
    height: auto;
    padding: 8px 4px;
    &:hover:not(:disabled) { color: #7A5A2A; }
  }
  &--accent {
    background: var(--y-accent);
    color: var(--y-text-strong);
    font-weight: 700;
    &:hover:not(:disabled) {
      background: var(--y-accent-deep);
      color: var(--y-bg);
      transform: translateY(-1px);
      box-shadow: var(--y-shadow-accent);
    }
  }
  &--danger {
    background: var(--y-danger);
    color: var(--y-bg);
    &:hover:not(:disabled) { background: #8A2A2A; }
  }
}

@keyframes y-btn-spin {
  to { transform: rotate(360deg); }
}
</style>
