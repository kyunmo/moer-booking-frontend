<route lang="yaml">
meta:
  layout: public
  public: true
  requiresCustomerAuth: true
  title: 내 프로필 - YEMO
</route>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const customerAuthStore = useCustomerAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

onMounted(async () => {
  if (!customerAuthStore.customer) {
    try {
      await customerAuthStore.fetchProfile()
    }
    catch {
      showError('프로필 정보를 불러올 수 없습니다')
    }
  }
})

// Form state
const formRef = ref(null)
const editing = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  phone: '',
  marketingAgree: false,
})

// Customer data
const customer = computed(() => customerAuthStore.customer)
const loading = computed(() => customerAuthStore.loading)

// Avatar initial
const avatarInitial = computed(() => {
  const name = customer.value?.name
  if (!name) return '?'

  return name.charAt(0).toUpperCase()
})

// Stats
const reservationCount = computed(() => customer.value?.reservationCount ?? 0)
const reviewCount = computed(() => customer.value?.reviewCount ?? 0)
const joinDate = computed(() => {
  if (!customer.value?.createdAt) return ''
  const date = new Date(customer.value.createdAt)

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Validation rules
const rules = {
  required: v => !!v?.trim() || '필수 입력 항목입니다',
  phone: v => {
    if (!v) return true
    const cleaned = v.replace(/-/g, '')

    return /^01[016789]\d{7,8}$/.test(cleaned) || '올바른 전화번호 형식이 아닙니다'
  },
}

// Phone formatting (010-0000-0000)
function formatPhoneInput(value) {
  if (!value) return ''
  const cleaned = value.replace(/[^0-9]/g, '')

  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
}

function handlePhoneInput(event) {
  const raw = event.target.value
  form.value.phone = formatPhoneInput(raw)
}

// Start editing
function startEdit() {
  form.value = {
    name: customer.value?.name || '',
    phone: formatPhoneInput(customer.value?.phone || ''),
    marketingAgree: customer.value?.marketingAgree || false,
  }
  editing.value = true
}

// Cancel editing
function cancelEdit() {
  editing.value = false
  formRef.value?.resetValidation()
}

// Save profile
async function handleSave() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      phone: form.value.phone.replace(/-/g, ''),
      marketingAgree: form.value.marketingAgree,
    }

    await customerAuthStore.updateProfile(payload)
    showSuccess('프로필이 수정되었습니다')
    editing.value = false
  }
  catch (error) {
    const message = error.response?.data?.error?.message || '프로필 수정에 실패했습니다'
    showError(message)
  }
  finally {
    saving.value = false
  }
}

// Logout
function handleLogout() {
  customerAuthStore.logout()
  router.push('/booking')
}

// Format phone for display
function displayPhone(phone) {
  if (!phone) return '-'

  return formatPhoneInput(phone)
}

// Sync customer data when loaded
watch(customer, newVal => {
  if (newVal && editing.value) {
    form.value = {
      name: newVal.name || '',
      phone: formatPhoneInput(newVal.phone || ''),
      marketingAgree: newVal.marketingAgree || false,
    }
  }
})
</script>

<template>
  <div class="profile-page py-8 py-md-12">
    <VContainer style="max-inline-size: 600px;">
      <!-- Loading State -->
      <template v-if="loading && !customer">
        <VCard
          rounded="lg"
          elevation="2"
        >
          <VCardText class="pa-6">
            <div class="d-flex flex-column align-center py-8">
              <VProgressCircular
                indeterminate
                color="primary"
                size="48"
                class="mb-4"
              />
              <p class="text-body-1 text-medium-emphasis">
                프로필을 불러오는 중...
              </p>
            </div>
          </VCardText>
        </VCard>
      </template>

      <template v-else-if="customer">
        <!-- Profile Header Card -->
        <VCard
          class="mb-4"
          rounded="lg"
          elevation="2"
        >
          <VCardText class="pa-6">
            <div class="d-flex flex-column align-center text-center">
              <!-- Avatar -->
              <VAvatar
                size="80"
                color="primary"
                class="mb-4"
              >
                <VImg
                  v-if="customer.profileImageUrl"
                  :src="customer.profileImageUrl"
                  :alt="customer.name"
                />
                <span
                  v-else
                  class="text-h4 text-white font-weight-bold"
                >
                  {{ avatarInitial }}
                </span>
              </VAvatar>

              <!-- Name & Email -->
              <h2 class="text-h5 font-weight-bold mb-1">
                {{ customer.name || '이름 없음' }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ customer.email }}
              </p>
            </div>
          </VCardText>

          <VDivider />

          <!-- Stats Chips -->
          <VCardText class="pa-4">
            <div class="d-flex justify-center flex-wrap ga-2">
              <VChip
                variant="tonal"
                color="primary"
                size="default"
                label
              >
                <VIcon
                  start
                  size="18"
                >
                  ri-calendar-check-line
                </VIcon>
                예약 {{ reservationCount }}건
              </VChip>

              <VChip
                variant="tonal"
                color="info"
                size="default"
                label
              >
                <VIcon
                  start
                  size="18"
                >
                  ri-star-line
                </VIcon>
                리뷰 {{ reviewCount }}건
              </VChip>

              <VChip
                variant="tonal"
                color="secondary"
                size="default"
                label
              >
                <VIcon
                  start
                  size="18"
                >
                  ri-user-add-line
                </VIcon>
                {{ joinDate }}
              </VChip>
            </div>
          </VCardText>
        </VCard>

        <!-- Profile Info / Edit Card -->
        <VCard
          class="mb-4"
          rounded="lg"
          elevation="2"
        >
          <VCardTitle class="d-flex align-center justify-space-between pa-6 pb-0">
            <span class="text-h6 font-weight-bold">내 정보</span>
            <VBtn
              v-if="!editing"
              variant="text"
              color="primary"
              size="small"
              @click="startEdit"
            >
              <VIcon
                start
                size="18"
              >
                ri-edit-line
              </VIcon>
              수정
            </VBtn>
          </VCardTitle>

          <VCardText class="pa-6">
            <!-- View Mode -->
            <template v-if="!editing">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">
                    <VIcon
                      size="16"
                      class="me-1"
                    >ri-user-line</VIcon>
                    이름
                  </span>
                  <span class="info-value">{{ customer.name || '-' }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">
                    <VIcon
                      size="16"
                      class="me-1"
                    >ri-mail-line</VIcon>
                    이메일
                  </span>
                  <span class="info-value">
                    {{ customer.email || '-' }}
                    <VChip
                      size="x-small"
                      variant="tonal"
                      color="secondary"
                      class="ms-2"
                    >
                      카카오 연동
                    </VChip>
                  </span>
                </div>

                <div class="info-item">
                  <span class="info-label">
                    <VIcon
                      size="16"
                      class="me-1"
                    >ri-phone-line</VIcon>
                    전화번호
                  </span>
                  <span class="info-value">{{ displayPhone(customer.phone) }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">
                    <VIcon
                      size="16"
                      class="me-1"
                    >ri-megaphone-line</VIcon>
                    마케팅 동의
                  </span>
                  <span class="info-value">
                    <VChip
                      :color="customer.marketingAgree ? 'success' : 'default'"
                      size="small"
                      variant="tonal"
                      label
                    >
                      {{ customer.marketingAgree ? '동의' : '미동의' }}
                    </VChip>
                  </span>
                </div>
              </div>
            </template>

            <!-- Edit Mode -->
            <template v-else>
              <VForm
                ref="formRef"
                @submit.prevent="handleSave"
              >
                <VTextField
                  v-model="form.name"
                  label="이름"
                  placeholder="이름을 입력하세요"
                  prepend-inner-icon="ri-user-line"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required]"
                  class="mb-4"
                  hide-details="auto"
                />

                <VTextField
                  :model-value="customer.email"
                  label="이메일"
                  prepend-inner-icon="ri-mail-line"
                  variant="outlined"
                  density="comfortable"
                  disabled
                  readonly
                  hint="카카오 연동 계정이라 변경할 수 없습니다"
                  persistent-hint
                  class="mb-4"
                />

                <VTextField
                  v-model="form.phone"
                  label="전화번호"
                  placeholder="010-0000-0000"
                  prepend-inner-icon="ri-phone-line"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.phone]"
                  class="mb-4"
                  hide-details="auto"
                  maxlength="13"
                  @input="handlePhoneInput"
                />

                <VSwitch
                  v-model="form.marketingAgree"
                  label="마케팅 수신 동의"
                  color="primary"
                  density="comfortable"
                  hide-details
                  class="mb-2"
                />
                <p class="text-caption text-medium-emphasis mb-4 ms-12">
                  이벤트, 할인 정보 등 마케팅 알림을 받습니다
                </p>

                <div class="d-flex ga-3">
                  <VBtn
                    variant="outlined"
                    color="secondary"
                    block
                    @click="cancelEdit"
                  >
                    취소
                  </VBtn>
                  <VBtn
                    type="submit"
                    color="primary"
                    block
                    :loading="saving"
                  >
                    <VIcon
                      start
                      size="18"
                    >
                      ri-save-line
                    </VIcon>
                    저장
                  </VBtn>
                </div>
              </VForm>
            </template>
          </VCardText>
        </VCard>

        <!-- Logout Card -->
        <VCard
          rounded="lg"
          elevation="2"
        >
          <VCardText class="pa-6">
            <VBtn
              color="error"
              variant="outlined"
              block
              @click="handleLogout"
            >
              <VIcon
                start
                size="18"
              >
                ri-logout-box-r-line
              </VIcon>
              로그아웃
            </VBtn>
          </VCardText>
        </VCard>
      </template>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  min-block-size: 80vh;
  padding-block-end: 56px; // VBottomNavigation height

  @media (min-width: 600px) {
    padding-block-end: 0;
  }
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  inline-size: 110px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.info-value {
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 0.875rem;
  word-break: break-word;
}
</style>
