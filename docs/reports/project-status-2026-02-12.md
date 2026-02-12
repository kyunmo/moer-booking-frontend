# moer-booking-frontend 프로젝트 현황 분석 리포트

> **분석일**: 2026-02-12
> **프로젝트**: moer 예약 관리 시스템 Frontend
> **버전**: 2.3.0
> **기술 스택**: Vue 3.5.23 + Vuetify 3.10.8 + Pinia 3.0.4
> **템플릿**: Materio Admin Template

---

## 1. 프로젝트 개요

### 1.1 프로젝트 구조

moer-booking-frontend는 미용실, 필라테스, 스터디카페 등 다양한 업종의 예약 관리를 위한 SaaS 기반 웹 애플리케이션입니다.

**핵심 특징**:
- Materio Admin Template 기반 (Vuetify 3)
- Vue 3 Composition API 활용
- Pinia를 통한 상태 관리
- unplugin-vue-router를 통한 파일 기반 라우팅
- FullCalendar 통합 캘린더 뷰
- 슈퍼 관리자 / 일반 관리자 역할 분리

### 1.2 디렉토리 구조

```
moer-booking-frontend/
├── src/
│   ├── @core/              # Materio 템플릿 핵심 컴포넌트 및 유틸
│   ├── @layouts/           # 레이아웃 시스템
│   ├── api/                # API 클라이언트 (8개 모듈)
│   ├── assets/             # 정적 자원
│   ├── components/         # 공통 컴포넌트
│   ├── composables/        # Vue Composables
│   ├── constants/          # 상수 정의
│   ├── layouts/            # 커스텀 레이아웃
│   ├── navigation/         # 네비게이션 메뉴 설정
│   ├── pages/              # 페이지 컴포넌트 (36개 페이지)
│   ├── plugins/            # Vue 플러그인
│   └── stores/             # Pinia 스토어 (8개)
├── docs/                   # 문서 및 계획
│   ├── contents/           # 컨텐츠 (랜딩, 기능, 요금제 등)
│   ├── reports/            # 프로젝트 리포트
│   └── skills/             # 기술 문서
└── public/                 # 공개 리소스
```

---

## 2. 아키텍처 분석

### 2.1 기술 스택

#### 프론트엔드 프레임워크
- **Vue 3.5.23**: Composition API 기반
- **Vuetify 3.10.8**: Material Design UI 컴포넌트
- **Vue Router 4.5.1**: 파일 기반 라우팅 (unplugin-vue-router)
- **Pinia 3.0.4**: 상태 관리

#### 주요 라이브러리
- **FullCalendar 6.1.20**: 예약 캘린더
- **ApexCharts 3.54.1**: 대시보드 차트
- **TipTap 2.27**: 리치 텍스트 에디터
- **axios**: HTTP 클라이언트 (ofetch 1.5.1도 포함)
- **jwt-decode 4.0.0**: JWT 토큰 디코딩
- **vue-i18n 11.1.12**: 다국어 지원 (아직 활성화 안됨)

#### 개발 도구
- **Vite 7.2.1**: 빌드 도구
- **ESLint 8.57.1**: 코드 린팅
- **Stylelint 16.8.0**: 스타일 린팅
- **MSW 2.3.4**: Mock Service Worker (개발/테스트용)

### 2.2 상태 관리 (Pinia Stores)

현재 구현된 8개 스토어:

| 스토어 | 파일 | 주요 기능 | 상태 |
|--------|------|-----------|------|
| auth | `auth.js` | 인증, 사용자 정보, 비즈니스 선택 | 완성 |
| reservation | `reservation.js` | 예약 CRUD, 상태 변경, 캘린더 이벤트 | 완성 |
| customer | `customer.js` | 고객 CRUD, VIP/단골/신규 필터링 | 완성 |
| service | `service.js` | 서비스 CRUD, 카테고리 그룹화 | 완성 |
| staff | `staff.js` | 스태프 CRUD, 직급/전문분야 필터링 | 완성 |
| business-settings | `business-settings.js` | 매장 정보, 영업시간, 휴무일 | 완성 |
| dashboard | `dashboard.js` | 대시보드 통계 데이터 | 완성 |
| superadmin | `superadmin.js` | 슈퍼관리자 기능 | 완성 |

**특징**:
- 모든 스토어는 `useAuthStore`의 `businessId`를 참조하여 멀티 테넌트 지원
- 슈퍼관리자는 매장 선택 시 `selectedBusinessForSuperAdmin` 사용
- 일관된 에러 처리 및 로딩 상태 관리

### 2.3 API 연동 구조

#### API 클라이언트 (src/api/)

| 모듈 | 엔드포인트 | 주요 기능 |
|------|-----------|-----------|
| `axios.js` | - | 기본 설정, 인터셉터, JWT 자동 갱신 |
| `auth.js` | `/auth/*` | 로그인, 회원가입, 토큰 갱신, 비밀번호 재설정 |
| `reservations.js` | `/businesses/:id/reservations` | 예약 CRUD, 상태 변경, 날짜/기간 조회 |
| `customers.js` | `/businesses/:id/customers` | 고객 CRUD, 검색, VIP/신규/단골 필터 |
| `services.js` | `/businesses/:id/services` | 서비스 CRUD, 검색, 활성화 토글 |
| `staffs.js` | `/businesses/:id/staffs` | 스태프 CRUD, 활성화 토글, 예약 조회 |
| `business-settings.js` | `/businesses/:id` | 매장 정보, 설정, 휴무일 관리 |
| `superadmin.js` | `/superadmin/*` | 시스템 통계, 매장/사용자/감사로그 관리 |

**API 클라이언트 특징**:
- Base URL: `http://localhost:8080/api` (환경변수로 설정 가능)
- 자동 JWT 토큰 주입 (Authorization 헤더)
- 토큰 만료 시 자동 갱신 (Refresh Token)
- 401/403 에러 시 자동 로그아웃 또는 권한 메시지
- 에러 코드 기반 처리 (A001~A003, TR001~TR003 등)

---

## 3. Materio 템플릿 활용도 분석

### 3.1 핵심 컴포넌트 사용 현황

#### 3.1.1 VDataTable (데이터 테이블)
**사용처**: 3개 페이지
- `src/pages/customers/list.vue` - 고객 목록
- `src/pages/reservations/list.vue` - 예약 목록
- `src/pages/business-settings/holidays.vue` - 휴무일 관리

**활용도**: ★★★★☆ (80%)
- 페이지네이션, 정렬, 검색 기능 활용
- 커스텀 헤더 및 아이템 슬롯 활용
- 서비스/스태프 목록은 VCard 기반으로 구현 (VDataTable 미사용)

#### 3.1.2 VDialog (다이얼로그/모달)
**사용처**: 22개 파일
- 예약 관리: `ReservationFormDialog`, `ReservationDetailDialog`, `AssignStaffDialog`
- 고객 관리: `CustomerFormDialog`, `CustomerDetailDialog`
- 서비스 관리: `ServiceFormDialog`, `ServiceDetailDialog`
- 스태프 관리: `StaffFormDialog`, `StaffDetailDialog`
- 슈퍼관리자: `users/index.vue`, `businesses/index.vue`, `audit-logs/index.vue`

**활용도**: ★★★★★ (95%)
- 모든 CRUD 작업에 다이얼로그 패턴 일관되게 사용
- 생성/수정/상세 보기 모두 다이얼로그로 구현
- DialogCloseBtn 컴포넌트로 일관된 닫기 버튼

#### 3.1.3 FullCalendar (캘린더)
**사용처**: 1개 페이지
- `src/pages/reservations/calendar.vue`

**활용도**: ★★★★★ (100%)
- dayGrid, timeGrid, list 뷰 모두 활용
- 예약 생성, 수정, 드래그 앤 드롭 이동
- 상태별 색상 구분 (PENDING, CONFIRMED, COMPLETED 등)
- 좌측 사이드바: 날짜 선택기, 상태 필터
- 이벤트 클릭 시 상세 다이얼로그 표시

#### 3.1.4 통계 카드 (StatisticsCard)
**사용처**: 다수 페이지
- `src/pages/index.vue` (대시보드) - 8개 통계 카드
- `src/pages/customers/list.vue` - 4개 통계 카드
- `src/pages/reservations/calendar.vue` - 4개 통계 카드

**활용도**: ★★★★★ (90%)
- 커스텀 `StatisticsCard` 컴포넌트 생성하여 일관된 UI
- 아이콘, 색상, 서브타이틀 지원

#### 3.1.5 VAutocomplete / VCombobox
**사용처**: 예약 폼, 고객 검색 등
- `ReservationFormDialog` - 고객/서비스/스태프 선택

**활용도**: ★★★★☆ (75%)
- 고객 자동완성 검색 (전화번호로 검색)
- 서비스 선택 (다중 선택 가능)
- 스태프 배정

#### 3.1.6 VDatePicker
**사용처**: 캘린더 사이드바, 예약 폼
- `reservations/calendar.vue` - 인라인 날짜 선택기
- 휴무일 추가

**활용도**: ★★★☆☆ (60%)
- 인라인 캘린더는 잘 활용됨
- 범위 선택 기능은 아직 미활용

#### 3.1.7 ApexCharts / VueApexCharts
**사용처**: 대시보드
- `src/pages/index.vue` - 주간 예약 바 차트

**활용도**: ★★★☆☆ (50%)
- 단일 차트만 사용 중
- 대시보드 확장 시 추가 차트 필요 (원형 차트, 라인 차트 등)

### 3.2 레이아웃 시스템

#### 활성 레이아웃
- **DefaultLayoutWithVerticalNav**: 메인 앱 레이아웃 (사이드바 + 헤더)
- **BlankLayout**: 로그인, 회원가입 등 인증 페이지

#### 레이아웃 특징
- 반응형 사이드바 (모바일에서 드로어)
- 비즈니스 선택기 (`BusinessSelector.vue`) - 슈퍼관리자 전용
- 네비게이션 권한 제어 (슈퍼관리자 메뉴 분리)

### 3.3 미활용 Materio 기능

1. **VTimeline**: 예약 히스토리, 고객 방문 내역 표시에 활용 가능
2. **VChip + VAvatar 조합**: 태그 시스템, 고객 레이블링
3. **VTooltip**: 추가 정보 툴팁 (현재 거의 미사용)
4. **VBanner**: 체험판 만료 알림, 중요 공지
5. **VSnackbar**: 일부 사용되나 통일성 부족 (useSnackbar composable 있음)
6. **VDataTableServer**: 서버 사이드 페이지네이션 (현재는 클라이언트 사이드)
7. **VMenu**: 컨텍스트 메뉴, 드롭다운 메뉴 (일부만 사용)

---

## 4. 구현된 페이지 및 컴포넌트 현황

### 4.1 페이지 통계

- **총 페이지 파일**: 36개
- **총 컴포넌트 파일**: 22개
- **총 코드 라인**: 약 28,210줄 (Vue + JS)

### 4.2 페이지별 구현 현황

#### 4.2.1 인증 페이지 (완성)
- [x] `/login` - 로그인
- [x] `/register` - 회원가입
- [x] `/forgot-password` - 비밀번호 찾기
- [x] `/reset-password` - 비밀번호 재설정
- [x] `/oauth2-redirect` - OAuth2 리다이렉트

#### 4.2.2 대시보드 (완성)
- [x] `/` (index.vue) - 메인 대시보드
  - 실시간 액션 알림 (확정 대기, 1시간 내 시작, 생일 고객, 재방문 유도)
  - 오늘/이번 주/이번 달 통계
  - 취소/노쇼 현황
  - 고객 세그먼트 분석 (VIP/단골/신규/이탈)
  - 인기 서비스 TOP 5
  - 직원 성과 TOP 3
  - 평균 지표 (예약 금액, 서비스 시간, 방문 횟수, LTV, 완료 전환율)
  - 오늘의 예약 목록
  - 최근 신규 고객
  - 퀵 액션 버튼

#### 4.2.3 예약 관리 (완성)
- [x] `/reservations/calendar` - 예약 캘린더
  - FullCalendar 통합 (dayGrid, timeGrid, list)
  - 좌측 사이드바: 날짜 선택, 상태 필터
  - 예약 생성/수정/상세/삭제
  - 드래그 앤 드롭 시간 변경
  - 스태프 배정
- [x] `/reservations/list` - 예약 목록
  - VDataTable 기반 목록
  - 상태별 필터 (대기/확정/완료/취소)
  - 검색 기능

**예약 관련 다이얼로그**:
- [x] `ReservationFormDialog` - 예약 생성/수정 폼
- [x] `ReservationDetailDialog` - 예약 상세 보기
- [x] `AssignStaffDialog` - 스태프 배정

#### 4.2.4 고객 관리 (완성)
- [x] `/customers/list` - 고객 목록
  - VDataTable 기반 목록
  - 필터: 전체/VIP/단골/신규
  - 검색: 이름, 전화번호
  - 통계 카드: 전체/VIP/단골/신규 고객 수

**고객 관련 다이얼로그**:
- [x] `CustomerFormDialog` - 고객 생성/수정 폼
- [x] `CustomerDetailDialog` - 고객 상세 정보 (예약 내역 포함)

#### 4.2.5 서비스 관리 (완성)
- [x] `/services/list` - 서비스 목록
  - VCard 그리드 기반 (VDataTable 아님)
  - 카테고리별 그룹화
  - 활성화/비활성화 토글

**서비스 관련 다이얼로그**:
- [x] `ServiceFormDialog` - 서비스 생성/수정 폼
- [x] `ServiceDetailDialog` - 서비스 상세 정보

#### 4.2.6 스태프 관리 (완성)
- [x] `/staffs/list` - 스태프 목록
  - VCard 그리드 기반
  - 직급/전문분야 필터
  - 활성화/비활성화 토글

**스태프 관련 다이얼로그**:
- [x] `StaffFormDialog` - 스태프 생성/수정 폼
- [x] `StaffDetailDialog` - 스태프 상세 정보

#### 4.2.7 매장 설정 (완성)
- [x] `/business-settings` - 매장 기본 정보
- [x] `/business-settings/hours` - 영업시간 설정
- [x] `/business-settings/holidays` - 휴무일 관리

#### 4.2.8 슈퍼관리자 페이지 (완성)
- [x] `/superadmin/dashboard` - 슈퍼관리자 대시보드
- [x] `/superadmin/businesses` - 매장 관리
- [x] `/superadmin/users` - 사용자 관리
- [x] `/superadmin/audit-logs` - 감사 로그

#### 4.2.9 기타 페이지 (완성)
- [x] `/terms` - 이용약관
- [x] `/privacy` - 개인정보처리방침
- [x] `/support` - 지원/문의
- [x] `/second-page` - 예시 페이지 (삭제 예정)
- [x] `[...error]` - 404 에러 페이지

### 4.3 컴포넌트 구조

#### 공통 컴포넌트 (`src/components/`)
- [x] `AppLoadingIndicator.vue` - 전역 로딩 표시
- [x] `StatisticsCard.vue` - 통계 카드
- [x] `UnassignedReservationAlert.vue` - 미배정 예약 알림
- [x] `BusinessSelector.vue` - 비즈니스 선택기 (슈퍼관리자)

#### Materio 기본 컴포넌트 (`src/@core/components/`)
- DialogCloseBtn
- AppBarSearch
- ThemeSwitcher
- I18n
- Notifications
- Shortcuts
- TiptapEditor
- DropZone
- 등 다수 (약 30개)

#### 레이아웃 컴포넌트 (`src/layouts/components/`)
- [x] `DefaultLayoutWithVerticalNav.vue` - 기본 레이아웃
- [x] `BusinessSelector.vue` - 비즈니스 선택 드롭다운

---

## 5. 라우팅 구조 분석

### 5.1 라우팅 시스템

**라우터**: unplugin-vue-router (파일 기반 자동 라우팅)

**네비게이션 메뉴**: `src/navigation/vertical/index.js`

```javascript
// 일반 메뉴 (모든 사용자)
- 대시보드 (root)
- 예약 관리
  - 예약 캘린더 (reservations-calendar)
  - 예약 목록 (reservations-list)
- 고객 관리 (customers-list)
- 서비스 관리 (services-list)
- 스태프 관리 (staffs-list)
- 설정
  - 매장 설정 (business-settings)
  - 영업시간 (business-settings-hours)
  - 휴무일 (business-settings-holidays)

// 슈퍼 관리자 전용 메뉴
- 슈퍼 관리자
  - 대시보드 (superadmin-dashboard)
  - 매장 관리 (superadmin-businesses)
  - 사용자 관리 (superadmin-users)
  - 감사 로그 (superadmin-audit-logs)
```

### 5.2 네비게이션 가드

**권한 제어**:
- 슈퍼관리자는 매장 선택 전 일반 메뉴 비활성화
- `authStore.isSuperAdmin` && `!authStore.hasSelectedBusiness` 체크

**예시**:
```javascript
{
  title: '대시보드',
  to: { name: 'root' },
  get disabled() {
    return authStore.isSuperAdmin && !authStore.hasSelectedBusiness
  }
}
```

---

## 6. API 연동 상태 확인

### 6.1 API 엔드포인트 매핑

| 도메인 | API 모듈 | Store | 페이지 | 연동 상태 |
|--------|----------|-------|--------|----------|
| 인증 | `auth.js` | `auth` | login, register | ✅ 완료 |
| 예약 | `reservations.js` | `reservation` | calendar, list | ✅ 완료 |
| 고객 | `customers.js` | `customer` | customers/list | ✅ 완료 |
| 서비스 | `services.js` | `service` | services/list | ✅ 완료 |
| 스태프 | `staffs.js` | `staff` | staffs/list | ✅ 완료 |
| 매장 설정 | `business-settings.js` | `business-settings` | business-settings/* | ✅ 완료 |
| 대시보드 | (axios.js) | `dashboard` | index.vue | ✅ 완료 |
| 슈퍼관리자 | `superadmin.js` | `superadmin` | superadmin/* | ✅ 완료 |

### 6.2 API 연동 완성도

**✅ 완료된 API 연동**:
- 로그인/회원가입/토큰 갱신
- 예약 CRUD, 상태 변경, 날짜/기간 조회
- 고객 CRUD, 검색, 필터링
- 서비스 CRUD, 활성화 토글
- 스태프 CRUD, 활성화 토글
- 매장 정보, 영업시간, 휴무일
- 대시보드 통계 (오늘/주간/월간)
- 슈퍼관리자 기능 (매장/사용자/감사로그)

**⚠️ 개선 필요**:
- 서버 사이드 페이지네이션 (현재 클라이언트 사이드)
- 실시간 알림 (WebSocket/SSE)
- 이미지 업로드 (서비스/스태프 프로필)
- 파일 첨부 (고객 메모, 동의서)

**❌ 미구현**:
- 결제 모듈 (SaaS 구독 관리)
- 쿠폰 시스템
- SMS 알림 연동

---

## 7. 미완성 기능 및 TODO 분석

### 7.1 TODO 검색 결과

**발견된 TODO 파일**: 14개

주요 TODO 항목:
- `src/pages/reservations/components/ReservationDialog.vue` - 레거시 다이얼로그 (삭제 예정)
- `src/@core/*` - Materio 템플릿 기본 TODO (대부분 무시 가능)
- `src/@layouts/*` - 레이아웃 커스터마이징 TODO

### 7.2 미완성 기능 목록

#### 7.2.1 SaaS 전환 관련 (계획 단계)
- [ ] 공개 랜딩 페이지 (`/`)
- [ ] 기능 소개 페이지 (`/features`)
- [ ] 요금제 페이지 (`/pricing`)
- [ ] FAQ 페이지 (`/faq`)
- [ ] 구독 관리 페이지 (`/subscription`)
- [ ] 결제 페이지 (`/subscription/checkout`)
- [ ] 슈퍼관리자 - 구독 관리
- [ ] 슈퍼관리자 - 결제 내역
- [ ] 슈퍼관리자 - 쿠폰 관리

**참고**: `docs/moer-final-plan-summary.md` 참조

#### 7.2.2 기능 개선 필요
- [ ] 고객 상세 페이지에서 예약 내역 차트
- [ ] 스태프 성과 분석 상세 페이지
- [ ] 서비스 통계 (월별 예약 건수, 매출)
- [ ] 예약 시 자동 스태프 추천 (가용성 기반)
- [ ] 예약 시간 충돌 검증 강화
- [ ] 캘린더 뷰에서 드래그 앤 드롭 개선
- [ ] 모바일 반응형 개선 (특히 캘린더)

#### 7.2.3 UX 개선
- [ ] 로딩 상태 일관성 (Skeleton Loader 활용)
- [ ] 에러 핸들링 통일 (useSnackbar 전역 활용)
- [ ] 확인 다이얼로그 통일 (ConfirmDialog 컴포넌트 활용)
- [ ] 키보드 단축키 지원
- [ ] 다크 모드 개선 (일부 색상 깨짐)

#### 7.2.4 성능 최적화
- [ ] 대용량 고객 목록 가상 스크롤
- [ ] 이미지 Lazy Loading
- [ ] 코드 스플리팅 개선
- [ ] API 호출 캐싱 (Tanstack Query 도입 검토)

#### 7.2.5 테스트
- [ ] Unit Test (Vitest)
- [ ] E2E Test (Playwright)
- [ ] API 모킹 개선 (MSW 활용)

---

## 8. 전체 진행률 추정

### 8.1 기능별 완성도

| 카테고리 | 완성도 | 상태 |
|---------|--------|------|
| 인증 시스템 | 95% | ✅ 완료 (OAuth 제외) |
| 예약 관리 | 90% | ✅ 완료 (캘린더 드래그 개선 필요) |
| 고객 관리 | 85% | ✅ 완료 (상세 분석 추가 가능) |
| 서비스 관리 | 90% | ✅ 완료 (통계 추가 가능) |
| 스태프 관리 | 85% | ✅ 완료 (성과 분석 추가 가능) |
| 매장 설정 | 90% | ✅ 완료 (테마 설정 추가 가능) |
| 대시보드 | 95% | ✅ 완료 (차트 추가 가능) |
| 슈퍼관리자 | 80% | ✅ 완료 (SaaS 기능 추가 필요) |
| SaaS 전환 | 0% | ❌ 미착수 |
| 테스트 | 0% | ❌ 미착수 |

### 8.2 전체 프로젝트 진행률

```
███████████████████████░░░░░ 82% (예약 시스템)
████░░░░░░░░░░░░░░░░░░░░░░░░  15% (SaaS 전환)
░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (테스트)
```

**종합 완성도**: **82%** (예약 관리 시스템 기준)
**SaaS 포함 완성도**: **약 65%**

### 8.3 프로젝트 상태 요약

#### ✅ 완료된 부분 (82%)
- 인증 및 사용자 관리
- 예약 캘린더 (FullCalendar 통합)
- 고객/서비스/스태프 CRUD
- 매장 설정 (영업시간, 휴무일)
- 대시보드 (통계, 차트, 알림)
- 슈퍼관리자 기본 기능

#### 🚧 진행 중 / 개선 필요 (15%)
- 모바일 반응형 최적화
- 성능 개선 (가상 스크롤, 캐싱)
- UX 개선 (로딩, 에러 핸들링)

#### ❌ 미착수 (15% + 테스트)
- SaaS 공개 페이지 (랜딩, 요금제 등)
- 구독 관리 시스템
- 결제 연동 (토스페이먼츠)
- 쿠폰 시스템
- Unit/E2E 테스트

---

## 9. 기술 부채 및 개선 권장사항

### 9.1 아키텍처 개선

#### 9.1.1 상태 관리
**현재**: Pinia (좋음)
**권장**:
- API 호출 캐싱을 위해 Tanstack Query (Vue Query) 도입 검토
- 복잡한 폼 상태는 VeeValidate + Yup 도입

#### 9.1.2 컴포넌트 구조
**현재**: 페이지 내 다이얼로그 컴포넌트
**권장**:
- 공통 다이얼로그 추상화 (BaseFormDialog, BaseDetailDialog)
- Composables 활용 확대 (useDialog, useForm, usePagination)

#### 9.1.3 API 레이어
**현재**: 개별 API 모듈
**권장**:
- API 응답 타입 정의 (TypeScript 또는 JSDoc)
- API 에러 타입 명확화 (ErrorCode enum)
- Retry 로직 추가 (axios-retry)

### 9.2 코드 품질

#### 9.2.1 타입 안정성
**현재**: JavaScript
**권장**: TypeScript 마이그레이션 검토 (점진적 도입 가능)

#### 9.2.2 코드 중복
**발견된 중복**:
- 다이얼로그 open/close 로직 (useDialog composable로 추출)
- CRUD 액션 (useResource composable로 추출)
- 상태 색상/텍스트 매핑 함수 (constants/로 이동)

#### 9.2.3 네이밍 컨벤션
**일관성 부족**:
- 일부 파일: PascalCase, kebab-case 혼용
- 이벤트 명명: `@update`, `@change`, `@save` 통일 필요

### 9.3 성능 최적화

#### 9.3.1 번들 사이즈
**현재**: 5MB 경고 (Vite 설정)
**권장**:
- Vuetify 트리 셰이킹 검증
- FullCalendar 모듈 최적화 (필요한 뷰만 import)
- 차트 라이브러리 경량화 (ApexCharts → Chart.js 고려)

#### 9.3.2 런타임 성능
**개선 포인트**:
- VDataTable 가상 스크롤 (대량 데이터 시)
- 이미지 최적화 (WebP, lazy loading)
- Computed 최적화 (불필요한 재계산 방지)

### 9.4 보안

#### 9.4.1 XSS 방어
**현재**: Vue의 기본 보호
**권장**: TipTap 에디터 내용 sanitize (DOMPurify)

#### 9.4.2 CSRF 방어
**현재**: JWT 기반 (CSRF 영향 적음)
**권장**: Refresh Token HttpOnly 쿠키 사용 검토

#### 9.4.3 민감 정보
**확인 필요**:
- 로컬 스토리지에 저장된 토큰 (XSS 위험)
- API 에러 메시지에 민감 정보 노출 여부

### 9.5 접근성 (a11y)

**개선 필요**:
- ARIA 레이블 추가 (특히 다이얼로그, 버튼)
- 키보드 네비게이션 개선
- 색상 대비 검증 (WCAG 2.1 AA)
- 스크린 리더 테스트

---

## 10. 다음 단계 권장사항

### 10.1 단기 목표 (1-2주)

#### Option A: SaaS 전환 우선
1. 공개 레이아웃 생성 (`PublicLayout.vue`)
2. 랜딩 페이지 구현 (docs/contents 활용)
3. 요금제 페이지 구현
4. 회원가입 시 플랜 선택 기능 추가

#### Option B: 기존 시스템 고도화
1. 모바일 반응형 개선 (특히 캘린더)
2. 성능 최적화 (번들 사이즈, 로딩 속도)
3. UX 개선 (로딩 상태, 에러 처리)
4. 테스트 코드 작성 시작

### 10.2 중기 목표 (1개월)

1. SaaS 구독 관리 시스템
   - businesses 테이블 확장 (subscription_plan 등)
   - SubscriptionPage.vue 구현
   - 30일 무료 체험 자동 설정

2. 결제 연동 (Fake PG)
   - FakePGService 구현
   - CheckoutPage.vue
   - 결제 성공/실패 페이지

3. 슈퍼관리자 확장
   - SubscriptionsPage.vue
   - PaymentsPage.vue
   - CouponsPage.vue

### 10.3 장기 목표 (3개월)

1. 실제 PG 연동 (토스페이먼츠)
2. SMS 알림 연동 (알리고, 카카오톡 비즈니스)
3. 고급 분석 대시보드
4. AI 기반 예약 추천
5. 모바일 앱 (React Native 또는 Flutter)

---

## 11. 코드 통계

### 11.1 파일 및 라인 수

- **총 Vue 파일**: 36개 (pages) + 22개 (components) + 다수 (@core)
- **총 API 모듈**: 8개
- **총 Pinia Store**: 8개
- **총 코드 라인**: 약 28,210줄 (Vue + JS)

### 11.2 주요 페이지 크기 (라인 수 기준)

- `src/pages/index.vue` (대시보드): 약 900줄
- `src/pages/reservations/calendar.vue`: 약 600줄
- `src/stores/reservation.js`: 약 370줄
- `src/stores/auth.js`: 약 305줄

---

## 12. 결론

### 12.1 프로젝트 강점

1. **견고한 아키텍처**: Vue 3 + Pinia + Vuetify 조합으로 확장성 우수
2. **일관된 코드 스타일**: Materio 템플릿 가이드 준수
3. **완성도 높은 핵심 기능**: 예약 관리 시스템 거의 완성
4. **멀티 테넌트 지원**: 슈퍼관리자 + 비즈니스 분리 잘 구현
5. **풍부한 UI 컴포넌트**: Vuetify 활용도 높음

### 12.2 개선 필요 영역

1. **SaaS 전환**: 공개 페이지, 구독 관리 필요
2. **테스트 부재**: Unit/E2E 테스트 전무
3. **성능 최적화**: 번들 사이즈, 로딩 속도
4. **모바일 최적화**: 특히 캘린더 뷰
5. **코드 중복**: Composables로 추출 필요

### 12.3 최종 평가

**현재 상태**: 예약 관리 시스템으로서 **82% 완성**
**SaaS 포함**: **65% 완성**

**추천 방향**:
1. 기존 시스템 안정화 및 테스트 (2주)
2. SaaS 전환 (4주)
3. 실제 결제 연동 (2주)
4. 베타 출시 (총 2개월)

---

**리포트 작성일**: 2026-02-12
**분석 도구**: Claude Code + 수동 검증
**다음 리뷰 예정**: 2026-03-12 (SaaS 전환 후)
