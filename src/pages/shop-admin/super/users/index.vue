<template>
  <div>
    <!-- 헤더 -->
    <VCard class="mb-6">
      <VCardText>
        <div class="d-flex align-center">
          <div>
            <h4 class="text-h4 font-weight-medium mb-1">
              사용자 관리
            </h4>
            <p class="text-body-2 mb-0">
              전체 사용자의 역할 변경, 정지, 삭제를 수행할 수 있습니다
            </p>
          </div>

          <VSpacer />

          <VBtn
            color="primary"
            prepend-icon="ri-refresh-line"
            @click="loadUsers"
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
          <VCol cols="12" md="4">
            <VTextField
              v-model="filters.keyword"
              label="검색"
              placeholder="이름 또는 이메일 검색"
              prepend-inner-icon="ri-search-line"
              clearable
              @keyup.enter="handleSearch"
            />
          </VCol>

          <VCol cols="12" md="3">
            <VSelect
              v-model="filters.role"
              label="역할"
              :items="roleOptions"
              clearable
            />
          </VCol>

          <VCol cols="12" md="3">
            <VSelect
              v-model="filters.status"
              label="상태"
              :items="statusOptions"
              clearable
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

    <!-- 사용자 목록 -->
    <VCard>
      <VCardTitle>
        사용자 목록 ({{ pagination.totalElements }}명)
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
            <th>이메일</th>
            <th>이름</th>
            <th>역할</th>
            <th>상태</th>
            <th>매장 ID</th>
            <th>생성일</th>
            <th class="text-center">액션</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="8" class="text-center pa-6">
              사용자가 없습니다
            </td>
          </tr>

          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>

            <td class="font-weight-medium">
              {{ user.email }}
            </td>

            <td>{{ user.name }}</td>

            <td>
              <VChip
                :color="getRoleColor(user.role)"
                size="small"
                variant="tonal"
              >
                {{ getRoleLabel(user.role) }}
              </VChip>
            </td>

            <td>
              <VChip
                :color="getStatusColor(user.status)"
                size="small"
                variant="tonal"
              >
                {{ getStatusLabel(user.status) }}
              </VChip>
            </td>

            <td>{{ user.businessId || '-' }}</td>

            <td>{{ formatDate(user.createdAt) }}</td>

            <td class="text-center">
              <VMenu>
                <template #activator="{ props }">
                  <VBtn
                    icon
                    variant="text"
                    size="small"
                    v-bind="props"
                  >
                    <VIcon icon="ri-more-2-fill" />
                  </VBtn>
                </template>

                <VList>
                  <VListItem
                    :disabled="user.role === 'SUPER_ADMIN'"
                    @click="handleRoleChange(user)"
                  >
                    <template #prepend>
                      <VIcon icon="ri-user-settings-line" />
                    </template>
                    <VListItemTitle>역할 변경</VListItemTitle>
                  </VListItem>

                  <VListItem
                    v-if="user.status === 'ACTIVE'"
                    :disabled="user.role === 'SUPER_ADMIN'"
                    @click="handleSuspend(user)"
                  >
                    <template #prepend>
                      <VIcon icon="ri-pause-line" />
                    </template>
                    <VListItemTitle>사용자 정지</VListItemTitle>
                  </VListItem>

                  <VListItem
                    v-else-if="user.status === 'SUSPENDED'"
                    @click="handleActivate(user)"
                  >
                    <template #prepend>
                      <VIcon icon="ri-play-line" />
                    </template>
                    <VListItemTitle>사용자 활성화</VListItemTitle>
                  </VListItem>

                  <VDivider />

                  <VListItem
                    :disabled="user.role === 'SUPER_ADMIN'"
                    @click="handleDelete(user)"
                  >
                    <template #prepend>
                      <VIcon icon="ri-delete-bin-line" color="error" />
                    </template>
                    <VListItemTitle class="text-error">
                      사용자 삭제
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
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

    <!-- 역할 변경 다이얼로그 -->
    <VDialog v-model="roleDialog" max-width="400">
      <VCard>
        <VCardTitle>역할 변경</VCardTitle>

        <VCardText>
          <p class="mb-4">
            <strong>{{ roleTarget?.name }}</strong>님의 역할을 변경합니다.
          </p>

          <VSelect
            v-model="newRole"
            label="새 역할"
            :items="roleOptions"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn @click="roleDialog = false">
            취소
          </VBtn>
          <VBtn
            color="primary"
            :disabled="!newRole"
            @click="confirmRoleChange"
          >
            변경
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h5">
          사용자 삭제
        </VCardTitle>

        <VCardText>
          <VAlert type="error" variant="tonal" class="mb-4">
            <VAlertTitle>복구 불가능</VAlertTitle>
            사용자가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </VAlert>

          <p class="mb-4">
            <strong>{{ deleteTarget?.name }}</strong> 사용자를 삭제하시겠습니까?
          </p>

          <VTextField
            v-model="deleteConfirmText"
            label="'DELETE'를 입력하세요"
            placeholder="DELETE"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn @click="deleteDialog = false">
            취소
          </VBtn>
          <VBtn
            color="error"
            :disabled="deleteConfirmText !== 'DELETE'"
            @click="confirmDelete"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { useSuperAdminStore } from '@/stores/superadmin'
import { useSnackbar } from '@/composables/useSnackbar'
import { computed, onMounted, ref } from 'vue'

const superadminStore = useSuperAdminStore()
const { success, error: showError, warning } = useSnackbar()

// State
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)

const filters = ref({
  keyword: '',
  role: null,
  status: null,
})

// 역할 변경 다이얼로그
const roleDialog = ref(false)
const roleTarget = ref(null)
const newRole = ref(null)

// 삭제 다이얼로그
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const deleteConfirmText = ref('')

// Options
const roleOptions = [
  { title: '슈퍼 관리자', value: 'SUPER_ADMIN' },
  { title: '시스템 관리자', value: 'ADMIN' },
  { title: '매장 사장님', value: 'OWNER' },
  { title: '직원', value: 'STAFF' },
]

const statusOptions = [
  { title: '활성', value: 'ACTIVE' },
  { title: '비활성', value: 'INACTIVE' },
  { title: '정지', value: 'SUSPENDED' },
]

// Computed
const users = computed(() => superadminStore.users)
const pagination = computed(() => superadminStore.userPagination)

// Methods
async function loadUsers() {
  loading.value = true
  error.value = null

  try {
    await superadminStore.fetchUsers({
      page: currentPage.value,
      size: 20,
      ...filters.value,
    })
  }
  catch (err) {

    error.value = err.message
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  loadUsers()
}

function handlePageChange(page) {
  currentPage.value = page
  loadUsers()
}

function handleRoleChange(user) {
  if (user.role === 'SUPER_ADMIN') {
    warning('슈퍼 관리자의 역할은 변경할 수 없습니다.')
    return
  }

  roleTarget.value = user
  newRole.value = user.role
  roleDialog.value = true
}

async function confirmRoleChange() {
  try {
    await superadminStore.changeUserRole(roleTarget.value.id, newRole.value)
    success('역할이 변경되었습니다.')
    roleDialog.value = false
    loadUsers()
  }
  catch (err) {

    showError(err.message)
  }
}

async function handleSuspend(user) {
  if (user.role === 'SUPER_ADMIN') {
    warning('슈퍼 관리자는 정지할 수 없습니다.')
    return
  }

  try {
    await superadminStore.suspendUser(user.id)
    success('사용자가 정지되었습니다.')
    loadUsers()
  }
  catch (err) {

    showError(err.message)
  }
}

async function handleActivate(user) {
  try {
    await superadminStore.activateUser(user.id)
    success('사용자가 활성화되었습니다.')
    loadUsers()
  }
  catch (err) {

    showError(err.message)
  }
}

function handleDelete(user) {
  if (user.role === 'SUPER_ADMIN') {
    warning('슈퍼 관리자는 삭제할 수 없습니다.')
    return
  }

  deleteTarget.value = user
  deleteConfirmText.value = ''
  deleteDialog.value = true
}

async function confirmDelete() {
  if (deleteConfirmText.value !== 'DELETE') {
    return
  }

  try {
    await superadminStore.deleteUser(deleteTarget.value.id)
    success('사용자가 삭제되었습니다.')
    deleteDialog.value = false
    loadUsers()
  }
  catch (err) {

    showError(err.message)
  }
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

function getStatusLabel(status) {
  const labels = {
    ACTIVE: '활성',
    INACTIVE: '비활성',
    SUSPENDED: '정지',
  }
  return labels[status] || status
}

function getStatusColor(status) {
  const colors = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
  }
  return colors[status] || 'default'
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>
