import reservationApi from '@/api/reservations'
import { defineStore } from 'pinia'

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    selectedReservation: null,
    loading: false,
    currentDate: new Date().toISOString().split('T')[0],
    businessId: 1, // TODO: 로그인 시스템 연동 후 동적으로 설정
  }),

  getters: {
    /**
     * FullCalendar 이벤트 형식으로 변환
     */
    calendarEvents: state => {
      return state.reservations.map(reservation => ({
        id: reservation.id,
        title: `${reservation.customerName} - ${reservation.serviceNames.join(', ')}`,
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
     * 기간별 예약 목록 가져오기
     */
    async fetchReservationsByDateRange(startDate, endDate) {
      this.loading = true
      try {
        const data = await reservationApi.getReservationsByDateRange(
          this.businessId,
          startDate,
          endDate,
        )
        this.reservations = data
      } catch (error) {
        console.error('예약 목록 조회 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 예약 생성
     */
    async createReservation(reservationData) {
      this.loading = true
      try {
        const data = await reservationApi.createReservation({
          ...reservationData,
          businessId: this.businessId,
        })
        this.reservations.push(data)
        return data
      } catch (error) {
        console.error('예약 생성 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 예약 수정
     */
    async updateReservation(reservationId, reservationData) {
      this.loading = true
      try {
        const data = await reservationApi.updateReservation(reservationId, reservationData)
        const index = this.reservations.findIndex(r => r.id === reservationId)
        if (index !== -1) {
          this.reservations[index] = data
        }
        return data
      } catch (error) {
        console.error('예약 수정 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})

/**
 * 예약 상태에 따른 색상 반환
 */
function getStatusColor(status) {
  const colors = {
    PENDING: '#FFB400',
    CONFIRMED: '#16B1FF',
    COMPLETED: '#56CA00',
    CANCELLED: '#FF4C51',
    NOSHOW: '#8A8D93',
  }
  return colors[status] || '#8A8D93'
}
