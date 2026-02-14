<route lang="yaml">
meta:
  layout: public
  public: true
  title: 고객 지원 - YEMO
  description: YEMO 고객 지원 센터. 이메일, 카카오톡, 전화로 빠르고 친절하게 도와드립니다.
  keywords: 고객 지원, 문의, 상담, 헬프 데스크
</route>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 pa-6">
        고객지원
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-6">
        <VRow>
          <!-- 문의하기 -->
          <VCol cols="12" md="6">
            <VCard variant="tonal" color="primary">
              <VCardText class="text-center pa-6">
                <VIcon
                  icon="ri-mail-line"
                  size="48"
                  color="primary"
                  class="mb-4"
                />
                <h5 class="text-h5 mb-2">
                  이메일 문의
                </h5>
                <p class="text-body-2 mb-4">
                  궁금하신 사항을 이메일로 보내주세요
                </p>
                <VBtn
                  color="primary"
                  variant="elevated"
                  href="mailto:kkm@YEMO.io"
                >
                  문의하기
                </VBtn>
              </VCardText>
            </VCard>
          </VCol>

          <!-- 자주 묻는 질문 -->
          <VCol cols="12" md="6">
            <VCard variant="tonal" color="success">
              <VCardText class="text-center pa-6">
                <VIcon
                  icon="ri-question-line"
                  size="48"
                  color="success"
                  class="mb-4"
                />
                <h5 class="text-h5 mb-2">
                  자주 묻는 질문
                </h5>
                <p class="text-body-2 mb-4">
                  FAQ를 통해 빠른 답변을 받아보세요
                </p>
                <VBtn
                  color="success"
                  variant="elevated"
                  to="/faq"
                >
                  FAQ 보기
                </VBtn>
              </VCardText>
            </VCard>
          </VCol>

          <!-- 운영 시간 안내 -->
          <VCol cols="12">
            <VCard>
              <VCardText class="pa-6">
                <h5 class="text-h5 mb-4">
                  <VIcon icon="ri-time-line" class="me-2" />
                  고객지원 운영 시간
                </h5>
                <div class="text-body-1">
                  <p class="mb-2">
                    <strong>평일:</strong> 09:00 - 18:00
                  </p>
                  <p class="mb-2">
                    <strong>주말 및 공휴일:</strong> 휴무
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    * 이메일 문의는 24시간 접수 가능하며, 영업일 기준 1-2일 내 답변드립니다.
                  </p>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- 주요 문의 사항 -->
          <VCol cols="12">
            <VCard>
              <VCardTitle class="pa-6">
                <VIcon icon="ri-questionnaire-line" class="me-2" />
                주요 문의 사항
              </VCardTitle>
              <VDivider />
              <VCardText class="pa-6">
                <VExpansionPanels>
                  <VExpansionPanel>
                    <VExpansionPanelTitle>
                      <VIcon icon="ri-gift-line" class="me-2" />
                      30일 무료 체험은 어떻게 시작하나요?
                    </VExpansionPanelTitle>
                    <VExpansionPanelText>
                      회원가입 시 자동으로 30일 무료 체험이 시작됩니다. 별도의 신청이나 결제 정보 입력 없이 모든 기능을 사용하실 수 있습니다.
                    </VExpansionPanelText>
                  </VExpansionPanel>

                  <VExpansionPanel>
                    <VExpansionPanelTitle>
                      <VIcon icon="ri-bank-card-line" class="me-2" />
                      결제는 어떻게 진행되나요?
                    </VExpansionPanelTitle>
                    <VExpansionPanelText>
                      30일 무료 체험 기간 종료 후 프리미엄 요금제로 전환하실 수 있습니다. 자세한 요금제는 준비 중입니다.
                    </VExpansionPanelText>
                  </VExpansionPanel>

                  <VExpansionPanel>
                    <VExpansionPanelTitle>
                      <VIcon icon="ri-lock-line" class="me-2" />
                      개인정보는 안전하게 보관되나요?
                    </VExpansionPanelTitle>
                    <VExpansionPanelText>
                      고객님의 개인정보는 암호화되어 안전하게 보관됩니다. 자세한 내용은 개인정보처리방침을 참고해주세요.
                    </VExpansionPanelText>
                  </VExpansionPanel>

                  <VExpansionPanel>
                    <VExpansionPanelTitle>
                      <VIcon icon="ri-smartphone-line" class="me-2" />
                      모바일에서도 사용할 수 있나요?
                    </VExpansionPanelTitle>
                    <VExpansionPanelText>
                      네, 반응형 웹 디자인으로 제작되어 PC, 태블릿, 스마트폰 등 모든 기기에서 사용 가능합니다.
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
// 페이지 메타 설정
definePage({
  meta: {
    title: '고객지원',
  },
})
</script>
