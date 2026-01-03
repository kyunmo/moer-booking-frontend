import staffApi from '@/api/staffs'
import { defineStore } from 'pinia'

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staffs: [],
    selectedStaff: null,
    loading: false,
    businessId: 1, // TODO: 로그인 시스템 연동 후 동적으로 설정
  }),

  getters: {
    /**
     * 활성화된 스태프만
     */
    activeStaffs: state => {
      return state.staffs.filter(s => s.isActive !== false)
    },

    /**
     * 역할별로 그룹화
     */
    staffsByRole: state => {
      const grouped = {}
      state.staffs.forEach(staff => {
        const role = staff.role || '기타'
        if (!grouped[role]) {
          grouped[role] = []
        }
        grouped[role].push(staff)
      })
      return grouped
    },

    /**
     * 전문분야별 필터
     */
    staffsBySpecialty: state => specialty => {
      return state.staffs.filter(s => 
        s.specialties && s.specialties.includes(specialty),
      )
    },
  },

  actions: {
    /**
     * 스태프 목록 가져오기
     */
    async fetchStaffs(params = {}) {
      this.loading = true
      try {
        const { data } = await staffApi.getStaffs(this.businessId, params)
        this.staffs = data
      }
      catch (error) {
        console.error('스태프 목록 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 스태프 상세 조회
     */
    async fetchStaff(staffId) {
      this.loading = true
      try {
        const { data } = await staffApi.getStaff(staffId)
        this.selectedStaff = data
        return data
      }
      catch (error) {
        console.error('스태프 조회 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 스태프 생성
     */
    async createStaff(staffData) {
      this.loading = true
      try {
        const { data } = await staffApi.createStaff({
          ...staffData,
          businessId: this.businessId,
        })
        this.staffs.push(data)
        return data
      }
      catch (error) {
        console.error('스태프 생성 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 스태프 수정
     */
    async updateStaff(staffId, staffData) {
      this.loading = true
      try {
        const { data } = await staffApi.updateStaff(staffId, staffData)
        const index = this.staffs.findIndex(s => s.id === staffId)
        if (index !== -1) {
          this.staffs[index] = data
        }
        return data
      }
      catch (error) {
        console.error('스태프 수정 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 스태프 삭제
     */
    async deleteStaff(staffId) {
      this.loading = true
      try {
        await staffApi.deleteStaff(staffId)
        const index = this.staffs.findIndex(s => s.id === staffId)
        if (index !== -1) {
          this.staffs.splice(index, 1)
        }
      }
      catch (error) {
        console.error('스태프 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },

    /**
     * 선택된 스태프 설정
     */
    setSelectedStaff(staff) {
      this.selectedStaff = staff
    },
  },
})
