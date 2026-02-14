<script setup>
const currentYear = new Date().getFullYear()

// 링크 그룹
const linkGroups = [
  {
    title: '서비스',
    links: [
      { title: '기능 소개', to: '/features' },
      { title: '요금제', to: '/pricing' },
      { title: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: '지원',
    links: [
      { title: '이용 가이드', to: '/support' },
      { title: '1:1 문의', to: '/support' },
    ],
  },
  {
    title: '회사',
    links: [
      { title: '이용약관', to: '/terms' },
      { title: '개인정보처리방침', to: '/privacy' },
    ],
  },
]

// SNS 링크
const socialLinks = [
  { icon: 'ri-instagram-line', href: '#', label: 'Instagram' },
  { icon: 'ri-youtube-line', href: '#', label: 'YouTube' },
]
</script>

<template>
  <VFooter class="public-footer bg-surface">
    <VContainer>
      <VRow>
        <!-- 회사 정보 -->
        <VCol cols="12" md="4" class="mb-6 mb-md-0">
          <h3 class="text-h6 font-weight-bold mb-3">
            YEMO
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            예약 관리의 새로운 기준
          </p>

          <div class="text-body-2 text-medium-emphasis mb-4">
            <div class="mb-1">대표: 구균모</div>
            <div class="mb-1">이메일: support@YEMO.io</div>
          </div>

          <!-- SNS 링크 -->
          <div class="d-flex gap-2">
            <VBtn
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :icon="social.icon"
              variant="text"
              size="small"
              target="_blank"
              :aria-label="social.label"
            />
          </div>
        </VCol>

        <!-- 링크 그룹 -->
        <VCol
          v-for="(group, index) in linkGroups"
          :key="group.title"
          cols="6"
          md="2"
          :offset-md="index === 0 ? 2 : 0"
        >
          <h4 class="text-subtitle-1 font-weight-bold mb-3">
            {{ group.title }}
          </h4>
          <VList density="compact" class="pa-0">
            <VListItem
              v-for="link in group.links"
              :key="link.title"
              :to="link.to"
              class="px-0"
              min-height="32"
            >
              <VListItemTitle class="text-body-2 text-medium-emphasis">
                {{ link.title }}
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCol>
      </VRow>

      <VDivider class="my-6" />

      <!-- Copyright -->
      <div class="text-center text-body-2 text-medium-emphasis">
        © {{ currentYear }} YEMO. All rights reserved.
      </div>
    </VContainer>
  </VFooter>
</template>

<style lang="scss" scoped>
.public-footer {
  margin-top: auto;
  padding-top: 60px;
  padding-bottom: 40px;
}
</style>
