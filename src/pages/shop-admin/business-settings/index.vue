<template>
  <div>
    <!-- 매장 기본 정보 -->
    <VCard id="settings-basic-info" class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-store-2-line" size="24" class="me-3" />
        <span>매장 기본 정보</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VAlert
          color="info"
          variant="tonal"
          class="mb-4"
        >
          <VIcon icon="ri-information-line" class="me-2" />
          매장의 기본 정보를 설정하세요.
        </VAlert>

        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 매장명 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3">매장 정보</h6>
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="매장명 *"
                prepend-inner-icon="ri-store-2-line"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VSelect
                v-model="form.businessType"
                label="업종 *"
                prepend-inner-icon="ri-building-line"
                :items="businessTypeOptions"
                :rules="[required]"
                required
              />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="매장 전화번호 *"
                prepend-inner-icon="ri-phone-line"
                placeholder="02-1234-5678"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 주소 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3 mt-4">주소</h6>
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="form.address"
                label="주소"
                prepend-inner-icon="ri-map-pin-line"
                placeholder="서울특별시 강남구 테헤란로 123"
              />
            </VCol>

            <!-- 소개 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3 mt-4">매장 소개</h6>
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="form.description"
                label="매장 소개"
                placeholder="고객에게 보여질 매장 소개글을 작성하세요"
                rows="4"
                counter
                maxlength="500"
              />
            </VCol>

            <!-- 목표 설정 -->
            <VCol id="settings-goals" cols="12">
              <VDivider class="my-4" />
              <h6 class="text-h6 mb-3 mt-4">
                <VIcon icon="ri-target-line" class="me-2" />
                목표 설정
              </h6>
              <VAlert
                color="info"
                variant="tonal"
                class="mb-4"
              >
                <VIcon icon="ri-information-line" class="me-2" />
                매출 및 고객 목표를 설정하면 대시보드에서 달성률을 확인할 수 있습니다.
              </VAlert>
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                v-model.number="form.dailyRevenueGoal"
                label="일일 매출 목표"
                prepend-inner-icon="ri-money-dollar-circle-line"
                suffix="원"
                type="number"
                placeholder="500000"
                hint="하루 목표 매출액을 입력하세요"
              />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                v-model.number="form.monthlyRevenueGoal"
                label="월간 매출 목표"
                prepend-inner-icon="ri-calendar-check-line"
                suffix="원"
                type="number"
                placeholder="15000000"
                hint="한 달 목표 매출액을 입력하세요"
              />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                v-model.number="form.monthlyNewCustomerGoal"
                label="월간 신규 고객 목표"
                prepend-inner-icon="ri-user-add-line"
                suffix="명"
                type="number"
                placeholder="50"
                hint="한 달 목표 신규 고객 수를 입력하세요"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          color="secondary"
          variant="outlined"
          @click="resetForm"
        >
          초기화
        </VBtn>

        <VBtn
          color="primary"
          :loading="settingsStore.loading"
          @click="handleSubmit"
        >
          저장
        </VBtn>
      </VCardActions>
    </VCard>

    <!-- 가이드 투어 설정 -->
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-compass-discover-line" size="24" class="me-3" />
        <span>가이드 투어</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <p class="text-body-1 mb-1">
              완료한 투어를 초기화하면 다시 가이드를 볼 수 있습니다.
            </p>
            <p class="text-body-2 text-disabled">
              완료된 투어: {{ completedTourCount }} / {{ totalTourCount }}개
            </p>
          </div>

          <VBtn
            variant="outlined"
            color="warning"
            prepend-icon="ri-refresh-line"
            :disabled="completedTourCount === 0"
            @click="handleResetAllTours"
          >
            모든 투어 초기화
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <!-- 예약 페이지 주소 설정 -->
    <VCard id="settings-booking-url">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-link" size="24" class="me-3" />
        <span>예약 페이지 주소</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VAlert
          color="info"
          variant="tonal"
          class="mb-4"
        >
          <VIcon icon="ri-information-line" class="me-2" />
          고객이 접속할 예약 페이지의 주소를 설정하세요. 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.
        </VAlert>

        <!-- 현재 예약 URL -->
        <div v-if="currentSlug" class="mb-4">
          <div class="text-subtitle-2 mb-1">현재 예약 URL</div>
          <div class="d-flex align-center ga-2">
            <VTextField
              :model-value="bookingUrl"
              readonly
              density="compact"
              variant="outlined"
              prepend-inner-icon="ri-global-line"
              class="flex-grow-1"
            />
            <VBtn
              icon
              variant="tonal"
              color="primary"
              size="small"
              @click="copyBookingUrl"
            >
              <VIcon icon="ri-file-copy-line" />
              <VTooltip activator="parent">URL 복사</VTooltip>
            </VBtn>
          </div>
        </div>

        <VDivider v-if="currentSlug" class="mb-4" />

        <!-- 예약 주소 변경 -->
        <VRow>
          <VCol cols="12" md="8">
            <VTextField
              v-model="slugForm.slug"
              label="예약 링크 이름"
              prepend-inner-icon="ri-link"
              placeholder="my-business"
              hint="3~50자, 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다. 예: my-nail-shop"
              persistent-hint
              :rules="[slugRequired, slugFormat]"
              :error-messages="slugError"
              :loading="slugChecking"
              @update:model-value="debouncedCheckSlug"
            />
          </VCol>
          <VCol cols="12" md="4" class="d-flex align-start">
            <VChip
              v-if="slugAvailable === true"
              color="success"
              variant="tonal"
              prepend-icon="ri-check-line"
              class="mt-2"
            >
              사용 가능
            </VChip>
            <VChip
              v-else-if="slugAvailable === false"
              color="error"
              variant="tonal"
              prepend-icon="ri-close-line"
              class="mt-2"
            >
              사용 불가
            </VChip>
          </VCol>
        </VRow>

        <!-- 추천 주소 -->
        <div v-if="slugSuggestions?.length" class="mt-2">
          <span class="text-body-2 text-medium-emphasis">추천 주소: </span>
          <VChip
            v-for="suggestion in slugSuggestions"
            :key="suggestion"
            size="small"
            variant="outlined"
            class="me-1 cursor-pointer"
            @click="slugForm.slug = suggestion; checkSlugAvailability()"
          >
            {{ suggestion }}
          </VChip>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          color="primary"
          :loading="slugSaving"
          :disabled="!slugAvailable || !slugForm.slug"
          @click="handleSlugSubmit"
        >
          주소 변경
        </VBtn>
      </VCardActions>
    </VCard>
  </div>
</template>

<script setup>
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { useSnackbar } from '@/composables/useSnackbar'
import { useTour } from '@/composables/useTour'
import { BUSINESS_TYPES, BUSINESS_TYPE_OPTIONS } from '@/constants/businessTypes'
import publicBookingApi from '@/api/public-booking'
import apiClient from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()
const authStore = useAuthStore()
const { success, error: showError } = useSnackbar()
const { resetAllTours, getCompletedTourCount, TOUR_IDS } = useTour()

// 투어 관련
const completedTourCount = ref(0)
const totalTourCount = TOUR_IDS.length

function refreshTourCount() {
  completedTourCount.value = getCompletedTourCount()
}

function handleResetAllTours() {
  resetAllTours()
  refreshTourCount()
  success('모든 가이드 투어가 초기화되었습니다. 각 페이지에서 다시 시작할 수 있습니다.')
}

const formRef = ref(null)

const form = ref({
  name: '',
  businessType: BUSINESS_TYPES.BEAUTY_SHOP,
  phone: '',
  address: '',
  description: '',
  dailyRevenueGoal: null,
  monthlyRevenueGoal: null,
  monthlyNewCustomerGoal: null,
})

// 업종 옵션 (상수에서 import)
const businessTypeOptions = BUSINESS_TYPE_OPTIONS

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

// 폼 초기화
function resetForm() {
  if (settingsStore.business) {
    loadBusinessInfo()
  }
  else {
    form.value = {
      name: '',
      businessType: BUSINESS_TYPES.BEAUTY_SHOP,
      phone: '',
      address: '',
      description: '',
      dailyRevenueGoal: null,
      monthlyRevenueGoal: null,
      monthlyNewCustomerGoal: null,
    }
  }
}

// 매장 정보 로드
function loadBusinessInfo() {
  if (!settingsStore.business) return

  const business = settingsStore.business
  form.value = {
    name: business.name || '',
    businessType: business.businessType || BUSINESS_TYPES.BEAUTY_SHOP,
    phone: business.phone || '',
    address: business.address || '',
    description: business.description || '',
    dailyRevenueGoal: business.dailyRevenueGoal || null,
    monthlyRevenueGoal: business.monthlyRevenueGoal || null,
    monthlyNewCustomerGoal: business.monthlyNewCustomerGoal || null,
  }

  // 슬러그 로드
  currentSlug.value = business.slug || ''
  slugForm.value.slug = business.slug || ''
}

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const updateData = { ...form.value }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null) {
        delete updateData[key]
      }
    })

    await settingsStore.updateBusinessInfo(updateData)
    success('매장 정보가 저장되었습니다.')
  }
  catch (err) {
    console.error('저장 실패:', err)
    showError(err.message || '저장에 실패했습니다.')
  }
}

// ===== 슬러그 관리 =====
const currentSlug = ref('')
const slugForm = ref({ slug: '' })
const slugChecking = ref(false)
const slugSaving = ref(false)
const slugAvailable = ref(null)
const slugError = ref('')
const slugSuggestions = ref([])

const bookingUrl = computed(() => {
  const base = window.location.origin
  return `${base}/booking/${currentSlug.value}`
})

// 슬러그 유효성 검사
const slugRequired = value => !!value || '예약 링크 이름을 입력해주세요.'
const slugFormat = value => {
  if (!value) return true
  if (value.length < 3 || value.length > 50) return '3~50자로 입력해주세요.'
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) || '영문 소문자, 숫자, 하이픈만 사용 가능합니다.'
}

let slugCheckTimer = null
function debouncedCheckSlug() {
  slugAvailable.value = null
  slugError.value = ''
  slugSuggestions.value = []
  clearTimeout(slugCheckTimer)
  slugCheckTimer = setTimeout(() => {
    checkSlugAvailability()
  }, 500)
}

async function checkSlugAvailability() {
  const slug = slugForm.value.slug
  if (!slug || slug.length < 3) return
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) return

  // 현재 슬러그와 같으면 체크 불필요
  if (slug === currentSlug.value) {
    slugAvailable.value = true
    return
  }

  slugChecking.value = true
  try {
    const { data } = await publicBookingApi.checkSlug(slug)
    slugAvailable.value = data.available
    slugSuggestions.value = data.suggestions || []
    if (!data.available) {
      slugError.value = '이미 사용 중인 주소입니다.'
    }
    else {
      slugError.value = ''
    }
  }
  catch (err) {
    slugError.value = '주소 확인에 실패했습니다.'
  }
  finally {
    slugChecking.value = false
  }
}

async function handleSlugSubmit() {
  if (!slugAvailable.value || !slugForm.value.slug) return

  const businessId = authStore.businessId
  if (!businessId) return

  slugSaving.value = true
  try {
    await apiClient.patch(`/businesses/${businessId}/slug`, { slug: slugForm.value.slug })
    currentSlug.value = slugForm.value.slug
    success('예약 페이지 주소가 변경되었습니다.')
  }
  catch (err) {
    const errorMessages = {
      BS001: '이미 사용 중인 주소입니다.',
      BS002: '주소 형식이 올바르지 않습니다.',
      BS003: '사용할 수 없는 주소입니다.',
    }
    showError(errorMessages[err.code] || err.message || '주소 변경에 실패했습니다.')
  }
  finally {
    slugSaving.value = false
  }
}

function copyBookingUrl() {
  navigator.clipboard.writeText(bookingUrl.value)
  success('예약 URL이 복사되었습니다.')
}

// 컴포넌트 마운트 시
onMounted(async () => {
  refreshTourCount()
  try {
    await settingsStore.fetchBusinessInfo()
    loadBusinessInfo()
  }
  catch (error) {
    console.error('매장 정보 조회 실패:', error)
  }
})
</script>
