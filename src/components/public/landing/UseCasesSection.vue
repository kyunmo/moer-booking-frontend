<script setup>
import { reactive } from 'vue'

const useCases = reactive([
  {
    title: '미용실',
    icon: 'ri-scissors-line',
    color: 'primary',
    isHover: false,
  },
  {
    title: '네일샵',
    icon: 'ri-hand-heart-line',
    color: 'success',
    isHover: false,
  },
  {
    title: '필라테스',
    icon: 'ri-heart-pulse-line',
    color: 'warning',
    isHover: false,
  },
  {
    title: '피부관리',
    icon: 'ri-sparkling-line',
    color: 'info',
    isHover: false,
  },
  {
    title: '스터디카페',
    icon: 'ri-book-open-line',
    color: 'error',
    isHover: false,
  },
  {
    title: '공유오피스',
    icon: 'ri-building-2-line',
    color: 'secondary',
    isHover: false,
  },
  {
    title: '병원/클리닉',
    icon: 'ri-hospital-line',
    color: 'primary',
    isHover: false,
  },
  {
    title: 'PT/피트니스',
    icon: 'ri-run-line',
    color: 'success',
    isHover: false,
  },
])
</script>

<template>
  <section class="use-cases-section">
    <VContainer>
      <!-- Section Header -->
      <div class="text-center mb-12">
        <VChip
          class="mb-4"
          variant="tonal"
          color="primary"
          prepend-icon="ri-store-2-line"
        >
          업종
        </VChip>

        <h2 class="text-h4 font-weight-bold mb-3">
          어떤 업종이든 OK
        </h2>

        <p class="text-body-1 text-medium-emphasis">
          예약이 필요한 모든 곳에서 사용 가능합니다
        </p>
      </div>

      <!-- Use Cases Grid -->
      <VRow justify="center">
        <VCol
          v-for="(item, index) in useCases"
          :key="index"
          cols="6"
          sm="6"
          md="3"
        >
          <div
            class="use-case-item text-center pa-6"
            @mouseenter="item.isHover = true"
            @mouseleave="item.isHover = false"
          >
            <VAvatar
              size="82"
              :color="item.color"
              :variant="item.isHover ? 'elevated' : 'tonal'"
              class="mb-4 use-case-avatar"
              :class="{ 'use-case-avatar--hover': item.isHover }"
            >
              <VIcon
                :icon="item.icon"
                size="42"
              />
            </VAvatar>

            <div class="text-body-1 font-weight-medium">
              {{ item.title }}
            </div>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.use-cases-section {
  padding-block: 5rem;
  background-color: rgb(var(--v-theme-surface));
}

.use-case-item {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
}

.use-case-avatar {
  transition: all 0.3s ease;

  &--hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

@media (max-width: 600px) {
  .use-cases-section {
    padding-block: 3rem;
  }

  .use-case-item {
    padding: 1rem !important;
  }
}
</style>
