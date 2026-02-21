<script setup>
import baseNavItems, { superAdminItems } from '@/navigation/vertical'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@core/stores/config'
import { themeConfig } from '@themeConfig'
import { computed } from 'vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'
import BusinessSelector from '@/layouts/components/BusinessSelector.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import TrialNavBadge from '@/components/trial/TrialNavBadge.vue'
import { useTour } from '@/composables/useTour'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const configStore = useConfigStore()
const authStore = useAuthStore()
const route = useRoute()
const { startPageTour } = useTour()

function handleTourClick() {
  startPageTour(route.name)
}

// 역할에 따른 네비게이션 아이템
const navItems = computed(() => {
  const userRole = authStore.userRole

  if (userRole === 'SUPER_ADMIN') {
    return [...superAdminItems, ...baseNavItems]
  }

  return baseNavItems
})

// ℹ️ Provide animation name for vertical nav collapse icon.
const verticalNavHeaderActionAnimationName = ref(null)

watch([
  () => configStore.isVerticalNavCollapsed,
  () => configStore.isAppRTL,
], val => {
  if (configStore.isAppRTL)
    verticalNavHeaderActionAnimationName.value = val[0] ? 'rotate-back-180' : 'rotate-180'
  else
    verticalNavHeaderActionAnimationName.value = val[0] ? 'rotate-180' : 'rotate-back-180'
}, { immediate: true })
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 매장 선택기 (슈퍼관리자 전용) -->
    <template #before-vertical-nav-items>
      <div v-if="authStore.isSuperAdmin" class="pa-4 pb-2">
        <BusinessSelector />
        <VDivider class="mt-4" />
      </div>
    </template>

    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          aria-label="메뉴 열기"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />

        <!-- 상단 우측 액션 영역 -->
        <div class="d-flex align-center navbar-actions">
          <!-- 무료 체험기간 배지 -->
          <TrialNavBadge />

          <!-- 구분선 -->
          <VDivider vertical class="mx-2 navbar-divider" />

          <!-- 가이드 투어 버튼 (데스크톱: 텍스트+아이콘) -->
          <VBtn
            id="tour-trigger-btn"
            variant="tonal"
            color="primary"
            size="small"
            class="d-none d-sm-inline-flex"
            aria-label="가이드 투어"
            @click="handleTourClick"
          >
            <VIcon icon="ri-compass-discover-line" size="18" start />
            가이드
          </VBtn>
          <!-- 가이드 투어 버튼 (모바일: 아이콘만) -->
          <IconBtn
            id="tour-trigger-btn-mobile"
            class="d-sm-none"
            color="primary"
            aria-label="가이드 투어"
            @click="handleTourClick"
          >
            <VTooltip activator="parent" location="bottom">
              가이드 투어
            </VTooltip>
            <VIcon icon="ri-compass-discover-line" />
          </IconBtn>

          <!-- 구분선 -->
          <VDivider vertical class="mx-2 navbar-divider" />

          <!-- 알림(Notifications) -->
          <NavBarNotifications />

          <!-- 프로필 -->
          <UserProfile class="ms-1" />
        </div>
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>

<style lang="scss">
@use "@core/scss/template/libs/shepherd.scss";

@keyframes rotate-180 {
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
}

@keyframes rotate-back-180 {
  from { transform: rotate(180deg); }
  to { transform: rotate(0deg); }
}

.navbar-actions {
  gap: 4px;
}

.navbar-divider {
  opacity: 0.3;
  block-size: 24px;
  align-self: center;
}

.layout-vertical-nav {
  .nav-header {
    .header-action {
      animation-duration: 0.35s;
      animation-fill-mode: forwards;
      animation-name: v-bind(verticalNavHeaderActionAnimationName);
      transform: rotate(0deg);
    }
  }
}
</style>
