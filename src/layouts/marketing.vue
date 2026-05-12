<script setup>
import MarketingHeader from '@/components/yemo/marketing/MarketingHeader.vue'
import MarketingFooter from '@/components/yemo/marketing/MarketingFooter.vue'
</script>

<template>
  <div class="yemo m-layout">
    <a href="#main" class="m-layout__skip">본문으로 건너뛰기</a>
    <MarketingHeader />
    <main id="main" class="m-layout__main">
      <RouterView v-slot="{ Component }">
        <Transition name="m-fade" mode="out-in">
          <Component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <MarketingFooter />
  </div>
</template>

<style lang="scss" scoped>
.m-layout {
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
.m-fade-enter-active, .m-fade-leave-active { transition: opacity var(--y-dur-fast) var(--y-ease); }
.m-fade-enter-from, .m-fade-leave-to { opacity: 0; }
</style>
