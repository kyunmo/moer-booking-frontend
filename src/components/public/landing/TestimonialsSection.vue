<script setup>
const testimonials = [
  {
    name: '김지현',
    role: '미용실 원장',
    avatar: '김',
    color: 'primary',
    rating: 5,
    text: '전화 예약 스트레스에서 해방됐어요. 밤에도 예약이 자동으로 들어오니 정말 편해요.',
  },
  {
    name: '박소연',
    role: '필라테스 강사',
    avatar: '박',
    color: 'success',
    rating: 5,
    text: '카카오톡 자동 알림 덕분에 노쇼가 30% 줄었어요. 매달 수십만원 절약하고 있습니다.',
  },
  {
    name: '이준호',
    role: '스터디카페 운영자',
    avatar: '이',
    color: 'warning',
    rating: 5,
    text: '좌석 관리가 너무 쉬워졌어요. 5분이면 셋업 완료, 학생들도 직접 예약해서 편해합니다.',
  },
  {
    name: '최윤아',
    role: '네일샵 디자이너',
    avatar: '최',
    color: 'info',
    rating: 5,
    text: '고객 관리가 체계적으로 되니 재방문율이 눈에 띄게 올랐어요.',
  },
]
</script>

<template>
  <section class="testimonials-section">
    <VContainer>
      <!-- Section Header -->
      <div class="text-center mb-12">
        <VChip
          class="mb-4"
          variant="tonal"
          color="primary"
          prepend-icon="ri-chat-quote-line"
        >
          고객 후기
        </VChip>

        <h2 class="text-h4 font-weight-bold mb-3">
          실제 사용자들의 이야기
        </h2>

        <p class="text-body-1 text-medium-emphasis">
          다양한 업종의 사장님들이 직접 경험한 변화입니다
        </p>
      </div>

      <!-- Testimonial Cards -->
      <VRow justify="center">
        <VCol
          v-for="(testimonial, index) in testimonials"
          :key="index"
          cols="12"
          sm="6"
          lg="3"
        >
          <VCard class="testimonial-card h-100 pa-6">
            <!-- Quote Icon -->
            <VIcon
              icon="ri-double-quotes-l"
              size="32"
              color="primary"
              class="mb-3"
              style="opacity: 0.3;"
            />

            <!-- Review Text -->
            <p class="text-body-1 mb-5 testimonial-text">
              {{ testimonial.text }}
            </p>

            <!-- Rating -->
            <VRating
              :model-value="testimonial.rating"
              color="warning"
              density="compact"
              size="small"
              readonly
              class="mb-4"
            />

            <VDivider class="mb-4" />

            <!-- Reviewer Info -->
            <div class="d-flex align-center gap-3">
              <VAvatar
                :color="testimonial.color"
                variant="tonal"
                size="44"
              >
                <span class="text-body-1 font-weight-bold">
                  {{ testimonial.avatar }}
                </span>
              </VAvatar>

              <div>
                <div class="text-body-1 font-weight-bold">
                  {{ testimonial.name }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ testimonial.role }}
                </div>
              </div>
            </div>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.testimonials-section {
  padding-block: 5rem;
  background-color: rgb(var(--v-theme-background));
}

.testimonial-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }
}

.testimonial-text {
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

@media (max-width: 600px) {
  .testimonials-section {
    padding-block: 3rem;
  }
}
</style>
