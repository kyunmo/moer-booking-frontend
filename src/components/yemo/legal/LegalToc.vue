<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  items: {
    type: Array,
    required: true, // [{ id: 'section-1', label: '제1조 ...' }]
  },
})

const active = ref(props.items[0]?.id || '')
const collapsed = ref(true)

const scrollTo = id => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    active.value = id
    collapsed.value = true
  }
}

let observer = null
onMounted(() => {
  observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          active.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-20% 0px -60% 0px' },
  )
  for (const item of props.items) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <nav class="l-toc" aria-label="목차">
    <!-- 모바일: 접힘 버튼 -->
    <button
      class="l-toc__mobile-toggle"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <Icon icon="ph:list" aria-hidden="true" />
      <span>목차</span>
      <Icon :icon="collapsed ? 'ph:caret-down' : 'ph:caret-up'" class="l-toc__caret" aria-hidden="true" />
    </button>

    <ul class="l-toc__list" :class="{ 'l-toc__list--collapsed': collapsed }">
      <li v-for="item in items" :key="item.id">
        <button
          class="l-toc__item"
          :class="{ 'is-active': active === item.id }"
          @click="scrollTo(item.id)"
        >{{ item.label }}</button>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.l-toc {
  font-size: 13px;
}
.l-toc__mobile-toggle {
  display: none;
  width: 100%;
  padding: 12px 16px;
  background: var(--y-surface);
  border: 1px solid var(--y-border);
  border-radius: var(--y-radius);
  font-size: 14px;
  font-weight: 600;
  color: var(--y-text-strong);
  align-items: center;
  gap: 8px;
  svg { width: 18px; height: 18px; color: var(--y-text-muted); }
  .l-toc__caret { margin-left: auto; }
  @media (max-width: 968px) { display: inline-flex; }
}

.l-toc__list {
  display: flex; flex-direction: column; gap: 2px;
  @media (max-width: 968px) {
    margin-top: 8px;
    padding: 8px;
    background: var(--y-surface);
    border: 1px solid var(--y-border);
    border-radius: var(--y-radius);
    &--collapsed { display: none; }
  }
}
.l-toc__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--y-text-muted);
  border-radius: var(--y-radius-sm);
  transition: all var(--y-dur-fast) var(--y-ease);
  border-left: 2px solid transparent;
  &:hover { color: var(--y-text); background: var(--y-surface-elev); }
  &.is-active {
    color: var(--y-accent-deep);
    border-left-color: var(--y-accent);
    font-weight: 600;
    background: var(--y-accent-soft);
  }
}
</style>
