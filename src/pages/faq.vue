<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import YInput from '@/components/yemo/YInput.vue'
import YSection from '@/components/yemo/YSection.vue'

definePage({
  meta: {
    layout: 'marketing',
    public: true,
    title: 'FAQ — YEMO',
    description: 'YEMO 자주 묻는 질문. 시작·결제·기능·데이터·지원까지 24+ 항목.',
    keywords: 'YEMO FAQ, 자주 묻는 질문, 예약 관리 도움말',
  },
})

const categories = [
  { key: 'all', label: '전체' },
  { key: 'start', label: '시작하기' },
  { key: 'kakao', label: '카카오톡' },
  { key: 'payment', label: '결제' },
  { key: 'feature', label: '기능' },
  { key: 'data', label: '데이터' },
  { key: 'support', label: '지원' },
]
const activeCat = ref('all')
const query = ref('')
const openItem = ref(-1)

const faqs = [
  { cat: 'start', q: '설치가 어렵나요?', a: '회원가입(1분) → 매장 정보(2분) → 디자이너 추가(1분) → 메뉴 추가(1분). 5분이면 바로 사용 가능합니다.' },
  { cat: 'start', q: '무료 체험은 정말 무료인가요?', a: '네, 100% 무료입니다. 신용카드 등록 불필요. 30일 동안 모든 기능 사용 가능. 체험 종료 후 자동 과금 없음.' },
  { cat: 'start', q: '카카오로 가입할 수 있나요?', a: '네, 카카오 계정으로 간편 가입 가능합니다. 로그인 페이지에서 "카카오로 시작하기"를 누르세요.' },
  { cat: 'start', q: '도메인 주소는 어떻게 정해지나요?', a: 'yourshop.yemo.io 형식으로 매장명에서 자동 생성되며, 가입 후 변경할 수 있습니다.' },

  { cat: 'kakao', q: '카카오톡 알림은 어떻게 설정하나요?', a: '카카오 비즈니스 계정만 있으면 됩니다 (무료). YEMO 대시보드에서 카카오 채널 연결 → 완료. 설정 가이드 영상도 제공합니다.' },
  { cat: 'kakao', q: '알림톡 비용은 얼마인가요?', a: '카카오 알림톡 발송 비용(건당 5~9원)은 카카오 비즈센터로 별도 청구됩니다. YEMO는 발송 수수료를 받지 않습니다.' },
  { cat: 'kakao', q: '재방문 알림은 자동인가요?', a: '네, 시술별 재방문 주기(예: 펌 3개월, 염색 2개월)에 따라 자동 발송됩니다. 매장별로 주기 설정 가능.' },

  { cat: 'payment', q: '계약 기간이 있나요?', a: '없습니다. 월간 결제는 언제든 해지 가능, 연간 결제는 남은 기간 일할 환불. 위약금 없음.' },
  { cat: 'payment', q: '환불은 어떻게 받나요?', a: '대시보드의 결제 메뉴에서 해지하면 자동으로 환불됩니다. 영업일 기준 3-5일 내 입금.' },
  { cat: 'payment', q: '연간 결제 시 할인은 얼마인가요?', a: '연간 결제 시 20% 할인됩니다. 월 16,000원으로 연 192,000원에 이용 가능.' },
  { cat: 'payment', q: '플랜을 변경할 수 있나요?', a: '언제든 무료 ↔ 유료 전환 가능합니다. 기존 데이터는 모두 유지됩니다.' },

  { cat: 'feature', q: '모바일에서도 되나요?', a: '관리자 페이지와 고객 예약 페이지 모두 모바일에 완벽 최적화되어 있습니다.' },
  { cat: 'feature', q: '여러 매장도 가능한가요?', a: '가능합니다. 매장마다 별도 계정으로 독립적 운영. 다수 매장 할인은 별도 문의해주세요.' },
  { cat: 'feature', q: '디자이너 포트폴리오는 어떻게 등록하나요?', a: '직원 관리에서 시술 전후 사진을 업로드하고 해시태그를 달면 고객 예약 페이지에 노출됩니다.' },
  { cat: 'feature', q: '예약 가능 시간은 어떻게 설정하나요?', a: '매장 설정 > 영업 시간/휴무일에서 요일별·날짜별로 설정 가능합니다.' },
  { cat: 'feature', q: '시술 시간은 자동으로 계산되나요?', a: '네. 복수 시술 선택 시 (예: 컷+염색) 각 시술 시간이 합산되어 자동으로 슬롯이 배정됩니다.' },
  { cat: 'feature', q: '노쇼 고객은 어떻게 관리하나요?', a: '노쇼 횟수가 자동으로 기록되며, 일정 횟수 이상이면 예약 시 경고 표시가 뜹니다.' },

  { cat: 'data', q: '데이터는 안전한가요?', a: '네이버 클라우드 인프라 사용. SSL 암호화. 정기 백업(자동). 개인정보보호법 준수.' },
  { cat: 'data', q: '해지 시 데이터는 어떻게 되나요?', a: '해지 후 30일간 데이터가 보존되어 재가입 시 복구 가능합니다. 30일 후 안전하게 삭제됩니다.' },
  { cat: 'data', q: '데이터를 내보낼 수 있나요?', a: '예약·고객·매출 데이터를 CSV로 내보낼 수 있습니다. 통계 페이지에서 기간별 다운로드.' },

  { cat: 'support', q: '기술 지원은 어떻게 받나요?', a: '이메일과 카카오톡으로 지원합니다. 평균 응답: 이메일 24시간 이내, 카카오톡 실시간.' },
  { cat: 'support', q: '이용 가이드는 어디서 보나요?', a: '대시보드의 도움말 아이콘을 눌러 단계별 튜토리얼을 확인할 수 있습니다.' },
  { cat: 'support', q: '기능 제안을 하려면 어떻게 하나요?', a: '이메일(support@yemo.io) 또는 카카오톡 채널로 제안해주시면 검토 후 답변드립니다.' },
  { cat: 'support', q: '운영 시간이 어떻게 되나요?', a: '주말 포함 매일 09:00 ~ 22:00 카카오톡 응답. 이메일은 24시간 접수, 영업일 답변.' },
]

const filtered = computed(() => {
  return faqs.filter(f =>
    (activeCat.value === 'all' || f.cat === activeCat.value) &&
    (!query.value || f.q.includes(query.value) || f.a.includes(query.value)),
  )
})
</script>

<template>
  <div class="faqp">
    <YSection eyebrow="FAQ" title="자주 묻는 질문" align="center" sub="궁금한 점을 검색하거나 카테고리로 골라보세요.">
      <div class="faqp__search">
        <YInput
          v-model="query"
          size="lg"
          prepend-icon="ph:magnifying-glass"
          placeholder="질문 검색"
        />
      </div>
      <div class="faqp__cats">
        <button
          v-for="c in categories"
          :key="c.key"
          class="faqp__cat"
          :class="{ 'is-active': activeCat === c.key }"
          @click="activeCat = c.key"
        >{{ c.label }}</button>
      </div>

      <div class="faqp__list">
        <div v-if="filtered.length === 0" class="faqp__empty">
          <Icon icon="ph:smiley-x-eyes" />
          <p>검색 결과가 없어요</p>
        </div>
        <button
          v-for="(item, i) in filtered"
          :key="item.q"
          class="faqp__item"
          :class="{ 'is-open': openItem === i }"
          @click="openItem = openItem === i ? -1 : i"
        >
          <div class="faqp__q">
            <span>{{ item.q }}</span>
            <Icon :icon="openItem === i ? 'ph:minus' : 'ph:plus'" aria-hidden="true" />
          </div>
          <div v-show="openItem === i" class="faqp__a">{{ item.a }}</div>
        </button>
      </div>
    </YSection>

    <YSection eyebrow="Still curious?" title="더 궁금하신가요?" align="center">
      <div class="faqp__contact">
        <a href="mailto:support@yemo.io" class="faqp__contact-card">
          <Icon icon="ph:envelope" />
          <div>
            <div class="t-title-sm">이메일 문의</div>
            <div class="t-body-sm t-muted">support@yemo.io · 24시간 이내 답변</div>
          </div>
        </a>
        <a href="https://pf.kakao.com/_yemo" target="_blank" class="faqp__contact-card" rel="noopener">
          <Icon icon="ph:chat-circle-dots" />
          <div>
            <div class="t-title-sm">카카오톡 채널</div>
            <div class="t-body-sm t-muted">@YEMO · 평일 09:00 ~ 22:00 실시간 답변</div>
          </div>
        </a>
      </div>
    </YSection>
  </div>
</template>

<style lang="scss" scoped>
.faqp { background: var(--y-bg); }

.faqp__search {
  max-width: 480px;
  margin: 0 auto 32px;
}

.faqp__cats {
  max-width: 800px;
  margin: 0 auto 40px;
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
}
.faqp__cat {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--y-text-muted);
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-pill);
  transition: all var(--y-dur-fast) var(--y-ease);
  &:hover { color: var(--y-text); border-color: var(--y-border-strong); }
  &.is-active { background: var(--y-text-strong); color: var(--y-bg); border-color: var(--y-text-strong); }
}

.faqp__list {
  max-width: 720px;
  margin-inline: auto;
  display: flex; flex-direction: column; gap: 8px;
}
.faqp__empty {
  text-align: center;
  padding: 64px 0;
  color: var(--y-text-muted);
  svg { width: 48px; height: 48px; margin-bottom: 12px; color: var(--y-text-disabled); }
}
.faqp__item {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-lg);
  text-align: left; width: 100%;
  &.is-open { border-color: var(--y-accent); }
}
.faqp__q {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  font-size: 15px; font-weight: 600; color: var(--y-text-strong);
  svg { width: 20px; height: 20px; color: var(--y-text-muted); }
}
.faqp__a { padding: 0 24px 24px; font-size: 14px; line-height: 1.7; color: var(--y-text-muted); }

.faqp__contact {
  max-width: 720px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}
.faqp__contact-card {
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius-xl);
  padding: 24px;
  display: flex; gap: 16px; align-items: center;
  transition: all var(--y-dur-base) var(--y-ease-dramatic);
  color: inherit;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--y-shadow-lg);
    border-color: var(--y-border-strong);
  }
  svg {
    width: 40px; height: 40px;
    padding: 8px;
    background: var(--y-accent-soft);
    color: var(--y-accent-deep);
    border-radius: var(--y-radius);
  }
}
</style>
