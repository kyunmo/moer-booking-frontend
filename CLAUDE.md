# YEMO Booking System - Frontend

## 프로젝트명
YEMO Booking System (예모 예약 시스템)

## 프로젝트 설명
뷰티/헤어/네일 등 소규모 매장을 위한 온라인 예약 관리 시스템의 프론트엔드.
Vue 3 + Vuetify (Materio 템플릿) 기반, Pinia 상태관리, file-based 자동 라우팅(unplugin-vue-router) 사용.

### 기술 스택
- **Framework**: Vue 3 + Vuetify 3 (Materio Template)
- **State**: Pinia (20개 스토어)
- **API**: Axios (src/api/) - 24개 API 모듈
- **Auth**: 이중 토큰 (관리자 accessToken + 고객 customerAccessToken), Kakao OAuth
- **Routing**: unplugin-vue-router (파일 기반 자동 라우팅)
- **PWA**: 서비스 워커 캐싱 (static/dynamic/images 3분할), 오프라인 폴백
- **규모**: 77+ 페이지, 55+ 컴포넌트, 13 레이아웃, 10 컴포저블

### 주요 기능 영역
- **공개 페이지**: 랜딩, 예약 페이지 (src/pages/booking/)
- **매장 관리자**: 대시보드, 예약/서비스/직원/고객/통계/구독 관리 (src/pages/shop-admin/)
- **슈퍼 관리자**: 전체 매장 관리 (src/pages/super-admin/)
- **구독 시스템**: FREE/BASIC/PREMIUM/ENTERPRISE 플랜, 트라이얼 기능 잠금

## 진행사항 업데이트 (2026-03-04)

### Phase 1~6 전체 개선 작업 완료

#### Phase 1: 즉시 수정 (버그/접근성) ✅
- h1 태그 중복 수정 (PublicHeader, PublicFooter → `<span>` 교체)
- 통계 blur 영역 pointer-events 확인 (이미 적용됨)
- 예약 취소 `cancelLoading` ref + `:loading` 바인딩 추가
- CSS `color-mix()` fallback (`@supports` 쿼리)

#### Phase 2: 핵심 UX 개선 ✅
- 대시보드 섹션 재배열 (오늘 예약 최상단) + 환영 배너 접기 기능
- 서비스 목록 필터 VCardText로 분리 (overflow 해결)
- 예약 Step 2 데스크톱 2컬럼 레이아웃 (VDatePicker | 시간+스태프)
- 매장 상세 Sticky CTA 버튼 (모바일)
- 에러 복구 UI (VAlert + 다시 시도 버튼)
- 네이티브 date input → VMenu + VDatePicker 전환
- 결제/구독 헤더 VCard 기반 통일

#### Phase 3: 기능 보완 ✅
- 서비스 이미지 업로드 UI (최대 3장, 미리보기, 5MB/JPG/PNG/WebP 검증)
- 실시간 알림 강화 (브라우저 Notification API, SSE 연동)
- 회원가입 간소화 (플랜 선택 제거, 30일 무료 체험 배지, 카카오 로그인)
- FREE 플랜 기본 통계 제공 (전면 블러 → 기본 통계 + 업그레이드 CTA)
- 리뷰 이미지 업로드 (제출 전 미리보기, 리뷰 생성 후 순차 업로드)

#### Phase 4: 정보 구조 개선 ✅
- 예약 관리 뷰 통합 (목록/캘린더 탭 전환, lazy load)
- 결제/구독 메뉴 통합 (3탭: 현재 플랜/결제/결제 이력)
- 하단 네비 4탭 (검색/내 예약/북마크/프로필)
- 인앱 도움말 시스템 (`useHelpTooltip.js`, 25+ 도움말 텍스트, 사이드바 FAQ 링크)

#### Phase 5: 고급 기능 ✅
- 캘린더 드래그앤드롭 (editable + 확인 다이얼로그 + revert)
- 고객 알림 발송 다이얼로그 (리마인더/프로모션/공지, 카카오 알림톡)
- CRM 강화 (CSV 내보내기 한글 BOM, 태그 필터)
- 랜딩 페이지 개선 (실제 앱 목업, 평점 4.5~5 분포, 카운트업 애니메이션)

#### Phase 6: 최적화 및 미세 조정 ✅
- reserve.vue 67KB → 4개 Step 컴포넌트 분리 (Step1~Step4)
- 이미지 lazy loading (`lazy-src`)
- 접근성 (aria-label, role, keyboard navigation)
- 모바일 터치 최적화 (44px 최소 터치 타겟)
- PWA 오프라인 (OfflineBanner, sw.js 캐싱 전략, offline.html)

### 백엔드 요구사항 문서 작성 ✅
- `docs/백엔드-API-요구사항-2026-03-04.md`
- 12개 API, 27개 엔드포인트 정의
- Phase별 우선순위(P0~P4) 분류
- 각 API: 기능명/설명/입출력/예외처리/JSON 예시 포함

## 향후 계획

### 백엔드 연동 대기
- 서비스 이미지 업로드 API (P1)
- 리뷰 이미지 동시 업로드 API (P1)
- FREE 플랜 기본 통계 API - `/dashboard/basic-stats` (P0)
- 예약 reschedule API - `/reservations/{id}/reschedule` (P2)
- 고객 알림 발송 API (P2)
- 카카오 알림톡 설정 API (P3)
- 고객 CRM API (병합/CSV/메모/태그) (P3)
- 랜딩 페이지 동적 통계 API (P3)
- 회원가입 플랜 필드 제거 + 30일 무료체험 자동 적용 (P0)
- SSE 이벤트 타입 확장 (P1)

### 추가 개선 가능 영역
- 백엔드 API 구현 후 TODO 주석 부분 실제 연동
- E2E 테스트 추가
- 다국어 지원 (i18n)

## 기타 참고사항

### 신규 생성된 주요 파일
- `src/pages/booking/[slug]/components/Step1ServiceSelection.vue`
- `src/pages/booking/[slug]/components/Step2DateTimeSelection.vue`
- `src/pages/booking/[slug]/components/Step3CustomerInfo.vue`
- `src/pages/booking/[slug]/components/Step4Confirmation.vue`
- `src/pages/shop-admin/customers/components/NotificationSendDialog.vue`
- `src/composables/useHelpTooltip.js`
- `src/components/common/OfflineBanner.vue`
- `public/offline.html`

### 개발 컨벤션
- Dialog 패턴: `v-model` + `modelValue` prop + `update:modelValue` emit
- 슈퍼 관리자 API: `X-Business-Id` 헤더 (axios interceptor)
- 카테고리 시스템: `categoryId` (number) + `categoryName` (JOIN), 5분 캐시
- OAuth URL: `/oauth2/authorize/kakao` (NOT `/oauth2/authorization/`)
- 이미지 업로드: 5MB 제한, JPG/PNG/WebP, ObjectURL 미리보기 + onBeforeUnmount 정리

### 에러 코드
- **고객 인증**: CP001 (전화번호 필수), CP002 (고객 역할), CP003 (예약 미발견), CP004 (본인 예약 아님)
- **서비스 카테고리**: SV004 (이름 중복), SV005 (서비스 보유 시 삭제 불가)
- **신규 제안 도메인**: IMG (이미지), NTF (알림), CRM (고객관리), STAT (통계), PUB (공개)

### 관련 문서
- `docs/페르소나-사용자평가-2026-03-04.md` - 페르소나 평가 보고서
- `docs/UI-UX-디자인-평가-2026-03-04.md` - UI/UX 평가 보고서
- `docs/단계별-개선방안-2026-03-04.md` - 6단계 개선 로드맵
- `docs/백엔드-API-요구사항-2026-03-04.md` - 백엔드 API 요구사항 (12개 API, 27개 엔드포인트)

## 사용자 페이지 디자인 리뉴얼 (2026-03-04)

### 적용 범위
- `src/pages/booking/` 하위 전체
- `src/layouts/public.vue` 및 관련 공용 컴포넌트
  - `src/components/public/PublicHeader.vue`
  - `src/components/public/PublicFooter.vue`
  - `src/components/public/BookingBottomNav.vue`
- 관리자 페이지(shop-admin, super-admin)는 기존 Materialize 그대로 유지

### 디자인 방향: Soft Minimal + Korean Modern
- 타겟: 20~40대 여성 (미용실, 필라테스, 요가 고객)
- 포지션: 카카오헤어샵보다 따뜻하고 세련된 예약 경험
- Vuetify 최소화 (v-dialog, v-snackbar 등 기능성 컴포넌트만 유지)
- 모바일 우선 (PWA)

### 컬러 팔레트
- Background : #FAFAF8 (따뜻한 화이트)
- Primary    : #2D2D2D (소프트 블랙)
- Accent     : #C8A882 (웜 골드 베이지)
- Surface    : #FFFFFF
- Muted      : #9E9E9E

### 타이포그래피
- Display : Noto Serif KR (제목 — 감성적)
- Body    : Pretendard (본문 — 가독성)

### 기술 규칙
- 스타일 스코프: `.yemo-booking` 클래스로 public.vue에서 격리
- 커스텀 CSS 변수는 `src/assets/styles/booking/` 에 분리 관리
- 기존 Vuetify 전역 스타일 오염 방지 필수

### 작업 우선순위
1. public.vue 레이아웃 리뉴얼 (PublicHeader, Footer 포함)
2. booking/index.vue (매장 검색 메인)
3. booking/[slug]/index.vue (업체 상세)
4. booking/[slug]/reserve.vue (예약 4단계)
5. 나머지 페이지 (my-reservations, profile 등)
