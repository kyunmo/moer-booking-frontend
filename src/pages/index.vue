<route lang="yaml">
meta:
  layout: public
  public: true
</route>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 히어로 섹션 데이터
const heroData = {
  headline: '예약 관리,\n이제 자동으로 해결하세요',
  subheadline: '전화 예약은 이제 그만! 고객이 직접 예약하고, 카카오톡으로 자동 알림 발송',
  features: [
    { icon: 'ri-timer-flash-line', text: '5분이면 시작 가능' },
    { icon: 'ri-kakao-talk-line', text: '카카오톡 자동 알림' },
    { icon: 'ri-money-dollar-circle-line', text: '월 29,000원부터' },
  ],
  trustPoints: [
    { icon: 'ri-gift-line', text: '30일 무료 체험' },
    { icon: 'ri-bank-card-line', text: '신용카드 등록 불필요' },
    { icon: 'ri-close-circle-line', text: '언제든 해지 가능' },
  ],
}

// 문제 제기 카드
const problems = [
  {
    icon: 'ri-phone-line',
    emoji: '🔔',
    title: '끊임없이 울리는 전화',
    description: '매일 수십 통의 예약 전화\n손님 시술 중에도 전화받느라 집중 못해요',
  },
  {
    icon: 'ri-file-text-line',
    emoji: '📝',
    title: '수첩에 빼곡한 예약',
    description: '예약이 겹치거나 누락되는 실수\n시간 계산하느라 머리 아파요',
  },
  {
    icon: 'ri-emotion-sad-line',
    emoji: '😢',
    title: '예약하고 안 오는 고객',
    description: '빈 시간이 생겨 매출 손실\n연락해도 이미 늦은 후...',
  },
  {
    icon: 'ri-question-line',
    emoji: '🤔',
    title: '지난번에 뭐 했더라?',
    description: '고객 이력을 일일이 기억 못해\n단골 고객도 새 손님처럼 대응',
  },
]

// 솔루션 카드
const solutions = [
  {
    icon: 'ri-calendar-check-line',
    color: 'primary',
    title: '24시간 자동 예약',
    description: '고객이 언제든 직접 예약\n관리자는 아침에 확인만 하면 끝!',
  },
  {
    icon: 'ri-notification-line',
    color: 'success',
    title: '카카오톡 자동 알림',
    description: '예약 확정, 하루 전 리마인더\n노쇼율 70% 감소',
  },
  {
    icon: 'ri-user-heart-line',
    color: 'warning',
    title: '스마트 고객 관리',
    description: '방문 이력, 선호 서비스 자동 기록\nVIP 고객 자동 구분',
  },
  {
    icon: 'ri-line-chart-line',
    color: 'info',
    title: '실시간 통계',
    description: '오늘 매출, 인기 서비스 한눈에\n데이터 기반 경영',
  },
]

function startFreeTrial() {
  router.push('/register')
}

function viewPricing() {
  router.push('/pricing')
}
</script>

<template>
  <div class="landing-page">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <VContainer>
        <VRow align="center" justify="center">
          <VCol cols="12" md="10" lg="8">
            <div class="text-center">
              <!-- 메인 헤드라인 -->
              <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">
                {{ heroData.headline }}
              </h1>

              <!-- 서브 헤드라인 -->
              <p class="text-h6 text-md-h5 text-medium-emphasis mb-8">
                {{ heroData.subheadline }}
              </p>

              <!-- 키 포인트 -->
              <div class="d-flex flex-wrap justify-center gap-4 mb-8">
                <VChip
                  v-for="(feature, index) in heroData.features"
                  :key="index"
                  size="large"
                  variant="tonal"
                  color="primary"
                  :prepend-icon="feature.icon"
                >
                  {{ feature.text }}
                </VChip>
              </div>

              <!-- CTA 버튼 -->
              <div class="d-flex flex-wrap justify-center gap-4 mb-8">
                <VBtn
                  size="x-large"
                  color="primary"
                  prepend-icon="ri-rocket-line"
                  @click="startFreeTrial"
                >
                  무료로 시작하기
                </VBtn>
                <VBtn
                  size="x-large"
                  variant="outlined"
                  prepend-icon="ri-play-circle-line"
                  @click="viewPricing"
                >
                  요금제 보기
                </VBtn>
              </div>

              <!-- 신뢰 요소 -->
              <div class="d-flex flex-wrap justify-center gap-3">
                <div
                  v-for="(point, index) in heroData.trustPoints"
                  :key="index"
                  class="d-flex align-center text-body-2 text-medium-emphasis"
                >
                  <VIcon :icon="point.icon" size="20" class="me-1" />
                  {{ point.text }}
                  <VDivider v-if="index < heroData.trustPoints.length - 1" vertical class="mx-3" />
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- 문제 제기 섹션 -->
    <section class="problem-section py-16">
      <VContainer>
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-4">
            이런 고민, 혹시 있으신가요?
          </h2>
        </div>

        <VRow>
          <VCol
            v-for="(problem, index) in problems"
            :key="index"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard class="h-100 text-center pa-4" variant="tonal">
              <VCardText>
                <div class="text-h1 mb-4">
                  {{ problem.emoji }}
                </div>
                <h3 class="text-h6 font-weight-bold mb-3">
                  {{ problem.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis" style="white-space: pre-line;">
                  {{ problem.description }}
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <div class="text-center mt-8">
          <VChip size="large" color="primary" variant="tonal">
            <VIcon icon="ri-magic-line" start />
            moer가 이 모든 문제를 해결해드립니다
          </VChip>
        </div>
      </VContainer>
    </section>

    <!-- 솔루션 섹션 -->
    <section class="solution-section py-16 bg-surface">
      <VContainer>
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-4">
            moer로 바뀌는 하루
          </h2>
          <p class="text-h6 text-medium-emphasis">
            복잡했던 예약 관리가 이렇게 간단해집니다
          </p>
        </div>

        <VRow>
          <VCol
            v-for="(solution, index) in solutions"
            :key="index"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard class="h-100 text-center pa-6" elevation="2">
              <VCardText>
                <VAvatar
                  :color="solution.color"
                  size="64"
                  variant="tonal"
                  class="mb-4"
                >
                  <VIcon :icon="solution.icon" size="32" />
                </VAvatar>
                <h3 class="text-h6 font-weight-bold mb-3">
                  {{ solution.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis" style="white-space: pre-line;">
                  {{ solution.description }}
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>

    <!-- 요금제 미리보기 -->
    <section class="pricing-preview-section py-16">
      <VContainer>
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-4">
            간단하고 투명한 요금제
          </h2>
          <p class="text-h6 text-medium-emphasis mb-2">
            업종과 규모에 맞는 플랜을 선택하세요
          </p>
          <VChip color="success" variant="tonal" prepend-icon="ri-gift-line">
            30일 무료 체험
          </VChip>
        </div>

        <VRow justify="center">
          <VCol cols="12" sm="6" md="4">
            <VCard class="text-center pa-6" elevation="2">
              <VCardText>
                <VChip color="success" class="mb-4" prepend-icon="ri-star-line">
                  가장 인기
                </VChip>
                <h3 class="text-h4 font-weight-bold mb-2">
                  베이직
                </h3>
                <div class="mb-4">
                  <span class="text-h3 font-weight-bold text-primary">29,000원</span>
                  <span class="text-body-1">/월</span>
                </div>
                <VList density="compact" class="mb-4">
                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-check-line" color="success" />
                    </template>
                    <VListItemTitle>월 100건 예약</VListItemTitle>
                  </VListItem>
                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-check-line" color="success" />
                    </template>
                    <VListItemTitle>직원 3명</VListItemTitle>
                  </VListItem>
                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-check-line" color="success" />
                    </template>
                    <VListItemTitle>카카오톡 알림</VListItemTitle>
                  </VListItem>
                  <VListItem>
                    <template #prepend>
                      <VIcon icon="ri-check-line" color="success" />
                    </template>
                    <VListItemTitle>광고 제거</VListItemTitle>
                  </VListItem>
                </VList>
                <VBtn block color="primary" size="large" @click="startFreeTrial">
                  무료로 시작하기
                </VBtn>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <div class="text-center mt-8">
          <VBtn variant="text" @click="viewPricing">
            전체 요금제 보기
            <VIcon icon="ri-arrow-right-line" end />
          </VBtn>
        </div>
      </VContainer>
    </section>

    <!-- 최종 CTA -->
    <section class="final-cta-section py-16 bg-primary">
      <VContainer>
        <VRow align="center" justify="center">
          <VCol cols="12" md="8" class="text-center">
            <h2 class="text-h3 font-weight-bold mb-4 text-white">
              지금 시작하세요
            </h2>
            <p class="text-h6 mb-8 text-white opacity-90">
              5분이면 충분합니다. 신용카드 등록도 필요 없어요.
            </p>
            <VBtn
              size="x-large"
              color="white"
              prepend-icon="ri-rocket-line"
              @click="startFreeTrial"
            >
              30일 무료 체험 시작하기
            </VBtn>
            <div class="d-flex flex-wrap justify-center gap-3 mt-6">
              <div class="d-flex align-center text-white text-body-2">
                <VIcon icon="ri-check-line" size="20" class="me-1" />
                신용카드 등록 불필요
              </div>
              <VDivider vertical class="mx-2 opacity-50" />
              <div class="d-flex align-center text-white text-body-2">
                <VIcon icon="ri-check-line" size="20" class="me-1" />
                30일 동안 모든 기능 무료
              </div>
              <VDivider vertical class="mx-2 opacity-50" />
              <div class="d-flex align-center text-white text-body-2">
                <VIcon icon="ri-check-line" size="20" class="me-1" />
                언제든 해지 가능
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.landing-page {
  width: 100%;
}

.hero-section {
  padding-block: 120px 80px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.problem-section {
  background-color: rgb(var(--v-theme-surface));
}

.solution-section {
  background-color: rgb(var(--v-theme-background));
}

.pricing-preview-section {
  background-color: rgb(var(--v-theme-surface));
}

.final-cta-section {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(99, 102, 241, 0.8) 100%);
}
</style>
