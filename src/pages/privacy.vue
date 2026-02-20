<route lang="yaml">
meta:
  layout: public
  public: true
  title: 개인정보처리방침 - YEMO
  description: YEMO의 개인정보 처리 방침입니다. 고객님의 개인정보를 안전하게 보호합니다.
  keywords: 개인정보처리방침, 개인정보보호, 프라이버시
</route>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 pa-6 d-flex align-center flex-wrap ga-3">
        <span>YEMO(예모) 개인정보처리방침</span>
        <VChip
          color="primary"
          variant="elevated"
          size="small"
          label
        >
          시행일: 2026년 4월 1일
        </VChip>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <PrivacyContent />
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import PrivacyContent from '@/components/legal/PrivacyContent.vue'
</script>
