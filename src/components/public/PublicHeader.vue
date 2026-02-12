<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const router = useRouter()
const theme = useTheme()
const mobileDrawer = ref(false)

// 네비게이션 메뉴
const navItems = [
  { title: '홈', to: '/', icon: 'ri-home-line' },
  { title: '기능', to: '/features', icon: 'ri-function-line' },
  { title: '요금제', to: '/pricing', icon: 'ri-price-tag-3-line' },
  { title: 'FAQ', to: '/faq', icon: 'ri-question-line' },
  { title: '지원', to: '/support', icon: 'ri-customer-service-line' },
]

function navigateTo(path) {
  router.push(path)
  mobileDrawer.value = false
}

// 테마 토글
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<template>
  <VAppBar
    elevation="0"
    :border="true"
    class="public-header"
  >
    <VContainer fluid class="d-flex align-center px-4 px-sm-6">
      <!-- 로고 -->
      <div
        class="app-logo d-flex align-center cursor-pointer"
        @click="navigateTo('/')"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="app-logo-title ms-2">
          {{ themeConfig.app.title }}
        </h1>
      </div>

      <VSpacer />

      <!-- 데스크톱 네비게이션 -->
      <div class="d-none d-md-flex align-center">
        <VBtn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          variant="text"
          class="mx-1"
        >
          {{ item.title }}
        </VBtn>

        <VDivider vertical class="mx-3" />

        <!-- 테마 전환 -->
        <VBtn
          icon
          variant="text"
          @click="toggleTheme"
        >
          <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
        </VBtn>

        <!-- 로그인 -->
        <VBtn
          to="/login"
          variant="text"
          class="mx-1"
        >
          로그인
        </VBtn>

        <!-- 무료로 시작하기 -->
        <VBtn
          to="/register"
          color="primary"
          class="ms-2"
          prepend-icon="ri-rocket-line"
        >
          무료로 시작하기
        </VBtn>
      </div>

      <!-- 모바일 메뉴 버튼 -->
      <VBtn
        icon
        variant="text"
        class="d-md-none"
        @click="mobileDrawer = !mobileDrawer"
      >
        <VIcon icon="ri-menu-line" />
      </VBtn>
    </VContainer>
  </VAppBar>

  <!-- 모바일 네비게이션 드로어 -->
  <VNavigationDrawer
    v-model="mobileDrawer"
    temporary
    location="end"
    class="public-mobile-drawer"
  >
    <div class="pa-4">
      <!-- 로고 -->
      <div class="d-flex align-center mb-6">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h2 class="app-logo-title ms-2">
          {{ themeConfig.app.title }}
        </h2>
      </div>

      <VDivider class="mb-4" />

      <!-- 메뉴 아이템 -->
      <VList>
        <VListItem
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="navigateTo(item.to)"
        >
          <template #prepend>
            <VIcon :icon="item.icon" />
          </template>
          <VListItemTitle>{{ item.title }}</VListItemTitle>
        </VListItem>
      </VList>

      <VDivider class="my-4" />

      <!-- 테마 전환 -->
      <VListItem @click="toggleTheme">
        <template #prepend>
          <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
        </template>
        <VListItemTitle>
          {{ theme.global.current.value.dark ? '라이트 모드' : '다크 모드' }}
        </VListItemTitle>
      </VListItem>

      <VDivider class="my-4" />

      <!-- CTA 버튼들 -->
      <div class="d-flex flex-column gap-2">
        <VBtn
          block
          variant="outlined"
          @click="navigateTo('/login')"
        >
          로그인
        </VBtn>
        <VBtn
          block
          color="primary"
          prepend-icon="ri-rocket-line"
          @click="navigateTo('/register')"
        >
          무료로 시작하기
        </VBtn>
      </div>
    </div>
  </VNavigationDrawer>
</template>

<style lang="scss" scoped>
.public-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;

  &-title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    margin: 0;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
