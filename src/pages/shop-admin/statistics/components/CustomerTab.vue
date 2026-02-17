<template>
  <!-- Loading -->
  <div v-if="loading" class="text-center pa-10">
    <VProgressCircular indeterminate color="primary" size="64" />
    <p class="text-body-1 mt-4">
      고객 분석 데이터를 불러오는 중...
    </p>
  </div>

  <!-- Error -->
  <VAlert v-else-if="error" type="error" variant="tonal" class="mb-6">
    <VAlertTitle>오류</VAlertTitle>
    {{ error }}
    <template #append>
      <VBtn size="small" @click="fetchData">
        재시도
      </VBtn>
    </template>
  </VAlert>

  <!-- Data -->
  <div v-else-if="data">
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" md="3">
        <VCard variant="tonal" color="primary">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              전체 고객
            </div>
            <div class="text-h4 font-weight-bold">
              {{ data.summary.totalCustomers }}명
            </div>
            <div
              v-if="data.comparison?.totalCustomersChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.totalCustomersChange)"
            >
              {{ formatChange(data.comparison.totalCustomersChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3">
        <VCard variant="tonal" color="success">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              신규 고객
            </div>
            <div class="text-h4 font-weight-bold">
              {{ data.summary.newCustomers }}명
            </div>
            <div
              v-if="data.comparison?.newCustomersChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.newCustomersChange)"
            >
              {{ formatChange(data.comparison.newCustomersChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3">
        <VCard variant="tonal" color="info">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              재방문율
            </div>
            <div class="text-h4 font-weight-bold">
              {{ data.summary.returningRate?.toFixed(1) }}%
            </div>
            <div
              v-if="data.comparison?.returningRateChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.returningRateChange)"
            >
              {{ formatChange(data.comparison.returningRateChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3">
        <VCard variant="tonal" color="warning">
          <VCardText class="text-center">
            <div class="text-body-2 mb-1">
              평균 방문
            </div>
            <div class="text-h4 font-weight-bold">
              {{ data.summary.averageVisitCount?.toFixed(1) }}회
            </div>
            <div
              v-if="data.comparison?.averageVisitCountChange != null"
              class="text-body-2 mt-1"
              :class="getChangeClass(data.comparison.averageVisitCountChange)"
            >
              {{ formatChange(data.comparison.averageVisitCountChange) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Customer Trend + Segment Donut -->
    <VRow class="mb-6">
      <!-- Customer Trend (dual-line chart) -->
      <VCol cols="12" md="8">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-line-chart-line" class="me-2" />
            고객 추이
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.customerTrend && data.customerTrend.length > 0"
              :key="`customer-trend-${chartKey}`"
              type="line"
              height="350"
              :options="customerTrendOptions"
              :series="customerTrendSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              고객 추이 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Segment Donut -->
      <VCol cols="12" md="4">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-pie-chart-line" class="me-2" />
            고객 세그먼트
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.segments && data.segments.length > 0"
              :key="`segment-donut-${chartKey}`"
              type="donut"
              height="350"
              :options="segmentDonutOptions"
              :series="segmentDonutSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              세그먼트 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Middle Row: Returning Rate Trend + LTV Distribution -->
    <VRow class="mb-6">
      <!-- Returning Rate Trend (area chart) -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-arrow-go-back-line" class="me-2" />
            재방문율 추이
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.returningRateTrend && data.returningRateTrend.length > 0"
              :key="`returning-rate-${chartKey}`"
              type="area"
              height="300"
              :options="returningRateOptions"
              :series="returningRateSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              재방문율 추이 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- LTV Distribution (bar chart) -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-bar-chart-box-line" class="me-2" />
            고객 LTV 분포
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="data.ltvDistribution && data.ltvDistribution.length > 0"
              :key="`ltv-dist-${chartKey}`"
              type="bar"
              height="300"
              :options="ltvDistributionOptions"
              :series="ltvDistributionSeries"
            />
            <VAlert v-else type="info" variant="tonal">
              LTV 분포 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Segment Detail (full width) -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-group-line" class="me-2" />
            세그먼트 상세
          </VCardTitle>
          <VCardText v-if="data.segments && data.segments.length > 0">
            <VList>
              <VListItem
                v-for="seg in data.segments"
                :key="seg.segment"
              >
                <template #prepend>
                  <VAvatar
                    :color="getSegmentInfo(seg.segment).color"
                    variant="tonal"
                    size="40"
                  >
                    <VIcon :icon="getSegmentInfo(seg.segment).icon" />
                  </VAvatar>
                </template>

                <VListItemTitle class="font-weight-medium">
                  {{ seg.segmentName }}
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ seg.description }}
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex align-center ga-4">
                    <VChip size="small" color="primary" variant="tonal">
                      {{ seg.count }}명
                    </VChip>
                    <VChip size="small" color="success" variant="tonal">
                      총 {{ formatCurrency(seg.totalRevenue) }}
                    </VChip>
                    <VChip size="small" color="info" variant="tonal">
                      인당 {{ formatCurrency(seg.averageRevenue) }}
                    </VChip>
                  </div>
                </template>
              </VListItem>
            </VList>
          </VCardText>
          <VCardText v-else>
            <VAlert type="info" variant="tonal">
              세그먼트 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <!-- No Data -->
  <VAlert v-else type="info" variant="tonal">
    <VAlertTitle>데이터 없음</VAlertTitle>
    조회 조건을 설정하고 검색해 주세요.
  </VAlert>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics'
import { computed, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const statisticsStore = useStatisticsStore()

const chartKey = ref(0)

const loading = computed(() => statisticsStore.customerLoading)
const error = computed(() => statisticsStore.customerError)
const data = computed(() => statisticsStore.customerData)

// ==================== Watch filters ====================

watch(() => props.filters, async newFilters => {
  if (newFilters?.startDate && newFilters?.endDate) {
    await fetchData()
  }
}, { deep: true })

async function fetchData() {
  const params = {
    startDate: props.filters.startDate,
    endDate: props.filters.endDate,
  }

  if (props.filters.compareWith) {
    params.compareWith = props.filters.compareWith
  }

  await statisticsStore.fetchCustomers(params)
  chartKey.value++
}

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

// ==================== Segment Icons ====================

const segmentIcons = {
  VIP: { icon: 'ri-vip-crown-line', color: 'error' },
  REGULAR: { icon: 'ri-user-star-line', color: 'success' },
  NEW: { icon: 'ri-user-add-line', color: 'info' },
  INACTIVE: { icon: 'ri-user-unfollow-line', color: 'warning' },
}

function getSegmentInfo(segment) {
  return segmentIcons[segment] || { icon: 'ri-user-line', color: 'primary' }
}

// ==================== Chart: Customer Trend (dual-line) ====================

const customerTrendSeries = computed(() => {
  if (!data.value?.customerTrend) return []

  return [
    {
      name: '신규 고객',
      data: data.value.customerTrend.map(d => d.newCustomers),
    },
    {
      name: '재방문 고객',
      data: data.value.customerTrend.map(d => d.returningCustomers),
    },
  ]
})

const customerTrendOptions = computed(() => {
  if (!data.value?.customerTrend) return {}

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
      categories: data.value.customerTrend.map(d => d.date),
    },
    yaxis: {
      min: 0,
      title: { text: '고객 수' },
    },
    colors: ['#56CA00', '#9155FD'],
    legend: {
      position: 'top',
    },
    tooltip: {
      y: {
        formatter: val => `${val}명`,
      },
    },
  }
})

// ==================== Chart: Segment Donut ====================

const segmentDonutSeries = computed(() => {
  if (!data.value?.segments) return []

  return data.value.segments.map(s => s.count)
})

const segmentDonutOptions = computed(() => {
  if (!data.value?.segments) return {}

  return {
    chart: {
      type: 'donut',
    },
    labels: data.value.segments.map(s => s.segmentName),
    colors: ['#FF4C51', '#56CA00', '#16B1FF', '#FFB400'],
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '전체',
              formatter: w => {
                return `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}명`
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val, { seriesIndex, w }) => {
        return `${w.config.labels[seriesIndex]}: ${val.toFixed(1)}%`
      },
    },
    tooltip: {
      y: {
        formatter: val => `${val}명`,
      },
    },
  }
})

// ==================== Chart: Returning Rate Trend (area) ====================

const returningRateSeries = computed(() => {
  if (!data.value?.returningRateTrend) return []

  return [
    {
      name: '재방문율',
      data: data.value.returningRateTrend.map(d => d.rate),
    },
  ]
})

const returningRateOptions = computed(() => {
  if (!data.value?.returningRateTrend) return {}

  return {
    chart: {
      type: 'area',
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
      categories: data.value.returningRateTrend.map(d => d.date),
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: val => `${val}%`,
      },
      title: { text: '재방문율 (%)' },
    },
    colors: ['#9155FD'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      y: {
        formatter: val => `${val.toFixed(1)}%`,
      },
    },
  }
})

// ==================== Chart: LTV Distribution (bar) ====================

const ltvDistributionSeries = computed(() => {
  if (!data.value?.ltvDistribution) return []

  return [
    {
      name: '고객 수',
      data: data.value.ltvDistribution.map(d => d.count),
    },
  ]
})

const ltvDistributionOptions = computed(() => {
  if (!data.value?.ltvDistribution) return {}

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.value.ltvDistribution.map(d => d.range),
    },
    yaxis: {
      min: 0,
      title: { text: '고객 수' },
    },
    colors: ['#16B1FF'],
    tooltip: {
      y: {
        formatter: val => `${val}명`,
      },
    },
  }
})
</script>
