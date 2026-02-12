<route lang="yaml">
meta:
  layout: public
  public: true
</route>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 pa-6">
        개인정보처리방침
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-6">
        <div class="text-body-1">
          <h5 class="text-h5 mb-4">
            1. 개인정보의 수집 및 이용 목적
          </h5>
          <p class="mb-6">
            MOER(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>

          <h5 class="text-h5 mb-4">
            2. 수집하는 개인정보의 항목
          </h5>
          <p class="mb-2">
            회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 최초 회원가입 시 아래와 같은 개인정보를 수집하고 있습니다:
          </p>
          <ul class="mb-6">
            <li>필수항목: 이메일, 비밀번호, 이름, 전화번호, 매장명</li>
            <li>선택항목: 프로필 이미지</li>
            <li>자동 수집 항목: IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
          </ul>

          <h5 class="text-h5 mb-4">
            3. 개인정보의 보유 및 이용기간
          </h5>
          <p class="mb-6">
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
            동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            회원 탈퇴 시 개인정보는 즉시 파기됩니다.
          </p>

          <h5 class="text-h5 mb-4">
            4. 개인정보의 제3자 제공
          </h5>
          <p class="mb-6">
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 아래의 경우에는 예외로 합니다:
          </p>
          <ul class="mb-6">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>

          <h5 class="text-h5 mb-4">
            5. 개인정보의 파기
          </h5>
          <p class="mb-6">
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
            지체없이 해당 개인정보를 파기합니다.
          </p>

          <h5 class="text-h5 mb-4">
            6. 정보주체의 권리·의무 및 행사방법
          </h5>
          <p class="mb-6">
            이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
          </p>
          <ul class="mb-6">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>

          <VAlert
            type="info"
            variant="tonal"
            class="mt-6"
          >
            <div class="text-body-2">
              <strong>참고:</strong> 본 개인정보처리방침은 임시 버전입니다. 실제 서비스 운영 시 법률 검토를 거친 정식 방침으로 교체되어야 합니다.
            </div>
          </VAlert>

          <div class="mt-6">
            <p class="text-body-2 text-medium-emphasis">
              개인정보 보호책임자<br>
              이메일: kkm@moer.io
            </p>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
// 페이지 메타 설정
definePage({
  meta: {
    title: '개인정보처리방침',
  },
})
</script>
