<template>
  <div>
    <!-- 환영 메시지 -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center">
        <div>
          <h4 class="text-h4 font-weight-medium mb-1">
            안녕하세요, {{ businessName }} 님! 👋
          </h4>
          <p class="text-body-1 mb-0">
            {{ todayText }}
          </p>
        </div>
      </VCardText>
    </VCard>

    <!-- 알림 영역 -->
    <UnassignedReservationAlert class="mb-4" />

    <!-- 로딩 -->
    <div v-if="dashboardStore.loading" class="text-center pa-10">
      <VProgressCircular indeterminate color="primary" size="64" />
    </div>

    <template v-else-if="stats">
      <!-- 오늘 통계 카드 -->
      <VRow class="mb-6">
        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                color="primary"
                variant="tonal"
                size="44"
                class="me-4"
              >
                <VIcon icon="ri-calendar-event-line" size="26" />
              </VAvatar>

              <div>
                <p class="text-caption text-disabled mb-1">
                  오늘 예약
                </p>
                <h5 class="text-h5 font-weight-medium">
                  {{ stats.todayStats.totalReservations }}건
                </h5>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                color="warning"
                variant="tonal"
                size="44"
                class="me-4"
              >
                <VIcon icon="ri-time-line" size="26" />
              </VAvatar>

              <div>
                <p class="text-caption text-disabled mb-1">
                  대기 중
                </p>
                <h5 class="text-h5 font-weight-medium">
                  {{ stats.todayStats.pendingReservations }}건
                </h5>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                color="info"
                variant="tonal"
                size="44"
                class="me-4"
              >
                <VIcon icon="ri-money-dollar-circle-line" size="26" />
              </VAvatar>

              <div>
                <p class="text-caption text-disabled mb-1">
                  오늘 예상 매출
                </p>
                <h5 class="text-h5 font-weight-medium">
                  {{ formatCurrency(stats.todayStats.expectedRevenue) }}
                </h5>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="3">
          <VCard>
            <VCardText class="d-flex align-center">
              <VAvatar
                color="success"
                variant="tonal"
                size="44"
                class="me-4"
              >
                <VIcon icon="ri-user-add-line" size="26" />
              </VAvatar>

              <div>
                <p class="text-caption text-disabled mb-1">
                  이번 달 신규 고객
                </p>
                <h5 class="text-h5 font-weight-medium">
                  {{ stats.monthStats.newCustomers }}명
                </h5>
              </div>
            </VCardText>
          </VCard>
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
                type="bar"
                height="300"
                :options="chartOptions"
                :series="chartSeries"
              />
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
                :to="{ name: 'reservations-calendar' }"
              >
                전체 보기
                <VIcon icon="ri-arrow-right-line" class="ms-1" />
              </VBtn>
            </VCardTitle>

            <VDivider />

            <VCardText>
              <VList v-if="stats.recentReservations.length > 0">
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
                    {{ reservation.startTime }} - {{ reservation.endTime }}
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
                :to="{ name: 'customers-list' }"
              >
                전체 보기
                <VIcon icon="ri-arrow-right-line" class="ms-1" />
              </VBtn>
            </VCardTitle>

            <VDivider />

            <VCardText>
              <VList v-if="stats.recentCustomers.length > 0">
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

      <!-- 퀵 액션 -->
      <VRow class="mt-6">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="ri-flashlight-line" class="me-2" />
              빠른 작업
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" sm="6" md="3">
                  <VBtn
                    block
                    color="primary"
                    size="large"
                    prepend-icon="ri-add-line"
                    :to="{ name: 'reservations-calendar' }"
                  >
                    예약 등록
                  </VBtn>
                </VCol>

                <VCol cols="12" sm="6" md="3">
                  <VBtn
                    block
                    color="success"
                    size="large"
                    prepend-icon="ri-user-add-line"
                    :to="{ name: 'customers-list' }"
                  >
                    고객 등록
                  </VBtn>
                </VCol>

                <VCol cols="12" sm="6" md="3">
                  <VBtn
                    block
                    color="info"
                    size="large"
                    prepend-icon="ri-scissors-line"
                    :to="{ name: 'services-list' }"
                  >
                    서비스 관리
                  </VBtn>
                </VCol>

                <VCol cols="12" sm="6" md="3">
                  <VBtn
                    block
                    color="warning"
                    size="large"
                    prepend-icon="ri-settings-3-line"
                    :to="{ name: 'business-settings' }"
                  >
                    매장 설정
                  </VBtn>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </div>
</template>

<script setup>
import UnassignedReservationAlert from '@/components/UnassignedReservationAlert.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const businessName = computed(() => authStore.user?.name || '사장님')

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
    colors: ['#9155FD'],
  }
})

// 유틸리티 함수
function formatCurrency(value) {
  if (!value) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value)
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

onMounted(() => {
  dashboardStore.fetchDashboard()
})
</script>
