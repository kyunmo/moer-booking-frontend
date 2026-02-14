import staffApi from '@/api/staffs'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staffs: [],
    selectedStaff: null,
    loading: false,
  }),

  getters: {
    /**
     * 활성화된 스태프만
     */
    activeStaffs: state => {
      return state.staffs.filter(s => s.isActive !== false)
    },

    /**
     * 직급별로 그룹화
     */
    staffsByPosition: state => {
      const grouped = {}
      state.staffs.forEach(staff => {
        const position = staff.position || '기타'
        if (!grouped[position]) {
          grouped[position] = []
        }
        grouped[position].push(staff)
      })
      return grouped
    },

    /**
     * 전문분야별 필터
     */
    staffsBySpecialty: state => specialty => {
      return state.staffs.filter(s => 
        s.specialty && s.specialty.includes(specialty),
      )
    },
  },

  actions: {
    /**
     * 스태프 목록 가져오기
     */
    async fetchStaffs(params = {}) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId

      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await staffApi.getStaffs(businessId, params)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        console.error('businessId가 없습니다')
        return
      }

      this.loading = true
      try {
        const { data } = await staffApi.getStaff(businessId, staffId)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await staffApi.createStaff(businessId, staffData)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await staffApi.updateStaff(businessId, staffId, staffData)
        
        // 목록에서 업데이트
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
     * 스태프 활성/비활성 전환
     */
    async toggleStaffActive(staffId) {
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        const { data } = await staffApi.toggleStaffActive(businessId, staffId)
        
        // 목록에서 업데이트
        const index = this.staffs.findIndex(s => s.id === staffId)
        if (index !== -1) {
          this.staffs[index] = data
        }
        
        return data
      }
      catch (error) {
        console.error('스태프 상태 변경 실패:', error)
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
      const authStore = useAuthStore()
      const businessId = authStore.businessId
      
      if (!businessId) {
        throw new Error('businessId가 없습니다')
      }

      this.loading = true
      try {
        await staffApi.deleteStaff(businessId, staffId)
        
        // 목록에서 제거
        this.staffs = this.staffs.filter(s => s.id !== staffId)
      }
      catch (error) {
        console.error('스태프 삭제 실패:', error)
        throw error
      }
      finally {
        this.loading = false
      }
    },
  },
})
