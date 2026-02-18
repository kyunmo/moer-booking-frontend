<template>
  <div>
    <!-- 프로필 이미지 -->
    <div class="d-flex align-center mb-6">
      <VAvatar
        size="100"
        :color="profileImageUrl ? undefined : 'primary'"
        class="cursor-pointer"
        @click="triggerFileInput"
      >
        <VImg v-if="profileImageUrl" :src="profileImageUrl" />
        <span v-else class="text-h4 font-weight-medium">
          {{ userInitial }}
        </span>

        <!-- 오버레이 -->
        <div class="profile-image-overlay d-flex align-center justify-center">
          <VIcon icon="ri-camera-line" color="white" size="24" />
        </div>
      </VAvatar>

      <div class="ms-4">
        <h6 class="text-h6">프로필 사진</h6>
        <p class="text-body-2 text-disabled mb-0">
          JPG, PNG, WEBP (최대 5MB)
        </p>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        @change="handleFileChange"
      >
    </div>

    <VDivider class="mb-6" />

    <!-- 프로필 정보 폼 -->
    <VForm ref="formRef" @submit.prevent="handleSubmit">
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.name"
            label="이름 *"
            prepend-inner-icon="ri-user-line"
            :rules="nameRules"
            counter
            maxlength="50"
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            :model-value="authStore.user?.email"
            label="이메일"
            prepend-inner-icon="ri-mail-line"
            readonly
            disabled
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            v-model="form.phone"
            label="전화번호"
            prepend-inner-icon="ri-phone-line"
            placeholder="010-1234-5678"
            :rules="phoneRules"
          />
        </VCol>
      </VRow>

      <div class="d-flex justify-end mt-4">
        <VBtn
          color="primary"
          :loading="saving"
          @click="handleSubmit"
        >
          저장
        </VBtn>
      </div>
    </VForm>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSnackbar } from '@/composables/useSnackbar'
import { getImageUrl } from '@/utils/image'

const authStore = useAuthStore()
const { success, error: showError } = useSnackbar()

const formRef = ref(null)
const fileInputRef = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  phone: '',
})

const profileImageUrl = computed(() => getImageUrl(authStore.user?.profileImageUrl))

const userInitial = computed(() => {
  const name = authStore.user?.name || ''
  return name ? name.charAt(0).toUpperCase() : 'U'
})

// Validation rules
const nameRules = [
  v => !!v || '이름을 입력해주세요.',
  v => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다.',
  v => (v && v.length <= 50) || '이름은 50자 이하여야 합니다.',
]

const phoneRules = [
  v => {
    if (!v) return true
    return /^\d{2,3}-\d{3,4}-\d{4}$/.test(v) || '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
  },
]

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  // 파일 크기 체크 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('파일 크기는 5MB 이하만 가능합니다.')
    event.target.value = ''
    return
  }

  try {
    await authStore.uploadProfileImage(file)
    success('프로필 사진이 변경되었습니다.')
  }
  catch (err) {
    showError(err.message || '프로필 사진 업로드에 실패했습니다.')
  }
  finally {
    event.target.value = ''
  }
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    await authStore.updateProfile({
      name: form.value.name,
      phone: form.value.phone || null,
    })
    success('프로필 정보가 저장되었습니다.')
  }
  catch (err) {
    showError(err.message || '프로필 수정에 실패했습니다.')
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.phone = authStore.user.phone || ''
  }
})
</script>

<style scoped>
.profile-image-overlay {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 40%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.v-avatar:hover .profile-image-overlay {
  opacity: 1;
}
</style>
