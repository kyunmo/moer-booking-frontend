<template>
  <VCard>
    <VCardTitle class="d-flex align-center">
      <VIcon icon="ri-store-2-line" size="24" class="me-3" />
      <span>매장 설정</span>
    </VCardTitle>

    <VDivider />

    <VCardText>
      <VForm ref="formRef" @submit.prevent="handleSubmit">
        <VRow>
          <!-- 매장명 -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.name"
              label="매장명"
              prepend-inner-icon="ri-store-2-line"
              placeholder="예: 준수헤어"
              :rules="[required]"
              required
            />
          </VCol>

          <!-- 사업자번호 -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.businessNumber"
              label="사업자번호"
              prepend-inner-icon="ri-file-list-line"
              placeholder="123-45-67890"
            />
          </VCol>

          <!-- 대표자명 -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.ownerName"
              label="대표자명"
              prepend-inner-icon="ri-user-line"
            />
          </VCol>

          <!-- 전화번호 -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.phone"
              label="매장 전화번호"
              prepend-inner-icon="ri-phone-line"
              placeholder="02-1234-5678"
              :rules="[required]"
              required
            />
          </VCol>

          <!-- 이메일 -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.email"
              label="이메일"
              prepend-inner-icon="ri-mail-line"
              placeholder="info@example.com"
              type="email"
            />
          </VCol>

          <!-- 웹사이트 -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.website"
              label="웹사이트"
              prepend-inner-icon="ri-global-line"
              placeholder="https://example.com"
            />
          </VCol>

          <!-- 우편번호 -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="form.zipCode"
              label="우편번호"
              prepend-inner-icon="ri-map-pin-line"
              placeholder="06234"
            />
          </VCol>

          <!-- 주소 -->
          <VCol cols="12" md="8">
            <VTextField
              v-model="form.address"
              label="주소"
              prepend-inner-icon="ri-home-line"
              placeholder="서울시 강남구 테헤란로 123"
            />
          </VCol>

          <!-- 상세주소 -->
          <VCol cols="12">
            <VTextField
              v-model="form.addressDetail"
              label="상세주소"
              prepend-inner-icon="ri-building-line"
              placeholder="4층 401호"
            />
          </VCol>

          <!-- 소개 -->
          <VCol cols="12">
            <VTextarea
              v-model="form.description"
              label="매장 소개"
              prepend-inner-icon="ri-file-text-line"
              placeholder="고객에게 보여질 매장 소개글을 입력하세요"
              rows="4"
              auto-grow
            />
          </VCol>

          <!-- 구분선 -->
          <VCol cols="12">
            <VDivider class="my-2" />
          </VCol>

          <!-- SNS -->
          <VCol cols="12">
            <h6 class="text-h6 mb-3">SNS 계정</h6>
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
  businessNumber: '',
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

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

// 폼 초기화
function resetForm() {
  if (settingsStore.businessInfo) {
    loadBusinessInfo()
  }
  else {
    form.value = {
      name: '',
      businessNumber: '',
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
  if (!settingsStore.businessInfo) return

  const info = settingsStore.businessInfo
  form.value = {
    name: info.name || '',
    businessNumber: info.businessNumber || '',
    ownerName: info.ownerName || '',
    phone: info.phone || '',
    email: info.email || '',
    website: info.website || '',
    zipCode: info.zipCode || '',
    address: info.address || '',
    addressDetail: info.addressDetail || '',
    description: info.description || '',
    instagramUrl: info.instagramUrl || '',
    facebookUrl: info.facebookUrl || '',
    naverPlaceUrl: info.naverPlaceUrl || '',
    kakaoPlaceUrl: info.kakaoPlaceUrl || '',
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
    alert(error || '저장에 실패했습니다.')
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
