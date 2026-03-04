<template>
  <VCard rounded="lg" variant="outlined">
    <VCardTitle class="text-h6 font-weight-bold pa-5 pb-3">
      <VIcon start color="primary" size="22">
        ri-user-line
      </VIcon>
      {{ isCustomerLoggedIn ? '고객 정보 확인' : '고객 정보' }}
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-5">
      <!-- Logged-in customer: read-only -->
      <template v-if="isCustomerLoggedIn">
        <VAlert
          type="info"
          variant="tonal"
          class="mb-5"
        >
          <VIcon start size="18">
            ri-kakao-talk-fill
          </VIcon>
          카카오 로그인으로 예약합니다. 아래 정보를 확인해주세요.
        </VAlert>

        <VRow>
          <VCol cols="12" sm="6">
            <VTextField
              :model-value="customerAuthStore.customerName"
              label="이름"
              prepend-inner-icon="ri-user-3-line"
              variant="outlined"
              readonly
              disabled
            />
          </VCol>

          <VCol cols="12" sm="6">
            <VTextField
              :model-value="customerAuthStore.customerPhone || '미등록'"
              label="전화번호"
              prepend-inner-icon="ri-phone-line"
              variant="outlined"
              readonly
              disabled
              :error="!customerAuthStore.hasPhone"
              :error-messages="!customerAuthStore.hasPhone ? '전화번호가 등록되지 않았습니다' : ''"
            />
          </VCol>

          <VCol v-if="customerAuthStore.customerEmail" cols="12">
            <VTextField
              :model-value="customerAuthStore.customerEmail"
              label="이메일"
              prepend-inner-icon="ri-mail-line"
              variant="outlined"
              readonly
              disabled
            />
          </VCol>

          <!-- Phone not registered warning -->
          <VCol v-if="!customerAuthStore.hasPhone" cols="12">
            <VAlert
              type="warning"
              variant="tonal"
            >
              <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                <span>예약을 위해 전화번호 등록이 필요합니다.</span>
                <VBtn
                  color="warning"
                  variant="elevated"
                  size="small"
                  aria-label="프로필 수정 페이지로 이동"
                  @click="$emit('go-to-profile')"
                >
                  <VIcon start size="16">
                    ri-edit-line
                  </VIcon>
                  프로필 수정
                </VBtn>
              </div>
            </VAlert>
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="customerForm.request"
              label="요청사항 (선택)"
              placeholder="예약 관련 요청사항을 입력해주세요"
              :maxlength="500"
              counter
              rows="3"
              variant="outlined"
            />
          </VCol>
        </VRow>
      </template>

      <!-- Guest: form input -->
      <VForm v-else ref="customerFormRef" v-model="customerFormValid" validate-on="blur">
        <VRow>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="customerForm.name"
              label="이름"
              placeholder="홍길동"
              :rules="nameRules"
              prepend-inner-icon="ri-user-3-line"
              variant="outlined"
              validate-on="blur"
            />
          </VCol>

          <VCol cols="12" sm="6">
            <VTextField
              v-model="customerForm.phone"
              label="전화번호"
              placeholder="010-0000-0000"
              :rules="phoneRules"
              prepend-inner-icon="ri-phone-line"
              variant="outlined"
              maxlength="13"
              validate-on="blur"
              @input="handlePhoneInput"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="customerForm.email"
              label="이메일 (선택)"
              placeholder="example@email.com"
              :rules="emailRules"
              prepend-inner-icon="ri-mail-line"
              variant="outlined"
              validate-on="blur"
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="customerForm.request"
              label="요청사항 (선택)"
              placeholder="예약 관련 요청사항을 입력해주세요"
              :maxlength="500"
              counter
              rows="3"
              variant="outlined"
            />
          </VCol>

          <VCol cols="12">
            <VCheckbox
              v-model="privacyAgreed"
              color="primary"
              density="compact"
              :rules="[v => !!v || '개인정보 수집·이용에 동의해주세요']"
            >
              <template #label>
                <span class="text-body-2">
                  <RouterLink
                    to="/privacy"
                    target="_blank"
                    class="text-primary font-weight-medium"
                    @click.stop
                  >
                    개인정보 수집·이용
                  </RouterLink>
                  에 동의합니다 (필수)
                </span>
              </template>
            </VCheckbox>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>

    <VDivider />
    <VCardActions class="pa-5 d-flex flex-column flex-sm-row ga-3">
      <VBtn
        variant="outlined"
        size="large"
        block
        class="flex-sm-grow-0"
        min-width="140"
        aria-label="이전 단계로 이동"
        @click="$emit('prev')"
      >
        <VIcon start>
          ri-arrow-left-line
        </VIcon>
        이전
      </VBtn>
      <VSpacer class="d-none d-sm-block" />
      <VBtn
        color="primary"
        size="large"
        :disabled="!canGoNext"
        block
        class="flex-sm-grow-0"
        min-width="140"
        aria-label="다음 단계로 이동"
        @click="handleNext"
      >
        다음
        <VIcon end>
          ri-arrow-right-line
        </VIcon>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useCustomerAuthStore } from '@/stores/customer-auth'
import { usePhoneValidation } from '@/composables/usePhoneValidation'

const emit = defineEmits(['next', 'prev', 'go-to-profile'])

const bookingStore = useBookingStore()
const customerAuthStore = useCustomerAuthStore()
const { requiredPhoneRules, formatPhoneInput } = usePhoneValidation()

const isCustomerLoggedIn = computed(() => customerAuthStore.isAuthenticated)
const customerForm = computed(() => bookingStore.customerForm)

const customerFormRef = ref(null)
const customerFormValid = ref(false)
const privacyAgreed = ref(false)

const canGoNext = computed(() => {
  if (isCustomerLoggedIn.value) {
    return customerAuthStore.hasPhone
  }
  return customerFormValid.value && privacyAgreed.value
})

const phoneRules = requiredPhoneRules
const nameRules = [v => !!v || '이름을 입력해주세요']
const emailRules = [v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || '올바른 이메일 형식이 아닙니다']

function handlePhoneInput(event) {
  const raw = event.target.value
  customerForm.value.phone = formatPhoneInput(raw)
}

async function handleNext() {
  if (!canGoNext.value) return

  if (!isCustomerLoggedIn.value) {
    const { valid } = await customerFormRef.value.validate()
    if (!valid) return
  }

  emit('next')
}
</script>
