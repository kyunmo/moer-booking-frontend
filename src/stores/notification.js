import notificationsApi from '@/api/notifications'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    loading: false,
    _pollingTimer: null,
  }),

  actions: {
    async fetchNotifications(params = { page: 1, size: 20 }) {
      this.loading = true
      try {
        const { data } = await notificationsApi.getNotifications(params)
        this.notifications = data.items || []
        this.unreadCount = data.unreadCount || 0
        this.totalCount = data.totalCount || 0

        return data
      }
      catch (error) {
        // API 실패 시 빈 상태 유지 (더미 데이터 표시 방지)
        this.notifications = []
        this.unreadCount = 0
        this.totalCount = 0
        console.warn('[NotificationStore] 알림 조회 실패:', error.message)
      }
      finally {
        this.loading = false
      }
    },

    async markAsRead(id) {
      try {
        await notificationsApi.markAsRead(id)

        const notification = this.notifications.find(n => n.id === id)
        if (notification && !notification.read) {
          notification.read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      }
      catch (error) {

        throw error
      }
    },

    async markAllAsRead() {
      try {
        await notificationsApi.markAllAsRead()

        this.notifications.forEach(n => { n.read = true })
        this.unreadCount = 0
      }
      catch (error) {

        throw error
      }
    },

    startPolling(intervalMs = 30000) {
      this.stopPolling()
      this.fetchNotifications({ page: 1, size: 10 }).catch(() => {})
      this._pollingTimer = setInterval(() => {
        this.fetchNotifications({ page: 1, size: 10 }).catch(() => {})
      }, intervalMs)
    },

    stopPolling() {
      if (this._pollingTimer) {
        clearInterval(this._pollingTimer)
        this._pollingTimer = null
      }
    },
  },
})
