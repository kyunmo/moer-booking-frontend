<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
})

const page = defineModel('page', { type: Number, default: 1 })
</script>

<template>
  <!-- 데이터 없음 -->
  <template v-if="items.length === 0">
    <slot name="empty" />
  </template>

  <!-- 카드 리스트 + 페이지네이션 -->
  <div v-else class="pa-3 d-flex flex-column gap-3">
    <slot
      v-for="item in items"
      :key="item.id"
      name="item"
      :item="item"
    />

    <!-- 모바일 페이지네이션 -->
    <div
      v-if="totalPages > 1"
      class="d-flex justify-center pt-2 pb-1"
    >
      <VPagination
        v-model="page"
        :length="totalPages"
        :total-visible="5"
        density="compact"
        size="small"
      />
    </div>
  </div>
</template>
