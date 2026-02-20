<route lang="yaml">
meta:
  layout: public
  public: true
  title: YEMO - 예약 관리 자동화 솔루션
  description: 예약 관리, 이제 자동으로 해결하세요. 고객이 직접 예약하고 카카오톡으로 자동 알림. 5분이면 시작 가능, 무료로 시작 가능.
  keywords: 예약 시스템, 예약 관리, 카카오톡 알림, 자동 예약, 미용실 예약, 필라테스 예약, 스터디카페 예약
</route>

<script setup>
import CtaBannerSection from '@/components/public/landing/CtaBannerSection.vue'
import FaqPreviewSection from '@/components/public/landing/FaqPreviewSection.vue'
import FeaturesSection from '@/components/public/landing/FeaturesSection.vue'
import HeroSection from '@/components/public/landing/HeroSection.vue'
import PricingPreviewSection from '@/components/public/landing/PricingPreviewSection.vue'
import ProblemSolutionSection from '@/components/public/landing/ProblemSolutionSection.vue'
import TargetUsersSection from '@/components/public/landing/TargetUsersSection.vue'
import TestimonialsSection from '@/components/public/landing/TestimonialsSection.vue'
import UseCasesSection from '@/components/public/landing/UseCasesSection.vue'
</script>

<template>
  <div class="landing-page">
    <HeroSection />
    <ProblemSolutionSection />
    <FeaturesSection />
    <UseCasesSection />
    <TestimonialsSection />
    <TargetUsersSection />
    <PricingPreviewSection />
    <FaqPreviewSection />
    <CtaBannerSection />
  </div>
</template>

<style lang="scss" scoped>
.landing-page {
  inline-size: 100%;
}
</style>
