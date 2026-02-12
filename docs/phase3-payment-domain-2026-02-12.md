# Phase 3 백엔드 작업 완료 보고서

> **작업일**: 2026-02-12
> **작업 시간**: 7시간
> **작업자**: Backend Code Generator Agent
> **상태**: ✅ 완료

---

## 📋 작업 개요

Phase 3의 **결제 도메인 구현**을 완료했습니다. 테스트 단계에서는 FakePGService로 가짜 PG를 시뮬레이션하고, Phase 5에서 실제 Toss Payments를 연동할 예정입니다.

### 목표
- ✅ 결제 생성 및 처리 (FakePG 시뮬레이션)
- ✅ 환불 처리
- ✅ 결제 내역 조회/검색
- ✅ 구독 활성화 연동 (결제 완료 시 자동 활성화)

---

## 🎯 구현 내용

### 1. ErrorCode 확장

**파일**: `src/main/java/io/moer/booking/common/exception/ErrorCode.java`

**추가된 에러 코드** (PA001~PA010):
```java
// Payment (PA001 ~ PA010)
PAYMENT_NOT_FOUND("PA001", "결제 정보를 찾을 수 없습니다"),
PAYMENT_ALREADY_COMPLETED("PA002", "이미 완료된 결제입니다"),
PAYMENT_CANNOT_REFUND("PA003", "환불할 수 없는 결제 상태입니다"),
PAYMENT_REFUND_FAILED("PA004", "환불 처리에 실패했습니다"),
PAYMENT_METHOD_NOT_SUPPORTED("PA005", "지원하지 않는 결제 수단입니다"),
FREE_PLAN_NO_PAYMENT("PA006", "무료 플랜은 결제가 필요하지 않습니다"),
PG_CONNECTION_ERROR("PA007", "PG사 연결에 실패했습니다"),
PG_TRANSACTION_FAILED("PA008", "PG 거래 처리에 실패했습니다"),
PAYMENT_AMOUNT_INVALID("PA009", "결제 금액이 유효하지 않습니다"),
PAYMENT_PROCESSING_ERROR("PA010", "결제 처리 중 오류가 발생했습니다"),
```

---

### 2. V006 Migration (기존 활용)

**파일**: `src/main/resources/db/migration/V006__create_payments_table.sql`

기존에 생성된 payments 테이블을 활용합니다:
```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),

    -- 결제 정보
    amount INTEGER NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'PENDING',

    -- PG 정보
    pg_transaction_id VARCHAR(255),
    pg_payment_key VARCHAR(255),
    pg_response JSONB,

    -- 구독 정보
    subscription_plan VARCHAR(20) NOT NULL,
    billing_start_date TIMESTAMP NOT NULL,
    billing_end_date TIMESTAMP NOT NULL,

    -- 실패/환불 정보
    fail_reason VARCHAR(500),
    refund_reason VARCHAR(500),
    refunded_amount INTEGER,
    refunded_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**인덱스**:
- `idx_payments_business_id` - 매장별 조회
- `idx_payments_user_id` - 사용자별 조회
- `idx_payments_status` - 상태별 조회
- `idx_payments_created_at` - 생성일 정렬
- `idx_payments_pg_transaction_id` - PG 거래 ID 조회

---

### 3. Enum 클래스 생성

#### 3.1 PaymentStatus Enum

**파일**: `src/main/java/io/moer/booking/domain/payment/PaymentStatus.java`

| 상태 | 설명 | 환불 가능 |
|------|------|----------|
| **PENDING** | 결제 대기 | ❌ |
| **COMPLETED** | 결제 완료 | ✅ |
| **FAILED** | 결제 실패 | ❌ |
| **REFUNDED** | 환불 완료 | ❌ |

```java
public boolean isCompleted() {
    return this == COMPLETED;
}

public boolean canRefund() {
    return this == COMPLETED;
}
```

#### 3.2 PaymentMethod Enum

**파일**: `src/main/java/io/moer/booking/domain/payment/PaymentMethod.java`

| 결제 수단 | 설명 |
|----------|------|
| **CARD** | 카드 |
| **BANK_TRANSFER** | 계좌이체 |
| **VIRTUAL_ACCOUNT** | 가상계좌 |
| **MOBILE** | 간편결제 |

---

### 4. Payment Entity 생성

**파일**: `src/main/java/io/moer/booking/domain/payment/Payment.java`

**주요 필드**:
```java
private Long id;
private Long businessId;
private Long userId;

// 결제 정보
private Integer amount;
private PaymentMethod paymentMethod;
private PaymentStatus status;

// PG 정보
private String pgTransactionId;       // PG사 거래 ID
private String pgPaymentKey;          // PG사 결제 키
private Map<String, Object> pgResponse; // PG사 응답 (JSONB)

// 구독 정보
private SubscriptionPlan subscriptionPlan;
private LocalDateTime billingStartDate;
private LocalDateTime billingEndDate;

// 실패/환불 정보
private String failReason;
private String refundReason;
private Integer refundedAmount;
private LocalDateTime refundedAt;
```

**헬퍼 메서드**:
```java
public boolean isCompleted() {
    return PaymentStatus.COMPLETED.equals(this.status);
}

public boolean canRefund() {
    return status != null && status.canRefund();
}

public boolean isPending() {
    return PaymentStatus.PENDING.equals(this.status);
}
```

---

### 5. DTO 클래스 생성

#### 5.1 PaymentResponse
**파일**: `src/main/java/io/moer/booking/domain/payment/dto/PaymentResponse.java`

응답 DTO (18개 필드):
```java
public static PaymentResponse from(Payment payment) {
    return PaymentResponse.builder()
        .id(payment.getId())
        .businessId(payment.getBusinessId())
        .userId(payment.getUserId())
        .amount(payment.getAmount())
        .paymentMethod(payment.getPaymentMethod())
        .status(payment.getStatus())
        .pgTransactionId(payment.getPgTransactionId())
        .subscriptionPlan(payment.getSubscriptionPlan())
        // ... 생략
        .build();
}
```

#### 5.2 PaymentCreateRequest
**파일**: `src/main/java/io/moer/booking/domain/payment/dto/PaymentCreateRequest.java`

결제 생성 요청 DTO:
```java
@NotNull(message = "구독 플랜은 필수입니다")
private SubscriptionPlan plan;

@NotNull(message = "결제 수단은 필수입니다")
private PaymentMethod paymentMethod;
```

#### 5.3 PaymentSearchCondition
**파일**: `src/main/java/io/moer/booking/domain/payment/dto/PaymentSearchCondition.java`

검색 조건 DTO:
```java
private Long businessId;
private Long userId;
private PaymentStatus status;
private LocalDateTime startDate;
private LocalDateTime endDate;
private Integer page = 1;
private Integer size = 20;
```

---

### 6. PaymentRepository + MyBatis XML

#### 6.1 Repository Interface
**파일**: `src/main/java/io/moer/booking/domain/payment/repository/PaymentRepository.java`

7개 메서드:
```java
void save(Payment payment);
void update(Payment payment);
Optional<Payment> findById(Long id);
List<Payment> findByCondition(PaymentSearchCondition condition);
long countByCondition(PaymentSearchCondition condition);
Optional<Payment> findByPgTransactionId(String pgTransactionId);
Optional<Payment> findLatestByBusinessId(Long businessId);
```

#### 6.2 MyBatis XML
**파일**: `src/main/resources/mapper/PaymentMapper.xml`

**ResultMap**:
```xml
<resultMap id="PaymentResultMap" type="io.moer.booking.domain.payment.Payment">
    <id property="id" column="id"/>
    <result property="paymentMethod" column="payment_method"
            typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    <result property="status" column="payment_status"
            typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    <result property="pgResponse" column="pg_response"
            typeHandler="io.moer.booking.common.mybatis.JsonTypeHandler"/>
    <!-- ... -->
</resultMap>
```

**INSERT 쿼리**:
```xml
<insert id="save" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO payments (
        business_id, user_id, amount, payment_method, payment_status,
        pg_transaction_id, pg_payment_key, pg_response,
        subscription_plan, billing_start_date, billing_end_date
    ) VALUES (
        #{businessId}, #{userId}, #{amount}, #{paymentMethod}::payment_method,
        #{status}::payment_status,
        #{pgTransactionId}, #{pgPaymentKey},
        #{pgResponse, typeHandler=io.moer.booking.common.mybatis.JsonTypeHandler}::jsonb,
        #{subscriptionPlan}, #{billingStartDate}, #{billingEndDate}
    )
</insert>
```

**UPDATE 쿼리**:
```xml
<update id="update">
    UPDATE payments
    SET payment_status = #{status}::payment_status,
        pg_transaction_id = #{pgTransactionId},
        pg_payment_key = #{pgPaymentKey},
        pg_response = #{pgResponse, typeHandler=io.moer.booking.common.mybatis.JsonTypeHandler}::jsonb,
        fail_reason = #{failReason},
        refund_reason = #{refundReason},
        refunded_amount = #{refundedAmount},
        refunded_at = #{refundedAt},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = #{id}
</update>
```

**동적 검색 쿼리**:
```xml
<select id="findByCondition" resultMap="PaymentResultMap">
    SELECT * FROM payments
    <where>
        <if test="businessId != null">
            AND business_id = #{businessId}
        </if>
        <if test="userId != null">
            AND user_id = #{userId}
        </if>
        <if test="status != null">
            AND payment_status = #{status}::payment_status
        </if>
        <if test="startDate != null">
            AND created_at >= #{startDate}
        </if>
        <if test="endDate != null">
            AND created_at &lt;= #{endDate}
        </if>
    </where>
    ORDER BY created_at DESC
    LIMIT #{size} OFFSET #{offset}
</select>
```

---

### 7. FakePGService 구현

**파일**: `src/main/java/io/moer/booking/domain/payment/service/FakePGService.java`

테스트용 가짜 PG 서비스 (Phase 5에서 TossPaymentsService로 교체 예정):

#### 7.1 결제 요청 시뮬레이션
```java
public Map<String, Object> requestPayment(Integer amount, String paymentMethod) {
    log.info("🎭 FakePG: 결제 요청 - 금액: {}원, 수단: {}", amount, paymentMethod);

    // 90% 성공률
    boolean success = Math.random() < 0.9;

    Map<String, Object> response = new HashMap<>();
    response.put("transactionId", "FAKE_TXN_" + UUID.randomUUID().toString().substring(0, 8));
    response.put("paymentKey", "FAKE_KEY_" + UUID.randomUUID().toString().substring(0, 8));
    response.put("status", success ? "COMPLETED" : "FAILED");
    response.put("amount", amount);
    response.put("method", paymentMethod);

    if (!success) {
        response.put("failReason", "카드 한도 초과 (테스트)");
    }

    return response;
}
```

**성공 응답 예시**:
```json
{
  "transactionId": "FAKE_TXN_a1b2c3d4",
  "paymentKey": "FAKE_KEY_e5f6g7h8",
  "status": "COMPLETED",
  "amount": 29000,
  "method": "CARD"
}
```

**실패 응답 예시**:
```json
{
  "transactionId": "FAKE_TXN_i9j0k1l2",
  "paymentKey": "FAKE_KEY_m3n4o5p6",
  "status": "FAILED",
  "amount": 29000,
  "method": "CARD",
  "failReason": "카드 한도 초과 (테스트)"
}
```

#### 7.2 환불 요청 시뮬레이션
```java
public Map<String, Object> requestRefund(String transactionId, Integer amount, String reason) {
    log.info("🎭 FakePG: 환불 요청 - TXN: {}, 금액: {}원, 사유: {}", transactionId, amount, reason);

    // 항상 성공
    Map<String, Object> response = new HashMap<>();
    response.put("transactionId", transactionId);
    response.put("refundStatus", "COMPLETED");
    response.put("refundedAmount", amount);
    response.put("refundReason", reason);

    return response;
}
```

#### 7.3 결제 상태 조회 시뮬레이션
```java
public Map<String, Object> getPaymentStatus(String transactionId) {
    Map<String, Object> response = new HashMap<>();
    response.put("transactionId", transactionId);
    response.put("status", "COMPLETED");
    response.put("timestamp", LocalDateTime.now().toString());

    return response;
}
```

---

### 8. PaymentService 구현

**파일**: `src/main/java/io/moer/booking/domain/payment/service/PaymentService.java`

#### 8.1 결제 생성 및 처리
```java
@Transactional
public PaymentResponse createAndProcessPayment(User user, PaymentCreateRequest request) {
    // 1. Business 조회
    Business business = businessRepository.findById(user.getBusinessId())
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BUSINESS_NOT_FOUND));

    // 2. FREE 플랜 검증
    if (request.getPlan() == SubscriptionPlan.FREE) {
        throw new BusinessException(
            ErrorCode.FREE_PLAN_NO_PAYMENT,
            "무료 플랜은 결제가 필요하지 않습니다"
        );
    }

    // 3. Payment 생성 (PENDING)
    LocalDateTime now = LocalDateTime.now();
    Payment payment = Payment.builder()
        .businessId(business.getId())
        .userId(user.getId())
        .amount(request.getPlan().getMonthlyPrice())
        .paymentMethod(request.getPaymentMethod())
        .status(PaymentStatus.PENDING)
        .subscriptionPlan(request.getPlan())
        .billingStartDate(now)
        .billingEndDate(now.plusMonths(1))
        .build();

    paymentRepository.save(payment);

    // 4. PG 호출 (Fake)
    Map<String, Object> pgResponse = fakePGService.requestPayment(
        payment.getAmount(),
        payment.getPaymentMethod().name()
    );

    // 5. PG 응답 처리
    String pgStatus = (String) pgResponse.get("status");
    PaymentStatus newStatus = "COMPLETED".equals(pgStatus)
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

    // 6. Payment 업데이트
    Payment updatedPayment = Payment.builder()
        .id(payment.getId())
        .businessId(payment.getBusinessId())
        .userId(payment.getUserId())
        .amount(payment.getAmount())
        .paymentMethod(payment.getPaymentMethod())
        .status(newStatus)
        .pgTransactionId((String) pgResponse.get("transactionId"))
        .pgPaymentKey((String) pgResponse.get("paymentKey"))
        .pgResponse(pgResponse)
        .subscriptionPlan(payment.getSubscriptionPlan())
        .billingStartDate(payment.getBillingStartDate())
        .billingEndDate(payment.getBillingEndDate())
        .failReason(newStatus == PaymentStatus.FAILED ? (String) pgResponse.get("failReason") : null)
        .build();

    paymentRepository.update(updatedPayment);

    // 7. 결제 성공 시 구독 활성화
    if (newStatus == PaymentStatus.COMPLETED) {
        subscriptionService.activateSubscriptionAfterPayment(
            business.getId(),
            request.getPlan(),
            payment.getBillingEndDate()
        );
    }

    return PaymentResponse.from(updatedPayment);
}
```

#### 8.2 환불 처리
```java
@Transactional
public PaymentResponse refundPayment(Long paymentId, String reason) {
    // 1. Payment 조회
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.PAYMENT_NOT_FOUND));

    // 2. 환불 가능 여부 확인
    if (!payment.canRefund()) {
        throw new BusinessException(
            ErrorCode.PAYMENT_CANNOT_REFUND,
            "환불할 수 없는 결제입니다 (현재 상태: " + payment.getStatus() + ")"
        );
    }

    // 3. PG 환불 호출 (Fake)
    Map<String, Object> refundResponse = fakePGService.requestRefund(
        payment.getPgTransactionId(),
        payment.getAmount(),
        reason
    );

    // 4. Payment 업데이트
    Payment updatedPayment = Payment.builder()
        .id(payment.getId())
        .businessId(payment.getBusinessId())
        .userId(payment.getUserId())
        .amount(payment.getAmount())
        .paymentMethod(payment.getPaymentMethod())
        .status(PaymentStatus.REFUNDED)
        .pgTransactionId(payment.getPgTransactionId())
        .pgPaymentKey(payment.getPgPaymentKey())
        .pgResponse(payment.getPgResponse())
        .subscriptionPlan(payment.getSubscriptionPlan())
        .billingStartDate(payment.getBillingStartDate())
        .billingEndDate(payment.getBillingEndDate())
        .refundReason(reason)
        .refundedAmount(payment.getAmount())
        .refundedAt(LocalDateTime.now())
        .build();

    paymentRepository.update(updatedPayment);

    return PaymentResponse.from(updatedPayment);
}
```

#### 8.3 기타 메서드
```java
// 단건 조회
public PaymentResponse getPayment(Long paymentId)

// 목록 조회
public List<PaymentResponse> getPaymentList(PaymentSearchCondition condition)

// 개수 조회
public long countPayments(PaymentSearchCondition condition)

// PG 거래 ID로 조회
public PaymentResponse getPaymentByPgTransactionId(String pgTransactionId)

// 최근 결제 조회
public PaymentResponse getLatestPayment(Long businessId)
```

---

### 9. PaymentController 구현

**파일**: `src/main/java/io/moer/booking/domain/payment/controller/PaymentController.java`

#### 9.1 결제 생성 및 처리
```java
POST /api/payments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "plan": "BASIC",
  "paymentMethod": "CARD"
}
```

**응답 (성공)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessId": 1,
    "userId": 1,
    "amount": 29000,
    "paymentMethod": "CARD",
    "status": "COMPLETED",
    "pgTransactionId": "FAKE_TXN_a1b2c3d4",
    "subscriptionPlan": "BASIC",
    "billingStartDate": "2026-02-12T10:00:00",
    "billingEndDate": "2026-03-12T10:00:00",
    "createdAt": "2026-02-12T10:00:00"
  },
  "error": null
}
```

**응답 (실패)**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "status": "FAILED",
    "failReason": "카드 한도 초과 (테스트)",
    // ...
  },
  "error": null
}
```

#### 9.2 환불
```java
POST /api/payments/{paymentId}/refund
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "고객 요청"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "REFUNDED",
    "refundReason": "고객 요청",
    "refundedAmount": 29000,
    "refundedAt": "2026-02-12T11:00:00",
    // ...
  },
  "error": null
}
```

#### 9.3 단건 조회
```java
GET /api/payments/{paymentId}
Authorization: Bearer {accessToken}
```

#### 9.4 목록 조회
```java
GET /api/payments?status=COMPLETED&page=1&size=20
Authorization: Bearer {accessToken}
```

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 29000,
      "status": "COMPLETED",
      "createdAt": "2026-02-12T10:00:00"
    },
    {
      "id": 2,
      "amount": 79000,
      "status": "COMPLETED",
      "createdAt": "2026-02-11T15:30:00"
    }
  ],
  "error": null
}
```

#### 9.5 PG 거래 ID로 조회
```java
GET /api/payments/pg/{pgTransactionId}
Authorization: Bearer {accessToken}
```

#### 9.6 최근 결제 조회
```java
GET /api/payments/latest
Authorization: Bearer {accessToken}
```

---

### 10. SubscriptionService 확장

**파일**: `src/main/java/io/moer/booking/domain/subscription/service/SubscriptionService.java`

#### activateSubscriptionAfterPayment 메서드 추가

```java
/**
 * 결제 완료 시 구독 활성화
 * PaymentService에서 결제 완료 후 호출
 */
@Transactional
public void activateSubscriptionAfterPayment(Long businessId, SubscriptionPlan newPlan, LocalDateTime billingEndDate) {
    Business business = businessRepository.findById(businessId)
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BUSINESS_NOT_FOUND));

    // 1. 체험판 종료 (로그)
    if (business.getSubscriptionStatus() == SubscriptionStatus.TRIAL) {
        log.info("체험판 종료: businessId={}, 이전 플랜={}", businessId, business.getSubscriptionPlan());
    }

    // 2. 유료 구독 활성화
    LocalDateTime now = LocalDateTime.now();
    Business updatedBusiness = Business.builder()
        .id(business.getId())
        .ownerId(business.getOwnerId())
        .name(business.getName())
        .businessType(business.getBusinessType())
        .phone(business.getPhone())
        .address(business.getAddress())
        .description(business.getDescription())
        .businessHours(business.getBusinessHours())
        .status(business.getStatus())
        .subscriptionPlan(newPlan)
        .subscriptionStatus(SubscriptionStatus.ACTIVE) // TRIAL → ACTIVE
        .trialStartedAt(business.getTrialStartedAt())
        .trialEndsAt(business.getTrialEndsAt())
        .subscriptionStartedAt(now) // 유료 구독 시작
        .nextBillingDate(billingEndDate) // 다음 결제일 (1개월 후)
        .currentStaffCount(business.getCurrentStaffCount())
        .currentMonthReservationCount(business.getCurrentMonthReservationCount())
        .dailyRevenueGoal(business.getDailyRevenueGoal())
        .monthlyRevenueGoal(business.getMonthlyRevenueGoal())
        .monthlyNewCustomerGoal(business.getMonthlyNewCustomerGoal())
        .build();

    businessRepository.update(updatedBusiness);

    log.info("유료 구독 활성화: businessId={}, plan={}, nextBillingDate={}",
        businessId, newPlan, billingEndDate);
}
```

**동작 흐름**:
1. PaymentService에서 결제 완료 (COMPLETED)
2. `activateSubscriptionAfterPayment()` 호출
3. Business의 `subscriptionStatus`를 `TRIAL` → `ACTIVE`로 변경
4. `subscriptionStartedAt` 설정 (유료 구독 시작일)
5. `nextBillingDate` 설정 (다음 결제 예정일)

---

## 📊 생성된 파일 목록

| 번호 | 파일 경로 | 설명 |
|------|----------|------|
| 1 | `domain/payment/Payment.java` | 결제 엔티티 (17개 필드) |
| 2 | `domain/payment/PaymentStatus.java` | 결제 상태 Enum (4개 상태) |
| 3 | `domain/payment/PaymentMethod.java` | 결제 수단 Enum (4개 수단) |
| 4 | `domain/payment/dto/PaymentResponse.java` | 응답 DTO |
| 5 | `domain/payment/dto/PaymentCreateRequest.java` | 생성 요청 DTO |
| 6 | `domain/payment/dto/PaymentSearchCondition.java` | 검색 조건 DTO |
| 7 | `domain/payment/repository/PaymentRepository.java` | Repository 인터페이스 (7개 메서드) |
| 8 | `mapper/PaymentMapper.xml` | MyBatis XML (CRUD + 검색) |
| 9 | `domain/payment/service/FakePGService.java` | 가짜 PG 서비스 (3개 메서드) |
| 10 | `domain/payment/service/PaymentService.java` | 비즈니스 로직 (7개 메서드) |
| 11 | `domain/payment/controller/PaymentController.java` | REST API (6개 엔드포인트) |
| 12 | `domain/subscription/service/SubscriptionService.java` | 구독 활성화 메서드 추가 (수정) |
| 13 | `common/exception/ErrorCode.java` | 에러 코드 10개 추가 (수정) |

**총 13개 파일** (신규 11개, 수정 2개)

---

## 🧪 테스트 방법

### 1. 애플리케이션 실행
```bash
./gradlew bootRun
```

### 2. 회원가입 및 로그인
```bash
# 회원가입 (30일 체험판 자동 시작)
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "테스트 사용자",
  "businessName": "테스트 매장",
  "businessType": "BEAUTY_SHOP",
  "selectedPlan": "BASIC"
}

# 로그인 (Access Token 획득)
POST http://localhost:8080/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. 결제 생성 (BASIC 플랜)
```bash
POST http://localhost:8080/api/payments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "plan": "BASIC",
  "paymentMethod": "CARD"
}
```

**기대 결과**:
- 90% 확률로 `status: "COMPLETED"` (성공)
- 10% 확률로 `status: "FAILED"` (실패)
- 성공 시 Business의 `subscriptionStatus`가 `TRIAL` → `ACTIVE`로 변경

### 4. 결제 실패 시나리오
FakePGService는 10% 확률로 실패하므로, 여러 번 시도하면 실패 케이스를 볼 수 있습니다:
```json
{
  "success": true,
  "data": {
    "status": "FAILED",
    "failReason": "카드 한도 초과 (테스트)",
    // ...
  }
}
```

### 5. 결제 내역 조회
```bash
GET http://localhost:8080/api/payments?status=COMPLETED&page=1&size=20
Authorization: Bearer {accessToken}
```

### 6. 환불 처리
```bash
POST http://localhost:8080/api/payments/{paymentId}/refund
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "고객 요청"
}
```

**기대 결과**:
- `status: "REFUNDED"`
- `refundedAmount: 29000`
- `refundedAt: "2026-02-12T11:00:00"`

### 7. DB 확인
```sql
-- 결제 내역 확인
SELECT
    id, business_id, amount, payment_method, payment_status,
    pg_transaction_id, subscription_plan,
    billing_start_date, billing_end_date,
    fail_reason, refund_reason, refunded_amount
FROM payments
ORDER BY created_at DESC
LIMIT 5;

-- 구독 활성화 확인
SELECT
    id, name, subscription_plan, subscription_status,
    trial_ends_at, subscription_started_at, next_billing_date
FROM businesses
WHERE id = 1;
```

**기대 결과**:
```
-- payments 테이블
id | business_id | amount | payment_status | pg_transaction_id     | subscription_plan | billing_end_date
---+-------------+--------+----------------+-----------------------+-------------------+------------------
 1 | 1           | 29000  | COMPLETED      | FAKE_TXN_a1b2c3d4     | BASIC             | 2026-03-12 10:00
 2 | 1           | 79000  | FAILED         | FAKE_TXN_e5f6g7h8     | PRO               | NULL

-- businesses 테이블 (결제 성공 후)
id | name        | subscription_plan | subscription_status | trial_ends_at       | subscription_started_at | next_billing_date
---+-------------+-------------------+---------------------+---------------------+-------------------------+-------------------
 1 | 테스트 매장   | BASIC             | ACTIVE              | 2026-03-14 10:00:00 | 2026-02-12 10:00:00     | 2026-03-12 10:00:00
```

---

## ✅ 완료 조건 체크

- [x] ErrorCode 10개 추가 (PA001~PA010)
- [x] V006 Migration 활용 (payments 테이블)
- [x] Payment Entity + 2개 Enum 생성 (PaymentStatus, PaymentMethod)
- [x] PaymentDTO 3개 생성 (Response, CreateRequest, SearchCondition)
- [x] PaymentRepository + MyBatis XML 작성 (7개 메서드)
- [x] FakePGService 구현 (90% 성공률, 3개 메서드)
- [x] PaymentService 구현 (7개 메서드)
- [x] PaymentController 구현 (6개 API)
- [x] SubscriptionService.activateSubscriptionAfterPayment() 추가
- [x] 빌드 성공 (컴파일 에러 없음)

---

## 🚀 다음 단계

### Phase 4: 쿠폰 도메인 구현 (13시간)
1. **Coupon Entity + Enum** (2시간)
   - CouponType (PERCENTAGE, FIXED_AMOUNT)
   - CouponStatus (ACTIVE, EXPIRED, USED)
   - 할인율/금액, 유효기간, 최소 주문 금액

2. **CouponUsage Entity** (1시간)
   - 쿠폰 사용 내역 (사용자, 결제, 사용일시)

3. **CouponService** (4시간)
   - 쿠폰 생성/조회/검증
   - 쿠폰 사용/취소
   - 할인 금액 계산

4. **CouponController** (2시간)
   - 쿠폰 CRUD API
   - 쿠폰 검증 API
   - 쿠폰 사용 내역 조회

5. **PaymentService 확장** (2시간)
   - 결제 시 쿠폰 적용
   - 할인 금액 계산 및 차감

6. **테스트 및 문서** (2시간)

### Phase 5: 실제 PG 연동 (Toss Payments) (20시간)
1. FakePGService → TossPaymentsService 교체
2. 실제 API 연동 (결제/환불/조회)
3. 웹훅 처리 (결제 완료 알림)
4. 결제 재시도 로직
5. 자동 청구 (월별 구독)

---

## 📌 중요 사항

### 1. FakePGService 동작 방식
- **성공률**: 90% (Math.random() < 0.9)
- **거래 ID**: UUID 기반 (FAKE_TXN_xxxxxxxx)
- **환불**: 항상 성공
- **Phase 5에서 교체**: TossPaymentsService로 대체 예정

### 2. 결제 흐름
```
사용자 요청 → PaymentService.createAndProcessPayment()
             ↓
         Payment 생성 (PENDING)
             ↓
         FakePGService 호출
             ↓
         PG 응답 (COMPLETED/FAILED)
             ↓
         Payment 업데이트
             ↓
    (성공 시) SubscriptionService.activateSubscriptionAfterPayment()
             ↓
         Business 구독 활성화 (TRIAL → ACTIVE)
```

### 3. 환불 흐름
```
사용자 요청 → PaymentService.refundPayment()
             ↓
         상태 검증 (COMPLETED만 가능)
             ↓
         FakePGService.requestRefund()
             ↓
         Payment 업데이트 (REFUNDED)
             ↓
         환불 금액/사유/일시 기록
```

### 4. FREE 플랜 정책
- FREE 플랜은 결제 불필요 (무료)
- 결제 시도 시 `ErrorCode.FREE_PLAN_NO_PAYMENT` 예외 발생
- 체험판 종료 후 FREE 플랜으로 다운그레이드 가능

### 5. 구독 활성화 시점
- 결제 완료 (COMPLETED) 시 자동 활성화
- `subscriptionStatus`: TRIAL → ACTIVE
- `subscriptionStartedAt`: 유료 구독 시작일 기록
- `nextBillingDate`: 1개월 후 자동 설정

### 6. Migration 버전
- V005: 사용량 카운터 추가
- **V006: payments 테이블 생성** ⬅️ 이번 작업에서 활용
- V007: coupons 테이블 생성 (Phase 4 예정)
- V008: businesses 테이블 subscription 컬럼 추가

---

**문서 작성일**: 2026-02-12
**최종 수정**: 2026-02-12
**상태**: Phase 3 백엔드 작업 완료 ✅
**다음 작업**: Phase 4 쿠폰 도메인 구현

**빌드 결과**: ✅ SUCCESS (19초)
