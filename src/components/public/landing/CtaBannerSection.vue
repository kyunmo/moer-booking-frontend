<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const trustItems = ['신용카드 불필요', '30일 무료 체험', '언제든 해지 가능']

function startFreeTrial() {
  router.push('/register')
}
</script>

<template>
  <section class="cta-banner-section">
    <VContainer>
      <div class="d-flex align-center justify-sm-space-between flex-column flex-md-row gap-y-6 gap-x-12">
        <!-- Left: Text + CTA -->
        <div class="text-sm-start text-center py-md-14 py-6">
          <div class="banner-text pb-1">
            지금 시작하세요
          </div>
          <div class="text-body-1 font-weight-medium mb-6 banner-subtitle">
            5분이면 충분합니다. 신용카드 등록도 필요 없어요.
          </div>
          <VBtn
            size="x-large"
            color="white"
            prepend-icon="ri-rocket-line"
            @click="startFreeTrial"
          >
            30일 무료 체험 시작하기
          </VBtn>
          <!-- Trust checklist -->
          <div class="d-flex flex-wrap justify-center justify-md-start gap-3 mt-6">
            <div
              v-for="item in trustItems"
              :key="item"
              class="d-flex align-center banner-trust-text text-body-2"
            >
              <VIcon icon="ri-check-line" size="20" class="me-1" />
              {{ item }}
            </div>
          </div>
        </div>

        <!-- Right: Mini dashboard preview -->
        <VCard class="cta-preview-card d-none d-md-block" elevation="8" max-width="400">
          <VCardText class="pa-6">
            <div class="text-center">
              <VIcon icon="ri-calendar-schedule-line" size="48" color="primary" class="mb-2" />
              <div class="text-h6 font-weight-bold mb-1">
                오늘의 예약 현황
              </div>
              <div class="d-flex justify-center gap-6 mt-4">
                <div>
                  <div class="text-h4 font-weight-bold text-primary">
                    12
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    확정
                  </div>
                </div>
                <VDivider vertical />
                <div>
                  <div class="text-h4 font-weight-bold text-warning">
                    3
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    대기
                  </div>
                </div>
                <VDivider vertical />
                <div>
                  <div class="text-h4 font-weight-bold text-success">
                    8
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    완료
                  </div>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.cta-banner-section {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(99, 102, 241, 0.85) 100%);
}

.banner-text {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.25px;
  line-height: 42px;
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.banner-trust-text {
  color: rgba(255, 255, 255, 0.9);
}

.cta-preview-card {
  border-radius: 12px;
}
</style>
