<script setup>
import LegalHeader from '@/components/yemo/legal/LegalHeader.vue'
import MarketingFooter from '@/components/yemo/marketing/MarketingFooter.vue'
</script>

<template>
  <div class="yemo l-layout">
    <a href="#main" class="l-layout__skip">본문으로 건너뛰기</a>
    <LegalHeader />
    <main id="main" class="l-layout__main">
      <RouterView />
    </main>
    <MarketingFooter />
  </div>
</template>

<style lang="scss" scoped>
.l-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--y-bg);

  &__main { flex: 1; }
  &__skip {
    position: absolute;
    left: -9999px;
    top: 0;
    background: var(--y-text-strong);
    color: var(--y-bg);
    padding: 8px 16px;
    border-radius: 0 0 var(--y-radius) 0;
    font-size: 14px;
    z-index: 999;
    &:focus { left: 0; }
  }
}
</style>
