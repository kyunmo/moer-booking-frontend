# Phase 2: 구독 관리 프론트엔드 구현 완료 보고서

**작성일**: 2026-02-12
**작업 시간**: 약 3시간
**담당**: Claude Code
**상태**: ✅ 완료

---

## 📋 작업 요약

Phase 2에서는 **구독 관리 프론트엔드**를 구현하여 백엔드 API와 연동하여 플랜 관리, 사용량 조회 및 플랜 변경 기능을 완성했습니다. 또한 직원 추가와 예약 생성 시 사용량 제한을 체크하여 사용자 경험을 향상시켰습니다.

### 구현 내용

1. **API 모듈 생성** (1개)
   - `subscription.js` - 구독 관리 API 호출

2. **Store 생성** (1개)
   - `subscription.js` - 구독 상태 관리

3. **페이지 생성** (1개)
   - `subscription/index.vue` - 구독 관리 페이지

4. **컴포넌트 생성** (1개)
   - `PlanChangeDialog.vue` - 플랜 변경 다이얼로그

5. **네비게이션 수정** (1개)
   - 구독 관리 메뉴 추가

6. **기존 페이지 수정** (3개)
   - `staffs/list.vue` - 직원 추가 제한 체크
   - `reservations/calendar.vue` - 예약 생성 제한 체크
   - `reservations/list.vue` - 예약 생성 제한 체크

---

## 🎯 핵심 기능

### 1. 구독 정보 조회

**구현 위치**: `src/pages/subscription/index.vue`

**기능**:
- 현재 플랜 정보 표시 (이름, 가격, 상태)
- 체험판 정보 표시 (남은 일수)
- 다음 결제 예정일 표시
- 사용량 현황 표시:
  - 직원 수 (현재/최대)
  - 월간 예약 수 (현재/최대)
  - 프로그레스 바로 시각화
  - 사용률에 따른 색상 변경 (70% 이상: 주황, 90% 이상: 빨강)

**UI 구성**:
```
┌─────────────────────────────────────────┐
│ 구독 관리                                │
├─────────────────────────────────────────┤
│ [현재 플랜 카드]        [사용량 카드]    │
│ - 플랜명 (베이직)       - 직원 수: 2/3  │
│ - 가격: 29,000원        - 예약: 45/100  │
│ - 상태: 활성            [프로그레스 바] │
│ - 체험판 정보                            │
│ - 다음 결제일                            │
│ [플랜 변경] [구독 취소]                  │
├─────────────────────────────────────────┤
│ [플랜 비교 섹션]                         │
│ FREE | BASIC | PRO | ENTERPRISE          │
└─────────────────────────────────────────┘
```

---

### 2. 플랜 변경

**구현 위치**: `src/components/subscription/PlanChangeDialog.vue`

**기능**:
- 4개 플랜 카드 표시 (FREE, BASIC, PRO, ENTERPRISE)
- 현재 플랜 강조 표시
- 플랜별 기능 목록 표시
- 다운그레이드 제한 체크:
  - 현재 직원 수가 새 플랜 제한 초과 시 차단
  - 차단된 플랜은 비활성화 및 경고 메시지 표시
- 업그레이드/다운그레이드 구분 표시
- 선택한 플랜으로 변경 요청

**다운그레이드 로직**:
```javascript
// 직원 수 체크
if (limits.maxStaff !== -1 && currentStaffCount > limits.maxStaff) {
  return true // 차단
}
```

**에러 처리**:
- 백엔드에서 `SU005` (다운그레이드 불가) 에러 발생 시 스낵바로 메시지 표시
- 프론트엔드에서도 사전 차단으로 UX 향상

---

### 3. 구독 취소

**구현 위치**: `src/pages/subscription/index.vue`

**기능**:
- 구독 취소 확인 다이얼로그 표시
- 취소 시 경고 메시지 표시
- 취소 완료 후 구독 정보 자동 갱신
- 취소된 구독은 상태가 `CANCELED`로 변경

---

### 4. 네비게이션 통합

**구현 위치**: `src/navigation/vertical/index.js`

**추가된 메뉴**:
```javascript
{
  title: '구독 관리',
  to: { name: 'subscription' },
  icon: { icon: 'ri-vip-crown-line' },
}
```

**위치**: 설정 메뉴 위에 배치

---

## 📂 생성/수정된 파일 구조

```
src/
├── api/
│   └── subscription.js                          (신규: 구독 API 모듈)
├── stores/
│   └── subscription.js                          (신규: 구독 상태 관리)
├── pages/
│   ├── subscription/
│   │   └── index.vue                            (신규: 구독 관리 페이지)
│   ├── staffs/
│   │   └── list.vue                             (수정: 사용량 제한 체크 추가)
│   └── reservations/
│       ├── calendar.vue                         (수정: 사용량 제한 체크 추가)
│       └── list.vue                             (수정: 사용량 제한 체크 추가)
├── components/
│   └── subscription/
│       └── PlanChangeDialog.vue                 (신규: 플랜 변경 다이얼로그)
└── navigation/
    └── vertical/
        └── index.js                             (수정: 구독 관리 메뉴 추가)
```

---

## 🔧 API 연동

### 1. subscription.js API 모듈

**엔드포인트**:
```javascript
// 구독 정보 조회
GET /api/subscription

// 플랜 변경
POST /api/subscription/change-plan
Body: { "newPlan": "PRO" }

// 구독 취소
POST /api/subscription/cancel
```

**에러 처리**:
- 모든 API 호출은 axios 인터셉터에서 자동 처리
- 에러 코드별 메시지 표시:
  - `SU004`: 이미 동일한 플랜
  - `SU005`: 다운그레이드 불가 (사용량 초과)
  - `SL001`: 직원 수 제한 도달
  - `SL002`: 예약 수 제한 도달

---

### 2. subscription.js Store

**State**:
```javascript
{
  subscriptionInfo: null,  // 구독 정보 객체
  loading: false,          // 로딩 상태
  error: null,             // 에러 메시지
}
```

**Getters** (22개):
- `currentPlan` - 현재 플랜
- `planDescription` - 플랜 설명
- `monthlyPrice` - 월 요금
- `status` - 구독 상태
- `isTrialActive` - 체험판 활성화 여부
- `daysUntilTrialEnd` - 체험판 남은 일수
- `maxStaff` - 최대 직원 수
- `maxMonthlyReservations` - 최대 월간 예약 수
- `currentStaffCount` - 현재 직원 수
- `currentMonthReservationCount` - 현재 월간 예약 수
- `canUseService` - 서비스 사용 가능 여부
- `canAddStaff` - 직원 추가 가능 여부
- `canCreateReservation` - 예약 생성 가능 여부
- `nextBillingDate` - 다음 결제일
- `staffUsagePercent` - 직원 수 사용률 (%)
- `reservationUsagePercent` - 예약 수 사용률 (%)
- `staffLimitText` - 직원 수 제한 표시 텍스트
- `reservationLimitText` - 예약 수 제한 표시 텍스트
- 등

**Actions** (4개):
- `fetchSubscriptionInfo()` - 구독 정보 조회
- `changePlan(newPlan)` - 플랜 변경
- `cancelSubscription()` - 구독 취소
- `reset()` - 상태 초기화

---

## 🎨 UI/UX 특징

### 1. 반응형 디자인

**데스크톱** (md 이상):
- 플랜 카드 (8/12) + 사용량 카드 (4/12) 가로 배치
- 플랜 비교 섹션: 4개 플랜 가로 배치

**모바일** (sm 이하):
- 모든 카드 세로 배치
- 플랜 비교: 2개씩 가로 배치

---

### 2. 시각적 피드백

**프로그레스 바 색상**:
- 0~70%: 초록색 (성공)
- 70~90%: 주황색 (경고)
- 90~100%: 빨간색 (위험)

**상태 칩 색상**:
```javascript
ACTIVE: 'success'      // 초록
TRIAL: 'info'          // 파랑
EXPIRED: 'error'       // 빨강
CANCELED: 'warning'    // 주황
SUSPENDED: 'error'     // 빨강
```

**플랜 뱃지**:
- BASIC: "인기" (초록)
- PRO: "추천" (파랑)

---

### 3. 사용자 안내

**체험판 알림**:
```
🎁 30일 무료 체험 진행 중!
체험 종료까지 15일 남았습니다.
```

**사용량 경고**:
```
직원 수 제한에 도달했습니다
예약 수 제한에 도달했습니다
```

**다운그레이드 차단**:
```
⚠️ 직원 수(5명)가 제한(3명)을 초과합니다
```

---

## 📊 플랜 정보

| 플랜 | 가격 | 직원 수 | 월간 예약 수 | 주요 기능 |
|------|------|---------|-------------|----------|
| **FREE** | 무료 | 1명 | 30건 | 기본 예약 관리, 고객 관리 |
| **BASIC** | 29,000원 | 3명 | 100건 | 카카오톡 알림, 통계 분석 |
| **PRO** | 79,000원 | 10명 | 500건 | 고급 통계, 프리미엄 지원 |
| **ENTERPRISE** | 문의 | 무제한 | 무제한 | 맞춤형 기능, 전담 지원 |

---

## 🧪 테스트 시나리오

### 시나리오 1: 구독 정보 조회

**단계**:
1. 로그인 후 "구독 관리" 메뉴 클릭
2. 구독 정보 페이지 로드

**예상 결과**:
- 현재 플랜 정보 표시
- 사용량 프로그레스 바 표시
- 플랜 비교 섹션 표시

---

### 시나리오 2: 플랜 업그레이드

**초기 상태**:
- 플랜: BASIC
- 직원: 2명

**단계**:
1. "플랜 변경" 버튼 클릭
2. PRO 플랜 선택
3. "플랜 변경" 버튼 클릭

**예상 결과**:
- ✅ 플랜 변경 성공
- 스낵바: "플랜이 성공적으로 변경되었습니다."
- 페이지에 PRO 플랜 정보 표시

---

### 시나리오 3: 다운그레이드 차단

**초기 상태**:
- 플랜: PRO
- 직원: 5명

**단계**:
1. "플랜 변경" 버튼 클릭
2. BASIC 플랜 선택 시도

**예상 결과**:
- ❌ BASIC 플랜 카드 비활성화
- 경고 메시지: "직원 수(5명)가 제한(3명)을 초과합니다"
- 선택 불가

---

### 시나리오 4: 사용량 제한 표시

**초기 상태**:
- 플랜: BASIC (최대 3명)
- 직원: 3명

**단계**:
1. 구독 관리 페이지 확인

**예상 결과**:
- 직원 수: 3/3명
- 프로그레스 바: 100% (빨간색)
- 경고 메시지: "직원 수 제한에 도달했습니다"

---

### 시나리오 5: 구독 취소

**초기 상태**:
- 플랜: BASIC
- 상태: ACTIVE

**단계**:
1. "구독 취소" 버튼 클릭
2. 확인 다이얼로그에서 "구독 취소" 클릭

**예상 결과**:
- ✅ 구독 취소 성공
- 상태: CANCELED
- 스낵바: "구독이 취소되었습니다."

---

## ✅ 추가 구현 사항

### 사용량 제한 UI 통합

**구현 완료**:

1. **직원 추가 제한 체크**
   - ✅ `staffs/list.vue` 직원 추가 버튼에 `canAddStaff` 체크 추가
   - ✅ 제한 도달 시 버튼 비활성화 및 툴팁 안내
   - ✅ Store 초기화 (onMounted)

2. **예약 생성 제한 체크**
   - ✅ `reservations/calendar.vue` 예약 등록 버튼에 `canCreateReservation` 체크 추가
   - ✅ `reservations/list.vue` 예약 등록 버튼에 `canCreateReservation` 체크 추가
   - ✅ 제한 도달 시 버튼 비활성화 및 툴팁 안내
   - ✅ Store 초기화 (onMounted)

**구현 세부사항**:
```vue
<!-- 직원 추가 버튼 예시 -->
<VTooltip v-if="!subscriptionStore.canAddStaff" location="bottom">
  <template #activator="{ props }">
    <VBtn color="primary" disabled v-bind="props">
      스태프 등록
    </VBtn>
  </template>
  <span>직원 수 제한에 도달했습니다. 플랜을 업그레이드하세요.</span>
</VTooltip>
<VBtn v-else color="primary" @click="openCreateDialog">
  스태프 등록
</VBtn>
```

---

## 🔄 향후 개선 사항

### Phase 3에서 구현 예정

1. **대시보드 위젯**
   - 대시보드에 구독 상태 위젯 추가
   - 사용량 요약 표시
   - 체험판 남은 일수 표시

4. **사용량 알림**
   - 사용량 80% 도달 시 알림
   - 체험판 종료 7일 전 알림

5. **결제 연동**
   - 플랜 변경 시 결제 페이지 연동
   - 결제 이력 표시

---

## ✅ 완료 체크리스트

- [x] API 모듈 생성
  - [x] subscription.js (3개 API 함수)
- [x] Store 생성
  - [x] subscription.js (22개 getters, 4개 actions)
- [x] 페이지 생성
  - [x] subscription/index.vue (구독 관리 페이지)
- [x] 컴포넌트 생성
  - [x] PlanChangeDialog.vue (플랜 변경 다이얼로그)
- [x] 네비게이션 수정
  - [x] 구독 관리 메뉴 추가
- [x] 사용량 제한 UI 통합
  - [x] 직원 관리 페이지 (staffs/list.vue)
  - [x] 예약 캘린더 페이지 (reservations/calendar.vue)
  - [x] 예약 목록 페이지 (reservations/list.vue)
- [x] 문서 작성
  - [x] Phase 2 프론트엔드 구현 보고서 (본 문서)

---

## 📈 다음 단계 (Phase 3)

**결제 연동 프론트엔드 구현**:
1. 결제 페이지 생성
2. Portone (구 아임포트) 결제 위젯 통합
3. 결제 이력 조회 페이지
4. 결제 실패 처리 및 재시도
5. 영수증 출력 기능

**예상 작업 시간**: 약 5시간

---

## 💡 기술 스택

- **Vue 3** - Composition API
- **Pinia** - 상태 관리
- **Vuetify 3** - UI 컴포넌트
- **Axios** - HTTP 클라이언트
- **unplugin-vue-router** - 파일 기반 라우팅

---

## 🎓 학습 포인트

### 1. Pinia Getters 활용

**계산된 값 자동 업데이트**:
```javascript
staffUsagePercent: state => {
  const { maxStaff, currentStaffCount } = state.subscriptionInfo
  if (maxStaff === -1) return 0 // 무제한
  return Math.round((currentStaffCount / maxStaff) * 100)
}
```

### 2. 반응형 Store 참조

**storeToRefs 사용**:
```javascript
import { storeToRefs } from 'pinia'

const subscriptionStore = useSubscriptionStore()
const { currentPlan, staffUsagePercent } = storeToRefs(subscriptionStore)
```

### 3. 동적 컴포넌트 속성

**계산된 속성으로 동적 스타일링**:
```javascript
const statusColor = computed(() => {
  const colorMap = {
    ACTIVE: 'success',
    TRIAL: 'info',
    EXPIRED: 'error',
  }
  return colorMap[status.value]
})
```

---

### 시나리오 6: 직원 추가 제한

**초기 상태**:
- 플랜: FREE (최대 1명)
- 직원: 1명

**단계**:
1. 스태프 관리 페이지 접속
2. "스태프 등록" 버튼 확인

**예상 결과**:
- ❌ 버튼 비활성화
- 툴팁: "직원 수 제한에 도달했습니다. 플랜을 업그레이드하세요."

---

### 시나리오 7: 예약 생성 제한

**초기 상태**:
- 플랜: BASIC (최대 100건)
- 이번 달 예약: 100건

**단계**:
1. 예약 캘린더 또는 예약 목록 페이지 접속
2. "예약 등록" 버튼 확인

**예상 결과**:
- ❌ 버튼 비활성화
- 툴팁: "월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요."

---

## 🏆 성과 및 개선 사항

### 핵심 성과

1. **직관적인 UI**
   - 플랜 정보와 사용량을 한눈에 파악
   - 프로그레스 바로 시각적 피드백

2. **사전 차단 로직**
   - 다운그레이드 불가 플랜 비활성화
   - 백엔드 에러 발생 전 프론트엔드에서 차단

3. **반응형 Store**
   - 22개 getters로 다양한 계산 값 제공
   - 컴포넌트에서 간편하게 사용

4. **재사용 가능한 컴포넌트**
   - PlanChangeDialog를 다른 곳에서도 활용 가능
   - PricingCard 컴포넌트 재사용

---

## 📞 문의 및 피드백

Phase 2 구독 관리 프론트엔드 구현에 대한 문의 사항이나 개선 제안은 개발팀에 연락 부탁드립니다.

**다음**: Phase 3 - 결제 연동 프론트엔드 구현

---

**End of Report**
