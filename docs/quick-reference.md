# 빠른 참조 가이드 (Quick Reference)

> 개발자를 위한 핵심 정보 요약

---

## 🚀 빠른 시작

```bash
# 개발 서버 실행
pnpm dev
# → http://localhost:5173

# 백엔드 API
# → http://localhost:8080/api
```

---

## 📁 주요 파일 위치

```
src/
├── api/                        # API 모듈
│   ├── reservations.js        # ⭐ 예약 API (완료 처리 주의!)
│   ├── customers.js           # 고객 API
│   ├── services.js            # 서비스 API
│   └── staffs.js              # 직원 API
│
├── components/
│   └── StatisticsCard.vue     # ⭐ 통계 카드 (신규)
│
├── pages/
│   ├── index.vue              # 대시보드
│   ├── customers/list.vue     # 고객 목록
│   ├── reservations/
│   │   ├── calendar.vue       # ⭐ 예약 캘린더 (리뉴얼)
│   │   └── list.vue           # 예약 목록
│   ├── services/list.vue      # 서비스 목록
│   └── staffs/list.vue        # 직원 목록
│
└── stores/
    ├── reservation.js         # ⭐ completeReservation() 추가
    ├── customer.js            # 고객 스토어
    ├── service.js             # 서비스 스토어
    └── staff.js               # 직원 스토어
```

---

## ⚠️ 중요: 예약 완료 처리

### ✅ 올바른 방법
```javascript
// 예약 완료 처리 (고객 통계 자동 업데이트)
await reservationStore.completeReservation(reservationId)
```

### ❌ 잘못된 방법
```javascript
// 이렇게 하면 고객 통계가 업데이트 안됨!
await reservationStore.updateReservationStatus(reservationId, 'COMPLETED')
```

---

## 🎨 컴포넌트 사용법

### StatisticsCard
```vue
<StatisticsCard
  title="전체 고객"
  value="125명"
  icon="ri-user-line"
  color="primary"
/>
```

**색상 옵션:**
- `primary` - 파란색
- `success` - 초록색
- `warning` - 주황색
- `error` - 빨간색
- `info` - 하늘색

---

## 🔧 API 엔드포인트

### 예약 (Reservations)
```javascript
// 목록 조회
GET /businesses/{id}/reservations

// 기간별 조회
GET /businesses/{id}/reservations/date-range?startDate=&endDate=

// 생성
POST /businesses/{id}/reservations

// 수정
PATCH /businesses/{id}/reservations/{id}

// 확정 ⭐
PATCH /businesses/{id}/reservations/{id}/confirm

// 완료 (고객 통계 자동 업데이트) ⭐⭐⭐
PATCH /businesses/{id}/reservations/{id}/complete

// 상태 변경 (일반)
PATCH /businesses/{id}/reservations/{id}/status?status=CONFIRMED

// 취소
PATCH /businesses/{id}/reservations/{id}/cancel?reason=
```

### 고객 (Customers)
```javascript
GET /businesses/{id}/customers
GET /businesses/{id}/customers/vip
GET /businesses/{id}/customers/regular
GET /businesses/{id}/customers/new
POST /businesses/{id}/customers
PATCH /businesses/{id}/customers/{id}
DELETE /businesses/{id}/customers/{id}
```

---

## 📊 Store 사용법

### Reservation Store
```javascript
const reservationStore = useReservationStore()

// 목록 조회
await reservationStore.fetchReservations()

// 기간별 조회
await reservationStore.fetchReservationsByDateRange(startDate, endDate)

// 예약 확정
await reservationStore.updateReservationStatus(id, 'CONFIRMED')

// 예약 완료 (⭐ 중요!)
await reservationStore.completeReservation(id)
```

### Customer Store
```javascript
const customerStore = useCustomerStore()

// 목록 조회
await customerStore.fetchCustomers()

// 필터링
await customerStore.fetchVipCustomers()
await customerStore.fetchRegularCustomers()
await customerStore.fetchNewCustomers()

// Getters
customerStore.customers         // 전체
customerStore.vipCustomers      // VIP
customerStore.regularCustomers  // 단골
customerStore.newCustomers      // 신규
```

---

## 🎯 캘린더 기능

### 필터링
```javascript
// 선택된 상태만 표시
const selectedStatuses = ref(['PENDING', 'CONFIRMED', 'COMPLETED'])

// 필터링된 이벤트
const filteredEvents = computed(() => {
  return reservationStore.calendarEvents.filter(event => {
    return selectedStatuses.value.includes(
      event.extendedProps.reservation.status
    )
  })
})
```

### 날짜 이동
```javascript
function jumpToDate(date) {
  const calendarApi = calendarRef.value.getApi()
  calendarApi.gotoDate(date)
}
```

---

## 🐛 트러블슈팅

### 문제: 고객 통계가 업데이트 안됨
**해결:**
```javascript
// ❌ 이렇게 하지 마세요
await reservationStore.updateReservationStatus(id, 'COMPLETED')

// ✅ 이렇게 하세요
await reservationStore.completeReservation(id)
```

### 문제: 캐시된 파일 때문에 변경사항이 안보임
**해결:**
```bash
# 하드 리프레시
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 문제: API 401 에러
**해결:**
```javascript
// 토큰 확인
console.log(localStorage.getItem('accessToken'))

// 토큰이 없으면 재로그인
```

---

## 📝 다음 작업 우선순위

### 긴급 (이번 주)
1. [ ] 예약 시간 충돌 검증
2. [ ] 에러 토스트 메시지 추가
3. [ ] 서비스 관리 페이지 개선

### 중요 (다음 주)
1. [ ] 직원 관리 페이지 개선
2. [ ] 예약 등록 폼 개선 (단계별)
3. [ ] 고객 상세 페이지 추가

### 보통 (나중에)
1. [ ] 통계 대시보드 개선
2. [ ] 알림 시스템
3. [ ] 엑셀 다운로드

---

## 🎨 디자인 토큰

### 색상
```javascript
primary   // 파란색 - 기본 액션
success   // 초록색 - 완료, 성공
warning   // 주황색 - 대기, 경고
error     // 빨간색 - 취소, 에러
info      // 하늘색 - 정보
```

### 상태 매핑
```javascript
PENDING   → warning (주황)
CONFIRMED → primary (파랑)
COMPLETED → success (초록)
CANCELLED → error   (빨강)
NO_SHOW   → secondary (회색)
```

### 간격
```vue
class="mb-4"   // margin-bottom: 16px (표준)
class="pa-5"   // padding: 20px
class="gap-y-1" // gap: 4px (vertical)
```

---

## 🔑 핵심 규칙

1. **예약 완료는 반드시 `/complete` 엔드포인트 사용**
2. **통계 카드는 StatisticsCard 컴포넌트 사용**
3. **상태 색상은 일관성 유지** (위 매핑 참조)
4. **모든 목록 페이지는 mb-4 간격 사용**
5. **Avatar는 오른쪽, variant="tonal", size="42"**

---

## 📞 긴급 연락

### 백엔드 API 문제
- 백엔드 개발자에게 문의
- API 문서 확인: `docs/api-spec.md` (있다면)

### 프론트엔드 버그
- `docs/progress-report.md` 참고
- Console 에러 확인
- Network 탭 확인

---

**빠른 참조 끝**

*더 자세한 내용은 `docs/progress-report.md` 참조*
