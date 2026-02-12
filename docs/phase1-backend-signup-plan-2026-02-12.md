# Phase 1 백엔드 작업 완료 보고서

> **작업일**: 2026-02-12
> **작업 시간**: 2시간
> **작업자**: Backend Developer
> **상태**: ✅ 완료

---

## 📋 작업 개요

Phase 1의 첫 번째 백엔드 작업인 **회원가입 플랜 선택 기능**을 구현했습니다.

### 목표
- ✅ 회원가입 시 구독 플랜(FREE, BASIC, PRO, ENTERPRISE) 선택 가능
- ✅ 선택한 플랜으로 매장 생성
- ✅ 30일 무료 체험 자동 설정
- ✅ 사용량 카운터 초기화

---

## 🎯 구현 내용

### 1. V008 Migration - businesses 테이블 확장

**파일**: `src/main/resources/db/migration/V008__add_subscription_columns_to_businesses.sql`

```sql
ALTER TABLE businesses
ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'FREE' NOT NULL,
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'TRIAL' NOT NULL,
ADD COLUMN trial_started_at TIMESTAMP,
ADD COLUMN trial_ends_at TIMESTAMP,
ADD COLUMN subscription_started_at TIMESTAMP,
ADD COLUMN next_billing_date TIMESTAMP;
```

**추가된 컬럼**:
- `subscription_plan` - 구독 플랜 (FREE, BASIC, PRO, ENTERPRISE)
- `subscription_status` - 구독 상태 (TRIAL, ACTIVE, EXPIRED, CANCELED, SUSPENDED)
- `trial_started_at` - 무료 체험 시작일
- `trial_ends_at` - 무료 체험 종료일 (30일)
- `subscription_started_at` - 유료 구독 시작일
- `next_billing_date` - 다음 결제 예정일

**기존 데이터 마이그레이션**:
```sql
UPDATE businesses
SET trial_started_at = created_at,
    trial_ends_at = created_at + INTERVAL '30 days'
WHERE trial_started_at IS NULL;
```

---

### 2. SubscriptionPlan Enum 생성

**파일**: `src/main/java/io/moer/booking/domain/business/SubscriptionPlan.java`

| 플랜 | 가격 | 최대 직원 수 | 월간 예약 수 |
|------|------|-------------|-------------|
| **FREE** | 무료 | 1명 | 30건 |
| **BASIC** | 29,000원/월 | 3명 | 100건 |
| **PRO** | 79,000원/월 | 10명 | 500건 |
| **ENTERPRISE** | 문의 | 무제한 | 무제한 |

**주요 메서드**:
```java
// 직원 추가 가능 여부
public boolean canAddStaff(int currentStaffCount) {
    if (maxStaff == -1) return true; // 무제한
    return currentStaffCount < maxStaff;
}

// 예약 생성 가능 여부
public boolean canCreateReservation(int currentMonthReservationCount) {
    if (maxMonthlyReservations == -1) return true; // 무제한
    return currentMonthReservationCount < maxMonthlyReservations;
}
```

---

### 3. SubscriptionStatus Enum 생성

**파일**: `src/main/java/io/moer/booking/domain/business/SubscriptionStatus.java`

| 상태 | 설명 | 서비스 사용 가능 |
|------|------|-----------------|
| **TRIAL** | 체험판 (30일 무료) | ✅ |
| **ACTIVE** | 활성 (유료 구독 중) | ✅ |
| **EXPIRED** | 만료됨 (결제 실패 또는 체험판 종료) | ❌ |
| **CANCELED** | 취소됨 (사용자가 직접 취소) | ❌ |
| **SUSPENDED** | 정지됨 (관리자가 강제 정지) | ❌ |

**주요 메서드**:
```java
// 서비스 사용 가능 여부
public boolean canUseService() {
    return this == TRIAL || this == ACTIVE;
}
```

---

### 4. Business Entity 확장

**파일**: `src/main/java/io/moer/booking/domain/business/Business.java`

**추가된 필드**:
```java
private SubscriptionPlan subscriptionPlan;
private SubscriptionStatus subscriptionStatus;
private LocalDateTime trialStartedAt;
private LocalDateTime trialEndsAt;
private LocalDateTime subscriptionStartedAt;
private LocalDateTime nextBillingDate;
private Integer currentStaffCount;
private Integer currentMonthReservationCount;
```

**추가된 헬퍼 메서드**:
```java
// 체험판 활성 여부
public boolean isTrialActive()

// 체험판 만료 여부
public boolean isTrialExpired()

// 체험판 남은 일수
public long getDaysUntilTrialEnd()

// 서비스 사용 가능 여부
public boolean canUseService()

// 직원 추가 가능 여부 (플랜 제한 체크)
public boolean canAddStaff()

// 예약 생성 가능 여부 (플랜 제한 체크)
public boolean canCreateReservation()

// 무료/유료 플랜 확인
public boolean isFreePlan()
public boolean isPaidPlan()
```

---

### 5. RegisterRequest DTO 확장

**파일**: `src/main/java/io/moer/booking/domain/auth/dto/RegisterRequest.java`

**추가된 필드**:
```java
/**
 * 선택한 구독 플랜 (기본값: BASIC)
 * 프론트엔드에서 선택하지 않으면 BASIC 플랜으로 가입
 */
private String selectedPlan; // "FREE", "BASIC", "PRO", "ENTERPRISE"

/**
 * 선택한 플랜을 Enum으로 변환
 * 기본값: BASIC
 */
public SubscriptionPlan getSubscriptionPlan() {
    if (selectedPlan == null || selectedPlan.isEmpty()) {
        return SubscriptionPlan.BASIC;
    }
    try {
        return SubscriptionPlan.valueOf(selectedPlan.toUpperCase());
    } catch (IllegalArgumentException e) {
        return SubscriptionPlan.BASIC;
    }
}
```

**기본값 정책**:
- 프론트엔드에서 `selectedPlan`을 보내지 않으면 **BASIC 플랜**으로 가입
- 잘못된 값을 보내도 **BASIC 플랜**으로 fallback

---

### 6. AuthService.register() 수정

**파일**: `src/main/java/io/moer/booking/domain/auth/service/AuthService.java`

**변경 내용**:
```java
// 3. Business 생성 (선택한 플랜 + 30일 무료 체험 자동 설정)
Business business = Business.builder()
        .ownerId(user.getId())
        .name(request.getBusinessName())
        .businessType(request.getBusinessType())
        .status(BusinessStatus.ACTIVE)
        .subscriptionPlan(request.getSubscriptionPlan())  // ⬅️ 선택한 플랜
        .subscriptionStatus(SubscriptionStatus.TRIAL)     // ⬅️ 체험판 상태
        .trialStartedAt(now)                               // ⬅️ 체험 시작일
        .trialEndsAt(now.plusDays(30))                     // ⬅️ 30일 후 종료
        .currentStaffCount(0)                              // ⬅️ 직원 수 초기화
        .currentMonthReservationCount(0)                   // ⬅️ 예약 수 초기화
        .build();
```

**감사 로그 추가**:
```java
businessMetadata.put("subscriptionPlan", business.getSubscriptionPlan().name());
businessMetadata.put("subscriptionStatus", business.getSubscriptionStatus().name());
businessMetadata.put("trialEndsAt", business.getTrialEndsAt().toString());
```

---

### 7. BusinessMapper.xml 수정

**파일**: `src/main/resources/mapper/business/BusinessMapper.xml`

**ResultMap 확장**:
```xml
<!-- Subscription fields -->
<result property="subscriptionPlan" column="subscription_plan"
        typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
<result property="subscriptionStatus" column="subscription_status"
        typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
<result property="trialStartedAt" column="trial_started_at"/>
<result property="trialEndsAt" column="trial_ends_at"/>
<result property="subscriptionStartedAt" column="subscription_started_at"/>
<result property="nextBillingDate" column="next_billing_date"/>
<result property="currentStaffCount" column="current_staff_count"/>
<result property="currentMonthReservationCount" column="current_month_reservation_count"/>
```

**INSERT 쿼리 수정**:
```xml
INSERT INTO businesses (
    owner_id, name, business_type, phone, address, description,
    business_hours, status,
    subscription_plan, subscription_status,
    trial_started_at, trial_ends_at,
    current_staff_count, current_month_reservation_count
) VALUES (
    #{ownerId}, #{name}, #{businessType}, #{phone}, #{address}, #{description},
    #{businessHours, typeHandler=io.moer.booking.common.mybatis.JsonTypeHandler}::jsonb,
    #{status},
    #{subscriptionPlan}, #{subscriptionStatus},
    #{trialStartedAt}, #{trialEndsAt},
    #{currentStaffCount}, #{currentMonthReservationCount}
)
```

---

## 📊 생성된 파일 목록

| 번호 | 파일 경로 | 설명 |
|------|----------|------|
| 1 | `db/migration/V008__add_subscription_columns_to_businesses.sql` | Migration 파일 |
| 2 | `domain/business/SubscriptionPlan.java` | 구독 플랜 Enum |
| 3 | `domain/business/SubscriptionStatus.java` | 구독 상태 Enum |
| 4 | `domain/business/Business.java` | Entity 확장 (수정) |
| 5 | `domain/auth/dto/RegisterRequest.java` | DTO 확장 (수정) |
| 6 | `domain/auth/service/AuthService.java` | Service 수정 |
| 7 | `mapper/business/BusinessMapper.xml` | MyBatis XML 수정 |

**총 7개 파일** (신규 3개, 수정 4개)

---

## 🧪 테스트 방법

### 1. Migration 실행
```bash
./gradlew bootRun
# 또는
docker-compose up -d postgres
./gradlew flywayMigrate
```

V008 Migration이 성공적으로 실행되면 businesses 테이블에 6개의 새 컬럼이 추가됩니다.

### 2. 회원가입 API 테스트

#### 2.1 BASIC 플랜 가입 (기본값)
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "테스트 사용자",
  "phone": "010-1234-5678",
  "businessName": "테스트 매장",
  "businessType": "BEAUTY_SHOP"
}
```

**기대 결과**:
- `subscriptionPlan`: "BASIC"
- `subscriptionStatus`: "TRIAL"
- `trialEndsAt`: 가입일 + 30일

#### 2.2 PRO 플랜 가입
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test2@example.com",
  "password": "password123",
  "name": "테스트 사용자2",
  "phone": "010-1234-5678",
  "businessName": "테스트 매장2",
  "businessType": "PILATES",
  "selectedPlan": "PRO"
}
```

**기대 결과**:
- `subscriptionPlan`: "PRO"
- `subscriptionStatus`: "TRIAL"
- `trialEndsAt`: 가입일 + 30일

#### 2.3 잘못된 플랜 (fallback to BASIC)
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test3@example.com",
  "password": "password123",
  "name": "테스트 사용자3",
  "businessName": "테스트 매장3",
  "businessType": "CAFE",
  "selectedPlan": "INVALID_PLAN"
}
```

**기대 결과**:
- `subscriptionPlan`: "BASIC" (fallback)
- `subscriptionStatus`: "TRIAL"

### 3. DB 확인
```sql
SELECT
    id, name, subscription_plan, subscription_status,
    trial_started_at, trial_ends_at,
    current_staff_count, current_month_reservation_count
FROM businesses
ORDER BY created_at DESC
LIMIT 5;
```

**기대 결과**:
```
id | name        | subscription_plan | subscription_status | trial_ends_at       | current_staff_count | current_month_reservation_count
---+-------------+-------------------+---------------------+---------------------+---------------------+---------------------------------
 1 | 테스트 매장   | BASIC             | TRIAL               | 2026-03-14 10:00:00 | 0                   | 0
 2 | 테스트 매장2  | PRO               | TRIAL               | 2026-03-14 10:05:00 | 0                   | 0
```

---

## ✅ 완료 조건 체크

- [x] V008 Migration 생성 및 실행
- [x] SubscriptionPlan Enum 생성 (4개 플랜)
- [x] SubscriptionStatus Enum 생성 (5개 상태)
- [x] Business Entity 확장 (8개 필드 + 9개 헬퍼 메서드)
- [x] RegisterRequest DTO 확장 (selectedPlan 필드)
- [x] AuthService.register() 수정 (플랜 저장 + 30일 체험 설정)
- [x] BusinessMapper.xml 수정 (ResultMap + INSERT)
- [x] 기존 데이터 마이그레이션 (기존 매장 → FREE 플랜 + 30일 체험)

---

## 🚀 다음 단계

Phase 1의 다음 작업:

### 프론트엔드 작업 (58시간)
1. **PublicLayout.vue** (6시간) - Header, Footer 컴포넌트
2. **HomePage.vue** (12시간) - 랜딩 페이지
3. **PricingPage.vue** (10시간) - 요금제 비교 테이블
4. **SignupPage.vue** (10시간) - 플랜 선택 UI 구현
5. **FeaturesPage.vue** (8시간)
6. **FAQPage.vue** (6시간)
7. **LoginPage.vue** (4시간)
8. **Router 설정** (2시간)

---

## 📌 중요 사항

### 1. 30일 무료 체험 정책
- 모든 플랜 (FREE, BASIC, PRO, ENTERPRISE) 모두 30일 무료 체험 제공
- 체험 기간 동안 선택한 플랜의 모든 기능 사용 가능
- 체험 종료 후 자동 과금 **없음** (수동 결제 필요)

### 2. 기본 플랜 선택
- 프론트엔드에서 `selectedPlan`을 보내지 않으면 **BASIC 플랜**
- BASIC 플랜: 직원 3명, 월간 예약 100건

### 3. 플랜 제한 체크
- 직원 추가 시: `business.canAddStaff()` 체크 필요
- 예약 생성 시: `business.canCreateReservation()` 체크 필요
- Phase 2에서 UsageLimitService 구현 예정

### 4. Migration 버전
- V005: 사용량 카운터 추가
- V006: payments 테이블 생성
- V007: coupons 테이블 생성
- **V008: businesses 테이블에 subscription 컬럼 추가** ⬅️ 이번 작업

---

**문서 작성일**: 2026-02-12
**최종 수정**: 2026-02-12
**상태**: Phase 1 백엔드 작업 완료 ✅
**다음 작업**: 프론트엔드 PublicLayout.vue 개발
