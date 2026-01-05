import reservationApi from '@/api/reservations'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    selectedReservation: null,
    loading: false,
  }),

  getters: {
    /**
     * 상태별 예약 필터
     */
    pendingReservations: state => {
      return state.reservations.filter(r => r.status === 'PENDING')
    },

    confirmedReservations: state => {
      return state.reservations.filter(r => r.status === 'CONFIRMED')
    },

    completedReservations: state => {
      return state.reservations.filter(r => r.status === 'COMPLETED')
    },

    cancelledReservations: state => {
      return state.reservations.filter(r => r.status === 'CANCELLED')
    },

    /**
     * 캘린더용 이벤트 변환
     */
    calendarEvents: state => {
      return state.reservations.map(reservation => ({
        id: reservation.id,
        title: `${reservation.customerName || '고객'} - ${reservation.staffName || '직원'}`,
        start: `${reservation.reservationDate}T${reservation.startTime}`,
        end: `${reservation.reservationDate}T${reservation.endTime}`,
        backgroundColor: getStatusColor(reservation.status),
        borderColor: getStatusColor(reservation.status),
        extendedProps: {
          reservation,
        },
      }))
    },
  },

  actions: {
    /**
     * 예약 목록 조회
     */
    async fetchReservations(params = {}) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await reservationApi.getReservations(businessId, params)
        this.reservations = data
      }
      catch (error) {
        console.error('예약 목록 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 특정 날짜의 예약 조회
     */
    async fetchReservationsByDate(date) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await reservationApi.getReservationsByDate(businessId, date)
        this.reservations = data
      }
      catch (error) {
        console.error('예약 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 기간별 예약 조회
     */
    async fetchReservationsByDateRange(startDate, endDate) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      // startDate, endDate 검증
      if (!startDate || !endDate) {
        console.error('startDate와 endDate는 필수입니다')
        return
      }

      this.loading = true
      try {
        const { data } = await reservationApi.getReservationsByDateRange(
          businessId,
          startDate,
          endDate
        )
        this.reservations = data
      }
      catch (error) {
        console.error('예약 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 예약 상세 조회
     */
    async fetchReservation(reservationId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await reservationApi.getReservation(businessId, reservationId)
        this.selectedReservation = data
        return data
      }
      catch (error) {
        console.error('예약 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 예약 생성
     */
    async createReservation(reservationData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await reservationApi.createReservation(businessId, reservationData)
        this.reservations.push(data)
        return data
      }
      catch (error) {
        console.error('예약 생성 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 예약 수정
     */
    async updateReservation(reservationId, reservationData) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await reservationApi.updateReservation(businessId, reservationId, reservationData)
        
        // 목록에서 업데이트
        const index = this.reservations.findIndex(r => r.id === reservationId)
        if (index !== -1) {
          this.reservations[index] = data
        }
        
        return data
      }
      catch (error) {
        console.error('예약 수정 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 예약 상태 변경
     */
    async updateReservationStatus(reservationId, status) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await reservationApi.updateReservationStatus(businessId, reservationId, status)
        
        // 목록에서 업데이트
        const index = this.reservations.findIndex(r => r.id === reservationId)
        if (index !== -1) {
          this.reservations[index] = data
        }
        
        return data
      }
      catch (error) {
        console.error('예약 상태 변경 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 예약 삭제
     */
    async deleteReservation(reservationId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await reservationApi.deleteReservation(businessId, reservationId)
        
        // 목록에서 제거
        this.reservations = this.reservations.filter(r => r.id !== reservationId)
      }
      catch (error) {
        console.error('예약 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})

// 상태별 색상
function getStatusColor(status) {
  const colors = {
    PENDING: '#FFA726',     // 대기 - 오렌지
    CONFIRMED: '#42A5F5',   // 확정 - 파랑
    COMPLETED: '#66BB6A',   // 완료 - 초록
    CANCELLED: '#EF5350',   // 취소 - 빨강
    NO_SHOW: '#AB47BC',     // 노쇼 - 보라
  }
  return colors[status] || '#78909C'
}
