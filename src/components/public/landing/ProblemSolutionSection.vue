<script setup>
const pairs = [
  {
    problem: {
      icon: 'ri-phone-line',
      color: 'error',
      title: '끊임없이 울리는 전화',
      description: '영업 중에도 쉴 새 없이 걸려오는 예약 전화.\n다른 고객 응대 중에 놓치는 전화도 부지기수.',
    },
    solution: {
      icon: 'ri-calendar-check-line',
      color: 'primary',
      title: '24시간 자동 예약',
      description: '고객이 직접 원하는 시간에 예약.\n관리자는 아침에 확인만 하면 끝!',
    },
  },
  {
    problem: {
      icon: 'ri-file-text-line',
      color: 'warning',
      title: '수첩에 빼곡한 예약',
      description: '손으로 쓴 예약장은 알아보기 어렵고,\n겹치는 예약은 놓치기 일쑤.',
    },
    solution: {
      icon: 'ri-notification-line',
      color: 'success',
      title: '카카오톡 자동 알림',
      description: '예약 확정, 하루 전 리마인더까지 자동 발송.\n노쇼율 70% 감소 효과!',
    },
  },
  {
    problem: {
      icon: 'ri-emotion-sad-line',
      color: 'info',
      title: '예약하고 안 오는 고객',
      description: '힘들게 시간 비워놨는데 노쇼.\n매출 손실에 다른 고객 기회비용까지.',
    },
    solution: {
      icon: 'ri-user-heart-line',
      color: 'warning',
      title: '스마트 고객 관리',
      description: '방문 이력, 선호 서비스 자동 기록.\nVIP 고객 자동 분류로 맞춤 관리.',
    },
  },
  {
    problem: {
      icon: 'ri-question-line',
      color: 'secondary',
      title: '지난번에 뭐 했더라?',
      description: '단골 고객인데 저번에 뭘 했는지 기억이 안 나고,\n메모를 찾으려면 한참 뒤져야 하고.',
    },
    solution: {
      icon: 'ri-line-chart-line',
      color: 'info',
      title: '실시간 통계',
      description: '오늘 매출, 인기 서비스, 예약 현황 한눈에.\n데이터 기반 경영으로 매출 UP!',
    },
  },
]
</script>

<template>
  <section class="problem-solution-section">
    <VContainer>
      <!-- Section Header -->
      <div class="text-center mb-12">
        <VChip
          class="mb-4"
          variant="tonal"
          color="primary"
          prepend-icon="ri-magic-line"
        >
          BEFORE & AFTER
        </VChip>

        <h2 class="text-h4 font-weight-bold mb-3">
          이런 고민, 혹시 있으신가요?
        </h2>

        <p class="text-body-1 text-medium-emphasis">
          YEMO가 모든 문제를 해결해드립니다
        </p>
      </div>

      <!-- Problem/Solution Pairs -->
      <VRow>
        <VCol
          v-for="(pair, index) in pairs"
          :key="index"
          cols="12"
          md="6"
        >
          <VCard class="problem-solution-card h-100 pa-6">
            <!-- Problem block -->
            <div class="mb-4">
              <div class="d-flex align-center gap-3 mb-3">
                <VAvatar
                  variant="tonal"
                  :color="pair.problem.color"
                  size="48"
                >
                  <VIcon :icon="pair.problem.icon" />
                </VAvatar>

                <VChip
                  size="x-small"
                  color="error"
                  variant="flat"
                >
                  BEFORE
                </VChip>
              </div>

              <h3 class="text-h6 font-weight-bold mb-2">
                {{ pair.problem.title }}
              </h3>

              <p
                class="text-body-2 text-medium-emphasis mb-0"
                style="white-space: pre-line;"
              >
                {{ pair.problem.description }}
              </p>
            </div>

            <VDivider class="my-4" />

            <!-- Solution block -->
            <div>
              <div class="d-flex align-center gap-3 mb-3">
                <VAvatar
                  variant="tonal"
                  :color="pair.solution.color"
                  size="48"
                >
                  <VIcon :icon="pair.solution.icon" />
                </VAvatar>

                <VChip
                  size="x-small"
                  color="success"
                  variant="flat"
                >
                  AFTER
                </VChip>
              </div>

              <h3 class="text-h6 font-weight-bold mb-2">
                {{ pair.solution.title }}
              </h3>

              <p
                class="text-body-2 text-medium-emphasis mb-0"
                style="white-space: pre-line;"
              >
                {{ pair.solution.description }}
              </p>
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.problem-solution-section {
  padding-block: 12rem 5rem;
  background-color: rgb(var(--v-theme-background));
}

.problem-solution-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }
}

@media (max-width: 960px) {
  .problem-solution-section {
    padding-block: 8rem 4rem;
  }
}

@media (max-width: 600px) {
  .problem-solution-section {
    padding-block: 4rem 3rem;
  }
}
</style>
