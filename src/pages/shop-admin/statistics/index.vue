<template>
  <div>
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon icon="ri-bar-chart-box-line" class="me-2" />
          통계 분석
        </div>
        <VBtn
          color="success"
          variant="outlined"
          size="small"
          :loading="csvExporting"
          @click="exportCsv"
        >
          <VIcon icon="ri-download-2-line" class="me-1" />
          CSV 다운로드
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- Filter Bar -->
    <StatisticsFilterBar
      v-model="filters"
      :show-group-by="currentTabShowGroupBy"
      @search="onSearch"
    />

    <!-- Tabs -->
    <VCard>
      <VTabs
        v-model="activeTab"
        show-arrows
        class="v-tabs-pill"
      >
        <VTab v-for="(tab, index) in tabs" :key="index">
          <VIcon :icon="tab.icon" class="me-1" />
          {{ tab.label }}
        </VTab>
      </VTabs>

      <VDivider />

      <VCardText>
        <VWindow v-model="activeTab">
          <VWindowItem>
            <RevenueTab :filters="searchFilters" />
          </VWindowItem>

          <VWindowItem>
            <ReservationTab :filters="searchFilters" />
          </VWindowItem>

          <VWindowItem>
            <CustomerTab :filters="searchFilters" />
          </VWindowItem>

          <VWindowItem>
            <StaffTab :filters="searchFilters" />
          </VWindowItem>

          <VWindowItem>
            <ServiceTab :filters="searchFilters" />
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'
import StatisticsFilterBar from './components/StatisticsFilterBar.vue'
import CustomerTab from './components/CustomerTab.vue'
import ReservationTab from './components/ReservationTab.vue'
import RevenueTab from './components/RevenueTab.vue'
import ServiceTab from './components/ServiceTab.vue'
import StaffTab from './components/StaffTab.vue'

const statisticsStore = useStatisticsStore()

const activeTab = ref(0)
const filters = ref({})
const searchFilters = ref({})
const csvExporting = ref(false)

const tabs = [
  { label: '매출 분석', icon: 'ri-money-dollar-circle-line', showGroupBy: true },
  { label: '예약 분석', icon: 'ri-calendar-check-line', showGroupBy: true },
  { label: '고객 분석', icon: 'ri-user-line', showGroupBy: false },
  { label: '직원 성과', icon: 'ri-team-line', showGroupBy: true },
  { label: '서비스 분석', icon: 'ri-service-line', showGroupBy: true },
]

const currentTabShowGroupBy = computed(() => tabs[activeTab.value]?.showGroupBy ?? true)

function onSearch() {
  // Copy filters to searchFilters only on explicit search click
  searchFilters.value = { ...filters.value }
}

// ==================== CSV Export ====================

const TAB_NAMES = ['매출', '예약', '고객', '직원성과', '서비스']

function formatCurrencyPlain(value) {
  return value != null ? Number(value).toLocaleString('ko-KR') : '0'
}

function getRevenueRows() {
  const data = statisticsStore.revenueData
  if (!data) return { headers: [], rows: [] }

  const headers = ['날짜', '예약건수', '매출(원)']
  const rows = (data.revenueTrend || []).map(d => [
    d.date,
    d.reservationCount,
    formatCurrencyPlain(d.revenue),
  ])

  // Summary row
  if (data.summary) {
    rows.push([])
    rows.push(['[요약]'])
    rows.push(['총매출', '', formatCurrencyPlain(data.summary.totalRevenue)])
    rows.push(['일평균 매출', '', formatCurrencyPlain(data.summary.averageRevenue)])
    rows.push(['객단가', '', formatCurrencyPlain(data.summary.averageTransactionAmount)])
    rows.push(['완료율', '', `${data.summary.completionRate?.toFixed(1) ?? '0.0'}%`])
  }

  // Service breakdown
  if (data.revenueByService?.length) {
    rows.push([])
    rows.push(['[서비스별 매출]'])
    rows.push(['서비스명', '매출(원)', '비율(%)'])
    const total = data.revenueByService.reduce((sum, s) => sum + (s.revenue || 0), 0)
    data.revenueByService.forEach(s => {
      rows.push([s.serviceName, formatCurrencyPlain(s.revenue), total ? ((s.revenue / total) * 100).toFixed(1) : '0.0'])
    })
  }

  // Payment method breakdown
  if (data.revenueByPaymentMethod?.length) {
    rows.push([])
    rows.push(['[결제수단별 매출]'])
    rows.push(['결제수단', '매출(원)'])
    data.revenueByPaymentMethod.forEach(p => {
      rows.push([p.paymentMethod, formatCurrencyPlain(p.revenue)])
    })
  }

  return { headers, rows }
}

function getReservationRows() {
  const data = statisticsStore.reservationData
  if (!data) return { headers: [], rows: [] }

  const headers = ['날짜', '완료', '취소', '노쇼', '대기']
  const rows = (data.reservationTrend || []).map(d => [
    d.date,
    d.completed,
    d.cancelled,
    d.noShow,
    d.pending,
  ])

  // Summary
  if (data.summary) {
    rows.push([])
    rows.push(['[요약]'])
    rows.push(['총 예약', data.summary.totalReservations ?? 0])
    rows.push(['완료', data.summary.completedReservations ?? 0])
    rows.push(['취소', data.summary.cancelledReservations ?? 0])
    rows.push(['노쇼', data.summary.noShowReservations ?? 0])
    rows.push(['취소율', `${data.summary.cancellationRate?.toFixed(1) ?? '0.0'}%`])
    rows.push(['노쇼율', `${data.summary.noShowRate?.toFixed(1) ?? '0.0'}%`])
    rows.push(['매출 손실액', formatCurrencyPlain(data.summary.lostRevenue)])
  }

  // Status distribution
  if (data.statusDistribution?.length) {
    rows.push([])
    rows.push(['[상태 분포]'])
    rows.push(['상태', '건수'])
    data.statusDistribution.forEach(s => {
      rows.push([s.statusName, s.count])
    })
  }

  // Daily distribution
  if (data.dailyDistribution?.length) {
    rows.push([])
    rows.push(['[요일별 평균 예약]'])
    rows.push(['요일', '평균 예약건수'])
    data.dailyDistribution.forEach(d => {
      rows.push([d.dayName, d.averageCount?.toFixed(1)])
    })
  }

  return { headers, rows }
}

function getCustomerRows() {
  const data = statisticsStore.customerData
  if (!data) return { headers: [], rows: [] }

  const headers = ['날짜', '신규 고객', '재방문 고객']
  const rows = (data.customerTrend || []).map(d => [
    d.date,
    d.newCustomers,
    d.returningCustomers,
  ])

  // Summary
  if (data.summary) {
    rows.push([])
    rows.push(['[요약]'])
    rows.push(['전체 고객', `${data.summary.totalCustomers}명`])
    rows.push(['신규 고객', `${data.summary.newCustomers}명`])
    rows.push(['재방문율', `${data.summary.returningRate?.toFixed(1)}%`])
    rows.push(['평균 방문', `${data.summary.averageVisitCount?.toFixed(1)}회`])
  }

  // Segments
  if (data.segments?.length) {
    rows.push([])
    rows.push(['[고객 세그먼트]'])
    rows.push(['세그먼트', '고객수', '총매출(원)', '인당매출(원)'])
    data.segments.forEach(s => {
      rows.push([s.segmentName, s.count, formatCurrencyPlain(s.totalRevenue), formatCurrencyPlain(s.averageRevenue)])
    })
  }

  return { headers, rows }
}

function getStaffRows() {
  const data = statisticsStore.staffData
  if (!data) return { headers: [], rows: [] }

  const headers = ['직원명', '직급', '예약건수', '매출(원)', '완료율(%)', '고객수', '평균시간(분)']
  const rows = (data.staffPerformances || []).map(s => [
    s.staffName,
    s.positionName,
    s.reservationCount,
    formatCurrencyPlain(s.totalRevenue),
    s.completionRate,
    s.customerCount,
    s.averageDuration,
  ])

  return { headers, rows }
}

function getServiceRows() {
  const data = statisticsStore.serviceData
  if (!data) return { headers: [], rows: [] }

  const headers = ['순위', '서비스명', '카테고리', '예약수', '매출(원)', '평균단가(원)', '매출비중(%)', '완료율(%)']
  const rows = (data.serviceRankings || []).map(s => [
    s.rank,
    s.serviceName,
    s.categoryName,
    s.reservationCount,
    formatCurrencyPlain(s.totalRevenue),
    formatCurrencyPlain(s.averagePrice),
    s.revenuePercentage?.toFixed(1),
    s.completionRate?.toFixed(1),
  ])

  // Summary
  if (data.summary) {
    rows.push([])
    rows.push(['[요약]'])
    rows.push(['서비스 건수', data.summary.totalServiceCount ?? 0])
    rows.push(['인기 서비스', data.summary.mostPopularService ?? '-'])
    rows.push(['평균 단가', formatCurrencyPlain(data.summary.averagePrice)])
    rows.push(['카테고리 수', data.summary.categoryCount ?? 0])
  }

  // Category distribution
  if (data.categoryDistribution?.length) {
    rows.push([])
    rows.push(['[카테고리 분포]'])
    rows.push(['카테고리', '매출(원)'])
    data.categoryDistribution.forEach(c => {
      rows.push([c.categoryName, formatCurrencyPlain(c.revenue)])
    })
  }

  return { headers, rows }
}

function escapeCsvField(field) {
  const str = String(field ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function exportCsv() {
  csvExporting.value = true

  try {
    const tabIndex = activeTab.value
    const tabName = TAB_NAMES[tabIndex] || '통계'

    let csvData
    switch (tabIndex) {
    case 0:
      csvData = getRevenueRows()
      break
    case 1:
      csvData = getReservationRows()
      break
    case 2:
      csvData = getCustomerRows()
      break
    case 3:
      csvData = getStaffRows()
      break
    case 4:
      csvData = getServiceRows()
      break
    default:
      csvData = { headers: [], rows: [] }
    }

    if (!csvData.headers.length && !csvData.rows.length) {
      return
    }

    // Build CSV string
    const lines = []

    // Header row
    if (csvData.headers.length) {
      lines.push(csvData.headers.map(escapeCsvField).join(','))
    }

    // Data rows
    csvData.rows.forEach(row => {
      lines.push(row.map(escapeCsvField).join(','))
    })

    const csvString = lines.join('\n')

    // BOM + UTF-8 encoding for Korean character support
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    // Generate filename: YEMO_통계_매출_2026-02-20.csv
    const today = new Date().toISOString().split('T')[0]
    const filename = `YEMO_통계_${tabName}_${today}.csv`

    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
  finally {
    csvExporting.value = false
  }
}
</script>
