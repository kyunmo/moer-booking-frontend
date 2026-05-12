<script setup>
import HeroSection from '@/components/yemo/marketing/landing/HeroSection.vue'
import PainPointSection from '@/components/yemo/marketing/landing/PainPointSection.vue'
import SolutionSection from '@/components/yemo/marketing/landing/SolutionSection.vue'
import FeaturesSection from '@/components/yemo/marketing/landing/FeaturesSection.vue'
import IndustrySection from '@/components/yemo/marketing/landing/IndustrySection.vue'
import TestimonialsSection from '@/components/yemo/marketing/landing/TestimonialsSection.vue'
import PricingPreviewSection from '@/components/yemo/marketing/landing/PricingPreviewSection.vue'
import FaqPreviewSection from '@/components/yemo/marketing/landing/FaqPreviewSection.vue'
import FinalCtaSection from '@/components/yemo/marketing/landing/FinalCtaSection.vue'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: 'YEMO — 예약 관리 솔루션 · 예약은 예모로',
    description: '전화 받느라 손님 시술 놓치지 마세요. 고객이 직접 예약하고 카카오톡으로 자동 알림. 5분 안에 시작, 30일 무료 체험.',
    keywords: '예약 시스템, 예약 관리, 카카오톡 알림, 자동 예약, 미용실 예약, 필라테스 예약, 스터디카페 예약',
  },
})
</script>

<template>
  <HeroSection />
  <PainPointSection />
  <SolutionSection />
  <FeaturesSection />
  <IndustrySection />
  <TestimonialsSection />
  <PricingPreviewSection />
  <FaqPreviewSection />
  <FinalCtaSection />
</template>
