<route lang="yaml">
meta:
  layout: public
  requiresCustomerAuth: true
  title: 즐겨찾기 - 모에르(MOER)
</route>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmark'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { useSnackbar } from '@/composables/useSnackbar'
import { getBusinessTypeLabel } from '@/constants/businessTypes'

const router = useRouter()
const bookmarkStore = useBookmarkStore()
const customerAuthStore = useCustomerAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

const loading = computed(() => bookmarkStore.loading)
const bookmarks = computed(() => bookmarkStore.bookmarks)

function goToDetail(bookmark) {
  const identifier = bookmark.slug || bookmark.businessId
  router.push(`/booking/${identifier}`)
}

async function removeBookmark(bookmark, event) {
  event.stopPropagation()
  try {
    await bookmarkStore.toggleBookmark(bookmark.businessId)
    showSuccess('즐겨찾기에서 제거되었습니다')
  }
  catch {
    showError('즐겨찾기 해제에 실패했습니다')
  }
}

onMounted(async () => {
  if (!customerAuthStore.isAuthenticated) {
    router.push('/booking/login?redirect=/booking/bookmarks')

    return
  }
  try {
    await bookmarkStore.fetchBookmarks()
  }
  catch {
    // silently fail
  }
})
</script>

<template>
  <VContainer style="max-inline-size: 900px;" class="py-6">
    <div class="d-flex align-center mb-6">
      <VBtn
        icon
        variant="text"
        @click="router.back()"
      >
        <VIcon>ri-arrow-left-line</VIcon>
      </VBtn>
      <h1 class="text-h5 font-weight-bold ms-2">
        즐겨찾기
      </h1>
      <VSpacer />
      <VChip variant="tonal" color="primary">
        {{ bookmarks.length }}개
      </VChip>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- Empty -->
    <div v-else-if="bookmarks.length === 0" class="text-center py-16">
      <VIcon icon="ri-bookmark-line" size="80" color="grey-lighten-1" class="mb-4" />
      <h3 class="text-h6 text-medium-emphasis mb-2">
        즐겨찾기한 매장이 없습니다
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        마음에 드는 매장을 즐겨찾기에 추가해보세요
      </p>
      <VBtn color="primary" @click="router.push('/booking')">
        매장 둘러보기
      </VBtn>
    </div>

    <!-- Bookmark List -->
    <div v-else class="d-flex flex-column ga-3">
      <VCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="cursor-pointer"
        hover
        rounded="lg"
        @click="goToDetail(bookmark)"
      >
        <div class="d-flex">
          <VImg
            :src="bookmark.imageUrl"
            width="120"
            height="120"
            cover
            class="flex-shrink-0 rounded-s-lg bg-grey-lighten-3"
          >
            <template v-if="!bookmark.imageUrl" #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <VIcon icon="ri-store-2-line" size="32" color="grey-lighten-1" />
              </div>
            </template>
          </VImg>

          <VCardText class="d-flex flex-column justify-center py-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <h3 class="text-subtitle-1 font-weight-bold text-truncate me-2">
                {{ bookmark.businessName }}
              </h3>
              <VBtn
                icon
                variant="text"
                size="small"
                color="error"
                @click="removeBookmark(bookmark, $event)"
              >
                <VIcon>ri-heart-fill</VIcon>
                <VTooltip activator="parent" location="top">
                  즐겨찾기 해제
                </VTooltip>
              </VBtn>
            </div>

            <VChip
              v-if="bookmark.businessType"
              size="x-small"
              variant="tonal"
              color="primary"
              class="mb-1 align-self-start"
            >
              {{ getBusinessTypeLabel(bookmark.businessType) }}
            </VChip>

            <div v-if="bookmark.address" class="d-flex align-center text-body-2 text-medium-emphasis">
              <VIcon size="14" class="me-1">
                ri-map-pin-line
              </VIcon>
              <span class="text-truncate">{{ bookmark.address }}</span>
            </div>
          </VCardText>
        </div>
      </VCard>
    </div>
  </VContainer>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
