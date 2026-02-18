<route lang="yaml">
meta:
  layout: blank
</route>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useSnackbar } from '@/composables/useSnackbar'
import { BUSINESS_TYPE_OPTIONS, BUSINESS_TYPES } from '@/constants/businessTypes'
import businessSettingsApi from '@/api/business-settings'
import authApi from '@/api/auth'
import LegalDialog from '@/components/legal/LegalDialog.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

const formRef = ref(null)
const loading = ref(false)
const pageLoading = ref(true)
const legalDialog = ref(false)
const legalType = ref('terms')

const form = ref({
  businessName: '',
  businessType: BUSINESS_TYPES.BEAUTY_SHOP,
  phone: '',
  agreeTerms: false,
})

// SNS 계정 정보 (읽기 전용)
const userEmail = ref('')
const userName = ref('')

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const phoneRule = value => {
  if (!value) return '전화번호는 필수입니다.'
  const cleaned = value.replace(/[^0-9]/g, '')
  return (cleaned.length >= 10 && cleaned.length <= 11) || '올바른 전화번호 형식이 아닙니다.'
}

// 초기 데이터 로드
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    // 사용자 정보가 없으면 조회
    if (!authStore.user) {
      await authStore.fetchCurrentUser()
    }

    userEmail.value = authStore.user?.email || ''
    userName.value = authStore.user?.name || ''

    // 매장 정보 조회
    const businessId = authStore.user?.businessId
    if (businessId) {
      const { data: business } = await businessSettingsApi.getBusinessInfo(businessId)
      form.value.businessName = business.name || ''
      form.value.businessType = business.businessType || BUSINESS_TYPES.BEAUTY_SHOP
    }
  }
  catch (err) {
    showError('정보를 불러오는데 실패했습니다.')
  }
  finally {
    pageLoading.value = false
  }
})

// 설정 완료
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const businessId = authStore.user?.businessId

    // 1. 매장 정보 업데이트
    if (businessId) {
      await businessSettingsApi.updateBusinessInfo(businessId, {
        name: form.value.businessName,
        businessType: form.value.businessType,
      })
    }

    // 2. 사용자 프로필 업데이트 (전화번호)
    await authApi.updateProfile({
      phone: form.value.phone,
    })

    // 3. 사용자 정보 갱신
    await authStore.fetchCurrentUser()

    showSuccess('매장 설정이 완료되었습니다! 대시보드로 이동합니다.')

    // 대시보드로 이동
    setTimeout(() => {
      router.push('/shop-admin/dashboard')
    }, 500)
  }
  catch (err) {
    showError(err.message || '설정 저장에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}

// 나중에 설정 (건너뛰기)
function handleSkip() {
  router.push('/shop-admin/dashboard')
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-1 pa-sm-7"
      max-width="700"
    >
      <!-- 로고 -->
      <VCardItem class="justify-center pb-4">
        <VCardTitle>
          <div class="app-logo">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="app-logo-title">
              {{ themeConfig.app.title }}
            </h1>
          </div>
        </VCardTitle>
      </VCardItem>

      <!-- 환영 메시지 -->
      <VCardText class="text-center">
        <h4 class="text-h4 mb-2">
          환영합니다, {{ userName }}님!
        </h4>
        <p class="text-body-1 text-medium-emphasis mb-0">
          서비스를 시작하기 전에 매장 정보를 설정해주세요.
        </p>
      </VCardText>

      <!-- 로딩 -->
      <VCardText v-if="pageLoading" class="text-center py-8">
        <VProgressCircular indeterminate color="primary" size="48" />
      </VCardText>

      <!-- 설정 폼 -->
      <VCardText v-else>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- SNS 계정 정보 (읽기 전용) -->
            <VCol cols="12">
              <VAlert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-2"
              >
                <div class="d-flex align-center">
                  <VIcon icon="ri-shield-check-line" class="me-2" />
                  <span class="text-body-2">
                    <strong>{{ userEmail }}</strong> 계정으로 가입되었습니다.
                  </span>
                </div>
              </VAlert>
            </VCol>

            <!-- 30일 체험판 안내 -->
            <VCol cols="12">
              <VAlert
                type="success"
                variant="tonal"
                density="compact"
              >
                <div class="d-flex align-center">
                  <VIcon icon="ri-gift-line" class="me-2" />
                  <span class="text-body-2">
                    <strong>30일 무료 체험</strong>이 시작되었습니다! 모든 기능을 제한 없이 사용해보세요.
                  </span>
                </div>
              </VAlert>
            </VCol>

            <!-- 구분선 -->
            <VCol cols="12">
              <div class="text-subtitle-1 font-weight-medium mb-1">
                매장 기본 정보
              </div>
              <VDivider />
            </VCol>

            <!-- 매장명 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.businessName"
                label="매장명"
                placeholder="예: 준수헤어"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              >
                <template #prepend-inner>
                  <VIcon icon="ri-store-2-line" />
                </template>
              </VTextField>
            </VCol>

            <!-- 업종 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.businessType"
                label="업종"
                :items="BUSINESS_TYPE_OPTIONS"
                :rules="[required]"
                variant="outlined"
                density="comfortable"
              >
                <template #prepend-inner>
                  <VIcon icon="ri-briefcase-line" />
                </template>
              </VSelect>
            </VCol>

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="연락처"
                placeholder="010-1234-5678"
                :rules="[required, phoneRule]"
                variant="outlined"
                density="comfortable"
              >
                <template #prepend-inner>
                  <VIcon icon="ri-phone-line" />
                </template>
              </VTextField>
            </VCol>

            <!-- 대표자명 (읽기 전용) -->
            <VCol cols="12" md="6">
              <VTextField
                :model-value="userName"
                label="대표자명"
                variant="outlined"
                density="comfortable"
                readonly
                hint="SNS 계정의 이름이 자동으로 설정됩니다."
                persistent-hint
              >
                <template #prepend-inner>
                  <VIcon icon="ri-user-line" />
                </template>
              </VTextField>
            </VCol>

            <!-- 약관 동의 -->
            <VCol cols="12">
              <VDivider class="mb-4" />
              <div class="d-flex align-center">
                <VCheckbox
                  id="agree-terms"
                  v-model="form.agreeTerms"
                  :rules="[v => !!v || '약관에 동의해주세요']"
                  inline
                  hide-details="auto"
                />
                <VLabel
                  for="agree-terms"
                  style="opacity: 1;"
                >
                  <span class="me-1 text-high-emphasis">
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                      @click="legalType = 'terms'; legalDialog = true"
                    >이용약관</a>
                    및
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                      @click="legalType = 'privacy'; legalDialog = true"
                    >개인정보처리방침</a>에 동의합니다
                  </span>
                </VLabel>
              </div>
            </VCol>

            <!-- 버튼 -->
            <VCol cols="12" class="d-flex gap-4">
              <VBtn
                type="submit"
                size="large"
                :loading="loading"
                class="flex-grow-1"
              >
                시작하기
              </VBtn>
              <VBtn
                variant="text"
                color="secondary"
                size="large"
                @click="handleSkip"
              >
                나중에 설정
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <!-- 약관/개인정보 모달 -->
    <LegalDialog
      v-model="legalDialog"
      :type="legalType"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
