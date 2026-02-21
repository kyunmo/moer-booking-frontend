<script setup>
import { ref } from 'vue'
import InquiryFormDialog from '@/components/common/InquiryFormDialog.vue'

const isInquiryOpen = ref(false)
</script>

<template>
  <div class="h-100 d-flex align-center justify-space-between text-medium-emphasis">
    <!-- Footer: left content -->
    <div class="d-flex align-center text-base">
      &copy;
      {{ new Date().getFullYear() }},
      Made With By
      <a
        href="https://moer.io"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >MOER</a>
    </div>

    <!-- Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <RouterLink
        to="/terms"
        class="text-primary text-decoration-none"
      >
        이용약관
      </RouterLink>
      <RouterLink
        to="/privacy"
        class="text-primary text-decoration-none"
      >
        개인정보처리방침
      </RouterLink>
      <RouterLink
        to="/refund-policy"
        class="text-primary text-decoration-none"
      >
        환불정책
      </RouterLink>
      <RouterLink
        to="/support"
        class="text-primary text-decoration-none"
      >
        고객지원
      </RouterLink>
      <a
        href="#"
        class="text-primary text-decoration-none"
        @click.prevent="isInquiryOpen = true"
      >
        문의하기
      </a>
    </span>

    <InquiryFormDialog v-model="isInquiryOpen" />
  </div>
</template>
