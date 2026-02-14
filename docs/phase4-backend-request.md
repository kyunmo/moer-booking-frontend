# Phase 4: 백엔드 API 요청서 — 결제 + 고도화

> 수익화 및 서비스 확장
> 작성일: 2026-02-14
> 의존성: Phase 3 완료 후 진행

---

## 1. PG 결제 연동 (기존 API 고도화)

> 현재 `payment.js`에 기본 CRUD만 구현 — 실제 PG사 연동 필요

### 1-1. PG사 선정 기준

| PG사 | 장점 | 단점 | 적합도 |
|------|------|------|--------|
| 토스페이먼츠 | 문서 우수, 개발 편의 | - | 높음 |
| 아임포트(포트원) | 멀티 PG 지원 | 수수료 | 높음 |
| NHN KCP | 안정성, 실적 | 문서 보통 | 중간 |

### 1-2. 구독 정기결제 (빌링키)

```
POST /api/payments/billing-key
Authorization: Bearer {token}

Request Body:
{
  "plan": "BASIC",              // BASIC, PRO, ENTERPRISE
  "paymentMethod": "CARD",
  "cardNumber": "encrypted...", // PG SDK에서 암호화
  "customerKey": "user_1"       // PG 고객 식별키
}

Response 200:
{
  "data": {
    "billingKey": "bk_xxxxxxxxxxxx",
    "cardCompany": "삼성카드",
    "cardNumber": "****-****-****-1234",
    "plan": "BASIC",
    "monthlyAmount": 29000,
    "nextPaymentDate": "2026-03-14",
    "message": "정기결제가 등록되었습니다."
  }
}
```

### 1-3. 정기결제 실행 (서버 배치)

```
내부 배치 처리 (API 아님):
- 매월 결제일에 자동 실행
- 결제 실패 시: 3일 후 재시도 → 7일 후 재시도 → 플랜 다운그레이드
- 결제 성공 시: 구독 갱신 + 영수증 발급

관리자 수동 재시도:
POST /api/payments/billing/retry
Authorization: Bearer {token}

Response 200:
{ "data": { "paymentId": 101, "status": "SUCCESS" } }
```

### 1-4. 결제 취소/환불 (기존 API 확인)

```
기존: POST /api/payments/{paymentId}/refund { reason }

추가 필요:
- 부분 환불 지원
- 프로모션/쿠폰 적용된 결제 환불 정책
- PG 취소 연동

PATCH /api/payments/{paymentId}/partial-refund
Authorization: Bearer {token}

Request Body:
{
  "amount": 15000,
  "reason": "서비스 불만족 (부분 환불)"
}

Response 200:
{
  "data": {
    "paymentId": 101,
    "originalAmount": 29000,
    "refundedAmount": 15000,
    "remainingAmount": 14000,
    "status": "PARTIAL_REFUNDED"
  }
}
```

### 1-5. 영수증/세금계산서

```
GET /api/payments/{paymentId}/receipt
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "receiptUrl": "https://pg.example.com/receipt/xxxxx",  // PG사 영수증
    "paymentId": 101,
    "amount": 29000,
    "paidAt": "2026-02-14T10:00:00",
    "cardInfo": "삼성카드 1234"
  }
}
```

```
POST /api/payments/{paymentId}/tax-invoice
Authorization: Bearer {token}

Request Body:
{
  "businessNumber": "123-45-67890",
  "companyName": "미소헤어",
  "ownerName": "김미소",
  "email": "tax@misohair.com"
}

Response 200:
{
  "data": {
    "invoiceId": "INV-20260214-001",
    "status": "ISSUED",
    "downloadUrl": "/api/payments/tax-invoice/INV-20260214-001/download"
  }
}
```

---

## 2. 매출 리포트 API (신규)

### 2-1. 매출 요약 리포트

```
GET /api/businesses/{businessId}/reports/revenue
Authorization: Bearer {token}

Query Params:
  period: MONTHLY        // DAILY, WEEKLY, MONTHLY, YEARLY
  startDate: 2026-01-01
  endDate: 2026-02-14

Response 200:
{
  "data": {
    "summary": {
      "totalRevenue": 45000000,
      "totalReservations": 580,
      "averagePerReservation": 77586,
      "growth": 12.3               // 전 기간 대비 % 변화
    },
    "breakdown": [
      {
        "period": "2026-01",
        "revenue": 22000000,
        "reservations": 280,
        "completedRate": 92.5
      },
      {
        "period": "2026-02",
        "revenue": 23000000,
        "reservations": 300,
        "completedRate": 94.1
      }
    ],
    "byService": [
      { "serviceName": "여성컷", "revenue": 15000000, "count": 500, "share": 33.3 },
      { "serviceName": "펌", "revenue": 12000000, "count": 150, "share": 26.7 },
      { "serviceName": "염색", "revenue": 10000000, "count": 100, "share": 22.2 }
    ],
    "byStaff": [
      { "staffName": "김디자이너", "revenue": 18000000, "count": 230, "share": 40.0 },
      { "staffName": "이디자이너", "revenue": 15000000, "count": 200, "share": 33.3 }
    ],
    "byDayOfWeek": [
      { "dayOfWeek": 1, "label": "월", "revenue": 6000000, "count": 80 },
      { "dayOfWeek": 2, "label": "화", "revenue": 5500000, "count": 70 }
      // ...
    ],
    "peakHours": [
      { "hour": 14, "count": 95 },
      { "hour": 15, "count": 88 },
      { "hour": 11, "count": 82 }
    ]
  }
}
```

### 2-2. 서비스별 상세 매출

```
GET /api/businesses/{businessId}/reports/revenue/services
Authorization: Bearer {token}

Query Params:
  startDate: 2026-02-01
  endDate: 2026-02-14

Response 200:
{
  "data": [
    {
      "serviceId": 1,
      "serviceName": "여성컷",
      "categoryName": "커트",
      "totalRevenue": 1500000,
      "count": 50,
      "averagePrice": 30000,
      "trend": [
        { "date": "2026-02-01", "revenue": 120000, "count": 4 },
        // ...
      ]
    }
  ]
}
```

---

## 3. 데이터 내보내기 API (신규)

> PRO 플랜 이상에서 제공

### 3-1. 내보내기 요청

```
POST /api/businesses/{businessId}/exports
Authorization: Bearer {token}

Request Body:
{
  "type": "RESERVATIONS",         // RESERVATIONS, CUSTOMERS, REVENUE, STAFFS
  "format": "EXCEL",              // EXCEL, CSV
  "startDate": "2026-01-01",
  "endDate": "2026-02-14",
  "filters": {                    // 선택
    "status": "COMPLETED",
    "staffId": 1
  }
}

Response 202:
{
  "data": {
    "exportId": "exp_20260214_001",
    "status": "PROCESSING",
    "estimatedTime": 30,          // 초
    "message": "내보내기를 준비 중입니다."
  }
}
```

### 3-2. 내보내기 상태 확인

```
GET /api/businesses/{businessId}/exports/{exportId}
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "exportId": "exp_20260214_001",
    "status": "COMPLETED",         // PROCESSING, COMPLETED, FAILED
    "downloadUrl": "/api/businesses/1/exports/exp_20260214_001/download",
    "expiresAt": "2026-02-15T10:00:00",  // 24시간 후 만료
    "fileSize": 1048576,           // bytes
    "rowCount": 580
  }
}
```

### 3-3. 파일 다운로드

```
GET /api/businesses/{businessId}/exports/{exportId}/download
Authorization: Bearer {token}

Response: 파일 다운로드 (Content-Disposition: attachment)
```

---

## 4. 실시간 알림 시스템 (WebSocket/SSE)

> Phase 1에서 REST polling으로 기본 알림 구현 → Phase 4에서 실시간 업그레이드

### 4-1. WebSocket 연결

```
WebSocket Endpoint:
ws://{domain}/ws/notifications
Headers:
  Authorization: Bearer {token}

연결 성공 시:
{
  "type": "CONNECTED",
  "message": "알림 서버에 연결되었습니다.",
  "unreadCount": 5
}
```

### 4-2. 실시간 알림 수신

```
서버 → 클라이언트:
{
  "type": "NOTIFICATION",
  "data": {
    "id": 123,
    "notificationType": "RESERVATION_NEW",
    "title": "새 예약이 접수되었습니다",
    "message": "박서연 고객님이 내일 14:00 여성컷을 예약했습니다",
    "link": "/shop-admin/reservations/list",
    "createdAt": "2026-02-14T10:30:00"
  }
}
```

### 4-3. 알림 타입 목록

| 타입 | 설명 | 대상 |
|------|------|------|
| `RESERVATION_NEW` | 새 예약 접수 | Admin |
| `RESERVATION_CONFIRM` | 예약 확정 | Customer |
| `RESERVATION_CANCEL` | 예약 취소 | Admin + Customer |
| `RESERVATION_REMINDER` | 예약 D-1 리마인더 | Customer |
| `REVIEW_NEW` | 새 리뷰 등록 | Admin |
| `PAYMENT_SUCCESS` | 결제 성공 | Admin |
| `PAYMENT_FAILED` | 결제 실패 | Admin |
| `SUBSCRIPTION_EXPIRING` | 구독 만료 임박 | Admin |
| `SYSTEM` | 시스템 공지 | All |

---

## 5. 마케팅/CRM API (신규)

### 5-1. 고객 세그먼트 관리

```
POST /api/businesses/{businessId}/segments
Authorization: Bearer {token}

Request Body:
{
  "name": "3개월 이상 미방문 고객",
  "conditions": [
    { "field": "lastVisitDate", "operator": "BEFORE", "value": "2025-11-14" }
  ]
}

Response 201:
{
  "data": {
    "segmentId": 1,
    "name": "3개월 이상 미방문 고객",
    "customerCount": 45
  }
}
```

```
GET /api/businesses/{businessId}/segments
Authorization: Bearer {token}

Response 200:
{
  "data": [
    { "id": 1, "name": "3개월 이상 미방문", "customerCount": 45, "createdAt": "2026-02-14" },
    { "id": 2, "name": "VIP 고객", "customerCount": 12, "createdAt": "2026-02-14" },
    { "id": 3, "name": "생일 이번 달", "customerCount": 8, "createdAt": "2026-02-14" }
  ]
}
```

### 5-2. 메시지 캠페인 생성

```
POST /api/businesses/{businessId}/campaigns
Authorization: Bearer {token}

Request Body:
{
  "name": "재방문 유도 캠페인",
  "segmentId": 1,
  "channel": "KAKAO",           // KAKAO, SMS
  "templateType": "REVISIT",
  "message": "{{customerName}}님, 오랜만에 방문해주세요! 재방문 10% 할인 쿠폰을 드립니다.",
  "couponId": 5,                // 선택
  "scheduledAt": "2026-02-15T10:00:00",  // 예약 발송 (null이면 즉시)
}

Response 201:
{
  "data": {
    "campaignId": 1,
    "status": "SCHEDULED",
    "recipientCount": 45,
    "scheduledAt": "2026-02-15T10:00:00"
  }
}
```

### 5-3. 캠페인 결과 조회

```
GET /api/businesses/{businessId}/campaigns/{campaignId}
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "campaignId": 1,
    "name": "재방문 유도 캠페인",
    "status": "COMPLETED",
    "stats": {
      "totalSent": 45,
      "delivered": 43,
      "failed": 2,
      "opened": 35,             // 알림톡 열람
      "clicked": 12,            // 링크 클릭
      "converted": 5,           // 실제 예약/방문
      "deliveryRate": 95.6,
      "openRate": 81.4,
      "conversionRate": 11.6
    },
    "sentAt": "2026-02-15T10:00:00",
    "completedAt": "2026-02-15T10:05:00"
  }
}
```

### 5-4. 자동 캠페인 설정

```
POST /api/businesses/{businessId}/campaigns/auto
Authorization: Bearer {token}

Request Body:
{
  "type": "BIRTHDAY",            // BIRTHDAY, REVISIT_30D, REVISIT_60D, REVISIT_90D
  "enabled": true,
  "channel": "KAKAO",
  "message": "{{customerName}}님, 생일을 축하합니다! 생일 축하 20% 할인 쿠폰을 드립니다.",
  "couponId": 6,                 // 선택
  "triggerDays": 0               // 생일 당일 (음수: 전, 양수: 후)
}

Response 200:
{
  "data": {
    "autoCampaignId": 1,
    "type": "BIRTHDAY",
    "enabled": true,
    "message": "설정이 저장되었습니다."
  }
}
```

---

## 6. 우선순위 요약

| 순번 | 작업 | 규모 | 의존성 |
|------|------|------|--------|
| 1 | PG사 선정 및 SDK 연동 (1) | 대 | PG사 계약 |
| 2 | 구독 정기결제 (1-2, 1-3) | 대 | PG 연동 |
| 3 | 결제 취소/환불 고도화 (1-4) | 중 | PG 연동 |
| 4 | 영수증/세금계산서 (1-5) | 중 | PG 연동 |
| 5 | 매출 리포트 API (2) | 중 | 없음 |
| 6 | 데이터 내보내기 (3) | 소 | 없음 |
| 7 | WebSocket 알림 (4) | 중 | Phase 1 알림 API |
| 8 | 마케팅/CRM (5) | 대 | Phase 3 카카오톡 |

### 외부 서비스 의존성

| 서비스 | 필요 항목 | 예상 기간 |
|--------|----------|----------|
| PG사 (토스페이먼츠) | 가맹점 등록, API Key | 1~2주 |
| 카카오 비즈메시지 | 채널 등록, 템플릿 심사 | 1~2주 |
| 파일 스토리지 (S3) | AWS 계정, 버킷 설정 | 1일 |
| SMTP | 이메일 계정 설정 | 1일 |
