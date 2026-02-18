<template>
  <VDialog
    :model-value="modelValue"
    max-width="700"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon
          :icon="isEditMode ? 'ri-edit-line' : 'ri-user-add-line'"
          size="24"
          class="me-2"
        />
        <span>{{ isEditMode ? '스태프 정보 수정' : '새 스태프 등록' }}</span>

        <VSpacer />

        <VBtn
          icon="ri-close-line"
          variant="text"
          @click="closeDialog"
        />
      </VCardTitle>

      <VDivider />

      <VCardText style="max-block-size: 600px;">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <!-- 기본 정보 -->
            <VCol cols="12">
              <h6 class="text-h6 mb-2">기본 정보</h6>
            </VCol>

            <!-- 이름 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.name"
                label="이름"
                prepend-inner-icon="ri-user-line"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 전화번호 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.phone"
                label="전화번호"
                prepend-inner-icon="ri-phone-line"
                placeholder="010-1234-5678"
                :rules="[required]"
                required
              />
            </VCol>

            <!-- 이메일 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.email"
                label="이메일"
                prepend-inner-icon="ri-mail-line"
                placeholder="staff@example.com"
                type="email"
              />
            </VCol>

            <!-- 역할 -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.role"
                label="역할"
                :items="roleOptions"
                prepend-inner-icon="ri-shield-user-line"
              />
            </VCol>

            <!-- 경력 -->
            <VCol cols="12" md="6">
              <VTextField
                v-model.number="form.careerYears"
                label="경력 (년)"
                type="number"
                prepend-inner-icon="ri-briefcase-line"
                min="0"
              />
            </VCol>

            <!-- 활성 상태 -->
            <VCol cols="12" md="6" class="d-flex align-center">
              <VSwitch
                v-model="form.isActive"
                label="근무 중"
                color="success"
                hide-details
              >
                <template #label>
                  <div class="d-flex align-center">
                    <span class="me-2">근무 상태</span>
                    <VChip
                      :color="form.isActive ? 'success' : 'error'"
                      size="small"
                    >
                      {{ form.isActive ? '근무중' : '휴직' }}
                    </VChip>
                  </div>
                </template>
              </VSwitch>
            </VCol>

            <!-- 구분선 -->
            <VCol cols="12">
              <VDivider class="my-2" />
              <h6 class="text-h6 mb-2">추가 정보</h6>
            </VCol>

            <!-- 전문분야 -->
            <VCol cols="12">
              <VAutocomplete
                v-model="form.specialties"
                label="전문분야"
                :items="specialtyOptions"
                prepend-inner-icon="ri-star-line"
                multiple
                chips
                closable-chips
                hint="해당 스태프의 전문 분야를 선택하세요"
                persistent-hint
              />
            </VCol>

            <!-- 소개 -->
            <VCol cols="12">
              <VTextarea
                v-model="form.introduction"
                label="소개"
                prepend-inner-icon="ri-file-text-line"
                placeholder="스태프 소개글을 입력하세요"
                rows="3"
                auto-grow
              />
            </VCol>

            <!-- 구분선 -->
            <VCol cols="12">
              <VDivider class="my-2" />
              <h6 class="text-h6 mb-2">근무 시간</h6>
              <p class="text-xs text-disabled">
                요일별 근무 시간을 설정하세요 (체크 해제 시 휴무)
              </p>
            </VCol>

            <!-- 근무 시간 설정 -->
            <VCol
              v-for="day in weekDays"
              :key="day.value"
              cols="12"
            >
              <VCard variant="outlined">
                <VCardText class="pa-3">
                  <VRow align="center">
                    <VCol cols="12" sm="2">
                      <VCheckbox
                        v-model="workingHours[day.value].enabled"
                        :label="day.label"
                        hide-details
                        density="compact"
                      />
                    </VCol>

                    <VCol cols="12" sm="5">
                      <VTextField
                        v-model="workingHours[day.value].start"
                        label="시작 시간"
                        type="time"
                        density="compact"
                        :disabled="!workingHours[day.value].enabled"
                        hide-details
                      />
                    </VCol>

                    <VCol cols="12" sm="5">
                      <VTextField
                        v-model="workingHours[day.value].end"
                        label="종료 시간"
                        type="time"
                        density="compact"
                        :disabled="!workingHours[day.value].enabled"
                        hide-details
                      />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
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
          @click="closeDialog"
        >
          취소
        </VBtn>

        <VBtn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? '수정' : '등록' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'
import { useServiceCategoryStore } from '@/stores/service-category'
import { useStaffStore } from '@/stores/staff'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  staff: Object,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { error: showError } = useSnackbar()
const staffStore = useStaffStore()
const categoryStore = useServiceCategoryStore()

const formRef = ref(null)
const loading = ref(false)

const isEditMode = computed(() => !!props.staff)

const form = ref({
  name: '',
  phone: '',
  email: '',
  role: '디자이너',
  careerYears: 0,
  isActive: true,
  specialties: [],
  introduction: '',
})

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

// 근무 시간
const workingHours = ref({
  monday: { enabled: true, start: '09:00', end: '18:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00' },
  friday: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '09:00', end: '18:00' },
  sunday: { enabled: false, start: '09:00', end: '18:00' },
})

// 옵션들
const roleOptions = [
  '디자이너',
  '원장',
  '매니저',
  '인턴',
  '스태프',
]

// 전문분야 옵션 (DB 카테고리에서 로드)
const specialtyOptions = computed(() => categoryStore.categories.map(c => c.name))

// Validation
const required = value => !!value || '필수 입력 항목입니다.'

// 다이얼로그 열릴 때
watch(() => props.modelValue, newVal => {
  if (newVal) {
    categoryStore.fetchCategories()
    if (props.staff) {
      // 수정 모드
      form.value = {
        name: props.staff.name,
        phone: props.staff.phone,
        email: props.staff.email || '',
        role: props.staff.role || '디자이너',
        careerYears: props.staff.careerYears || 0,
        isActive: props.staff.isActive !== false,
        specialties: props.staff.specialties || [],
        introduction: props.staff.introduction || '',
      }

      // 근무시간 (있으면 로드)
      if (props.staff.workingHours) {
        workingHours.value = { ...props.staff.workingHours }
      }
    }
    else {
      // 등록 모드
      form.value = {
        name: '',
        phone: '',
        email: '',
        role: '디자이너',
        careerYears: 0,
        isActive: true,
        specialties: [],
        introduction: '',
      }

      // 근무시간 초기화
      workingHours.value = {
        monday: { enabled: true, start: '09:00', end: '18:00' },
        tuesday: { enabled: true, start: '09:00', end: '18:00' },
        wednesday: { enabled: true, start: '09:00', end: '18:00' },
        thursday: { enabled: true, start: '09:00', end: '18:00' },
        friday: { enabled: true, start: '09:00', end: '18:00' },
        saturday: { enabled: true, start: '09:00', end: '18:00' },
        sunday: { enabled: false, start: '09:00', end: '18:00' },
      }
    }
  }
})

// 폼 제출
async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const staffData = {
      ...form.value,
      workingHours: workingHours.value,
    }

    if (isEditMode.value) {
      // 수정
      await staffStore.updateStaff(props.staff.id, staffData)
    }
    else {
      // 등록
      await staffStore.createStaff(staffData)
    }

    emit('saved')
  }
  catch (error) {
    showError(error.message || '스태프 저장에 실패했습니다.')
  }
  finally {
    loading.value = false
  }
}

// 다이얼로그 닫기
function closeDialog() {
  emit('update:modelValue', false)
}
</script>
