<script setup>
import { ref, computed, watch } from 'vue'
import { useCouponStore } from '@/stores/coupon'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  coupon: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const couponStore = useCouponStore()

// 폼 데이터
const formData = ref({
  code: '',
  name: '',
  description: '',
  couponType: 'PERCENTAGE',
  discountPercentage: null,
  discountAmount: null,
  maxDiscountAmount: null,
  minOrderAmount: null,
  maxUsageCount: null,
  validFrom: null,
  validUntil: null,
})

// 폼 유효성 검사
const formValid = ref(false)
const codeRules = [
  v => !!v || '쿠폰 코드는 필수입니다',
  v => /^[A-Z0-9_-]+$/.test(v) || '쿠폰 코드는 영문 대문자, 숫자, _, - 만 사용 가능합니다',
  v => (v && v.length >= 4 && v.length <= 20) || '쿠폰 코드는 4-20자여야 합니다',
]
const nameRules = [
  v => !!v || '쿠폰 이름은 필수입니다',
  v => (v && v.length <= 100) || '쿠폰 이름은 100자 이하여야 합니다',
]
const discountPercentageRules = [
  v => formData.value.couponType !== 'PERCENTAGE' || !!v || '할인율은 필수입니다',
  v => formData.value.couponType !== 'PERCENTAGE' || (v >= 1 && v <= 100) || '할인율은 1-100% 사이여야 합니다',
]
const discountAmountRules = [
  v => formData.value.couponType !== 'FIXED_AMOUNT' || !!v || '할인 금액은 필수입니다',
  v => formData.value.couponType !== 'FIXED_AMOUNT' || v >= 1000 || '할인 금액은 최소 1,000원 이상이어야 합니다',
]
const maxUsageCountRules = [
  v => !v || v >= 1 || '최대 사용 횟수는 1회 이상이어야 합니다',
]
const validFromRules = [
  v => !!v || '유효 시작일은 필수입니다',
]
const validUntilRules = [
  v => !!v || '유효 종료일은 필수입니다',
  v => !formData.value.validFrom || !v || new Date(v) > new Date(formData.value.validFrom) || '종료일은 시작일 이후여야 합니다',
]

// 쿠폰 타입 옵션
const couponTypeOptions = [
  { title: '정률 할인 (%)', value: 'PERCENTAGE' },
  { title: '정액 할인 (원)', value: 'FIXED_AMOUNT' },
]

// 로딩 상태
const loading = ref(false)

// 편집 모드 여부
const isEditMode = computed(() => !!props.coupon)

// 다이얼로그 제목
const dialogTitle = computed(() => isEditMode.value ? '쿠폰 수정' : '쿠폰 생성')

// 쿠폰 타입에 따른 필드 표시
const isPercentageType = computed(() => formData.value.couponType === 'PERCENTAGE')
const isFixedAmountType = computed(() => formData.value.couponType === 'FIXED_AMOUNT')

// props.coupon이 변경되면 폼 데이터 초기화
watch(() => props.coupon, (newCoupon) => {
  if (newCoupon) {
    formData.value = {
      code: newCoupon.code || '',
      name: newCoupon.name || '',
      description: newCoupon.description || '',
      couponType: newCoupon.couponType || 'PERCENTAGE',
      discountPercentage: newCoupon.discountPercentage || null,
      discountAmount: newCoupon.discountAmount || null,
      maxDiscountAmount: newCoupon.maxDiscountAmount || null,
      minOrderAmount: newCoupon.minOrderAmount || null,
      maxUsageCount: newCoupon.maxUsageCount || null,
      validFrom: newCoupon.validFrom ? newCoupon.validFrom.split('T')[0] : null,
      validUntil: newCoupon.validUntil ? newCoupon.validUntil.split('T')[0] : null,
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 다이얼로그가 닫힐 때 폼 초기화
watch(() => props.modelValue, (newValue) => {
  if (!newValue && !props.coupon) {
    resetForm()
  }
})

// 쿠폰 타입 변경 시 불필요한 필드 초기화
watch(() => formData.value.couponType, (newType) => {
  if (newType === 'PERCENTAGE') {
    formData.value.discountAmount = null
  } else if (newType === 'FIXED_AMOUNT') {
    formData.value.discountPercentage = null
    formData.value.maxDiscountAmount = null
  }
})

// 폼 초기화
function resetForm() {
  formData.value = {
    code: '',
    name: '',
    description: '',
    couponType: 'PERCENTAGE',
    discountPercentage: null,
    discountAmount: null,
    maxDiscountAmount: null,
    minOrderAmount: null,
    maxUsageCount: null,
    validFrom: null,
    validUntil: null,
  }
}

// 쿠폰 저장
async function saveCoupon() {
  if (!formValid.value) return

  loading.value = true
  try {
    // API 요청 데이터 준비
    const requestData = {
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description,
      couponType: formData.value.couponType,
      minOrderAmount: formData.value.minOrderAmount || 0,
      maxUsageCount: formData.value.maxUsageCount || null,
      validFrom: formData.value.validFrom ? `${formData.value.validFrom}T00:00:00` : null,
      validUntil: formData.value.validUntil ? `${formData.value.validUntil}T23:59:59` : null,
    }

    // 쿠폰 타입에 따라 필드 추가
    if (formData.value.couponType === 'PERCENTAGE') {
      requestData.discountPercentage = formData.value.discountPercentage
      requestData.maxDiscountAmount = formData.value.maxDiscountAmount || null
    } else if (formData.value.couponType === 'FIXED_AMOUNT') {
      requestData.discountAmount = formData.value.discountAmount
    }

    if (isEditMode.value) {
      // 수정
      await couponStore.updateCoupon(props.coupon.id, requestData)
      emit('success', '쿠폰이 수정되었습니다.')
    } else {
      // 생성
      await couponStore.createCoupon(requestData)
      emit('success', '쿠폰이 생성되었습니다.')
    }

    closeDialog()
  } catch (error) {
    console.error('쿠폰 저장 실패:', error)
    emit('success', error.response?.data?.message || '쿠폰 저장에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 다이얼로그 닫기
function closeDialog() {
  emit('update:modelValue', false)
  if (!props.coupon) {
    resetForm()
  }
}

// 통화 포맷팅
function formatCurrency(value) {
  if (!value) return ''
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ dialogTitle }}</span>
        <VBtn
          icon="ri-close-line"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm v-model="formValid">
          <VRow>
            <!-- 쿠폰 코드 -->
            <VCol cols="12">
              <VTextField
                v-model="formData.code"
                label="쿠폰 코드"
                placeholder="예: WELCOME2024"
                :rules="codeRules"
                :disabled="isEditMode"
                variant="outlined"
                density="comfortable"
                required
              >
                <template #prepend-inner>
                  <VIcon icon="ri-coupon-line" />
                </template>
              </VTextField>
              <div class="text-caption text-medium-emphasis mt-n2 mb-2">
                영문 대문자, 숫자, _, - 만 사용 가능 (4-20자)
              </div>
            </VCol>

            <!-- 쿠폰 이름 -->
            <VCol cols="12">
              <VTextField
                v-model="formData.name"
                label="쿠폰 이름"
                placeholder="예: 신규 회원 환영 쿠폰"
                :rules="nameRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </VCol>

            <!-- 쿠폰 설명 -->
            <VCol cols="12">
              <VTextarea
                v-model="formData.description"
                label="쿠폰 설명"
                placeholder="쿠폰에 대한 상세 설명을 입력하세요"
                variant="outlined"
                density="comfortable"
                rows="3"
                auto-grow
              />
            </VCol>

            <!-- 쿠폰 타입 -->
            <VCol cols="12">
              <div class="text-subtitle-2 mb-2">쿠폰 타입</div>
              <VRadioGroup
                v-model="formData.couponType"
                inline
                :disabled="isEditMode"
              >
                <VRadio
                  v-for="option in couponTypeOptions"
                  :key="option.value"
                  :label="option.title"
                  :value="option.value"
                />
              </VRadioGroup>
            </VCol>

            <!-- 정률 할인 필드 -->
            <template v-if="isPercentageType">
              <VCol cols="12" md="6">
                <VTextField
                  v-model.number="formData.discountPercentage"
                  label="할인율"
                  placeholder="10"
                  type="number"
                  suffix="%"
                  :rules="discountPercentageRules"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model.number="formData.maxDiscountAmount"
                  label="최대 할인 금액"
                  placeholder="10000"
                  type="number"
                  suffix="원"
                  variant="outlined"
                  density="comfortable"
                  hint="미입력 시 제한 없음"
                  persistent-hint
                />
              </VCol>
            </template>

            <!-- 정액 할인 필드 -->
            <VCol v-if="isFixedAmountType" cols="12">
              <VTextField
                v-model.number="formData.discountAmount"
                label="할인 금액"
                placeholder="10000"
                type="number"
                suffix="원"
                :rules="discountAmountRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </VCol>

            <!-- 최소 주문 금액 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="formData.minOrderAmount"
                label="최소 주문 금액"
                placeholder="0"
                type="number"
                suffix="원"
                variant="outlined"
                density="comfortable"
                hint="0원 이상 입력"
                persistent-hint
              />
            </VCol>

            <!-- 최대 사용 횟수 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="formData.maxUsageCount"
                label="최대 사용 횟수"
                placeholder="100"
                type="number"
                suffix="회"
                :rules="maxUsageCountRules"
                variant="outlined"
                density="comfortable"
                hint="미입력 시 제한 없음"
                persistent-hint
              />
            </VCol>

            <!-- 유효 기간 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="formData.validFrom"
                label="유효 시작일"
                type="date"
                :rules="validFromRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formData.validUntil"
                label="유효 종료일"
                type="date"
                :rules="validUntilRules"
                variant="outlined"
                density="comfortable"
                required
              />
            </VCol>

            <!-- 할인 미리보기 -->
            <VCol v-if="formData.couponType && (formData.discountPercentage || formData.discountAmount)" cols="12">
              <VAlert
                type="info"
                variant="tonal"
                density="compact"
              >
                <template #prepend>
                  <VIcon icon="ri-information-line" />
                </template>
                <div class="text-body-2">
                  <strong>할인 정보:</strong>
                  <template v-if="isPercentageType">
                    {{ formData.discountPercentage }}% 할인
                    <span v-if="formData.maxDiscountAmount">
                      (최대 {{ formatCurrency(formData.maxDiscountAmount) }})
                    </span>
                  </template>
                  <template v-else-if="isFixedAmountType">
                    {{ formatCurrency(formData.discountAmount) }} 할인
                  </template>
                  <br>
                  <span v-if="formData.minOrderAmount > 0">
                    최소 주문 금액: {{ formatCurrency(formData.minOrderAmount) }}
                  </span>
                </div>
              </VAlert>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="closeDialog"
        >
          취소
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          :disabled="!formValid"
          @click="saveCoupon"
        >
          {{ isEditMode ? '수정' : '생성' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
