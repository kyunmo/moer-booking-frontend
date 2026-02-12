<route lang="yaml">
meta:
  layout: public
  public: true
  title: 이용약관 - YEMO
  description: YEMO 서비스 이용약관입니다. 서비스 이용 전 반드시 확인해주세요.
  keywords: 이용약관, 서비스 약관, 이용 조건
</route>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 pa-6">
        이용약관
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-6">
        <div class="text-body-1">
          <h5 class="text-h5 mb-4">
            제1조 (목적)
          </h5>
          <p class="mb-6">
            본 약관은 YEMO(이하 "회사")이 제공하는 예약 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <h5 class="text-h5 mb-4">
            제2조 (정의)
          </h5>
          <p class="mb-2">
            본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
          </p>
          <ol class="mb-6">
            <li>"서비스"란 회사가 제공하는 예약 관리 시스템을 말합니다.</li>
            <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
            <li>"회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 자를 말합니다.</li>
          </ol>

          <h5 class="text-h5 mb-4">
            제3조 (약관의 효력 및 변경)
          </h5>
          <p class="mb-6">
            본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.
            회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 변경할 수 있습니다.
          </p>

          <h5 class="text-h5 mb-4">
            제4조 (서비스의 제공)
          </h5>
          <p class="mb-6">
            회사는 다음과 같은 서비스를 제공합니다:
          </p>
          <ul class="mb-6">
            <li>예약 등록 및 관리</li>
            <li>고객 관리</li>
            <li>서비스(메뉴) 관리</li>
            <li>스태프 관리</li>
            <li>대시보드 및 통계</li>
          </ul>

          <VAlert
            type="info"
            variant="tonal"
            class="mt-6"
          >
            <div class="text-body-2">
              <strong>참고:</strong> 본 이용약관은 임시 버전입니다. 실제 서비스 운영 시 법률 검토를 거친 정식 약관으로 교체되어야 합니다.
            </div>
          </VAlert>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
// 페이지 메타 설정
definePage({
  meta: {
    title: '이용약관',
  },
})
</script>
