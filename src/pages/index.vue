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
      <!-- 실시간 액션 알림 -->
      <VCard v-if="stats.actionAlerts" class="mb-6" color="warning" variant="tonal">
        <VCardText>
          <div class="d-flex align-center mb-2">
            <VIcon icon="ri-alarm-warning-line" size="24" class="me-2" />
            <h5 class="text-h5 mb-0">
              ⚠️ 처리 필요 ({{ totalAlerts }}건)
            </h5>
          </div>

          <VRow class="mt-4">
            <VCol cols="12" sm="6" md="3">
              <div class="d-flex align-center">
                <VAvatar color="warning" variant="tonal" size="40" class="me-3">
                  <VIcon icon="ri-time-line" />
                </VAvatar>
                <div>
                  <div class="text-caption">확정 대기</div>
                  <div class="text-h6">{{ stats.actionAlerts.pendingReservations }}건</div>
                </div>
              </div>
            </VCol>

            <VCol cols="12" sm="6" md="3">
              <div class="d-flex align-center">
                <VAvatar color="error" variant="tonal" size="40" class="me-3">
                  <VIcon icon="ri-alarm-line" />
                </VAvatar>
                <div>
                  <div class="text-caption">1시간 내 시작</div>
                  <div class="text-h6">{{ stats.actionAlerts.upcomingReservations }}건</div>
                </div>
              </div>
            </VCol>

            <VCol cols="12" sm="6" md="3">
              <div class="d-flex align-center">
                <VAvatar color="success" variant="tonal" size="40" class="me-3">
                  <VIcon icon="ri-cake-line" />
                </VAvatar>
                <div>
                  <div class="text-caption">생일 고객</div>
                  <div class="text-h6">{{ stats.actionAlerts.birthdayCustomers }}명</div>
                </div>
              </div>
            </VCol>

            <VCol cols="12" sm="6" md="3">
              <div class="d-flex align-center">
                <VAvatar color="info" variant="tonal" size="40" class="me-3">
                  <VIcon icon="ri-user-unfollow-line" />
                </VAvatar>
                <div>
                  <div class="text-caption">재방문 유도</div>
                  <div class="text-h6">{{ stats.actionAlerts.inactiveCustomers }}명</div>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- 오늘 통계 & 취소/노쇼 현황 -->
      <VRow class="mb-4">
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

      <!-- 취소/노쇼 현황 (이번 달) -->
      <VRow v-if="stats.cancellationStats" class="mb-6">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="ri-close-circle-line" class="me-2" />
              이번 달 취소/노쇼 현황
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" sm="6" md="3">
                  <div class="text-center pa-4">
                    <div class="text-h4 mb-1" :class="cancellationRateColor">
                      {{ stats.cancellationStats.cancelledCount }}건
                    </div>
                    <div class="text-body-2">
                      취소 ({{ stats.cancellationStats.cancellationRate.toFixed(1) }}%)
                    </div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="3">
                  <div class="text-center pa-4">
                    <div class="text-h4 mb-1" :class="noShowRateColor">
                      {{ stats.cancellationStats.noShowCount }}건
                    </div>
                    <div class="text-body-2">
                      노쇼 ({{ stats.cancellationStats.noShowRate.toFixed(1) }}%)
                    </div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="3">
                  <div class="text-center pa-4">
                    <div class="text-h4 text-error mb-1">
                      {{ formatCurrency(stats.cancellationStats.lostRevenue) }}
                    </div>
                    <div class="text-body-2">매출 손실액</div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="3">
                  <div class="text-center pa-4">
                    <div class="text-h4 mb-1">
                      {{ (stats.cancellationStats.cancellationRate + stats.cancellationStats.noShowRate).toFixed(1) }}%
                    </div>
                    <div class="text-body-2">전체 이탈률</div>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- 고객 세그먼트 & 인기 서비스 -->
      <VRow class="mb-6">
        <!-- 고객 세그먼트 분석 -->
        <VCol cols="12" md="6">
          <VCard class="h-100">
            <VCardTitle>
              <VIcon icon="ri-user-line" class="me-2" />
              고객 현황
            </VCardTitle>
            <VCardText v-if="stats.customerSegments">
              <VList>
                <VListItem>
                  <template #prepend>
                    <VAvatar color="error" variant="tonal" size="40">
                      <VIcon icon="ri-vip-crown-line" />
                    </VAvatar>
                  </template>
                  <VListItemTitle>VIP 고객</VListItemTitle>
                  <VListItemSubtitle class="text-h6">
                    {{ stats.customerSegments.vipCount }}명
                  </VListItemSubtitle>
                  <template #append>
                    <VChip size="small" color="error" variant="tonal">
                      10회 이상
                    </VChip>
                  </template>
                </VListItem>

                <VListItem>
                  <template #prepend>
                    <VAvatar color="success" variant="tonal" size="40">
                      <VIcon icon="ri-user-star-line" />
                    </VAvatar>
                  </template>
                  <VListItemTitle>단골 고객</VListItemTitle>
                  <VListItemSubtitle class="text-h6">
                    {{ stats.customerSegments.regularCount }}명
                  </VListItemSubtitle>
                  <template #append>
                    <VChip size="small" color="success" variant="tonal">
                      3-9회
                    </VChip>
                  </template>
                </VListItem>

                <VListItem>
                  <template #prepend>
                    <VAvatar color="info" variant="tonal" size="40">
                      <VIcon icon="ri-user-add-line" />
                    </VAvatar>
                  </template>
                  <VListItemTitle>신규 고객</VListItemTitle>
                  <VListItemSubtitle class="text-h6">
                    {{ stats.customerSegments.newCount }}명
                  </VListItemSubtitle>
                  <template #append>
                    <VChip size="small" color="info" variant="tonal">
                      1회
                    </VChip>
                  </template>
                </VListItem>

                <VListItem>
                  <template #prepend>
                    <VAvatar color="warning" variant="tonal" size="40">
                      <VIcon icon="ri-user-unfollow-line" />
                    </VAvatar>
                  </template>
                  <VListItemTitle>이탈 고객</VListItemTitle>
                  <VListItemSubtitle class="text-h6">
                    {{ stats.customerSegments.inactiveCount }}명
                  </VListItemSubtitle>
                  <template #append>
                    <VChip size="small" color="warning" variant="tonal">
                      3개월 미방문
                    </VChip>
                  </template>
                </VListItem>

                <VDivider class="my-2" />

                <VListItem>
                  <template #prepend>
                    <VAvatar color="primary" variant="tonal" size="40">
                      <VIcon icon="ri-team-line" />
                    </VAvatar>
                  </template>
                  <VListItemTitle>전체 고객</VListItemTitle>
                  <VListItemSubtitle class="text-h6">
                    {{ stats.customerSegments.totalCustomers }}명
                  </VListItemSubtitle>
                  <template #append>
                    <VChip
                      size="small"
                      :color="returningRateColor"
                      variant="tonal"
                    >
                      재방문율 {{ stats.customerSegments.returningRate.toFixed(1) }}%
                    </VChip>
                  </template>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>

        <!-- 인기 서비스 TOP 5 -->
        <VCol cols="12" md="6">
          <VCard class="h-100">
            <VCardTitle>
              <VIcon icon="ri-scissors-line" class="me-2" />
              인기 서비스
            </VCardTitle>
            <VCardText v-if="stats.popularServices && stats.popularServices.length > 0">
              <VList>
                <VListItem
                  v-for="(service, index) in stats.popularServices"
                  :key="service.serviceId"
                >
                  <template #prepend>
                    <VAvatar :color="getServiceRankColor(index)" variant="tonal" size="40">
                      <span class="text-h6">{{ index + 1 }}</span>
                    </VAvatar>
                  </template>

                  <VListItemTitle class="font-weight-medium">
                    {{ service.serviceName }}
                  </VListItemTitle>
                  <VListItemSubtitle>
                    {{ service.reservationCount }}건 ·
                    {{ formatCurrency(service.totalRevenue) }} ·
                    평균 {{ formatCurrency(service.averagePrice) }}
                  </VListItemSubtitle>

                  <template #append>
                    <VChip size="small" color="primary" variant="tonal">
                      {{ service.revenuePercentage.toFixed(1) }}%
                    </VChip>
                  </template>
                </VListItem>
              </VList>
            </VCardText>
            <VCardText v-else>
              <VAlert type="info" variant="tonal">
                인기 서비스 데이터가 없습니다
              </VAlert>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- 직원 성과 TOP 3 -->
      <VRow v-if="stats.topStaffPerformances && stats.topStaffPerformances.length > 0" class="mb-6">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="ri-user-star-line" class="me-2" />
              이번 달 직원 성과 TOP 3
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol
                  v-for="(staff, index) in stats.topStaffPerformances"
                  :key="staff.staffId"
                  cols="12"
                  md="4"
                >
                  <VCard variant="tonal" :color="getStaffRankColor(index)">
                    <VCardText>
                      <div class="d-flex align-center mb-4">
                        <VAvatar :color="getStaffRankColor(index)" size="56" class="me-3">
                          <span class="text-h4">{{ index + 1 }}</span>
                        </VAvatar>
                        <div>
                          <h5 class="text-h5 mb-1">{{ staff.staffName }}</h5>
                          <div class="text-caption">이번 달 성과</div>
                        </div>
                      </div>

                      <VDivider class="mb-3" />

                      <div class="d-flex justify-space-between mb-2">
                        <span class="text-body-2">예약 건수</span>
                        <span class="text-h6">{{ staff.reservationCount }}건</span>
                      </div>

                      <div class="d-flex justify-space-between mb-2">
                        <span class="text-body-2">총 매출</span>
                        <span class="text-h6">{{ formatCurrency(staff.totalRevenue) }}</span>
                      </div>

                      <div class="d-flex justify-space-between">
                        <span class="text-body-2">평균 시간</span>
                        <span class="text-h6">{{ staff.averageDuration }}분</span>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- 평균 지표 -->
      <VRow v-if="stats.averageMetrics" class="mb-6">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="ri-bar-chart-box-line" class="me-2" />
              평균 지표
            </VCardTitle>
            <VCardText>
              <VRow>
                <VCol cols="12" sm="6" md="4" lg="2">
                  <div class="text-center pa-3">
                    <VIcon icon="ri-money-dollar-circle-line" size="32" color="success" class="mb-2" />
                    <div class="text-h5 mb-1">
                      {{ formatCurrency(stats.averageMetrics.averageReservationAmount) }}
                    </div>
                    <div class="text-body-2">평균 예약 금액</div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="4" lg="2">
                  <div class="text-center pa-3">
                    <VIcon icon="ri-time-line" size="32" color="info" class="mb-2" />
                    <div class="text-h5 mb-1">
                      {{ stats.averageMetrics.averageServiceDuration }}분
                    </div>
                    <div class="text-body-2">평균 서비스 시간</div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="4" lg="2">
                  <div class="text-center pa-3">
                    <VIcon icon="ri-repeat-line" size="32" color="primary" class="mb-2" />
                    <div class="text-h5 mb-1">
                      {{ stats.averageMetrics.averageVisitCount.toFixed(1) }}회
                    </div>
                    <div class="text-body-2">평균 방문 횟수</div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="4" lg="3">
                  <div class="text-center pa-3">
                    <VIcon icon="ri-vip-crown-line" size="32" color="warning" class="mb-2" />
                    <div class="text-h5 mb-1">
                      {{ formatCurrency(stats.averageMetrics.averageCustomerLifetimeValue) }}
                    </div>
                    <div class="text-body-2">고객 LTV</div>
                  </div>
                </VCol>

                <VCol cols="12" sm="6" md="4" lg="3">
                  <div class="text-center pa-3">
                    <VIcon icon="ri-checkbox-circle-line" size="32" :color="completionRateColor" class="mb-2" />
                    <div class="text-h5 mb-1" :class="`text-${completionRateColor}`">
                      {{ stats.averageMetrics.completionRate.toFixed(1) }}%
                    </div>
                    <div class="text-body-2">예약 완료 전환율</div>
                  </div>
                </VCol>
              </VRow>
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
                v-if="stats?.weekStats?.dailyCounts && stats.weekStats.dailyCounts.length > 0"
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
                :to="{ name: 'reservations-calendar' }"
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
import StatisticsCard from '@/components/StatisticsCard.vue'
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

const stats = computed(() => {
  console.log('Stats computed:', dashboardStore.dashboardData)
  return dashboardStore.dashboardData
})

// 전체 알림 수
const totalAlerts = computed(() => {
  if (!stats.value?.actionAlerts) return 0
  const alerts = stats.value.actionAlerts
  return (
    alerts.pendingReservations +
    alerts.upcomingReservations +
    alerts.birthdayCustomers +
    alerts.inactiveCustomers
  )
})

// 취소율 색상 (10% 이상 빨강, 5~10% 노랑, 5% 미만 초록)
const cancellationRateColor = computed(() => {
  if (!stats.value?.cancellationStats) return ''
  const rate = stats.value.cancellationStats.cancellationRate
  if (rate >= 10) return 'text-error'
  if (rate >= 5) return 'text-warning'
  return 'text-success'
})

// 노쇼율 색상 (5% 이상 빨강, 3~5% 노랑, 3% 미만 초록)
const noShowRateColor = computed(() => {
  if (!stats.value?.cancellationStats) return ''
  const rate = stats.value.cancellationStats.noShowRate
  if (rate >= 5) return 'text-error'
  if (rate >= 3) return 'text-warning'
  return 'text-success'
})

// 재방문율 색상 (70% 이상 초록, 50~70% 노랑, 50% 미만 빨강)
const returningRateColor = computed(() => {
  if (!stats.value?.customerSegments) return 'primary'
  const rate = stats.value.customerSegments.returningRate
  if (rate >= 70) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
})

// 완료 전환율 색상 (80% 이상 초록, 60~80% 노랑, 60% 미만 빨강)
const completionRateColor = computed(() => {
  if (!stats.value?.averageMetrics) return 'primary'
  const rate = stats.value.averageMetrics.completionRate
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'error'
})

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

function getServiceRankColor(index) {
  const colors = ['error', 'warning', 'success', 'info', 'primary']
  return colors[index] || 'default'
}

function getStaffRankColor(index) {
  const colors = ['error', 'warning', 'success']
  return colors[index] || 'primary'
}

onMounted(async () => {
  console.log('Dashboard page mounted')
  await dashboardStore.fetchDashboard()
  console.log('After fetch, dashboardData:', dashboardStore.dashboardData)
  console.log('Stats value:', stats.value)
})
</script>
