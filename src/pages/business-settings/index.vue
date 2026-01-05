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

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.ownerName"
              label="대표자명"
              prepend-inner-icon="ri-user-line"
            />
          </VCol>

          <!-- 주소 -->
          <VCol cols="12">
            <h6 class="text-h6 mb-3 mt-4">주소</h6>
          </VCol>

          <VCol cols="12" md="3">
            <VTextField
              v-model="form.zipCode"
              label="우편번호"
              prepend-inner-icon="ri-map-pin-line"
              readonly
            />
          </VCol>

          <VCol cols="12" md="9">
            <VTextField
              v-model="form.address"
              label="기본 주소"
              prepend-inner-icon="ri-road-map-line"
              readonly
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="form.addressDetail"
              label="상세 주소"
              placeholder="동, 호수 등 상세 주소를 입력하세요"
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

          <!-- 연락처 -->
          <VCol cols="12">
            <h6 class="text-h6 mb-3 mt-4">추가 연락처</h6>
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.email"
              label="이메일"
              prepend-inner-icon="ri-mail-line"
              placeholder="your@email.com"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.website"
              label="웹사이트"
              prepend-inner-icon="ri-global-line"
              placeholder="https://your-website.com"
            />
          </VCol>

          <!-- SNS -->
          <VCol cols="12">
            <h6 class="text-h6 mb-3 mt-4">SNS & 지도</h6>
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.instagramUrl"
              label="Instagram"
              prepend-inner-icon="ri-instagram-line"
              placeholder="@your_account"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.facebookUrl"
              label="Facebook"
              prepend-inner-icon="ri-facebook-line"
              placeholder="facebook.com/yourpage"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.naverPlaceUrl"
              label="네이버 플레이스"
              prepend-inner-icon="ri-map-pin-2-line"
              placeholder="네이버 플레이스 URL"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.kakaoPlaceUrl"
              label="카카오맵"
              prepend-inner-icon="ri-map-2-line"
              placeholder="카카오맵 URL"
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
import { onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()

const formRef = ref(null)

const form = ref({
  name: '',
  businessType: 'SALON',
  ownerName: '',
  phone: '',
  email: '',
  website: '',
  zipCode: '',
  address: '',
  addressDetail: '',
  description: '',
  instagramUrl: '',
  facebookUrl: '',
  naverPlaceUrl: '',
  kakaoPlaceUrl: '',
})

// 업종 옵션
const businessTypeOptions = [
  { title: '미용실', value: 'SALON' },
  { title: '네일샵', value: 'NAIL' },
  { title: '피부관리실', value: 'SKIN_CARE' },
  { title: '필라테스', value: 'PILATES' },
  { title: '요가', value: 'YOGA' },
  { title: '스터디카페', value: 'STUDY_CAFE' },
  { title: '공방', value: 'WORKSHOP' },
]

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
      businessType: 'SALON',
      ownerName: '',
      phone: '',
      email: '',
      website: '',
      zipCode: '',
      address: '',
      addressDetail: '',
      description: '',
      instagramUrl: '',
      facebookUrl: '',
      naverPlaceUrl: '',
      kakaoPlaceUrl: '',
    }
  }
}

// 매장 정보 로드
function loadBusinessInfo() {
  if (!settingsStore.business) return

  const business = settingsStore.business
  form.value = {
    name: business.name || '',
    businessType: business.businessType || 'SALON',
    ownerName: business.ownerName || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    zipCode: business.zipCode || '',
    address: business.address || '',
    addressDetail: business.addressDetail || '',
    description: business.description || '',
    instagramUrl: business.instagramUrl || '',
    facebookUrl: business.facebookUrl || '',
    naverPlaceUrl: business.naverPlaceUrl || '',
    kakaoPlaceUrl: business.kakaoPlaceUrl || '',
  }
}

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    await settingsStore.updateBusinessInfo(form.value)
    alert('매장 정보가 저장되었습니다.')
  }
  catch (error) {
    console.error('저장 실패:', error)
    alert(error.response?.data?.message || '저장에 실패했습니다.')
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
