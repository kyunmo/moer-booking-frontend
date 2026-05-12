<script setup>
import { RouterLink } from 'vue-router'
import LegalToc from '@/components/yemo/legal/LegalToc.vue'

definePage({
  meta: {
    layout: 'legal',
    public: true,
    title: '개인정보처리방침 — YEMO',
    description: 'YEMO 개인정보처리방침. 시행일 2026년 4월 1일.',
    keywords: '개인정보처리방침, 개인정보보호, 프라이버시',
  },
})

const toc = [
  { id: 'sec-1', label: '제1조 처리 목적' },
  { id: 'sec-2', label: '제2조 수집 항목' },
  { id: 'sec-3', label: '제3조 보유 기간' },
  { id: 'sec-4', label: '제4조 제3자 제공' },
  { id: 'sec-5', label: '제5조 위탁' },
  { id: 'sec-6', label: '제6조 정보주체 권리' },
  { id: 'sec-7', label: '제7조 파기' },
  { id: 'sec-8', label: '제8조 안전성 확보' },
  { id: 'sec-9', label: '제9조 자동 수집 장치' },
  { id: 'sec-10', label: '제10조 보호책임자' },
  { id: 'sec-11', label: '제11조 권익침해 구제' },
  { id: 'sec-12', label: '제12조 방침 변경' },
  { id: 'sec-appendix', label: '부칙' },
]
</script>

<template>
  <div class="legal">
    <div class="legal__wrap">
      <article class="legal__article">
        <header class="legal__title">
          <p class="t-label t-accent">Privacy Policy</p>
          <h1 class="t-display-md t-strong">개인정보처리방침</h1>
          <p class="legal__meta">시행일 2026년 4월 1일</p>
        </header>

        <p class="legal__intro">
          YEMO(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <div class="legal-alert legal-alert--warning">
          본 서비스는 <strong>B2B2C 플랫폼</strong>입니다. 회사가 매장 관리자에게 서비스를 제공하고, 매장 관리자가 고객에게 예약 서비스를 제공하는 구조이므로 개인정보 처리 주체와 범위가 구분됩니다.
        </div>

        <section id="sec-1">
          <h2>제1조 (개인정보의 처리 목적)</h2>
          <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.</p>
          <table class="legal-table">
            <thead><tr><th>구분</th><th>처리 목적</th><th>상세</th></tr></thead>
            <tbody>
              <tr><td rowspan="3">매장 관리자</td><td>회원가입 및 관리</td><td>계정 생성, 본인 확인, 서비스 제공, 구독 관리</td></tr>
              <tr><td>서비스 제공</td><td>예약 관리, 매장 운영 지원, 통계 분석</td></tr>
              <tr><td>요금 결제 및 정산</td><td>구독 결제, 환불 처리, 세금계산서 발행</td></tr>
              <tr><td rowspan="2">고객 회원</td><td>회원가입 및 관리</td><td>카카오 로그인 인증, 예약 이력 관리</td></tr>
              <tr><td>예약 서비스 제공</td><td>예약 접수, 변경, 취소, 리마인더 발송</td></tr>
              <tr><td>비회원</td><td>예약 조회</td><td>예약번호 + 전화번호 기반 예약 확인</td></tr>
              <tr><td>공통</td><td>고충처리</td><td>민원 처리, 분쟁 조정, 서비스 개선</td></tr>
            </tbody>
          </table>
        </section>

        <section id="sec-2">
          <h2>제2조 (수집하는 개인정보의 항목)</h2>
          <p>회사는 서비스 제공을 위해 최소한의 개인정보를 수집합니다.</p>
          <table class="legal-table">
            <thead><tr><th>대상</th><th>구분</th><th>수집 항목</th><th>수집 방법</th></tr></thead>
            <tbody>
              <tr><td rowspan="2">매장 관리자</td><td>필수</td><td>이름, 이메일, 비밀번호(암호화), 전화번호, 매장명</td><td>회원가입 시 입력</td></tr>
              <tr><td>선택</td><td>매장 주소, 사업자등록번호, 프로필 이미지, SNS 연동 정보</td><td>이용 중 입력 또는 OAuth 연동</td></tr>
              <tr><td rowspan="2">고객 회원</td><td>필수</td><td>카카오 계정 식별자, 이름(닉네임)</td><td>카카오 로그인 시 자동 수집</td></tr>
              <tr><td>선택</td><td>전화번호, 이메일, 생년월일, 성별, 마케팅 수신 동의</td><td>프로필 등록 시 입력</td></tr>
              <tr><td rowspan="2">매장 고객<br><small>(매장 관리자가 등록)</small></td><td>필수</td><td>이름, 전화번호</td><td>매장 관리자가 등록</td></tr>
              <tr><td>선택</td><td>이메일, 생년월일, 성별, 메모, 태그</td><td>매장 관리자가 등록</td></tr>
              <tr><td>자동 수집</td><td>—</td><td>IP, 접속 로그, 쿠키, 이용 기록, User-Agent</td><td>서비스 이용 중 자동 생성</td></tr>
            </tbody>
          </table>
        </section>

        <section id="sec-3">
          <h2>제3조 (개인정보의 처리 및 보유 기간)</h2>
          <p>회사는 법령에 따른 보유·이용 기간 또는 정보주체로부터 동의받은 기간 내에서 개인정보를 처리·보유합니다.</p>
          <table class="legal-table">
            <thead><tr><th>보유 항목</th><th>보유 기간</th><th>근거</th></tr></thead>
            <tbody>
              <tr><td>회원 정보 (매장 관리자/고객)</td><td>회원 탈퇴 시까지</td><td>서비스 이용 계약</td></tr>
              <tr><td>탈퇴 후 데이터 보관</td><td>탈퇴일로부터 30일</td><td>재가입 시 복구 지원</td></tr>
              <tr><td>계약 또는 청약철회 기록</td><td>5년</td><td>전자상거래법 제6조</td></tr>
              <tr><td>대금결제 및 재화 공급 기록</td><td>5년</td><td>전자상거래법 제6조</td></tr>
              <tr><td>소비자 불만·분쟁 처리 기록</td><td>3년</td><td>전자상거래법 제6조</td></tr>
              <tr><td>접속 로그 기록</td><td>3개월 이상</td><td>통신비밀보호법 제15조의2</td></tr>
            </tbody>
          </table>
        </section>

        <section id="sec-4">
          <h2>제4조 (개인정보의 제3자 제공)</h2>
          <p>회사는 원칙적으로 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서 처리하며, 사전 동의 없이 본래 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.</p>
          <p>다만, 다음의 경우에는 개인정보를 제3자에게 제공할 수 있습니다.</p>
          <ol>
            <li>정보주체가 사전에 동의한 경우</li>
            <li>법률에 특별한 규정이 있거나 법령상 의무 준수를 위해 불가피한 경우</li>
            <li>정보주체 또는 법정대리인이 의사표시를 할 수 없는 상태에서 명백히 생명·신체·재산의 이익을 위해 필요한 경우</li>
          </ol>
          <div class="legal-alert legal-alert--warning">
            <strong>B2B2C 구조에서의 처리 관계.</strong> 매장 관리자가 서비스를 통해 등록하는 고객 정보(이름, 전화번호 등)는 매장 관리자가 개인정보 처리자로서 수집·관리하는 것이며, 회사는 매장 관리자에게 예약 관리 도구를 제공하는 위탁 처리자의 역할을 합니다. 매장 관리자는 자신의 고객에 대한 개인정보 보호 의무를 직접 부담합니다.
          </div>
        </section>

        <section id="sec-5">
          <h2>제5조 (개인정보 처리의 위탁)</h2>
          <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁합니다.</p>
          <table class="legal-table">
            <thead><tr><th>수탁업체</th><th>위탁 업무</th><th>보유 기간</th></tr></thead>
            <tbody>
              <tr><td>PG사 (예: 토스페이먼츠)</td><td>구독 결제 처리</td><td>위탁 계약 종료 시까지</td></tr>
              <tr><td>네이버 클라우드</td><td>서버 호스팅, 데이터 저장</td><td>위탁 계약 종료 시까지</td></tr>
              <tr><td>카카오 비즈메시지 딜러사</td><td>카카오 알림톡 발송</td><td>발송 완료 시까지</td></tr>
            </tbody>
          </table>
          <p>회사는 위탁 계약 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독 등에 관한 사항을 문서에 명시합니다.</p>
        </section>

        <section id="sec-6">
          <h2>제6조 (정보주체의 권리·의무 및 행사방법)</h2>
          <p>정보주체는 회사에 대해 언제든지 다음의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
          <ol>
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ol>
          <p>권리 행사는 서비스 내 설정 페이지를 통해 직접 처리하거나, 이메일(<strong>support@yemo.io</strong>)로 요청할 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
          <p>권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통해서도 할 수 있습니다. 이 경우 「개인정보 처리 방법에 관한 고시」 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.</p>
        </section>

        <section id="sec-7">
          <h2>제7조 (개인정보의 파기)</h2>
          <ol>
            <li>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때 지체 없이 해당 개인정보를 파기합니다.</li>
            <li>파기 방법
              <ul>
                <li>전자적 파일: 복구 및 재생이 되지 않도록 기술적 방법을 이용하여 안전하게 삭제</li>
                <li>기록물·인쇄물·서면: 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </li>
            <li>매장 관리자가 서비스 해지 시, 해당 매장의 모든 데이터(예약, 고객, 서비스 정보 등)는 30일간 보관 후 영구 삭제됩니다.</li>
          </ol>
        </section>

        <section id="sec-8">
          <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.</p>
          <ol>
            <li><strong>관리적 조치</strong> — 내부관리계획 수립·시행, 개인정보 취급자 지정 및 교육</li>
            <li><strong>기술적 조치</strong>
              <ul>
                <li>비밀번호 암호화: BCrypt 일방향 암호화 저장</li>
                <li>전화번호 등 개인정보: AES-256 암호화 또는 접근통제</li>
                <li>데이터 전송 구간: SSL/TLS(HTTPS) 암호화 적용</li>
                <li>데이터베이스 통신: SSL 암호화 연결</li>
                <li>해킹 등에 대비한 접근통제 및 침입탐지 시스템 운영</li>
                <li>감사 로그 기록 및 보관</li>
              </ul>
            </li>
            <li><strong>물리적 조치</strong> — 클라우드 서버(네이버 클라우드)의 물리적 보안 체계 활용</li>
          </ol>
        </section>

        <section id="sec-9">
          <h2>제9조 (자동 수집 장치의 설치·운영 및 거부)</h2>
          <ol>
            <li>회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(Cookie)를 사용합니다.</li>
            <li>쿠키는 웹사이트를 운영하는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자의 하드디스크에 저장됩니다.</li>
            <li>회사에서 사용하는 쿠키의 목적
              <ul>
                <li><strong>필수 쿠키</strong> — 로그인 인증 토큰(JWT) 관리, 세션 유지</li>
                <li><strong>기능 쿠키</strong> — 다크 모드 설정, 언어 설정 등 사용자 환경 저장</li>
              </ul>
            </li>
            <li>이용자는 웹 브라우저의 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 거부 시 로그인이 필요한 일부 서비스 이용이 제한될 수 있습니다.</li>
            <li>쿠키 설정 거부 방법
              <ul>
                <li>Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
                <li>Edge: 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터</li>
                <li>Safari: 환경설정 → 개인정보 보호</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="sec-10">
          <h2>제10조 (개인정보 보호책임자)</h2>
          <p>회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 정보주체의 불만 처리 및 피해구제 등을 위해 아래와 같이 개인정보 보호책임자를 지정합니다.</p>
          <div class="legal-card">
            <div><strong>개인정보 보호책임자</strong> 구균모</div>
            <div><strong>직위</strong> 대표</div>
            <div><strong>이메일</strong> support@yemo.io</div>
          </div>
          <p>정보주체는 서비스 이용 중 발생한 모든 개인정보 보호 관련 문의·불만 처리·피해구제 사항을 보호책임자에게 문의할 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리합니다.</p>
        </section>

        <section id="sec-11">
          <h2>제11조 (권익침해 구제방법)</h2>
          <p>정보주체는 아래 기관에 개인정보 침해에 대한 피해구제·상담 등을 문의할 수 있습니다.</p>
          <table class="legal-table">
            <thead><tr><th>기관</th><th>연락처</th><th>웹사이트</th></tr></thead>
            <tbody>
              <tr><td>개인정보 침해신고센터</td><td>(국번없이) 118</td><td>privacy.kisa.or.kr</td></tr>
              <tr><td>개인정보 분쟁조정위원회</td><td>(국번없이) 1833-6972</td><td>kopico.go.kr</td></tr>
              <tr><td>대검찰청 사이버수사과</td><td>(국번없이) 1301</td><td>spo.go.kr</td></tr>
              <tr><td>경찰청 사이버수사국</td><td>(국번없이) 182</td><td>ecrm.police.go.kr</td></tr>
            </tbody>
          </table>
        </section>

        <section id="sec-12">
          <h2>제12조 (개인정보처리방침의 변경)</h2>
          <ol>
            <li>본 방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가·삭제·정정이 있는 경우 시행 7일 전부터 서비스 내 공지사항을 통해 고지합니다.</li>
            <li>이전 방침은 서비스 웹사이트에서 확인할 수 있습니다.</li>
          </ol>
        </section>

        <section id="sec-appendix">
          <h2>부칙</h2>
          <p>본 개인정보처리방침은 <strong>2026년 4월 1일</strong>부터 시행합니다.</p>
        </section>

        <hr class="legal__divider">

        <div class="legal__company">
          <div><strong>상호</strong> YEMO</div>
          <div><strong>대표자</strong> 구균모</div>
          <div><strong>사업자등록번호</strong> 744-02-03358</div>
          <div><strong>주소</strong> 경기도 의왕시 백운중앙로 46</div>
          <div><strong>이메일</strong> support@yemo.io</div>
        </div>

        <div class="legal__related">
          <RouterLink to="/terms">이용약관 →</RouterLink>
          <RouterLink to="/refund-policy">환불정책 →</RouterLink>
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
  :deep(section) { margin-top: 48px; }
  :deep(h2) {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--y-text-strong);
    margin: 0 0 20px;
    scroll-margin-top: 80px;
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
  margin: 24px 0;
  padding: 16px 20px;
  border-radius: var(--y-radius);
  font-size: 14px;
  line-height: 1.7;
  &--warning {
    background: var(--y-warning-soft);
    color: #7A5A2A;
    border-left: 3px solid var(--y-warning);
  }
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
  small { font-size: 11px; color: var(--y-text-muted); }
}

.legal-card {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  margin: 16px 0 24px;
}

.legal__divider {
  margin: 56px 0 24px;
  border: none;
  border-top: 1px solid var(--y-border);
}
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
