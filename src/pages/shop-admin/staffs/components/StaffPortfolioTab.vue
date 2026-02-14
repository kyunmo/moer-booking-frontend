<template>
  <div>
    <!-- 로딩 -->
    <div v-if="loading" class="text-center pa-6">
      <VProgressCircular indeterminate color="primary" />
      <p class="text-sm mt-2">포트폴리오를 불러오는 중...</p>
    </div>

    <template v-else>
      <VRow>
        <!-- 포트폴리오 아이템들 -->
        <VCol
          v-for="item in portfolios"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
        >
          <VCard variant="outlined" class="portfolio-card">
            <VImg
              :src="getImageUrl(item.imageUrl)"
              height="200"
              cover
              class="bg-grey-lighten-3"
            >
              <template #error>
                <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                  <VIcon icon="ri-image-line" size="48" color="grey" />
                </div>
              </template>
            </VImg>

            <VCardText class="pb-2">
              <h6 class="text-subtitle-1 font-weight-bold mb-1 text-truncate">
                {{ item.title || '(제목 없음)' }}
              </h6>

              <VChip
                v-if="item.serviceCategory"
                size="x-small"
                color="info"
                variant="tonal"
                class="mb-1"
              >
                {{ item.serviceCategory }}
              </VChip>

              <p
                v-if="item.description"
                class="text-sm text-medium-emphasis mb-0 mt-1"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
              >
                {{ item.description }}
              </p>
            </VCardText>

            <VCardActions class="pt-0">
              <VSpacer />
              <VBtn
                icon
                size="small"
                color="error"
                variant="text"
                @click="confirmDeletePortfolio(item)"
              >
                <VIcon icon="ri-delete-bin-line" />
                <VTooltip activator="parent" location="top">
                  삭제
                </VTooltip>
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>

        <!-- 추가 버튼 카드 -->
        <VCol cols="12" sm="6" md="4">
          <VCard
            variant="outlined"
            class="portfolio-add-card d-flex align-center justify-center"
            style="min-block-size: 280px; cursor: pointer; border-style: dashed;"
            @click="openAddDialog"
          >
            <div class="text-center pa-4">
              <VIcon
                icon="ri-add-circle-line"
                size="48"
                color="primary"
                class="mb-2"
              />
              <p class="text-sm text-medium-emphasis mb-0">
                포트폴리오 추가
              </p>
            </div>
          </VCard>
        </VCol>
      </VRow>

      <!-- 데이터 없음 안내 (포트폴리오가 없을 때) -->
      <div
        v-if="portfolios.length === 0"
        class="text-center pa-4"
      >
        <p class="text-sm text-medium-emphasis">
          아직 등록된 포트폴리오가 없습니다. 위의 "+" 카드를 클릭하여 추가하세요.
        </p>
      </div>
    </template>

    <!-- 포트폴리오 추가 다이얼로그 -->
    <VDialog v-model="addDialog" max-width="500" persistent>
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon icon="ri-image-add-line" class="me-2" />
          <span>포트폴리오 추가</span>
          <VSpacer />
          <VBtn
            icon
            variant="text"
            size="small"
            @click="closeAddDialog"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VRow>
            <!-- 이미지 선택 -->
            <VCol cols="12">
              <VFileInput
                v-model="addForm.file"
                label="이미지 선택 *"
                accept="image/*"
                prepend-icon="ri-image-line"
                :rules="[v => !!v || '이미지를 선택하세요']"
                show-size
              />
            </VCol>

            <!-- 이미지 미리보기 -->
            <VCol v-if="previewUrl" cols="12">
              <VImg
                :src="previewUrl"
                max-height="200"
                class="rounded border"
              />
            </VCol>

            <!-- 제목 -->
            <VCol cols="12">
              <VTextField
                v-model="addForm.title"
                label="제목"
                placeholder="작업 제목을 입력하세요"
                prepend-inner-icon="ri-text"
              />
            </VCol>

            <!-- 서비스 카테고리 -->
            <VCol cols="12">
              <VTextField
                v-model="addForm.serviceCategory"
                label="서비스 카테고리"
                placeholder="예: 커트, 염색, 펌"
                prepend-inner-icon="ri-price-tag-3-line"
              />
            </VCol>

            <!-- 설명 -->
            <VCol cols="12">
              <VTextarea
                v-model="addForm.description"
                label="설명"
                placeholder="작업에 대한 설명을 입력하세요"
                prepend-inner-icon="ri-file-text-line"
                rows="3"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="closeAddDialog"
          >
            취소
          </VBtn>
          <VBtn
            color="primary"
            :loading="addLoading"
            :disabled="!addForm.file"
            @click="submitPortfolio"
          >
            추가
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- 삭제 확인 다이얼로그 -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard>
        <VCardTitle>포트폴리오 삭제</VCardTitle>
        <VCardText>
          <p class="mb-0">
            <strong>{{ portfolioToDelete?.title || '이 포트폴리오' }}</strong> 항목을 삭제하시겠습니까?
          </p>
          <p class="text-error text-sm mt-2">
            삭제된 포트폴리오는 복구할 수 없습니다.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="deleteDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            :loading="deleteLoading"
            @click="deletePortfolio"
          >
            삭제
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import staffApi from '@/api/staffs'
import { useSnackbar } from '@/composables/useSnackbar'
import { getImageUrl } from '@/utils/image'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})

const authStore = useAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

const loading = ref(false)
const portfolios = ref([])

// 추가 다이얼로그
const addDialog = ref(false)
const addLoading = ref(false)
const addForm = ref({
  file: null,
  title: '',
  description: '',
  serviceCategory: '',
})

// 삭제 다이얼로그
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const portfolioToDelete = ref(null)

// 이미지 미리보기
const previewUrl = computed(() => {
  if (!addForm.value.file) return null
  return URL.createObjectURL(addForm.value.file)
})

// 포트폴리오 로드
async function loadPortfolios() {
  loading.value = true
  try {
    const response = await staffApi.getPortfolios(authStore.businessId, props.staffId)
    portfolios.value = response.data || []
  }
  catch (error) {
    console.error('포트폴리오 조회 실패:', error)
    showError('포트폴리오를 불러오는데 실패했습니다.')
    portfolios.value = []
  }
  finally {
    loading.value = false
  }
}

// 추가 다이얼로그 열기
function openAddDialog() {
  addForm.value = {
    file: null,
    title: '',
    description: '',
    serviceCategory: '',
  }
  addDialog.value = true
}

// 추가 다이얼로그 닫기
function closeAddDialog() {
  addForm.value = {
    file: null,
    title: '',
    description: '',
    serviceCategory: '',
  }
  addDialog.value = false
}

// 포트폴리오 제출
async function submitPortfolio() {
  if (!addForm.value.file) return

  addLoading.value = true
  try {
    const response = await staffApi.addPortfolio(
      authStore.businessId,
      props.staffId,
      addForm.value.file,
      {
        title: addForm.value.title || null,
        description: addForm.value.description || null,
        serviceCategory: addForm.value.serviceCategory || null,
      },
    )

    // 목록에 추가
    if (response.data) {
      portfolios.value.push(response.data)
    }
    else {
      // 응답에 데이터가 없으면 전체 다시 로드
      await loadPortfolios()
    }

    showSuccess('포트폴리오가 추가되었습니다.')
    closeAddDialog()
  }
  catch (error) {
    console.error('포트폴리오 추가 실패:', error)
    showError('포트폴리오 추가에 실패했습니다.')
  }
  finally {
    addLoading.value = false
  }
}

// 삭제 확인
function confirmDeletePortfolio(item) {
  portfolioToDelete.value = item
  deleteDialog.value = true
}

// 포트폴리오 삭제
async function deletePortfolio() {
  if (!portfolioToDelete.value) return

  deleteLoading.value = true
  try {
    await staffApi.deletePortfolio(
      authStore.businessId,
      props.staffId,
      portfolioToDelete.value.id,
    )

    portfolios.value = portfolios.value.filter(p => p.id !== portfolioToDelete.value.id)
    showSuccess('포트폴리오가 삭제되었습니다.')
    deleteDialog.value = false
    portfolioToDelete.value = null
  }
  catch (error) {
    console.error('포트폴리오 삭제 실패:', error)
    showError('포트폴리오 삭제에 실패했습니다.')
  }
  finally {
    deleteLoading.value = false
  }
}

// staffId 변경 시 다시 로드
watch(() => props.staffId, newId => {
  if (newId) {
    loadPortfolios()
  }
})

onMounted(() => {
  if (props.staffId) {
    loadPortfolios()
  }
})
</script>

<style scoped>
.portfolio-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.portfolio-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 10%);
  transform: translateY(-2px);
}

.portfolio-add-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
