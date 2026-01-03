<template>
  <VCard>
    <VCardTitle class="d-flex align-center">
      <VIcon icon="ri-time-line" size="24" class="me-3" />
      <span>영업시간 설정</span>
    </VCardTitle>

    <VDivider />

    <VCardText>
      <VAlert
        color="info"
        variant="tonal"
        class="mb-4"
      >
        <VIcon icon="ri-information-line" class="me-2" />
        요일별 영업시간을 설정하세요. 체크 해제 시 해당 요일은 휴무입니다.
      </VAlert>

      <VForm ref="formRef" @submit.prevent="handleSubmit">
        <VRow>
          <!-- 요일별 영업시간 -->
          <VCol
            v-for="day in weekDays"
            :key="day.value"
            cols="12"
          >
            <VCard variant="outlined">
              <VCardText>
                <VRow align="center">
                  <!-- 요일 체크박스 -->
                  <VCol cols="12" sm="2">
                    <VCheckbox
                      v-model="businessHours[day.value].isOpen"
                      :label="day.label"
                      hide-details
                      color="primary"
                    />
                  </VCol>

                  <!-- 시작 시간 -->
                  <VCol cols="12" sm="3">
                    <VTextField
                      v-model="businessHours[day.value].openTime"
                      label="시작 시간"
                      type="time"
                      prepend-inner-icon="ri-time-line"
                      density="compact"
                      :disabled="!businessHours[day.value].isOpen"
                      hide-details
                    />
                  </VCol>

                  <!-- 종료 시간 -->
                  <VCol cols="12" sm="3">
                    <VTextField
                      v-model="businessHours[day.value].closeTime"
                      label="종료 시간"
                      type="time"
                      prepend-inner-icon="ri-time-line"
                      density="compact"
                      :disabled="!businessHours[day.value].isOpen"
                      hide-details
                    />
                  </VCol>

                  <!-- 브레이크 타임 체크박스 -->
                  <VCol cols="12" sm="2">
                    <VCheckbox
                      v-model="businessHours[day.value].hasBreakTime"
                      label="브레이크 타임"
                      hide-details
                      density="compact"
                      :disabled="!businessHours[day.value].isOpen"
                    />
                  </VCol>

                  <!-- 빠른 설정 버튼 -->
                  <VCol cols="12" sm="2" class="text-right">
                    <VBtn
                      size="small"
                      variant="outlined"
                      :disabled="!businessHours[day.value].isOpen"
                      @click="copyToAll(day.value)"
                    >
                      전체 적용
                    </VBtn>
                  </VCol>

                  <!-- 브레이크 타임 설정 -->
                  <template v-if="businessHours[day.value].hasBreakTime && businessHours[day.value].isOpen">
                    <VCol cols="12" sm="2" />
                    <VCol cols="12" sm="3">
                      <VTextField
                        v-model="businessHours[day.value].breakStartTime"
                        label="브레이크 시작"
                        type="time"
                        prepend-inner-icon="ri-cup-line"
                        density="compact"
                        hide-details
                      />
                    </VCol>

                    <VCol cols="12" sm="3">
                      <VTextField
                        v-model="businessHours[day.value].breakEndTime"
                        label="브레이크 종료"
                        type="time"
                        prepend-inner-icon="ri-cup-line"
                        density="compact"
                        hide-details
                      />
                    </VCol>
                  </template>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>

          <!-- 구분선 -->
          <VCol cols="12">
            <VDivider class="my-2" />
          </VCol>

          <!-- 추가 설정 -->
          <VCol cols="12">
            <h6 class="text-h6 mb-3">추가 설정</h6>
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model.number="form.slotDuration"
              label="예약 시간 간격 (분)"
              type="number"
              prepend-inner-icon="ri-time-line"
              hint="예약 가능한 시간 단위를 설정합니다"
              persistent-hint
              min="10"
              max="60"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model.number="form.maxAdvanceBookingDays"
              label="최대 예약 가능 일수"
              type="number"
              prepend-inner-icon="ri-calendar-line"
              hint="몇 일 후까지 예약 가능한지 설정합니다"
              persistent-hint
              min="1"
              max="365"
            />
          </VCol>
        </VRow>
      </VForm>
    </VCardText>

    <VDivider />

    <VCardActions>
      <VSpacer />

      <VBtn
        color="secondary"
        variant="outlined"
        @click="resetForm"
      >
        초기화
      </VBtn>

      <VBtn
        color="primary"
        :loading="settingsStore.loading"
        @click="handleSubmit"
      >
        저장
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup>
import { useBusinessSettingsStore } from '@/stores/business-settings'
import { onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()

const formRef = ref(null)

// 요일
const weekDays = [
  { label: '월요일', value: 'monday' },
  { label: '화요일', value: 'tuesday' },
  { label: '수요일', value: 'wednesday' },
  { label: '목요일', value: 'thursday' },
  { label: '금요일', value: 'friday' },
  { label: '토요일', value: 'saturday' },
  { label: '일요일', value: 'sunday' },
]

// 영업시간
const businessHours = ref({
  monday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  tuesday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  wednesday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  thursday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  friday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  saturday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  sunday: {
    isOpen: false,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
})

// 추가 설정
const form = ref({
  slotDuration: 30,
  maxAdvanceBookingDays: 30,
})

// 전체 적용
function copyToAll(sourceDay) {
  const source = businessHours.value[sourceDay]
  
  weekDays.forEach(day => {
    businessHours.value[day.value] = {
      ...source,
    }
  })
}

// 폼 초기화
function resetForm() {
  if (settingsStore.businessHours) {
    loadBusinessHours()
  }
  else {
    // 기본값으로 초기화
    weekDays.forEach(day => {
      businessHours.value[day.value] = {
        isOpen: day.value !== 'sunday',
        openTime: '09:00',
        closeTime: '20:00',
        hasBreakTime: false,
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      }
    })

    form.value = {
      slotDuration: 30,
      maxAdvanceBookingDays: 30,
    }
  }
}

// 영업시간 로드
function loadBusinessHours() {
  if (!settingsStore.businessHours) return

  const hours = settingsStore.businessHours
  
  if (hours.weeklyHours) {
    businessHours.value = { ...hours.weeklyHours }
  }

  if (hours.slotDuration) {
    form.value.slotDuration = hours.slotDuration
  }

  if (hours.maxAdvanceBookingDays) {
    form.value.maxAdvanceBookingDays = hours.maxAdvanceBookingDays
  }
}

// 폼 제출
async function handleSubmit() {
  try {
    const hoursData = {
      weeklyHours: businessHours.value,
      slotDuration: form.value.slotDuration,
      maxAdvanceBookingDays: form.value.maxAdvanceBookingDays,
    }

    await settingsStore.updateBusinessHours(hoursData)
    alert('영업시간이 저장되었습니다.')
  }
  catch (error) {
    console.error('저장 실패:', error)
    alert(error || '저장에 실패했습니다.')
  }
}

// 컴포넌트 마운트 시
onMounted(async () => {
  try {
    await settingsStore.fetchBusinessHours()
    loadBusinessHours()
  }
  catch (error) {
    console.error('영업시간 조회 실패:', error)
  }
})
</script>
