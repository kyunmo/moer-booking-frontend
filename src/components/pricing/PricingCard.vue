<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: {
    type: String,
    required: true,
    validator: value => ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'].includes(value),
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

// 플랜 정보 (백엔드 스펙 기준)
const planInfo = computed(() => {
  const plans = {
    FREE: {
      name: '무료',
      price: 0,
      priceText: '0원',
      period: '/월',
      description: '체험용으로 딱!',
      color: 'info',
      icon: 'ri-gift-line',
      features: [
        '월 예약 30건',
        '직원 1명',
        '기본 예약 관리',
        '고객 관리',
      ],
      limits: [
        '광고 표시',
        '제한된 기능',
      ],
    },
    BASIC: {
      name: '베이직',
      price: 29000,
      priceText: '29,000원',
      period: '/월',
      description: '대부분 고객 선택',
      color: 'success',
      icon: 'ri-star-line',
      badge: '인기',
      features: [
        '월 예약 100건',
        '직원 3명',
        '예약 캘린더',
        '고객 태그 관리',
        '카카오톡 알림',
        '광고 제거',
      ],
    },
    PRO: {
      name: '프로',
      price: 79000,
      priceText: '79,000원',
      period: '/월',
      description: '중대형 매장 추천',
      color: 'primary',
      icon: 'ri-vip-crown-line',
      features: [
        '월 예약 500건',
        '직원 10명',
        '모든 베이직 기능',
        '재방문 알림',
        '디자이너별 성과',
        '고급 통계',
      ],
    },
    ENTERPRISE: {
      name: '엔터프라이즈',
      price: null,
      priceText: '문의',
      period: '',
      description: '대규모 체인점',
      color: 'secondary',
      icon: 'ri-building-line',
      features: [
        '무제한 예약',
        '무제한 직원',
        '모든 프로 기능',
        '전담 계정 매니저',
        '커스텀 기능',
      ],
    },
  }

  return plans[props.plan]
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
        <div class="d-flex align-center justify-center">
          <span class="text-h3 font-weight-bold" :class="`text-${planInfo.color}`">
            {{ planInfo.priceText }}
          </span>
          <span v-if="planInfo.period" class="text-body-1 ms-1">
            {{ planInfo.period }}
          </span>
        </div>
        <div v-if="plan !== 'FREE'" class="text-caption text-medium-emphasis mt-1">
          VAT 별도
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
