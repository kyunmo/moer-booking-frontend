<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex align-center">
          <div>
            <h4 class="text-h4 font-weight-medium mb-1">
              감사 로그
            </h4>
            <p class="text-body-2 mb-0">
              중요 액션의 이력을 조회할 수 있습니다
            </p>
          </div>

          <VSpacer />

          <VBtn
            color="primary"
            prepend-icon="ri-refresh-line"
            @click="loadLogs"
          >
            새로고침
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- 필터 -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="3">
            <VSelect
              v-model="filters.action"
              label="액션 타입"
              :items="actionTypes"
              clearable
            />
          </VCol>

          <VCol cols="12" md="3">
            <VSelect
              v-model="filters.entityType"
              label="대상 타입"
              :items="entityTypes"
              clearable
            />
          </VCol>

          <VCol cols="12" md="2">
            <VTextField
              v-model="filters.startDate"
              label="시작일"
              type="date"
            />
          </VCol>

          <VCol cols="12" md="2">
            <VTextField
              v-model="filters.endDate"
              label="종료일"
              type="date"
            />
          </VCol>

          <VCol cols="12" md="2">
            <VBtn
              block
              color="primary"
              @click="handleSearch"
            >
              검색
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- 로그 목록 -->
    <VCard>
      <VCardTitle>
        감사 로그 ({{ pagination.totalElements }}건)
      </VCardTitle>

      <VDivider />

      <!-- 로딩 -->
      <div v-if="loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <!-- 에러 -->
      <VAlert v-else-if="error" type="error" variant="tonal" class="ma-4">
        {{ error }}
      </VAlert>

      <!-- 테이블 -->
      <VTable v-else class="text-no-wrap">
        <thead>
          <tr>
            <th>ID</th>
            <th>시간</th>
            <th>사용자</th>
            <th>역할</th>
            <th>액션</th>
            <th>대상</th>
            <th>설명</th>
            <th class="text-center">상세</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="8" class="text-center pa-6">
              로그가 없습니다
            </td>
          </tr>

          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.id }}</td>

            <td>{{ formatDateTime(log.createdAt) }}</td>

            <td>{{ log.userEmail }}</td>

            <td>
              <VChip
                :color="getRoleColor(log.userRole)"
                size="small"
                variant="tonal"
              >
                {{ getRoleLabel(log.userRole) }}
              </VChip>
            </td>

            <td>
              <VChip
                :color="getActionColor(log.action)"
                size="small"
                variant="tonal"
              >
                {{ getActionLabel(log.action) }}
              </VChip>
            </td>

            <td>
              <span class="text-caption">{{ log.entityType }}</span>
              <span class="text-body-2 ms-1">#{{ log.entityId }}</span>
            </td>

            <td class="text-truncate" style="max-width: 300px">
              {{ log.description }}
            </td>

            <td class="text-center">
              <VBtn
                icon
                variant="text"
                size="small"
                @click="showDetail(log)"
              >
                <VIcon icon="ri-eye-line" />
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>

      <!-- 페이지네이션 -->
      <VCardText v-if="pagination.totalPages > 1">
        <VPagination
          v-model="currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          @update:model-value="handlePageChange"
        />
      </VCardText>
    </VCard>

    <!-- 상세 다이얼로그 -->
    <VDialog v-model="detailDialog" max-width="700">
      <VCard v-if="selectedLog">
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-file-list-line" class="me-2" />
          감사 로그 상세
          <VSpacer />
          <VBtn
            icon
            variant="text"
            size="small"
            @click="detailDialog = false"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <h6 class="text-h6 mb-3">기본 정보</h6>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">로그 ID</div>
              <div class="text-body-1">{{ selectedLog.id }}</div>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">시간</div>
              <div class="text-body-1">{{ formatDateTime(selectedLog.createdAt) }}</div>
            </VCol>

            <VCol cols="12">
              <VDivider class="my-3" />
              <h6 class="text-h6 mb-3">수행자 정보</h6>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">사용자 ID</div>
              <div class="text-body-1">{{ selectedLog.userId }}</div>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">이메일</div>
              <div class="text-body-1">{{ selectedLog.userEmail }}</div>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">역할</div>
              <div>
                <VChip
                  :color="getRoleColor(selectedLog.userRole)"
                  size="small"
                  variant="tonal"
                >
                  {{ getRoleLabel(selectedLog.userRole) }}
                </VChip>
              </div>
            </VCol>

            <VCol cols="12">
              <VDivider class="my-3" />
              <h6 class="text-h6 mb-3">액션 정보</h6>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">액션</div>
              <div>
                <VChip
                  :color="getActionColor(selectedLog.action)"
                  size="small"
                  variant="tonal"
                >
                  {{ getActionLabel(selectedLog.action) }}
                </VChip>
              </div>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">대상</div>
              <div class="text-body-1">
                {{ selectedLog.entityType }} #{{ selectedLog.entityId }}
              </div>
            </VCol>

            <VCol cols="12">
              <div class="text-caption text-medium-emphasis mb-1">설명</div>
              <div class="text-body-1">{{ selectedLog.description }}</div>
            </VCol>

            <VCol v-if="selectedLog.metadata" cols="12">
              <VDivider class="my-3" />
              <h6 class="text-h6 mb-3">변경 내역</h6>
              <VCard variant="tonal">
                <VCardText>
                  <pre class="text-caption">{{ formatMetadata(selectedLog.metadata) }}</pre>
                </VCardText>
              </VCard>
            </VCol>

            <VCol cols="12">
              <VDivider class="my-3" />
              <h6 class="text-h6 mb-3">요청 정보</h6>
            </VCol>

            <VCol cols="6">
              <div class="text-caption text-medium-emphasis mb-1">IP 주소</div>
              <div class="text-body-1">{{ selectedLog.ipAddress || '-' }}</div>
            </VCol>

            <VCol cols="12">
              <div class="text-caption text-medium-emphasis mb-1">User Agent</div>
              <div class="text-caption">{{ selectedLog.userAgent || '-' }}</div>
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn @click="detailDialog = false">
            닫기
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useSuperAdminStore } from '@/stores/superadmin'
import { computed, onMounted, ref } from 'vue'

const superadminStore = useSuperAdminStore()

// State
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)

const filters = ref({
  action: null,
  entityType: null,
  startDate: '',
  endDate: '',
})

// 상세 다이얼로그
const detailDialog = ref(false)
const selectedLog = ref(null)

// Options
const actionTypes = [
  { title: '매장 생성', value: 'BUSINESS_CREATED' },
  { title: '매장 수정', value: 'BUSINESS_UPDATED' },
  { title: '매장 삭제', value: 'BUSINESS_DELETED' },
  { title: '매장 상태 변경', value: 'BUSINESS_STATUS_CHANGED' },
  { title: '사용자 생성', value: 'USER_CREATED' },
  { title: '사용자 역할 변경', value: 'USER_ROLE_CHANGED' },
  { title: '사용자 상태 변경', value: 'USER_STATUS_CHANGED' },
  { title: '사용자 삭제', value: 'USER_DELETED' },
  { title: '시스템 백업', value: 'SYSTEM_BACKUP' },
  { title: '시스템 복원', value: 'SYSTEM_RESTORE' },
  { title: '시스템 설정 변경', value: 'SYSTEM_CONFIG_CHANGED' },
]

const entityTypes = [
  { title: '매장', value: 'Business' },
  { title: '사용자', value: 'User' },
  { title: '예약', value: 'Reservation' },
  { title: '고객', value: 'Customer' },
]

// Computed
const logs = computed(() => superadminStore.auditLogs)
const pagination = computed(() => superadminStore.auditLogPagination)

// Methods
async function loadLogs() {
  loading.value = true
  error.value = null

  try {
    const result = await superadminStore.fetchAuditLogs({
      page: currentPage.value,
      size: 20,
      ...filters.value,
    })

  }
  catch (err) {
    error.value = err.message || '감사 로그를 불러오는데 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  loadLogs()
}

function handlePageChange(page) {
  currentPage.value = page
  loadLogs()
}

function showDetail(log) {
  selectedLog.value = log
  detailDialog.value = true
}

function formatDateTime(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR')
}

function formatMetadata(metadata) {
  if (!metadata) return 'N/A'
  return JSON.stringify(metadata, null, 2)
}

function getRoleLabel(role) {
  const labels = {
    SUPER_ADMIN: '슈퍼 관리자',
    ADMIN: '시스템 관리자',
    OWNER: '매장 사장님',
    STAFF: '직원',
  }
  return labels[role] || role
}

function getRoleColor(role) {
  const colors = {
    SUPER_ADMIN: 'error',
    ADMIN: 'warning',
    OWNER: 'primary',
    STAFF: 'info',
  }
  return colors[role] || 'default'
}

function getActionLabel(action) {
  const actionType = actionTypes.find(a => a.value === action)
  return actionType?.title || action
}

function getActionColor(action) {
  if (action.includes('DELETE')) return 'error'
  if (action.includes('CREATED')) return 'success'
  if (action.includes('UPDATED') || action.includes('CHANGED')) return 'warning'
  return 'info'
}

// Lifecycle
onMounted(() => {
  // 기본 필터: 최근 7일
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  filters.value.endDate = today.toISOString().split('T')[0]
  filters.value.startDate = weekAgo.toISOString().split('T')[0]

  loadLogs()
})
</script>
