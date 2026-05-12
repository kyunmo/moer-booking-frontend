<script setup>
defineProps({
  interactive: { type: Boolean, default: false },
  padding: {
    type: String,
    default: 'md',
    validator: v => ['none', 'sm', 'md', 'lg'].includes(v),
  },
  bordered: { type: Boolean, default: true },
  elevated: { type: Boolean, default: false },
  radius: {
    type: String,
    default: 'xl',
    validator: v => ['md', 'lg', 'xl', '2xl'].includes(v),
  },
  as: { type: String, default: 'div' },
})
</script>

<template>
  <component
    :is="as"
    class="y-card"
    :class="[
      `y-card--p-${padding}`,
      `y-card--r-${radius}`,
      { 'y-card--bordered': bordered, 'y-card--elevated': elevated, 'y-card--interactive': interactive },
    ]"
  >
    <slot name="media" />
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.y-card {
  background: var(--y-surface);
  position: relative;
  overflow: hidden;

  &--bordered { border: 1px solid var(--y-border); }
  &--elevated { box-shadow: var(--y-shadow); }

  // Radius
  &--r-md { border-radius: var(--y-radius-md); }
  &--r-lg { border-radius: var(--y-radius-lg); }
  &--r-xl { border-radius: var(--y-radius-xl); }
  &--r-2xl { border-radius: var(--y-radius-2xl); }

  // Padding
  &--p-none { padding: 0; }
  &--p-sm   { padding: 16px; }
  &--p-md   { padding: 24px; }
  &--p-lg   { padding: 32px; }

  // Interactive (hover lift)
  &--interactive {
    cursor: pointer;
    transition:
      transform var(--y-dur-base) var(--y-ease-dramatic),
      box-shadow var(--y-dur-base) var(--y-ease),
      border-color var(--y-dur-fast) var(--y-ease);
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--y-shadow-lg);
      border-color: var(--y-border-strong);
    }
  }
}
</style>
