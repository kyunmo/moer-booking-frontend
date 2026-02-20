<script setup>
const props = defineProps({
  menuList: {
    type: Array,
    required: false,
  },
  itemProps: {
    type: Boolean,
    required: false,
  },
  iconSize: {
    type: String,
    required: false,
  },
  class: {
    type: String,
    required: false,
    default: 'text-disabled',
  },
})
</script>

<template>
  <IconBtn
    size="small"
    :class="props.class"
    aria-label="더 보기"
  >
    <VIcon
      :size="iconSize"
      icon="ri-more-2-line"
    />

    <VMenu
      v-if="props.menuList"
      activator="parent"
    >
      <VList
        :items="props.menuList"
        :item-props="props.itemProps"
      />
    </VMenu>
  </IconBtn>
</template>
