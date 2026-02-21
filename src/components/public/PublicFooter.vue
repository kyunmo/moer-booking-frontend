<script setup>
import { ref } from 'vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import InquiryFormDialog from '@/components/common/InquiryFormDialog.vue'

const isInquiryOpen = ref(false)

// Service links
const serviceLinks = [
  { title: '기능 소개', to: '/features' },
  { title: '요금제', to: '/pricing' },
  { title: 'FAQ', to: '/faq' },
]

// Support links
const supportLinks = [
  { title: '고객지원', to: '/support' },
  { title: '이용 가이드', to: '/support' },
]

// Company links
const companyLinks = [
  { title: '이용약관', to: '/terms' },
  { title: '개인정보처리방침', to: '/privacy' },
  { title: '환불정책', to: '/refund-policy' },
]

// Social links
const socialLinks = [
  { icon: 'ri-instagram-line', href: '#', label: 'Instagram' },
  { icon: 'ri-youtube-line', href: '#', label: 'YouTube' },
]
</script>

<template>
  <div class="yemo-footer" style="margin-block-start: auto;">
    <!-- Footer Top -->
    <VSheet
      theme="dark"
      class="footer-top"
    >
      <VContainer>
        <VRow>
          <!-- Brand + Social -->
          <VCol
            cols="12"
            md="4"
          >
            <div class="footer-brand">
              <div class="d-flex align-center gap-2 mb-6">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="footer-title">
                  YEMO
                </h1>
              </div>

              <div class="text-body-1 footer-text mb-6" style="white-space: pre-line;">
                예약 관리의 새로운 기준.
                소상공인을 위한 올인원 예약 관리 솔루션
              </div>

              <div class="d-flex gap-x-1">
                <VBtn
                  v-for="social in socialLinks"
                  :key="social.label"
                  icon
                  size="small"
                  variant="text"
                  :href="social.href"
                  target="_blank"
                  :aria-label="social.label"
                >
                  <VIcon
                    :icon="social.icon"
                    size="18"
                    color="white"
                  />
                </VBtn>
              </div>
            </div>
          </VCol>

          <!-- Service Links -->
          <VCol
            cols="6"
            sm="4"
            md="2"
            offset-md="2"
          >
            <div class="footer-links">
              <div class="footer-heading mb-4">
                서비스
              </div>
              <ul class="footer-link-list">
                <li
                  v-for="link in serviceLinks"
                  :key="link.title"
                  class="mb-3"
                >
                  <RouterLink
                    :to="link.to"
                    class="footer-link text-body-1"
                  >
                    {{ link.title }}
                  </RouterLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- Support Links -->
          <VCol
            cols="6"
            sm="4"
            md="2"
          >
            <div class="footer-links">
              <div class="footer-heading mb-4">
                지원
              </div>
              <ul class="footer-link-list">
                <li
                  v-for="link in supportLinks"
                  :key="link.title"
                  class="mb-3"
                >
                  <RouterLink
                    :to="link.to"
                    class="footer-link text-body-1"
                  >
                    {{ link.title }}
                  </RouterLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- Company Links -->
          <VCol
            cols="6"
            sm="4"
            md="2"
          >
            <div class="footer-links">
              <div class="footer-heading mb-4">
                회사
              </div>
              <ul class="footer-link-list">
                <li
                  v-for="link in companyLinks"
                  :key="link.title"
                  class="mb-3"
                >
                  <RouterLink
                    :to="link.to"
                    class="footer-link text-body-1"
                  >
                    {{ link.title }}
                  </RouterLink>
                </li>
              </ul>

              <div class="mt-6">
                <div class="text-body-2 footer-text mb-1">
                  대표 구균모
                </div>
                <div class="text-body-2 footer-text mb-2">
                  kkm@moer.io
                </div>
                <VBtn
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="isInquiryOpen = true"
                >
                  문의하기
                </VBtn>
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>

    <InquiryFormDialog v-model="isInquiryOpen" />

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <VContainer>
        <div class="d-flex justify-center align-center py-4">
          <span
            class="text-body-2"
            style="color: rgba(255, 255, 255, 0.6);"
          >
            &copy; {{ new Date().getFullYear() }} YEMO. All rights reserved.
          </span>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  background-color: #1e1b2e;
  padding-block-end: 1.25rem;
  padding-block-start: 3.75rem;
}

.footer-heading {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-size: 1rem;
  font-weight: 600;
  line-height: 22px;
}

.footer-text {
  color: rgba(255, 255, 255, 0.6);
}

.footer-title {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5rem;
}

.footer-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
}

.footer-bottom {
  background-color: #16132a;
}

.yemo-footer {
  color: rgba(255, 255, 255, 70%);
}
</style>

<style lang="scss">
.footer-brand {
  @media (min-width: 1280px) {
    max-inline-size: 400px;
  }
}

.yemo-footer {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
