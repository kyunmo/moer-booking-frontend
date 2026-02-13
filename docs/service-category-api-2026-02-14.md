# 서비스 카테고리 기능 개선 - 프론트엔드 API 가이드

> **작업일**: 2026-02-14
> **상태**: ✅ 백엔드 완료 (빌드 검증 통과)
> **영향 범위**: 서비스 관리 화면 전체

---

## 1. 변경 요약

기존에 서비스의 카테고리가 **자유 텍스트(`category: "컷"`)** 로 관리되던 것을,
**별도 카테고리 테이블로 분리**하여 CRUD + 정렬 기능을 추가했습니다.

### 핵심 변경점

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 카테고리 지정 | `category: "컷"` (자유 텍스트) | `categoryId: 1` (카테고리 ID 참조) |
| 카테고리 관리 | 불가 | CRUD + 정렬 순서 관리 |
| 서비스 정렬 | category명 → name순 | 카테고리 sortOrder → 서비스 sortOrder → name순 |
| 미분류 서비스 | - | `categoryId: null` 허용 |

---

## 2. 신규 API - 서비스 카테고리

**Base URL**: `/api/businesses/{businessId}/service-categories`

### 2.1 카테고리 생성

```
POST /api/businesses/{businessId}/service-categories
```

**Request Body**:
```json
{
  "name": "컷",
  "description": "커트 관련 서비스"
}
```

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|----------|
| `name` | String | O | 최대 50자, 매장 내 중복 불가 |
| `description` | String | X | 최대 200자 |

**Response** (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "businessId": 10,
    "name": "컷",
    "description": "커트 관련 서비스",
    "sortOrder": 1,
    "serviceCount": null,
    "createdAt": "2026-02-14 10:00:00",
    "updatedAt": "2026-02-14 10:00:00"
  }
}
```

> `sortOrder`는 생성 시 자동으로 (기존 최대값 + 1)로 설정됩니다.

---

### 2.2 카테고리 목록 조회

```
GET /api/businesses/{businessId}/service-categories
```

**파라미터**: 없음

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "businessId": 10,
      "name": "컷",
      "description": "커트 관련 서비스",
      "sortOrder": 1,
      "serviceCount": 3,
      "createdAt": "2026-02-14 10:00:00",
      "updatedAt": "2026-02-14 10:00:00"
    },
    {
      "id": 2,
      "businessId": 10,
      "name": "펌",
      "description": null,
      "sortOrder": 2,
      "serviceCount": 5,
      "createdAt": "2026-02-14 10:05:00",
      "updatedAt": "2026-02-14 10:05:00"
    }
  ]
}
```

> `serviceCount`: 해당 카테고리에 속한 서비스 수. 목록 조회 시 항상 포함됩니다.
> 정렬: `sortOrder ASC` → `name ASC`

---

### 2.3 카테고리 단건 조회

```
GET /api/businesses/{businessId}/service-categories/{categoryId}
```

**Response**: 2.2의 단일 항목과 동일 (`serviceCount` 포함)

---

### 2.4 카테고리 수정

```
PATCH /api/businesses/{businessId}/service-categories/{categoryId}
```

**Request Body** (부분 수정 지원):
```json
{
  "name": "커트",
  "description": "헤어 커트 관련"
}
```

| 필드 | 타입 | 필수 | 비고 |
|------|------|------|------|
| `name` | String | X | 변경 시 매장 내 중복 체크 |
| `description` | String | X | |

**Response** (`200 OK`): 수정된 카테고리 정보

---

### 2.5 카테고리 삭제

```
DELETE /api/businesses/{businessId}/service-categories/{categoryId}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": null
}
```

> **주의**: 해당 카테고리에 서비스가 1개라도 존재하면 삭제가 거부됩니다.

**에러 응답 (서비스 존재 시)**:
```json
{
  "success": false,
  "error": {
    "code": "SV005",
    "message": "해당 카테고리에 서비스가 존재하여 삭제할 수 없습니다"
  }
}
```

---

### 2.6 카테고리 정렬 순서 변경

```
PATCH /api/businesses/{businessId}/service-categories/sort-order
```

**Request Body**:
```json
{
  "items": [
    { "id": 2, "sortOrder": 1 },
    { "id": 1, "sortOrder": 2 },
    { "id": 3, "sortOrder": 3 }
  ]
}
```

| 필드 | 타입 | 필수 | 비고 |
|------|------|------|------|
| `items` | Array | O | 최소 1개 |
| `items[].id` | Long | O | 카테고리 ID |
| `items[].sortOrder` | Integer | O | 새 정렬 순서 |

**Response** (`200 OK`): 변경 후 전체 카테고리 목록 반환 (2.2와 동일 형태)

> 드래그 앤 드롭 UI에서 순서 변경 후, 변경된 항목들의 id와 새 sortOrder를 전송하면 됩니다.

---

## 3. 변경된 API - 서비스 (기존 API 수정)

**Base URL**: `/api/businesses/{businessId}/services`

### 3.1 서비스 응답 필드 변경

**변경 전**:
```json
{
  "id": 1,
  "businessId": 10,
  "category": "컷",
  "name": "남성 커트",
  ...
}
```

**변경 후**:
```json
{
  "id": 1,
  "businessId": 10,
  "categoryId": 1,
  "categoryName": "컷",
  "name": "남성 커트",
  "sortOrder": 0,
  ...
}
```

| 삭제된 필드 | 추가된 필드 | 타입 | 설명 |
|-------------|-------------|------|------|
| `category` | - | - | 삭제됨 |
| - | `categoryId` | Long (nullable) | 카테고리 ID |
| - | `categoryName` | String (nullable) | 카테고리명 (서버에서 JOIN) |
| - | `sortOrder` | Integer | 서비스 정렬 순서 |

> `categoryId`가 `null`이면 미분류 서비스입니다. 이 경우 `categoryName`도 `null`입니다.

---

### 3.2 서비스 생성 - 요청 변경

```
POST /api/businesses/{businessId}/services
```

**변경 전**:
```json
{
  "category": "컷",
  "name": "남성 커트",
  "price": 15000,
  "duration": 30,
  "staffIds": [1, 2]
}
```

**변경 후**:
```json
{
  "categoryId": 1,
  "name": "남성 커트",
  "price": 15000,
  "duration": 30,
  "staffIds": [1, 2]
}
```

| 삭제된 필드 | 추가된 필드 | 타입 | 필수 | 비고 |
|-------------|-------------|------|------|------|
| `category` (String, 필수) | - | - | - | 삭제 |
| - | `categoryId` (Long) | Long | X | null이면 미분류 |

> `category` (문자열) 대신 `categoryId` (숫자)를 사용합니다. **선택 사항**이므로 보내지 않으면 미분류가 됩니다.

---

### 3.3 서비스 수정 - 요청 변경

```
PATCH /api/businesses/{businessId}/services/{serviceId}
```

**변경 후**:
```json
{
  "categoryId": 2,
  "name": "여성 커트"
}
```

> `category` (String) 대신 `categoryId` (Long)를 사용합니다.

---

### 3.4 서비스 목록 조회 - 파라미터 변경

```
GET /api/businesses/{businessId}/services
```

| 파라미터 | 변경 전 | 변경 후 |
|----------|---------|---------|
| 카테고리 필터 | `?category=컷` | `?categoryId=1` |
| 활성 필터 | `?activeOnly=true` | `?activeOnly=true` (변경 없음) |

---

### 3.5 서비스 검색 - 파라미터 변경

```
GET /api/businesses/{businessId}/services/search
```

| 파라미터 | 변경 전 | 변경 후 |
|----------|---------|---------|
| 카테고리 필터 | `?category=컷` | `?categoryId=1` |
| 활성 필터 | `?isActive=true` | `?isActive=true` (변경 없음) |
| 직원 필터 | `?staffId=1` | `?staffId=1` (변경 없음) |

---

### 3.6 서비스 정렬 순서 변경 (신규)

```
PATCH /api/businesses/{businessId}/services/sort-order
```

**Request Body**:
```json
{
  "items": [
    { "id": 5, "sortOrder": 1 },
    { "id": 3, "sortOrder": 2 },
    { "id": 7, "sortOrder": 3 }
  ]
}
```

**Response** (`200 OK`): 변경 후 전체 서비스 목록 반환

> 카테고리 내에서 서비스 순서를 드래그 앤 드롭으로 변경할 때 사용합니다.

---

## 4. 에러 코드

| 코드 | HTTP Status | 메시지 | 발생 조건 |
|------|-------------|--------|-----------|
| `SV003` | 404 | 서비스 카테고리를 찾을 수 없습니다 | 존재하지 않는 categoryId 사용 |
| `SV004` | 409 | 이미 존재하는 카테고리명입니다 | 동일 매장 내 카테고리명 중복 |
| `SV005` | 400 | 해당 카테고리에 서비스가 존재하여 삭제할 수 없습니다 | 서비스가 있는 카테고리 삭제 시도 |
| `SV006` | 400 | 정렬 순서가 올바르지 않습니다 | 존재하지 않는 ID로 정렬 변경 시도 |

---

## 5. 정렬 규칙

서비스 목록은 다음 순서로 정렬됩니다:

```
1. 카테고리 sortOrder ASC (미분류는 맨 뒤)
2. 서비스 sortOrder ASC
3. 서비스 name ASC
```

---

## 6. 프론트엔드 마이그레이션 체크리스트

### 필수 변경
- [ ] 서비스 생성/수정 폼에서 `category` (텍스트 입력) → `categoryId` (카테고리 선택 드롭다운) 변경
- [ ] 서비스 목록 응답에서 `category` → `categoryId` + `categoryName` 사용
- [ ] 서비스 목록 필터 파라미터 `?category=` → `?categoryId=` 변경
- [ ] 서비스 검색 파라미터 `?category=` → `?categoryId=` 변경

### 신규 화면/기능
- [ ] 카테고리 관리 화면 (CRUD)
- [ ] 카테고리 드래그 앤 드롭 정렬
- [ ] 서비스 드래그 앤 드롭 정렬 (카테고리 내)
- [ ] 서비스 생성/수정 시 카테고리 선택 UI (드롭다운 또는 선택 컴포넌트)

### 권장 UX
- 카테고리가 0개인 경우 "카테고리를 먼저 추가하세요" 안내 표시 (또는 미분류로 바로 생성 허용)
- 카테고리 삭제 시 "서비스가 존재하면 삭제할 수 없습니다" 사전 안내
- 서비스 목록을 카테고리별로 그룹핑하여 표시 (아코디언 또는 탭)

---

## 7. API 호출 순서 예시

### 시나리오: 서비스 관리 화면 초기 로드

```
1. GET /api/businesses/{id}/service-categories    → 카테고리 목록 (탭/필터용)
2. GET /api/businesses/{id}/services              → 전체 서비스 목록
```

### 시나리오: 새 서비스 생성

```
1. GET /api/businesses/{id}/service-categories    → 카테고리 목록 (드롭다운용)
2. POST /api/businesses/{id}/services             → { categoryId: 1, name: "...", ... }
```

### 시나리오: 카테고리 순서 변경

```
1. PATCH /api/businesses/{id}/service-categories/sort-order
   → { items: [{ id: 2, sortOrder: 1 }, { id: 1, sortOrder: 2 }] }
   → 응답: 변경된 전체 카테고리 목록
```
