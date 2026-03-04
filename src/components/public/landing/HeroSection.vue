<script setup>
import { useMouse, useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { x, y } = useMouse({ touch: false })
const isMobile = useMediaQuery('(max-width: 960px)')

const dashboardTranslateStyle = computed(() => {
  if (isMobile.value || typeof window === 'undefined') return {}

  const posX = (window.innerWidth - x.value * 3) / 100
  const posY = Math.max((window.innerHeight - y.value * 3) / 100, -40)

  return { transform: `translate(${posX}px, ${posY}px)` }
})

const sidebarMenus = [
  { icon: 'ri-dashboard-line', label: '대시보드', active: true },
  { icon: 'ri-calendar-line', label: '예약 관리', active: false },
  { icon: 'ri-user-heart-line', label: '고객 관리', active: false },
  { icon: 'ri-team-line', label: '직원 관리', active: false },
  { icon: 'ri-scissors-line', label: '서비스 관리', active: false },
  { icon: 'ri-bar-chart-line', label: '통계', active: false },
]

const mockTimeSlots = [
  { time: '10:00', label: '김지현 - 커트 + 염색', color: 'primary' },
  { time: '11:30', label: '박소연 - 네일 케어', color: 'success' },
  { time: '13:00', label: '이준호 - 펌 시술', color: 'warning' },
  { time: '15:00', label: '최윤아 - 두피 관리', color: 'info' },
  { time: '17:30', label: '정민수 - 커트', color: 'primary' },
]

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

    <!-- Dashboard Preview - Realistic App Screenshot -->
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
            <!-- Browser chrome -->
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
              <div class="mock-url-bar ms-3 flex-grow-1">
                <VIcon icon="ri-lock-line" size="12" class="me-1 text-success" />
                <span class="text-caption text-medium-emphasis">moer.kr/shop-admin/dashboard</span>
              </div>
            </div>

            <VDivider />

            <!-- App layout simulation -->
            <div class="d-flex" style="min-block-size: 280px;">
              <!-- Sidebar mock -->
              <div class="mock-sidebar d-none d-sm-flex flex-column pa-3" style="inline-size: 200px; border-inline-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
                <div class="d-flex align-center gap-2 mb-4">
                  <VAvatar color="primary" size="28">
                    <span class="text-caption font-weight-bold text-white">M</span>
                  </VAvatar>
                  <span class="text-body-2 font-weight-bold">MOER</span>
                </div>

                <div
                  v-for="(menu, i) in sidebarMenus"
                  :key="i"
                  class="d-flex align-center gap-2 pa-2 rounded mb-1"
                  :class="menu.active ? 'bg-primary' : ''"
                >
                  <VIcon :icon="menu.icon" size="16" :color="menu.active ? 'white' : 'medium-emphasis'" />
                  <span class="text-caption" :class="menu.active ? 'text-white font-weight-medium' : 'text-medium-emphasis'">{{ menu.label }}</span>
                </div>
              </div>

              <!-- Main content -->
              <div class="flex-grow-1 pa-4">
                <!-- Top stats row -->
                <VRow dense class="mb-3">
                  <VCol cols="6" sm="3">
                    <VCard variant="tonal" color="primary" class="pa-2 text-center">
                      <VIcon icon="ri-calendar-check-line" size="20" class="mb-1" />
                      <div class="text-h6 font-weight-bold">24</div>
                      <div class="text-caption">오늘 예약</div>
                    </VCard>
                  </VCol>
                  <VCol cols="6" sm="3">
                    <VCard variant="tonal" color="success" class="pa-2 text-center">
                      <VIcon icon="ri-user-line" size="20" class="mb-1" />
                      <div class="text-h6 font-weight-bold">156</div>
                      <div class="text-caption">이달 고객</div>
                    </VCard>
                  </VCol>
                  <VCol cols="6" sm="3">
                    <VCard variant="tonal" color="warning" class="pa-2 text-center">
                      <VIcon icon="ri-money-dollar-circle-line" size="20" class="mb-1" />
                      <div class="text-h6 font-weight-bold">2.4M</div>
                      <div class="text-caption">이달 매출</div>
                    </VCard>
                  </VCol>
                  <VCol cols="6" sm="3">
                    <VCard variant="tonal" color="info" class="pa-2 text-center">
                      <VIcon icon="ri-star-line" size="20" class="mb-1" />
                      <div class="text-h6 font-weight-bold">4.8</div>
                      <div class="text-caption">평균 리뷰</div>
                    </VCard>
                  </VCol>
                </VRow>

                <!-- Calendar-like view -->
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center gap-2">
                      <VIcon icon="ri-calendar-line" color="primary" size="18" />
                      <span class="text-body-2 font-weight-bold">오늘 예약 현황</span>
                    </div>
                    <VChip size="x-small" color="primary" variant="tonal">5건</VChip>
                  </div>

                  <!-- Mock timeline -->
                  <div class="d-flex flex-column gap-2">
                    <div
                      v-for="(slot, i) in mockTimeSlots"
                      :key="i"
                      class="d-flex align-center gap-2"
                    >
                      <span class="text-caption text-medium-emphasis" style="inline-size: 40px;">{{ slot.time }}</span>
                      <VChip
                        :color="slot.color"
                        size="small"
                        variant="tonal"
                        class="flex-grow-1"
                        style="justify-content: start;"
                      >
                        {{ slot.label }}
                      </VChip>
                    </div>
                  </div>
                </VCard>
              </div>
            </div>
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

.mock-url-bar {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 6px;
  padding-block: 4px;
  padding-inline: 10px;
  max-inline-size: 300px;
}

.mock-sidebar {
  background: rgba(var(--v-theme-on-surface), 0.02);
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
