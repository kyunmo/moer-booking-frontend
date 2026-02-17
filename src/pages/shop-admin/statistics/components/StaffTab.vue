<template>
  <div>
    <!-- Staff Filter -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedStaffId"
              :items="staffOptions"
              label="직원 선택"
              density="compact"
              hide-details
              @update:model-value="onStaffChange"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" size="64" />
    </div>

    <!-- Error -->
    <VAlert v-else-if="error" type="error" variant="tonal" class="mb-6">
      <VAlertTitle>오류</VAlertTitle>
      {{ error }}
    </VAlert>

    <!-- Data -->
    <div v-else-if="data">
      <!-- Horizontal Bar: Staff Revenue Comparison -->
      <VCard class="mb-6">
        <VCardTitle>직원별 매출 비교</VCardTitle>
        <VCardText>
          <VueApexCharts
            :key="`bar-${chartKey}`"
            type="bar"
            :height="Math.max(300, (data.staffPerformances?.length || 0) * 60)"
            :options="barChartOptions"
            :series="barChartSeries"
          />
        </VCardText>
      </VCard>

      <!-- Staff Detail Cards -->
      <VRow class="mb-6">
        <VCol
          v-for="(staff, index) in data.staffPerformances"
          :key="staff.staffId"
          cols="12"
          md="4"
        >
          <VCard variant="tonal" :color="getRankColor(index)" class="h-100">
            <VCardText>
              <div class="d-flex align-center mb-4">
                <VAvatar
                  :color="getRankColor(index)"
                  size="40"
                  class="me-3"
                >
                  <span class="text-h6 font-weight-bold">{{ index + 1 }}</span>
                </VAvatar>
                <div>
                  <h4 class="text-h6 font-weight-medium">
                    {{ staff.staffName }}
                  </h4>
                  <span class="text-body-2 text-medium-emphasis">
                    {{ staff.positionName }}
                  </span>
                </div>
              </div>

              <VDivider class="mb-3" />

              <div class="d-flex flex-column gap-2">
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">예약</span>
                  <span class="text-body-2 font-weight-medium">{{ staff.reservationCount }}건</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">매출</span>
                  <span class="text-body-2 font-weight-medium">{{ formatCurrency(staff.totalRevenue) }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">완료율</span>
                  <span class="text-body-2 font-weight-medium">{{ staff.completionRate }}%</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">고객</span>
                  <span class="text-body-2 font-weight-medium">{{ staff.customerCount }}명</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">평균시간</span>
                  <span class="text-body-2 font-weight-medium">{{ staff.averageDuration }}분</span>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Bottom Row: Radar + Revenue Trend -->
      <VRow>
        <!-- Radar Chart -->
        <VCol cols="12" md="6">
          <VCard class="h-100">
            <VCardTitle>역량 비교</VCardTitle>
            <VCardText>
              <VueApexCharts
                :key="`radar-${chartKey}`"
                type="radar"
                height="400"
                :options="radarChartOptions"
                :series="radarChartSeries"
              />
            </VCardText>
          </VCard>
        </VCol>

        <!-- Revenue Trend Line Chart -->
        <VCol cols="12" md="6">
          <VCard class="h-100">
            <VCardTitle>매출 추이</VCardTitle>
            <VCardText>
              <VueApexCharts
                :key="`line-${chartKey}`"
                type="line"
                height="400"
                :options="lineChartOptions"
                :series="lineChartSeries"
              />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- No Data -->
    <VAlert v-else type="info" variant="tonal">
      조회 조건을 선택하고 조회 버튼을 눌러주세요.
    </VAlert>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import { useTheme } from 'vuetify'

const RADAR_KEYS = ['reservationVolume', 'revenue', 'completionRate', 'customerSatisfaction', 'efficiency']
const RADAR_LABELS = ['예약량', '매출', '완료율', '고객 만족도', '효율성']

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const statisticsStore = useStatisticsStore()
const theme = useTheme()

const themeColors = computed(() => [
  theme.current.value.colors.primary,
  theme.current.value.colors.error,
  theme.current.value.colors.success,
  theme.current.value.colors.warning,
  theme.current.value.colors.info,
])

const selectedStaffId = ref(null)
const chartKey = ref(0)

const loading = computed(() => statisticsStore.staffLoading)
const error = computed(() => statisticsStore.staffError)
const data = computed(() => statisticsStore.staffData)

// Staff filter options
const staffOptions = computed(() => {
  const options = [{ title: '전체', value: null }]
  if (data.value?.staffPerformances) {
    data.value.staffPerformances.forEach(s => {
      options.push({ title: s.staffName, value: s.staffId })
    })
  }

  return options
})

// Fetch data
async function fetchData() {
  const { startDate, endDate, compareWith } = props.filters
  if (!startDate || !endDate) return

  const params = { startDate, endDate }
  if (compareWith) params.compareWith = compareWith
  if (selectedStaffId.value) params.staffId = selectedStaffId.value

  await statisticsStore.fetchStaff(params)
  chartKey.value++
}

function onStaffChange() {
  fetchData()
}

// Watch filters
watch(
  () => props.filters,
  newFilters => {
    if (newFilters?.startDate && newFilters?.endDate) {
      fetchData()
    }
  },
  { deep: true },
)

// Utility functions
function formatCurrency(value) {
  if (value == null) return '0원'

  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

function formatCurrencyShort(value) {
  if (value == null) return '0'
  if (value >= 10000) {
    return Math.round(value / 10000) + '만원'
  }

  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

function getRankColor(index) {
  const colors = ['error', 'warning', 'success', 'info', 'primary']

  return colors[index] || 'default'
}

// --- Chart Options & Series ---

// Horizontal Bar Chart: Staff Revenue Comparison
const barChartOptions = computed(() => {
  const staffNames = data.value?.staffPerformances?.map(s => s.staffName) || []

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%',
        borderRadius: 4,
      },
    },
    colors: [theme.current.value.colors.primary],
    xaxis: {
      labels: {
        formatter: val => formatCurrencyShort(val),
      },
    },
    yaxis: {
      categories: staffNames,
    },
    dataLabels: {
      enabled: true,
      formatter: val => formatCurrencyShort(val),
      style: {
        fontSize: '12px',
      },
    },
    tooltip: {
      y: {
        formatter: val => formatCurrency(val),
      },
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  }
})

const barChartSeries = computed(() => {
  const performances = data.value?.staffPerformances || []

  return [{
    name: '매출',
    data: performances.map(s => ({
      x: s.staffName,
      y: s.totalRevenue,
    })),
  }]
})

// Radar Chart: Staff Capability Comparison
const radarChartOptions = computed(() => ({
  chart: {
    type: 'radar',
    toolbar: { show: false },
  },
  xaxis: {
    categories: RADAR_LABELS,
  },
  yaxis: {
    show: false,
    min: 0,
    max: 100,
  },
  markers: {
    size: 3,
  },
  stroke: {
    width: 2,
  },
  fill: {
    opacity: 0.2,
  },
  legend: {
    position: 'bottom',
  },
  colors: themeColors.value,
}))

const radarChartSeries = computed(() => {
  const radarData = data.value?.staffRadar || []

  return radarData.map(s => ({
    name: s.staffName,
    data: RADAR_KEYS.map(k => s.metrics[k]),
  }))
})

// Line Chart: Staff Revenue Trend
const lineChartOptions = computed(() => {
  const trendData = data.value?.staffRevenueTrend || []
  const categories = trendData.length > 0
    ? trendData[0].trend.map(t => t.date)
    : []

  return {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories,
    },
    yaxis: {
      labels: {
        formatter: val => formatCurrencyShort(val),
      },
    },
    tooltip: {
      y: {
        formatter: val => formatCurrency(val),
      },
    },
    legend: {
      position: 'bottom',
    },
    colors: themeColors.value,
    markers: {
      size: 4,
    },
  }
})

const lineChartSeries = computed(() => {
  const trendData = data.value?.staffRevenueTrend || []

  return trendData.map(s => ({
    name: s.staffName,
    data: s.trend.map(t => t.revenue),
  }))
})
</script>
