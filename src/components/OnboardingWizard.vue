<template>
  <VCard class="pa-6">
    <!-- 환영 메시지 -->
    <div class="text-center mb-6">
      <VIcon icon="ri-store-2-line" size="64" color="primary" class="mb-4" />
      <h2 class="text-h4 font-weight-bold mb-2">
        매장 설정을 시작합니다!
      </h2>
      <p class="text-body-1 text-medium-emphasis">
        아래 단계를 완료하면 예약 시스템을 바로 사용할 수 있습니다.
      </p>
    </div>

    <!-- 진행률 -->
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-body-2 text-medium-emphasis">설정 진행률</span>
        <span class="text-body-2 font-weight-medium">
          {{ status?.completedSteps || 0 }} / {{ status?.totalSteps || 4 }} 완료
        </span>
      </div>
      <VProgressLinear
        :model-value="progressPercent"
        color="primary"
        height="12"
        rounded
      />
    </div>

    <VDivider class="mb-6" />

    <!-- 스텝 목록 -->
    <VList lines="two" class="mb-6">
      <VListItem
        v-for="(step, index) in steps"
        :key="step.step"
        :class="{
          'bg-primary-lighten-5': isCurrentStep(step),
        }"
        rounded="lg"
        class="mb-2"
      >
        <template #prepend>
          <VAvatar
            :color="getStepColor(step)"
            :variant="step.completed ? 'flat' : 'tonal'"
            size="44"
          >
            <VIcon
              v-if="step.completed"
              icon="ri-check-line"
              color="white"
            />
            <span v-else class="text-h6">{{ index + 1 }}</span>
          </VAvatar>
        </template>

        <VListItemTitle
          class="font-weight-medium"
          :class="{
            'text-success': step.completed,
            'text-primary': isCurrentStep(step) && !step.completed,
            'text-disabled': !step.completed && !isCurrentStep(step),
          }"
        >
          {{ step.label }}
        </VListItemTitle>

        <VListItemSubtitle>
          <span v-if="step.completed" class="text-success">완료됨</span>
          <span v-else-if="isCurrentStep(step)" class="text-primary">현재 단계</span>
          <span v-else class="text-disabled">대기 중</span>
        </VListItemSubtitle>

        <template #append>
          <VBtn
            v-if="!step.completed && getStepRoute(step)"
            :color="isCurrentStep(step) ? 'primary' : 'default'"
            :variant="isCurrentStep(step) ? 'elevated' : 'tonal'"
            size="small"
            @click="navigateToStep(step)"
          >
            {{ getStepButtonText(step) }}
            <VIcon icon="ri-arrow-right-line" size="16" class="ms-1" />
          </VBtn>
          <VIcon
            v-else-if="step.completed"
            icon="ri-checkbox-circle-fill"
            color="success"
            size="24"
          />
        </template>
      </VListItem>
    </VList>

    <VDivider class="mb-6" />

    <!-- 하단 버튼 -->
    <div class="d-flex align-center justify-space-between">
      <VBtn
        variant="text"
        color="secondary"
        @click="handleSkip"
      >
        건너뛰기
      </VBtn>

      <VBtn
        v-if="allCompleted"
        color="primary"
        size="large"
        @click="handleComplete"
      >
        <VIcon icon="ri-check-double-line" class="me-2" />
        시작하기
      </VBtn>
    </div>
  </VCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  status: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['completed', 'skipped'])
const router = useRouter()

const steps = computed(() => props.status?.steps || [])

const progressPercent = computed(() => {
  const total = props.status?.totalSteps || 4
  const completed = props.status?.completedSteps || 0

  return Math.round((completed / total) * 100)
})

const allCompleted = computed(() => {
  return steps.value.length > 0 && steps.value.every(s => s.completed)
})

function isCurrentStep(step) {
  return props.status?.currentStep === step.step
}

function getStepColor(step) {
  if (step.completed) return 'success'
  if (isCurrentStep(step)) return 'primary'

  return 'grey'
}

function getStepRoute(step) {
  const routes = {
    SERVICES: { name: 'shop-admin-services-list' },
    STAFFS: { name: 'shop-admin-staffs-list' },
    FIRST_RESERVATION: { name: 'shop-admin-reservations-calendar' },
  }

  return routes[step.step] || null
}

function getStepButtonText(step) {
  const texts = {
    SERVICES: '서비스 관리로 이동',
    STAFFS: '스태프 관리로 이동',
    FIRST_RESERVATION: '예약 캘린더로 이동',
  }

  return texts[step.step] || '이동'
}

function navigateToStep(step) {
  const route = getStepRoute(step)
  if (route) {
    router.push(route)
  }
}

function handleSkip() {
  emit('skipped')
}

function handleComplete() {
  emit('completed')
}
</script>
