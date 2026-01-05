<template>
  <VAlert
    v-if="unassignedCount > 0"
    type="warning"
    variant="tonal"
    closable
  >
    <div class="d-flex align-center">
      <VIcon icon="ri-alert-line" size="24" class="me-3" />
      <div class="flex-grow-1">
        <div class="font-weight-medium mb-1">
          담당 직원이 배정되지 않은 예약이 {{ unassignedCount }}건 있습니다.
        </div>
        <div class="text-sm">
          예약 목록에서 직원을 배정해주세요.
        </div>
      </div>
      <VBtn
        color="warning"
        variant="elevated"
        size="small"
        @click="goToUnassigned"
      >
        확인하기
      </VBtn>
    </div>
  </VAlert>
</template>

<script setup>
import { useReservationStore } from '@/stores/reservation'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const reservationStore = useReservationStore()
const router = useRouter()

// 미배정 예약 개수
const unassignedCount = computed(() => {
  return reservationStore.reservations.filter(r => 
    !r.staffId && 
    (r.status === 'PENDING' || r.status === 'CONFIRMED')
  ).length
})

// 미배정 예약 목록으로 이동
function goToUnassigned() {
  router.push({
    name: 'reservations-list',
    query: { unassigned: 'true' }
  })
}

// 컴포넌트 마운트 시 예약 로드
onMounted(() => {
  if (reservationStore.reservations.length === 0) {
    reservationStore.fetchReservations()
  }
})
</script>
