# [백엔드 요청] 예약 캘린더 - 주말(토/일) 날짜 미노출 이슈

## 현상
- 고객 예약 페이지의 날짜 선택 캘린더에서 토요일/일요일이 선택 불가 상태
- 월~금요일만 활성화되어 있음

## 원인 분석
- 프론트엔드의 `isDateAllowed()` 함수는 백엔드 API 응답의 `availableDates` 배열에 포함된 날짜만 활성화
- 프론트엔드에는 요일 필터링 로직 없음 (백엔드 응답을 그대로 사용)
- **백엔드 `GET /api/public/businesses/{slug}/available-dates`** 엔드포인트가 `businessHours` 설정에 토/일이 없는 경우 해당 요일을 제외하는 것으로 추정

## 프론트엔드 코드 참조
```javascript
// src/stores/booking.js
async fetchAvailableDates(slug, params) {
  const { data } = await publicBookingApi.getAvailableDates(slug, params)
  const dates = data.availableDates || []
  this.availableDates = dates.filter(d => d.hasSlots).map(d => d.date)
}

// src/pages/booking/[slug]/reserve.vue
function isDateAllowed(date) {
  let dateStr = convertToDateString(date)
  return availableDates.value.includes(dateStr)
}
```

## 요청사항
1. **`businessHours` 설정 확인**: 해당 매장의 `businessHours` JSON에 토요일(SATURDAY), 일요일(SUNDAY) 운영시간이 설정되어 있는지 확인 필요
2. **운영시간 설정이 없는 경우**: 매장 설정 > 운영시간에서 토/일요일 운영시간 추가 필요
3. **운영시간 설정이 있는데도 미노출 시**: `available-dates` 엔드포인트의 요일 필터링 로직 점검 요청

## 관련 API
- `GET /api/public/businesses/{slug}/available-dates?yearMonth=2026-02`

## 우선순위
높음 - 주말 예약이 불가하면 매출 손실 직결
