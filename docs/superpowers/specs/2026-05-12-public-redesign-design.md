# YEMO 공개 페이지 UI/UX 리디자인 — 설계 스펙

> **작성일:** 2026-05-12
> **범위:** `src/pages/` 직속 마케팅·인증·법적 페이지 + `src/pages/booking/**` (관리자 영역 제외)
> **상태:** Brainstorming 완료, 사용자 승인 받음. Implementation plan 작성 단계로 이행 대기.
> **이전 시도 백업:** `backup/old-redesign-202603-05` 브랜치 (커밋 `003465e`)
> **킥오프 로그:** `docs/history/2026-05-12-ui-ux-redesign-kickoff.md`

---

## 1. 배경

### 1.1 왜 다시 시작하는가
- 2026-03-04 ~ 03-05 사이 "Soft Minimal + Korean Modern" 방향으로 부분 진행되다 중단됨
- 워킹 트리에 52개 미커밋 파일이 남아 있었고, 여러 시안과 평가 문서가 누적되어 컨텍스트가 무거워짐
- 새 톤("Warm Soft Modern")과 새 IA로 백지에서 다시 시작

### 1.2 보존된 자산
- `docs/contents/` — 페이지별 카피 원본 (FAQ, features, pricing, terms, refund 등)
- `docs/vue-version/` — Vuetify 참조
- `docs/history/` — 진행 로그
- 본 spec 폴더 (`docs/superpowers/specs/`)
- 백업 브랜치의 SCSS 토큰·52개 파일 1차 수정 — **재사용하지 않음**, 참고만

---

## 2. 확정된 요구사항 (Brainstorming 결과)

| 항목 | 결정 | 비고 |
|---|---|---|
| **범위** | 공개 페이지 20개 (관리자 제외) | 마케팅 8 + 법적 3 + booking 9 (§3.2 참고) |
| **청중 우선순위** | 사장님(B2B) ≈ 고객(B2C) 동등 | 둘 다 잘 만든다 |
| **디자인 방향** | **Warm Soft Modern** (Editorial Soft 베이스 + Korean Tech 가독성 — 단, 폼팩터는 둥글고 현대적) | 세리프 제거, Pretendard 위주 |
| **디바이스** | 영역별 분리 | 마케팅 = 데스크톱+모바일 동등 / booking = 모바일 퍼스트 |
| **IA 옵션** | Option 2 (중간 개선) | 아래 §3 참고 |
| **로그인 통합** | `/login`에서 사장님/고객 선택 분기 | 사용자 혼란 제거 |
| **비회원 예약** | 허용 — reserve 끝단에서 로그인 유도 | 마찰 감소 |
| **브랜드** | `YEMO` · 슬로건 **"예약은 예모로"** · 워드마크 로고 | 기존 모에르(MOER) 표기 제거 |
| **이탤릭** | 사용 안 함 | 강조는 색상(Accent)만 |
| **컴포넌트 전략** | 영역별 분리: 공개 = Headless 자체 작성 / admin = Vuetify 유지 | `.yemo` 루트 클래스로 격리 |
| **아이콘** | Phosphor Icons Regular (1.5pt stroke) 신규 도입 권장. Remix Icon Line은 fallback | 이모지 사용 금지 |
| **실행 전략** | Hybrid Track | Foundation → 영웅 페이지(랜딩) → Phase 단위 롤아웃 |

---

## 3. IA (정보 구조) — 최종 20 페이지

### 3.1 변경 사항
- `/support` 페이지 제거 → `/faq`로 흡수 (헤더에서 `support` 메뉴 빠짐, footer에서 `고객지원` 링크는 `/faq`로 이동)
- `/forgot-password` + `/reset-password` → 단일 페이지 `/password-recovery`로 통합 (2단계 wizard: 이메일 입력 → 새 비밀번호 설정)
- `/login` — 진입 시 "사장님으로 로그인 / 고객으로 로그인" 분기 (이후 각 로그인 폼)
- `/booking/[slug]/reserve` — 비회원도 Step 1~3 진행 가능, Step 4(확정) 직전에 로그인/회원가입 유도 모달

### 3.2 페이지 목록

#### 마케팅 (8)
- `/` — 랜딩 (사장님 대상 영웅)
- `/features` — 기능 상세 소개
- `/pricing` — 요금제
- `/faq` — FAQ (이전 support 콘텐츠 포함)
- `/login` — 사장님/고객 분기 + 로그인 폼
- `/register` — 회원가입 (사장님)
- `/password-recovery` — 비밀번호 복구 단일 플로우
- `/oauth2-redirect` — 카카오 OAuth 콜백 (스피너 + 자동 라우팅)

#### 법적 (3)
- `/privacy` — 개인정보처리방침
- `/terms` — 이용약관
- `/refund-policy` — 환불정책

#### Booking 고객 (9)
- `/booking/` — 매장 검색
- `/booking/[slug]/` — 매장 상세
- `/booking/[slug]/reserve` — 예약 4단계 wizard
- `/booking/[slug]/review` — 리뷰 작성
- `/booking/profile` — 고객 프로필 (필수 온보딩 포함)
- `/booking/my-reservations` — 내 예약 (로그인 필요)
- `/booking/my-reviews` — 내 리뷰
- `/booking/bookmarks` — 찜한 매장
- `/booking/reservation` — 비회원 예약 조회

#### 합계 — 20 페이지 (마케팅 8 + 법적 3 + Booking 9)

> **참고 1:** 처음 IA 평가에서 "18 페이지"로 언급했으나 정확한 count는 위와 같이 **20개**. 18은 marketing+legal 합계에서 가까운 값이었고, booking 페이지 9개는 별도 카운트되어야 함. 본 spec의 모든 후속 카운트는 **20**으로 통일.
>
> **참고 2:** `/booking/login` 페이지는 별도 항목이 아닌 `/login`의 분기 선택 (고객 모드)로 흡수. 코드상으로는 `pages/booking/login.vue`를 삭제하거나 단순 redirect로 변경 (`/login?role=customer`). 최종 결정은 Phase 3 구현 시.

---

## 4. 디자인 토큰 (Foundation)

### 4.1 컬러 시스템
```scss
// Base
--y-bg:            #FAFAF8;  // 페이지 배경
--y-surface:       #FFFFFF;  // 카드/입력
--y-surface-elev:  #F2F0EC;  // 호버·선택·톤다운

// Text
--y-text-strong:   #1A1A1A;
--y-text:          #2D2D2D;
--y-text-muted:    #6B6B6B;
--y-text-disabled: #B8B8B8;

// Accent (Warm Gold Beige)
--y-accent:        #C8A882;
--y-accent-deep:   #A88860;
--y-accent-soft:   #F0E6D8;  // 배지·하이라이트 배경

// Border
--y-border:        #E5E3DD;
--y-border-strong: #C9C5BC;

// State
--y-success:       #4A7C59;
--y-warning:       #C8893D;
--y-danger:        #B84A4A;
--y-info:          #5B7BAA;
```

### 4.2 타이포그래피
```scss
// Family
$font-body: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
// 세리프(Noto Serif KR)는 사용하지 않음. 강조는 굵기 + 색상으로.

// Scale (px / line-height / weight)
$type: (
  display-xl: (60, 1.08, 800),  // 랜딩 hero
  display-lg: (42, 1.20, 800),  // 섹션 h2
  display-md: (28, 1.25, 800),  // 모바일 page title
  title-lg:   (22, 1.30, 700),
  title-md:   (18, 1.35, 700),
  title-sm:   (16, 1.40, 600),
  body-lg:    (17, 1.70, 400),  // hero sub
  body:       (15, 1.65, 400),  // 본문 기본
  body-sm:    (13, 1.60, 400),
  caption:    (12, 1.50, 500),
  label:      (11, 1.40, 700),  // uppercase + letter-spacing 0.08em
);

// Letter-spacing
display-*: -0.035em ~ -0.04em (큰 글자는 더 타이트)
title-*:   -0.02em
body-*:    -0.01em
caption:    0.02em
label:      0.08em + uppercase
```

### 4.3 모서리 (Radius)
```scss
--y-radius-sm:    8px;   // 작은 칩, 작은 버튼
--y-radius:      12px;   // 입력, ghost 버튼
--y-radius-md:   14px;   // 기본 버튼, 시간 슬롯
--y-radius-lg:   16px;   // 카드 (서비스 항목 등)
--y-radius-xl:   20px;   // 큰 카드 (매장 카드, 페인 카드)
--y-radius-2xl:  24px;   // 모달, 가격 카드
--y-radius-pill: 999px;  // pill 버튼, 태그
```

### 4.4 그림자 (Shadow)
```scss
--y-shadow-sm:    0 1px 2px rgba(20,20,20,0.04);
--y-shadow:       0 4px 12px rgba(20,20,20,0.06);
--y-shadow-md:    0 8px 20px rgba(20,20,20,0.08);
--y-shadow-lg:    0 16px 40px rgba(20,20,20,0.06);
--y-shadow-xl:    0 30px 80px rgba(20,20,20,0.10);
--y-shadow-focus: 0 0 0 4px rgba(200,168,130,0.18);
--y-shadow-accent: 0 10px 24px rgba(168,136,96,0.25);
```

### 4.5 간격 (Space)
```scss
$space: (0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 120);
// 컨테이너 폭: 1100 / 1200 / 1440
// 모바일 좌우 패딩: 16px
// 데스크톱 좌우 패딩: 32px
```

### 4.6 모션 (Motion)
```scss
--y-ease:       cubic-bezier(0.4, 0, 0.2, 1);       // 기본
--y-ease-dramatic: cubic-bezier(0.16, 1, 0.3, 1);   // 카드 등장
--y-dur-fast:   200ms;
--y-dur-base:   300ms;
--y-dur-slow:   500ms;

@media (prefers-reduced-motion: reduce) {
  duration → 0, animation → fade only
}
```

### 4.7 파일 구조
```
src/assets/styles/yemo/
├── index.scss          # @forward 모두
├── _tokens.scss        # CSS 변수 정의
├── _typography.scss    # 폰트 로드, .t-display-xl 등 utility
├── _reset.scss         # 미니멀 reset (Vuetify 영향 격리)
├── _motion.scss
└── _utilities.scss     # 간격·색·flex 유틸
```

- 모든 토큰은 CSS 변수로 노출 → 추후 다크모드 등 확장 용이 (현재는 라이트 전용)
- 격리: `<div class="yemo">` 루트에서만 적용. 관리자 영역에 누수 없음

---

## 5. 컴포넌트 시스템 (Headless)

### 5.1 컴포넌트 목록 (14개)
| 카테고리 | 컴포넌트 | 책임 |
|---|---|---|
| 버튼/액션 | `YBtn` · `YIconBtn` · `YLink` | size: sm/md/lg, variant: primary/secondary/ghost/text/accent/danger, pill 옵션 |
| 입력 | `YInput` · `YTextarea` · `YSelect` · `YCheckbox` · `YRadio` · `YSearchBar` | 동일한 border + focus 규칙 |
| 표현 | `YCard` · `YTag` · `YBadge` · `YDivider` · `YEmptyState` | Warm Soft Modern 톤 |
| 피드백 | `YToast` · `YInlineError` · `YSkeleton` · `YSpinner` | Vuetify `v-snackbar` 재활용 |
| 레이아웃 | `YSection` · `YContainer` · `YGrid` · `YStack` | 간격 자동화 |
| 오버레이 | (Vuetify `v-dialog` · `v-menu` · `v-overlay` 활용) | 복잡한 동작 재발명 안 함 |

### 5.2 API 컨벤션
```vue
<YBtn
  variant="primary"      // primary | secondary | ghost | text | accent | danger
  size="md"              // sm | md | lg
  :loading="false"
  :disabled="false"
  prepend-icon="ph-arrow-right"
  block
  pill                   // boolean: 999px radius
  @click="...">
  예약하기
</YBtn>
```
- **slots:** default · prepend · append
- **emits:** 표준 DOM 이벤트 + 명시적 변경 이벤트
- **scoped style + CSS 변수 override** — 외부에서 토큰으로 미세조정 가능
- **a11y:** role · aria-label · aria-disabled · focus-visible
- **size 별 height (고정값):** sm=36px / md=44px / lg=52px
  → **주의:** Booking sticky CTA 같은 위치에서 화면 폭과 무관하게 동일 높이 유지

### 5.3 컴포넌트별 디자인 디테일

**YBtn**
- Primary: bg `#1A1A1A`, hover translateY(-1px) + shadow-md
- Secondary: bg `#FFFFFF`, border `#E5E3DD`, hover bg `#FAFAF8`
- Accent: bg `var(--y-accent)`, hover bg `var(--y-accent-deep)` + 텍스트색 반전
- Ghost: 투명, hover bg `var(--y-surface-elev)`
- Text: 골드 색 + underline은 hover에서만
- prepend-icon / append-icon: 16~18px 1.5pt stroke

**YCard**
- 기본: bg `#FFFFFF`, border `--y-border`, radius `--y-radius-xl` (20px)
- Hover (인터랙티브 카드): translateY(-2px), shadow-lg, border `--y-border-strong`
- 이미지 영역: radius 상단만(`20px 20px 0 0`), 배경 `linear-gradient(135deg, #F0E6D8, #F2F0EC)`

**YInput**
- bg `#FFFFFF`, border `--y-border`, radius `--y-radius` (12px)
- padding 14px 16px, font 14px
- focus: border `--y-accent`, box-shadow `--y-shadow-focus`
- placeholder color `--y-text-disabled`

**YTag**
- radius pill (999px), padding 6px 14px, font 12px / weight 600
- variant: default(`#F2F0EC`) · accent(`#F0E6D8/#7A5A2A`) · success · danger

**YSection (마케팅 페이지 섹션 헤더)**
- eyebrow label: 12px / 700 / `--y-accent-deep` / uppercase / letter-spacing 0.1em
- h2: 42px / 800 / `--y-text-strong` / letter-spacing -0.035em
- sub: 16px / 400 / `--y-text-muted` / line-height 1.7 / max-width 560px

---

## 6. 레이아웃 시스템 (3 템플릿)

### 6.1 MarketingLayout
```
적용: index, features, pricing, faq, login, register, password-recovery, oauth2-redirect

<MarketingLayout>
  <PublicHeader variant="marketing" />
  <main class="yemo">
    <YContainer width="default">
      <slot />
    </YContainer>
  </main>
  <PublicFooter variant="full" />
</MarketingLayout>
```
- 헤더 높이: 데스크톱 72px / 모바일 56px
- 헤더 배경: `rgba(250,250,248,0.85)` + `backdrop-filter: blur(12px)`
- 헤더 메뉴 (데스크톱): 로고 / 홈·기능·요금제·FAQ / [로그인][무료로시작]
- 헤더 메뉴 (모바일): 로고 / 햄버거 → 풀스크린 drawer
- 푸터: 4단 그리드 (브랜드 / 서비스 / 회사 / 법적) + 사업자 정보 + © + bg `#1A1A1A`

### 6.2 BookingLayout
```
적용: booking/index, booking/[slug]/index, booking/[slug]/reserve, booking/[slug]/review,
      booking/profile, booking/my-reservations, booking/my-reviews, booking/bookmarks, booking/reservation

<BookingLayout>
  <BookingHeader variant="..." />
  <main class="yemo booking-mode">
    <slot />
  </main>
  <BookingBottomNav v-if="!isReserveFlow" />
</BookingLayout>
```
- 헤더 가변: 검색 페이지 = 로고/알림 / 매장 상세 = 뒤로/매장명/찜 / reserve = 뒤로/제목/닫기 + 진행 바
- 모바일 바텀네비 4탭: 검색 · 내 예약 · 찜 · 프로필 (활성 = 상단 골드 인디케이터 3px)
- reserve 진행 중 바텀네비 자동 숨김 (집중 모드)
- 푸터 없음 (모바일 우선, 바텀네비가 네비게이션 담당)

### 6.3 LegalLayout
```
적용: privacy, terms, refund-policy

<LegalLayout>
  <LegalHeader />  <!-- 미니멀: 로고 + 뒤로 -->
  <main class="yemo">
    <YContainer width="reading">  <!-- max-width 720px -->
      <slot />
    </YContainer>
  </main>
  <PublicFooter variant="minimal" />
</LegalLayout>
```
- 본문: 가독성 최적화 (font-size 16, line-height 1.85, h2 사이 큰 여백)
- 목차 sticky (데스크톱): 우측 사이드, 모바일은 상단 접힘
- 푸터: 1줄 minimal (© + 이용약관 · 개인정보처리방침 · 환불정책 링크)

---

## 7. 페이지별 상세 설계

### 7.1 랜딩 (`/`) — 영웅 페이지

**섹션 순서:**
1. Hero — eyebrow 배지 + 60px headline + sub + CTA 2개 + trust 3종 + **실제 admin 대시보드를 모사한 mockup**
2. Pain Point — 4 카드 그리드 (전화·수기·노쇼·이력) · hover translateY(-4px)
3. Solution — 4 카드 (자동 예약·카카오 알림·이력 관리·실시간 통계) — 위와 같은 패턴
4. Features — 6 카드 그리드 (캘린더·시간 충돌·고객 페이지·알림 3단계·CRM·통계)
5. Industry Tabs — 3 탭 (미용실 / 필라테스·요가 / 스터디카페·공방)
6. Testimonials — 3 카드 (실제 사례 + 성과 숫자)
7. Pricing — 2 플랜 (FREE / PREMIUM ⭐) — PREMIUM 카드는 다크 강조
8. FAQ — 아코디언 (랜딩에는 5개만, "전체 FAQ →" 링크)
9. Final CTA Banner — 큰 헤드라인 + 메인 CTA + footnote
10. Footer

**핵심 시각 결정:**
- Hero 우측 목업은 `src/pages/shop-admin/dashboard.vue`의 실제 구조 (오늘의 예약 리스트 + 4 통계 카드 + 주간 차트) — 가입 후 화면과 일치
- "예모" / "혹시" / "투명한" / "5분" 등 키워드는 **골드 색상 강조만** (이탤릭 X)
- Trust bar 신뢰 3종: 신용카드 없이 가입 · 5분 안에 시작 · 언제든 해지

**카피 소스:** `docs/contents/landing-page-content.md` (단, 브랜드명 moer → YEMO 일괄 치환, 무료체험 7일 → 30일, "월 20,000원부터"는 그대로)

### 7.2 가격 (`/pricing`)
**구조:**
- 헤더 + eyebrow + h2
- 월간/연간 토글 (있으면 연간 -2개월)
- 플랜 2 카드 (FREE / PREMIUM) — 랜딩과 동일 디자인
- 비교 표 (간단 5행) → "자세한 비교 →" 링크로 전체 표 토글
- FAQ 3개 (요금 관련만) + "전체 FAQ →" 링크
- Final CTA + Footer

### 7.3 기능 (`/features`)
**구조:**
- 헤더 + eyebrow + h2 + 사이드 네비 (sticky, 데스크톱만 — 6 기능 앵커)
- 6 기능을 좌/우 교차 레이아웃 (텍스트 + 스크린샷)
  - 1·3·5: 텍스트 왼쪽 / 스크린샷 오른쪽
  - 2·4·6: 반대
- 업종별 특화 섹션 (탭 3개)
- Final CTA + Footer

### 7.4 FAQ (`/faq`)
**구조:**
- 헤더 + eyebrow + h2 + 검색바 (자동 필터)
- 카테고리 필터 칩 (전체 · 시작 · 결제 · 기능 · 보안 등)
- 아코디언 25+개 (기존 + support 콘텐츠 흡수)
- "더 궁금하신가요?" — 1:1 문의 / 카카오톡 채널 링크
- Footer

### 7.5 로그인 (`/login`) — 통합 분기
**구조:**
- 풀스크린 split layout
  - 좌측 (50%): 브랜드 카피 + 인증 슬로건 (데스크톱만)
  - 우측 (50%): 분기 UI
    - 초기 화면: **"어떻게 로그인하시겠어요?"** + 카드 2개 (사장님 / 고객) — 큰 클릭 영역
    - 카드 선택 후: 각 역할별 로그인 폼 슬라이드 인 (이메일/비밀번호 또는 카카오 로그인)
  - 회원가입 링크 / 비밀번호 찾기 링크
- 모바일은 1컬럼

### 7.6 회원가입 (`/register`) — 사장님 전용
- 단계: 1) 이메일/비밀번호 또는 카카오 / 2) 매장 기본 정보 (선택 — 나중에 가능) / 3) 완료
- "30일 무료체험" 배지 강조
- 약관 동의 (모달 또는 inline)

### 7.7 비밀번호 복구 (`/password-recovery`) — 통합 플로우
- Step 1: 이메일 입력 → "재설정 링크 발송했습니다"
- Step 2: 링크 클릭 → 새 비밀번호 입력 (같은 페이지의 step 전환)
- URL query param `token=...` 으로 step 2로 진입 가능

### 7.8 약관/개인정보/환불 (`/terms`, `/privacy`, `/refund-policy`)
- LegalLayout 사용 (max-width 720px)
- 목차 sticky (데스크톱): 우측 200px 컬럼
- 본문: h2 사이 48px 여백, line-height 1.85
- 페이지 간 상호 링크 (하단 "관련 문서" 섹션)

### 7.9 Booking 검색 (`/booking/`)
- 모바일 헤더: YEMO 로고 + 알림 아이콘
- 검색바 (동네·매장·시술 통합)
- 카테고리 칩 (가로 스크롤): 전체 · 헤어 · 네일 · 필라테스 · 스터디카페 · 공방
- "근처 추천 매장" 섹션 헤더 + 매장 카드 그리드 (모바일 1열, 데스크톱 2~3열)
- 매장 카드: 이미지 (좌상단 태그 신규/인기, 우상단 찜 하트) + 매장명 + 별점·리뷰·거리 + 시술 칩 3개
- 바텀네비 활성 = 검색

### 7.10 매장 상세 (`/booking/[slug]/`)
- 헤더: ← 뒤로 / 매장명 / ♡ 찜 (찜 상태 = 채워진 골드 하트)
- Hero: 사진 캐러셀 (인디케이터 점) — 4~6장
- 매장 정보: 카테고리 칩 + 매장명(22px/800) + 별점·리뷰·총예약 + 주소(핀)
- Sticky 탭 4개: 서비스 · 리뷰 · 디자이너 · 정보
- 탭 컨텐츠 (anchor scroll)
- **Sticky CTA 하단 고정:** 정보 아이콘 + "예약하기" 메인 버튼 (height 52px)

### 7.11 예약 wizard (`/booking/[slug]/reserve`)
- 헤더: ← 뒤로 / "예약하기" / × 닫기
- 진행 바 (Step 1~4)
- Step 1: 서비스 선택 (체크 가능, 다중 선택 시 총 시간/금액 자동 합산)
- Step 2: **날짜 + 시간 + 디자이너**
  - 날짜: 가로 7일 스트립 (기본) + **"📅 달력 보기" 버튼 → 월별 캘린더 모달** (먼 미래 예약 가능)
  - 시간: 오전/오후 분리 grid 3컬럼, 선택 = 골드 ring, disabled = 취소선
  - 디자이너: 가로 스크롤 카드 (아바타 + 이름 + 역할), 선택 = 골드 배경
- Step 3: 고객 정보 (비회원 가능 — 이름/전화/메모)
- Step 4: 확정 → **비회원이면 이 단계 직전에 로그인/회원가입 유도 모달**
- 하단 Sticky CTA (고정 높이 52px): 선택 요약 + "다음 단계" 버튼
- 바텀네비 자동 숨김

### 7.12 마이 페이지들
- `/booking/profile` — 카카오 신규 가입 시 전화번호 등록 (필수), 닉네임/이메일 수정
- `/booking/my-reservations` — 탭 (예정 / 완료 / 취소), 각 카드에 매장명 + 시간 + 서비스 + 상태 칩 + [재예약][리뷰 작성][취소]
- `/booking/my-reviews` — 내가 쓴 리뷰 그리드 (편집/삭제)
- `/booking/bookmarks` — 찜한 매장 (매장 카드 동일 컴포넌트 재사용)
- `/booking/reservation` — 비회원 조회 (예약번호 + 전화번호 입력 → 결과)

---

## 8. Phase 롤아웃 계획

### Phase 0 · Foundation (Day 1~2)
- design tokens (`src/assets/styles/yemo/_tokens.scss`)
- Phosphor Icons 도입 결정 + 설치 (또는 Remix Line 유지 결정)
- Pretendard 웹폰트 최적 로드 (preload + display=swap)
- `_reset.scss` + `.yemo` 격리 클래스
- 핵심 5 컴포넌트 (YBtn, YCard, YInput, YTag, YSection)
- 개발용 미리보기 페이지 `/dev/components` (라우터 가드로 production 차단)

### Phase 1 · 마케팅 (Day 3~8)
1. `layouts/public.vue` + `PublicHeader` + `PublicFooter` (재작성)
2. `pages/index.vue` ← 영웅 페이지
3. `pages/pricing.vue`
4. `pages/features.vue`
5. `pages/faq.vue` (support 콘텐츠 흡수)
6. `pages/login.vue` (사장님/고객 분기)
7. `pages/register.vue`
8. `pages/password-recovery.vue` (forgot+reset 단일 플로우)
9. `pages/oauth2-redirect.vue`

**완료 시 점검:** 사장님 KPI (가입 클릭→완료율) 측정 준비

### Phase 2 · 약관 (Day 9, 1일)
- `layouts/legal.vue` + LegalHeader
- `pages/privacy.vue`, `pages/terms.vue`, `pages/refund-policy.vue`
- 콘텐츠는 `docs/contents/YEMO-약관+개인정보처리방침.md`, `YEMO-환불정책.md` 활용

### Phase 3 · Booking 입구 (Day 10~14)
1. `layouts/booking.vue` + `BookingHeader` + `BookingBottomNav`
2. `pages/booking/index.vue` — 매장 검색
3. `pages/booking/[slug]/index.vue` — 매장 상세
4. `pages/booking/login.vue` 통합 검토 → 결정
5. `pages/booking/profile.vue`

### Phase 4 · Booking 예약/마이 (Day 15~19)
1. `pages/booking/[slug]/reserve.vue` + Step1~Step4 컴포넌트 (재작성)
   - 날짜 선택: 7일 스트립 + 월별 캘린더 모달
   - 비회원 진행 + Step 4 직전 로그인 유도
2. `pages/booking/[slug]/review.vue`
3. `pages/booking/my-reservations.vue`
4. `pages/booking/my-reviews.vue`
5. `pages/booking/bookmarks.vue`
6. `pages/booking/reservation.vue` (비회원 조회)

### Phase 5 · 정리 (Day 20)
- backup 브랜치 자산 회수 검토 → 백업 브랜치 보존 결정
- CLAUDE.md 디자인 시스템 안내 추가
- `docs/history/2026-XX-XX-redesign-complete.md` 완료 기록
- 사용성 자가 점검 체크리스트 (모바일 PWA 설치 / Lighthouse 90+ / 접근성 axe 0 critical)

---

## 9. 위험 요소 & 완화

| # | 위험 | 영향 | 완화 |
|---|---|---|---|
| R1 | Vuetify 전역 스타일이 `.yemo` 영역으로 누수 | 톤 불일치 | `:where(.yemo) { ... }` 스코프, Phase 끝마다 시각 점검 |
| R2 | Phase 간 컴포넌트 추가 시 톤 불일치 | 디자인 일관성 손상 | Phase 1 종료 시점에 컴포넌트 라이브러리 동결, 이후 신규만 추가 |
| R3 | 백엔드 API 변경 필요 발견 | 일정 지연 | 디자인은 기존 API 그대로. 신규 필요한 부분은 백로그 분리 (별도 spec) |
| R4 | Pretendard 웹폰트 로딩 FOUT | 첫 인상 손상 | font-display: swap + preload + fallback `-apple-system` |
| R5 | 모바일 safe-area-inset 처리 누락 | 노치 영역 겹침 | BookingLayout / sticky CTA에 `env(safe-area-inset-bottom)` 일괄 적용 |
| R6 | PWA 캐시로 새 디자인 미반영 | 사용자 혼란 | service worker 버전 bump + skip-waiting 안내 토스트 |

---

## 10. 참고 자료

### 10.1 브레인스토밍 시각 산출물
모든 mockup HTML은 다음에 보존되어 있음 (gitignore 처리, 로컬에서만):
```
.superpowers/brainstorm/1380-1778500335/content/
├── design-direction.html         # 4개 방향성 비교
├── components-preview.html       # v1 (각진, 세리프) — 폐기
├── components-preview-v2.html    # v2 (둥근, Pretendard) — 확정 톤
├── layouts-preview.html          # Marketing 데스크톱 + Booking 모바일
├── landing-hero.html             # v1 — 폐기
├── landing-hero-v2.html          # v2 (이탤릭 제거 + 실제 admin 대시보드 목업) — 확정
└── booking-pages.html            # 검색 + 매장 상세 + reserve Step 2
```
다음 세션에서 시각 참고가 필요하면 visual companion 서버를 다시 띄워서 같은 파일들 로드 가능.

### 10.2 코드 위치 (현재)
- 마케팅 페이지: `src/pages/*.vue`
- Booking 페이지: `src/pages/booking/**/*.vue`
- 레이아웃: `src/layouts/public.vue`
- 공용 컴포넌트: `src/components/public/*`
- 스타일 (이전 시도): 백업 브랜치 `backup/old-redesign-202603-05`의 `src/assets/styles/booking/` — 참고만, 재사용 안 함

### 10.3 콘텐츠 소스
- `docs/contents/landing-page-content.md` (브랜드 `moer → YEMO` 일괄 치환 필요, 7일 → 30일 trial)
- `docs/contents/features-page-content.md`
- `docs/contents/pricing-page-content.md`
- `docs/contents/faq-page-content.md` + support 페이지 콘텐츠 흡수
- `docs/contents/login-signup-content.md`
- `docs/contents/YEMO-약관+개인정보처리방침.md`
- `docs/contents/YEMO-환불정책.md`

### 10.4 관련 결정 기록
- `docs/history/2026-05-12-ui-ux-redesign-kickoff.md` — 킥오프 결정 요약
- `CLAUDE.md` — 프로젝트 메타 + 진행사항

---

## 11. 다음 단계 (다음 세션 이어가는 방법)

이 spec이 승인되면 `superpowers:writing-plans` 스킬로 **세부 implementation plan** 작성으로 넘어갑니다. 그 plan은 다음을 포함:
- Phase 0의 각 파일 단위 작업
- 각 작업의 verifying criteria (어떻게 "완료"를 판정할지)
- 의존성 (A 끝나야 B 가능)
- 테스트/검증 방식

**중단된 세션을 이어갈 때 읽을 순서:**
1. `CLAUDE.md` — 프로젝트 전체 + 현재 진행 단계
2. `docs/history/2026-05-12-ui-ux-redesign-kickoff.md` — 킥오프 컨텍스트
3. **본 spec 문서** — 디자인 결정 전체
4. `docs/superpowers/plans/<plan-file>.md` (작성 예정) — 구체 작업 단계
5. 최신 커밋 메시지 — 어느 Phase까지 진행했는지

---

**문서 작성:** Claude (브레인스토밍 세션 산출물)
**승인:** 사용자 — 2026-05-12
**다음 액션:** `superpowers:writing-plans` 스킬로 Phase 0~5 implementation plan 작성
