<template>
  <VCard rounded="lg" variant="outlined">
    <VCardTitle class="text-h6 font-weight-bold pa-5 pb-3">
      <VIcon start color="primary" size="22">
        ri-service-line
      </VIcon>
      서비스 선택
    </VCardTitle>

    <VDivider />

    <VAlert
      v-if="rebookMode"
      type="info"
      variant="tonal"
      class="ma-5 mb-0"
      density="compact"
      closable
    >
      이전 예약 기반으로 서비스가 자동 선택되었습니다. 변경할 수 있습니다.
    </VAlert>

    <VCardText class="pa-5">
      <!-- No services -->
      <div v-if="Object.keys(servicesByCategory).length === 0" class="text-center py-8">
        <VIcon icon="ri-information-line" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-1 text-medium-emphasis">
          등록된 서비스가 없습니다
        </p>
      </div>

      <!-- Services grouped by category -->
      <div v-for="(services, category) in servicesByCategory" :key="category" class="mb-6">
        <h3 class="text-subtitle-1 font-weight-bold mb-3 text-medium-emphasis">
          {{ category }}
        </h3>

        <VRow>
          <VCol
            v-for="service in services"
            :key="service.id"
            cols="12"
            sm="6"
          >
            <VCard
              :variant="isServiceSelected(service) ? 'outlined' : 'flat'"
              :color="isServiceSelected(service) ? 'primary' : undefined"
              :class="[
                'service-card cursor-pointer pa-4',
                { 'service-card--selected': isServiceSelected(service) },
              ]"
              :style="!isServiceSelected(service) ? 'border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))' : ''"
              rounded="lg"
              role="checkbox"
              :aria-checked="isServiceSelected(service)"
              :aria-label="`${service.name} - ${formatPrice(service.price)}원, ${service.duration}분`"
              tabindex="0"
              @click="toggleService(service)"
              @keydown.enter="toggleService(service)"
              @keydown.space.prevent="toggleService(service)"
            >
              <div class="d-flex align-start justify-space-between">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-1 font-weight-bold">
                      {{ service.name }}
                    </span>
                  </div>
                  <p v-if="service.description" class="text-body-2 text-medium-emphasis mb-2">
                    {{ service.description }}
                  </p>
                  <div class="d-flex align-center ga-3">
                    <span class="text-body-2 font-weight-bold text-primary">
                      {{ formatPrice(service.price) }}원
                    </span>
                    <VChip size="x-small" variant="tonal" color="secondary">
                      <VIcon start size="12">
                        ri-time-line
                      </VIcon>
                      {{ service.duration }}분
                    </VChip>
                  </div>
                </div>
                <VIcon
                  v-if="isServiceSelected(service)"
                  icon="ri-checkbox-circle-fill"
                  color="primary"
                  size="24"
                  class="ms-2"
                />
                <VIcon
                  v-else
                  icon="ri-checkbox-blank-circle-line"
                  color="grey-lighten-1"
                  size="24"
                  class="ms-2"
                />
              </div>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </VCardText>

    <!-- Bottom Summary Bar (Sticky) -->
    <div class="service-summary-sticky">
      <VDivider />
      <VCardActions class="pa-5 d-flex flex-column flex-sm-row align-stretch align-sm-center ga-3 bg-surface">
        <div v-if="selectedServices.length > 0" class="d-flex align-center ga-4 flex-grow-1">
          <VChip color="primary" variant="tonal" size="small">
            {{ selectedServices.length }}개 선택
          </VChip>
          <span class="text-body-2">
            총 <strong class="text-primary">{{ formatPrice(totalPrice) }}원</strong>
            / {{ totalDuration }}분
          </span>
        </div>
        <VSpacer class="d-none d-sm-block" />
        <VBtn
          color="primary"
          size="large"
          :disabled="!canGoNext"
          block
          class="flex-sm-grow-0"
          min-width="140"
          aria-label="다음 단계로 이동"
          @click="$emit('next')"
        >
          다음
          <VIcon end>
            ri-arrow-right-line
          </VIcon>
        </VBtn>
      </VCardActions>
    </div>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'

const props = defineProps({
  rebookMode: { type: Boolean, default: false },
})

const emit = defineEmits(['next'])

const bookingStore = useBookingStore()

const servicesByCategory = computed(() => bookingStore.servicesByCategory)
const selectedServices = computed(() => bookingStore.selectedServices)
const totalPrice = computed(() => bookingStore.totalPrice)
const totalDuration = computed(() => bookingStore.totalDuration)

const canGoNext = computed(() => selectedServices.value.length > 0)

function toggleService(service) {
  const index = bookingStore.selectedServices.findIndex(s => s.id === service.id)
  if (index >= 0) {
    bookingStore.selectedServices.splice(index, 1)
  } else {
    bookingStore.selectedServices.push(service)
  }
}

function isServiceSelected(service) {
  return bookingStore.selectedServices.some(s => s.id === service.id)
}

function formatPrice(price) {
  return (price || 0).toLocaleString()
}
</script>

<style lang="scss" scoped>
.service-summary-sticky {
  position: sticky;
  inset-block-end: 0;
  z-index: 5;
  background: rgb(var(--v-theme-surface));
  border-end-start-radius: inherit;
  border-end-end-radius: inherit;
}

.service-card {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-width: 2px !important;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
