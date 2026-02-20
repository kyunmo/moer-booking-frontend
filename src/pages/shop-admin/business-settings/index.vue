<template>
  <div>
    <!-- 매장 프로필 이미지 -->
    <VCard id="settings-profile-image" class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-image-line" size="24" class="me-3" />
        <span>매장 프로필 이미지</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VAlert
          color="info"
          variant="tonal"
          class="mb-4"
        >
          <VIcon icon="ri-information-line" class="me-2" />
          예약 페이지에 표시될 매장 대표 이미지입니다.
        </VAlert>

        <div class="d-flex align-center gap-6 flex-wrap">
          <!-- 현재 이미지 미리보기 -->
          <VAvatar size="120" rounded="lg" color="primary" variant="tonal">
            <VImg v-if="profileImagePreview || profileImageUrl" :src="profileImagePreview || profileImageUrl" alt="매장 프로필 이미지" cover />
            <VIcon v-else icon="ri-store-2-line" size="48" />
          </VAvatar>

          <div>
            <div class="d-flex gap-2 mb-2">
              <VBtn
                variant="outlined"
                color="primary"
                prepend-icon="ri-upload-2-line"
                @click="imageInputRef.click()"
              >
                이미지 선택
              </VBtn>
              <VBtn
                v-if="profileImageUrl"
                variant="text"
                color="error"
                prepend-icon="ri-delete-bin-line"
                @click="handleImageDelete"
              >
                삭제
              </VBtn>
            </div>
            <p class="text-caption text-medium-emphasis mb-0">
              JPG, PNG 형식, 최대 5MB 권장
            </p>
            <input
              ref="imageInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              @change="handleImageSelect"
            >
          </div>
        </div>
      </VCardText>

      <template v-if="selectedImageFile">
        <VDivider />

        <VCardActions>
          <VSpacer />

          <VBtn
            color="secondary"
            variant="outlined"
            @click="cancelImageSelection"
          >
            취소
          </VBtn>

          <VBtn
            color="primary"
            :loading="imageUploading"
            @click="handleImageUpload"
          >
            이미지 업로드
          </VBtn>
        </VCardActions>
      </template>
    </VCard>

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
              <div class="d-flex ga-2 align-start">
                <VTextField
                  v-model="form.address"
                  label="주소"
                  prepend-inner-icon="ri-map-pin-line"
                  placeholder="주소 검색 버튼을 클릭하세요"
                  readonly
                  class="flex-grow-1"
                  @click="openAddressSearch"
                />
                <VBtn
                  color="primary"
                  variant="tonal"
                  class="mt-1"
                  @click="openAddressSearch"
                >
                  <VIcon start>
                    ri-search-line
                  </VIcon>
                  주소 검색
                </VBtn>
              </div>
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="form.addressDetail"
                label="상세주소"
                prepend-inner-icon="ri-building-2-line"
                placeholder="상세주소 입력 (건물명, 호수 등)"
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

    <!-- 고객 등급 설정 -->
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center">
        <VIcon icon="ri-vip-crown-line" size="24" class="me-3" />
        <span>고객 등급 설정</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VAlert
          color="info"
          variant="tonal"
          class="mb-4"
        >
          <VIcon icon="ri-information-line" class="me-2" />
          방문 횟수 기준으로 고객 등급이 자동으로 분류됩니다. 설정 변경 후 다음 예약 완료 시점부터 적용됩니다.
        </VAlert>

        <div v-if="tierLoading" class="text-center py-6">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <VForm v-else ref="tierFormRef" @submit.prevent="handleTierSubmit">
          <VRow>
            <VCol cols="12" md="4">
              <VTextField
                v-model.number="tierForm.regularThreshold"
                label="단골 고객 기준 (방문 횟수) *"
                type="number"
                prepend-inner-icon="ri-user-star-line"
                :rules="[required, minOneRule]"
                min="1"
                step="1"
                hint="이 횟수 이상 방문 시 '단골' 등급"
                persistent-hint
              />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                v-model.number="tierForm.vipThreshold"
                label="VIP 고객 기준 (방문 횟수) *"
                type="number"
                prepend-inner-icon="ri-vip-crown-line"
                :rules="[required, minOneRule, vipGreaterThanRegularRule]"
                min="1"
                step="1"
                hint="이 횟수 이상 방문 시 'VIP' 등급"
                persistent-hint
              />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                v-model="tierForm.vipBenefitDescription"
                label="VIP 혜택 설명"
                placeholder="예: VIP 고객 10% 할인"
                prepend-inner-icon="ri-gift-line"
                hint="VIP 고객에게 표시할 혜택 안내"
                persistent-hint
              />
            </VCol>
          </VRow>

          <!-- 미리보기 -->
          <VRow class="mt-2">
            <VCol cols="12">
              <div class="text-subtitle-2 text-medium-emphasis mb-2">등급 기준 미리보기</div>
              <div class="d-flex flex-wrap gap-3">
                <VChip color="default" variant="tonal" size="small">
                  <VIcon start size="16">ri-user-line</VIcon>
                  신규: 0~{{ (tierForm.regularThreshold || 3) - 1 }}회
                </VChip>
                <VChip color="success" variant="tonal" size="small">
                  <VIcon start size="16">ri-user-star-line</VIcon>
                  단골: {{ tierForm.regularThreshold || 3 }}~{{ (tierForm.vipThreshold || 10) - 1 }}회
                </VChip>
                <VChip color="warning" variant="tonal" size="small">
                  <VIcon start size="16">ri-vip-crown-line</VIcon>
                  VIP: {{ tierForm.vipThreshold || 10 }}회 이상
                </VChip>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn
          color="primary"
          :loading="tierSaving"
          @click="handleTierSubmit"
        >
          등급 설정 저장
        </VBtn>
      </VCardActions>
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
import { useServiceCategoryStore } from '@/stores/service-category'
import { useSnackbar } from '@/composables/useSnackbar'
import { useTour } from '@/composables/useTour'
import { BUSINESS_TYPES, BUSINESS_TYPE_OPTIONS } from '@/constants/businessTypes'
import publicBookingApi from '@/api/public-booking'
import businessSettingsApi from '@/api/business-settings'
import apiClient from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()
const serviceCategoryStore = useServiceCategoryStore()
const authStore = useAuthStore()
const { success, error: showError } = useSnackbar()
const { resetAllTours, getCompletedTourCount, TOUR_IDS } = useTour()

// ===== 프로필 이미지 =====
const imageInputRef = ref(null)
const profileImageUrl = ref('')
const profileImagePreview = ref(null)
const selectedImageFile = ref(null)
const imageUploading = ref(false)

function handleImageSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // 파일 크기 체크 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('이미지 파일 크기는 5MB 이하로 선택해주세요.')
    event.target.value = ''
    return
  }

  // 파일 타입 체크
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showError('JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다.')
    event.target.value = ''
    return
  }

  selectedImageFile.value = file
  profileImagePreview.value = URL.createObjectURL(file)
}

function cancelImageSelection() {
  selectedImageFile.value = null
  if (profileImagePreview.value) {
    URL.revokeObjectURL(profileImagePreview.value)
    profileImagePreview.value = null
  }
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

async function handleImageUpload() {
  if (!selectedImageFile.value) return

  imageUploading.value = true
  try {
    const result = await settingsStore.uploadBusinessImage(selectedImageFile.value)
    profileImageUrl.value = result.profileImageUrl
    cancelImageSelection()
    success('매장 이미지가 업로드되었습니다.')
  }
  catch (err) {
    const errorMessages = {
      FI002: '파일 크기가 5MB를 초과합니다.',
      FI003: '지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다.',
      B001: '매장 정보를 찾을 수 없습니다.',
      B002: '매장 접근 권한이 없습니다.',
    }
    showError(errorMessages[err.code] || err.message || '이미지 업로드에 실패했습니다.')
  }
  finally {
    imageUploading.value = false
  }
}

async function handleImageDelete() {
  try {
    await settingsStore.deleteBusinessImage()
    profileImageUrl.value = ''
    success('매장 이미지가 삭제되었습니다.')
  }
  catch (err) {
    const errorMessages = {
      B001: '매장 정보를 찾을 수 없습니다.',
      B002: '매장 접근 권한이 없습니다.',
    }
    showError(errorMessages[err.code] || err.message || '이미지 삭제에 실패했습니다.')
  }
}

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
  addressDetail: '',
  zipCode: '',
  description: '',
  dailyRevenueGoal: null,
  monthlyRevenueGoal: null,
  monthlyNewCustomerGoal: null,
})

// 업종 옵션 (상수에서 import)
const businessTypeOptions = BUSINESS_TYPE_OPTIONS

// Address search (Kakao/Daum Postcode)
function openAddressSearch() {
  if (typeof daum === 'undefined' || !daum.Postcode) {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.onload = () => executeDaumPostcode()
    document.head.appendChild(script)
    return
  }
  executeDaumPostcode()
}

function executeDaumPostcode() {
  new daum.Postcode({
    oncomplete: function(data) {
      let fullAddress = data.roadAddress || data.jibunAddress
      let extraAddress = ''
      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraAddress += data.bname
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName)
      }
      if (extraAddress !== '') {
        fullAddress += ` (${extraAddress})`
      }
      form.value.address = fullAddress
      form.value.zipCode = data.zonecode
    },
  }).open()
}

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
      addressDetail: '',
      zipCode: '',
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
    addressDetail: business.addressDetail || '',
    zipCode: business.zipCode || '',
    description: business.description || '',
    dailyRevenueGoal: business.dailyRevenueGoal ?? null,
    monthlyRevenueGoal: business.monthlyRevenueGoal ?? null,
    monthlyNewCustomerGoal: business.monthlyNewCustomerGoal ?? null,
  }

  // 프로필 이미지 로드
  profileImageUrl.value = business.profileImageUrl || ''

  // 슬러그 로드
  currentSlug.value = business.slug || ''
  slugForm.value.slug = business.slug || ''
}

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // 업종 변경 감지용
  const previousBusinessType = settingsStore.business?.businessType

  try {
    const updateData = { ...form.value }

    // 목표 필드는 null이어도 전송 (백엔드에서 초기화할 수 있도록)
    const goalFields = ['dailyRevenueGoal', 'monthlyRevenueGoal', 'monthlyNewCustomerGoal']

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null && !goalFields.includes(key)) {
        delete updateData[key]
      }
    })

    await settingsStore.updateBusinessInfo(updateData)
    success('매장 정보가 저장되었습니다.')

    // 업종이 변경된 경우 관련 데이터 새로고침
    if (form.value.businessType !== previousBusinessType) {
      // auth 스토어의 business 정보 갱신
      if (authStore.business) {
        authStore.business.businessType = form.value.businessType
      }

      // 서비스 카테고리 캐시 무효화 및 새로고침
      serviceCategoryStore.invalidateCache()
    }
  }
  catch (err) {
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

// ===== 고객 등급 설정 =====
const tierFormRef = ref(null)
const tierLoading = ref(false)
const tierSaving = ref(false)
const tierForm = ref({
  regularThreshold: 3,
  vipThreshold: 10,
  vipBenefitDescription: '',
})

const minOneRule = value => {
  if (value === null || value === '') return '필수 입력 항목입니다.'
  return value >= 1 || '1 이상의 숫자를 입력하세요'
}

const vipGreaterThanRegularRule = () => {
  if (!tierForm.value.vipThreshold || !tierForm.value.regularThreshold) return true
  return tierForm.value.vipThreshold > tierForm.value.regularThreshold || 'VIP 임계값은 단골 임계값보다 커야 합니다'
}

async function loadTierSettings() {
  const businessId = authStore.businessId
  if (!businessId) return

  tierLoading.value = true
  try {
    const { data } = await businessSettingsApi.getCustomerTierSettings(businessId)
    tierForm.value = {
      regularThreshold: data.regularThreshold ?? 3,
      vipThreshold: data.vipThreshold ?? 10,
      vipBenefitDescription: data.vipBenefitDescription || '',
    }
  }
  catch {
    // 설정 미존재 시 기본값 유지
  }
  finally {
    tierLoading.value = false
  }
}

async function handleTierSubmit() {
  const { valid } = await tierFormRef.value.validate()
  if (!valid) return

  const businessId = authStore.businessId
  if (!businessId) return

  tierSaving.value = true
  try {
    await businessSettingsApi.updateCustomerTierSettings(businessId, tierForm.value)
    success('고객 등급 설정이 저장되었습니다.')
  }
  catch (err) {
    showError(err.message || '설정 저장에 실패했습니다.')
  }
  finally {
    tierSaving.value = false
  }
}

// 컴포넌트 마운트 시
onMounted(async () => {
  refreshTourCount()
  try {
    await settingsStore.fetchBusinessInfo()
    loadBusinessInfo()
  }
  catch (error) {
    // 매장 정보 조회 실패
  }
  loadTierSettings()
})
</script>
