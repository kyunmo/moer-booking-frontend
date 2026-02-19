<route lang="yaml">
meta:
  layout: public
  public: true
  title: 고객 지원 - YEMO
  description: YEMO 고객 지원 센터. 이메일, 카카오톡으로 빠르고 친절하게 도와드립니다.
  keywords: 고객 지원, 문의, 상담, 헬프 데스크
</route>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const contactChannels = [
  {
    icon: 'ri-mail-line',
    color: 'primary',
    title: '이메일 문의',
    description: '궁금하신 사항을 이메일로 보내주세요.\n평균 4시간 이내 답변드립니다.',
    action: '이메일 보내기',
    href: 'mailto:kkm@moer.io',
    info: 'kkm@moer.io',
  },
  {
    icon: 'ri-kakao-talk-line',
    color: 'warning',
    title: '카카오톡 문의',
    description: '카카오톡 채널을 추가하고\n실시간으로 상담받으세요.',
    action: '채널 추가하기',
    href: '#',
    info: '@yemo',
  },
  {
    icon: 'ri-question-answer-line',
    color: 'success',
    title: '자주 묻는 질문',
    description: 'FAQ에서 빠른 답변을 찾아보세요.\n대부분의 궁금증을 해결할 수 있습니다.',
    action: 'FAQ 바로가기',
    to: '/faq',
    info: '25개 이상의 FAQ',
  },
]

const supportInfo = [
  { icon: 'ri-time-line', title: '운영 시간', items: ['평일: 09:00 - 18:00', '주말 및 공휴일: 휴무'] },
  { icon: 'ri-mail-check-line', title: '이메일 접수', items: ['24시간 접수 가능', '영업일 기준 1일 이내 답변'] },
  { icon: 'ri-shield-check-line', title: '유료 플랜 우선 지원', items: ['빠른 응답 (4시간 이내)', '1:1 온보딩 가이드'] },
]

function goToFaq() {
  router.push('/faq')
}

function startFreeTrial() {
  router.push('/register')
}
</script>

<template>
  <div class="support-page">
    <!-- Hero Section -->
    <section class="support-hero-section">
      <VContainer>
        <div class="text-center py-12">
          <VChip color="primary" variant="tonal" class="mb-4" prepend-icon="ri-customer-service-line">
            고객 지원
          </VChip>
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
            어떻게 도와드릴까요?
          </h1>
          <p class="text-body-1 text-medium-emphasis">
            궁금한 점이 있으시면 언제든 연락주세요.<br>
            전문 상담원이 친절하게 도와드리겠습니다.
          </p>
        </div>
      </VContainer>
    </section>

    <!-- Contact Channels -->
    <section class="contact-section">
      <VContainer>
        <VRow justify="center">
          <VCol
            v-for="channel in contactChannels"
            :key="channel.title"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard class="contact-card h-100 text-center" hover>
              <VCardText class="pa-8">
                <VAvatar :color="channel.color" variant="tonal" size="72" class="mb-4">
                  <VIcon :icon="channel.icon" size="36" />
                </VAvatar>
                <h5 class="text-h6 font-weight-bold mb-2">
                  {{ channel.title }}
                </h5>
                <p
                  class="text-body-2 text-medium-emphasis mb-2"
                  style="white-space: pre-line;"
                >
                  {{ channel.description }}
                </p>
                <VChip size="small" variant="tonal" :color="channel.color" class="mb-4">
                  {{ channel.info }}
                </VChip>
                <div>
                  <VBtn
                    v-if="channel.to"
                    :color="channel.color"
                    variant="elevated"
                    :to="channel.to"
                  >
                    {{ channel.action }}
                  </VBtn>
                  <VBtn
                    v-else
                    :color="channel.color"
                    variant="elevated"
                    :href="channel.href"
                  >
                    {{ channel.action }}
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- Support Info -->
    <section class="info-section">
      <VContainer>
        <div class="text-center mb-8">
          <h2 class="text-h5 font-weight-bold">
            지원 안내
          </h2>
        </div>
        <VRow justify="center">
          <VCol
            v-for="info in supportInfo"
            :key="info.title"
            cols="12"
            md="4"
          >
            <VCard variant="outlined" class="h-100">
              <VCardText class="pa-6">
                <div class="d-flex align-center mb-4">
                  <VIcon :icon="info.icon" size="24" color="primary" class="me-3" />
                  <h6 class="text-subtitle-1 font-weight-bold">
                    {{ info.title }}
                  </h6>
                </div>
                <div
                  v-for="item in info.items"
                  :key="item"
                  class="text-body-2 text-medium-emphasis mb-2"
                >
                  {{ item }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <VContainer>
        <VRow align="center" justify="center">
          <VCol cols="12" md="8" class="text-center">
            <h2 class="text-h4 font-weight-bold mb-4">
              아직 궁금한 점이 있으신가요?
            </h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              직접 체험해보시면 더 쉽게 이해하실 수 있습니다
            </p>
            <div class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                size="large"
                variant="outlined"
                prepend-icon="ri-question-answer-line"
                @click="goToFaq"
              >
                FAQ 보기
              </VBtn>
              <VBtn
                size="large"
                color="primary"
                prepend-icon="ri-rocket-line"
                @click="startFreeTrial"
              >
                무료 체험 시작하기
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.support-page {
  inline-size: 100%;
}

.support-hero-section {
  padding-block: 2rem;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.contact-section {
  padding-block: 4rem;
  background-color: rgb(var(--v-theme-surface));
}

.contact-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }
}

.info-section {
  padding-block: 4rem;
  background-color: rgb(var(--v-theme-background));
}

.cta-section {
  padding-block: 4rem;
  background-color: rgb(var(--v-theme-surface));
}
</style>
