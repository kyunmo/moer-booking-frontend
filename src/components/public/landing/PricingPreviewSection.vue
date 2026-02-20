<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const plans = [
  {
    name: '무료',
    key: 'FREE',
    color: 'secondary',
    icon: 'ri-leaf-line',
    price: '0',
    period: '원/월',
    features: [
      '월 30건 예약',
      '스태프 1명',
      '기본 예약 관리',
    ],
    badge: null,
    variant: 'outlined',
  },
  {
    name: '유료',
    key: 'PAID',
    color: 'primary',
    icon: 'ri-vip-crown-line',
    price: '22,000',
    period: '원/월 (VAT 포함)',
    features: [
      '무제한 예약',
      '스태프 5명',
      '카카오톡 알림',
    ],
    badge: '30일 무료 체험',
    variant: 'tonal',
  },
]

function handlePlanSelect(plan) {
  router.push({ path: '/register', query: { plan } })
}
</script>

<template>
  <section id="pricing" class="pricing-section">
    <VContainer>
      <!-- Section Header -->
      <div class="text-center mb-10">
        <VChip
          color="primary"
          variant="tonal"
          class="mb-4"
          prepend-icon="ri-price-tag-3-line"
        >
          요금제
        </VChip>

        <h2 class="text-h4 font-weight-bold mb-3">
          간단하고 투명한 요금제
        </h2>

        <p class="text-body-1 text-medium-emphasis">
          숨겨진 비용 없이, 필요한 만큼만 사용하세요
        </p>
      </div>

      <!-- Pricing Cards -->
      <VRow justify="center">
        <VCol
          v-for="plan in plans"
          :key="plan.key"
          cols="12"
          sm="6"
          md="5"
        >
          <VCard
            class="pricing-card h-100"
            :variant="plan.variant"
            :color="plan.variant === 'tonal' ? plan.color : undefined"
          >
            <!-- Badge -->
            <div
              v-if="plan.badge"
              class="pricing-card__badge"
            >
              <VChip
                color="success"
                size="small"
                label
                prepend-icon="ri-gift-line"
              >
                {{ plan.badge }}
              </VChip>
            </div>

            <VCardText class="text-center pa-8">
              <!-- Plan Icon & Name -->
              <VIcon
                :icon="plan.icon"
                :color="plan.color"
                size="40"
                class="mb-3"
              />

              <h3 class="text-h5 font-weight-bold mb-4">
                {{ plan.name }}
              </h3>

              <!-- Price -->
              <div class="d-flex align-center justify-center mb-6">
                <span
                  class="text-h3 font-weight-bold"
                  :class="`text-${plan.color}`"
                >
                  {{ plan.price }}
                </span>
                <span class="text-body-1 ms-1">
                  {{ plan.period }}
                </span>
              </div>

              <VDivider class="mb-6" />

              <!-- Features -->
              <div class="text-start">
                <div
                  v-for="(feature, fIndex) in plan.features"
                  :key="fIndex"
                  class="d-flex align-center gap-2 mb-3"
                >
                  <VIcon
                    icon="ri-check-line"
                    :color="plan.color"
                    size="20"
                  />
                  <span class="text-body-2">{{ feature }}</span>
                </div>
              </div>

              <!-- Select Button -->
              <VBtn
                block
                :color="plan.color"
                :variant="plan.key === 'PAID' ? 'flat' : 'outlined'"
                size="large"
                class="mt-6"
                @click="handlePlanSelect(plan.key)"
              >
                {{ plan.key === 'PAID' ? '무료 체험 시작' : '무료로 시작' }}
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- CTA Link -->
      <div class="text-center mt-8">
        <VBtn
          variant="text"
          to="/pricing"
          append-icon="ri-arrow-right-line"
        >
          요금제 상세 보기
        </VBtn>
      </div>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.pricing-section {
  padding-block: 5rem;
  background-color: rgb(var(--v-theme-background));
}

.pricing-card {
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }

  &__badge {
    position: absolute;
    inset-block-start: 12px;
    inset-inline-end: 12px;
    z-index: 1;
  }
}

@media (max-width: 600px) {
  .pricing-section {
    padding-block: 3rem;
  }
}
</style>
