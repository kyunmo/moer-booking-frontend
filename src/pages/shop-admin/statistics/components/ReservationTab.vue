<template>
  <!-- Loading -->
  <div v-if="statisticsStore.reservationLoading" class="text-center pa-10">
    <VProgressCircular indeterminate color="primary" size="64" />
  </div>

  <!-- Error -->
  <VAlert v-else-if="statisticsStore.reservationError" type="error" variant="tonal">
    {{ statisticsStore.reservationError }}
  </VAlert>

  <!-- Data -->
  <div v-else-if="data">
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              총 예약
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.totalReservations ?? 0 }}건
            </div>
            <div
              v-if="data.comparison?.totalChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.totalChange)"
            >
              {{ formatChange(data.comparison.totalChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              완료
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.completedReservations ?? 0 }}건
            </div>
            <div
              v-if="data.comparison?.completedChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.completedChange)"
            >
              {{ formatChange(data.comparison.completedChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="error">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              취소
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.cancelledReservations ?? 0 }}건
            </div>
            <div
              v-if="data.comparison?.cancelledChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.cancelledChange)"
            >
              {{ formatChange(data.comparison.cancelledChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              노쇼
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.noShowReservations ?? 0 }}건
            </div>
            <div
              v-if="data.comparison?.noShowChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.noShowChange)"
            >
              {{ formatChange(data.comparison.noShowChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Reservation Trend + Status Distribution -->
    <VRow class="mb-6">
      <!-- Reservation Trend (Stacked Bar) -->
      <VCol cols="12" md="8">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-bar-chart-grouped-line" class="me-2" />
            예약 추이
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.reservationTrend && data.reservationTrend.length > 0"
              :key="`reservation-trend-${chartKey}`"
              type="bar"
              height="350"
              :options="trendChartOptions"
              :series="trendChartSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              예약 추이 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Status Distribution (Donut) -->
      <VCol cols="12" md="4">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-pie-chart-line" class="me-2" />
            상태 분포
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.statusDistribution && data.statusDistribution.length > 0"
              :key="`status-donut-${chartKey}`"
              type="donut"
              height="300"
              :options="statusDonutOptions"
              :series="statusDonutSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              상태 분포 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Hourly Heatmap -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-fire-line" class="me-2" />
            시간대별 예약 히트맵
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="heatmapSeries.length > 0"
              :key="`heatmap-${chartKey}`"
              type="heatmap"
              height="350"
              :options="heatmapOptions"
              :series="heatmapSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              시간대별 히트맵 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Cancellation/NoShow + Daily Distribution -->
    <VRow>
      <!-- Cancellation / NoShow Stats -->
      <VCol cols="12" md="6">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-close-circle-line" class="me-2" />
            취소/노쇼 현황
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="6">
                <div class="text-center pa-3">
                  <div class="text-h5 font-weight-bold text-error mb-1">
                    {{ data.summary?.cancellationRate?.toFixed(1) ?? '0.0' }}%
                  </div>
                  <div class="text-body-2">
                    취소율 ({{ data.summary?.cancelledReservations ?? 0 }}건)
                  </div>
                </div>
              </VCol>

              <VCol cols="6">
                <div class="text-center pa-3">
                  <div class="text-h5 font-weight-bold text-warning mb-1">
                    {{ data.summary?.noShowRate?.toFixed(1) ?? '0.0' }}%
                  </div>
                  <div class="text-body-2">
                    노쇼율 ({{ data.summary?.noShowReservations ?? 0 }}건)
                  </div>
                </div>
              </VCol>
            </VRow>

            <VDivider class="my-3" />

            <div class="text-center pa-3">
              <div class="text-h5 font-weight-bold text-error mb-1">
                {{ formatCurrency(data.summary?.lostRevenue) }}
              </div>
              <div class="text-body-2">
                매출 손실액
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Daily Distribution (Bar) -->
      <VCol cols="12" md="6">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-calendar-line" class="me-2" />
            요일별 분포
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.dailyDistribution && data.dailyDistribution.length > 0"
              :key="`daily-dist-${chartKey}`"
              type="bar"
              height="280"
              :options="dailyDistChartOptions"
              :series="dailyDistChartSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              요일별 분포 데이터가 없습니다
            </VAlert>
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

const data = computed(() => statisticsStore.reservationData)

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

      await statisticsStore.fetchReservations(params)
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

// ==================== Heatmap Helpers ====================

const BUSINESS_HOURS = Array.from({ length: 13 }, (_, i) => i + 9) // 9~21

function fillHours(hours) {
  const hourMap = new Map(hours.map(h => [h.hour, h.count]))

  return BUSINESS_HOURS.map(hour => ({
    x: `${hour}시`,
    y: hourMap.get(hour) ?? 0,
  }))
}

// ==================== Reservation Trend Chart (Stacked Bar) ====================

const trendChartSeries = computed(() => {
  if (!data.value?.reservationTrend) return []

  return [
    {
      name: '완료',
      data: data.value.reservationTrend.map(d => d.completed),
    },
    {
      name: '취소',
      data: data.value.reservationTrend.map(d => d.cancelled),
    },
    {
      name: '노쇼',
      data: data.value.reservationTrend.map(d => d.noShow),
    },
    {
      name: '대기',
      data: data.value.reservationTrend.map(d => d.pending),
    },
  ]
})

const trendChartOptions = computed(() => {
  if (!data.value?.reservationTrend) return {}

  return {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.value.reservationTrend.map(d => {
        const date = new Date(d.date)

        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
    },
    yaxis: {
      title: { text: '예약건수' },
      min: 0,
    },
    colors: [theme.current.value.colors.success, theme.current.value.colors.error, theme.current.value.colors.warning, theme.current.value.colors.info],
    legend: {
      position: 'top',
    },
    tooltip: {
      y: {
        formatter: val => `${val}건`,
      },
    },
  }
})

// ==================== Status Distribution Donut ====================

const statusDonutSeries = computed(() => {
  return data.value?.statusDistribution?.map(s => s.count) || []
})

const statusDonutOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  labels: data.value?.statusDistribution?.map(s => s.statusName) || [],
  colors: [theme.current.value.colors.success, theme.current.value.colors.error, theme.current.value.colors.warning, theme.current.value.colors.info],
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
            label: '전체 예약',
            formatter: () => `${data.value?.summary?.totalReservations ?? 0}건`,
          },
        },
      },
    },
  },
}))

// ==================== Hourly Heatmap ====================

const heatmapSeries = computed(() => {
  if (!data.value?.hourlyHeatmap) return []

  return data.value.hourlyHeatmap.map(day => ({
    name: day.dayName,
    data: fillHours(day.hours),
  })).reverse()
})

const heatmapOptions = computed(() => ({
  chart: {
    type: 'heatmap',
    toolbar: { show: false },
  },
  dataLabels: {
    enabled: true,
    style: { fontSize: '11px' },
  },
  colors: [theme.current.value.colors.primary],
  plotOptions: {
    heatmap: {
      radius: 4,
      shadeIntensity: 0.5,
    },
  },
  xaxis: {
    type: 'category',
  },
}))

// ==================== Daily Distribution Bar Chart ====================

const dailyDistChartSeries = computed(() => {
  if (!data.value?.dailyDistribution) return []

  return [
    {
      name: '평균 예약',
      data: data.value.dailyDistribution.map(d => d.averageCount),
    },
  ]
})

const dailyDistChartOptions = computed(() => {
  if (!data.value?.dailyDistribution) return {}

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
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
      categories: data.value.dailyDistribution.map(d => d.dayName),
    },
    yaxis: {
      title: { text: '평균 예약건수' },
      min: 0,
    },
    colors: [theme.current.value.colors.primary],
    tooltip: {
      y: {
        formatter: val => `${val.toFixed(1)}건`,
      },
    },
  }
})
</script>
