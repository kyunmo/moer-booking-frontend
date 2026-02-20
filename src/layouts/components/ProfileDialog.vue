<script setup>
import { ref, watch } from 'vue'
import ProfileInfoTab from '@/pages/shop-admin/profile/components/ProfileInfoTab.vue'
import ProfilePasswordTab from '@/pages/shop-admin/profile/components/ProfilePasswordTab.vue'
import ProfileSocialTab from '@/pages/shop-admin/profile/components/ProfileSocialTab.vue'
import ProfileWithdrawTab from '@/pages/shop-admin/profile/components/ProfileWithdrawTab.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref('info')

// 다이얼로그 닫힐 때 탭 초기화
watch(() => props.modelValue, val => {
  if (!val) {
    activeTab.value = 'info'
  }
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="750"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon icon="ri-user-settings-line" size="24" class="me-3" />
        <span>내 프로필</span>
        <VSpacer />
        <IconBtn aria-label="닫기" @click="close">
          <VIcon icon="ri-close-line" />
        </IconBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VTabs v-model="activeTab" class="px-4">
          <VTab value="info">
            <VIcon icon="ri-user-line" class="me-2" />
            기본 정보
          </VTab>
          <VTab value="password">
            <VIcon icon="ri-lock-password-line" class="me-2" />
            비밀번호
          </VTab>
          <VTab value="social">
            <VIcon icon="ri-links-line" class="me-2" />
            SNS 계정
          </VTab>
          <VTab value="withdraw">
            <VIcon icon="ri-user-unfollow-line" class="me-2" />
            회원 탈퇴
          </VTab>
        </VTabs>

        <VDivider />

        <div class="pa-6">
          <VWindow v-model="activeTab">
            <VWindowItem value="info">
              <ProfileInfoTab />
            </VWindowItem>

            <VWindowItem value="password">
              <ProfilePasswordTab />
            </VWindowItem>

            <VWindowItem value="social">
              <ProfileSocialTab />
            </VWindowItem>

            <VWindowItem value="withdraw">
              <ProfileWithdrawTab />
            </VWindowItem>
          </VWindow>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
