<template>
  <VCard>
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

          <!-- 목표 설정 (신규) -->
          <VCol cols="12">
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
</template>

<script setup>
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { useSnackbar } from '@/composables/useSnackbar'
import { BUSINESS_TYPES, BUSINESS_TYPE_OPTIONS } from '@/constants/businessTypes'
import { onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()
const { success, error: showError } = useSnackbar()

const formRef = ref(null)

const form = ref({
  name: '',
  businessType: BUSINESS_TYPES.BEAUTY_SHOP,
  phone: '',
  address: '',
  description: '',
  // 목표 설정
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
    // 목표 설정
    dailyRevenueGoal: business.dailyRevenueGoal || null,
    monthlyRevenueGoal: business.monthlyRevenueGoal || null,
    monthlyNewCustomerGoal: business.monthlyNewCustomerGoal || null,
  }
}

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    // 변경된 필드만 전송 (null 값 제외)
    const updateData = { ...form.value }

    // null 값 제거 (빈 문자열은 유지)
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

// 컴포넌트 마운트 시
onMounted(async () => {
  try {
    await settingsStore.fetchBusinessInfo()
    loadBusinessInfo()
  }
  catch (error) {
    console.error('매장 정보 조회 실패:', error)
  }
})
</script>
