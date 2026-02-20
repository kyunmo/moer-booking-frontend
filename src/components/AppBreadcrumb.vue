<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 경로 세그먼트 -> 한국어 라벨 매핑
const labelMap = {
  'shop-admin': '관리자',
  'reservations': '예약 관리',
  'calendar': '캘린더',
  'list': '목록',
  'customers': '고객 관리',
  'services': '서비스 관리',
  'staffs': '스태프 관리',
  'statistics': '통계',
  'business-settings': '매장 설정',
  'hours': '영업시간',
  'holidays': '휴무일',
  'coupon': '쿠폰 관리',
  'reviews': '리뷰 관리',
  'subscription': '구독 관리',
  'payment': '결제',
  'history': '결제 내역',
  'notification-logs': '알림 이력',
  'profile': '프로필',
  'super': '슈퍼관리자',
  'dashboard': '대시보드',
  'businesses': '매장 관리',
  'users': '사용자 관리',
  'audit-logs': '감사 로그',
  'setup': '초기 설정',
}

// 제외할 세그먼트
const excludedSegments = ['index']

const route = useRoute()
const router = useRouter()

const breadcrumbItems = computed(() => {
  const path = route.path

  // 경로 세그먼트 분리 (빈 문자열 제거)
  const segments = path.split('/').filter(s => s && !excludedSegments.includes(s))

  if (segments.length === 0) return []

  const items = []

  // 홈 아이콘 (shop-admin 대시보드로 이동)
  items.push({
    title: '홈',
    to: '/shop-admin/dashboard',
    disabled: false,
  })

  // 각 세그먼트를 순회하며 브레드크럼 아이템 생성
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // shop-admin 세그먼트는 홈으로 대체되므로 건너뜀
    if (segment === 'shop-admin') continue

    const label = labelMap[segment] || segment
    const isLast = i === segments.length - 1

    // 라우트 존재 여부 확인
    const resolved = router.resolve(currentPath)
    const routeExists = resolved.matched.length > 0 && resolved.name !== undefined

    items.push({
      title: label,
      to: isLast ? undefined : (routeExists ? currentPath : undefined),
      disabled: isLast,
    })
  }

  return items
})

// 대시보드 페이지인지 확인 (최소한의 브레드크럼)
const isDashboard = computed(() => {
  return route.path === '/shop-admin/dashboard' || route.path === '/shop-admin'
})
</script>

<template>
  <VBreadcrumbs
    v-if="breadcrumbItems.length > 0 && !isDashboard"
    :items="breadcrumbItems"
    class="app-breadcrumb px-0 pt-2 pb-4"
    density="compact"
  >
    <template #prepend>
      <!-- 빈 템플릿 - VBreadcrumbs 기본 prepend 제거 -->
    </template>

    <template #item="{ item, index }">
      <VBreadcrumbsItem
        :to="item.to"
        :disabled="item.disabled"
        class="breadcrumb-item"
      >
        <VIcon
          v-if="index === 0"
          icon="ri-home-line"
          size="16"
          class="me-1"
        />
        <span :class="{ 'text-medium-emphasis': !item.disabled, 'font-weight-medium': item.disabled }">
          {{ item.title }}
        </span>
      </VBreadcrumbsItem>
    </template>

    <template #divider>
      <VIcon
        icon="ri-arrow-right-s-line"
        size="16"
        class="text-disabled"
      />
    </template>
  </VBreadcrumbs>
</template>

<style lang="scss">
.app-breadcrumb {
  min-block-size: auto;

  .v-breadcrumbs-item {
    font-size: 0.875rem;
    padding: 0;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
  }

  // 마지막 아이템 (현재 위치) 스타일
  .v-breadcrumbs-item--disabled {
    opacity: 1;

    span {
      color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    }
  }

  // 링크 아이템 호버 스타일
  .v-breadcrumbs-item:not(.v-breadcrumbs-item--disabled) {
    &:hover span {
      color: rgb(var(--v-theme-primary));
      text-decoration: underline;
    }
  }
}
</style>
