# 고객(Booking) UI/UX 평가

> 평가일: 2026-02-17
> 대상: `/booking/` 경로 하위 고객 페이지 전체

---

## 1. 평가 페르소나

| 페르소나 | 나이 | 특성 | 핵심 기대 |
|---------|------|------|----------|
| 송지은 | 32세 | 직장인, 모바일 위주 | 깔끔한 UI, 빠른 예약, 모바일 최적화 |
| 최영희 | 55세 | 주부, IT 활용 약함 | 단순 화면, 명확한 안내, 혼란 없는 플로우 |
| 김태호 | 25세 | 대학생, 디자인 민감 | 세련된 디자인, 빠른 로딩, SNS 연동 |

---

## 2. 즉시 수정 필요 - 버그 수준 문제 (3건)

### BUG-1: 리뷰 작성 시 예약번호 수동 입력 강제
- **위치**: `my-reservations.vue` → `review.vue`
- **문제**: 리뷰 버튼 클릭 시 예약번호가 URL 파라미터로 전달되지 않음
- **영향**: 사용자가 예약번호를 외워서 직접 입력해야 함 (UX 치명적)
- **수정**: 리뷰 버튼에 `reservationId` query param 추가

### BUG-2: 비회원 예약 전화번호 포맷팅 누락
- **위치**: `reserve.vue`
- **문제**: `profile.vue`에는 `010-XXXX-XXXX` 포맷팅 구현, `reserve.vue`에는 미적용
- **영향**: 전화번호 유효성 검증 불일치 가능
- **수정**: 동일한 포맷팅 로직 적용

### BUG-3: 프로필 수정 링크 `target="_blank"`
- **위치**: 예약 플로우 내 프로필 수정 링크
- **문제**: 새 탭이 열려 현재까지 선택한 예약 내용이 사라질 위험
- **영향**: 사용자가 예약을 처음부터 다시 해야 할 수 있음
- **수정**: `target="_blank"` 제거, 인라인 수정 또는 모달로 변경

---

## 3. 레이아웃 일관성 문제 (사용자 지적사항)

> "지원 메뉴는 레이아웃도 다른것과 맞지 않음 width가 full로 됨"

### 원인 분석

각 페이지마다 **max-width 설정 방식이 제각각**:

| 페이지 | max-width 방식 | 결과 |
|--------|---------------|------|
| `[slug].vue` | **없음** | 전체 너비 (문제) |
| `index.vue` | **없음** | 전체 너비 (문제) |
| `my-reservations.vue` | inline style | 제한됨 |
| `profile.vue` | inline style | 제한됨 |
| `reserve.vue` | CSS 클래스 | 제한됨 |
| `review.vue` | 그리드 col | 제한됨 |
| `reservation.vue` | 그리드 col | 제한됨 |

### 해결 방안
- **레이아웃 레벨**에서 `max-width` 통일 (개별 페이지가 아닌 공통 레이아웃에서 처리)
- booking 전용 레이아웃 컴포넌트에 `max-width: 960px` + `margin: 0 auto` 적용
- 슬러그 페이지의 히어로/커버 영역만 full-width 허용

---

## 4. UI 심미성 문제

> "UI가 너무 단순하게 되어있음"

### 현재 문제점

| 항목 | 현재 상태 | 개선 방향 |
|------|----------|----------|
| 업체 페이지 상단 | 텍스트만 존재 | 커버 이미지/배너 영역 추가 |
| 서비스 선택 | 단순 리스트 | 카드형 + 이미지 + 가격 태그 |
| 예약 스텝 표시 | 커스텀 Avatar + Divider (~80줄) | `VStepper` 컴포넌트로 교체 |
| 달력 | 커스텀 CSS Grid (~150줄) | `VDatePicker` 컴포넌트로 교체 |
| 포트폴리오 이미지 | 커스텀 버튼 내비 (~40줄) | `VCarousel` 컴포넌트로 교체 |
| 모바일 하단 메뉴 | **없음** | `VBottomNavigation` 추가 |
| FAB 버튼 | 아이콘만, 텍스트 없음 | "예약하기" 텍스트 추가 |

### Materio 컴포넌트 교체로 절감 가능한 코드량

| 현재 구현 | 대체 컴포넌트 | 절감 코드량 |
|----------|-------------|-----------|
| 커스텀 스텝 UI | `VStepper` | ~80줄 |
| 커스텀 CSS Grid 달력 | `VDatePicker` | ~150줄 |
| 커스텀 이미지 뷰어 | `VCarousel` | ~40줄 |
| **합계** | | **~270줄 절감** |

---

## 5. 예약 플로우 UX 평가

### 현재 플로우 (5단계)
```
서비스 선택 → 스태프 선택 → 날짜 선택 → 시간 선택 → 정보 입력/확인
```

### 문제점
- 5단계가 페르소나 B(55세 주부)에게 부담
- 각 단계 간 **뒤로가기** 시 이전 선택 유지 여부 불명확
- 완료 화면에서 **예약 요약 정보** 부족
- 달력 터치 영역이 모바일에서 작음
- 예약 완료 후 **캘린더 저장 옵션** 없음

### 개선 제안
- 서비스+스태프 선택을 1단계로 통합 가능 검토
- `VStepper`로 교체하여 진행 상태 명확히 표시
- 완료 화면에 날짜/시간/서비스/담당자 요약 카드 추가
- 모바일 달력 터치 영역 확대

---

## 6. 페르소나별 점수

| 페르소나 | 점수 | 핵심 불만 |
|---------|------|----------|
| 송지은 (32, 직장인) | 72/100 | 달력 터치 영역 작음, 완료 후 캘린더 저장 없음 |
| 최영희 (55, 주부) | 55/100 | FAB 아이콘만 있어 기능 불명확, 예약번호 수동 입력, 5단계 플로우 부담 |
| 김태호 (25, 대학생) | 63/100 | 커버 이미지 없음, 포트폴리오 스와이프 없음, 전체적으로 단순 |

---

## 7. 우선순위별 개선 로드맵

### 즉시 (버그 수정)
| # | 작업 | 난이도 |
|---|------|--------|
| 1 | 리뷰 URL에 예약번호 파라미터 전달 | 낮음 |
| 2 | `reserve.vue` 전화번호 포맷팅 적용 | 낮음 |
| 3 | `target="_blank"` 제거 | 낮음 |

### 1-2주 내 (중요 개선)
| # | 작업 | 난이도 |
|---|------|--------|
| 4 | booking 레이아웃 max-width 통일 | 낮음 |
| 5 | 모바일 FAB에 "예약하기" 텍스트 추가 | 낮음 |
| 6 | `VStepper` 도입 (reserve.vue) | 중간 |
| 7 | `VDatePicker` 도입 (달력 교체) | 중간 |
| 8 | `VCarousel` 도입 (포트폴리오 뷰어) | 중간 |
| 9 | 업체 페이지 커버 이미지 영역 추가 | 중간 |

### 1개월 내 (장기 개선)
| # | 작업 | 난이도 |
|---|------|--------|
| 10 | `VBottomNavigation` 모바일 하단 탭 바 | 중간 |
| 11 | 예약 완료 화면 정보 요약 카드 추가 | 낮음 |
| 12 | 예약 플로우 단계 통합 검토 (5단계→3~4단계) | 높음 |

---

## 8. 구체적 코드 수정 가이드

### BUG-1 수정: 리뷰 예약번호 파라미터 전달

**`my-reservations.vue`** - 리뷰 버튼 함수:
```javascript
// Before
function goToReview(reservation) {
  router.push(`/booking/${reservation.businessSlug}/review`)
}

// After
function goToReview(reservation) {
  router.push(`/booking/${reservation.businessSlug}/review?reservationNumber=${reservation.reservationNumber}`)
}
```

**`[slug]/review.vue`** - onMounted에 자동 채우기 추가:
```javascript
onMounted(async () => {
  // URL 파라미터에서 예약번호 자동 채우기
  if (route.query.reservationNumber) {
    reservationNumber.value = route.query.reservationNumber
  }
})
```

### BUG-2 수정: reserve.vue 전화번호 포맷팅

`profile.vue`의 `handlePhoneInput` + `formatPhoneInput` 함수를 `reserve.vue` Step 4 비회원 폼에도 동일 적용.

### BUG-3 수정: target="_blank" 제거

**`reserve.vue`**:
```vue
<!-- Before -->
<VBtn :href="`/booking/profile`" target="_blank">프로필 수정</VBtn>

<!-- After -->
<VBtn @click="router.push('/booking/profile')">프로필 수정</VBtn>
```

---

## 9. Materio 컴포넌트 교체 코드 예시

### VStepper 도입 (reserve.vue)

```vue
<VStepper v-model="step" alt-labels :items="stepperItems" class="mb-6">
  <template #item.1>
    <!-- Step 1: 서비스 선택 -->
  </template>
  <template #item.2>
    <!-- Step 2: 날짜 선택 -->
  </template>
  <!-- ... -->
</VStepper>
```

### VDatePicker 도입

```vue
<VDatePicker
  v-model="selectedDateModel"
  :allowed-dates="date => availableDates.includes(date)"
  :min="today"
  color="primary"
  width="100%"
/>
```
> 현재 ~150줄의 커스텀 달력 코드를 5줄로 대체

### VCarousel 도입 (포트폴리오)

```vue
<VDialog v-model="portfolioViewDialog" max-width="900">
  <VCarousel
    v-model="portfolioViewIndex"
    :show-arrows="portfolioImages.length > 1"
    hide-delimiters
    height="80vh"
  >
    <VCarouselItem
      v-for="(item, index) in portfolioImages"
      :key="index"
      :src="item.imageUrl || item.url"
      cover
    />
  </VCarousel>
</VDialog>
```

### Extended FAB (모바일 예약 버튼)

```vue
<VBtn
  class="d-md-none mobile-fab-extended"
  color="primary"
  size="large"
  prepend-icon="ri-calendar-check-line"
  rounded="xl"
  elevation="8"
  @click="goToReserve"
>
  예약하기
</VBtn>
```

### VBottomNavigation (모바일 하단 탭)

```vue
<VBottomNavigation v-if="isMobile && isBookingPage" grow color="primary">
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

## 10. 코드 품질 총평

### 잘된 점
- 모든 파일 `<script setup>` Composition API 사용 (최신 Vue 3 패턴)
- `useSnackbar` composable로 알림 일관성 유지
- `onMounted` auth guard 패턴 일관적
- 에러 코드별 메시지 매핑 (사용자 친화적 오류 처리)
- `VSkeletonLoader` 적극 활용 (지각 성능 개선)
- `onUnmounted`에서 예약 상태 초기화 처리

### 개선 필요
- `max-width` 설정 방식 불일치 (CSS 클래스 vs inline style vs 그리드 col)
- 전화번호 포맷팅 함수가 `profile.vue`에만 존재
- 리뷰 작성 시 예약번호 URL 파라미터 전달 누락
- Vuetify 네이티브 컴포넌트(`VDatePicker`, `VStepper`, `VCarousel`) 미활용
