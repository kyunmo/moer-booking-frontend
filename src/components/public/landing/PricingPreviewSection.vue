<script setup>
import PricingCard from '@/components/pricing/PricingCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handlePlanSelect(plan) {
  router.push({ path: '/register', query: { plan } })
}
</script>

<template>
  <section id="pricing" class="pricing-section">
    <VContainer>
      <!-- Section Header -->
      <div class="headers d-flex justify-center flex-column align-center mb-10">
        <VChip color="primary" variant="tonal" class="mb-4" prepend-icon="ri-price-tag-3-line">
          요금제
        </VChip>
        <div class="mb-2 text-center">
          <span class="text-h4 font-weight-bold">간단하고 투명한 요금제</span>
        </div>
        <p class="text-body-1 font-weight-medium text-center text-medium-emphasis mb-0">
          숨겨진 비용 없이, 업종과 규모에 맞는 플랜을 선택하세요
        </p>
        <VChip color="success" variant="tonal" size="large" prepend-icon="ri-gift-line" class="mt-4">
          30일 무료 체험
        </VChip>
      </div>

      <!-- 3 Pricing Cards -->
      <VRow justify="center">
        <VCol v-for="plan in ['FREE', 'BASIC', 'PRO']" :key="plan" cols="12" sm="6" md="4">
          <PricingCard
            :plan="plan"
            :selected="plan === 'BASIC'"
            @select="handlePlanSelect"
          />
        </VCol>
      </VRow>

      <!-- View full pricing page link -->
      <div class="text-center mt-8">
        <VBtn variant="text" to="/pricing" append-icon="ri-arrow-right-line">
          상세 비교표 보기
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
</style>
