<script setup>
import { ref, onMounted } from 'vue'
import broadcastApi from '@/api/broadcasts'
import { useSnackbar } from '@/composables/useSnackbar'

const { success: showSuccess, error: showError } = useSnackbar()

const broadcasts = ref([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)

// Create dialog
const isCreateOpen = ref(false)
const createLoading = ref(false)
const form = ref({
  title: '',
  content: '',
  targetType: 'ALL',
  priority: 'NORMAL',
})

const targetOptions = [
  { title: '전체 매장', value: 'ALL' },
  { title: '유료 구독 매장', value: 'PAID' },
  { title: '체험판 매장', value: 'TRIAL' },
  { title: '무료 플랜 매장', value: 'FREE' },
]

const priorityOptions = [
  { title: '낮음', value: 'LOW' },
  { title: '보통', value: 'NORMAL' },
  { title: '높음', value: 'HIGH' },
  { title: '긴급', value: 'URGENT' },
]

async function fetchBroadcasts() {
  loading.value = true
  try {
    const { data } = await broadcastApi.getBroadcasts({ page: page.value, size: 20 })
    broadcasts.value = Array.isArray(data) ? data : (data.items || data.content || [])
    totalPages.value = data.totalPages || Math.ceil((data.total || broadcasts.value.length) / 20)
  }
  catch {
    broadcasts.value = []
  }
  finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { title: '', content: '', targetType: 'ALL', priority: 'NORMAL' }
  isCreateOpen.value = true
}

async function submitCreate() {
  if (!form.value.title || !form.value.content) {
    showError('제목과 내용을 입력해주세요')
    return
  }
  createLoading.value = true
  try {
    await broadcastApi.createBroadcast(form.value)
    isCreateOpen.value = false
    showSuccess('공지가 발송되었습니다')
    fetchBroadcasts()
  }
  catch (err) {
    if (err.code === 'BC002') showError('이미 발송된 공지입니다')
    else if (err.code === 'BC003') showError('유효하지 않은 발송 대상입니다')
    else showError('공지 발송에 실패했습니다')
  }
  finally {
    createLoading.value = false
  }
}

function getPriorityColor(priority) {
  const map = { LOW: 'info', NORMAL: 'default', HIGH: 'warning', URGENT: 'error' }
  return map[priority] || 'default'
}

function getPriorityLabel(priority) {
  const map = { LOW: '낮음', NORMAL: '보통', HIGH: '높음', URGENT: '긴급' }
  return map[priority] || priority
}

function getTargetLabel(type) {
  const map = { ALL: '전체', PAID: '유료', TRIAL: '체험판', FREE: '무료' }
  return map[type] || type
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

onMounted(() => {
  fetchBroadcasts()
})
</script>

<template>
  <div>
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-broadcast-line" size="24" class="me-3" />
        전체 공지 방송
        <VSpacer />
        <VBtn color="primary" prepend-icon="ri-send-plane-line" @click="openCreate">
          공지 발송
        </VBtn>
      </VCardTitle>
    </VCard>

    <!-- Broadcast List -->
    <VCard>
      <div v-if="loading" class="text-center pa-10">
        <VProgressCircular indeterminate color="primary" />
      </div>

      <div v-else-if="broadcasts.length === 0" class="text-center pa-10">
        <VIcon icon="ri-broadcast-line" size="64" color="grey-lighten-1" class="mb-4" />
        <h3 class="text-h6 text-medium-emphasis">
          발송된 공지가 없습니다
        </h3>
      </div>

      <VTable v-else>
        <thead>
          <tr>
            <th>제목</th>
            <th class="text-center">
              대상
            </th>
            <th class="text-center">
              우선순위
            </th>
            <th class="text-center">
              수신 매장
            </th>
            <th class="text-center">
              발송일
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in broadcasts" :key="item.id">
            <td>
              <div class="font-weight-medium">
                {{ item.title }}
              </div>
              <div class="text-body-2 text-medium-emphasis text-truncate" style="max-inline-size: 300px;">
                {{ item.content }}
              </div>
            </td>
            <td class="text-center">
              <VChip size="small" variant="tonal">
                {{ getTargetLabel(item.targetType) }}
              </VChip>
            </td>
            <td class="text-center">
              <VChip size="small" variant="tonal" :color="getPriorityColor(item.priority)">
                {{ getPriorityLabel(item.priority) }}
              </VChip>
            </td>
            <td class="text-center">
              <strong>{{ item.recipientCount || 0 }}</strong>개
            </td>
            <td class="text-center text-body-2">
              {{ formatDate(item.sentAt || item.createdAt) }}
            </td>
          </tr>
        </tbody>
      </VTable>

      <div v-if="totalPages > 1" class="d-flex justify-center pa-4">
        <VPagination v-model="page" :length="totalPages" :total-visible="5" />
      </div>
    </VCard>

    <!-- Create Dialog -->
    <VDialog v-model="isCreateOpen" max-width="600" persistent>
      <VCard>
        <VCardTitle>
          <VIcon icon="ri-send-plane-line" class="me-2" />
          공지 발송
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="form.title"
            label="공지 제목"
            class="mb-4"
            counter="200"
            :rules="[v => !!v || '제목을 입력하세요', v => !v || v.length <= 200 || '최대 200자']"
          />

          <VTextarea
            v-model="form.content"
            label="공지 내용"
            rows="5"
            class="mb-4"
          />

          <VRow>
            <VCol cols="6">
              <VSelect
                v-model="form.targetType"
                :items="targetOptions"
                item-title="title"
                item-value="value"
                label="발송 대상"
              />
            </VCol>
            <VCol cols="6">
              <VSelect
                v-model="form.priority"
                :items="priorityOptions"
                item-title="title"
                item-value="value"
                label="우선순위"
              />
            </VCol>
          </VRow>

          <VAlert v-if="form.priority === 'URGENT'" type="warning" variant="tonal" density="compact" class="mt-2">
            긴급 공지는 모든 대상 매장에 즉시 팝업으로 표시됩니다.
          </VAlert>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="isCreateOpen = false">
            취소
          </VBtn>
          <VBtn
            color="primary"
            :loading="createLoading"
            :disabled="!form.title || !form.content"
            @click="submitCreate"
          >
            발송
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
