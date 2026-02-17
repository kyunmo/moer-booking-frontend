<template>
  <div>
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-bar-chart-box-line" class="me-2" />
        통계 분석
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
import StatisticsFilterBar from './components/StatisticsFilterBar.vue'
import CustomerTab from './components/CustomerTab.vue'
import ReservationTab from './components/ReservationTab.vue'
import RevenueTab from './components/RevenueTab.vue'
import ServiceTab from './components/ServiceTab.vue'
import StaffTab from './components/StaffTab.vue'

const activeTab = ref(0)
const filters = ref({})
const searchFilters = ref({})

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
</script>
