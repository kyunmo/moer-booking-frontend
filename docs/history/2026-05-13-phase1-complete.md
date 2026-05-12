# Phase 1 완료 · Marketing Pages

> **완료일:** 2026-05-13
> **계획 문서:** `docs/superpowers/plans/2026-05-13-phase1-marketing.md`
> **설계 spec:** `docs/superpowers/specs/2026-05-12-public-redesign-design.md`

## 완료된 산출물

### 신규 컴포넌트 (`src/components/yemo/`)
- `YContainer.vue`, `YStack.vue` — 레이아웃 primitive
- `marketing/MarketingHeader.vue` — sticky blur 헤더 + 모바일 drawer
- `marketing/MarketingFooter.vue` — 4단 그리드 dark 푸터
- `marketing/landing/HeroSection.vue` — eyebrow + 60px headline + admin mockup + trust bar
- `marketing/landing/PainPointSection.vue` — 4 카드 (warm accent 아이콘)
- `marketing/landing/SolutionSection.vue` — 4 카드 (dark 아이콘 + tip 배지)
- `marketing/landing/FeaturesSection.vue` — 6 카드 (3×2 그리드)
- `marketing/landing/IndustrySection.vue` — 3 탭 (미용실/필라테스·요가/스터디카페·공방)
- `marketing/landing/TestimonialsSection.vue` — 3 후기 카드 (성과 stats 포함)
- `marketing/landing/PricingPreviewSection.vue` — 2 플랜 (유료=dark featured)
- `marketing/landing/FaqPreviewSection.vue` — 5 아코디언
- `marketing/landing/FinalCtaSection.vue` — dark CTA 카드

### 레이아웃
- `src/layouts/marketing.vue` — 마케팅 페이지 전용 (기존 `public.vue`는 booking에서 계속 사용)

### 페이지 (전체 재작성)
- `/` (`pages/index.vue`) — 9 섹션 랜딩
- `/pricing` — 월간/연간 토글 + 9행 비교 표 + 요금제 FAQ
- `/features` — sticky 사이드 nav + 6 기능 좌우 교차 + 업종 탭
- `/faq` — 검색 + 7 카테고리 + 24개 아코디언 + 연락처 카드 (support 흡수)
- `/login` — split layout + 사장님/고객 분기 + 카카오 + 이메일 폼
- `/register` — 사장님 가입 + 30일 trial 배지 + 카카오 + 약관 동의
- `/password-recovery` (신규) — 4-step 통합 (request/sent/reset/done)
- `/oauth2-redirect` — yemo 톤 spinner/error (기존 OAuth 처리 로직 그대로 보존)

### 삭제된 페이지
- `forgot-password.vue`, `reset-password.vue` — `password-recovery.vue`로 통합
- `support.vue` — `/faq`로 흡수 (외부 참조 5건 모두 `/faq`로 갱신)

### 외부 참조 갱신
- `components/public/PublicHeader.vue`, `PublicFooter.vue` — `/support` → `/faq`
- `navigation/vertical/index.js` — admin 사이드바 도움말 메뉴 → `/faq`
- `layouts/components/UserProfile.vue`, `Footer.vue` — `/support` → `/faq`

## 검증 결과
- ✅ `npm run build` 통과 (각 task 후 확인)
- ✅ ESLint 0 errors (Phase 0 동일 baseline)
- ✅ 마케팅 8개 페이지 + 1개 layout + 11개 컴포넌트 정상 컴파일
- ⏳ 브라우저 시각 검증은 PR 머지 전 사용자가 진행

## 브랜드 치환 규칙 적용 결과
- `moer` / `모에르` → `YEMO` 일괄
- `7일 무료체험` → `30일 무료체험`
- 이모지 → Phosphor 아이콘
- 이탤릭 강조 → `<span class="t-accent">` 골드 색상

## 다음 단계
**Phase 2 — 법적 페이지 (3 페이지, ~1일)**
- `layouts/legal.vue` + LegalHeader
- `/privacy`, `/terms`, `/refund-policy` 재작성
- 콘텐츠: `docs/contents/YEMO-약관+개인정보처리방침.md`, `YEMO-환불정책.md`
