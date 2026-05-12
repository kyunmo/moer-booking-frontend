<script setup>
import { RouterLink } from 'vue-router'
import LegalToc from '@/components/yemo/legal/LegalToc.vue'

definePage({
  meta: {
    layout: 'legal',
    public: true,
    title: '이용약관 — YEMO',
    description: 'YEMO 서비스 이용약관. 시행일 2026년 4월 1일.',
    keywords: '이용약관, 서비스 약관, 이용 규정',
  },
})

const toc = [
  { id: 'ch-1', label: '제1장 총칙' },
  { id: 'ch-2', label: '제2장 이용 계약' },
  { id: 'ch-3', label: '제3장 서비스 이용' },
  { id: 'ch-4', label: '제4장 구독·요금' },
  { id: 'ch-5', label: '제5장 이용자 의무' },
  { id: 'ch-6', label: '제6장 회사 의무' },
  { id: 'ch-7', label: '제7장 해지·제한' },
  { id: 'ch-8', label: '제8장 면책·배상' },
  { id: 'ch-9', label: '제9장 기타' },
  { id: 'ch-appendix', label: '부칙' },
]
</script>

<template>
  <div class="legal">
    <div class="legal__wrap">
      <article class="legal__article">
        <header class="legal__title">
          <p class="t-label t-accent">Terms of Service</p>
          <h1 class="t-display-md t-strong">이용약관</h1>
          <p class="legal__meta">시행일 2026년 4월 1일</p>
        </header>

        <section id="ch-1">
          <h2>제1장 총칙</h2>
          <h3>제1조 (목적)</h3>
          <p>본 약관은 YEMO(이하 "회사")가 운영하는 YEMO 예약 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

          <h3>제2조 (정의)</h3>
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ol>
            <li>"서비스"란 회사가 제공하는 YEMO 예약 관리 SaaS 플랫폼 및 이에 부수하는 제반 서비스를 의미합니다.</li>
            <li>"매장 관리자"란 서비스에 가입하여 매장의 예약·고객·서비스를 관리하는 사업자(개인사업자 또는 법인)를 의미합니다.</li>
            <li>"고객 회원"이란 매장의 예약 페이지를 통해 예약하거나 리뷰를 작성하기 위해 카카오 계정으로 로그인한 이용자를 의미합니다.</li>
            <li>"비회원"이란 회원가입 없이 예약번호와 전화번호로 예약을 조회하는 이용자를 의미합니다.</li>
            <li>"이용자"란 매장 관리자, 고객 회원, 비회원을 포함하여 서비스를 이용하는 모든 자를 의미합니다.</li>
            <li>"구독"이란 매장 관리자가 서비스의 유료 기능을 이용하기 위해 정기적으로 이용료를 지급하는 것을 의미합니다.</li>
            <li>"슬러그(Slug)"란 매장별로 부여되는 고유 URL 주소(예: yemo.io/booking/매장명)를 의미합니다.</li>
          </ol>

          <h3>제3조 (약관의 게시와 개정)</h3>
          <ol>
            <li>회사는 본 약관의 내용을 서비스 웹사이트(yemo.io) 및 서비스 내 설정 페이지에 게시합니다.</li>
            <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
            <li>약관이 개정될 경우, 회사는 적용일 7일 전부터 서비스 내 공지사항 또는 이메일을 통해 고지합니다. 다만, 이용자에게 불리한 내용의 변경인 경우에는 30일 전에 고지합니다.</li>
            <li>이용자가 개정 약관 시행일 이후에도 서비스를 계속 이용하는 경우, 개정 약관에 동의한 것으로 간주합니다.</li>
          </ol>

          <h3>제4조 (약관 외 준칙)</h3>
          <p>본 약관에서 정하지 아니한 사항에 대해서는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」 등 관계 법령 및 회사의 개인정보처리방침, 서비스 운영 정책에 따릅니다.</p>
        </section>

        <section id="ch-2">
          <h2>제2장 서비스 이용 계약</h2>
          <h3>제5조 (이용 계약의 체결)</h3>
          <ol>
            <li>이용 계약은 매장 관리자가 되고자 하는 자가 본 약관에 동의하고 회원가입을 신청한 후, 회사가 이를 승낙함으로써 체결됩니다.</li>
            <li>고객 회원의 이용 계약은 카카오 계정으로 로그인하고 서비스 이용에 동의함으로써 체결됩니다.</li>
            <li>회사는 다음 각 호에 해당하는 경우 이용 신청을 승낙하지 않거나 사후에 이용 계약을 해지할 수 있습니다.
              <ul>
                <li>가. 타인의 명의를 이용하거나 허위 정보를 기재한 경우</li>
                <li>나. 서비스 운영을 고의로 방해한 경우</li>
                <li>다. 관계 법령에 위반되거나 사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우</li>
                <li>라. 기타 회사가 합리적인 판단에 의하여 필요하다고 인정하는 경우</li>
              </ul>
            </li>
          </ol>

          <h3>제6조 (회원정보의 변경)</h3>
          <ol>
            <li>이용자는 서비스 내 설정 페이지를 통해 본인의 개인정보를 열람하고 수정할 수 있습니다.</li>
            <li>이용자는 회원가입 시 기재한 사항이 변경되었을 경우 즉시 수정하여야 하며, 수정하지 않아 발생하는 불이익에 대해 회사는 책임지지 않습니다.</li>
          </ol>
        </section>

        <section id="ch-3">
          <h2>제3장 서비스 이용</h2>
          <h3>제7조 (서비스의 내용)</h3>
          <p>회사가 제공하는 서비스의 주요 내용은 다음과 같습니다.</p>
          <ol>
            <li><strong>예약 관리</strong> — 캘린더/목록 기반 예약 생성·수정·취소·상태 변경</li>
            <li><strong>고객 관리</strong> — 고객 정보 등록, 방문 이력, VIP/단골 분류, 태그 관리</li>
            <li><strong>스태프 관리</strong> — 직원 등록, 직급 관리, 포트폴리오, 스케줄 관리</li>
            <li><strong>서비스 관리</strong> — 시술/서비스 메뉴 등록, 카테고리 분류, 가격 설정</li>
            <li><strong>통계/분석</strong> — 매출, 예약, 고객, 직원 성과, 서비스별 분석</li>
            <li><strong>리뷰 관리</strong> — 고객 리뷰 조회, 답변 작성</li>
            <li><strong>고객 예약 페이지</strong> — 슬러그 기반 매장별 온라인 예약 페이지 제공</li>
            <li><strong>알림 서비스</strong> — 예약 확인, 리마인더 등 카카오 알림톡 발송</li>
          </ol>

          <h3>제8조 (서비스의 변경 및 중단)</h3>
          <ol>
            <li>회사는 운영상·기술상의 필요에 의해 서비스의 전부 또는 일부를 변경할 수 있으며, 변경 시 7일 전에 서비스 내 공지합니다.</li>
            <li>회사는 다음 각 호의 사유가 있는 경우 서비스의 전부 또는 일부를 일시적으로 중단할 수 있습니다.
              <ul>
                <li>가. 시스템 정기점검, 증설 및 교체</li>
                <li>나. 정전, 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</li>
                <li>다. 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
              </ul>
            </li>
            <li>서비스 중단의 경우 회사는 가능한 한 사전에 이용자에게 통지합니다.</li>
          </ol>

          <h3>제9조 (서비스 이용 시간)</h3>
          <p>서비스는 연중무휴 1일 24시간 제공함을 원칙으로 합니다. 다만, 회사의 업무상 또는 기술상의 사유로 서비스가 일시 중단될 수 있으며, 정기점검 등 운영 목적의 서비스 중단 시간은 서비스 내 공지에 따릅니다.</p>
        </section>

        <section id="ch-4">
          <h2>제4장 구독 및 요금</h2>
          <h3>제10조 (구독 플랜)</h3>
          <ol>
            <li>서비스는 다음과 같은 구독 플랜을 제공합니다.
              <table class="legal-table">
                <thead><tr><th>구분</th><th>무료 플랜</th><th>유료 플랜</th></tr></thead>
                <tbody>
                  <tr><td>월 요금</td><td>0원</td><td>20,000원/월 (VAT 별도)<br><small>연간 결제: 192,000원/년 (20% 할인)</small></td></tr>
                  <tr><td>월 예약 건수</td><td>50건</td><td>무제한</td></tr>
                  <tr><td>스태프 수</td><td>1명</td><td>5명</td></tr>
                  <tr><td>통계/분석</td><td>기본</td><td>전체</td></tr>
                  <tr><td>카카오 알림톡</td><td>미제공</td><td>제공</td></tr>
                </tbody>
              </table>
            </li>
            <li>회사는 구독 플랜의 내용·요금을 변경할 수 있으며, 변경 시 30일 전에 이용자에게 고지합니다.</li>
            <li>매장 관리자는 최초 가입 시 30일간 유료 플랜의 기능을 무료로 체험할 수 있습니다. 무료 체험 종료 후 자동으로 과금되지 않습니다.</li>
          </ol>

          <h3>제11조 (결제 및 정산)</h3>
          <ol>
            <li>유료 구독의 결제는 신용카드, 계좌이체 등 회사가 정한 결제수단을 통해 이루어집니다.</li>
            <li>정기결제의 경우 매월 최초 결제일에 자동으로 결제됩니다.</li>
            <li>결제와 관련한 모든 거래는 전자금융거래법 및 관련 법령에 따릅니다.</li>
          </ol>

          <h3>제12조 (환불 정책)</h3>
          <ol>
            <li>무료 체험 기간 중에는 별도의 비용이 발생하지 않으므로 환불 대상이 아닙니다.</li>
            <li>유료 구독 전환 후 환불은 다음 기준에 따릅니다.
              <ul>
                <li>가. 결제일로부터 7일 이내 해지 시: 전액 환불</li>
                <li>나. 결제일로부터 7일 초과 해지 시: 이용 일수를 일할 계산하여 잔여 금액 환불</li>
                <li>다. 환불 금액은 월 이용료 ÷ 해당월 일수 × 잔여 일수로 산정합니다.</li>
              </ul>
            </li>
            <li>환불은 해지 신청일로부터 5영업일 이내에 원래 결제수단으로 처리됩니다.</li>
            <li>다음의 경우 환불이 제한될 수 있습니다.
              <ul>
                <li>가. 이용자의 귀책사유로 서비스 이용이 정지된 경우</li>
                <li>나. 이벤트·프로모션을 통해 무상으로 제공된 서비스의 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="ch-5">
          <h2>제5장 이용자의 의무</h2>
          <h3>제13조 (이용자의 의무)</h3>
          <p>이용자는 다음 각 호의 행위를 하여서는 안 됩니다.</p>
          <ol>
            <li>회원가입 또는 변경 시 허위 내용을 등록하는 행위</li>
            <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
            <li>서비스를 이용하여 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용하는 행위</li>
            <li>회사 또는 제3자의 저작권·특허권 등 지적재산권을 침해하는 행위</li>
            <li>회사 또는 제3자의 명예를 훼손하거나 업무를 방해하는 행위</li>
            <li>서비스의 안정적 운영을 방해하는 행위(해킹, 악성코드 유포, 과도한 트래픽 발생 등)</li>
            <li>기타 관계 법령에 위반되는 행위</li>
          </ol>

          <h3>제14조 (매장 관리자의 추가 의무)</h3>
          <p>매장 관리자는 다음 각 호의 의무를 부담합니다.</p>
          <ol>
            <li>서비스를 통해 수집한 고객의 개인정보를 「개인정보 보호법」에 따라 적법하게 처리하여야 합니다.</li>
            <li>예약 서비스를 통해 접수된 고객 예약을 성실히 이행하여야 합니다.</li>
            <li>서비스에 등록하는 매장 정보(상호, 영업시간, 서비스 가격 등)를 정확하게 기재하고 변경 시 즉시 수정하여야 합니다.</li>
            <li>매장과 고객 간의 분쟁(예약 불이행, 서비스 품질 등)에 대해 회사는 책임을 부담하지 않으며, 매장 관리자가 직접 해결하여야 합니다.</li>
          </ol>
        </section>

        <section id="ch-6">
          <h2>제6장 회사의 의무</h2>
          <h3>제15조 (회사의 의무)</h3>
          <ol>
            <li>회사는 관련 법령과 본 약관이 금지하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</li>
            <li>회사는 이용자의 개인정보 보호를 위해 「개인정보 보호법」 등 관련 법령이 정하는 바에 따라 개인정보처리방침을 수립하고 준수합니다.</li>
            <li>회사는 서비스 이용과 관련한 이용자의 불만 또는 피해구제 요청을 적절하게 처리하기 위한 체계를 갖추며, 이용자가 제기하는 의견·불만이 정당하다고 인정되는 경우 이를 처리합니다.</li>
          </ol>
        </section>

        <section id="ch-7">
          <h2>제7장 계약 해지 및 이용 제한</h2>
          <h3>제16조 (계약 해지)</h3>
          <ol>
            <li>매장 관리자는 언제든지 서비스 내 구독 관리 메뉴를 통해 이용 계약 해지를 신청할 수 있습니다.</li>
            <li>고객 회원은 서비스 내 프로필 페이지에서 회원 탈퇴를 신청할 수 있습니다.</li>
            <li>해지 시 매장 관리자의 데이터(예약, 고객, 서비스 정보 등)는 해지일로부터 30일간 보관 후 영구 삭제됩니다. 30일 이내 재가입 시 데이터를 복구할 수 있습니다.</li>
            <li>관계 법령에 따라 보존이 필요한 정보는 해당 법령이 정한 기간 동안 보관합니다.</li>
          </ol>

          <h3>제17조 (이용 제한)</h3>
          <ol>
            <li>회사는 이용자가 제13조 또는 제14조의 의무를 위반한 경우 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</li>
            <li>이용 제한 시 회사는 사전에 이용자에게 그 사유와 제한 기간을 이메일로 통지합니다. 다만, 긴급하게 이용을 제한할 필요가 있는 경우 사후에 통지할 수 있습니다.</li>
          </ol>
        </section>

        <section id="ch-8">
          <h2>제8장 면책 및 손해배상</h2>
          <h3>제18조 (면책)</h3>
          <ol>
            <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 서비스 제공에 관한 책임이 면제됩니다.</li>
            <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
            <li>회사는 매장 관리자와 고객 간에 발생하는 분쟁(예약 이행, 서비스 품질, 결제 등)에 대해 개입하거나 책임을 부담하지 않습니다. 회사는 예약 관리 도구를 제공하는 플랫폼 사업자로서, 매장이 제공하는 서비스 자체에 대한 보증을 하지 않습니다.</li>
            <li>회사는 이용자가 서비스에 게재한 정보·자료·사실의 신뢰도, 정확성 등에 관하여 책임을 지지 않습니다.</li>
          </ol>

          <h3>제19조 (손해배상)</h3>
          <ol>
            <li>회사는 회사의 귀책사유로 이용자에게 손해가 발생한 경우, 이용자가 입증한 직접적인 손해에 한하여 배상합니다.</li>
            <li>회사의 손해배상 책임은 해당 이용자가 직전 12개월간 회사에 지급한 서비스 이용료 총액을 한도로 합니다.</li>
          </ol>
        </section>

        <section id="ch-9">
          <h2>제9장 기타</h2>
          <h3>제20조 (지적재산권)</h3>
          <ol>
            <li>서비스에 관한 저작권 및 지적재산권은 회사에 귀속됩니다.</li>
            <li>이용자가 서비스를 이용하여 생성한 데이터(예약 정보, 고객 정보, 리뷰 등)의 소유권은 해당 이용자에게 귀속됩니다.</li>
            <li>이용자는 서비스를 이용하여 얻은 정보를 회사의 사전 동의 없이 복제·전송·출판·배포·방송 등의 방법으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
          </ol>

          <h3>제21조 (분쟁 해결)</h3>
          <ol>
            <li>회사와 이용자 간에 분쟁이 발생한 경우, 양 당사자는 분쟁의 해결을 위해 성실히 협의합니다.</li>
            <li>본 약관에서 정하지 않은 사항 및 약관의 해석에 관하여는 대한민국 법률을 적용합니다.</li>
            <li>서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우, 민사소송법 상의 관할 법원에 제기합니다.</li>
          </ol>

          <h3>제22조 (개인정보 보호)</h3>
          <p>이용자의 개인정보 보호에 관한 사항은 회사의 <RouterLink to="/privacy">「개인정보처리방침」</RouterLink>에 따릅니다.</p>
        </section>

        <section id="ch-appendix">
          <h2>부칙</h2>
          <ol>
            <li>본 약관은 2026년 4월 1일부터 시행합니다.</li>
            <li>본 약관 시행일 이전에 이미 가입한 이용자에게도 본 약관이 적용됩니다.</li>
          </ol>
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
          <RouterLink to="/privacy">개인정보처리방침 →</RouterLink>
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
  :deep(a) { color: var(--y-accent-deep); font-weight: 600; }
  :deep(section) { margin-top: 48px; &:first-of-type { margin-top: 0; } }
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
  margin-bottom: 40px;
  border-bottom: 1px solid var(--y-border);
  padding-bottom: 24px;
  h1 { margin: 8px 0; }
}
.legal__meta { font-size: 13px; color: var(--y-text-muted); }

.legal-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 8px;
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
