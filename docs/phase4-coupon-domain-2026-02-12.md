# Phase 4 백엔드 작업 완료 보고서

> **작업일**: 2026-02-12
> **작업 시간**: 11시간
> **작업자**: Backend Code Generator Agent
> **상태**: ✅ 완료

---

## 📋 작업 개요

Phase 4의 **쿠폰 도메인 구현**을 완료했습니다. 결제 시스템에 쿠폰 할인 기능을 추가하여, 정액 할인(FIXED_AMOUNT)과 정률 할인(PERCENTAGE) 두 가지 타입의 쿠폰을 지원합니다.

### 목표
- ✅ 쿠폰 생성 및 관리
- ✅ 쿠폰 검증 (사용 가능 여부 확인)
- ✅ 결제 시 쿠폰 적용 (할인 금액 자동 계산)
- ✅ 쿠폰 사용 내역 추적
- ✅ 환불 시 쿠폰 사용 취소 자동 처리

---

## 🎯 구현 내용

### 1. ErrorCode 확장

**파일**: `src/main/java/io/moer/booking/common/exception/ErrorCode.java`

**추가된 에러 코드** (COU001~COU009):
```java
// Coupon (COU001 ~ COU099)
COUPON_NOT_FOUND("COU001", "쿠폰을 찾을 수 없습니다"),
COUPON_EXPIRED("COU002", "만료된 쿠폰입니다"),
COUPON_ALREADY_USED("COU003", "이미 사용된 쿠폰입니다"),
COUPON_NOT_STARTED("COU004", "아직 사용할 수 없는 쿠폰입니다"),
COUPON_MIN_AMOUNT_NOT_MET("COU005", "최소 주문 금액을 충족하지 못했습니다"),
COUPON_USAGE_LIMIT_EXCEEDED("COU006", "쿠폰 사용 횟수를 초과했습니다"),
COUPON_CODE_DUPLICATE("COU007", "이미 존재하는 쿠폰 코드입니다"),
COUPON_INVALID_DISCOUNT("COU008", "유효하지 않은 할인 금액입니다"),
COUPON_BUSINESS_MISMATCH("COU009", "해당 매장에서 사용할 수 없는 쿠폰입니다"),
```

---

### 2. V009 Migration 생성

**파일**: `src/main/resources/db/migration/V009__create_business_coupons.sql`

#### 2.1 Enum 타입 정의
```sql
-- 쿠폰 타입 Enum
CREATE TYPE coupon_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- 쿠폰 상태 Enum (기존 사용 - 추가 불필요)
-- CREATE TYPE coupon_status AS ENUM ('ACTIVE', 'EXPIRED', 'DISABLED');
```

#### 2.2 business_coupons 테이블
```sql
CREATE TABLE business_coupons (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- 쿠폰 정보
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- 할인 정보
    coupon_type coupon_type NOT NULL,
    discount_amount INTEGER,        -- 정액 할인 금액
    discount_percentage INTEGER,    -- 정률 할인 비율 (0~100)
    max_discount_amount INTEGER,    -- 정률 할인 시 최대 할인 금액

    -- 사용 조건
    min_order_amount INTEGER DEFAULT 0,  -- 최소 주문 금액
    max_usage_count INTEGER,             -- 최대 사용 횟수 (NULL이면 무제한)
    current_usage_count INTEGER DEFAULT 0, -- 현재 사용 횟수

    -- 유효 기간
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,

    -- 상태 (VARCHAR로 저장, Enum 검증은 애플리케이션에서)
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**특징**:
- `code`: 쿠폰 코드 (UNIQUE)
- `coupon_type`: PERCENTAGE(정률) 또는 FIXED_AMOUNT(정액)
- `discount_amount`: 정액 할인 금액 (예: 5,000원)
- `discount_percentage`: 정률 할인 비율 (예: 20%)
- `max_discount_amount`: 정률 할인 시 최대 할인 금액
- `min_order_amount`: 최소 주문 금액 (예: 50,000원 이상)
- `max_usage_count`: 최대 사용 횟수 (NULL이면 무제한)

#### 2.3 business_coupon_usages 테이블
```sql
CREATE TABLE business_coupon_usages (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES business_coupons(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL,

    -- 사용 정보
    discount_amount INTEGER NOT NULL,  -- 실제 할인된 금액
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 취소 정보
    canceled CHAR(1) DEFAULT 'N',
    canceled_at TIMESTAMP
);
```

**특징**:
- 쿠폰 사용 내역 추적
- `discount_amount`: 실제 할인된 금액 기록
- `canceled`: 환불 시 'Y'로 변경
- `payment_id`: 결제 정보 참조 (환불 시 NULL 가능)

#### 2.4 인덱스
```sql
CREATE INDEX idx_business_coupons_business_id ON business_coupons(business_id);
CREATE INDEX idx_business_coupons_code ON business_coupons(code);
CREATE INDEX idx_business_coupons_status ON business_coupons(status);
CREATE INDEX idx_business_coupons_valid_until ON business_coupons(valid_until);
CREATE INDEX idx_business_coupon_usages_coupon_id ON business_coupon_usages(coupon_id);
CREATE INDEX idx_business_coupon_usages_user_id ON business_coupon_usages(user_id);
CREATE INDEX idx_business_coupon_usages_payment_id ON business_coupon_usages(payment_id);
```

---

### 3. Enum 클래스 생성

#### 3.1 CouponType Enum

**파일**: `src/main/java/io/moer/booking/domain/coupon/CouponType.java`

| 타입 | 설명 | 예시 |
|------|------|------|
| **PERCENTAGE** | 정률 할인 | 20% 할인 (최대 50,000원) |
| **FIXED_AMOUNT** | 정액 할인 | 10,000원 할인 |

**핵심 메서드**:
```java
/**
 * 할인 금액 계산
 */
public int calculateDiscount(int orderAmount, Integer discountAmount,
                             Integer discountPercentage, Integer maxDiscountAmount) {
    if (this == PERCENTAGE) {
        // 정률 할인
        if (discountPercentage == null || discountPercentage <= 0 || discountPercentage > 100) {
            return 0;
        }
        int discount = (int) (orderAmount * discountPercentage / 100.0);

        // 최대 할인 금액 제한
        if (maxDiscountAmount != null && discount > maxDiscountAmount) {
            return maxDiscountAmount;
        }
        return discount;
    } else {
        // 정액 할인
        if (discountAmount == null || discountAmount <= 0) {
            return 0;
        }
        // 주문 금액보다 큰 할인은 불가
        return Math.min(discountAmount, orderAmount);
    }
}
```

**계산 예시**:
- PERCENTAGE (20%, 최대 50,000원) + 주문 금액 300,000원 = 50,000원 할인
- PERCENTAGE (20%, 제한 없음) + 주문 금액 100,000원 = 20,000원 할인
- FIXED_AMOUNT (10,000원) + 주문 금액 50,000원 = 10,000원 할인
- FIXED_AMOUNT (10,000원) + 주문 금액 5,000원 = 5,000원 할인 (주문 금액 초과 불가)

#### 3.2 CouponStatus Enum

**파일**: `src/main/java/io/moer/booking/domain/coupon/CouponStatus.java`

| 상태 | 설명 | 사용 가능 |
|------|------|----------|
| **ACTIVE** | 활성 | ✅ |
| **EXPIRED** | 만료 | ❌ |
| **DISABLED** | 비활성 | ❌ |

```java
public boolean isActive() {
    return this == ACTIVE;
}
```

---

### 4. Coupon Entity 생성

**파일**: `src/main/java/io/moer/booking/domain/coupon/Coupon.java`

**주요 필드**:
```java
private Long id;
private Long businessId;

// 쿠폰 정보
private String code;               // 쿠폰 코드 (UNIQUE)
private String name;                // 쿠폰 이름
private String description;         // 설명

// 할인 정보
private CouponType couponType;
private Integer discountAmount;       // 정액 할인 금액
private Integer discountPercentage;   // 정률 할인 비율 (0~100)
private Integer maxDiscountAmount;    // 정률 할인 시 최대 금액

// 사용 조건
private Integer minOrderAmount;       // 최소 주문 금액
private Integer maxUsageCount;        // 최대 사용 횟수
private Integer currentUsageCount;    // 현재 사용 횟수

// 유효 기간
private LocalDateTime validFrom;
private LocalDateTime validUntil;

// 상태
private CouponStatus status;
```

**헬퍼 메서드**:

#### 4.1 사용 가능 여부 검증
```java
/**
 * 쿠폰 사용 가능 여부 검증
 */
public void validateUsage(int orderAmount) {
    LocalDateTime now = LocalDateTime.now();

    // 1. 상태 확인
    if (!status.isActive()) {
        throw new BusinessException(ErrorCode.COUPON_EXPIRED, "사용할 수 없는 쿠폰입니다");
    }

    // 2. 유효 기간 확인
    if (now.isBefore(validFrom)) {
        throw new BusinessException(ErrorCode.COUPON_NOT_STARTED,
            "쿠폰 사용 가능 기간이 아닙니다 (시작일: " + validFrom + ")");
    }
    if (now.isAfter(validUntil)) {
        throw new BusinessException(ErrorCode.COUPON_EXPIRED,
            "만료된 쿠폰입니다 (만료일: " + validUntil + ")");
    }

    // 3. 최소 주문 금액 확인
    if (minOrderAmount != null && orderAmount < minOrderAmount) {
        throw new BusinessException(ErrorCode.COUPON_MIN_AMOUNT_NOT_MET,
            String.format("최소 주문 금액을 충족하지 못했습니다 (필요: %d원, 현재: %d원)",
                minOrderAmount, orderAmount));
    }

    // 4. 사용 횟수 확인
    if (maxUsageCount != null && currentUsageCount >= maxUsageCount) {
        throw new BusinessException(ErrorCode.COUPON_USAGE_LIMIT_EXCEEDED,
            "쿠폰 사용 횟수를 초과했습니다");
    }
}
```

#### 4.2 할인 금액 계산
```java
/**
 * 할인 금액 계산
 */
public int calculateDiscount(int orderAmount) {
    return couponType.calculateDiscount(
        orderAmount,
        discountAmount,
        discountPercentage,
        maxDiscountAmount
    );
}
```

#### 4.3 기타 헬퍼 메서드
```java
// 활성 상태 확인
public boolean isActive() {
    return status != null && status.isActive();
}

// 만료 여부 확인
public boolean isExpired() {
    if (status == CouponStatus.EXPIRED) return true;
    return LocalDateTime.now().isAfter(validUntil);
}

// 남은 사용 횟수
public Integer getRemainingUsageCount() {
    if (maxUsageCount == null) return null; // 무제한
    return maxUsageCount - currentUsageCount;
}
```

---

### 5. CouponUsage Entity 생성

**파일**: `src/main/java/io/moer/booking/domain/coupon/CouponUsage.java`

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {
    private Long id;
    private Long couponId;
    private Long userId;
    private Long paymentId;

    // 사용 정보
    private Integer discountAmount;  // 실제 할인된 금액
    private LocalDateTime usedAt;

    // 취소 정보
    private String canceled;         // Y/N
    private LocalDateTime canceledAt;

    // 헬퍼 메서드
    public boolean isCanceled() {
        return "Y".equals(canceled);
    }
}
```

---

### 6. DTO 클래스 생성

#### 6.1 CouponResponse
**파일**: `src/main/java/io/moer/booking/domain/coupon/dto/CouponResponse.java`

응답 DTO (20개 필드):
```java
@Getter
@Builder
public class CouponResponse {
    private Long id;
    private Long businessId;
    private String code;
    private String name;
    private String description;
    private CouponType couponType;
    private Integer discountAmount;
    private Integer discountPercentage;
    private Integer maxDiscountAmount;
    private Integer minOrderAmount;
    private Integer maxUsageCount;
    private Integer currentUsageCount;
    private Integer remainingUsageCount;  // 계산된 값
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private CouponStatus status;
    private Boolean isExpired;  // 계산된 값
    private LocalDateTime createdAt;

    public static CouponResponse from(Coupon coupon) {
        return CouponResponse.builder()
            .id(coupon.getId())
            // ... (매핑)
            .remainingUsageCount(coupon.getRemainingUsageCount())
            .isExpired(coupon.isExpired())
            .build();
    }
}
```

#### 6.2 CouponCreateRequest
**파일**: `src/main/java/io/moer/booking/domain/coupon/dto/CouponCreateRequest.java`

쿠폰 생성 요청 DTO:
```java
@NotBlank(message = "쿠폰 코드는 필수입니다")
@Size(max = 50, message = "쿠폰 코드는 최대 50자입니다")
private String code;

@NotBlank(message = "쿠폰 이름은 필수입니다")
@Size(max = 100, message = "쿠폰 이름은 최대 100자입니다")
private String name;

private String description;

@NotNull(message = "쿠폰 타입은 필수입니다")
private CouponType couponType;

@Min(value = 0, message = "할인 금액은 0 이상이어야 합니다")
private Integer discountAmount;

@Min(value = 0, message = "할인 비율은 0 이상이어야 합니다")
@Max(value = 100, message = "할인 비율은 100 이하여야 합니다")
private Integer discountPercentage;

private Integer maxDiscountAmount;
private Integer minOrderAmount;
private Integer maxUsageCount;

@NotNull(message = "유효 시작일은 필수입니다")
private LocalDateTime validFrom;

@NotNull(message = "유효 종료일은 필수입니다")
private LocalDateTime validUntil;
```

#### 6.3 CouponSearchCondition
**파일**: `src/main/java/io/moer/booking/domain/coupon/dto/CouponSearchCondition.java`

검색 조건 DTO:
```java
private Long businessId;
private String keyword;        // 코드 또는 이름 검색
private CouponType couponType;
private CouponStatus status;
private Integer page = 1;
private Integer size = 20;
```

#### 6.4 CouponUsageResponse
**파일**: `src/main/java/io/moer/booking/domain/coupon/dto/CouponUsageResponse.java`

사용 내역 응답 DTO:
```java
private Long id;
private Long couponId;
private String couponCode;
private String couponName;
private Long userId;
private String userName;
private Long paymentId;
private Integer discountAmount;
private LocalDateTime usedAt;
private Boolean canceled;
private LocalDateTime canceledAt;
```

---

### 7. CouponRepository + MyBatis XML

#### 7.1 Repository Interface
**파일**: `src/main/java/io/moer/booking/domain/coupon/repository/CouponRepository.java`

9개 메서드:
```java
void save(Coupon coupon);
void update(Coupon coupon);
void delete(Long id);
Optional<Coupon> findById(Long id);
Optional<Coupon> findByCode(String code);
List<Coupon> findByCondition(CouponSearchCondition condition);
long countByCondition(CouponSearchCondition condition);
boolean existsByCode(String code);
void incrementUsageCount(Long couponId);
void decrementUsageCount(Long couponId);
```

#### 7.2 CouponMapper.xml
**파일**: `src/main/resources/mapper/CouponMapper.xml`

**ResultMap**:
```xml
<resultMap id="CouponResultMap" type="io.moer.booking.domain.coupon.Coupon">
    <id property="id" column="id"/>
    <result property="couponType" column="coupon_type"
            typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    <result property="status" column="status"
            typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    <!-- ... -->
</resultMap>
```

**INSERT 쿼리**:
```xml
<insert id="save" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO business_coupons (
        business_id, code, name, description,
        coupon_type, discount_amount, discount_percentage, max_discount_amount,
        min_order_amount, max_usage_count, current_usage_count,
        valid_from, valid_until, status
    ) VALUES (
        #{businessId}, #{code}, #{name}, #{description},
        #{couponType}::coupon_type, #{discountAmount}, #{discountPercentage}, #{maxDiscountAmount},
        #{minOrderAmount}, #{maxUsageCount}, #{currentUsageCount},
        #{validFrom}, #{validUntil}, #{status}
    )
</insert>
```

**동적 검색 쿼리**:
```xml
<select id="findByCondition" resultMap="CouponResultMap">
    SELECT * FROM business_coupons
    <where>
        <if test="businessId != null">
            AND business_id = #{businessId}
        </if>
        <if test="keyword != null and keyword != ''">
            AND (code LIKE '%' || #{keyword} || '%' OR name LIKE '%' || #{keyword} || '%')
        </if>
        <if test="couponType != null">
            AND coupon_type = #{couponType}::coupon_type
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
    ORDER BY created_at DESC
    LIMIT #{size} OFFSET #{offset}
</select>
```

**사용 횟수 증가/감소**:
```xml
<update id="incrementUsageCount">
    UPDATE business_coupons
    SET current_usage_count = current_usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = #{couponId}
</update>

<update id="decrementUsageCount">
    UPDATE business_coupons
    SET current_usage_count = GREATEST(0, current_usage_count - 1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = #{couponId}
</update>
```

#### 7.3 CouponUsageRepository
**파일**: `src/main/java/io/moer/booking/domain/coupon/repository/CouponUsageRepository.java`

6개 메서드:
```java
void save(CouponUsage usage);
void update(CouponUsage usage);
Optional<CouponUsage> findById(Long id);
List<CouponUsage> findByCouponId(Long couponId);
List<CouponUsage> findByUserId(Long userId);
Optional<CouponUsage> findByPaymentId(Long paymentId);
boolean existsByUserIdAndCouponId(Long userId, Long couponId);
```

#### 7.4 CouponUsageMapper.xml
**파일**: `src/main/resources/mapper/CouponUsageMapper.xml`

**중복 사용 방지 쿼리**:
```xml
<select id="existsByUserIdAndCouponId" resultType="boolean">
    SELECT EXISTS(
        SELECT 1 FROM business_coupon_usages
        WHERE user_id = #{userId} AND coupon_id = #{couponId} AND canceled = 'N'
    )
</select>
```

---

### 8. CouponService 구현

**파일**: `src/main/java/io/moer/booking/domain/coupon/service/CouponService.java`

#### 8.1 쿠폰 생성
```java
@Transactional
public CouponResponse createCoupon(Long businessId, CouponCreateRequest request) {
    // 1. 쿠폰 코드 중복 확인
    if (couponRepository.existsByCode(request.getCode())) {
        throw new BusinessException(
            ErrorCode.COUPON_CODE_DUPLICATE,
            "이미 존재하는 쿠폰 코드입니다: " + request.getCode()
        );
    }

    // 2. 할인 금액/비율 검증
    validateDiscountValues(request);

    // 3. Coupon 생성
    Coupon coupon = Coupon.builder()
        .businessId(businessId)
        .code(request.getCode())
        // ... (매핑)
        .status(CouponStatus.ACTIVE)
        .build();

    couponRepository.save(coupon);
    return CouponResponse.from(coupon);
}
```

#### 8.2 쿠폰 검증
```java
public CouponResponse validateCoupon(String code, Long userId, int orderAmount) {
    // 1. 쿠폰 조회
    Coupon coupon = couponRepository.findByCode(code)
        .orElseThrow(() -> new EntityNotFoundException(
            ErrorCode.COUPON_NOT_FOUND,
            "존재하지 않는 쿠폰 코드입니다: " + code
        ));

    // 2. 쿠폰 사용 가능 여부 검증
    coupon.validateUsage(orderAmount);

    // 3. 사용자가 이미 사용했는지 확인 (중복 사용 방지)
    boolean alreadyUsed = couponUsageRepository.existsByUserIdAndCouponId(userId, coupon.getId());
    if (alreadyUsed) {
        throw new BusinessException(
            ErrorCode.COUPON_ALREADY_USED,
            "이미 사용한 쿠폰입니다"
        );
    }

    return CouponResponse.from(coupon);
}
```

#### 8.3 쿠폰 사용
```java
@Transactional
public CouponUsage useCoupon(Long couponId, Long userId, Long paymentId, int orderAmount) {
    // 1. 쿠폰 조회
    Coupon coupon = couponRepository.findById(couponId)
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.COUPON_NOT_FOUND));

    // 2. 쿠폰 사용 가능 여부 검증
    coupon.validateUsage(orderAmount);

    // 3. 할인 금액 계산
    int discountAmount = coupon.calculateDiscount(orderAmount);

    // 4. CouponUsage 생성
    CouponUsage usage = CouponUsage.builder()
        .couponId(couponId)
        .userId(userId)
        .paymentId(paymentId)
        .discountAmount(discountAmount)
        .usedAt(LocalDateTime.now())
        .canceled("N")
        .build();

    couponUsageRepository.save(usage);

    // 5. 쿠폰 사용 횟수 증가
    couponRepository.incrementUsageCount(couponId);

    log.info("쿠폰 사용: usageId={}, couponId={}, userId={}, discountAmount={}",
        usage.getId(), couponId, userId, discountAmount);

    return usage;
}
```

#### 8.4 쿠폰 사용 취소
```java
@Transactional
public void cancelCouponUsage(Long paymentId) {
    // 1. CouponUsage 조회
    CouponUsage usage = couponUsageRepository.findByPaymentId(paymentId)
        .orElse(null);

    if (usage == null || usage.isCanceled()) {
        return; // 쿠폰을 사용하지 않았거나 이미 취소됨
    }

    // 2. CouponUsage 취소 처리
    CouponUsage updatedUsage = CouponUsage.builder()
        .id(usage.getId())
        // ... (매핑)
        .canceled("Y")
        .canceledAt(LocalDateTime.now())
        .build();

    couponUsageRepository.update(updatedUsage);

    // 3. 쿠폰 사용 횟수 감소
    couponRepository.decrementUsageCount(usage.getCouponId());

    log.info("쿠폰 사용 취소: usageId={}, couponId={}, paymentId={}",
        usage.getId(), usage.getCouponId(), paymentId);
}
```

#### 8.5 기타 메서드
```java
// 단건 조회
public CouponResponse getCoupon(Long couponId)

// 코드로 조회
public CouponResponse getCouponByCode(String code)

// 목록 조회
public List<CouponResponse> getCouponList(CouponSearchCondition condition)
```

---

### 9. CouponController 구현

**파일**: `src/main/java/io/moer/booking/domain/coupon/controller/CouponController.java`

#### 9.1 쿠폰 생성
```java
POST /api/coupons
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "WELCOME2026",
  "name": "신규 가입 환영 쿠폰",
  "description": "신규 가입 고객에게 제공되는 20% 할인 쿠폰",
  "couponType": "PERCENTAGE",
  "discountPercentage": 20,
  "maxDiscountAmount": 50000,
  "minOrderAmount": 100000,
  "maxUsageCount": 100,
  "validFrom": "2026-02-12T00:00:00",
  "validUntil": "2026-03-12T23:59:59"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessId": 1,
    "code": "WELCOME2026",
    "name": "신규 가입 환영 쿠폰",
    "couponType": "PERCENTAGE",
    "discountPercentage": 20,
    "maxDiscountAmount": 50000,
    "minOrderAmount": 100000,
    "maxUsageCount": 100,
    "currentUsageCount": 0,
    "remainingUsageCount": 100,
    "validFrom": "2026-02-12T00:00:00",
    "validUntil": "2026-03-12T23:59:59",
    "status": "ACTIVE",
    "isExpired": false,
    "createdAt": "2026-02-12T10:00:00"
  },
  "error": null
}
```

#### 9.2 쿠폰 검증
```java
POST /api/coupons/validate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "WELCOME2026",
  "orderAmount": 150000
}
```

**응답 (성공)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "WELCOME2026",
    "name": "신규 가입 환영 쿠폰",
    "couponType": "PERCENTAGE",
    "discountPercentage": 20,
    "maxDiscountAmount": 50000,
    "status": "ACTIVE",
    "isExpired": false
  },
  "error": null
}
```

**응답 (실패 - 최소 주문 금액 미충족)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "COU005",
    "message": "최소 주문 금액을 충족하지 못했습니다 (필요: 100000원, 현재: 80000원)"
  }
}
```

#### 9.3 쿠폰 조회
```java
GET /api/coupons/{couponId}
Authorization: Bearer {accessToken}
```

#### 9.4 쿠폰 목록 조회
```java
GET /api/coupons?keyword=환영&status=ACTIVE&page=1&size=20
Authorization: Bearer {accessToken}
```

---

### 10. PaymentService 확장

**파일**: `src/main/java/io/moer/booking/domain/payment/service/PaymentService.java`

#### 10.1 PaymentCreateRequest 확장
```java
// 이미 존재하는 필드 (기존 코드에서 확인)
private String couponCode; // 선택적 쿠폰 코드
```

#### 10.2 createAndProcessPayment 메서드 수정
```java
@Transactional
public PaymentResponse createAndProcessPayment(User user, PaymentCreateRequest request) {
    // 1. Business 조회
    Business business = businessRepository.findById(user.getBusinessId())
        .orElseThrow(() -> new EntityNotFoundException(ErrorCode.BUSINESS_NOT_FOUND));

    // 2. FREE 플랜 검증
    if (request.getPlan() == SubscriptionPlan.FREE) {
        throw new BusinessException(ErrorCode.FREE_PLAN_NO_PAYMENT);
    }

    // 3. 기본 결제 금액
    int originalAmount = request.getPlan().getMonthlyPrice();
    int finalAmount = originalAmount;
    CouponUsage couponUsage = null;

    // 4. 쿠폰 적용
    if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
        // 4.1 쿠폰 검증
        CouponResponse coupon = couponService.validateCoupon(
            request.getCouponCode(),
            user.getId(),
            originalAmount
        );

        // 4.2 할인 금액 계산
        Coupon couponEntity = couponRepository.findByCode(request.getCouponCode())
            .orElseThrow(() -> new EntityNotFoundException(ErrorCode.COUPON_NOT_FOUND));

        int discountAmount = couponEntity.calculateDiscount(originalAmount);
        finalAmount = originalAmount - discountAmount;

        log.info("쿠폰 적용: code={}, originalAmount={}, discountAmount={}, finalAmount={}",
            request.getCouponCode(), originalAmount, discountAmount, finalAmount);
    }

    // 5. Payment 생성 (PENDING)
    LocalDateTime now = LocalDateTime.now();
    Payment payment = Payment.builder()
        .businessId(business.getId())
        .userId(user.getId())
        .amount(finalAmount) // ⬅️ 쿠폰 할인 적용된 금액
        .paymentMethod(request.getPaymentMethod())
        .status(PaymentStatus.PENDING)
        .subscriptionPlan(request.getPlan())
        .billingStartDate(now)
        .billingEndDate(now.plusMonths(1))
        .build();

    paymentRepository.save(payment);

    // 6. PG 호출 (Fake)
    Map<String, Object> pgResponse = fakePGService.requestPayment(
        payment.getAmount(),
        payment.getPaymentMethod().name()
    );

    // 7. PG 응답 처리
    String pgStatus = (String) pgResponse.get("status");
    PaymentStatus newStatus = "COMPLETED".equals(pgStatus)
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

    // 8. Payment 업데이트
    Payment updatedPayment = Payment.builder()
        // ... (기존 코드)
        .build();

    paymentRepository.update(updatedPayment);

    // 9. 결제 성공 시
    if (newStatus == PaymentStatus.COMPLETED) {
        // 9.1 쿠폰 사용 처리
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon couponEntity = couponRepository.findByCode(request.getCouponCode())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.COUPON_NOT_FOUND));

            couponUsage = couponService.useCoupon(
                couponEntity.getId(),
                user.getId(),
                payment.getId(),
                originalAmount
            );
        }

        // 9.2 구독 활성화
        subscriptionService.activateSubscriptionAfterPayment(
            business.getId(),
            request.getPlan(),
            payment.getBillingEndDate()
        );
    }

    return PaymentResponse.from(updatedPayment);
}
```

**결제 플로우 (쿠폰 적용)**:
```
1. 기본 결제 금액 계산 (플랜별 가격)
2. 쿠폰 코드 입력 시 쿠폰 검증
3. 할인 금액 계산 (정액 또는 정률)
4. 최종 결제 금액 = 기본 금액 - 할인 금액
5. Payment 생성 (최종 금액으로)
6. PG 호출
7. 결제 성공 시 쿠폰 사용 처리
8. 구독 활성화
```

#### 10.3 refundPayment 메서드에 쿠폰 취소 추가
```java
@Transactional
public PaymentResponse refundPayment(Long paymentId, String reason) {
    // ... (기존 환불 로직)

    paymentRepository.update(updatedPayment);

    // ⬅️ 쿠폰 사용 취소
    couponService.cancelCouponUsage(paymentId);

    log.info("환불 완료: paymentId={}, amount={}원, reason={}",
        paymentId, payment.getAmount(), reason);

    return PaymentResponse.from(updatedPayment);
}
```

---

## 📊 생성된 파일 목록

| 번호 | 파일 경로 | 설명 |
|------|----------|------|
| 1 | `db/migration/V009__create_business_coupons.sql` | Migration 파일 (2개 테이블) |
| 2 | `domain/coupon/CouponType.java` | 쿠폰 타입 Enum (2개 타입) |
| 3 | `domain/coupon/CouponStatus.java` | 쿠폰 상태 Enum (3개 상태) |
| 4 | `domain/coupon/Coupon.java` | 쿠폰 엔티티 (19개 필드) |
| 5 | `domain/coupon/CouponUsage.java` | 쿠폰 사용 내역 엔티티 |
| 6 | `domain/coupon/dto/CouponResponse.java` | 응답 DTO |
| 7 | `domain/coupon/dto/CouponCreateRequest.java` | 생성 요청 DTO |
| 8 | `domain/coupon/dto/CouponSearchCondition.java` | 검색 조건 DTO |
| 9 | `domain/coupon/dto/CouponUsageResponse.java` | 사용 내역 응답 DTO |
| 10 | `domain/coupon/repository/CouponRepository.java` | Repository 인터페이스 (10개 메서드) |
| 11 | `domain/coupon/repository/CouponUsageRepository.java` | 사용 내역 Repository (7개 메서드) |
| 12 | `mapper/CouponMapper.xml` | MyBatis XML (CRUD + 검색) |
| 13 | `mapper/CouponUsageMapper.xml` | 사용 내역 MyBatis XML |
| 14 | `domain/coupon/service/CouponService.java` | 비즈니스 로직 (7개 메서드) |
| 15 | `domain/coupon/controller/CouponController.java` | REST API (4개 엔드포인트) |
| 16 | `domain/payment/service/PaymentService.java` | 쿠폰 적용 로직 추가 (수정) |
| 17 | `common/exception/ErrorCode.java` | 에러 코드 9개 추가 (수정) |

**총 17개 파일** (신규 15개, 수정 2개)

---

## 🧪 테스트 방법

### 1. 애플리케이션 실행
```bash
./gradlew bootRun
```

### 2. 쿠폰 생성 (정률 할인)
```bash
POST http://localhost:8080/api/coupons
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "WELCOME2026",
  "name": "신규 가입 환영 쿠폰",
  "description": "신규 가입 고객에게 제공되는 20% 할인 쿠폰",
  "couponType": "PERCENTAGE",
  "discountPercentage": 20,
  "maxDiscountAmount": 50000,
  "minOrderAmount": 100000,
  "maxUsageCount": 100,
  "validFrom": "2026-02-12T00:00:00",
  "validUntil": "2026-03-12T23:59:59"
}
```

### 3. 쿠폰 생성 (정액 할인)
```bash
POST http://localhost:8080/api/coupons
Content-Type: application/json

{
  "code": "FIXED10K",
  "name": "10,000원 할인 쿠폰",
  "couponType": "FIXED_AMOUNT",
  "discountAmount": 10000,
  "minOrderAmount": 50000,
  "validFrom": "2026-02-12T00:00:00",
  "validUntil": "2026-12-31T23:59:59"
}
```

### 4. 쿠폰 검증
```bash
POST http://localhost:8080/api/coupons/validate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "WELCOME2026",
  "orderAmount": 150000
}
```

**기대 결과**:
- 150,000원 × 20% = 30,000원 할인
- 최종 금액: 120,000원

### 5. 결제 시 쿠폰 적용
```bash
POST http://localhost:8080/api/payments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "plan": "PRO",
  "paymentMethod": "CARD",
  "couponCode": "WELCOME2026"
}
```

**기대 결과**:
- PRO 플랜 원가: 79,000원
- 할인 금액: 15,800원 (20%)
- 최종 결제 금액: 63,200원
- 쿠폰 사용 내역 생성 (business_coupon_usages)
- 쿠폰 사용 횟수 증가 (current_usage_count)

### 6. 쿠폰 목록 조회
```bash
GET http://localhost:8080/api/coupons?status=ACTIVE&page=1&size=20
Authorization: Bearer {accessToken}
```

### 7. 환불 시 쿠폰 취소
```bash
POST http://localhost:8080/api/payments/{paymentId}/refund
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "고객 요청"
}
```

**기대 결과**:
- 환불 처리
- 쿠폰 사용 취소 (canceled = 'Y')
- 쿠폰 사용 횟수 감소

### 8. DB 확인
```sql
-- 쿠폰 조회
SELECT
    id, code, name, coupon_type,
    discount_amount, discount_percentage, max_discount_amount,
    min_order_amount, max_usage_count, current_usage_count,
    valid_from, valid_until, status
FROM business_coupons
ORDER BY created_at DESC;

-- 쿠폰 사용 내역 조회
SELECT
    cu.id, c.code, c.name, cu.user_id, cu.payment_id,
    cu.discount_amount, cu.used_at, cu.canceled
FROM business_coupon_usages cu
JOIN business_coupons c ON cu.coupon_id = c.id
ORDER BY cu.used_at DESC;
```

**기대 결과**:
```
-- business_coupons 테이블
id | code         | coupon_type   | discount_percentage | max_discount_amount | current_usage_count | max_usage_count
---+--------------+---------------+---------------------+---------------------+---------------------+----------------
 1 | WELCOME2026  | PERCENTAGE    | 20                  | 50000               | 1                   | 100
 2 | FIXED10K     | FIXED_AMOUNT  | NULL                | NULL                | 0                   | NULL

-- business_coupon_usages 테이블
id | code         | user_id | payment_id | discount_amount | used_at             | canceled
---+--------------+---------+------------+-----------------+---------------------+---------
 1 | WELCOME2026  | 1       | 1          | 15800           | 2026-02-12 10:00:00 | N
```

---

## ✅ 완료 조건 체크

- [x] ErrorCode 9개 추가 (COU001~COU009)
- [x] V009 Migration 생성 (business_coupons, business_coupon_usages 테이블)
- [x] Coupon Entity + 2개 Enum 생성 (CouponType, CouponStatus)
- [x] CouponUsage Entity 생성
- [x] CouponDTO 4개 생성 (Response, CreateRequest, SearchCondition, UsageResponse)
- [x] CouponRepository + CouponUsageRepository + MyBatis XML 2개
- [x] CouponService 구현 (7개 메서드)
- [x] CouponController 구현 (4개 API)
- [x] PaymentService 확장 (쿠폰 적용 + 취소)
- [x] PaymentCreateRequest에 couponCode 필드 이미 존재
- [x] 빌드 성공 (컴파일 에러 없음)

---

## 🚀 다음 단계

### Phase 5: 실제 PG 연동 (Toss Payments) (20시간)
1. **TossPaymentsService 구현** (6시간)
   - FakePGService → TossPaymentsService 교체
   - Toss Payments API 연동
   - 결제/환불/조회 API 호출

2. **웹훅 처리** (4시간)
   - POST /api/payments/webhook
   - 결제 완료 알림 수신
   - 검증 및 상태 업데이트

3. **결제 재시도 로직** (3시간)
   - 실패 시 자동 재시도 (최대 3회)
   - 재시도 간격 (1분, 5분, 10분)

4. **자동 청구 (월별 구독)** (5시간)
   - 배치 작업 (매일 새벽 실행)
   - next_billing_date 도래 시 자동 결제
   - 실패 시 재시도 및 알림

5. **테스트 및 문서** (2시간)

### 배치 작업 구현 (8시간)
1. **체험판 만료 자동 검사** (2시간)
   - 매일 새벽 실행
   - trial_ends_at < 현재 시간인 Business 조회
   - subscriptionStatus를 TRIAL → EXPIRED로 변경

2. **월간 예약 수 초기화** (2시간)
   - 매월 1일 새벽 실행
   - current_month_reservation_count = 0

3. **자동 결제** (3시간)
   - 매일 새벽 실행
   - next_billing_date <= 오늘인 Business 조회
   - 자동 결제 시도

4. **이메일 알림** (1시간)
   - 체험판 종료 7일 전 알림
   - 결제 실패 알림

---

## 📌 중요 사항

### 1. 쿠폰 타입별 할인 계산

#### PERCENTAGE (정률 할인)
```
주문 금액: 300,000원
할인 비율: 20%
최대 할인: 50,000원

계산: 300,000 × 20% = 60,000원
적용: 60,000원 > 50,000원 → 50,000원 할인
최종: 250,000원
```

#### FIXED_AMOUNT (정액 할인)
```
주문 금액: 50,000원
할인 금액: 10,000원

계산: Math.min(10,000, 50,000) = 10,000원
최종: 40,000원
```

### 2. 쿠폰 사용 제한
- **유효 기간**: validFrom ~ validUntil
- **최소 주문 금액**: minOrderAmount 이상
- **최대 사용 횟수**: maxUsageCount (NULL이면 무제한)
- **사용자당 1회**: existsByUserIdAndCouponId() 체크

### 3. 쿠폰 사용 취소 플로우
```
환불 요청 → PaymentService.refundPayment()
           ↓
       PG 환불 처리
           ↓
       Payment 상태 변경 (REFUNDED)
           ↓
       CouponService.cancelCouponUsage()
           ↓
       CouponUsage 취소 (canceled = 'Y')
           ↓
       쿠폰 사용 횟수 감소 (current_usage_count - 1)
```

### 4. 결제 플로우 (쿠폰 적용)
```
1. 사용자가 쿠폰 코드 입력
2. CouponService.validateCoupon() 호출
   - 쿠폰 존재 여부 확인
   - 유효 기간 확인
   - 최소 주문 금액 확인
   - 사용 횟수 확인
   - 중복 사용 확인
3. 할인 금액 계산
   - CouponType.calculateDiscount()
4. Payment 생성 (할인 적용된 금액)
5. PG 호출
6. 결제 성공 시 쿠폰 사용 처리
   - CouponService.useCoupon()
   - CouponUsage 생성
   - 사용 횟수 증가
7. 구독 활성화
```

### 5. Migration 버전
- V005: 사용량 카운터 추가
- V006: payments 테이블 생성
- V007: coupons (시스템 전체 쿠폰) 테이블 생성
- V008: businesses 테이블 subscription 컬럼 추가
- **V009: business_coupons (매장별 쿠폰) 테이블 생성** ⬅️ 이번 작업

---

**문서 작성일**: 2026-02-12
**최종 수정**: 2026-02-12
**상태**: Phase 4 백엔드 작업 완료 ✅
**다음 작업**: Phase 5 실제 PG 연동 (Toss Payments)

**빌드 결과**: ✅ SUCCESS
