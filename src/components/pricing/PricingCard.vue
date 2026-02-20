<script setup>
import { computed } from 'vue'
import { PLANS, BILLING_CYCLES, getMonthlyEquivalent, formatCurrency } from '@/constants/pricing'

const props = defineProps({
  plan: {
    type: String,
    required: true,
    validator: value => ['FREE', 'PAID'].includes(value),
  },
  billingCycle: {
    type: String,
    default: 'monthly',
    validator: value => ['monthly', 'yearly'].includes(value),
  },
  selected: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const isYearly = computed(() => props.billingCycle === BILLING_CYCLES.YEARLY)

// 플랜 정보 (2티어: 무료 + 유료)
const planInfo = computed(() => {
  const planData = PLANS[props.plan]
  if (!planData) return null

  return {
    name: planData.name,
    description: planData.description,
    color: planData.color,
    icon: planData.icon,
    badge: planData.key === 'PAID' ? '추천' : undefined,
    features: planData.features,
    limits: planData.limits,
    yearlyBadge: planData.yearlyBadge,
  }
})

// 가격 표시 computed (VAT 포함 기준)
const priceDisplay = computed(() => {
  if (props.plan === 'FREE') {
    return {
      mainPrice: '0원',
      period: '/월',
      subText: null,
      originalPrice: null,
      savingsBadge: null,
    }
  }

  const planData = PLANS[props.plan]
  const monthlyEquivalent = getMonthlyEquivalent(props.plan, props.billingCycle)

  if (isYearly.value) {
    return {
      mainPrice: formatCurrency(monthlyEquivalent),
      period: '/월',
      subText: `연 ${formatCurrency(planData.yearlyPriceVatIncluded)} (VAT 포함)`,
      originalPrice: formatCurrency(planData.monthlyPriceVatIncluded),
      savingsBadge: planData.yearlyBadge,
    }
  }

  return {
    mainPrice: formatCurrency(planData.monthlyPriceVatIncluded),
    period: '/월',
    subText: null,
    originalPrice: null,
    savingsBadge: null,
  }
})

function handleSelect() {
  emit('select', props.plan)
}
</script>

<template>
  <VCard
    :class="[
      'pricing-card',
      { 'pricing-card--selected': selected },
      { 'pricing-card--compact': compact }
    ]"
    :color="selected ? planInfo.color : undefined"
    :variant="selected ? 'tonal' : 'outlined'"
    @click="handleSelect"
  >
    <!-- 인기 뱃지 -->
    <div v-if="planInfo.badge" class="pricing-card__badge">
      <VChip
        :color="planInfo.color"
        size="small"
        label
      >
        <VIcon :icon="planInfo.icon" start size="16" />
        {{ planInfo.badge }}
      </VChip>
    </div>

    <VCardText>
      <!-- 플랜명 -->
      <div class="text-center mb-4">
        <VIcon
          :icon="planInfo.icon"
          :color="planInfo.color"
          size="40"
          class="mb-2"
        />
        <h3 class="text-h5 font-weight-bold mb-1">
          {{ planInfo.name }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ planInfo.description }}
        </p>
      </div>

      <!-- 가격 -->
      <div class="text-center mb-4">
        <!-- 연간 결제: 취소선 원래 가격 -->
        <div v-if="priceDisplay.originalPrice" class="mb-1">
          <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
            {{ priceDisplay.originalPrice }}
          </span>
          <VChip
            v-if="priceDisplay.savingsBadge"
            color="success"
            size="x-small"
            label
            class="ms-2"
          >
            {{ priceDisplay.savingsBadge }}
          </VChip>
        </div>

        <!-- 메인 가격 -->
        <div class="d-flex align-center justify-center">
          <span class="text-h3 font-weight-bold" :class="`text-${planInfo.color}`">
            {{ priceDisplay.mainPrice }}
          </span>
          <span v-if="priceDisplay.period" class="text-body-1 ms-1">
            {{ priceDisplay.period }}
          </span>
        </div>

        <!-- VAT 포함 또는 연간 총액 -->
        <div v-if="plan !== 'FREE'" class="text-caption text-medium-emphasis mt-1">
          <template v-if="priceDisplay.subText">
            {{ priceDisplay.subText }}
          </template>
          <template v-else>
            VAT 포함
          </template>
        </div>
      </div>

      <VDivider class="my-4" />

      <!-- 기능 목록 -->
      <VList v-if="!compact" density="compact" class="pa-0 mb-4">
        <VListItem
          v-for="(feature, index) in planInfo.features"
          :key="index"
          class="px-0"
        >
          <template #prepend>
            <VIcon
              icon="ri-check-line"
              :color="planInfo.color"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle class="text-body-2">
            {{ feature }}
          </VListItemTitle>
        </VListItem>

        <!-- 제한 사항 -->
        <VListItem
          v-for="(limit, index) in planInfo.limits"
          :key="`limit-${index}`"
          class="px-0"
        >
          <template #prepend>
            <VIcon
              icon="ri-close-line"
              color="error"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle class="text-body-2 text-medium-emphasis">
            {{ limit }}
          </VListItemTitle>
        </VListItem>
      </VList>

      <!-- 선택 버튼 -->
      <VBtn
        block
        :color="planInfo.color"
        :variant="selected ? 'flat' : 'outlined'"
        size="large"
        @click.stop="handleSelect"
      >
        <VIcon
          v-if="selected"
          icon="ri-check-line"
          start
        />
        {{ selected ? '선택됨' : '선택하기' }}
      </VBtn>

      <!-- 30일 무료 체험 안내 -->
      <div v-if="plan !== 'FREE' && !compact" class="text-center mt-3">
        <VChip
          color="success"
          variant="tonal"
          size="small"
          prepend-icon="ri-gift-line"
        >
          30일 무료 체험
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.pricing-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &--selected {
    border-width: 2px;
  }

  &--compact {
    .v-card-text {
      padding: 16px;
    }
  }

  &__badge {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
  }
}
</style>
