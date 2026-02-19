<script setup>
const targets = [
  {
    icon: 'ri-phone-line',
    color: 'primary',
    title: '전화 예약이 부담스러운 원장님',
    description: '영업 중 전화 받느라 시술에 집중 못하시죠? 온라인 예약으로 전화 없이 예약을 받아보세요.',
  },
  {
    icon: 'ri-time-line',
    color: 'warning',
    title: '예약 관리에 시간 뺏기는 실장님',
    description: '수기 장부, 카톡 예약... 관리가 힘드시죠? 한 화면에서 모든 예약을 관리하세요.',
  },
  {
    icon: 'ri-emotion-sad-line',
    color: 'error',
    title: '노쇼가 속상한 사장님',
    description: '예약해놓고 안 오는 고객 때문에 고민이시죠? 알림 시스템으로 노쇼를 줄여보세요.',
  },
]
</script>

<template>
  <section class="target-users-section">
    <VContainer>
      <!-- Section Header -->
      <div class="text-center mb-12">
        <VChip
          class="mb-4"
          variant="tonal"
          color="primary"
          prepend-icon="ri-user-star-line"
        >
          추천 대상
        </VChip>

        <h2 class="text-h4 font-weight-bold mb-3">
          이런 분들에게 추천합니다
        </h2>
      </div>

      <!-- Target User Cards -->
      <VRow justify="center">
        <VCol
          v-for="(target, index) in targets"
          :key="index"
          cols="12"
          md="4"
        >
          <VCard class="target-card h-100 pa-6">
            <div class="d-flex align-center gap-3 mb-4">
              <VAvatar
                variant="tonal"
                :color="target.color"
                size="56"
              >
                <VIcon
                  :icon="target.icon"
                  size="28"
                />
              </VAvatar>
            </div>

            <h3 class="text-h6 font-weight-bold mb-3">
              {{ target.title }}
            </h3>

            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ target.description }}
            </p>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.target-users-section {
  padding-block: 5rem;
  background-color: rgb(var(--v-theme-background));
}

.target-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }
}

@media (max-width: 600px) {
  .target-users-section {
    padding-block: 3rem;
  }
}
</style>
