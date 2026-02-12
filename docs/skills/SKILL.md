# moer Frontend Development SKILL

## 🎯 개요
이 SKILL은 moer 예약 시스템 프론트엔드 개발을 위한 **5개의 전문 Agent**를 정의합니다.
각 Agent는 독립적으로 호출 가능하며, 복잡한 작업 시 자동으로 협업합니다.

**Agent 목록**:
1. 🔍 **Project Analyzer** - 현재 프론트엔드 프로젝트 분석 및 문서화
2. 🎨 **Senior Planner** - UI/UX 설계 및 화면 구조 검토
3. 🎭 **UI Designer** - Materio 템플릿 활용 전문가 (★ 신규)
4. 💻 **Frontend Developer** - Vue 컴포넌트 자동 생성
5. 🔗 **API Integrator** - Backend API 동기화 및 검증 (★ 강화)

---

## 🤖 Agent 사용 가이드

### 기본 사용법
```
@Agent명 [요청사항]
```

### Agent 선택 기준
| 요청 유형 | 사용할 Agent |
|----------|-------------|
| "현재 프론트엔드 진행 상황 분석해줘" | @Project Analyzer |
| "Customer 화면 설계해줘" | @Senior Planner |
| "이 화면에 어떤 Materio 컴포넌트 쓸까?" | @UI Designer |
| "Customer 화면 코드 생성해줘" | @Frontend Developer |
| "Backend API랑 동기화 확인해줘" | @API Integrator |
| "Customer 화면 전체 만들어줘" | @Frontend Developer (자동으로 다른 Agent 호출) |

### Agent 협업 플로우
```
사용자 요청: "Customer 화면 전체 만들어줘"
     ↓
@Frontend Developer 시작
     ↓
1. @Project Analyzer 호출 (현재 상태 파악)
     ↓
2. @Senior Planner 호출 (UI/UX 설계)
     ↓
3. @UI Designer 호출 (템플릿 컴포넌트 선택)
     ↓
4. 자체 코드 생성 (Pages + Components + Store)
     ↓
5. @API Integrator 호출 (Backend API 동기화)
     ↓
완료 보고
```

---

## 📋 Agent 1: Project Analyzer

### Agent 정보
```yaml
Name: Frontend Project Analyzer
Role: 프론트엔드 프로젝트 상태 분석 및 문서화 전문가
Trigger: "현재 상태", "진행 상황", "분석", "문서화"
```

### 역할
**현재 프론트엔드 프로젝트 상태를 분석하고 문서화**하는 전문 분석가입니다.

### 주요 기능

#### 1. 진행 상황 파악
- 완료된 화면(Pages) 목록
- 각 화면별 구현 완성도 (List, Detail, Edit, Store, API 연동)
- 미완성 부분 식별

#### 2. 코드베이스 분석
- pages/ 구조 분석
- components/ 재사용 현황
- stores/ 구현 상태
- router 등록 확인

#### 3. 템플릿 활용도 분석
- Materio 컴포넌트 사용 현황
- 커스텀 컴포넌트 vs 템플릿 컴포넌트 비율
- 미사용 템플릿 기능 식별

#### 4. API 연동 상태
- Backend API와 매핑 상태
- 미연동 API 목록
- Store actions 구현률

#### 5. 다음 단계 제안
- 우선순위 화면 추천
- Backend 의존성 (API 완성도)
- 잠재적 이슈 경고

### 호출 예시

```bash
# 전체 상태 분석
@Project Analyzer
현재 프론트엔드 프로젝트 진행 상황을 분석해줘.
완료된 화면, 미완성 부분, 다음 단계를 정리해줘.

# 특정 화면 분석
@Project Analyzer
Reservation 화면의 구현 완성도를 체크해줘.
List, Detail, Edit, Store, API 연동 각각 확인하고
누락된 기능이나 개선점을 알려줘.

# 템플릿 활용도 분석
@Project Analyzer
Materio 템플릿 컴포넌트를 얼마나 활용하고 있는지 분석해줘.
VDataTable, VDialog, VAutocomplete 등 주요 컴포넌트 사용률을 알려줘.

# API 동기화 체크
@Project Analyzer
Backend API와 Frontend Store가 동기화되어 있는지 확인해줘.
- 엔드포인트 일치 여부
- 누락된 API 호출
- DTO 구조 일치 여부
```

### 출력 예시

```markdown
# moer Frontend 프로젝트 분석 리포트
**생성일**: 2026-02-11
**분석 대상**: moer-booking-frontend

## 📊 전체 현황
- 총 화면 수: 8개
- 완료: 4개 (Login, Dashboard, Business, Staff)
- 진행 중: 2개 (Service 80%, Reservation 60%)
- 미착수: 2개 (Customer, CustomerHistory)
- 전체 진행률: 62%

## 📁 화면별 상세 현황

### ✅ Business 화면 (100% 완료)
**파일 목록**:
- pages/business/index.vue ✅
- pages/business/components/BusinessDetailDialog.vue ✅
- pages/business/components/BusinessEditDialog.vue ✅
- stores/business.js ✅ (CRUD 완료)

**구현 기능**:
- ✅ List 화면 (VDataTable)
- ✅ Detail Dialog (읽기)
- ✅ Edit Dialog (생성/수정)
- ✅ Pinia Store (5개 actions)
- ✅ API 연동 (100%)

**Materio 컴포넌트 활용**:
- VDataTable (목록)
- VDialog (상세/수정)
- VForm (폼 검증)
- VTextField, VTextarea (입력)
- VBtn (액션 버튼)

**API 매핑**:
```
✅ GET    /api/businesses/{id}  → fetchBusiness()
✅ PUT    /api/businesses/{id}  → updateBusiness()
✅ PATCH  /api/businesses/{id}/settings → updateSettings()
```

---

### 🚧 Reservation 화면 (60% 진행 중)
**파일 목록**:
- pages/reservations/index.vue ✅
- pages/reservations/components/ReservationCalendar.vue ⚠️ (FullCalendar 미통합)
- pages/reservations/components/ReservationTable.vue ✅
- pages/reservations/components/ReservationFormDialog.vue ❌ (미작성)
- stores/reservation.js ⚠️ (일부 구현)

**누락 사항**:
1. **ReservationFormDialog 미작성**
   - 고객 선택 (VAutocomplete)
   - 직원 선택 (VSelect)
   - 서비스 다중 선택 (VAutocomplete multi)
   - 날짜/시간 선택 (VDatePicker, VTextField type="time")

2. **Store 미구현 actions**:
   - updateStatus() - 상태 변경
   - searchByDate() - 날짜별 검색

3. **API 미연동**:
   - ❌ PATCH /api/businesses/1/reservations/{id}/status
   - ❌ 시간 겹침 검증 로직 없음

**잠재적 이슈**:
- FullCalendar 라이브러리 설치 필요
- 시간 겹침 시 사용자 피드백 없음

---

### ❌ Customer 화면 (미착수)
**의존성**: Backend Customer API 완료 (완료됨 ✅)
**예상 소요**: 3시간
**필요 컴포넌트**:
- VDataTable (목록)
- VAutocomplete (태그 선택)
- VTextField (검색)

---

## 📊 Materio 템플릿 활용도

### 주요 컴포넌트 사용률
| 컴포넌트 | 사용 횟수 | 활용도 |
|---------|----------|--------|
| VDataTable | 4개 화면 | ⭐⭐⭐⭐⭐ |
| VDialog | 8개 | ⭐⭐⭐⭐⭐ |
| VForm | 6개 | ⭐⭐⭐⭐ |
| VAutocomplete | 2개 | ⭐⭐ (저조) |
| VDatePicker | 0개 | ❌ (미사용) |
| VTabs | 1개 | ⭐ (저조) |
| FullCalendar | 0개 | ❌ (미통합) |

### 🔴 미활용 템플릿 기능
1. **VDatePicker** - 예약 날짜 선택에 활용 가능
2. **VAutocomplete** - 고객/서비스 검색에 더 활용 필요
3. **FullCalendar** - Reservation 캘린더 뷰에 필수
4. **VChip** - 태그, 상태 표시에 활용 가능
5. **VTimeline** - CustomerHistory 시간순 표시에 적합

## 🔗 API 동기화 상태

### ✅ 동기화 완료 (4개 화면)
```
Login    → POST /api/auth/login
Business → GET/PUT/PATCH /api/businesses/{id}
Staff    → GET/POST/PUT/DELETE /api/businesses/1/staffs
Service  → GET/POST/PUT/DELETE /api/businesses/1/services
```

### ⚠️ 부분 동기화 (2개 화면)
```
Reservation:
  ✅ GET    /api/businesses/1/reservations
  ✅ POST   /api/businesses/1/reservations
  ❌ PATCH  /api/businesses/1/reservations/{id}/status (미구현)
  ❌ DELETE /api/businesses/1/reservations/{id} (미구현)
```

### ❌ 미연동 (2개 화면)
```
Customer         → 0/5 API
CustomerHistory  → 0/4 API
```

## 📈 다음 단계 제안

### 🔥 우선순위 1: Reservation FormDialog 완성
**이유**: 60% 완료, 핵심 기능 누락
**작업 내역**:
1. ReservationFormDialog.vue 생성 (2시간)
   - VAutocomplete (고객 검색)
   - VSelect (직원 선택)
   - VAutocomplete multi (서비스)
   - VDatePicker (날짜)
   - VTextField type="time" (시간)
2. Store updateStatus() 구현 (30분)
3. API 연동 테스트 (30분)

**예상 소요**: 3시간

### 🔥 우선순위 2: Customer 화면 시작
**이유**: Backend API 완료됨
**작업 내역**:
1. pages/customers/index.vue (1시간)
2. CustomerDetailDialog + EditDialog (1.5시간)
3. stores/customer.js (30분)
4. API 연동 (30분)

**예상 소요**: 3.5시간

### ⏸️ 우선순위 3: FullCalendar 통합
**이유**: Reservation 시각화 필수
**예상 소요**: 2시간

## ⚠️ 발견된 이슈

### 1. API 엔드포인트 불일치
**위치**: stores/staff.js
**문제**:
```javascript
// 현재
await axios.get('/businesses/staffs')  // ❌ businessId 누락

// 수정 필요
await axios.get('/businesses/1/staffs')  // ✅
```

### 2. 에러 핸들링 누락
**위치**: stores/reservation.js
**문제**: create() 실패 시 사용자 피드백 없음
**제안**:
```javascript
catch (error) {
  const message = error.response?.data?.message || '예약 생성에 실패했습니다'
  useToast().error(message)  // 추가 필요
  throw error
}
```

### 3. Loading 상태 불일치
**위치**: pages/reservations/index.vue
**문제**: Store loading과 Local loading 중복
**제안**: Store loading만 사용

## 📊 코드 통계
- 총 Vue 파일: 24개
- Pages: 8개
- Components: 16개
- Stores: 6개
- 총 라인 수: 2,847줄
- 평균 컴포넌트 라인: 118줄

## 🎯 이번 주 목표
1. ✅ Reservation FormDialog 완성 (100%)
2. 🎯 Customer 화면 시작 (80%)
3. 🎯 API 동기화 100% 달성
```

---

## 🎨 Agent 2: Senior Planner

### Agent 정보
```yaml
Name: Frontend Senior Planner
Role: UI/UX 설계 및 화면 구조 검토 전문가
Trigger: "설계", "검토", "개선", "UI/UX"
```

### 역할
**UI/UX 설계 및 화면 구조를 검토**하는 시니어 기획자입니다.

### 주요 책임

#### 1. 화면 구성 설계
- List/Detail/Edit 분리 전략
- 사용자 플로우 정의
- 반응형 레이아웃 전략

#### 2. 컴포넌트 선택
- Materio vs Custom 판단
- 재사용 컴포넌트 식별
- 컴포넌트 계층 구조

#### 3. 폼 설계
- 필드 배치 (cols, md, lg)
- 검증 규칙 정의
- 에러 메시지 UX

#### 4. 데이터 흐름 설계
- Pinia Store 구조
- API 호출 시점
- 상태 관리 전략

### 설계 검토 체크리스트

```markdown
**화면 구성**
- [ ] List/Detail/Edit 분리가 명확한가?
- [ ] 사용자 플로우가 자연스러운가?
- [ ] 모바일 UX가 고려되었는가?
- [ ] 로딩/에러 상태 표시가 있는가?

**컴포넌트 선택**
- [ ] Materio 템플릿 컴포넌트를 최대한 활용하는가?
- [ ] 재사용 가능한 컴포넌트인가?
- [ ] 계층 구조가 깔끔한가? (3레벨 이하)

**폼 설계**
- [ ] 필드 그룹핑이 논리적인가?
- [ ] 반응형 레이아웃(cols, md)이 적절한가?
- [ ] 필수/선택 필드가 명확한가?
- [ ] 검증 규칙이 사용자 친화적인가?

**데이터 흐름**
- [ ] Pinia Store 액션이 명확한가?
- [ ] API 호출이 중복되지 않는가?
- [ ] 낙관적 업데이트가 필요한가?
```

### 호출 예시

```bash
# 새 화면 설계
@Senior Planner
Customer 화면을 설계하려고 해.

기능:
- 고객 목록 (검색, 필터, 페이징)
- 상세 보기 (읽기 전용)
- 생성/수정 폼
- 태그 관리

UI/UX 설계해줘. Materio 컴포넌트 추천도 해줘.

# 기존 화면 개선
@Senior Planner
Reservation 화면을 개선하고 싶어.

현재:
- 리스트만 있고 캘린더 뷰 없음
- 예약 생성 시 UX 복잡함
- 시간 겹침 피드백 없음

개선 방안 제안해줘.

# 컴포넌트 분리 검토
@Senior Planner
ReservationFormDialog가 너무 커져서
300줄이 넘어. 컴포넌트 분리 방안 제안해줘.

현재 기능:
- 고객 선택
- 직원 선택
- 서비스 다중 선택
- 날짜/시간 선택
- 가격 자동 계산
```

### 출력 예시

```markdown
# Customer 화면 UI/UX 설계

## ✅ 잘 설계된 부분
1. **기능 명확성**: CRUD + 검색 + 태그 관리로 범위 명확
2. **사용자 시나리오**: 고객 등록 → 조회 → 수정 플로우 자연스러움

## 📋 화면 구조 설계

### 1. Pages 구조
```
pages/customers/
├── index.vue                    # 메인 페이지
└── components/
    ├── CustomerTable.vue        # 목록 (재사용)
    ├── CustomerDetailDialog.vue # 상세 (읽기)
    └── CustomerEditDialog.vue   # 생성/수정
```

### 2. 메인 페이지 레이아웃
```vue
<!-- pages/customers/index.vue -->
<VCard>
  <!-- 헤더: 제목 + 생성 버튼 -->
  <VCardTitle>
    <h2>고객 관리</h2>
    <VBtn @click="openCreate">고객 추가</VBtn>
  </VCardTitle>

  <!-- 필터 영역 -->
  <VCardText>
    <VRow>
      <VCol cols="12" md="4">
        <VTextField 
          v-model="search"
          label="검색"
          prepend-inner-icon="ri-search-line"
          placeholder="이름, 전화번호 검색"
        />
      </VCol>
      
      <VCol cols="12" md="4">
        <VAutocomplete
          v-model="selectedTags"
          :items="tags"
          label="태그 필터"
          multiple
          chips
        />
      </VCol>

      <VCol cols="12" md="4">
        <VSelect
          v-model="sortBy"
          :items="sortOptions"
          label="정렬"
        />
      </VCol>
    </VRow>
  </VCardText>

  <!-- 목록 테이블 -->
  <CustomerTable
    :customers="filteredCustomers"
    :loading="loading"
    @click-row="openDetail"
  />

  <!-- Dialog들 -->
  <CustomerDetailDialog
    v-model="detailDialog"
    :customer="selectedCustomer"
    @edit="openEdit"
  />

  <CustomerEditDialog
    v-model="editDialog"
    :customer="selectedCustomer"
    @submit="handleSubmit"
  />
</VCard>
```

### 3. Materio 컴포넌트 추천

#### 목록 화면
```vue
<!-- VDataTable 사용 (Materio 템플릿) -->
<VDataTable
  :items="customers"
  :headers="headers"
  :loading="loading"
  :items-per-page="20"
  @click:row="openDetail"
>
  <!-- 커스텀 셀: 태그 -->
  <template #item.tags="{ item }">
    <VChip
      v-for="tag in item.tags"
      :key="tag"
      size="small"
      class="mr-1"
    >
      {{ tag }}
    </VChip>
  </template>

  <!-- 커스텀 셀: 고객 등급 -->
  <template #item.grade="{ item }">
    <VChip :color="getGradeColor(item.visitCount)" size="small">
      {{ getGrade(item.visitCount) }}
    </VChip>
  </template>

  <!-- 커스텀 셀: 액션 -->
  <template #item.actions="{ item }">
    <VBtn icon size="small" @click.stop="openEdit(item)">
      <VIcon>ri-edit-line</VIcon>
    </VBtn>
  </template>
</VDataTable>
```

**장점**:
- 페이지네이션 자동
- 정렬 기능 내장
- 로딩 스피너 자동
- 반응형 지원

#### 검색 필드
```vue
<!-- VAutocomplete 사용 (검색 + 선택) -->
<VAutocomplete
  v-model="selectedCustomer"
  :items="customers"
  :loading="loading"
  item-title="name"
  item-value="id"
  label="고객 검색"
  placeholder="이름 또는 전화번호 입력"
  prepend-inner-icon="ri-search-line"
  clearable
>
  <!-- 커스텀 아이템 -->
  <template #item="{ props, item }">
    <VListItem v-bind="props">
      <template #prepend>
        <VAvatar color="primary" size="36">
          {{ item.raw.name[0] }}
        </VAvatar>
      </template>
      
      <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
      <VListItemSubtitle>
        {{ item.raw.phone }} • 방문 {{ item.raw.visitCount }}회
      </VListItemSubtitle>
    </VListItem>
  </template>
</VAutocomplete>
```

**장점**:
- 자동 완성
- 검색 기능 내장
- 커스텀 아이템 템플릿
- 로딩 상태 지원

#### 태그 입력
```vue
<!-- VAutocomplete multiple (태그 선택) -->
<VAutocomplete
  v-model="form.tags"
  :items="availableTags"
  label="태그"
  placeholder="태그 선택 (최대 10개)"
  prepend-inner-icon="ri-price-tag-3-line"
  multiple
  chips
  closable-chips
  :rules="[rules.maxTags(10)]"
>
  <template #chip="{ props, item }">
    <VChip
      v-bind="props"
      :color="getTagColor(item.raw)"
      closable
    >
      {{ item.title }}
    </VChip>
  </template>
</VAutocomplete>
```

**장점**:
- 다중 선택
- Chip 자동 생성
- 최대 개수 제한 가능

### 4. 폼 설계

#### 생성/수정 Dialog
```vue
<VDialog v-model="isOpen" max-width="800" persistent>
  <VCard>
    <VCardTitle>
      <span>{{ isEditMode ? '고객 수정' : '고객 추가' }}</span>
      <VBtn icon size="small" @click="close">
        <VIcon>ri-close-line</VIcon>
      </VBtn>
    </VCardTitle>

    <VDivider />

    <VCardText>
      <VForm ref="formRef" v-model="valid">
        <VRow>
          <!-- 기본 정보 섹션 -->
          <VCol cols="12">
            <h3 class="text-h6 mb-2">기본 정보</h3>
          </VCol>

          <!-- 이름 (필수) -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.name"
              label="이름"
              prepend-inner-icon="ri-user-line"
              :rules="[rules.required]"
              autofocus
            />
          </VCol>

          <!-- 전화번호 (필수) -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.phone"
              label="전화번호"
              prepend-inner-icon="ri-phone-line"
              placeholder="010-1234-5678"
              :rules="[rules.required, rules.phone]"
            />
          </VCol>

          <!-- 이메일 (선택) -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.email"
              label="이메일"
              type="email"
              prepend-inner-icon="ri-mail-line"
              :rules="[rules.email]"
              clearable
            />
          </VCol>

          <!-- 생년월일 (선택) -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.birthDate"
              label="생년월일"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              clearable
            />
          </VCol>

          <!-- 성별 (선택) -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.gender"
              label="성별"
              :items="genderOptions"
              prepend-inner-icon="ri-user-line"
              clearable
            />
          </VCol>

          <!-- 추가 정보 섹션 -->
          <VCol cols="12" class="mt-4">
            <h3 class="text-h6 mb-2">추가 정보</h3>
          </VCol>

          <!-- 태그 -->
          <VCol cols="12">
            <VAutocomplete
              v-model="form.tags"
              :items="tagOptions"
              label="태그"
              prepend-inner-icon="ri-price-tag-3-line"
              placeholder="태그 선택 (최대 10개)"
              multiple
              chips
              closable-chips
            />
          </VCol>

          <!-- 메모 -->
          <VCol cols="12">
            <VTextarea
              v-model="form.memo"
              label="메모"
              prepend-inner-icon="ri-file-text-line"
              placeholder="고객 특이사항, 선호 스타일 등"
              rows="3"
              auto-grow
            />
          </VCol>

          <!-- 읽기 전용 정보 (수정 모드일 때만) -->
          <template v-if="isEditMode">
            <VCol cols="12" class="mt-4">
              <VDivider />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                :model-value="customer?.visitCount || 0"
                label="방문 횟수"
                suffix="회"
                readonly
                disabled
              />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                :model-value="formatPrice(customer?.totalSpent || 0)"
                label="총 결제 금액"
                readonly
                disabled
              />
            </VCol>

            <VCol cols="12" md="4">
              <VTextField
                :model-value="formatDate(customer?.lastVisit)"
                label="최근 방문일"
                readonly
                disabled
              />
            </VCol>
          </template>
        </VRow>
      </VForm>
    </VCardText>

    <VDivider />

    <VCardActions>
      <VSpacer />
      
      <VBtn
        color="secondary"
        variant="outlined"
        @click="close"
      >
        취소
      </VBtn>

      <VBtn
        color="primary"
        :loading="loading"
        :disabled="!valid"
        @click="submit"
      >
        {{ isEditMode ? '수정' : '생성' }}
      </VBtn>
    </VCardActions>
  </VCard>
</VDialog>
```

### 5. 폼 검증 규칙
```javascript
const rules = {
  required: v => !!v || '필수 입력 항목입니다',
  
  phone: v => {
    if (!v) return true
    return /^010-\d{4}-\d{4}$/.test(v) || '010-1234-5678 형식으로 입력하세요'
  },
  
  email: v => {
    if (!v) return true
    return /.+@.+\..+/.test(v) || '유효한 이메일을 입력하세요'
  },
  
  maxTags: max => v => {
    if (!v || v.length <= max) return true
    return `태그는 최대 ${max}개까지 선택 가능합니다`
  },
}
```

### 6. 반응형 전략

#### 모바일 (cols="12")
```vue
<!-- 모바일: 모든 필드 전체 너비 -->
<VCol cols="12">
  <VTextField label="이름" />
</VCol>
```

#### 태블릿 이상 (md="6")
```vue
<!-- 태블릿/데스크탑: 2열 -->
<VCol cols="12" md="6">
  <VTextField label="이름" />
</VCol>
<VCol cols="12" md="6">
  <VTextField label="전화번호" />
</VCol>
```

#### 대형 화면 (lg="4")
```vue
<!-- 대형 화면: 3열 -->
<VCol cols="12" md="6" lg="4">
  <VTextField label="방문 횟수" />
</VCol>
```

### 7. Pinia Store 설계

```javascript
// stores/customer.js
export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    loading: false,
    selectedCustomer: null,
  }),

  getters: {
    // 고객 등급 계산
    getCustomerGrade: (state) => (visitCount) => {
      if (visitCount >= 10) return { text: 'VIP', color: 'error' }
      if (visitCount >= 5) return { text: '단골', color: 'warning' }
      return { text: '일반', color: 'default' }
    },

    // 태그별 고객 필터
    getCustomersByTag: (state) => (tag) => {
      return state.customers.filter(c => c.tags?.includes(tag))
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await axios.get('/businesses/1/customers')
        this.customers = data.data
      } catch (error) {
        useToast().error('고객 목록 조회에 실패했습니다')
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.loading = true
      try {
        const { data } = await axios.post('/businesses/1/customers', payload)
        this.customers.push(data.data)
        useToast().success('고객이 등록되었습니다')
        return data.data
      } catch (error) {
        const message = error.response?.data?.message || '고객 등록에 실패했습니다'
        useToast().error(message)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
```

### 8. 사용자 플로우

```
1. 고객 등록
   → VBtn "고객 추가" 클릭
   → CustomerEditDialog 열림
   → 필수 필드 입력 (이름, 전화번호)
   → 선택 필드 입력 (이메일, 생년월일, 태그)
   → "생성" 버튼 클릭
   → 성공 Toast 표시
   → Dialog 닫힘
   → 목록 자동 갱신

2. 고객 조회
   → VDataTable 행 클릭
   → CustomerDetailDialog 열림
   → 읽기 전용 정보 표시
   → "수정" 버튼 → EditDialog 전환

3. 고객 수정
   → DetailDialog에서 "수정" 클릭
   → CustomerEditDialog 열림 (데이터 pre-filled)
   → 필드 수정
   → "수정" 버튼 클릭
   → 성공 Toast 표시
   → Dialog 닫힘

4. 고객 검색
   → VTextField "검색" 입력
   → 실시간 필터링 (debounce 300ms)
   → 결과 테이블에 반영
```

## 🎯 설계 승인 및 다음 단계

### ✅ 설계 승인
위 명세대로 진행하시면 됩니다.

### 다음 단계
1. **@UI Designer 호출**
   - Materio 템플릿에서 컴포넌트 예제 코드 추출

2. **@Frontend Developer 호출**
   - 위 설계 기반으로 코드 생성

3. **@API Integrator 호출**
   - Backend API와 동기화 확인
```

---

## 🎭 Agent 3: UI Designer (★ 신규)

### Agent 정보
```yaml
Name: Materio Template Expert
Role: Materio 템플릿 활용 전문가
Trigger: "템플릿", "컴포넌트", "Materio", "예제"
```

### 역할
**Materio 템플릿의 컴포넌트를 최대한 활용**하여 빠르고 일관된 UI를 구축하는 전문가입니다.

### 주요 책임

#### 1. 템플릿 컴포넌트 추천
- 요구사항에 맞는 Materio 컴포넌트 선택
- 템플릿 예제 코드 제공
- 커스터마이징 방법 안내

#### 2. 디자인 시스템 일관성
- 색상 테마 활용
- 간격/크기 표준 (spacing, sizing)
- 아이콘 통일 (Remix Icon)

#### 3. 템플릿 활용 패턴
- VDataTable 고급 기능
- VDialog 베스트 프랙티스
- VForm 검증 패턴

#### 4. 반응형 레이아웃
- Grid 시스템 (VRow, VCol)
- Breakpoint 활용
- 모바일 최적화

### Materio 컴포넌트 카탈로그

#### 1. VDataTable (테이블)
```vue
<!-- 기본 사용 -->
<VDataTable
  :items="items"
  :headers="headers"
  :loading="loading"
  :items-per-page="20"
  item-value="id"
>
  <!-- 커스텀 셀: 상태 -->
  <template #item.status="{ item }">
    <VChip :color="getStatusColor(item.status)" size="small">
      {{ item.status }}
    </VChip>
  </template>

  <!-- 커스텀 셀: 액션 -->
  <template #item.actions="{ item }">
    <VBtn icon size="small" variant="text" @click="edit(item)">
      <VIcon>ri-edit-line</VIcon>
    </VBtn>
    <VBtn icon size="small" variant="text" @click="remove(item)">
      <VIcon>ri-delete-bin-line</VIcon>
    </VBtn>
  </template>
</VDataTable>
```

**주요 Props**:
- `items`: 데이터 배열
- `headers`: 컬럼 정의
- `loading`: 로딩 상태
- `items-per-page`: 페이지당 개수
- `sort-by`: 기본 정렬

#### 2. VDialog (모달)
```vue
<!-- 기본 Dialog -->
<VDialog v-model="dialog" max-width="800" persistent>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>제목</span>
      <VBtn icon size="small" variant="text" @click="close">
        <VIcon>ri-close-line</VIcon>
      </VBtn>
    </VCardTitle>

    <VDivider />

    <VCardText>
      <!-- 컨텐츠 -->
    </VCardText>

    <VDivider />

    <VCardActions>
      <VSpacer />
      <VBtn variant="outlined" @click="close">취소</VBtn>
      <VBtn color="primary" @click="submit">확인</VBtn>
    </VCardActions>
  </VCard>
</VDialog>
```

**주요 Props**:
- `v-model`: 열림/닫힘 상태
- `max-width`: 최대 너비
- `persistent`: 외부 클릭 시 닫기 방지
- `scrollable`: 스크롤 가능 (긴 컨텐츠)

#### 3. VAutocomplete (자동완성)
```vue
<!-- 검색 + 선택 -->
<VAutocomplete
  v-model="selected"
  :items="items"
  :loading="loading"
  item-title="name"
  item-value="id"
  label="검색"
  placeholder="입력하여 검색"
  clearable
  prepend-inner-icon="ri-search-line"
>
  <!-- 커스텀 아이템 -->
  <template #item="{ props, item }">
    <VListItem v-bind="props">
      <template #prepend>
        <VAvatar :color="item.raw.color">
          {{ item.raw.name[0] }}
        </VAvatar>
      </template>
      <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
      <VListItemSubtitle>{{ item.raw.description }}</VListItemSubtitle>
    </VListItem>
  </template>
</VAutocomplete>
```

#### 4. VDatePicker (날짜 선택)
```vue
<!-- 날짜 선택 -->
<VTextField
  v-model="date"
  type="date"
  label="날짜"
  prepend-inner-icon="ri-calendar-line"
/>

<!-- 또는 VDatePicker 컴포넌트 -->
<VMenu v-model="menu" :close-on-content-click="false">
  <template #activator="{ props }">
    <VTextField
      v-bind="props"
      :model-value="formattedDate"
      label="날짜 선택"
      prepend-inner-icon="ri-calendar-line"
      readonly
    />
  </template>
  
  <VDatePicker
    v-model="date"
    @update:model-value="menu = false"
  />
</VMenu>
```

#### 5. VChip (태그/뱃지)
```vue
<!-- 상태 표시 -->
<VChip :color="statusColor" size="small">
  {{ statusText }}
</VChip>

<!-- 태그 (삭제 가능) -->
<VChip
  v-for="tag in tags"
  :key="tag"
  closable
  @click:close="removeTag(tag)"
>
  {{ tag }}
</VChip>
```

#### 6. VTabs (탭)
```vue
<!-- 뷰 전환 -->
<VTabs v-model="activeTab" grow>
  <VTab value="list">
    <VIcon start>ri-list-check</VIcon>
    리스트
  </VTab>
  <VTab value="calendar">
    <VIcon start>ri-calendar-line</VIcon>
    캘린더
  </VTab>
</VTabs>

<VWindow v-model="activeTab">
  <VWindowItem value="list">
    <!-- 리스트 컨텐츠 -->
  </VWindowItem>
  
  <VWindowItem value="calendar">
    <!-- 캘린더 컨텐츠 -->
  </VWindowItem>
</VWindow>
```

### 호출 예시

```bash
# 컴포넌트 추천
@UI Designer
Customer 목록 화면을 만들어야 해.
- 검색 기능
- 태그 필터링
- 정렬
- 페이징

어떤 Materio 컴포넌트를 쓰면 좋을까?
예제 코드도 줘.

# 템플릿 예제 찾기
@UI Designer
Materio 템플릿에서 VDataTable의 고급 기능 예제를 찾아줘.
- 커스텀 셀
- 정렬
- 필터링
- 페이지네이션

# 디자인 시스템 확인
@UI Designer
Materio 템플릿의 색상 테마를 알려줘.
primary, secondary, success, error 등의 색상 코드.

# 반응형 패턴
@UI Designer
폼 필드를 반응형으로 배치하려고 해.
모바일에서는 1열, 태블릿에서는 2열, 데스크탑에서는 3열.
Materio Grid 시스템 예제 코드 줘.
```

### 출력 예시

```markdown
# Customer 목록 화면 Materio 컴포넌트 추천

## 추천 컴포넌트

### 1. VDataTable (목록 테이블)
**사용 이유**:
- 페이지네이션 자동
- 정렬 기능 내장
- 커스텀 셀 지원
- 로딩 상태 관리

**예제 코드**:
```vue
<VDataTable
  :items="customers"
  :headers="[
    { title: '이름', key: 'name', sortable: true },
    { title: '전화번호', key: 'phone' },
    { title: '태그', key: 'tags' },
    { title: '방문', key: 'visitCount', sortable: true },
    { title: '등급', key: 'grade' },
    { title: '액션', key: 'actions', sortable: false },
  ]"
  :loading="loading"
  :items-per-page="20"
  @click:row="handleRowClick"
>
  <!-- 태그 셀 -->
  <template #item.tags="{ item }">
    <VChip
      v-for="tag in item.tags"
      :key="tag"
      size="small"
      class="mr-1"
    >
      {{ tag }}
    </VChip>
  </template>

  <!-- 등급 셀 -->
  <template #item.grade="{ item }">
    <VChip
      :color="getGradeColor(item.visitCount)"
      size="small"
    >
      {{ getGrade(item.visitCount) }}
    </VChip>
  </template>

  <!-- 액션 셀 -->
  <template #item.actions="{ item }">
    <VBtn
      icon
      size="small"
      variant="text"
      @click.stop="editCustomer(item)"
    >
      <VIcon>ri-edit-line</VIcon>
    </VBtn>
  </template>
</VDataTable>
```

### 2. VAutocomplete (태그 필터)
**사용 이유**:
- 다중 선택 지원
- Chip 자동 생성
- 검색 기능 내장

**예제 코드**:
```vue
<VAutocomplete
  v-model="selectedTags"
  :items="availableTags"
  label="태그 필터"
  placeholder="태그 선택"
  prepend-inner-icon="ri-price-tag-3-line"
  multiple
  chips
  closable-chips
  clearable
>
  <template #chip="{ props, item }">
    <VChip
      v-bind="props"
      :color="item.raw.color"
      closable
    >
      {{ item.title }}
    </VChip>
  </template>
</VAutocomplete>
```

### 3. VTextField (검색)
**사용 이유**:
- 간단한 텍스트 검색
- prepend-icon으로 검색 아이콘
- debounce로 성능 최적화

**예제 코드**:
```vue
<VTextField
  v-model="searchQuery"
  label="검색"
  placeholder="이름, 전화번호 검색"
  prepend-inner-icon="ri-search-line"
  clearable
  @update:model-value="debounceSearch"
/>

<script setup>
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')
const filteredCustomers = ref([])

const debounceSearch = useDebounceFn(() => {
  // 검색 로직
  filteredCustomers.value = customers.value.filter(c =>
    c.name.includes(searchQuery.value) ||
    c.phone.includes(searchQuery.value)
  )
}, 300)
</script>
```

### 4. VSelect (정렬 옵션)
**사용 이유**:
- 간단한 선택
- 정렬 방식 전환

**예제 코드**:
```vue
<VSelect
  v-model="sortBy"
  :items="[
    { title: '이름순', value: 'name' },
    { title: '최근 방문순', value: 'lastVisit' },
    { title: '방문 횟수순', value: 'visitCount' },
    { title: '등록일순', value: 'createdAt' },
  ]"
  label="정렬"
  prepend-inner-icon="ri-sort-desc"
/>
```

## 전체 화면 구성

```vue
<template>
  <VCard>
    <!-- 헤더 -->
    <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-4">
      <h2 class="text-h5">고객 관리</h2>
      
      <VBtn
        color="primary"
        prepend-icon="ri-add-line"
        @click="openCreateDialog"
      >
        고객 추가
      </VBtn>
    </VCardTitle>

    <VDivider />

    <!-- 필터 영역 -->
    <VCardText>
      <VRow>
        <!-- 검색 -->
        <VCol cols="12" md="4">
          <VTextField
            v-model="searchQuery"
            label="검색"
            placeholder="이름, 전화번호"
            prepend-inner-icon="ri-search-line"
            clearable
          />
        </VCol>

        <!-- 태그 필터 -->
        <VCol cols="12" md="4">
          <VAutocomplete
            v-model="selectedTags"
            :items="tags"
            label="태그 필터"
            prepend-inner-icon="ri-price-tag-3-line"
            multiple
            chips
            clearable
          />
        </VCol>

        <!-- 정렬 -->
        <VCol cols="12" md="4">
          <VSelect
            v-model="sortBy"
            :items="sortOptions"
            label="정렬"
            prepend-inner-icon="ri-sort-desc"
          />
        </VCol>
      </VRow>
    </VCardText>

    <!-- 테이블 -->
    <VDataTable
      :items="filteredCustomers"
      :headers="headers"
      :loading="loading"
      @click:row="openDetailDialog"
    >
      <!-- 커스텀 셀들... -->
    </VDataTable>
  </VCard>
</template>
```

## Materio 색상 테마

```javascript
// 기본 색상 (Materio 템플릿)
const colors = {
  primary: '#6366F1',    // 인디고
  secondary: '#64748B',  // 슬레이트
  success: '#10B981',    // 에메랄드
  warning: '#F59E0B',    // 앰버
  error: '#EF4444',      // 레드
  info: '#3B82F6',       // 블루
}

// 사용 예시
<VChip color="success">활성</VChip>
<VChip color="error">취소</VChip>
<VChip color="warning">대기</VChip>
```

## 반응형 Grid 패턴

```vue
<!-- 모바일: 1열 -->
<VRow>
  <VCol cols="12">
    <VTextField label="전체 너비" />
  </VCol>
</VRow>

<!-- 태블릿: 2열, 데스크탑: 3열 -->
<VRow>
  <VCol cols="12" md="6" lg="4">
    <VTextField label="필드 1" />
  </VCol>
  <VCol cols="12" md="6" lg="4">
    <VTextField label="필드 2" />
  </VCol>
  <VCol cols="12" md="6" lg="4">
    <VTextField label="필드 3" />
  </VCol>
</VRow>

<!-- 불균등 배치 -->
<VRow>
  <VCol cols="12" md="8">
    <VTextField label="넓은 필드" />
  </VCol>
  <VCol cols="12" md="4">
    <VTextField label="좁은 필드" />
  </VCol>
</VRow>
```

## Breakpoints

```javascript
// Vuetify Breakpoints
xs: < 600px   // 모바일
sm: 600-960px // 태블릿 세로
md: 960-1280px // 태블릿 가로
lg: 1280-1920px // 데스크탑
xl: > 1920px  // 대형 데스크탑

// 사용 예시
<VBtn
  block // 모바일에서 전체 너비
  :class="{ 'w-auto': $vuetify.display.mdAndUp }" // 태블릿 이상에서 자동 너비
>
```
```

---

## 💻 Agent 4: Frontend Developer

### Agent 정보
```yaml
Name: Frontend Code Generator
Role: Vue 3 + Vuetify 컴포넌트 자동 생성 전문가
Trigger: "코드 생성", "만들어줘", "구현", "개발"
```

### 역할
**Vue 3 + Vuetify 코드를 자동 생성**하는 프론트엔드 개발자입니다.

### 코드 생성 패턴

#### 1. Pages (index.vue)
```vue
<template>
  <VCard>
    <!-- 헤더 -->
    <VCardTitle class="d-flex align-center justify-space-between">
      <h2>{{ title }}</h2>
      <VBtn @click="openCreate">
        <VIcon start>ri-add-line</VIcon>
        추가
      </VBtn>
    </VCardTitle>

    <!-- 필터 -->
    <VCardText>
      <VRow>
        <VCol cols="12" md="4">
          <VTextField v-model="search" label="검색" />
        </VCol>
      </VRow>
    </VCardText>

    <!-- 테이블 -->
    <VDataTable
      :items="items"
      :headers="headers"
      :loading="loading"
      @click:row="openDetail"
    />

    <!-- Dialogs -->
    <DetailDialog v-model="detailDialog" :item="selectedItem" />
    <EditDialog v-model="editDialog" :item="selectedItem" @submit="handleSubmit" />
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use{Domain}Store } from '@/stores/{domain}'

const {domain}Store = use{Domain}Store()
const loading = computed(() => {domain}Store.loading)
const items = computed(() => {domain}Store.{domains})

onMounted(() => {
  {domain}Store.fetchAll()
})
</script>
```

#### 2. Components (DetailDialog)
```vue
<template>
  <VDialog v-model="isOpen" max-width="800">
    <VCard>
      <VCardTitle>
        {{ item?.name }}
        <VBtn icon @click="close">
          <VIcon>ri-close-line</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField :model-value="item?.name" label="이름" readonly />
          </VCol>
          <!-- 필드들 -->
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn @click="$emit('edit', item)">수정</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  item: Object,
})

const emit = defineEmits(['update:modelValue', 'edit'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>
```

#### 3. Pinia Store
```javascript
export const use{Domain}Store = defineStore('{domain}', {
  state: () => ({
    {domains}: [],
    loading: false,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await axios.get('/businesses/1/{domains}')
        this.{domains} = data.data
      } catch (error) {
        useToast().error('조회 실패')
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.loading = true
      try {
        const { data } = await axios.post('/businesses/1/{domains}', payload)
        this.{domains}.push(data.data)
        useToast().success('생성 완료')
        return data.data
      } catch (error) {
        useToast().error(error.response?.data?.message || '생성 실패')
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
```

### 호출 예시

```bash
# 전체 화면 생성
@Frontend Developer
Customer 화면을 만들어줘.

기능:
- List (VDataTable)
- Detail Dialog
- Edit Dialog (생성/수정)
- Store (CRUD)
- API 연동

전체 레이어 생성해줘.

# 특정 컴포넌트만 생성
@Frontend Developer
ReservationFormDialog를 만들어줘.

필드:
- 고객 선택 (VAutocomplete)
- 직원 선택 (VSelect)
- 서비스 다중 선택 (VAutocomplete multiple)
- 날짜 선택 (VDatePicker)
- 시간 선택 (VTextField type="time")

# Store 액션 추가
@Frontend Developer
Customer Store에 검색 기능 추가해줘.

메서드:
- searchByKeyword(keyword) - 이름/전화번호 검색
- filterByTags(tags) - 태그 필터링
- sortBy(field, order) - 정렬
```

### 작업 순서

```
1. @Project Analyzer 호출 (현재 상태)
   ↓
2. @Senior Planner 호출 (UI/UX 설계)
   ↓
3. @UI Designer 호출 (템플릿 컴포넌트)
   ↓
4. Pages 생성 (index.vue)
   ↓
5. Components 생성 (Dialogs)
   ↓
6. Store 생성 (CRUD)
   ↓
7. Router 등록
   ↓
8. @API Integrator 호출 (동기화)
```

---

## 🔗 Agent 5: API Integrator (★ 강화)

### Agent 정보
```yaml
Name: Backend API Synchronizer
Role: Backend API와 Frontend 동기화 전문가
Trigger: "API", "동기화", "연동", "엔드포인트"
```

### 역할
**Backend API와 Frontend를 완벽히 동기화**하는 통합 전문가입니다.

### 주요 책임

#### 1. API 엔드포인트 매핑 검증
- Backend Controller vs Frontend Store
- 경로 일치 확인 (`/api/businesses/{businessId}`)
- HTTP 메서드 일치 확인

#### 2. DTO 구조 검증
- Request DTO 일치 (Frontend → Backend)
- Response DTO 일치 (Backend → Frontend)
- 필드명/타입 일치 확인

#### 3. 누락 기능 탐지
- Backend에만 있는 API
- Frontend에만 있는 Store action
- 불일치 목록 생성

#### 4. 에러 응답 처리
- ErrorCode 매핑
- Toast 메시지 일관성
- 에러 시나리오 테스트

### 검증 체크리스트

```markdown
**API 엔드포인트**
- [ ] 경로가 일치하는가? (/api/businesses/1/{domains})
- [ ] HTTP 메서드가 일치하는가? (GET, POST, PUT, DELETE)
- [ ] businessId가 동적으로 설정되는가?

**DTO 구조**
- [ ] Request 필드명이 일치하는가?
- [ ] Response 필드명이 일치하는가?
- [ ] JSONB 필드 처리가 동일한가?
- [ ] Enum 값이 일치하는가?

**에러 처리**
- [ ] ErrorCode가 매핑되는가?
- [ ] Toast 메시지가 사용자 친화적인가?
- [ ] 401 에러 시 로그인 페이지로 이동하는가?

**누락 기능**
- [ ] Backend API가 전부 Store에 구현되었는가?
- [ ] Frontend 화면에서 호출하지 않는 API는 없는가?
```

### 호출 예시

```bash
# 전체 동기화 검증
@API Integrator
Customer 도메인의 Backend API와 Frontend Store가
동기화되어 있는지 확인해줘.

Backend Controller:
- POST, GET(목록), GET(상세), PUT, DELETE

Frontend Store:
- fetchAll(), fetchById(), create(), update(), delete()

누락된 것 있으면 알려줘.

# 특정 API 검증
@API Integrator
Reservation 생성 API가 제대로 연동되는지 확인해줘.

Backend:
- POST /api/businesses/{businessId}/reservations
- Request: customerId, staffId, reservationDate, startTime, serviceIds

Frontend:
- stores/reservation.js create()

DTO 구조가 일치하는지 확인해줘.

# 누락 API 탐지
@API Integrator
Backend에는 있는데 Frontend에 없는 API를 찾아줘.

또는 Frontend에서 호출하는데 Backend에 없는 API도 찾아줘.
```

### 출력 예시

```markdown
# Customer 도메인 API 동기화 검증 리포트

## 📊 전체 현황
- Backend API: 5개
- Frontend Store Actions: 5개
- 동기화율: 100% ✅

## ✅ 동기화 완료

### 1. GET /api/businesses/{businessId}/customers (목록)
**Backend**:
```java
@GetMapping
public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getCustomers(
    @PathVariable Long businessId,
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "20") int size
)
```

**Frontend**:
```javascript
async fetchAll(page = 1, size = 20) {
  const { data } = await axios.get('/businesses/1/customers', {
    params: { page, size }
  })
  this.customers = data.data.content
}
```

**상태**: ✅ 동기화됨
- 경로 일치
- 파라미터 일치 (page, size)
- 응답 구조 일치 (PageResponse)

---

### 2. POST /api/businesses/{businessId}/customers (생성)
**Backend**:
```java
@PostMapping
public ResponseEntity<ApiResponse<CustomerResponse>> create(
    @PathVariable Long businessId,
    @Valid @RequestBody CustomerCreateRequest request
)
```

**Backend Request DTO**:
```java
public class CustomerCreateRequest {
    private String name;       // 필수
    private String phone;      // 필수
    private String email;      // 선택
    private LocalDate birthDate; // 선택
    private String gender;     // 선택
    private List<String> tags; // 선택
    private String memo;       // 선택
}
```

**Frontend**:
```javascript
async create(payload) {
  const { data } = await axios.post('/businesses/1/customers', payload)
  this.customers.push(data.data)
}
```

**Frontend Payload 예시**:
```javascript
{
  name: "홍길동",
  phone: "010-1234-5678",
  email: "hong@example.com",
  birthDate: "1990-01-01",
  gender: "MALE",
  tags: ["VIP", "단골"],
  memo: "주의사항"
}
```

**상태**: ✅ 동기화됨
- 필드명 완전 일치
- 타입 일치
- 필수/선택 일치

---

### 3. GET /api/businesses/{businessId}/customers/{id} (상세)
**상태**: ✅ 동기화됨

### 4. PUT /api/businesses/{businessId}/customers/{id} (수정)
**상태**: ✅ 동기화됨

### 5. DELETE /api/businesses/{businessId}/customers/{id} (삭제)
**상태**: ✅ 동기화됨

---

## ⚠️ 발견된 이슈

### 1. businessId 하드코딩
**위치**: 모든 Store actions
**문제**:
```javascript
// 현재
await axios.get('/businesses/1/customers')  // ❌ 1이 하드코딩

// 수정 필요
await axios.get(`/businesses/${businessId}/customers`)  // ✅
```

**해결 방안**:
```javascript
// stores/auth.js에서 businessId 관리
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    businessId: null,  // 로그인 시 저장
  }),
})

// stores/customer.js에서 사용
import { useAuthStore } from './auth'

export const useCustomerStore = defineStore('customer', {
  actions: {
    async fetchAll() {
      const authStore = useAuthStore()
      const { data } = await axios.get(`/businesses/${authStore.businessId}/customers`)
      this.customers = data.data
    },
  },
})
```

### 2. Response 구조 언래핑 불일치
**위치**: stores/customer.js
**문제**:
```javascript
// Backend 응답
{
  success: true,
  data: {
    content: [...],  // 목록
    pageInfo: {...}
  }
}

// Frontend (현재)
this.customers = data.data  // ❌ PageResponse 전체를 저장

// Frontend (수정 필요)
this.customers = data.data.content  // ✅ 목록만 저장
this.pageInfo = data.data.pageInfo  // ✅ 페이징 정보 별도 저장
```

### 3. 에러 메시지 추출 불일치
**위치**: 모든 Store catch 블록
**문제**:
```javascript
// Backend 에러 응답
{
  success: false,
  error: {
    code: "C002",
    message: "이미 등록된 전화번호입니다"
  }
}

// Frontend (현재)
catch (error) {
  useToast().error(error.response?.data?.message || '실패')  // ❌ message 없음
}

// Frontend (수정 필요)
catch (error) {
  const message = error.response?.data?.error?.message || '실패'  // ✅
  useToast().error(message)
}
```

---

## 🚨 누락된 API

### Backend에만 있는 API
```
PATCH /api/businesses/{businessId}/customers/{id}/status
→ Frontend Store에 updateStatus() 메서드 없음
→ 추가 필요
```

### Frontend에만 있는 Action
```
없음 ✅
```

---

## 📋 동기화 개선 액션 아이템

### 🔥 긴급 (1시간)
1. **businessId 동적 설정** (모든 Store)
   - authStore에서 businessId 관리
   - 모든 API 호출에 적용

2. **에러 메시지 추출 수정** (모든 Store)
   - error.response.data.error.message 경로 수정

### ⚠️ 중요 (2시간)
3. **PageResponse 구조 수정** (목록 API)
   - content와 pageInfo 분리 저장

4. **누락 API 구현**
   - Customer updateStatus() 추가

### ✅ 개선 (선택)
5. **TypeScript 도입 검토**
   - DTO 타입 안전성 확보

6. **Axios Interceptor 개선**
   - 응답 구조 자동 언래핑

---

## 🎯 최종 권장사항

1. **Axios Plugin 개선**
```javascript
// plugins/axios.js
axiosInstance.interceptors.response.use(
  response => {
    // ApiResponse 자동 언래핑
    if (response.data.success) {
      return { data: response.data.data }  // data.data.data → data.data
    }
    return response
  },
  error => {
    // 에러 메시지 자동 추출
    const message = error.response?.data?.error?.message
    if (message) {
      error.message = message
    }
    return Promise.reject(error)
  }
)
```

2. **Business ID Composable**
```javascript
// composables/useBusinessId.js
export const useBusinessId = () => {
  const authStore = useAuthStore()
  
  const businessId = computed(() => authStore.businessId || 1)  // fallback
  
  const getApiPath = (path) => {
    return `/businesses/${businessId.value}${path}`
  }
  
  return { businessId, getApiPath }
}

// 사용
import { useBusinessId } from '@/composables/useBusinessId'

const { getApiPath } = useBusinessId()
await axios.get(getApiPath('/customers'))  // /businesses/1/customers
```
```

---

## 🔄 Agent 협업 시나리오

### 시나리오 1: 새 화면 전체 생성

```bash
사용자: "Customer 화면 만들어줘"

@Frontend Developer 시작
  ↓
[Step 1] @Project Analyzer 호출
  → 현재 4개 화면 완료, Customer 미착수 확인
  ↓
[Step 2] @Senior Planner 호출
  → UI/UX 설계: List + Detail + Edit
  → 반응형 레이아웃, 폼 검증 규칙
  ↓
[Step 3] @UI Designer 호출
  → VDataTable, VAutocomplete, VDatePicker 추천
  → 템플릿 예제 코드 제공
  ↓
[Step 4] 코드 생성
  → pages/customers/index.vue
  → components/CustomerDetailDialog.vue
  → components/CustomerEditDialog.vue
  → stores/customer.js
  → router 등록
  ↓
[Step 5] @API Integrator 호출
  → Backend API와 동기화 확인
  → businessId 하드코딩 발견 → 수정
  → DTO 구조 일치 확인
  ↓
완료 보고: "Customer 화면 100% 완성! API 동기화 100%"
```

---

## 📚 참고 자료

### 프로젝트 문서
- `/mnt/project/08_템플릿_가이드.md` - Materio 활용법
- `/mnt/project/01_기술_스택.md` - Frontend 스택
- `/mnt/project/__moer_예약_시스템_API_엔드포인트_목록.md` - Backend API

### Materio 템플릿
- `src/@core/components/` - 재사용 컴포넌트
- `src/pages/` - 페이지 예제
- `src/components/` - 커스텀 컴포넌트

---

## 🎯 핵심 원칙

### 1. Materio 우선
- 템플릿 컴포넌트 최대한 활용
- 커스텀 컴포넌트는 최소화
- 디자인 시스템 일관성 유지

### 2. Backend API 동기화
- 엔드포인트 경로 일치
- DTO 구조 일치
- 에러 처리 일치

### 3. 사용자 경험
- Loading 상태 명확히
- 에러 메시지 친화적으로
- 반응형 레이아웃 필수

### 4. 코드 일관성
- Composition API 사용
- Pinia for 상태 관리
- Axios for API 호출

---

## ✅ 체크리스트

### 새 화면 생성 시
- [ ] @Senior Planner로 UI/UX 설계
- [ ] @UI Designer로 템플릿 컴포넌트 선택
- [ ] Pages 생성 (index.vue)
- [ ] Components 생성 (Dialogs)
- [ ] Store 생성 (CRUD actions)
- [ ] Router 등록
- [ ] @API Integrator로 동기화 확인
- [ ] 반응형 테스트 (모바일, 태블릿, 데스크탑)
- [ ] Git 커밋

---

**이 SKILL을 사용하면 프론트엔드 개발이 자동화됩니다!**
- Project Analyzer: 진행 상황 파악
- Senior Planner: UI/UX 설계
- UI Designer: Materio 템플릿 활용 (★)
- Frontend Developer: 코드 자동 생성
- API Integrator: Backend 동기화 (★)

각 Agent를 독립적으로 호출하거나,
Frontend Developer가 자동으로 다른 Agent를 호출하여 협업합니다.
