<template>
  <VDialog
    :model-value="modelValue"
    max-width="800"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard v-if="staff">
      <!-- 헤더 -->
      <VCardTitle class="d-flex align-center pe-2">
        <VIcon icon="ri-user-line" size="24" class="me-3" />
        <span>스태프 상세정보</span>

        <VSpacer />

        <VBtn
          icon
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
        >
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <!-- 탭 -->
      <VTabs v-model="activeTab" grow>
        <VTab value="info">
          <VIcon icon="ri-information-line" class="me-2" />
          기본 정보
        </VTab>
        <VTab value="schedule">
          <VIcon icon="ri-calendar-schedule-line" class="me-2" />
          근무 스케줄
        </VTab>
        <VTab value="portfolio">
          <VIcon icon="ri-gallery-line" class="me-2" />
          포트폴리오
        </VTab>
      </VTabs>

      <VDivider />

      <!-- 탭 콘텐츠 -->
      <VCardText style="min-block-size: 400px;">
        <VWindow v-model="activeTab">
          <!-- Tab 1: 기본 정보 -->
          <VWindowItem value="info">
            <!-- 프로필 섹션 -->
            <div class="text-center mb-6">
              <VAvatar
                :color="staff.profileImageUrl ? undefined : 'primary'"
                size="100"
                class="mb-3"
              >
                <VImg v-if="staff.profileImageUrl" :src="getImageUrl(staff.profileImageUrl)" />
                <span v-else class="text-h4">
                  {{ getInitial(staff.name) }}
                </span>
              </VAvatar>

              <h5 class="text-h5 mb-2">{{ staff.name }}</h5>

              <div class="d-flex justify-center gap-2">
                <VChip
                  v-if="staff.positionName || staff.position"
                  color="primary"
                  size="small"
                >
                  {{ staff.positionName || staff.position }}
                </VChip>

                <VChip
                  :color="staff.isActive !== false ? 'success' : 'error'"
                  size="small"
                  variant="outlined"
                >
                  {{ staff.isActive !== false ? '근무중' : '휴직' }}
                </VChip>
              </div>
            </div>

            <VDivider class="mb-4" />

            <!-- 기본 정보 -->
            <div class="mb-6">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-information-line" class="me-2" />
                기본 정보
              </h6>

              <VRow>
                <!-- 전화번호 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-phone-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">전화번호</p>
                      <p class="text-sm mb-0">{{ staff.phone || '-' }}</p>
                    </div>
                  </div>
                </VCol>

                <!-- 이메일 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-mail-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">이메일</p>
                      <p class="text-sm mb-0">{{ staff.email || '-' }}</p>
                    </div>
                  </div>
                </VCol>

                <!-- 경력 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-briefcase-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">경력</p>
                      <p class="text-sm mb-0">{{ staff.careerYears || 0 }}년</p>
                    </div>
                  </div>
                </VCol>

                <!-- 등록일 -->
                <VCol cols="12" sm="6">
                  <div class="d-flex align-center">
                    <VIcon icon="ri-calendar-line" size="20" class="me-3 text-disabled" />
                    <div>
                      <p class="text-xs text-disabled mb-0">등록일</p>
                      <p class="text-sm mb-0">{{ formatDate(staff.createdAt) }}</p>
                    </div>
                  </div>
                </VCol>
              </VRow>
            </div>

            <!-- 전문분야 -->
            <div v-if="staff.specialty" class="mb-6">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-star-line" class="me-2" />
                전문분야
              </h6>
              <div>
                <VChip
                  v-for="(spec, index) in parseSpecialty(staff.specialty)"
                  :key="index"
                  color="info"
                  variant="tonal"
                  class="me-2 mb-2"
                >
                  {{ spec }}
                </VChip>
              </div>
            </div>

            <!-- 소개글 -->
            <div v-if="staff.introduction">
              <h6 class="text-h6 mb-3">
                <VIcon icon="ri-user-smile-line" class="me-2" />
                소개
              </h6>
              <p class="text-sm text-medium-emphasis">
                {{ staff.introduction }}
              </p>
            </div>
          </VWindowItem>

          <!-- Tab 2: 근무 스케줄 -->
          <VWindowItem value="schedule">
            <StaffScheduleTab
              v-if="staff.id"
              :staff-id="staff.id"
            />
          </VWindowItem>

          <!-- Tab 3: 포트폴리오 -->
          <VWindowItem value="portfolio">
            <StaffPortfolioTab
              v-if="staff.id"
              :staff-id="staff.id"
            />
          </VWindowItem>
        </VWindow>
      </VCardText>

      <VDivider />

      <!-- 액션 버튼 -->
      <VCardActions class="pa-4">
        <VBtn
          color="error"
          variant="outlined"
          @click="handleDelete"
        >
          <VIcon icon="ri-delete-bin-line" class="me-2" />
          삭제
        </VBtn>

        <VSpacer />

        <VBtn
          variant="outlined"
          @click="$emit('update:modelValue', false)"
        >
          닫기
        </VBtn>

        <VBtn
          color="primary"
          @click="handleEdit"
        >
          <VIcon icon="ri-edit-line" class="me-2" />
          수정
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { getImageUrl } from '@/utils/image'
import { ref } from 'vue'
import StaffPortfolioTab from './StaffPortfolioTab.vue'
import StaffScheduleTab from './StaffScheduleTab.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  staff: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'edit', 'delete'])

const activeTab = ref('info')

// 전문분야 파싱
function parseSpecialty(specialty) {
  if (!specialty) return []
  return specialty.split(',').map(s => s.trim()).filter(Boolean)
}

// 이니셜
function getInitial(name) {
  return name ? name.charAt(0) : '?'
}

// 날짜 포맷
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 수정 버튼
function handleEdit() {
  emit('edit', props.staff)
}

// 삭제 버튼
function handleDelete() {
  emit('delete', props.staff)
}
</script>
