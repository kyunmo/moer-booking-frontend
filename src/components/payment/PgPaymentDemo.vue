<template>
  <VDialog v-model="dialogModel" max-width="480" persistent>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon icon="ri-secure-payment-line" class="me-2" color="primary" />
          결제 진행
        </div>
        <VChip color="warning" size="small" variant="tonal">
          DEMO
        </VChip>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <!-- Step 1: Card Input (demo) -->
        <template v-if="step === 'input'">
          <VAlert type="info" variant="tonal" density="compact" class="mb-4">
            데모 환경입니다. 실제 결제가 이루어지지 않습니다.
          </VAlert>

          <div class="mb-4">
            <p class="text-body-2 text-medium-emphasis mb-2">결제 금액</p>
            <p class="text-h5 font-weight-bold text-primary">{{ formatCurrency(amount) }}</p>
          </div>

          <VTextField
            v-model="cardNumber"
            label="카드 번호"
            placeholder="0000-0000-0000-0000"
            prepend-inner-icon="ri-bank-card-line"
            class="mb-3"
            maxlength="19"
            @input="formatCardNumber"
          />

          <VRow>
            <VCol cols="6">
              <VTextField
                v-model="expiry"
                label="유효기간"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiry"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="cvc"
                label="CVC"
                placeholder="000"
                maxlength="3"
                type="password"
              />
            </VCol>
          </VRow>

          <!-- Demo quick fill button -->
          <VBtn
            variant="tonal"
            color="secondary"
            size="small"
            block
            class="mb-4"
            @click="fillDemoData"
          >
            <VIcon icon="ri-magic-line" start />
            데모 데이터 자동 입력
          </VBtn>
        </template>

        <!-- Step 2: Processing -->
        <template v-if="step === 'processing'">
          <div class="text-center py-8">
            <VProgressCircular
              indeterminate
              color="primary"
              size="64"
              width="4"
              class="mb-4"
            />
            <p class="text-h6 mb-2">결제 처리 중...</p>
            <p class="text-body-2 text-medium-emphasis">
              잠시만 기다려주세요
            </p>
          </div>
        </template>

        <!-- Step 3: Result -->
        <template v-if="step === 'result'">
          <div class="text-center py-6">
            <VIcon
              :icon="resultSuccess ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
              :color="resultSuccess ? 'success' : 'error'"
              size="64"
              class="mb-4"
            />
            <p class="text-h6 mb-2">
              {{ resultSuccess ? '결제가 완료되었습니다' : '결제에 실패했습니다' }}
            </p>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ resultSuccess ? 'PG 거래가 정상적으로 처리되었습니다.' : '다시 시도해주세요.' }}
            </p>
            <VChip color="warning" size="small" variant="tonal">
              DEMO - 실제 결제 아님
            </VChip>
          </div>
        </template>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          v-if="step === 'input'"
          variant="text"
          @click="cancel"
        >
          취소
        </VBtn>
        <VBtn
          v-if="step === 'input'"
          color="primary"
          variant="elevated"
          :disabled="!isFormValid"
          @click="processPayment"
        >
          <VIcon icon="ri-lock-line" start />
          {{ formatCurrency(amount) }} 결제
        </VBtn>
        <VBtn
          v-if="step === 'result'"
          :color="resultSuccess ? 'primary' : 'error'"
          variant="elevated"
          @click="complete"
        >
          {{ resultSuccess ? '확인' : '닫기' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'CARD' },
})

const emit = defineEmits(['update:modelValue', 'success', 'fail'])

const dialogModel = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const step = ref('input')
const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const resultSuccess = ref(false)

const isFormValid = computed(() => {
  return cardNumber.value.length >= 16 && expiry.value.length === 5 && cvc.value.length === 3
})

function formatCurrency(value) {
  if (!value) return '0원'
  return `${value.toLocaleString()}원`
}

function formatCardNumber() {
  let val = cardNumber.value.replace(/\D/g, '').substring(0, 16)
  cardNumber.value = val.replace(/(\d{4})(?=\d)/g, '$1-')
}

function formatExpiry() {
  let val = expiry.value.replace(/\D/g, '').substring(0, 4)
  if (val.length >= 2) {
    expiry.value = val.substring(0, 2) + '/' + val.substring(2)
  } else {
    expiry.value = val
  }
}

function fillDemoData() {
  cardNumber.value = '4242-4242-4242-4242'
  expiry.value = '12/28'
  cvc.value = '123'
}

async function processPayment() {
  step.value = 'processing'

  // Simulate PG processing delay (1.5~2.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

  // Demo always succeeds
  resultSuccess.value = true
  step.value = 'result'
}

function cancel() {
  resetForm()
  dialogModel.value = false
}

function complete() {
  if (resultSuccess.value) {
    emit('success')
  } else {
    emit('fail')
  }
  resetForm()
  dialogModel.value = false
}

function resetForm() {
  step.value = 'input'
  cardNumber.value = ''
  expiry.value = ''
  cvc.value = ''
  resultSuccess.value = false
}
</script>
