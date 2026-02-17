# Materio 템플릿 활용도 분석 및 UI 개선 제안

> 평가일: 2026-02-17
> 대상: 프로젝트 전체의 Materio/Vuetify 컴포넌트 활용 현황

---

## 1. 현재 활용 현황

### 잘 활용 중인 컴포넌트

| 영역 | 컴포넌트 |
|------|---------|
| 레이아웃 | VCard, VRow, VCol, VContainer, VDivider |
| 데이터 표시 | VDataTable, VList, VChip, VAvatar, VRating |
| 폼 | VTextField, VTextarea, VSelect, VAutocomplete, VForm |
| 액션 | VBtn, VBtnToggle, VTooltip |
| 피드백 | VAlert, VProgressCircular, VProgressLinear, VSkeletonLoader |
| 네비게이션 | VTabs + VWindow, VPagination |
| 오버레이 | VDialog |
| 차트 | VueApexCharts |

### 미활용 / 저활용 컴포넌트

| 컴포넌트 | 적용 가능 위치 | 기대 효과 |
|----------|--------------|----------|
| `VStepper` / `AppStepper` | 예약 플로우 | 커스텀 코드 80줄 절감, UX 향상 |
| `VTimeline` | 대시보드 알림, 예약 이력 | 시각적 정보 전달 향상 |
| `VBadge` | 네비게이션 알림 카운트 | 미확인 알림 즉시 인지 |
| `VHover` | 스태프/서비스 카드 | 인터랙션 피드백 강화 |
| `VItemGroup` | 서비스 선택 | 선택 상태 관리 간소화 |
| `VDatePicker` | 예약 달력 | 커스텀 코드 150줄 절감 |
| `VCarousel` | 포트폴리오 이미지 | 커스텀 코드 40줄 절감 |
| `VBottomNavigation` | 모바일 하단 메뉴 | 모바일 UX 대폭 개선 |
| `VExpansionPanel` | FAQ, 영업시간 정보 | 정보 밀도 개선 |
| `VBreadcrumbs` | 관리자 페이지 위치 표시 | 네비게이션 명확성 |
| `VDataIterator` | 서비스/스태프 카드↔테이블 전환 | 뷰 모드 유연성 |
| `VDataTable` 서버사이드 | 예약/고객 대용량 | 성능 향상 |
| `VDataTable` 행 선택 | 일괄 상태 변경 | 업무 효율 향상 |

---

## 2. Quick Win (최소 변경, 최대 효과)

### QW-1: StatisticsCard에 트렌드 퍼센트 추가 (난이도: 낮음)

**현재**: 숫자만 표시 / **개선**: 전주/전월 대비 증감률 표시

**대상 파일**: `src/components/StatisticsCard.vue`

```vue
<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  color: { type: String, default: 'primary' },
  subtitle: { type: String, default: '' },
  // 추가
  trend: { type: Number, default: null },
  trendLabel: { type: String, default: '전일 대비' },
})

const trendColor = computed(() =>
  props.trend === null ? '' : props.trend >= 0 ? 'success' : 'error',
)
const trendIcon = computed(() =>
  props.trend === null ? '' : props.trend >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line',
)
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between align-start">
        <div class="d-flex flex-column gap-y-1">
          <span class="text-body-1 text-medium-emphasis">{{ title }}</span>
          <h4 class="text-h4 font-weight-bold">{{ value }}</h4>
          <div v-if="trend !== null" class="d-flex align-center gap-1">
            <VChip :color="trendColor" size="x-small" variant="tonal">
              <VIcon :icon="trendIcon" size="12" start />
              {{ Math.abs(trend) }}%
            </VChip>
            <span class="text-caption text-medium-emphasis">{{ trendLabel }}</span>
          </div>
          <div v-else-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</div>
        </div>
        <VAvatar :color="color" variant="tonal" rounded="lg" size="48">
          <VIcon :icon="icon" size="28" />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>
```

사용 예:
```vue
<StatisticsCard
  title="오늘 예약"
  :value="`${stats.todayStats.totalReservations}건`"
  icon="ri-calendar-event-line"
  color="primary"
  :trend="12"
  trend-label="어제 대비"
/>
```

---

### QW-2: 대시보드 환영 카드 → 그라디언트 배너 (난이도: 낮음)

**대상 파일**: `src/pages/shop-admin/dashboard.vue`

```vue
<!-- Before: 단순 흰색 카드 -->
<VCard class="mb-6">
  <VCardText class="d-flex align-center">
    <div>
      <h4 class="text-h4 font-weight-medium mb-1">안녕하세요, {{ businessName }} 님!</h4>
      <p class="text-body-1 mb-0">{{ todayText }}</p>
    </div>
  </VCardText>
</VCard>

<!-- After: 그라디언트 배너 + 퀵 액션 통합 -->
<VCard class="mb-6 welcome-banner" color="primary">
  <VCardText class="d-flex align-center justify-space-between pa-6">
    <div>
      <p class="text-body-2 text-white text-opacity-80 mb-1">{{ todayText }}</p>
      <h4 class="text-h4 font-weight-bold text-white mb-2">
        안녕하세요, {{ businessName }} 님!
      </h4>
      <VChip color="white" variant="tonal" size="small" prepend-icon="ri-store-2-line">
        오늘도 좋은 하루 되세요
      </VChip>
    </div>
    <VIcon
      icon="ri-store-3-line"
      size="80"
      class="text-white opacity-20 d-none d-md-block"
    />
  </VCardText>
</VCard>

<style scoped>
.welcome-banner {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    color-mix(in srgb, rgb(var(--v-theme-primary)) 70%, #3B82F6) 100%
  ) !important;
}
</style>
```

---

### QW-3: 퀵 액션 → 아이콘 카드 스타일 (난이도: 낮음)

**대상 파일**: `src/pages/shop-admin/dashboard.vue`

```vue
<!-- Before: 단순 VBtn 4개 나열 -->
<!-- After: 아이콘 카드 그리드 -->
<VRow>
  <VCol v-for="action in quickActions" :key="action.title" cols="6" md="3">
    <VCard
      :to="action.to"
      :color="action.color"
      variant="tonal"
      hover
      class="text-center pa-4 quick-action-card"
    >
      <VIcon :icon="action.icon" size="36" class="mb-2" />
      <div class="text-body-1 font-weight-bold">{{ action.title }}</div>
      <div class="text-caption text-medium-emphasis">{{ action.description }}</div>
    </VCard>
  </VCol>
</VRow>

<script setup>
const quickActions = [
  { title: '예약 등록', description: '새 예약을 추가하세요', icon: 'ri-calendar-add-line', color: 'primary' },
  { title: '고객 등록', description: '새 고객 정보를 입력하세요', icon: 'ri-user-add-line', color: 'success' },
  { title: '통계 분석', description: '매출과 예약을 분석하세요', icon: 'ri-bar-chart-box-line', color: 'info' },
  { title: '매장 설정', description: '영업시간과 설정을 관리하세요', icon: 'ri-settings-3-line', color: 'warning' },
]
</script>

<style scoped>
.quick-action-card {
  transition: transform 0.2s ease;
  cursor: pointer;
}
.quick-action-card:hover {
  transform: translateY(-4px);
}
</style>
```

---

### QW-4: 예약 상태 Chip 클릭 → 빠른 상태 변경 (난이도: 중간)

**대상 파일**: `src/pages/shop-admin/reservations/list.vue`

```vue
<!-- Before: 표시만 -->
<template #item.status="{ item }">
  <VChip :color="getStatusColor(item.status)" size="small" variant="tonal">
    {{ getStatusText(item.status) }}
  </VChip>
</template>

<!-- After: 클릭하여 상태 변경 가능 -->
<template #item.status="{ item }">
  <VMenu v-if="['PENDING', 'CONFIRMED'].includes(item.status)">
    <template #activator="{ props }">
      <VChip
        v-bind="props"
        :color="getStatusColor(item.status)"
        size="small"
        variant="tonal"
        class="cursor-pointer"
        append-icon="ri-arrow-down-s-line"
      >
        {{ getStatusText(item.status) }}
      </VChip>
    </template>
    <VList density="compact">
      <VListItem
        v-if="item.status === 'PENDING'"
        prepend-icon="ri-check-line"
        title="예약 확정"
        @click="handleStatusChange(item.id, 'CONFIRMED')"
      />
      <VListItem
        v-if="item.status === 'CONFIRMED'"
        prepend-icon="ri-checkbox-circle-line"
        title="완료 처리"
        @click="handleStatusChange(item.id, 'COMPLETED')"
      />
    </VList>
  </VMenu>
  <VChip v-else :color="getStatusColor(item.status)" size="small" variant="tonal">
    {{ getStatusText(item.status) }}
  </VChip>
</template>
```

---

### QW-5: EmptyState 공통 컴포넌트 (난이도: 낮음)

**신규 파일**: `src/components/EmptyState.vue`

```vue
<script setup>
defineProps({
  icon: { type: String, default: 'ri-inbox-line' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})
const emit = defineEmits(['action'])
</script>

<template>
  <div class="text-center pa-12">
    <VAvatar color="primary" variant="tonal" size="80" class="mb-4">
      <VIcon :icon="icon" size="40" />
    </VAvatar>
    <h3 class="text-h6 font-weight-bold mb-2">{{ title }}</h3>
    <p v-if="description" class="text-body-2 text-medium-emphasis mb-6">{{ description }}</p>
    <slot>
      <VBtn v-if="actionLabel" color="primary" variant="elevated" @click="emit('action')">
        {{ actionLabel }}
      </VBtn>
    </slot>
  </div>
</template>
```

사용 예:
```vue
<!-- Before: 각 페이지마다 다르게 구현 -->
<!-- After: -->
<EmptyState
  icon="ri-calendar-line"
  title="등록된 예약이 없습니다"
  description="첫 예약을 등록하고 고객 관리를 시작하세요"
  action-label="예약 등록하기"
  @action="openCreateDialog"
/>
```

---

## 3. 대시보드 심화 개선

### 3-1. 처리 필요 항목 → VTimeline으로 교체

**대상 파일**: `src/pages/shop-admin/dashboard.vue`

```vue
<VCard v-if="stats.actionAlerts" class="mb-6">
  <VCardTitle class="d-flex align-center">
    <VBadge :content="totalAlerts" color="error" floating>
      <VIcon icon="ri-alarm-warning-line" size="24" class="me-2" color="warning" />
    </VBadge>
    <span class="ms-3">처리가 필요한 항목</span>
  </VCardTitle>
  <VCardText class="pa-0">
    <VTimeline density="compact" side="end" class="pa-4">
      <VTimelineItem
        v-if="stats.actionAlerts.pendingReservations > 0"
        dot-color="warning"
        size="small"
      >
        <div class="d-flex align-center justify-space-between">
          <span class="text-body-2">예약 확정 대기 중</span>
          <VChip color="warning" size="small" variant="tonal">
            {{ stats.actionAlerts.pendingReservations }}건
          </VChip>
        </div>
      </VTimelineItem>
      <VTimelineItem
        v-if="stats.actionAlerts.upcomingReservations > 0"
        dot-color="error"
        size="small"
      >
        <div class="d-flex align-center justify-space-between">
          <span class="text-body-2">1시간 내 예약 시작</span>
          <VChip color="error" size="small" variant="tonal">
            {{ stats.actionAlerts.upcomingReservations }}건
          </VChip>
        </div>
      </VTimelineItem>
    </VTimeline>
  </VCardText>
</VCard>
```

### 3-2. 이번 달 요약에 VProgressLinear 추가

```vue
<VCardText>
  <div class="mb-4">
    <div class="d-flex justify-space-between align-center mb-1">
      <span class="text-body-2 text-medium-emphasis">총 예약</span>
      <span class="text-h6 font-weight-bold">{{ stats.monthStats.totalReservations }}건</span>
    </div>
    <VProgressLinear
      :model-value="(stats.monthStats.totalReservations / monthTarget) * 100"
      color="primary"
      rounded
      height="6"
    />
    <div class="text-caption text-medium-emphasis mt-1">
      목표 {{ monthTarget }}건 대비 {{ Math.round((stats.monthStats.totalReservations / monthTarget) * 100) }}%
    </div>
  </div>
</VCardText>
```

---

## 4. 예약 플로우 (booking/reserve.vue) 개선

### 4-1. VStepper 네이티브 교체

**대상 파일**: `src/pages/booking/[slug]/reserve.vue`

```vue
<!-- Before: 커스텀 스텝 인디케이터 (~50줄) -->
<VCard class="d-none d-md-block mb-6 pa-4" rounded="lg" variant="outlined">
  <div class="d-flex align-center justify-space-between">
    <template v-for="(item, index) in stepperItems" :key="item.value">
      <div class="d-flex align-center cursor-pointer" @click="...">
        <VAvatar ...>...</VAvatar>
        <span ...>{{ item.title }}</span>
      </div>
      <VDivider v-if="index < stepperItems.length - 1" class="mx-3" />
    </template>
  </div>
</VCard>

<!-- After: VStepper (10줄 이내) -->
<VStepper
  v-model="step"
  class="mb-6"
  :items="stepperItems"
  hide-actions
  flat
  alt-labels
  bg-color="transparent"
/>
```

### 4-2. 서비스 선택 → VItemGroup 활용

```vue
<VItemGroup v-model="bookingStore.selectedServiceIds" multiple>
  <VRow>
    <VCol v-for="service in services" :key="service.id" cols="12" sm="6">
      <VItem v-slot="{ isSelected, toggle }" :value="service.id">
        <VCard
          :color="isSelected ? 'primary' : undefined"
          :variant="isSelected ? 'outlined' : 'flat'"
          class="cursor-pointer pa-4"
          :border="!isSelected"
          rounded="lg"
          @click="toggle"
        >
          <div class="d-flex align-start justify-space-between">
            <div class="flex-grow-1">
              <span class="text-subtitle-1 font-weight-bold">{{ service.name }}</span>
              <div class="d-flex align-center ga-3 mt-1">
                <span class="text-body-2 font-weight-bold text-primary">
                  {{ formatPrice(service.price) }}원
                </span>
                <VChip size="x-small" variant="tonal" color="secondary">
                  <VIcon start size="12">ri-time-line</VIcon>
                  {{ service.duration }}분
                </VChip>
              </div>
            </div>
            <VIcon
              :icon="isSelected ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"
              :color="isSelected ? 'primary' : 'grey-lighten-1'"
              size="24"
            />
          </div>
        </VCard>
      </VItem>
    </VCol>
  </VRow>
</VItemGroup>
```

---

## 5. 고객 페이지 개선

### 5-1. 스태프 카드에 VHover 활용

```vue
<VHover v-slot="{ isHovering, props }">
  <VCard
    v-bind="props"
    class="h-100"
    :variant="isHovering ? 'elevated' : 'outlined'"
    :elevation="isHovering ? 8 : 0"
    style="transition: all 0.2s ease"
  >
    <VCardText class="text-center pa-6">
      <VAvatar size="64" color="primary" variant="tonal" class="mb-3">...</VAvatar>
      <!-- hover 시 예약 버튼 오버레이 -->
      <VOverlay
        :model-value="isHovering"
        contained
        scrim="primary"
        :opacity="0.1"
        class="d-flex align-end justify-center pa-4"
      >
        <VBtn color="primary" size="small" rounded="pill" @click="goToReserve">
          <VIcon start size="16">ri-calendar-check-line</VIcon>
          예약하기
        </VBtn>
      </VOverlay>
    </VCardText>
  </VCard>
</VHover>
```

### 5-2. 모바일 하단 탭 바

```vue
<VBottomNavigation v-if="$vuetify.display.smAndDown" grow color="primary">
  <VBtn to="/booking">
    <VIcon>ri-search-line</VIcon>
    <span>검색</span>
  </VBtn>
  <VBtn to="/booking/my-reservations">
    <VIcon>ri-calendar-line</VIcon>
    <span>내 예약</span>
  </VBtn>
  <VBtn to="/booking/profile">
    <VIcon>ri-user-line</VIcon>
    <span>프로필</span>
  </VBtn>
</VBottomNavigation>
```

---

## 6. 디자인 일관성 개선

### 6-1. 삭제 확인 다이얼로그 공통화

현재 고객/서비스/스태프 페이지에서 3번 중복 구현, 스타일 불일치.

```vue
<!-- src/components/dialogs/ConfirmDialog.vue 활용 -->
<ConfirmDialog
  v-model="isDeleteDialogVisible"
  title="고객 삭제"
  :content="`${selectedCustomer?.name} 고객을 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.`"
  confirm-text="삭제"
  confirm-color="error"
  @confirm="deleteCustomer"
/>
```

### 6-2. 카드 헤더 패턴 통일

```vue
<!-- 모든 관리자 카드에 적용할 통일 패턴 -->
<VCard>
  <VCardTitle class="d-flex align-center py-4">
    <VIcon icon="ri-...-line" size="20" class="me-2" color="primary" />
    <span class="text-subtitle-1 font-weight-bold">제목</span>
    <VSpacer />
    <slot name="actions" />
  </VCardTitle>
  <VDivider />  <!-- 항상 포함 -->
  <VCardText>...</VCardText>
</VCard>
```

### 6-3. 색상 테마 활용

| 현재 | 개선 |
|------|------|
| `#9155FD` 하드코딩 | `rgb(var(--v-theme-primary))` |
| 상태 색상 각 파일 중복 정의 | `composables/useStatusColors.js`로 통합 |

### 6-4. 아이콘 색상 표준화 (섹션별)

```
예약: color="primary"    고객: color="info"
스태프: color="success"   서비스: color="warning"
통계: color="secondary"   설정: color="grey"
```

---

## 7. 고급 기능 추천

### VDataTable 서버사이드 페이지네이션

```vue
<VDataTable
  :headers="headers"
  :items="reservations"
  :loading="loading"
  :items-per-page="itemsPerPage"
  :items-length="totalCount"
  v-model:page="currentPage"
  @update:options="handleTableOptions"
/>
```

### VDataTable 행 선택 + 일괄 처리

```vue
<VDataTable v-model="selectedIds" :items="filteredReservations" show-select return-object>
  <template #top>
    <VToolbar v-if="selectedIds.length" flat color="primary" class="rounded-t">
      <span class="text-white ms-2">{{ selectedIds.length }}개 선택됨</span>
      <VSpacer />
      <VBtn color="white" variant="outlined" size="small" @click="bulkConfirm">일괄 확정</VBtn>
      <VBtn color="white" variant="outlined" size="small" class="ms-2" @click="bulkComplete">일괄 완료</VBtn>
    </VToolbar>
  </template>
</VDataTable>
```

---

## 8. 종합 개선 우선순위

| 순위 | 항목 | 대상 파일 | 난이도 | 영향도 |
|------|------|----------|--------|--------|
| **1** | **StatisticsCard 트렌드 추가** | `StatisticsCard.vue` | 낮음 | 높음 |
| **2** | **대시보드 환영 배너 그라디언트** | `dashboard.vue` | 낮음 | 높음 |
| **3** | **퀵 액션 카드 스타일** | `dashboard.vue` | 낮음 | 중간 |
| **4** | **EmptyState 공통 컴포넌트** | 신규 `EmptyState.vue` | 낮음 | 중간 |
| **5** | **삭제 다이얼로그 공통화** | 고객/서비스/스태프 | 낮음 | 중간 |
| 6 | 예약 상태 Chip 빠른 변경 | `reservations/list.vue` | 중간 | 높음 |
| 7 | VStepper 도입 | `reserve.vue` | 중간 | 중간 |
| 8 | VDatePicker 도입 | `reserve.vue` | 중간 | 높음 |
| 9 | VCarousel 도입 | `[slug].vue` | 중간 | 중간 |
| 10 | VBottomNavigation | 레이아웃 | 중간 | 높음 |

> **1, 2, 3번은 코드 5~20줄 변경으로 시각적 차이가 가장 큽니다. 먼저 적용 권장.**
