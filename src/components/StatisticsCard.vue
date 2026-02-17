<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  subtitle: {
    type: String,
    default: '',
  },
  trend: {
    type: Number,
    default: null,
  },
  trendLabel: {
    type: String,
    default: '전일 대비',
  },
})

const trendColor = computed(() =>
  props.trend === null ? '' : props.trend >= 0 ? 'success' : 'error',
)

const trendIcon = computed(() =>
  props.trend === null ? '' : props.trend >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line',
)
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between">
        <div class="d-flex flex-column gap-y-1">
          <div class="text-body-1 text-high-emphasis">
            {{ title }}
          </div>
          <h4 class="text-h4">
            {{ value }}
          </h4>
          <!-- Trend indicator -->
          <div
            v-if="trend !== null"
            class="d-flex align-center gap-1"
          >
            <VChip
              :color="trendColor"
              size="x-small"
              variant="tonal"
              label
            >
              <VIcon
                :icon="trendIcon"
                size="12"
                start
              />
              {{ Math.abs(trend) }}%
            </VChip>
            <span class="text-caption text-medium-emphasis">{{ trendLabel }}</span>
          </div>
          <!-- Subtitle fallback -->
          <div
            v-else-if="subtitle"
            class="text-body-2"
          >
            {{ subtitle }}
          </div>
        </div>
        <VAvatar
          :color="color"
          variant="tonal"
          rounded="lg"
          size="42"
        >
          <VIcon
            :icon="icon"
            size="26"
          />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>
