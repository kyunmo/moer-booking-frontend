<template>
  <VSlideYTransition>
    <VBanner
      v-if="isOffline"
      color="warning"
      icon="ri-wifi-off-line"
      class="offline-banner"
      sticky
      lines="one"
    >
      <template #text>
        <span class="text-body-2 font-weight-medium">
          인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.
        </span>
      </template>
      <template #actions>
        <VBtn
          variant="text"
          size="small"
          aria-label="새로고침"
          @click="retry"
        >
          다시 시도
        </VBtn>
      </template>
    </VBanner>
  </VSlideYTransition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOffline = ref(!navigator.onLine)

function handleOnline() {
  isOffline.value = false
}

function handleOffline() {
  isOffline.value = true
}

function retry() {
  window.location.reload()
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style lang="scss" scoped>
.offline-banner {
  z-index: 9999;
}
</style>
