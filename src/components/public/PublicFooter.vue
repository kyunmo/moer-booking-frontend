<script setup>
import { ref } from 'vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const showBusinessInfo = ref(false)

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
  { icon: 'ri-instagram-line', href: 'https://instagram.com/moer.io.dev', label: 'Instagram' },
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
                <span class="footer-title">
                  모에르(MOER)
                </span>
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
                <!-- 모바일: 접기/펼치기 -->
                <div class="d-sm-none">
                  <VBtn
                    variant="text"
                    size="small"
                    class="footer-text px-0"
                    :append-icon="showBusinessInfo ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
                    aria-label="사업자 정보 보기"
                    @click="showBusinessInfo = !showBusinessInfo"
                  >
                    사업자 정보
                  </VBtn>
                  <div v-show="showBusinessInfo" class="mt-2">
                    <div class="text-body-2 footer-text mb-1">
                      사업자등록번호 744-02-03358
                    </div>
                    <div class="text-body-2 footer-text">
                      경기도 의왕시 백운중앙로 46
                    </div>
                  </div>
                </div>

                <!-- 데스크톱: 항상 표시 -->
                <div class="d-none d-sm-block">
                  <div class="text-body-2 footer-text mb-1">
                    사업자등록번호 744-02-03358
                  </div>
                  <div class="text-body-2 footer-text">
                    경기도 의왕시 백운중앙로 46
                  </div>
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <VContainer>
        <div class="d-flex justify-center align-center py-4">
          <span
            class="text-body-2"
            style="color: rgba(255, 255, 255, 0.7);"
          >
            &copy; {{ new Date().getFullYear() }} 모에르(MOER). All rights reserved.
          </span>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  background-color: #1e1b2e;
  background-color: rgb(var(--v-theme-surface-variant), 1);
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
  color: rgba(255, 255, 255, 0.7);
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
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
}

.footer-bottom {
  background-color: #16132a;

  @supports (background-color: color-mix(in srgb, red, blue)) {
    background-color: color-mix(in srgb, rgb(var(--v-theme-surface-variant)) 85%, black);
  }
}

.yemo-footer {
  color: rgba(255, 255, 255, 0.8);
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
