<script setup>
import { ref } from 'vue'
import YBtn from '@/components/yemo/YBtn.vue'
import YCard from '@/components/yemo/YCard.vue'
import YInput from '@/components/yemo/YInput.vue'
import YTag from '@/components/yemo/YTag.vue'
import YSection from '@/components/yemo/YSection.vue'

const name = ref('')
const phone = ref('010-1234-5678')
const errorVal = ref('잘못된 이메일')

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="yemo dev-page">
    <header class="dev-head">
      <h1 class="t-display-lg t-strong">YEMO Design System</h1>
      <p class="t-body t-muted">Phase 0 — 토큰 + 5개 핵심 컴포넌트 검증</p>
    </header>

    <YSection eyebrow="Buttons" title="YBtn — 6 variants × 3 sizes" align="left">
      <div class="dev-row">
        <YBtn variant="primary">Primary</YBtn>
        <YBtn variant="secondary">Secondary</YBtn>
        <YBtn variant="accent">Accent</YBtn>
        <YBtn variant="ghost">Ghost</YBtn>
        <YBtn variant="text">Text Link →</YBtn>
        <YBtn variant="danger">Danger</YBtn>
      </div>
      <div class="dev-row">
        <YBtn size="sm">Small (36px)</YBtn>
        <YBtn size="md">Medium (44px)</YBtn>
        <YBtn size="lg">Large (52px)</YBtn>
      </div>
      <div class="dev-row">
        <YBtn prepend-icon="ph:plus">With prepend</YBtn>
        <YBtn append-icon="ph:arrow-right">With append</YBtn>
        <YBtn pill>Pill style</YBtn>
        <YBtn loading>Loading…</YBtn>
        <YBtn disabled>Disabled</YBtn>
      </div>
    </YSection>

    <YSection eyebrow="Cards" title="YCard — 4 padding × 4 radius × interactive" align="left">
      <div class="dev-grid-3">
        <YCard>
          <h3 class="t-title-md t-strong">Default Card</h3>
          <p class="t-body-sm t-muted y-mt-8">padding=md, radius=xl, bordered</p>
        </YCard>
        <YCard interactive>
          <h3 class="t-title-md t-strong">Interactive Card</h3>
          <p class="t-body-sm t-muted y-mt-8">Hover 시 lift + shadow</p>
        </YCard>
        <YCard elevated :bordered="false" radius="2xl">
          <h3 class="t-title-md t-strong">Elevated Card</h3>
          <p class="t-body-sm t-muted y-mt-8">borderless + base shadow</p>
        </YCard>
      </div>
    </YSection>

    <YSection eyebrow="Inputs" title="YInput — label + icons + error/hint" align="left">
      <div class="dev-grid-2">
        <YInput v-model="name" label="이름" placeholder="홍길동" hint="실명을 입력해주세요" />
        <YInput v-model="phone" label="전화번호" prepend-icon="ph:phone" required />
        <YInput v-model="errorVal" label="이메일" :error="errorVal ? '잘못된 이메일' : ''" type="email" />
        <YInput label="비활성" placeholder="비활성 상태" disabled />
      </div>
    </YSection>

    <YSection eyebrow="Tags" title="YTag — 6 variants × 2 sizes" align="left">
      <div class="dev-row">
        <YTag>Default</YTag>
        <YTag variant="accent">Accent</YTag>
        <YTag variant="success">Success</YTag>
        <YTag variant="warning">Warning</YTag>
        <YTag variant="danger">Danger</YTag>
        <YTag variant="info">Info</YTag>
      </div>
      <div class="dev-row">
        <YTag size="sm">Small</YTag>
        <YTag size="md">Medium</YTag>
        <YTag variant="accent" icon="ph:sparkle">With icon</YTag>
      </div>
    </YSection>

    <YSection eyebrow="Typography" title="t-* utility classes" align="left">
      <div class="dev-stack">
        <div class="t-display-xl t-strong">Display XL — 60/800</div>
        <div class="t-display-lg t-strong">Display LG — 42/800</div>
        <div class="t-display-md t-strong">Display MD — 28/800</div>
        <div class="t-title-lg">Title LG — 22/700</div>
        <div class="t-title-md">Title MD — 18/700</div>
        <div class="t-title-sm">Title SM — 16/600</div>
        <div class="t-body-lg">Body LG 17/400 — 본문 크게 쓰는 경우</div>
        <div class="t-body">Body 15/400 — 본문 기본</div>
        <div class="t-body-sm t-muted">Body SM 13/400 muted</div>
        <div class="t-caption t-muted">Caption 12/500</div>
        <div class="t-label t-accent">LABEL · 11 · 0.08em</div>
      </div>
    </YSection>

    <YSection eyebrow="Tokens" title="컬러 팔레트" align="left">
      <div class="dev-color-grid">
        <div class="dev-swatch" style="background: var(--y-bg)">--y-bg</div>
        <div class="dev-swatch" style="background: var(--y-surface)">--y-surface</div>
        <div class="dev-swatch" style="background: var(--y-surface-elev)">--y-surface-elev</div>
        <div class="dev-swatch" style="background: var(--y-accent); color: var(--y-text-strong)">--y-accent</div>
        <div class="dev-swatch" style="background: var(--y-accent-deep); color: var(--y-bg)">--y-accent-deep</div>
        <div class="dev-swatch" style="background: var(--y-accent-soft)">--y-accent-soft</div>
        <div class="dev-swatch" style="background: var(--y-text-strong); color: var(--y-bg)">--y-text-strong</div>
        <div class="dev-swatch" style="background: var(--y-text); color: var(--y-bg)">--y-text</div>
        <div class="dev-swatch" style="background: var(--y-border)">--y-border</div>
      </div>
    </YSection>
  </div>
</template>

<style lang="scss" scoped>
.dev-page {
  min-height: 100vh;
  padding-bottom: 100px;
}
.dev-head {
  padding: 64px 32px 32px;
  border-bottom: 1px solid var(--y-border);
  @media (max-width: 768px) { padding: 32px 16px 24px; }
}
.dev-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}
.dev-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; @media (max-width: 768px) { grid-template-columns: 1fr; } }
.dev-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; @media (max-width: 768px) { grid-template-columns: 1fr; } }
.dev-stack { display: flex; flex-direction: column; gap: 14px; }
.dev-color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
.dev-swatch {
  padding: 24px 16px;
  border-radius: var(--y-radius-lg);
  border: 1px solid var(--y-border);
  font-family: 'Pretendard', monospace;
  font-size: 12px;
  font-weight: 600;
}
</style>
