# Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** YEMO 공개 페이지 리디자인의 토대를 만든다 — 디자인 토큰 + 격리 클래스 + 5개 핵심 Headless 컴포넌트 + 시각 검증용 dev 페이지.

**Architecture:** 모든 CSS 변수와 컴포넌트는 `<div class="yemo">` 루트 안에서만 동작하도록 격리. Vuetify(Materio) 영역에 영향 0. Iconify(이미 설치됨)에 Phosphor 아이콘 collection을 추가하고, 자체 컴포넌트는 `<Icon icon="ph:..." />` 형태로 사용.

**Tech Stack:**
- Vue 3 + Vite (기존)
- SCSS + CSS Custom Properties (변수는 CSS 변수로 노출)
- `@iconify/vue` + `@iconify-json/ph` (Phosphor Icons)
- Pretendard 웹폰트 (CDN preload + display=swap)

**Spec reference:** `docs/superpowers/specs/2026-05-12-public-redesign-design.md` §4 (토큰), §5 (컴포넌트)

**Testing strategy:** 프로젝트에 유닛 테스트 인프라가 없음. 검증은 (1) ESLint 통과 (2) `npm run build` 통과 (3) `/dev/components` 페이지에서 시각 검증 (4) Vuetify 영역에 스타일 누수 없음을 DevTools로 확인.

---

## Task 1: 폴더 구조 & 빈 파일 스캐폴드

**Files:**
- Create: `src/assets/styles/yemo/index.scss`
- Create: `src/assets/styles/yemo/_tokens.scss`
- Create: `src/assets/styles/yemo/_reset.scss`
- Create: `src/assets/styles/yemo/_typography.scss`
- Create: `src/assets/styles/yemo/_motion.scss`
- Create: `src/assets/styles/yemo/_utilities.scss`

- [ ] **Step 1: 폴더 생성 및 빈 파일 6개 만들기**

Run:
```bash
mkdir -p src/assets/styles/yemo
touch src/assets/styles/yemo/index.scss
touch src/assets/styles/yemo/_tokens.scss
touch src/assets/styles/yemo/_reset.scss
touch src/assets/styles/yemo/_typography.scss
touch src/assets/styles/yemo/_motion.scss
touch src/assets/styles/yemo/_utilities.scss
```

- [ ] **Step 2: `index.scss`에 모든 부분 import**

Write `src/assets/styles/yemo/index.scss`:
```scss
// YEMO Design System entry point
// Scoped to `.yemo` root only — does NOT affect Vuetify/admin areas.
@use 'tokens';
@use 'reset';
@use 'typography';
@use 'motion';
@use 'utilities';
```

- [ ] **Step 3: 빌드 통과 확인**

Run: `npm run build`
Expected: 빌드 성공. 새 파일이 있지만 아직 어디서도 import 안 했으므로 번들에 들어가지 않음.

- [ ] **Step 4: 커밋**

```bash
git add src/assets/styles/yemo/
git commit -m "chore(yemo): bootstrap design system folder structure"
```

---

## Task 2: 디자인 토큰 정의 (CSS 변수)

**Files:**
- Modify: `src/assets/styles/yemo/_tokens.scss`

- [ ] **Step 1: 모든 토큰을 `_tokens.scss`에 작성**

Write the full content of `src/assets/styles/yemo/_tokens.scss`:
```scss
// YEMO Design Tokens
// All values exposed as CSS custom properties under `.yemo` scope.
// Spec: docs/superpowers/specs/2026-05-12-public-redesign-design.md §4

.yemo {
  // ── Color ──────────────────────────────────────────────
  --y-bg:            #FAFAF8;
  --y-surface:       #FFFFFF;
  --y-surface-elev:  #F2F0EC;

  --y-text-strong:   #1A1A1A;
  --y-text:          #2D2D2D;
  --y-text-muted:    #6B6B6B;
  --y-text-disabled: #B8B8B8;

  --y-accent:        #C8A882;
  --y-accent-deep:   #A88860;
  --y-accent-soft:   #F0E6D8;

  --y-border:        #E5E3DD;
  --y-border-strong: #C9C5BC;

  --y-success:       #4A7C59;
  --y-success-soft:  #E6F0E6;
  --y-warning:       #C8893D;
  --y-warning-soft:  #FAF1E1;
  --y-danger:        #B84A4A;
  --y-danger-soft:   #F5DCDC;
  --y-info:          #5B7BAA;
  --y-info-soft:     #E1EAF5;

  // ── Radius ─────────────────────────────────────────────
  --y-radius-sm:    8px;
  --y-radius:      12px;
  --y-radius-md:   14px;
  --y-radius-lg:   16px;
  --y-radius-xl:   20px;
  --y-radius-2xl:  24px;
  --y-radius-pill: 999px;

  // ── Shadow ─────────────────────────────────────────────
  --y-shadow-sm:     0 1px 2px rgba(20, 20, 20, 0.04);
  --y-shadow:        0 4px 12px rgba(20, 20, 20, 0.06);
  --y-shadow-md:     0 8px 20px rgba(20, 20, 20, 0.08);
  --y-shadow-lg:     0 16px 40px rgba(20, 20, 20, 0.06);
  --y-shadow-xl:     0 30px 80px rgba(20, 20, 20, 0.10);
  --y-shadow-focus:  0 0 0 4px rgba(200, 168, 130, 0.18);
  --y-shadow-accent: 0 10px 24px rgba(168, 136, 96, 0.25);

  // ── Motion ─────────────────────────────────────────────
  --y-ease:           cubic-bezier(0.4, 0, 0.2, 1);
  --y-ease-dramatic:  cubic-bezier(0.16, 1, 0.3, 1);
  --y-dur-fast:   200ms;
  --y-dur-base:   300ms;
  --y-dur-slow:   500ms;

  // ── Z-index ────────────────────────────────────────────
  --y-z-base:      1;
  --y-z-sticky:   10;
  --y-z-overlay:  50;
  --y-z-modal:   100;
  --y-z-toast:   200;
}

// Reduced motion: zero out durations
@media (prefers-reduced-motion: reduce) {
  .yemo {
    --y-dur-fast: 0ms;
    --y-dur-base: 0ms;
    --y-dur-slow: 0ms;
  }
}
```

- [ ] **Step 2: SCSS 컴파일 통과 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 통과 (아직 사용처 없음).

- [ ] **Step 3: 커밋**

```bash
git add src/assets/styles/yemo/_tokens.scss
git commit -m "feat(yemo): add design tokens as CSS variables"
```

---

## Task 3: 격리된 reset CSS

**Files:**
- Modify: `src/assets/styles/yemo/_reset.scss`

`.yemo` 루트 내부에서만 작동하는 미니멀 reset. Vuetify 전역 reset과 충돌하지 않도록 `.yemo &` 스코프로 작성.

- [ ] **Step 1: reset 작성**

Write the full content of `src/assets/styles/yemo/_reset.scss`:
```scss
// YEMO scoped reset — only applies inside `.yemo` root.
// Does NOT touch global selectors so Vuetify/admin area is untouched.

.yemo {
  // Box sizing
  &, *, *::before, *::after {
    box-sizing: border-box;
  }

  // Base
  background: var(--y-bg);
  color: var(--y-text);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont,
               'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
  font-size: 15px;
  line-height: 1.65;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;

  // Heading reset (Vuetify .text-h1 등은 admin에서 그대로 동작)
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: var(--y-text-strong);
  }

  // Paragraph
  p {
    margin: 0;
  }

  // Links — default style, components override
  a {
    color: inherit;
    text-decoration: none;
    transition: color var(--y-dur-fast) var(--y-ease);
  }

  // Lists
  ul, ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  // Images
  img {
    max-width: 100%;
    display: block;
  }

  // Buttons — strip browser defaults, components add their own style
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  // Inputs — strip defaults
  input, textarea, select {
    font: inherit;
    color: inherit;
  }

  // Focus visible only (no outline on click)
  *:focus {
    outline: none;
  }
  *:focus-visible {
    outline: none;
    box-shadow: var(--y-shadow-focus);
  }

  // Selection
  ::selection {
    background: var(--y-accent-soft);
    color: var(--y-text-strong);
  }
}
```

- [ ] **Step 2: 빌드 통과 확인**

Run: `npm run build`
Expected: 에러 없이 빌드 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/assets/styles/yemo/_reset.scss
git commit -m "feat(yemo): add scoped reset (only inside .yemo root)"
```

---

## Task 4: Typography 설정 (Pretendard 웹폰트 + 유틸리티 클래스)

**Files:**
- Modify: `src/assets/styles/yemo/_typography.scss`
- Modify: `index.html` (preconnect + preload)

- [ ] **Step 1: typography 작성**

Write the full content of `src/assets/styles/yemo/_typography.scss`:
```scss
// YEMO Typography — utility classes scoped to .yemo
// Spec §4.2

.yemo {
  // ── Type scale utilities ───────────────────────────
  // Display (큰 헤드라인 — 랜딩 hero 등)
  .t-display-xl { font-size: 60px; line-height: 1.08; font-weight: 800; letter-spacing: -0.04em; }
  .t-display-lg { font-size: 42px; line-height: 1.20; font-weight: 800; letter-spacing: -0.035em; }
  .t-display-md { font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.03em; }

  // Title
  .t-title-lg { font-size: 22px; line-height: 1.30; font-weight: 700; letter-spacing: -0.02em; }
  .t-title-md { font-size: 18px; line-height: 1.35; font-weight: 700; letter-spacing: -0.02em; }
  .t-title-sm { font-size: 16px; line-height: 1.40; font-weight: 600; letter-spacing: -0.02em; }

  // Body
  .t-body-lg { font-size: 17px; line-height: 1.70; font-weight: 400; letter-spacing: -0.01em; }
  .t-body    { font-size: 15px; line-height: 1.65; font-weight: 400; letter-spacing: -0.01em; }
  .t-body-sm { font-size: 13px; line-height: 1.60; font-weight: 400; letter-spacing: -0.01em; }

  // Caption / Label
  .t-caption { font-size: 12px; line-height: 1.50; font-weight: 500; letter-spacing: 0.02em; }
  .t-label   { font-size: 11px; line-height: 1.40; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

  // Color utilities
  .t-strong  { color: var(--y-text-strong); }
  .t-muted   { color: var(--y-text-muted); }
  .t-accent  { color: var(--y-accent-deep); }

  // Mobile responsive — display sizes shrink
  @media (max-width: 768px) {
    .t-display-xl { font-size: 38px; letter-spacing: -0.035em; }
    .t-display-lg { font-size: 30px; }
    .t-display-md { font-size: 24px; }
  }
}
```

- [ ] **Step 2: `index.html`에 Pretendard preload + preconnect 추가**

Read `index.html` first to confirm current state, then add Pretendard CDN within the `<head>`:

Open `index.html` and within `<head>` (before existing `<link>` or `<script>` tags), insert:
```html
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
```

Note: `pretendardvariable` is a single variable-font CSS that covers weight 100–900. Use jsdelivr CDN for stable delivery.

- [ ] **Step 3: 빌드 통과 확인**

Run: `npm run build`
Expected: 빌드 통과. 빌드 산출물에 새 link tag 포함.

- [ ] **Step 4: 커밋**

```bash
git add src/assets/styles/yemo/_typography.scss index.html
git commit -m "feat(yemo): add typography utilities + Pretendard variable font"
```

---

## Task 5: Motion 헬퍼 + Utility 클래스

**Files:**
- Modify: `src/assets/styles/yemo/_motion.scss`
- Modify: `src/assets/styles/yemo/_utilities.scss`

- [ ] **Step 1: motion 작성**

Write the full content of `src/assets/styles/yemo/_motion.scss`:
```scss
// YEMO Motion helpers — common transitions / animations

.yemo {
  // Transition utilities
  .y-trans      { transition: all var(--y-dur-base) var(--y-ease); }
  .y-trans-fast { transition: all var(--y-dur-fast) var(--y-ease); }
  .y-trans-soft { transition: all var(--y-dur-base) var(--y-ease-dramatic); }

  // Hover lift (cards, etc.)
  .y-hover-lift {
    transition:
      transform var(--y-dur-base) var(--y-ease-dramatic),
      box-shadow var(--y-dur-base) var(--y-ease),
      border-color var(--y-dur-fast) var(--y-ease);
    &:hover {
      transform: translateY(-2px);
    }
  }

  // Fade enter/leave for v-if / v-show transitions
  .y-fade-enter-active,
  .y-fade-leave-active { transition: opacity var(--y-dur-base) var(--y-ease); }
  .y-fade-enter-from,
  .y-fade-leave-to     { opacity: 0; }
}
```

- [ ] **Step 2: utilities 작성**

Write the full content of `src/assets/styles/yemo/_utilities.scss`:
```scss
// YEMO Utility classes — minimal set, prefer composition over many utilities
// Naming: y-{property}-{value} (avoid Tailwind-like sprawl)

.yemo {
  // Display
  .y-flex       { display: flex; }
  .y-flex-col   { display: flex; flex-direction: column; }
  .y-inline-flex { display: inline-flex; }
  .y-grid       { display: grid; }
  .y-block      { display: block; }
  .y-hidden     { display: none; }

  // Flex
  .y-items-center  { align-items: center; }
  .y-items-start   { align-items: flex-start; }
  .y-items-end     { align-items: flex-end; }
  .y-justify-between { justify-content: space-between; }
  .y-justify-center  { justify-content: center; }
  .y-gap-4   { gap: 4px; }
  .y-gap-8   { gap: 8px; }
  .y-gap-12  { gap: 12px; }
  .y-gap-16  { gap: 16px; }
  .y-gap-24  { gap: 24px; }
  .y-gap-32  { gap: 32px; }

  // Space (margin top — most common)
  @each $size in (4, 8, 12, 16, 20, 24, 32, 40, 48, 64) {
    .y-mt-#{$size} { margin-top: #{$size}px; }
    .y-mb-#{$size} { margin-bottom: #{$size}px; }
    .y-p-#{$size}  { padding: #{$size}px; }
  }

  // Text alignment
  .y-text-center { text-align: center; }
  .y-text-left   { text-align: left; }
  .y-text-right  { text-align: right; }

  // Width helpers
  .y-w-full { width: 100%; }
  .y-max-w-reading { max-width: 720px; }

  // Visibility
  .y-sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border: 0;
  }

  // Mobile-only / desktop-only
  @media (max-width: 768px) {
    .y-md-up { display: none !important; }
  }
  @media (min-width: 769px) {
    .y-md-down { display: none !important; }
  }
}
```

- [ ] **Step 3: 빌드 통과 확인**

Run: `npm run build`
Expected: 빌드 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/assets/styles/yemo/_motion.scss src/assets/styles/yemo/_utilities.scss
git commit -m "feat(yemo): add motion + utility classes"
```

---

## Task 6: 진입점에 YEMO 스타일 import

**Files:**
- Modify: `src/main.js`

진입점에 `index.scss`를 import해서 빌드 산출물에 포함시킨다. Vuetify가 이미 로드된 후 import해야 spec에서 지정한 격리가 안전.

- [ ] **Step 1: `src/main.js` 열어서 기존 CSS import 위치 확인**

`src/main.js`의 상단을 보고 다른 `import '@/...css'` 또는 `import '@/assets/styles/...'` 라인이 어디 있는지 확인. (보통 다른 import 블록과 함께 묶여 있음)

- [ ] **Step 2: import 추가**

`src/main.js`의 다른 CSS import들 **마지막 줄** 다음에 추가:
```js
import '@/assets/styles/yemo/index.scss'
```

(`@/` alias는 `src/`를 가리키도록 Vite config에 이미 설정되어 있음)

> **중요:** Vuetify 스타일 import 후에 와야 함 — `.yemo` 격리는 cascade에서 늦게 정의될 수록 안전. import 순서로도 보장.

- [ ] **Step 3: dev 서버 띄워서 콘솔 에러 없음 확인**

Run: `npm run dev`
Expected: 콘솔/터미널에 SCSS 컴파일 에러 없음. 페이지 그대로 보임 (아직 `.yemo` 클래스를 쓰는 영역이 없으므로 시각적 변화는 없음).

서버 종료: Ctrl+C

- [ ] **Step 4: 커밋**

```bash
git add src/main.js
git commit -m "feat(yemo): wire up design system to app entry"
```

---

## Task 7: Phosphor Icons 설치 + 빌드 통합

**Files:**
- Modify: `package.json` (의존성 추가)
- Modify: `src/plugins/iconify/build-icons.js`

기존 Iconify 인프라(`@iconify-json/ri`, `mdi`, `bxl`, `tabler`)에 Phosphor(`ph`) 추가. Vue에서 `<Icon icon="ph:calendar" />` 형태로 사용 가능.

- [ ] **Step 1: 패키지 설치**

Run: `npm install --save-dev @iconify-json/ph`
Expected: package-lock.json 업데이트, `node_modules/@iconify-json/ph` 디렉토리 존재.

- [ ] **Step 2: build-icons.js에 Phosphor 소스 추가**

Read `src/plugins/iconify/build-icons.js`. `sources.json` 배열 내부의 `require.resolve('@iconify-json/ri/icons.json'),` 라인 아래에 추가:
```js
        require.resolve('@iconify-json/ph/icons.json'),
```

- [ ] **Step 3: 아이콘 빌드 실행**

Run: `npm run build:icons`
Expected: `src/plugins/iconify/icons.css` 재생성. 파일 크기가 늘어났는지 확인 (이전 대비 증가).

- [ ] **Step 4: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 5: 커밋**

```bash
git add package.json package-lock.json src/plugins/iconify/build-icons.js src/plugins/iconify/icons.css
git commit -m "feat(icons): add Phosphor Icons collection for YEMO components"
```

---

## Task 8: YBtn 컴포넌트

**Files:**
- Create: `src/components/yemo/YBtn.vue`

Headless 버튼 컴포넌트. variant (primary/secondary/ghost/text/accent/danger) × size (sm/md/lg) × pill 옵션.

- [ ] **Step 1: 컴포넌트 폴더 생성 및 파일 작성**

Run: `mkdir -p src/components/yemo`

Write the full content of `src/components/yemo/YBtn.vue`:
```vue
<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'text', 'accent', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
  pill: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
  appendIcon: { type: String, default: '' },
  type: { type: String, default: 'button' },
  ariaLabel: { type: String, default: '' },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel || undefined"
    :aria-busy="loading || undefined"
    class="y-btn"
    :class="[
      `y-btn--${variant}`,
      `y-btn--${size}`,
      { 'y-btn--pill': pill, 'y-btn--block': block, 'y-btn--loading': loading },
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="y-btn__spinner" aria-hidden="true">
      <Icon icon="ph:circle-notch" />
    </span>
    <Icon v-else-if="prependIcon" :icon="prependIcon" class="y-btn__icon" aria-hidden="true" />
    <span class="y-btn__label"><slot /></span>
    <Icon v-if="appendIcon && !loading" :icon="appendIcon" class="y-btn__icon" aria-hidden="true" />
  </button>
</template>

<style lang="scss" scoped>
.y-btn {
  font-family: inherit;
  font-weight: 600;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: var(--y-radius-md);
  cursor: pointer;
  transition:
    background-color var(--y-dur-fast) var(--y-ease),
    border-color var(--y-dur-fast) var(--y-ease),
    color var(--y-dur-fast) var(--y-ease),
    transform var(--y-dur-fast) var(--y-ease),
    box-shadow var(--y-dur-fast) var(--y-ease);

  &:disabled { cursor: not-allowed; opacity: 0.5; }
  &:active:not(:disabled) { transform: translateY(0); }

  // Sizes (fixed heights)
  &--sm { height: 36px; padding: 0 16px; font-size: 12px; border-radius: var(--y-radius); }
  &--md { height: 44px; padding: 0 22px; font-size: 14px; }
  &--lg { height: 52px; padding: 0 28px; font-size: 15px; font-weight: 700; border-radius: var(--y-radius-lg); }

  &--pill { border-radius: var(--y-radius-pill); }
  &--block { width: 100%; }

  &__icon { width: 18px; height: 18px; flex-shrink: 0; }
  &--sm &__icon { width: 14px; height: 14px; }

  &__spinner {
    width: 16px; height: 16px;
    display: inline-flex;
    animation: y-btn-spin 1s linear infinite;
  }
  &--loading { pointer-events: none; }

  // ── Variants ─────────────────────────────────────
  &--primary {
    background: var(--y-text-strong);
    color: var(--y-bg);
    &:hover:not(:disabled) { background: #000; transform: translateY(-1px); box-shadow: var(--y-shadow-md); }
  }
  &--secondary {
    background: var(--y-surface);
    color: var(--y-text);
    border-color: var(--y-border);
    &:hover:not(:disabled) { background: var(--y-bg); border-color: var(--y-border-strong); }
  }
  &--ghost {
    background: transparent;
    color: var(--y-text);
    &:hover:not(:disabled) { background: var(--y-surface-elev); }
  }
  &--text {
    background: transparent;
    color: var(--y-accent-deep);
    font-weight: 600;
    height: auto;
    padding: 8px 4px;
    &:hover:not(:disabled) { color: #7A5A2A; }
  }
  &--accent {
    background: var(--y-accent);
    color: var(--y-text-strong);
    font-weight: 700;
    &:hover:not(:disabled) {
      background: var(--y-accent-deep);
      color: var(--y-bg);
      transform: translateY(-1px);
      box-shadow: var(--y-shadow-accent);
    }
  }
  &--danger {
    background: var(--y-danger);
    color: var(--y-bg);
    &:hover:not(:disabled) { background: #8A2A2A; }
  }
}

@keyframes y-btn-spin {
  to { transform: rotate(360deg); }
}
</style>
```

- [ ] **Step 2: ESLint 통과 확인**

Run: `npm run lint`
Expected: 새 파일에 대한 오류 없음 (warning은 OK).

- [ ] **Step 3: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/components/yemo/YBtn.vue
git commit -m "feat(yemo): add YBtn component (6 variants × 3 sizes + pill)"
```

---

## Task 9: YCard 컴포넌트

**Files:**
- Create: `src/components/yemo/YCard.vue`

매장 카드, 가격 카드, 페인 카드 등 공통 카드 컨테이너.

- [ ] **Step 1: 컴포넌트 작성**

Write the full content of `src/components/yemo/YCard.vue`:
```vue
<script setup>
const props = defineProps({
  interactive: { type: Boolean, default: false },  // hover lift 효과
  padding: {
    type: String,
    default: 'md',
    validator: v => ['none', 'sm', 'md', 'lg'].includes(v),
  },
  bordered: { type: Boolean, default: true },
  elevated: { type: Boolean, default: false },     // 기본 shadow 적용
  radius: {
    type: String,
    default: 'xl',
    validator: v => ['md', 'lg', 'xl', '2xl'].includes(v),
  },
  as: { type: String, default: 'div' },
})
</script>

<template>
  <component
    :is="as"
    class="y-card"
    :class="[
      `y-card--p-${padding}`,
      `y-card--r-${radius}`,
      { 'y-card--bordered': bordered, 'y-card--elevated': elevated, 'y-card--interactive': interactive },
    ]"
  >
    <slot name="media" />
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.y-card {
  background: var(--y-surface);
  position: relative;
  overflow: hidden;

  &--bordered { border: 1px solid var(--y-border); }
  &--elevated { box-shadow: var(--y-shadow); }

  // Radius
  &--r-md { border-radius: var(--y-radius-md); }
  &--r-lg { border-radius: var(--y-radius-lg); }
  &--r-xl { border-radius: var(--y-radius-xl); }
  &--r-2xl { border-radius: var(--y-radius-2xl); }

  // Padding
  &--p-none { padding: 0; }
  &--p-sm   { padding: 16px; }
  &--p-md   { padding: 24px; }
  &--p-lg   { padding: 32px; }

  // Interactive (hover lift)
  &--interactive {
    cursor: pointer;
    transition:
      transform var(--y-dur-base) var(--y-ease-dramatic),
      box-shadow var(--y-dur-base) var(--y-ease),
      border-color var(--y-dur-fast) var(--y-ease);
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--y-shadow-lg);
      border-color: var(--y-border-strong);
    }
  }
}
</style>
```

- [ ] **Step 2: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/components/yemo/YCard.vue
git commit -m "feat(yemo): add YCard component (padding/radius/interactive variants)"
```

---

## Task 10: YInput 컴포넌트

**Files:**
- Create: `src/components/yemo/YInput.vue`

라벨 + 입력 + 에러 메시지를 묶은 입력 필드.

- [ ] **Step 1: 컴포넌트 작성**

Write the full content of `src/components/yemo/YInput.vue`:
```vue
<script setup>
import { Icon } from '@iconify/vue'
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },
  appendIcon: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = useId()
const hasError = computed(() => !!props.error)
</script>

<template>
  <div class="y-input-wrap" :class="{ 'y-input-wrap--error': hasError, 'y-input-wrap--disabled': disabled }">
    <label v-if="label" :for="inputId" class="y-input-label">
      {{ label }}
      <span v-if="required" class="y-input-required" aria-hidden="true">*</span>
    </label>

    <div class="y-input-field" :class="`y-input-field--${size}`">
      <Icon v-if="prependIcon" :icon="prependIcon" class="y-input-icon y-input-icon--prepend" aria-hidden="true" />
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="hasError || undefined"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        class="y-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
      <Icon v-if="appendIcon" :icon="appendIcon" class="y-input-icon y-input-icon--append" aria-hidden="true" />
    </div>

    <div v-if="error" :id="`${inputId}-error`" class="y-input-error" role="alert">{{ error }}</div>
    <div v-else-if="hint" :id="`${inputId}-hint`" class="y-input-hint">{{ hint }}</div>
  </div>
</template>

<style lang="scss" scoped>
.y-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--disabled { opacity: 0.5; pointer-events: none; }
}

.y-input-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--y-text-muted);
  letter-spacing: 0.02em;
}
.y-input-required { color: var(--y-danger); margin-left: 2px; }

.y-input-field {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius);
  transition: border-color var(--y-dur-fast) var(--y-ease), box-shadow var(--y-dur-fast) var(--y-ease);

  &:focus-within { border-color: var(--y-accent); box-shadow: var(--y-shadow-focus); }

  &--sm { min-height: 36px; padding: 0 12px; }
  &--md { min-height: 44px; padding: 0 14px; }
  &--lg { min-height: 52px; padding: 0 16px; }
}

.y-input {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--y-text);
  &::placeholder { color: var(--y-text-disabled); }
}

.y-input-icon { width: 18px; height: 18px; color: var(--y-text-muted); flex-shrink: 0; }
.y-input-icon--prepend { margin-right: 8px; }
.y-input-icon--append { margin-left: 8px; }

.y-input-wrap--error .y-input-field {
  border-color: var(--y-danger);
  &:focus-within { box-shadow: 0 0 0 4px rgba(184, 74, 74, 0.18); }
}

.y-input-hint  { font-size: 12px; color: var(--y-text-muted); }
.y-input-error { font-size: 12px; color: var(--y-danger); font-weight: 500; }
</style>
```

- [ ] **Step 2: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/components/yemo/YInput.vue
git commit -m "feat(yemo): add YInput component (label + icons + error/hint)"
```

---

## Task 11: YTag 컴포넌트

**Files:**
- Create: `src/components/yemo/YTag.vue`

칩/배지 컴포넌트. variant별로 톤 다르게.

- [ ] **Step 1: 컴포넌트 작성**

Write the full content of `src/components/yemo/YTag.vue`:
```vue
<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'accent', 'success', 'warning', 'danger', 'info'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md'].includes(v),
  },
  icon: { type: String, default: '' },
})
</script>

<template>
  <span class="y-tag" :class="[`y-tag--${variant}`, `y-tag--${size}`]">
    <Icon v-if="icon" :icon="icon" class="y-tag__icon" aria-hidden="true" />
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.y-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--y-radius-pill);
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;

  &--sm { padding: 3px 10px; font-size: 11px; }
  &--md { padding: 6px 14px; font-size: 12px; }

  &__icon { width: 12px; height: 12px; }

  // Variants
  &--default { background: var(--y-surface-elev); color: var(--y-text); }
  &--accent  { background: var(--y-accent-soft); color: #7A5A2A; }
  &--success { background: var(--y-success-soft); color: #2D5C3D; }
  &--warning { background: var(--y-warning-soft); color: #7A5A2A; }
  &--danger  { background: var(--y-danger-soft); color: #8A2A2A; }
  &--info    { background: var(--y-info-soft); color: #2D4A7A; }
}
</style>
```

- [ ] **Step 2: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/components/yemo/YTag.vue
git commit -m "feat(yemo): add YTag component (6 variants × 2 sizes)"
```

---

## Task 12: YSection 컴포넌트 (마케팅 페이지 섹션 헤더 패턴)

**Files:**
- Create: `src/components/yemo/YSection.vue`

eyebrow label + 큰 헤드라인 + 서브카피 패턴.

- [ ] **Step 1: 컴포넌트 작성**

Write the full content of `src/components/yemo/YSection.vue`:
```vue
<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  sub: { type: String, default: '' },
  align: {
    type: String,
    default: 'center',
    validator: v => ['left', 'center'].includes(v),
  },
  // 사용처: <YSection eyebrow="..." title="...">바디 슬롯</YSection>
  // 또는 헤더 없이 통째로 padding wrapper만: <YSection><slot /></YSection>
})
</script>

<template>
  <section class="y-section">
    <div v-if="eyebrow || title || sub" class="y-section__head" :class="`y-section__head--${align}`">
      <div v-if="eyebrow" class="y-section__eyebrow">· {{ eyebrow }}</div>
      <h2 v-if="title" class="y-section__title">
        <slot name="title">{{ title }}</slot>
      </h2>
      <p v-if="sub" class="y-section__sub">{{ sub }}</p>
    </div>
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.y-section {
  padding: 96px 32px;

  @media (max-width: 768px) { padding: 64px 16px; }

  &__head {
    margin-bottom: 56px;

    &--center { text-align: center; & .y-section__sub { margin-left: auto; margin-right: auto; } }
    &--left   { text-align: left; }
  }

  &__eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--y-accent-deep);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.2;
    color: var(--y-text-strong);
    margin-bottom: 16px;

    // Accent span pattern: <span class="t-accent">강조</span>
    :deep(.t-accent) { color: var(--y-accent-deep); }

    @media (max-width: 768px) { font-size: 30px; }
  }

  &__sub {
    font-size: 16px;
    color: var(--y-text-muted);
    line-height: 1.7;
    max-width: 560px;
  }
}
</style>
```

- [ ] **Step 2: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/components/yemo/YSection.vue
git commit -m "feat(yemo): add YSection component (eyebrow + title + sub head pattern)"
```

---

## Task 13: 개발용 컴포넌트 미리보기 페이지

**Files:**
- Create: `src/pages/dev/components.vue`

`/dev/components` 라우트에서 모든 YEMO 컴포넌트 시각 검증.

> **참고:** file-based routing(unplugin-vue-router)을 쓰므로 파일만 생성하면 자동 라우팅됨. production 빌드에서도 라우트가 살아있지만 권장은 production에서 noindex 처리. 이 단계에서는 그냥 라우트만 생성.

- [ ] **Step 1: 폴더 생성 및 페이지 작성**

Run: `mkdir -p src/pages/dev`

Write the full content of `src/pages/dev/components.vue`:
```vue
<script setup>
import YBtn from '@/components/yemo/YBtn.vue'
import YCard from '@/components/yemo/YCard.vue'
import YInput from '@/components/yemo/YInput.vue'
import YTag from '@/components/yemo/YTag.vue'
import YSection from '@/components/yemo/YSection.vue'

import { ref } from 'vue'

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
```

> **참고:** `definePage()`는 `unplugin-vue-router/runtime`에서 자동 임포트. 만약 자동 임포트가 작동하지 않으면 명시적으로 `import { definePage } from 'unplugin-vue-router/runtime'` 추가.

- [ ] **Step 2: dev 서버에서 페이지 확인**

Run: `npm run dev`
브라우저에서 `http://localhost:5173/dev/components` (포트는 vite 콘솔 출력값으로 확인) 열고 시각 검증:
- 모든 버튼 6 variant × 3 size가 일관된 톤으로 보이는가
- Hover 시 primary/accent는 위로 살짝 떠오르는가
- Card interactive 호버 효과 작동하는가
- Input focus 시 골드 ring 보이는가
- Tag 6색이 모두 잘 보이는가
- Typography 스케일이 점점 작아지는 위계 형성하는가
- 컬러 팔레트가 따뜻한 톤으로 일관되는가

서버 종료: Ctrl+C

- [ ] **Step 3: 빌드 통과 확인**

Run: `npm run build`
Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/pages/dev/components.vue
git commit -m "feat(yemo): add /dev/components preview page for visual verification"
```

---

## Task 14: Vuetify 격리 점검 + Phase 0 마무리

**Files:**
- Modify: `CLAUDE.md` (현재 진행 단계 업데이트)
- Create: `docs/history/2026-XX-XX-phase0-complete.md` (날짜는 실행 시점에 결정)

`.yemo` 클래스 격리가 제대로 작동하는지 확인하고, Phase 0 완료 기록.

- [ ] **Step 1: dev 서버에서 Vuetify 영역 점검**

Run: `npm run dev`
브라우저에서 다음 페이지들을 차례로 열어 시각적 변화가 없는지 확인:
- `/` (현재 랜딩 — 아직 리디자인 전이므로 그대로여야 함)
- `/shop-admin/dashboard` (관리자 — 그대로여야 함)
- `/booking/` (고객 검색 — 그대로여야 함)

DevTools에서 `body` 또는 `.v-application`에 `.yemo` 클래스가 묻어 있지 않은지 확인. CSS 변수 `--y-*`가 admin 페이지에서 적용되어 있지 않은지 (DevTools Computed 탭에서 확인) 검증.

서버 종료: Ctrl+C

- [ ] **Step 2: ESLint + 빌드 최종 점검**

Run:
```bash
npm run lint
npm run build
```
Expected: 둘 다 통과.

- [ ] **Step 3: Phase 0 완료 기록 작성**

먼저 오늘 날짜를 확인. Run: `date +%Y-%m-%d`

그 날짜로 파일 생성. Write `docs/history/YYYY-MM-DD-phase0-complete.md` (날짜 치환):
```markdown
# Phase 0 완료 · Foundation

> **완료일:** YYYY-MM-DD

## 완료된 산출물

### 디자인 시스템 (`src/assets/styles/yemo/`)
- `_tokens.scss` — 컬러/라운드/그림자/모션/z-index CSS 변수
- `_reset.scss` — `.yemo` 스코프 미니멀 reset
- `_typography.scss` — Pretendard + 타입 스케일 유틸 (.t-display-xl 등)
- `_motion.scss` — transition 헬퍼 (.y-trans, .y-hover-lift 등)
- `_utilities.scss` — flex/gap/space/visibility 유틸
- `index.scss` — 진입점

### 컴포넌트 (`src/components/yemo/`)
- `YBtn.vue` — 6 variant × 3 size + pill/loading
- `YCard.vue` — 4 padding × 4 radius + interactive
- `YInput.vue` — label + icons + error/hint
- `YTag.vue` — 6 variant × 2 size
- `YSection.vue` — eyebrow + title + sub 패턴

### 인프라
- Phosphor Icons (`@iconify-json/ph`) 도입 + build-icons 통합
- Pretendard Variable 웹폰트 preload
- `/dev/components` 시각 검증 페이지

## 격리 검증 결과
- ✅ `.yemo` 클래스 없는 곳에서 CSS 변수 미적용 확인
- ✅ Vuetify(Materio) admin 영역에 시각 변화 없음
- ✅ `npm run lint` / `npm run build` 통과

## 다음 단계
Phase 1 — 마케팅 페이지 리디자인 (8 페이지)
계획: `docs/superpowers/plans/<날짜>-phase1-marketing.md` (작성 예정)
```

- [ ] **Step 4: CLAUDE.md 진행 섹션 업데이트**

`CLAUDE.md`에서 다음 부분을 찾아:
```
## 진행 중 (2026-05-12) — 공개 페이지 UI/UX 리디자인 (리셋 후 신규)
```

그 섹션 마지막에 (Phase 정보 다음에) 추가:
```
- **진행 단계**: ✅ Phase 0 Foundation 완료 (YYYY-MM-DD). 다음 → Phase 1 마케팅 페이지
```
(YYYY-MM-DD를 실제 완료 날짜로 치환)

- [ ] **Step 5: 최종 커밋**

```bash
git add CLAUDE.md docs/history/
git commit -m "docs(phase0): record Phase 0 Foundation completion"
```

---

## Phase 0 완료 기준 (Definition of Done)

전부 ✅이면 Phase 0 종료:

- [ ] 모든 14개 Task 커밋 완료
- [ ] `npm run lint` 통과 (warning 허용)
- [ ] `npm run build` 통과
- [ ] `/dev/components` 페이지에서 5개 컴포넌트 모두 작동
- [ ] Phosphor 아이콘 (`<Icon icon="ph:..." />`) 렌더링됨
- [ ] `/` `/shop-admin/dashboard` `/booking/` 에서 시각적 변화 없음 (격리 확인)
- [ ] `docs/history/<날짜>-phase0-complete.md` 작성
- [ ] CLAUDE.md "진행 단계" 업데이트

---

## 다음 세션에서 이어가기

이 plan을 완료했다면 다음 사용자 메시지로 응답:
> "Phase 0 완료. 다음 plan(`Phase 1 — 마케팅`) 작성하시겠습니까?"

Phase 1 plan은 별도 파일로 작성:
- `docs/superpowers/plans/<날짜>-phase1-marketing.md`
- 작업 순서: layouts/public + PublicHeader + PublicFooter → index(랜딩) → pricing → features → faq → login(분기) → register → password-recovery → oauth2-redirect

각 Phase는 별도 plan으로 분리하여 중단/재개를 용이하게 한다.
