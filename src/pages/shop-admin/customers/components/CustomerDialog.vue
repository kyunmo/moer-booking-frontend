<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon
          :icon="isEditMode ? 'ri-edit-line' : 'ri-user-add-line'"
          size="24"
          class="me-2"
        />
        <span>{{ isEditMode ? '고객 정보 수정' : '새 고객 등록' }}</span>

        <VSpacer />

        <VBtn
          icon="ri-close-line"
          variant="text"
          @click="closeDialog"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 이름 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="이름"
                prepend-inner-icon="ri-user-line"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="전화번호"
                prepend-inner-icon="ri-phone-line"
                placeholder="010-1234-5678"
                :rules="[required, phoneRule]"
                required
              />
            </VCol>

            <!-- 이메일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.email"
                label="이메일"
                prepend-inner-icon="ri-mail-line"
                placeholder="example@email.com"
                type="email"
              />
            </VCol>

            <!-- 생년월일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.birthDate"
                label="생년월일"
                prepend-inner-icon="ri-calendar-line"
                type="date"
              />
            </VCol>

            <!-- 성별 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.gender"
                label="성별"
                :items="genderOptions"
                prepend-inner-icon="ri-user-line"
                clearable
              />
            </VCol>

            <!-- 태그 -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="form.tags"
                label="태그"
                :items="tagOptions"
                prepend-inner-icon="ri-price-tag-3-line"
                multiple
                chips
                closable-chips
              />
            </VCol>

            <!-- 메모 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.memo"
                label="메모"
                prepend-inner-icon="ri-file-text-line"
                placeholder="고객 특이사항, 선호 스타일 등을 입력하세요"
                rows="3"
                auto-grow
              />
            </VCol>

            <!-- 읽기 전용 정보 (수정 모드일 때만) -->
            <template v-if="isEditMode">
              <VCol cols="12">
                <VDivider class="my-2" />
              </VCol>

              <VCol cols="12" md="4">
                <VTextField
                  :model-value="customer?.visitCount || 0"
                  label="방문 횟수"
                  prepend-inner-icon="ri-calendar-check-line"
                  readonly
                  suffix="회"
                />
              </VCol>

              <VCol cols="12" md="4">
                <VTextField
                  :model-value="formatPrice(customer?.totalSpent || 0)"
                  label="총 결제 금액"
                  prepend-inner-icon="ri-money-dollar-circle-line"
                  readonly
                />
              </VCol>

              <VCol cols="12" md="4">
                <VTextField
                  :model-value="formatDate(customer?.lastVisit)"
                  label="최근 방문일"
                  prepend-inner-icon="ri-calendar-event-line"
                  readonly
                />
              </VCol>
            </template>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />

        <VBtn
          color="secondary"
          variant="outlined"
          @click="closeDialog"
        >
          취소
        </VBtn>

        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? '수정' : '등록' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useCustomerStore } from '@/stores/customer'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  customer: Object,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const customerStore = useCustomerStore()

const formRef = ref(null)
const loading = ref(false)

const isEditMode = computed(() => !!props.customer)

const form = ref({
  name: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: null,
  tags: [],
  memo: '',
})

// 옵션들
const genderOptions = [
  { title: '남성', value: 'MALE' },
  { title: '여성', value: 'FEMALE' },
]

const tagOptions = [
  'VIP',
  '단골',
  '신규',
  '재방문',
  '이벤트',
]

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

const phoneRule = value => {
  if (!value) return true
  const pattern = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
  return pattern.test(value) || '올바른 전화번호 형식이 아닙니다.'
}

// 금액 포맷
function formatPrice(price) {
  if (!price) return '0원'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// 다이얼로그 열릴 때
watch(() => props.modelValue, newVal => {
  if (newVal) {
    if (props.customer) {
      // 수정 모드
      form.value = {
        name: props.customer.name,
        phone: props.customer.phone,
        email: props.customer.email || '',
        birthDate: props.customer.birthDate || '',
        gender: props.customer.gender || null,
        tags: props.customer.tags || [],
        memo: props.customer.memo || '',
      }
    }
    else {
      // 등록 모드
      form.value = {
        name: '',
        phone: '',
        email: '',
        birthDate: '',
        gender: null,
        tags: [],
        memo: '',
      }
    }
  }
})

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    if (isEditMode.value) {
      // 수정
      await customerStore.updateCustomer(props.customer.id, form.value)
    }
    else {
      // 등록
      await customerStore.createCustomer(form.value)
    }

    emit('saved')
  }
  catch (error) {
    console.error('고객 저장 실패:', error)
    alert(error || '고객 저장에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}

// 다이얼로그 닫기
function closeDialog() {
  emit('update:modelValue', false)
}
</script>
