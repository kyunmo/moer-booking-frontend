<script setup>
import { useRouter, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <header class="l-header">
    <div class="l-header__inner">
      <button class="l-header__back" aria-label="뒤로" @click="goBack">
        <Icon icon="ph:arrow-left" aria-hidden="true" />
        <span>뒤로</span>
      </button>
      <RouterLink to="/" class="l-header__wordmark" aria-label="YEMO 홈으로">YEMO</RouterLink>
      <div class="l-header__spacer" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.l-header {
  position: sticky;
  top: 0;
  z-index: var(--y-z-sticky);
  background: rgba(250, 250, 248, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--y-border);

  &__inner {
    max-width: 1200px;
    margin-inline: auto;
    height: 64px;
    padding-inline: 32px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    @media (max-width: 768px) {
      height: 56px;
      padding-inline: 16px;
    }
  }
  &__back {
    justify-self: start;
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--y-text-muted);
    padding: 8px 12px 8px 0;
    transition: color var(--y-dur-fast) var(--y-ease);
    &:hover { color: var(--y-text-strong); }
    svg { width: 18px; height: 18px; }
  }
  &__wordmark {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--y-text-strong);
  }
  &__spacer { justify-self: end; }
}
</style>
