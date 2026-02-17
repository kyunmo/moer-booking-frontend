<script setup>
const previewFaqs = [
  {
    question: 'YEMO는 어떤 서비스인가요?',
    answer: 'YEMO는 소상공인을 위한 올인원 예약 관리 솔루션입니다. 고객이 직접 온라인으로 예약하고, 카카오톡/SMS로 자동 알림이 발송되며, 관리자는 대시보드에서 모든 예약을 한눈에 관리할 수 있습니다.',
  },
  {
    question: '무료로 사용할 수 있나요?',
    answer: '네! 모든 유료 플랜은 30일 무료 체험이 가능하며, 신용카드 등록도 필요 없습니다. 무료 플랜(월 30건)은 영구적으로 무료입니다.',
  },
  {
    question: '어떤 업종에 적합한가요?',
    answer: '미용실, 네일샵, 필라테스, 요가, PT, 마사지, 피부관리, 애견미용, 스터디카페, 공유오피스 등 예약이 필요한 모든 업종에서 사용 가능합니다.',
  },
  {
    question: '카카오톡 알림은 어떻게 발송되나요?',
    answer: '예약 생성, 확정, 리마인더, 취소 시 고객에게 카카오톡 알림톡이 자동 발송됩니다. 카카오톡이 없는 고객에게는 SMS로 대체 발송됩니다.',
  },
  {
    question: '기존 고객 데이터를 가져올 수 있나요?',
    answer: '엑셀(CSV) 파일을 통해 기존 고객 목록과 예약 데이터를 한 번에 가져올 수 있습니다. 데이터 이전은 무료로 지원합니다.',
  },
]
</script>

<template>
  <section id="faq" class="faq-preview-section">
    <VContainer>
      <!-- Section Header -->
      <div class="headers d-flex justify-center flex-column align-center mb-12">
        <VChip color="primary" variant="tonal" class="mb-4" prepend-icon="ri-question-line">
          FAQ
        </VChip>
        <div class="mb-2 text-center">
          <span class="text-h5 d-inline-block">자주 묻는 </span>
          <span class="text-h4 d-inline-block font-weight-bold" style="line-height: 2rem;">질문</span>
        </div>
        <p class="text-body-1 font-weight-medium text-center text-medium-emphasis">
          궁금한 점을 빠르게 확인하세요
        </p>
      </div>

      <!-- Two-column: Illustration + FAQ panels -->
      <div
        class="d-flex align-center justify-space-between flex-wrap flex-md-nowrap"
        style="gap: 4rem;"
      >
        <!-- Left side: Icon illustration -->
        <div
          class="d-none d-md-flex flex-column align-center justify-center"
          style="min-inline-size: 280px;"
        >
          <VAvatar size="200" color="primary" variant="tonal">
            <VIcon icon="ri-question-answer-line" size="100" />
          </VAvatar>
          <p class="text-body-1 font-weight-medium text-center mt-4">
            찾으시는 답변이 없다면?
          </p>
          <VBtn variant="outlined" to="/faq" prepend-icon="ri-arrow-right-line">
            전체 FAQ 보기
          </VBtn>
        </div>

        <!-- Right side: Expansion panels -->
        <div class="flex-grow-1">
          <VExpansionPanels>
            <VExpansionPanel
              v-for="faq in previewFaqs"
              :key="faq.question"
            >
              <VExpansionPanelTitle class="font-weight-medium">
                {{ faq.question }}
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <div class="text-body-2" style="white-space: pre-line;">
                  {{ faq.answer }}
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>

          <!-- Mobile: FAQ link -->
          <div class="text-center mt-6 d-md-none">
            <VBtn variant="outlined" to="/faq" prepend-icon="ri-arrow-right-line">
              전체 FAQ 보기
            </VBtn>
          </div>
        </div>
      </div>
    </VContainer>
  </section>
</template>

<style lang="scss" scoped>
.faq-preview-section {
  padding-block: 5rem;
  background-color: rgb(var(--v-theme-surface));
}
</style>
