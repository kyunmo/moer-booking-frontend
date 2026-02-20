<template>
  <div>
    <!-- 온보딩 위저드 -->
    <OnboardingWizard
      v-if="showOnboarding"
      :status="onboardingStore.status"
      @completed="handleOnboardingComplete"
      @skipped="handleOnboardingSkip"
    />

    <!-- 대시보드 본문 -->
    <template v-else>
      <!-- 환영 배너 -->
      <VCard class="mb-6 welcome-banner" color="primary">
        <VCardText class="d-flex align-center justify-space-between pa-6">
          <div>
            <p class="text-body-2 text-white text-opacity-80 mb-1">{{ todayText }}</p>
            <h4 class="text-h4 font-weight-bold text-white mb-2">
              안녕하세요, {{ businessName }} 님!
            </h4>
          </div>
          <VIcon
            icon="ri-store-3-line"
            size="80"
            class="text-white opacity-20 d-none d-md-block"
          />
        </VCardText>
      </VCard>

      <!-- 퀵 액션 -->
      <VRow id="dashboard-quick-actions" class="mb-6">
        <VCol
          v-for="action in quickActions"
          :key="action.title"
          cols="6"
          md="3"
        >
          <VCard
            :to="action.to"
            class="text-center pa-4 quick-action-card"
            variant="tonal"
            :color="action.color"
          >
            <VAvatar :color="action.color" variant="tonal" size="48" class="mb-3">
              <VIcon :icon="action.icon" size="24" />
            </VAvatar>
            <h6 class="text-subtitle-1 font-weight-medium mb-1">{{ action.title }}</h6>
            <p class="text-caption text-medium-emphasis mb-0">{{ action.description }}</p>
          </VCard>
        </VCol>
      </VRow>

      <!-- Trial / 사용량 배너 -->
      <TrialBanner />
      <ReservationUsageBanner />

      <!-- 알림 영역 -->
      <UnassignedReservationAlert class="mb-4" />

      <!-- 로딩 -->
      <div v-if="dashboardStore.loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" size="64" />
      </div>

      <!-- 에러 -->
      <VAlert v-else-if="dashboardStore.error" type="error" variant="tonal" class="mb-6">
        <VAlertTitle>오류</VAlertTitle>
        {{ dashboardStore.error }}
        <template #append>
          <VBtn size="small" @click="dashboardStore.fetchDashboard()">
            재시도
          </VBtn>
        </template>
      </VAlert>

      <!-- 데이터 없음 -->
      <VAlert v-else-if="!stats?.todayStats" type="info" variant="tonal" class="mb-6">
        <VAlertTitle>데이터 없음</VAlertTitle>
        대시보드 데이터를 불러올 수 없습니다.
        <template #append>
          <VBtn size="small" @click="dashboardStore.fetchDashboard()">
            새로고침
          </VBtn>
        </template>
      </VAlert>

      <template v-else>
        <!-- 실시간 액션 알림 (VTimeline) -->
        <VCard v-if="hasActionAlerts" class="mb-6">
          <VCardTitle class="d-flex align-center py-4">
            <VBadge :content="totalAlerts" color="error" inline>
              <VIcon icon="ri-alarm-warning-line" size="24" color="warning" />
            </VBadge>
            <span class="ms-3 text-subtitle-1 font-weight-bold">처리가 필요한 항목</span>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <VTimeline density="compact" side="end" truncate-line="both">
              <VTimelineItem
                v-if="stats.actionAlerts?.pendingReservations > 0"
                dot-color="warning"
                size="small"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <span class="text-body-2 font-weight-medium">예약 확정 대기</span>
                    <div class="text-caption text-medium-emphasis">확인이 필요한 예약이 있습니다</div>
                  </div>
                  <VChip color="warning" size="small" variant="tonal">
                    {{ stats.actionAlerts.pendingReservations }}건
                  </VChip>
                </div>
              </VTimelineItem>

              <VTimelineItem
                v-if="stats.actionAlerts?.upcomingReservations > 0"
                dot-color="error"
                size="small"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <span class="text-body-2 font-weight-medium">곧 시작하는 예약</span>
                    <div class="text-caption text-medium-emphasis">1시간 내 시작 예정</div>
                  </div>
                  <VChip color="error" size="small" variant="tonal">
                    {{ stats.actionAlerts.upcomingReservations }}건
                  </VChip>
                </div>
              </VTimelineItem>

              <VTimelineItem
                v-if="stats.actionAlerts?.birthdayCustomers > 0"
                dot-color="success"
                size="small"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <span class="text-body-2 font-weight-medium">생일 고객</span>
                    <div class="text-caption text-medium-emphasis">오늘 생일인 고객이 있습니다</div>
                  </div>
                  <VChip color="success" size="small" variant="tonal">
                    {{ stats.actionAlerts.birthdayCustomers }}명
                  </VChip>
                </div>
              </VTimelineItem>

              <VTimelineItem
                v-if="stats.actionAlerts?.inactiveCustomers > 0"
                dot-color="info"
                size="small"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <span class="text-body-2 font-weight-medium">재방문 유도</span>
                    <div class="text-caption text-medium-emphasis">장기 미방문 고객이 있습니다</div>
                  </div>
                  <VChip color="info" size="small" variant="tonal">
                    {{ stats.actionAlerts.inactiveCustomers }}명
                  </VChip>
                </div>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>

        <!-- 오늘 통계 -->
        <VRow id="dashboard-stats" class="mb-4">
          <VCol cols="12" sm="6" md="3">
            <StatisticsCard
              title="오늘 예약"
              :value="`${stats.todayStats.totalReservations}건`"
              icon="ri-calendar-event-line"
              color="primary"
              :subtitle="`완료 ${stats.todayStats.completedReservations}건`"
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <StatisticsCard
              title="대기 중"
              :value="`${stats.todayStats.pendingReservations}건`"
              icon="ri-time-line"
              color="warning"
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <StatisticsCard
              title="오늘 예상 매출"
              :value="formatCurrency(stats.todayStats.expectedRevenue)"
              icon="ri-money-dollar-circle-line"
              color="info"
            />
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <StatisticsCard
              title="이번 달 신규 고객"
              :value="`${stats.monthStats.newCustomers}명`"
              icon="ri-user-add-line"
              color="success"
            />
          </VCol>
        </VRow>

        <!-- 주간 예약 차트 & 이번 달 통계 -->
        <VRow class="mb-6">
          <!-- 주간 예약 차트 -->
          <VCol cols="12" md="8">
            <VCard>
              <VCardTitle>
                <VIcon icon="ri-bar-chart-line" class="me-2" />
                이번 주 예약 현황
              </VCardTitle>
              <VCardText>
                <VueApexCharts
                  v-if="chartReady && stats?.weekStats?.dailyCounts && stats.weekStats.dailyCounts.length > 0"
                  :key="chartKey"
                  type="bar"
                  height="300"
                  :options="chartOptions"
                  :series="chartSeries"
                />
                <VAlert v-else type="info" variant="tonal">
                  이번 주 예약 데이터가 없습니다
                </VAlert>
              </VCardText>
            </VCard>
          </VCol>

          <!-- 이번 달 통계 -->
          <VCol cols="12" md="4">
            <VCard class="h-100">
              <VCardTitle>
                <VIcon icon="ri-calendar-line" class="me-2" />
                이번 달 요약
              </VCardTitle>
              <VCardText>
                <VList>
                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-calendar-check-line" color="primary" />
                    </template>
                    <VListItemTitle>총 예약</VListItemTitle>
                    <VListItemSubtitle class="text-h6">
                      {{ stats.monthStats.totalReservations }}건
                    </VListItemSubtitle>
                  </VListItem>

                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-money-dollar-circle-line" color="success" />
                    </template>
                    <VListItemTitle>총 매출</VListItemTitle>
                    <VListItemSubtitle class="text-h6">
                      {{ formatCurrency(stats.monthStats.totalRevenue) }}
                    </VListItemSubtitle>
                  </VListItem>

                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-user-add-line" color="info" />
                    </template>
                    <VListItemTitle>신규 고객</VListItemTitle>
                    <VListItemSubtitle class="text-h6">
                      {{ stats.monthStats.newCustomers }}명
                    </VListItemSubtitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- 오늘의 예약 & 최근 신규 고객 -->
        <VRow>
          <!-- 오늘의 예약 -->
          <VCol cols="12" md="7">
            <VCard>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="ri-calendar-event-line" class="me-2" />
                오늘의 예약

                <VSpacer />

                <VBtn
                  size="small"
                  variant="text"
                  :to="{ name: 'shop-admin-reservations-calendar' }"
                >
                  전체 보기
                  <VIcon icon="ri-arrow-right-line" class="ms-1" />
                </VBtn>
              </VCardTitle>

              <VDivider />

              <VCardText>
                <VList v-if="stats?.recentReservations && stats.recentReservations.length > 0">
                  <VListItem
                    v-for="reservation in stats.recentReservations"
                    :key="reservation.id"
                  >
                    <template #prepend>
                      <VAvatar
                        :color="getStatusColor(reservation.status)"
                        size="40"
                      >
                        <VIcon :icon="getStatusIcon(reservation.status)" />
                      </VAvatar>
                    </template>

                    <VListItemTitle>{{ reservation.customerName }}</VListItemTitle>
                    <VListItemSubtitle>
                      {{ formatTimeRange(reservation.startTime, reservation.endTime) }}
                      <template v-if="reservation.services?.length || reservation.serviceName">
                        &middot; {{ reservation.services?.join(', ') || reservation.serviceName }}
                      </template>
                      <template v-if="reservation.staffName">
                        &middot; {{ reservation.staffName }}
                      </template>
                    </VListItemSubtitle>

                    <template #append>
                      <VChip
                        :color="getStatusColor(reservation.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getStatusText(reservation.status) }}
                      </VChip>
                    </template>
                  </VListItem>
                </VList>

                <VAlert v-else type="info" variant="tonal">
                  오늘 예약이 없습니다
                </VAlert>
              </VCardText>
            </VCard>
          </VCol>

          <!-- 최근 신규 고객 -->
          <VCol cols="12" md="5">
            <VCard>
              <VCardTitle class="d-flex align-center">
                <VIcon icon="ri-user-add-line" class="me-2" />
                최근 신규 고객

                <VSpacer />

                <VBtn
                  size="small"
                  variant="text"
                  :to="{ name: 'shop-admin-customers-list' }"
                >
                  전체 보기
                  <VIcon icon="ri-arrow-right-line" class="ms-1" />
                </VBtn>
              </VCardTitle>

              <VDivider />

              <VCardText>
                <VList v-if="stats?.recentCustomers && stats.recentCustomers.length > 0">
                  <VListItem
                    v-for="customer in stats.recentCustomers"
                    :key="customer.id"
                  >
                    <template #prepend>
                      <VAvatar color="primary" size="40">
                        {{ getInitial(customer.name) }}
                      </VAvatar>
                    </template>

                    <VListItemTitle>{{ customer.name }}</VListItemTitle>
                    <VListItemSubtitle>{{ customer.phone }}</VListItemSubtitle>

                    <template #append>
                      <VChip size="small" variant="tonal" color="success">
                        방문 {{ customer.visitCount }}회
                      </VChip>
                    </template>
                  </VListItem>
                </VList>

                <VAlert v-else type="info" variant="tonal">
                  최근 신규 고객이 없습니다
                </VAlert>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

      </template>
    </template>
  </div>
</template>

<script setup>
import OnboardingWizard from '@/components/OnboardingWizard.vue'
import StatisticsCard from '@/components/StatisticsCard.vue'
import ReservationUsageBanner from '@/components/trial/ReservationUsageBanner.vue'
import TrialBanner from '@/components/trial/TrialBanner.vue'
import UnassignedReservationAlert from '@/components/UnassignedReservationAlert.vue'
import { useBusinessIcon } from '@/composables/useBusinessIcon'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useOnboardingStore } from '@/stores/onboarding'
import { useSubscriptionStore } from '@/stores/subscription'
import { useTour } from '@/composables/useTour'
import { formatTimeRange } from '@/utils/dateFormat'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const { serviceIconLine } = useBusinessIcon()
const theme = useTheme()

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const subscriptionStore = useSubscriptionStore()

const chartKey = ref(0)
const chartReady = ref(false)
const showOnboarding = ref(false)

const { startDashboardTour, isTourCompleted } = useTour()

const businessName = computed(() => authStore.user?.name || '사장님')

const quickActions = [
  {
    title: '예약 등록',
    description: '새 예약을 추가합니다',
    icon: 'ri-add-line',
    color: 'primary',
    to: { name: 'shop-admin-reservations-calendar' },
  },
  {
    title: '고객 등록',
    description: '신규 고객을 등록합니다',
    icon: 'ri-user-add-line',
    color: 'success',
    to: { name: 'shop-admin-customers-list' },
  },
  {
    title: '통계 분석',
    description: '매출/예약 현황을 봅니다',
    icon: 'ri-bar-chart-box-line',
    color: 'secondary',
    to: { name: 'shop-admin-statistics' },
  },
  {
    title: '매장 설정',
    description: '영업시간/정보를 수정합니다',
    icon: 'ri-settings-3-line',
    color: 'warning',
    to: { name: 'shop-admin-business-settings' },
  },
]

const todayText = computed(() => {
  const today = new Date()

  return today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

const stats = computed(() => dashboardStore.dashboardData)

// ==================== 온보딩 ====================

async function handleOnboardingComplete() {
  showOnboarding.value = false
  await loadDashboard()

  // 온보딩 완료 후 대시보드 투어 자동 시작
  if (!isTourCompleted('dashboard')) {
    setTimeout(() => startDashboardTour(), 500)
  }
}

async function handleOnboardingSkip() {
  await onboardingStore.skipOnboarding()
  showOnboarding.value = false
  await loadDashboard()

  // 온보딩 건너뛰기 후 대시보드 투어 자동 시작
  if (!isTourCompleted('dashboard')) {
    setTimeout(() => startDashboardTour(), 500)
  }
}

// ==================== 대시보드 ====================

// 전체 알림 수
const totalAlerts = computed(() => {
  if (!stats.value?.actionAlerts) return 0
  const alerts = stats.value.actionAlerts

  return (
    (alerts.pendingReservations || 0) +
    (alerts.upcomingReservations || 0) +
    (alerts.birthdayCustomers || 0) +
    (alerts.inactiveCustomers || 0)
  )
})

const hasActionAlerts = computed(() => totalAlerts.value > 0)

// 차트 데이터
const chartSeries = computed(() => {
  if (!stats.value?.weekStats?.dailyCounts) return []

  return [{
    name: '예약 건수',
    data: stats.value.weekStats.dailyCounts.map(d => d.count),
  }]
})

const chartOptions = computed(() => {
  if (!stats.value?.weekStats?.dailyCounts) return {}

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: stats.value.weekStats.dailyCounts.map(d => {
        const date = new Date(d.date)

        return date.toLocaleDateString('ko-KR', { weekday: 'short' })
      }),
    },
    colors: [theme.current.value.colors.primary],
  }
})

// 유틸리티 함수
function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value || 0)
}

function getInitial(name) {
  if (!name) return '?'

  return name.charAt(0)
}

function getStatusColor(status) {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'secondary',
  }

  return colors[status] || 'default'
}

function getStatusIcon(status) {
  const icons = {
    PENDING: 'ri-time-line',
    CONFIRMED: 'ri-check-line',
    COMPLETED: 'ri-checkbox-circle-line',
    CANCELLED: 'ri-close-circle-line',
    NO_SHOW: 'ri-user-unfollow-line',
  }

  return icons[status] || 'ri-calendar-line'
}

function getStatusText(status) {
  const texts = {
    PENDING: '대기',
    CONFIRMED: '확정',
    COMPLETED: '완료',
    CANCELLED: '취소',
    NO_SHOW: '노쇼',
  }

  return texts[status] || status
}

// ==================== 초기화 ====================

async function loadDashboard() {
  chartReady.value = false
  chartKey.value++
  await dashboardStore.fetchDashboard()
  await nextTick()
  chartReady.value = true
}

onMounted(async () => {
  // 온보딩 상태 확인
  await onboardingStore.fetchStatus()

  const status = onboardingStore.status
  if (status && !status.completed && !status.skipped) {
    showOnboarding.value = true

    return
  }

  // 구독 정보 + 대시보드 병렬 로드
  subscriptionStore.fetchSubscriptionInfo().catch(() => {})

  // 대시보드 로드
  await loadDashboard()

  // 투어 미완료 사용자에게 자동 시작
  if (!isTourCompleted('dashboard')) {
    setTimeout(() => startDashboardTour(), 800)
  }
})

onBeforeUnmount(() => {
  chartReady.value = false
})
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-info)) 100%) !important;
}

.quick-action-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(var(--v-theme-on-surface), 0.12);
}

.opacity-20 {
  opacity: 0.2;
}

.text-opacity-80 {
  opacity: 0.8;
}
</style>
