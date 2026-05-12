<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import YBtn from '@/components/yemo/YBtn.vue'

const router = useRouter()
</script>

<template>
  <section class="cta">
    <div class="cta__inner">
      <h2 class="cta__title">지금 바로 무료로 시작하세요</h2>
      <p class="cta__sub">5분이면 끝나요. 신용카드 등록도 필요 없어요.</p>
      <ul class="cta__benefits">
        <li><Icon icon="ph:check" /><span>30일 무료 체험</span></li>
        <li><Icon icon="ph:check" /><span>모든 기능 사용 가능</span></li>
        <li><Icon icon="ph:check" /><span>언제든 해지 가능</span></li>
      </ul>
      <YBtn variant="accent" size="lg" append-icon="ph:arrow-right" @click="router.push('/register')">
        무료로 시작하기
      </YBtn>
      <p class="cta__foot">이미 500개 이상의 매장이 YEMO를 사용 중입니다</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cta {
  padding: 96px 32px;
  @media (max-width: 768px) { padding: 64px 16px; }

  &__inner {
    max-width: 720px;
    margin-inline: auto;
    background: var(--y-text-strong);
    color: var(--y-bg);
    padding: 80px 48px;
    border-radius: var(--y-radius-2xl);
    text-align: center;
    box-shadow: var(--y-shadow-xl);
    @media (max-width: 768px) { padding: 56px 24px; }
  }
  &__title {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.2;
    margin: 0;
    @media (max-width: 768px) { font-size: 30px; }
  }
  &__sub {
    font-size: 17px;
    color: rgba(255, 255, 255, 0.75);
    margin: 16px 0 32px;
  }
  &__benefits {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 32px;
    li {
      display: flex; gap: 8px; align-items: center;
      font-size: 14px;
      svg { width: 16px; height: 16px; color: var(--y-accent); }
    }
  }
  &__foot { margin-top: 24px; font-size: 12px; color: rgba(255, 255, 255, 0.5); }
}
</style>
