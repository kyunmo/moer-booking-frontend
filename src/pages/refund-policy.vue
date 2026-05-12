<script setup>
import { RouterLink } from 'vue-router'
import LegalToc from '@/components/yemo/legal/LegalToc.vue'

definePage({
  meta: {
    layout: 'legal',
    public: true,
    title: '환불정책 — YEMO',
    description: 'YEMO 유료 구독 환불정책. 공정하고 투명한 환불 기준 안내. 시행일 2026년 4월 1일.',
    keywords: '환불정책, 구독 환불, 해지, 환불 기준',
  },
})

const toc = [
  { id: 'r-1', label: '1. 구독 플랜 개요' },
  { id: 'r-2', label: '2. 무료 체험 기간' },
  { id: 'r-3', label: '3. 환불 기준' },
  { id: 'r-4', label: '4. 환불 절차' },
  { id: 'r-5', label: '5. 해지 후 데이터' },
  { id: 'r-6', label: '6. 플랜 변경 정책' },
  { id: 'r-7', label: '7. 문의처' },
  { id: 'r-8', label: '8. 관련 법률' },
]
</script>

<template>
  <div class="legal">
    <div class="legal__wrap">
      <article class="legal__article">
        <header class="legal__title">
          <p class="t-label t-accent">Refund Policy</p>
          <h1 class="t-display-md t-strong">환불정책</h1>
          <p class="legal__meta">시행일 2026년 4월 1일</p>
        </header>

        <p class="legal__intro">
          YEMO(이하 "회사")는 YEMO 서비스의 유료 구독과 관련하여 공정하고 투명한 환불정책을 운영합니다.
          본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업 진흥법」에 따릅니다.
        </p>

        <section id="r-1">
          <h2>1. 구독 플랜 개요</h2>
          <table class="legal-table">
            <thead><tr><th>구분</th><th>무료 플랜</th><th>유료 플랜</th></tr></thead>
            <tbody>
              <tr><td>월 요금</td><td>0원</td><td>20,000원/월 (VAT 별도)</td></tr>
              <tr><td>월 예약 건수</td><td>50건</td><td>무제한</td></tr>
              <tr><td>스태프 수</td><td>1명</td><td>5명</td></tr>
              <tr><td>무료 체험</td><td>—</td><td>30일</td></tr>
            </tbody>
          </table>
        </section>

        <section id="r-2">
          <h2>2. 무료 체험 기간</h2>
          <ul>
            <li>유료 플랜은 최초 가입 시 30일간 무료 체험이 제공됩니다.</li>
            <li>무료 체험 기간 중에는 결제가 발생하지 않으며, 체험 종료 후 자동 과금되지 않습니다.</li>
            <li>무료 체험 기간 중 해지 시 별도의 비용이 발생하지 않습니다.</li>
          </ul>
        </section>

        <section id="r-3">
          <h2>3. 환불 기준</h2>

          <h3>3.1 결제일 기준 7일 이내 해지</h3>
          <p><strong>전액 환불</strong> — 서비스 이용 여부와 관계없이 결제일로부터 7일 이내에 해지를 신청하면 결제 금액 전액을 환불합니다.</p>

          <h3>3.2 결제일 기준 7일 초과 해지</h3>
          <p><strong>일할 계산 환불</strong></p>
          <div class="legal-alert legal-alert--info">
            <strong>환불 금액 산정 방식</strong><br>
            환불 금액 = 월 이용료 ÷ 해당월 일수 × 잔여 일수
          </div>
          <p>계산 예시 (월 20,000원 VAT 별도, 해당월 30일):</p>
          <ul>
            <li>10일 사용 후 해지 → 20,000 ÷ 30 × 20 = <strong>약 13,333원</strong> 환불</li>
            <li>20일 사용 후 해지 → 20,000 ÷ 30 × 10 = <strong>약 6,666원</strong> 환불</li>
            <li>25일 사용 후 해지 → 20,000 ÷ 30 × 5 = <strong>약 3,333원</strong> 환불</li>
          </ul>

          <h3>3.3 환불이 제한되는 경우</h3>
          <div class="legal-alert legal-alert--warning">
            <ul>
              <li>이용자의 귀책사유(<RouterLink to="/terms">약관</RouterLink> 위반 등)로 서비스 이용이 정지된 경우</li>
              <li>이벤트 및 프로모션을 통해 무상으로 제공된 서비스의 경우</li>
              <li>쿠폰 할인이 적용된 경우, 실제 결제 금액 기준으로 환불 금액을 산정합니다.</li>
            </ul>
          </div>
        </section>

        <section id="r-4">
          <h2>4. 환불 절차</h2>
          <table class="legal-table">
            <thead><tr><th>단계</th><th>내용</th></tr></thead>
            <tbody>
              <tr><td>① 해지 신청</td><td>서비스 내 [구독 관리] 메뉴에서 해지 신청</td></tr>
              <tr><td>② 해지 확인</td><td>해지 사유 선택(선택사항) 후 최종 확인</td></tr>
              <tr><td>③ 환불 처리</td><td>해지 신청일로부터 5영업일 이내 처리</td></tr>
              <tr><td>④ 환불 완료</td><td>원래 결제수단으로 환불 (카드 취소 또는 계좌 입금)</td></tr>
            </tbody>
          </table>
          <ul>
            <li>환불 처리 완료 시 등록된 이메일로 환불 완료 안내를 발송합니다.</li>
            <li>신용카드 결제 취소의 경우 카드사 사정에 따라 취소 확인까지 3~5영업일이 추가로 소요될 수 있습니다.</li>
          </ul>
        </section>

        <section id="r-5">
          <h2>5. 해지 후 데이터 처리</h2>
          <table class="legal-table">
            <thead><tr><th>항목</th><th>기간</th><th>설명</th></tr></thead>
            <tbody>
              <tr><td>데이터 보관</td><td>해지일로부터 30일</td><td>예약·고객·서비스 등 모든 데이터 보관</td></tr>
              <tr><td>데이터 복구</td><td>30일 이내 재가입 시</td><td>기존 데이터 복구 가능</td></tr>
              <tr><td>데이터 삭제</td><td>30일 경과 후</td><td>모든 데이터 영구 삭제</td></tr>
              <tr><td>법정 보관</td><td>관계 법령에 따름</td><td>결제 기록(5년), 분쟁 기록(3년) 등</td></tr>
            </tbody>
          </table>
        </section>

        <section id="r-6">
          <h2>6. 플랜 변경 시 정책</h2>

          <h3>6.1 업그레이드 (무료 → 유료)</h3>
          <ul>
            <li>변경 즉시 유료 플랜 기능이 활성화됩니다.</li>
            <li>변경일부터 1개월 단위로 결제가 시작됩니다.</li>
            <li>기존 데이터(예약·고객·서비스 정보 등)는 모두 유지됩니다.</li>
          </ul>

          <h3>6.2 다운그레이드 (유료 → 무료)</h3>
          <ul>
            <li>현재 결제 주기가 끝나는 시점에 무료 플랜으로 전환됩니다.</li>
            <li>잔여 기간의 유료 기능은 결제 주기 종료 시까지 유지됩니다.</li>
            <li>전환 후 무료 플랜의 제한(월 50건, 스태프 1명)이 적용됩니다.</li>
            <li>기존 데이터는 삭제되지 않으며, 열람은 가능하나 제한 초과분의 신규 등록이 제한됩니다.</li>
          </ul>
        </section>

        <section id="r-7">
          <h2>7. 문의처</h2>
          <p>환불 및 구독 관련 문의는 아래로 연락해 주세요.</p>
          <ul>
            <li>이메일 — support@yemo.io</li>
            <li>카카오톡 채널 — @YEMO</li>
            <li>운영 시간 — 평일 09:00 ~ 22:00 (주말 카카오톡 응답)</li>
          </ul>
        </section>

        <section id="r-8">
          <h2>8. 관련 법률</h2>
          <p>본 환불정책은 다음 법령에 근거합니다.</p>
          <ul>
            <li>「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 (청약철회 등)</li>
            <li>「콘텐츠산업 진흥법」 제27조 (콘텐츠이용자의 청약철회)</li>
            <li>「콘텐츠이용자보호지침」 (공정거래위원회 고시)</li>
          </ul>
        </section>

        <hr class="legal__divider">

        <div class="legal__company">
          <div><strong>상호</strong> YEMO</div>
          <div><strong>사업자등록번호</strong> 744-02-03358</div>
          <div><strong>이메일</strong> support@yemo.io</div>
        </div>

        <div class="legal__related">
          <RouterLink to="/terms">이용약관 →</RouterLink>
          <RouterLink to="/privacy">개인정보처리방침 →</RouterLink>
        </div>
      </article>

      <aside class="legal__toc">
        <LegalToc :items="toc" />
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.legal { padding: 40px 0 96px; }

.legal__wrap {
  max-width: 1100px;
  margin-inline: auto;
  padding-inline: 32px;
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 64px;
  align-items: start;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    padding-inline: 16px;
    gap: 24px;
  }
}

.legal__article {
  max-width: 720px;
  font-size: 16px;
  line-height: 1.85;
  color: var(--y-text);

  :deep(p) { margin: 0 0 16px; }
  :deep(ol), :deep(ul) {
    padding-inline-start: 24px;
    margin: 0 0 16px;
    li { margin-bottom: 6px; line-height: 1.85; }
    ul, ol { margin-top: 6px; }
  }
  :deep(strong) { font-weight: 700; color: var(--y-text-strong); }
  :deep(a) { color: var(--y-accent-deep); font-weight: 600; }
  :deep(section) { margin-top: 48px; }
  :deep(h2) {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--y-text-strong);
    margin: 0 0 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--y-accent);
    scroll-margin-top: 80px;
  }
  :deep(h3) {
    font-size: 17px;
    font-weight: 700;
    color: var(--y-text-strong);
    margin: 32px 0 12px;
  }
}

.legal__title {
  margin-bottom: 32px;
  border-bottom: 1px solid var(--y-border);
  padding-bottom: 24px;
  h1 { margin: 8px 0; }
}
.legal__meta { font-size: 13px; color: var(--y-text-muted); }
.legal__intro { font-size: 16px; line-height: 1.85; color: var(--y-text-muted); }

.legal-alert {
  margin: 16px 0;
  padding: 16px 20px;
  border-radius: var(--y-radius);
  font-size: 14px;
  line-height: 1.7;
  &--info {
    background: var(--y-info-soft);
    color: #2D4A7A;
    border-left: 3px solid var(--y-info);
  }
  &--warning {
    background: var(--y-warning-soft);
    color: #7A5A2A;
    border-left: 3px solid var(--y-warning);
  }
  ul { margin: 0; padding-inline-start: 20px; }
}

.legal-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 24px;
  font-size: 13px;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius);
  overflow: hidden;

  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid var(--y-border);
    border-right: 1px solid var(--y-border);
    vertical-align: top;
    &:last-child { border-right: none; }
  }
  th {
    background: var(--y-bg);
    font-weight: 700;
    color: var(--y-text-strong);
    font-size: 12px;
    letter-spacing: 0.02em;
  }
  tr:last-child td { border-bottom: none; }
}

.legal__divider { margin: 56px 0 24px; border: none; border-top: 1px solid var(--y-border); }
.legal__company {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 13px;
  color: var(--y-text-muted);
  margin-bottom: 24px;
}
.legal__related {
  display: flex; gap: 24px;
  font-size: 14px;
  font-weight: 600;
  a { color: var(--y-accent-deep); }
}

.legal__toc {
  position: sticky;
  top: 88px;
  align-self: start;
  @media (max-width: 968px) {
    position: static;
    order: -1;
  }
}
</style>
