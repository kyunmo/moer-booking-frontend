<template>
  <div>
    <!-- 로딩 -->
    <div v-if="loading" class="text-center pa-6">
      <VProgressCircular indeterminate color="primary" />
    </div>

    <!-- SNS 계정 목록 -->
    <VList v-else lines="two">
      <template
        v-for="provider in providers"
        :key="provider.id"
      >
        <VListItem>
          <template #prepend>
            <VAvatar :color="provider.color" variant="tonal" rounded>
              <VIcon :icon="provider.icon" />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium">
            {{ provider.label }}
          </VListItemTitle>

          <VListItemSubtitle v-if="getAccount(provider.id)">
            {{ getAccount(provider.id).email }}
            <span class="text-disabled ms-2">
              ({{ formatDate(getAccount(provider.id).connectedAt) }} 연결)
            </span>
          </VListItemSubtitle>

          <VListItemSubtitle v-else class="text-disabled">
            연결되지 않음
          </VListItemSubtitle>

          <template #append>
            <VBtn
              v-if="getAccount(provider.id)"
              variant="outlined"
              color="error"
              size="small"
              :loading="disconnecting === provider.id"
              @click="confirmDisconnect(provider)"
            >
              연결 해제
            </VBtn>

            <VBtn
              v-else
              variant="outlined"
              size="small"
              @click="connectProvider(provider.id)"
            >
              연결하기
            </VBtn>
          </template>
        </VListItem>

        <VDivider />
      </template>
    </VList>

    <!-- 연결 해제 확인 다이얼로그 -->
    <VDialog v-model="disconnectDialog" max-width="400">
      <VCard>
        <VCardTitle>SNS 연결 해제</VCardTitle>

        <VDivider />

        <VCardText>
          <strong>{{ selectedProvider?.label }}</strong> 계정 연결을 해제하시겠습니까?
          <br>
          연결 해제 후에는 해당 SNS로 로그인할 수 없습니다.
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="disconnectDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            :loading="disconnecting === selectedProvider?.id"
            @click="handleDisconnect"
          >
            연결 해제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import authApi from '@/api/auth'
import { useSnackbar } from '@/composables/useSnackbar'

const { success, error: showError } = useSnackbar()

const loading = ref(false)
const disconnecting = ref(null)
const socialAccounts = ref([])
const disconnectDialog = ref(false)
const selectedProvider = ref(null)

const providers = [
  {
    id: 'google',
    label: 'Google',
    icon: 'ri-google-fill',
    color: 'error',
  },
  {
    id: 'kakao',
    label: 'Kakao',
    icon: 'ri-chat-1-fill',
    color: 'warning',
  },
  {
    id: 'naver',
    label: 'Naver',
    icon: 'ri-global-line',
    color: 'success',
  },
]

function getAccount(providerId) {
  return socialAccounts.value.find(a => a.provider.toLowerCase() === providerId.toLowerCase())
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR')
}

async function fetchSocialAccounts() {
  loading.value = true
  try {
    const { data } = await authApi.getSocialAccounts()
    socialAccounts.value = data
  }
  catch (err) {
    showError(err.message || 'SNS 계정 조회에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}

function connectProvider(providerId) {
  const OAUTH_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')

  window.location.href = `${OAUTH_BASE_URL}/oauth2/authorize/${providerId}?loginType=admin`
}

function confirmDisconnect(provider) {
  selectedProvider.value = provider
  disconnectDialog.value = true
}

async function handleDisconnect() {
  if (!selectedProvider.value) return

  disconnecting.value = selectedProvider.value.id
  try {
    await authApi.disconnectSocialAccount(selectedProvider.value.id.toUpperCase())
    success(`${selectedProvider.value.label} 계정 연결이 해제되었습니다.`)
    disconnectDialog.value = false
    await fetchSocialAccounts()
  }
  catch (err) {
    // AC006: 마지막 로그인 수단 해제 불가
    if (err.code === 'AC006') {
      showError('마지막 로그인 수단은 해제할 수 없습니다. 비밀번호를 먼저 설정해주세요.')
    }
    else {
      showError(err.message || 'SNS 연결 해제에 실패했습니다.')
    }
  }
  finally {
    disconnecting.value = null
  }
}

onMounted(() => {
  fetchSocialAccounts()
})
</script>
