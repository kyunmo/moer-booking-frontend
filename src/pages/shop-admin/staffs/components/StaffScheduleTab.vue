<template>
  <div>
    <!-- 로딩 -->
    <div v-if="loading" class="text-center pa-6">
      <VProgressCircular indeterminate color="primary" />
      <p class="text-sm mt-2">스케줄을 불러오는 중...</p>
    </div>

    <template v-else>
      <!-- 요일별 스케줄 -->
      <div
        v-for="(schedule, index) in schedules"
        :key="schedule.dayOfWeek"
        class="mb-3"
      >
        <VCard variant="outlined">
          <VCardText class="pa-3">
            <VRow align="center">
              <!-- 요일 + 근무여부 스위치 -->
              <VCol cols="12" sm="2">
                <VSwitch
                  v-model="schedule.isWorking"
                  :label="dayLabels[schedule.dayOfWeek]"
                  color="primary"
                  density="compact"
                  hide-details
                />
              </VCol>

              <!-- 근무 시간 -->
              <VCol cols="6" sm="2">
                <VTextField
                  v-model="schedule.startTime"
                  label="출근"
                  type="time"
                  density="compact"
                  :disabled="!schedule.isWorking"
                  hide-details
                />
              </VCol>

              <VCol cols="6" sm="2">
                <VTextField
                  v-model="schedule.endTime"
                  label="퇴근"
                  type="time"
                  density="compact"
                  :disabled="!schedule.isWorking"
                  hide-details
                />
              </VCol>

              <!-- 구분선 -->
              <VCol cols="12" sm="1" class="d-none d-sm-flex justify-center">
                <VDivider vertical class="mx-2" />
              </VCol>

              <!-- 휴게 시간 -->
              <VCol cols="6" sm="2">
                <VTextField
                  v-model="schedule.breakStartTime"
                  label="휴게 시작"
                  type="time"
                  density="compact"
                  :disabled="!schedule.isWorking"
                  hide-details
                  clearable
                />
              </VCol>

              <VCol cols="6" sm="2">
                <VTextField
                  v-model="schedule.breakEndTime"
                  label="휴게 종료"
                  type="time"
                  density="compact"
                  :disabled="!schedule.isWorking"
                  hide-details
                  clearable
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </div>

      <!-- 저장 버튼 -->
      <div class="d-flex justify-end mt-4">
        <VBtn
          color="primary"
          :loading="saving"
          @click="saveSchedules"
        >
          <VIcon icon="ri-save-line" class="me-2" />
          스케줄 저장
        </VBtn>
      </div>
    </template>
  </div>
</template>

<script setup>
import staffApi from '@/api/staffs'
import { useSnackbar } from '@/composables/useSnackbar'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
})

const authStore = useAuthStore()
const { success: showSuccess, error: showError } = useSnackbar()

const loading = ref(false)
const saving = ref(false)

// 요일 라벨
const dayLabels = {
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
  7: '일',
}

// 기본 스케줄 템플릿
function getDefaultSchedules() {
  return [
    { dayOfWeek: 1, startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorking: true },
    { dayOfWeek: 2, startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorking: true },
    { dayOfWeek: 3, startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorking: true },
    { dayOfWeek: 4, startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorking: true },
    { dayOfWeek: 5, startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorking: true },
    { dayOfWeek: 6, startTime: '10:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isWorking: true },
    { dayOfWeek: 7, startTime: '10:00', endTime: '19:00', breakStartTime: null, breakEndTime: null, isWorking: false },
  ]
}

const schedules = ref(getDefaultSchedules())

// 스케줄 로드
async function loadSchedules() {
  loading.value = true
  try {
    const response = await staffApi.getStaffSchedules(authStore.businessId, props.staffId)
    const data = response.data

    if (data && data.length > 0) {
      // 서버 데이터를 dayOfWeek 순으로 정렬하여 채우기
      const serverMap = {}
      data.forEach(s => {
        serverMap[s.dayOfWeek] = s
      })

      const defaults = getDefaultSchedules()
      schedules.value = defaults.map(d => {
        if (serverMap[d.dayOfWeek]) {
          const s = serverMap[d.dayOfWeek]
          return {
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime || d.startTime,
            endTime: s.endTime || d.endTime,
            breakStartTime: s.breakStartTime || null,
            breakEndTime: s.breakEndTime || null,
            isWorking: s.isWorking !== false,
          }
        }
        return d
      })
    }
    else {
      schedules.value = getDefaultSchedules()
    }
  }
  catch (error) {
    console.error('스케줄 조회 실패:', error)
    showError('스케줄을 불러오는데 실패했습니다.')
    schedules.value = getDefaultSchedules()
  }
  finally {
    loading.value = false
  }
}

// 스케줄 저장
async function saveSchedules() {
  saving.value = true
  try {
    // 빈 휴게시간 처리
    const payload = schedules.value.map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      breakStartTime: s.breakStartTime || null,
      breakEndTime: s.breakEndTime || null,
      isWorking: s.isWorking,
    }))

    await staffApi.saveStaffSchedules(authStore.businessId, props.staffId, payload)
    showSuccess('근무 스케줄이 저장되었습니다.')
  }
  catch (error) {
    console.error('스케줄 저장 실패:', error)
    showError('스케줄 저장에 실패했습니다.')
  }
  finally {
    saving.value = false
  }
}

// staffId 변경 시 다시 로드
watch(() => props.staffId, newId => {
  if (newId) {
    loadSchedules()
  }
})

onMounted(() => {
  if (props.staffId) {
    loadSchedules()
  }
})
</script>
