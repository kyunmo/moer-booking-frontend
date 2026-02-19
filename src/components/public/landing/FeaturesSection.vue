<template>
  <section id="features" class="features-section">
    <VContainer>
      <!-- Section Header -->
      <div class="headers d-flex justify-center flex-column align-center mb-10">
        <VChip
          color="primary"
          variant="tonal"
          class="mb-4"
          prepend-icon="ri-function-line"
        >
          주요 기능
        </VChip>
        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            예약 관리에 필요한 모든 것
          </span>
        </div>
        <p class="text-body-1 font-weight-medium text-center text-medium-emphasis">
          복잡한 설정 없이, 5분이면 바로 사용 가능합니다
        </p>
      </div>

      <!-- 6-card grid -->
      <VRow>
        <VCol
          v-for="(feature, index) in features"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
            <VAvatar
              variant="outlined"
              size="82"
              color="primary"
              class="mb-2 feature-avatar"
            >
              <VIcon
                :icon="feature.icon"
                size="36"
              />
            </VAvatar>
            <h5 class="text-h5">
              {{ feature.title }}
            </h5>
            <p
              class="text-center text-medium-emphasis"
              style="max-inline-size: 360px;"
            >
              {{ feature.description }}
            </p>
          </div>
        </VCol>
      </VRow>

      <!-- "View all features" link -->
      <div class="text-center mt-8">
        <VBtn
          variant="text"
          to="/features"
          append-icon="ri-arrow-right-line"
        >
          모든 기능 자세히 보기
        </VBtn>
      </div>
    </VContainer>
  </section>
</template>

<script setup>
const features = [
  {
    icon: 'ri-calendar-check-line',
    title: '24시간 자동 예약',
    description: '고객이 언제든 직접 예약. 관리자는 아침에 확인만 하면 끝!',
  },
  {
    icon: 'ri-kakao-talk-line',
    title: '카카오톡 자동 알림',
    description: '예약 확정, 하루 전 리마인더 자동 발송. 노쇼율 대폭 감소 (베타 오픈 예정)',
  },
  {
    icon: 'ri-user-heart-line',
    title: '스마트 고객 관리',
    description: '방문 이력, 선호 서비스 자동 기록. VIP 고객 자동 구분',
  },
  {
    icon: 'ri-line-chart-line',
    title: '실시간 통계',
    description: '오늘 매출, 인기 서비스 한눈에. 데이터 기반 경영',
  },
  {
    icon: 'ri-shield-check-line',
    title: '시간 충돌 방지',
    description: '예약 겹침 걱정 Zero. 시스템이 자동으로 체크',
  },
  {
    icon: 'ri-smartphone-line',
    title: '모바일 최적화',
    description: '어떤 기기에서도 완벽. 관리자도, 고객도 스마트폰으로 OK',
  },
]
</script>

<style lang="scss" scoped>
.features-section {
  padding-block: 5rem;
  background-color: rgb(var(--v-theme-surface));
}

.feature {
  .feature-avatar.v-avatar--variant-outlined {
    border: 2px solid rgba(var(--v-theme-primary), 0.32);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(var(--v-theme-primary), 0.16);
      cursor: pointer;
    }
  }
}
</style>
