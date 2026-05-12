# CLAUDE.md — YEMO Frontend Agent Context

> **AI 에이전트(특히 Claude Code)가 이 저장소에서 작업할 때 필요한 컨텍스트·컨벤션·재개 가이드.**
> 일반 프로젝트 문서는 `README.md` 참고.
>
> **최근 업데이트:** 2026-05-13

---

## 0. 빠른 재개 가이드 (새 세션에서 이어갈 때)

이 순서대로 읽어서 컨텍스트 복원 → 진행 중인 작업 파악 → 즉시 이어가기:

1. **본 파일** — 현재 진행 단계 · 디자인 시스템 요약 · 컨벤션 · gotcha
2. **`README.md`** — 프로젝트 전반, 페이지 구조, 스토어/API 목록
3. **`docs/superpowers/specs/2026-05-12-public-redesign-design.md`** — 공개 페이지 리디자인 설계 spec (디자인 결정 전체)
4. **`docs/history/`** 최신 파일 — 마지막 완료 Phase의 산출물·결정 (날짜순)
5. **`docs/superpowers/plans/`** 최신 파일 — 다음 진행할 Phase의 task plan
6. **`git log --oneline -30`** — 최근 커밋 흐름 확인

세션 도구 컨벤션:
- 큰 작업은 `superpowers:writing-plans` → `superpowers:subagent-driven-development` (또는 `executing-plans`) → `superpowers:finishing-a-development-branch` 흐름으로 진행
- 각 Phase 완료 후 `docs/history/YYYY-MM-DD-phase{N}-complete.md` 작성 + 본 파일 §1 갱신

---

## 1. 현재 진행 상황

### 공개 페이지 UI/UX 리디자인 (2026-05-12 킥오프, 진행 중)

**디자인 방향:** Warm Soft Modern — Editorial Soft 베이스 + Korean Tech 가독성
- 따뜻한 화이트 + 웜 골드 베이지 accent · Pretendard 본문 · 이모지 금지(Phosphor 아이콘)
- 브랜드: **YEMO** · 슬로건 "예약은 예모로" · 워드마크 로고

**컴포넌트 전략:** 공개 영역 = Headless 자체 작성 (`src/components/yemo/`) / admin 영역 = Vuetify 유지

| Phase | 범위 | 상태 | 산출물 |
|---|---|---|---|
| 0 | Foundation — 토큰 + 5 핵심 컴포넌트 + Phosphor + Pretendard | ✅ 2026-05-13 | `docs/history/2026-05-13-phase0-complete.md` |
| 1 | Marketing — 8 페이지 + marketing layout + 11 컴포넌트 | ✅ 2026-05-13 | `docs/history/2026-05-13-phase1-complete.md` |
| 2 | Legal — 3 페이지 + legal layout + LegalHeader/LegalToc | ✅ 2026-05-13 | `docs/history/2026-05-13-phase2-complete.md` |
| 3 | Booking 입구 — booking layout + 검색·상세·프로필 | ⏳ 예정 | plan 작성 필요 |
| 4 | Booking 예약/마이 — reserve wizard + my-reservations 등 | ⏳ 예정 | — |
| 5 | 정리 — backup 자산 회수 · 미사용 코드 · Lighthouse 90+ | ⏳ 예정 | — |

**IA 변경(Phase 1 적용 완료):**
- `/support` → `/faq` 흡수 (외부 참조 5건 갱신)
- `/forgot-password` + `/reset-password` → `/password-recovery` 단일 4-step 플로우
- `/login`에서 사장님/고객 분기 카드 → 각 폼
- `/booking/login` → `/login?role=customer` 흡수 (Phase 3에서 최종 정리)

**브랜드/가격 통일(Phase 0~2 일괄 적용):**
- 모에르 / MOER → **YEMO** (admin 영역 제외)
- 7일 무료체험 → **30일 무료체험**
- 19,800원 VAT 포함 → **20,000원 VAT 별도** (연간 −20%)
- 무료 30건 → **50건**
- kkm@moer.io → **support@yemo.io**

**백업:** 이전 리디자인 시도 → `backup/old-redesign-202603-05` 브랜치 (참고용, 사용 안 함)

---

## 2. yemo 디자인 시스템 (필수 참조)

### 스타일 진입점
`src/main.js`에서 `@styles/yemo/index.scss` import (Vuetify 후). 모든 변수와 컴포넌트 스타일은 `.yemo` 셀렉터 내부에 정의되어 admin 영역에 누수되지 않음.

### CSS 변수 (자주 쓰는 것만)

```scss
// 컬러
--y-bg            #FAFAF8
--y-surface       #FFFFFF
--y-surface-elev  #F2F0EC
--y-text-strong   #1A1A1A
--y-text          #2D2D2D
--y-text-muted    #6B6B6B
--y-accent        #C8A882   // 웜 골드
--y-accent-deep   #A88860
--y-accent-soft   #F0E6D8
--y-border        #E5E3DD
--y-success/warning/danger/info  (+ -soft 변형)

// 라운드
--y-radius-sm 8 | --y-radius 12 | --y-radius-md 14 | --y-radius-lg 16
--y-radius-xl 20 | --y-radius-2xl 24 | --y-radius-pill 999

// 그림자
--y-shadow-sm/(기본)/md/lg/xl | --y-shadow-focus(골드 ring) | --y-shadow-accent

// 모션 (prefers-reduced-motion 시 0)
--y-ease cubic-bezier(0.4,0,0.2,1) | --y-ease-dramatic
--y-dur-fast 200ms | --y-dur-base 300ms | --y-dur-slow 500ms

// z-index
--y-z-base 1 | --y-z-sticky 10 | --y-z-overlay 50 | --y-z-modal 100 | --y-z-toast 200
```

### Typography 유틸리티 클래스

```
.t-display-xl/lg/md  (60/42/28, w800)
.t-title-lg/md/sm    (22/18/16)
.t-body-lg/body/sm   (17/15/13)
.t-caption .t-label  (12/11; .t-label은 uppercase + ls 0.08em)
.t-strong .t-muted .t-accent   // 색상 보조
```

### 컴포넌트 (`src/components/yemo/`)

| 컴포넌트 | 핵심 props · 비고 |
|---|---|
| `YBtn` | `variant=primary\|secondary\|ghost\|text\|accent\|danger`, `size=sm\|md\|lg` (각 36/44/52px 고정 높이), `pill`, `block`, `loading`, `prepend-icon`, `append-icon` |
| `YCard` | `padding=none\|sm\|md\|lg`, `radius=md\|lg\|xl\|2xl`, `bordered`, `elevated`, `interactive`(hover lift) |
| `YInput` | `label`, `error`, `hint`, `prepend-icon`, `append-icon`, `size=sm\|md\|lg`. v-model. useId 기반 a11y |
| `YTag` | `variant=default\|accent\|success\|warning\|danger\|info`, `size=sm\|md`, `icon` |
| `YSection` | `eyebrow`, `title`, `sub`, `align=left\|center` — 마케팅 섹션 헤더 |
| `YContainer` | `width=narrow\|reading\|default\|wide` (720/720/1200/1440), `padding` |
| `YStack` | `gap`, `align`, `as` — flex column |

**마케팅·법적 chrome:**
- `marketing/MarketingHeader.vue` — sticky blur + 햄버거 drawer
- `marketing/MarketingFooter.vue` — 4단 dark
- `marketing/landing/{Hero,PainPoint,Solution,Features,Industry,Testimonials,PricingPreview,FaqPreview,FinalCta}Section.vue`
- `legal/LegalHeader.vue` — 미니멀 (뒤로 + 워드마크)
- `legal/LegalToc.vue` — IntersectionObserver sticky TOC

### 시각 검증 라우트
- `/dev/components` — 5 컴포넌트 + 타이포 + 컬러 팔레트

### 사용 규칙
- 모든 yemo 페이지는 **루트에 `<div class="yemo">`** 또는 yemo layout을 사용 (격리 보장)
- 아이콘은 **Phosphor만** — `<Icon icon="ph:..." />` (Iconify `@iconify-json/ph` 사용)
- 이모지 (✅ 🎉 등) 사용 금지
- 이탤릭 강조 금지 → `<span class="t-accent">` (골드 색)으로 대체

---

## 3. 핵심 컨벤션 · gotcha

### Dialog 패턴 (프로젝트 표준)
- `v-model` (`modelValue` prop + `update:modelValue` emit)
- Materio 원본의 `isDialogVisible` 패턴은 **사용 안 함**
- 도메인별로 Detail + Form + ConfirmDelete 3종 구성

### 이중 토큰 인증
- 관리자 토큰: `localStorage.accessToken` (`/shop-admin/**`)
- 고객 토큰: `localStorage.customerAccessToken` (`/booking/**`, `/api/customer/**`)
- Axios 인터셉터(`src/api/axios.js`)에서 URL 기반 3-way 분기 (`/public/**` / `/customer/**` / 그 외)
- 슈퍼 관리자 API에는 자동으로 `X-Business-Id` 헤더 부착

### OAuth URL
- **올바름:** `/oauth2/authorize/kakao`
- **틀림:** `/oauth2/authorization/kakao` ← 이전 버그
- `loginType=admin|customer` 쿼리 파라미터로 분기
- `OAUTH_BASE_URL`은 `src/utils/oauth.js`에서 `VITE_API_BASE_URL`의 `/api` 접미사를 제거하여 생성

### Auth Store 시그니처 (Phase 1에서 확인됨)
```
authStore.login({ email, password })
authStore.register({ email, password, ownerName, phone, businessName })
authStore.fetchCurrentUser()

authApi.forgotPassword(email)             // store 미보유, API 직접 호출
authApi.resetPassword(token, newPassword) // store 미보유, API 직접 호출

customerAuthStore.startKakaoLogin(redirectPath)
customerAuthStore.handleOAuthCallback(accessToken, refreshToken, isNewUser)
customerAuthStore.fetchProfile()
customerAuthStore.consumeRedirectPath()
```

### 카테고리 시스템
- DB 기반: `categoryId` (number) + `categoryName` (JOIN으로 조회)
- 5분 캐시 (`stores/service-category.js`, `stores/staff-position.js`)
- UI 하위 호환: `service.categoryName || service.category`

### 이미지 업로드
- 5MB 제한 · JPG/PNG/WebP만 허용
- ObjectURL 미리보기 + `onBeforeUnmount`에서 `URL.revokeObjectURL` 호출 (메모리 누수 방지)
- 서비스: 최대 3장 / 리뷰: 제한 없음 (제출 후 순차 업로드)

### 에러 코드 도메인
- **고객 인증**: CP001(전화필수) · CP002(고객역할) · CP003(예약미발견) · CP004(본인예약아님)
- **서비스 카테고리**: SV004(이름중복) · SV005(서비스보유시삭제불가)
- **신규 도메인**: IMG · NTF · CRM · STAT · PUB

### 파일 기반 라우팅 (unplugin-vue-router)
- `src/pages/**/*.vue` → 자동 라우트
- `definePage({ meta: { layout, public, title, ... } })`로 설정 (`<script setup>` 안에)
- 자동 import 대상 (auto-imports.d.ts에 등록)

### 자동 생성 파일 (gitignore 대상은 아니지만 매 빌드마다 변경됨)
- `auto-imports.d.ts` · `components.d.ts` · `typed-router.d.ts` · `.eslintrc-auto-import.json`
- 매 `npm run build` / `npm run dev` 시 재생성 → 워킹 트리에 자주 보임
- Phase 작업 시 별 영향 없으므로 stash 또는 그냥 두기

### Vuetify 영역 격리 (중요)
- yemo CSS는 모두 `.yemo` 스코프 → admin 영역(`/shop-admin/**`)에 영향 0
- `<style scoped>` 사용
- yemo 컴포넌트는 절대 `/shop-admin/**` 페이지에서 사용 금지 (역도 마찬가지)

---

## 4. ⚠️ 자주 실수하는 것 (반드시 피하기)

### `npm run lint`는 전체 프로젝트에 `--fix` 적용
- `package.json` 스크립트: `eslint . -c .eslintrc.cjs --fix --ext ...`
- `npm run lint -- path/to/file.vue`로는 **단일 파일 lint가 안 됨** (`.` 인자 우선)
- 단일 파일 lint하려면: `npx eslint -c .eslintrc.cjs --ext .vue path/to/file.vue`
- 잘못 실행하면 ~132개 무관 파일에 포맷 변경 발생 → 별도 chore 커밋으로 분리하거나 stash

### Vue Write 도구 사용
- 기존 파일을 `Write`로 덮어쓰려면 먼저 `Read` 호출 필요 (안 그러면 에러)
- Edit가 가능하면 Edit 사용 (전체 덮어쓸 때만 Write)

### 빌드 시간
- `npm run build`는 약 2~3분 (FullCalendar/Vuetify 청크 큼)
- 매 Task 후 빌드 검증하면 빌드 시간만 30분+ 소요
- 권장: 컴포넌트 묶음 (3~4개)마다 빌드 + 페이지 단위는 직후 빌드

### Subagent 호출 시
- 빌드 명령(2분+)이 포함되면 timeout 가능성 — implementer가 빌드 중간에 종료될 수 있음
- 단순 컴포넌트는 직접 작성이 더 빠름 (subagent의 overhead 회피)
- 통합/디버깅이 필요한 페이지(login·oauth2·register 등)는 subagent 또는 직접 구현 모두 가능

### Auto-imports 미적용 상황
- `definePage`, `RouterLink`, `useRoute`, `useRouter`, `ref`, `computed`, `onMounted` 등은 auto-import 동작
- 단, **`Icon`은 명시적 import 필요**: `import { Icon } from '@iconify/vue'`

### 브랜드/가격 일관성
- 페이지 작성 시 항상 모에르 → **YEMO**, 19,800원 → **20,000원 VAT 별도** 적용
- 콘텐츠 소스(`docs/contents/*.md`)는 이전 브랜드 그대로라 치환 필요

---

## 5. 작업 흐름 (대형 Phase 작업)

### 추천 순서

```
1. brainstorming 또는 spec 작성 (필요 시)
   ↓
2. writing-plans 스킬로 phase plan 작성
   docs/superpowers/plans/YYYY-MM-DD-phaseN-{name}.md
   ↓
3. feat 브랜치 생성 (main에서)
   git checkout -b feat/yemo-phaseN-{name}
   (워킹 트리 더러우면 stash 먼저)
   ↓
4. TaskCreate로 task list 등록 (plan의 task 단위)
   ↓
5. 각 task별 구현 (Write/Edit) → npm run build → git commit
   - 단순 컴포넌트: 직접 구현 권장
   - 통합 페이지(auth 등): API/store 시그니처 먼저 확인
   ↓
6. PR 생성 (gh pr create) + 자세한 본문
   ↓
7. main 자동 머지 (gh pr merge N --merge --delete-branch)
   ↓
8. 로컬 sync: git fetch + git update-ref + 브랜치 정리
   ↓
9. docs/history/YYYY-MM-DD-phaseN-complete.md 작성 + CLAUDE.md §1 갱신
```

### PR 컨벤션
- title: `feat(yemo): Phase N {Name} - 한 줄 요약`
- body: 산출물(파일 단위) · 디자인 적용 · 검증 · Test Plan · 다음 단계
- 머지 commit: 자동 (`gh pr merge --merge`)

### gh CLI 인증
- 새 세션에서 `gh auth status`로 확인. 미인증 시 사용자에게 `! gh auth login` 요청

---

## 6. 디렉토리 구조 요약

```
src/
├── api/                       # 21+ axios 모듈 — 인터셉터: src/api/axios.js
├── assets/styles/yemo/        # yemo 디자인 토큰 + 유틸 (6 SCSS)
├── components/
│   ├── yemo/                  # ✨ 핵심 — Headless 컴포넌트
│   │   ├── Y{Btn,Card,Input,Tag,Section,Container,Stack}.vue
│   │   ├── marketing/         # MarketingHeader/Footer + landing 9 섹션
│   │   └── legal/             # LegalHeader, LegalToc
│   ├── public/                # 기존 booking 영역 헤더/푸터 (Phase 3에서 정리 예정)
│   ├── legal/                 # 구버전 (admin setup에서 사용 중)
│   ├── dialogs/ common/ ...
├── layouts/
│   ├── default.vue            # admin (Vuetify Materio)
│   ├── blank.vue
│   ├── public.vue             # 기존 booking layout (Phase 3에서 booking.vue 분리)
│   ├── marketing.vue          # ✨ Phase 1
│   └── legal.vue              # ✨ Phase 2
├── pages/
│   ├── *.vue (마케팅/법적)    # Phase 1·2에서 재작성
│   ├── booking/               # Phase 3·4 대상
│   ├── shop-admin/            # Vuetify 유지
│   └── dev/components.vue     # yemo 컴포넌트 미리보기
├── stores/                    # 19 Pinia 스토어
└── @core/, @layouts/, plugins/ — Materio 코어
```

---

## 7. 외부 시스템 의존

| 시스템 | 용도 | 비고 |
|---|---|---|
| GitHub (kyunmo/moer-booking-frontend) | 저장소 + PR · 머지 | gh CLI 사용 |
| 백엔드 API | 모든 데이터 | `http://localhost:8080`, 별도 저장소 |
| 카카오 OAuth | 사장님·고객 로그인 | `/oauth2/authorize/kakao` |
| jsdelivr CDN | Pretendard 폰트 | preconnect crossorigin |

---

## 8. 본 문서 유지 규칙

이 문서를 갱신해야 하는 경우:

- **§1 진행 단계**: Phase 완료 시마다 ✅ + 날짜 + history 링크 갱신
- **§2 디자인 시스템**: 컴포넌트 추가/변경 시
- **§3 컨벤션**: 새 규칙 합의 시 또는 자주 실수하는 패턴 발견 시
- **§4 자주 실수**: 새 gotcha 발견 시
- **§5 작업 흐름**: 작업 방식 변경 시
- **§6 디렉토리 구조**: 폴더 추가/이동 시

각 Phase 완료 커밋에서 함께 갱신.

---

## 부록: 자주 쓰는 명령어

```bash
# 빌드/개발
npm run dev                    # 5173 포트
npm run build                  # 2-3분
npx eslint -c .eslintrc.cjs --ext .vue path/to.vue   # 단일 파일 lint

# git
git log --oneline main..HEAD   # feat 브랜치 커밋
git stash list                 # 잔재 확인
git worktree list              # 에이전트 worktree (잠금 상태일 수 있음)

# gh CLI
gh pr create --base main --head feat/yemo-phaseN --title "..." --body "..."
gh pr merge N --merge --delete-branch
gh pr view N --json state,mergeCommit

# 로컬 main 동기화 (워킹 트리 더러울 때)
git fetch origin --prune
git update-ref refs/heads/main origin/main
git checkout main
```
