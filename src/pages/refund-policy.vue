<route lang="yaml">
meta:
  layout: public
  public: true
  title: 환불 정책 - YEMO
  description: YEMO 서비스의 유료 구독 환불 정책입니다. 공정하고 투명한 환불 기준을 안내합니다.
  keywords: 환불 정책, 구독 환불, 해지, 환불 기준
</route>

<template>
  <div>
    <VCard>
      <VCardTitle class="text-h4 pa-6 d-flex align-center flex-wrap ga-3">
        환불 정책
        <VChip
          color="primary"
          variant="tonal"
          size="small"
        >
          시행일: 2026년 4월 1일
        </VChip>
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-6">
        <div class="text-body-1">
          <p class="mb-6">
            [상호명](이하 "회사")은 YEMO(예모) 서비스의 유료 구독과 관련하여 공정하고 투명한 환불 정책을 운영합니다.
            본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」에 따릅니다.
          </p>

          <!-- 1. 구독 플랜 개요 -->
          <h5 class="text-h5 mb-4">
            1. 구독 플랜 개요
          </h5>
          <VTable class="mb-6">
            <thead>
              <tr>
                <th>구분</th>
                <th>무료 플랜</th>
                <th>베이직 플랜</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>월 요금</td>
                <td>0원</td>
                <td>22,000원 (VAT 별도)</td>
              </tr>
              <tr>
                <td>월 예약 건수</td>
                <td>30건</td>
                <td>무제한</td>
              </tr>
              <tr>
                <td>스태프 수</td>
                <td>1명</td>
                <td>5명</td>
              </tr>
              <tr>
                <td>무료 체험</td>
                <td>-</td>
                <td>30일</td>
              </tr>
            </tbody>
          </VTable>

          <!-- 2. 무료 체험 기간 -->
          <h5 class="text-h5 mb-4">
            2. 무료 체험 기간
          </h5>
          <ul class="mb-6">
            <li>베이직 플랜은 최초 가입 시 30일간 무료 체험이 제공됩니다.</li>
            <li>무료 체험 기간 중에는 결제가 발생하지 않으며, 체험 종료 후 자동 과금되지 않습니다.</li>
            <li>무료 체험 기간 중 해지 시 별도의 비용이 발생하지 않습니다.</li>
          </ul>

          <!-- 3. 환불 기준 -->
          <h5 class="text-h5 mb-4">
            3. 환불 기준
          </h5>

          <h6 class="text-h6 mb-3">
            3.1 결제일 기준 7일 이내 해지
          </h6>
          <p class="mb-2">
            <strong>전액 환불</strong>
          </p>
          <p class="mb-6">
            서비스 이용 여부와 관계없이 결제일로부터 7일 이내에 해지를 신청하면 결제 금액 전액을 환불합니다.
          </p>

          <h6 class="text-h6 mb-3">
            3.2 결제일 기준 7일 초과 해지
          </h6>
          <p class="mb-2">
            <strong>일할 계산 환불</strong>
          </p>

          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-body-2">
              <strong>환불 금액 산정 방식:</strong><br>
              환불 금액 = 월 이용료 &divide; 해당월 일수 &times; 잔여 일수
            </div>
          </VAlert>

          <p class="mb-2">
            계산 예시 (월 22,000원 기준, 해당월 30일):
          </p>
          <ul class="mb-6">
            <li>10일 사용 후 해지 → 22,000 &divide; 30 &times; 20 = <strong>14,667원</strong> 환불</li>
            <li>20일 사용 후 해지 → 22,000 &divide; 30 &times; 10 = <strong>7,333원</strong> 환불</li>
            <li>25일 사용 후 해지 → 22,000 &divide; 30 &times; 5 = <strong>3,667원</strong> 환불</li>
          </ul>

          <h6 class="text-h6 mb-3">
            3.3 환불이 제한되는 경우
          </h6>
          <VAlert
            type="warning"
            variant="tonal"
            class="mb-6"
          >
            <div class="text-body-2">
              <ul class="mb-0">
                <li>
                  이용자의 귀책사유(<RouterLink to="/terms">
                    약관
                  </RouterLink> 위반 등)로 서비스 이용이 정지된 경우
                </li>
                <li>이벤트 및 프로모션을 통해 무상으로 제공된 서비스의 경우</li>
                <li>쿠폰 할인이 적용된 경우, 실제 결제 금액 기준으로 환불 금액을 산정합니다.</li>
              </ul>
            </div>
          </VAlert>

          <!-- 4. 환불 절차 -->
          <h5 class="text-h5 mb-4">
            4. 환불 절차
          </h5>
          <VTable class="mb-4">
            <thead>
              <tr>
                <th>단계</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>① 해지 신청</td>
                <td>서비스 내 [구독 관리] 메뉴에서 해지 신청</td>
              </tr>
              <tr>
                <td>② 해지 확인</td>
                <td>해지 사유 선택(선택사항) 후 최종 확인</td>
              </tr>
              <tr>
                <td>③ 환불 처리</td>
                <td>해지 신청일로부터 5영업일 이내 처리</td>
              </tr>
              <tr>
                <td>④ 환불 완료</td>
                <td>원래 결제수단으로 환불 (카드 취소 또는 계좌 입금)</td>
              </tr>
            </tbody>
          </VTable>
          <ul class="mb-6">
            <li>환불 처리 완료 시 등록된 이메일로 환불 완료 안내를 발송합니다.</li>
            <li>신용카드 결제 취소의 경우 카드사 사정에 따라 취소 확인까지 3~5영업일이 추가로 소요될 수 있습니다.</li>
          </ul>

          <!-- 5. 해지 후 데이터 처리 -->
          <h5 class="text-h5 mb-4">
            5. 해지 후 데이터 처리
          </h5>
          <VTable class="mb-6">
            <thead>
              <tr>
                <th>항목</th>
                <th>기간</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>데이터 보관</td>
                <td>해지일로부터 30일</td>
                <td>예약, 고객, 서비스 등 모든 데이터 보관</td>
              </tr>
              <tr>
                <td>데이터 복구</td>
                <td>30일 이내 재가입 시</td>
                <td>기존 데이터 복구 가능</td>
              </tr>
              <tr>
                <td>데이터 삭제</td>
                <td>30일 경과 후</td>
                <td>모든 데이터 영구 삭제</td>
              </tr>
              <tr>
                <td>법정 보관</td>
                <td>관계 법령에 따름</td>
                <td>결제 기록(5년), 분쟁 기록(3년) 등</td>
              </tr>
            </tbody>
          </VTable>

          <!-- 6. 플랜 변경 시 정책 -->
          <h5 class="text-h5 mb-4">
            6. 플랜 변경 시 정책
          </h5>

          <h6 class="text-h6 mb-3">
            6.1 업그레이드 (무료 → 베이직)
          </h6>
          <ul class="mb-6">
            <li>변경 즉시 베이직 플랜 기능이 활성화됩니다.</li>
            <li>변경일부터 1개월 단위로 결제가 시작됩니다.</li>
            <li>기존 데이터(예약, 고객, 서비스 정보 등)는 모두 유지됩니다.</li>
          </ul>

          <h6 class="text-h6 mb-3">
            6.2 다운그레이드 (베이직 → 무료)
          </h6>
          <ul class="mb-6">
            <li>현재 결제 주기가 끝나는 시점에 무료 플랜으로 전환됩니다.</li>
            <li>잔여 기간의 베이직 기능은 결제 주기 종료 시까지 유지됩니다.</li>
            <li>전환 후 무료 플랜의 제한(월 30건, 스태프 1명)이 적용됩니다.</li>
            <li>기존 데이터는 삭제되지 않으며, 열람은 가능하나 제한 초과분의 신규 등록이 제한됩니다.</li>
          </ul>

          <!-- 7. 문의처 -->
          <h5 class="text-h5 mb-4">
            7. 문의처
          </h5>
          <p class="mb-2">
            환불 및 구독 관련 문의는 아래로 연락해 주세요.
          </p>
          <ul class="mb-6">
            <li>이메일: support@yemo.kr</li>
            <li>전화: [전화번호]</li>
            <li>운영 시간: 평일 10:00 ~ 18:00 (공휴일 제외)</li>
          </ul>

          <!-- 8. 관련 법률 -->
          <h5 class="text-h5 mb-4">
            8. 관련 법률
          </h5>
          <p class="mb-2">
            본 환불 정책은 다음 법령에 근거합니다.
          </p>
          <ul class="mb-6">
            <li>「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 (청약철회 등)</li>
            <li>「콘텐츠산업 진흥법」 제27조 (콘텐츠이용자의 청약철회)</li>
            <li>「콘텐츠이용자보호지침」 (공정거래위원회 고시)</li>
          </ul>

          <VDivider class="mb-6" />

          <div class="text-body-2 text-medium-emphasis">
            <p class="mb-1">
              [상호명] | 이메일: support@yemo.kr | 전화: [전화번호]
            </p>
            <p>
              <RouterLink
                to="/terms"
                class="text-primary"
              >
                이용약관
              </RouterLink>
              &middot;
              <RouterLink
                to="/privacy"
                class="text-primary"
              >
                개인정보처리방침
              </RouterLink>
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
    title: '환불 정책',
  },
})
</script>
