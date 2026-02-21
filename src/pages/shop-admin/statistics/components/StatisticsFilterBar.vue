<template>
  <VCard class="mb-6">
    <VCardText>
      <!-- Period Presets -->
      <VBtnToggle
        v-model="preset"
        color="primary"
        variant="outlined"
        density="comfortable"
        class="mb-4 flex-wrap"
        @update:model-value="onPresetChange"
      >
        <VBtn
          v-for="p in presets"
          :key="p.value"
          :value="p.value"
          size="small"
        >
          {{ p.title }}
        </VBtn>
      </VBtnToggle>

      <!-- Filters Row -->
      <VRow align="center">
        <VCol cols="12" sm="6" md="3" lg="2">
          <VTextField
            v-model="localFilters.startDate"
            label="시작일"
            type="date"
            prepend-inner-icon="ri-calendar-line"
            density="compact"
            hide-details
          />
        </VCol>

        <VCol cols="12" sm="6" md="3" lg="2">
          <VTextField
            v-model="localFilters.endDate"
            label="종료일"
            type="date"
            prepend-inner-icon="ri-calendar-line"
            density="compact"
            hide-details
          />
        </VCol>

        <VCol cols="12" sm="6" md="3" lg="2">
          <VSelect
            v-model="localFilters.compareWith"
            label="비교 기준"
            :items="compareOptions"
            density="compact"
            hide-details
          />
        </VCol>

        <VCol v-if="showGroupBy" cols="12" sm="6" md="3" lg="2">
          <VSelect
            v-model="localFilters.groupBy"
            label="집계 단위"
            :items="groupByOptions"
            density="compact"
            hide-details
          />
        </VCol>

        <VCol cols="12" sm="12" :md="showGroupBy ? 12 : 3" :lg="showGroupBy ? 4 : 4" class="d-flex align-center">
          <VBtn
            color="primary"
            block
            @click="onSearch"
          >
            <VIcon icon="ri-search-line" class="me-1" />
            조회
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  showGroupBy: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'search'])

// Debounce timer for auto-search
let debounceTimer = null
let isPresetChanging = false

function debouncedSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    onSearch()
  }, 300)
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const presets = [
  { title: '오늘', value: 'today' },
  { title: '이번 주', value: 'thisWeek' },
  { title: '이번 달', value: 'thisMonth' },
  { title: '지난 달', value: 'lastMonth' },
  { title: '3개월', value: '3months' },
  { title: '6개월', value: '6months' },
  { title: '1년', value: '1year' },
]

const compareOptions = [
  { title: '없음', value: null },
  { title: '이전 기간', value: 'PREVIOUS_PERIOD' },
  { title: '작년 동기', value: 'LAST_YEAR' },
]

const groupByOptions = [
  { title: '일별', value: 'daily' },
  { title: '주별', value: 'weekly' },
  { title: '월별', value: 'monthly' },
]

const preset = ref('thisMonth')

const localFilters = reactive({
  startDate: '',
  endDate: '',
  compareWith: null,
  groupBy: 'daily',
})

function getDateRange(presetValue) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()
  const dayOfWeek = today.getDay()

  const formatDate = d => d.toISOString().split('T')[0]

  switch (presetValue) {
  case 'today':
    return { start: formatDate(today), end: formatDate(today) }
  case 'thisWeek': {
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(year, month, day + mondayOffset)
    const sunday = new Date(year, month, day + mondayOffset + 6)

    return { start: formatDate(monday), end: formatDate(sunday) }
  }
  case 'thisMonth':
    return {
      start: formatDate(new Date(year, month, 1)),
      end: formatDate(new Date(year, month + 1, 0)),
    }
  case 'lastMonth':
    return {
      start: formatDate(new Date(year, month - 1, 1)),
      end: formatDate(new Date(year, month, 0)),
    }
  case '3months':
    return {
      start: formatDate(new Date(year, month - 2, 1)),
      end: formatDate(new Date(year, month + 1, 0)),
    }
  case '6months':
    return {
      start: formatDate(new Date(year, month - 5, 1)),
      end: formatDate(new Date(year, month + 1, 0)),
    }
  case '1year':
    return {
      start: formatDate(new Date(year - 1, month + 1, 1)),
      end: formatDate(new Date(year, month + 1, 0)),
    }
  default:
    return { start: '', end: '' }
  }
}

function onPresetChange(val) {
  if (!val) return

  const range = getDateRange(val)

  // Flag to prevent individual watch handlers from clearing preset
  isPresetChanging = true

  localFilters.startDate = range.start
  localFilters.endDate = range.end

  // Auto-adjust groupBy based on range
  const days = Math.ceil((new Date(range.end) - new Date(range.start)) / (1000 * 60 * 60 * 24))
  if (days <= 7) localFilters.groupBy = 'daily'
  else if (days <= 62) localFilters.groupBy = 'daily'
  else if (days <= 180) localFilters.groupBy = 'weekly'
  else localFilters.groupBy = 'monthly'

  // Reset flag after Vue reactivity cycle
  nextTick(() => {
    isPresetChanging = false
  })

  // Auto-search on preset change
  debouncedSearch()
}

function onSearch() {
  emit('update:modelValue', { ...localFilters })
  emit('search')
}

// Watch individual filter changes for auto-search
// When date is changed manually (not via preset), clear the preset selection
watch(() => localFilters.startDate, (newVal, oldVal) => {
  if (oldVal && newVal && newVal !== oldVal) {
    if (!isPresetChanging) preset.value = null
    debouncedSearch()
  }
})

watch(() => localFilters.endDate, (newVal, oldVal) => {
  if (oldVal && newVal && newVal !== oldVal) {
    if (!isPresetChanging) preset.value = null
    debouncedSearch()
  }
})

watch(() => localFilters.compareWith, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    debouncedSearch()
  }
})

watch(() => localFilters.groupBy, (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    if (!isPresetChanging) debouncedSearch()
  }
})

watch(() => props.modelValue, val => {
  if (val) {
    if (val.startDate) localFilters.startDate = val.startDate
    if (val.endDate) localFilters.endDate = val.endDate
    if (val.compareWith !== undefined) localFilters.compareWith = val.compareWith
    if (val.groupBy) localFilters.groupBy = val.groupBy
  }
}, { deep: true })

onMounted(() => {
  // Set default to this month
  onPresetChange('thisMonth')

  // Auto search on mount
  setTimeout(() => {
    onSearch()
  }, 100)
})
</script>
