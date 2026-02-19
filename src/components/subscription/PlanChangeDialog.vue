<template>
  <VDialog
    :model-value="modelValue"
    max-width="1000"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon icon="ri-refresh-line" class="me-2" color="primary" />
          플랜 변경
        </div>
        <VBtn
          icon="ri-close-line"
          variant="text"
          size="small"
          @click="close"
        />
      </VCardTitle>

      <VCardText>
        <p class="text-body-1 text-medium-emphasis mb-6">
          변경할 플랜을 선택하세요. 현재 사용량을 초과하는 다운그레이드는 불가능합니다.
        </p>

        <!-- 플랜 카드들 -->
        <VRow>
          <VCol
            v-for="plan in plans"
            :key="plan.value"
            cols="12"
            sm="6"
            md="6"
          >
            <VCard
              :variant="selectedPlan === plan.value ? 'elevated' : 'outlined'"
              :color="selectedPlan === plan.value ? 'primary' : undefined"
              :class="{ 'cursor-pointer': !plan.disabled, 'opacity-50': plan.disabled }"
              :disabled="plan.disabled"
              @click="!plan.disabled && selectPlan(plan.value)"
            >
              <VCardText>
                <!-- 현재 플랜 표시 -->
                <VChip
                  v-if="currentPlan === plan.value"
                  color="success"
                  size="small"
                  class="mb-2"
                >
                  현재 플랜
                </VChip>

                <!-- 뱃지 -->
                <VChip
                  v-else-if="plan.badge"
                  :color="plan.badgeColor"
                  size="small"
                  class="mb-2"
                >
                  {{ plan.badge }}
                </VChip>

                <!-- 플랜 이름 -->
                <h4 class="text-h5 mb-2">
                  {{ plan.name }}
                </h4>

                <!-- 가격 -->
                <p class="text-h4 font-weight-bold mb-4">
                  {{ plan.priceText }}
                </p>

                <VDivider class="my-4" />

                <!-- 기능 목록 -->
                <VList density="compact" class="pa-0">
                  <VListItem
                    v-for="(feature, index) in plan.features"
                    :key="index"
                    class="px-0 text-body-2"
                  >
                    <template #prepend>
                      <VIcon
                        icon="ri-check-line"
                        size="20"
                        color="success"
                      />
                    </template>
                    <VListItemTitle class="text-body-2">
                      {{ feature }}
                    </VListItemTitle>
                  </VListItem>
                </VList>

                <!-- 다운그레이드 경고 -->
                <VAlert
                  v-if="plan.downgradeWarning"
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mt-4"
                >
                  <div class="text-caption">
                    {{ plan.downgradeWarning }}
                  </div>
                </VAlert>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- 선택된 플랜 정보 -->
        <VAlert
          v-if="selectedPlan && selectedPlan !== currentPlan"
          :type="isUpgrade ? 'success' : 'warning'"
          variant="tonal"
          class="mt-6"
        >
          <div class="d-flex align-center">
            <VIcon
              :icon="isUpgrade ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
              class="me-2"
            />
            <span>
              <strong>{{ isUpgrade ? '업그레이드' : '다운그레이드' }}</strong>:
              {{ getPlanName(currentPlan) }} → {{ getPlanName(selectedPlan) }}
            </span>
          </div>
        </VAlert>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="close"
        >
          취소
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :disabled="!selectedPlan || selectedPlan === currentPlan"
          @click="confirm"
        >
          플랜 변경
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currentPlan: {
    type: String,
    default: null,
  },
  currentStaffCount: {
    type: Number,
    default: 0,
  },
  currentReservationCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selectedPlan = ref(null)

// 플랜 제한 정보 (2티어: 무료 + 유료)
const planLimits = {
  FREE: { maxStaff: 1, maxReservations: 30 },
  PAID: { maxStaff: 5, maxReservations: -1 },
}

// 플랜 정보
const plans = computed(() => [
  {
    value: 'FREE',
    name: '무료',
    priceText: '0원',
    features: [
      '월 예약 30건',
      '스태프 1명',
      '기본 예약 관리',
      '고객 관리',
    ],
    disabled: isDowngradeBlocked('FREE'),
    downgradeWarning: getDowngradeWarning('FREE'),
  },
  {
    value: 'PAID',
    name: '유료',
    priceText: '20,000원~/월',
    badge: '추천',
    badgeColor: 'primary',
    features: [
      '월 예약 무제한',
      '스태프 5명',
      '카카오톡 알림',
      '통계 및 리포트',
    ],
    disabled: false,
  },
])

// 업그레이드 여부
const isUpgrade = computed(() => {
  if (!selectedPlan.value || !props.currentPlan) return false

  const planOrder = ['FREE', 'PAID']
  const currentIndex = planOrder.indexOf(props.currentPlan)
  const selectedIndex = planOrder.indexOf(selectedPlan.value)

  return selectedIndex > currentIndex
})

// 다운그레이드 차단 여부
function isDowngradeBlocked(planValue) {
  if (planValue === props.currentPlan) return false

  const limits = planLimits[planValue]
  if (!limits) return false

  // 스태프 수 초과
  if (limits.maxStaff !== -1 && props.currentStaffCount > limits.maxStaff) {
    return true
  }

  // 예약 수 초과 (현재는 체크 안 함 - 월간 카운트는 매월 리셋되므로)
  // if (limits.maxReservations !== -1 && props.currentReservationCount > limits.maxReservations) {
  //   return true
  // }

  return false
}

// 다운그레이드 경고 메시지
function getDowngradeWarning(planValue) {
  if (!isDowngradeBlocked(planValue)) return null

  const limits = planLimits[planValue]

  if (limits.maxStaff !== -1 && props.currentStaffCount > limits.maxStaff) {
    return `스태프 수(${props.currentStaffCount}명)가 제한(${limits.maxStaff}명)을 초과합니다`
  }

  return null
}

// 플랜 이름 가져오기
function getPlanName(planValue) {
  const plan = plans.value.find(p => p.value === planValue)
  return plan ? plan.name : planValue
}

// 플랜 선택
function selectPlan(planValue) {
  selectedPlan.value = planValue
}

// 확인
function confirm() {
  if (selectedPlan.value && selectedPlan.value !== props.currentPlan) {
    emit('confirm', selectedPlan.value)
  }
}

// 닫기
function close() {
  emit('update:modelValue', false)
}

// 다이얼로그가 열릴 때 선택 초기화
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedPlan.value = props.currentPlan
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-4px);
}

.opacity-50 {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
