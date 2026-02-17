# 관리자 UI/UX 페르소나 평가

> 평가일: 2026-02-17
> 대상: Vue 3 + Vuetify (Materio) 기반 예약 시스템 관리자 영역

---

## 1. 평가 페르소나

| 페르소나 | 나이 | 역할 | IT 활용 | 핵심 목표 |
|---------|------|------|---------|----------|
| 김미영 | 35세 | 소규모 네일샵 원장 | 중하 | 예약·고객 관리 효율화 |
| 박성민 | 28세 | 프랜차이즈 미용실 매니저 | 중상 | 매출 분석, 스태프 관리 |
| 이정수 | 45세 | 마사지샵 사장 | 하 | 간단한 예약·매출 확인 |

---

## 2. 핵심 문제 3가지

### 2-1. 메뉴 우선순위 오정렬
- "통계 분석"이 "예약 관리"보다 위(2번째)에 위치 → 가끔 보는 기능이 매일 쓰는 기능보다 앞
- heading 그룹 없이 10개 메뉴가 한 덩어리로 나열 → 가독성 저하
- "알림 이력", "서비스/스태프"가 운영 메뉴 사이에 혼재

### 2-2. 대시보드 퀵 액션 위치 문제
- 가장 자주 쓰는 "예약 등록" 버튼이 페이지 최하단 → 스크롤 필요
- 환영 메시지 카드(2줄짜리)가 전체 너비 차지 → 공간 낭비

### 2-3. 기술 용어 직접 노출
- "슬러그(Slug)" → 일반 사용자가 이해 불가
- "PENDING/CONFIRMED" 같은 상태값이 UI에 직접 노출될 위험
- 매장 설정 페이지가 탭 없이 스크롤로 연결된 3개 섹션 혼재

---

## 3. 페이지별 상세 평가

### 3-1. 대시보드 (`dashboard.vue`)

**강점:**
- 온보딩 위저드가 첫 진입 시 표시 → 초보자 진입장벽 낮춤
- `actionAlerts` 섹션이 warning 색상으로 상단 배치 → 적절한 우선순위
- 통계 카드 4개 (오늘 예약, 대기중, 예상 매출, 신규 고객) → 일목요연

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 높음 | 퀵 액션 위치 | 페이지 맨 아래에 "예약 등록" 버튼 → 매일 스크롤 필요 |
| 높음 | 예약 목록에 서비스명 없음 | 고객명+시간만 표시, 어떤 서비스/담당자인지 안 보임 |
| 중간 | 환영 카드 공간 낭비 | 전체 너비에 2줄 텍스트만 → 퀵 액션과 통합 필요 |
| 낮음 | 차트 색상 하드코딩 | `#9155FD` → 테마 변수로 교체 필요 |

**코드 개선 제안:**

```vue
<!-- 환영 카드 + 퀵 액션 통합 (상단 배치) -->
<VCard class="mb-6">
  <VCardText class="d-flex align-center justify-space-between flex-wrap gap-3">
    <div>
      <h4 class="text-h4 font-weight-medium mb-1">안녕하세요, {{ businessName }} 님!</h4>
      <p class="text-body-1 mb-0">{{ todayText }}</p>
    </div>
    <div class="d-flex gap-3 flex-wrap">
      <VBtn color="primary" size="large" prepend-icon="ri-add-line"
            :to="{ name: 'shop-admin-reservations-calendar' }">
        예약 등록
      </VBtn>
      <VBtn color="success" size="large" prepend-icon="ri-user-add-line"
            :to="{ name: 'shop-admin-customers-list' }">
        고객 등록
      </VBtn>
    </div>
  </VCardText>
</VCard>
```

```vue
<!-- 예약 목록에 서비스명/담당자 추가 -->
<VListItemTitle>{{ reservation.customerName }}</VListItemTitle>
<VListItemSubtitle>
  {{ reservation.startTime }} - {{ reservation.endTime }}
  · {{ reservation.serviceName }}
  <span v-if="reservation.staffName"> · {{ reservation.staffName }}</span>
</VListItemSubtitle>
```

---

### 3-2. 예약 목록 (`reservations/list.vue`)

**강점:**
- 상단 상태별 통계 카드 4개 → 즉각적 현황 파악
- 미배정 직원을 warning 색상 chip으로 강조

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 높음 | 날짜 필터 없음 | 특정 날짜(내일 예약만) 볼 수 없음 |
| 중간 | 헤더 과밀 | 제목+필터+검색+등록 버튼이 한 줄에 집약 |
| 중간 | 스태프/서비스 필터 없음 | "오후에 헤어컷 예약만" 필터링 불가 |
| 낮음 | 아이콘 버튼 인식 어려움 | 텍스트 없이 아이콘만 → 터치 기기에서 tooltip 미작동 |
| 낮음 | 취소 다이얼로그 이모지 중복 | VAlert warning + 이모지 동시 사용 |

**코드 개선 제안:**
```vue
<!-- 별도 필터 행 추가 -->
<VCard class="mb-4">
  <VCardText class="pb-2">
    <VRow dense>
      <VCol cols="12" sm="6" md="3">
        <VTextField v-model="dateFilter" type="date" label="예약 날짜" density="compact" clearable />
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VSelect v-model="statusFilter" :items="statusOptions" label="상태" density="compact" clearable />
      </VCol>
      <VCol cols="12" sm="6" md="3">
        <VTextField v-model="searchQuery" placeholder="고객명 검색" density="compact" clearable />
      </VCol>
    </VRow>
  </VCardText>
</VCard>
```

---

### 3-3. 고객 관리 (`customers/list.vue`)

**강점:**
- VBtnToggle으로 전체/VIP/단골/신규 전환 → 직관적 필터
- 방문 횟수 색상 차별화 (VIP=warning, 단골=success, 신규=info)
- 최근 방문일 색상 표현 (7일 이내=초록, 30일=파란)

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 중간 | 삭제 버튼 위험 배치 | 수정 버튼과 동일 크기·위치로 나란히 → 실수 클릭 위험 |
| 중간 | 전화번호 컬럼 없음 | subtitle로만 표시 → 정렬/검색 불가 |
| 낮음 | 비활성 고객 필터 없음 | 재방문 유도 대상 필터링 불가 |

---

### 3-4. 서비스 관리 (`services/list.vue`)

**강점:**
- 카드 그리드 레이아웃 + hover 애니메이션 → 시각적으로 풍부
- 카테고리 아이콘/색상 연동

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 중간 | 페이지네이션 없음 | 서비스 20개 이상 시 무한 스크롤 |
| 중간 | 활성/비활성 즉시 토글 불가 | 수정 다이얼로그 열어야 판매 중지 가능 |
| 낮음 | "카테고리 관리" 버튼 위치 | 주 CTA("서비스 등록")와 동일 위치 → 초보자 혼란 |

**코드 개선 제안:**
```vue
<!-- 카드에 활성/비활성 토글 추가 -->
<VCardActions>
  <VSwitch
    :model-value="service.isActive !== false"
    color="success"
    hide-details
    density="compact"
    @change="toggleServiceActive(service)"
  />
  <VBtn variant="text" size="small" color="primary" @click="editService(service)">수정</VBtn>
  <VSpacer />
  <VBtn icon variant="text" size="small" color="error" @click="confirmDelete(service)">
    <VIcon icon="ri-delete-bin-line" />
  </VBtn>
</VCardActions>
```

---

### 3-5. 스태프 관리 (`staffs/list.vue`)

**강점:**
- 프로필 이미지 VAvatar, 서버 사이드 검색 + debounce (300ms)
- 직급별 색상 차별화

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 중간 | 4번째 통계 카드 무의미 | "검색 결과" 수가 항상 전체 수와 동일 |
| 낮음 | 담당 서비스 목록 미표시 | 카드에 전화번호/경력만, 담당 서비스 안 보임 |
| 낮음 | 직급 관리 진입 불명확 | 헤더 버튼으로만 접근 가능 |

**코드 개선 제안:**
```vue
<!-- 4번째 카드: "비활성 스태프"로 변경 -->
<VCard variant="tonal" color="warning">
  <VCardText>
    <p class="text-xs mb-1">휴직/비활성</p>
    <h6 class="text-h6">{{ staffStore.staffs.length - activeCount }}명</h6>
  </VCardText>
</VCard>
```

---

### 3-6. 매장 설정 (`business-settings/index.vue`)

**강점:**
- 슬러그 중복 확인 debounce 실시간 검사 (500ms)
- 추천 슬러그 chip 대안 제시, URL 복사 기능

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 높음 | "슬러그" 용어 | 일반 사용자(45세 이정수) 이해 불가 |
| 높음 | 3섹션이 탭 없이 스크롤 연결 | "매장 정보"+"목표 설정"+"예약 링크" 혼재 |
| 중간 | 저장 버튼이 스크롤 아래에만 존재 | 긴 폼 채운 후 스크롤 필요 |

**코드 개선 제안:**
```vue
<!-- "슬러그" → "예약 페이지 주소"로 용어 변경 -->
<!-- Before -->
<span>예약 링크 (슬러그)</span>
<label>슬러그</label>
<hint>3~50자, 영문 소문자/숫자/하이픈만 가능</hint>

<!-- After -->
<span>예약 페이지 주소</span>
<label>예약 링크 이름</label>
<hint>3~50자, 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다. 예: my-nail-shop</hint>
```

---

### 3-7. 리뷰 관리 (`reviews/list.vue`)

**강점:**
- VRating 별점 시각화, 답변 인라인 표시, 삭제 사유 기록 가능

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 중간 | 검색 기능 없음 | 특정 고객 리뷰 찾기 불가 |
| 중간 | "숨김" 처리 버튼 미구현 | 상태에 HIDDEN 존재하나 UI에서 변경 불가 |
| 낮음 | 별점 표시 위치 | 고객 정보 아래 두 번째 줄 → 빠른 스캔 시 놓침 |
| 낮음 | 헤더 카드 비어있음 | 타이틀만, 필터는 별도 카드 → 공간 낭비 |

---

### 3-8. 통계 분석 (`statistics/index.vue`)

**강점:**
- 5개 탭 (매출/예약/고객/직원/서비스) → 체계적 분류
- `StatisticsFilterBar`로 필터 공통화
- 검색 버튼 클릭 시에만 API 호출 → 불필요한 호출 방지

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 높음 | 탭 index 하드코딩 | `activeTab !== 2` → 탭 순서 변경 시 버그 위험 |
| 중간 | KPI 요약 없음 | 5탭+필터 → 초보자에게 과한 복잡도 |
| 낮음 | 헤더 카드 중복 | 타이틀 카드 + 필터바 → 헤더가 불필요 |

**코드 개선 제안:**
```javascript
// 탭 index 하드코딩 제거
// Before
:show-group-by="activeTab !== 2"

// After: 탭 정의에서 속성으로 관리
const tabs = [
  { label: '매출 분석', icon: '...', showGroupBy: true },
  { label: '예약 분석', icon: '...', showGroupBy: true },
  { label: '고객 분석', icon: '...', showGroupBy: false },
  { label: '직원 성과', icon: '...', showGroupBy: true },
  { label: '서비스 분석', icon: '...', showGroupBy: true },
]
// :show-group-by="tabs[activeTab].showGroupBy"
```

---

### 3-9. 알림 이력 (`notification-logs/list.vue`)

**강점:**
- 채널별(카카오/SMS/이메일) 아이콘/색상 구분, 실패 알림 에러 메시지 표시

**문제점:**

| 심각도 | 문제 | 설명 |
|--------|------|------|
| 중간 | 일반 관리자에게 불필요 | 시스템 로그 성격 → 메뉴 하단 이동 필요 |
| 낮음 | 날짜 필터 없음 | 특정 날짜 발송 현황 확인 불가 |
| 낮음 | 액션 없음 | 읽기 전용 → 용도 불명확 |

---

## 4. 일관성 이슈

### 4-1. 통계 카드 구현 불일치

| 페이지 | 방식 |
|--------|------|
| 예약 목록, 고객 목록 | `StatisticsCard` 컴포넌트 사용 |
| 서비스 목록, 스태프 목록 | 인라인 VCard + VCardText 직접 구현 |

→ 모든 페이지에서 `StatisticsCard` 컴포넌트로 통일 필요

### 4-2. 삭제 경고 문구 불일치

```
서비스 삭제: text-error + 이모지 ⚠️
스태프 삭제: text-error (이모지 없음)
예약 취소:  VAlert type="warning" + 이모지 ⚠️ (VAlert에 이미 아이콘 있어 중복)
```

→ `VAlert type="warning"` 이모지 없이 통일

### 4-3. 헤더 카드 역할 불일치

| 페이지 | 헤더 카드 내용 |
|--------|---------------|
| 예약/고객 목록 | 필터 + 검색 + 등록 버튼 포함 |
| 리뷰/알림 | 타이틀만, 필터는 별도 카드 |
| 통계 | 타이틀만, 필터는 외부 컴포넌트 |

→ 일관된 헤더 카드 패턴 필요

---

## 5. 메뉴 구조 재편성 제안

### 현재 구조 (문제점)
```
대시보드 / 통계분석 / 예약관리(2) / 고객관리 / 리뷰관리 / 알림이력 /
서비스관리 / 스태프관리 / 구독&결제(3) / 설정(3)
→ heading 그룹 없이 10개 나열, 우선순위 혼재
```

### 제안 구조

```javascript
// ============ 핵심 운영 (매일 사용) ============
{ title: '대시보드', icon: 'ri-dashboard-line' },
{ title: '예약 관리', icon: 'ri-calendar-line', children: [
    '예약 캘린더', '예약 목록'
]},
{ title: '고객 관리', icon: 'ri-user-line' },

// ============ 분석 · 피드백 ============
{ heading: '분석 · 피드백' },
{ title: '매출 · 통계', icon: 'ri-bar-chart-box-line' },
{ title: '리뷰 관리', icon: 'ri-chat-3-line' },

// ============ 매장 설정 ============
{ heading: '매장 설정' },
{ title: '서비스', icon: '(동적)' },
{ title: '스태프', icon: 'ri-team-line' },
{ title: '매장 정보', icon: 'ri-settings-3-line', children: [
    '기본 정보', '영업시간', '휴무일'
]},

// ============ 구독 · 결제 ============
{ heading: '구독 · 결제' },
{ title: '구독 & 결제', icon: 'ri-vip-crown-line', children: [
    '구독 관리', '결제 내역', '쿠폰 관리'
]},
{ title: '알림 이력', icon: 'ri-notification-3-line' },
```

### 재편성 원칙
1. **일상적 사용 빈도** 순으로 상위 배치
2. **heading 그룹**으로 시각적 구분 (4개 그룹)
3. **기능(운영) → 분석 → 설정 → 부가** 순서
4. 알림 이력은 빈도 낮으므로 최하단 이동

---

## 6. 페르소나별 상세 점수

### 김미영 (35세, 네일샵 원장, IT 중하)

| 항목 | 점수 | 문제 |
|------|------|------|
| 대시보드 첫인상 | 3/5 | 퀵 액션이 스크롤 아래 |
| 예약 등록 접근성 | 3/5 | 헤더 버튼이 필터들 사이에 묻힘 |
| 고객 관리 | 4/5 | 전반적으로 직관적 |
| 설정 변경 | 2/5 | "슬러그" 용어, 탭 구조 없이 스크롤 |
| 전반적 인지 부하 | 중간 | 메뉴 10개가 부담 |
| **종합** | **68/100** | 일상 업무는 가능, 설정 진입 시 어려움 |

### 박성민 (28세, 미용실 매니저, IT 중상)

| 항목 | 점수 | 문제 |
|------|------|------|
| 통계 분석 | 3/5 | 탭 구조 좋으나 KPI 요약 없음 |
| 예약 필터링 | 3/5 | 날짜 필터 없음 |
| 스태프 성과 | 3/5 | 담당 서비스 매핑 정보 부족 |
| 워크플로우 효율 | 3/5 | 상세→수정→저장 2단계 |
| **종합** | **72/100** | 고급 기능 접근 양호, 분석 깊이 부족 |

### 이정수 (45세, 마사지샵 사장, IT 하)

| 항목 | 점수 | 문제 |
|------|------|------|
| 메뉴 이해 | 2/5 | 10개 메뉴 + "통계"가 상단 → 부담 |
| 아이콘 버튼 | 2/5 | 텍스트 없이 아이콘만 다수 |
| "슬러그" 용어 | 1/5 | 완전히 이해 불가 |
| 알림 이력 메뉴 | 1/5 | 필요 없는 메뉴가 사이드바 점유 |
| 통계 복잡도 | 2/5 | 탭 5개, 필터 복잡 |
| **종합** | **58/100** | 최소 기능만 쓰려는 사용자에게 과한 복잡도 |

---

## 7. 우선순위별 개선 목록

### 높음 (즉시 개선)

| # | 작업 | 대상 파일 | 영향 페르소나 |
|---|------|----------|-------------|
| 1 | 메뉴 heading 그룹 추가 + 순서 재정렬 | `navigation/vertical/index.js` | 전체 |
| 2 | 대시보드 퀵 액션을 환영 카드와 통합 (상단 이동) | `dashboard.vue` | 김미영, 이정수 |
| 3 | 대시보드 예약 목록에 서비스명/담당자 추가 | `dashboard.vue` | 김미영 |
| 4 | "슬러그" → "예약 페이지 주소"로 용어 변경 | `business-settings/index.vue` | 이정수 |
| 5 | 통계 탭 index 하드코딩 → 탭 정의 객체로 관리 | `statistics/index.vue` | 코드 품질 |

### 중간 (1-2주 내)

| # | 작업 | 대상 파일 | 영향 페르소나 |
|---|------|----------|-------------|
| 6 | 예약 목록 날짜 필터 추가 | `reservations/list.vue` | 박성민 |
| 7 | 서비스 카드에 활성/비활성 즉시 토글 | `services/list.vue` | 김미영 |
| 8 | 스태프 4번째 카드 → "비활성 스태프 수" | `staffs/list.vue` | 코드 품질 |
| 9 | 삭제 경고 `VAlert type="warning"` 통일 | 전체 | 일관성 |
| 10 | 삭제 확인 다이얼로그 공통 컴포넌트화 | 신규 컴포넌트 | 코드 품질 |
| 11 | 통계 카드 `StatisticsCard` 사용 통일 | 서비스/스태프 | 일관성 |

### 낮음 (1개월 내)

| # | 작업 | 대상 파일 | 영향 페르소나 |
|---|------|----------|-------------|
| 12 | 리뷰 검색 + 숨김 버튼 추가 | `reviews/list.vue` | 박성민 |
| 13 | 알림 이력 날짜 필터 + 메뉴 하위 이동 | `notification-logs/list.vue` | 이정수 |
| 14 | 차트 색상 `#9155FD` → 테마 변수 교체 | `dashboard.vue`, `statistics/` | 코드 품질 |
| 15 | 매장 설정 3섹션 탭 분리 | `business-settings/index.vue` | 김미영, 이정수 |
