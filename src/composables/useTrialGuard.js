import { ref } from 'vue'

const trialExpiredDialog = ref(false)
const featureLockedDialog = ref(false)
const featureLockedInfo = ref({ code: '', message: '' })

export function useTrialGuard() {
  function showTrialExpiredDialog() {
    trialExpiredDialog.value = true
  }

  function showFeatureLockedDialog(code, message) {
    featureLockedInfo.value = { code, message }
    featureLockedDialog.value = true
  }

  return {
    trialExpiredDialog,
    featureLockedDialog,
    featureLockedInfo,
    showTrialExpiredDialog,
    showFeatureLockedDialog,
  }
}
