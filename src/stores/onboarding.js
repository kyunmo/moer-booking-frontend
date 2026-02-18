import onboardingApi from '@/api/onboarding'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    status: null,
    loading: false,
  }),

  actions: {
    async fetchStatus() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) return

      this.loading = true
      try {
        const response = await onboardingApi.getOnboardingStatus(businessId)

        this.status = response.data || response
      }
      catch (error) {

        this.status = null
      }
      finally {
        this.loading = false
      }
    },

    async skipOnboarding() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) return

      try {
        await onboardingApi.skipOnboarding(businessId)
        if (this.status) {
          this.status.skipped = true
        }
      }
      catch (error) {

        throw error
      }
    },
  },
})
