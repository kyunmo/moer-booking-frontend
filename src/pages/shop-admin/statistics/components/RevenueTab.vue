<template>
  <!-- Loading -->
  <div v-if="statisticsStore.revenueLoading" class="text-center pa-10">
    <VProgressCircular indeterminate color="primary" size="64" />
  </div>

  <!-- Error -->
  <VAlert v-else-if="statisticsStore.revenueError" type="error" variant="tonal">
    {{ statisticsStore.revenueError }}
  </VAlert>

  <!-- Data -->
  <div v-else-if="data">
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              총매출
            </div>
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(data.summary?.totalRevenue) }}
            </div>
            <div
              v-if="data.comparison?.revenueChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.revenueChange)"
            >
              {{ formatChange(data.comparison.revenueChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              일평균 매출
            </div>
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(data.summary?.averageRevenue) }}
            </div>
            <div
              v-if="data.comparison?.averageRevenueChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.averageRevenueChange)"
            >
              {{ formatChange(data.comparison.averageRevenueChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="info">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              객단가
            </div>
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(data.summary?.averageTransactionAmount) }}
            </div>
            <div
              v-if="data.comparison?.transactionAmountChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.transactionAmountChange)"
            >
              {{ formatChange(data.comparison.transactionAmountChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              완료율
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.completionRate?.toFixed(1) ?? '0.0' }}%
            </div>
            <div
              v-if="data.comparison?.completionRateChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.completionRateChange)"
            >
              {{ formatChange(data.comparison.completionRateChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Revenue Trend Chart + Goal Achievement -->
    <VRow class="mb-6">
      <!-- Revenue Trend (Mixed Bar + Line) -->
      <VCol cols="12" md="8">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-line-chart-line" class="me-2" />
            매출 추이
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.revenueTrend && data.revenueTrend.length > 0"
              :key="`revenue-trend-${chartKey}`"
              type="line"
              height="350"
              :options="trendChartOptions"
              :series="trendChartSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              매출 추이 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Goal Achievement -->
      <VCol cols="12" md="4">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-trophy-line" class="me-2" />
            목표 달성률
          </VCardTitle>
          <VCardText>
            <template v-if="data.goals?.revenueGoal || data.goals?.reservationGoal">
              <!-- Revenue Goal -->
              <div v-if="data.goals.revenueGoal" class="mb-6">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-money-dollar-circle-line" color="success" class="me-2" />
                    <span class="text-body-1 font-weight-medium">매출 목표</span>
                  </div>
                  <span class="text-body-2">
                    {{ formatCurrency(data.goals.currentRevenue) }} / {{ formatCurrency(data.goals.revenueGoal) }}
                  </span>
                </div>
                <VProgressLinear
                  :model-value="Math.min(data.goals.revenueAchievementRate || 0, 100)"
                  :color="getGoalColor(data.goals.revenueAchievementRate)"
                  height="20"
                  rounded
                >
                  <template #default>
                    <span class="text-caption font-weight-bold">
                      {{ (data.goals.revenueAchievementRate || 0).toFixed(1) }}%
                    </span>
                  </template>
                </VProgressLinear>
              </div>

              <!-- Reservation Goal -->
              <div v-if="data.goals.reservationGoal" class="mb-6">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-calendar-check-line" color="primary" class="me-2" />
                    <span class="text-body-1 font-weight-medium">예약 목표</span>
                  </div>
                  <span class="text-body-2">
                    {{ data.goals.currentReservations ?? 0 }}건 / {{ data.goals.reservationGoal }}건
                  </span>
                </div>
                <VProgressLinear
                  :model-value="Math.min(data.goals.reservationAchievementRate || 0, 100)"
                  :color="getGoalColor(data.goals.reservationAchievementRate)"
                  height="20"
                  rounded
                >
                  <template #default>
                    <span class="text-caption font-weight-bold">
                      {{ (data.goals.reservationAchievementRate || 0).toFixed(1) }}%
                    </span>
                  </template>
                </VProgressLinear>
              </div>

              <!-- Days Info -->
              <VAlert type="info" variant="tonal" density="compact">
                <VIcon icon="ri-time-line" class="me-1" />
                경과일: <strong>{{ data.goals.daysElapsed ?? 0 }}일</strong> /
                잔여일: <strong>{{ data.goals.daysRemaining ?? 0 }}일</strong>
              </VAlert>
            </template>

            <VAlert v-else type="info" variant="tonal">
              목표가 설정되지 않았습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Bottom Charts -->
    <VRow>
      <!-- Revenue by Service (Donut) -->
      <VCol cols="12" md="5">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-pie-chart-line" class="me-2" />
            서비스별 매출
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.revenueByService && data.revenueByService.length > 0"
              :key="`service-donut-${chartKey}`"
              type="donut"
              height="300"
              :options="serviceDonutOptions"
              :series="serviceDonutSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              서비스별 매출 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Revenue by Payment Method (Donut) -->
      <VCol cols="12" md="3">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-bank-card-line" class="me-2" />
            결제수단별
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.revenueByPaymentMethod && data.revenueByPaymentMethod.length > 0"
              :key="`payment-donut-${chartKey}`"
              type="donut"
              height="300"
              :options="paymentDonutOptions"
              :series="paymentDonutSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              결제수단별 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Average Metrics -->
      <VCol cols="12" md="4">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-bar-chart-box-line" class="me-2" />
            평균 지표
          </VCardTitle>
          <VCardText>
            <VList>
              <VListItem>
                <template #prepend>
                  <VAvatar color="warning" variant="tonal" size="40">
                    <VIcon icon="ri-vip-crown-line" />
                  </VAvatar>
                </template>
                <VListItemTitle>고객 LTV</VListItemTitle>
                <VListItemSubtitle class="text-h6">
                  {{ formatCurrency(data.summary?.customerLTV) }}
                </VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VAvatar color="info" variant="tonal" size="40">
                    <VIcon icon="ri-time-line" />
                  </VAvatar>
                </template>
                <VListItemTitle>평균 서비스 시간</VListItemTitle>
                <VListItemSubtitle class="text-h6">
                  {{ data.summary?.averageServiceDuration ?? 0 }}분
                </VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VAvatar color="success" variant="tonal" size="40">
                    <VIcon icon="ri-money-dollar-circle-line" />
                  </VAvatar>
                </template>
                <VListItemTitle>객단가</VListItemTitle>
                <VListItemSubtitle class="text-h6">
                  {{ formatCurrency(data.summary?.averageTransactionAmount) }}
                </VListItemSubtitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VAvatar color="primary" variant="tonal" size="40">
                    <VIcon icon="ri-checkbox-circle-line" />
                  </VAvatar>
                </template>
                <VListItemTitle>완료율</VListItemTitle>
                <VListItemSubtitle class="text-h6">
                  {{ data.summary?.completionRate?.toFixed(1) ?? '0.0' }}%
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics'
import { computed, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const statisticsStore = useStatisticsStore()
const theme = useTheme()
const chartKey = ref(0)

const data = computed(() => statisticsStore.revenueData)

// Watch filters and fetch data
watch(
  () => props.filters,
  async newFilters => {
    if (newFilters?.startDate && newFilters?.endDate) {
      const params = {
        startDate: newFilters.startDate,
        endDate: newFilters.endDate,
        groupBy: newFilters.groupBy,
      }

      if (newFilters.compareWith) {
        params.compareWith = newFilters.compareWith
      }

      await statisticsStore.fetchRevenue(params)
      chartKey.value++
    }
  },
  { deep: true },
)

// ==================== Utility Functions ====================

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value || 0)
}

function getChangeClass(value) {
  if (value == null) return ''
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-error'

  return ''
}

function formatChange(value) {
  if (value == null) return ''
  const prefix = value > 0 ? '+' : ''

  return `${prefix}${value.toFixed(1)}%`
}

function getGoalColor(rate) {
  if (rate >= 100) return 'success'
  if (rate >= 50) return 'primary'

  return 'warning'
}

// ==================== Revenue Trend Chart ====================

const trendChartSeries = computed(() => {
  if (!data.value?.revenueTrend) return []

  return [
    {
      name: '예약건수',
      type: 'bar',
      data: data.value.revenueTrend.map(d => d.reservationCount),
    },
    {
      name: '매출',
      type: 'line',
      data: data.value.revenueTrend.map(d => d.revenue),
    },
  ]
})

const trendChartOptions = computed(() => {
  if (!data.value?.revenueTrend) return {}

  return {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    stroke: {
      width: [0, 3],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.value.revenueTrend.map(d => {
        const date = new Date(d.date)

        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
    },
    yaxis: [
      {
        title: { text: '예약건수' },
        min: 0,
      },
      {
        opposite: true,
        title: { text: '매출' },
        min: 0,
        labels: {
          formatter: val => {
            if (val >= 10000) return `${(val / 10000).toFixed(0)}만원`

            return val?.toLocaleString() ?? '0'
          },
        },
      },
    ],
    colors: [theme.current.value.colors.primary, theme.current.value.colors.success],
    legend: {
      position: 'top',
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 1) return formatCurrency(val)

          return `${val}건`
        },
      },
    },
  }
})

// ==================== Service Donut Chart ====================

const serviceDonutSeries = computed(() => {
  return data.value?.revenueByService?.map(s => s.revenue) || []
})

const serviceDonutOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  labels: data.value?.revenueByService?.map(s => s.serviceName) || [],
  legend: {
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: '전체 매출',
            formatter: () => formatCurrency(data.value?.summary?.totalRevenue),
          },
        },
      },
    },
  },
}))

// ==================== Payment Method Donut Chart ====================

const paymentDonutSeries = computed(() => {
  return data.value?.revenueByPaymentMethod?.map(p => p.revenue) || []
})

const paymentDonutOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  labels: data.value?.revenueByPaymentMethod?.map(p => p.paymentMethod) || [],
  legend: {
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: '전체',
            formatter: () => formatCurrency(data.value?.summary?.totalRevenue),
          },
        },
      },
    },
  },
}))
</script>
