import businessSettingsApi from '@/api/business-settings'
import { defineStore } from 'pinia'

export const useBusinessSettingsStore = defineStore('businessSettings', {
  state: () => ({
    businessInfo: null,
    businessHours: null,
    holidays: [],
    loading: false,
    businessId: 1, // TODO: 로그인 시스템 연동 후 동적으로 설정
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
     * 매장 정보 가져오기
     */
    async fetchBusinessInfo() {
      this.loading = true
      try {
        const data = await businessSettingsApi.getBusinessInfo(this.businessId)
        this.businessInfo = data
      }
      catch (error) {
        console.error('매장 정보 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 매장 정보 수정
     */
    async updateBusinessInfo(businessData) {
      this.loading = true
      try {
        const data = await businessSettingsApi.updateBusinessInfo(this.businessId, businessData)
        this.businessInfo = data
        return data
      }
      catch (error) {
        console.error('매장 정보 수정 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 영업시간 가져오기
     */
    async fetchBusinessHours() {
      this.loading = true
      try {
        const data = await businessSettingsApi.getBusinessHours(this.businessId)
        this.businessHours = data
      }
      catch (error) {
        console.error('영업시간 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 영업시간 수정
     */
    async updateBusinessHours(hoursData) {
      this.loading = true
      try {
        const data = await businessSettingsApi.updateBusinessHours(this.businessId, hoursData)
        this.businessHours = data
        return data
      }
      catch (error) {
        console.error('영업시간 수정 실패:', error)
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
      this.loading = true
      try {
        const data = await businessSettingsApi.getHolidays(this.businessId, year)
        this.holidays = data
      }
      catch (error) {
        console.error('휴무일 조회 실패:', error)
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
      this.loading = true
      try {
        const data = await businessSettingsApi.createHoliday(this.businessId, holidayData)
        this.holidays.push(data)
        return data
      }
      catch (error) {
        console.error('휴무일 추가 실패:', error)
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
      this.loading = true
      try {
        await businessSettingsApi.deleteHoliday(holidayId)
        const index = this.holidays.findIndex(h => h.id === holidayId)
        if (index !== -1) {
          this.holidays.splice(index, 1)
        }
      }
      catch (error) {
        console.error('휴무일 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})
