<template>
  <div>
    <VAlert
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      <VAlertTitle>회원 탈퇴 안내</VAlertTitle>
      <ul class="mt-2 ms-4">
        <li>탈퇴 시 모든 개인 정보와 데이터가 삭제됩니다.</li>
        <li>삭제된 데이터는 복구할 수 없습니다.</li>
        <li>OWNER일 경우: 소유 매장과 모든 직원이 비활성화됩니다.</li>
        <li>진행 중인 예약이 있는 경우 탈퇴가 불가능합니다.</li>
      </ul>
    </VAlert>

    <VForm ref="formRef" @submit.prevent="openConfirmDialog">
      <VRow>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.password"
            label="비밀번호 확인 *"
            prepend-inner-icon="ri-lock-line"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
            :rules="[rules.required]"
            @click:append-inner="showPassword = !showPassword"
          />
        </VCol>
      </VRow>

      <VRow>
        <VCol cols="12">
          <VTextarea
            v-model="form.reason"
            label="탈퇴 사유 (선택)"
            placeholder="탈퇴 사유를 알려주시면 서비스 개선에 참고하겠습니다."
            rows="3"
            counter
            maxlength="500"
          />
        </VCol>
      </VRow>

      <div class="d-flex justify-end mt-4">
        <VBtn
          color="error"
          @click="openConfirmDialog"
        >
          회원 탈퇴
        </VBtn>
      </div>
    </VForm>

    <!-- 탈퇴 확인 다이얼로그 -->
    <VDialog v-model="confirmDialog" max-width="400" persistent>
      <VCard>
        <VCardTitle class="text-error">
          회원 탈퇴 확인
        </VCardTitle>

        <VDivider />

        <VCardText>
          정말 탈퇴하시겠습니까?
          <br>
          이 작업은 되돌릴 수 없습니다.
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="confirmDialog = false"
          >
            취소
          </VBtn>
          <VBtn
            color="error"
            :loading="loading"
            @click="handleWithdraw"
          >
            탈퇴하기
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: showError } = useSnackbar()

const formRef = ref(null)
const loading = ref(false)
const confirmDialog = ref(false)
const showPassword = ref(false)

const form = ref({
  password: '',
  reason: '',
})

const rules = {
  required: v => !!v || '비밀번호를 입력해주세요.',
}

async function openConfirmDialog() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  confirmDialog.value = true
}

async function handleWithdraw() {
  loading.value = true
  try {
    await authStore.deleteAccount({
      password: form.value.password,
      reason: form.value.reason || null,
    })

    success('회원 탈퇴가 완료되었습니다.')
    confirmDialog.value = false
    router.push('/login')
  }
  catch (err) {
    // AC004: 진행 중인 예약이 있는 경우
    if (err.code === 'AC004') {
      showError('진행 중인 예약이 있어 탈퇴할 수 없습니다. 예약을 먼저 처리해주세요.')
    }
    else {
      showError(err.message || '회원 탈퇴에 실패했습니다.')
    }

    confirmDialog.value = false
  }
  finally {
    loading.value = false
  }
}
</script>
