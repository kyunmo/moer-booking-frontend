<template>
  <div class="text-body-1 privacy-content">
    <!-- 전문 -->
    <p class="mb-4">
      [상호명](이하 "회사")은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
    </p>

    <VAlert
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      <div class="text-body-2">
        본 서비스는 <strong>B2B2C(기업 간 거래 및 소비자 대상) 플랫폼</strong>으로, 회사(YEMO)가 매장 관리자에게 서비스를 제공하고, 매장 관리자가 고객에게 예약 서비스를 제공하는 구조입니다. 이에 따라 개인정보 처리 주체와 범위가 구분됩니다.
      </div>
    </VAlert>

    <!-- 제1조 -->
    <h5 class="text-h5 mb-4">
      제1조 (개인정보의 처리 목적)
    </h5>
    <p class="mb-4">
      회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
    </p>
    <VTable
      density="comfortable"
      class="mb-6 border rounded"
    >
      <thead>
        <tr>
          <th>구분</th>
          <th>처리 목적</th>
          <th>상세</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="3">
            매장 관리자
          </td>
          <td>회원가입 및 관리</td>
          <td>계정 생성, 본인 확인, 서비스 제공, 구독 관리</td>
        </tr>
        <tr>
          <td>서비스 제공</td>
          <td>예약 관리, 매장 운영 지원, 통계 분석</td>
        </tr>
        <tr>
          <td>요금 결제 및 정산</td>
          <td>구독 결제, 환불 처리, 세금계산서 발행</td>
        </tr>
        <tr>
          <td rowspan="2">
            고객 회원
          </td>
          <td>회원가입 및 관리</td>
          <td>카카오 로그인 인증, 예약 이력 관리</td>
        </tr>
        <tr>
          <td>예약 서비스 제공</td>
          <td>예약 접수, 변경, 취소, 리마인더 발송</td>
        </tr>
        <tr>
          <td>비회원</td>
          <td>예약 조회</td>
          <td>예약번호 + 전화번호 기반 예약 확인</td>
        </tr>
        <tr>
          <td>공통</td>
          <td>고충처리</td>
          <td>민원 처리, 분쟁 조정, 서비스 개선</td>
        </tr>
      </tbody>
    </VTable>

    <!-- 제2조 -->
    <h5 class="text-h5 mb-4">
      제2조 (수집하는 개인정보의 항목)
    </h5>
    <p class="mb-4">
      회사는 서비스 제공을 위해 최소한의 개인정보를 수집합니다.
    </p>
    <VTable
      density="comfortable"
      class="mb-6 border rounded"
    >
      <thead>
        <tr>
          <th>대상</th>
          <th>구분</th>
          <th>수집 항목</th>
          <th>수집 방법</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2">
            매장 관리자
          </td>
          <td>필수</td>
          <td>이름, 이메일, 비밀번호(암호화), 전화번호, 매장명</td>
          <td>회원가입 시 직접 입력</td>
        </tr>
        <tr>
          <td>선택</td>
          <td>매장 주소, 사업자등록번호, 프로필 이미지, SNS 연동 정보(카카오/네이버/구글 계정 식별자)</td>
          <td>서비스 이용 중 입력 또는 OAuth 연동</td>
        </tr>
        <tr>
          <td rowspan="2">
            고객 회원
          </td>
          <td>필수</td>
          <td>카카오 계정 식별자(ID), 이름(닉네임)</td>
          <td>카카오 로그인 시 자동 수집</td>
        </tr>
        <tr>
          <td>선택</td>
          <td>전화번호, 이메일, 생년월일, 성별, 마케팅 수신 동의 여부</td>
          <td>프로필 등록 시 직접 입력</td>
        </tr>
        <tr>
          <td rowspan="2">
            매장 고객<br><span class="text-caption text-medium-emphasis">(매장 관리자가 등록)</span>
          </td>
          <td>필수</td>
          <td>이름, 전화번호</td>
          <td>매장 관리자가 등록</td>
        </tr>
        <tr>
          <td>선택</td>
          <td>이메일, 생년월일, 성별, 메모, 태그</td>
          <td>매장 관리자가 등록</td>
        </tr>
        <tr>
          <td>공통 (자동 수집)</td>
          <td>-</td>
          <td>IP 주소, 접속 로그, 쿠키, 서비스 이용 기록, 브라우저 정보(User-Agent)</td>
          <td>서비스 이용 중 자동 생성</td>
        </tr>
      </tbody>
    </VTable>

    <!-- 제3조 -->
    <h5 class="text-h5 mb-4">
      제3조 (개인정보의 처리 및 보유 기간)
    </h5>
    <p class="mb-4">
      회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
    </p>
    <VTable
      density="comfortable"
      class="mb-6 border rounded"
    >
      <thead>
        <tr>
          <th>보유 항목</th>
          <th>보유 기간</th>
          <th>근거</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>회원 정보 (매장 관리자/고객)</td>
          <td>회원 탈퇴 시까지</td>
          <td>서비스 이용 계약</td>
        </tr>
        <tr>
          <td>탈퇴 후 데이터 보관</td>
          <td>탈퇴일로부터 30일</td>
          <td>재가입 시 복구 지원</td>
        </tr>
        <tr>
          <td>계약 또는 청약철회에 관한 기록</td>
          <td>5년</td>
          <td>전자상거래법 제6조</td>
        </tr>
        <tr>
          <td>대금결제 및 재화 공급에 관한 기록</td>
          <td>5년</td>
          <td>전자상거래법 제6조</td>
        </tr>
        <tr>
          <td>소비자 불만 또는 분쟁 처리에 관한 기록</td>
          <td>3년</td>
          <td>전자상거래법 제6조</td>
        </tr>
        <tr>
          <td>접속 로그 기록</td>
          <td>3개월 이상</td>
          <td>통신비밀보호법 제15조의2</td>
        </tr>
      </tbody>
    </VTable>

    <!-- 제4조 -->
    <h5 class="text-h5 mb-4">
      제4조 (개인정보의 제3자 제공)
    </h5>
    <p class="mb-4">
      회사는 원칙적으로 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서 처리하며, 정보주체의 사전 동의 없이 본래의 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
    </p>
    <p class="mb-2">
      다만, 다음의 경우에는 개인정보를 제3자에게 제공할 수 있습니다.
    </p>
    <ol class="mb-4">
      <li>정보주체가 사전에 동의한 경우</li>
      <li>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
      <li>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
    </ol>

    <VAlert
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      <template #title>
        B2B2C 구조에서의 개인정보 처리 관계
      </template>
      <div class="text-body-2">
        매장 관리자가 서비스를 통해 등록하는 고객 정보(이름, 전화번호 등)는 매장 관리자가 개인정보 처리자로서 수집·관리하는 것이며, 회사는 매장 관리자에게 예약 관리 도구를 제공하는 위탁 처리자의 역할을 합니다. 매장 관리자는 자신의 고객에 대한 개인정보 보호 의무를 직접 부담합니다.
      </div>
    </VAlert>

    <!-- 제5조 -->
    <h5 class="text-h5 mb-4">
      제5조 (개인정보 처리의 위탁)
    </h5>
    <p class="mb-4">
      회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
    </p>
    <VTable
      density="comfortable"
      class="mb-4 border rounded"
    >
      <thead>
        <tr>
          <th>수탁업체</th>
          <th>위탁 업무</th>
          <th>보유 기간</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>[PG사명 - 예: 토스페이먼츠]</td>
          <td>구독 결제 처리</td>
          <td>위탁 계약 종료 시까지</td>
        </tr>
        <tr>
          <td>네이버 클라우드</td>
          <td>서버 호스팅, 데이터 저장</td>
          <td>위탁 계약 종료 시까지</td>
        </tr>
        <tr>
          <td>[카카오 비즈메시지 딜러사]</td>
          <td>카카오 알림톡 발송</td>
          <td>발송 완료 시까지</td>
        </tr>
      </tbody>
    </VTable>
    <p class="mb-6">
      회사는 위탁 계약 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독 등에 관한 사항을 문서에 명시합니다.
    </p>

    <!-- 제6조 -->
    <h5 class="text-h5 mb-4">
      제6조 (정보주체의 권리·의무 및 행사방법)
    </h5>
    <p class="mb-2">
      정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
    </p>
    <ol class="mb-4">
      <li>개인정보 열람 요구</li>
      <li>오류 등이 있을 경우 정정 요구</li>
      <li>삭제 요구</li>
      <li>처리정지 요구</li>
    </ol>
    <p class="mb-4">
      권리 행사는 서비스 내 설정 페이지를 통해 직접 처리하거나, 이메일(<strong>kkm@moer.io</strong>)로 요청할 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.
    </p>
    <p class="mb-6">
      권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수도 있습니다. 이 경우 「개인정보 처리 방법에 관한 고시」 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
    </p>

    <!-- 제7조 -->
    <h5 class="text-h5 mb-4">
      제7조 (개인정보의 파기)
    </h5>
    <ol class="mb-6">
      <li class="mb-2">
        회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
      </li>
      <li class="mb-2">
        파기 방법은 다음과 같습니다.
        <ul class="mt-1">
          <li>전자적 파일 형태: 복구 및 재생이 되지 않도록 기술적 방법을 이용하여 안전하게 삭제</li>
          <li>기록물, 인쇄물, 서면 등: 분쇄기로 분쇄하거나 소각</li>
        </ul>
      </li>
      <li>
        매장 관리자가 서비스 해지(탈퇴) 시, 해당 매장의 모든 데이터(예약, 고객, 서비스 정보 등)는 30일간 보관 후 영구 삭제됩니다.
      </li>
    </ol>

    <!-- 제8조 -->
    <h5 class="text-h5 mb-4">
      제8조 (개인정보의 안전성 확보 조치)
    </h5>
    <p class="mb-2">
      회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
    </p>
    <ol class="mb-6">
      <li class="mb-2">
        <strong>관리적 조치:</strong> 내부관리계획 수립·시행, 개인정보 취급자 지정 및 교육
      </li>
      <li class="mb-2">
        <strong>기술적 조치</strong>
        <ul class="mt-1">
          <li>비밀번호 암호화: BCrypt 일방향 암호화 저장</li>
          <li>전화번호 등 개인정보: AES-256 암호화 또는 접근통제</li>
          <li>데이터 전송 구간: SSL/TLS(HTTPS) 암호화 적용</li>
          <li>데이터베이스 통신: SSL 암호화 연결</li>
          <li>해킹 등에 대비한 접근통제 및 침입탐지 시스템 운영</li>
          <li>감사 로그(Audit Log) 기록 및 보관</li>
        </ul>
      </li>
      <li>
        <strong>물리적 조치:</strong> 클라우드 서버(네이버 클라우드)의 물리적 보안 체계 활용
      </li>
    </ol>

    <!-- 제9조 -->
    <h5 class="text-h5 mb-4">
      제9조 (자동 수집 장치의 설치·운영 및 거부에 관한 사항)
    </h5>
    <ol class="mb-6">
      <li class="mb-2">
        회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.
      </li>
      <li class="mb-2">
        쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자의 하드디스크에 저장됩니다.
      </li>
      <li class="mb-2">
        회사에서 사용하는 쿠키의 목적:
        <ul class="mt-1">
          <li><strong>필수 쿠키:</strong> 로그인 인증 토큰(JWT) 관리, 세션 유지</li>
          <li><strong>기능 쿠키:</strong> 다크 모드 설정, 언어 설정 등 사용자 환경 저장</li>
        </ul>
      </li>
      <li class="mb-2">
        이용자는 웹 브라우저의 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용이 제한될 수 있습니다.
      </li>
      <li>
        쿠키 설정 거부 방법:
        <ul class="mt-1">
          <li><strong>Chrome:</strong> 설정 > 개인정보 및 보안 > 쿠키 및 기타 사이트 데이터</li>
          <li><strong>Edge:</strong> 설정 > 쿠키 및 사이트 권한 > 쿠키 및 사이트 데이터 관리 및 삭제</li>
          <li><strong>Safari:</strong> 환경설정 > 개인정보 보호</li>
        </ul>
      </li>
    </ol>

    <!-- 제10조 -->
    <h5 class="text-h5 mb-4">
      제10조 (개인정보 보호책임자)
    </h5>
    <p class="mb-4">
      회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
    </p>
    <VCard
      variant="outlined"
      class="mb-4"
    >
      <VCardText>
        <div class="d-flex flex-column ga-1">
          <div>
            <strong>개인정보 보호책임자:</strong> [대표자명]
          </div>
          <div>
            <strong>직위:</strong> 대표
          </div>
          <div>
            <strong>이메일:</strong> kkm@moer.io
          </div>
          <div>
            <strong>전화:</strong> [전화번호]
          </div>
        </div>
      </VCardText>
    </VCard>
    <p class="mb-6">
      정보주체는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만 처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드리겠습니다.
    </p>

    <!-- 제11조 -->
    <h5 class="text-h5 mb-4">
      제11조 (권익침해 구제방법)
    </h5>
    <p class="mb-4">
      정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.
    </p>
    <VTable
      density="comfortable"
      class="mb-6 border rounded"
    >
      <thead>
        <tr>
          <th>기관</th>
          <th>연락처</th>
          <th>웹사이트</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>개인정보 침해신고센터</td>
          <td>(국번없이) 118</td>
          <td>privacy.kisa.or.kr</td>
        </tr>
        <tr>
          <td>개인정보 분쟁조정위원회</td>
          <td>(국번없이) 1833-6972</td>
          <td>kopico.go.kr</td>
        </tr>
        <tr>
          <td>대검찰청 사이버수사과</td>
          <td>(국번없이) 1301</td>
          <td>spo.go.kr</td>
        </tr>
        <tr>
          <td>경찰청 사이버수사국</td>
          <td>(국번없이) 182</td>
          <td>ecrm.police.go.kr</td>
        </tr>
      </tbody>
    </VTable>

    <!-- 제12조 -->
    <h5 class="text-h5 mb-4">
      제12조 (개인정보처리방침의 변경)
    </h5>
    <ol class="mb-6">
      <li class="mb-2">
        본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여 고지할 것입니다.
      </li>
      <li>
        이전 개인정보처리방침은 서비스 웹사이트에서 확인하실 수 있습니다.
      </li>
    </ol>

    <!-- 부칙 -->
    <h5 class="text-h5 mb-4">
      부칙
    </h5>
    <p class="mb-6">
      본 개인정보처리방침은 <strong>2026년 4월 1일</strong>부터 시행합니다.
    </p>

    <!-- 하단 구분선 및 회사 정보 -->
    <VDivider class="mb-6" />

    <div class="text-body-2 text-medium-emphasis mb-4">
      <div class="d-flex flex-column ga-1">
        <div>
          <strong>상호:</strong> [상호명]
        </div>
        <div>
          <strong>대표자:</strong> [대표자명]
        </div>
        <div>
          <strong>사업자등록번호:</strong> [000-00-00000]
        </div>
        <div>
          <strong>주소:</strong> [사업장 주소]
        </div>
        <div>
          <strong>이메일:</strong> kkm@moer.io
        </div>
      </div>
    </div>

    <VDivider class="mb-4" />

    <div class="text-body-2 text-medium-emphasis">
      <RouterLink
        to="/terms"
        class="text-primary text-decoration-none"
      >
        이용약관 보기
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.privacy-content {
  ol,
  ul {
    padding-inline-start: 24px;
    li {
      margin-block-end: 4px;
      line-height: 1.75;
    }
  }
  ol > li {
    padding-inline-start: 4px;
  }
  p {
    line-height: 1.75;
  }
}
</style>
