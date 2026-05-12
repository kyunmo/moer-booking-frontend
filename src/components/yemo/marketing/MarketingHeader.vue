<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import YBtn from '@/components/yemo/YBtn.vue'

const route = useRoute()
const scrolled = ref(false)
const drawerOpen = ref(false)

const navItems = [
  { to: '/', label: '홈' },
  { to: '/features', label: '기능' },
  { to: '/pricing', label: '요금제' },
  { to: '/faq', label: 'FAQ' },
]

const onScroll = () => { scrolled.value = window.scrollY > 8 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const closeDrawer = () => { drawerOpen.value = false }
</script>

<template>
  <header class="m-header" :class="{ 'm-header--scrolled': scrolled }">
    <div class="m-header__inner">
      <RouterLink to="/" class="m-header__logo" aria-label="YEMO 홈으로">
        <span class="m-header__wordmark">YEMO</span>
      </RouterLink>

      <nav class="m-header__nav" aria-label="주 메뉴">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="m-header__nav-link"
          :class="{ 'is-active': route.path === item.to }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="m-header__actions">
        <RouterLink to="/login" class="m-header__login">로그인</RouterLink>
        <YBtn :to="undefined" variant="primary" size="sm" @click="$router.push('/register')">
          무료로 시작
        </YBtn>
      </div>

      <button
        class="m-header__hamburger"
        :aria-expanded="drawerOpen"
        aria-label="메뉴 열기"
        @click="drawerOpen = !drawerOpen"
      >
        <Icon :icon="drawerOpen ? 'ph:x' : 'ph:list'" />
      </button>
    </div>

    <Transition name="m-drawer">
      <div v-if="drawerOpen" class="m-drawer" @click.self="closeDrawer">
        <div class="m-drawer__panel">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="m-drawer__link"
            @click="closeDrawer"
          >
            {{ item.label }}
          </RouterLink>
          <div class="m-drawer__divider" />
          <RouterLink to="/login" class="m-drawer__link" @click="closeDrawer">로그인</RouterLink>
          <YBtn variant="primary" size="lg" block @click="closeDrawer(); $router.push('/register')">
            무료로 시작
          </YBtn>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style lang="scss" scoped>
.m-header {
  position: sticky;
  top: 0;
  z-index: var(--y-z-sticky);
  background: rgba(250, 250, 248, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: box-shadow var(--y-dur-fast) var(--y-ease), border-color var(--y-dur-fast) var(--y-ease);
  border-bottom: 1px solid transparent;

  &--scrolled {
    border-bottom-color: var(--y-border);
    box-shadow: var(--y-shadow-sm);
  }

  &__inner {
    max-width: 1440px;
    margin-inline: auto;
    height: 72px;
    padding-inline: 32px;
    display: flex;
    align-items: center;
    gap: 32px;

    @media (max-width: 768px) {
      height: 56px;
      padding-inline: 16px;
      gap: 16px;
    }
  }

  &__logo { display: inline-flex; align-items: center; }
  &__wordmark {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--y-text-strong);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 28px;
    flex: 1;
    @media (max-width: 968px) { display: none; }
  }
  &__nav-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--y-text-muted);
    transition: color var(--y-dur-fast) var(--y-ease);
    &:hover, &.is-active { color: var(--y-text-strong); }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    @media (max-width: 968px) { display: none; }
  }
  &__login {
    font-size: 14px;
    font-weight: 600;
    color: var(--y-text);
  }

  &__hamburger {
    display: none;
    width: 40px; height: 40px;
    margin-left: auto;
    align-items: center;
    justify-content: center;
    border-radius: var(--y-radius);
    color: var(--y-text-strong);
    @media (max-width: 968px) { display: inline-flex; }
    svg { width: 24px; height: 24px; }
  }
}

.m-drawer {
  position: fixed;
  inset: 56px 0 0 0;
  background: rgba(26, 26, 26, 0.3);
  z-index: var(--y-z-overlay);
  &__panel {
    background: var(--y-bg);
    padding: 24px 16px 32px;
    display: flex; flex-direction: column; gap: 8px;
    border-bottom: 1px solid var(--y-border);
  }
  &__link {
    padding: 14px 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--y-text-strong);
  }
  &__divider { height: 1px; background: var(--y-border); margin: 8px 0; }
}
.m-drawer-enter-active, .m-drawer-leave-active { transition: opacity var(--y-dur-base) var(--y-ease); }
.m-drawer-enter-from, .m-drawer-leave-to { opacity: 0; }
</style>
