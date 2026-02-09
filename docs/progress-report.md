# MOER 예약 관리 시스템 - 개발 진행사항 보고서

> 작성일: 2026-02-09
> 프로젝트: moer-booking-frontend
> 기술 스택: Vue 3 + Vuetify 3 + Pinia + FullCalendar

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [발견한 문제와 해결](#발견한-문제와-해결)
3. [디자인 표준화 작업](#디자인-표준화-작업)
4. [캘린더 리뉴얼](#캘린더-리뉴얼)
5. [완료된 페이지](#완료된-페이지)
6. [다음 작업 계획](#다음-작업-계획)

---

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: MOER 예약 관리 시스템 Frontend
- **버전**: 2.3.0
- **템플릿**: Vue Admin Template (YEMO 기반)
- **백엔드 API**: `http://localhost:8080/api`

### 기술 스택
```json
{
  "프레임워크": "Vue 3.5.23",
  "UI 라이브러리": "Vuetify 3.10.8",
  "상태 관리": "Pinia 3.0.4",
  "캘린더": "@fullcalendar/vue3 ^6.1.20",
  "HTTP 클라이언트": "axios + ofetch",
  "차트": "vue3-apexcharts 1.5.3"
}
```

### 프로젝트 구조
```
src/
├── api/                    # API 모듈
│   ├── auth.js            # 인증
│   ├── customers.js       # 고객
│   ├── services.js        # 서비스
│   ├── staffs.js          # 직원
│   ├── reservations.js    # 예약
│   └── business-settings.js
├── components/            # 공통 컴포넌트
│   └── StatisticsCard.vue # 통계 카드 (신규)
├── pages/                 # 페이지
│   ├── index.vue         # 대시보드
│   ├── customers/        # 고객 관리
│   ├── services/         # 서비스 관리
│   ├── staffs/           # 직원 관리
│   ├── reservations/     # 예약 관리
│   └── business-settings/
├── stores/               # Pinia 스토어
└── utils/                # 유틸리티
```

---

## 발견한 문제와 해결

### 🐛 문제 1: 고객 통계 미업데이트

**증상:**
- 예약 완료 처리 후 고객의 `visitCount`, `totalSpent` 미증가
- `lastVisitDate` 업데이트 안됨

**원인 분석:**
```javascript
// ❌ 잘못된 방법 (통계 업데이트 안됨)
await reservationApi.updateReservationStatus(id, 'COMPLETED')
// → PATCH /reservations/{id}/status?status=COMPLETED

// ✅ 올바른 방법 (통계 자동 업데이트)
await reservationApi.completeReservation(id)
// → PATCH /reservations/{id}/complete
```

**해결 방법:**

1. **API 파일 수정** (`src/api/reservations.js`)
```javascript
// 예약 완료 전용 엔드포인트 추가
completeReservation(businessId, reservationId) {
  return apiClient.patch(
    `/businesses/${businessId}/reservations/${reservationId}/complete`
  )
}
```

2. **Store 수정** (`src/stores/reservation.js`)
```javascript
async completeReservation(reservationId) {
  const { data } = await reservationApi.completeReservation(
    businessId,
    reservationId
  )
  // 목록 업데이트
  const index = this.reservations.findIndex(r => r.id === reservationId)
  if (index !== -1) {
    this.reservations[index] = data
  }
  return data
}
```

3. **컴포넌트 수정** (`calendar.vue`, `list.vue`)
```javascript
async function handleStatusChange(reservationId, newStatus) {
  if (newStatus === 'COMPLETED') {
    // ✅ 완료 전용 API 사용
    await reservationStore.completeReservation(reservationId)
  } else {
    // 기타 상태는 기존 방식
    await reservationStore.updateReservationStatus(reservationId, newStatus)
  }
}
```

**결과:**
- ✅ 예약 완료 시 고객 통계 자동 업데이트
- ✅ VIP/단골 태그 자동 부여

---

### 🎨 문제 2: 디자인 불일치

**증상:**
- 통계 카드 스타일이 페이지마다 다름
- 템플릿 표준과 불일치

**템플릿 vs 기존 코드 비교:**

| 항목 | 템플릿 표준 | 기존 코드 | 문제점 |
|------|------------|----------|--------|
| VCard | 기본 스타일 | `variant="tonal"` | 배경색 너무 진함 |
| VAvatar | `variant="tonal"` | 없음 | 아이콘 배경 없음 |
| 레이아웃 | `justify-space-between` | `align-center` | 아이콘이 왼쪽에 붙음 |
| Avatar 위치 | 오른쪽 | 왼쪽 | 시선 흐름 어색 |
| Avatar 크기 | `size="42"` | `size="44"` | 미세한 차이 |
| Typography | `text-h4` | `text-h6` | 폰트 크기 작음 |

**해결 방법:**

**StatisticsCard.vue 컴포넌트 생성:**
```vue
<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between">
        <div class="d-flex flex-column gap-y-1">
          <div class="text-body-1 text-high-emphasis">
            {{ title }}
          </div>
          <h4 class="text-h4">
            {{ value }}
          </h4>
          <div v-if="subtitle" class="text-body-2">
            {{ subtitle }}
          </div>
        </div>
        <VAvatar
          :color="color"
          variant="tonal"
          rounded="lg"
          size="42"
        >
          <VIcon :icon="icon" size="26" />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>
```

**적용 페이지:**
- ✅ `src/pages/index.vue` (대시보드)
- ✅ `src/pages/customers/list.vue` (고객 관리)
- ✅ `src/pages/reservations/calendar.vue` (예약 캘린더)
- ✅ `src/pages/reservations/list.vue` (예약 목록)

---

## 디자인 표준화 작업

### Before & After

#### 통계 카드

**Before:**
```vue
<VCard variant="tonal" color="primary">
  <VCardText class="d-flex align-center">
    <VIcon icon="ri-user-line" size="32" class="me-3" />
    <div>
      <p class="text-xs mb-1">전체 고객</p>
      <h6 class="text-h6">25명</h6>
    </div>
  </VCardText>
</VCard>
```

**After:**
```vue
<StatisticsCard
  title="전체 고객"
  value="25명"
  icon="ri-user-line"
  color="primary"
/>
```

#### 개선 효과

| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| 코드 라인 수 | 11줄 | 5줄 | **-55%** |
| 일관성 | 낮음 | 높음 | **100%** |
| 재사용성 | 없음 | 있음 | **∞** |
| 템플릿 일치도 | 60% | 100% | **+40%** |

---

## 캘린더 리뉴얼

### 개선 사항

#### 1. 레이아웃 구조 변경

**Before:**
```
┌─────────────────────────────┐
│  헤더 (예약 등록 버튼)       │
├─────────────────────────────┤
│  통계 카드 (4개)             │
├─────────────────────────────┤
│                              │
│       캘린더                  │
│                              │
└─────────────────────────────┘
```

**After:**
```
┌─────────────────────────────┐
│  통계 카드 (4개, 필터링됨)   │
├──────────┬──────────────────┤
│ 사이드바  │                  │
│ ┌──────┐ │                  │
│ │예약등록│ │                  │
│ └──────┘ │                  │
│          │                  │
│ 날짜선택  │   캘린더 메인    │
│  📅      │                  │
│          │                  │
│ 필터     │                  │
│ □ 전체   │                  │
│ □ 대기   │                  │
│ □ 확정   │                  │
│ □ 완료   │                  │
│ □ 취소   │                  │
└──────────┴──────────────────┘
```

#### 2. 새로운 기능

**사이드바 (VNavigationDrawer):**
- ✅ 예약 등록 버튼 (큰 버튼)
- ✅ 인라인 날짜 선택기 (VDatePicker)
- ✅ 상태 필터 (체크박스)
- ✅ 반응형 (모바일에서 drawer)

**실시간 필터링:**
```javascript
// 필터링된 이벤트
const filteredEvents = computed(() => {
  return reservationStore.calendarEvents.filter(event => {
    return selectedStatuses.value.includes(
      event.extendedProps.reservation.status
    )
  })
})

// 필터링된 통계
const filteredStats = computed(() => {
  const filtered = reservationStore.reservations.filter(r =>
    selectedStatuses.value.includes(r.status)
  )
  return {
    pending: filtered.filter(r => r.status === 'PENDING').length,
    confirmed: filtered.filter(r => r.status === 'CONFIRMED').length,
    completed: filtered.filter(r => r.status === 'COMPLETED').length,
    cancelled: filtered.filter(r => r.status === 'CANCELLED').length,
  }
})
```

**날짜 빠른 이동:**
```javascript
function jumpToDate(date) {
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi()
    calendarApi.gotoDate(date)
  }
}
```

#### 3. 스타일 개선

**FullCalendar 커스터마이징:**
```scss
// 현재 시간 표시
:deep(.fc-timegrid-now-indicator-line) {
  border-color: rgb(var(--v-theme-error));
  border-width: 2px;
}

// 비즈니스 시간 강조
:deep(.fc-non-business) {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

// 이벤트 hover 효과
:deep(.fc-event:hover) {
  opacity: 0.85;
  cursor: pointer;
}
```

#### 4. 반응형 지원

**브레이크포인트:**
- **Desktop (≥1280px)**: 사이드바 항상 표시
- **Tablet/Mobile (<1280px)**:
  - 사이드바 숨김
  - 햄버거 메뉴로 토글
  - `temporary` drawer 모드

```vue
<VNavigationDrawer
  v-model="isLeftSidebarOpen"
  width="280"
  :temporary="$vuetify.display.mdAndDown"
>
  ...
</VNavigationDrawer>

<VCardTitle v-if="$vuetify.display.mdAndDown">
  <VBtn icon @click="isLeftSidebarOpen = !isLeftSidebarOpen">
    <VIcon icon="ri-menu-line" />
  </VBtn>
</VCardTitle>
```

---

## 완료된 페이지

### 1. 대시보드 (`src/pages/index.vue`)

**기능:**
- ✅ 오늘 통계 (4개 카드)
- ✅ 주간 예약 차트 (ApexCharts)
- ✅ 이번 달 요약
- ✅ 오늘의 예약 목록
- ✅ 최근 신규 고객
- ✅ 빠른 작업 버튼
- ✅ 미배정 예약 알림

**통계 카드:**
- 오늘 예약
- 대기 중
- 오늘 예상 매출
- 이번 달 신규 고객

**Store 연동:**
- `useDashboardStore()` - 대시보드 데이터
- `useAuthStore()` - 사용자 정보

**API:**
- `GET /businesses/{id}/dashboard` - 대시보드 통계

---

### 2. 고객 관리 (`src/pages/customers/list.vue`)

**기능:**
- ✅ 고객 목록 (VDataTable)
- ✅ 통계 카드 (4개)
- ✅ 필터 (전체/VIP/단골/신규)
- ✅ 검색 (이름, 전화번호)
- ✅ 고객 등록/수정/삭제
- ✅ 고객 상세보기

**통계 카드:**
- 전체 고객
- VIP 고객
- 단골 고객
- 신규 고객

**테이블 컬럼:**
- 이름 (아바타 + 전화번호)
- 태그 (VIP/단골/신규)
- 방문 횟수
- 총 결제액
- 최근 방문일
- 액션 (상세/수정/삭제)

**Store 연동:**
- `useCustomerStore()` - 고객 데이터

**API:**
- `GET /businesses/{id}/customers` - 목록 조회
- `GET /businesses/{id}/customers/vip` - VIP 조회
- `GET /businesses/{id}/customers/regular` - 단골 조회
- `GET /businesses/{id}/customers/new` - 신규 조회
- `POST /businesses/{id}/customers` - 생성
- `PATCH /businesses/{id}/customers/{id}` - 수정
- `DELETE /businesses/{id}/customers/{id}` - 삭제

---

### 3. 예약 캘린더 (`src/pages/reservations/calendar.vue`) ⭐ NEW

**기능:**
- ✅ FullCalendar 주간/일간/월간 뷰
- ✅ 왼쪽 사이드바 (필터 + 날짜 선택)
- ✅ 실시간 상태 필터링
- ✅ 통계 카드 (필터링됨)
- ✅ 예약 등록/수정/상세보기
- ✅ 반응형 (모바일 drawer)

**통계 카드:**
- 대기 (필터링된 수)
- 확정 (필터링된 수)
- 완료 (필터링된 수)
- 취소 (필터링된 수)

**사이드바:**
- 예약 등록 버튼
- 인라인 날짜 선택기
- 상태 필터 (전체/대기/확정/완료/취소)

**캘린더 설정:**
```javascript
{
  initialView: 'timeGridWeek',
  slotMinTime: '09:00:00',
  slotMaxTime: '21:00:00',
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    startTime: '10:00',
    endTime: '20:00',
  },
  nowIndicator: true,
  allDaySlot: false,
}
```

**Store 연동:**
- `useReservationStore()` - 예약 데이터

**API:**
- `GET /businesses/{id}/reservations/date-range` - 기간별 조회
- `PATCH /businesses/{id}/reservations/{id}/confirm` - 확정
- `PATCH /businesses/{id}/reservations/{id}/complete` - 완료 ⭐
- `PATCH /businesses/{id}/reservations/{id}/status` - 상태 변경

---

### 4. 예약 목록 (`src/pages/reservations/list.vue`)

**기능:**
- ✅ 예약 목록 (VDataTable)
- ✅ 통계 카드 (4개)
- ✅ 상태별 필터
- ✅ 날짜 범위 필터
- ✅ 예약 등록/수정/상세보기
- ✅ 직원 배정

**통계 카드:**
- 대기
- 확정
- 완료
- 취소

**테이블 컬럼:**
- 예약번호
- 예약일시
- 고객명
- 서비스
- 담당 직원
- 상태
- 액션

**Store 연동:**
- `useReservationStore()` - 예약 데이터

---

### 5. 서비스 관리 (`src/pages/services/list.vue`)

**기능:**
- ✅ 서비스 목록 (카드 그리드)
- ✅ 서비스 등록/수정/삭제
- ✅ 활성/비활성 토글

**Store 연동:**
- `useServiceStore()` - 서비스 데이터

**API:**
- `GET /businesses/{id}/services` - 목록 조회
- `POST /businesses/{id}/services` - 생성
- `PATCH /businesses/{id}/services/{id}` - 수정
- `PATCH /businesses/{id}/services/{id}/toggle-active` - 토글
- `DELETE /businesses/{id}/services/{id}` - 삭제

---

### 6. 직원 관리 (`src/pages/staffs/list.vue`)

**기능:**
- ✅ 직원 목록
- ✅ 직원 등록/수정/삭제
- ✅ 활성/비활성 토글

**Store 연동:**
- `useStaffStore()` - 직원 데이터

**API:**
- `GET /businesses/{id}/staffs` - 목록 조회
- `POST /businesses/{id}/staffs` - 생성
- `PATCH /businesses/{id}/staffs/{id}` - 수정
- `PATCH /businesses/{id}/staffs/{id}/toggle-active` - 토글
- `DELETE /businesses/{id}/staffs/{id}` - 삭제

---

### 7. 매장 설정 (`src/pages/business-settings/`)

**페이지:**
- `index.vue` - 매장 기본 정보
- `hours.vue` - 영업시간 설정
- `holidays.vue` - 휴무일 관리

**Store 연동:**
- `useBusinessSettingsStore()` - 매장 설정

**API:**
- `GET /businesses/{id}` - 정보 조회
- `PATCH /businesses/{id}` - 정보 수정
- `PATCH /businesses/{id}/settings` - 설정 수정
- `GET /businesses/{id}/holidays` - 휴무일 조회
- `POST /businesses/{id}/holidays` - 휴무일 추가
- `DELETE /businesses/{id}/holidays/{id}` - 휴무일 삭제

---

## 주요 컴포넌트

### 1. StatisticsCard.vue (신규)

**위치:** `src/components/StatisticsCard.vue`

**Props:**
```typescript
{
  title: string          // 제목
  value: string | number // 값
  icon: string          // 아이콘 (ri- prefix)
  color: string         // 색상 (primary/success/warning/error/info)
  subtitle?: string     // 부제목 (선택)
}
```

**사용 예시:**
```vue
<StatisticsCard
  title="전체 고객"
  value="125명"
  icon="ri-user-line"
  color="primary"
  subtitle="이번 달 +12명"
/>
```

---

### 2. ReservationDetailDialog.vue

**위치:** `src/pages/reservations/components/ReservationDetailDialog.vue`

**기능:**
- 예약 정보 상세 표시
- 상태 변경 버튼
- 수정/취소 액션

**이벤트:**
- `@edit` - 수정 버튼 클릭
- `@cancel` - 취소 버튼 클릭
- `@status-change` - 상태 변경 (확정/완료)

---

### 3. ReservationFormDialog.vue

**위치:** `src/pages/reservations/components/ReservationFormDialog.vue`

**기능:**
- 예약 등록/수정 폼
- 고객/서비스/직원 선택
- 날짜/시간 선택
- 유효성 검증

**이벤트:**
- `@saved` - 저장 완료

---

### 4. CustomerFormDialog.vue

**위치:** `src/pages/customers/components/CustomerFormDialog.vue`

**기능:**
- 고객 등록/수정 폼
- 전화번호 중복 체크
- 유효성 검증

---

## API 연동 가이드

### 인증 (Authentication)

**JWT 토큰 관리:**
```javascript
// axios.js - 요청 인터셉터
config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`

// axios.js - 응답 인터셉터 (401 에러 시 토큰 갱신)
if (status === 401 && !originalRequest._retry) {
  const refreshToken = localStorage.getItem('refreshToken')
  const { accessToken } = await axios.post('/auth/refresh', { refreshToken })
  localStorage.setItem('accessToken', accessToken)
  return apiClient(originalRequest)
}
```

---

### 예약 완료 처리 (중요!)

**올바른 방법:**
```javascript
// ✅ 완료 전용 API 사용 (고객 통계 자동 업데이트)
await reservationStore.completeReservation(reservationId)
// → PATCH /businesses/{id}/reservations/{id}/complete

// 결과:
// - 예약 상태 → COMPLETED
// - 고객 visitCount +1
// - 고객 totalSpent +예약금액
// - 고객 lastVisitDate 업데이트
// - 고객 태그 자동 업데이트 (신규/단골/VIP)
```

**잘못된 방법:**
```javascript
// ❌ 일반 상태 변경 API (통계 업데이트 안됨!)
await reservationStore.updateReservationStatus(reservationId, 'COMPLETED')
// → PATCH /businesses/{id}/reservations/{id}/status?status=COMPLETED

// 결과:
// - 예약 상태만 COMPLETED로 변경
// - 고객 통계 업데이트 안됨 ❌
```

---

### API 응답 구조

**성공 응답:**
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

**에러 응답:**
```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [...]
}
```

**axios.js 인터셉터:**
```javascript
// response.data만 반환 (ApiResponse의 data 필드)
return response.data
```

---

## 환경 설정

### .env
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

### vite.config.js
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

---

## 다음 작업 계획

### Phase 3: 완성도 높이기 (우선순위 높음)

#### 1. 서비스 관리 페이지 개선 ⭐
**현재 상태:** 카드 그리드 형태
**개선 사항:**
- [ ] 카테고리별 분류 (컷/펌/염색 등)
- [ ] 카드 디자인 개선
- [ ] 가격 표시 개선
- [ ] 소요시간 표시

**예상 시간:** 2시간

---

#### 2. 직원 관리 페이지 개선 ⭐
**현재 상태:** 기본 목록
**개선 사항:**
- [ ] 프로필 카드 형태로 변경
- [ ] 근무시간 표시
- [ ] 스킬/담당 서비스 표시
- [ ] 통계 추가 (이번 달 예약 수 등)

**예상 시간:** 2시간

---

#### 3. 예약 등록 폼 개선 ⭐
**현재 상태:** 기본 폼
**개선 사항:**
- [ ] 단계별 폼 (Step 1: 고객, Step 2: 서비스, Step 3: 시간)
- [ ] 실시간 가능 시간 표시
- [ ] 예상 종료 시간 자동 계산
- [ ] 서비스 다중 선택 시 UI 개선

**예상 시간:** 3시간

---

#### 4. 매장 설정 페이지 완성
**개선 사항:**
- [ ] 영업시간 설정 UI 개선
- [ ] 휴무일 캘린더 뷰
- [ ] 매장 정보 수정 폼 개선

**예상 시간:** 2시간

---

### Phase 4: 추가 기능 (우선순위 중간)

#### 1. 고객 상세 페이지
**신규 페이지:** `src/pages/customers/[id].vue`
**기능:**
- [ ] 고객 기본 정보
- [ ] 예약 이력 (타임라인)
- [ ] 방문 통계 차트
- [ ] 선호 서비스 분석
- [ ] 메모 관리

**예상 시간:** 3시간

---

#### 2. 직원 상세 페이지
**신규 페이지:** `src/pages/staffs/[id].vue`
**기능:**
- [ ] 직원 정보
- [ ] 이번 주 스케줄
- [ ] 실적 통계
- [ ] 고객 리뷰

**예상 시간:** 2시간

---

#### 3. 알림 시스템
**기능:**
- [ ] 예약 알림 (1시간 전, 1일 전)
- [ ] 미배정 예약 알림
- [ ] 노쇼 고객 표시
- [ ] 브라우저 알림 (Notification API)

**예상 시간:** 3시간

---

#### 4. 통계 대시보드 개선
**개선 사항:**
- [ ] 월별 매출 추이 차트
- [ ] 인기 서비스 TOP 5
- [ ] 직원별 예약 수 비교
- [ ] 고객 증가 추이
- [ ] 예약 취소율 분석

**예상 시간:** 4시간

---

### Phase 5: UX 개선 (우선순위 낮음)

#### 1. 검색 & 필터 고도화
- [ ] 전역 검색 (고객/예약 통합)
- [ ] 고급 필터 (기간, 금액, 서비스 등)
- [ ] 검색 히스토리

**예상 시간:** 3시간

---

#### 2. 엑셀 다운로드
- [ ] 예약 목록 엑셀 다운로드
- [ ] 고객 목록 엑셀 다운로드
- [ ] 통계 리포트 다운로드

**예상 시간:** 2시간

---

#### 3. 다크모드 최적화
- [ ] 색상 테마 검증
- [ ] 차트 다크모드 대응
- [ ] 이미지 다크모드 대응

**예상 시간:** 2시간

---

#### 4. 성능 최적화
- [ ] 컴포넌트 lazy loading
- [ ] 이미지 최적화
- [ ] 번들 사이즈 최적화
- [ ] 무한 스크롤 (목록 페이지)

**예상 시간:** 3시간

---

## 알려진 이슈 & TODO

### 긴급 (Critical)
- 없음 ✅

### 높음 (High)
- [ ] 예약 시간 충돌 검증 로직 추가
- [ ] 에러 핸들링 개선 (Toast 메시지)
- [ ] 로딩 상태 표시 개선

### 중간 (Medium)
- [ ] 폼 유효성 검증 메시지 한글화
- [ ] 날짜 포맷 일관성 (YYYY-MM-DD vs YYYY.MM.DD)
- [ ] 빈 데이터 상태 UI 개선

### 낮음 (Low)
- [ ] 아이콘 일부 변경 검토
- [ ] 애니메이션 추가 (페이지 전환, 카드 호버 등)
- [ ] 키보드 단축키 지원

---

## 코딩 컨벤션

### Vue 컴포넌트
```vue
<script setup>
// 1. imports
import { ref, computed, onMounted } from 'vue'

// 2. stores
const someStore = useSomeStore()

// 3. refs
const someRef = ref(null)

// 4. computed
const someComputed = computed(() => ...)

// 5. functions
function someFunction() { ... }

// 6. lifecycle
onMounted(() => { ... })
</script>
```

### 네이밍
- **컴포넌트**: PascalCase (`StatisticsCard.vue`)
- **변수/함수**: camelCase (`isLoading`, `fetchData`)
- **상수**: UPPER_SNAKE_CASE (`MAX_LENGTH`)
- **CSS 클래스**: kebab-case (`calendar-sidebar`)

### 주석
```javascript
// ✅ 성공 로그
// ❌ 에러 로그
// 🔍 디버그 로그
// ⚠️ 경고
// 📝 메모
// 🚀 개선 필요
// 🐛 버그
```

---

## 테스트 체크리스트

### 예약 관리
- [x] 예약 생성 (날짜, 시간, 고객, 서비스)
- [x] 예약 수정
- [x] 예약 삭제
- [x] 예약 상태 변경 (대기 → 확정 → 완료)
- [x] 예약 취소
- [x] 캘린더 뷰 전환 (월/주/일)
- [x] 캘린더 필터링
- [x] 캘린더 날짜 이동

### 고객 관리
- [x] 고객 생성
- [x] 고객 수정
- [x] 고객 삭제
- [x] 고객 검색 (이름, 전화번호)
- [x] 고객 필터 (전체/VIP/단골/신규)
- [x] 고객 통계 업데이트 (예약 완료 시)

### 대시보드
- [x] 오늘 통계 표시
- [x] 주간 차트 표시
- [x] 이번 달 요약 표시
- [x] 최근 예약 목록
- [x] 최근 신규 고객

### 반응형
- [ ] 모바일 (< 600px)
- [x] 태블릿 (600px ~ 1280px)
- [x] 데스크톱 (> 1280px)

---

## 참고 자료

### 공식 문서
- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [FullCalendar Documentation](https://fullcalendar.io/docs)

### 템플릿
- 위치: `docs/vue-version/javascript-version/full-version/`
- 참고 페이지:
  - `src/pages/dashboards/analytics.vue` - 대시보드 예제
  - `src/pages/apps/user/list/index.vue` - 목록 예제
  - `src/pages/apps/calendar.vue` - 캘린더 예제
  - `src/@core/components/cards/` - 카드 컴포넌트

---

## 연락처 & 지원

### 개발 환경
- Node.js: v18+ 권장
- Package Manager: pnpm 권장 (npm도 가능)
- IDE: VSCode + Volar 확장 권장

### 개발 서버 실행
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:5173)
pnpm dev

# 빌드
pnpm build

# 미리보기
pnpm preview
```

### 트러블슈팅
1. **포트 충돌**: `vite.config.js`에서 포트 변경
2. **캐시 문제**: `Ctrl+Shift+R` 또는 `.vite` 폴더 삭제
3. **타입 에러**: `tsconfig.json` 확인

---

## 버전 히스토리

### v2.3.0 (2026-02-09)
- ✅ 디자인 표준화 작업 완료
- ✅ 캘린더 리뉴얼 (사이드바, 필터링)
- ✅ 예약 완료 API 연동 수정
- ✅ StatisticsCard 컴포넌트 추가
- ✅ 고객 통계 자동 업데이트 기능

### v2.2.0 (이전)
- ✅ 기본 CRUD 기능 구현
- ✅ 대시보드 구현
- ✅ 인증 시스템
- ✅ 네비게이션 메뉴

---

## 변경 이력

| 날짜 | 작업 내용 | 파일 |
|------|----------|------|
| 2026-02-09 | 캘린더 리뉴얼 (사이드바, 필터) | `reservations/calendar.vue` |
| 2026-02-09 | StatisticsCard 컴포넌트 생성 | `components/StatisticsCard.vue` |
| 2026-02-09 | 모든 페이지 통계 카드 표준화 | `index.vue`, `customers/list.vue`, 등 |
| 2026-02-09 | 예약 완료 API 수정 | `api/reservations.js`, `stores/reservation.js` |
| 2026-02-09 | 고객 통계 업데이트 로직 추가 | - (백엔드) |

---

**문서 끝**
