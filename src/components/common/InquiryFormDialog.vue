<script setup>
import { computed, ref, watch } from 'vue'
import inquiryApi from '@/api/inquiry'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

const form = ref({
  name: '',
  email: '',
  phone: '',
  type: '',
  content: '',
  privacyAgreed: false,
})

const inquiryTypes = [
  { title: '일반 문의', value: 'GENERAL' },
  { title: '기능 요청', value: 'FEATURE_REQUEST' },
  { title: '오류 신고', value: 'BUG_REPORT' },
  { title: '제휴 문의', value: 'PARTNERSHIP' },
]

const rules = {
  required: v => !!v || '필수 입력 항목입니다.',
  email: v => {
    if (!v) return '필수 입력 항목입니다.'
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return pattern.test(v) || '올바른 이메일 형식을 입력해주세요.'
  },
  privacyRequired: v => !!v || '개인정보 수집에 동의해주세요.',
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    type: '',
    content: '',
    privacyAgreed: false,
  }
  submitted.value = false
  errorMessage.value = ''
  formRef.value?.resetValidation()
}

const submit = async () => {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  loading.value = true
  errorMessage.value = ''
  try {
    await inquiryApi.submitInquiry({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || null,
      type: form.value.type,
      content: form.value.content,
    })
    submitted.value = true
    setTimeout(() => {
      close()
    }, 2000)
  }
  catch (error) {
    if (error.code === 'IQ001') {
      errorMessage.value = '너무 많은 문의를 보내셨습니다. 잠시 후 다시 시도해주세요.'
    }
    else {
      errorMessage.value = error.message || '문의 접수에 실패했습니다. 다시 시도해주세요.'
    }
  }
  finally {
    loading.value = false
  }
}

const close = () => {
  isOpen.value = false
}

watch(() => props.modelValue, newVal => {
  if (!newVal) {
    setTimeout(resetForm, 300)
  }
})
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
    persistent
  >
    <VCard>
      <!-- 제출 성공 상태 -->
      <template v-if="submitted">
        <VCardText class="text-center pa-12">
          <VAvatar
            color="success"
            variant="tonal"
            size="80"
            class="mb-6"
          >
            <VIcon
              icon="ri-check-line"
              size="40"
            />
          </VAvatar>
          <h3 class="text-h5 font-weight-bold mb-2">
            문의가 접수되었습니다
          </h3>
          <p class="text-body-1 text-medium-emphasis">
            빠른 시일 내에 답변드리겠습니다.<br>
            입력하신 이메일로 답변을 보내드립니다.
          </p>
        </VCardText>
      </template>

      <!-- 문의 폼 -->
      <template v-else>
        <VCardTitle class="d-flex align-center justify-space-between pa-5">
          <div class="d-flex align-center gap-2">
            <VAvatar
              color="primary"
              variant="tonal"
              size="36"
            >
              <VIcon
                icon="ri-mail-send-line"
                size="20"
              />
            </VAvatar>
            <span class="text-h6">문의하기</span>
          </div>
          <VBtn
            icon
            size="small"
            variant="text"
            @click="close"
          >
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-5">
          <VAlert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            closable
            class="mb-4"
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </VAlert>

          <VForm
            ref="formRef"
            v-model="valid"
          >
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="form.name"
                  label="이름"
                  placeholder="홍길동"
                  :rules="[rules.required]"
                  prepend-inner-icon="ri-user-line"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="form.email"
                  label="이메일"
                  placeholder="example@email.com"
                  :rules="[rules.email]"
                  prepend-inner-icon="ri-mail-line"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="form.phone"
                  label="전화번호 (선택)"
                  placeholder="010-1234-5678"
                  prepend-inner-icon="ri-phone-line"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="form.type"
                  label="문의 유형"
                  :items="inquiryTypes"
                  :rules="[rules.required]"
                  prepend-inner-icon="ri-list-check"
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="form.content"
                  label="문의 내용"
                  placeholder="문의하실 내용을 자세히 작성해주세요."
                  :rules="[rules.required]"
                  rows="5"
                  auto-grow
                  counter
                />
              </VCol>

              <VCol cols="12">
                <VCheckbox
                  v-model="form.privacyAgreed"
                  :rules="[rules.privacyRequired]"
                  density="compact"
                >
                  <template #label>
                    <span class="text-body-2">
                      문의 접수 및 답변을 위한
                      <strong>개인정보 수집 및 이용</strong>에 동의합니다.
                      <span class="text-medium-emphasis">(이름, 이메일, 전화번호)</span>
                    </span>
                  </template>
                </VCheckbox>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-5">
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="close"
          >
            취소
          </VBtn>
          <VBtn
            color="primary"
            :loading="loading"
            :disabled="!valid"
            @click="submit"
          >
            <VIcon
              icon="ri-send-plane-line"
              start
            />
            문의 접수
          </VBtn>
        </VCardActions>
      </template>
    </VCard>
  </VDialog>
</template>
