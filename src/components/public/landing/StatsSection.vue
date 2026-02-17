<template>
  <div class="stats-section">
    <VContainer>
      <div class="py-12">
        <VRow>
          <VCol
            v-for="(stat, index) in statData"
            :key="index"
            cols="6"
            md="3"
          >
            <VCard
              flat
              class="bg-transparent"
            >
              <VCardText class="text-center">
                <VAvatar
                  size="82"
                  :color="stat.color"
                  :variant="stat.isHover ? 'elevated' : 'tonal'"
                  class="mb-6 cursor-pointer"
                  @mouseenter="stat.isHover = true"
                  @mouseleave="stat.isHover = false"
                >
                  <VIcon
                    :icon="stat.icon"
                    size="42"
                  />
                </VAvatar>
                <div class="stat-value-text">
                  {{ stat.display }}
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ stat.title }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </VContainer>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const statData = reactive([
  {
    title: '예약 처리 건수',
    display: '50,000+',
    icon: 'ri-calendar-check-line',
    color: 'primary',
    isHover: false,
  },
  {
    title: '등록 매장 수',
    display: '200+',
    icon: 'ri-store-2-line',
    color: 'success',
    isHover: false,
  },
  {
    title: '고객 만족도',
    display: '98%',
    icon: 'ri-emotion-happy-line',
    color: 'warning',
    isHover: false,
  },
  {
    title: '평균 노쇼 감소율',
    display: '70%',
    icon: 'ri-arrow-down-line',
    color: 'info',
    isHover: false,
  },
])
</script>

<style lang="scss" scoped>
.stats-section {
  background-color: rgb(var(--v-theme-surface));
}

.stat-value-text {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.25px;
  line-height: 42px;
}
</style>
