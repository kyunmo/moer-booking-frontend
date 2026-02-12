# Phase 3: 결제 관리 프론트엔드 구현 완료 보고서

**작성일**: 2026-02-12
**작업 시간**: 약 4시간
**담당**: Claude Code
**상태**: ✅ 완료

---

## 📋 작업 요약

Phase 3에서는 **결제 관리 프론트엔드**를 구현하여 백엔드 결제 API와 연동하여 결제 생성, 결제 내역 조회, 환불 처리 기능을 완성했습니다. FakePGService 시뮬레이션 (90% 성공률)과 연동되어 있으며, Phase 5에서 실제 Toss Payments로 교체 예정입니다.

### 구현 내용

1. **API 모듈 생성** (1개)
   - `payment.js` - 결제 관리 API 호출 (6개 함수)

2. **Store 생성** (1개)
   - `payment.js` - 결제 상태 관리 (6개 actions, 6개 getters)

3. **페이지 생성** (2개)
   - `payment/index.vue` - 결제 페이지 (플랜 선택 + 결제 수단 선택)
   - `payment/history.vue` - 결제 내역 페이지

4. **기존 페이지 수정** (1개)
   - `subscription/index.vue` - 결제 내역 버튼 추가

5. **네비게이션 수정** (1개)
   - "구독 & 결제" 메뉴로 변경 (구독 관리, 결제 내역 하위 메뉴)

---

## 🎯 핵심 기능

### 1. 결제 페이지

**구현 위치**: `src/pages/payment/index.vue`

**기능**:
- **플랜 선택**: BASIC, PRO, ENTERPRISE (FREE 제외)
- **결제 수단 선택**:
  - 신용/체크카드 (CARD)
  - 계좌이체 (BANK_TRANSFER)
  - 가상계좌 (VIRTUAL_ACCOUNT)
  - 간편결제 (MOBILE)
- **결제 금액 요약**: 선택한 플랜 정보 및 다음 결제일 표시
- **결제 처리**:
  - FakePG 시뮬레이션 (90% 성공률)
  - 성공 시: 구독 자동 활성화 (TRIAL → ACTIVE) + 구독 관리 페이지로 이동
  - 실패 시: 실패 사유 표시 + 재시도 가능

**UI 구성**:
```
┌─────────────────────────────────────────┐
│ 결제                                     │
├─────────────────────────────────────────┤
│ [플랜 선택 섹션]                          │
│ BASIC | PRO | ENTERPRISE                 │
│                                          │
│ [결제 수단 선택]                          │
│ ○ 신용/체크카드                           │
│ ○ 계좌이체                                │
│ ○ 가상계좌                                │
│ ○ 간편결제                                │
├─────────────────────────────────────────┤
│ [결제 요약]                               │
│ 선택한 플랜: 베이직                        │
│ 결제 금액: 29,000원                       │
│ 다음 결제일: 2026-03-12                   │
│ [결제하기]                                │
└─────────────────────────────────────────┘
```

**결제 흐름**:
```
사용자 플랜 선택 → 결제 수단 선택 → 결제하기 버튼 클릭
             ↓
         PaymentStore.createPayment()
             ↓
         POST /api/payments (백엔드)
             ↓
         FakePGService 호출 (90% 성공)
             ↓
    (성공) status: COMPLETED → 구독 활성화
    (실패) status: FAILED → 실패 사유 표시
```

---

### 2. 결제 내역 페이지

**구현 위치**: `src/pages/payment/history.vue`

**기능**:
- **통계 카드**:
  - 완료된 결제 건수
  - 실패한 결제 건수
  - 환불 완료 건수
  - 총 결제 금액
- **결제 목록 테이블**:
  - 결제 ID, 플랜, 금액, 결제 수단, 상태, 결제일
  - 상태별 필터링 (전체/완료/실패/환불/대기)
  - 페이지네이션 (10건씩)
- **상세보기 다이얼로그**:
  - 결제 ID, 상태, 플랜, 금액
  - 결제 수단, PG 거래 ID
  - 결제일, 구독 기간
  - 실패 사유 (실패 시)
  - 환불 정보 (환불 시)
- **환불 처리**:
  - 완료된 결제만 환불 가능
  - 환불 사유 입력 필수
  - 환불 완료 시 즉시 목록 갱신

**UI 구성**:
```
┌─────────────────────────────────────────┐
│ 결제 내역                                 │
├─────────────────────────────────────────┤
│ [통계 카드]                               │
│ 완료: 5건 | 실패: 1건 | 환불: 0건 | 총액  │
├─────────────────────────────────────────┤
│ [결제 목록 테이블]                         │
│ ID | 플랜 | 금액 | 수단 | 상태 | 날짜     │
│ #1 | BASIC | 29,000원 | 카드 | 완료     │
│ #2 | PRO | 79,000원 | 계좌 | 완료       │
│ #3 | BASIC | 29,000원 | 카드 | 실패     │
│                                          │
│ [상세보기] [환불] (액션 버튼)              │
└─────────────────────────────────────────┘
```

---

### 3. 네비게이션 통합

**구현 위치**: `src/navigation/vertical/index.js`

**변경 사항**:
```javascript
// Before
{
  title: '구독 관리',
  to: { name: 'subscription' },
  icon: { icon: 'ri-vip-crown-line' },
}

// After
{
  title: '구독 & 결제',
  icon: { icon: 'ri-vip-crown-line' },
  children: [
    {
      title: '구독 관리',
      to: { name: 'subscription' },
      icon: { icon: 'ri-vip-crown-line' },
    },
    {
      title: '결제 내역',
      to: { name: 'payment-history' },
      icon: { icon: 'ri-file-list-line' },
    },
  ],
}
```

---

## 📂 생성/수정된 파일 구조

```
src/
├── api/
│   └── payment.js                           (신규: 결제 API 모듈, 6개 함수)
├── stores/
│   └── payment.js                           (신규: 결제 상태 관리)
├── pages/
│   ├── payment/
│   │   ├── index.vue                        (신규: 결제 페이지)
│   │   └── history.vue                      (신규: 결제 내역 페이지)
│   └── subscription/
│       └── index.vue                        (수정: 결제 내역 버튼 추가)
└── navigation/
    └── vertical/
        └── index.js                         (수정: 구독 & 결제 메뉴 구조 변경)
```

**총 6개 파일** (신규 4개, 수정 2개)

---

## 🔧 API 연동

### 1. payment.js API 모듈

**엔드포인트**:
```javascript
// 결제 생성 및 처리
POST /api/payments
Body: { "plan": "BASIC", "paymentMethod": "CARD" }

// 환불 처리
POST /api/payments/{paymentId}/refund
Body: { "reason": "고객 요청" }

// 결제 단건 조회
GET /api/payments/{paymentId}

// 결제 목록 조회
GET /api/payments?status=COMPLETED&page=1&size=20

// PG 거래 ID로 조회
GET /api/payments/pg/{pgTransactionId}

// 최근 결제 조회
GET /api/payments/latest
```

**에러 처리**:
- 모든 API 호출은 axios 인터셉터에서 자동 처리
- 에러 코드별 메시지 표시:
  - `PA001`: 결제 정보를 찾을 수 없음
  - `PA002`: 이미 완료된 결제
  - `PA003`: 환불할 수 없는 상태
  - `PA006`: 무료 플랜은 결제 불필요
  - `PA008`: PG 거래 처리 실패

---

### 2. payment.js Store

**State**:
```javascript
{
  payments: [],              // 결제 목록
  currentPayment: null,      // 현재 결제 정보
  latestPayment: null,       // 최근 결제
  loading: false,            // 로딩 상태
  error: null,               // 에러 메시지
  totalCount: 0,             // 총 개수
}
```

**Getters** (6개):
- `completedPayments` - 완료된 결제 목록
- `failedPayments` - 실패한 결제 목록
- `refundedPayments` - 환불된 결제 목록
- `paymentCounts` - 상태별 개수 (COMPLETED, PENDING, FAILED, REFUNDED)
- `totalPaymentAmount` - 총 결제 금액 (완료된 결제만)
- `totalRefundAmount` - 총 환불 금액

**Actions** (6개):
- `createPayment(plan, paymentMethod)` - 결제 생성 및 처리
- `refundPayment(paymentId, reason)` - 환불 처리
- `fetchPayment(paymentId)` - 결제 단건 조회
- `fetchPayments(params)` - 결제 목록 조회
- `fetchLatestPayment()` - 최근 결제 조회
- `reset()` - 상태 초기화

---

## 🎨 UI/UX 특징

### 1. 반응형 디자인

**데스크톱** (md 이상):
- 결제 페이지: 플랜/결제수단 (8/12) + 결제 요약 (4/12) 가로 배치
- 결제 내역: 통계 카드 4개 가로 배치

**모바일** (sm 이하):
- 모든 카드 세로 배치
- 플랜 선택: 2개씩 가로 배치
- 통계 카드: 2개씩 가로 배치

---

### 2. 시각적 피드백

**플랜 카드**:
- 선택 시 elevation 효과 + primary 색상
- 호버 시 위로 이동 애니메이션

**상태 칩 색상**:
```javascript
PENDING: 'warning'   // 주황 - 대기
COMPLETED: 'success' // 초록 - 완료
FAILED: 'error'      // 빨강 - 실패
REFUNDED: 'secondary' // 회색 - 환불
```

**결제 결과 알림**:
- 성공: 초록 Alert + 3초 후 자동 이동
- 실패: 빨강 Alert + 실패 사유 표시

---

### 3. 사용자 안내

**결제 안내**:
```
• 결제 후 즉시 서비스가 활성화됩니다
• 다음 결제일에 자동으로 갱신됩니다
• 언제든지 플랜을 변경할 수 있습니다
```

**환불 경고**:
```
⚠️ 환불 후에는 서비스 이용이 제한될 수 있습니다.
```

**데이터 없음 상태**:
```
결제 내역이 없습니다
플랜을 구매하여 서비스를 이용하세요
[플랜 구매하기] 버튼
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 결제 생성 (성공)

**초기 상태**:
- 플랜: 체험판 (TRIAL)
- 결제 내역: 없음

**단계**:
1. 결제 페이지 접속 (/payment)
2. BASIC 플랜 선택
3. 결제 수단 선택 (카드)
4. "결제하기" 버튼 클릭

**예상 결과** (90% 확률):
- ✅ 결제 성공 Alert 표시
- ✅ 구독 상태: TRIAL → ACTIVE
- ✅ 3초 후 구독 관리 페이지로 자동 이동
- ✅ 결제 내역에 기록 추가

---

### 시나리오 2: 결제 생성 (실패)

**초기 상태**:
- 플랜: 체험판 (TRIAL)

**단계**:
1. 결제 페이지 접속
2. PRO 플랜 선택
3. 결제 수단 선택 (카드)
4. "결제하기" 버튼 클릭

**예상 결과** (10% 확률):
- ❌ 결제 실패 Alert 표시
- ❌ 실패 사유: "카드 한도 초과 (테스트)"
- ❌ 구독 상태: 변경 없음 (TRIAL 유지)
- ✅ 결제 내역에 실패 기록 추가

---

### 시나리오 3: 결제 내역 조회

**초기 상태**:
- 결제 내역: 3건 (완료 2건, 실패 1건)

**단계**:
1. 결제 내역 페이지 접속 (/payment/history)
2. 통계 카드 확인
3. 결제 목록 확인
4. 상태 필터 (완료만)

**예상 결과**:
- ✅ 통계 카드: 완료 2건, 실패 1건, 총액 108,000원
- ✅ 결제 목록: 3건 표시
- ✅ 필터 적용 시: 완료 2건만 표시

---

### 시나리오 4: 상세보기

**단계**:
1. 결제 내역에서 특정 결제 클릭 (상세보기 아이콘)
2. 상세 다이얼로그 확인

**예상 결과**:
- ✅ 결제 ID, 상태, 플랜, 금액 표시
- ✅ 결제 수단, PG 거래 ID 표시
- ✅ 결제일, 구독 기간 표시
- ✅ 실패 시: 실패 사유 Alert 표시
- ✅ 환불 시: 환불 정보 Alert 표시

---

### 시나리오 5: 환불 처리

**초기 상태**:
- 결제 ID 1: COMPLETED 상태

**단계**:
1. 결제 내역에서 결제 ID 1 선택
2. 환불 아이콘 클릭
3. 환불 사유 입력 ("고객 요청")
4. "환불 요청" 버튼 클릭

**예상 결과**:
- ✅ 환불 완료 스낵바 표시
- ✅ 결제 상태: COMPLETED → REFUNDED
- ✅ 환불 금액: 29,000원
- ✅ 환불 사유: "고객 요청"
- ✅ 환불일: 현재 시간
- ✅ 목록 자동 갱신

---

### 시나리오 6: 환불 불가 (이미 환불됨)

**초기 상태**:
- 결제 ID 1: REFUNDED 상태

**단계**:
1. 결제 내역에서 결제 ID 1 확인
2. 환불 버튼 상태 확인

**예상 결과**:
- ✅ 환불 버튼 표시 안 됨 (COMPLETED 상태만 표시)
- ✅ 상태 칩: 회색 "환불" 표시

---

## 📊 플랜 및 결제 수단 정보

### 플랜 정보

| 플랜 | 가격 | 직원 수 | 월간 예약 수 | 비고 |
|------|------|---------|-------------|------|
| **FREE** | 무료 | 1명 | 30건 | 결제 불필요 |
| **BASIC** | 29,000원 | 3명 | 100건 | 인기 플랜 |
| **PRO** | 79,000원 | 10명 | 500건 | 추천 플랜 |
| **ENTERPRISE** | 문의 | 무제한 | 무제한 | 별도 문의 |

### 결제 수단

| 수단 | 코드 | 아이콘 | 설명 |
|------|------|--------|------|
| **신용/체크카드** | CARD | ri-bank-card-line | 일반 카드 결제 |
| **계좌이체** | BANK_TRANSFER | ri-exchange-dollar-line | 실시간 계좌이체 |
| **가상계좌** | VIRTUAL_ACCOUNT | ri-bank-line | 가상계좌 입금 |
| **간편결제** | MOBILE | ri-smartphone-line | 카카오페이, 네이버페이 등 |

---

## 🔄 결제 상태 흐름

```
PENDING (대기)
    ↓
(PG 처리)
    ↓
┌─────────┴─────────┐
│                   │
COMPLETED        FAILED
(완료)            (실패)
    ↓
(환불 가능)
    ↓
REFUNDED
(환불)
```

**상태 설명**:
- `PENDING`: 결제 대기 중 (백엔드에서만 사용)
- `COMPLETED`: 결제 완료 (환불 가능)
- `FAILED`: 결제 실패
- `REFUNDED`: 환불 완료

---

## ✅ 완료 체크리스트

- [x] API 모듈 생성
  - [x] payment.js (6개 API 함수)
- [x] Store 생성
  - [x] payment.js (6개 getters, 6개 actions)
- [x] 페이지 생성
  - [x] payment/index.vue (결제 페이지)
  - [x] payment/history.vue (결제 내역 페이지)
- [x] 기존 페이지 수정
  - [x] subscription/index.vue (결제 내역 버튼 추가)
- [x] 네비게이션 수정
  - [x] 구독 & 결제 메뉴 구조 변경
- [x] 문서 작성
  - [x] Phase 3 프론트엔드 구현 보고서 (본 문서)

---

## 📈 다음 단계 (Phase 4)

**쿠폰 관리 프론트엔드 구현** (예정):
1. 쿠폰 API 모듈 및 Store 생성
2. 쿠폰 관리 페이지 (생성, 조회, 삭제)
3. 쿠폰 사용 내역 페이지
4. 결제 페이지에 쿠폰 적용 기능 추가
5. 할인 금액 계산 및 표시

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

### 1. 결제 흐름 처리

**비동기 결제 처리**:
```javascript
async function handlePayment() {
  loading.value = true
  try {
    const result = await paymentStore.createPayment(plan, method)

    if (result.status === 'COMPLETED') {
      // 성공 처리
      await subscriptionStore.fetchSubscriptionInfo() // 구독 정보 갱신
      router.push('/subscription') // 페이지 이동
    } else if (result.status === 'FAILED') {
      // 실패 처리
      showSnackbar(result.failReason, 'error')
    }
  } catch (error) {
    // 에러 처리
  } finally {
    loading.value = false
  }
}
```

### 2. 상태별 UI 처리

**동적 칩 색상**:
```javascript
function getStatusColor(status) {
  const colors = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'secondary',
  }
  return colors[status] || 'default'
}
```

### 3. 테이블 액션 버튼

**조건부 버튼 표시**:
```vue
<VBtn
  v-if="item.status === 'COMPLETED'"
  @click="openRefundDialog(item)"
>
  환불
</VBtn>
```

---

## 🏆 성과 및 개선 사항

### 핵심 성과

1. **직관적인 결제 UI**
   - 플랜과 결제 수단을 한 화면에서 선택
   - 결제 요약으로 명확한 정보 제공

2. **실시간 결과 피드백**
   - 결제 성공/실패 즉시 표시
   - FakePG 시뮬레이션 (90% 성공률)

3. **포괄적인 결제 내역**
   - 통계 카드로 한눈에 파악
   - 상태별 필터링
   - 상세 정보 및 환불 처리

4. **구독 시스템 통합**
   - 결제 완료 시 구독 자동 활성화
   - 구독 정보와 결제 내역 연동

---

## 📞 문의 및 피드백

Phase 3 결제 관리 프론트엔드 구현에 대한 문의 사항이나 개선 제안은 개발팀에 연락 부탁드립니다.

**다음**: Phase 4 - 쿠폰 관리 프론트엔드 구현 (예정)

---

## 🔍 참고 사항

### 1. FakePGService 동작 방식
- **성공률**: 90% (Math.random() < 0.9)
- **거래 ID**: UUID 기반 (FAKE_TXN_xxxxxxxx)
- **환불**: 항상 성공
- **Phase 5에서 교체**: Toss Payments로 대체 예정

### 2. 결제 완료 후 동작
```
결제 완료 (COMPLETED)
    ↓
구독 활성화 (TRIAL → ACTIVE)
    ↓
subscriptionStartedAt 설정
    ↓
nextBillingDate 설정 (1개월 후)
    ↓
사용자에게 성공 알림
```

### 3. FREE 플랜 정책
- FREE 플랜은 결제 페이지에서 제외
- 백엔드에서 FREE 플랜 결제 시도 시 `ErrorCode.FREE_PLAN_NO_PAYMENT` 예외 발생

### 4. ENTERPRISE 플랜
- 결제 페이지에 표시되지만 선택 시 "별도 문의 필요" 안내
- 실제 결제는 진행되지 않음

---

**End of Report**
