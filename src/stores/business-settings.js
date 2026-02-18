import businessSettingsApi from '@/api/business-settings'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useBusinessSettingsStore = defineStore('businessSettings', {
  state: () => ({
    business: null,
    holidays: [],
    loading: false,
  }),

  getters: {
    /**
     * 오늘이 휴무일인지 확인
     */
    isTodayHoliday: state => {
      const today = new Date().toISOString().split('T')[0]
      return state.holidays.some(h => h.date === today)
    },

    /**
     * 연도별로 그룹화된 휴무일
     */
    holidaysByYear: state => {
      const grouped = {}
      state.holidays.forEach(holiday => {
        const year = holiday.date.substring(0, 4)
        if (!grouped[year]) {
          grouped[year] = []
        }
        grouped[year].push(holiday)
      })
      return grouped
    },
  },

  actions: {
    /**
     * 매장 정보 가져오기 (Settings 포함)
     */
    async fetchBusinessInfo() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {

        return
      }

      this.loading = true
      try {
        const { data } = await businessSettingsApi.getBusinessInfo(businessId)
        this.business = data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 기본 정보 수정
     */
    async updateBusinessInfo(businessData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await businessSettingsApi.updateBusinessInfo(businessId, businessData)
        this.business = data
        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 설정 수정 (BusinessSettings)
     */
    async updateBusinessSettings(settingsData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await businessSettingsApi.updateBusinessSettings(businessId, settingsData)
        this.business = data
        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 프로필 이미지 업로드
     */
    async uploadBusinessImage(file) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await businessSettingsApi.uploadBusinessImage(businessId, file)
        if (this.business) {
          this.business.profileImageUrl = data.profileImageUrl
        }
        return data
      }
      catch (error) {
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 프로필 이미지 삭제
     */
    async deleteBusinessImage() {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await businessSettingsApi.deleteBusinessImage(businessId)
        if (this.business) {
          this.business.profileImageUrl = null
        }
      }
      catch (error) {
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 영업시간 + 예약 설정 통합 저장
     */
    async updateBusinessHours(businessHours, bookingSettings) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        // 1. businessHours 저장
        await businessSettingsApi.updateBusinessInfo(businessId, {
          businessHours,
        })

        // 2. settings 저장 (기존 값 유지하면서 업데이트)
        const currentSettings = this.business?.settings || {}
        await businessSettingsApi.updateBusinessSettings(businessId, {
          ...currentSettings,
          ...bookingSettings,
        })

        // 3. 최신 데이터 다시 로드
        await this.fetchBusinessInfo()
        
        return this.business
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 휴무일 목록 가져오기
     */
    async fetchHolidays(year = null) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {

        return
      }

      this.loading = true
      try {
        const { data } = await businessSettingsApi.getHolidays(businessId, year)
        this.holidays = data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 휴무일 추가
     */
    async createHoliday(holidayData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await businessSettingsApi.createHoliday(businessId, holidayData)
        this.holidays.push(data)
        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 휴무일 삭제
     */
    async deleteHoliday(holidayId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await businessSettingsApi.deleteHoliday(businessId, holidayId)
        this.holidays = this.holidays.filter(h => h.id !== holidayId)
      }
      catch (error) {

        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})
