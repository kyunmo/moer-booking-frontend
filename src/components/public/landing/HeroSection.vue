<script setup>
import { useMouse } from '@vueuse/core'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { x, y } = useMouse({ touch: false })

const dashboardTranslateStyle = computed(() => {
  if (typeof window === 'undefined') return {}

  const posX = (window.innerWidth - x.value * 3) / 100
  const posY = Math.max((window.innerHeight - y.value * 3) / 100, -40)

  return { transform: `translate(${posX}px, ${posY}px)` }
})

function startFreeTrial() {
  router.push('/register')
}

function viewPricing() {
  router.push('/pricing')
}
</script>

<template>
  <section
    id="home"
    class="hero-section"
  >
    <!-- Background gradient -->
    <div class="hero-bg">
      <VContainer>
        <VRow justify="center">
          <VCol
            cols="12"
            md="10"
            lg="8"
          >
            <div class="text-center">
              <!-- Headline -->
              <h1 class="hero-title mb-4">
                <span class="text-primary">예약 관리,</span>
                <br>
                이제 자동으로 해결하세요
              </h1>

              <!-- Subheadline -->
              <p class="text-body-1 text-medium-emphasis mb-6" style="max-inline-size: 540px; margin-inline: auto;">
                전화 예약은 이제 그만! 고객이 직접 예약하고, 카카오톡으로 자동 알림 발송
              </p>

              <!-- Feature chips -->
              <div class="d-flex flex-wrap justify-center gap-3 mb-8">
                <VChip
                  size="large"
                  variant="tonal"
                  color="primary"
                  prepend-icon="ri-timer-flash-line"
                >
                  5분이면 시작 가능
                </VChip>

                <VChip
                  size="large"
                  variant="tonal"
                  color="primary"
                  prepend-icon="ri-kakao-talk-line"
                >
                  카카오톡 자동 알림
                </VChip>

                <VChip
                  size="large"
                  variant="tonal"
                  color="primary"
                  prepend-icon="ri-gift-line"
                >
                  무료로 시작 가능
                </VChip>
              </div>

              <!-- CTA Buttons -->
              <div class="d-flex flex-wrap justify-center gap-4 mb-8">
                <VBtn
                  size="x-large"
                  color="primary"
                  variant="elevated"
                  prepend-icon="ri-rocket-line"
                  @click="startFreeTrial"
                >
                  무료로 시작하기
                </VBtn>

                <VBtn
                  size="x-large"
                  variant="outlined"
                  prepend-icon="ri-play-circle-line"
                  @click="viewPricing"
                >
                  요금제 보기
                </VBtn>
              </div>

              <!-- Trust points -->
              <div class="d-flex flex-wrap justify-center align-center gap-4 mb-12">
                <div class="d-flex align-center gap-2 text-medium-emphasis">
                  <VIcon
                    size="20"
                    icon="ri-gift-line"
                    color="primary"
                  />
                  <span class="text-body-2">30일 무료 체험</span>
                </div>

                <VDivider
                  vertical
                  class="d-none d-sm-block"
                  style="block-size: 20px;"
                />

                <div class="d-flex align-center gap-2 text-medium-emphasis">
                  <VIcon
                    size="20"
                    icon="ri-bank-card-line"
                    color="primary"
                  />
                  <span class="text-body-2">신용카드 등록 불필요</span>
                </div>

                <VDivider
                  vertical
                  class="d-none d-sm-block"
                  style="block-size: 20px;"
                />

                <div class="d-flex align-center gap-2 text-medium-emphasis">
                  <VIcon
                    size="20"
                    icon="ri-close-circle-line"
                    color="primary"
                  />
                  <span class="text-body-2">언제든 해지 가능</span>
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </div>

    <!-- Dashboard Preview Placeholder -->
    <VContainer>
      <div class="hero-animation-img">
        <div
          class="hero-dashboard-img"
          :style="dashboardTranslateStyle"
        >
          <VCard
            class="mx-auto dashboard-placeholder"
            elevation="8"
            max-width="85%"
          >
            <!-- Mock header bar -->
            <div class="dashboard-mock-header d-flex align-center pa-3 gap-2">
              <div
                class="mock-dot"
                style="background-color: rgb(var(--v-theme-error));"
              />
              <div
                class="mock-dot"
                style="background-color: rgb(var(--v-theme-warning));"
              />
              <div
                class="mock-dot"
                style="background-color: rgb(var(--v-theme-success));"
              />
              <span class="text-caption text-medium-emphasis ms-2">
                YEMO - 예약 관리 대시보드
              </span>
            </div>

            <VDivider />

            <!-- Stat cards -->
            <VCardText>
              <VRow class="mb-4">
                <VCol cols="6" sm="3">
                  <VCard
                    variant="tonal"
                    color="primary"
                    class="pa-3 text-center"
                  >
                    <VIcon
                      icon="ri-calendar-check-line"
                      size="24"
                      class="mb-1"
                    />
                    <div class="text-h5 font-weight-bold">
                      24
                    </div>
                    <div class="text-caption">
                      오늘 예약
                    </div>
                  </VCard>
                </VCol>

                <VCol cols="6" sm="3">
                  <VCard
                    variant="tonal"
                    color="success"
                    class="pa-3 text-center"
                  >
                    <VIcon
                      icon="ri-user-line"
                      size="24"
                      class="mb-1"
                    />
                    <div class="text-h5 font-weight-bold">
                      156
                    </div>
                    <div class="text-caption">
                      이달 고객
                    </div>
                  </VCard>
                </VCol>

                <VCol cols="6" sm="3">
                  <VCard
                    variant="tonal"
                    color="warning"
                    class="pa-3 text-center"
                  >
                    <VIcon
                      icon="ri-money-dollar-circle-line"
                      size="24"
                      class="mb-1"
                    />
                    <div class="text-h5 font-weight-bold">
                      2.4M
                    </div>
                    <div class="text-caption">
                      이달 매출
                    </div>
                  </VCard>
                </VCol>

                <VCol cols="6" sm="3">
                  <VCard
                    variant="tonal"
                    color="info"
                    class="pa-3 text-center"
                  >
                    <VIcon
                      icon="ri-star-line"
                      size="24"
                      class="mb-1"
                    />
                    <div class="text-h5 font-weight-bold">
                      4.8
                    </div>
                    <div class="text-caption">
                      평균 리뷰
                    </div>
                  </VCard>
                </VCol>
              </VRow>

              <!-- Mock calendar row -->
              <VCard variant="outlined" class="pa-3">
                <div class="d-flex align-center gap-3 flex-wrap">
                  <VIcon
                    icon="ri-calendar-line"
                    color="primary"
                  />
                  <span class="text-body-2 font-weight-medium">오늘 예약 현황</span>

                  <VSpacer />

                  <div class="d-flex flex-wrap gap-2">
                    <VChip
                      size="small"
                      color="primary"
                      variant="tonal"
                    >
                      10:00
                    </VChip>
                    <VChip
                      size="small"
                      color="success"
                      variant="tonal"
                    >
                      11:30
                    </VChip>
                    <VChip
                      size="small"
                      color="warning"
                      variant="tonal"
                    >
                      13:00
                    </VChip>
                    <VChip
                      size="small"
                      color="info"
                      variant="tonal"
                    >
                      15:00
                    </VChip>
                    <VChip
                      size="small"
                      color="error"
                      variant="tonal"
                    >
                      17:30
                    </VChip>
                  </div>
                </div>
              </VCard>
            </VCardText>
          </VCard>
        </div>
      </div>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.hero-section {
  padding-block-end: 6.25rem;
  background-color: rgb(var(--v-theme-surface));
}

.hero-bg {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  padding-block-start: 5.5rem;
}

.hero-title {
  font-size: 2.375rem;
  font-weight: 800;
  line-height: 3rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.hero-animation-img {
  margin-block-end: -10rem;
}

.dashboard-placeholder {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.1s ease-out;
}

.dashboard-mock-header {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.mock-dot {
  inline-size: 12px;
  block-size: 12px;
  border-radius: 50%;
}

@media (max-width: 960px) {
  .hero-animation-img {
    margin-block-end: -6rem;
  }

  .hero-title {
    font-size: 1.75rem;
    line-height: 2.25rem;
  }
}

@media (max-width: 600px) {
  .hero-section {
    padding-block-end: 4rem;
  }

  .hero-animation-img {
    margin-block-end: -2rem;
  }
}
</style>
