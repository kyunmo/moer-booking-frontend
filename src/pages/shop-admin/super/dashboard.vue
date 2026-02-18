<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-6">
      <VCardText class="d-flex align-center">
        <div>
          <h4 class="text-h4 font-weight-medium mb-1">
            슈퍼 관리자 대시보드 🔐
          </h4>
          <p class="text-body-1 mb-0">
            시스템 전체 현황을 한눈에 확인하세요
          </p>
        </div>

        <VSpacer />

        <VBtn
          color="primary"
          prepend-icon="ri-refresh-line"
          :loading="loading"
          @click="loadDashboard"
        >
          새로고침
        </VBtn>
      </VCardText>
    </VCard>

    <!-- 전체 에러 -->
    <VAlert v-if="error" type="error" variant="tonal" class="mb-6">
      <VAlertTitle>오류</VAlertTitle>
      {{ error }}
      <template #append>
        <VBtn size="small" @click="loadDashboard">
          재시도
        </VBtn>
      </template>
    </VAlert>

    <!-- 통계 카드 -->
    <VRow class="mb-6">
      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="primary" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-store-2-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  전체 매장
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatNumber(stats?.totalBusinesses) }}
                </h4>
              </div>
            </div>
            <div class="d-flex justify-space-between text-caption">
              <span class="text-success">활성 {{ stats?.activeBusinesses || 0 }}</span>
              <span class="text-error">정지 {{ stats?.suspendedBusinesses || 0 }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="success" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-team-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  전체 사용자
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatNumber(stats?.totalUsers) }}
                </h4>
              </div>
            </div>
            <div class="d-flex justify-space-between text-caption">
              <span>OWNER {{ stats?.ownerCount || 0 }}</span>
              <span>STAFF {{ stats?.staffCount || 0 }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="info" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-calendar-event-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  오늘 예약
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatNumber(stats?.totalReservationsToday) }}건
                </h4>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="3">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="warning" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-money-dollar-circle-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  오늘 매출
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatCurrency(stats?.totalRevenueToday) }}
                </h4>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="error" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-bar-chart-box-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  이번 달 매출
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatCurrency(stats?.totalRevenueThisMonth) }}
                </h4>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="primary" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-add-circle-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  이번 달 신규 매장
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatNumber(stats?.newBusinessesThisMonth) }}
                </h4>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" sm="6" md="4">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar color="success" variant="tonal" size="48" class="me-3">
                <VIcon icon="ri-user-add-line" size="28" />
              </VAvatar>
              <div>
                <p class="text-caption mb-0">
                  이번 달 신규 사용자
                </p>
                <h4 class="text-h4 font-weight-bold">
                  {{ formatNumber(stats?.newUsersThisMonth) }}
                </h4>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 매출 랭킹 TOP 10 -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center">
            <VIcon icon="ri-trophy-line" class="me-2" />
            매출 랭킹 TOP 10
            <VSpacer />
            <VChip size="small" variant="tonal">
              최근 30일
            </VChip>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <!-- 랭킹 로딩 -->
            <div v-if="rankingLoading" class="text-center pa-6">
              <VProgressCircular indeterminate color="primary" size="32" />
            </div>

            <!-- 랭킹 에러 -->
            <VAlert v-else-if="rankingError" type="error" variant="tonal">
              {{ rankingError }}
            </VAlert>

            <!-- 랭킹 테이블 -->
            <VTable v-else-if="ranking && ranking.length > 0" class="text-no-wrap">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>매장명</th>
                  <th>사장님</th>
                  <th>총 매출</th>
                  <th>예약 건수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in ranking" :key="item.businessId">
                  <td>
                    <VAvatar
                      :color="getRankColor(item.rank)"
                      size="32"
                      variant="tonal"
                    >
                      <span class="font-weight-bold">{{ item.rank }}</span>
                    </VAvatar>
                  </td>
                  <td class="font-weight-medium">
                    {{ item.businessName }}
                  </td>
                  <td>{{ item.ownerName }}</td>
                  <td class="text-success font-weight-bold">
                    {{ formatCurrency(item.totalRevenue) }}
                  </td>
                  <td>{{ formatNumber(item.reservationCount) }}건</td>
                </tr>
              </tbody>
            </VTable>

            <!-- 데이터 없음 -->
            <VAlert v-else type="info" variant="tonal">
              매출 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- 업종별 통계 -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>
            <VIcon icon="ri-pie-chart-line" class="me-2" />
            업종별 통계
          </VCardTitle>

          <VDivider />

          <VCardText>
            <!-- 통계 로딩 -->
            <div v-if="statsLoading" class="text-center pa-6">
              <VProgressCircular indeterminate color="primary" size="32" />
            </div>

            <!-- 통계 에러 -->
            <VAlert v-else-if="statsError" type="error" variant="tonal">
              {{ statsError }}
            </VAlert>

            <!-- 통계 카드 -->
            <VRow v-else-if="typeStats && typeStats.length > 0">
              <VCol
                v-for="type in typeStats"
                :key="type.businessType"
                cols="12"
                md="4"
              >
                <VCard variant="tonal">
                  <VCardText>
                    <div class="d-flex align-center mb-3">
                      <VIcon
                        :icon="getBusinessTypeIcon(type.businessType)"
                        size="32"
                        class="me-3"
                      />
                      <div>
                        <h5 class="text-h5 mb-1">
                          {{ getBusinessTypeLabel(type.businessType) }}
                        </h5>
                        <p class="text-caption mb-0">
                          {{ type.count }}개 매장
                        </p>
                      </div>
                    </div>

                    <VDivider class="mb-3" />

                    <div class="text-center">
                      <p class="text-caption mb-1">
                        총 매출
                      </p>
                      <h4 class="text-h4 text-success">
                        {{ formatCurrency(type.totalRevenue) }}
                      </h4>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>

            <!-- 데이터 없음 -->
            <VAlert v-else type="info" variant="tonal">
              업종별 통계 데이터가 없습니다
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
import { getBusinessTypeIcon, getBusinessTypeLabel as getBusinessTypeLabelUtil } from '@/constants/businessTypes'
import { useSuperAdminStore } from '@/stores/superadmin'
import { computed, onMounted, ref } from 'vue'

const superadminStore = useSuperAdminStore()

// State
const loading = ref(false)
const error = ref(null)
const rankingLoading = ref(false)
const rankingError = ref(null)
const statsLoading = ref(false)
const statsError = ref(null)

// Computed
const stats = computed(() => superadminStore.systemStats)
const ranking = computed(() => superadminStore.businessRanking)
const typeStats = computed(() => superadminStore.statsByType)

// Methods
async function loadDashboard() {
  loading.value = true
  error.value = null

  try {
    // 시스템 통계 로드
    await loadSystemStats()

    // 매출 랭킹 및 업종별 통계는 독립적으로 로드
    loadBusinessRanking()
    loadStatsByType()
  }
  catch (err) {

    error.value = err.message || '데이터를 불러오는 중 오류가 발생했습니다.'
  }
  finally {
    loading.value = false
  }
}

async function loadSystemStats() {
  try {
    await superadminStore.fetchSystemStats()
  }
  catch (err) {

    throw err
  }
}

async function loadBusinessRanking() {
  rankingLoading.value = true
  rankingError.value = null

  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    await superadminStore.fetchBusinessRanking(startDate, endDate, 10)
  }
  catch (err) {

    rankingError.value = err.message || '매출 랭킹을 불러올 수 없습니다.'
  }
  finally {
    rankingLoading.value = false
  }
}

async function loadStatsByType() {
  statsLoading.value = true
  statsError.value = null

  try {
    await superadminStore.fetchStatsByType()
  }
  catch (err) {

    statsError.value = err.message || '업종별 통계를 불러올 수 없습니다.'
  }
  finally {
    statsLoading.value = false
  }
}

function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ko-KR').format(num)
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₩0'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

function getRankColor(rank) {
  if (rank === 1) return 'error'
  if (rank === 2) return 'warning'
  if (rank === 3) return 'success'
  return 'primary'
}

function getBusinessTypeLabel(type) {
  return getBusinessTypeLabelUtil(type)
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>
