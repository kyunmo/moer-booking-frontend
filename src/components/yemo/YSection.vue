<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  sub: { type: String, default: '' },
  align: {
    type: String,
    default: 'center',
    validator: v => ['left', 'center'].includes(v),
  },
})
</script>

<template>
  <section class="y-section">
    <div v-if="eyebrow || title || sub" class="y-section__head" :class="`y-section__head--${align}`">
      <div v-if="eyebrow" class="y-section__eyebrow">· {{ eyebrow }}</div>
      <h2 v-if="title" class="y-section__title">
        <slot name="title">{{ title }}</slot>
      </h2>
      <p v-if="sub" class="y-section__sub">{{ sub }}</p>
    </div>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.y-section {
  padding: 96px 32px;

  @media (max-width: 768px) { padding: 64px 16px; }

  &__head {
    margin-bottom: 56px;

    &--center { text-align: center; & .y-section__sub { margin-left: auto; margin-right: auto; } }
    &--left   { text-align: left; }
  }

  &__eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--y-accent-deep);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.2;
    color: var(--y-text-strong);
    margin-bottom: 16px;

    :deep(.t-accent) { color: var(--y-accent-deep); }

    @media (max-width: 768px) { font-size: 30px; }
  }

  &__sub {
    font-size: 16px;
    color: var(--y-text-muted);
    line-height: 1.7;
    max-width: 560px;
  }
}
</style>
