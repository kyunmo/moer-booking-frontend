import customerApi from '@/api/customer'
import publicBookingApi from '@/api/public-booking'
import { defineStore } from 'pinia'
import { useCustomerAuthStore } from '@/stores/customer-auth'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    // 매장 검색
    businesses: [],
    searchLoading: false,
    searchParams: {},
    pageInfo: null,

    // 매장 상세
    business: null,
    businessLoading: false,

    // 예약 플로우
    step: 1,
    selectedServices: [],
    selectedDate: null,
    selectedTime: null,
    selectedStaff: null,
    customerForm: {
      name: '',
      phone: '',
      email: '',
      request: '',
    },

    // 가용성 데이터
    availableDates: [],
    availableSlots: [],

    // 리뷰 데이터
    reviews: [],
    reviewStats: null,
    reviewTotalCount: 0,

    // 결과
    reservationResult: null,
    reservationLookup: null,
    reservationLookupList: [],
  }),

  getters: {
    // 선택한 서비스의 총 금액
    totalPrice: state => {
      return state.selectedServices.reduce((sum, s) => sum + (s.price || 0), 0)
    },

    // 선택한 서비스의 총 소요시간
    totalDuration: state => {
      return state.selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0)
    },

    // 카테고리별 서비스 그룹
    servicesByCategory: state => {
      if (!state.business?.services) return {}
      const groups = {}
      state.business.services.forEach(service => {
        const category = service.categoryName || '기타'
        if (!groups[category]) groups[category] = []
        groups[category].push(service)
      })
      return groups
    },

    // 요일별 영업시간 배열
    businessHoursList: state => {
      if (!state.business?.businessHours) return []

      const days = [
        { key: 'mon', full: 'monday', label: '월요일' },
        { key: 'tue', full: 'tuesday', label: '화요일' },
        { key: 'wed', full: 'wednesday', label: '수요일' },
        { key: 'thu', full: 'thursday', label: '목요일' },
        { key: 'fri', full: 'friday', label: '금요일' },
        { key: 'sat', full: 'saturday', label: '토요일' },
        { key: 'sun', full: 'sunday', label: '일요일' },
      ]

      const hours = state.business.businessHours

      // Handle array format: [{dayOfWeek: 'MON', openTime: '09:00', closeTime: '18:00'}, ...]
      if (Array.isArray(hours)) {
        const hoursMap = {}
        hours.forEach(h => {
          const key = (h.dayOfWeek || h.day || '').toLowerCase().substring(0, 3)
          hoursMap[key] = { open: h.openTime || h.open, close: h.closeTime || h.close }
        })

        return days.map(d => ({
          day: d.label,
          dayKey: d.key,
          hours: hoursMap[d.key] || null,
        }))
      }

      // Handle object format - normalize keys to match
      // Supports: {mon: ...}, {MON: ...}, {monday: ...}, {MONDAY: ...}
      const normalizedHours = {}
      Object.entries(hours).forEach(([key, value]) => {
        const lower = key.toLowerCase()
        // Map full names to abbreviated: monday→mon, tuesday→tue, etc.
        const abbr = lower.length > 3 ? lower.substring(0, 3) : lower
        // wednesday→wed (3글자), thursday→thu (3글자) - 이미 OK
        normalizedHours[abbr] = value
      })

      return days.map(d => {
        const h = normalizedHours[d.key]
        if (!h) return { day: d.label, dayKey: d.key, hours: null }

        // Admin format: { isOpen, openTime, closeTime }
        // API format: { open, close }
        if ('isOpen' in h) {
          return {
            day: d.label,
            dayKey: d.key,
            hours: h.isOpen ? { open: h.openTime, close: h.closeTime } : null,
          }
        }

        return {
          day: d.label,
          dayKey: d.key,
          hours: h.open || h.openTime ? { open: h.open || h.openTime, close: h.close || h.closeTime } : null,
        }
      })
    },
  },

  actions: {
    // ===== 매장 검색 =====

    async searchBusinesses(params = {}) {
      this.searchLoading = true
      this.searchParams = params
      try {
        const { data } = await publicBookingApi.getBusinesses(params)
        this.businesses = data.content || []
        this.pageInfo = data.pageInfo || null
        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.searchLoading = false
      }
    },

    // ===== 매장 상세 =====

    async fetchBusinessDetail(slug) {
      this.businessLoading = true
      try {
        const { data } = await publicBookingApi.getBusinessDetail(slug)
        this.business = data
        return data
      }
      catch (error) {

        throw error
      }
      finally {
        this.businessLoading = false
      }
    },

    // ===== 예약 가용성 =====

    async fetchAvailableDates(slug, params = {}) {
      try {
        const { data } = await publicBookingApi.getAvailableDates(slug, params)
        // hasSlots=true인 날짜만 문자열 배열로 변환
        const dates = data.availableDates || []
        this.availableDates = dates
          .filter(d => d.hasSlots)
          .map(d => d.date)
        return data
      }
      catch (error) {

        throw error
      }
    },

    async fetchAvailableSlots(slug, params = {}) {
      try {
        const { data } = await publicBookingApi.getAvailableTimes(slug, params)
        this.availableSlots = data.availableSlots || []
        return data
      }
      catch (error) {

        throw error
      }
    },

    // ===== 예약 생성 =====

    async createReservation(slug) {
      const customerAuthStore = useCustomerAuthStore()

      try {
        if (customerAuthStore.isAuthenticated) {
          // 고객 로그인 상태: customer API 사용
          const payload = {
            serviceIds: this.selectedServices.map(s => s.id),
            staffId: this.selectedStaff?.id || null,
            reservationDate: this.selectedDate,
            startTime: this.selectedTime?.startTime,
            customerRequest: this.customerForm.request || null,
          }

          const { data } = await customerApi.createReservation(slug, payload)
          this.reservationResult = data
          return data
        }
        else {
          // 비회원: 기존 public API 사용
          const payload = {
            serviceIds: this.selectedServices.map(s => s.id),
            staffId: this.selectedStaff?.id || null,
            reservationDate: this.selectedDate,
            startTime: this.selectedTime?.startTime,
            customerName: this.customerForm.name,
            customerPhone: this.customerForm.phone,
            customerEmail: this.customerForm.email || null,
            customerRequest: this.customerForm.request || null,
          }

          const { data } = await publicBookingApi.createReservation(slug, payload)
          this.reservationResult = data
          return data
        }
      }
      catch (error) {

        throw error
      }
    },

    // ===== 예약 조회/취소 =====

    async lookupReservation(reservationNumber, phone) {
      try {
        const { data } = await publicBookingApi.getReservation(reservationNumber, phone)
        this.reservationLookup = data
        return data
      }
      catch (error) {

        throw error
      }
    },

    async lookupReservationByNamePhone(name, phone) {
      try {
        const { data } = await publicBookingApi.getReservationByNamePhone(name, phone)
        const list = Array.isArray(data) ? data : (data?.data || data?.items || [data]).filter(Boolean)
        this.reservationLookupList = list
        this.reservationLookup = list.length === 1 ? list[0] : null
        return list
      }
      catch (error) {

        throw error
      }
    },

    async cancelReservation(reservationNumber, data) {
      try {
        await publicBookingApi.cancelReservation(reservationNumber, data)
        if (this.reservationLookup) {
          this.reservationLookup.status = 'CANCELLED'
          this.reservationLookup.canCancel = false
        }
      }
      catch (error) {

        throw error
      }
    },

    // ===== 리뷰 =====

    async fetchPublicReviews(slug, params = {}) {
      try {
        const { data } = await publicBookingApi.getPublicReviews(slug, params)
        this.reviews = data.items || []
        this.reviewStats = data.stats || null
        this.reviewTotalCount = data.totalCount || 0
        return data
      }
      catch (error) {

        throw error
      }
    },

    // ===== 상태 초기화 =====

    resetBookingFlow() {
      this.step = 1
      this.selectedServices = []
      this.selectedDate = null
      this.selectedTime = null
      this.selectedStaff = null
      this.customerForm = { name: '', phone: '', email: '', request: '' }
      this.availableDates = []
      this.availableSlots = []
      this.reservationResult = null
      this.reservationLookup = null
      this.reservationLookupList = []
    },
  },
})
