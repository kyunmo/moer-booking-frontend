<template>
  <!-- Loading -->
  <div v-if="statisticsStore.serviceLoading" class="text-center pa-10">
    <VProgressCircular indeterminate color="primary" size="64" />
  </div>

  <!-- Error -->
  <VAlert v-else-if="statisticsStore.serviceError" type="error" variant="tonal">
    {{ statisticsStore.serviceError }}
  </VAlert>

  <!-- Data -->
  <div v-else-if="data">
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              서비스 건수
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.totalServiceCount ?? 0 }}건
            </div>
            <div
              v-if="data.comparison?.totalServiceCountChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.totalServiceCountChange)"
            >
              {{ formatChange(data.comparison.totalServiceCountChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              인기 서비스
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.mostPopularService ?? '-' }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="info">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              평균 단가
            </div>
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(data.summary?.averagePrice) }}
            </div>
            <div
              v-if="data.comparison?.averagePriceChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.averagePriceChange)"
            >
              {{ formatChange(data.comparison.averagePriceChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              카테고리
            </div>
            <div class="text-h5 font-weight-bold">
              {{ data.summary?.categoryCount ?? 0 }}개
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Service Rankings + Category Distribution -->
    <VRow class="mb-6">
      <!-- Service Rankings (Horizontal Bar) -->
      <VCol cols="12" md="7">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-bar-chart-horizontal-line" class="me-2" />
            서비스 랭킹
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.serviceRankings && data.serviceRankings.length > 0"
              :key="`service-ranking-${chartKey}`"
              type="bar"
              height="350"
              :options="rankingChartOptions"
              :series="rankingChartSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              서비스 랭킹 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Category Distribution (Donut) -->
      <VCol cols="12" md="5">
        <VCard class="h-100">
          <VCardTitle>
            <VIcon icon="ri-pie-chart-line" class="me-2" />
            카테고리 분포
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.categoryDistribution && data.categoryDistribution.length > 0"
              :key="`category-donut-${chartKey}`"
              type="donut"
              height="350"
              :options="categoryDonutOptions"
              :series="categoryDonutSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              카테고리 분포 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Service Trend (Multi-Line) -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-line-chart-line" class="me-2" />
            서비스 매출 추이
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.serviceTrend && data.serviceTrend.length > 0"
              :key="`service-trend-${chartKey}`"
              type="line"
              height="350"
              :options="trendChartOptions"
              :series="trendChartSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              서비스 매출 추이 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Service Detail Table -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-table-line" class="me-2" />
            서비스 상세
          </VCardTitle>
          <VCardText>
            <VTable v-if="data.serviceRankings && data.serviceRankings.length > 0">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>서비스명</th>
                  <th>카테고리</th>
                  <th class="text-end">
                    예약수
                  </th>
                  <th class="text-end">
                    매출
                  </th>
                  <th class="text-end">
                    평균단가
                  </th>
                  <th class="text-end">
                    매출비중
                  </th>
                  <th class="text-end">
                    완료율
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="service in data.serviceRankings"
                  :key="service.serviceId"
                >
                  <td>
                    <VChip
                      size="small"
                      :color="service.rank <= 3 ? 'primary' : 'default'"
                      variant="tonal"
                    >
                      {{ service.rank }}
                    </VChip>
                  </td>
                  <td>{{ service.serviceName }}</td>
                  <td>{{ service.categoryName }}</td>
                  <td class="text-end">
                    {{ service.reservationCount?.toLocaleString() }}건
                  </td>
                  <td class="text-end">
                    {{ formatCurrency(service.totalRevenue) }}
                  </td>
                  <td class="text-end">
                    {{ formatCurrency(service.averagePrice) }}
                  </td>
                  <td class="text-end">
                    {{ service.revenuePercentage?.toFixed(1) }}%
                  </td>
                  <td class="text-end">
                    {{ service.completionRate?.toFixed(1) }}%
                  </td>
                </tr>
              </tbody>
            </VTable>
            <VAlert v-else type="info" variant="tonal">
              서비스 상세 데이터가 없습니다
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

const data = computed(() => statisticsStore.serviceData)

// Watch filters and fetch data
watch(
  () => props.filters,
  async newFilters => {
    if (newFilters?.startDate && newFilters?.endDate) {
      const params = {
        startDate: newFilters.startDate,
        endDate: newFilters.endDate,
      }

      if (newFilters.compareWith) {
        params.compareWith = newFilters.compareWith
      }

      await statisticsStore.fetchServices(params)
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

// ==================== Service Ranking Chart (Horizontal Bar) ====================

const rankingChartSeries = computed(() => {
  if (!data.value?.serviceRankings) return []

  return [
    {
      name: '매출',
      data: data.value.serviceRankings.map(s => s.totalRevenue),
    },
  ]
})

const rankingChartOptions = computed(() => {
  if (!data.value?.serviceRankings) return {}

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        formatter: val => {
          if (val >= 10000) return `${(val / 10000).toFixed(0)}만원`

          return val?.toLocaleString() ?? '0'
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
        },
      },
    },
    categories: data.value.serviceRankings.map(s => s.serviceName),
    colors: [theme.current.value.colors.primary],
    tooltip: {
      y: {
        formatter: val => formatCurrency(val),
      },
    },
  }
})

// ==================== Category Distribution Donut Chart ====================

const categoryDonutSeries = computed(() => {
  return data.value?.categoryDistribution?.map(c => c.revenue) || []
})

const categoryDonutOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  labels: data.value?.categoryDistribution?.map(c => c.categoryName) || [],
  colors: [theme.current.value.colors.primary, theme.current.value.colors.success, theme.current.value.colors.error, theme.current.value.colors.warning, theme.current.value.colors.info],
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
            formatter: () => {
              const total = data.value?.categoryDistribution?.reduce((sum, c) => sum + (c.revenue || 0), 0) || 0

              return formatCurrency(total)
            },
          },
        },
      },
    },
  },
}))

// ==================== Service Trend Chart (Multi-Line) ====================

const trendChartSeries = computed(() => {
  if (!data.value?.serviceTrend) return []

  return data.value.serviceTrend.map(s => ({
    name: s.serviceName,
    data: s.trend.map(t => t.revenue),
  }))
})

const trendChartOptions = computed(() => {
  if (!data.value?.serviceTrend || data.value.serviceTrend.length === 0) return {}

  const dates = data.value.serviceTrend[0]?.trend?.map(t => t.date) || []

  return {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: dates,
    },
    yaxis: {
      labels: {
        formatter: val => {
          if (val >= 10000) return `${(val / 10000).toFixed(0)}만원`

          return val?.toLocaleString() ?? '0'
        },
      },
    },
    colors: [theme.current.value.colors.primary, theme.current.value.colors.success, theme.current.value.colors.error, theme.current.value.colors.warning, theme.current.value.colors.info],
    legend: {
      position: 'top',
    },
    tooltip: {
      y: {
        formatter: val => formatCurrency(val),
      },
    },
  }
})
</script>
