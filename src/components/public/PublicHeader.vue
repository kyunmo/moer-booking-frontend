<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()
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

// 로그아웃
async function handleLogout() {
  mobileDrawer.value = false
  try {
    // logout() 내부에서 상태 초기화 및 /login 리다이렉트 처리
    await authStore.logout()
  }
  catch (error) {
    console.error('로그아웃 실패:', error)
    // 실패 시에도 홈으로 이동
    router.push('/')
  }
}
</script>

<template>
  <VAppBar
    elevation="0"
    :border="true"
    class="public-header"
  >
    <VContainer fluid class="header-container d-flex align-center px-4 px-sm-6">
      <!-- 로고 (왼쪽) -->
      <div
        class="app-logo d-flex align-center cursor-pointer header-logo"
        @click="navigateTo('/')"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="app-logo-title ms-2">
          {{ themeConfig.app.title }}
        </h1>
      </div>

      <!-- 데스크톱 네비게이션 (가운데) -->
      <div class="d-none d-md-flex align-center header-nav">
        <VBtn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          variant="text"
          class="mx-1"
        >
          {{ item.title }}
        </VBtn>
      </div>

      <!-- 우측 액션 영역 -->
      <div class="d-none d-md-flex align-center header-actions">
        <!-- 테마 전환 -->
        <VBtn
          icon
          variant="text"
          @click="toggleTheme"
        >
          <VIcon :icon="theme.global.current.value.dark ? 'ri-sun-line' : 'ri-moon-line'" />
        </VBtn>

        <template v-if="authStore.isAuthenticated">
          <!-- 로그인된 상태 -->
          <VBtn
            to="/shop-admin/dashboard"
            variant="text"
            class="mx-1"
            prepend-icon="ri-dashboard-line"
          >
            관리자
          </VBtn>

          <VBtn
            color="error"
            variant="outlined"
            class="ms-2"
            prepend-icon="ri-logout-box-r-line"
            @click="handleLogout"
          >
            로그아웃
          </VBtn>
        </template>

        <template v-else>
          <!-- 미로그인 상태 -->
          <VBtn
            to="/login"
            variant="text"
            class="mx-1"
          >
            로그인
          </VBtn>

          <VBtn
            to="/register"
            color="primary"
            class="ms-2"
          >
            무료로 시작하기
          </VBtn>
        </template>
      </div>

      <!-- 모바일 메뉴 버튼 -->
      <VSpacer class="d-md-none" />
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
        <template v-if="authStore.isAuthenticated">
          <VBtn
            block
            variant="outlined"
            prepend-icon="ri-dashboard-line"
            @click="navigateTo('/shop-admin/dashboard')"
          >
            관리자 페이지
          </VBtn>
          <VBtn
            block
            color="error"
            variant="outlined"
            prepend-icon="ri-logout-box-r-line"
            @click="handleLogout"
          >
            로그아웃
          </VBtn>
        </template>

        <template v-else>
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
            @click="navigateTo('/register')"
          >
            무료로 시작하기
          </VBtn>
        </template>
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

.header-container {
  position: relative;
}

// 데스크톱: 3분할 레이아웃 (로고-왼, 메뉴-중앙, 액션-우)
.header-logo {
  flex-shrink: 0;
}

.header-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-actions {
  margin-left: auto;
  flex-shrink: 0;
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
