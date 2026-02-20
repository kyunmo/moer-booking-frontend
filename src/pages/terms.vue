<route lang="yaml">
meta:
  layout: public
  public: true
  title: 이용약관 - YEMO
  description: YEMO 서비스 이용약관입니다. 서비스 이용 전 반드시 확인해주세요.
  keywords: 이용약관, 서비스 약관, 이용 조건
</route>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 pa-6 d-flex align-center flex-wrap ga-3">
        YEMO(예모) 서비스 이용약관
        <VChip
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="ri-calendar-line"
        >
          시행일: 2026년 4월 1일
        </VChip>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <TermsContent />
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import TermsContent from '@/components/legal/TermsContent.vue'
</script>
