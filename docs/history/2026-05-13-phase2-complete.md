# Phase 2 완료 · Legal Pages

> **완료일:** 2026-05-13
> **설계 spec:** `docs/superpowers/specs/2026-05-12-public-redesign-design.md` §6.3, §7.8
> **선행:** Phase 0 (Foundation), Phase 1 (Marketing)

## 완료된 산출물

### 신규 컴포넌트 (`src/components/yemo/legal/`)
- `LegalHeader.vue` — 미니멀 sticky 헤더 (뒤로 + 워드마크)
- `LegalToc.vue` — IntersectionObserver 기반 sticky TOC + 모바일 접힘 토글

### 신규 레이아웃
- `src/layouts/legal.vue` — `.yemo` 루트 + LegalHeader + reading container + MarketingFooter 재사용

### 페이지 재작성 (3)
- `/privacy` — 12개 조항 + 부칙 + 회사 정보 (기존 511줄 PrivacyContent 콘텐츠 보존)
- `/terms` — 9장 22조 + 부칙 (기존 422줄 TermsContent 콘텐츠 보존)
- `/refund-policy` — 8개 섹션 + 환불 산식 + 절차 표 (기존 290줄 그대로 yemo로 전환)

### 브랜드·가격 일관성 적용
- 모에르 / MOER → **YEMO** 일괄
- 가격 19,800원 VAT 포함 → **20,000원 VAT 별도** (Phase 1과 통일)
- 무료 플랜 30건 → **50건** (Phase 1과 통일)
- 무료 체험 → **30일**
- 환불 예시 재계산 (20,000원 기준)
- 연결처 kkm@moer.io → support@yemo.io

### 보존 (Phase 5에서 정리)
- `src/components/legal/PrivacyContent.vue`, `TermsContent.vue`, `LegalDialog.vue`
  - 이유: admin `shop-admin/setup.vue` 가입 위자드에서 Vuetify 다이얼로그로 사용 중. 공개 페이지 범위 밖.

## 디자인 적용
- spec §6.3: max-width 720px reading container, h2 사이 48px 여백, line-height 1.85, 데스크톱 sticky TOC ✓
- VTable → `.legal-table` (yemo CSS), VAlert → `.legal-alert--warning|info` ✓
- IntersectionObserver로 스크롤 위치에 따라 TOC 자동 강조 ✓

## 검증
- ✅ `npm run build` 통과 (각 task 후 확인)
- ⏳ 시각 검증 (`/privacy`, `/terms`, `/refund-policy` 데스크톱·모바일) — PR 머지 전 사용자

## 커밋 흐름 (4개)
```
feat(yemo): rewrite /refund-policy page                f305629
feat(yemo): rewrite /terms page                        0a713a6
feat(yemo): rewrite /privacy page                      fdaf9d9
feat(yemo): add legal layout + LegalHeader + LegalToc  7be28df
```

## 다음 단계
**Phase 3 — Booking 입구 (Day 10~14)**
- `layouts/booking.vue` + `BookingHeader` + `BookingBottomNav`
- `/booking/` (매장 검색), `/booking/[slug]/` (매장 상세)
- `/booking/login` 통합 검토 (`/login?role=customer`로 흡수)
- `/booking/profile`
