<template>
  <div
    ref="statsSectionRef"
    class="stats-section"
  >
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
                  {{ stat.prefix }}{{ animatedValues[index].toLocaleString() }}{{ stat.suffix }}
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
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import publicBookingApi from '@/api/public-booking'

const statData = reactive([
  {
    title: '예약 처리 건수',
    value: 50000,
    prefix: '',
    suffix: '+',
    icon: 'ri-calendar-check-line',
    color: 'primary',
    isHover: false,
  },
  {
    title: '등록 매장 수',
    value: 200,
    prefix: '',
    suffix: '+',
    icon: 'ri-store-2-line',
    color: 'success',
    isHover: false,
  },
  {
    title: '고객 만족도',
    value: 98,
    prefix: '',
    suffix: '%',
    icon: 'ri-emotion-happy-line',
    color: 'warning',
    isHover: false,
  },
  {
    title: '평균 노쇼 감소율',
    value: 70,
    prefix: '',
    suffix: '%',
    icon: 'ri-arrow-down-line',
    color: 'info',
    isHover: false,
  },
])

// 애니메이션 값 (0부터 시작 -> target까지 카운트업)
const animatedValues = reactive([0, 0, 0, 0])
const statsSectionRef = ref(null)
const hasAnimated = ref(false)
let observer = null

function animateCountUp(index, target, duration = 2000) {
  const startTime = performance.now()
  const startValue = 0

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // easeOutExpo easing
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

    animatedValues[index] = Math.floor(startValue + (target - startValue) * eased)

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      animatedValues[index] = target
    }
  }

  requestAnimationFrame(update)
}

function startAnimations() {
  if (hasAnimated.value) return
  hasAnimated.value = true

  statData.forEach((stat, index) => {
    // 각 항목별로 약간의 딜레이를 두어 순차 애니메이션 효과
    setTimeout(() => {
      animateCountUp(index, stat.value, 2000)
    }, index * 200)
  })
}

onMounted(async () => {
  // 플랫폼 통계 API 호출
  try {
    const result = await publicBookingApi.getPlatformStats()
    const data = result?.data ?? result
    if (data) {
      if (data.totalReservations) statData[0].value = data.totalReservations
      if (data.totalBusinesses) statData[1].value = data.totalBusinesses
      if (data.avgRating) {
        statData[2].value = Math.round((data.avgRating / 5) * 100)
      }
    }
  } catch {
    // API 실패 시 기존 하드코딩 값 유지
  }

  // IntersectionObserver로 뷰포트 진입 시 카운트업 시작
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAnimations()
          observer.disconnect()
        }
      })
    },
    {
      threshold: 0.3,
    },
  )

  if (statsSectionRef.value) {
    observer.observe(statsSectionRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.stats-section {
  background-color: rgb(var(--v-theme-surface));
}

.stat-value-text {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 2.125rem;
  font-weight: 700;
  letter-spacing: 0.25px;
  line-height: 1.25;
}
</style>
