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

          <!-- 예약 설정 -->
          <VCol cols="12">
            <h6 class="text-h6 mb-3">예약 설정</h6>
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model.number="form.bookingInterval"
              label="예약 시간 간격 (분)"
              type="number"
              prepend-inner-icon="ri-time-line"
              hint="예약 가능한 시간 단위를 설정합니다"
              persistent-hint
              min="10"
              max="120"
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

          <VCol cols="12" md="6">
            <VTextField
              v-model.number="form.minAdvanceBookingHours"
              label="최소 사전 예약 시간"
              type="number"
              prepend-inner-icon="ri-time-line"
              hint="예약은 최소 몇 시간 전에 해야 하는지 설정합니다"
              persistent-hint
              min="0"
              max="72"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VSwitch
              v-model="form.autoConfirm"
              label="예약 자동 확정"
              color="primary"
              hint="활성화 시 예약이 자동으로 확정됩니다"
              persistent-hint
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
import { useSnackbar } from '@/composables/useSnackbar'
import { onMounted, ref } from 'vue'

const settingsStore = useBusinessSettingsStore()
const { success, error: showError } = useSnackbar()

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
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  tuesday: {
    isOpen: true,
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  wednesday: {
    isOpen: true,
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  thursday: {
    isOpen: true,
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  friday: {
    isOpen: true,
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  saturday: {
    isOpen: true,
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  sunday: {
    isOpen: false,
    openTime: '10:00',
    closeTime: '20:00',
    hasBreakTime: false,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
})

// 예약 설정
const form = ref({
  bookingInterval: 30,
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 2,
  autoConfirm: false,
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
  if (settingsStore.business?.businessHours) {
    loadBusinessHours()
  }
  else {
    // 기본값으로 초기화
    weekDays.forEach(day => {
      businessHours.value[day.value] = {
        isOpen: day.value !== 'sunday',
        openTime: '10:00',
        closeTime: '20:00',
        hasBreakTime: false,
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      }
    })

    form.value = {
      bookingInterval: 30,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      autoConfirm: false,
    }
  }
}

// 영업시간 로드
function loadBusinessHours() {
  if (!settingsStore.business) return

  // businessHours (JSONB) - Business 테이블에 저장됨
  if (settingsStore.business.businessHours) {
    Object.assign(businessHours.value, settingsStore.business.businessHours)
  }

  // settings - BusinessSettings 테이블
  // 백엔드에서 settings가 없으면 자동 생성됨 (REQUIRES_NEW 트랜잭션)
  const settings = settingsStore.business.settings
  if (settings) {
    form.value.bookingInterval = settings.bookingInterval || 30
    form.value.maxAdvanceBookingDays = settings.maxAdvanceBookingDays || 30
    form.value.minAdvanceBookingHours = settings.minAdvanceBookingHours || 2
    form.value.autoConfirm = settings.autoConfirm === 'Y'
  }
}

// 폼 제출
async function handleSubmit() {
  try {
    // updateBusinessHours는 두 가지 작업을 수행:
    // 1. Business.businessHours 업데이트 (JSONB)
    // 2. BusinessSettings 테이블 업데이트
    await settingsStore.updateBusinessHours(
      businessHours.value,  // businessHours (JSONB)
      {
        // bookingSettings (business_settings 테이블)
        bookingInterval: form.value.bookingInterval,
        maxAdvanceBookingDays: form.value.maxAdvanceBookingDays,
        minAdvanceBookingHours: form.value.minAdvanceBookingHours,
        autoConfirm: form.value.autoConfirm ? 'Y' : 'N',
      }
    )

    success('영업시간이 저장되었습니다.')
  }
  catch (err) {
    showError(err.message || '영업시간 저장에 실패했습니다.')
  }
}

// 컴포넌트 마운트 시
onMounted(async () => {
  try {
    // 매장 정보 조회 (settings가 없으면 백엔드에서 자동 생성됨)
    await settingsStore.fetchBusinessInfo()
    loadBusinessHours()
  }
  catch (err) {
    showError('영업시간 정보를 불러오는데 실패했습니다.')
  }
})
</script>
