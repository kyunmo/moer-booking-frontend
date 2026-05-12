<script setup>
import { RouterLink } from 'vue-router'

const linkGroups = [
  {
    title: '서비스',
    links: [
      { to: '/features', label: '기능' },
      { to: '/pricing', label: '요금제' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: '회사',
    links: [
      { to: '/login', label: '로그인' },
      { to: '/register', label: '무료로 시작' },
    ],
  },
  {
    title: '법적',
    links: [
      { to: '/terms', label: '이용약관' },
      { to: '/privacy', label: '개인정보처리방침' },
      { to: '/refund-policy', label: '환불정책' },
    ],
  },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="m-footer">
    <div class="m-footer__inner">
      <div class="m-footer__brand">
        <div class="m-footer__wordmark">YEMO</div>
        <p class="m-footer__tagline">예약은 예모로</p>
      </div>

      <div class="m-footer__grid">
        <div v-for="group in linkGroups" :key="group.title" class="m-footer__group">
          <div class="m-footer__group-title">{{ group.title }}</div>
          <ul>
            <li v-for="link in group.links" :key="link.to">
              <RouterLink :to="link.to">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="m-footer__legal">
      <div class="m-footer__legal-inner">
        <div class="m-footer__biz">
          <p>대표 구균모 · 사업자등록번호 XXX-XX-XXXXX</p>
          <p>통신판매업 신고번호 제XXXX-서울-XXXX호 · 이메일 support@yemo.io</p>
        </div>
        <div class="m-footer__copy">© {{ year }} YEMO. All rights reserved.</div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.m-footer {
  background: #1A1A1A;
  color: #B8B8B8;
  padding-top: 80px;

  &__inner {
    max-width: 1200px;
    margin-inline: auto;
    padding: 0 32px 64px;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 64px;
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 48px;
      padding: 0 16px 48px;
    }
  }

  &__wordmark {
    font-size: 28px;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.04em;
  }
  &__tagline {
    margin-top: 8px;
    font-size: 14px;
    color: #8A8A8A;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
  }

  &__group-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #FFFFFF;
    margin-bottom: 16px;
  }
  &__group ul { display: flex; flex-direction: column; gap: 10px; }
  &__group a {
    font-size: 14px;
    color: #B8B8B8;
    transition: color var(--y-dur-fast) var(--y-ease);
    &:hover { color: #FFFFFF; }
  }

  &__legal {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 24px 0;
  }
  &__legal-inner {
    max-width: 1200px;
    margin-inline: auto;
    padding: 0 32px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-size: 12px;
    color: #6B6B6B;
    @media (max-width: 768px) {
      flex-direction: column;
      padding: 0 16px;
    }
  }
  &__biz p { margin: 0; line-height: 1.7; }
}
</style>
