<script setup>
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSuperAdminStore } from '@/stores/superadmin'
import { useSnackbar } from '@/composables/useSnackbar'

const authStore = useAuthStore()
const superAdminStore = useSuperAdminStore()
const router = useRouter()
const { success, error } = useSnackbar()

// 선택된 매장
const selectedBusiness = ref(null)

// 매장 목록
const businesses = computed(() => superAdminStore.businesses)
const loading = computed(() => superAdminStore.loading)

// 컴포넌트 마운트 시 매장 목록 로드
onMounted(async () => {
  try {
    // 새로고침 직후인지 확인 (무한 루프 방지)
    const justRefreshed = sessionStorage.getItem('businessSelectorRefreshed')
    if (justRefreshed) {
      sessionStorage.removeItem('businessSelectorRefreshed')
      // 새로고침 직후: 자동 새로고침 방지
    }

    // 매장 목록 로드 (페이지 번호는 1부터 시작)
    await superAdminStore.fetchBusinesses({ page: 1, size: 100 })

    // 이미 선택된 매장이 있으면 복원
    if (authStore.selectedBusiness) {
      selectedBusiness.value = authStore.selectedBusiness
    }
  } catch (err) {
    error('매장 목록을 불러오는데 실패했습니다.')
  }
})

// 매장 변경 핸들러 (사용자가 직접 선택할 때만 실행)
function handleBusinessChange(business) {
  // 이전 선택과 동일하면 무시
  if (business?.id === authStore.selectedBusiness?.id) {
    return
  }

  if (business) {
    // Auth store에 선택된 매장 저장
    authStore.selectBusinessForSuperAdmin(business)
    success(`${business.name} 매장으로 전환했습니다.`)

    // 일반 메뉴 페이지라면 새로고침
    const currentRoute = router.currentRoute.value
    if (!currentRoute.path.startsWith('/superadmin')) {
      // 새로고침 플래그 설정 (무한 루프 방지)
      sessionStorage.setItem('businessSelectorRefreshed', 'true')

      // 페이지 새로고침으로 깨끗한 상태에서 시작
      setTimeout(() => {
        router.go(0)
      }, 500)
    }
  } else {
    // 매장 선택 해제
    authStore.clearSelectedBusiness()
  }
}
</script>

<template>
  <div class="business-selector">
    <VSelect
      v-model="selectedBusiness"
      :items="businesses"
      :loading="loading"
      item-title="name"
      item-value="id"
      return-object
      prepend-inner-icon="ri-store-2-line"
      placeholder="매장을 선택하세요"
      density="compact"
      variant="outlined"
      clearable
      hide-details
      @update:model-value="handleBusinessChange"
    >
      <template #item="{ props, item }">
        <VListItem
          v-bind="props"
          :title="item.raw.name"
          :subtitle="item.raw.businessType"
        >
          <template #prepend>
            <VIcon icon="ri-store-2-line" size="20" />
          </template>
        </VListItem>
      </template>
    </VSelect>
  </div>
</template>

<style scoped>
.business-selector {
  width: 100%;
}
</style>
