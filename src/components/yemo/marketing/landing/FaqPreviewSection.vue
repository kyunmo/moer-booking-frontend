<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import YSection from '@/components/yemo/YSection.vue'
import YBtn from '@/components/yemo/YBtn.vue'

const router = useRouter()
const open = ref(0)
const items = [
  { q: '설치가 어렵나요?', a: '회원가입(1분) → 매장 정보(2분) → 디자이너 추가(1분) → 메뉴 추가(1분). 5분이면 바로 사용 가능합니다.' },
  { q: '카카오톡 알림은 어떻게 설정하나요?', a: '카카오 비즈니스 계정만 있으면 됩니다 (무료). YEMO 대시보드에서 카카오 채널 연결 → 완료. 설정 가이드 영상도 제공합니다.' },
  { q: '무료 체험은 정말 무료인가요?', a: '네, 100% 무료입니다. 신용카드 등록 불필요. 30일 동안 모든 기능 사용 가능. 체험 종료 후 자동 과금 없음.' },
  { q: '계약 기간이 있나요?', a: '없습니다. 월간 결제는 언제든 해지 가능, 연간 결제는 남은 기간 일할 환불. 위약금 없음.' },
  { q: '여러 매장도 가능한가요?', a: '가능합니다. 매장마다 별도 계정으로 독립적 운영. 다수 매장 할인은 별도 문의해주세요.' },
]
</script>

<template>
  <YSection eyebrow="FAQ" title="자주 묻는 질문" align="center">
    <div class="faq">
      <button
        v-for="(item, i) in items"
        :key="item.q"
        class="faq__item"
        :class="{ 'is-open': open === i }"
        :aria-expanded="open === i"
        @click="open = open === i ? -1 : i"
      >
        <div class="faq__q">
          <span>{{ item.q }}</span>
          <Icon :icon="open === i ? 'ph:minus' : 'ph:plus'" aria-hidden="true" />
        </div>
        <div v-show="open === i" class="faq__a">{{ item.a }}</div>
      </button>
    </div>
    <div class="faq__foot">
      <YBtn variant="text" append-icon="ph:arrow-right" @click="router.push('/faq')">
        전체 FAQ 보기
      </YBtn>
    </div>
  </YSection>
</template>

<style lang="scss" scoped>
.faq {
  max-width: 720px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__item {
    background: var(--y-surface);
    border: 1px solid var(--y-border);
    border-radius: var(--y-radius-lg);
    padding: 0;
    text-align: left;
    width: 100%;
    overflow: hidden;
    transition: border-color var(--y-dur-fast) var(--y-ease);
    &:hover { border-color: var(--y-border-strong); }
    &.is-open { border-color: var(--y-accent); }
  }
  &__q {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    font-size: 15px;
    font-weight: 600;
    color: var(--y-text-strong);
    svg { width: 20px; height: 20px; color: var(--y-text-muted); }
  }
  &__a {
    padding: 0 24px 24px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--y-text-muted);
  }
  &__foot { text-align: center; margin-top: 32px; }
}
</style>
