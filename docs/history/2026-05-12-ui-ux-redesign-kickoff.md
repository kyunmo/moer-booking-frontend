# 2026-05-12 · 사용자 페이지 UI/UX 리디자인 킥오프

## 배경
- 2026-03-05 이전 시도는 부분 진행 상태(워킹 트리 미커밋, 52개 파일)에서 중단됨
- 백업 브랜치 `backup/old-redesign-202603-05`에 보존하고 main을 리셋
- 구식 평가/페르소나/계획 문서(8개) 삭제 — `docs/contents/`, `docs/vue-version/`, `docs/history/`만 유지
- 2026-05-12부터 새로 시작

## 확정된 요구사항 (브레인스토밍 결과)

| 항목 | 결정 | 비고 |
|---|---|---|
| **범위** | 공개 페이지 전체 | 관리자(shop-admin / super-admin) 제외 |
| **청중 우선순위** | 사장님(B2B) / 고객(B2C) 동등 | 둘 다 잘 만든다 |
| **디자인 방향** | A · Editorial Soft + D · Korean Tech Modern 가독성 하이브리드 | 따뜻한 화이트 + 세리프 헤드라인 + Pretendard 본문 가독 최우선 |
| **디바이스** | 영역별 분리 | 마케팅 = 데스크톱+모바일 동등 / booking = 모바일 퍼스트 |
| **IA 옵션** | Option 2 (중간 개선) | 18 페이지 (support 흡수, password 단일 플로우) |
| **로그인 통합** | `/login`에서 사장님/고객 선택 분기 | 사용자 혼란 제거 |
| **비회원 예약** | 허용 — reserve 끝단에서 로그인 유도 | 마찰 감소 |
| **브랜드** | `YEMO` · "예약은 예모로" · 워드마크 로고 | 기존 모에르(MOER) 표기 제거 |
| **컴포넌트** | 영역별 — 공개 = Headless / admin = Vuetify | `.yemo-booking` (또는 동등) 격리 클래스 유지 |
| **실행 전략** | C · Hybrid Track (토큰 + 영웅 페이지 → 단계별 롤아웃) | Phase 1 마케팅 → Phase 2 인증 → Phase 3 Booking → Phase 4 약관 |

## 색상·타이포 1차 정의 (Editorial Soft 베이스)
- 배경: `#FAFAF8` (따뜻한 화이트)
- Surface: `#FFFFFF`
- Primary (텍스트/CTA): `#2D2D2D` (소프트 블랙)
- Accent: `#C8A882` (웜 골드 베이지)
- Muted: `#9E9E9E` (또는 더 진한 `#8A8A8A` 검토)
- Border: `#EEEDE9` (또는 `#E5E3DD` 검토)
- 서체: Display = Noto Serif KR / Body = Pretendard

## 다음 작업
1. Foundation 토큰 시스템 spec 작성 (`src/assets/styles/yemo/`)
2. 핵심 컴포넌트(Button/Card/Input/Modal/Chip) 설계 — Headless 기반
3. 랜딩 페이지 영웅 디자인 → 구현 → 컴포넌트 추출 정착
4. Phase 1 마케팅 페이지 일괄 적용

## 폐기된 자산 (참고용)
- 백업 브랜치: `backup/old-redesign-202603-05` (커밋 `003465e`)
- 거기 포함: `src/assets/styles/booking/_tokens.scss` 외 5개 SCSS, `docs/plans/2026-03-05-ui-ux-redesign-design.md`, 페르소나 평가 보고서 3종, public 영역 52개 파일 1차 수정

## 관련 문서
- `docs/superpowers/specs/2026-05-12-public-redesign-design.md` — 설계 스펙(작성 예정)
- `docs/contents/` — 페이지별 카피 원본 (보존됨)
