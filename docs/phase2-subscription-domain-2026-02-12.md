# Phase 2: 구독 관리 도메인 구현 완료 보고서

**작성일**: 2026-02-12
**작업 시간**: 약 17시간
**담당**: Claude Code
**상태**: ✅ 완료

---

## 📋 작업 요약

Phase 2에서는 **구독 관리 도메인**을 구현하여 SaaS 기반 예약 시스템의 핵심 기능인 플랜 관리 및 사용량 제한 기능을 완성했습니다.

### 구현 내용

1. **DTO 생성** (2개)
   - `SubscriptionInfoResponse.java` - 구독 정보 응답
   - `PlanChangeRequest.java` - 플랜 변경 요청

2. **Service 생성** (2개)
   - `SubscriptionService.java` - 구독 관리 로직
   - `UsageLimitService.java` - 사용량 제한 체크

3. **Controller 생성** (1개)
   - `SubscriptionController.java` - 구독 관리 API

4. **기존 Service 수정** (2개)
   - `StaffService.java` - 직원 생성/삭제 시 사용량 체크
   - `ReservationService.java` - 예약 생성/취소 시 사용량 체크

---

## 🎯 핵심 기능

### 1. 구독 정보 조회

**엔드포인트**: `GET /api/subscription`

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "plan": "BASIC",
    "status": "ACTIVE",
    "planDescription": "베이직",
    "monthlyPrice": 29000,
    "isTrialActive": false,
    "trialStartedAt": null,
    "trialEndsAt": null,
    "daysUntilTrialEnd": null,
    "subscriptionStartedAt": "2026-01-15T10:00:00",
    "nextBillingDate": "2026-02-15T10:00:00",
    "maxStaff": 3,
    "maxMonthlyReservations": 100,
    "currentStaffCount": 2,
    "currentMonthReservationCount": 45,
    "canUseService": true,
    "canAddStaff": true,
    "canCreateReservation": true
  }
}
```

**특징**:
- 현재 플랜의 제한 사항과 사용량을 한눈에 확인
- 직원 추가 가능 여부, 예약 생성 가능 여부를 Boolean으로 제공
- 체험판 상태 및 남은 일수 표시

---

### 2. 플랜 변경

**엔드포인트**: `POST /api/subscription/change-plan`

**요청 예시**:
```json
{
  "newPlan": "PRO"
}
```

**비즈니스 로직**:
1. **동일한 플랜 체크** → `ErrorCode.SAME_PLAN` 예외
2. **다운그레이드 검증**:
   - 현재 직원 수가 새 플랜의 제한을 초과하면 → `ErrorCode.DOWNGRADE_NOT_ALLOWED`
   - 예: BASIC(3명) → FREE(1명) 변경 시 현재 직원 2명 이상이면 차단
3. **업그레이드는 제약 없음** (제한이 늘어나므로)
4. **플랜 변경 로그** 자동 기록

**다운그레이드 제한 예시**:
```
현재 플랜: PRO (직원 10명, 예약 500건/월)
새 플랜: BASIC (직원 3명, 예약 100건/월)
현재 직원 수: 5명

→ 차단! "현재 직원 수(5명)가 새 플랜의 제한(3명)을 초과합니다"
```

---

### 3. 구독 취소

**엔드포인트**: `POST /api/subscription/cancel`

**동작**:
- 구독 상태를 `CANCELED`로 변경
- 다음 결제일(`nextBillingDate`)을 `NULL`로 설정
- 이미 취소된 구독은 재취소 불가 (`ErrorCode.INVALID_INPUT_VALUE`)

**취소 후 제한**:
- `SubscriptionStatus.CANCELED`는 `canUseService() = false` 반환
- 직원 추가, 예약 생성 등 모든 주요 기능 차단

---

### 4. 사용량 제한 체크

#### 4.1 직원 수 제한

**적용 위치**: `StaffService.createStaff()`

```java
// 직원 생성 전
usageLimitService.checkCanAddStaff(businessId);

// 직원 생성 완료 후
usageLimitService.incrementStaffCount(businessId);
```

**에러 시나리오**:
```
플랜: FREE (최대 1명)
현재 직원: 1명
→ 직원 추가 시도 → 차단!

에러 코드: SL001
메시지: "직원 수 제한에 도달했습니다 (현재: 1명, 최대: 1명). 플랜을 업그레이드하세요."
HTTP 상태: 403 Forbidden
```

**직원 삭제 시**:
```java
usageLimitService.decrementStaffCount(businessId);
```

---

#### 4.2 월간 예약 수 제한

**적용 위치**: `ReservationService.createReservation()`

```java
// 예약 생성 전
usageLimitService.checkCanCreateReservation(businessId);

// 예약 생성 완료 후
usageLimitService.incrementReservationCount(businessId);
```

**에러 시나리오**:
```
플랜: BASIC (최대 100건/월)
현재 예약: 100건
→ 예약 생성 시도 → 차단!

에러 코드: SL002
메시지: "월간 예약 수 제한에 도달했습니다 (현재: 100건, 최대: 100건). 플랜을 업그레이드하세요."
HTTP 상태: 403 Forbidden
```

**예약 취소 시**:
```java
usageLimitService.decrementReservationCount(businessId);
```

---

## 📂 생성된 파일 구조

```
src/main/java/io/moer/booking/domain/subscription/
├── controller/
│   └── SubscriptionController.java      (3개 API 엔드포인트)
├── dto/
│   ├── PlanChangeRequest.java           (플랜 변경 요청)
│   └── SubscriptionInfoResponse.java    (구독 정보 응답)
└── service/
    ├── SubscriptionService.java         (플랜 변경, 구독 취소)
    └── UsageLimitService.java           (사용량 체크 및 카운터 증감)
```

---

## 🔧 수정된 기존 파일

### 1. StaffService.java

**추가된 의존성**:
```java
private final UsageLimitService usageLimitService;
```

**수정된 메서드**:
- `createStaff()` - 직원 생성 전 제한 체크 + 생성 후 카운트 증가
- `deleteStaff()` - 직원 삭제 후 카운트 감소

---

### 2. ReservationService.java

**추가된 의존성**:
```java
private final UsageLimitService usageLimitService;
```

**수정된 메서드**:
- `createReservation()` - 예약 생성 전 제한 체크 + 생성 후 카운트 증가
- `cancelReservation()` - 예약 취소 후 카운트 감소

---

## 🗂️ 에러 코드 (기존 활용)

| 코드 | 이름 | HTTP 상태 | 메시지 |
|------|------|-----------|--------|
| SU004 | SAME_PLAN | 400 | 이미 동일한 플랜입니다 |
| SU005 | DOWNGRADE_NOT_ALLOWED | 400 | 현재 사용량이 다운그레이드할 플랜의 제한을 초과합니다 |
| SL001 | STAFF_LIMIT_EXCEEDED | 403 | 직원 수 제한에 도달했습니다. 플랜을 업그레이드하세요 |
| SL002 | RESERVATION_LIMIT_EXCEEDED | 403 | 월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요 |

---

## 📊 플랜별 제한 사항

| 플랜 | 가격 | 직원 수 | 월간 예약 수 |
|------|------|---------|-------------|
| **FREE** | 무료 | 1명 | 30건 |
| **BASIC** | 29,000원 | 3명 | 100건 |
| **PRO** | 79,000원 | 10명 | 500건 |
| **ENTERPRISE** | 문의 | 무제한 | 무제한 |

**무제한 표시**: `-1`로 저장 (코드에서 `-1`이면 체크 스킵)

---

## 🚀 API 명세

### 1. 구독 정보 조회

```http
GET /api/subscription
Authorization: Bearer {access_token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "plan": "BASIC",
    "status": "ACTIVE",
    "planDescription": "베이직",
    "monthlyPrice": 29000,
    "maxStaff": 3,
    "maxMonthlyReservations": 100,
    "currentStaffCount": 2,
    "currentMonthReservationCount": 45,
    "canUseService": true,
    "canAddStaff": true,
    "canCreateReservation": true
  }
}
```

---

### 2. 플랜 변경

```http
POST /api/subscription/change-plan
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "newPlan": "PRO"
}
```

**성공 응답**:
```json
{
  "success": true,
  "data": {
    "plan": "PRO",
    "maxStaff": 10,
    "maxMonthlyReservations": 500,
    ...
  }
}
```

**실패 예시** (다운그레이드 불가):
```json
{
  "success": false,
  "error": {
    "code": "SU005",
    "message": "현재 직원 수(5명)가 새 플랜의 제한(3명)을 초과합니다"
  }
}
```

---

### 3. 구독 취소

```http
POST /api/subscription/cancel
Authorization: Bearer {access_token}
```

**응답**:
```json
{
  "success": true,
  "data": null
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: FREE 플랜 제한 테스트

**초기 상태**:
- 플랜: FREE
- 직원: 0명
- 예약: 0건

**테스트 단계**:
1. 직원 1명 추가 → ✅ 성공
2. 직원 2명 추가 시도 → ❌ `SL001` 에러
3. 플랜을 BASIC으로 변경 → ✅ 성공
4. 직원 2명 추가 → ✅ 성공 (BASIC은 3명까지)

---

### 시나리오 2: 다운그레이드 제한 테스트

**초기 상태**:
- 플랜: PRO
- 직원: 5명

**테스트 단계**:
1. BASIC으로 다운그레이드 시도 → ❌ `SU005` 에러 (BASIC은 3명까지)
2. 직원 2명 삭제 (현재 3명) → ✅ 성공
3. BASIC으로 다운그레이드 시도 → ✅ 성공

---

### 시나리오 3: 월간 예약 수 제한 테스트

**초기 상태**:
- 플랜: BASIC
- 이번 달 예약: 99건

**테스트 단계**:
1. 예약 생성 (100번째) → ✅ 성공
2. 예약 생성 (101번째) → ❌ `SL002` 에러
3. 예약 1건 취소 (현재 99건) → ✅ 성공
4. 예약 생성 → ✅ 성공 (100건)

---

### 시나리오 4: 구독 취소 테스트

**초기 상태**:
- 플랜: BASIC
- 상태: ACTIVE

**테스트 단계**:
1. 구독 취소 → ✅ 성공 (상태: CANCELED)
2. 직원 추가 시도 → ❌ 서비스 사용 불가 (canUseService = false)
3. 예약 생성 시도 → ❌ 서비스 사용 불가

---

## 🔄 사용량 카운터 동기화

### 현재 구현

**직원 수 (`current_staff_count`)**:
- 직원 생성 시 +1
- 직원 삭제 시 -1
- 최소값: 0 (음수 방지)

**월간 예약 수 (`current_month_reservation_count`)**:
- 예약 생성 시 +1
- 예약 취소 시 -1
- 최소값: 0 (음수 방지)

### Phase 5에서 구현 예정

**배치 작업**:
1. **월간 예약 수 초기화** (매월 1일 00:00)
   - 모든 매장의 `current_month_reservation_count`를 0으로 리셋

2. **체험판 만료 체크** (매일 00:00)
   - `trial_ends_at < NOW()`인 매장을 `EXPIRED`로 변경

3. **사용량 재동기화** (매주 일요일 03:00)
   - 실제 DB 집계 값과 캐시 값 비교 및 보정

---

## ⚙️ Business 엔티티 헬퍼 메서드 활용

구독 관리 로직은 `Business` 엔티티의 헬퍼 메서드를 적극 활용합니다:

```java
// Business.java
public boolean canAddStaff() {
    if (subscriptionPlan == null) return true;
    if (currentStaffCount == null) return true;
    return subscriptionPlan.canAddStaff(currentStaffCount);
}

public boolean canCreateReservation() {
    if (subscriptionPlan == null) return true;
    if (currentMonthReservationCount == null) return true;
    return subscriptionPlan.canCreateReservation(currentMonthReservationCount);
}

public boolean canUseService() {
    if (subscriptionStatus == null) return false;
    return subscriptionStatus.canUseService();
}
```

**장점**:
- 비즈니스 로직이 엔티티에 집중
- Service 계층 코드 간결화
- 테스트 용이성 향상

---

## 📝 로그 추적

### SubscriptionService

**플랜 변경**:
```
2026-02-12 14:30:45 INFO  SubscriptionService - Plan changed: businessId=1, BASIC -> PRO
```

**구독 취소**:
```
2026-02-12 14:35:22 INFO  SubscriptionService - Subscription canceled: businessId=1
```

---

### UsageLimitService

**직원 수 증가**:
```
2026-02-12 14:40:10 DEBUG UsageLimitService - Staff count incremented: businessId=1, newCount=3
```

**예약 수 증가**:
```
2026-02-12 14:50:30 DEBUG UsageLimitService - Reservation count incremented: businessId=1, newCount=45
```

---

## 🎨 Swagger UI 문서

**태그**: `구독 관리`

**API 목록**:
- `GET /api/subscription` - 구독 정보 조회
- `POST /api/subscription/change-plan` - 플랜 변경
- `POST /api/subscription/cancel` - 구독 취소

**접근**: http://localhost:8080/swagger-ui.html

---

## 🔐 보안 고려사항

### 1. 권한 체크

- 모든 API는 JWT 인증 필수 (`@AuthenticationPrincipal`)
- `businessId`는 현재 로그인한 사용자의 매장에서 자동 추출
- 다른 매장의 구독 정보는 조회 불가

### 2. 동시성 제어

**현재 구현**:
- `@Transactional`로 기본 보호
- 카운터 증감은 Builder 패턴으로 전체 엔티티 재생성

**Phase 5 개선 예정**:
- 낙관적 잠금 (Optimistic Locking) 추가
- 버전 컬럼 (`version`) 도입

---

## 🚨 알려진 제한사항 및 TODO

### Phase 3~5에서 구현 예정

1. **배치 작업** (Phase 5)
   - 월간 예약 수 초기화 (매월 1일)
   - 체험판 만료 체크 (매일)
   - 사용량 재동기화 (매주)

2. **알림 기능** (Phase 4)
   - 직원/예약 수 제한 80% 도달 시 알림
   - 플랜 변경 완료 알림
   - 구독 취소 확인 알림

3. **결제 연동** (Phase 3)
   - 플랜 변경 시 즉시 결제 처리
   - 정기 결제 자동 처리
   - 결제 실패 시 구독 상태 변경

4. **쿠폰 할인** (Phase 3)
   - 플랜 변경 시 쿠폰 적용
   - 할인율 계산

---

## ✅ 완료 체크리스트

- [x] DTO 생성 (2개)
  - [x] SubscriptionInfoResponse.java
  - [x] PlanChangeRequest.java
- [x] Service 생성 (2개)
  - [x] SubscriptionService.java (5개 메서드)
  - [x] UsageLimitService.java (8개 메서드)
- [x] Controller 생성 (1개)
  - [x] SubscriptionController.java (3개 엔드포인트)
- [x] 기존 Service 수정 (2개)
  - [x] StaffService.java - 직원 생성/삭제 시 사용량 체크
  - [x] ReservationService.java - 예약 생성/취소 시 사용량 체크
- [x] 문서 작성
  - [x] Phase 2 구현 보고서 (본 문서)

---

## 📈 다음 단계 (Phase 3)

**결제 연동 도메인 구현**:
1. `Payment` 엔티티 및 Repository
2. `PaymentService` - 결제 처리, 결제 이력
3. `BillingService` - 정기 결제, 요금 계산
4. Portone (구 아임포트) 웹훅 처리
5. 결제 실패 시 구독 상태 자동 변경

**예상 작업 시간**: 약 20시간

---

## 💡 프론트엔드 가이드

### 구독 정보 화면

**표시 정보**:
- 현재 플랜 이름 및 가격
- 직원 수 사용량 (예: "2/3명")
- 월간 예약 수 사용량 (예: "45/100건")
- 다음 결제 예정일
- 플랜 변경 버튼

**구현 예시**:
```typescript
// 구독 정보 조회
const response = await api.get('/api/subscription');
const { plan, maxStaff, currentStaffCount, canAddStaff } = response.data;

// UI 표시
<div>
  <h3>{plan.planDescription} 플랜</h3>
  <p>직원: {currentStaffCount}/{maxStaff}명</p>
  <button disabled={!canAddStaff}>직원 추가</button>
</div>
```

---

### 플랜 변경 화면

**주의 사항**:
- 다운그레이드 시 경고 메시지 표시
- 현재 사용량이 새 플랜 제한을 초과하면 차단
- 업그레이드는 즉시 적용

**구현 예시**:
```typescript
// 플랜 변경
try {
  await api.post('/api/subscription/change-plan', {
    newPlan: 'PRO'
  });
  alert('플랜이 변경되었습니다!');
} catch (error) {
  if (error.code === 'SU005') {
    alert('현재 사용량이 새 플랜의 제한을 초과합니다. 직원을 먼저 삭제해주세요.');
  }
}
```

---

### 직원 추가 버튼 활성화

```typescript
// 구독 정보에서 canAddStaff 값 사용
<button
  disabled={!subscription.canAddStaff}
  onClick={handleAddStaff}
>
  직원 추가
</button>

{!subscription.canAddStaff && (
  <p style={{color: 'red'}}>
    직원 수 제한에 도달했습니다. 플랜을 업그레이드하세요.
  </p>
)}
```

---

### 예약 생성 제한 안내

```typescript
// 예약 생성 전 체크
if (!subscription.canCreateReservation) {
  alert('월간 예약 수 제한에 도달했습니다. 플랜을 업그레이드하세요.');
  return;
}

// 예약 생성 진행
await api.post('/api/businesses/1/reservations', reservationData);
```

---

## 🏆 성과 및 개선 사항

### 핵심 성과

1. **SaaS 수익 모델 완성**
   - 플랜별 차별화된 제한 사항
   - 다운그레이드 방지 로직으로 서비스 품질 유지

2. **실시간 사용량 관리**
   - 직원/예약 수 캐시 카운터로 빠른 제한 체크
   - DB 조회 최소화 (성능 최적화)

3. **명확한 에러 메시지**
   - 프론트엔드에서 바로 사용 가능한 친절한 메시지
   - 에러 코드 체계화 (SU, SL 접두사)

4. **확장 가능한 구조**
   - 새 플랜 추가 시 Enum만 수정하면 자동 적용
   - 배치 작업 추가 용이 (Phase 5)

---

## 📞 문의 및 피드백

Phase 2 구독 관리 도메인 구현에 대한 문의 사항이나 개선 제안은 개발팀에 연락 부탁드립니다.

**다음**: Phase 3 - 결제 연동 도메인 구현

---

**End of Report**
