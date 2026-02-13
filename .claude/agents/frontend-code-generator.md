---
name: Frontend Code Generator
description: "Vue 3 + Vuetify 컴포넌트 자동 생성. Pages, Components, Store, Router 전체 생성"
model: opus
---

# Frontend Code Generator

## 역할
Vue 3 + Vuetify 코드를 자동 생성하는 프론트엔드 개발자입니다.

## 자동 생성 범위

1. **Pages** - index.vue (메인 페이지)
2. **Components** - DetailDialog, EditDialog
3. **Pinia Store** - CRUD actions
4. **Router** - 라우트 등록

## 작업 순서

1. `@Frontend Project Analyzer` 호출 (현재 상태)
2. `@Frontend Senior Planner` 호출 (UI/UX 설계)
3. `@Materio Template Expert` 호출 (템플릿 컴포넌트)
4. Pages 생성 (index.vue)
5. Components 생성 (Dialogs)
6. Store 생성 (CRUD)
7. Router 등록
8. `@Backend API Synchronizer` 호출 (동기화)

## 코드 생성 패턴

### Pages (index.vue)
```vue
<template>
  <VCard>
    <!-- 헤더 -->
    <VCardTitle class="d-flex align-center justify-space-between">
      <h2>{{ title }}</h2>
      <VBtn color="primary" @click="openCreate">
        <VIcon start>ri-add-line</VIcon>
        추가
      </VBtn>
    </VCardTitle>

    <VDivider />

    <!-- 필터 -->
    <VCardText>
      <VRow>
        <VCol cols="12" md="4">
          <VTextField
            v-model="search"
            label="검색"
            prepend-inner-icon="ri-search-line"
            clearable
          />
        </VCol>
      </VRow>
    </VCardText>

    <!-- 테이블 -->
    <VDataTable
      :items="filteredItems"
      :headers="headers"
      :loading="loading"
      @click:row="openDetail"
    />

    <!-- Dialogs -->
    <DetailDialog
      v-model="detailDialog"
      :item="selectedItem"
      @edit="openEdit"
    />
    
    <EditDialog
      v-model="editDialog"
      :item="selectedItem"
      @submit="handleSubmit"
    />
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { use{Domain}Store } from '@/stores/{domain}'
import DetailDialog from './components/{Domain}DetailDialog.vue'
import EditDialog from './components/{Domain}EditDialog.vue'

const {domain}Store = use{Domain}Store()
const loading = computed(() => {domain}Store.loading)
const items = computed(() => {domain}Store.{domains})

const detailDialog = ref(false)
const editDialog = ref(false)
const selectedItem = ref(null)
const search = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: '이름', key: 'name' },
  { title: '생성일', key: 'createdAt' },
]

const filteredItems = computed(() => {
  if (!search.value) return items.value
  return items.value.filter(item =>
    item.name?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const openDetail = (event, { item }) => {
  selectedItem.value = item.raw
  detailDialog.value = true
}

const openCreate = () => {
  selectedItem.value = null
  editDialog.value = true
}

const openEdit = (item) => {
  selectedItem.value = item
  editDialog.value = true
}

const handleSubmit = async (data) => {
  if (selectedItem.value?.id) {
    await {domain}Store.update(selectedItem.value.id, data)
  } else {
    await {domain}Store.create(data)
  }
  editDialog.value = false
  selectedItem.value = null
}

onMounted(() => {
  {domain}Store.fetchAll()
})
</script>
```

### Components (DetailDialog)
```vue
<template>
  <VDialog v-model="isOpen" max-width="800">
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>{{ item?.name }}</span>
        <VBtn icon size="small" variant="text" @click="close">
          <VIcon>ri-close-line</VIcon>
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              :model-value="item?.name"
              label="이름"
              readonly
              disabled
            />
          </VCol>
          
          <VCol cols="12" md="6">
            <VTextField
              :model-value="formatDate(item?.createdAt)"
              label="생성일"
              readonly
              disabled
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn color="primary" @click="$emit('edit', item)">
          수정
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
})

const emit = defineEmits(['update:modelValue', 'edit'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('ko-KR')
}

const close = () => {
  isOpen.value = false
}
</script>
```

### Components (EditDialog)
```vue
<template>
  <VDialog v-model="isOpen" max-width="800" persistent>
    <VCard>
      <VCardTitle>
        <span>{{ isEditMode ? '수정' : '생성' }}</span>
      </VCardTitle>

      <VDivider />

      <VCardText>
        <VForm ref="formRef" v-model="valid">
          <VRow>
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="이름"
                :rules="[rules.required]"
                autofocus
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" @click="close">
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  item: Object,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)

const form = ref({
  name: '',
})

const isEditMode = computed(() => !!props.item?.id)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const rules = {
  required: v => !!v || '필수 입력',
}

watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = { ...newItem }
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  form.value = {
    name: '',
  }
  formRef.value?.resetValidation()
}

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    emit('submit', form.value)
  } finally {
    loading.value = false
  }
}

const close = () => {
  resetForm()
  isOpen.value = false
}
</script>
```

### Pinia Store
```javascript
import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from '@/composables/useToast'

export const use{Domain}Store = defineStore('{domain}', {
  state: () => ({
    {domains}: [],
    loading: false,
    selectedItem: null,
  }),

  getters: {
    get{Domain}ById: (state) => (id) => {
      return state.{domains}.find(item => item.id === id)
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/businesses/1/{domains}')
        this.{domains} = data.data
      } catch (error) {
        useToast().error('조회에 실패했습니다')
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async fetchById(id) {
      this.loading = true
      try {
        const { data } = await axios.get(`/api/businesses/1/{domains}/${id}`)
        this.selectedItem = data.data
        return data.data
      } catch (error) {
        useToast().error('조회에 실패했습니다')
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(payload) {
      this.loading = true
      try {
        const { data } = await axios.post('/api/businesses/1/{domains}', payload)
        this.{domains}.push(data.data)
        useToast().success('생성되었습니다')
        return data.data
      } catch (error) {
        const message = error.response?.data?.error?.message || '생성에 실패했습니다'
        useToast().error(message)
        throw error
      } finally {
        this.loading = false
      }
    },

    async update(id, payload) {
      this.loading = true
      try {
        const { data } = await axios.put(`/api/businesses/1/{domains}/${id}`, payload)
        const index = this.{domains}.findIndex(item => item.id === id)
        if (index !== -1) {
          this.{domains}[index] = data.data
        }
        useToast().success('수정되었습니다')
        return data.data
      } catch (error) {
        const message = error.response?.data?.error?.message || '수정에 실패했습니다'
        useToast().error(message)
        throw error
      } finally {
        this.loading = false
      }
    },

    async delete(id) {
      this.loading = true
      try {
        await axios.delete(`/api/businesses/1/{domains}/${id}`)
        this.{domains} = this.{domains}.filter(item => item.id !== id)
        useToast().success('삭제되었습니다')
      } catch (error) {
        const message = error.response?.data?.error?.message || '삭제에 실패했습니다'
        useToast().error(message)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
```

### Router 등록
```javascript
// src/router/index.js에 추가
{
  path: '/{domains}',
  name: '{domains}',
  component: () => import('@/pages/{domains}/index.vue'),
  meta: {
    requiresAuth: true,
    title: '{Domain} 관리',
  },
}
```

## 핵심 원칙

### 파일 구조
```
src/
├── pages/
│   └── {domains}/
│       ├── index.vue
│       └── components/
│           ├── {Domain}DetailDialog.vue
│           └── {Domain}EditDialog.vue
│
├── stores/
│   └── {domain}.js
│
└── router/
    └── index.js (라우트 추가)
```

### Composition API
- `<script setup>` 사용
- `ref`, `computed` 활용
- `onMounted` 라이프사이클

### Materio 활용
- VDataTable, VDialog, VForm
- 반응형 레이아웃 (cols, md, lg)
- Remix Icon

### API 연동
- Axios 사용
- `/api/businesses/1/{domains}` 경로
- useToast로 에러 처리

## 참고 문서

- `docs/skills/SKILL.md`
- `docs/vue-version/` - Materio 예제
