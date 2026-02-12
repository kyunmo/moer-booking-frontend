<script setup>
import PublicHeader from '@/components/public/PublicHeader.vue'
import PublicFooter from '@/components/public/PublicFooter.vue'

const { injectSkinClasses } = useSkins()

// ℹ️ This will inject classes in body tag for accurate styling
injectSkinClasses()

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION
</script>

<template>
  <VApp>
    <AppLoadingIndicator ref="refLoadingIndicator" />

    <div class="layout-wrapper layout-public">
      <!-- Header -->
      <PublicHeader />

      <!-- Main Content -->
      <VMain class="main-content">
        <RouterView #="{Component}">
          <Suspense
            :timeout="0"
            @fallback="isFallbackStateActive = true"
            @resolve="isFallbackStateActive = false"
          >
            <Component :is="Component" />
          </Suspense>
        </RouterView>
      </VMain>

      <!-- Footer -->
      <PublicFooter />
    </div>
  </VApp>
</template>

<style lang="scss" scoped>
.layout-wrapper.layout-public {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .main-content {
    flex: 1;
  }
}
</style>
